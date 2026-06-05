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
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#141414;color:#f4f1e1;font-family:'Segoe UI',sans-serif;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  height:100vh;gap:10px;-webkit-app-region:drag;user-select:none}}
img{{width:48px;height:48px;border-radius:10px}}
h2{{font-size:15px;font-weight:700}}
p{{font-size:11px;opacity:.5;text-align:center;line-height:1.6;max-width:340px}}
.label{{font-size:9px;opacity:.35;letter-spacing:.06em;text-transform:uppercase;
  align-self:flex-start;margin-left:30px;margin-bottom:-4px}}
.copy-box{{
  width:380px;background:#1a1a1a;
  border:.5px solid rgba(244,241,225,.12);border-radius:6px;
  padding:9px 14px;font-family:Consolas,monospace;font-size:11px;
  color:#e8e4d0;cursor:pointer;word-break:break-all;
  -webkit-app-region:no-drag;transition:background .15s;position:relative
}}
.copy-box:hover{{background:#222}}
.badge{{position:absolute;right:10px;top:50%;transform:translateY(-50%);
  font-size:9px;opacity:.35;pointer-events:none}}
.tg-link{{font-size:11px;color:#0d73fd;text-decoration:none;opacity:.85;
  -webkit-app-region:no-drag}}
.tg-link:hover{{opacity:1;text-decoration:underline}}
button{{padding:8px 28px;background:#474747;border:none;color:#f4f1e1;
  border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;
  -webkit-app-region:no-drag;transition:background .2s;margin-top:4px}}
button:hover{{background:#555}}
</style></head><body>
{'<img src="'+icon_src+'">' if icon_src else ''}
<h2>Нет доступа</h2>
<p>Ваш ПК не авторизован. Напишите создателю<br>и отправьте строку ниже для получения доступа.</p>
<div class="label">Скопируйте и отправьте создателю</div>
<div class="copy-box" onclick="copyKeys()">
  {keys_line},
  <span class="badge" id="badge">копировать</span>
</div>
<p>Написать создателю:<br>
<a class="tg-link" href="https://t.me/ZaharKonst"
   onclick="window.pywebview&&pywebview.api&&pywebview.api.open_url('https://t.me/ZaharKonst');return false;">@ZaharKonst</a></p>
<button onclick="window.pywebview.api.close_app()">Закрыть</button>
<script>
var _txt = `{keys_line},`;
function copyKeys(){{
  navigator.clipboard&&navigator.clipboard.writeText(_txt);
  var b=document.getElementById('badge');
  b.textContent='скопировано ✓'; b.style.opacity='1'; b.style.color='#3fb950';
  setTimeout(function(){{b.textContent='копировать';b.style.opacity='.35';b.style.color='';}},2000);
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
    w = webview.create_window('AHK MVD Installer',
        f"file:///{tmp.name.replace(os.sep, '/')}",
        js_api=api, width=440, height=360,
        frameless=True, background_color='#141414'
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
<style>*{margin:0;padding:0}body{background:#141414;color:#f4f1e1;
font-family:sans-serif;display:flex;flex-direction:column;align-items:center;
justify-content:center;height:100vh;gap:10px;-webkit-app-region:drag}
h2{font-size:14px}p{font-size:11px;opacity:.5}
button{padding:8px 20px;background:#ea4f3d;border:none;color:#fff;
border-radius:4px;cursor:pointer;font-size:11px;-webkit-app-region:no-drag}
</style></head><body>
<h2>⚠ Нет подключения</h2><p>Требуется интернет для запуска</p>
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