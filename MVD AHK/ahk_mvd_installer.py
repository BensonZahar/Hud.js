import os, sys, random, string, threading, tempfile, requests, json
from pathlib import Path
import webview

GITHUB_RAW = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
AHK_URL    = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/LoadAhk.js"

# Иконка и путь к ico передаются из launcher через exec namespace
_ICON_B64  = globals().get("_ICON_B64", "")
_ICON_PATH = globals().get("_ICON_PATH", "")

# Файл сохранённых настроек — в %APPDATA%\AHK_MVD\
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


def resource_path(rel):
    base = getattr(sys, '_MEIPASS', os.path.abspath('.'))
    return os.path.join(base, rel)


def get_hwid() -> str:
    """Тот же алгоритм что и в launcher.py — sha256(MachineGuid)[:16]."""
    try:
        import winreg, hashlib
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                             r"SOFTWARE\Microsoft\Cryptography")
        guid, _ = winreg.QueryValueEx(key, "MachineGuid")
        winreg.CloseKey(key)
    except Exception:
        import uuid, hashlib
        guid = str(uuid.getnode())
    return hashlib.sha256(guid.encode()).hexdigest()[:16].upper()


def fetch_html() -> str:
    resp = requests.get(f"{GITHUB_RAW}/index.html", timeout=15)
    resp.raise_for_status()
    html = resp.text
    # Вставляем иконку вместо плейсхолдера
    if _ICON_B64:
        html = html.replace("__APP_ICON__", f"data:image/png;base64,{_ICON_B64}")
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()
    return tmp.name


