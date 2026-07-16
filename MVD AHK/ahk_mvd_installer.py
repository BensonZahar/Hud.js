import os, random, string, threading, tempfile, requests, json
import sys, base64, hashlib, time, io, winreg
from pathlib import Path
import webview
from PIL import Image

# ═══════════════════════════════════════════════════════
#  НАСТРОЙКИ
# ═══════════════════════════════════════════════════════
GITHUB_RAW    = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
KEYS_URL      = f"{GITHUB_RAW}/keys.json"
AHK_URL       = f"{GITHUB_RAW}/LoadAhk.js"
INTLOAD_URL   = f"{GITHUB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
CUSTOM_UI_URL = f"{GITHUB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"
LOADERS_URL   = f"{CUSTOM_UI_URL}/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

RETRY_COUNT = 5
RETRY_DELAY = 4

USE_LOADERS   = True
DEPLOY_UI_URL = LOADERS_URL if USE_LOADERS else CUSTOM_UI_URL

NATIVE_INTERFACE_NAMES = {
    "ScreenNotification", "Menu", "Hud", "Dialog", "InventoryNew",
    "Console", "BattlePassWelcome", "BlackMarket", "FullScreenPreloader",
}

_ICON_PATH = globals().get("_ICON_PATH", "")


# ═══════════════════════════════════════════════════════
#  АВТОРИЗАЦИЯ (перенесено из launcher.py)
# ═══════════════════════════════════════════════════════

def resource_path(rel):
    base = getattr(sys, '_MEIPASS', os.path.abspath('.'))
    return os.path.join(base, rel)


def get_hwid() -> str:
    try:
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                             r"SOFTWARE\Microsoft\Cryptography")
        guid, _ = winreg.QueryValueEx(key, "MachineGuid")
        winreg.CloseKey(key)
    except Exception:
        import uuid
        guid = str(uuid.getnode())
    return hashlib.sha256(guid.encode()).hexdigest()[:16].upper()


def is_authorized(hwid: str) -> bool:
    resp = requests.get(KEYS_URL, timeout=10)
    resp.raise_for_status()
    keys = resp.json()
    return hwid in keys


