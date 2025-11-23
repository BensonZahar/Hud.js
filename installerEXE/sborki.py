import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import customtkinter as ctk
from PIL import Image, ImageTk
import urllib.request
from io import BytesIO
import requests
import zipfile
import os
import shutil
import threading
import pywinstyles  # Install with: pip install pywinstyles

class ModManagerApp(ctk.CTk):
    def __init__(self):
        super().__init__()
      
        # Настройка окна
        self.title("Менеджер модификаций")
        self.geometry("980x720")
      
        # Убираем стандартное управление окном
        self.overrideredirect(True)
      
        # Темная тема
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
      
        # Цвета - черная тема
        self.bg_dark = "#1a1a1a"
        self.bg_darker = "#0d0d0d"
        self.accent_blue = "#2563eb"
        self.accent_bright = "#3b82f6"
        self.bg_transparent = "#1a1a1a"
      
        self.configure(fg_color=self.bg_darker)
      
        # Путь к игре
        self.game_path = None
        self.download_url = "https://download1347.mediafire.com/fagm7ywj4vmgXSsNQv0B9ZOPHS7Co0nMyXiyJSK-DM3LesH31sgU6vrZg_EcyGljXWssfbhzAnTbs5pAKuBd9opDHs4pewYuZKK2TCVeZjKlBbGUba1sBVWn_FT7Hh5lubGuxhQQG4AroRwV74GYJFg3QIniPxNt-g17RSCJV1Cl/jq27i7i34w029ul/BlackMinimal.zip"
        self.telegram_url = "https://t.me/your_username"  # Вставьте свою ссылку
      
        # Переменные для перетаскивания окна
        self.drag_start_x = 0
        self.drag_start_y = 0
      
        # Верхняя панель навигации
        self.create_header()
      
        # Основной контент
        self.create_content()
      
        # Прогресс-бар внизу (скрыт по умолчанию)
        self.create_progress_bar()
      
    def create_header(self):
        header_frame = ctk.CTkFrame(self, fg_color=self.bg_dark, height=60, corner_radius=0)
        header_frame.pack(fill="x", padx=0, pady=0)
        header_frame.pack_propagate(False)
      
        # Делаем header перетаскиваемым
        header_frame.bind("<Button-1>", self.start_drag)
        header_frame.bind("<B1-Motion>", self.on_drag)
      
        # Кнопки навигации
        btn_news = ctk.CTkButton(
            header_frame,
            text="НОВОСТИ",
            fg_color="transparent",
            hover_color=self.bg_darker,
            font=("Arial", 14, "bold"),
            width=200
        )
        btn_news.pack(side="left", padx=2, pady=10)
        pywinstyles.set_opacity(btn_news, value=0.8)
      
        btn_all = ctk.CTkButton(
            header_frame,
            text="СБОРКИ ONEAS STUDIO",
            fg_color=self.accent_blue,
            hover_color=self.accent_bright,
            font=("Arial", 14, "bold"),
            width=250
        )
        btn_all.pack(side="left", padx=2, pady=10)
        pywinstyles.set_opacity(btn_all, value=0.8)
      
        # Кнопки управления окном
        control_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        control_frame.pack(side="right", padx=10)
      
        btn_minimize = ctk.CTkButton(
            control_frame,
            text="—",
            width=40,
            fg_color="transparent",
            hover_color=self.bg_darker,
            font=("Arial", 16),
            command=self.minimize_window
        )
        btn_minimize.pack(side="left", padx=2)
        pywinstyles.set_opacity(btn_minimize, value=0.8)
      
        btn_close = ctk.CTkButton(
            control_frame,
            text="✕",
            width=40,
            fg_color="transparent",
            hover_color="#c42b1c",
            font=("Arial", 16),
            command=self.quit
        )
        btn_close.pack(side="left", padx=2)
        pywinstyles.set_opacity(btn_close, value=0.8)
      
    def create_content(self):
        # Контейнер для контента справа от sidebar
        content_container = ctk.CTkFrame(self, fg_color=self.bg_darker)
        content_container.place(x=70, y=60, relwidth=0.93, relheight=0.92)
      
        # Заголовок секции
        title_label = ctk.CTkLabel(
            content_container,
            text="ДОСТУПНЫЕ МОДИФИКАЦИИ",
            font=("Arial", 24, "bold"),
            text_color="white"
        )
        title_label.pack(pady=(20, 20), padx=40, anchor="w")
      
        # Скроллируемый фрейм для карточек
        scroll_frame = ctk.CTkScrollableFrame(
            content_container,
            fg_color=self.bg_darker,
            scrollbar_button_color=self.bg_dark,
            scrollbar_button_hover_color=self.accent_blue
        )
        scroll_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))
      
        # Данные модификаций
        mods = [
            {"name": "Fate Dark", "type": "Сборка", "color": "#1a0a1f", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/28.jpg", "download": "https://dl.dropboxusercontent.com/scl/fi/8twj1q1papt226kjxci9t/Fate-Dark.zip?rlkey=wt2r8q8oj9d3lfzppcn7qfxi0&st=jqvwavfv&dl=0"},
            {"name": "GTA Five", "type": "Сборка", "color": "#2a1a1a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/1.jpg", "download": self.download_url},
            {"name": "Green Spirit", "type": "Сборка", "color": "#0a1a0f", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/2.jpg", "download": self.download_url},
            {"name": "Black Minimal", "type": "Сборка", "color": "#1a1a1a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/3.jpg", "download": self.download_url},
            {"name": "Point Switch", "type": "Сборка", "color": "#0a1a2a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/4.jpg", "download": self.download_url},
            {"name": "Pacific Noise", "type": "Сборка", "color": "#2a1a1f", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/5.jpg", "download": self.download_url},
            {"name": "Radmir Classic", "type": "Коллекция", "color": "#1a1a2a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/6.jpg", "download": self.download_url},
            {"name": "Ghetto Love", "type": "Сборка", "color": "#1a0a1f", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/7.jpg", "download": self.download_url},
            {"name": "OLD style", "type": "Сборка", "color": "#2a1a00", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/8.jpg", "download": self.download_url},
            {"name": "NFS Most Wanted", "type": "Сборка", "color": "#1a1a0a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/9.jpg", "download": self.download_url},
            {"name": "RADMIR:GO", "type": "Сборка", "color": "#0a0a0a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/10.jpg", "download": self.download_url},
            {"name": "Hasel Online", "type": "Сборка", "color": "#1a1a1a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/11.jpg", "download": self.download_url},
            {"name": "Purple Spring GTA", "type": "Сборка", "color": "#1a0a2a", "image": "https://raw.githubusercontent.com/ONEAS-hub/oneaslaucnerstorage/refs/heads/main/product-preview/12.jpg", "download": self.download_url}
        ]
      
        # Создаем сетку карточек
        for i, mod in enumerate(mods):
            row = i // 3
            col = i % 3
            self.create_mod_card(scroll_frame, mod, row, col)
          
        # Боковая панель с иконками
        self.create_sidebar()
  
    def create_mod_card(self, parent, mod_data, row, col):
        card_frame = ctk.CTkFrame(
            parent,
            fg_color=mod_data["color"],
            corner_radius=20,
            width=360,
            height=460
        )
        card_frame.grid(row=row, column=col, padx=10, pady=10, sticky="nsew")
        card_frame.grid_propagate(False)
        pywinstyles.set_opacity(card_frame, value=0.8)
      
        # Загрузка и отображение изображения
        try:
            with urllib.request.urlopen(mod_data["image"]) as url:
                image_data = url.read()
            image = Image.open(BytesIO(image_data))
          
            # Используем оригинальный размер 360x360
            image = image.resize((360, 360), Image.Resampling.LANCZOS)
            photo = ImageTk.PhotoImage(image)
          
            image_label = tk.Label(
                card_frame,
                image=photo,
                bg=mod_data["color"],
                borderwidth=0
            )
            image_label.image = photo  # Сохраняем ссылку
            image_label.pack(pady=(0, 0))
        except:
            pass
      
        # Тип (Сборка/Коллекция)
        type_label = ctk.CTkLabel(
            card_frame,
            text=mod_data["type"],
            font=("Arial", 12),
            text_color="#888888"
        )
        type_label.pack(pady=(10, 0))
      
        name_label = ctk.CTkLabel(
            card_frame,
            text=mod_data["name"],
            font=("Arial", 18, "bold"),
            text_color="white"
        )
        name_label.pack(pady=(5, 5))
      
        # Нижний блок с эффектом наведения
        price_bottom_frame = ctk.CTkFrame(
            card_frame,
            fg_color="#1a1a1a",
            corner_radius=0,
            height=50
        )
        price_bottom_frame.pack(fill="x", side="bottom")
        price_bottom_frame.pack_propagate(False)
        pywinstyles.set_opacity(price_bottom_frame, value=0.8)
      
        # Надпись "БЕСПЛАТНО" / "Скачать"
        action_label = ctk.CTkLabel(
            price_bottom_frame,
            text="БЕСПЛАТНО",
            font=("Arial", 14, "bold"),
            text_color="white",
            cursor="hand2"
        )
        action_label.pack(expand=True)
      
        def on_enter(e):
            action_label.configure(text="⬇ Скачать")
          
        def on_leave(e):
            action_label.configure(text="БЕСПЛАТНО")
      
        def on_click(e):
            self.download_and_install(mod_data)
      
        price_bottom_frame.bind("<Enter>", on_enter)
        price_bottom_frame.bind("<Leave>", on_leave)
        action_label.bind("<Enter>", on_enter)
        action_label.bind("<Leave>", on_leave)
        action_label.bind("<Button-1>", on_click)
        price_bottom_frame.bind("<Button-1>", on_click)
      
        # Конфигурация сетки
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_columnconfigure(1, weight=1)
        parent.grid_columnconfigure(2, weight=1)
  
    def create_sidebar(self):
        sidebar = ctk.CTkFrame(
            self,
            fg_color=self.bg_dark,
            width=60,
            corner_radius=0
        )
        sidebar.place(x=0, y=60, relheight=0.92)
      
        # Кнопка Telegram
        telegram_btn = ctk.CTkButton(
            sidebar,
            text="📱",
            width=50,
            height=50,
            fg_color=self.accent_blue,
            hover_color=self.accent_bright,
            font=("Arial", 24),
            corner_radius=25,
            command=self.open_telegram
        )
        telegram_btn.pack(pady=(20, 10), padx=5)
        pywinstyles.set_opacity(telegram_btn, value=0.8)
  
    def create_progress_bar(self):
        """Создает прогресс-бар внизу окна"""
        self.progress_frame = ctk.CTkFrame(
            self,
            fg_color=self.bg_dark,
            height=60,
            corner_radius=0
        )
        # Скрыт по умолчанию
      
        self.progress_label = ctk.CTkLabel(
            self.progress_frame,
            text="Скачивание: Название сборки",
            font=("Arial", 12),
            text_color="white"
        )
        self.progress_label.pack(pady=(5, 2))
      
        progress_container = ctk.CTkFrame(self.progress_frame, fg_color="transparent")
        progress_container.pack(fill="x", padx=20, pady=(0, 5))
      
        self.progress_bar = ctk.CTkProgressBar(
            progress_container,
            height=20
        )
        self.progress_bar.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.progress_bar.set(0)
      
        self.progress_percent = ctk.CTkLabel(
            progress_container,
            text="0%",
            font=("Arial", 12, "bold"),
            text_color="white",
            width=50
        )
        self.progress_percent.pack(side="right")
  
    def show_progress(self, mod_name):
        """Показать прогресс-бар"""
        self.progress_label.configure(text=f"Скачивание: {mod_name}")
        self.progress_bar.set(0)
        self.progress_percent.configure(text="0%")
        self.progress_frame.pack(side="bottom", fill="x")
  
    def update_progress(self, value, percent_text):
        """Обновить прогресс"""
        self.progress_bar.set(value)
        self.progress_percent.configure(text=percent_text)
  
    def hide_progress(self):
        """Скрыть прогресс-бар"""
        self.progress_frame.pack_forget()
  
    def start_drag(self, event):
        """Начать перетаскивание окна"""
        self.drag_start_x = event.x
        self.drag_start_y = event.y
  
    def on_drag(self, event):
        """Перетаскивание окна"""
        x = self.winfo_x() + event.x - self.drag_start_x
        y = self.winfo_y() + event.y - self.drag_start_y
        self.geometry(f"+{x}+{y}")
  
    def open_telegram(self):
        """Открыть Telegram профиль"""
        import webbrowser
        webbrowser.open(self.telegram_url)
  
    def minimize_window(self):
        """Сворачивание окна"""
        self.overrideredirect(False)
        self.iconify()
        self.overrideredirect(True)
  
    def download_and_install(self, mod_data):
        """Скачивание и установка сборки"""
        # Выбор папки RADMIR CRMP
        if not self.game_path:
            folder = filedialog.askdirectory(
                title="Выберите папку RADMIR CRMP",
                initialdir="D:/Games/RADMIR CRMP" if os.path.exists("D:/Games/RADMIR CRMP") else None
            )
            if not folder:
                return
            self.game_path = folder
      
        # Показываем прогресс-бар
        self.show_progress(mod_data['name'])
      
        def install_thread():
            try:
                # Скачивание файла
                temp_zip = os.path.join(os.environ['TEMP'], 'mod_temp.zip')
              
                # Настройка headers для обхода защиты
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
              
                response = requests.get(mod_data['download'], headers=headers, stream=True, allow_redirects=True)
              
                # Проверяем, что получили данные
                if response.status_code != 200:
                    raise Exception(f"Ошибка скачивания: HTTP {response.status_code}")
              
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
              
                with open(temp_zip, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            if total_size > 0:
                                progress = downloaded / total_size * 0.7  # 70% на скачивание
                                percent = int(progress * 100)
                                self.after(0, lambda p=progress, pt=f"{percent}%": self.update_progress(p, pt))
              
                # Проверяем, что файл действительно ZIP
                if not zipfile.is_zipfile(temp_zip):
                    os.remove(temp_zip)
                    raise Exception("Скачанный файл не является ZIP архивом")
              
                # Распаковка
                self.after(0, lambda: self.progress_label.configure(text=f"Установка: {mod_data['name']}"))
                self.after(0, lambda: self.update_progress(0.75, "75%"))
              
                with zipfile.ZipFile(temp_zip, 'r') as zip_ref:
                    all_files = zip_ref.namelist()
                    if not all_files:
                        raise Exception("Архив пустой")
                  
                    # Определяем корневую папку в архиве
                    root_folder = None
                    for item in all_files:
                        if '/' in item:
                            root_folder = item.split('/')[0]
                            break
                  
                    # Извлекаем содержимое папки из архива с заменой файлов
                    for member in all_files:
                        # Пропускаем саму корневую папку
                        if root_folder and member == root_folder + '/':
                            continue
                          
                        # Убираем корневую папку из пути
                        if root_folder and member.startswith(root_folder + '/'):
                            target_path = member[len(root_folder) + 1:]
                        else:
                            target_path = member
                      
                        if target_path:
                            target_file = os.path.join(self.game_path, target_path)
                          
                            if member.endswith('/'):
                                os.makedirs(target_file, exist_ok=True)
                            else:
                                os.makedirs(os.path.dirname(target_file), exist_ok=True)
                                # Замена существующих файлов
                                with zip_ref.open(member) as source, open(target_file, 'wb') as target:
                                    shutil.copyfileobj(source, target)
              
                self.after(0, lambda: self.update_progress(1.0, "100%"))
              
                # Удаляем временный файл
                if os.path.exists(temp_zip):
                    os.remove(temp_zip)
              
                # Скрываем прогресс через 1.5 секунды
                self.after(1500, self.hide_progress)
              
                self.after(0, lambda: messagebox.showinfo("Успех", f"{mod_data['name']} успешно установлена!"))
              
            except Exception as e:
                self.after(0, self.hide_progress)
                self.after(0, lambda: messagebox.showerror("Ошибка", f"Не удалось установить сборку:\n{str(e)}"))
      
        # Запускаем установку в отдельном потоке
        thread = threading.Thread(target=install_thread, daemon=True)
        thread.start()

if __name__ == "__main__":
    app = ModManagerApp()
    app.mainloop()