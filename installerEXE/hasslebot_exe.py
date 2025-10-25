"""
pyinstaller --noconfirm --onefile --windowed --icon=icon.ico --add-data "icon.ico;." hassle_bot.py
"""
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
        
        self.memu_path = None
        self.memu_adb = None
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
        
        # GUI Components
        self.root = ctk.CTk()
        self.root.title("HASSLE BOT by konst")
        self.root.geometry("700x600")
        try:
            icon_path = resource_path("icon.ico")
            if os.path.exists(icon_path):
                self.root.iconbitmap(icon_path)
            else:
                print(f"[X] Файл иконки {icon_path} не найден")
        except Exception as e:
            print(f"[X] Ошибка установки иконки: {e}")
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)
        
        # Инициализация минимального GUI
        self.root.grid_columnconfigure(0, weight=1)
        self.root.grid_rowconfigure(0, weight=1)
        self.main_frame = ctk.CTkScrollableFrame(self.root, corner_radius=10)
        self.main_frame.grid(padx=20, pady=20, sticky="nsew")
        self.main_frame.grid_columnconfigure(0, weight=1)
        
        ctk.CTkLabel(self.main_frame, text="HASSLE BOT by konst", font=("Arial", 20, "bold")).grid(row=0, column=0, pady=10)
        
        self.status_text = ctk.CTkTextbox(self.main_frame, height=300, width=600, corner_radius=10)
        self.status_text.grid(row=1, column=0, pady=10, sticky="ew")
        
        self.activate_launch_permission()

    def fetch_code_files(self):
        """Загрузка списка .js файлов из репозитория GitHub с кэшированием"""
        current_time = time.time()
        if current_time - self.cache_time < 3600 and self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.code_files = json.load(f)
                if not self.full_logging:
                    self.log("[√] Успешно: Файлы загружены")
                else:
                    self.log(f"[√] Найдено {len(self.code_files)} файлов кода")
                return True
            except Exception:
                pass
        
        try:
            if not self.full_logging:
                self.log("Загрузка файлов...")
            else:
                self.log("Загрузка списка файлов из репозитория...")
            response = requests.get(self.github_repo, timeout=10)
            response.raise_for_status()
            files = response.json()
            
            self.code_files = []
            for file in files:
                if file['name'].endswith('.js') and file['name'] != 'Hud.js' and file['name'] != 'Load.js':
                    self.code_files.append({
                        'name': file['name'],
                        'url': file['download_url'],
                        'html_url': file['html_url']
                    })
            
            if not self.code_files:
                self.log("[X] Ошибка: Файлы не найдены")
                return False
            
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.code_files, f)
            self.cache_time = current_time
            if not self.full_logging:
                self.log("[√] Успешно: Файлы загружены")
            else:
                self.log(f"[√] Найдено {len(self.code_files)} файлов кода")
            return True
            
        except Exception as e:
            self.log(f"[X] Ошибка: Не удалось загрузить файлы")
            return False

    def fetch_last_commit(self, file_name):
        """Загрузка информации о последнем коммите для файла"""
        commit_cache_file = self.script_dir / f"commit_cache_{file_name}.json"
        current_time = time.time()
        if current_time - self.cache_time < 3600 and commit_cache_file.exists():
            try:
                with open(commit_cache_file, 'r', encoding='utf-8') as f:
                    last_commit = json.load(f)
                self.last_commit_info = self.format_commit_info(last_commit)
                return True
            except Exception:
                pass
        
        try:
            commits_url = f"https://api.github.com/repos/BensonZahar/Hud.js/commits?path=.js%2BLoad.js/{file_name}"
            response = requests.get(commits_url, timeout=10)
            response.raise_for_status()
            commits = response.json()
            
            if not commits:
                self.last_commit_info = "Нет информации о коммите"
                return False
            
            last_commit = commits[0]['commit']
            with open(commit_cache_file, 'w', encoding='utf-8') as f:
                json.dump(last_commit, f)
            self.cache_time = current_time
            self.last_commit_info = self.format_commit_info(last_commit)
            return True
            
        except Exception as e:
            self.last_commit_info = "Ошибка загрузки коммита"
            return False

    def format_commit_info(self, commit):
        """Форматирование информации о коммите"""
        date_str = commit['author']['date']
        dt = datetime.fromisoformat(date_str.rstrip('Z'))
        formatted_date = dt.strftime("%Y-%m-%d %H:%M:%S")
        message = commit['message']
        return f"{formatted_date}: {message}"

    def setup_gui(self):
        """Настройка GUI без выбора версии кода"""
        for widget in self.main_frame.winfo_children():
            if widget != self.status_text and widget.grid_info().get('row') != 0:
                widget.destroy()
        
        ctk.CTkLabel(self.main_frame, text="Тип подключения:").grid(row=3, column=0, pady=5)
        self.conn_var = ctk.StringVar(value="1 - Физическое устройство")
        conn_menu = ctk.CTkComboBox(self.main_frame, 
                                   values=["1 - Физическое устройство", "2 - Клонированное хранилище (999)", "3 - Эмулятор MEmu"],
                                   variable=self.conn_var, width=300)
        conn_menu.grid(row=4, column=0, pady=5)
        
        ctk.CTkLabel(self.main_frame, text="Папка приложения:").grid(row=5, column=0, pady=5)
        self.app_var = ctk.StringVar(value="1 - com.hassle.online")
        app_menu = ctk.CTkComboBox(self.main_frame, 
                                  values=["1 - com.hassle.online", "2 - com.hassle.onlinf"],
                                  variable=self.app_var, width=300)
        app_menu.grid(row=6, column=0, pady=5)
        
        ctk.CTkLabel(self.main_frame, text=self.last_commit_info or "Нет информации о коммите").grid(row=2, column=0, pady=5)
        
        self.update_gui()

    def update_gui(self):
        """Обновление интерфейса для отображения/скрытия кнопки Скачать Hud.js"""
        for widget in self.main_frame.winfo_children():
            if isinstance(widget, ctk.CTkFrame) and widget.grid_info().get('row') == 7:
                widget.destroy()
        
        btn_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        btn_frame.grid(row=7, column=0, pady=20, sticky="ew")
        btn_frame.grid_columnconfigure((0, 1), weight=1)
        
        ctk.CTkButton(btn_frame, text="Заменить на файл с кодом", command=lambda: self.execute_action("1"), width=140).grid(row=0, column=0, padx=5, pady=5)
        ctk.CTkButton(btn_frame, text="Убрать код - Заменить на файл без кода", command=lambda: self.execute_action("2"), width=140).grid(row=0, column=1, padx=5, pady=5)
        if self.full_logging:
            ctk.CTkButton(btn_frame, text="Скачать Hud.js", command=lambda: self.execute_action("4"), width=140).grid(row=1, column=0, padx=5, pady=5)
        ctk.CTkButton(btn_frame, text="Проверка файлов", command=lambda: self.execute_action("3"), width=140).grid(row=1, column=1, padx=5, pady=5)
        if self.debug_allowed:
            ctk.CTkButton(btn_frame, text="Активировать отладку", command=self.activate_debug_mode, width=140).grid(row=2, column=0, padx=5, pady=5)
        ctk.CTkButton(btn_frame, text="Выход", command=self.on_close, width=140).grid(row=2, column=1, padx=5, pady=5)

    def send_telegram_message(self, stage="launch", message_id=None, verdict=None):
        """Отправка или обновление сообщения в Telegram с inline-кнопками"""
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
            message_text = f"[{current_time}] Выберите режим для HASSLE BOT by konst с устройства {device_name} (IP: {device_ip}) 🎮🔧"
            buttons = [
                {"text": "С отладкой 🛠️", "callback_data": "with_debug"},
                {"text": "Без отладки 🚫", "callback_data": "without_debug"}
            ]
        elif stage == "final":
            message_text = f"[{current_time}] HASSLE BOT by konst с устройства {device_name} (IP: {device_ip}) запущен {verdict} 🎮🔧"
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
        """Отправка сообщения с выбором версии кода в Telegram"""
        if not self.code_files:
            self.log("[X] Ошибка: Файлы кода не загружены")
            return None

        message_text = "Выберите версию кода для HASSLE BOT:"
        buttons = [{"text": f"{i+1} - {f['name'][:30]}...", "callback_data": f"code_{i}"} for i, f in enumerate(self.code_files)]
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
            self.log("[√] Сообщение с выбором кода отправлено в Telegram")
            return message_id
        except Exception as e:
            self.log(f"[X] Ошибка: Не удалось отправить сообщение с выбором кода")
            return None

    def delete_telegram_message(self):
        """Удаление сообщения в Telegram"""
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
        """Обновление сообщения ожидания в основном окне"""
        if self.waiting_message_id:
            self.root.after(0, lambda: self.status_text.delete(self.waiting_message_id, "end"))
        self.root.after(0, lambda: self.log(text))
        self.waiting_message_id = self.status_text.index("end-1c")

    def answer_callback_query(self, callback_query_id):
        """Подтверждение callback_query в Telegram"""
        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/answerCallbackQuery"
            payload = {"callback_query_id": callback_query_id}
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            self.log("[√] Callback подтвержден")
        except Exception as e:
            self.log(f"[X] Ошибка подтверждения callback: {e}")

    def wait_for_telegram_response(self):
        """Ожидание ответа на inline-кнопки из Telegram"""
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
                        self.answer_callback_query(callback_query["id"])  # Подтверждение
                        if callback_data == "allow_launch":
                            self.launch_allowed = True
                            self.root.after(0, lambda: self.update_waiting_message("Разрешение на запуск получено. Загрузка файлов кода..."))
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
        """Ожидание выбора версии кода из Telegram"""
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
                        self.answer_callback_query(callback_query["id"])  # Подтверждение
                        if callback_data.startswith("code_"):
                            try:
                                index = int(callback_data.split("_")[1])
                                if 0 <= index < len(self.code_files):
                                    self.selected_code_url = self.code_files[index]['url']
                                    self.selected_code_name = self.code_files[index]['name']
                                    if not self.full_logging:
                                        self.root.after(0, lambda: self.update_waiting_message("Файл выбран. Ожидание выбора режима отладки..."))
                                    else:
                                        self.root.after(0, lambda: self.update_waiting_message(f"Выбран файл: {self.selected_code_name}. Ожидание выбора режима отладки..."))
                                    self.fetch_last_commit(self.selected_code_name)
                                    self.send_telegram_message(stage="debug_choice", message_id=self.telegram_message_id)
                                    self.root.after(0, self.wait_for_debug_choice)
                                    return
                                else:
                                    self.log("[X] Ошибка: Неверный выбор файла")
                            except ValueError:
                                self.log("[X] Ошибка: Ошибка обработки выбора файла")
            except Exception as e:
                self.root.after(0, lambda: self.log(f"[X] Ошибка: Не удалось получить ответ от Telegram"))
            time.sleep(2)

        self.root.after(0, lambda: self.update_waiting_message("Таймаут выбора файла. Запрещено 🚫"))
        self.root.after(0, self.delete_telegram_message)
        self.root.after(2000, self.on_close)

    def wait_for_debug_choice(self):
        """Ожидание выбора режима отладки из Telegram"""
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
                        self.answer_callback_query(callback_query["id"])  # Подтверждение
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
        """Завершение запуска: инициализация GUI и проверок"""
        self.root.after(0, self.setup_gui)
        self.root.after(0, self.initialize_checks)

    def initialize_checks(self):
        """Выполнение проверок после разрешения запуска"""
        memu_found = self.check_memu_installation()
        if memu_found:
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

    def activate_launch_permission(self):
        """Запуск проверки разрешения на запуск через Telegram"""
        message_id = self.send_telegram_message()
        if not message_id:
            self.log("[X] Ошибка: Не удалось отправить сообщение в Telegram")
            self.root.after(2000, self.on_close)
            return
        self.update_waiting_message("Ожидание разрешения на запуск...")
        threading.Thread(target=self.wait_for_telegram_response, daemon=True).start()

    def activate_debug_mode(self):
        """Активация режима отладки"""
        if self.debug_allowed:
            self.full_logging = True
            self.log("Режим отладки активирован")
            self.update_gui()
        else:
            self.log("[X] Ошибка: Отладка не разрешена")

    def log(self, message):
        """Логирование сообщения в текстовое поле или консоль"""
        if hasattr(self, 'status_text'):
            self.status_text.insert("end", f"{datetime.now().strftime('%H:%M:%S')}: {message}\n")
            self.status_text.see("end")
            self.root.update()
        else:
            print(f"{datetime.now().strftime('%H:%M:%S')}: {message}")

    def on_close(self):
        """Обработка закрытия окна"""
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
        """Проверка наличия эмулятора MEmu с кэшированием пути"""
        cache_file = self.script_dir / "memu_path_cache.json"
        
        # Проверяем кэш
        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
                    memu_exe = Path(cache.get('memu_path', ''))
                    if memu_exe.exists():
                        self.memu_path = str(memu_exe)
                        self.memu_adb = str(memu_exe.parent / "adb.exe")
                        if not self.full_logging:
                            self.log(f"[√] Успешно: Эмулятор найден в кэше: {self.memu_path}")
                        else:
                            self.log(f"[√] Выполнено: Эмулятор найден в кэше: {self.memu_path}")
                        return True
            except Exception as e:
                if self.full_logging:
                    self.log(f"[!] Предупреждение: Ошибка чтения кэша: {e}")

        if not self.full_logging:
            self.log("Поиск эмулятора MEmu...")
        else:
            self.log("Поиск папки Microvirt на всех дисках...")

        import string
        drives = [f"{d}:\\" for d in string.ascii_uppercase if Path(f"{d}:\\").exists()]
        
        for drive in drives:
            try:
                for memu_dir in Path(drive).rglob("Microvirt"):
                    memu_exe = memu_dir / "MEmu.exe"
                    if memu_exe.exists():
                        self.memu_path = str(memu_exe)
                        self.memu_adb = str(memu_dir / "adb.exe")
                        # Сохраняем в кэш
                        with open(cache_file, 'w', encoding='utf-8') as f:
                            json.dump({'memu_path': self.memu_path}, f)
                        if not self.full_logging:
                            self.log(f"[√] Успешно: Эмулятор найден в {self.memu_path}")
                        else:
                            self.log(f"[√] Выполнено: Эмулятор найден в {self.memu_path}")
                        return True
            except (PermissionError, OSError) as e:
                if self.full_logging:
                    self.log(f"[!] Предупреждение: Не удалось проверить диск {drive}: {e}")
                continue

        self.log("[X] Ошибка: Эмулятор MEmu не найден")
        return False
    
    def download_and_extract_adb(self):
        """Скачивание и распаковка ADB во временную папку"""
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
        """Проверка наличия adb.exe"""
        if not self.local_adb.exists():
            self.log("[X] Ошибка: ADB не найден")
            return False
        return True
    
    def download_code(self, url):
        """Скачивание кода с GitHub + базовая нормализация"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            code = response.text.strip()
            
            if not code:
                self.log("[X] Ошибка: Код пуст")
                return None
            
            # Нормализация line endings и удаление лишних пустых строк в конце/начале
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
        """Удаление старого кода по маркерам (если есть)"""
        if not content:
            return content
        
        START_MARKER = "// === HASSLE LOAD BOT CODE START ==="
        END_MARKER = "// === HASSLE LOAD BOT CODE END ==="
        
        # Ищем первое вхождение START и следующее END после него
        start_idx = content.find(START_MARKER)
        if start_idx != -1:
            end_idx = content.find(END_MARKER, start_idx + len(START_MARKER))
            if end_idx != -1:
                # Удаляем от начала START до конца END включительно
                removed_content = content[:start_idx] + content[end_idx + len(END_MARKER):]
                if self.full_logging:
                    self.log("[√] Выполнено: Удалён старый код по маркерам")
                # Нормализуем конец: удаляем лишние пустые строки после удаления
                return removed_content.rstrip() + '\n'
        
        # Если маркеров нет — ничего не удаляем
        if self.full_logging:
            self.log("[!] Предупреждение: Маркеры не найдены, вставка в конец без удаления")
        return content.rstrip() + '\n'
    
    def select_connection(self):
        """Получение выбранного типа подключения из GUI"""
        if not self.local_adb.exists() and not self.memu_adb:
            self.log("[X] Ошибка: ADB не готов")
            return False
        
        conn_choice = self.conn_var.get().split()[0]
        if conn_choice == "1":
            if not self.local_adb.exists():
                self.log("[X] Ошибка: ADB не готов")
                return False
            self.adb_path = str(self.local_adb)
            self.storage_path = "/sdcard/Android/data"
            return self.check_physical_device()
        elif conn_choice == "2":
            if not self.local_adb.exists():
                self.log("[X] Ошибка: ADB не готов")
                return False
            self.adb_path = str(self.local_adb)
            self.storage_path = "/storage/emulated/999/Android/data"
            return self.check_physical_device()
        elif conn_choice == "3":
            if self.memu_adb and Path(self.memu_adb).exists():
                self.adb_path = self.memu_adb
            else:
                if not self.local_adb.exists():
                    self.log("[X] Ошибка: ADB не готов")
                    return False
                self.adb_path = str(self.local_adb)
            self.storage_path = "/sdcard/Android/data"
            return self.check_memu_device()
        return False
    
    def check_physical_device(self):
        """Проверка подключения физического устройства"""
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
        """Проверка подключения к MEmu"""
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
                        self.log("[√] Успешно: Подключено к эмулятору")
                    else:
                        self.log("[√] Выполнено: Подключено к эмулятору")
                    return True
                    
            except Exception:
                continue
        
        self.log("[X] Ошибка: Эмулятор не отвечает")
        return False
    
    def select_app_folder(self):
        """Получение выбранной папки приложения из GUI"""
        choice = self.app_var.get().split()[0]
        return "com.hassle.online" if choice == "1" else "com.hassle.onlinf"
    
    def execute_action(self, action):
        """Выполнение выбранного действия в отдельном потоке"""
        def run_action():
            if not self.launch_allowed:
                self.log("[X] Ошибка: Нет разрешения на запуск")
                return
            if not self.selected_code_url:
                self.log("[X] Ошибка: Файл кода не выбран")
                return
            if not self.select_connection():
                self.log("[X] Ошибка: Устройство не подключено")
                return
            
            app_folder = self.select_app_folder()
            if self.full_logging:
                self.log(f"Используется версия кода: {self.selected_code_name}")
            
            if action == "1":
                self.replace_with_code(app_folder)
            elif action == "2":
                self.download_without_code(app_folder)
            elif action == "3":
                self.check_files(app_folder)
            elif action == "4":
                self.simple_download(app_folder)
        
        threading.Thread(target=run_action, daemon=True).start()
    
    def replace_with_code(self, app_folder):
        """Замена файла с добавлением кода - логика с удалением по маркерам"""
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
            
            # Скачиваем шаблон load.js
            load_url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/.js%2BLoad.js/Load.js"
            load_code = self.download_code(load_url)
            if not load_code:
                return
            
            # Подставляем выбранный filename
            load_code = load_code.replace("const filename = '';", f"const filename = '{self.selected_code_name}';")
            
            # Удаляем старый код по маркерам
            if self.full_logging:
                self.log("Поиск и удаление старого кода по маркерам...")
            content = self.remove_old_code(content, load_code)
            
            # Добавляем маркеры и новый код в конец
            start_marker = "// === HASSLE LOAD BOT CODE START ===\n"
            end_marker = "// === HASSLE LOAD BOT CODE END ===\n"
            new_content = content + start_marker + load_code + end_marker
            
            # Нормализация всего файла
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
            
            target_file = self.hud_file if self.full_logging else self.temp_file
            with open(target_file, 'w', encoding='utf-8', newline='\n') as f:  # Явно LF
                f.write(new_content)
            
            if self.full_logging:
                self.log(f"Размер нового файла: {os.path.getsize(target_file)} байт")
                self.log(f"[√] Выполнено: Новый код добавлен с маркерами")
            
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
                    self.log(f"[√] Выполнено: Файл заменен с новым кодом")
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
        """Скачивание и замена файла без кода - улучшенная логика"""
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
            
            # Удаляем код используя новую функцию (по маркерам)
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
        """Проверка и удаление файлов"""
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
        """Простое скачивание файла"""
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
        """Очистка временных файлов"""
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
            # Удаляем кэш пути MEmu, если требуется очистка
            memu_cache = self.script_dir / "memu_path_cache.json"
            if memu_cache.exists() and self.full_logging:
                memu_cache.unlink()
        except Exception:
            pass
    
    def run(self):
        """Главный метод запуска"""
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
    """Точка входа"""
    manager = MEmuHudManager()
    manager.run()

if __name__ == "__main__":
    main()
