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

        # GUI Components
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        # ── Палитра ────────────────────────────────────────────
        self.C = {
            "bg":       "#0e0e18",
            "surface":  "#161625",
            "card":     "#1c1c30",
            "border":   "#2a2a45",
            "accent":   "#6c63ff",
            "accent2":  "#00d4aa",
            "muted":    "#4a4a6a",
            "text":     "#e2e2f0",
            "subtext":  "#8888aa",
            "red":      "#ff5c5c",
            "green":    "#00d4aa",
        }

        W, H = 400, 490
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

        self.main_frame = ctk.CTkFrame(self.root, fg_color=self.C["bg"], corner_radius=0)
        self.main_frame.grid(sticky="nsew")
        self.main_frame.grid_columnconfigure(0, weight=1)

        # ── Шапка ──────────────────────────────────────────────
        hdr = ctk.CTkFrame(self.main_frame, fg_color=self.C["surface"],
                           corner_radius=0, height=48)
        hdr.grid(row=0, column=0, sticky="ew")
        hdr.grid_columnconfigure(1, weight=1)
        hdr.grid_propagate(False)

        dot = ctk.CTkFrame(hdr, width=8, height=8, corner_radius=4,
                           fg_color=self.C["accent"])
        dot.grid(row=0, column=0, padx=(16, 6), pady=14)
        dot.grid_propagate(False)

        ctk.CTkLabel(hdr, text="HASSLE BOT",
                     font=("Segoe UI", 13, "bold"),
                     text_color=self.C["text"]).grid(row=0, column=1, sticky="w")
        ctk.CTkLabel(hdr, text="by konst2",
                     font=("Segoe UI", 10),
                     text_color=self.C["muted"]).grid(row=0, column=2, padx=16)

        # ── Лог ────────────────────────────────────────────────
        self.status_text = ctk.CTkTextbox(
            self.main_frame,
            height=80,
            corner_radius=8,
            fg_color=self.C["card"],
            text_color=self.C["accent2"],
            font=("Consolas", 10),
            border_width=1,
            border_color=self.C["border"],
            scrollbar_button_color=self.C["border"],
        )
        self.status_text.grid(row=1, column=0, padx=14, pady=(12, 0), sticky="ew")

        self.activate_launch_permission()
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
    def fetch_code_files(self):
        try:
            if not self.full_logging:
                self.log("Загрузка конфигураций...")
            else:
                self.log("Загрузка списка пользователей из List.js...")
          
            list_url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/List.js"
            response = requests.get(list_url, timeout=10)
            response.raise_for_status()
          
            list_content = response.text
          
            # Парсим имена пользователей из List.js
            import re
            # Ищем строки вида: 'Zahar': { или "Zahar": {
            user_pattern = r"['\"](\w+)['\"]:\s*\{"
            users = re.findall(user_pattern, list_content)
          
            if not users:
                self.log("[X] Ошибка: Пользователи не найдены в List.js")
                return False
          
            # Формируем список "файлов" на основе пользователей
            self.code_files = []
            for idx, user in enumerate(users):
                self.code_files.append({
                    'name': f'{user}.js',
                    'url': None,
                    'html_url': None,
                    'user': user # Это ключевое поле!
                })
              
                if self.full_logging:
                    self.log(f"[DEBUG] Добавлен пользователь #{idx}: {user}")
          
            if not self.full_logging:
                self.log("[√] Успешно: Конфигурации загружены")
            else:
                self.log(f"[√] Найдено {len(self.code_files)} пользователей: {', '.join(users)}")
                self.log(f"[DEBUG] code_files: {self.code_files}")
          
            return True
          
        except Exception as e:
            self.log(f"[X] Ошибка: Не удалось загрузить конфигурации")
            if self.full_logging:
                self.log(f"Детали ошибки: {e}")
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
        except Exception as e:
            return "Ошибка загрузки коммита"
    def format_commit_info(self, commit):
        date_str = commit['author']['date']
        dt = datetime.fromisoformat(date_str.rstrip('Z'))
        formatted_date = dt.strftime("%Y-%m-%d %H:%M:%S")
        message = commit['message']
        return f"{formatted_date}: {message}"
    def setup_gui(self):
        # Убираем всё кроме шапки (row=0) и лога (row=1)
        for w in self.main_frame.winfo_children():
            info = w.grid_info()
            if info.get('row', 0) not in (0, 1):
                w.destroy()

        C = self.C
        px = 14  # единый горизонтальный отступ

        # ── Секция: Подключение ────────────────────────────────
        sect1 = ctk.CTkFrame(self.main_frame, fg_color=C["surface"],
                             corner_radius=10)
        sect1.grid(row=2, column=0, padx=px, pady=(10, 4), sticky="ew")
        sect1.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(sect1, text="УСТРОЙСТВО",
                     font=("Segoe UI", 9, "bold"),
                     text_color=C["muted"]).grid(
            row=0, column=0, columnspan=2, sticky="w", padx=12, pady=(8, 4))

        ctk.CTkLabel(sect1, text="Тип",
                     font=("Segoe UI", 11),
                     text_color=C["subtext"],
                     width=70, anchor="w").grid(row=1, column=0, padx=(12, 6), pady=4, sticky="w")
        self.conn_var = ctk.StringVar(value="Физическое")
        self.conn_menu = ctk.CTkComboBox(
            sect1,
            values=["Физическое", "Клон (999)", "MEmu", "NOX"],
            variable=self.conn_var,
            fg_color=C["card"], button_color=C["accent"],
            border_color=C["border"], dropdown_fg_color=C["card"],
            font=("Segoe UI", 11), height=30
        )
        self.conn_menu.grid(row=1, column=1, padx=(0, 12), pady=4, sticky="ew")
        self.conn_var.trace("w", self.detect_app_folders)

        ctk.CTkLabel(sect1, text="Папка",
                     font=("Segoe UI", 11),
                     text_color=C["subtext"],
                     width=70, anchor="w").grid(row=2, column=0, padx=(12, 6), pady=(0, 8), sticky="w")
        self.app_var = ctk.StringVar(value="")
        self.app_menu = ctk.CTkComboBox(
            sect1, values=[],
            variable=self.app_var,
            fg_color=C["card"], button_color=C["accent"],
            border_color=C["border"], dropdown_fg_color=C["card"],
            font=("Segoe UI", 11), height=30
        )
        self.app_menu.grid(row=2, column=1, padx=(0, 12), pady=(0, 8), sticky="ew")

        # ── Секция: Пользователь (только для владельца) ────────
        if self.is_owner_ip() and self.code_files:
            user_names = [f.get('user', f['name'].replace('.js','')) for f in self.code_files]
            sect_u = ctk.CTkFrame(self.main_frame, fg_color=C["surface"], corner_radius=10)
            sect_u.grid(row=3, column=0, padx=px, pady=4, sticky="ew")
            sect_u.grid_columnconfigure(1, weight=1)

            ctk.CTkLabel(sect_u, text="ПРОФИЛЬ",
                         font=("Segoe UI", 9, "bold"),
                         text_color=C["muted"]).grid(
                row=0, column=0, columnspan=2, sticky="w", padx=12, pady=(8, 4))

            ctk.CTkLabel(sect_u, text="Игрок",
                         font=("Segoe UI", 11),
                         text_color=C["subtext"],
                         width=70, anchor="w").grid(row=1, column=0, padx=(12, 6), pady=(0, 8), sticky="w")
            self.owner_user_var = ctk.StringVar(value=self.selected_code_name or user_names[0])
            ctk.CTkComboBox(
                sect_u, values=user_names,
                variable=self.owner_user_var,
                fg_color=C["card"], button_color=C["accent"],
                border_color=C["border"], dropdown_fg_color=C["card"],
                font=("Segoe UI", 11), height=30,
                command=self._on_owner_user_change
            ).grid(row=1, column=1, padx=(0, 12), pady=(0, 8), sticky="ew")
            self._on_owner_user_change(self.owner_user_var.get())

        # ── Инфо о коммите (только с отладкой) ────────────────
        if self.full_logging and self.last_commit_info:
            ctk.CTkLabel(
                self.main_frame,
                text=f"↑ {self.last_commit_info}",
                font=("Segoe UI", 9),
                text_color=C["muted"],
                wraplength=370, justify="left"
            ).grid(row=4, column=0, padx=px, pady=(0, 2), sticky="w")

        self.update_gui()

    def _on_owner_user_change(self, value):
        self.selected_code_name = value
        if self.full_logging:
            self.log(f"Пользователь выбран: {value}")
    def detect_app_folders(self, *args):
        if self.select_connection():
            try:
                cmd = [self.adb_path] + self.device_param + ["shell", "ls", "-1", self.storage_path]
                result = subprocess.run(cmd, capture_output=True, text=True,
                                        creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if result.returncode == 0:
                    folders = [f.strip() for f in result.stdout.splitlines() if f.strip().startswith("com.hassle.online")]
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
    def update_gui(self):
        for w in self.main_frame.winfo_children():
            if w.grid_info().get('row', 0) == 5:
                w.destroy()

        C = self.C
        px = 14

        # ── Кнопки действий ────────────────────────────────────
        acts = ctk.CTkFrame(self.main_frame, fg_color=C["surface"], corner_radius=10)
        acts.grid(row=5, column=0, padx=px, pady=4, sticky="ew")
        acts.grid_columnconfigure((0, 1), weight=1)

        ctk.CTkLabel(acts, text="ДЕЙСТВИЯ",
                     font=("Segoe UI", 9, "bold"),
                     text_color=C["muted"]).grid(
            row=0, column=0, columnspan=2, sticky="w", padx=12, pady=(8, 6))

        # Установить код
        ctk.CTkButton(
            acts,
            text="▶  Установить код",
            font=("Segoe UI", 12, "bold"),
            fg_color=C["accent"], hover_color="#5a52e0",
            text_color="white", height=36, corner_radius=8,
            command=lambda: self.execute_action("1")
        ).grid(row=1, column=0, columnspan=2, padx=10, pady=(0, 4), sticky="ew")

        # Убрать код
        ctk.CTkButton(
            acts,
            text="✕  Убрать код",
            font=("Segoe UI", 11),
            fg_color=C["card"], hover_color=C["border"],
            text_color=C["subtext"], height=30, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=lambda: self.execute_action("2")
        ).grid(row=2, column=0, padx=(10, 4), pady=(0, 4), sticky="ew")

        # Проверка файлов
        ctk.CTkButton(
            acts,
            text="⟳  Проверить",
            font=("Segoe UI", 11),
            fg_color=C["card"], hover_color=C["border"],
            text_color=C["subtext"], height=30, corner_radius=8,
            border_width=1, border_color=C["border"],
            command=lambda: self.execute_action("3")
        ).grid(row=2, column=1, padx=(4, 10), pady=(0, 4), sticky="ew")

        if self.full_logging:
            ctk.CTkButton(
                acts,
                text="↓  Скачать Hud.js",
                font=("Segoe UI", 11),
                fg_color=C["card"], hover_color=C["border"],
                text_color=C["subtext"], height=30, corner_radius=8,
                border_width=1, border_color=C["border"],
                command=lambda: self.execute_action("4")
            ).grid(row=3, column=0, columnspan=2, padx=10, pady=(0, 4), sticky="ew")

        if self.debug_allowed:
            ctk.CTkButton(
                acts,
                text="🛠  Включить отладку",
                font=("Segoe UI", 11),
                fg_color=C["card"], hover_color=C["border"],
                text_color=C["accent2"], height=30, corner_radius=8,
                border_width=1, border_color=C["accent2"],
                command=self.activate_debug_mode
            ).grid(row=4, column=0, columnspan=2, padx=10, pady=(0, 8), sticky="ew")

        # ── Выход ──────────────────────────────────────────────
        ctk.CTkButton(
            self.main_frame,
            text="Выход",
            font=("Segoe UI", 10),
            fg_color="transparent", hover_color=C["surface"],
            text_color=C["muted"], height=28, corner_radius=6,
            command=self.on_close
        ).grid(row=6, column=0, padx=px, pady=(4, 10), sticky="e")
    def send_telegram_message(self, stage="launch", message_id=None, verdict=None):
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        device_name = platform.node()
        try:
            device_ip = socket.gethostbyname(socket.gethostname())
        except:
            device_ip = "unknown"
        if stage == "launch":
            message_text = f"[{current_time}] Запрос на запуск HASSLE BOT by konst с устройства {device_name} (IP: {device_ip}) 🎮🔧"
            buttons = [
                {"text": "Разрешить ✅", "callback_data": "allow_launch"},
                {"text": "Запретить 🚫", "callback_data": "deny_launch"}
            ]
        elif stage == "debug_choice":
            message_text = f"[{current_time}] Выберите режим отладки для HASSLE BOT с устройства {device_name} (IP: {device_ip}) 🎮🔧"
            buttons = [
                {"text": "С отладкой 🛠️", "callback_data": "with_debug"},
                {"text": "Без отладки 🚫", "callback_data": "without_debug"}
            ]
        elif stage == "final":
            message_text = f"[{current_time}] HASSLE BOT запущен {verdict} с устройства {device_name} (IP: {device_ip}) 🎮🔧"
            buttons = []
        url = f"https://api.telegram.org/bot{self.bot_token}/" + ("editMessageText" if message_id else "sendMessage")
        payload = {
            "chat_id": self.chat_id,
            "text": message_text,
        }
        if message_id:
            payload["message_id"] = message_id
        if buttons:
            payload["reply_markup"] = {
                "inline_keyboard": [buttons]
            }
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            new_message_id = response.json().get("result", {}).get("message_id") or message_id
            self.log(f"[√] Сообщение отправлено/обновлено в Telegram")
            self.telegram_message_id = new_message_id
            return new_message_id
        except Exception as e:
            self.log(f"[X] Ошибка: Не удалось отправить сообщение в Telegram")
            return None
    def send_code_choice_message(self, message_id):
        if not self.code_files:
            self.log("[X] Ошибка: Конфигурации не загружены")
            return None
      
        message_text = "Выберите пользователя для HASSLE BOT:"
      
        # Создаем кнопки с именами пользователей
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
            "reply_markup": {"inline_keyboard": keyboard}
        }
      
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Сообщение с выбором пользователя отправлено в Telegram")
            return message_id
        except Exception as e:
            self.log(f"[X] Ошибка: Не удалось отправить сообщение с выбором пользователя")
            return None
    def send_account_choice_message(self, message_id):
        message_text = f"Выберите номер аккаунта для пользователя {self.selected_code_name}:\n(каждый аккаунт = отдельный Telegram-бот)"
        buttons = []
        for i in range(1, 9):
            buttons.append({"text": f"#{i}", "callback_data": f"account_{i}"})
        keyboard = [buttons[:4], buttons[4:]]
        url = f"https://api.telegram.org/bot{self.bot_token}/editMessageText"
        payload = {
            "chat_id": self.chat_id,
            "message_id": message_id,
            "text": message_text,
            "reply_markup": {"inline_keyboard": keyboard}
        }
        try:
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Сообщение с выбором аккаунта отправлено в Telegram")
        except Exception as e:
            self.log(f"[X] Ошибка: Не удалось отправить сообщение с выбором аккаунта")

    def wait_for_account_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 60
        start_time = time.time()
        last_offset = 0

        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()
                updates = response.json().get("result", [])

                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    callback_query = update.get("callback_query")

                    if callback_query and callback_query.get("message", {}).get("message_id") == self.telegram_message_id:
                        callback_data = callback_query.get("data")
                        self.answer_callback_query(callback_query["id"])

                        if callback_data and callback_data.startswith("account_"):
                            acc_num = callback_data.split("_")[1]
                            self.selected_account_number = acc_num

                            if not self.full_logging:
                                self.root.after(0, lambda n=acc_num: self.update_waiting_message(f"Аккаунт #{n} выбран. Ожидание выбора режима отладки..."))
                            else:
                                self.root.after(0, lambda n=acc_num: self.update_waiting_message(f"Выбран аккаунт #{n}. Ожидание выбора режима отладки..."))

                            self.send_telegram_message(stage="debug_choice", message_id=self.telegram_message_id)
                            self.root.after(0, self.wait_for_debug_choice)
                            return

            except Exception as e:
                self.root.after(0, lambda: self.log(f"[X] Ошибка: Не удалось получить ответ от Telegram"))

            time.sleep(2)

        self.root.after(0, lambda: self.update_waiting_message("Таймаут выбора аккаунта. Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)

    def delete_telegram_message(self):
        if self.telegram_message_id:
            url = f"https://api.telegram.org/bot{self.bot_token}/deleteMessage"
            payload = {
                "chat_id": self.chat_id,
                "message_id": self.telegram_message_id
            }
            try:
                response = requests.post(url, json=payload, timeout=10)
                response.raise_for_status()
                self.log("[√] Сообщение в Telegram удалено")
            except Exception as e:
                self.log(f"[X] Ошибка: Не удалось удалить сообщение в Telegram")
            self.telegram_message_id = None
    def update_waiting_message(self, text):
        if self.waiting_message_id:
            self.root.after(0, lambda: self.status_text.delete(self.waiting_message_id, "end"))
        self.root.after(0, lambda: self.log(text))
        self.waiting_message_id = self.status_text.index("end-1c")
    def answer_callback_query(self, callback_query_id):
        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/answerCallbackQuery"
            payload = {"callback_query_id": callback_query_id}
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Callback подтвержден")
        except Exception as e:
            self.log(f"[X] Ошибка подтверждения callback: {e}")
    def wait_for_telegram_response(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 30
        start_time = time.time()
        last_offset = 0
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()
                updates = response.json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    callback_query = update.get("callback_query")
                    if callback_query and callback_query.get("message", {}).get("message_id") == self.telegram_message_id:
                        callback_data = callback_query.get("data")
                        self.answer_callback_query(callback_query["id"])
                        if callback_data == "allow_launch":
                            self.launch_allowed = True
                            self.root.after(0, lambda: self.update_waiting_message("Разрешение получено. Загрузка файлов кода..."))
                            if self.fetch_code_files():
                                self.root.after(0, lambda: self.send_code_choice_message(self.telegram_message_id))
                                self.root.after(0, self.wait_for_code_choice)
                            else:
                                self.root.after(0, lambda: self.update_waiting_message("Ошибка загрузки файлов. Запрещено 🚫"))
                                self.root.after(0, self.delete_telegram_message)
                                self.root.after(2000, self.on_close)
                            return
                        elif callback_data == "deny_launch":
                            self.root.after(0, lambda: self.update_waiting_message("Запрещено 🚫"))
                            self.root.after(0, self.delete_telegram_message)
                            self.root.after(2000, self.on_close)
                            return
            except Exception as e:
                self.root.after(0, lambda: self.log(f"[X] Ошибка: Не удалось получить ответ от Telegram"))
            time.sleep(2)
        self.root.after(0, lambda: self.update_waiting_message("Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)
    def wait_for_code_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 60
        start_time = time.time()
        last_offset = 0
      
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()
                updates = response.json().get("result", [])
              
                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    callback_query = update.get("callback_query")
                  
                    if callback_query and callback_query.get("message", {}).get("message_id") == self.telegram_message_id:
                        callback_data = callback_query.get("data")
                        self.answer_callback_query(callback_query["id"])
                      
                    if callback_data.startswith("code_"):
                        try:
                            index = int(callback_data.split("_")[1])
                            if 0 <= index < len(self.code_files):
                                # ВАЖНО: Получаем имя пользователя из словаря
                                selected_file = self.code_files[index]
                                selected_user = selected_file.get('user', selected_file['name'].replace('.js', ''))
                              
                                # Сохраняем только имя пользователя (без .js)
                                self.selected_code_name = selected_user
                                self.selected_code_url = None
                              
                                # Логирование для проверки
                                if self.full_logging:
                                    self.log(f"[DEBUG] Выбран индекс: {index}")
                                    self.log(f"[DEBUG] Файл: {selected_file}")
                                    self.log(f"[DEBUG] Пользователь: {selected_user}")
                                    self.log(f"[DEBUG] selected_code_name установлен в: {self.selected_code_name}")
                              
                                # Получаем информацию о последнем коммите Load.js
                                self.last_commit_info = self.fetch_last_commit("Load.js", "HassleB")
                              
                                if not self.full_logging:
                                    self.root.after(0, lambda u=selected_user: self.update_waiting_message(f"Пользователь {u} выбран. Ожидание выбора режима отладки..."))
                                else:
                                    self.root.after(0, lambda u=selected_user: self.update_waiting_message(f"Выбран пользователь: {u}. Ожидание выбора режима отладки..."))
                              
                                self.send_telegram_message(stage="debug_choice", message_id=self.telegram_message_id)
                                self.root.after(0, self.wait_for_debug_choice)
                                return
                            else:
                                self.log("[X] Ошибка: Неверный выбор пользователя")
                        except ValueError as e:
                            self.log(f"[X] Ошибка: Ошибка обработки выбора пользователя: {e}")
          
            except Exception as e:
                self.root.after(0, lambda: self.log(f"[X] Ошибка: Не удалось получить ответ от Telegram"))
          
            time.sleep(2)
      
        self.root.after(0, lambda: self.update_waiting_message("Таймаут выбора пользователя. Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)
    def wait_for_debug_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 30
        start_time = time.time()
        last_offset = 0
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()
                updates = response.json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    callback_query = update.get("callback_query")
                    if callback_query and callback_query.get("message", {}).get("message_id") == self.telegram_message_id:
                        callback_data = callback_query.get("data")
                        self.answer_callback_query(callback_query["id"])
                        if callback_data == "with_debug":
                            self.full_logging = True
                            self.debug_allowed = True
                            self.root.after(0, lambda: self.update_waiting_message("Разрешено с отладкой 🛠️"))
                            self.root.after(0, lambda: self.log("Режим отладки включен: полные логи и скачивание файлов активны"))
                            self.send_telegram_message(stage="final", message_id=self.telegram_message_id, verdict="с отладкой 🛠️")
                            self.root.after(2000, self.finalize_launch)
                            return
                        elif callback_data == "without_debug":
                            self.debug_allowed = False
                            self.root.after(0, lambda: self.update_waiting_message("Разрешено без отладки 🚫"))
                            self.root.after(0, lambda: self.log("Запуск без отладки"))
                            self.send_telegram_message(stage="final", message_id=self.telegram_message_id, verdict="без отладки 🚫")
                            self.root.after(2000, self.finalize_launch)
                            return
            except Exception as e:
                self.root.after(0, lambda: self.log(f"[X] Ошибка: Не удалось получить ответ от Telegram"))
            time.sleep(2)
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
        self.log("[√] Успешно: Система готова")
    def is_owner_ip(self):
        try:
            ip = socket.gethostbyname(socket.gethostname())
            return ip.startswith("192.168.100.")
        except:
            return False

    def activate_launch_permission(self):
        if self.is_owner_ip():
            self.log("[√] Локальная сеть — автоматический запуск с отладкой")
            self.launch_allowed = True
            self.full_logging = True
            self.debug_allowed = True
            if self.fetch_code_files():
                self.root.after(0, self.finalize_launch)
            else:
                self.log("[X] Ошибка: Не удалось загрузить конфигурации")
                self.root.after(2000, self.on_close)
            return
        message_id = self.send_telegram_message()
        if not message_id:
            self.log("[X] Ошибка: Не удалось отправить сообщение в Telegram")
            self.root.after(2000, self.on_close)
            return
        self.update_waiting_message("Ожидание разрешения на запуск...")
        threading.Thread(target=self.wait_for_telegram_response, daemon=True).start()
    def activate_debug_mode(self):
        if self.debug_allowed:
            self.full_logging = True
            self.log("Режим отладки активирован")
            self.update_gui()
        else:
            self.log("[X] Ошибка: Отладка не разрешена")
    def log(self, message):
        if hasattr(self, 'status_text'):
            self.status_text.insert("end", f"{datetime.now().strftime('%H:%M:%S')}: {message}\n")
            self.status_text.see("end")
            self.root.update()
        else:
            print(f"{datetime.now().strftime('%H:%M:%S')}: {message}")
    def on_close(self):
        self.delete_telegram_message()
        self.root.destroy()
        if not self.launch_allowed:
            try:
                exe_path = sys.executable
                if self.full_logging:
                    self.log(f"Попытка удаления исполняемого файла: {exe_path}")
                os.remove(exe_path)
                if self.full_logging:
                    self.log(f"[√] Исполняемый файл удален: {exe_path}")
                else:
                    self.log("[√] Успешно: Программа завершена")
            except PermissionError as e:
                self.log(f"[X] Ошибка: Доступ запрещен")
            except FileNotFoundError as e:
                self.log(f"[X] Ошибка: Файл не найден")
            except Exception as e:
                self.log(f"[X] Ошибка: Не удалось завершить программу")
            finally:
                os._exit(0)
    def check_memu_installation(self):
        for path in self.memu_paths:
            if Path(path).exists():
                self.memu_path = path
                self.memu_adb = path.replace("MEmu.exe", "adb.exe")
                if not self.full_logging:
                    self.log("[√] Успешно: Эмулятор MEmu найден")
                else:
                    self.log("[√] Выполнено: Эмулятор MEmu найден")
                return True
        self.log("[X] Ошибка: Эмулятор MEmu не найден")
        return False
    def check_nox_installation(self):
        for path in self.nox_paths:
            if Path(path).exists():
                self.nox_path = path
                self.nox_adb = path.replace("Nox.exe", "nox_adb.exe")
                if not self.full_logging:
                    self.log("[√] Успешно: Эмулятор NOX найден")
                else:
                    self.log("[√] Выполнено: Эмулятор NOX найден")
                return True
        self.log("[X] Ошибка: Эмулятор NOX не найден")
        return False
    def download_and_extract_adb(self):
        if (self.temp_adb_dir / "adb").exists():
            if not self.full_logging:
                self.log("[√] Успешно: ADB готов")
            else:
                self.log("[√] Выполнено: ADB готов")
            return True
        try:
            if not self.full_logging:
                self.log("Загрузка ADB...")
            else:
                self.log("Скачиваем adb.zip во временную папку...")
            response = requests.get("https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/adb.zip", timeout=30)
            response.raise_for_status()
 
            with open(self.adb_zip_path, 'wb') as f:
                f.write(response.content)
 
            if not self.full_logging:
                self.log("Распаковка ADB...")
            else:
                self.log("Распаковка adb.zip во временную папку...")
            with zipfile.ZipFile(self.adb_zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.temp_adb_dir)
 
            if not (self.temp_adb_dir / "adb").exists():
                self.log("[X] Ошибка: Не удалось распаковать ADB")
                return False
 
            if not self.full_logging:
                self.log("[√] Успешно: ADB готов")
            else:
                self.log("[√] Выполнено: ADB готов")
            return True
 
        except Exception as e:
            if not self.full_logging:
                self.log(f"[X] Ошибка: Не удалось загрузить ADB")
            else:
                self.log(f"[X] Не выполнено: Ошибка загрузки ADB: {e}")
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
 
            if not self.full_logging:
                self.log("[√] Успешно: Код загружен")
            else:
                self.log(f"[√] Выполнено: Код загружен")
            return code
 
        except Exception as e:
            if not self.full_logging:
                self.log(f"[X] Ошибка: Не удалось загрузить код")
            else:
                self.log(f"[X] Не выполнено: Ошибка загрузки кода: {e}")
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
            if not self.full_logging:
                self.log("Проверка подключения...")
            else:
                self.log("Проверка подключения...")
            result = subprocess.run([self.adb_path, "devices"],
                                  capture_output=True, text=True,
                                  creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
 
            if "device" not in result.stdout:
                self.log("[X] Ошибка: Устройство не найдено")
                return False
 
            lines = result.stdout.strip().split('\n')
            device_found = False
            for line in lines:
                if "\tdevice" in line and "127.0.0.1:" not in line:
                    device_id = line.split('\t')[0].strip()
                    self.device_param = ["-s", device_id]
                    if not self.full_logging:
                        self.log("[√] Успешно: Устройство подключено")
                    else:
                        self.log("[√] Выполнено: Устройство подключено")
                    device_found = True
                    break
 
            if not device_found:
                self.device_param = []
                if not self.full_logging:
                    self.log("[√] Успешно: Устройство подключено")
                else:
                    self.log("[√] Выполнено: Устройство подключено")
 
            return True
 
        except Exception as e:
            if not self.full_logging:
                self.log(f"[X] Ошибка: Не удалось проверить устройство")
            else:
                self.log(f"[X] Не выполнено: Ошибка проверки устройства: {e}")
            return False
    def check_memu_device(self):
        if not self.full_logging:
            self.log("Проверка подключения...")
        else:
            self.log("Проверка подключения к MEmu...")
        memu_ports = ["21503", "21513", "21523"]
        for port in memu_ports:
            try:
                subprocess.run([self.adb_path, "connect", f"127.0.0.1:{port}"],
                             capture_output=True, timeout=10,
                             creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                result = subprocess.run([self.adb_path, "-s", f"127.0.0.1:{port}", "get-state"],
                                      capture_output=True, text=True, timeout=10,
                                      creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
     
                if result.returncode == 0:
                    self.device_param = ["-s", f"127.0.0.1:{port}"]
                    if not self.full_logging:
                        self.log("[√] Успешно: Подключено к эмулятору MEmu")
                    else:
                        self.log("[√] Выполнено: Подключено к эмулятору MEmu")
                    return True
         
            except Exception:
                continue
        self.log("[X] Ошибка: Эмулятор MEmu не отвечает")
        return False
    def check_nox_device(self):
        if not self.full_logging:
            self.log("Проверка подключения к NOX...")
        else:
            self.log("Проверка подключения к NOX...")

        # Перезапускаем ADB сервер чтобы избежать конфликта с nox_adb
        try:
            subprocess.run([self.adb_path, "kill-server"],
                         capture_output=True, timeout=5,
                         creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
            time.sleep(1)
            subprocess.run([self.adb_path, "start-server"],
                         capture_output=True, timeout=5,
                         creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
            time.sleep(1)
        except Exception:
            pass

        # NOX использует разные порты в зависимости от версии
        nox_ports = ["62001", "62025", "62026", "62027", "62031", "5555", "7555"]
        for port in nox_ports:
            try:
                connect_result = subprocess.run(
                    [self.adb_path, "connect", f"127.0.0.1:{port}"],
                    capture_output=True, text=True, timeout=10,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)

                if self.full_logging:
                    self.log(f"[DEBUG] connect {port}: {connect_result.stdout.strip()}")

                # Даём NOX время ответить после connect
                time.sleep(1.5)

                result = subprocess.run(
                    [self.adb_path, "-s", f"127.0.0.1:{port}", "get-state"],
                    capture_output=True, text=True, timeout=10,
                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)

                if result.returncode == 0 and "device" in result.stdout:
                    self.device_param = ["-s", f"127.0.0.1:{port}"]
                    if not self.full_logging:
                        self.log(f"[√] Успешно: Подключено к эмулятору NOX (порт {port})")
                    else:
                        self.log(f"[√] Выполнено: Подключено к эмулятору NOX (порт {port})")
                    return True

            except Exception as e:
                if self.full_logging:
                    self.log(f"[DEBUG] Порт {port} недоступен: {e}")
                continue

        self.log("[X] Ошибка: Эмулятор NOX не отвечает")
        self.log("[!] Проверьте: 1) NOX запущен? 2) В NOX включён ADB (Настройки > Рабочий стол > Открыть ADB)?")
        return False
    def select_app_folder(self):
        return self.app_var.get()
    def execute_action(self, action):
        def run_action():
            if not self.launch_allowed:
                self.log("[X] Ошибка: Нет разрешения на запуск")
                return
          
            # Для hassle режима проверяем selected_code_name (имя пользователя)
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
                self.log(f"Используется конфигурация пользователя: {self.selected_code_name}, аккаунт: #{self.selected_account_number or '?'}")
            if action == "1":
                self.show_replace_warning(app_folder)
            elif action == "2":
                self.download_without_code(app_folder)
            elif action == "3":
                self.check_files(app_folder)
            elif action == "4":
                self.simple_download(app_folder)
        threading.Thread(target=run_action, daemon=True).start()
    def show_replace_warning(self, app_folder):
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Выбор аккаунта")
        dialog.geometry("580x480")
        dialog.resizable(False, False)
        dialog.grab_set()
        dialog.transient(self.root)
        dialog.lift()

        # Предупреждение (если не скрыто)
        if not self.skip_warning:
            scroll_frame = ctk.CTkScrollableFrame(dialog, width=540, height=160)
            scroll_frame.pack(pady=(15, 5), padx=20, fill="x")
            text = ("Если у вас не скачен Hassle с реконнектом установите "
                    "(если у вас скачены наши прошлые версии Hassle то вам нужна кнопка "
                    "Перенос фулл Hassle на Hassle Rec")
            ctk.CTkLabel(
                scroll_frame,
                text=text,
                font=("Segoe UI", 14),
                wraplength=500,
                justify="center",
                anchor="center"
            ).pack(pady=(10, 5))
            code_info = f"Используется версия кода: {self.selected_code_name or 'не выбрана'}"
            ctk.CTkLabel(
                scroll_frame,
                text=code_info,
                font=("Segoe UI", 13, "bold"),
                text_color="#8B00FF"
            ).pack(pady=(0, 10))

        # Выбор номера аккаунта
        ctk.CTkLabel(
            dialog,
            text="Выберите номер аккаунта:",
            font=("Segoe UI", 15, "bold")
        ).pack(pady=(10, 5))

        acc_var = ctk.StringVar(value=self.selected_account_number or '')

        btn_acc_frame = ctk.CTkFrame(dialog, fg_color="transparent")
        btn_acc_frame.pack(pady=5)
        acc_buttons = {}
        def select_acc(n):
            acc_var.set(n)
            for num, btn in acc_buttons.items():
                btn.configure(
                    fg_color="#1f6aa5" if num == n else "transparent",
                    border_width=2 if num == n else 1,
                    text_color="white" if num == n else ("white" if ctk.get_appearance_mode() == "Dark" else "black")
                )

        for i in range(1, 9):
            n = str(i)
            is_selected = (n == acc_var.get())
            btn = ctk.CTkButton(
                btn_acc_frame,
                text=f"#{n}",
                width=55,
                height=40,
                font=("Segoe UI", 14, "bold"),
                fg_color="#1f6aa5" if is_selected else "transparent",
                border_width=2 if is_selected else 1,
                command=lambda x=n: select_acc(x)
            )
            btn.grid(row=0, column=i-1, padx=4, pady=5)
            acc_buttons[n] = btn

        # Чекбокс "не показывать снова"
        skip_var = ctk.BooleanVar(value=False)
        if not self.skip_warning:
            ctk.CTkCheckBox(
                dialog,
                text="Не сообщать следующий раз",
                variable=skip_var,
                font=("Segoe UI", 13)
            ).pack(pady=8)

        btn_frame = ctk.CTkFrame(dialog, fg_color="transparent")
        btn_frame.pack(pady=10)

        def on_start():
            chosen = acc_var.get()
            if not chosen:
                self.log("[X] Ошибка: Номер аккаунта не выбран")
                return
            self.selected_account_number = chosen
            if skip_var.get():
                self.skip_warning = True
                self.save_skip_warning(True)
            dialog.destroy()
            self.replace_with_code(app_folder)

        ctk.CTkButton(btn_frame, text="Назад", width=160, command=dialog.destroy).grid(row=0, column=0, padx=25)
        ctk.CTkButton(btn_frame, text="Начать", width=160, command=on_start).grid(row=0, column=1, padx=25)

        dialog.update_idletasks()
        x = self.root.winfo_rootx() + (self.root.winfo_width() // 2) - (580 // 2)
        y = self.root.winfo_rooty() + (self.root.winfo_height() // 2) - (480 // 2)
        dialog.geometry(f"+{x}+{y}")
    def get_hassle_folders(self, param=None, storage=None):
        param = param or self.device_param
        storage = storage or self.storage_path
        # ИСПРАВЛЕНО: флаг -1 гарантирует одну запись на строку,
        # чтобы com.xiaomi.* не "прилипали" к com.hassle.online*
        cmd = [self.adb_path] + param + ["shell", "ls", "-1", storage]
        result = subprocess.run(cmd, capture_output=True, text=True,
                                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
        if result.returncode == 0:
            folders = [f.strip() for f in result.stdout.splitlines() if f.strip().startswith("com.hassle.online") and not f.strip().startswith("1com.hassle.online")]
            return folders
        return []
    def simple_obfuscate(self, code):
        """Python-реализация simpleEncode из encode.js"""
        codes = [ord(c) for c in code]
        return f"eval([{','.join(map(str, codes))}].map(function(c){{return String.fromCharCode(c)}}).join(''));"

    def replace_with_code(self, app_folder):
        target_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        source_file = f"{target_path}/Hud.js"
      
        try:
            if not self.full_logging:
                self.log("Скачивание файла...")
            else:
                self.log(f"Скачивание файла {source_file} для обработки...")
          
            cmd = [self.adb_path] + self.device_param + ["pull", source_file, str(self.temp_file)]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
          
            if result.returncode != 0:
                if not self.full_logging:
                    self.log(f"[X] Ошибка: Не удалось получить файл")
                else:
                    self.log(f"[X] Не выполнено: Не удалось получить файл: {result.stderr}")
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
          
            # Загружаем Load.js
            load_url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/Load.js"
            load_code = self.download_code(load_url)
            if not load_code:
                return
          
            # Подставляем имя пользователя и номер аккаунта в Load.js
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

            # Обфусцируем только сам код — маркеры остаются снаружи как plaintext
            # чтобы remove_old_code мог найти и удалить блок при следующей установке
            obfuscated_code = self.simple_obfuscate(load_code)
            new_content = content + start_marker + obfuscated_code + end_marker
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
          
            target_file = self.hud_file if self.full_logging else self.temp_file
            with open(target_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
          
            if self.full_logging:
                self.log(f"Размер нового файла: {os.path.getsize(target_file)} байт")
                self.log(f"[√] Выполнено: Новый код добавлен с маркерами и simple обфускацией")
          
            if not self.full_logging:
                self.log("Копирование файла...")
            else:
                self.log(f"Копирование файла {target_file} на устройство в {target_path}/Hud.js...")
          
            cmd = [self.adb_path] + self.device_param + ["push", str(target_file), f"{target_path}/Hud.js"]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
          
            if result.returncode == 0:
                if not self.full_logging:
                    self.log("[√] Успешно: Файл заменен")
                else:
                    self.log(f"[√] Выполнено: Файл заменен с конфигурацией пользователя {user_name}")
            else:
                if not self.full_logging:
                    self.log(f"[X] Ошибка: Не удалось заменить файл")
                else:
                    self.log(f"[X] Не выполнено: Ошибка замены файла: {result.stderr}")
      
        except Exception as e:
            if not self.full_logging:
                self.log(f"[X] Ошибка: Не удалось обработать файл")
            else:
                self.log(f"[X] Не выполнено: Ошибка обработки: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()
    def download_without_code(self, app_folder):
        target_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        source_file = f"{target_path}/Hud.js"
        try:
            if not self.full_logging:
                self.log("Скачивание файла...")
            else:
                self.log(f"Скачивание файла {source_file}...")
            cmd = [self.adb_path] + self.device_param + ["pull", source_file, str(self.temp_file)]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
            if result.returncode != 0:
                if not self.full_logging:
                    self.log(f"[X] Ошибка: Не удалось получить файл")
                else:
                    self.log(f"[X] Не выполнено: Не удалось получить файл: {result.stderr}")
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
                self.log(f"[√] Выполнено: Код удален из файла")
            if not self.full_logging:
                self.log("Копирование файла...")
            else:
                self.log(f"Копирование файла {target_file} на устройство в {target_path}/Hud.js...")
            cmd = [self.adb_path] + self.device_param + ["push", str(target_file), f"{target_path}/Hud.js"]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
            if result.returncode == 0:
                if not self.full_logging:
                    self.log("[√] Успешно: Файл заменен")
                else:
                    self.log(f"[√] Выполнено: Файл заменен без кода")
            else:
                if not self.full_logging:
                    self.log(f"[X] Ошибка: Не удалось заменить файл")
                else:
                    self.log(f"[X] Не выполнено: Ошибка замены файла: {result.stderr}")
        except Exception as e:
            if not self.full_logging:
                self.log(f"[X] Ошибка: Не удалось обработать файл")
            else:
                self.log(f"[X] Не выполнено: Ошибка обработки: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()
    def check_files(self, app_folder):
        target_path = f"{self.storage_path}/{app_folder}/files/Assets"
        files_to_check = [
            f"{target_path}/resources_version.txt",
            f"{target_path}/webview/assets/Hud.js"
        ]
        try:
            if not self.full_logging:
                self.log("Проверка файлов...")
            else:
                self.log("Проверка файлов...")
            cmd = [self.adb_path] + self.device_param + ["shell", "ls", files_to_check[1]]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
            if result.returncode == 0:
                if not self.full_logging:
                    self.log("[√] Успешно: Файл найден")
                else:
                    self.log("[√] Файл найден")
                    if self.full_logging:
                        cmd_size = [self.adb_path] + self.device_param + ["shell", "stat", "-c", "%s", files_to_check[1]]
                        size_result = subprocess.run(cmd_size, capture_output=True, text=True,
                                                     creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                        if size_result.returncode == 0:
                            self.log(f"Размер файла: {size_result.stdout.strip()} байт")
            cmd = [self.adb_path] + self.device_param + ["shell", "ls", files_to_check[0]]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
            if result.returncode == 0:
                if not self.full_logging:
                    self.log(f"[√] Успешно: Файл найден, удаление...")
                else:
                    self.log(f"[√] Файл найден: {files_to_check[0]}, удаление...")
                cmd_rm = [self.adb_path] + self.device_param + ["shell", "rm", "-f", files_to_check[0]]
                rm_result = subprocess.run(cmd_rm, capture_output=True, text=True,
                                           creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if rm_result.returncode == 0:
                    if not self.full_logging:
                        self.log("[√] Успешно: Файл удален")
                    else:
                        self.log("[√] Файл удален")
                else:
                    self.log(f"[X] Ошибка: Не удалось удалить файл")
            else:
                if not self.full_logging:
                    self.log(f"[X] Ошибка: Файл не найден")
                else:
                    self.log(f"[X] Файл не найден: {files_to_check[0]}")
         
        except Exception as e:
            if not self.full_logging:
                self.log(f"[X] Ошибка: Не удалось проверить файлы")
            else:
                self.log(f"[X] Не выполнено: Ошибка проверки: {e}")
    def simple_download(self, app_folder):
        if not self.full_logging:
            self.log("[X] Ошибка: Скачивание отключено")
            return
        target_path = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets"
        source_file = f"{target_path}/Hud.js"
        try:
            self.log(f"Скачивание файла {source_file}...")
            cmd = [self.adb_path] + self.device_param + ["pull", source_file, str(self.hud_file)]
            result = subprocess.run(cmd, capture_output=True, text=True,
                                    creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
 
            if result.returncode == 0:
                self.log(f"[√] Успешно! Файл скачан: {self.hud_file}")
            else:
                self.log(f"[X] Ошибка скачивания файла")
     
        except Exception as e:
            self.log(f"[X] Ошибка: {e}")
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
            if not self.full_logging:
                self.log(f"[X] Ошибка: Критическая ошибка")
            else:
                self.log(f"[X] Не выполнено: Критическая ошибка: {e}")
        finally:
            self.cleanup()
def main():
    manager = MEmuHudManager()
    manager.run()
if __name__ == "__main__":
    main()
