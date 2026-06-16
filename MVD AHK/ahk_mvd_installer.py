import os, random, string, threading, tempfile, requests, json, time
from pathlib import Path
import webview

GITHUB_RAW    = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
AHK_URL       = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/LoadAhk.js"
INTLOAD_URL   = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
CUSTOM_UI_URL = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"

# ── Папка с готовыми файлами-лоадерами (генерируются вручную, кладутся на GitHub) ──
GITHUB_USER       = "BensonZahar"
GITHUB_REPO       = "Hud.js"
CUSTOM_UI_FOLDER  = "MVD AHK/Кастом Интерфейсы"             # папка с реальными интерфейсами (curr. zkm.js, MvdMenu.js)
LOADERS_FOLDER    = "MVD AHK/Кастом Интерфейсы/Загрузчики"   # папка с готовыми лоадерами — именно их кладём в assets/
LOADERS_URL       = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

# Путь к иконке передаётся из launcher через exec namespace
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
        self._migrate_legacy()

        result = dict(self._saved)
        result['path_valid'] = self.radmir_path is not None
        result['radmir_path'] = str(self.radmir_path) if self.radmir_path else ''

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

    @staticmethod
    def _fetch_custom_interfaces() -> list:
        """Скачивает IntLoad.js с GitHub и парсит window._duranCustomInterfaces.
        Единственный источник реестра — добавлять новые интерфейсы только в IntLoad.js.
        Возвращает [] если GitHub недоступен или реестр не найден."""
        import re, json
        try:
            print(f'[Installer] Загружаю IntLoad.js: {INTLOAD_URL}')
            resp = requests.get(INTLOAD_URL, timeout=15)
            resp.raise_for_status()
            print(f'[Installer] HTTP {resp.status_code}, длина {len(resp.text)} байт')
            text = resp.text

            m = re.search(r'window\._duranCustomInterfaces\s*=\s*(\[)', text)
            if not m:
                print('[Installer] _duranCustomInterfaces не найден в IntLoad.js')
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

            # Убираем trailing-запятые (невалидны в JSON)
            raw = re.sub(r',\s*([}\]])', r'\1', raw)
            # Кавычим unquoted JS-ключи объектов (name:, files:, hideHud:...) → валидный JSON
            raw = re.sub(r'([{,]\s*)([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*:', r'\1"\2":', raw)
            # json.loads понимает true/false/null нативно — замены не нужны
            result = json.loads(raw)
            print(f'[Installer] Распарсено интерфейсов: {[r["name"] for r in result]}')
            return result
        except Exception as e:
            print(f'[Installer] Не удалось загрузить IntLoad.js: {e}')
            return []

    @staticmethod
    def _build_interfaces_block(ifaces: list) -> str:
        """Генерирует Object.assign(ld,...) / Object.assign(ud,...) из реестра."""
        if not ifaces:
            return ""
        ld_parts, ud_parts = [], []
        for iface in ifaces:
            name      = iface["name"]
            files     = iface["files"]
            js_file   = next((f for f in files if f.endswith(".js")), files[0])
            files_js  = "[" + ",".join(f'"{f}"' for f in files) + "]"
            hide_hud  = "!0" if iface.get("hideHud")  else "!1"
            hide_chat = "!0" if iface.get("hideChat") else "!1"
            ld_parts.append(
                f'{name}:f(()=>d(()=>import("./{js_file}"),{files_js},import.meta.url))'
            )
            ud_parts.append(
                f'{name}:{{open:{{status:!1}},show:!0,options:{{hideHud:{hide_hud},hideChat:{hide_chat}}}}}'
            )
        return (
            f'Object.assign(ld,{{{",".join(ld_parts)}}});'
            f'Object.assign(ud,{{{",".join(ud_parts)}}});'
        )

    def _deploy_custom_ui_files(self, ifaces: list):
        """Скачивает ГОТОВЫЕ файлы-лоадеры из папки Загрузчики/ на GitHub и
        кладёт их в assets/ под именами реальных интерфейсов (zkm.js, MvdMenu.js
        и т.п. из реестра IntLoad.js). Сами лоадеры — самодостаточные XHR+eval
        обёртки, которые в игре подтягивают актуальный код интерфейсов с GitHub
        из MVD AHK/Кастом Интерфейсы/. Правка логики лоадера = правка файла в
        Загрузчики/ на GitHub, переустановка/пересборка не нужна.
        Список интерфейсов и их файлов берётся из реестра IntLoad.js — менять .py не нужно."""
        if not self.radmir_path:
            return
        assets_dir = self.radmir_path / "uiresources" / "assets"
        if not assets_dir.exists():
            return

        for iface in ifaces:
            name = iface.get("name")
            files = iface.get("files", [])
            js_file = next((f for f in files if f.endswith(".js")), None)
            css_file = next((f for f in files if f.endswith(".css")), None)
            if not name or not js_file:
                continue

            # ── JS-лоадер ──
            try:
                url = f"{LOADERS_URL}/{js_file}"
                resp = requests.get(url, timeout=20)
                resp.raise_for_status()
                (assets_dir / js_file).write_bytes(resp.content)
                print(f'[Installer] Лоадер скачан: {js_file} → assets/')
            except Exception as e:
                print(f'[Installer] Не удалось скачать лоадер {js_file} из Загрузчики/: {e}')
                continue

            # ── CSS-плейсхолдер (нужен только чтобы CEF не падал на preload;
            # реальные стили подтягивает сам {js_file} с GitHub в рантайме) ──
            if css_file:
                url = f"{LOADERS_URL}/{css_file}"
                last_err = None
                downloaded = False
                for attempt in range(3):
                    try:
                        resp = requests.get(url, timeout=20)
                        resp.raise_for_status()
                        if not resp.content.strip():
                            raise ValueError("пустой ответ от GitHub")
                        (assets_dir / css_file).write_bytes(resp.content)
                        print(f'[Installer] CSS скачан: {css_file} → assets/ (попытка {attempt + 1})')
                        downloaded = True
                        break
                    except Exception as e:
                        last_err = e
                        print(f'[Installer] Попытка {attempt + 1}/3 скачать {css_file} не удалась: {e}')
                        if attempt < 2:
                            time.sleep(1.5)
                if not downloaded:
                    print(f'[Installer] Не удалось скачать {css_file} после 3 попыток ({last_err}), создаю локально')
                    placeholder = "/* placeholder — реальные стили подгружаются динамически из %s (с GitHub) */\n" % js_file
                    (assets_dir / css_file).write_text(placeholder, encoding='utf-8', newline='\n')

    def select_folder(self):
        r = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory='/', allow_multiple=False)
        if not r or not len(r):
            return None
        chosen = Path(r[0])
        # Папка обязана называться RADMIR CRMP (регистр не важен)
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
                # Читаем реестр интерфейсов из IntLoad.js на GitHub
                ifaces = self._fetch_custom_interfaces()
                # Скачиваем/обновляем файлы кастомных интерфейсов в assets/
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
            # ── Скрытые пункты меню ─────────────────────────────────────
            hidden_list = menu_hidden if isinstance(menu_hidden, list) else []
            hidden_json = json.dumps(hidden_list)
            code = code.replace('const MENU_HIDDEN_ITEMS = [];', f'const MENU_HIDDEN_ITEMS = {hidden_json};')
            # ── Биндинги пунктов меню ────────────────────────────────────
            binds_dict = {k: v for k, v in (menu_binds or {}).items() if v}
            binds_json = json.dumps(binds_dict, ensure_ascii=False)
            code = code.replace('const MENU_BINDS = {};', f'const MENU_BINDS = {binds_json};')
            # ── Порядок пунктов меню ─────────────────────────────────────
            order_list = menu_order if isinstance(menu_order, list) and menu_order else []
            order_json = json.dumps(order_list)
            code = code.replace('const MENU_ORDER = [];', f'const MENU_ORDER = {order_json};')
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
            # Блок регистрации кастомных интерфейсов — вставляется СНАРУЖИ обфускации,
            # потому что ld/ud/f/d — переменные скоупа бандла Index.js, недоступны внутри IIFE.
            # Генерируется динамически из window._duranCustomInterfaces в IntLoad.js.
            interfaces_block = self._build_interfaces_block(ifaces)
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

    def open_url(self, url):
        import webbrowser
        webbrowser.open(url)


def main():
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
    try:
        webview.start(icon=_ICON_PATH if os.path.exists(_ICON_PATH) else None, debug=False)
    except TypeError:
        webview.start(debug=False)
    try: os.unlink(html_tmp)
    except: pass
