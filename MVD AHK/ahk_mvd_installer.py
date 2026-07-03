import os, random, string, threading, tempfile, requests, json
import sys, base64, hashlib, time, io
from pathlib import Path
import webview

# ═══════════════════════════════════════════════════════
#  НАСТРОЙКИ
# ═══════════════════════════════════════════════════════
GITHUB_RAW    = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
KEYS_URL      = f"{GITHUB_RAW}/keys.json"
AHK_URL       = f"{GITHUB_RAW}/LoadAhk.js"
INTLOAD_URL   = f"{GITHUB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
CUSTOM_UI_URL = f"{GITHUB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"
LOADERS_URL   = f"{CUSTOM_UI_URL}/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

RETRY_COUNT = 5   # сколько раз пробовать подключиться при авторизации
RETRY_DELAY = 4   # секунд между попытками

# IntLoad.js всегда в Кастом Интерфейсы/ — это манифест-реестр (имена/файлы/опции).
# False (по умолчанию) — качаем ГОТОВЫЕ файлы прямо из Кастом Интерфейсы/
# True  — качаем ТОНКИЕ ЗАГРУЗЧИКИ из Кастом Интерфейсы/Загрузчики/
USE_LOADERS   = True
DEPLOY_UI_URL = LOADERS_URL if USE_LOADERS else CUSTOM_UI_URL

# Имена нативных интерфейсов движка — НИКОГДА не регистрировать кастомный
# компонент под этими именами
NATIVE_INTERFACE_NAMES = {
    "ScreenNotification", "Menu", "Hud", "Dialog", "InventoryNew",
    "Console", "BattlePassWelcome", "BlackMarket", "FullScreenPreloader",
}

# Путь к иконке передаётся из stub.py через exec namespace
_ICON_PATH = globals().get("_ICON_PATH", "")


# ═══════════════════════════════════════════════════════
#  АВТОРИЗАЦИЯ (перенесено из launcher.py)
# ═══════════════════════════════════════════════════════

def resource_path(rel):
    base = getattr(sys, '_MEIPASS', os.path.abspath('.'))
    return os.path.join(base, rel)


def get_hwid() -> str:
    """Тот же алгоритм что и раньше — sha256(MachineGuid)[:16]."""
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                             r"SOFTWARE\Microsoft\Cryptography")
        guid, _ = winreg.QueryValueEx(key, "MachineGuid")
        winreg.CloseKey(key)
    except Exception:
        import uuid
        guid = str(uuid.getnode())
    return hashlib.sha256(guid.encode()).hexdigest()[:16].upper()


def is_authorized(hwid: str) -> bool:
    """Бросает исключение при сетевой ошибке. False = ключ не найден."""
    resp = requests.get(KEYS_URL, timeout=10)
    resp.raise_for_status()
    keys = resp.json()
    return hwid in keys


def _run_splash() -> threading.Event:
    """Мгновенный splash на tkinter в daemon-потоке.
    Возвращает Event — установи его чтобы закрыть окно."""
    close_event = threading.Event()

    def _worker():
        try:
            import tkinter as tk
            root = tk.Tk()
            root.overrideredirect(True)
            root.configure(bg='#010106')
            root.attributes('-topmost', True)
            W, H = 380, 220
            sw = root.winfo_screenwidth()
            sh = root.winfo_screenheight()
            root.geometry(f"{W}x{H}+{(sw - W) // 2}+{(sh - H) // 2}")
            tk.Label(root, text='AHK MVD Installer',
                     bg='#010106', fg='#f9b701',
                     font=('Arial', 13, 'bold')).pack(expand=True)
            tk.Label(root, text='Запуск...',
                     bg='#010106', fg='#555555',
                     font=('Arial', 9)).pack(pady=(0, 50))

            def _poll():
                if close_event.is_set():
                    root.destroy()
                else:
                    root.after(40, _poll)

            root.after(40, _poll)
            root.mainloop()
        except Exception:
            pass

    threading.Thread(target=_worker, daemon=True).start()
    time.sleep(0.12)   # дать tkinter время отрисоваться
    return close_event


