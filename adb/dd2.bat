@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Проверка ADB
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo ADB не найден. Установите Android SDK и добавьте в PATH.
    pause
    exit /b 1
)

:: Проверка устройства
adb devices | find "device" >nul
if %errorlevel% neq 0 (
    echo Устройство не найдено. Подключите и включите USB-отладку.
    pause
    exit /b 1
)

:: Пути
set "SOURCE_PATH=Android/data/com.hassle.onlinf/files/Assets/webview"
set "DESTINATION=D:\HASSLE"

:: Получаем список
echo Получаю список файлов в %SOURCE_PATH%...
adb shell ls "/sdcard/%SOURCE_PATH%" > files.tmp

:: Проверка содержимого
set "fileCount=0"
for /f "delims=" %%i in ('type files.tmp ^| find /v /c ""') do set /a fileCount=%%i

if %fileCount% equ 0 (
    echo Папка пуста или не существует.
    del files.tmp
    pause
    exit /b 1
)

:: Вывод списка
echo.
echo Содержимое папки webview:
echo -------------------------
set /a counter=0
for /f "delims=" %%i in (files.tmp) do (
    set /a counter+=1
    call echo %%counter%%. %%i
    set "item_!counter!=%%i"
)
echo -------------------------
echo.

:: Ввод выбора
set /p "choices=Введите номера файлов/папок для копирования (через запятую, например 1,3): "

:: Создание папки
if not exist "%DESTINATION%" mkdir "%DESTINATION%"

:: Копирование
set "copied=0"
for %%c in (%choices%) do (
    for /f "tokens=1* delims==" %%a in ('set item_%%c 2^>nul') do (
        if not "%%b"=="" (
            echo Копирование: %%b
            adb pull "/sdcard/%SOURCE_PATH%/%%b" "%DESTINATION%\%%b"
            if !errorlevel! equ 0 (
                set /a copied+=1
                echo [OK] Скопировано: %%b
            ) else (
                echo [ОШИБКА] Не удалось скопировать: %%b
            )
            echo.
        )
    )
)

:: Итоги
echo -------------------------
if %copied% gtr 0 (
    echo Успешно скопировано: %copied% элементов
    echo Путь: %DESTINATION%
) else (
    echo Ничего не скопировано. Проверьте введенные номера.
)

del files.tmp
pause