def get_icon_b64() -> str:
    try:
        img = Image.open(resource_path("icon.ico")).convert("RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


def run_auth_with_ui(hwid: str) -> dict:
    result      = {"authorized": None, "failed": False}
    window_ref  = [None]
    ready_event = threading.Event()

    LOADING_HTML = """<!DOCTYPE html><html lang="ru"><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,700&family=Open+Sans+Condensed:ital,wght@0,700;1,700&display=swap' rel='stylesheet'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#010106;
  --border:rgba(255,255,255,.06);
  --text:#fff;--text3:rgba(255,255,255,.36);
  --accent-grad:linear-gradient(168deg,#f9b701 -73.4%,#fda02f 58.52%,#ff9446 126.58%);
  --danger:#e25544;
  --font:'Open Sans',sans-serif;--font-head:'Open Sans Condensed','Open Sans',sans-serif;
}
html,body{width:100%;height:100%;overflow:hidden}
body{font-family:var(--font);color:var(--text);background:var(--bg);
  display:flex;align-items:stretch;justify-content:stretch;
  user-select:none;-webkit-app-region:drag}
.window{
  width:100%;height:100%;
  background:
    radial-gradient(60% 50% at 14% -6%,rgba(249,183,1,.10),transparent 60%),
    radial-gradient(50% 40% at 100% 105%,rgba(10,153,71,.07),transparent 65%),
    var(--bg);
  border:1px solid #1a1a1e;border-radius:10px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:16px;padding:24px;
  position:relative;overflow:hidden;-webkit-app-region:no-drag
}
.logo-row{display:flex;align-items:center;gap:10px}
.logo-ico{
  width:40px;height:40px;border-radius:9px;flex-shrink:0;
  background:var(--accent-grad);
  box-shadow:0 4px 14px rgba(253,160,47,.35),inset 0 1px 0 rgba(255,255,255,.3);
  display:flex;align-items:center;justify-content:center
}
.logo-ico svg{width:20px;height:20px;fill:#1a1106}
.logo-txt{font-family:var(--font-head);font-size:14px;font-weight:700;font-style:italic;
  color:var(--text);text-transform:uppercase;letter-spacing:.02em;line-height:1.2}
.logo-txt span{display:block;font-family:var(--font);font-size:9px;font-weight:400;font-style:normal;
  color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-top:2px}
.spinner{
  width:28px;height:28px;
  border:2.5px solid rgba(249,183,1,.12);
  border-top-color:#f9b701;
  border-radius:50%;
  animation:spin .8s linear infinite
}
.spinner.error{border-top-color:var(--danger);animation:spin 1.4s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#status{font-size:11px;color:var(--text3);text-align:center;line-height:1.6;min-height:30px}
</style></head><body>
<div class="window">
  <div class="logo-row">
    <div class="logo-ico">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 1.5L3.8 13.6h6.1L8.4 22.5l11.8-13.6h-6.9L13 1.5z"/></svg>
    </div>
    <div class="logo-txt">AHK MVD Installer<span>Авторизация</span></div>
  </div>
  <div class="spinner" id="spin"></div>
  <div id="status">Проверка лицензии...</div>
</div>
<script>
function setStatus(txt,isError){
  document.getElementById('status').textContent=txt;
  var s=document.getElementById('spin');
  if(isError)s.classList.add('error');else s.classList.remove('error');
}
</script>
</body></html>"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html',
                                      delete=False, encoding='utf-8')
    tmp.write(LOADING_HTML); tmp.close()

    def _auth_loop():
        ready_event.wait(timeout=6)
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
                break

            except Exception:
                if attempt < RETRY_COUNT:
                    for sec in range(RETRY_DELAY, 0, -1):
                        js(f"Нет подключения. Повтор через {sec} сек... ({attempt}/{RETRY_COUNT})", err=True)
                        time.sleep(1)
                else:
                    result["failed"] = True

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

    w.events.loaded += _on_loaded

    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)

    return result


def show_denied_window(hwid: str):
    keys_line = f'"{hwid}": ""'

    html = f"""<!DOCTYPE html><html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' rel='stylesheet'>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#0a0a0b;color:#e8e6f0;font-family:'Inter',sans-serif;font-size:13px;
  display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden;
  -webkit-app-region:drag;user-select:none}}
.card{{background:#111114;border:.5px solid rgba(255,255,255,.10);border-radius:14px;
  width:400px;padding:28px 26px;box-shadow:0 32px 80px rgba(0,0,0,.75);
  -webkit-app-region:no-drag;display:flex;flex-direction:column;align-items:center}}
.win-close{{position:fixed;top:13px;right:13px;width:22px;height:22px;border-radius:50%;
  background:rgba(255,255,255,.06);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:background .15s;
  -webkit-app-region:no-drag}}
