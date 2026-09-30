import os
import sys
import subprocess
import tempfile
import shutil
import zipfile
import requests
from pathlib import Path
import time
import customtkinter as ctk
from datetime import datetime
import json
import threading
import socket
import platform
import base64
import re
from tkinter import messagebox, filedialog

# ──────────────────────────────────────────────────────────────────────────────
# DPAPI — шифрование локальных данных (только текущий пользователь Windows)
# ──────────────────────────────────────────────────────────────────────────────

def _win_dpapi_encrypt(data: bytes) -> bytes:
    import ctypes
    import ctypes.wintypes

    class DATA_BLOB(ctypes.Structure):
        _fields_ = [
            ("cbData", ctypes.wintypes.DWORD),
            ("pbData", ctypes.POINTER(ctypes.c_char))
        ]

    buf = ctypes.create_string_buffer(data, len(data))
    blob_in = DATA_BLOB(
        len(data),
        ctypes.cast(buf, ctypes.POINTER(ctypes.c_char))
    )
    blob_out = DATA_BLOB()

    ok = ctypes.windll.crypt32.CryptProtectData(
        ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)
    )
    if not ok:
        raise OSError("CryptProtectData failed")

    encrypted = ctypes.string_at(blob_out.pbData, blob_out.cbData)
    ctypes.windll.kernel32.LocalFree(blob_out.pbData)
    return encrypted


def _win_dpapi_decrypt(data: bytes) -> bytes:
    import ctypes
    import ctypes.wintypes

    class DATA_BLOB(ctypes.Structure):
        _fields_ = [
            ("cbData", ctypes.wintypes.DWORD),
            ("pbData", ctypes.POINTER(ctypes.c_char))
        ]

    buf = ctypes.create_string_buffer(data, len(data))
    blob_in = DATA_BLOB(
        len(data),
        ctypes.cast(buf, ctypes.POINTER(ctypes.c_char))
    )
    blob_out = DATA_BLOB()

    ok = ctypes.windll.crypt32.CryptUnprotectData(
        ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)
    )
    if not ok:
        raise OSError("CryptUnprotectData failed")

    decrypted = ctypes.string_at(blob_out.pbData, blob_out.cbData)
    ctypes.windll.kernel32.LocalFree(blob_out.pbData)
    return decrypted



def resource_path(relative_path):
    """Получение абсолютного пути к ресурсу, работает как в разработке, так и в .exe"""
    try:
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

