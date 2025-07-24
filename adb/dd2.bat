@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: �������� ADB
where adb >nul 2>&1
if %errorlevel% neq 0 (
    echo ADB �� ������. ���������� Android SDK � �������� � PATH.
    pause
    exit /b 1
)

:: �������� ����������
adb devices | find "device" >nul
if %errorlevel% neq 0 (
    echo ���������� �� �������. ���������� � �������� USB-�������.
    pause
    exit /b 1
)

:: ����
set "SOURCE_PATH=Android/data/com.hassle.onlinf/files/Assets/webview"
set "DESTINATION=D:\HASSLE"

:: �������� ������
echo ������� ������ ������ � %SOURCE_PATH%...
adb shell ls "/sdcard/%SOURCE_PATH%" > files.tmp

:: �������� �����������
set "fileCount=0"
for /f "delims=" %%i in ('type files.tmp ^| find /v /c ""') do set /a fileCount=%%i

if %fileCount% equ 0 (
    echo ����� ����� ��� �� ����������.
    del files.tmp
    pause
    exit /b 1
)

:: ����� ������
echo.
echo ���������� ����� webview:
echo -------------------------
set /a counter=0
for /f "delims=" %%i in (files.tmp) do (
    set /a counter+=1
    call echo %%counter%%. %%i
    set "item_!counter!=%%i"
)
echo -------------------------
echo.

:: ���� ������
set /p "choices=������� ������ ������/����� ��� ����������� (����� �������, �������� 1,3): "

:: �������� �����
if not exist "%DESTINATION%" mkdir "%DESTINATION%"

:: �����������
set "copied=0"
for %%c in (%choices%) do (
    for /f "tokens=1* delims==" %%a in ('set item_%%c 2^>nul') do (
        if not "%%b"=="" (
            echo �����������: %%b
            adb pull "/sdcard/%SOURCE_PATH%/%%b" "%DESTINATION%\%%b"
            if !errorlevel! equ 0 (
                set /a copied+=1
                echo [OK] �����������: %%b
            ) else (
                echo [������] �� ������� �����������: %%b
            )
            echo.
        )
    )
)

:: �����
echo -------------------------
if %copied% gtr 0 (
    echo ������� �����������: %copied% ���������
    echo ����: %DESTINATION%
) else (
    echo ������ �� �����������. ��������� ��������� ������.
)

del files.tmp
pause