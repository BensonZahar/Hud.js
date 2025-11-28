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
        self.script_commit_info = ""
        self.mod_done = False
        self.skip_warning_file = self.script_dir / "skip_warning.json"
        self.skip_warning = self.load_skip_warning()
        self.mode = "hassle" # Новый флаг: "hassle" или "ahk_mvd"
        self.radmir_path = None # Путь к RADMIR CRMP для AHK MVD
        self.rank = ""
        self.first_name = ""
        self.last_name = ""
        self.callsign = ""  # Новый атрибут для позывного
        self.use_callsign = False  # Флаг для использования позывного
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
        for widget in self.main_frame.winfo_children():
            if widget != self.status_text and widget.grid_info().get('row') != 0:
                widget.destroy()
        if self.mode == "hassle":
            ctk.CTkLabel(self.main_frame, text="Тип подключения:").grid(row=3, column=0, pady=5)
            self.conn_var = ctk.StringVar(value="1 - Физическое устройство")
            self.conn_menu = ctk.CTkComboBox(self.main_frame,
                                       values=["1 - Физическое устройство", "2 - Клонированное хранилище (999)", "3 - Эмулятор MEmu", "4 - Эмулятор NOX"],
                                       variable=self.conn_var, width=300)
            self.conn_menu.grid(row=4, column=0, pady=5)
            self.conn_var.trace("w", self.detect_app_folders)
            ctk.CTkLabel(self.main_frame, text="Папка приложения:").grid(row=5, column=0, pady=5)
            self.app_var = ctk.StringVar(value="")
            self.app_menu = ctk.CTkComboBox(self.main_frame,
                                      values=[],
                                      variable=self.app_var, width=300)
            self.app_menu.grid(row=6, column=0, pady=5)
            commit_label_text = ""
            if self.last_commit_info:
                commit_label_text += f"Выбранный код: {self.last_commit_info}\n"
            if self.full_logging:
                if self.load_commit_info:
                    commit_label_text += f"Load.js: {self.load_commit_info}\n"
                if self.script_commit_info:
                    commit_label_text += f"hasslebot_exe.py: {self.script_commit_info}\n"
            if not commit_label_text:
                commit_label_text = "Нет информации о коммите"
            ctk.CTkLabel(self.main_frame, text=commit_label_text).grid(row=2, column=0, pady=5)
        else: # AHK MVD mode
            ctk.CTkLabel(self.main_frame, text="Режим: AHK MVD").grid(row=2, column=0, pady=5)
            if self.radmir_path:
                ctk.CTkLabel(self.main_frame, text=f"Папка RADMIR: {self.radmir_path}").grid(row=3, column=0, pady=5)
            ctk.CTkButton(self.main_frame, text="Выбрать папку RADMIR CRMP", command=self.select_radmir_folder).grid(row=4, column=0, pady=10)
        self.update_gui()
    def select_radmir_folder(self):
        path = filedialog.askdirectory(title="Выберите папку RADMIR CRMP")
        if path:
            self.radmir_path = Path(path)
            self.log(f"[√] Папка выбрана: {self.radmir_path}")
            self.setup_gui() # Обновляем GUI
    def detect_app_folders(self, *args):
        if self.select_connection():
            try:
                cmd = [self.adb_path] + self.device_param + ["shell", "ls", self.storage_path]
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
        for widget in self.main_frame.winfo_children():
            if isinstance(widget, ctk.CTkFrame) and widget.grid_info().get('row') == 7:
                widget.destroy()
        btn_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        btn_frame.grid(row=7, column=0, pady=20, sticky="ew")
        btn_frame.grid_columnconfigure((0, 1), weight=1)
        if self.mode == "hassle":
            ctk.CTkButton(btn_frame, text="Заменить на файл с кодом", command=lambda: self.execute_action("1"), width=140).grid(row=0, column=0, padx=5, pady=5)
            ctk.CTkButton(btn_frame, text="Убрать код - Заменить на файл без кода", command=lambda: self.execute_action("2"), width=140).grid(row=0, column=1, padx=5, pady=5)
            if self.full_logging:
                ctk.CTkButton(btn_frame, text="Скачать Hud.js", command=lambda: self.execute_action("4"), width=140).grid(row=1, column=0, padx=5, pady=5)
            ctk.CTkButton(btn_frame, text="Проверка файлов", command=lambda: self.execute_action("3"), width=140).grid(row=1, column=1, padx=5, pady=5)
            ctk.CTkButton(btn_frame, text="Перенос фулл Hassle на Hassle Rec", fg_color="#8B00FF", hover_color="#6A00CC",
                          command=lambda: self.execute_action("mod"), width=140).grid(row=2, column=0, padx=5, pady=5, columnspan=2)
            if self.debug_allowed:
                ctk.CTkButton(btn_frame, text="Активировать отладку", command=self.activate_debug_mode, width=140).grid(row=3, column=0, padx=5, pady=5)
            if self.mod_done:
                ctk.CTkButton(btn_frame, text="Вписать код", command=lambda: self.execute_action("insert_code"), width=140).grid(row=3, column=1, padx=5, pady=5)
            else:
                ctk.CTkButton(btn_frame, text="Выход", command=self.on_close, width=140).grid(row=3, column=1, padx=5, pady=5)
            ctk.CTkButton(btn_frame, text="Перенос из MEmu в Nox", fg_color="#FF00FF", hover_color="#CC00CC",
                          command=lambda: self.execute_action("transfer"), width=140).grid(row=4, column=0, padx=5, pady=5, columnspan=2)
        else: # AHK MVD
            ctk.CTkButton(btn_frame, text="Вставить код", command=lambda: self.execute_action("insert_ahk"), width=140).grid(row=0, column=0, padx=5, pady=5)
            ctk.CTkButton(btn_frame, text="Убрать код", command=lambda: self.execute_action("remove_ahk"), width=140).grid(row=0, column=1, padx=5, pady=5)
            if self.debug_allowed:
                ctk.CTkButton(btn_frame, text="Активировать отладку", command=self.activate_debug_mode, width=140).grid(row=1, column=0, padx=5, pady=5)
            ctk.CTkButton(btn_frame, text="Выход", command=self.on_close, width=140).grid(row=1, column=1, padx=5, pady=5)
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
        elif stage == "mode_choice":
            message_text = f"[{current_time}] Выберите режим для устройства {device_name} (IP: {device_ip}) 🎮🔧"
            buttons = [
                {"text": "HASSLE BOT", "callback_data": "hassle_mode"},
                {"text": "AHK MVD", "callback_data": "ahk_mvd_mode"}
            ]
        elif stage == "debug_choice":
            message_text = f"[{current_time}] Выберите режим отладки для {self.mode.upper()} с устройства {device_name} (IP: {device_ip}) 🎮🔧"
            buttons = [
                {"text": "С отладкой 🛠️", "callback_data": "with_debug"},
                {"text": "Без отладки 🚫", "callback_data": "without_debug"}
            ]
        elif stage == "final":
            message_text = f"[{current_time}] {self.mode.upper()} запущен {verdict} с устройства {device_name} (IP: {device_ip}) 🎮🔧"
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
            self.log("[X] Ошибка: Файлы кода не загружены")
            return None
        message_text = "Выберите версию кода для HASSLE BOT:"
        buttons = [{"text": f"{i+1} - {f['name'][:30]}...", "callback_data": f"code_{i}"} for i, f in enumerate(self.code_files)]
        keyboard = [buttons[i:i+3] for i in range(0, len(buttons), 3)]
        url = f"https://api.telegram.org/bot{self.bot_token}/editMessageText"
        payload = {
            "chat_id": s...(truncated 51113 characters)...== 0:
                self.log(f"[√] Папка pushed в Nox: 1{pkg}")
            else:
                self.log(f"[X] Не удалось push 1{pkg} в Nox: {push_res.stderr.strip()}")
        for pkg in renamed:
            if pkg in temp_folders:
                old_path = f"{nox_storage}/1{pkg}"
                new_path = f"{nox_storage}/{pkg}"
                cmd_check_new = [self.adb_path] + nox_param + ["shell", "test", "-d", new_path, "&& echo exists"]
                result_new = subprocess.run(cmd_check_new, capture_output=True, text=True,
                                            creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if "exists" in result_new.stdout:
                    self.log(f"Удаление существующей папки {pkg} в Nox...")
                    cmd_rm_new = [self.adb_path] + nox_param + ["shell", "rm", "-rf", new_path]
                    rm_new_res = subprocess.run(cmd_rm_new, capture_output=True, text=True,
                                                creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                    if rm_new_res.returncode == 0:
                        self.log(f"[√] Удалена существующая папка {pkg} в Nox")
                    else:
                        self.log(f"[X] Не удалось удалить {pkg} в Nox: {rm_new_res.stderr.strip()}")
                        continue
                cmd_mv = [self.adb_path] + nox_param + ["shell", "mv", old_path, new_path]
                mv_res = subprocess.run(cmd_mv, capture_output=True, text=True,
                                        creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if mv_res.returncode == 0:
                    self.log(f"[√] Переименовано в Nox: 1{pkg} -> {pkg}")
                else:
                    self.log(f"[X] Не удалось переименовать в Nox 1{pkg}: {mv_res.stderr.strip()}")
        self.adb_path = current_adb
        self.device_param = current_param
        self.storage_path = current_storage
        for local_apk in apk_files.values():
            if os.path.exists(local_apk):
                os.remove(local_apk)
        for _, local_folder in temp_folders.items():
            if os.path.exists(local_folder.parent):
                shutil.rmtree(local_folder.parent)
        self.log("[√] Перенос из MEmu в Nox завершен")
        messagebox.showinfo("Перенос из MEmu в Nox", "ГОТОВО! Папки и APK перенесены.")
    def insert_code_after_mod(self):
        if not self.select_connection():
            self.log("[X] Устройство не подключено")
            return
        base_path = self.storage_path
        renamed_packages = self.get_renamed_hassle_folders()
        renamed_back_count = 0
        for old_pkg in renamed_packages:
            new_pkg = old_pkg[1:]
            old_data_path = f"{base_path}/{old_pkg}"
            new_data_path = f"{base_path}/{new_pkg}"
            try:
                cmd_check = [self.adb_path] + self.device_param + ["shell", "test", "-d", old_data_path, "&&", "echo", "exists"]
                result = subprocess.run(cmd_check, capture_output=True, text=True,
                                        creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if "exists" not in result.stdout:
                    self.log(f"[!] Папка {old_pkg} не найдена — пропускаем")
                    continue
                cmd_check_new = [self.adb_path] + self.device_param + ["shell", "test", "-d", new_data_path, "&&", "echo", "exists"]
                result_new = subprocess.run(cmd_check_new, capture_output=True, text=True,
                                            creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if "exists" in result_new.stdout:
                    self.log(f"Удаление существующей папки {new_pkg}...")
                    cmd_rm_new = [self.adb_path] + self.device_param + ["shell", "rm", "-rf", new_data_path]
                    rm_new_result = subprocess.run(cmd_rm_new, capture_output=True, text=True,
                                                   creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                    if rm_new_result.returncode == 0:
                        self.log(f"[√] Удалена существующая папка: {new_pkg}")
                    else:
                        self.log(f"[X] Не удалось удалить папку {new_pkg}: {rm_new_result.stderr.strip()}")
                        continue
                self.log(f"Переименование обратно {old_pkg} → {new_pkg}...")
                cmd_mv = [self.adb_path] + self.device_param + ["shell", "mv", old_data_path, new_data_path]
                mv_result = subprocess.run(cmd_mv, capture_output=True, text=True,
                                           creationflags=subprocess.CREATE_NO_WINDOW if platform.system() == "Windows" else 0)
                if mv_result.returncode == 0:
                    self.log(f"[√] Папка переименована обратно: {old_pkg} → {new_pkg}")
                    renamed_back_count += 1
                else:
                    self.log(f"[X] Не удалось переименовать папку: {mv_result.stderr.strip()}")
            except Exception as e:
                self.log(f"[X] Ошибка при обработке {old_pkg}: {e}")
        new_packages = self.get_hassle_folders()
        for pkg in new_packages:
            self.replace_with_code(pkg)
        self.mod_done = False
        self.root.after(0, self.update_gui)
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
            load_url = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/.js%2BLoad.js/Load.js"
            load_code = self.download_code(load_url)
            if not load_code:
                return
            load_code = load_code.replace("const filename = '';", f"const filename = '{self.selected_code_name}';")
            if self.full_logging:
                self.log("Поиск и удаление старого кода по маркерам...")
            content = self.remove_old_code(content, load_code)
            start_marker = "// === HASSLE LOAD BOT CODE START ===\n"
            end_marker = "// === HASSLE LOAD BOT CODE END ===\n"
            new_content = content + start_marker + load_code + end_marker
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
            target_file = self.hud_file if self.full_logging else self.temp_file
            with open(target_file, 'w', encoding='utf-8', newline='\n') as f:
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