def get_icon_b64() -> str:
    try:
        from PIL import Image
        img = Image.open(resource_path("icon.ico")).convert("RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


def run_auth_with_ui(hwid: str, splash_close=None) -> dict:
    """
    Показывает окно загрузки, делает до RETRY_COUNT попыток авторизации.
    Возвращает {"authorized": bool|None, "code": str|None, "failed": bool}
    """
    result      = {"authorized": None, "code": None, "failed": False}
    window_ref  = [None]
    ready_event = threading.Event()

    LOADING_HTML = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { margin: 0; padding: 20px; background: #010106; color: #fff; font-family: Arial, sans-serif; text-align: center; }
h2 { color: #f9b701; margin: 30px 0 10px; }
#status { color: #555; font-size: 12px; }
.err { color: #ff4444 !important; }
</style>
</head>
<body>
<h2>AHK MVD Installer</h2>
<div>Авторизация</div>
<div id="status">Проверка лицензии...</div>
<script>
function setStatus(txt, isErr) {
    var el = document.getElementById('status');
    el.textContent = txt;
    el.className = isErr ? 'err' : '';
}
</script>
</body>
</html>
"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html',
                                      delete=False, encoding='utf-8')
    tmp.write(LOADING_HTML); tmp.close()

    def _auth_loop():
        ready_event.wait(timeout=6)   # ждём пока окно загрузится
        w = window_ref[0]

        def js(txt, err=False):
            try:
                flag = "true" if err else "false"
                if w:
                    w.evaluate_js(f"setStatus({repr(txt)}, {flag})")
            except Exception:
                pass

        for attempt in range(1, RETRY_COUNT + 1):
            js(f"Проверка лицензии... (попытка {attempt} из {RETRY_COUNT})")
            try:
                authorized = is_authorized(hwid)
                result["authorized"] = authorized
                result["code"]       = "already_loaded"  # код уже в памяти
                break   # успех — выходим из цикла

            except Exception:
                if attempt < RETRY_COUNT:
                    # Обратный отсчёт до следующей попытки
                    for sec in range(RETRY_DELAY, 0, -1):
                        js(f"Нет подключения. Повтор через {sec} сек... ({attempt}/{RETRY_COUNT})", err=True)
                        time.sleep(1)
                else:
                    result["failed"] = True

        # Закрываем окно загрузки
        try:
            if w: w.destroy()
        except Exception:
            pass
        try: os.unlink(tmp.name)
        except: pass

    auth_thread = threading.Thread(target=_auth_loop, daemon=True)
    auth_thread.start()

    w = webview.create_window(
        'AHK MVD Installer',
        f"file:///{tmp.name.replace(os.sep, '/')}",
        width=380, height=220,
        frameless=True, background_color='#010106'
    )
    window_ref[0] = w

    def _on_loaded():
        ready_event.set()
        if splash_close is not None:
            splash_close.set()

    w.events.loaded += _on_loaded

    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)

    return result


def show_denied_window(hwid: str):
    keys_line = f'"{hwid}": ""'

    html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {{ margin: 0; padding: 30px; background: #0a0a0b; color: #fff; font-family: Arial, sans-serif; }}
h2 {{ color: #ff4444; text-align: center; margin-top: 0; }}
.hw-box {{ background: #1a1a1d; border: 1px solid #333; padding: 12px; border-radius: 6px; 
           font-family: monospace; word-break: break-all; margin: 20px 0; cursor: pointer; }}
.hw-box:hover {{ background: #222; }}
.btn {{ display: block; width: 100%; padding: 12px; background: #f9b701; color: #000; 
        border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin: 10px 0; }}
.btn:hover {{ background: #ffb800; }}
.btn-sec {{ background: #333; color: #fff; }}
.btn-sec:hover {{ background: #444; }}
.copy-hint {{ font-size: 11px; color: #666; text-align: center; }}
a {{ color: #f9b701; }}
</style>
</head>
<body>
<h2>⛔ Нет доступа</h2>
<p style="text-align:center;">Ваш ПК не авторизован.<br>Отправьте строку ниже создателю для получения доступа.</p>

<div class="hw-box" onclick="window.pywebview.api.copy_hwid('{hwid}')">{keys_line},</div>
<div class="copy-hint">нажмите чтобы скопировать</div>

<p style="text-align:center; margin-top:20px;">Написать создателю:<br>
<a href="#" onclick="window.pywebview.api.open_url('https://t.me/ZaharKonst')">@ZaharKonst</a></p>

<button class="btn btn-sec" onclick="window.pywebview.api.close_app()">Закрыть</button>

<script>
function copyText(text) {{
    navigator.clipboard.writeText(text).then(function() {{
        document.querySelector('.copy-hint').textContent = '✓ Скопировано!';
    }});
}}
</script>
</body>
</html>
"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()

    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
        def open_url(self, url):
            import webbrowser; webbrowser.open(url)
        def copy_hwid(self, hwid):
            try:
                import subprocess
                subprocess.run(['clip'], input=f'"{hwid}": "",'.encode('utf-8'), check=True)
            except Exception:
                pass

    api = _Q()
    w = webview.create_window('AHK MVD Installer',
        f"file:///{tmp.name.replace(os.sep, '/')}",
        js_api=api, width=460, height=430,
        frameless=True, background_color='#0a0a0b')
    api._window = w
    ico = resource_path("icon.ico")
    try: webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError: webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass


def show_no_internet_window():
    html = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { margin: 0; padding: 30px; background: #141414; color: #fff; font-family: Arial, sans-serif; text-align: center; }
h2 { color: #ff8800; margin-top: 20px; }
.btn { padding: 10px 30px; background: #333; color: #fff; border: none; 
       border-radius: 4px; cursor: pointer; margin-top: 20px; }
.btn:hover { background: #444; }
</style>
</head>
<body>
<h2>⚠ Нет подключения</h2>
<p>Не удалось подключиться после нескольких попыток</p>
<button class="btn" onclick="window.pywebview.api.close_app()">Закрыть</button>
</body>
</html>
"""
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()
    
    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
    
    api = _Q()
    w = webview.create_window('AHK MVD Installer',
        f"file:///{tmp.name.replace(os.sep,'/')}",
        js_api=api, width=380, height=200,
        frameless=True, background_color='#141414')
    api._window = w
    ico = resource_path("icon.ico")
    try: webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError: webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass


# ═══════════════════════════════════════════════════════
#  ЛОГИКА УСТАНОВЩИКА (оригинальный код)
# ═══════════════════════════════════════════════════════

def _log_to_file(msg: str):
    """Пишет в %APPDATA%\AHK_MVD\install_log.txt"""
    try:
        from datetime import datetime
        appdata = os.environ.get('APPDATA') or os.path.expanduser('~')
        folder = Path(appdata) / 'AHK_MVD'
        folder.mkdir(parents=True, exist_ok=True)
        with open(folder / 'install_log.txt', 'a', encoding='utf-8') as f:
            f.write(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] {msg}\n')
    except Exception:
        pass


def _settings_path() -> Path:
    appdata = os.environ.get('APPDATA') or os.path.expanduser('~')
    folder = Path(appdata) / 'AHK_MVD'
    folder.mkdir(parents=True, exist_ok=True)
    return folder / 'settings.json'


def load_settings() -> dict:
    try:
        p = _settings_path()
        if p.exists():
            return json.loads(p.read_text(encoding='utf-8'))
    except Exception:
        pass
    return {}


def save_settings(data: dict):
    """Merge-сохранение — не затирает ключи которые не переданы."""
    try:
        p = _settings_path()
        current = {}
        if p.exists():
            try:
                current = json.loads(p.read_text(encoding='utf-8'))
            except Exception:
                pass
        current.update(data)
        p.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding='utf-8')
    except Exception:
        pass


def fetch_html() -> str:
    resp = requests.get(f"{GITHUB_RAW}/index.html", timeout=15)
    resp.raise_for_status()
    html = resp.text
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()
    return tmp.name


class InstallerAPI:
    def __init__(self):
        self._saved = load_settings()
        saved_path = self._saved.get('radmir_path', '')
        if saved_path and Path(saved_path).exists():
            p = Path(saved_path)
            if (p / 'uiresources').exists() and (p / 'models').exists():
                self.radmir_path = p
            else:
                self.radmir_path = None
        else:
            self.radmir_path = None
        self._window = None

    def _set_status(self, eid, text, cls):
        if self._window:
            self._window.evaluate_js(
                f'document.getElementById("{eid}").textContent="{text}";'
                f'document.getElementById("{eid}").className="{cls}";'
            )

    def _notify(self, ok: bool):
        if self._window:
            self._window.evaluate_js(f'setGlobalStatus("{"ok" if ok else "err"}")')

    def _check_dirs(self):
        if not self.radmir_path: return False
        return ((self.radmir_path / "uiresources").exists() and
                (self.radmir_path / "models").exists())

    @staticmethod
    def _obfuscate(code):
        nl = chr(10)
        code = '(function(){' + nl + code + nl + '})();'
        codes = [ord(c) for c in code]
        n = len(codes)
        p1, p2, p3 = codes[:n//3], codes[n//3:(n*2)//3], codes[(n*2)//3:]
        def rnd(): return '_0x'+''.join(random.choices(string.ascii_letters+string.digits, k=6))
        v1,v2,v3,v4,v5,v6 = rnd(),rnd(),rnd(),rnd(),rnd(),rnd()
        return (f"(function(){{const {v1}=[{','.join(map(str,p1))}];"
                f"const {v2}=[{','.join(map(str,p2))}];"
                f"const {v3}=[{','.join(map(str,p3))}];"
                f"const {v4}=[...{v1},...{v2},...{v3}];"
                f"const {v5}=Function('return this')();"
                f"return {v5}[String.fromCharCode(101,118,97,108)]("
                f"{v4}.map(function({v6}){{return String.fromCharCode({v6})}}).join(''))}})();")

    _MARK_S = "//\u200b\u200c\u200b"
    _MARK_E = "//\u200c\u200b\u200c"
    _LEGACY_S = "// === HASSLE LOAD BOT CODE START ==="
    _LEGACY_E = "// === HASSLE LOAD BOT CODE END ==="

    @classmethod
    def _has_code(cls, content: str) -> bool:
        return (cls._MARK_S in content) or (cls._LEGACY_S in content)

    @classmethod
    def _remove_markers(cls, content: str) -> str:
        for S, E in [(cls._MARK_S, cls._MARK_E), (cls._LEGACY_S, cls._LEGACY_E)]:
            si = content.find(S)
            if si != -1:
                ei = content.find(E, si + len(S))
                if ei != -1:
                    content = content[:si] + content[ei + len(E):]
                    break
        return content.rstrip() + '\n'

    def _index_js(self):
        if not self.radmir_path:
            return None
        p = self.radmir_path / "uiresources" / "assets" / "Index.js"
        return p if p.exists() else None

    def _migrate_legacy(self):
        idx = self._index_js()
        if not idx:
            return
        try:
            content = idx.read_text(encoding='utf-8')
            if self._LEGACY_S not in content:
                return
            si = content.find(self._LEGACY_S)
            ei = content.find(self._LEGACY_E, si + len(self._LEGACY_S))
            if si == -1 or ei == -1:
                return
            inner = content[si + len(self._LEGACY_S): ei]
            clean = content[:si] + content[ei + len(self._LEGACY_E):]
            new_content = (
                clean.rstrip() + '\n'
                + self._MARK_S + '\n'
                + inner.strip('\n') + '\n'
                + self._MARK_E + '\n'
            )
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
            with open(idx, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
        except Exception:
            pass

    def get_saved_settings(self) -> dict:
        self._migrate_legacy()
        result = dict(self._saved)
        result['path_valid'] = self.radmir_path is not None
        result['radmir_path'] = str(self.radmir_path) if self.radmir_path else ''
        idx = self._index_js()
        if idx:
            try:
                result['code_installed'] = self._has_code(idx.read_text(encoding='utf-8'))
            except Exception:
                result['code_installed'] = False
        else:
            result['code_installed'] = False
        return result

    @staticmethod
    def _fetch_custom_interfaces() -> list:
        import re, json, traceback
        try:
            print(f'[Installer] Загружаю IntLoad.js: {INTLOAD_URL}')
            resp = requests.get(INTLOAD_URL, timeout=15)
            resp.raise_for_status()
            print(f'[Installer] HTTP {resp.status_code}, длина {len(resp.text)} байт')
            text = resp.text
            m = re.search(r'window\._duranCustomInterfaces\s*=\s*(\[)', text)
            if not m:
                print('[Installer] _duranCustomInterfaces не найден в IntLoad.js')
                _log_to_file('_fetch_custom_interfaces: _duranCustomInterfaces НЕ НАЙДЕН')
                return []
            start = m.start(1)
            depth, i = 0, start
            while i < len(text):
                if text[i] == '[':   depth += 1
                elif text[i] == ']':
                    depth -= 1
                    if depth == 0: break
                i += 1
            raw = text[start:i + 1]
            print(f'[Installer] Найден массив: {raw[:120]}')
            raw = re.sub(r',\s*([}\]])', r'\1', raw)
            raw = re.sub(r'([{,]\s*)([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*:', r'\1"\2":', raw)
            result = json.loads(raw)
            print(f'[Installer] Распарсено интерфейсов: '
                  f'{[r["name"] + ":" + r.get("type", "interface") for r in result]}')
            _log_to_file(f'_fetch_custom_interfaces OK: {[r["name"] + ":" + r.get("type", "interface") for r in result]}')
            return result
        except Exception as e:
            print(f'[Installer] Не удалось загрузить IntLoad.js: {e}')
            _log_to_file(f'_fetch_custom_interfaces ИСКЛЮЧЕНИЕ: {e}\n{traceback.format_exc()}')
            return []

    @staticmethod
    def _build_interfaces_block(ifaces: list) -> str:
        if not ifaces:
            return ""
        native_names = {
            "ScreenNotification", "Menu", "Hud", "Dialog", "InventoryNew",
            "Console", "BattlePassWelcome", "BlackMarket", "FullScreenPreloader",
        }
        dd_parts, fd_parts, side_effects = [], [], []
        for iface in ifaces:
            name      = iface["name"]
            files     = iface["files"]
            itype     = iface.get("type", "interface")
            js_file   = next((f for f in files if f.endswith(".js")), files[0])
            files_js  = "[" + ",".join(f'"{f}"' for f in files) + "]"
            if itype == "sideEffect":
                side_effects.append(
                    f'd(()=>import("./{js_file}"),{files_js},import.meta.url);'
                )
                print(f'[Installer] "{name}" -> side-effect импорт')
                continue
            if name in native_names:
                print(f'[Installer] [!] Пропускаю "{name}" — совпадает с нативным интерфейсом игры')
                continue
            hide_hud  = "!0" if iface.get("hideHud")  else "!1"
            hide_chat = "!0" if iface.get("hideChat") else "!1"
            dd_parts.append(
                f'{name}:f(()=>d(()=>import("./{js_file}"),{files_js},import.meta.url))'
            )
            fd_parts.append(
                f'{name}:{{open:{{status:!1}},show:!0,options:{{hideHud:{hide_hud},hideChat:{hide_chat}}}}}'
            )
        parts = []
        if dd_parts:
            parts.append(f'Object.assign(dd,{{{",".join(dd_parts)}}});')
        if fd_parts:
            parts.append(f'Object.assign(fd,{{{",".join(fd_parts)}}});')
        parts.extend(side_effects)
        return "".join(parts)

    def _deploy_custom_ui_files(self, ifaces: list):
        if not self.radmir_path:
            return
        assets_dir = self.radmir_path / "uiresources" / "assets"
        if not assets_dir.exists():
            return
        all_files = [f for iface in ifaces for f in iface.get("files", [])]
        kind = "загрузчик" if USE_LOADERS else "файл"
        for filename in all_files:
            url = f"{DEPLOY_UI_URL}/{filename}"
            try:
                resp = requests.get(url, timeout=20)
                resp.raise_for_status()
                dest = assets_dir / filename
                dest.write_bytes(resp.content)
                print(f'[Installer] Скопирован {kind} {filename} -> assets/')
            except Exception as e:
                print(f'[Installer] Не удалось скачать {kind} {filename}: {e}')

    def select_folder(self):
        r = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory='/', allow_multiple=False)
        if not r or not len(r):
            return None
        chosen = Path(r[0])
        if chosen.name.upper() != "RADMIR CRMP":
            return {"error": "not_radmir"}
        self.radmir_path = chosen
        current = load_settings()
        current['radmir_path'] = str(self.radmir_path)
        save_settings(current)
        return {"ok": True, "path": str(self.radmir_path)}

    def insert_code(self, rank, first_name, last_name, callsign, use_callsign, auto_password='', auto_grab=None, swap_enabled=True, swap_key='Alt+Q', menu_key='Alt+0', menu_hidden=None, menu_binds=None, menu_order=None):
        def run():
            import traceback, sys
            try:
                if not self._check_dirs(): self._notify(False); return
                ifaces = self._fetch_custom_interfaces()
                self._deploy_custom_ui_files(ifaces)
                resp = requests.get(AHK_URL, timeout=30); resp.raise_for_status()
                code = resp.text.strip()
                if not code: self._notify(False); return
                code = code.replace('\r\n','\n').replace('\r','\n').strip()+'\n'
            except Exception:
                traceback.print_exc(file=sys.stdout)
                self._notify(False); return
            code = code.replace('const RANK = "";',       f'const RANK = "{rank}";')
            code = code.replace('const FIRST_NAME = "";', f'const FIRST_NAME = "{first_name}";')
            code = code.replace('const LAST_NAME = "";',  f'const LAST_NAME = "{last_name}";')
            code = code.replace('const HWID = "";',       f'const HWID = "{get_hwid()}";')
            safe_swap_key = str(swap_key).replace('"', '').replace("'", '')[:30] if swap_key else ''
            if not swap_enabled or not safe_swap_key:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = false;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', 'const SWAP_KEY = "";')
            else:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = true;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', f'const SWAP_KEY = "{safe_swap_key}";')
            safe_menu_key = str(menu_key).replace('"', '').replace("'", '')[:30] if menu_key else ''
            code = code.replace('const MENU_KEY = "Alt+0";', f'const MENU_KEY = "{safe_menu_key}";')
            hidden_list = menu_hidden if isinstance(menu_hidden, list) else []
            hidden_json = json.dumps(hidden_list)
            code = code.replace('const MENU_HIDDEN_ITEMS = [];', f'const MENU_HIDDEN_ITEMS = {hidden_json};')
            binds_dict = {k: v for k, v in (menu_binds or {}).items() if v}
            binds_json = json.dumps(binds_dict, ensure_ascii=False)
            code = code.replace('const MENU_BINDS = {};', f'const MENU_BINDS = {binds_json};')
            order_list = menu_order if isinstance(menu_order, list) and menu_order else []
            order_json = json.dumps(order_list)
            code = code.replace('const MENU_ORDER = [];', f'const MENU_ORDER = {order_json};')
            if use_callsign and callsign:
                code = code.replace('const CALLSIGN = "";', f'const CALLSIGN = "{callsign}";')
            if auto_password:
                code = code.replace('const AUTO_PASSWORD = "";', f'const AUTO_PASSWORD = "{auto_password}";')
            items_dict = auto_grab.get('items', {}) if auto_grab else {}
            any_item = any(v for v in items_dict.values()) if items_dict else False
            if auto_grab and isinstance(auto_grab, dict) and auto_grab.get('enabled') and any_item:
                thr  = auto_grab.get('thresholds', {})
                menu = auto_grab.get('menu', {})
                items = auto_grab.get('items', {})
                code = code.replace('const AUTO_GRAB = false;', 'const AUTO_GRAB = true;')
                code = code.replace('var AUTO_GRAB = false;', 'var AUTO_GRAB = true;')
                if thr.get('magnum')  is not None:
                    code = code.replace('const AUTO_GRAB_THR_MAGNUM = 30;', f'const AUTO_GRAB_THR_MAGNUM = {int(thr["magnum"])};')
                if thr.get('ammo762') is not None:
                    code = code.replace('const AUTO_GRAB_THR_762 = 60;',    f'const AUTO_GRAB_THR_762 = {int(thr["ammo762"])};')
                if thr.get('ammo545') is not None:
                    code = code.replace('const AUTO_GRAB_THR_545 = 60;',    f'const AUTO_GRAB_THR_545 = {int(thr["ammo545"])};')
                if thr.get('ammo12x70') is not None:
                    code = code.replace('const AUTO_GRAB_THR_1270 = 20;',   f'const AUTO_GRAB_THR_1270 = {int(thr["ammo12x70"])};')
                for key, mkey in [
                    ('medkit',     'MEDKIT'),   ('baton',      'BATON'),
                    ('vest',       'VEST'),     ('deagle',     'DEAGLE'),
                    ('ammo_magnum','AMMO_MAGNUM'),('akm',      'AKM'),  ('ammo_762',  'AMMO_762'),
                    ('painkiller', 'PAINKILLERS'),('baton2',   'WAND'),
                    ('taumeter',   'RADAR_GUN'),('diag',       'DIAGNOSTICS'),
                    ('taser',      'TASER'),    ('aks74u',     'AKS74U'),
                    ('remington',  'REMINGTON'),('ammo_545',   'AMMO_545'), ('ammo_12x70','AMMO_1270'),
                ]:
                    val = menu.get(key)
                    if val is not None:
                        code = code.replace(f'const AUTO_GRAB_MENU_{mkey} = -1;', f'const AUTO_GRAB_MENU_{mkey} = {int(val)};')
                skip = [k for k,v in items.items() if not v]
                skip_js = json.dumps(skip)
                code = code.replace('const AUTO_GRAB_SKIP = [];', f'const AUTO_GRAB_SKIP = {skip_js};')
                code = code.replace('var AUTO_GRAB_SKIP = [];', f'var AUTO_GRAB_SKIP = {skip_js};')
            try:
                interfaces_block = self._build_interfaces_block(ifaces)
            except Exception:
                traceback.print_exc(file=sys.stdout)
                _log_to_file(f'_build_interfaces_block ИСКЛЮЧЕНИЕ:\n{traceback.format_exc()}')
                interfaces_block = ""
            _log_to_file(f'interfaces_block длина={len(interfaces_block)}, ifaces было={len(ifaces)}')
            try:
                obf = self._obfuscate(code)
                idx = self.radmir_path/"uiresources"/"assets"/"Index.js"
                if not idx.exists():
                    self._notify(False); return
                with open(idx,'r',encoding='utf-8') as f: idx_content = f.read()
                idx_content = self._remove_markers(idx_content)
                new_text = (idx_content + InstallerAPI._MARK_S + "\n" + interfaces_block + "\n" + obf + "\n" + InstallerAPI._MARK_E + "\n")
                new_text = new_text.replace('\r\n','\n').replace('\r','\n').rstrip()+'\n'
                with open(idx,'w',encoding='utf-8',newline='\n') as f: f.write(new_text)
                self._set_status("st-code","Установлен","cr-val ok")
                current = load_settings()
                save_settings({
                    'rank': rank,
                    'first_name': first_name,
                    'last_name': last_name,
                    'callsign': callsign if use_callsign else '',
                    'use_callsign': bool(use_callsign),
                    'auto_password': auto_password,
                    'use_auto_password': bool(auto_password),
                    'radmir_path': str(self.radmir_path) if self.radmir_path else current.get('radmir_path', ''),
                    'auto_grab': (lambda ag: {**ag, 'enabled': ag.get('enabled', False) and any_item})(auto_grab) if auto_grab and isinstance(auto_grab, dict) else {},
                    'swap_enabled': bool(swap_enabled),
                    'swap_key': safe_swap_key if swap_enabled else '',
                    'menu_key': safe_menu_key,
                    'menu_hidden': hidden_list,
                    'menu_binds': binds_dict,
                    'menu_order': order_list,
                })
                self._notify(True)
            except Exception:
                traceback.print_exc(file=sys.stdout)
                self._notify(False)
        threading.Thread(target=run, daemon=True).start()
        return {"ok": True}

    def remove_code(self):
        def run():
            if not self._check_dirs(): self._notify(False); return
            idx = self.radmir_path/"uiresources"/"assets"/"Index.js"
            if not idx.exists(): self._notify(False); return
            with open(idx,'r',encoding='utf-8') as f: content = f.read()
            content = self._remove_markers(content)
            with open(idx,'w',encoding='utf-8',newline='\n') as f: f.write(content)
            self._set_status("st-code","Не установлен","cr-val muted")
            self._notify(True)
        threading.Thread(target=run, daemon=True).start()
        return {"ok": True}

    def close_app(self):
        if self._window: self._window.destroy()

    def minimize_app(self):
        if self._window: self._window.minimize()

    def open_url(self, url):
        import webbrowser
        webbrowser.open(url)


# ═══════════════════════════════════════════════════════
#  MAIN — запускает авторизацию, потом установщик
# ═══════════════════════════════════════════════════════

def main():
    # 1. АВТОРИЗАЦИЯ
    splash_close = _run_splash()
    hwid = get_hwid()
    result = run_auth_with_ui(hwid, splash_close=splash_close)

    if result["failed"]:
        show_no_internet_window()
        return

    if not result["authorized"]:
        show_denied_window(hwid)
        return

    # 2. ОСНОВНОЙ ИНТЕРФЕЙС УСТАНОВЩИКА
    html_tmp = fetch_html()
    url = f"file:///{html_tmp.replace(os.sep, '/')}"
    api = InstallerAPI()
    w = webview.create_window(
        title="AHK MVD Installer", url=url, js_api=api,
        width=860, height=640, resizable=False,
        frameless=True, easy_drag=True,
        background_color="#111114", confirm_close=False,
    )
    api._window = w
    
    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)
    try: os.unlink(html_tmp)
    except: pass


if __name__ == '__main__':
    main()
