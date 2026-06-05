import os, sys, base64, hashlib, socket, threading
import winreg, requests
from PIL import Image
import io

# ═══════════════════════════════════════════════════════
#  НАСТРОЙКИ — заполни перед сборкой
# ═══════════════════════════════════════════════════════
TG_TOKEN   = "8910294348:AAF7tj7TyI7F2cTsUECbE3010NlsfL4-xLI"
TG_CHAT_ID = "1046461621"

GITHUB_RAW = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
KEYS_URL   = f"{GITHUB_RAW}/keys.json"
MAIN_URL   = f"{GITHUB_RAW}/ahk_mvd_installer.py"
# ═══════════════════════════════════════════════════════


def resource_path(rel):
    base = getattr(sys, '_MEIPASS', os.path.abspath('.'))
    return os.path.join(base, rel)


# ── Получить HWID (хэш MachineGuid) ──────────────────
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


def get_device_name() -> str:
    return os.getenv("COMPUTERNAME", socket.gethostname())


def get_ip() -> str:
    try:
        return requests.get("https://api.ipify.org", timeout=5).text.strip()
    except Exception:
        return "Нет доступа"


def get_windows_version() -> str:
    try:
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                             r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
        product_name, _ = winreg.QueryValueEx(key, "ProductName")
        try:
            display_version, _ = winreg.QueryValueEx(key, "DisplayVersion")
        except Exception:
            display_version = ""
        try:
            build_number, _ = winreg.QueryValueEx(key, "CurrentBuildNumber")
        except Exception:
            build_number = ""
        winreg.CloseKey(key)
        parts = [product_name]
        if display_version:
            parts.append(display_version)
        if build_number:
            parts.append(f"(Build {build_number})")
        return " ".join(parts)
    except Exception:
        import platform
        return platform.platform()


# ── Отправить в Telegram (в фоне, не блокирует) ───────
def send_telegram(hwid: str, device: str, ip: str, authorized: bool):
    def _send():
        status  = "✅ Авторизован" if authorized else "❌ Не авторизован"
        win_ver = get_windows_version()
        # Готовая строка для вставки в keys.json (новый формат)
        keys_line = f'"{hwid}": {{"device": "{device}", "note": ""}}'
        text = (
            f"🚀 <b>AHK MVD Installer — запуск</b>\n\n"
            f"💻 <b>Устройство:</b> {device}\n"
            f"🖥 <b>Windows:</b> {win_ver}\n"
            f"🆔 <b>HWID:</b> <code>{hwid}</code>\n"
            f"🌐 <b>IP:</b> {ip}\n"
            f"🔑 <b>Статус:</b> {status}\n\n"
            f"━━━━━━━━━━━━━━━━━━━━\n"
            f"📋 <b>Вставить в keys.json:</b>\n"
            f"<code>{keys_line},</code>\n"
            f"<i>(device — оставь пустым чтобы не проверять имя ПК)</i>"
        )
        try:
            requests.post(
                f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage",
                json={"chat_id": TG_CHAT_ID, "text": text, "parse_mode": "HTML"},
                timeout=8
            )
        except Exception:
            pass
    t = threading.Thread(target=_send, daemon=False)
    t.start()
    t.join(timeout=10)


# ── Проверить ключ в keys.json на GitHub ──────────────
# keys.json формат:
# {
#   "HWID": { "device": "ИМЯ_ПК", "note": "комментарий" },
#   ...
# }
# Если "device" пустая строка — проверка по имени устройства не выполняется.
def is_authorized(hwid: str) -> bool:
    try:
        resp = requests.get(KEYS_URL, timeout=10)
        resp.raise_for_status()
        keys = resp.json()
        if hwid not in keys:
            return False
        entry = keys[hwid]
        # Поддержка старого формата {"HWID": "Ник"}
        if isinstance(entry, str):
            return True
        # Новый формат {"HWID": {"device": "...", "note": "..."}}
        allowed_device = entry.get("device", "")
        if allowed_device and allowed_device.strip():
            return get_device_name().lower() == allowed_device.strip().lower()
        return True                 # device пустой — только HWID
    except Exception:
        return False                # нет инета / ошибка → блокируем


