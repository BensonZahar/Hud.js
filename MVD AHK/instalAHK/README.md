# AHK MVD Installer — зависимости и сборка

## Установка зависимостей

```
pip install pywebview requests
```

> pywebview требует CEF или Edge WebView2 (Windows 10/11) — обычно уже установлен.

## Структура проекта

```
ahk_mvd_redesign/
├── ahk_mvd_installer.py   ← главный файл
├── index.html             ← интерфейс (планшет)
├── icon.ico               ← иконка (опционально, добавь сам)
└── requirements.txt
```

## Запуск из исходников

```
python ahk_mvd_installer.py
```

## Сборка в .exe (PyInstaller)

```
pip install pyinstaller

pyinstaller --onefile --noconsole --windowed ^
  --add-data "index.html;." ^
  --add-data "icon.ico;." ^
  --icon icon.ico ^
  --name "AHK MVD Installer" ^
  ahk_mvd_installer.py
```

Готовый exe будет в папке `dist/`.

## Замечания

- `index.html` должен лежать рядом с `.exe` (или `.py`)
- `frameless=True` убирает стандартную рамку Windows, дизайн выглядит как в игре
- Логи из Python пробрасываются в JS через `_log()` → `appendLog()`
