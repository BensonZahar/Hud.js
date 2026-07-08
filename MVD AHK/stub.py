# stub.py — компилируется в EXE, никогда не меняется
import sys, os, time, base64
import requests

# URL собран из частей + base64, чтобы не светиться прямой строкой в strings/дампе exe.
# Это НЕ надёжная защита от реверса (пропатчить exe или прогнать через отладчик
# всё равно можно), но убирает URL из тривиального просмотра строк и из диалога ошибки.
_PARTS_PRIMARY = (
    "aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29t",              # https://raw.githubusercontent.com
    "L0JlbnNvblphaGFyL0h1ZC5qcy9tYWluL01WRCUyMEFISw==",          # /BensonZahar/Hud.js/main/MVD%20AHK
)
# Резервное зеркало на случай, если raw.githubusercontent.com подвиснет на TLS-хендшейке
# (частая история с GitHub-инфраструктурой из РФ). jsDelivr — другой CDN, обычно доступен,
# когда сам GitHub подтормаживает. Может отдавать слегка устаревшую версию (кеш до ~ суток),
# но это лучше, чем полный отказ запуска.
_PARTS_FALLBACK = (
    "aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL0JlbnNvblphaGFyL0h1ZC5qc0BtYWlu",  # https://cdn.jsdelivr.net/gh/BensonZahar/Hud.js@main
    "L01WRCUyMEFISw==",                                                     # /MVD%20AHK
)


def _decode(parts) -> str:
    return "".join(base64.b64decode(p).decode() for p in parts)


def _fetch_code() -> str:
    fname = "ahk_mvd_installer.py"
    primary = f"{_decode(_PARTS_PRIMARY)}/{fname}?v={int(time.time())}"
    fallback = f"{_decode(_PARTS_FALLBACK)}/{fname}"

    # (url, (connect_timeout, read_timeout))
    attempts = [
        (primary, (10, 20)),   # 1-я попытка, основной источник
        (primary, (10, 25)),   # 2-я попытка, чуть больше времени на хендшейк
        (fallback, (10, 20)),  # 3-я попытка — резервный CDN
    ]

    last_exc = None
    for url, timeout in attempts:
        try:
            resp = requests.get(url, timeout=timeout)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            last_exc = e
            time.sleep(1.5)
    raise last_exc


def _log_dir() -> str:
    d = os.path.join(os.environ.get("APPDATA", "."), "AHK_MVD")
    os.makedirs(d, exist_ok=True)
    return d


def _log_error(stage: str) -> None:
    try:
        import traceback
        with open(os.path.join(_log_dir(), "error.log"), "a", encoding="utf-8") as f:
            f.write(f"\n--- {stage} error ({time.strftime('%Y-%m-%d %H:%M:%S')}) ---\n")
            traceback.print_exc(file=f)
    except Exception:
        pass  # логирование не должно ронять программу


def _fatal(msg: str) -> None:
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Ошибка запуска", msg)
    except Exception:
        pass
    sys.exit(1)


def main():
    # Этап 1: загрузка кода. Никогда не показываем str(e) пользователю —
    # исключения requests часто содержат сам URL в тексте.
    try:
        code = _fetch_code()
    except Exception:
        _log_error("fetch")
        _fatal(
            "Не удалось загрузить компоненты.\n"
            "Проверьте подключение к интернету и повторите попытку.\n"
            f"Подробности: %APPDATA%\\AHK_MVD\\error.log"
        )
        return

    # Этап 2: выполнение загруженного кода. Ошибки здесь — это баги в
    # ahk_mvd_installer.py, а не сбой сети, поэтому сообщение отдельное.
    try:
        icon_path = ""
        if getattr(sys, "_MEIPASS", None):
            icon_path = os.path.join(sys._MEIPASS, "icon.ico")

        namespace = {
            "__name__": "__main__",
            "__file__": "ahk_mvd_installer.py",
            "_ICON_PATH": icon_path,
        }
        exec(compile(code, "ahk_mvd_installer.py", "exec"), namespace)
    except Exception:
        _log_error("exec")
        _fatal(
            "Ошибка запуска компонентов.\n"
            "Попробуйте переустановить приложение.\n"
            f"Подробности: %APPDATA%\\AHK_MVD\\error.log"
        )


if __name__ == "__main__":
    main()