.win-close:hover{{background:#e05555}}
.win-close svg{{width:8px;height:8px;stroke:#fff;stroke-width:2;fill:none;stroke-linecap:round}}
.icon-wrap{{width:52px;height:52px;border-radius:13px;background:rgba(224,85,85,.12);
  border:.5px solid rgba(224,85,85,.28);display:flex;align-items:center;
  justify-content:center;margin-bottom:16px}}
.icon-wrap svg{{width:24px;height:24px;stroke:#e05555;stroke-width:1.8;fill:none;
  stroke-linecap:round;stroke-linejoin:round}}
h2{{font-size:16px;font-weight:600;color:#e8e6f0;margin-bottom:8px;text-align:center}}
.sub{{font-size:11px;color:rgba(232,230,240,.5);text-align:center;line-height:1.65;margin-bottom:20px}}
.field-label{{font-size:9px;color:rgba(232,230,240,.3);text-transform:uppercase;
  letter-spacing:.08em;margin-bottom:6px;align-self:flex-start}}
.copy-box{{width:100%;background:#1f1f26;border:.5px solid rgba(255,255,255,.10);
  border-radius:8px;padding:10px 14px 28px;
  font-family:'JetBrains Mono',Consolas,monospace;font-size:10px;
  color:rgba(232,230,240,.7);cursor:pointer;word-break:break-all;
  transition:background .15s,border-color .15s;position:relative;
  margin-bottom:16px;-webkit-app-region:no-drag}}
.copy-box:hover{{background:#252530;border-color:rgba(255,255,255,.16)}}
.copy-hint{{position:absolute;bottom:8px;right:12px;font-size:9px;
  color:rgba(232,230,240,.28);font-family:'Inter',sans-serif;letter-spacing:.04em;
  transition:color .2s;pointer-events:none}}
.divider{{width:100%;height:.5px;background:rgba(255,255,255,.06);margin-bottom:16px}}
.tg-row{{display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:18px}}
.tg-lbl{{font-size:11px;color:rgba(232,230,240,.45)}}
.tg-link{{font-size:11px;color:#4f6ef7;font-weight:500;text-decoration:none;
  -webkit-app-region:no-drag;transition:color .15s}}
.tg-link:hover{{color:#8aabff}}
.btn{{width:100%;height:36px;border:.5px solid rgba(255,255,255,.10);border-radius:8px;
  cursor:pointer;font-size:11px;font-weight:600;font-family:'Inter',sans-serif;
  background:rgba(255,255,255,.07);color:#e8e6f0;transition:background .15s;
  -webkit-app-region:no-drag}}
.btn:hover{{background:rgba(255,255,255,.12)}}
.btn:active{{transform:scale(.98)}}
</style></head><body>
<button class="win-close" onclick="window.pywebview&&pywebview.api?pywebview.api.close_app():window.close()">
  <svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
</button>
<div class="card">
  <div class="icon-wrap">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>
  <h2>Нет доступа</h2>
  <p class="sub">Ваш ПК не авторизован.<br>Отправьте строку ниже создателю для получения доступа.</p>
  <span class="field-label">Скопируйте и отправьте создателю</span>
  <div class="copy-box" onclick="copyKeys()">
    {keys_line},
    <span class="copy-hint" id="badge">нажмите чтобы скопировать</span>
  </div>
  <div class="divider"></div>
  <div class="tg-row">
    <span class="tg-lbl">Написать создателю:</span>
    <a class="tg-link" href="#"
       onclick="window.pywebview&&pywebview.api&&pywebview.api.open_url('https://t.me/ZaharKonst');return false;">
      @ZaharKonst
    </a>
  </div>
  <button class="btn" onclick="window.pywebview&&pywebview.api?pywebview.api.close_app():window.close()">Закрыть</button>
</div>
<script>
var _txt = `{keys_line},`;
function copyKeys(){{
  if(navigator.clipboard){{
    navigator.clipboard.writeText(_txt);
    var b=document.getElementById('badge');
    b.textContent='скопировано \\u2713';b.style.color='#3dba7a';
    setTimeout(function(){{b.textContent='нажмите чтобы скопировать';b.style.color='';}},2000);
  }}
}}
</script></body></html>"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()

    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
        def open_url(self, url):
            import webbrowser; webbrowser.open(url)

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
    html = """<!DOCTYPE html><html><head><meta charset='UTF-8'>
<style>*{margin:0;padding:0}body{background:#141414;color:#f4f1e1;
font-family:sans-serif;display:flex;flex-direction:column;align-items:center;
justify-content:center;height:100vh;gap:10px;-webkit-app-region:drag}
h2{font-size:14px}p{font-size:11px;opacity:.5}
button{padding:8px 20px;background:#ea4f3d;border:none;color:#fff;
border-radius:4px;cursor:pointer;font-size:11px;-webkit-app-region:no-drag}
</style></head><body>
<h2>⚠ Нет подключения</h2>
<p>Не удалось подключиться после нескольких попыток</p>
<button onclick="window.pywebview.api.close_app()">Закрыть</button>
</body></html>"""
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
#  ЛОГИКА УСТАНОВЩИКА
# ═══════════════════════════════════════════════════════

def _log_to_file(msg: str):
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

    def insert_code(self, callsign, use_callsign, auto_password='', auto_grab=None, swap_enabled=True, swap_key='Alt+Q', menu_key='Alt+0', menu_hidden=None, menu_binds=None, menu_order=None, menu_timer=None):
        result_event = threading.Event()
        result_data = {"ok": False, "message": "Неизвестная ошибка"}

        def run():
            import traceback, sys
            try:
                if not self._check_dirs():
                    result_data["message"] = "Папка RADMIR CRMP не выбрана или некорректна."
                    return
                ifaces = self._fetch_custom_interfaces()
                self._deploy_custom_ui_files(ifaces)
                
                code = None
                for attempt in range(3):
                    try:
                        resp = requests.get(AHK_URL, timeout=15)
                        resp.raise_for_status()
                        code = resp.text.strip()
                        break
                    except Exception as e:
                        if attempt == 2:
                            raise Exception("Не удалось загрузить данные. Проверьте интернет-соединение.")
                        time.sleep(2)
                        
                if not code:
                    result_data["message"] = "Загруженные данные пусты."
                    return
                code = code.replace('\r\n','\n').replace('\r','\n').strip()+'\n'
            except Exception as e:
                result_data["message"] = str(e)
                traceback.print_exc(file=sys.stdout)
                result_event.set()
                self._notify(False)
                return

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
            timer_list = menu_timer if isinstance(menu_timer, list) and menu_timer else []
            timer_json = json.dumps(timer_list)
            code = code.replace('const MENU_TIMER_ITEMS = [];', f'const MENU_TIMER_ITEMS = {timer_json};')
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
                    result_data["message"] = "Файл Index.js не найден в папке игры."
                    result_event.set()
                    self._notify(False)
                    return
                
                try:
                    with open(idx,'r',encoding='utf-8') as f: idx_content = f.read()
                    idx_content = self._remove_markers(idx_content)
                    new_text = (idx_content + InstallerAPI._MARK_S + "\n" + interfaces_block + "\n" + obf + "\n" + InstallerAPI._MARK_E + "\n")
                    new_text = new_text.replace('\r\n','\n').replace('\r','\n').rstrip()+'\n'
                    with open(idx,'w',encoding='utf-8',newline='\n') as f: f.write(new_text)
                except PermissionError:
                    result_data["message"] = "Файл Index.js заблокирован! Закройте игру (RADMIR CRMP) и повторите попытку."
                    result_event.set()
                    self._notify(False)
                    return

                self._set_status("st-code","Установлен","cr-val ok")
                current = load_settings()
                save_settings({
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
                    'menu_timer_items': timer_list,
                })
                result_data["ok"] = True
                result_data["message"] = "Код успешно установлен!"
                self._notify(True)
            except Exception as e:
                result_data["message"] = f"Ошибка записи: {e}"
                traceback.print_exc(file=sys.stdout)
            finally:
                result_event.set()

        threading.Thread(target=run, daemon=True).start()
        result_event.wait(timeout=60)
        
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK MVD Installer - Ошибка", 0x10 | 0x40000)
            except Exception:
                pass
                
        return result_data

    def remove_code(self):
        result_event = threading.Event()
        result_data = {"ok": False, "message": "Ошибка удаления"}

        def run():
            try:
                if not self._check_dirs():
                    result_data["message"] = "Папка не выбрана"
                    return
                idx = self.radmir_path/"uiresources"/"assets"/"Index.js"
                if not idx.exists():
                    result_data["message"] = "Файл не найден"
                    return
                try:
                    with open(idx,'r',encoding='utf-8') as f: content = f.read()
                    content = self._remove_markers(content)
                    with open(idx,'w',encoding='utf-8',newline='\n') as f: f.write(content)
                except PermissionError:
                    result_data["message"] = "Файл заблокирован игрой! Закройте игру."
                    return
                self._set_status("st-code","Не установлен","cr-val muted")
                result_data["ok"] = True
                result_data["message"] = "Код успешно удален"
                self._notify(True)
            except Exception as e:
                result_data["message"] = str(e)
            finally:
                result_event.set()

        threading.Thread(target=run, daemon=True).start()
        result_event.wait(timeout=30)
        
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK MVD Installer - Ошибка", 0x10 | 0x40000)
            except Exception:
                pass
                
        return result_data

    def close_app(self):
        if self._window: self._window.destroy()

    def minimize_app(self):
        if self._window: self._window.minimize()

    def open_url(self, url):
        import webbrowser
        webbrowser.open(url)


# ═══════════════════════════════════════════════════════
#  MAIN — сначала авторизация, потом установщик
# ═══════════════════════════════════════════════════════

def main():
    hwid = get_hwid()
    result = run_auth_with_ui(hwid)

    if result["failed"]:
        show_no_internet_window()
        return

    if not result["authorized"]:
        show_denied_window(hwid)
        return

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
