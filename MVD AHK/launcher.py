import os, sys, base64, hashlib, threading, time
import winreg, requests
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
import io

# ═══════════════════════════════════════════════════════
#  НАСТРОЙКИ — заполни перед сборкой
# ═══════════════════════════════════════════════════════
GITHUB_RAW  = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
KEYS_URL    = f"{GITHUB_RAW}/keys.json"
MAIN_URL    = f"{GITHUB_RAW}/ahk_mvd_installer.py"
RETRY_COUNT = 5   # сколько раз пробовать подключиться
RETRY_DELAY = 4   # секунд между попытками
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
    """Бросает исключение при сетевой ошибке. False = ключ не найден."""
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


# ── Окно загрузки с retry ─────────────────────────────
def run_auth_with_ui(hwid: str) -> dict:
    """
    Показывает окно загрузки, делает до RETRY_COUNT попыток авторизации.
    Возвращает {"authorized": bool|None, "code": str|None, "failed": bool}
    """
    import webview, tempfile

    result      = {"authorized": None, "code": None, "failed": False}
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
                # Параллельно скачиваем основной скрипт если авторизован
                code = None
                if authorized:
                    js("Загрузка установщика...")
                    r = requests.get(MAIN_URL, timeout=15)
                    r.raise_for_status()
                    code = r.text
                result["authorized"] = authorized
                result["code"]       = code
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

    w.events.loaded += _on_loaded

    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)

    return result


# ── Окно "нет доступа" ────────────────────────────────
def show_denied_window(hwid: str):
    import webview, tempfile
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
    b.textContent='скопировано \u2713';b.style.color='#3dba7a';
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


# ── Main ──────────────────────────────────────────────
def main():
    hwid   = get_hwid()
    result = run_auth_with_ui(hwid)

    if result["failed"]:
        # Все попытки исчерпаны — нет интернета
        # Показываем простое окно с сообщением (без webview зависимостей здесь)
        import webview, tempfile
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
        return

    if not result["authorized"]:
        show_denied_window(hwid)
        return

    icon_b64  = get_icon_b64()
    icon_path = resource_path("icon.ico")
    ns = {"_ICON_B64": icon_b64, "_ICON_PATH": icon_path}
    exec(compile(result["code"], 'ahk_mvd_installer.py', 'exec'), ns)
    ns['main']()


if __name__ == '__main__':
    main()
