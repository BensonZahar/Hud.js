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
import tkinter as tk
import queue

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
        self._main_thread = threading.current_thread()
        self._log_queue = queue.Queue()
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
        self.index_file = self.script_dir / "index.js"
        self.index_nocode_file = self.script_dir / "index_nocode.js"
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

        # ── Палитра: современная тёмная (чёрно-серая, без синего) ─
        self.C = {
            # Фоны — чистые тёмные, нейтральные
            "bg":      "#0A0A0A",   # почти чёрный
            "surface": "#111111",   # тёмная поверхность
            "card":    "#1A1A1A",   # карточка
            # Границы
            "border":  "#2A2A2A",   # разделитель
            # Акценты — янтарь и зелёный (без синего)
            "accent":  "#FFAA0D",   # янтарь
            "accent2": "#4FAA7A",   # зелёный
            # Текст
            "text":    "#F0F0F0",   # основной
            "subtext": "#909090",   # вторичный
            "muted":   "#606060",   # приглушённый
            # Семантика
            "red":     "#CE6565",
            "green":   "#4FAA7A",
            # Кнопка на янтарном фоне
            "btntext": "#0A0A0A",
            # Хром
            "chrome":  "#555555",
        }

        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        W, H = 760, 500
        self.root = ctk.CTk()
        self.root.title("HassleBot")
        self.root.resizable(False, False)
        self.root.configure(fg_color=self.C["bg"])
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
        self._setup_clipboard_shortcuts()
        self.root.after(50, self._drain_log_queue)

        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=1)

        self.main_frame = ctk.CTkFrame(
            self.root,
            fg_color=self.C["bg"],
            corner_radius=0,
        )
        self.main_frame.grid(sticky="nsew")
        # 3 колонки: левая (фиксированная) | разделитель | правая (расширяется)
        self.main_frame.grid_columnconfigure(0, weight=0, minsize=318)
        self.main_frame.grid_columnconfigure(1, weight=0, minsize=1)
        self.main_frame.grid_columnconfigure(2, weight=1)
        self.main_frame.grid_rowconfigure(0, weight=0)   # шапка
        self.main_frame.grid_rowconfigure(1, weight=1)   # контент

        # ── Шапка (на всю ширину, оба столбца) ────────────────
        C = self.C
        hdr = ctk.CTkFrame(
            self.main_frame,
            fg_color=C["surface"],
            corner_radius=0,
            height=48,
            border_width=0,
        )
        hdr.grid(row=0, column=0, columnspan=3, sticky="ew")
        hdr.grid_columnconfigure(1, weight=1)
        hdr.grid_propagate(False)

        # Янтарная полоса слева
        accent_bar = ctk.CTkFrame(hdr, width=4, height=48, corner_radius=0,
                                   fg_color=C["accent"])
        accent_bar.grid(row=0, column=0, padx=(0, 0), pady=0, sticky="ns")
        accent_bar.grid_propagate(False)

        ctk.CTkLabel(
            hdr,
            text="HASSLE BOT",
            font=("Segoe UI", 14, "bold"),   # Maven Pro feel
            text_color=C["text"],
        ).grid(row=0, column=1, padx=(14, 6), sticky="w")

        ctk.CTkLabel(
            hdr,
            text="by konst2",
            font=("Segoe UI", 10),
            text_color=C["subtext"],
        ).grid(row=0, column=2, padx=(0, 16))

        # Статус-точка (зелёная = ready, как .node--newIndicator на сайте)
        self._status_dot = ctk.CTkFrame(
            hdr, width=8, height=8, corner_radius=4,
            fg_color=C["muted"],
        )
        self._status_dot.grid(row=0, column=3, padx=(0, 16), pady=20)
        self._status_dot.grid_propagate(False)

        # ── Левая колонка (настройки) ──────────────────────────
        self.left_col = ctk.CTkScrollableFrame(
            self.main_frame,
            fg_color=C["bg"],
            corner_radius=0,
            scrollbar_button_color=C["border"],
            scrollbar_button_hover_color=C["accent"],
        )
        self.left_col.grid(row=1, column=0, sticky="nsew")
        self.left_col.grid_columnconfigure(0, weight=1)

        # ── Вертикальный разделитель ────────────────────────────
        ctk.CTkFrame(
            self.main_frame, width=1, corner_radius=0, fg_color=C["border"]
        ).grid(row=1, column=1, sticky="nsew")

        # ── Правая колонка (уведомления + действия) ────────────
        self.right_col = ctk.CTkFrame(
            self.main_frame,
            fg_color=C["bg"],
            corner_radius=0,
        )
        self.right_col.grid(row=1, column=2, sticky="nsew")
        self.right_col.grid_columnconfigure(0, weight=1)
        self.right_col.grid_rowconfigure(0, weight=0)   # уведомления (авто-высота)
        self.right_col.grid_rowconfigure(1, weight=1)   # действия (занимают всё)
        self.right_col.grid_rowconfigure(2, weight=0)   # кнопка выхода

        # ── Компактные уведомления сверху ───────────────────────
        self._notif_strip = ctk.CTkFrame(
            self.right_col, fg_color="transparent",
        )
        self._notif_strip.grid(row=0, column=0, sticky="ew", padx=8, pady=(6, 0))
        self._notif_strip.grid_columnconfigure(0, weight=1)

        self.activate_launch_permission()

    # ──────────────────────────────────────────────────────────────────────────
    # Вспомогательные утилиты
    # ──────────────────────────────────────────────────────────────────────────
    # ── Буфер обмена: Ctrl+V/C/X/A на любой раскладке + меню ПКМ ─────────────
    def _setup_clipboard_shortcuts(self):
        for cls in ("Entry", "Text"):
            self.root.bind_class(cls, "<Control-KeyPress>", self._on_ctrl_key, add="+")
            self.root.bind_class(cls, "<Button-3>", self._on_right_click, add="+")

    def _on_ctrl_key(self, event):
        """Tk реагирует на Ctrl+V только с латинской раскладкой. Здесь ловим по коду клавиши."""
        if platform.system() != "Windows":
            return None
        w = event.widget
        try:
            if event.keycode == 65:  # Ctrl+A — выделить всё (на любой раскладке)
                if isinstance(w, tk.Text):
                    w.tag_add("sel", "1.0", "end-1c")
                else:
                    w.select_range(0, "end")
                    w.icursor("end")
                return "break"
            if event.keycode in (86, 67, 88):  # V / C / X
                # Латиница: стандартные биндинги Tk сами всё сделают (иначе будет двойная вставка)
                if (event.keysym or "").lower() in ("v", "c", "x"):
                    return None
                virt = {86: "<<Paste>>", 67: "<<Copy>>", 88: "<<Cut>>"}[event.keycode]
                w.event_generate(virt)
                return "break"
        except tk.TclError:
            return "break"
        return None

    def _on_right_click(self, event):
        w = event.widget
        C = self.C
        try:
            w.focus_set()
            menu = tk.Menu(
                w, tearoff=0, bg=C["card"], fg=C["text"],
                activebackground=C["accent"], activeforeground=C["btntext"],
                bd=0, font=("Segoe UI", 10),
            )
            menu.add_command(label="Вырезать", command=lambda: w.event_generate("<<Cut>>"))
            menu.add_command(label="Копировать", command=lambda: w.event_generate("<<Copy>>"))
            menu.add_command(label="Вставить", command=lambda: w.event_generate("<<Paste>>"))
            menu.add_separator()
            menu.add_command(
                label="Выделить всё",
                command=lambda: (w.select_range(0, "end") if not isinstance(w, tk.Text)
                                 else w.tag_add("sel", "1.0", "end-1c")),
            )
            try:
                menu.tk_popup(event.x_root, event.y_root)
            finally:
                menu.grab_release()
        except tk.TclError:
            pass
        return "break"

    def _make_modal(self, dialog, focus_widget=None):
        """Делает окно модальным и отдаёт фокус полю ВВОДА — но только когда окно реально показано.
        grab_set() сразу после создания CTkToplevel падает/не срабатывает, а отложенная
        установка иконки в customtkinter отбирает фокус — поэтому поля «не принимали» Ctrl+V."""
        state = {"tries": 0}

        def _apply():
            try:
                if not dialog.winfo_exists():
                    return
                dialog.lift()
                try:
                    dialog.grab_set()
                except tk.TclError:
                    state["tries"] += 1
                    if state["tries"] < 20:
                        dialog.after(50, _apply)
                    return
                dialog.focus_force()
                if focus_widget is not None:
                    focus_widget.focus_set()
            except tk.TclError:
                pass

        dialog.after(250, _apply)

    def _drain_log_queue(self):
        """Сообщения лога из фоновых потоков показываем только в главном потоке."""
        try:
            while True:
                self.log(self._log_queue.get_nowait())
        except queue.Empty:
            pass
        except Exception:
            pass
        try:
            self.root.after(50, self._drain_log_queue)
        except Exception:
            pass

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
            try:
                if self.local_accounts_file.exists():
                    shutil.copy2(self.local_accounts_file, self.local_accounts_file.with_suffix(".bak"))
            except Exception:
                pass
            return {}

    def save_local_accounts(self):
        try:
            data = json.dumps(self.local_accounts, ensure_ascii=False, indent=2).encode("utf-8")
            encrypted = self._encrypt_bytes(data)
            tmp_file = self.local_accounts_file.with_suffix(".tmp")
            tmp_file.write_bytes(encrypted)
            os.replace(tmp_file, self.local_accounts_file)
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

    @staticmethod
    def _clean_text(text):
        """Убирает невидимые символы (zero-width, неразрывный пробел, BOM), которые тянутся при копировании."""
        return re.sub(r"[\u200b-\u200f\u202a-\u202e\u2060\ufeff\xa0]", " ", text or "")

    def extract_token(self, text):
        m = re.search(self.TOKEN_RE, self._clean_text(text))
        return m.group(0) if m else ""

    def import_accounts_from_text(self, user, text):
        """Разбирает текст вида  1: 123456789:AAE...  /  '1': '123456789:AAE...'  /  1 123456789:AAE...
        Возвращает количество добавленных/обновлённых токенов."""
        pairs = re.findall(
            r"(?<![\w:])['\"]?(\d{1,3})['\"]?\s*[:=\s]\s*['\"]?(" + self.TOKEN_RE + r")",
            self._clean_text(text)
        )
        count = 0
        for acc, token in pairs:
            self.add_local_account(user, acc, token)
            count += 1
        return count

    def open_local_account_manager(self, on_close=None):
        user = self.selected_code_name
        if not user:
            self.log("[X] Ошибка: пользователь не выбран")
            return

        C = self.C
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Локальные токены")
        dialog.resizable(False, False)
        dialog.transient(self.root)
        dialog.configure(fg_color=C["bg"])
        dialog.update_idletasks()

        DW, DH = 680, 580
        rx = self.root.winfo_rootx() + (self.root.winfo_width() - DW) // 2
        ry = self.root.winfo_rooty() + (self.root.winfo_height() - DH) // 2
        dialog.geometry(f"{DW}x{DH}+{rx}+{ry}")
        dialog.lift()

        hdr = ctk.CTkFrame(dialog, fg_color=C["surface"], corner_radius=0, height=44)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        accent_bar = ctk.CTkFrame(hdr, width=4, height=44, corner_radius=0, fg_color=C["accent"])
        accent_bar.pack(side="left")
        ctk.CTkLabel(
            hdr, text=f"🔐 Локальные токены — {user}",
            font=("Segoe UI", 12, "bold"), text_color=C["text"],
        ).pack(side="left", padx=12, pady=10)

        list_frame = ctk.CTkScrollableFrame(
            dialog, fg_color=C["card"], corner_radius=8,
            scrollbar_button_color=C["border"],
            scrollbar_button_hover_color=C["accent"],
        )
        list_frame.pack(fill="both", expand=True, padx=12, pady=(10, 4))

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
                    list_frame, text="Локальные токены ещё не добавлены",
                    font=("Segoe UI", 11), text_color=C["subtext"],
                ).pack(pady=12)
                return
            for acc in sorted(tokens.keys(), key=lambda x: int(x) if str(x).isdigit() else x):
                token = tokens.get(acc, "")
                note = notes.get(acc, "")
                row = ctk.CTkFrame(list_frame, fg_color=C["surface"], corner_radius=8)
                row.pack(fill="x", pady=3, padx=4)
                row.grid_columnconfigure(1, weight=1)
                ctk.CTkLabel(
                    row, text=f"#{acc}",
                    font=("Segoe UI", 12, "bold"), text_color=C["accent"], width=42,
                ).grid(row=0, column=0, padx=(10, 6), pady=8)
                txt = mask_token(token)
                if note:
                    txt += f"  •  {note}"
                ctk.CTkLabel(
                    row, text=txt,
                    font=("Consolas", 11), text_color=C["text"], anchor="w",
                ).grid(row=0, column=1, padx=6, pady=8, sticky="ew")
                ctk.CTkButton(
                    row, text="✕", width=32, height=28,
                    font=("Segoe UI", 11),
                    fg_color=C["card"], hover_color=C["red"],
                    text_color=C["subtext"], corner_radius=6,
                    command=lambda a=acc: (self.delete_local_account(user, a), refresh()),
                ).grid(row=0, column=2, padx=(6, 10), pady=8)

        form = ctk.CTkFrame(dialog, fg_color="transparent")
        form.pack(fill="x", padx=12, pady=(6, 10))
        form.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(form, text="№", font=("Segoe UI", 11), text_color=C["subtext"]).grid(
            row=0, column=0, padx=(0, 6), pady=4)
        acc_entry = ctk.CTkEntry(
            form, placeholder_text="Например: 9",
            fg_color=C["card"], border_color=C["border"],
            text_color=C["text"], placeholder_text_color=C["muted"],
            height=32, corner_radius=6, width=80,
        )
        acc_entry.grid(row=0, column=1, sticky="w", pady=4)
        token_entry = ctk.CTkEntry(
            form, placeholder_text="Токен бота от @BotFather",
            fg_color=C["card"], border_color=C["border"],
            text_color=C["text"], placeholder_text_color=C["muted"],
            height=32, corner_radius=6,
        )
        token_entry.grid(row=1, column=0, columnspan=3, sticky="ew", pady=4)
        note_entry = ctk.CTkEntry(
            form, placeholder_text="Комментарий, например @hb_z09_bot",
            fg_color=C["card"], border_color=C["border"],
            text_color=C["text"], placeholder_text_color=C["muted"],
            height=32, corner_radius=6,
        )
        note_entry.grid(row=2, column=0, columnspan=3, sticky="ew", pady=4)

        def add_account():
            acc = acc_entry.get().strip()
            raw_token = token_entry.get()
            note = note_entry.get().strip()
            if not acc:
                # В поле токена вставили сразу «номер: токен» (или несколько строк) — импортируем
                n = self.import_accounts_from_text(user, raw_token)
                if n:
                    token_entry.delete(0, "end")
                    note_entry.delete(0, "end")
                    refresh()
                    messagebox.showinfo("Готово", f"Импортировано токенов: {n}", parent=dialog)
                    return
            if not re.match(r"^\d{1,3}$", acc):
                messagebox.showerror("Ошибка", "Номер аккаунта должен быть числом, например 9", parent=dialog)
                return
            token = self.extract_token(raw_token)
            if not token:
                messagebox.showerror(
                    "Ошибка",
                    "Токен бота похож на неверный.\n\nПример формата:\n1234567890:AAE...",
                    parent=dialog,
                )
                return
            self.add_local_account(user, acc, token, note)
            acc_entry.delete(0, "end")
            token_entry.delete(0, "end")
            note_entry.delete(0, "end")
            refresh()
            acc_entry.focus_set()

        ctk.CTkButton(
            form, text="＋ Добавить токен",
            font=("Segoe UI", 11, "bold"),
            fg_color=C["accent"], hover_color="#E09500",
            text_color=C["btntext"], height=34, corner_radius=8,
            command=add_account,
        ).grid(row=3, column=0, columnspan=3, pady=(8, 0), sticky="ew")

        def import_clipboard():
            try:
                text = self.root.clipboard_get()
            except Exception:
                text = ""
            n = self.import_accounts_from_text(user, text)
            if n:
                messagebox.showinfo("Готово", f"Импортировано токенов: {n}", parent=dialog)
            else:
                messagebox.showwarning(
                    "Ничего не найдено",
                    "В буфере обмена не найдено пар «номер + токен».\n\n"
                    "Скопируйте текст вида:\n1: 1234567890:AAE...\n2: 1234567891:AAF...",
                    parent=dialog,
                )
            refresh()

        ctk.CTkButton(
            form, text="📥  Импорт из буфера обмена",
            font=("Segoe UI", 11),
            fg_color=C["card"], hover_color=C["border"],
            text_color=C["subtext"], height=32, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=import_clipboard,
        ).grid(row=4, column=0, columnspan=3, pady=(6, 0), sticky="ew")

        def _close():
            try:
                dialog.destroy()
            except Exception:
                pass
            if on_close:
                self.root.after(50, on_close)

        ctk.CTkButton(
            form, text="Готово", font=("Segoe UI", 11),
            fg_color="transparent", hover_color=C["surface"],
            text_color=C["muted"], height=30, corner_radius=8,
            command=_close,
        ).grid(row=5, column=0, columnspan=3, pady=(6, 0), sticky="ew")
        dialog.protocol("WM_DELETE_WINDOW", _close)

        refresh()
        self._make_modal(dialog, acc_entry)

    # ──────────────────────────────────────────────────────────────────────────
    # Пароли автовхода: общий + для отдельных ников (хранятся там же, в шифрованном accounts.sec)
    # ──────────────────────────────────────────────────────────────────────────

    @staticmethod
    def _clean_password(text):
        """Убирает переводы строк и невидимые символы, которые тянутся при копировании."""
        return re.sub(r"[\u200b-\u200f\u202a-\u202e\u2060\ufeff\r\n\t]", "", text or "").strip()

    @staticmethod
    def _clean_nick(text):
        """Ник в формате Name_Surname: пробелы -> «_», невидимые символы убираем."""
        t = re.sub(r"[\u200b-\u200f\u202a-\u202e\u2060\ufeff\xa0]", "", text or "").strip()
        return re.sub(r"\s+", "_", t)

    def get_local_password(self, user):
        """Общий пароль автовхода для пользователя (или '')."""
        return self.get_local_user_config(user).get("PASSWORD", "") or ""

    def set_local_password(self, user, password):
        if not user:
            return False
        cfg = self.local_accounts.setdefault("users", {}).setdefault(user, {})
        password = self._clean_password(password)
        if password:
            cfg["PASSWORD"] = password
        else:
            cfg.pop("PASSWORD", None)
        self.save_local_accounts()
        return True

    def get_nick_passwords(self, user):
        """{ник: пароль} — пароли для отдельных ников (приоритетнее общего)."""
        return dict(self.get_local_user_config(user).get("NICK_PASSWORDS", {}) or {})

    def set_nick_password(self, user, nick, password):
        nick = self._clean_nick(nick)
        password = self._clean_password(password)
        if not user or not nick or not password:
            return False
        cfg = self.local_accounts.setdefault("users", {}).setdefault(user, {})
        nicks = cfg.setdefault("NICK_PASSWORDS", {})
        for k in [k for k in nicks if k.lower() == nick.lower()]:   # ник без учёта регистра
            del nicks[k]
        nicks[nick] = password
        self.save_local_accounts()
        return True

    def delete_nick_password(self, user, nick):
        cfg = self.get_local_user_config(user)
        nicks = cfg.get("NICK_PASSWORDS", {}) if cfg else {}
        if nick in nicks:
            del nicks[nick]
            self.save_local_accounts()
            return True
        return False

    def open_password_manager(self, on_close=None):
        user = self.selected_code_name
        if not user:
            self.log("[X] Ошибка: пользователь не выбран")
            return

        C = self.C
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Пароли автовхода")
        dialog.resizable(False, False)
        dialog.transient(self.root)
        dialog.configure(fg_color=C["bg"])
        dialog.update_idletasks()

        DW, DH = 600, 600
        rx = self.root.winfo_rootx() + (self.root.winfo_width() - DW) // 2
        ry = self.root.winfo_rooty() + (self.root.winfo_height() - DH) // 2
        dialog.geometry(f"{DW}x{DH}+{rx}+{ry}")
        dialog.lift()

        hdr = ctk.CTkFrame(dialog, fg_color=C["surface"], corner_radius=0, height=44)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        ctk.CTkFrame(hdr, width=4, height=44, corner_radius=0, fg_color=C["accent"]).pack(side="left")
        ctk.CTkLabel(
            hdr, text=f"🔑 Пароли автовхода — {user}",
            font=("Segoe UI", 12, "bold"), text_color=C["text"],
        ).pack(side="left", padx=12, pady=10)

        # ── Общий пароль ──────────────────────────────────────
        ctk.CTkLabel(
            dialog, text="Общий пароль (для всех ников, у которых нет своего)",
            font=("Segoe UI", 11), text_color=C["subtext"], anchor="w",
        ).pack(fill="x", padx=14, pady=(12, 4))

        gen_row = ctk.CTkFrame(dialog, fg_color="transparent")
        gen_row.pack(fill="x", padx=12)
        gen_row.grid_columnconfigure(0, weight=1)
        gen_entry = ctk.CTkEntry(
            gen_row, placeholder_text="Общий пароль", show="•",
            fg_color=C["card"], border_color=C["border"],
            text_color=C["text"], placeholder_text_color=C["muted"],
            height=32, corner_radius=6,
        )
        gen_entry.grid(row=0, column=0, sticky="ew", padx=(0, 6))
        cur = self.get_local_password(user)
        if cur:
            gen_entry.insert(0, cur)

        def make_eye(parent, entry):
            def toggle():
                entry.configure(show="" if entry.cget("show") else "•")
            return ctk.CTkButton(
                parent, text="👁", width=34, height=32,
                fg_color=C["card"], hover_color=C["border"], text_color=C["subtext"],
                corner_radius=6, border_width=1, border_color=C["border"], command=toggle,
            )

        make_eye(gen_row, gen_entry).grid(row=0, column=1, padx=(0, 6))

        def save_general():
            self.set_local_password(user, gen_entry.get())
            if self.get_local_password(user):
                messagebox.showinfo("Готово", "Общий пароль сохранён", parent=dialog)
            else:
                messagebox.showinfo("Готово", "Общий пароль удалён", parent=dialog)

        ctk.CTkButton(
            gen_row, text="Сохранить", width=100, height=32,
            font=("Segoe UI", 11, "bold"),
            fg_color=C["accent"], hover_color="#E09500", text_color=C["btntext"],
            corner_radius=6, command=save_general,
        ).grid(row=0, column=2)

        # ── Пароли для ников ──────────────────────────────────
        ctk.CTkLabel(
            dialog, text="Пароли для отдельных ников (приоритетнее общего)",
            font=("Segoe UI", 11), text_color=C["subtext"], anchor="w",
        ).pack(fill="x", padx=14, pady=(14, 4))

        list_frame = ctk.CTkScrollableFrame(
            dialog, fg_color=C["card"], corner_radius=8,
            scrollbar_button_color=C["border"],
            scrollbar_button_hover_color=C["accent"],
        )
        list_frame.pack(fill="both", expand=True, padx=12, pady=(0, 4))

        def refresh():
            for w in list_frame.winfo_children():
                w.destroy()
            nicks = self.get_nick_passwords(user)
            if not nicks:
                ctk.CTkLabel(
                    list_frame, text="Отдельных паролей нет — для всех ников используется общий",
                    font=("Segoe UI", 11), text_color=C["subtext"],
                ).pack(pady=12)
                return
            for nick in sorted(nicks, key=str.lower):
                row = ctk.CTkFrame(list_frame, fg_color=C["surface"], corner_radius=8)
                row.pack(fill="x", pady=3, padx=4)
                row.grid_columnconfigure(0, weight=1)
                ctk.CTkLabel(
                    row, text=f"{nick}   ••••••",
                    font=("Consolas", 11), text_color=C["text"], anchor="w",
                ).grid(row=0, column=0, padx=(10, 6), pady=8, sticky="ew")
                ctk.CTkButton(
                    row, text="✕", width=32, height=28, font=("Segoe UI", 11),
                    fg_color=C["card"], hover_color=C["red"],
                    text_color=C["subtext"], corner_radius=6,
                    command=lambda n=nick: (self.delete_nick_password(user, n), refresh()),
                ).grid(row=0, column=1, padx=(6, 10), pady=8)

        form = ctk.CTkFrame(dialog, fg_color="transparent")
        form.pack(fill="x", padx=12, pady=(6, 10))
        form.grid_columnconfigure(0, weight=1)
        form.grid_columnconfigure(1, weight=1)

        nick_entry = ctk.CTkEntry(
            form, placeholder_text="Ник, например Ivan_Petrov",
            fg_color=C["card"], border_color=C["border"],
            text_color=C["text"], placeholder_text_color=C["muted"],
            height=32, corner_radius=6,
        )
        nick_entry.grid(row=0, column=0, sticky="ew", padx=(0, 6), pady=4)
        pw_entry = ctk.CTkEntry(
            form, placeholder_text="Пароль этого ника", show="•",
            fg_color=C["card"], border_color=C["border"],
            text_color=C["text"], placeholder_text_color=C["muted"],
            height=32, corner_radius=6,
        )
        pw_entry.grid(row=0, column=1, sticky="ew", padx=(0, 6), pady=4)
        make_eye(form, pw_entry).grid(row=0, column=2, pady=4)

        def add_nick_password():
            nick = self._clean_nick(nick_entry.get())
            pw = self._clean_password(pw_entry.get())
            if not nick or not pw:
                messagebox.showerror("Ошибка", "Укажите и ник, и пароль", parent=dialog)
                return
            self.set_nick_password(user, nick, pw)
            nick_entry.delete(0, "end")
            pw_entry.delete(0, "end")
            refresh()
            nick_entry.focus_set()

        ctk.CTkButton(
            form, text="＋ Добавить / обновить пароль ника",
            font=("Segoe UI", 11, "bold"),
            fg_color=C["accent"], hover_color="#E09500",
            text_color=C["btntext"], height=34, corner_radius=8,
            command=add_nick_password,
        ).grid(row=1, column=0, columnspan=3, pady=(8, 0), sticky="ew")

        def _close():
            try:
                dialog.destroy()
            except Exception:
                pass
            if on_close:
                self.root.after(50, on_close)

        ctk.CTkButton(
            form, text="Готово", font=("Segoe UI", 11),
            fg_color="transparent", hover_color=C["surface"],
            text_color=C["muted"], height=30, corner_radius=8,
            command=_close,
        ).grid(row=2, column=0, columnspan=3, pady=(6, 0), sticky="ew")
        dialog.protocol("WM_DELETE_WINDOW", _close)

        refresh()
        self._make_modal(dialog, gen_entry)

    def _section_label(self, parent, text, row=0):
        """Заголовок секции — янтарная полоса + текст."""
        C = self.C
        wrap = ctk.CTkFrame(parent, fg_color=C["card"], corner_radius=0, height=34)
        wrap.grid(row=row, column=0, columnspan=2, sticky="ew", padx=0, pady=(0, 6))
        wrap.grid_propagate(False)
        wrap.grid_columnconfigure(1, weight=1)
        ctk.CTkFrame(wrap, width=3, height=34, corner_radius=0,
                     fg_color=C["accent"]).grid(row=0, column=0, sticky="ns")
        ctk.CTkLabel(
            wrap, text=text,
            font=("Segoe UI", 9, "bold"),
            text_color=C["accent"],
        ).grid(row=0, column=1, padx=(10, 0), sticky="w")

    def _card(self, parent, row, pad_top=6, pad_bot=6):
        """Карточка секции — одна колонка, полная ширина."""
        C = self.C
        f = ctk.CTkFrame(
            parent,
            fg_color=C["surface"],
            corner_radius=12,
            border_width=1,
            border_color=C["border"],
        )
        f.grid(row=row, column=0, padx=12, pady=(pad_top, pad_bot), sticky="ew")
        f.grid_columnconfigure(0, weight=1)
        return f

    def _field_label(self, parent, text, row):
        """Метка поля над комбо — маленькая, приглушённая."""
        ctk.CTkLabel(
            parent,
            text=text,
            font=("Segoe UI", 9, "bold"),
            text_color=self.C["muted"],
            anchor="w",
        ).grid(row=row, column=0, padx=14, pady=(8, 2), sticky="w")

    def _combo(self, parent, values, variable, row, command=None, pad_bottom=10):
        """Выпадающий список — полная ширина, метка над ним."""
        C = self.C
        kw = dict(
            values=values,
            variable=variable,
            fg_color=C["card"],
            button_color=C["accent"],
            border_color=C["border"],
            dropdown_fg_color=C["surface"],
            dropdown_hover_color=C["border"],
            dropdown_text_color=C["text"],
            text_color=C["text"],
            font=("Segoe UI", 11),
            height=34,
            corner_radius=8,
        )
        if command:
            kw["command"] = command
        w = ctk.CTkComboBox(parent, **kw)
        w.grid(row=row, column=0, padx=12, pady=(0, pad_bottom), sticky="ew")
        return w

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
        if commit_cache_file.exists() and current_time - commit_cache_file.stat().st_mtime < 3600:
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
        for w in list(self.left_col.winfo_children()):
            w.destroy()

        C = self.C

        # ── Карточка: Устройство ───────────────────────────────
        sect1 = self._card(self.left_col, row=0, pad_top=10)
        self._section_label(sect1, "УСТРОЙСТВО")

        self._field_label(sect1, "ТИП ПОДКЛЮЧЕНИЯ", row=1)
        self.conn_var = ctk.StringVar(value="Физическое")
        self.conn_menu = self._combo(
            sect1,
            values=["Физическое", "Клон (999)", "MEmu", "NOX"],
            variable=self.conn_var,
            row=2,
        )
        self.conn_var.trace_add("write", self.detect_app_folders)

        self._field_label(sect1, "ПАПКА ПРИЛОЖЕНИЯ", row=3)
        self.app_var = ctk.StringVar(value="")
        self.app_menu = self._combo(sect1, values=[], variable=self.app_var, row=4, pad_bottom=12)

        # ── NOX-секция ─────────────────────────────────────────
        self.nox_sect = ctk.CTkFrame(
            self.left_col,
            fg_color=C["surface"],
            corner_radius=12,
            border_width=1,
            border_color=C["border"],
        )
        self.nox_sect.grid_columnconfigure(0, weight=1)

        # ── Карточка: Профиль (только для владельца) ───────────
        if self.debug_allowed and self.code_files:
            user_names = [f.get('user', f['name'].replace('.js', '')) for f in self.code_files]
            sect_u = self._card(self.left_col, row=2)
            self._section_label(sect_u, "ПРОФИЛЬ")

            self._field_label(sect_u, "ИГРОК", row=1)
            self.owner_user_var = ctk.StringVar(
                value=self.selected_code_name or user_names[0]
            )
            self._combo(
                sect_u,
                values=user_names,
                variable=self.owner_user_var,
                row=2,
                command=self._on_owner_user_change,
                pad_bottom=12,
            )
            self._on_owner_user_change(self.owner_user_var.get())

        # ── Инфо о коммите ─────────────────────────────────────
        if self.full_logging and self.last_commit_info:
            ctk.CTkLabel(
                self.left_col,
                text=f"↑ {self.last_commit_info}",
                font=("Segoe UI", 9),
                text_color=C["muted"],
                wraplength=270, justify="left",
            ).grid(row=3, column=0, padx=12, pady=(0, 4), sticky="w")

        self.update_gui()

    def _on_owner_user_change(self, value):
        self.selected_code_name = value

    def _update_nox_selector(self):
        if not hasattr(self, 'nox_sect'):
            return
        C = self.C

        for w in self.nox_sect.winfo_children():
            w.destroy()

        if self.conn_var.get() == "NOX" and len(self.nox_active_devices) >= 2:
            self.nox_sect.grid(row=1, column=0, padx=12, pady=(0, 6), sticky="ew")
            self._section_label(self.nox_sect, "NOX — ВЫБОР ЭКЗЕМПЛЯРА")

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
                        command=_on_nox_target)

            ports_text = "  ".join(
                f"{d['label']}: порт {d['port']}" for d in self.nox_active_devices
            )
            ctk.CTkLabel(
                self.nox_sect, text=ports_text,
                font=("Segoe UI", 9), text_color=C["muted"],
                anchor="w",
            ).grid(row=3, column=0, padx=14, pady=(0, 10), sticky="w")

            _on_nox_target(self.nox_target_var.get())
        else:
            self.nox_sect.grid_remove()
            self.nox_target_var = None

    def detect_app_folders(self, *args):
        if self.select_connection():
            self.root.after(0, self._update_nox_selector)
            try:
                cmd = [self.adb_path] + self.device_param + [
                    "shell", "ls", "-1", self.storage_path
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
                    self.app_menu.configure(values=folders)
                    if folders:
                        self.app_var.set(folders[0])
                        self.log(f"[√] Обнаружено папок: {len(folders)}")
                    else:
                        self.app_var.set("")
                        self.log("[X] Папки com.hassle.online* не найдены")
                else:
                    self.log("[X] Ошибка при получении списка папок")
            except Exception as e:
                self.log(f"[X] Ошибка обнаружения папок: {e}")
        else:
            self.app_menu.configure(values=[])
            self.app_var.set("")
            self.root.after(0, self._update_nox_selector)

    # ──────────────────────────────────────────────────────────────────────────
    # GUI — блок действий
    # ──────────────────────────────────────────────────────────────────────────
    def update_gui(self):
        for w in list(self.right_col.winfo_children()):
            info = w.grid_info()
            if info and info.get('row', 0) > 0:   # оставляем лог (row=0)
                w.destroy()

        C = self.C

        # ── Карточка: Действия ──────────────────────────────────
        acts = ctk.CTkFrame(
            self.right_col,
            fg_color=C["surface"],
            corner_radius=12,
            border_width=1,
            border_color=C["border"],
        )
        acts.grid(row=1, column=0, padx=10, pady=(4, 4), sticky="nsew")
        acts.grid_columnconfigure((0, 1), weight=1)
        acts.grid_rowconfigure(7, weight=1)

        # Заголовок (columnspan=2 чтоб перекрыл обе колонки кнопок)
        C2 = self.C
        hdr_wrap = ctk.CTkFrame(acts, fg_color=C2["card"], corner_radius=0, height=34)
        hdr_wrap.grid(row=0, column=0, columnspan=2, sticky="ew", padx=0, pady=(0, 8))
        hdr_wrap.grid_propagate(False)
        hdr_wrap.grid_columnconfigure(1, weight=1)
        ctk.CTkFrame(hdr_wrap, width=3, height=34, corner_radius=0,
                     fg_color=C2["accent"]).grid(row=0, column=0, sticky="ns")
        ctk.CTkLabel(hdr_wrap, text="ДЕЙСТВИЯ", font=("Segoe UI", 9, "bold"),
                     text_color=C2["accent"]).grid(row=0, column=1, padx=(10, 0), sticky="w")

        # ── Главная кнопка ──────────────────────────────────────
        ctk.CTkButton(
            acts,
            text="▶  Установить код",
            font=("Segoe UI", 12, "bold"),
            fg_color=C["accent"],
            hover_color="#E09500",
            text_color=C["btntext"],
            height=42,
            corner_radius=10,
            command=lambda: self.execute_action("1"),
        ).grid(row=1, column=0, columnspan=2, padx=12, pady=(0, 8), sticky="ew")

        # ── Разделитель ─────────────────────────────────────────
        ctk.CTkFrame(acts, height=1, fg_color=C["border"]).grid(
            row=2, column=0, columnspan=2, sticky="ew", padx=12, pady=(0, 8)
        )

        # ── Вторичные кнопки ────────────────────────────────────
        ctk.CTkButton(
            acts,
            text="✕  Убрать код",
            font=("Segoe UI", 11),
            fg_color=C["card"],
            hover_color=C["border"],
            text_color=C["subtext"],
            height=36, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=lambda: self.execute_action("2"),
        ).grid(row=3, column=0, padx=(12, 4), pady=(0, 6), sticky="ew")

        ctk.CTkButton(
            acts,
            text="⟳  Проверить",
            font=("Segoe UI", 11),
            fg_color=C["card"],
            hover_color=C["border"],
            text_color=C["subtext"],
            height=36, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=lambda: self.execute_action("3"),
        ).grid(row=3, column=1, padx=(4, 12), pady=(0, 6), sticky="ew")

        ctk.CTkButton(
            acts,
            text="🔐  Токены",
            font=("Segoe UI", 11),
            fg_color=C["card"], hover_color=C["border"],
            text_color=C["subtext"], height=36, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=self.open_local_account_manager,
        ).grid(row=4, column=0, padx=(12, 4), pady=(0, 6), sticky="ew")

        ctk.CTkButton(
            acts,
            text="🔑  Пароли",
            font=("Segoe UI", 11),
            fg_color=C["card"], hover_color=C["border"],
            text_color=C["subtext"], height=36, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=self.open_password_manager,
        ).grid(row=4, column=1, padx=(4, 12), pady=(0, 6), sticky="ew")

        if self.full_logging:
            ctk.CTkButton(
                acts,
                text="↓  Скачать Hud.js",
                font=("Segoe UI", 11),
                fg_color=C["card"], hover_color=C["border"],
                text_color=C["subtext"], height=36, corner_radius=8,
                border_width=1, border_color=C["border"],
                command=lambda: self.execute_action("4"),
            ).grid(row=5, column=0, columnspan=2, padx=12, pady=(0, 6), sticky="ew")

            ctk.CTkButton(
                acts,
                text="📂  Скачать .js файлы",
                font=("Segoe UI", 11),
                fg_color=C["card"], hover_color=C["border"],
                text_color=C["subtext"], height=36, corner_radius=8,
                border_width=1, border_color=C["border"],
                command=self.open_js_downloader,
            ).grid(row=6, column=0, columnspan=2, padx=12, pady=(0, 6), sticky="ew")

        if self.debug_allowed:
            ctk.CTkButton(
                acts,
                text="🛠  Включить отладку",
                font=("Segoe UI", 11),
                fg_color=C["card"],
                hover_color=C["border"],
                text_color=C["accent2"],
                height=36, corner_radius=8,
                border_width=1, border_color=C["accent2"],
                command=self.activate_debug_mode,
            ).grid(row=7, column=0, columnspan=2, padx=12, pady=(0, 6), sticky="ew")

        # ── Кнопка выхода ──────────────────────────────────────
        ctk.CTkButton(
            self.right_col,
            text="Выход",
            font=("Segoe UI", 10),
            fg_color="transparent",
            hover_color=C["surface"],
            text_color=C["muted"],
            height=28, corner_radius=6,
            command=self.on_close,
        ).grid(row=2, column=0, padx=10, pady=(0, 8), sticky="e")

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
                f"Этот HWID отсутствует в List.js. Добавьте его для выдачи доступа."
            )
            buttons = []
        elif stage == "debug_choice":
            message_text = (
                f"[{current_time}] Выберите режим отладки для HASSLE BOT "
                f"с устройства {device_name} (HWID: {hwid_str}) 🎮🔧"
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
            self.last_commit_info = self.load_commit_info
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
                messagebox.showerror("Ошибка", "ADB не готов. Перезапустите программу.")
                return
        else:
            if not self.download_and_extract_adb():
                messagebox.showerror("Ошибка", "ADB не готов. Перезапустите программу.")
                return
        if not self.check_adb_exists():
            messagebox.showerror("Ошибка", "ADB не найден. Перезапустите программу.")
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
        if hasattr(self, '_status_dot'):
            self._status_dot.configure(fg_color=self.C["accent"])
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
        """Показать экран 'нет доступа' с возможностью скопировать HWID."""
        # Очистить обе колонки
        for w in list(self.left_col.winfo_children()):
            w.destroy()
        for w in list(self.right_col.winfo_children()):
            w.destroy()

        C = self.C

        # Центральная карточка в правой колонке
        self.right_col.grid_rowconfigure(0, weight=1)
        wrap = ctk.CTkFrame(self.right_col, fg_color="transparent")
        wrap.grid(row=0, column=0, sticky="nsew", padx=24, pady=24)
        wrap.grid_columnconfigure(0, weight=1)
        wrap.grid_rowconfigure(0, weight=1)

        card = ctk.CTkFrame(
            wrap,
            fg_color=C["surface"],
            corner_radius=14,
            border_width=1,
            border_color=C["red"],
        )
        card.grid(row=0, column=0, sticky="nsew")
        card.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            card, text="🚫",
            font=("Segoe UI", 36),
        ).grid(row=0, column=0, pady=(28, 4))

        ctk.CTkLabel(
            card, text="НЕТ ДОСТУПА",
            font=("Segoe UI", 16, "bold"),
            text_color=C["red"],
        ).grid(row=1, column=0, pady=(0, 6))

        if extra_msg:
            ctk.CTkLabel(
                card, text=extra_msg,
                font=("Segoe UI", 10),
                text_color=C["subtext"],
            ).grid(row=2, column=0, pady=(0, 10))

        ctk.CTkLabel(
            card,
            text="Ваш HWID для получения доступа:",
            font=("Segoe UI", 10),
            text_color=C["subtext"],
        ).grid(row=3, column=0, pady=(0, 6))

        hwid_box = ctk.CTkFrame(card, fg_color=C["card"], corner_radius=8)
        hwid_box.grid(row=4, column=0, padx=24, pady=(0, 14), sticky="ew")
        hwid_box.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            hwid_box,
            text=self.hwid or "UNKNOWN",
            font=("Consolas", 14, "bold"),
            text_color=C["accent"],
        ).grid(row=0, column=0, padx=14, pady=12)

        copy_btn = ctk.CTkButton(
            card,
            text="📋  Скопировать HWID",
            font=("Segoe UI", 11, "bold"),
            fg_color=C["accent"],
            hover_color="#E09500",
            text_color=C["btntext"],
            height=38,
            corner_radius=8,
        )

        def _copy():
            self.root.clipboard_clear()
            self.root.clipboard_append(self.hwid or "")
            copy_btn.configure(text="✓  Скопировано!")
            self.root.after(2000, lambda: copy_btn.configure(text="📋  Скопировать HWID"))

        copy_btn.configure(command=_copy)
        copy_btn.grid(row=5, column=0, padx=24, pady=(0, 8), sticky="ew")

        ctk.CTkLabel(
            card,
            text="Скопируйте HWID и отправьте его владельцу для получения доступа",
            font=("Segoe UI", 9),
            text_color=C["muted"],
            wraplength=260,
        ).grid(row=6, column=0, pady=(0, 22))

        # Кнопка выхода
        ctk.CTkButton(
            self.right_col,
            text="Выход",
            font=("Segoe UI", 10),
            fg_color="transparent",
            hover_color=C["surface"],
            text_color=C["muted"],
            height=28, corner_radius=6,
            command=self.on_close,
        ).grid(row=2, column=0, padx=10, pady=(0, 8), sticky="e")
        # Сброс ссылки на старый notif_strip
        self._notif_strip = None

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
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("")
        dialog.resizable(False, False)
        dialog.transient(self.root)
        dialog.configure(fg_color=C["bg"])
        dialog.update_idletasks()

        acc_nums = self.get_local_account_numbers(self.selected_code_name)
        acc_rows = max(1, (len(acc_nums) + 7) // 8)
        DW, DH = 360, 240 + 42 * (acc_rows - 1)
        rx = self.root.winfo_rootx() + (self.root.winfo_width() - DW) // 2
        ry = self.root.winfo_rooty() + (self.root.winfo_height() - DH) // 2
        dialog.geometry(f"{DW}x{DH}+{rx}+{ry}")
        dialog.lift()

        # Шапка диалога — янтарная полоса как в основном окне
        hdr = ctk.CTkFrame(dialog, fg_color=C["surface"], corner_radius=0, height=44)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)

        accent_bar = ctk.CTkFrame(hdr, width=4, height=44, corner_radius=0,
                                   fg_color=C["accent"])
        accent_bar.pack(side="left")

        ctk.CTkLabel(
            hdr,
            text="Выбор аккаунта",
            font=("Segoe UI", 12, "bold"),
            text_color=C["text"],
        ).pack(side="left", padx=12, pady=10)

        ctk.CTkLabel(
            hdr,
            text=f"игрок: {self.selected_code_name or '—'}",
            font=("Segoe UI", 10),
            text_color=C["subtext"],
        ).pack(side="right", padx=14)

        # Описание
        ctk.CTkLabel(
            dialog,
            text="Выберите номер аккаунта",
            font=("Segoe UI", 11),
            text_color=C["subtext"],
        ).pack(pady=(14, 8))

        acc_var = ctk.StringVar(
            value=self.selected_account_number
            if self.selected_account_number in acc_nums else ''
        )
        grid = ctk.CTkFrame(dialog, fg_color="transparent")
        grid.pack()
        acc_buttons = {}

        def select_acc(n):
            acc_var.set(n)
            for num, btn in acc_buttons.items():
                sel = (num == n)
                btn.configure(
                    fg_color=C["accent"] if sel else C["card"],
                    text_color=C["btntext"] if sel else C["subtext"],
                    border_color=C["accent"] if sel else C["border"],
                )

        if not acc_nums:
            ctk.CTkLabel(
                grid, text="Токены аккаунтов ещё не добавлены",
                font=("Segoe UI", 11), text_color=C["muted"],
            ).grid(row=0, column=0, pady=(0, 8))
            ctk.CTkButton(
                grid, text="🔐  Добавить токены", height=34,
                font=("Segoe UI", 11, "bold"),
                fg_color=C["accent"], hover_color="#E09500",
                text_color=C["btntext"], corner_radius=8,
                command=lambda: (
                    dialog.destroy(),
                    self.open_local_account_manager(
                        on_close=lambda: self.show_replace_warning(app_folder)),
                ),
            ).grid(row=1, column=0)

        for idx, n in enumerate(acc_nums):
            is_sel = (n == acc_var.get())
            btn = ctk.CTkButton(
                grid, text=f"#{n}",
                width=36, height=36,
                font=("Segoe UI", 12, "bold"),
                fg_color=C["accent"] if is_sel else C["card"],
                hover_color="#E09500",
                text_color=C["btntext"] if is_sel else C["subtext"],
                border_width=1,
                border_color=C["accent"] if is_sel else C["border"],
                corner_radius=8,
                command=lambda x=n: select_acc(x),
            )
            btn.grid(row=idx // 8, column=idx % 8, padx=3, pady=3)
            acc_buttons[n] = btn

        # Нижние кнопки
        bot = ctk.CTkFrame(dialog, fg_color="transparent")
        bot.pack(pady=(16, 0))

        def on_start():
            chosen = acc_var.get()
            if not chosen:
                self.log("[X] Ошибка: Номер аккаунта не выбран")
                return
            self.selected_account_number = chosen
            dialog.destroy()
            threading.Thread(
                target=lambda: self._run_on_targets(self.replace_with_code, app_folder),
                daemon=True,
            ).start()

        ctk.CTkButton(
            bot, text="Отмена", width=120, height=34,
            font=("Segoe UI", 11),
            fg_color="transparent", hover_color=C["surface"],
            text_color=C["muted"], corner_radius=8,
            command=dialog.destroy,
        ).grid(row=0, column=0, padx=6)

        ctk.CTkButton(
            bot, text="▶  Установить", width=150, height=34,
            font=("Segoe UI", 11, "bold"),
            fg_color=C["accent"], hover_color="#E09500",
            text_color=C["btntext"], corner_radius=8,
            command=on_start,
        ).grid(row=0, column=1, padx=6)

        dialog.update_idletasks()
        self._make_modal(dialog)

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
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Скачать .js файлы")
        dialog.resizable(False, False)
        dialog.transient(self.root)
        dialog.configure(fg_color=C["bg"])
        dialog.update_idletasks()

        DW, DH = 380, 460
        rx = self.root.winfo_rootx() + (self.root.winfo_width() - DW) // 2
        ry = self.root.winfo_rooty() + (self.root.winfo_height() - DH) // 2
        dialog.geometry(f"{DW}x{DH}+{rx}+{ry}")
        dialog.lift()

        # Шапка
        hdr = ctk.CTkFrame(dialog, fg_color=C["surface"], corner_radius=0, height=44)
        hdr.pack(fill="x")
        hdr.pack_propagate(False)
        accent_bar = ctk.CTkFrame(hdr, width=4, height=44, corner_radius=0,
                                   fg_color=C["accent"])
        accent_bar.pack(side="left")
        ctk.CTkLabel(
            hdr, text="📂  Выбор .js файлов",
            font=("Segoe UI", 12, "bold"),
            text_color=C["text"],
        ).pack(side="left", padx=12, pady=10)

        # Поиск
        search_frame = ctk.CTkFrame(dialog, fg_color=C["surface"], corner_radius=0, height=40)
        search_frame.pack(fill="x")
        search_frame.pack_propagate(False)
        ctk.CTkLabel(
            search_frame, text="🔍",
            font=("Segoe UI", 12), text_color=C["muted"],
        ).pack(side="left", padx=(12, 4), pady=6)

        import tkinter as tk
        search_var = tk.StringVar()
        search_entry = ctk.CTkEntry(
            search_frame,
            textvariable=search_var,
            placeholder_text="Поиск файла...",
            fg_color=C["card"],
            border_color=C["border"],
            text_color=C["text"],
            placeholder_text_color=C["muted"],
            font=("Segoe UI", 11),
            height=28, corner_radius=6, border_width=1,
        )
        search_entry.pack(side="left", fill="x", expand=True, padx=(0, 12), pady=6)
        self._make_modal(dialog, search_entry)

        # Список файлов
        list_frame = ctk.CTkScrollableFrame(
            dialog, fg_color=C["card"], corner_radius=8,
            scrollbar_button_color=C["border"],
            scrollbar_button_hover_color=C["accent"],
        )
        list_frame.pack(fill="both", expand=True, padx=12, pady=(8, 4))

        status_lbl = ctk.CTkLabel(
            dialog, text="Загрузка списка файлов...",
            font=("Segoe UI", 10), text_color=C["subtext"],
        )
        status_lbl.pack(pady=(2, 0))

        # Кнопка скачивания — янтарная
        dl_btn = ctk.CTkButton(
            dialog,
            text="↓  Скачать выбранные",
            font=("Segoe UI", 12, "bold"),
            fg_color=C["accent"], hover_color="#E09500",
            text_color=C["btntext"],
            height=38, corner_radius=10,
            state="disabled",
        )
        dl_btn.pack(fill="x", padx=12, pady=(4, 12))

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
                    text="Ничего не найдено" if query else "Файлы .js не найдены",
                    font=("Segoe UI", 11), text_color=C["subtext"],
                ).pack(pady=10)
                return
            for fname in visible:
                if fname not in check_vars:
                    check_vars[fname] = tk.BooleanVar(value=False)
                row_f = ctk.CTkFrame(list_frame, fg_color="transparent")
                row_f.pack(fill="x", pady=2)
                ctk.CTkCheckBox(
                    row_f, text=fname, variable=check_vars[fname],
                    font=("Consolas", 11), text_color=C["text"],
                    fg_color=C["accent"], hover_color="#E09500",
                    checkmark_color=C["btntext"], border_color=C["border"],
                ).pack(side="left", padx=6)

        def on_search(*_):
            render_list(search_var.get())

        search_var.trace_add("write", on_search)

        def populate(files):
            all_files.clear()
            all_files.extend(files)
            check_vars.clear()
            if not files:
                status_lbl.configure(text="Файлы не найдены")
                render_list()
                return
            status_lbl.configure(text=f"Найдено файлов: {len(files)}")
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
                        text="[X] Ошибка: не удалось получить список файлов"))
                    return
                files = sorted([
                    f.strip() for f in result.stdout.splitlines()
                    if f.strip().endswith(".js")
                ])
                dialog.after(0, lambda: populate(files))
            except Exception as e:
                dialog.after(0, lambda: status_lbl.configure(text=f"[X] Ошибка: {e}"))

        def do_download():
            selected = [fname for fname, var in check_vars.items() if var.get()]
            if not selected:
                status_lbl.configure(text="Выберите хотя бы один файл")
                return
            dl_btn.configure(state="disabled", text="Скачивание...")
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
                text=f"Скачивание {i}/{total}: {f}"))
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
            status_lbl.configure(text=f"[√] Готово: {ok}/{total} файлов → {save_dir}")
            dl_btn.configure(state="normal", text="↓  Скачать выбранные")
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
        # Невидимые маркеры (новый формат, совместим с AHK Installer)
        MARK_S = "//\u200b\u200c\u200b"
        MARK_E = "//\u200c\u200b\u200c"
        # Видимые маркеры (старый формат, для обратной совместимости)
        LEGACY_S = "// === HASSLE LOAD BOT CODE START ==="
        LEGACY_E = "// === HASSLE LOAD BOT CODE END ==="
        for S, E in [(MARK_S, MARK_E), (LEGACY_S, LEGACY_E)]:
            start_idx = content.find(S)
            if start_idx != -1:
                end_idx = content.find(E, start_idx + len(S))
                if end_idx != -1:
                    removed_content = content[:start_idx] + content[end_idx + len(E):]
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
            ready, not_ready = [], []
            for line in result.stdout.splitlines():
                if "\t" not in line:
                    continue
                serial, state = [x.strip() for x in line.split("\t", 1)]
                (ready if state == "device" else not_ready).append(serial)
            if not ready:
                self.device_param = []
                if not_ready:
                    self.log("[X] Ошибка: Устройство не готово (unauthorized/offline) — "
                             "подтвердите отладку по USB на телефоне")
                else:
                    self.log("[X] Ошибка: Устройство не найдено")
                return False
            real = [d for d in ready
                    if not d.startswith("127.0.0.1:") and not d.startswith("emulator-")]
            chosen = real[0] if real else ready[0]
            self.device_param = ["-s", chosen]
            self.log("[√] Успешно: Устройство подключено" if not self.full_logging
                     else f"[√] Выполнено: Устройство подключено ({chosen})")
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
                self.root.after(0, lambda f=app_folder: self.show_replace_warning(f))
            elif action == "2":
                self._run_on_targets(self.download_without_code, app_folder)
            elif action == "3":
                self._run_on_targets(self.check_files, app_folder)
            elif action == "4":
                self.simple_download(app_folder)

        threading.Thread(target=run_action, daemon=True).start()

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

    # Файл, в конец которого вставляется код бота
    CODE_FILE = "index.js"
    # Старое место вставки: оттуда код при установке/удалении вычищается,
    # чтобы бот не запускался дважды
    LEGACY_CODE_FILE = "Hud.js"

    def _has_code_markers(self, content):
        return ("//\u200b\u200c\u200b" in content
                or "// === HASSLE LOAD BOT CODE START ===" in content)

    def _pull_text(self, remote_path, name):
        """Скачивает файл с устройства и возвращает его текст (или None при ошибке)."""
        cmd = [self.adb_path] + self.device_param + ["pull", remote_path, str(self.temp_file)]
        result = subprocess.run(
            cmd, capture_output=True, text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
        )
        if result.returncode != 0:
            self.log(f"[X] Ошибка: Не удалось получить файл {name}" if not self.full_logging
                     else f"[X] Не выполнено: Не удалось получить файл {name}: {result.stderr}")
            return None
        try:
            with open(self.temp_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            self.log(f"[X] Ошибка: Не удалось декодировать файл {name}")
            return None
        if not content:
            self.log(f"[X] Ошибка: Файл {name} пуст")
            return None
        return content

    def _push_text(self, remote_path, content, local_file, name):
        """Сохраняет текст локально и отправляет на устройство. True при успехе."""
        content = content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
        target_file = local_file if self.full_logging else self.temp_file
        with open(target_file, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        if self.full_logging:
            self.log(f"Размер нового файла {name}: {os.path.getsize(target_file)} байт")
        self.log(f"Копирование файла {name}..." if not self.full_logging
                 else f"Копирование файла {target_file} на устройство в {remote_path}...")
        cmd = [self.adb_path] + self.device_param + ["push", str(target_file), remote_path]
        result = subprocess.run(
            cmd, capture_output=True, text=True,
            creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
        )
        if result.returncode != 0:
            self.log(f"[X] Ошибка: Не удалось заменить файл {name}" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка замены файла {name}: {result.stderr}")
            return False
        return True

    def _clean_code_from(self, target_path, name, local_file):
        """Удаляет код бота (по маркерам) из файла на устройстве.
        True — если кода там нет или он успешно удалён; False — при ошибке."""
        remote = f"{target_path}/{name}"
        content = self._pull_text(remote, name)
        if content is None:
            return False
        if not self._has_code_markers(content):
            if self.full_logging:
                self.log(f"[i] В {name} кода бота нет — пропуск")
            return True
        content = self.remove_old_code(content, "")
        if not self._push_text(remote, content, local_file, name):
            return False
        self.log(f"[√] Код бота удалён из {name}")
        return True

    def replace_with_code(self, app_folder):
        target_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        code_remote = f"{target_path}/{self.CODE_FILE}"
        try:
            # 1. Вычищаем код из старого места (Hud.js), чтобы бот не запускался дважды
            if not self._clean_code_from(target_path, self.LEGACY_CODE_FILE, self.hud_nocode_file):
                self.log(f"[X] Ошибка: Не удалось очистить {self.LEGACY_CODE_FILE}, установка отменена")
                return

            # 2. Качаем index.js
            self.log(f"Скачивание файла {self.CODE_FILE}..." if not self.full_logging
                     else f"Скачивание файла {code_remote} для обработки...")
            content = self._pull_text(code_remote, self.CODE_FILE)
            if content is None:
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
            if acc_token and "const accountToken = '';" not in load_code:
                self.log("[!] В Load.js не найден «const accountToken = '';» — токен не будет вставлен")
            load_code = load_code.replace("const accountToken = '';", f"const accountToken = '{acc_token}';")

            # Пароли автовхода: общий + для отдельных ников (JSON-литерал — спецсимволы экранируются сами)
            acc_password = self.get_local_password(user_name)
            nick_passwords = self.get_nick_passwords(user_name)
            if acc_password or nick_passwords:
                if "const accountPassword = '';" not in load_code or "const nickPasswords = {};" not in load_code:
                    self.log("[!] В Load.js не найдены «accountPassword»/«nickPasswords» — пароли не будут вставлены (обновите Load.js на GitHub)")
                load_code = load_code.replace("const accountPassword = '';",
                                              f"const accountPassword = {json.dumps(acc_password, ensure_ascii=False)};")
                load_code = load_code.replace("const nickPasswords = {};",
                                              f"const nickPasswords = {json.dumps(nick_passwords, ensure_ascii=False)};")
                self.log(f"[√] Пароли автовхода: общий {'задан' if acc_password else 'не задан'}, "
                         f"для ников: {len(nick_passwords)}")
            else:
                self.log("[!] Пароль автовхода не задан — добавьте его в «Пароли», иначе автовход не сработает")
            if self.full_logging:
                self.log(f"Используется конфигурация пользователя: {user_name}, аккаунт: #{acc_num}")
                self.log(f"Поиск и удаление старого кода в {self.CODE_FILE} по маркерам...")
            content = self.remove_old_code(content, load_code)
            start_marker = "//\u200b\u200c\u200b\n"
            end_marker = "\n//\u200c\u200b\u200c\n"
            obfuscated_code = self.simple_obfuscate(load_code)
            new_content = content + start_marker + obfuscated_code + end_marker

            # 3. Отправляем index.js обратно
            if self._push_text(code_remote, new_content, self.index_file, self.CODE_FILE):
                if self.full_logging:
                    self.log(f"[√] Выполнено: Новый код добавлен в конец {self.CODE_FILE} (пользователь {user_name})")
                self.log(f"[√] Успешно: Код вставлен в {self.CODE_FILE}")
        except Exception as e:
            self.log("[X] Ошибка: Не удалось обработать файл" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка обработки: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()

    def download_without_code(self, app_folder):
        target_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        try:
            self.log("Удаление кода бота...")
            ok_index = self._clean_code_from(target_path, self.CODE_FILE, self.index_nocode_file)
            # заодно чистим Hud.js — туда код вставлялся раньше
            ok_hud = self._clean_code_from(target_path, self.LEGACY_CODE_FILE, self.hud_nocode_file)
            if ok_index and ok_hud:
                self.log("[√] Успешно: Код бота удалён")
            else:
                self.log("[X] Ошибка: Не удалось полностью удалить код")
        except Exception as e:
            self.log("[X] Ошибка: Не удалось обработать файл" if not self.full_logging
                     else f"[X] Не выполнено: Ошибка обработки: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()

    def check_files(self, app_folder):
        target_path = f"{self.storage_path}/{app_folder}/files/Assets"
        files_to_check = [
            f"{target_path}/resources_version.txt",
            f"{target_path}/webview/assets/Hud.js",
        ]
        try:
            self.log("Проверка файлов...")
            cmd = [self.adb_path] + self.device_param + ["shell", "ls", files_to_check[1]]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log("[√] Успешно: Файл найден" if not self.full_logging else "[√] Файл найден")
                if self.full_logging:
                    cmd_size = [self.adb_path] + self.device_param + [
                        "shell", "stat", "-c", "%s", files_to_check[1]]
                    size_result = subprocess.run(
                        cmd_size, capture_output=True, text=True,
                        creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
                    )
                    if size_result.returncode == 0:
                        self.log(f"Размер файла: {size_result.stdout.strip()} байт")
            cmd = [self.adb_path] + self.device_param + ["shell", "ls", files_to_check[0]]
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if result.returncode == 0:
                self.log("[√] Успешно: Файл найден, удаление..." if not self.full_logging
                         else f"[√] Файл найден: {files_to_check[0]}, удаление...")
                cmd_rm = [self.adb_path] + self.device_param + [
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
            cmd = [self.adb_path] + self.device_param + ["pull", source_file, str(save_path)]
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
        if threading.current_thread() is not self._main_thread:
            self._log_queue.put(message)
            return
        print(f"{datetime.now().strftime('%H:%M:%S')}: {message}")
        if not hasattr(self, '_notif_strip'):
            return
        try:
            if not self._notif_strip.winfo_exists():
                return
        except Exception:
            return

        C = self.C
        if message.startswith('[√]'):
            bar, icon, clean = C["green"],  "●", message[4:].strip()
        elif message.startswith('[X]'):
            bar, icon, clean = C["red"],    "●", message[4:].strip()
        elif message.startswith('[!]'):
            bar, icon, clean = C["accent"], "●", message[4:].strip()
        else:
            bar, icon, clean = C["muted"],  "○", message.strip()

        card = ctk.CTkFrame(
            self._notif_strip,
            fg_color=C["surface"],
            corner_radius=6,
            border_width=1,
            border_color=bar,
            height=26,
        )
        card.pack(fill="x", pady=(0, 2))
        card.pack_propagate(False)
        card.grid_columnconfigure(2, weight=1)

        ctk.CTkLabel(
            card, text=icon,
            font=("Segoe UI", 7),
            text_color=bar, width=14,
        ).grid(row=0, column=0, padx=(6, 0))

        ctk.CTkLabel(
            card, text=datetime.now().strftime('%H:%M:%S'),
            font=("Consolas", 9),
            text_color=C["muted"], width=54, anchor="w",
        ).grid(row=0, column=1, padx=(3, 4))

        ctk.CTkLabel(
            card, text=clean,
            font=("Segoe UI", 10),
            text_color=bar if bar != C["muted"] else C["subtext"],
            anchor="w",
        ).grid(row=0, column=2, padx=(0, 8), sticky="ew")

        try:
            self.root.update_idletasks()
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
                if getattr(sys, "frozen", False):
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