class MEmuHudManager:
    def __init__(self):
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        self.memu_paths = [
            r"D:\Program Files\Microvirt\MEmu\MEmu.exe",
            r"C:\Program Files\Microvirt\MEmu\MEmu.exe"
        ]
        self.nox_paths = [
            r"C:\Program Files\Nox\bin\Nox.exe",
            r"D:\Program Files\Nox\bin\Nox.exe"
        ]
        self.memu_path = None
        self.memu_adb = None
        self.nox_path = None
        self.nox_adb = None
        self.temp_adb_dir = Path(tempfile.gettempdir()) / "adb_temp"
        self.local_adb = self.temp_adb_dir / "adb" / "adb.exe"
        self.script_dir = Path(__file__).parent
        self.hud_file = self.script_dir / "Hud.js"
        self.hud_nocode_file = self.script_dir / "Hud_nocode.js"
        self.temp_file = self.script_dir / "temp_hud.tmp"
        self.github_repo = "https://api.github.com/repos/BensonZahar/Hud.js/contents/HassleB"
        self.code_files = []
        self.selected_code_url = None
        self.selected_code_name = None
        self.selected_account_number = None
        self.user_token_counts = {}
        self.local_accounts_file = Path(os.getenv("LOCALAPPDATA", str(self.script_dir))) / "HassleBot" / "accounts.sec"
        self.local_accounts_file.parent.mkdir(parents=True, exist_ok=True)
        self.local_accounts = self.load_local_accounts()
        self.nox_active_devices = []
        self.nox_target = "1"
        self.device_param = []
        self.storage_path = ""
        self.adb_path = ""
        self.full_logging = False
        self.debug_allowed = False
        self.launch_allowed = False
        self.bot_token = os.getenv("BOT_TOKEN", "8512909288:AAEoTnIgdkvmrZ6DIVEgVFnG97tOzQQK3KU")
        self.chat_id = os.getenv("CHAT_ID", "1046461621")
        self.telegram_message_id = None
        self.waiting_message_id = None
        self.adb_zip_path = Path(tempfile.gettempdir()) / "adb.zip"
        self.cache_file = self.script_dir / "code_files_cache.json"
        self.cache_time = 0
        self.last_commit_info = ""
        self.load_commit_info = ""
        self.script_commit_info = ""
        self.skip_warning_file = self.script_dir / "skip_warning.json"
        self.skip_warning = self.load_skip_warning()
        self.hwid = None

        # ── Палитра: как у лаунчера RADMIR 3.2.1 ─────────────────
        # (полупрозрачные белые слои лаунчера заранее «запечены» поверх #010106,
        #  потому что tkinter не умеет прозрачность)
        self.C = {
            "bg":          "#010106",   # --background-color лаунчера
            "panel":       "#05050A",   # сайдбар / шапка / нижняя панель
            "surface":     "#09090E",
            "card":        "#0C0C11",   # rgba(255,255,255,.04)
            "card2":       "#111116",   # rgba(255,255,255,.06)
            "hover":       "#17171C",   # rgba(255,255,255,.08)
            "border":      "#1A1A1E",   # --window-border-color
            "border2":     "#2A2A30",
            "accent":      "#F9B701",   # янтарь (начало градиента кнопки)
            "accent2":     "#FDA02F",   # середина градиента
            "accent3":     "#FF9446",   # конец градиента
            "accent_dark": "#794E2F",   # нижняя кромка оранжевой кнопки
            "green":       "#0A9947",   # --green-color
            "green_dark":  "#065C2B",
            "red":         "#E25544",
            "red_dark":    "#883329",
            "text":        "#FFFFFF",
            "subtext":     "#9A9AA0",   # белый 60%
            "muted":       "#66666D",   # белый 40%
            "btntext":     "#010106",
            "chrome":      "#555555",
        }
        self._busy = False
        self._prog = 0.0
        self._run_errors = False
        self._minimized = False

        W, H = 1000, 620
        self.SIDE_W = 232
        self.root = ctk.CTk()
        self.root.title("HassleBot")
        self.root.resizable(False, False)
        self.root.configure(fg_color=self.C["border"])
        self.root.update_idletasks()
        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        self.root.geometry(f"{W}x{H}+{(sw-W)//2}+{(sh-H)//2}")
        try:
            icon_path = resource_path("icon.ico")
            if os.path.exists(icon_path):
                self.root.iconbitmap(icon_path)
        except Exception:
            pass
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self._init_fonts()
        self._chrome_borderless()
        self._build_shell(W, H)
        self._show_loading()
        self.root.update()
        self._fix_taskbar()

        self.activate_launch_permission()

    # ──────────────────────────────────────────────────────────────────────────
    # Вспомогательные утилиты
    # ──────────────────────────────────────────────────────────────────────────
    def load_skip_warning(self):
        if self.skip_warning_file.exists():
            try:
                with open(self.skip_warning_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get('skip', False)
            except Exception:
                return False
        return False

    def save_skip_warning(self, skip):
        try:
            with open(self.skip_warning_file, 'w', encoding='utf-8') as f:
                json.dump({'skip': skip}, f)
        except Exception:
            pass

    # ──────────────────────────────────────────────────────────────────────────
    # Локальное хранилище токенов
    # ──────────────────────────────────────────────────────────────────────────

    def _encrypt_bytes(self, data: bytes) -> bytes:
        if platform.system() == "Windows":
            try:
                return _win_dpapi_encrypt(data)
            except Exception as e:
                print(f"DPAPI encrypt error: {e}")
        return base64.b64encode(data)

    def _decrypt_bytes(self, data: bytes) -> bytes:
        if platform.system() == "Windows":
            try:
                return _win_dpapi_decrypt(data)
            except Exception as e:
                print(f"DPAPI decrypt error: {e}")
        return base64.b64decode(data)

    def load_local_accounts(self):
        try:
            if not self.local_accounts_file.exists():
                return {}
            raw = self.local_accounts_file.read_bytes()
            if not raw:
                return {}
            decrypted = self._decrypt_bytes(raw)
            return json.loads(decrypted.decode("utf-8"))
        except Exception as e:
            print(f"Не удалось загрузить локальные аккаунты: {e}")
            return {}

    def save_local_accounts(self):
        try:
            data = json.dumps(self.local_accounts, ensure_ascii=False, indent=2).encode("utf-8")
            encrypted = self._encrypt_bytes(data)
            self.local_accounts_file.write_bytes(encrypted)
            self.log("[√] Локальные аккаунты сохранены")
        except Exception as e:
            self.log(f"[X] Ошибка сохранения локальных аккаунтов: {e}")

    def get_local_user_config(self, user):
        if not user:
            return {}
        return self.local_accounts.get("users", {}).get(user, {})

    def get_local_account_token(self, user, account_number):
        cfg = self.get_local_user_config(user)
        tokens = cfg.get("BOT_TOKENS", {})
        return tokens.get(str(account_number))

    def add_local_account(self, user, account_number, token, note=""):
        if not user:
            return False
        users = self.local_accounts.setdefault("users", {})
        user_cfg = users.setdefault(user, {})
        tokens = user_cfg.setdefault("BOT_TOKENS", {})
        notes = user_cfg.setdefault("NOTES", {})
        acc = str(account_number).strip()
        token = token.strip()
        tokens[acc] = token
        if note:
            notes[acc] = note
        else:
            notes.pop(acc, None)
        self.save_local_accounts()
        self._update_local_account_count(user)
        return True

    def delete_local_account(self, user, account_number):
        cfg = self.get_local_user_config(user)
        if not cfg:
            return False
        acc = str(account_number)
        tokens = cfg.get("BOT_TOKENS", {})
        notes = cfg.get("NOTES", {})
        if acc in tokens:
            del tokens[acc]
        if acc in notes:
            del notes[acc]
        self.save_local_accounts()
        self._update_local_account_count(user)
        return True

    def _update_local_account_count(self, user):
        cfg = self.get_local_user_config(user)
        tokens = cfg.get("BOT_TOKENS", {})
        nums = [int(k) for k in tokens.keys() if str(k).isdigit()]
        if nums:
            self.user_token_counts[user] = max(nums)
        elif tokens:
            self.user_token_counts[user] = len(tokens)

    def get_local_account_numbers(self, user):
        """Отсортированный список номеров аккаунтов, для которых сохранён токен."""
        tokens = self.get_local_user_config(user).get("BOT_TOKENS", {})
        return sorted((str(k) for k in tokens if str(k).isdigit()), key=int)

    TOKEN_RE = r"\d{8,10}:[A-Za-z0-9_-]{30,70}"

    def import_accounts_from_text(self, user, text):
        """Разбирает текст вида  1: 123456789:AAE...  /  '1': '123456789:AAE...'  /  1 123456789:AAE...
        Возвращает количество добавленных/обновлённых токенов."""
        pairs = re.findall(
            r"(?<![\w:])['\"]?(\d{1,3})['\"]?\s*[:=\s]\s*['\"]?(" + self.TOKEN_RE + r")",
            text or ""
        )
        count = 0
        for acc, token in pairs:
            self.add_local_account(user, acc, token)
            count += 1
        return count

    def _init_fonts(self):
        # Open Sans / Open Sans Condensed — шрифты лаунчера (лежат в папке fonts рядом со скриптом)
        self.FAM = {
            "body": "Segoe UI",
            "semi": "Segoe UI Semibold",
            "cond": "Segoe UI Semibold",
            "condb": "Segoe UI",
            "mono": "Consolas",
        }
        if platform.system() != "Windows":
            return
        try:
            import ctypes
            import tkinter.font as tkfont
            fdir = resource_path("fonts")
            if not os.path.isdir(fdir):
                return
            for fn in sorted(os.listdir(fdir)):
                if fn.lower().endswith((".ttf", ".otf")):
                    ctypes.windll.gdi32.AddFontResourceExW(os.path.join(fdir, fn), 0x10, 0)
            fams = {f.lower() for f in tkfont.families(self.root)}
            if "open sans" in fams:
                self.FAM["body"] = "Open Sans"
            if "open sans semibold" in fams:
                self.FAM["semi"] = "Open Sans SemiBold"
            if "open sans condensed semibold" in fams:
                self.FAM["cond"] = "Open Sans Condensed SemiBold"
            if "open sans condensed" in fams:
                self.FAM["condb"] = "Open Sans Condensed"
        except Exception:
            pass

    def F(self, kind="body", size=11):
        # body / semi / bold / cond (курсив, как заголовки лаунчера) / condb / mono
        fam = self.FAM.get(kind, self.FAM["body"])
        if kind == "bold":
            return (self.FAM["body"], size, "bold")
        if kind == "cond":
            return (fam, size, "italic")
        if kind == "condb":
            return (fam, size, "bold italic")
        return (fam, size)

    # ── Окно без рамки ─────────────────────────────────────────────────────────
    def _chrome_borderless(self):
        try:
            self.root.overrideredirect(True)
        except Exception:
            pass
        self.root.bind("<Map>", self._on_map, add="+")

    def _on_map(self, e):
        if e.widget is self.root and self._minimized:
            self._minimized = False
            self.root.after(20, self._restore_borderless)

    def _restore_borderless(self):
        try:
            self.root.overrideredirect(True)
            self._fix_taskbar()
        except Exception:
            pass

    def _fix_taskbar(self):
        # Без рамки окно пропадает с панели задач — возвращаем; заодно скругление на Windows 11
        if platform.system() != "Windows":
            return
        try:
            import ctypes
            hwnd = ctypes.windll.user32.GetParent(self.root.winfo_id())
            style = ctypes.windll.user32.GetWindowLongW(hwnd, -20)
            style = (style & ~0x00000080) | 0x00040000
            ctypes.windll.user32.SetWindowLongW(hwnd, -20, style)
            try:
                pref = ctypes.c_int(2)
                ctypes.windll.dwmapi.DwmSetWindowAttribute(hwnd, 33, ctypes.byref(pref), ctypes.sizeof(pref))
            except Exception:
                pass
            self.root.withdraw()
            self.root.after(20, self.root.deiconify)
        except Exception:
            pass

    def _minimize(self):
        try:
            self._minimized = True
            self.root.overrideredirect(False)
            self.root.iconify()
        except Exception:
            self._minimized = False

    def _bind_drag(self, widget, target=None):
        target = target or self.root
        def _start(e):
            self._dx = e.x_root - target.winfo_x()
            self._dy = e.y_root - target.winfo_y()
        def _move(e):
            target.geometry(f"+{e.x_root - self._dx}+{e.y_root - self._dy}")
        widget.bind("<ButtonPress-1>", _start, add="+")
        widget.bind("<B1-Motion>", _move, add="+")

    # ── Картинки ───────────────────────────────────────────────────────────────
    def _load_logo(self, height):
        try:
            from PIL import Image
            p = resource_path("logo.png")
            if not os.path.exists(p):
                return None
            im = Image.open(p).convert("RGBA")
            w = int(im.width * height / im.height)
            return ctk.CTkImage(light_image=im, dark_image=im, size=(w, height))
        except Exception:
            return None

    def _make_hero(self, w, h, kicker, title):
        # Баннер в духе лаунчера: тёмный фон, тёплое свечение справа, логотип, заголовок Open Sans Condensed
        try:
            from PIL import Image, ImageDraw, ImageFont, ImageChops
        except Exception:
            return None
        try:
            S = 2
            W, H = w * S, h * S
            bg = (1, 1, 6)
            img = Image.new("RGB", (W, H), bg)

            def glow(cx, cy, rx, ry, color, strength):
                g = Image.radial_gradient("L").resize((int(rx * 2), int(ry * 2)))
                g = ImageChops.invert(g).point(lambda v: int(((v / 255.0) ** 2) * 255 * strength))
                img.paste(Image.new("RGB", g.size, color), (int(cx - rx), int(cy - ry)), g)

            glow(W * 0.86, H * 0.30, W * 0.42, H * 1.05, (255, 148, 70), 0.34)
            glow(W * 0.48, -H * 0.10, W * 0.40, H * 0.95, (22, 44, 96), 0.40)
            glow(0, H * 0.25, W * 0.30, H * 0.90, (110, 52, 24), 0.30)

            lp = resource_path("logo.png")
            if os.path.exists(lp):
                logo = Image.open(lp).convert("RGBA")
                lh = int(H * 1.05)
                lw = int(logo.width * lh / logo.height)
                big = logo.resize((lw, lh), Image.LANCZOS)
                big.putalpha(big.split()[3].point(lambda v: int(v * 0.10)))
                img.paste(big, (int(W - lw * 0.92), int(H * 0.02)), big)
                sh_ = int(H * 0.50)
                sw_ = int(logo.width * sh_ / logo.height)
                sm = logo.resize((sw_, sh_), Image.LANCZOS)
                img.paste(sm, (int(W - sw_ - 40 * S), int(H * 0.16)), sm)

            fade = Image.linear_gradient("L").resize((W, H)).point(lambda v: int(((v / 255.0) ** 2.2) * 255))
            img.paste(Image.new("RGB", (W, H), bg), (0, 0), fade)

            d = ImageDraw.Draw(img)

            def font(name, size):
                try:
                    return ImageFont.truetype(resource_path("fonts/" + name), size * S)
                except Exception:
                    return ImageFont.load_default()

            d.rectangle([28 * S, 34 * S, 31 * S, 50 * S], fill=(249, 183, 1))
            d.text((40 * S, 32 * S), kicker, font=font("OpenSansCondensed-SemiBoldItalic.ttf", 15), fill=(253, 160, 47))
            d.text((28 * S, 54 * S), title, font=font("OpenSansCondensed-BoldItalic.ttf", 40), fill=(255, 255, 255))
            return img.resize((w, h), Image.LANCZOS)
        except Exception:
            return None

    # ── Каркас окна ────────────────────────────────────────────────────────────
    def _build_shell(self, W, H):
        C = self.C
        self.window = ctk.CTkFrame(self.root, fg_color=C["bg"], corner_radius=0)
        self.window.pack(fill="both", expand=True, padx=1, pady=1)
        self.main_frame = self.window
        self.window.grid_columnconfigure(0, weight=1)
        self.window.grid_rowconfigure(1, weight=1)

        # Шапка (перетаскивание, свернуть, закрыть)
        tb = ctk.CTkFrame(self.window, fg_color=C["panel"], corner_radius=0, height=40)
        tb.grid(row=0, column=0, sticky="ew")
        tb.pack_propagate(False)
        self._bind_drag(tb)

        ctk.CTkFrame(tb, width=3, height=16, corner_radius=2, fg_color=C["accent"]).pack(side="left", padx=(16, 10))
        t1 = ctk.CTkLabel(tb, text="HASSLE BOT", font=self.F("condb", 15), text_color=C["text"])
        t1.pack(side="left")
        t2 = ctk.CTkLabel(tb, text="by konst2", font=self.F("body", 10), text_color=C["muted"])
        t2.pack(side="left", padx=(10, 0), pady=(3, 0))
        self._bind_drag(t1)
        self._bind_drag(t2)

        ctk.CTkButton(
            tb, text="✕", width=44, height=40, corner_radius=0, font=self.F("body", 12),
            fg_color="transparent", hover_color=C["red"], text_color=C["subtext"],
            command=self.on_close,
        ).pack(side="right")
        ctk.CTkButton(
            tb, text="—", width=44, height=40, corner_radius=0, font=self.F("body", 12),
            fg_color="transparent", hover_color=C["hover"], text_color=C["subtext"],
            command=self._minimize,
        ).pack(side="right")

        self._status_txt = ctk.CTkLabel(tb, text="ЗАГРУЗКА", font=self.F("cond", 12), text_color=C["muted"])
        self._status_txt.pack(side="right", padx=(0, 14))
        self._status_dot = ctk.CTkFrame(tb, width=8, height=8, corner_radius=4, fg_color=C["muted"])
        self._status_dot.pack(side="right", padx=(0, 8))
        self._status_dot.pack_propagate(False)

        # Тело: сайдбар | линия | контент
        body = ctk.CTkFrame(self.window, fg_color=C["bg"], corner_radius=0)
        body.grid(row=1, column=0, sticky="nsew")
        body.grid_columnconfigure(0, weight=0, minsize=self.SIDE_W)
        body.grid_columnconfigure(1, weight=0, minsize=1)
        body.grid_columnconfigure(2, weight=1)
        body.grid_rowconfigure(0, weight=1)

        # ── Сайдбар ───────────────────────────────────────────
        self.sidebar = ctk.CTkFrame(body, fg_color=C["panel"], corner_radius=0, width=self.SIDE_W)
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_propagate(False)
        self.sidebar.pack_propagate(False)

        self.side_bottom = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        self.side_bottom.pack(side="bottom", fill="x", padx=10, pady=(0, 12))

        head = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        head.pack(fill="x", padx=18, pady=(22, 0))
        self._logo_img = self._load_logo(58)
        if self._logo_img is not None:
            ctk.CTkLabel(head, text="", image=self._logo_img).pack(anchor="w")
        else:
            ctk.CTkLabel(head, text="HB", font=self.F("condb", 30), text_color=C["accent"]).pack(anchor="w")

        ctk.CTkLabel(head, text="ПРОФИЛЬ", font=self.F("cond", 12), text_color=C["muted"],
                     anchor="w").pack(fill="x", pady=(16, 0))
        self._side_name = ctk.CTkLabel(head, text="—", font=self.F("condb", 22), text_color=C["accent2"], anchor="w")
        self._side_name.pack(fill="x")
        self._side_role = ctk.CTkLabel(head, text="ПРОВЕРКА ДОСТУПА", font=self.F("cond", 13),
                                       text_color=C["muted"], anchor="w")
        self._side_role.pack(fill="x", pady=(0, 0))

        ctk.CTkFrame(self.sidebar, height=1, fg_color=C["border"], corner_radius=0).pack(
            fill="x", padx=18, pady=(16, 10))

        self.nav = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        self.nav.pack(fill="x", padx=10)

        ctk.CTkFrame(body, width=1, corner_radius=0, fg_color=C["border"]).grid(row=0, column=1, sticky="nsew")

        # ── Контент ───────────────────────────────────────────
        self.main = ctk.CTkFrame(body, fg_color=C["bg"], corner_radius=0)
        self.main.grid(row=0, column=2, sticky="nsew")
        self.main.grid_columnconfigure(0, weight=1)
        self.main.grid_rowconfigure(2, weight=1)

        hw = W - 2 - self.SIDE_W - 1
        hh = 150
        hero_img = self._make_hero(hw, hh, "HASSLE BOT  ·  ПАНЕЛЬ УСТАНОВКИ", "УСТАНОВКА КОДА")
        if hero_img is not None:
            self._hero_ctk = ctk.CTkImage(light_image=hero_img, dark_image=hero_img, size=(hw, hh))
            self.hero = ctk.CTkLabel(self.main, text="", image=self._hero_ctk, fg_color=C["bg"],
                                     width=hw, height=hh)
        else:
            self.hero = ctk.CTkLabel(self.main, text="УСТАНОВКА КОДА", font=self.F("condb", 34),
                                     text_color=C["text"], fg_color=C["bg"], anchor="w", height=hh)
        self.hero.grid(row=0, column=0, sticky="ew")

        self.hero_sub = ctk.CTkLabel(self.main, text="", font=self.F("cond", 14),
                                     text_color=C["subtext"], anchor="w")
        self.hero_sub.grid(row=1, column=0, sticky="ew", padx=28, pady=(0, 6))

        self.left_col = ctk.CTkScrollableFrame(
            self.main, fg_color=C["bg"], corner_radius=0,
            scrollbar_button_color=C["border2"],
            scrollbar_button_hover_color=C["accent"],
        )
        self.left_col.grid(row=2, column=0, sticky="nsew", padx=(18, 8))
        self.left_col.grid_columnconfigure(0, weight=1)

        self.bottom_bar = ctk.CTkFrame(self.main, fg_color=C["panel"], corner_radius=0, height=88)
        self.bottom_bar.grid(row=3, column=0, sticky="ew")
        self.bottom_bar.grid_propagate(False)

        # Всплывающие уведомления — поверх контента, справа снизу
        self._notif_strip = ctk.CTkFrame(self.main, fg_color="transparent", width=380, height=1)
        self._notif_strip.place(relx=1.0, rely=1.0, x=-20, y=-100, anchor="se")

    def _show_loading(self):
        C = self.C
        self._set_state("ПРОВЕРКА ДОСТУПА", C["accent"])
        box = ctk.CTkFrame(self.left_col, fg_color="transparent")
        box.grid(row=0, column=0, pady=(30, 0))
        ctk.CTkLabel(box, text="ПРОВЕРКА ДОСТУПА", font=self.F("condb", 24), text_color=C["text"]).pack()
        ctk.CTkLabel(box, text="Подключение к серверу…", font=self.F("body", 11),
                     text_color=C["subtext"]).pack(pady=(4, 12))
        bar = ctk.CTkProgressBar(box, width=320, height=14, corner_radius=3, border_width=1,
                                 border_color=C["border"], fg_color=C["card2"], progress_color=C["green"])
        bar.set(0.35)
        bar.pack()
        self.bottom_bar.grid_remove()

    # ── Состояния ──────────────────────────────────────────────────────────────
    def _set_state(self, text, color):
        try:
            self._status_dot.configure(fg_color=color)
            self._status_txt.configure(text=text, text_color=color)
        except Exception:
            pass

    def _set_ready(self):
        self._set_state("ГОТОВ", self.C["green"])

    def _update_side_head(self):
        C = self.C
        try:
            self._side_name.configure(text=self.selected_code_name or "—")
            if self.launch_allowed:
                if self.debug_allowed:
                    self._side_role.configure(text="ОТЛАДКА", text_color=C["accent"])
                else:
                    self._side_role.configure(text="ДОСТУП РАЗРЕШЁН", text_color=C["green"])
            else:
                self._side_role.configure(text="НЕТ ДОСТУПА", text_color=C["red"])
        except Exception:
            pass

    def _refresh_hero_sub(self, *_):
        try:
            parts = []
            if self.selected_code_name:
                parts.append(f"ИГРОК: {self.selected_code_name}")
            if hasattr(self, "conn_var"):
                parts.append(f"УСТРОЙСТВО: {self.conn_var.get()}")
            if hasattr(self, "app_var") and self.app_var.get():
                parts.append(self.app_var.get())
            self.hero_sub.configure(text="   ·   ".join(parts))
        except Exception:
            pass

    # ── Прогресс и статус в нижней панели ──────────────────────────────────────
    def _set_status(self, text, level="info"):
        lbl = getattr(self, "_status_lbl", None)
        if lbl is None:
            return
        C = self.C
        col = {"ok": C["green"], "err": C["red"], "warn": C["accent"]}.get(level, C["subtext"])
        text = text.upper()
        if len(text) > 62:
            text = text[:61] + "…"
        try:
            lbl.configure(text=text, text_color=col)
        except Exception:
            pass

    def _progress_start(self):
        self._busy = True
        self._prog = 0.04
        self._run_errors = False
        try:
            self._progress.configure(progress_color=self.C["green"])
            self._progress.set(self._prog)
        except Exception:
            pass
        self._progress_tick()

    def _progress_tick(self):
        if not self._busy:
            return
        self._prog += (0.93 - self._prog) * 0.04
        try:
            self._progress.set(self._prog)
        except Exception:
            return
        self.root.after(80, self._progress_tick)

    def _progress_done(self):
        self._busy = False
        try:
            self._progress.configure(progress_color=self.C["red"] if self._run_errors else self.C["green"])
            self._progress.set(1.0)
            self.root.after(2500, self._progress_reset)
        except Exception:
            pass

    def _progress_reset(self):
        if self._busy:
            return
        try:
            self._progress.set(0)
            self._progress.configure(progress_color=self.C["green"])
        except Exception:
            pass

    def _with_progress(self, fn):
        self.root.after(0, self._progress_start)
        try:
            fn()
        finally:
            self.root.after(0, self._progress_done)

    # ── Кнопки, пункты меню, поля ──────────────────────────────────────────────
    def _btn_primary(self, parent, text, command, height=44, width=None, size=15):
        # Оранжевая кнопка лаунчера: янтарная заливка + тёмная нижняя кромка
        C = self.C
        outer = ctk.CTkFrame(parent, fg_color=C["accent_dark"], corner_radius=7)
        btn = ctk.CTkButton(
            outer, text=text, command=command, font=self.F("condb", size),
            fg_color=C["accent"], hover_color=C["accent2"],
            text_color=C["btntext"], text_color_disabled="#7A6A2A",
            height=height, corner_radius=6,
        )
        if width:
            outer.configure(width=width, height=height + 3)
            outer.pack_propagate(False)
        btn.pack(fill="x", pady=(0, 3))
        outer.btn = btn
        return outer

    def _btn_ghost(self, parent, text, command, height=36, width=None, danger=False, green=False):
        C = self.C
        base = C["red"] if danger else (C["green"] if green else C["subtext"])
        kw = {"width": width} if width else {}
        return ctk.CTkButton(
            parent, text=text, command=command, font=self.F("cond", 14),
            fg_color=C["card2"], hover_color=C["red_dark"] if danger else C["hover"],
            text_color=base, height=height, corner_radius=6,
            border_width=1, border_color=C["border2"], **kw,
        )

    def _nav_item(self, parent, text, command, active=False, danger=False, green=False):
        # Пункт бокового меню: слева появляется янтарная полоска (как .navbar-item в лаунчере)
        C = self.C
        row = ctk.CTkFrame(parent, fg_color="transparent", height=40, corner_radius=0)
        row.pack(fill="x", pady=1)
        row.pack_propagate(False)
        idle = C["red"] if danger else (C["green"] if green else (C["text"] if active else C["subtext"]))
        hov = C["red"] if danger else (C["green"] if green else C["text"])
        btn = ctk.CTkButton(
            row, text=text.upper(), anchor="w", font=self.F("cond", 15),
            fg_color=C["hover"] if active else "transparent",
            hover_color=C["card2"], text_color=idle,
            corner_radius=6, height=36, command=command,
        )
        btn.place(x=10, y=2, relwidth=1.0, width=-20)
        ind = ctk.CTkFrame(row, width=3, height=18, corner_radius=2,
                           fg_color=C["red"] if danger else C["accent"])
        if active:
            ind.place(x=0, rely=0.5, anchor="w")

        def _enter(_e=None):
            ind.place(x=0, rely=0.5, anchor="w")
            btn.configure(text_color=hov)

        def _leave(_e=None):
            if not active:
                ind.place_forget()
            btn.configure(text_color=idle)

        btn.bind("<Enter>", _enter, add="+")
        btn.bind("<Leave>", _leave, add="+")
        return row

    def _entry(self, parent, placeholder="", height=36, **kw):
        C = self.C
        e = ctk.CTkEntry(
            parent, placeholder_text=placeholder,
            fg_color=C["card2"], border_color=C["border2"], border_width=1,
            text_color=C["text"], placeholder_text_color=C["muted"],
            font=self.F("body", 11), height=height, corner_radius=6, **kw,
        )
        e.bind("<FocusIn>", lambda ev: e.configure(border_color=C["accent"]), add="+")
        e.bind("<FocusOut>", lambda ev: e.configure(border_color=C["border2"]), add="+")
        return e

    def _card(self, parent, row=0, col=0, title=None, colspan=1, pad_top=6, pad_bot=6, padx=(0, 0)):
        C = self.C
        f = ctk.CTkFrame(parent, fg_color=C["card"], corner_radius=10,
                         border_width=1, border_color=C["border"])
        f.grid(row=row, column=col, columnspan=colspan, padx=padx, pady=(pad_top, pad_bot), sticky="nsew")
        f.grid_columnconfigure(0, weight=1)
        if title:
            self._card_title(f, title)
        return f

    def _card_title(self, parent, text, row=0):
        C = self.C
        wrap = ctk.CTkFrame(parent, fg_color="transparent")
        wrap.grid(row=row, column=0, sticky="ew", padx=16, pady=(12, 2))
        ctk.CTkFrame(wrap, width=3, height=16, corner_radius=2, fg_color=C["accent"]).pack(side="left", padx=(0, 10))
        ctk.CTkLabel(wrap, text=text, font=self.F("condb", 15), text_color=C["text"]).pack(side="left")

    def _section_label(self, parent, text, row=0):
        self._card_title(parent, text, row=row)

    def _field_label(self, parent, text, row):
        ctk.CTkLabel(
            parent, text=text, font=self.F("cond", 12),
            text_color=self.C["muted"], anchor="w",
        ).grid(row=row, column=0, padx=16, pady=(8, 3), sticky="w")

    def _info_row(self, parent, label, value, row, color=None, mono=False):
        self._field_label(parent, label, row)
        ctk.CTkLabel(
            parent, text=value,
            font=self.F("mono", 11) if mono else self.F("semi", 12),
            text_color=color or self.C["text"], anchor="w",
        ).grid(row=row + 1, column=0, padx=16, pady=(0, 2), sticky="w")

    def _combo(self, parent, values, variable, row, command=None, pad_bottom=12):
        C = self.C
        kw = dict(
            values=values, variable=variable,
            fg_color=C["card2"], border_color=C["border2"], border_width=1,
            button_color=C["hover"], button_hover_color=C["accent"],
            dropdown_fg_color=C["card"], dropdown_hover_color=C["hover"],
            dropdown_text_color=C["text"], text_color=C["text"],
            font=self.F("body", 11), dropdown_font=self.F("body", 11),
            height=36, corner_radius=6,
        )
        if command:
            kw["command"] = command
        w = ctk.CTkComboBox(parent, **kw)
        w.grid(row=row, column=0, padx=16, pady=(0, pad_bottom), sticky="ew")
        return w

    # ── Диалоги в стиле лаунчера ───────────────────────────────────────────────
    def _dialog(self, title, w, h, sub=None):
        C = self.C
        dlg = ctk.CTkToplevel(self.root)
        dlg.withdraw()
        dlg.title(title or "HassleBot")
        dlg.resizable(False, False)
        dlg.configure(fg_color=C["border2"])
        try:
            dlg.overrideredirect(True)
        except Exception:
            pass
        dlg.transient(self.root)
        self.root.update_idletasks()
        rx = self.root.winfo_rootx() + (self.root.winfo_width() - w) // 2
        ry = self.root.winfo_rooty() + (self.root.winfo_height() - h) // 2
        dlg.geometry(f"{w}x{h}+{max(rx, 0)}+{max(ry, 0)}")

        body = ctk.CTkFrame(dlg, fg_color=C["bg"], corner_radius=0)
        body.pack(fill="both", expand=True, padx=1, pady=1)

        hdr = ctk.CTkFrame(body, fg_color=C["panel"], corner_radius=0, height=42)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        ctk.CTkFrame(hdr, width=3, height=16, corner_radius=2, fg_color=C["accent"]).pack(side="left", padx=(16, 10))
        tl = ctk.CTkLabel(hdr, text=(title or "").upper(), font=self.F("condb", 15), text_color=C["text"])
        tl.pack(side="left")
        if sub:
            sl = ctk.CTkLabel(hdr, text=sub, font=self.F("body", 10), text_color=C["muted"])
            sl.pack(side="left", padx=(10, 0), pady=(3, 0))
            self._bind_drag(sl, dlg)
        ctk.CTkButton(
            hdr, text="✕", width=42, height=42, corner_radius=0, font=self.F("body", 12),
            fg_color="transparent", hover_color=C["red"], text_color=C["subtext"],
            command=dlg.destroy,
        ).pack(side="right")
        self._bind_drag(hdr, dlg)
        self._bind_drag(tl, dlg)

        dlg.deiconify()
        dlg.lift()
        try:
            dlg.wait_visibility()
            dlg.grab_set()
            dlg.focus_force()
        except Exception:
            pass
        return dlg, body

    def _msgbox(self, kind, title, text):
        C = self.C
        color = {"error": C["red"], "warning": C["accent"], "info": C["green"]}.get(kind, C["accent"])
        lines = sum(max(1, len(s) // 46 + 1) for s in str(text).split("\n"))
        h = min(170 + 19 * lines, 460)
        dlg, body = self._dialog(title, 440, h)
        ctk.CTkFrame(body, height=3, corner_radius=0, fg_color=color).pack(fill="x")
        ctk.CTkLabel(
            body, text=str(text), font=self.F("body", 11), text_color=C["text"],
            wraplength=390, justify="left", anchor="w",
        ).pack(fill="x", padx=24, pady=(20, 12))
        ok = self._btn_primary(body, "ОК", dlg.destroy, height=38, width=140, size=15)
        ok.pack(side="bottom", anchor="e", padx=24, pady=(0, 18))
        try:
            self.root.wait_window(dlg)
        except Exception:
            pass

    def open_local_account_manager(self):
        user = self.selected_code_name
        if not user:
            self.log("[X] Ошибка: пользователь не выбран")
            return

        C = self.C
        dialog, body = self._dialog("Локальные токены", 640, 590, sub=f"игрок: {user}")

        list_frame = ctk.CTkScrollableFrame(
            body, fg_color=C["card"], corner_radius=10,
            border_width=1, border_color=C["border"],
            scrollbar_button_color=C["border2"],
            scrollbar_button_hover_color=C["accent"],
        )
        list_frame.pack(fill="both", expand=True, padx=16, pady=(14, 6))

        def mask_token(token: str) -> str:
            if not token:
                return "***"
            if ":" in token:
                return token.split(":")[0] + ":***"
            return "***"

        def refresh():
            for w in list_frame.winfo_children():
                w.destroy()
            cfg = self.get_local_user_config(user)
            tokens = cfg.get("BOT_TOKENS", {})
            notes = cfg.get("NOTES", {})
            if not tokens:
                ctk.CTkLabel(
                    list_frame, text="ЛОКАЛЬНЫЕ ТОКЕНЫ ЕЩЁ НЕ ДОБАВЛЕНЫ",
                    font=self.F("cond", 14), text_color=C["muted"],
                ).pack(pady=18)
                return
            for acc in sorted(tokens.keys(), key=lambda x: int(x) if str(x).isdigit() else x):
                token = tokens.get(acc, "")
                note = notes.get(acc, "")
                row = ctk.CTkFrame(list_frame, fg_color=C["card2"], corner_radius=8,
                                   border_width=1, border_color=C["border"])
                row.pack(fill="x", pady=3, padx=2)
                row.grid_columnconfigure(1, weight=1)
                ctk.CTkLabel(
                    row, text=f"#{acc}", font=self.F("condb", 16),
                    text_color=C["accent2"], width=46,
                ).grid(row=0, column=0, padx=(10, 6), pady=8)
                txt = mask_token(token)
                if note:
                    txt += f"   ·   {note}"
                ctk.CTkLabel(
                    row, text=txt, font=self.F("mono", 11),
                    text_color=C["text"], anchor="w",
                ).grid(row=0, column=1, padx=6, pady=8, sticky="ew")
                ctk.CTkButton(
                    row, text="✕", width=32, height=28, font=self.F("body", 11),
                    fg_color="transparent", hover_color=C["red"],
                    text_color=C["subtext"], corner_radius=6,
                    command=lambda a=acc: (self.delete_local_account(user, a), refresh()),
                ).grid(row=0, column=2, padx=(6, 10), pady=8)

        form = ctk.CTkFrame(body, fg_color="transparent")
        form.pack(fill="x", padx=16, pady=(6, 14))
        form.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(form, text="№", font=self.F("cond", 13), text_color=C["muted"]).grid(
            row=0, column=0, padx=(0, 8), pady=4)
        acc_entry = self._entry(form, "Например: 9", height=34, width=90)
        acc_entry.grid(row=0, column=1, sticky="w", pady=4)
        token_entry = self._entry(form, "Токен бота от @BotFather", height=34)
        token_entry.grid(row=1, column=0, columnspan=3, sticky="ew", pady=4)
        note_entry = self._entry(form, "Комментарий, например @hb_z09_bot", height=34)
        note_entry.grid(row=2, column=0, columnspan=3, sticky="ew", pady=4)

        def add_account():
            acc = acc_entry.get().strip()
            token = token_entry.get().strip()
            note = note_entry.get().strip()
            if not re.match(r"^\d{1,3}$", acc):
                self._msgbox("error", "Ошибка", "Номер аккаунта должен быть числом, например 9")
                return
            if not re.match(r"^\d{8,10}:[A-Za-z0-9_-]{30,70}$", token):
                self._msgbox(
                    "error", "Ошибка",
                    "Токен бота похож на неверный.\n\nПример формата:\n1234567890:AAE..."
                )
                return
            self.add_local_account(user, acc, token, note)
            acc_entry.delete(0, "end")
            token_entry.delete(0, "end")
            note_entry.delete(0, "end")
            refresh()

        def import_clipboard():
            try:
                text = self.root.clipboard_get()
            except Exception:
                text = ""
            n = self.import_accounts_from_text(user, text)
            if n:
                self._msgbox("info", "Готово", f"Импортировано токенов: {n}")
            else:
                self._msgbox(
                    "warning", "Ничего не найдено",
                    "В буфере обмена не найдено пар «номер + токен».\n\n"
                    "Скопируйте текст вида:\n1: 1234567890:AAE...\n2: 1234567891:AAF..."
                )
            refresh()

        btns = ctk.CTkFrame(form, fg_color="transparent")
        btns.grid(row=3, column=0, columnspan=3, sticky="ew", pady=(8, 0))
        btns.grid_columnconfigure(0, weight=1)
        btns.grid_columnconfigure(1, weight=1)
        self._btn_ghost(btns, "ИМПОРТ ИЗ БУФЕРА", import_clipboard, height=44).grid(
            row=0, column=0, sticky="ew", padx=(0, 6))
        self._btn_primary(btns, "ДОБАВИТЬ ТОКЕН", add_account, height=41, size=15).grid(
            row=0, column=1, sticky="ew", padx=(6, 0))

        refresh()

    # ──────────────────────────────────────────────────────────────────────────
    # Загрузка конфигураций
    # ──────────────────────────────────────────────────────────────────────────
    def fetch_code_files(self):
        try:
            self.log("Загрузка конфигураций...")

            list_url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/List.js"
            response = requests.get(list_url, timeout=10)
            response.raise_for_status()
            list_content = response.text

            import re
            user_pattern = r"['\"](\w+)['\"]:\s*\{"
            users = re.findall(user_pattern, list_content)

            if not users:
                self.log("[X] Ошибка: Пользователи не найдены в List.js")
                return False

            # Токены больше не хранятся в List.js — берём количество из локального хранилища
            self.user_token_counts = {
                user: len(self.get_local_account_numbers(user)) for user in users
            }

            self.code_files = []
            for idx, user in enumerate(users):
                self.code_files.append({
                    'name': f'{user}.js',
                    'url': None,
                    'html_url': None,
                    'user': user,
                })


            self.log(f"[√] Конфигурации загружены: {', '.join(users)}")

            return True

        except Exception as e:
            self.log(f"[X] Не удалось загрузить конфигурации: {e}")
            return False

    def fetch_last_commit(self, file_name, subdir=".js%2BLoad.js"):
        commit_cache_file = self.script_dir / f"commit_cache_{subdir}_{file_name}.json"
        current_time = time.time()
        if current_time - self.cache_time < 3600 and commit_cache_file.exists():
            try:
                with open(commit_cache_file, 'r', encoding='utf-8') as f:
                    last_commit = json.load(f)
                return self.format_commit_info(last_commit)
            except Exception:
                pass
        try:
            commits_url = f"https://api.github.com/repos/BensonZahar/Hud.js/commits?path={subdir}/{file_name}"
            response = requests.get(commits_url, timeout=10)
            response.raise_for_status()
            commits = response.json()
            if not commits:
                return "Нет информации о коммите"
            last_commit = commits[0]['commit']
            with open(commit_cache_file, 'w', encoding='utf-8') as f:
                json.dump(last_commit, f)
            self.cache_time = current_time
            return self.format_commit_info(last_commit)
        except Exception:
            return "Ошибка загрузки коммита"

    def format_commit_info(self, commit):
        date_str = commit['author']['date']
        dt = datetime.fromisoformat(date_str.rstrip('Z'))
        formatted_date = dt.strftime("%Y-%m-%d %H:%M:%S")
        message = commit['message']
        return f"{formatted_date}: {message}"

    # ──────────────────────────────────────────────────────────────────────────
    # GUI — основной экран
    # ──────────────────────────────────────────────────────────────────────────
    def setup_gui(self):
        C = self.C
        for w in list(self.left_col.winfo_children()):
            w.destroy()
        self.left_col.grid_columnconfigure((0, 1), weight=1, uniform="cols")

        # ── Карточка: Устройство ───────────────────────────────
        dev = self._card(self.left_col, 0, 0, title="УСТРОЙСТВО", pad_top=4, padx=(0, 6))

        self._field_label(dev, "ТИП ПОДКЛЮЧЕНИЯ", row=1)
        self.conn_var = ctk.StringVar(value="Физическое")
        self.conn_menu = self._combo(
            dev,
            values=["Физическое", "Клон (999)", "MEmu", "NOX"],
            variable=self.conn_var,
            row=2,
        )
        self.conn_var.trace("w", self.detect_app_folders)
        self.conn_var.trace_add("write", self._refresh_hero_sub)

        self._field_label(dev, "ПАПКА ПРИЛОЖЕНИЯ", row=3)
        self.app_var = ctk.StringVar(value="")
        self.app_menu = self._combo(dev, values=[], variable=self.app_var, row=4, pad_bottom=16)
        self.app_var.trace_add("write", self._refresh_hero_sub)

        # ── Карточка: Профиль ──────────────────────────────────
        prof = self._card(self.left_col, 0, 1, title="ПРОФИЛЬ", pad_top=4, padx=(6, 0))
        if self.debug_allowed and self.code_files:
            user_names = [f.get('user', f['name'].replace('.js', '')) for f in self.code_files]
            self._field_label(prof, "ИГРОК", row=1)
            self.owner_user_var = ctk.StringVar(
                value=self.selected_code_name or user_names[0]
            )
            self._combo(
                prof,
                values=user_names,
                variable=self.owner_user_var,
                row=2,
                command=self._on_owner_user_change,
                pad_bottom=4,
            )
            self._on_owner_user_change(self.owner_user_var.get())
            nxt = 3
        else:
            self._info_row(prof, "ИГРОК", self.selected_code_name or "—", row=1, color=C["accent2"])
            nxt = 3
        self._info_row(
            prof, "ДОСТУП",
            "Отладка" if self.debug_allowed else "Обычный",
            row=nxt, color=C["green"],
        )
        self._info_row(prof, "HWID", self.hwid or "UNKNOWN", row=nxt + 2, mono=True)
        ctk.CTkFrame(prof, height=10, fg_color="transparent").grid(row=nxt + 4, column=0)

        # ── NOX-секция (показывается только при 2+ экземплярах) ─
        self.nox_sect = ctk.CTkFrame(
            self.left_col, fg_color=C["card"], corner_radius=10,
            border_width=1, border_color=C["border"],
        )
        self.nox_sect.grid_columnconfigure(0, weight=1)

        # ── Инфо о коммите ─────────────────────────────────────
        if self.full_logging and self.last_commit_info:
            ctk.CTkLabel(
                self.left_col,
                text=f"↑ {self.last_commit_info}",
                font=self.F("body", 9),
                text_color=C["muted"],
                wraplength=680, justify="left", anchor="w",
            ).grid(row=2, column=0, columnspan=2, padx=4, pady=(2, 8), sticky="w")

        self._update_side_head()
        self._refresh_hero_sub()
        self.update_gui()

    def _on_owner_user_change(self, value):
        self.selected_code_name = value
        self._update_side_head()
        self._refresh_hero_sub()

    def _update_nox_selector(self):
        if not hasattr(self, 'nox_sect'):
            return
        C = self.C

        for w in self.nox_sect.winfo_children():
            w.destroy()

        if self.conn_var.get() == "NOX" and len(self.nox_active_devices) >= 2:
            self.nox_sect.grid(row=1, column=0, columnspan=2, pady=(6, 6), sticky="ew")
            self._card_title(self.nox_sect, "NOX — ВЫБОР ЭКЗЕМПЛЯРА")

            if not hasattr(self, 'nox_target_var') or self.nox_target_var is None:
                self.nox_target_var = ctk.StringVar(value="Оба сразу")

            labels = [d["label"] for d in self.nox_active_devices] + ["Оба сразу"]

            def _on_nox_target(val):
                idx_map = {d["label"]: d for d in self.nox_active_devices}
                if val in idx_map:
                    self.device_param = idx_map[val]["param"]
                    self.log(f"[√] NOX цель: {val}")
                else:
                    self.device_param = self.nox_active_devices[0]["param"]
                    self.log("[√] NOX цель: оба экземпляра")

            self._field_label(self.nox_sect, "ЦЕЛЬ", row=1)
            self._combo(self.nox_sect, labels, self.nox_target_var, row=2,
                        command=_on_nox_target, pad_bottom=6)

            ports_text = "   ".join(
                f"{d['label']}: порт {d['port']}" for d in self.nox_active_devices
            )
            ctk.CTkLabel(
                self.nox_sect, text=ports_text,
                font=self.F("mono", 10), text_color=C["muted"],
                anchor="w",
            ).grid(row=3, column=0, padx=16, pady=(0, 14), sticky="w")

            _on_nox_target(self.nox_target_var.get())
        else:
            self.nox_sect.grid_remove()
            self.nox_target_var = None

    def detect_app_folders(self, *args):
        # Всё блокирующее (ADB + select_connection) — в фоновый поток.
        # GUI обновляем только через root.after, чтобы не было гонки с потоком установки.
        def _run():
            if self.select_connection():
                self.root.after(0, self._update_nox_selector)
                # Снимаем снапшот сразу после select_connection
                adb_path = self.adb_path
                device_param = list(self.device_param)
                storage_path = self.storage_path
                try:
                    cmd = [adb_path] + device_param + [
                        "shell", "ls", "-1", storage_path
                    ]
                    result = subprocess.run(
                        cmd, capture_output=True, text=True,
                        creationflags=subprocess.CREATE_NO_WINDOW
                        if platform.system() == "Windows" else 0,
                    )
                    if result.returncode == 0:
                        folders = [
                            f.strip() for f in result.stdout.splitlines()
                            if f.strip().startswith("com.hassle.online")
                        ]
                        def _update(folders=folders):
                            self.app_menu.configure(values=folders)
                            if folders:
                                self.app_var.set(folders[0])
                                self.log(f"[√] Обнаружено папок: {len(folders)}")
                            else:
                                self.app_var.set("")
                                self.log("[X] Папки com.hassle.online* не найдены")
                        self.root.after(0, _update)
                    else:
                        self.root.after(0, lambda: self.log("[X] Ошибка при получении списка папок"))
                except Exception as e:
                    self.root.after(0, lambda e=e: self.log(f"[X] Ошибка обнаружения папок: {e}"))
            else:
                def _clear():
                    self.app_menu.configure(values=[])
                    self.app_var.set("")
                    self._update_nox_selector()
                self.root.after(0, _clear)
        threading.Thread(target=_run, daemon=True).start()

    # ──────────────────────────────────────────────────────────────────────────
    # GUI — блок действий
    # ──────────────────────────────────────────────────────────────────────────
    def update_gui(self):
        C = self.C

        # ── Боковое меню ────────────────────────────────────────
        for w in list(self.nav.winfo_children()):
            w.destroy()
        for w in list(self.side_bottom.winfo_children()):
            w.destroy()

        self._nav_item(self.nav, "Установить код", lambda: self.execute_action("1"), active=True)
        self._nav_item(self.nav, "Убрать код", lambda: self.execute_action("2"))
        self._nav_item(self.nav, "Проверить файлы", lambda: self.execute_action("3"))
        self._nav_item(self.nav, "Токены аккаунтов", self.open_local_account_manager)
        if self.full_logging:
            self._nav_item(self.nav, "Скачать Hud.js", lambda: self.execute_action("4"))
            self._nav_item(self.nav, "Скачать .js файлы", self.open_js_downloader)
        if self.debug_allowed:
            self._nav_item(self.nav, "Включить отладку", self.activate_debug_mode, green=True)

        self._nav_item(self.side_bottom, "Выход", self.on_close, danger=True)

        # ── Нижняя панель: статус + прогресс + главная кнопка ──
        bb = self.bottom_bar
        for w in list(bb.winfo_children()):
            w.destroy()
        bb.grid()
        bb.grid_columnconfigure(0, weight=1)
        bb.grid_columnconfigure(1, weight=0)
        bb.grid_rowconfigure(0, weight=1)

        left = ctk.CTkFrame(bb, fg_color="transparent")
        left.grid(row=0, column=0, sticky="ew", padx=(28, 20))
        self._status_lbl = ctk.CTkLabel(
            left, text="ГОТОВ К УСТАНОВКЕ", font=self.F("cond", 16),
            text_color=C["subtext"], anchor="w",
        )
        self._status_lbl.pack(fill="x", pady=(0, 7))
        self._progress = ctk.CTkProgressBar(
            left, height=14, corner_radius=3, border_width=1,
            border_color=C["border"], fg_color=C["card2"],
            progress_color=C["green"],
        )
        self._progress.set(0)
        self._progress.pack(fill="x")

        self.install_btn = self._btn_primary(
            bb, "УСТАНОВИТЬ КОД", lambda: self.execute_action("1"),
            height=50, width=240, size=18,
        )
        self.install_btn.grid(row=0, column=1, padx=(0, 28), pady=16)

    # ──────────────────────────────────────────────────────────────────────────
    # Telegram
    # ──────────────────────────────────────────────────────────────────────────
    def send_telegram_message(self, stage="launch", message_id=None, verdict=None):
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        device_name = platform.node()
        hwid_str = self.hwid or "UNKNOWN"
        if stage == "launch":
            message_text = (
                f"[{current_time}] Запрос на запуск HASSLE BOT by konst "
                f"с устройства {device_name} (HWID: {hwid_str}) 🎮🔧"
            )
            buttons = [
                {"text": "Разрешить ✅", "callback_data": "allow_launch"},
                {"text": "Запретить 🚫", "callback_data": "deny_launch"},
            ]
        elif stage == "unknown_hwid":
            message_text = (
                f"[{current_time}] ⚠️ НЕИЗВЕСТНЫЙ HWID!\n"
                f"Устройство: {device_name}\n"
                f"HWID: {hwid_str}\n"
                f"Этот HWID отсутствует в keys.json. Добавьте его для выдачи доступа."
            )
            buttons = []
        elif stage == "debug_choice":
            message_text = (
                f"[{current_time}] Выберите режим отладки для HASSLE BOT "
                f"с устройства {device_name} (IP: {device_ip}) 🎮🔧"
            )
            buttons = [
                {"text": "С отладкой 🛠️", "callback_data": "with_debug"},
                {"text": "Без отладки 🚫", "callback_data": "without_debug"},
            ]
        elif stage == "final":
            message_text = (
                f"[{current_time}] HASSLE BOT запущен {verdict} "
                f"с устройства {device_name} (HWID: {hwid_str}) 🎮🔧"
            )
            buttons = []
        url = f"https://api.telegram.org/bot{self.bot_token}/" + (
            "editMessageText" if message_id else "sendMessage"
        )
        payload = {"chat_id": self.chat_id, "text": message_text}
        if message_id:
            payload["message_id"] = message_id
        if buttons:
            payload["reply_markup"] = {"inline_keyboard": [buttons]}
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            new_message_id = (
                response.json().get("result", {}).get("message_id") or message_id
            )
            self.log("[√] Сообщение отправлено/обновлено в Telegram")
            self.telegram_message_id = new_message_id
            return new_message_id
        except Exception:
            self.log("[X] Ошибка: Не удалось отправить сообщение в Telegram")
            return None

    def send_code_choice_message(self, message_id):
        if not self.code_files:
            self.log("[X] Ошибка: Конфигурации не загружены")
            return None
        message_text = "Выберите пользователя для HASSLE BOT:"
        buttons = []
        for i, f in enumerate(self.code_files):
            user_name = f.get('user', f['name'].replace('.js', ''))
            buttons.append({"text": f"{i+1} - {user_name}", "callback_data": f"code_{i}"})
        keyboard = [buttons[i:i+3] for i in range(0, len(buttons), 3)]
        url = f"https://api.telegram.org/bot{self.bot_token}/editMessageText"
        payload = {
            "chat_id": self.chat_id,
            "message_id": message_id,
            "text": message_text,
            "reply_markup": {"inline_keyboard": keyboard},
        }
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Сообщение с выбором пользователя отправлено в Telegram")
            return message_id
        except Exception:
            self.log("[X] Ошибка: Не удалось отправить сообщение с выбором пользователя")
            return None

    def send_account_choice_message(self, message_id):
        message_text = (
            f"Выберите номер аккаунта для пользователя {self.selected_code_name}:\n"
            f"(каждый аккаунт = отдельный Telegram-бот)"
        )
        acc_nums = self.get_local_account_numbers(self.selected_code_name)
        buttons = [{"text": f"#{n}", "callback_data": f"account_{n}"} for n in acc_nums]
        keyboard = [buttons[i:i + 4] for i in range(0, len(buttons), 4)] or [[]]
        url = f"https://api.telegram.org/bot{self.bot_token}/editMessageText"
        payload = {
            "chat_id": self.chat_id,
            "message_id": message_id,
            "text": message_text,
            "reply_markup": {"inline_keyboard": keyboard},
        }
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Сообщение с выбором аккаунта отправлено в Telegram")
        except Exception:
            self.log("[X] Ошибка: Не удалось отправить сообщение с выбором аккаунта")

    def wait_for_account_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 60
        start_time = time.time()
        last_offset = self._get_fresh_offset()
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset, "timeout": 5}
                response = requests.get(url, params=params, timeout=8)
                response.raise_for_status()
                updates = response.json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset) + 1
                    callback_query = update.get("callback_query")
                    if not callback_query:
                        continue
                    if callback_query.get("message", {}).get("message_id") != self.telegram_message_id:
                        continue
                    callback_data = callback_query.get("data", "")
                    self.answer_callback_query(callback_query["id"])
                    if callback_data and callback_data.startswith("account_"):
                        acc_num = callback_data.split("_")[1]
                        self.selected_account_number = acc_num
                        if not self.full_logging:
                            self.root.after(0, lambda n=acc_num: self.update_waiting_message(
                                f"Аккаунт #{n} выбран. Ожидание выбора режима отладки..."))
                        else:
                            self.root.after(0, lambda n=acc_num: self.update_waiting_message(
                                f"Выбран аккаунт #{n}. Ожидание выбора режима отладки..."))
                        self.send_telegram_message(stage="debug_choice", message_id=self.telegram_message_id)
                        threading.Thread(target=self.wait_for_debug_choice, daemon=True).start()
                        return
            except Exception:
                self.root.after(0, lambda: self.log("[X] Ошибка: Не удалось получить ответ от Telegram"))
        self.root.after(0, lambda: self.update_waiting_message("Таймаут выбора аккаунта. Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)

    def delete_telegram_message(self):
        if self.telegram_message_id:
            url = f"https://api.telegram.org/bot{self.bot_token}/deleteMessage"
            payload = {"chat_id": self.chat_id, "message_id": self.telegram_message_id}
            try:
                response = requests.post(url, json=payload, timeout=10)
                response.raise_for_status()
                self.log("[√] Сообщение в Telegram удалено")
            except Exception:
                self.log("[X] Ошибка: Не удалось удалить сообщение в Telegram")
            self.telegram_message_id = None

    def update_waiting_message(self, text):
        self.root.after(0, lambda: self.log(text))

    def answer_callback_query(self, callback_query_id):
        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/answerCallbackQuery"
            payload = {"callback_query_id": callback_query_id}
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Callback подтвержден")
        except Exception as e:
            self.log(f"[X] Ошибка подтверждения callback: {e}")

    def _get_fresh_offset(self):
        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
            r = requests.get(url, params={"offset": -1, "timeout": 0}, timeout=5)
            updates = r.json().get("result", [])
            if updates:
                return updates[-1]["update_id"] + 1
        except Exception:
            pass
        return 0

    def wait_for_telegram_response(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 30
        start_time = time.time()
        last_offset = self._get_fresh_offset()
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset, "timeout": 5}
                response = requests.get(url, params=params, timeout=8)
                response.raise_for_status()
                updates = response.json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset) + 1
                    callback_query = update.get("callback_query")
                    if not callback_query:
                        continue
                    if callback_query.get("message", {}).get("message_id") != self.telegram_message_id:
                        continue
                    callback_data = callback_query.get("data")
                    self.answer_callback_query(callback_query["id"])
                    if callback_data == "allow_launch":
                        self.launch_allowed = True
                        self.root.after(0, lambda: self.update_waiting_message(
                            "Разрешение получено. Загрузка файлов кода..."))
                        if self.fetch_code_files():
                            self.root.after(0, lambda: self.send_code_choice_message(
                                self.telegram_message_id))
                            threading.Thread(target=self.wait_for_code_choice, daemon=True).start()
                        else:
                            self.root.after(0, lambda: self.update_waiting_message(
                                "Ошибка загрузки файлов. Запрещено 🚫"))
                            self.root.after(0, self.delete_telegram_message)
                            self.root.after(2000, self.on_close)
                        return
                    elif callback_data == "deny_launch":
                        self.root.after(0, lambda: self.update_waiting_message("Запрещено 🚫"))
                        self.root.after(0, self.delete_telegram_message)
                        self.root.after(2000, self.on_close)
                        return
            except Exception:
                pass
        self.root.after(0, lambda: self.update_waiting_message("Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)

    def wait_for_code_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 60
        start_time = time.time()
        last_offset = self._get_fresh_offset()
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset, "timeout": 5}
                response = requests.get(url, params=params, timeout=8)
                response.raise_for_status()
                updates = response.json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset) + 1
                    callback_query = update.get("callback_query")
                    if not callback_query:
                        continue
                    if callback_query.get("message", {}).get("message_id") != self.telegram_message_id:
                        continue
                    callback_data = callback_query.get("data", "")
                    self.answer_callback_query(callback_query["id"])
                    if callback_data.startswith("code_"):
                        try:
                            index = int(callback_data.split("_")[1])
                            if 0 <= index < len(self.code_files):
                                selected_file = self.code_files[index]
                                selected_user = selected_file.get(
                                    'user', selected_file['name'].replace('.js', ''))
                                self.selected_code_name = selected_user
                                self.selected_code_url = None
                                if self.full_logging:
                                    self.log(f"[DEBUG] Выбран индекс: {index}, пользователь: {selected_user}")
                                self.last_commit_info = self.fetch_last_commit("Load.js", "HassleB")
                                msg = f"Пользователь {selected_user} выбран. Ожидание выбора режима отладки..."
                                self.root.after(0, lambda m=msg: self.update_waiting_message(m))
                                self.send_telegram_message(stage="debug_choice", message_id=self.telegram_message_id)
                                threading.Thread(target=self.wait_for_debug_choice, daemon=True).start()
                                return
                            else:
                                self.log("[X] Ошибка: Неверный выбор пользователя")
                        except ValueError as e:
                            self.log(f"[X] Ошибка обработки выбора пользователя: {e}")
            except Exception:
                pass
        self.root.after(0, lambda: self.update_waiting_message(
            "Таймаут выбора пользователя. Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)

    def wait_for_debug_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 30
        start_time = time.time()
        last_offset = self._get_fresh_offset()
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset, "timeout": 5}
                response = requests.get(url, params=params, timeout=8)
                response.raise_for_status()
                updates = response.json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset) + 1
                    callback_query = update.get("callback_query")
                    if not callback_query:
                        continue
                    if callback_query.get("message", {}).get("message_id") != self.telegram_message_id:
                        continue
                    callback_data = callback_query.get("data", "")
                    self.answer_callback_query(callback_query["id"])
                    if callback_data == "with_debug":
                        self.full_logging = True
                        self.debug_allowed = True
                        self.root.after(0, lambda: self.update_waiting_message("Разрешено с отладкой 🛠️"))
                        self.root.after(0, lambda: self.log("Режим отладки включен"))
                        self.send_telegram_message(stage="final",
                                                   message_id=self.telegram_message_id,
                                                   verdict="с отладкой 🛠️")
                        self.root.after(2000, self.finalize_launch)
                        return
                    elif callback_data == "without_debug":
                        self.debug_allowed = False
                        self.root.after(0, lambda: self.update_waiting_message("Разрешено без отладки 🚫"))
                        self.root.after(0, lambda: self.log("Запуск без отладки"))
                        self.send_telegram_message(stage="final",
                                                   message_id=self.telegram_message_id,
                                                   verdict="без отладки 🚫")
                        self.root.after(2000, self.finalize_launch)
                        return
            except Exception:
                pass
        self.root.after(0, lambda: self.update_waiting_message("Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)

    def finalize_launch(self):
        if self.full_logging:
            self.load_commit_info = self.fetch_last_commit("Load.js", "HassleB")
            self.script_commit_info = self.fetch_last_commit("hasslebot_exe.py", "installerEXE")
        else:
            self.load_commit_info = ""
            self.script_commit_info = ""
        self.root.after(0, self.setup_gui)
        self.root.after(0, self.initialize_checks)

    def initialize_checks(self):
        memu_found = self.check_memu_installation()
        nox_found = self.check_nox_installation()
        if memu_found or nox_found:
            if not self.download_and_extract_adb():
                self._msgbox("error", "Ошибка", "ADB не готов. Перезапустите программу.")
                return
        else:
            if not self.download_and_extract_adb():
                self._msgbox("error", "Ошибка", "ADB не готов. Перезапустите программу.")
                return
        if not self.check_adb_exists():
            self._msgbox("error", "Ошибка", "ADB не найден. Перезапустите программу.")
            return
        try:
            subprocess.run(
                [str(self.local_adb), "start-server"],
                capture_output=True, timeout=10,
                creationflags=subprocess.CREATE_NO_WINDOW
                if platform.system() == "Windows" else 0,
            )
        except Exception:
            pass
        self.log("[√] Система готова")
        self._set_ready()
        # Авто-определение папок при запуске
        self.root.after(200, self.detect_app_folders)

    # ──────────────────────────────────────────────────────────────────────────
    # HWID / авторизация
    # ──────────────────────────────────────────────────────────────────────────
    def get_hwid(self):
        """Получить уникальный аппаратный идентификатор машины."""
        import hashlib
        parts = []
        if platform.system() == "Windows":
            for cmd, header in [
                (['wmic', 'cpu', 'get', 'ProcessorId'], 'ProcessorId'),
                (['wmic', 'baseboard', 'get', 'SerialNumber'], 'SerialNumber'),
                (['wmic', 'diskdrive', 'get', 'SerialNumber'], 'SerialNumber'),
            ]:
                try:
                    r = subprocess.run(
                        cmd, capture_output=True, text=True,
                        creationflags=subprocess.CREATE_NO_WINDOW,
                    )
                    lines = [l.strip() for l in r.stdout.splitlines()
                             if l.strip() and l.strip() != header]
                    if lines:
                        parts.append(lines[0])
                except Exception:
                    pass
        if not parts:
            parts.append(platform.node())
        combined = '-'.join(parts)
        return hashlib.sha256(combined.encode()).hexdigest()[:16].upper()

    def check_hwid_in_list(self):
        """Проверить HWID в List.js. Возвращает (имя, debug) или (None, None) или ('error', причина)."""
        import re
        url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/List.js"
        try:
            r = requests.get(url, timeout=10)
            r.raise_for_status()
            content = r.text
        except Exception as e:
            return "error", str(e)

        # Ищем все блоки пользователей
        user_pattern = re.compile(r"['\"](\w+)['\"]:\s*\{")
        for m in user_pattern.finditer(content):
            user = m.group(1)
            # Берём кусок текста блока этого пользователя
            chunk = content[m.start(): m.start() + 2000]
            # Ищем HWID в блоке
            hwid_m = re.search(r"HWID\s*:\s*['\"]([A-F0-9a-f]+)['\"]", chunk)
            if not hwid_m:
                continue
            if hwid_m.group(1).upper() != self.hwid:
                continue
            # Совпадение — извлекаем DEBUG
            debug_m = re.search(r"DEBUG\s*:\s*(true|false)", chunk)
            debug = (debug_m.group(1) == "true") if debug_m else False
            return user, debug

        return None, None

    def show_no_access_screen(self, extra_msg=None):
        # Экран 'нет доступа' с возможностью скопировать HWID
        for w in list(self.left_col.winfo_children()):
            w.destroy()
        for w in list(self.nav.winfo_children()):
            w.destroy()
        for w in list(self.side_bottom.winfo_children()):
            w.destroy()
        try:
            self.bottom_bar.grid_remove()
        except Exception:
            pass

        C = self.C
        self._set_state("НЕТ ДОСТУПА", C["red"])
        self._update_side_head()
        try:
            self.hero_sub.configure(text="ДОСТУП ОГРАНИЧЕН")
        except Exception:
            pass

        self.left_col.grid_columnconfigure((0, 1), weight=1, uniform="cols")
        card = ctk.CTkFrame(
            self.left_col, fg_color=C["card"], corner_radius=10,
            border_width=1, border_color=C["red_dark"],
        )
        card.grid(row=0, column=0, columnspan=2, padx=70, pady=(6, 10), sticky="ew")
        card.grid_columnconfigure(0, weight=1)

        ctk.CTkFrame(card, height=3, corner_radius=0, fg_color=C["red"]).grid(
            row=0, column=0, sticky="ew", padx=1, pady=(1, 0))

        ctk.CTkLabel(
            card, text="НЕТ ДОСТУПА", font=self.F("condb", 30), text_color=C["red"],
        ).grid(row=1, column=0, pady=(18, 4))

        if extra_msg:
            ctk.CTkLabel(
                card, text=extra_msg, font=self.F("body", 11), text_color=C["subtext"],
            ).grid(row=2, column=0, pady=(0, 8))

        ctk.CTkLabel(
            card, text="ВАШ HWID ДЛЯ ПОЛУЧЕНИЯ ДОСТУПА", font=self.F("cond", 13),
            text_color=C["muted"],
        ).grid(row=3, column=0, pady=(6, 6))

        hwid_box = ctk.CTkFrame(card, fg_color=C["card2"], corner_radius=8,
                                border_width=1, border_color=C["border2"])
        hwid_box.grid(row=4, column=0, padx=60, pady=(0, 14), sticky="ew")
        hwid_box.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(
            hwid_box, text=self.hwid or "UNKNOWN",
            font=self.F("mono", 18), text_color=C["accent2"],
        ).grid(row=0, column=0, padx=14, pady=14)

        copy_holder = {}

        def _copy():
            self.root.clipboard_clear()
            self.root.clipboard_append(self.hwid or "")
            b = copy_holder["b"].btn
            b.configure(text="СКОПИРОВАНО ✓")
            self.root.after(2000, lambda: b.configure(text="СКОПИРОВАТЬ HWID"))

        copy_btn = self._btn_primary(card, "СКОПИРОВАТЬ HWID", _copy, height=44, size=16)
        copy_holder["b"] = copy_btn
        copy_btn.grid(row=5, column=0, padx=60, pady=(0, 10), sticky="ew")

        ctk.CTkLabel(
            card,
            text="Скопируйте HWID и отправьте его владельцу для получения доступа",
            font=self.F("body", 10), text_color=C["muted"], wraplength=420,
        ).grid(row=6, column=0, pady=(0, 20))

        self._nav_item(self.side_bottom, "Выход", self.on_close, danger=True)

    def activate_launch_permission(self):
        self.hwid = self.get_hwid()
        self.log(f"HWID: {self.hwid}")
        self.log("Проверка доступа в List.js...")

        name, debug = self.check_hwid_in_list()

        if name == "error":
            self.log(f"[X] Ошибка: Не удалось загрузить List.js ({debug})")
            self.root.after(0, lambda: self.show_no_access_screen("Ошибка подключения к серверу"))
            return

        if name is None:
            self.log("[!] HWID не найден — доступ запрещён")
            threading.Thread(
                target=lambda: self.send_telegram_message(stage="unknown_hwid"),
                daemon=True,
            ).start()
            self.root.after(0, self.show_no_access_screen)
            return

        # HWID найден — авторизация
        self.launch_allowed     = True
        self.full_logging       = debug
        self.debug_allowed      = debug
        self.selected_code_name = name

        self.log(f"[√] Доступ разрешён: {name}" + (" (с отладкой)" if debug else ""))

        if self.fetch_code_files():
            self.root.after(0, self.finalize_launch)
        else:
            self.log("[X] Ошибка: Не удалось загрузить конфигурации")
            self.root.after(2000, self.on_close)

    def activate_debug_mode(self):
        if self.debug_allowed:
            self.full_logging = True
            self.log("Режим отладки активирован")
            self.update_gui()
        else:
            self.log("[X] Ошибка: Отладка не разрешена")

    # ──────────────────────────────────────────────────────────────────────────
    # Диалог выбора аккаунта (переработан в стиле сайта)
    # ──────────────────────────────────────────────────────────────────────────
    def show_replace_warning(self, app_folder):
        C = self.C
        acc_nums = self.get_local_account_numbers(self.selected_code_name)
        acc_rows = max(1, (len(acc_nums) + 7) // 8)
        DW, DH = 420, 268 + 48 * (acc_rows - 1)
        dialog, body = self._dialog(
            "Выбор аккаунта", DW, DH, sub=f"игрок: {self.selected_code_name or '—'}"
        )

        ctk.CTkLabel(
            body, text="ВЫБЕРИТЕ НОМЕР АККАУНТА", font=self.F("cond", 14),
            text_color=C["subtext"],
        ).pack(pady=(20, 10))

        acc_var = ctk.StringVar(
            value=self.selected_account_number
            if self.selected_account_number in acc_nums else ''
        )
        grid = ctk.CTkFrame(body, fg_color="transparent")
        grid.pack()
        acc_buttons = {}

        def select_acc(n):
            acc_var.set(n)
            for num, btn in acc_buttons.items():
                sel = (num == n)
                btn.configure(
                    fg_color=C["accent"] if sel else C["card2"],
                    text_color=C["btntext"] if sel else C["subtext"],
                    border_color=C["accent"] if sel else C["border2"],
                )

        if not acc_nums:
            ctk.CTkLabel(
                grid, text="Токены аккаунтов ещё не добавлены",
                font=self.F("body", 11), text_color=C["muted"],
            ).grid(row=0, column=0, pady=(0, 10))
            self._btn_primary(
                grid, "ДОБАВИТЬ ТОКЕНЫ",
                lambda: (dialog.destroy(), self.open_local_account_manager()),
                height=38, size=15,
            ).grid(row=1, column=0)

        for idx, n in enumerate(acc_nums):
            is_sel = (n == acc_var.get())
            btn = ctk.CTkButton(
                grid, text=f"#{n}",
                width=40, height=40,
                font=self.F("condb", 15),
                fg_color=C["accent"] if is_sel else C["card2"],
                hover_color=C["accent2"],
                text_color=C["btntext"] if is_sel else C["subtext"],
                border_width=1,
                border_color=C["accent"] if is_sel else C["border2"],
                corner_radius=6,
                command=lambda x=n: select_acc(x),
            )
            btn.grid(row=idx // 8, column=idx % 8, padx=3, pady=3)
            acc_buttons[n] = btn

        def on_start():
            chosen = acc_var.get()
            if not chosen:
                self.log("[X] Ошибка: Номер аккаунта не выбран")
                return
            self.selected_account_number = chosen
            dialog.destroy()
            threading.Thread(
                target=lambda: self._with_progress(
                    lambda: self._run_on_targets(self.replace_with_code, app_folder)),
                daemon=True,
            ).start()

        bot = ctk.CTkFrame(body, fg_color="transparent")
        bot.pack(side="bottom", fill="x", padx=24, pady=(0, 20))
        bot.grid_columnconfigure(0, weight=1)
        bot.grid_columnconfigure(1, weight=1)
        self._btn_ghost(bot, "ОТМЕНА", dialog.destroy, height=44).grid(
            row=0, column=0, sticky="ew", padx=(0, 6))
        self._btn_primary(bot, "УСТАНОВИТЬ", on_start, height=41, size=16).grid(
            row=0, column=1, sticky="ew", padx=(6, 0))

    # ──────────────────────────────────────────────────────────────────────────
    # Диалог скачивания .js (переработан)
    # ──────────────────────────────────────────────────────────────────────────
    def open_js_downloader(self):
        app_folder = self.app_var.get()
        if not app_folder:
            self.log("[X] Ошибка: Папка приложения не выбрана")
            return
        if not self.select_connection():
            self.log("[X] Ошибка: Устройство не подключено")
            return

        C = self.C
        import tkinter as tk
        dialog, body = self._dialog("Скачать .js файлы", 480, 560)

        # Поиск
        search_var = tk.StringVar()
        sf = ctk.CTkFrame(body, fg_color="transparent")
        sf.pack(fill="x", padx=16, pady=(14, 0))
        self._entry(sf, "Поиск файла…", height=36, textvariable=search_var).pack(fill="x")

        # Список файлов
        list_frame = ctk.CTkScrollableFrame(
            body, fg_color=C["card"], corner_radius=10,
            border_width=1, border_color=C["border"],
            scrollbar_button_color=C["border2"],
            scrollbar_button_hover_color=C["accent"],
        )
        list_frame.pack(fill="both", expand=True, padx=16, pady=(10, 4))

        status_lbl = ctk.CTkLabel(
            body, text="Загрузка списка файлов…",
            font=self.F("cond", 13), text_color=C["subtext"],
        )
        status_lbl.pack(pady=(4, 2))

        dl_holder = self._btn_primary(body, "СКАЧАТЬ ВЫБРАННЫЕ", None, height=46, size=17)
        dl_holder.pack(fill="x", padx=16, pady=(4, 16))
        dl_btn = dl_holder.btn
        dl_btn.configure(state="disabled")

        check_vars = {}
        all_files = []

        def render_list(filter_text=""):
            for w in list_frame.winfo_children():
                w.destroy()
            query = filter_text.strip().lower()
            visible = [f for f in all_files if query in f.lower()] if query else all_files
            if not visible:
                ctk.CTkLabel(
                    list_frame,
                    text="НИЧЕГО НЕ НАЙДЕНО" if query else "ФАЙЛЫ .JS НЕ НАЙДЕНЫ",
                    font=self.F("cond", 14), text_color=C["muted"],
                ).pack(pady=14)
                return
            for fname in visible:
                if fname not in check_vars:
                    check_vars[fname] = tk.BooleanVar(value=False)
                row_f = ctk.CTkFrame(list_frame, fg_color="transparent")
                row_f.pack(fill="x", pady=2)
                ctk.CTkCheckBox(
                    row_f, text=fname, variable=check_vars[fname],
                    font=self.F("mono", 11), text_color=C["text"],
                    fg_color=C["accent"], hover_color=C["accent2"],
                    checkmark_color=C["btntext"], border_color=C["border2"],
                    corner_radius=4, checkbox_width=20, checkbox_height=20,
                ).pack(side="left", padx=6)

        def on_search(*_):
            render_list(search_var.get())

        search_var.trace("w", on_search)

        def populate(files):
            all_files.clear()
            all_files.extend(files)
            check_vars.clear()
            if not files:
                status_lbl.configure(text="ФАЙЛЫ НЕ НАЙДЕНЫ")
                render_list()
                return
            status_lbl.configure(text=f"НАЙДЕНО ФАЙЛОВ: {len(files)}")
            render_list(search_var.get())
            dl_btn.configure(state="normal")

        def fetch_files():
            remote_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
            try:
                cmd = [self.adb_path] + self.device_param + ["shell", "ls", remote_path]
                result = subprocess.run(
                    cmd, capture_output=True, text=True,
                    creationflags=subprocess.CREATE_NO_WINDOW
                    if platform.system() == "Windows" else 0,
                )
                if result.returncode != 0:
                    dialog.after(0, lambda: status_lbl.configure(
                        text="ОШИБКА: НЕ УДАЛОСЬ ПОЛУЧИТЬ СПИСОК ФАЙЛОВ"))
                    return
                files = sorted([
                    f.strip() for f in result.stdout.splitlines()
                    if f.strip().endswith(".js")
                ])
                dialog.after(0, lambda: populate(files))
            except Exception as e:
                dialog.after(0, lambda: status_lbl.configure(text=f"ОШИБКА: {e}"))

        def do_download():
            selected = [fname for fname, var in check_vars.items() if var.get()]
            if not selected:
                status_lbl.configure(text="ВЫБЕРИТЕ ХОТЯ БЫ ОДИН ФАЙЛ")
                return
            dl_btn.configure(state="disabled", text="СКАЧИВАНИЕ…")
            threading.Thread(
                target=lambda: self.download_js_files(
                    app_folder, selected, status_lbl, dl_btn, dialog),
                daemon=True,
            ).start()

        dl_btn.configure(command=do_download)
        threading.Thread(target=fetch_files, daemon=True).start()

    def download_js_files(self, app_folder, files, status_lbl, dl_btn, dialog):
        remote_base = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        desktop = self._get_desktop_path()
        save_dir = desktop / "HassleBot" / self._get_device_folder_name() / "JsDownload"
        save_dir.mkdir(parents=True, exist_ok=True)
        total = len(files)
        ok = 0
        for i, fname in enumerate(files, 1):
            dialog.after(0, lambda i=i, f=fname: status_lbl.configure(
                text=f"СКАЧИВАНИЕ {i}/{total}: {f}"))
            remote_file = f"{remote_base}/{fname}"
            local_file = save_dir / fname
            try:
                cmd = [self.adb_path] + self.device_param + ["pull", remote_file, str(local_file)]
                result = subprocess.run(
                    cmd, capture_output=True, text=True,
                    creationflags=subprocess.CREATE_NO_WINDOW
                    if platform.system() == "Windows" else 0,
                )
                if result.returncode == 0:
                    ok += 1
                    self.log(f"[√] Скачан: {fname}")
                else:
                    self.log(f"[X] Ошибка: {fname}")
            except Exception as e:
                self.log(f"[X] Ошибка {fname}: {e}")

        def finish():
            status_lbl.configure(text=f"ГОТОВО: {ok}/{total} ФАЙЛОВ")
            dl_btn.configure(state="normal", text="СКАЧАТЬ ВЫБРАННЫЕ")
            self.log(f"[√] JsDownload: скачано {ok}/{total} файлов в {save_dir}")

        dialog.after(0, finish)

    def _get_device_folder_name(self):
        mapping = {
            "Физическое": "Физическое",
            "Клон (999)": "Клон",
            "MEmu": "MEmu",
            "NOX": "NOX",
        }
        return mapping.get(self.conn_var.get(), "Устройство")

    def _get_desktop_path(self):
        if platform.system() == "Windows":
            try:
                import winreg
                key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                    r"Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders")
                desktop, _ = winreg.QueryValueEx(key, "Desktop")
                winreg.CloseKey(key)
                return Path(desktop)
            except Exception:
                pass
        for candidate in [Path.home() / "Desktop", Path.home() / "Рабочий стол"]:
            if candidate.exists():
                return candidate
        return Path.home()

    # ──────────────────────────────────────────────────────────────────────────
    # ADB / устройства
    # ──────────────────────────────────────────────────────────────────────────
    def check_memu_installation(self):
        for path in self.memu_paths:
            if Path(path).exists():
                self.memu_path = path
                self.memu_adb = path.replace("MEmu.exe", "adb.exe")
                self.log("[√] Успешно: Эмулятор MEmu найден" if not self.full_logging
                         else "[√] Выполнено: Эмулятор MEmu найден")
                return True
        self.log("[X] Ошибка: Эмулятор MEmu не найден")
        return False

    def check_nox_installation(self):
        for path in self.nox_paths:
            if Path(path).exists():
                self.nox_path = path
                self.nox_adb = path.replace("Nox.exe", "nox_adb.exe")
                self.log("[√] Успешно: Эмулятор NOX найден" if not self.full_logging
                         else "[√] Выполнено: Эмулятор NOX найден")
                return True
        self.log("[X] Ошибка: Эмулятор NOX не найден")
        return False

    def download_and_extract_adb(self):
        if (self.temp_adb_dir / "adb").exists():
            self.log("[√] Успешно: ADB готов" if not self.full_logging
                     else "[√] Выполнено: ADB готов")
            return True
        try:
            self.log("Загрузка ADB..." if not self.full_logging
                     else "Скачиваем adb.zip во временную папку...")
            response = requests.get(
                "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/adb.zip",
                timeout=30,
            )
            response.raise_for_status()
            with open(self.adb_zip_path, 'wb') as f:
                f.write(response.content)
            self.log("Распаковка ADB..." if not self.full_logging
                     else "Распаковка adb.zip во временную папку...")
            with zipfile.ZipFile(self.adb_zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.temp_adb_dir)
            if not (self.temp_adb_dir / "adb").exists():
                self.log("[X] Ошибка: Не удалось распаковать ADB")
                return False
            self.log("[√] Успешно: ADB готов" if not self.full_logging
                     else "[√] Выполнено: ADB готов")
            return True
        except Exception as e:
            self.log("[X] Ошибка: Не удалось загрузить ADB" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка загрузки ADB: {e}")
            return False

    def check_adb_exists(self):
        if not self.local_adb.exists():
            self.log("[X] Ошибка: ADB не найден")
            return False
        return True

    def download_code(self, url):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            code = response.text.strip()
            if not code:
                self.log("[X] Ошибка: Код пуст")
                return None
            code = code.replace('\r\n', '\n').replace('\r', '\n').strip() + '\n'
            self.log("[√] Успешно: Код загружен" if not self.full_logging
                     else "[√] Выполнено: Код загружен")
            return code
        except Exception as e:
            self.log("[X] Ошибка: Не удалось загрузить код" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка загрузки кода: {e}")
            return None

    def remove_old_code(self, content, new_code):
        if not content:
            return content
        START_MARKER = "// === HASSLE LOAD BOT CODE START ==="
        END_MARKER = "// === HASSLE LOAD BOT CODE END ==="
        start_idx = content.find(START_MARKER)
        if start_idx != -1:
            end_idx = content.find(END_MARKER, start_idx + len(START_MARKER))
            if end_idx != -1:
                removed_content = content[:start_idx] + content[end_idx + len(END_MARKER):]
                if self.full_logging:
                    self.log("[√] Выполнено: Удалён старый код по маркерам")
                return removed_content.rstrip() + '\n'
        if self.full_logging:
            self.log("[!] Предупреждение: Маркеры не найдены, вставка в конец без удаления")
        return content.rstrip() + '\n'

    def select_connection(self):
        if not self.local_adb.exists() and not self.memu_adb and not self.nox_adb:
            self.log("[X] Ошибка: ADB не готов")
            return False
        conn_choice = self.conn_var.get()
        if conn_choice == "Физическое":
            if not self.local_adb.exists():
                self.log("[X] Ошибка: ADB не готов")
                return False
            self.adb_path = str(self.local_adb)
            self.storage_path = "/sdcard/Android/data"
            return self.check_physical_device()
        elif conn_choice == "Клон (999)":
            if not self.local_adb.exists():
                self.log("[X] Ошибка: ADB не готов")
                return False
            self.adb_path = str(self.local_adb)
            self.storage_path = "/storage/emulated/999/Android/data"
            return self.check_physical_device()
        elif conn_choice == "MEmu":
            if self.memu_adb and Path(self.memu_adb).exists():
                self.adb_path = self.memu_adb
            else:
                if not self.local_adb.exists():
                    self.log("[X] Ошибка: ADB не готов")
                    return False
                self.adb_path = str(self.local_adb)
            self.storage_path = "/sdcard/Android/data"
            return self.check_memu_device()
        elif conn_choice == "NOX":
            if self.nox_adb and Path(self.nox_adb).exists():
                self.adb_path = self.nox_adb
            else:
                if not self.local_adb.exists():
                    self.log("[X] Ошибка: ADB не готов")
                    return False
                self.adb_path = str(self.local_adb)
            self.storage_path = "/sdcard/Android/data"
            return self.check_nox_device()
        return False

    def check_physical_device(self):
        try:
            self.log("Проверка подключения...")
            result = subprocess.run(
                [self.adb_path, "devices"], capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if "device" not in result.stdout:
                self.log("[X] Ошибка: Устройство не найдено")
                return False
            lines = result.stdout.strip().split('\n')
            device_found = False
            for line in lines:
                if "\tdevice" in line and "127.0.0.1:" not in line:
                    device_id = line.split('\t')[0].strip()
                    self.device_param = ["-s", device_id]
                    self.log("[√] Успешно: Устройство подключено" if not self.full_logging
                             else "[√] Выполнено: Устройство подключено")
                    device_found = True
                    break
            if not device_found:
                self.device_param = []
                self.log("[√] Успешно: Устройство подключено" if not self.full_logging
                         else "[√] Выполнено: Устройство подключено")
            return True
        except Exception as e:
            self.log("[X] Ошибка: Не удалось проверить устройство" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка проверки устройства: {e}")
            return False

    def check_memu_device(self):
        self.log("Проверка подключения..." if not self.full_logging
                 else "Проверка подключения к MEmu...")
        memu_ports = ["21503", "21513", "21523"]
        for port in memu_ports:
            try:
                subprocess.run(
                    [self.adb_path, "connect", f"127.0.0.1:{port}"],
                    capture_output=True, timeout=10,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                )
                result = subprocess.run(
                    [self.adb_path, "-s", f"127.0.0.1:{port}", "get-state"],
                    capture_output=True, text=True, timeout=10,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                )
                if result.returncode == 0:
                    self.device_param = ["-s", f"127.0.0.1:{port}"]
                    self.log("[√] Успешно: Подключено к эмулятору MEmu" if not self.full_logging
                             else "[√] Выполнено: Подключено к эмулятору MEmu")
                    return True
            except Exception:
                continue
        self.log("[X] Ошибка: Эмулятор MEmu не отвечает")
        return False

    def _is_port_open(self, port, host="127.0.0.1", timeout=0.5):
        try:
            with socket.create_connection((host, int(port)), timeout=timeout):
                return True
        except OSError:
            return False

    def check_nox_device(self):
        self.log("Проверка подключения к NOX...")
        nox_ports = ["62001", "62025", "62026", "62027", "62031", "5555", "7555"]
        found = []
        for port in nox_ports:
            if not self._is_port_open(port):
                if self.full_logging:
                    self.log(f"[DEBUG] Порт {port} закрыт, пропуск")
                continue
            if self.full_logging:
                self.log(f"[√] NOX найден на порту {port}")
            try:
                subprocess.run(
                    [self.adb_path, "connect", f"127.0.0.1:{port}"],
                    capture_output=True, text=True, timeout=5,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                )
                result = subprocess.run(
                    [self.adb_path, "-s", f"127.0.0.1:{port}", "get-state"],
                    capture_output=True, text=True, timeout=5,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                )
                if result.returncode == 0 and "device" in result.stdout:
                    found.append(port)
            except Exception as e:
                if self.full_logging:
                    self.log(f"[DEBUG] Порт {port} — ошибка ADB: {e}")
                continue
        if not found:
            self.log("[X] Ошибка: Эмулятор NOX не отвечает")
            self.log("[!] Проверьте: 1) NOX запущен? 2) Включён ADB (Настройки > Рабочий стол > Открыть ADB)?")
            self.nox_active_devices = []
            return False
        self.nox_active_devices = [
            {"port": p, "label": f"NOX {i+1}", "param": ["-s", f"127.0.0.1:{p}"]}
            for i, p in enumerate(found)
        ]
        self.device_param = self.nox_active_devices[0]["param"]
        self.log(f"[√] Подключено к NOX: найдено экземпляров — {len(found)}")
        return True

    def select_app_folder(self):
        return self.app_var.get()

    def _get_nox_targets(self):
        if (self.conn_var.get() == "NOX"
                and len(self.nox_active_devices) >= 2
                and hasattr(self, 'nox_target_var')
                and self.nox_target_var
                and self.nox_target_var.get() == "Оба сразу"):
            return self.nox_active_devices
        return None

    def _run_on_targets(self, func, app_folder):
        targets = self._get_nox_targets()
        if targets:
            orig_param = self.device_param[:]
            for inst in targets:
                self.log(f"[→] Выполняется на {inst['label']} (порт {inst['port']})")
                self.device_param = inst["param"]
                func(app_folder)
            self.device_param = orig_param
        else:
            func(app_folder)

    def execute_action(self, action):
        def run_action():
            if not self.launch_allowed:
                self.log("[X] Ошибка: Нет разрешения на запуск")
                return
            if action not in ["3"] and not self.selected_code_name:
                self.log("[X] Ошибка: Пользователь не выбран")
                return
            if not self.select_connection():
                self.log("[X] Ошибка: Устройство не подключено")
                return
            app_folder = self.select_app_folder()
            if action not in [] and not app_folder:
                self.log("[X] Ошибка: Папка приложения не выбрана")
                return
            if self.full_logging and self.selected_code_name:
                self.log(f"Используется конфигурация пользователя: {self.selected_code_name}, "
                         f"аккаунт: #{self.selected_account_number or '?'}")
            if action == "1":
                # Диалог tkinter нельзя создавать из фонового потока
                self.root.after(0, lambda: self.show_replace_warning(app_folder))
            elif action == "2":
                self._run_on_targets(self.download_without_code, app_folder)
            elif action == "3":
                self._run_on_targets(self.check_files, app_folder)
            elif action == "4":
                self.simple_download(app_folder)

        def _wrapped():
            if action == "1":
                run_action()          # для установки прогресс запускается после выбора аккаунта
            else:
                self._with_progress(run_action)

        threading.Thread(target=_wrapped, daemon=True).start()

    def get_hassle_folders(self, param=None, storage=None):
        param = param or self.device_param
        storage = storage or self.storage_path
        cmd = [self.adb_path] + param + ["shell", "ls", "-1", storage]
        result = subprocess.run(
            cmd, capture_output=True, text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
        )
        if result.returncode == 0:
            return [
                f.strip() for f in result.stdout.splitlines()
                if f.strip().startswith("com.hassle.online")
                and not f.strip().startswith("1com.hassle.online")
            ]
        return []

    def simple_obfuscate(self, code):
        codes = [ord(c) for c in code]
        return (
            f"eval([{','.join(map(str, codes))}]"
            f".map(function(c){{return String.fromCharCode(c)}}).join(''));"
        )

    def replace_with_code(self, app_folder):
        # Снимаем снапшот ADB-состояния до старта операции —
        # защита от гонки: detect_app_folders в фоне может изменить self.device_param
        adb_path     = self.adb_path
        device_param = list(self.device_param)
        target_path  = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        source_file  = f"{target_path}/Hud.js"
        try:
            self.log("Скачивание файла..." if not self.full_logging
                     else f"Скачивание файла {source_file} для обработки...")
            cmd = [adb_path] + device_param + ["pull", source_file, str(self.temp_file)]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode != 0:
                self.log("[X] Ошибка: Не удалось получить файл" if not self.full_logging
                         else f"[X] Не выполнено: Не удалось получить файл: {result.stderr}")
                return
            try:
                with open(self.temp_file, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                self.log("[X] Ошибка: Не удалось декодировать файл Hud.js")
                return
            if not content:
                self.log("[X] Ошибка: Файл Hud.js пуст")
                return
            load_url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/Load.js"
            load_code = self.download_code(load_url)
            if not load_code:
                return
            user_name = self.selected_code_name
            acc_num = self.selected_account_number or ''
            load_code = load_code.replace("const currentUser = '';", f"const currentUser = '{user_name}';")
            load_code = load_code.replace("const accountNumber = '';", f"const accountNumber = '{acc_num}';")
            acc_token = self.get_local_account_token(user_name, acc_num) or ''
            if not re.fullmatch(self.TOKEN_RE, acc_token):
                acc_token = ''
            if acc_token:
                self.log(f"[√] Токен аккаунта #{acc_num} взят из локального хранилища")
            else:
                self.log(f"[!] Локальный токен для аккаунта #{acc_num} не найден — добавьте его в «Токены аккаунтов»")
            load_code = load_code.replace("const accountToken = '';", f"const accountToken = '{acc_token}';")
            if self.full_logging:
                self.log(f"Используется конфигурация пользователя: {user_name}, аккаунт: #{acc_num}")
                self.log("Поиск и удаление старого кода по маркерам...")
            content = self.remove_old_code(content, load_code)
            start_marker = "// === HASSLE LOAD BOT CODE START ===\n"
            end_marker = "\n// === HASSLE LOAD BOT CODE END ===\n"
            obfuscated_code = self.simple_obfuscate(load_code)
            new_content = content + start_marker + obfuscated_code + end_marker
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
            target_file = self.hud_file if self.full_logging else self.temp_file
            with open(target_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
            if self.full_logging:
                self.log(f"Размер нового файла: {os.path.getsize(target_file)} байт")
                self.log("[√] Выполнено: Новый код добавлен с маркерами и simple обфускацией")
            self.log("Копирование файла..." if not self.full_logging
                     else f"Копирование файла {target_file} на устройство в {target_path}/Hud.js...")
            cmd = [adb_path] + device_param + ["push", str(target_file), f"{target_path}/Hud.js"]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log("[√] Успешно: Файл заменен" if not self.full_logging
                         else f"[√] Выполнено: Файл заменен с конфигурацией пользователя {user_name}")
                self.replace_loader_files(target_path, adb_path, device_param)
            else:
                self.log("[X] Ошибка: Не удалось заменить файл" if not self.full_logging
                         else f"[X] Не выполнено: Ошибка замены файла: {result.stderr}")
        except Exception as e:
            self.log("[X] Ошибка: Не удалось обработать файл" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка обработки: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()

    def replace_loader_files(self, target_path, adb_path, device_param):
        """Параллельно скачивает все файлы из Загрузчики и заливает одной командой adb push."""
        from urllib.parse import quote
        from concurrent.futures import ThreadPoolExecutor, as_completed
        api_url = (
            "https://api.github.com/repos/BensonZahar/Hud.js/contents/HassleB/"
            + quote("Загрузчики")
        )
        self.log("Обновление файлов из Загрузчики..." if not self.full_logging
                 else f"Запрос списка файлов: {api_url}...")
        try:
            resp = requests.get(api_url, timeout=10)
            resp.raise_for_status()
            entries = resp.json()
        except Exception as e:
            self.log("[X] Ошибка: Не удалось получить список файлов" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка запроса GitHub API Загрузчики: {e}")
            return

        file_entries = [e for e in entries if e.get("type") == "file"]
        if not file_entries:
            self.log("[!] Загрузчики: файлы не найдены на GitHub")
            return

        if self.full_logging:
            self.log(f"Найдено файлов в Загрузчики ({len(file_entries)}): "
                     + ", ".join(e["name"] for e in file_entries))

        # ── Параллельное скачивание ──────────────────────────────────────────
        def download_one(entry):
            filename = entry["name"]
            url = entry.get("download_url")
            if not url:
                return filename, None, "Нет ссылки"
            temp_path = self.script_dir / f"temp_loader_{filename}.tmp"
            try:
                r = requests.get(url, timeout=15)
                r.raise_for_status()
                temp_path.write_bytes(r.content)
                return filename, temp_path, None
            except Exception as exc:
                return filename, None, str(exc)

        downloaded = {}   # filename → temp_path
        workers = min(4, len(file_entries))
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {pool.submit(download_one, e): e["name"] for e in file_entries}
            for future in as_completed(futures):
                filename, temp_path, err = future.result()
                if err:
                    self.log(f"[X] Ошибка: {filename} — {err}" if not self.full_logging
                             else f"[X] Не выполнено: Скачивание {filename}: {err}")
                else:
                    downloaded[filename] = temp_path
                    if self.full_logging:
                        self.log(f"Скачан: {filename} ({temp_path.stat().st_size} байт)")

        if not downloaded:
            self.log("[X] Ошибка: Ни один файл из Загрузчики не скачан")
            return

        # ── Пушим каждый файл отдельно (совместимо с любой версией ADB) ──────
        try:
            ok_count = 0
            for filename, temp_path in downloaded.items():
                cmd = [adb_path] + device_param + [
                    "push", str(temp_path), f"{target_path}/{filename}"
                ]
                push_result = subprocess.run(
                    cmd, capture_output=True, text=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                )
                if push_result.returncode == 0:
                    ok_count += 1
                    self.log(f"[√] Успешно: {filename} заменён" if not self.full_logging
                             else f"[√] Выполнено: {filename} → {target_path}")
                else:
                    self.log(f"[X] Ошибка: Не удалось залить {filename}" if not self.full_logging
                             else f"[X] Не выполнено: push {filename}: {push_result.stderr.strip()}")
            if self.full_logging and ok_count == len(downloaded):
                self.log(f"[√] Выполнено: все {ok_count} файлов из Загрузчики обновлены")
        finally:
            for temp_path in downloaded.values():
                try:
                    if temp_path.exists():
                        temp_path.unlink()
                except Exception:
                    pass

    def download_without_code(self, app_folder):
        adb_path     = self.adb_path
        device_param = list(self.device_param)
        target_path  = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        source_file  = f"{target_path}/Hud.js"
        try:
            self.log("Скачивание файла..." if not self.full_logging
                     else f"Скачивание файла {source_file}...")
            cmd = [adb_path] + device_param + ["pull", source_file, str(self.temp_file)]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode != 0:
                self.log("[X] Ошибка: Не удалось получить файл" if not self.full_logging
                         else f"[X] Не выполнено: Не удалось получить файл: {result.stderr}")
                return
            try:
                with open(self.temp_file, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                self.log("[X] Ошибка: Не удалось декодировать файл Hud.js")
                return
            if not content:
                self.log("[X] Ошибка: Файл Hud.js пуст")
                return
            if self.full_logging:
                self.log("Удаление кода из файла...")
            content = self.remove_old_code(content, "")
            target_file = self.hud_nocode_file if self.full_logging else self.temp_file
            with open(target_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            if self.full_logging:
                self.log(f"Размер нового файла: {os.path.getsize(target_file)} байт")
                self.log("[√] Выполнено: Код удален из файла")
            self.log("Копирование файла..." if not self.full_logging
                     else f"Копирование файла {target_file} на устройство в {target_path}/Hud.js...")
            cmd = [adb_path] + device_param + ["push", str(target_file), f"{target_path}/Hud.js"]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log("[√] Успешно: Файл заменен" if not self.full_logging
                         else "[√] Выполнено: Файл заменен без кода")
            else:
                self.log("[X] Ошибка: Не удалось заменить файл" if not self.full_logging
                         else f"[X] Не выполнено: Ошибка замены файла: {result.stderr}")
        except Exception as e:
            self.log("[X] Ошибка: Не удалось обработать файл" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка обработки: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()

    def check_files(self, app_folder):
        adb_path     = self.adb_path
        device_param = list(self.device_param)
        target_path = f"{self.storage_path}/{app_folder}/files/Assets"
        files_to_check = [
            f"{target_path}/resources_version.txt",
            f"{target_path}/webview/assets/Hud.js",
        ]
        try:
            self.log("Проверка файлов...")
            cmd = [adb_path] + device_param + ["shell", "ls", files_to_check[1]]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log("[√] Успешно: Файл найден" if not self.full_logging else "[√] Файл найден")
                if self.full_logging:
                    cmd_size = [adb_path] + device_param + [
                        "shell", "stat", "-c", "%s", files_to_check[1]]
                    size_result = subprocess.run(
                        cmd_size, capture_output=True, text=True,
                        creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                    )
                    if size_result.returncode == 0:
                        self.log(f"Размер файла: {size_result.stdout.strip()} байт")
            cmd = [adb_path] + device_param + ["shell", "ls", files_to_check[0]]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log("[√] Успешно: Файл найден, удаление..." if not self.full_logging
                         else f"[√] Файл найден: {files_to_check[0]}, удаление...")
                cmd_rm = [adb_path] + device_param + [
                    "shell", "rm", "-f", files_to_check[0]]
                rm_result = subprocess.run(
                    cmd_rm, capture_output=True, text=True,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                )
                if rm_result.returncode == 0:
                    self.log("[√] Успешно: Файл удален" if not self.full_logging else "[√] Файл удален")
                else:
                    self.log("[X] Ошибка: Не удалось удалить файл")
            else:
                self.log("[X] Ошибка: Файл не найден" if not self.full_logging
                         else f"[X] Файл не найден: {files_to_check[0]}")
        except Exception as e:
            self.log("[X] Ошибка: Не удалось проверить файлы" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка проверки: {e}")

    def simple_download(self, app_folder):
        adb_path     = self.adb_path
        device_param = list(self.device_param)
        if not self.full_logging:
            self.log("[X] Ошибка: Скачивание отключено")
            return
        target_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        source_file = f"{target_path}/Hud.js"
        try:
            desktop = self._get_desktop_path()
            hassle_folder = desktop / "HassleBot" / self._get_device_folder_name()
            hassle_folder.mkdir(parents=True, exist_ok=True)
            save_path = hassle_folder / "Hud.js"
            self.log(f"Скачивание файла {source_file}...")
            cmd = [adb_path] + device_param + ["pull", source_file, str(save_path)]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log(f"[√] Успешно! Файл скачан: {save_path}")
            else:
                self.log("[X] Ошибка скачивания файла")
        except Exception as e:
            self.log(f"[X] Ошибка: {e}")

    # ──────────────────────────────────────────────────────────────────────────
    # Уведомления (toast)
    # ──────────────────────────────────────────────────────────────────────────
    def log(self, message):
        """Потокобезопасный лог: вывод в консоль сразу, GUI — только через main-thread."""
        print(f"{datetime.now().strftime('%H:%M:%S')}: {message}")
        if not hasattr(self, '_notif_strip'):
            return
        # Никогда не трогаем tkinter-виджеты напрямую из фонового потока —
        # только через root.after(), иначе рушится весь widget-tree.
        self.root.after(0, lambda msg=message: self._log_gui(msg))

    def _log_gui(self, message):
        # Исполняется только на главном потоке (через root.after)
        try:
            if not self._notif_strip.winfo_exists():
                return
        except Exception:
            return

        C = self.C
        if message.startswith('[√]'):
            bar, level, clean = C["green"], "ok", message[4:].strip()
        elif message.startswith('[X]'):
            bar, level, clean = C["red"], "err", message[4:].strip()
            self._run_errors = True
        elif message.startswith('[!]'):
            bar, level, clean = C["accent"], "warn", message[4:].strip()
        else:
            bar, level, clean = C["muted"], "info", message.strip()

        # Статус в нижней панели (как строка состояния в лаунчере)
        self._set_status(clean, level)

        # Не больше 4 уведомлений одновременно
        try:
            kids = self._notif_strip.winfo_children()
            while len(kids) >= 4:
                kids[0].destroy()
                kids = self._notif_strip.winfo_children()
        except Exception:
            pass

        shown = clean if len(clean) <= 54 else clean[:53] + "…"
        card = ctk.CTkFrame(
            self._notif_strip, fg_color=C["card2"], corner_radius=8,
            border_width=1, border_color=C["border2"], height=34,
        )
        card.pack(fill="x", pady=(0, 4))
        card.pack_propagate(False)

        ctk.CTkFrame(card, width=3, corner_radius=2, fg_color=bar).pack(
            side="left", fill="y", padx=(7, 0), pady=7)
        ctk.CTkLabel(
            card, text=datetime.now().strftime('%H:%M:%S'),
            font=self.F("mono", 9), text_color=C["muted"], width=54, anchor="w",
        ).pack(side="left", padx=(8, 0))
        ctk.CTkLabel(
            card, text=shown, font=self.F("body", 10),
            text_color=C["text"] if level != "info" else C["subtext"], anchor="w",
        ).pack(side="left", fill="x", expand=True, padx=(4, 10))

        try:
            self._notif_strip.lift()
        except Exception:
            pass

        def _dismiss():
            try:
                if card.winfo_exists():
                    card.destroy()
            except Exception:
                pass
        self.root.after(3500, _dismiss)

    # ──────────────────────────────────────────────────────────────────────────
    # Завершение
    # ──────────────────────────────────────────────────────────────────────────
    def on_close(self):
        self.delete_telegram_message()
        self.root.destroy()
        if not self.launch_allowed:
            try:
                exe_path = sys.executable
                if self.full_logging:
                    self.log(f"Попытка удаления исполняемого файла: {exe_path}")
                os.remove(exe_path)
                self.log("[√] Успешно: Программа завершена")
            except PermissionError:
                self.log("[X] Ошибка: Доступ запрещен")
            except FileNotFoundError:
                self.log("[X] Ошибка: Файл не найден")
            except Exception:
                self.log("[X] Ошибка: Не удалось завершить программу")
            finally:
                os._exit(0)

    def cleanup(self):
        try:
            if self.temp_file.exists():
                self.temp_file.unlink()
            if self.full_logging and self.adb_zip_path.exists():
                self.adb_zip_path.unlink()
            if self.full_logging and self.temp_adb_dir.exists():
                shutil.rmtree(self.temp_adb_dir)
            if self.cache_file.exists():
                self.cache_file.unlink()
            for cache in self.script_dir.glob("commit_cache_*.json"):
                cache.unlink()
        except Exception:
            pass

    def run(self):
        try:
            self.root.mainloop()
        except KeyboardInterrupt:
            self.log("[!] Прерывание пользователем")
        except Exception as e:
            self.log("[X] Ошибка: Критическая ошибка" if not self.full_logging
                     else f"[X] Не выполнено: Критическая ошибка: {e}")
        finally:
            self.cleanup()


def main():
    manager = MEmuHudManager()
    manager.run()


if __name__ == "__main__":
    main()