# ── Иконка для webview ────────────────────────────────
def get_icon_b64() -> str:
    try:
        img = Image.open(resource_path("icon.ico")).convert("RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


# ── Окно "нет доступа" ────────────────────────────────
def show_denied_window(hwid: str):
    import webview, tempfile
    icon_b64 = get_icon_b64()
    icon_src = f"data:image/png;base64,{icon_b64}" if icon_b64 else ""
    device   = get_device_name()
    keys_line = f'"{hwid}": {{"device": "{device}", "note": ""}}'

    html = f"""<!DOCTYPE html><html><head><meta charset='UTF-8'>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
:root{{
  --bg:#0a0b0d;--bg2:#0f1114;--bg3:#161920;--bg4:#1c2028;
  --border:#ffffff0d;--border2:#ffffff18;--border3:#ffffff28;
  --txt:#e8eaf0;--txt2:rgba(232,234,240,.55);--txt3:rgba(232,234,240,.28);
  --red:#ef4444;--red2:rgba(239,68,68,.08);--red3:rgba(239,68,68,.2);
  --acc:#3b82f6;
  --font-d:'Rajdhani',sans-serif;--font-m:'JetBrains Mono',monospace;--font-b:'Inter',sans-serif;
}}
html,body{{width:100%;height:100%;overflow:hidden;background:var(--bg)}}
body{{font-family:var(--font-b);color:var(--txt);display:flex;align-items:center;justify-content:center;
  -webkit-app-region:drag;user-select:none}}
body::before{{content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity:.025;pointer-events:none;z-index:0}}
.shell{{
  position:relative;z-index:1;width:420px;
  background:var(--bg2);border-radius:6px;
  border:1px solid var(--border2);
  box-shadow:0 0 0 1px var(--border),0 32px 80px rgba(0,0,0,.8),0 0 40px rgba(239,68,68,.04);
  overflow:hidden;-webkit-app-region:no-drag;
  display:flex;flex-direction:column;
}}
.shell::before{{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--red) 40%,var(--red) 60%,transparent);
  opacity:.6;z-index:10;pointer-events:none}}
.titlebar{{height:36px;display:flex;align-items:center;padding:0 14px;gap:8px;
  border-bottom:1px solid var(--border);background:rgba(10,11,13,.6);
  backdrop-filter:blur(8px);-webkit-app-region:drag;flex-shrink:0}}
.tb-ico{{width:16px;height:16px;display:flex;align-items:center;justify-content:center}}
.tb-ico svg{{width:13px;height:13px;fill:none;stroke:var(--red);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}}
.tb-title{{font-family:var(--font-d);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;flex:1}}
.btn-close{{width:20px;height:20px;border-radius:3px;border:none;background:transparent;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:var(--txt3);transition:all .15s;-webkit-app-region:no-drag}}
.btn-close:hover{{background:rgba(239,68,68,.15);color:var(--red)}}
.btn-close svg{{width:9px;height:9px;stroke:currentColor;stroke-width:2.5;fill:none;stroke-linecap:round}}
.body{{padding:22px 22px 20px;display:flex;flex-direction:column;gap:14px}}
.icon-wrap{{display:flex;align-items:center;gap:12px}}
.icon-wrap img{{width:42px;height:42px;border-radius:8px;flex-shrink:0;border:1px solid var(--border2)}}
.icon-text h2{{font-family:var(--font-d);font-size:20px;font-weight:700;letter-spacing:.04em;color:var(--txt);line-height:1}}
.icon-text p{{font-size:11px;color:var(--txt2);margin-top:4px;line-height:1.55}}
.divider{{height:1px;background:var(--border);margin:0 -22px}}
.lbl{{font-family:var(--font-m);font-size:9px;color:var(--txt3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px}}
.copy-box{{
  background:var(--bg);border:1px solid var(--border2);border-radius:3px;
  padding:10px 12px;font-family:var(--font-m);font-size:10px;color:var(--txt);
  cursor:pointer;word-break:break-all;-webkit-app-region:no-drag;
  transition:border .15s,background .15s;position:relative;line-height:1.5
}}
.copy-box:hover{{background:var(--bg3);border-color:var(--border3)}}
.copy-badge{{
  position:absolute;right:10px;top:50%;transform:translateY(-50%);
  font-size:9px;color:var(--txt3);font-family:var(--font-m);letter-spacing:.06em;
  pointer-events:none;transition:all .2s
}}
.footer{{display:flex;align-items:center;justify-content:space-between;gap:8px}}
.tg-wrap{{font-size:11px;color:var(--txt2)}}
.tg-link{{color:var(--acc);text-decoration:none;font-family:var(--font-m);font-size:11px;cursor:pointer;-webkit-app-region:no-drag}}
.tg-link:hover{{text-decoration:underline}}
.btn-close-main{{
  height:32px;padding:0 20px;border:none;border-radius:3px;cursor:pointer;
  font-size:11px;font-weight:700;font-family:var(--font-d);letter-spacing:.08em;text-transform:uppercase;
  background:var(--bg3);color:var(--txt2);border:1px solid var(--border2);
  transition:all .15s;-webkit-app-region:no-drag
}}
.btn-close-main:hover{{background:var(--bg4);color:var(--txt);border-color:var(--border3)}}
</style></head><body>
<div class="shell">
  <div class="titlebar">
    <div class="tb-ico">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <span class="tb-title">AHK &nbsp;MVD &nbsp;—&nbsp; Нет доступа</span>
    <button class="btn-close" onclick="window.pywebview.api.close_app()">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="body">
    <div class="icon-wrap">
      {'<img src="'+icon_src+'">' if icon_src else ''}
      <div class="icon-text">
        <h2>Нет доступа</h2>
        <p>Ваш ПК не авторизован.<br>Отправьте строку ниже создателю для получения доступа.</p>
      </div>
    </div>
    <div class="divider"></div>
    <div>
      <div class="lbl">Скопируйте и отправьте создателю</div>
      <div class="copy-box" onclick="copyKeys()" id="copybox">
        {keys_line},
        <span class="copy-badge" id="badge">копировать</span>
      </div>
    </div>
    <div class="footer">
      <div class="tg-wrap">
        Написать: <a class="tg-link"
          onclick="window.pywebview&&pywebview.api&&pywebview.api.open_url('https://t.me/ZaharKonst');return false;"
          href="#">@ZaharKonst</a>
      </div>
      <button class="btn-close-main" onclick="window.pywebview.api.close_app()">Закрыть</button>
    </div>
  </div>
</div>
<script>
var _txt = `{keys_line},`;
function copyKeys(){{
  navigator.clipboard&&navigator.clipboard.writeText(_txt);
  var b=document.getElementById('badge');
  b.textContent='скопировано ✓';b.style.color='#22c55e';b.style.opacity='1';
  setTimeout(function(){{b.textContent='копировать';b.style.color='';b.style.opacity='';}},2000);
}}
</script>
</body></html>"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()

    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
        def open_url(self, url):
            import webbrowser
            webbrowser.open(url)
    api = _Q()
    w = webview.create_window('AHK MVD — Нет доступа',
        f"file:///{tmp.name.replace(os.sep, '/')}",
        js_api=api, width=440, height=290,
        frameless=True, background_color='#0a0b0d'
    )
    api._window = w
    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass


# ── Окно "нет интернета" ──────────────────────────────
def show_error_window():
    import webview, tempfile
    html = """<!DOCTYPE html><html><head><meta charset='UTF-8'>
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=JetBrains+Mono:wght@400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0a0b0d;--bg2:#0f1114;--bg3:#161920;
  --border:#ffffff0d;--border2:#ffffff18;--border3:#ffffff28;
  --txt:#e8eaf0;--txt2:rgba(232,234,240,.55);--txt3:rgba(232,234,240,.28);
  --amber:#f59e0b;
  --font-d:'Rajdhani',sans-serif;--font-m:'JetBrains Mono',monospace;--font-b:'Inter',sans-serif;
}
html,body{width:100%;height:100%;overflow:hidden;background:var(--bg)}
body{font-family:var(--font-b);color:var(--txt);display:flex;align-items:center;justify-content:center;
  -webkit-app-region:drag;user-select:none}
