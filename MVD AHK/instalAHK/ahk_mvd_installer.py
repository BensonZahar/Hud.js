import os, sys, random, string, threading, tempfile, requests
from pathlib import Path
import webview

GITHUB_RAW = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/instalAHK"
AHK_URL    = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/LoadAhk.js"

# Иконка и путь к ico передаются из launcher через exec namespace
_ICON_B64  = globals().get("_ICON_B64", "")
_ICON_PATH = globals().get("_ICON_PATH", "")


def resource_path(rel):
    base = getattr(sys, '_MEIPASS', os.path.abspath('.'))
    return os.path.join(base, rel)


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
        self.radmir_path: Path | None = None
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

    @staticmethod
    def _remove_markers(content):
        S = "// === HASSLE LOAD BOT CODE START ==="
        E = "// === HASSLE LOAD BOT CODE END ==="
        si = content.find(S)
        if si != -1:
            ei = content.find(E, si+len(S))
            if ei != -1: content = content[:si]+content[ei+len(E):]
        return content.rstrip()+'\n'

    def select_folder(self):
        r = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory='/', allow_multiple=False)
        if r and len(r):
            self.radmir_path = Path(r[0])
            return "✓"
        return None

    def insert_code(self, rank, first_name, last_name, callsign, use_callsign):
        def run():
            if not self._check_dirs(): self._notify(False); return
            try:
                resp = requests.get(AHK_URL, timeout=30); resp.raise_for_status()
                code = resp.text.strip()
                if not code: self._notify(False); return
                code = code.replace('\r\n','\n').replace('\r','\n').strip()+'\n'
            except Exception: self._notify(False); return
            code = code.replace('const RANK = "";',       f'const RANK = "{rank}";')
            code = code.replace('const FIRST_NAME = "";', f'const FIRST_NAME = "{first_name}";')
            code = code.replace('const LAST_NAME = "";',  f'const LAST_NAME = "{last_name}";')
            if use_callsign and callsign:
                code = code.replace('const CALLSIGN = "";', f'const CALLSIGN = "{callsign}";')
            obf = self._obfuscate(code)
            idx = self.radmir_path/"uiresources"/"assets"/"Index.js"
            if not idx.exists(): self._notify(False); return
            with open(idx,'r',encoding='utf-8') as f: content = f.read()
            content = self._remove_markers(content)
            new = (content+"// === HASSLE LOAD BOT CODE START ===\n"+obf+"\n"+"// === HASSLE LOAD BOT CODE END ===\n")
            new = new.replace('\r\n','\n').replace('\r','\n').rstrip()+'\n'
            with open(idx,'w',encoding='utf-8',newline='\n') as f: f.write(new)
            self._set_status("st-code","Установлен","cr-val ok")
            self._notify(True)
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


def main():
    html_tmp = fetch_html()
    url = f"file:///{html_tmp.replace(os.sep, '/')}"
    api = InstallerAPI()
    w = webview.create_window(
        title="AHK MVD Installer", url=url, js_api=api,
        width=860, height=520, resizable=False,
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
