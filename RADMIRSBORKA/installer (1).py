import tkinter as tk
from tkinter import filedialog, messagebox
import threading, zipfile, shutil, os, re, tempfile, requests

# ══════════════════════════════════════════════
MEDIAFIRE_URL = "https://www.mediafire.com/file/qdc749p0hbjmj7f/Sborka.zip/file"
FOLDER_IN_ZIP = "Sborka"
REQUIRED_EXE  = "gta_sa.exe"
# ══════════════════════════════════════════════

BG     = "#0f0f0f"
CARD   = "#1a1a1a"
BORDER = "#2a2a2a"
ACCENT = "#ffffff"
DIM    = "#555555"
GREEN  = "#4ade80"
RED    = "#f87171"
TEXT   = "#e5e5e5"


def get_direct_url(url, hdrs):
    r = requests.get(url, headers=hdrs, allow_redirects=True, timeout=30)
    if "text/html" not in r.headers.get("Content-Type", ""):
        return url
    for pattern in [
        r'href="(https://download\d+\.mediafire\.com/[^"]+)"',
        r'"(https://download\d+\.mediafire\.com/[^"]+)"',
        r'id="downloadButton"[^>]+href="([^"]+)"',
    ]:
        m = re.search(pattern, r.text)
        if m:
            return m.group(1)
    raise RuntimeError("Ссылка Mediafire устарела. Обнови MEDIAFIRE_URL.")


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Установщик сборки")
        self.geometry("460x300")
        self.resizable(False, False)
        self.configure(bg=BG)
        self.folder_var = tk.StringVar()
        self.status_var = tk.StringVar(value="Выберите папку с игрой")
        self._build()
        self._center()

    def _center(self):
        self.update_idletasks()
        x = (self.winfo_screenwidth()  - 460) // 2
        y = (self.winfo_screenheight() - 300) // 2
        self.geometry(f"460x300+{x}+{y}")

    def _build(self):
        top = tk.Frame(self, bg=BG)
        top.pack(fill="x", padx=28, pady=(28, 0))
        tk.Label(top, text="RADMIR CRMP", font=("Segoe UI", 15, "bold"),
                 fg=TEXT, bg=BG).pack(anchor="w")
        tk.Label(top, text="Установщик сборки", font=("Segoe UI", 9),
                 fg=DIM, bg=BG).pack(anchor="w")

        tk.Frame(self, bg=BORDER, height=1).pack(fill="x", padx=28, pady=20)

        mid = tk.Frame(self, bg=BG)
        mid.pack(fill="x", padx=28)

        tk.Label(mid, text="Папка игры", font=("Segoe UI", 8),
                 fg=DIM, bg=BG).pack(anchor="w", pady=(0, 5))

        row = tk.Frame(mid, bg=CARD, highlightthickness=1,
                       highlightbackground=BORDER)
        row.pack(fill="x")

        self.entry = tk.Entry(row, textvariable=self.folder_var,
                              font=("Segoe UI", 9), bg=CARD, fg=TEXT,
                              insertbackground=TEXT, relief="flat",
                              bd=0, highlightthickness=0)
        self.entry.pack(side="left", fill="x", expand=True, ipady=7, ipadx=10)

        self.btn_browse = tk.Button(
            row, text="Обзор", command=self._browse,
            font=("Segoe UI", 8), bg=BORDER, fg=TEXT,
            activebackground="#333", activeforeground=TEXT,
            relief="flat", bd=0, cursor="hand2", padx=14, pady=7)
        self.btn_browse.pack(side="right")

        self.bar_bg = tk.Frame(mid, bg=BORDER, height=2)
        self.bar_bg.pack(fill="x", pady=(10, 0))
        self.bar_fg = tk.Frame(self.bar_bg, bg=DIM, height=2, width=0)
        self.bar_fg.place(x=0, y=0, relheight=1)

        self.status_label = tk.Label(mid, textvariable=self.status_var,
                                     font=("Segoe UI", 8), fg=DIM, bg=BG)
        self.status_label.pack(anchor="w", pady=(7, 0))

        bot = tk.Frame(self, bg=BG)
        bot.pack(fill="x", padx=28, pady=(16, 28))

        self.btn_install = tk.Button(
            bot, text="Установить", command=self._start,
            font=("Segoe UI", 9, "bold"), bg=TEXT, fg="#0f0f0f",
            activebackground="#cccccc", activeforeground="#0f0f0f",
            relief="flat", bd=0, cursor="hand2", pady=9)
        self.btn_install.pack(fill="x")

    def _set_progress(self, pct):
        self.bar_bg.update_idletasks()
        w = int(self.bar_bg.winfo_width() * pct / 100)
        self.bar_fg.config(width=max(w, 0),
                           bg=GREEN if pct >= 100 else ACCENT)

    def _set_status(self, msg, color=DIM):
        self.status_var.set(msg)
        self.status_label.config(fg=color)

    def _lock(self, v):
        s = "disabled" if v else "normal"
        self.btn_install.config(state=s)
        self.btn_browse.config(state=s)
        self.entry.config(state=s)

    def _browse(self):
        init = "D:/Games/RADMIR CRMP" if os.path.exists("D:/Games/RADMIR CRMP") else "/"
        p = filedialog.askdirectory(title="Папка RADMIR CRMP", initialdir=init)
        if p:
            self.folder_var.set(os.path.normpath(p))

    def _ui(self, fn, *a):
        self.after(0, lambda: fn(*a))

    def _start(self):
        folder = self.folder_var.get().strip()
        if not folder:
            messagebox.showwarning("Ошибка", "Выберите папку с игрой")
            return
        if not os.path.isdir(folder):
            messagebox.showerror("Ошибка", "Папка не существует")
            return
        if not os.path.isfile(os.path.join(folder, REQUIRED_EXE)):
            messagebox.showerror(
                "Ошибка",
                f"Файл {REQUIRED_EXE} не найден.\n"
                "Выберите правильную папку RADMIR CRMP.")
            return
        self._lock(True)
        threading.Thread(target=self._worker, args=(folder,), daemon=True).start()

    def _worker(self, dest):
        tmp = tempfile.mkdtemp(prefix="radmir_")
        try:
            zip_path = os.path.join(tmp, "Sborka.zip")
            hdrs = {"User-Agent": "Mozilla/5.0"}

            self._ui(self._set_status, "Подключение...")
            self._ui(self._set_progress, 3)

            direct = get_direct_url(MEDIAFIRE_URL, hdrs)

            resp = requests.get(direct, headers=hdrs, stream=True,
                                allow_redirects=True, timeout=60)
            if resp.status_code != 200:
                raise RuntimeError(f"HTTP {resp.status_code}")

            total = int(resp.headers.get("content-length", 0))
            done  = 0
            with open(zip_path, "wb") as f:
                for chunk in resp.iter_content(65536):
                    if chunk:
                        f.write(chunk)
                        done += len(chunk)
                        if total:
                            pct = done / total * 55
                            mb  = done / 1_048_576
                            mbt = total / 1_048_576
                            self._ui(self._set_progress, pct)
                            self._ui(self._set_status,
                                     f"Загрузка  {mb:.1f} / {mbt:.1f} МБ")

            if not zipfile.is_zipfile(zip_path):
                raise RuntimeError(
                    "Файл не является ZIP.\n"
                    "Ссылка Mediafire устарела — обнови MEDIAFIRE_URL.")

            self._ui(self._set_status, "Распаковка...")
            self._ui(self._set_progress, 58)

            ext = os.path.join(tmp, "x")
            os.makedirs(ext)
            with zipfile.ZipFile(zip_path) as zf:
                members = zf.namelist()
                sub = [m for m in members
                       if m.startswith(FOLDER_IN_ZIP + "/")]
                zf.extractall(ext, sub or members)

            src = os.path.join(ext, FOLDER_IN_ZIP)
            if not os.path.isdir(src):
                src = ext

            files = [os.path.join(r, f)
                     for r, _, fs in os.walk(src) for f in fs]
            n = len(files)
            self._ui(self._set_status, "Установка...")

            for i, sf in enumerate(files, 1):
                rel = os.path.relpath(sf, src)
                df  = os.path.join(dest, rel)
                os.makedirs(os.path.dirname(df), exist_ok=True)
                with open(sf, "rb") as s, open(df, "wb") as d:
                    shutil.copyfileobj(s, d)
                self._ui(self._set_progress, 58 + i / n * 40)

            self._ui(self._set_progress, 100)
            self._ui(self._set_status, "Готово!", GREEN)
            self.after(0, lambda: messagebox.showinfo(
                "Готово", "Сборка установлена!\nМожно запускать игру."))

        except Exception as e:
            self._ui(self._set_progress, 0)
            self._ui(self._set_status, str(e).split("\n")[0], RED)
            self.after(0, lambda err=str(e):
                       messagebox.showerror("Ошибка", err))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
            self._ui(self._lock, False)


if __name__ == "__main__":
    App().mainloop()