body::before{content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity:.025;pointer-events:none;z-index:0}
.shell{
  position:relative;z-index:1;width:360px;
  background:var(--bg2);border-radius:6px;
  border:1px solid var(--border2);
  box-shadow:0 0 0 1px var(--border),0 24px 60px rgba(0,0,0,.8);
  overflow:hidden;-webkit-app-region:no-drag;display:flex;flex-direction:column;
}
.shell::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--amber) 40%,var(--amber) 60%,transparent);
  opacity:.6;z-index:10;pointer-events:none}
.titlebar{height:36px;display:flex;align-items:center;padding:0 14px;gap:8px;
  border-bottom:1px solid var(--border);background:rgba(10,11,13,.6);
  backdrop-filter:blur(8px);-webkit-app-region:drag;flex-shrink:0}
.tb-ico svg{width:13px;height:13px;fill:none;stroke:var(--amber);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.tb-title{font-family:var(--font-d);font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;flex:1}
.btn-close{width:20px;height:20px;border-radius:3px;border:none;background:transparent;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:var(--txt3);transition:all .15s;-webkit-app-region:no-drag}
.btn-close:hover{background:rgba(239,68,68,.15);color:#ef4444}
.btn-close svg{width:9px;height:9px;stroke:currentColor;stroke-width:2.5;fill:none;stroke-linecap:round}
.body{padding:22px;display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center}
.icon-ring{width:44px;height:44px;border-radius:50%;background:rgba(245,158,11,.08);
  border:1px solid rgba(245,158,11,.2);display:flex;align-items:center;justify-content:center}
.icon-ring svg{width:20px;height:20px;fill:none;stroke:var(--amber);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
h2{font-family:var(--font-d);font-size:18px;font-weight:700;letter-spacing:.04em}
p{font-size:11px;color:var(--txt2);line-height:1.6;max-width:280px}
.btn-ok{height:32px;padding:0 24px;border:none;border-radius:3px;cursor:pointer;
  font-size:11px;font-weight:700;font-family:var(--font-d);letter-spacing:.08em;text-transform:uppercase;
  background:var(--bg3);color:var(--txt2);border:1px solid var(--border2);
  transition:all .15s;-webkit-app-region:no-drag}
.btn-ok:hover{background:#1c2028;color:var(--txt);border-color:var(--border3)}
</style></head><body>
<div class="shell">
  <div class="titlebar">
    <div class="tb-ico">
      <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div>
    <span class="tb-title">AHK &nbsp;MVD &nbsp;—&nbsp; Ошибка</span>
    <button class="btn-close" onclick="window.pywebview.api.close_app()">
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
  <div class="body">
    <div class="icon-ring">
      <svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
    </div>
    <h2>Нет подключения</h2>
    <p>Для запуска требуется подключение к интернету.<br>Проверьте соединение и попробуйте снова.</p>
    <button class="btn-ok" onclick="window.pywebview.api.close_app()">Закрыть</button>
  </div>
</div>
</body></html>"""
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()
    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
    api = _Q()
    w = webview.create_window('AHK MVD — Ошибка',
        f"file:///{tmp.name.replace(os.sep,'/')}",
        js_api=api, width=380, height=230,
        frameless=True, background_color='#0a0b0d')
    api._window = w
    ico = resource_path("icon.ico")
    try: webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError: webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass


# ── Main ──────────────────────────────────────────────
def main():
    hwid   = get_hwid()
    device = get_device_name()
    ip     = get_ip()

    # 1. Проверяем авторизацию
    try:
        authorized = is_authorized(hwid)
    except Exception:
        show_error_window()
        return

    # 2. Уведомляем в Telegram (в фоне, не блокирует запуск)
    send_telegram(hwid, device, ip, authorized)

    # 3. Если не авторизован — показываем экран с ключом
    if not authorized:
        show_denied_window(hwid)
        return

    # 4. Авторизован — скачиваем и запускаем основной код
    try:
        code = requests.get(MAIN_URL, timeout=15).text
    except Exception:
        show_error_window()
        return

    icon_b64  = get_icon_b64()
    icon_path = resource_path("icon.ico")

    ns = {"_ICON_B64": icon_b64, "_ICON_PATH": icon_path}
    exec(compile(code, 'ahk_mvd_installer.py', 'exec'), ns)
    ns['main']()


if __name__ == '__main__':
    main()