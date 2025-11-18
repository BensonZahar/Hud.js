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
from tkinter import messagebox


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

        # Пути к эмуляторам
        self.memu_paths = [
            r"D:\Program Files\Microvirt\MEmu\MEmu.exe",
            r"C:\Program Files\Microvirt\MEmu\MEmu.exe"
        ]
        self.nox_paths = [
            r"C:\Program Files\Nox\bin\Nox.exe",
            r"C:\Program Files (x86)\Nox\bin\Nox.exe",
            r"D:\Nox\bin\Nox.exe",
            r"C:\Program Files\Bignox\BigNox\bin\Nox.exe",
            r"C:\Program Files (x86)\Bignox\BigNox\bin\Nox.exe",
        ]

        self.memu_path = None
        self.memu_adb = None
        self.nox_path = None

        self.temp_adb_dir = Path(tempfile.gettempdir()) / "adb_temp"
        self.local_adb = self.temp_adb_dir / "adb" / "adb.exe"

        self.script_dir = Path(__file__).parent
        self.hud_file = self.script_dir / "Hud.js"
        self.hud_nocode_file = self.script_dir / "Hud_nocode.js"
        self.temp_file = self.script_dir / "temp_hud.tmp"

        self.github_repo = "https://api.github.com/repos/BensonZahar/Hud.js/contents/.js%2BLoad.js"
        self.code_files = []
        self.selected_code_url = None
        self.selected_code_name = None
        self.device_param = []
        self.storage_path = ""
        self.adb_path = ""
        self.full_logging = False
        self.debug_allowed = False
        self.launch_allowed = False
        self.bot_token = os.getenv("BOT_TOKEN", "8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA")
        self.chat_id = os.getenv("CHAT_ID", "1046461621")
        self.telegram_message_id = None
        self.waiting_message_id = None

        self.adb_zip_path = Path(tempfile.gettempdir()) / "adb.zip"
        self.cache_file = self.script_dir / "code_files_cache.json"
        self.cache_time = 0

        self.last_commit_info = ""
        self.load_commit_info = ""

        self.mod_done = False

        self.skip_warning_file = self.script_dir / "skip_warning.json"
        self.skip_warning = self.load_skip_warning()

        # GUI
        self.root = ctk.CTk()
        self.root.title("HASSLE BOT by konst")
        self.root.geometry("720x660")
        try:
            icon_path = resource_path("icon.ico")
            if os.path.exists(icon_path):
                self.root.iconbitmap(icon_path)
        except Exception as e:
            print(f"[X] Ошибка установки иконки: {e}")

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=1)
        self.main_frame = ctk.CTkScrollableFrame(self.root, corner_radius=10)
        self.main_frame.grid(padx=20, pady=20, sticky="nsew")
        self.main_frame.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(self.main_frame, text="HASSLE BOT by konst", font=("Arial", 20, "bold")).grid(row=0, column=0, pady=10)

        self.status_text = ctk.CTkTextbox(self.main_frame, height=300, width=600, corner_radius=10)
        self.status_text.grid(row=1, column=0, pady=10, sticky="ew")

        self.activate_launch_permission()

    def load_skip_warning(self):
        if self.skip_warning_file.exists():
            try:
                with open(self.skip_warning_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get('skip', False)
            except:
                return False
        return False

    def save_skip_warning(self, skip):
        try:
            with open(self.skip_warning_file, 'w', encoding='utf-8') as f:
                json.dump({'skip': skip}, f)
        except:
            pass

    def fetch_code_files(self):
        current_time = time.time()
        if current_time - self.cache_time < 3600 and self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.code_files = json.load(f)
                self.log(f"[√] Файлы кода загружены из кэша ({len(self.code_files)} шт.)")
                return True
            except:
                pass

        try:
            self.log("Загрузка списка файлов с GitHub...")
            response = requests.get(self.github_repo, timeout=10)
            response.raise_for_status()
            files = response.json()

            self.code_files = []
            for file in files:
                if file['name'].endswith('.js') and file['name'] not in ['Hud.js', 'Load.js']:
                    self.code_files.append({
                        'name': file['name'],
                        'url': file['download_url'],
                        'html_url': file['html_url']
                    })

            if not self.code_files:
                self.log("[X] Ошибка: Файлы не найдены на GitHub")
                return False

            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.code_files, f)
            self.cache_time = current_time
            self.log(f"[√] Загружено {len(self.code_files)} файлов кода")
            return True
        except Exception as e:
            self.log(f"[X] Ошибка загрузки списка файлов: {e}")
            return False

    def fetch_last_commit(self, file_name):
        commit_cache_file = self.script_dir / f"commit_cache_{file_name}.json"
        current_time = time.time()
        if current_time - self.cache_time < 3600 and commit_cache_file.exists():
            try:
                with open(commit_cache_file, 'r', encoding='utf-8') as f:
                    last_commit = json.load(f)
                return self.format_commit_info(last_commit)
            except:
                pass

        try:
            commits_url = f"https://api.github.com/repos/BensonZahar/Hud.js/commits?path=.js%2BLoad.js/{file_name}"
            response = requests.get(commits_url, timeout=10)
            response.raise_for_status()
            commits = response.json()
            if not commits:
                return "Нет коммитов"
            last_commit = commits[0]['commit']
            with open(commit_cache_file, 'w', encoding='utf-8') as f:
                json.dump(last_commit, f)
            self.cache_time = current_time
            return self.format_commit_info(last_commit)
        except:
            return "Ошибка загрузки"

    def format_commit_info(self, commit):
        date_str = commit['author']['date']
        dt = datetime.fromisoformat(date_str.rstrip('Z'))
        formatted_date = dt.strftime("%Y-%m-%d %H:%M")
        message = commit['message'].split('\n')[0]
        return f"{formatted_date}: {message}"

    def setup_gui(self):
        for widget in self.main_frame.winfo_children():
            if widget != self.status_text and widget.grid_info().get('row') != 0:
                widget.destroy()

        ctk.CTkLabel(self.main_frame, text="Тип подключения:").grid(row=3, column=0, pady=5, sticky="w")
        self.conn_var = ctk.StringVar(value="Автоопределение эмулятора")
        conn_menu = ctk.CTkComboBox(self.main_frame,
                                   values=[
                                       "Автоопределение эмулятора",
                                       "1 - Физическое устройство",
                                       "2 - Клонированное хранилище (999)",
                                       "3 - Эмулятор MEmu",
                                       "4 - Эмулятор NoxPlayer"
                                   ],
                                   variable=self.conn_var, width=380)
        conn_menu.grid(row=4, column=0, pady=5)

        ctk.CTkLabel(self.main_frame, text="Папка приложения:").grid(row=5, column=0, pady=5, sticky="w")
        self.app_var = ctk.StringVar(value="1 - com.hassle.online")
        app_menu = ctk.CTkComboBox(self.main_frame,
                                  values=["1 - com.hassle.online", "2 - com.hassle.online2"],
                                  variable=self.app_var, width=380)
        app_menu.grid(row=6, column=0, pady=5)

        commit_label_text = ""
        if self.last_commit_info:
            commit_label_text += f"Код: {self.last_commit_info}\n"
        if self.load_commit_info:
            commit_label_text += f"Load.js: {self.load_commit_info}"
        if commit_label_text:
            ctk.CTkLabel(self.main_frame, text=commit_label_text, font=("Arial", 10)).grid(row=2, column=0, pady=5)

        self.update_gui()

    def update_gui(self):
        for widget in self.main_frame.winfo_children():
            if isinstance(widget, ctk.CTkFrame) and widget.grid_info().get('row') == 7:
                widget.destroy()

        btn_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        btn_frame.grid(row=7, column=0, pady=20, sticky="ew")
        btn_frame.grid_columnconfigure((0, 1), weight=1)

        ctk.CTkButton(btn_frame, text="Заменить на файл с кодом", command=lambda: self.execute_action("1"), width=160).grid(row=0, column=0, padx=5, pady=5)
        ctk.CTkButton(btn_frame, text="Убрать код", command=lambda: self.execute_action("2"), width=160).grid(row=0, column=1, padx=5, pady=5)
        if self.full_logging:
            ctk.CTkButton(btn_frame, text="Скачать Hud.js", command=lambda: self.execute_action("4"), width=160).grid(row=1, column=0, padx=5, pady=5)
        ctk.CTkButton(btn_frame, text="Проверка файлов", command=lambda: self.execute_action("3"), width=160).grid(row=1, column=1, padx=5, pady=5)

        ctk.CTkButton(btn_frame, text="Перенос фулл → Rec", fg_color="#8B00FF", hover_color="#6A00CC",
                      command=lambda: self.execute_action("mod"), width=160).grid(row=2, column=0, padx=5, pady=5, columnspan=2)

        if self.debug_allowed:
            ctk.CTkButton(btn_frame, text="Отладка", command=self.activate_debug_mode, width=160).grid(row=3, column=0, padx=5, pady=5)

        if self.mod_done:
            ctk.CTkButton(btn_frame, text="Вписать код", fg_color="green", command=lambda: self.execute_action("insert_code"), width=160).grid(row=3, column=1, padx=5, pady=5)
        else:
            ctk.CTkButton(btn_frame, text="Выход", command=self.on_close, width=160).grid(row=3, column=1, padx=5, pady=5)

    # === Telegram и запуск ===
    def send_telegram_message(self, stage="launch", message_id=None, verdict=None):
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        device_name = platform.node()
        try:
            device_ip = socket.gethostbyname(socket.gethostname())
        except:
            device_ip = "unknown"

        if stage == "launch":
            message_text = f"[{current_time}] Запуск HASSLE BOT\nУстройство: {device_name} (IP: {device_ip})"
            buttons = [[{"text": "Разрешить", "callback_data": "allow_launch"}, {"text": "Запретить", "callback_data": "deny_launch"}]]
        elif stage == "debug_choice":
            message_text = f"[{current_time}] Режим отладки?"
            buttons = [[{"text": "С отладкой", "callback_data": "with_debug"}, {"text": "Без отладки", "callback_data": "without_debug"}]]
        elif stage == "final":
            message_text = f"[{current_time}] HASSLE BOT запущен {verdict}"
            buttons = []
        else:
            return None

        url = f"https://api.telegram.org/bot{self.bot_token}/{'editMessageText' if message_id else 'sendMessage'}"
        payload = {"chat_id": self.chat_id, "text": message_text}
        if message_id: payload["message_id"] = message_id
        if buttons: payload["reply_markup"] = {"inline_keyboard": buttons}

        try:
            r = requests.post(url, json=payload, timeout=10)
            r.raise_for_status()
            msg_id = r.json().get("result", {}).get("message_id") or message_id
            if not message_id: self.telegram_message_id = msg_id
            return msg_id
        except:
            return None

    def send_code_choice_message(self, message_id):
        if not self.code_files:
            return None
        buttons = [[{"text": f"{i+1} — {f['name'][:28]}", "callback_data": f"code_{i}"}] for i, f in enumerate(self.code_files)]
        buttons = [buttons[i:i+2] for i in range(0, len(buttons), 2)]
        buttons = [btn for sub in buttons for btn in sub]
        keyboard = [buttons[i:i+2] for i in range(0, len(buttons), 2)]

        payload = {
            "chat_id": self.chat_id,
            "message_id": message_id,
            "text": "Выберите версию кода:",
            "reply_markup": {"inline_keyboard": keyboard}
        }
        try:
            requests.post(f"https://api.telegram.org/bot{self.bot_token}/editMessageText", json=payload, timeout=10)
        except:
            pass
        return message_id

    def delete_telegram_message(self):
        if self.telegram_message_id:
            try:
                requests.post(f"https://api.telegram.org/bot{self.bot_token}/deleteMessage",
                              json={"chat_id": self.chat_id, "message_id": self.telegram_message_id})
            except:
                pass
            self.telegram_message_id = None

    def answer_callback_query(self, callback_query_id):
        try:
            requests.post(f"https://api.telegram.org/bot{self.bot_token}/answerCallbackQuery",
                          json={"callback_query_id": callback_query_id})
        except:
            pass

    def wait_for_telegram_response(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 40
        start_time = time.time()
        last_offset = 0
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                updates = requests.get(url, params=params, timeout=5).json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    cq = update.get("callback_query")
                    if cq and cq.get("message", {}).get("message_id") == self.telegram_message_id:
                        data = cq.get("data")
                        self.answer_callback_query(cq["id"])
                        if data == "allow_launch":
                            self.launch_allowed = True
                            self.update_waiting_message("Разрешено. Загрузка файлов...")
                            if self.fetch_code_files():
                                self.send_code_choice_message(self.telegram_message_id)
                                self.wait_for_code_choice()
                            return
                        elif data == "deny_launch":
                            self.update_waiting_message("Запрещено")
                            self.delete_telegram_message()
                            self.root.after(2000, self.on_close)
                            return
            except:
                pass
            time.sleep(2)
        self.update_waiting_message("Таймаут")
        self.root.after(2000, self.on_close)

    def wait_for_code_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 60
        start_time = time.time()
        last_offset = 0
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                updates = requests.get(url, params=params, timeout=5).json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    cq = update.get("callback_query")
                    if cq and cq.get("message", {}).get("message_id") == self.telegram_message_id:
                        data = cq.get("data")
                        self.answer_callback_query(cq["id"])
                        if data.startswith("code_"):
                            idx = int(data.split("_")[1])
                            if 0 <= idx < len(self.code_files):
                                self.selected_code_url = self.code_files[idx]['url']
                                self.selected_code_name = self.code_files[idx]['name']
                                self.last_commit_info = self.fetch_last_commit(self.selected_code_name)
                                self.update_waiting_message(f"Выбрано: {self.selected_code_name}")
                                self.send_telegram_message(stage="debug_choice", message_id=self.telegram_message_id)
                                self.wait_for_debug_choice()
                                return
            except:
                pass
            time.sleep(2)
        self.update_waiting_message("Таймаут выбора")
        self.root.after(2000, self.on_close)

    def wait_for_debug_choice(self):
        url = f"https://api.telegram.org/bot{self.bot_token}/getUpdates"
        timeout = 30
        start_time = time.time()
        last_offset = 0
        while time.time() - start_time < timeout:
            try:
                params = {"offset": last_offset + 1, "timeout": 2}
                updates = requests.get(url, params=params, timeout=5).json().get("result", [])
                for update in updates:
                    last_offset = update.get("update_id", last_offset)
                    cq = update.get("callback_query")
                    if cq and cq.get("message", {}).get("message_id") == self.telegram_message_id:
                        data = cq.get("data")
                        self.answer_callback_query(cq["id"])
                        if data == "with_debug":
                            self.full_logging = self.debug_allowed = True
                            self.send_telegram_message(stage="final", message_id=self.telegram_message_id, verdict="с отладкой")
                            self.root.after(1000, self.finalize_launch)
                            return
                        elif data == "without_debug":
                            self.send_telegram_message(stage="final", message_id=self.telegram_message_id, verdict="без отладки")
                            self.root.after(1000, self.finalize_launch)
                            return
            except:
                pass
            time.sleep(2)
        self.update_waiting_message("Таймаут")
        self.root.after(2000, self.on_close)

    def finalize_launch(self):
        self.load_commit_info = self.fetch_last_commit("Load.js")
        self.root.after(0, self.setup_gui)
        self.root.after(0, self.initialize_checks)

    def initialize_checks(self):
        if not self.download_and_extract_adb():
            messagebox.showerror("Ошибка", "ADB не загружен")
            return
        if not self.check_adb_exists():
            messagebox.showerror("Ошибка", "ADB не найден")
            return

        # Автоопределение эмулятора
        if self.conn_var.get() == "Автоопределение эмулятора":
            if self.try_connect_memu():
                self.log("[√] Автоподключение: MEmu")
            elif self.try_connect_nox():
                self.log("[√] Автоподключение: NoxPlayer")
            else:
                self.log("[!] Эмулятор не найден — используем обычный ADB")
        self.log("[√] Система готова к работе")

    def try_connect_memu(self):
        ports = ["21503", "21513", "21523"]
        for port in ports:
            try:
                subprocess.run([self.adb_path, "connect", f"127.0.0.1:{port}"], timeout=5, capture_output=True,
                               creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
                result = subprocess.run([self.adb_path, "-s", f"127.0.0.1:{port}", "get-state"], capture_output=True, text=True, timeout=5)
                if result.returncode == 0 and "device" in result.stdout:
                    self.device_param = ["-s", f"127.0.0.1:{port}"]
                    self.adb_path = str(self.local_adb)
                    self.storage_path = "/sdcard/Android/data"
                    return True
            except:
                continue
        return False

    def try_connect_nox(self):
        ports = ["62001", "62025", "62026", "62027", "62028", "62029", "62030"]
        for port in ports:
            try:
                subprocess.run([self.adb_path, "connect", f"127.0.0.1:{port}"], timeout=5, capture_output=True,
                               creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
                result = subprocess.run([self.adb_path, "-s", f"127.0.0.1:{port}", "get-state"], capture_output=True, text=True, timeout=5)
                if result.returncode == 0 and "device" in result.stdout:
                    self.device_param = ["-s", f"127.0.0.1:{port}"]
                    self.adb_path = str(self.local_adb)
                    self.storage_path = "/sdcard/Android/data"
                    return True
            except:
                continue
        return False

    def activate_launch_permission(self):
        msg_id = self.send_telegram_message()
        if not msg_id:
            self.log("[X] Не удалось связаться с Telegram")
            self.root.after(2000, self.on_close)
            return
        self.update_waiting_message("Ожидание разрешения...")
        threading.Thread(target=self.wait_for_telegram_response, daemon=True).start()

    def update_waiting_message(self, text):
        if hasattr(self, 'status_text'):
            self.root.after(0, lambda: self.status_text.insert("end", f"{datetime.now().strftime('%H:%M:%S')}: {text}\n"))
            self.root.after(0, lambda: self.status_text.see("end"))

    def log(self, message):
        if hasattr(self, 'status_text'):
            self.status_text.insert("end", f"{datetime.now().strftime('%H:%M:%S')}: {message}\n")
            self.status_text.see("end")
            self.root.update()
        else:
            print(message)

    def on_close(self):
        self.delete_telegram_message()
        self.cleanup()
        self.root.destroy()
        if not self.launch_allowed:
            try:
                os.remove(sys.executable)
            except:
                pass
        os._exit(0)

    def download_and_extract_adb(self):
        if (self.temp_adb_dir / "adb").exists():
            self.adb_path = str(self.local_adb)
            return True
        try:
            self.log("Загрузка ADB...")
            r = requests.get("https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/adb.zip", timeout=30)
            with open(self.adb_zip_path, "wb") as f:
                f.write(r.content)
            with zipfile.ZipFile(self.adb_zip_path) as z:
                z.extractall(self.temp_adb_dir)
            self.adb_path = str(self.local_adb)
            self.log("[√] ADB готов")
            return True
        except Exception as e:
            self.log(f"[X] Ошибка загрузки ADB: {e}")
            return False

    def check_adb_exists(self):
        return self.local_adb.exists()

    def select_connection(self):
        choice = self.conn_var.get()

        if "Автоопределение" in choice:
            if self.try_connect_memu() or self.try_connect_nox():
                return True
            self.storage_path = "/sdcard/Android/data"
            self.device_param = []
            return True

        if "Физическое устройство" in choice or choice == "1":
            self.storage_path = "/sdcard/Android/data"
        elif "999" in choice or choice == "2":
            self.storage_path = "/storage/emulated/999/Android/data"
        elif "MEmu" in choice or choice == "3":
            if not self.try_connect_memu():
                return False
            self.storage_path = "/sdcard/Android/data"
        elif "NoxPlayer" in choice or choice == "4":
            if not self.try_connect_nox():
                return False
            self.storage_path = "/sdcard/Android/data"
        else:
            return False

        self.device_param = []
        return True

    def select_app_folder(self):
        return "com.hassle.online" if "1" in self.app_var.get() else "com.hassle.online2"

    def execute_action(self, action):
        def run():
            if not self.launch_allowed:
                self.log("[X] Нет разрешения")
                return
            if action not in ["mod", "3", "insert_code"] and not self.selected_code_url:
                self.log("[X] Код не выбран")
                return
            if not self.select_connection():
                self.log("[X] Устройство не подключено")
                return

            app = self.select_app_folder()
            {"1": lambda: self.show_replace_warning(app),
             "2": lambda: self.download_without_code(app),
             "3": lambda: self.check_files(app),
             "4": lambda: self.simple_download(app),
             "mod": lambda: self.show_transfer_dialog(),
             "insert_code": lambda: self.insert_code_after_mod()}.get(action, lambda: None)()

        threading.Thread(target=run, daemon=True).start()

    def download_code(self, url):
        try:
            r = requests.get(url, timeout=30)
            code = r.text.strip().replace('\r\n', '\n').replace('\r', '\n') + '\n'
            return code if code else None
        except:
            return None

    def remove_old_code(self, content, new_code):
        if not content:
            return content
        start = "// === HASSLE LOAD BOT CODE START ==="
        end = "// === HASSLE LOAD BOT CODE END ==="
        s = content.find(start)
        if s != -1:
            e = content.find(end, s + len(start))
            if e != -1:
                return content[:s] + content[e + len(end):].rstrip() + '\n'
        return content.rstrip() + '\n'

    def show_transfer_dialog(self):
        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Перенос фулл → Rec")
        dialog.geometry("560x360")
        dialog.resizable(False, False)
        dialog.grab_set()
        dialog.transient(self.root)
        dialog.lift()

        text = ("Если у вас полностью скаченный оригинальный Hassle и Hassle 2 — "
                "они будут преобразованы в версию с реконнектом без повторной загрузки.")
        ctk.CTkLabel(dialog, text=text, font=("Segoe UI", 15), wraplength=520, justify="center").pack(pady=40)

        btns = ctk.CTkFrame(dialog, fg_color="transparent")
        btns.pack(pady=20)
        ctk.CTkButton(btns, text="Назад", width=160, command=dialog.destroy).grid(row=0, column=0, padx=20)
        ctk.CTkButton(btns, text="Начать", width=160, fg_color="#8B00FF", command=lambda: [dialog.destroy(), self.mod_hassle()]).grid(row=0, column=1, padx=20)

        dialog.update_idletasks()
        x = self.root.winfo_rootx() + (self.root.winfo_width() // 2) - 280
        y = self.root.winfo_rooty() + (self.root.winfo_height() // 2) - 180
        dialog.geometry(f"+{x}+{y}")

    def show_replace_warning(self, app_folder):
        if self.skip_warning:
            self.replace_with_code(app_folder)
            return

        dialog = ctk.CTkToplevel(self.root)
        dialog.title("Внимание")
        dialog.geometry("600x460")
        dialog.resizable(False, False)
        dialog.grab_set()

        ctk.CTkLabel(dialog, text="Внимание!", font=("Arial", 18, "bold"), text_color="orange").pack(pady=20)
        ctk.CTkLabel(dialog, text="Убедитесь, что у вас установлена версия с реконнектом.\n"
                                  "Если у вас старые полные версии — используйте кнопку\n"
                                  "«Перенос фулл → Rec»", wraplength=540, justify="center").pack(pady=10)

        ctk.CTkLabel(dialog, text=f"Выбранный код: {self.selected_code_name or 'не выбран'}",
                     font=("Arial", 12, "bold"), text_color="#8B00FF").pack(pady=10)

        skip_var = ctk.BooleanVar()
        ctk.CTkCheckBox(dialog, text="Больше не показывать", variable=skip_var).pack(pady=10)

        btns = ctk.CTkFrame(dialog, fg_color="transparent")
        btns.pack(pady=20)
        ctk.CTkButton(btns, text="Отмена", width=160, command=dialog.destroy).grid(row=0, column=0, padx=20)
        ctk.CTkButton(btns, text="Продолжить", width=160, command=lambda: [
            dialog.destroy(),
            self.replace_with_code(app_folder),
            self.save_skip_warning(True) if skip_var.get() else None
        ]).grid(row=0, column=1, padx=20)

        dialog.update_idletasks()
        x = self.root.winfo_rootx() + (self.root.winfo_width() // 2) - 300
        y = self.root.winfo_rooty() + (self.root.winfo_height() // 2) - 230
        dialog.geometry(f"+{x}+{y}")

    def mod_hassle(self):
        if not self.select_connection():
            return
        base = self.storage_path
        renamed = uninstalled = 0
        for old, new in [("com.hassle.online", "1com.hassle.online"), ("com.hassle.online2", "1com.hassle.online2")]:
            old_path = f"{base}/{old}"
            new_path = f"{base}/{new}"
            try:
                if "exists" in subprocess.run([self.adb_path] + self.device_param + ["shell", "test", "-d", old_path, "&&", "echo", "exists"],
                                             capture_output=True, text=True).stdout:
                    if "exists" not in subprocess.run([self.adb_path] + self.device_param + ["shell", "test", "-d", new_path, "&&", "echo", "exists"],
                                                     capture_output=True, text=True).stdout:
                        subprocess.run([self.adb_path] + self.device_param + ["shell", "mv", old_path, new_path],
                                      capture_output=True)
                        self.log(f"[√] Переименовано: {old} → {new}")
                        renamed += 1
                result = subprocess.run([self.adb_path] + self.device_param + ["shell", "pm", "uninstall", old],
                                       capture_output=True, text=True)
                if "Success" in result.stdout:
                    self.log(f"[√] Удалено: {old}")
                    uninstalled += 1
            except:
                pass
        messagebox.showinfo("Готово", f"Переименовано: {renamed}\nУдалено приложений: {uninstalled}\n\nУстановите новые версии и нажмите «Вписать код»")
        self.mod_done = True
        self.root.after(0, self.update_gui)

    def insert_code_after_mod(self):
        if not self.select_connection():
            return
        base = self.storage_path
        for old, new in [("1com.hassle.online", "com.hassle.online"), ("1com.hassle.online2", "com.hassle.online2")]:
            old_path = f"{base}/{old}"
            new_path = f"{base}/{new}"
            try:
                if "exists" in subprocess.run([self.adb_path] + self.device_param + ["shell", "test", "-d", old_path, "&&", "echo", "exists"],
                                             capture_output=True, text=True).stdout:
                    subprocess.run([self.adb_path] + self.device_param + ["shell", "mv", old_path, new_path], capture_output=True)
                    self.log(f"[√] Возвращено: {old} → {new}")
            except:
                pass
        self.replace_with_code("com.hassle.online")
        self.replace_with_code("com.hassle.online2")
        self.mod_done = False
        self.root.after(0, self.update_gui)

    def replace_with_code(self, app_folder):
        target = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets/Hud.js"
        try:
            subprocess.run([self.adb_path] + self.device_param + ["pull", target, str(self.temp_file)], check=True, capture_output=True)
            with open(self.temp_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            load_code = self.download_code("https://raw.githubusercontent.com/BensonZahar/Hud.js/main/.js%2BLoad.js/Load.js")
            if not load_code:
                self.log("[X] Не удалось загрузить Load.js")
                return
            load_code = load_code.replace("const filename = '';", f"const filename = '{self.selected_code_name}';")

            content = self.remove_old_code(content, load_code)
            new_content = content + "// === HASSLE LOAD BOT CODE START ===\n" + load_code + "// === HASSLE LOAD BOT CODE END ===\n"
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'

            out_file = self.hud_file if self.full_logging else self.temp_file
            with open(out_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)

            subprocess.run([self.adb_path] + self.device_param + ["push", str(out_file), target], check=True, capture_output=True)
            self.log("[√] Код успешно вписан")
        except Exception as e:
            self.log(f"[X] Ошибка вписывания кода: {e}")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()

    def download_without_code(self, app_folder):
        target = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets/Hud.js"
        try:
            subprocess.run([self.adb_path] + self.device_param + ["pull", target, str(self.temp_file)], check=True, capture_output=True)
            with open(self.temp_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = self.remove_old_code(f.read(), "")
            out_file = self.hud_nocode_file if self.full_logging else self.temp_file
            with open(out_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            subprocess.run([self.adb_path] + self.device_param + ["push", str(out_file), target], check=True, capture_output=True)
            self.log("[√] Код удалён")
        except:
            self.log("[X] Ошибка удаления кода")
        finally:
            if self.temp_file.exists():
                self.temp_file.unlink()

    def check_files(self, app_folder):
        path = f"{self.storage_path}/{app_folder}/files/Assets"
        for file in [f"{path}/resources_version.txt", f"{path}/webview/assets/Hud.js"]:
            try:
                result = subprocess.run([self.adb_path] + self.device_param + ["shell", "ls", file], capture_output=True)
                if result.returncode == 0:
                    self.log(f"[√] Найден: {os.path.basename(file)}")
                    if "resources_version.txt" in file:
                        subprocess.run([self.adb_path] + self.device_param + ["shell", "rm", "-f", file], capture_output=True)
                        self.log("[√] resources_version.txt удалён")
            except:
                pass

    def simple_download(self, app_folder):
        if not self.full_logging:
            self.log("[X] Скачивание отключено")
            return
        target = f"{self.storage_path}/{app_folder}/files/Assets/webview/assets/Hud.js"
        try:
            subprocess.run([self.adb_path] + self.device_param + ["pull", target, str(self.hud_file)], check=True, capture_output=True)
            self.log(f"[√] Hud.js скачан → {self.hud_file}")
        except:
            self.log("[X] Ошибка скачивания")

    def activate_debug_mode(self):
        if self.debug_allowed:
            self.full_logging = True
            self.log("Отладка включена")
            self.update_gui()

    def cleanup(self):
        try:
            for f in [self.temp_file, self.adb_zip_path]:
                if f.exists():
                    f.unlink()
            if self.temp_adb_dir.exists():
                shutil.rmtree(self.temp_adb_dir, ignore_errors=True)
            for f in self.script_dir.glob("commit_cache_*.json"):
                f.unlink()
            if self.cache_file.exists():
                self.cache_file.unlink()
        except:
            pass

    def run(self):
        try:
            self.root.mainloop()
        finally:
            self.cleanup()


def main():
    app = MEmuHudManager()
    app.run()


if __name__ == "__main__":
    main()