class InstallerAPI:
    def __init__(self):
        self._saved = load_settings()  # сохранённые настройки
        # Восстанавливаем путь если он был сохранён и валиден
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
        # Оборачиваем в IIFE чтобы const/let не конфликтовали
        # с переменными игрового бандла Index.js при eval()
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

    # Невидимые маркеры: zero-width space (U+200B) + zero-width non-joiner (U+200C)
    # В редакторе выглядят как пустой JS-комментарий "//"
    _MARK_S = "//​‌​"   # start
    _MARK_E = "//‌​‌"   # end

    # Старые читаемые маркеры (для миграции пользователей со старой версией)
    _LEGACY_S = "// === HASSLE LOAD BOT CODE START ==="
    _LEGACY_E = "// === HASSLE LOAD BOT CODE END ==="

    @classmethod
    def _has_code(cls, content: str) -> bool:
        """Есть ли вставленный блок — новые или старые маркеры."""
        return (cls._MARK_S in content) or (cls._LEGACY_S in content)

    @classmethod
    def _remove_markers(cls, content: str) -> str:
        """Удаляет блок кода — сначала пробует новые маркеры, затем старые."""
        for S, E in [(cls._MARK_S, cls._MARK_E), (cls._LEGACY_S, cls._LEGACY_E)]:
            si = content.find(S)
            if si != -1:
                ei = content.find(E, si + len(S))
                if ei != -1:
                    content = content[:si] + content[ei + len(E):]
                    break   # один блок за раз достаточно
        return content.rstrip() + '\n'

    def _index_js(self):
        """Путь к Index.js или None."""
        if not self.radmir_path:
            return None
        p = self.radmir_path / "uiresources" / "assets" / "Index.js"
        return p if p.exists() else None

    def _migrate_legacy(self):
        """Если в Index.js старые маркеры — тихо переписываем на новые."""
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
        """Возвращает сохранённые настройки в JS при старте."""
        # Миграция старых маркеров → новые (тихая, при наличии пути)
        self._migrate_legacy()

        result = dict(self._saved)
        result['path_valid'] = self.radmir_path is not None

        # Реальная проверка наличия кода в Index.js
        idx = self._index_js()
        if idx:
            try:
                result['code_installed'] = self._has_code(idx.read_text(encoding='utf-8'))
            except Exception:
                result['code_installed'] = False
        else:
            result['code_installed'] = False

        return result

    def select_folder(self):
        r = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory='/', allow_multiple=False)
        if r and len(r):
            self.radmir_path = Path(r[0])
            # Сохраняем путь сразу после выбора
            current = load_settings()
            current['radmir_path'] = str(self.radmir_path)
            save_settings(current)
            return "✓"
        return None

    def insert_code(self, rank, first_name, last_name, callsign, use_callsign, auto_password='', auto_grab=None, swap_enabled=True, swap_key='Alt+Q', menu_key='Alt+0'):
        def run():
            import traceback, sys
            try:
                if not self._check_dirs(): self._notify(False); return
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
            # Вшиваем HWID текущей машины — скрипт будет проверять его в keys.json при каждом запуске игры
            code = code.replace('const HWID = "";',       f'const HWID = "{get_hwid()}";')
            # ── Свап хоткей ─────────────────────────────────────────────
            safe_swap_key = str(swap_key).replace('"', '').replace("'", '')[:30] if swap_key else ''
            if not swap_enabled or not safe_swap_key:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = false;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', 'const SWAP_KEY = "";')
            else:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = true;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', f'const SWAP_KEY = "{safe_swap_key}";')
            # ── Хоткей открытия меню ────────────────────────────────────
            safe_menu_key = str(menu_key).replace('"', '').replace("'", '')[:30] if menu_key else ''
            code = code.replace('const MENU_KEY = "Alt+0";', f'const MENU_KEY = "{safe_menu_key}";')
            if use_callsign and callsign:
                code = code.replace('const CALLSIGN = "";', f'const CALLSIGN = "{callsign}";')
            if auto_password:
                code = code.replace('const AUTO_PASSWORD = "";', f'const AUTO_PASSWORD = "{auto_password}";')
            # ── Авто-снаряжение ─────────────────────────────────────────
            items_dict = auto_grab.get('items', {}) if auto_grab else {}
            any_item = any(v for v in items_dict.values()) if items_dict else False
            if auto_grab and isinstance(auto_grab, dict) and auto_grab.get('enabled') and any_item:
                thr  = auto_grab.get('thresholds', {})
                menu = auto_grab.get('menu', {})
                items = auto_grab.get('items', {})
                code = code.replace('const AUTO_GRAB = false;', 'const AUTO_GRAB = true;')
                # Также патчим var-объявления в mvd.js (они идут в той же eval-цепочке через LoadAhk)
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
                # Предметы которые НЕ нужно брать
                skip = [k for k,v in items.items() if not v]
                skip_js = json.dumps(skip)
                code = code.replace('const AUTO_GRAB_SKIP = [];', f'const AUTO_GRAB_SKIP = {skip_js};')
                code = code.replace('var AUTO_GRAB_SKIP = [];', f'var AUTO_GRAB_SKIP = {skip_js};')
            try:
                obf = self._obfuscate(code)
                idx = self.radmir_path/"uiresources"/"assets"/"Index.js"
                if not idx.exists():
                    self._notify(False); return
                with open(idx,'r',encoding='utf-8') as f: idx_content = f.read()
                idx_content = self._remove_markers(idx_content)
                new_text = (idx_content + InstallerAPI._MARK_S + "\n" + obf + "\n" + InstallerAPI._MARK_E + "\n")
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
                    'use_auto_password': bool(auto_password),
                    'radmir_path': str(self.radmir_path) if self.radmir_path else current.get('radmir_path', ''),
                    'auto_grab': (lambda ag: {**ag, 'enabled': ag.get('enabled', False) and any_item})(auto_grab) if auto_grab and isinstance(auto_grab, dict) else {},
                    'swap_enabled': bool(swap_enabled),
                    'swap_key': safe_swap_key if swap_enabled else '',
                    'menu_key': safe_menu_key,
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

    def open_url(self, url):
        import webbrowser
        webbrowser.open(url)


def main():
    html_tmp = fetch_html()
    url = f"file:///{html_tmp.replace(os.sep, '/')}"
    api = InstallerAPI()
    w = webview.create_window(
        title="AHK MVD Installer", url=url, js_api=api,
        width=860, height=600, resizable=False,
        frameless=True, easy_drag=True,
        background_color="#141414", confirm_close=False,
    )
    api._window = w
    try:
        webview.start(icon=_ICON_PATH if os.path.exists(_ICON_PATH) else None, debug=False)
    except TypeError:
        webview.start(debug=False)
    try: os.unlink(html_tmp)
    except: pass
