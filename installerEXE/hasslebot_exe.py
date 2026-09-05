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
from tkinter import messagebox, filedialog

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

            self.user_token_counts = {}
            for user in users:
                user_pos = list_content.find(f"'{user}'")
                if user_pos == -1:
                    user_pos = list_content.find(f'"{user}"')
                chunk = list_content[user_pos:user_pos + 1200]
                import re as _re
                m = _re.search(r"BOT_TOKENS\s*:\s*\{([^}]+)\}", chunk, _re.DOTALL)
                if m:
                    keys = _re.findall(r"['\"](\d+)['\"]", m.group(1))
                    self.user_token_counts[user] = len(keys) if keys else 8
                else:
                    self.user_token_counts[user] = 8


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
        self.conn_var.trace("w", self.detect_app_folders)

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

        if self.full_logging:
            ctk.CTkButton(
                acts,
                text="↓  Скачать Hud.js",
                font=("Segoe UI", 11),
                fg_color=C["card"], hover_color=C["border"],
                text_color=C["subtext"], height=36, corner_radius=8,
                border_width=1, border_color=C["border"],
                command=lambda: self.execute_action("4"),
            ).grid(row=4, column=0, columnspan=2, padx=12, pady=(0, 6), sticky="ew")

            ctk.CTkButton(
                acts,
                text="📂  Скачать .js файлы",
                font=("Segoe UI", 11),
                fg_color=C["card"], hover_color=C["border"],
                text_color=C["subtext"], height=36, corner_radius=8,
                border_width=1, border_color=C["border"],
                command=self.open_js_downloader,
            ).grid(row=5, column=0, columnspan=2, padx=12, pady=(0, 6), sticky="ew")

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
            ).grid(row=6, column=0, columnspan=2, padx=12, pady=(0, 6), sticky="ew")

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
        acc_count = self.user_token_counts.get(self.selected_code_name, 8)
        buttons = [{"text": f"#{i}", "callback_data": f"account_{i}"} for i in range(1, acc_count + 1)]
        keyboard = [buttons[:4], buttons[4:]] if len(buttons) > 4 else [buttons]
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
        dialog.grab_set()
        dialog.transient(self.root)
        dialog.configure(fg_color=C["bg"])
        dialog.update_idletasks()

        DW, DH = 360, 240
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

        acc_count = self.user_token_counts.get(self.selected_code_name, 8)
        acc_var = ctk.StringVar(value=self.selected_account_number or '')
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

        for i in range(1, acc_count + 1):
            n = str(i)
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
            btn.grid(row=0, column=i-1, padx=3)
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
        dialog.grab_set()
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
        ctk.CTkEntry(
            search_frame,
            textvariable=search_var,
            placeholder_text="Поиск файла...",
            fg_color=C["card"],
            border_color=C["border"],
            text_color=C["text"],
            placeholder_text_color=C["muted"],
            font=("Segoe UI", 11),
            height=28, corner_radius=6, border_width=1,
        ).pack(side="left", fill="x", expand=True, padx=(0, 12), pady=6)

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

        search_var.trace("w", on_search)

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
                self.show_replace_warning(app_folder)
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

        # ── Один adb push — все файлы за раз ────────────────────────────────
        try:
            cmd = (
                [adb_path] + device_param
                + ["push"]
                + [str(p) for p in downloaded.values()]
                + [f"{target_path}/"]
            )
            push_result = subprocess.run(
                cmd, capture_output=True, text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0,
            )
            if push_result.returncode == 0:
                self.log("[√] Успешно: файлы из Загрузчики обновлены" if not self.full_logging
                         else f"[√] Выполнено: {', '.join(downloaded)} → {target_path}")
            else:
                self.log("[X] Ошибка: Не удалось залить файлы из Загрузчики" if not self.full_logging
                         else f"[X] Не выполнено: push ошибка: {push_result.stderr}")
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
            self.root.update()
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
