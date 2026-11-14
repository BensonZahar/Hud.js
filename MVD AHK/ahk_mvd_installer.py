import os, re, random, string, threading, tempfile, requests, json
import sys, base64, hashlib, time, io, winreg
import subprocess, zipfile, shutil
from pathlib import Path
import webview
from PIL import Image

# ═══════════════════════════════════════════════════════════════════════
# ⚠️ ЧТО ЭТО ЗА ПРОГРАММА
# ═══════════════════════════════════════════════════════════════════════
# Это установщик AHK MVD — ПОМОЩНИКА ДЛЯ ТЕСТИРОВАНИЯ МВД И ФУНКЦИЙ
# ДЛЯ РАЗРАБОТЧИКОВ ИГРЫ. Версия: beta 0.1.
#
# Это НЕ обычная пользовательская программа/мод для рядовых игроков.
# Установщик ставит кастомные интерфейсы и хуки (mvdF.js и связанные
# файлы), которые готовятся для тестирования интерфейса МВД (полиции)
# и функций для разработчиков игры.
#
# Доступ ограничен: установщик проверяет HWID по списку авторизованных
# ключей (см. is_authorized/HWID_URL → installerEXE/hwid.json) — без HWID в этом списке
# программа не пустит дальше. Если вы обычный игрок и не участвуете
# в тестировании — вам этот установщик не нужен, ключа у вас всё равно
# не будет.
#
# Этот код есть только у разработчиков и никакого преимущества
# не даёт: он доступен, работает и используется исключительно
# на закрытых тестовых серверах — на обычных (боевых) серверах
# игры этот функционал недоступен и никак не влияет на игровой
# процесс других игроков. Это beta-версия (0.1) — возможны баги
# и незавершённые функции.
# ═══════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════
#  НАСТРОЙКИ
# ═══════════════════════════════════════════════════════
GITHUB_RAW    = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK"
# Оригинальные Modal.css / Window.css / Button.css / ScrollableContainer.css игры — на них построена вкладка «Бинды» в index.html
GAME_UI_RAW   = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/AHK%20konst/%D0%A3%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D1%89%D0%B8%D0%BA"
GAME_UI_FILES = ("Modal.css", "Window.css", "Button.css", "ScrollableContainer.css")
# Список разрешённых HWID лежит на GitHub в папке installerEXE (рядом с adb.zip / repak.exe)
HWID_URL      = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/hwid.json"
AHK_URL       = f"{GITHUB_RAW}/LoadAhk.js"

FSB_RAW       = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/FSB%20AHK"
FSB_AHK_URL   = f"{FSB_RAW}/LoadFsb.js"

# ── Кастом-интерфейсы МВД (остаются в MVD AHK) ──
MVD_INTLOAD_URL   = f"{GITHUB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
MVD_CUSTOM_UI_URL = f"{GITHUB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"
MVD_LOADERS_URL   = f"{MVD_CUSTOM_UI_URL}/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

# ── Кастом-интерфейсы ФСБ (теперь в FSB AHK) ──
FSB_INTLOAD_URL   = f"{FSB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
FSB_CUSTOM_UI_URL = f"{FSB_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"
FSB_LOADERS_URL   = f"{FSB_CUSTOM_UI_URL}/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

# ── Кастом-интерфейсы ФСИН (в FSIN AHK) ──
FSIN_RAW          = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/FSIN%20AHK"
FSIN_AHK_URL      = f"{FSIN_RAW}/LoadFsin.js"
FSIN_INTLOAD_URL  = f"{FSIN_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
FSIN_CUSTOM_UI_URL= f"{FSIN_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"
FSIN_LOADERS_URL  = f"{FSIN_CUSTOM_UI_URL}/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

# ── Правительство (в PRAVO AHK) ──
PRAVO_RAW          = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/PRAVO%20AHK"
PRAVO_AHK_URL      = f"{PRAVO_RAW}/LoadPravo.js"
PRAVO_INTLOAD_URL  = f"{PRAVO_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B/IntLoad.js"
PRAVO_CUSTOM_UI_URL= f"{PRAVO_RAW}/%D0%9A%D0%B0%D1%81%D1%82%D0%BE%D0%BC%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D1%84%D0%B5%D0%B9%D1%81%D1%8B"
PRAVO_LOADERS_URL  = f"{PRAVO_CUSTOM_UI_URL}/%D0%97%D0%B0%D0%B3%D1%80%D1%83%D0%B7%D1%87%D0%B8%D0%BA%D0%B8"

# ── АХК другое: Банда (в AHK konst/GANG AHK) — своих кастом-интерфейсов нет ──
GANG_RAW           = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/AHK%20konst/GANG%20AHK"
GANG_AHK_URL       = f"{GANG_RAW}/LoadGang.js"

RETRY_COUNT = 5
RETRY_DELAY = 4

USE_LOADERS   = True

# ═══════════════════════════════════════════════════════════════════════
# HASSLE / ТЕЛЕФОН
# ═══════════════════════════════════════════════════════════════════════

HASSLE_STORAGE = "/sdcard/Android/data"

HASSLE_ADB_DIR = Path(tempfile.gettempdir()) / "adb_ahk_temp"
HASSLE_ADB_EXE = HASSLE_ADB_DIR / "adb" / "adb.exe"

HASSLE_ADB_ZIP_URL = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/adb.zip"

# Если None — используется текущий AHK-лоадер (МВД/ФСБ/ФСИН).
# Раскомментируй ниже, если нужен именно код из HassleB/Load.js:
# HASSLE_LOADER_URL = "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/HassleB/Load.js"
HASSLE_LOADER_URL = None

# Фоллбэк-имена переменных в Index.js (меняются при каждой сборке игры).
# Автодетект ищет по паттернам {Preloader: и {FirstPersonConfig:{open:
# Если паттерн не найден — используются значения ниже.
PC_DD_VAR_FALLBACK     = 'Dd'   # ПК      — словарь импортов (lazy-loaders), сборка 2026-10-04
PC_FD_VAR_FALLBACK     = 'Rd'   # ПК      — словарь конфигов (open/show/options), сборка 2026-10-04
# Буквы хелперов в Index.js (тоже меняются между сборками):
#   f = defineAsyncComponent (обёртка ленивого компонента), d = preload-хелпер (подгрузка css + import)
LOADER_F_FALLBACK      = 'f'
LOADER_D_FALLBACK      = 'd'
HASSLE_DD_VAR_FALLBACK = 'Dd'   # Телефон — словарь импортов (lazy-loaders)
HASSLE_FD_VAR_FALLBACK = 'Rd'   # Телефон — словарь конфигов (open/show/options)

HASSLE_CREATE_NO_WINDOW = 0x08000000 if os.name == "nt" else 0

# ═══════════════════════════════════════════════════════════════════════
# HASSLE 2 (ПК, Unreal Engine 5)
# ═══════════════════════════════════════════════════════════════════════
# Интерфейс HASSLE 2 лежит ВНУТРИ pak игры (pakchunk172-Windows.pak, mount point
# HassleOnline/Content/UserInterface/Main/), обычной папки uiresources там нет.
# Поэтому игровые файлы не трогаем: рядом кладём свой патч-pak (так же, как build.bat
# в HassleUI), а в нём:
#     index.html       — оригинальный index.html игры + тег <script ahk.js>
#     assets/ahk.js    — наш модуль (+ файлы кастом-интерфейсов)
# Пользователь указывает корень игры, например  D:\HASSLE GAMES\Hassle Online
HASSLE2_PAK_NAME     = "pakchunk998-Windows_P"   # 999 занят под HassleUI (модифицированный index.js)
HASSLE2_ORIG_PAK     = "pakchunk172-Windows.pak" # родной pak с интерфейсом (из него берём оригинальные index.html / index.js)
HASSLE2_MOD_PAK_UI   = "pakchunk999-Windows_P.pak"  # мод HassleUI (запасной источник index.js для букв Vue-хелперов)
HASSLE2_STUB         = "pakchunk172-Windows"     # от его .utoc берётся заголовок для пустого IoStore-контейнера
HASSLE2_CONTAINER_ID = b"HSLMOD98"               # ContainerId нашего пустого .utoc (у HassleUI — HSLMOD99)
HASSLE2_PAK_VERSION  = "V11"
HASSLE2_MOUNT        = "../../../HassleOnline/Content/UserInterface/Main/"
HASSLE2_MOUNT_REL    = "HassleOnline/Content/UserInterface/Main/"
# repak.exe ищется: настройка hassle2_repak -> рядом с установщиком / внутри exe -> AppData\AHK_KONST\tools -> скачивается отсюда
HASSLE2_REPAK_URLS   = [
    "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/repak.exe",
    "https://raw.githubusercontent.com/BensonZahar/Hud.js/main/installerEXE/repak.zip",
]
# Запасной вариант, если не удалось достать index.html из pak (экспорт FModel, 2026-11-13)
HASSLE2_INDEX_FALLBACK = r'''<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="transparent" content="true">
    <title>Hassle interfaces</title>
    <script type="module" crossorigin src="./assets/index.js"></script>
    <link rel="stylesheet" href="./assets/index.css">
  </head>
  <body>
    <noscript>
      <strong>We're sorry but Hassle interfaces doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->

    <!-- this new script is for vite -->
    
  </body>
</html>
'''

# ═══════════════════════════════════════════════════════════════════════
#  ahk.js — ОТДЕЛЬНЫЙ МОДУЛЬ (вместо вставки в конец Index.js)
# ═══════════════════════════════════════════════════════════════════════
# Установщик пишет assets/ahk.js и прописывает его <script type="module"> в
# uiresources/index.html (между маркерами HASSLE LOAD BOT). Index.js НЕ меняется.
# Внутренние переменные Index.js (Rt/$t/w/f, Oe/Ao/sr) в отдельном модуле недоступны,
# поэтому регистрация интерфейсов идёт через window.App, а нужные функции Vue
# ищутся в неймспейсе ./index.js по исходнику (не зависят от сборки игры).
AHK_MODULE_CORE = r'''// ═══════════════════════════════════════════════════════════════════════
// ahk.js — ОТДЕЛЬНЫЙ МОДУЛЬ (подключается в index.html после index.js)
// ═══════════════════════════════════════════════════════════════════════
// Раньше этот код вставлялся В КОНЕЦ index.js и пользовался его внутренними
// (минифицированными) переменными: Rt, $t, w, f (регистрация интерфейсов) и
// Oe, Ao, sr (хелперы Vue для патча Hud). В отдельном модуле их НЕТ — вот
// почему интерфейсы не открывались (ReferenceError глотался try/catch).
//
// Теперь всё берётся из публичных мест, имена которых не зависят от сборки:
//   • window.App.$.type.components  — это и есть Rt (локальные компоненты root)
//   • window.App.components         — это и есть $t (конфиги интерфейсов)
//   • import("./index.js")          — неймспейс; нужные Vue-функции ищутся по
//                                     исходнику (defineAsyncComponent, openBlock …)
//
// ВАЖНО: из index.js код AHK нужно УДАЛИТЬ (оставить оригинал), иначе всё
// выполнится дважды.
// ═══════════════════════════════════════════════════════════════════════

// ── 0. Вспомогательное ────────────────────────────────────────────────
const __ahkSleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function __ahkWaitFor(fn, timeoutMs, stepMs) {
    const t0 = Date.now();
    for (;;) {
        try { const v = fn(); if (v) return v; } catch (e) {}
        if (Date.now() - t0 > timeoutMs) return null;
        await __ahkSleep(stepMs || 50);
    }
}

// Vue-функции, найденные в неймспейсе index.js (заполняется асинхронно)
const __vue = {};
let __vueP = null;
const __RE_OPEN_BLOCK   = /^function\s*[\w$]*\s*\(\s*[\w$]+\s*=\s*(?:!1|false)\s*\)\s*\{\s*[\w$]+\.push\(\s*[\w$]+\s*=\s*[\w$]+\s*\?\s*null\s*:\s*\[\s*\]\s*\)\s*;?\s*\}$/;
const __RE_CREATE_BLOCK = /^function\s*[\w$]*\s*\(\s*([\w$]+)\s*,\s*([\w$]+)\s*,\s*([\w$]+)\s*,\s*([\w$]+)\s*,\s*([\w$]+)\s*\)\s*\{\s*return\s+[\w$]+\(\s*[\w$]+\(\s*\1\s*,\s*\2\s*,\s*\3\s*,\s*\4\s*,\s*\5\s*,\s*(?:!0|true)\s*\)\s*\)\s*;?\s*\}$/;
const __RE_COMMENT_VN   = /^function\s*[\w$]*\s*\(\s*[\w$]+\s*=\s*(?:""|'')\s*,\s*[\w$]+\s*=\s*(?:!1|false)\s*\)\s*\{\s*return\s+[\w$]+\s*\?\s*\(\s*[\w$]+\(\s*\)\s*,\s*[\w$]+\(/;

function __ahkVueHelpers() {
    if (__vueP) return __vueP;
    __vueP = import("./index.js").then(function (ns) {
        const list = [];
        Object.keys(ns).forEach(function (k) {
            try { if (typeof ns[k] === "function") list.push(ns[k]); } catch (e) {}
        });
        const src = function (fn) {
            try { return Function.prototype.toString.call(fn); } catch (e) { return ""; }
        };
        const find = function (test, maxLen) {
            for (let i = 0; i < list.length; i++) {
                const s = src(list[i]);
                if (s.length <= maxLen && test(s, list[i])) return list[i];
            }
            return null;
        };
        const found = {
            defineAsyncComponent: find(function (s) { return s.indexOf("AsyncComponentWrapper") !== -1; }, 8000),
            openBlock:            find(function (s) { return __RE_OPEN_BLOCK.test(s); }, 250),
            createBlock:          find(function (s) { return __RE_CREATE_BLOCK.test(s); }, 250),
            createCommentVNode:   find(function (s, fn) {
                if (!__RE_COMMENT_VN.test(s)) return false;
                try { const v = fn("", false); return !!v && typeof v.type === "symbol"; } catch (e) { return false; }
            }, 300)
        };
        Object.keys(found).forEach(function (k) { if (found[k]) __vue[k] = found[k]; });
        console.log("[AHK] Vue-хелперы из index.js:", Object.keys(__vue).join(", ") || "не найдены");
        return __vue;
    }).catch(function (e) {
        console.warn("[AHK] не удалось импортировать ./index.js:", e);
        return __vue;
    });
    return __vueP;
}

// ── 1. Регистрация кастомных интерфейсов (список сформирован установщиком) ──
// files — файлы интерфейса и его зависимости; .css подключаются <link> при первом открытии.
const __AHK_IFACES = [
%%IFACES%%
];
const __AHK_SIDE_EFFECTS = [
%%SIDE_EFFECTS%%
];

function __ahkCssOf(def) {
    return (def.files || []).filter(function (f) { return /\.css(\?|$)/i.test(f); });
}
function __ahkAddCss(file) {
    try {
        const href = new URL(file, import.meta.url).href;
        const links = document.getElementsByTagName("link");
        for (let i = 0; i < links.length; i++) if (links[i].href === href) return;
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = href;
        l.onerror = function () { console.warn("[AHK] css не загрузился:", href); };
        document.head.appendChild(l);
    } catch (e) { console.warn("[AHK] addCss:", file, e); }
}

// Все реестры, из которых Vue ищет компонент по имени (Rt и его копии)
function __ahkRegistries(root) {
    const regs = [];
    const push = function (r) { if (r && typeof r === "object" && regs.indexOf(r) === -1) regs.push(r); };
    push(root.type && root.type.components);                 // = Rt
    push(root.components);                                   // merged-копия (если есть)
    push(root.appContext && root.appContext.components);     // глобальные
    return regs;
}

// Запасной путь (если defineAsyncComponent не нашёлся): подгружаем модуль
// прямо перед openInterface(name).
function __ahkEnsure(def, root) {
    if (!def.__p) {
        __ahkCssOf(def).forEach(__ahkAddCss);
        def.__p = def.load().then(function (mod) {
            const comp = (mod && mod.default) || mod;
            __ahkRegistries(root).forEach(function (r) { r[def.name] = comp; });
            def.__ready = true;
        });
    }
    return def.__p;
}
function __ahkInstallOpenGuard(root) {
    const orig = window.openInterface;
    if (typeof orig !== "function" || orig.__ahkGuard) return;
    const byName = {};
    __AHK_IFACES.forEach(function (d) { byName[d.name] = d; });
    const guard = function (name) {
        const def = byName[name], args = arguments, self = this;
        if (!def || def.__ready) return orig.apply(self, args);
        return __ahkEnsure(def, root).then(
            function () { return orig.apply(self, args); },
            function (e) { console.error("[AHK] не загрузился интерфейс " + name + ":", e); }
        );
    };
    guard.__ahkGuard = true;
    window.openInterface = guard;
}

async function __ahkRegisterInterfaces() {
    const app = await __ahkWaitFor(function () {
        return window.App && window.App.$ && window.App.components ? window.App : null;
    }, 60000, 50);
    if (!app) { console.error("[AHK] window.App не появился — интерфейсы не зарегистрированы"); return; }
    const root = app.$;
    const H = await __ahkVueHelpers();
    const lazy = typeof H.defineAsyncComponent === "function";

    __AHK_IFACES.forEach(function (def) {
        try {
            if (lazy) {
                const comp = H.defineAsyncComponent(function () {
                    __ahkCssOf(def).forEach(__ahkAddCss);
                    return def.load();
                });
                __ahkRegistries(root).forEach(function (r) { r[def.name] = comp; });
            }
            // конфиг ($t): app.components — реактивная обёртка над $t
            if (!app.components[def.name]) {
                app.components[def.name] = { open: { status: false }, show: true, options: Object.assign({}, def.options) };
            }
        } catch (e) { console.error("[AHK] регистрация интерфейса " + def.name + ":", e); }
    });
    if (!lazy) {
        console.warn("[AHK] defineAsyncComponent не найден — режим «грузить перед открытием»");
        __ahkInstallOpenGuard(root);
    }
    console.log("[AHK] ✅ интерфейсы зарегистрированы:", __AHK_IFACES.map(function (d) { return d.name; }).join(", "));
}

// side-effect модули (например ZkmScreenNotification — вешает window.*)
__AHK_SIDE_EFFECTS.forEach(function (se) {
    try {
        __ahkCssOf(se).forEach(__ahkAddCss);
        se.load().catch(function (e) { console.error("[AHK] side-effect импорт:", e); });
    } catch (e) { console.error("[AHK] side-effect импорт:", e); }
});

// Запускаем регистрацию интерфейсов (ждёт window.App)
__ahkRegisterInterfaces().catch(function (e) { console.error("[AHK] регистрация интерфейсов:", e); });
'''

# Патч компонента Hud (VoiceChat и пр.). Включается только если в загрузчике (LoadAhk.js)
# найден старый блок «HASSLE HUD COMPONENT PATCH» — его установщик вырезает и заменяет этим.
AHK_MODULE_HUD = r'''// ── 2. Патч компонента Hud (раньше использовал Oe/Ao/sr из index.js) ────
// ВАЖНО: запускается синхронно при загрузке модуля, чтобы успеть до создания Hud.
__ahkVueHelpers();
(function __hasComponentPatch() {
    console.log("[HAS-COMP] Инициализация компонентного патча...");

    import("./Hud.js").then(function (mod) {
        var Mu = mod && mod.default;
        if (!Mu || typeof Mu !== "object") {
            console.warn("[HAS-COMP] Mu не найден в Hud.js module");
            return;
        }

        // 1. Patch data() — добавляем __hassleForced
        if (typeof Mu.data === "function") {
            var __hasOrigData = Mu.data;
            Mu.data = function () {
                var s = __hasOrigData.apply(this, arguments);
                if (s && typeof s.__hassleForced === "undefined") s.__hassleForced = false;
                return s;
            };
            console.log("[HAS-COMP] ✅ data() обёрнут");
        }

        // 2. Patch computed.isHassleHud
        if (Mu.computed) {
            Mu.computed.isHassleHud = function () { return !!this.__hassleForced; };
            console.log("[HAS-COMP] ✅ computed.isHassleHud переопределён");
        }

        // 3. Replace Chat → RadmirChat
        if (Mu.components && Mu.components.RadmirChat) {
            var rc = Mu.components.RadmirChat;
            if (rc.props) {
                if (rc.props.isHudControls) rc.props.isHudControls.default = true;
                if (rc.props.canChatFadeout) rc.props.canChatFadeout.default = true;
                if (rc.props.useChatAnimation) rc.props.useChatAnimation.default = true;
            }
            Mu.components.Chat = rc;
            console.log("[HAS-COMP] ✅ Chat → RadmirChat");
        }

        // 4. Patch HudHassle.render — inject VoiceChat
        if (Mu.components && Mu.components.HudHassle && Mu.components.HudRadmir) {
            var hudHassle = Mu.components.HudHassle;
            var voiceChatComp = Mu.components.HudRadmir.components &&
                                Mu.components.HudRadmir.components.VoiceChat;

            if (voiceChatComp && typeof hudHassle.render === "function") {
                var __hasOrigHassleRender = hudHassle.render;
                hudHassle.render = function () {
                    var vnode = __hasOrigHassleRender.apply(this, arguments);
                    try {
                        // Vue-хелперы ищутся в index.js по исходнику (см. __ahkVueHelpers)
                        var ob = __vue.openBlock, cb = __vue.createBlock, cc = __vue.createCommentVNode;
                        if (!(ob && cb && cc)) return vnode;
                        var props = arguments[2] || {};
                        var dataObj = props.data;
                        if (vnode && Array.isArray(vnode.children)) {
                            var showVoice = !!(dataObj && dataObj.useChat &&
                                              dataObj.voiceChat && dataObj.voiceChat.show);
                            var vcNode;
                            if (showVoice) {
                                var cfs = (window.App && window.App.chatFontSize) || 0;
                                var cps = (window.App && window.App.chatPageSize) || 1;
                                var chpx = (window.App && typeof window.App.vhToPx === "function")
                                    ? window.App.vhToPx(2.22 + 0.15 * cfs) * cps : 0;
                                ob();
                                vcNode = cb(voiceChatComp, {
                                    key: 0,
                                    entries: dataObj.voiceChat.entries,
                                    chatHeightPx: chpx,
                                    isHudControls: dataObj.isHudControls,
                                    isShowButtons: dataObj.voiceChat.showButtons,
                                    isTransparent: window.isOpenedChat ? window.isOpenedChat() : false
                                }, null, 8, ["entries", "chatHeightPx", "isHudControls", "isShowButtons", "isTransparent"]);
                            } else {
                                vcNode = cc("", true);
                            }
                            vnode.children.push(vcNode);
                            if (Array.isArray(vnode.dynamicChildren)) vnode.dynamicChildren.push(vcNode);
                        }
                    } catch (err) { console.warn("[HAS-COMP] VoiceChat inject error:", err); }
                    return vnode;
                };
                console.log("[HAS-COMP] ✅ HudHassle.render — VoiceChat injected");
            } else {
                console.warn("[HAS-COMP] ⚠️ VoiceChat недоступен:", { vc: !!voiceChatComp });
            }
        }

        // 5. Patch Hud.render — fix chat fragment key
        if (typeof Mu.render === "function") {
            var FRAGMENT_SYM = Symbol.for("v-fgt");
            var __hasOrigHudRender = Mu.render;
            Mu.render = function () {
                var vnode = __hasOrigHudRender.apply(this, arguments);
                try {
                    (function fixKey(vn) {
                        if (!vn) return;
                        if (vn.type === FRAGMENT_SYM && (vn.key === 2 || vn.key === 3)) {
                            if (vn.children && vn.children.length > 0) {
                                for (var i = 0; i < vn.children.length; i++) {
                                    var ch = vn.children[i];
                                    if (ch && ch.props && ch.props.ref === "chat") {
                                        vn.key = "__has_chat_fixed__";
                                        break;
                                    }
                                }
                            }
                        }
                        if (vn.children && Array.isArray(vn.children)) {
                            for (var j = 0; j < vn.children.length; j++) fixKey(vn.children[j]);
                        }
                    })(vnode);
                } catch (err) { console.warn("[HAS-COMP] fixChatFragmentKey error:", err); }
                return vnode;
            };
            console.log("[HAS-COMP] ✅ Hud.render — fragment key fixed");
        }

        console.log("[HAS-COMP] ✅ Все компонентные патчи применены");
    }).catch(function (err) {
        console.warn("[HAS-COMP] ❌ Не удалось загрузить Hud.js:", err);
    });
})();
'''

AHK_HTML_MARK_S = "<!-- HASSLE LOAD BOT START -->"
AHK_HTML_MARK_E = "<!-- HASSLE LOAD BOT END -->"
AHK_HTML_TAG    = '<script type="module" crossorigin src="./assets/ahk.js"></script>'
AHK_HUD_PATCH_S = "// === HASSLE HUD COMPONENT PATCH"
AHK_HUD_PATCH_E = "// === END HASSLE HUD COMPONENT PATCH ==="


def _intload_url(department: str) -> str:
    if department == 'fsb':   return FSB_INTLOAD_URL
    if department == 'fsin':  return FSIN_INTLOAD_URL
    if department == 'pravo': return PRAVO_INTLOAD_URL
    return MVD_INTLOAD_URL


def _deploy_ui_url(department: str) -> str:
    if department == 'fsb':
        custom_url, loaders_url = FSB_CUSTOM_UI_URL, FSB_LOADERS_URL
    elif department == 'fsin':
        custom_url, loaders_url = FSIN_CUSTOM_UI_URL, FSIN_LOADERS_URL
    elif department == 'pravo':
        custom_url, loaders_url = PRAVO_CUSTOM_UI_URL, PRAVO_LOADERS_URL
    else:
        custom_url, loaders_url = MVD_CUSTOM_UI_URL, MVD_LOADERS_URL
    return loaders_url if USE_LOADERS else custom_url

NATIVE_INTERFACE_NAMES = {
    "ScreenNotification", "Menu", "Hud", "Dialog", "InventoryNew",
    "Console", "BattlePassWelcome", "BlackMarket", "FullScreenPreloader",
}

_ICON_PATH = globals().get("_ICON_PATH", "")


# ═══════════════════════════════════════════════════════
#  АВТОРИЗАЦИЯ (перенесено из launcher.py)
# ═══════════════════════════════════════════════════════

def resource_path(rel):
    base = getattr(sys, '_MEIPASS', os.path.abspath('.'))
    return os.path.join(base, rel)


def get_hwid() -> str:
    try:
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE,
                             r"SOFTWARE\Microsoft\Cryptography")
        guid, _ = winreg.QueryValueEx(key, "MachineGuid")
        winreg.CloseKey(key)
    except Exception:
        import uuid
        guid = str(uuid.getnode())
    return hashlib.sha256(guid.encode()).hexdigest()[:16].upper()


def _extract_hwids(data) -> set:
    """Достаёт множество HWID из hwid.json. Поддерживаются форматы:
         {"HWID1": "ник", "HWID2": ""}   — ключ = HWID (ровно та строка, что показывает окно «Нет доступа»)
         ["HWID1", "HWID2"]              — простой список
         {"hwids": ["HWID1", ...]}       — список/словарь внутри ключа hwids / keys / hwid
       Регистр и пробелы по краям не важны."""
    found = set()
    if isinstance(data, dict):
        for k in ("hwids", "keys", "hwid"):
            if isinstance(data.get(k), (list, dict)):
                return _extract_hwids(data[k])
        found.update(str(k) for k in data.keys())
    elif isinstance(data, list):
        for it in data:
            if isinstance(it, str):
                found.add(it)
            elif isinstance(it, dict) and it.get("hwid"):
                found.add(str(it["hwid"]))
    return {s.strip().upper() for s in found if s and s.strip()}


def is_authorized(hwid: str) -> bool:
    """Скачивает installerEXE/hwid.json и проверяет, есть ли в нём HWID этого ПК.
    True/False — результат проверки. Любая ошибка (сеть, HTTP, битый JSON) пробрасывается
    наверх: run_auth_with_ui повторит попытку, а после всех попыток покажет «Нет подключения»
    — то есть при сбое доступ НЕ выдаётся."""
    resp = requests.get(
        HWID_URL,
        params={"_": int(time.time())},            # обход кэша raw.githubusercontent.com
        headers={"Cache-Control": "no-cache"},
        timeout=10,
    )
    resp.raise_for_status()
    data = json.loads(resp.content.decode("utf-8-sig"))   # utf-8-sig — на случай BOM из Блокнота
    return hwid.strip().upper() in _extract_hwids(data)


def get_icon_b64() -> str:
    try:
        img = Image.open(resource_path("icon.ico")).convert("RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


def run_auth_with_ui(hwid: str) -> dict:
    """Окно «Проверка лицензии» + проверка HWID по hwid.json (с повторами при сбоях сети).
    Возвращает {"authorized": bool, "failed": bool, "done": bool}:
      failed=True — все попытки закончились ошибкой (нет сети / hwid.json недоступен);
      done=False  — окно закрыли, не дождавшись конца проверки."""
    result = {"authorized": False, "failed": False, "done": False}
    ready_event = threading.Event()
    window_ref = [None]

    html = """<!DOCTYPE html><html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;1,700&family=Open+Sans+Condensed:ital,wght@0,700;1,700&display=swap' rel='stylesheet'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#010106;--border:rgba(255,255,255,.06);
  --text:#fff;--text3:rgba(255,255,255,.36);
  --accent-grad:linear-gradient(168deg,#f9b701 -73.4%,#fda02f 58.52%,#ff9446 126.58%);
  --accent2:#f9b701;--danger:#e25544;
  --font:'Open Sans',sans-serif;--font-head:'Open Sans Condensed','Open Sans',sans-serif;
}
html,body{width:100%;height:100%;overflow:hidden}
body{font-family:var(--font);color:var(--text);background:var(--bg);display:flex;
  user-select:none;-webkit-app-region:drag}
.window{
  width:100%;height:100%;
  background:radial-gradient(60% 50% at 14% -6%,rgba(249,183,1,.10),transparent 60%),var(--bg);
  border:1px solid #1a1a1e;border-radius:10px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:26px
}
.logo-row{display:flex;align-items:center;gap:10px}
.logo-ico{width:40px;height:40px;border-radius:9px;flex-shrink:0;background:var(--accent-grad);
  box-shadow:0 4px 14px rgba(253,160,47,.35),inset 0 1px 0 rgba(255,255,255,.3);
  display:flex;align-items:center;justify-content:center}
.logo-ico svg{width:20px;height:20px;fill:#1a1106}
.logo-txt{font-family:var(--font-head);font-size:14px;font-weight:700;font-style:italic;
  text-transform:uppercase;letter-spacing:.02em;line-height:1.2}
.logo-txt span{display:block;font-family:var(--font);font-size:9px;font-weight:400;font-style:normal;
  color:var(--text3);letter-spacing:.14em;margin-top:2px}
.spin{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.1);
  border-top-color:var(--accent2);animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
#status{font-size:11px;color:var(--text3);text-align:center;line-height:1.6;max-width:300px;transition:color .2s}
#status.err{color:var(--danger)}
</style></head><body>
<div class="window">
  <div class="logo-row">
    <div class="logo-ico"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 1.5L3.8 13.6h6.1L8.4 22.5l11.8-13.6h-6.9L13 1.5z"/></svg></div>
    <div class="logo-txt">AHK Installer<span>Проверка доступа</span></div>
  </div>
  <div class="spin"></div>
  <div id="status">Проверка лицензии...</div>
</div>
<script>
function setStatus(txt, err){
  var s = document.getElementById('status');
  s.textContent = txt;
  s.className = err ? 'err' : '';
}
</script></body></html>"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()

    def _auth_loop():
        ready_event.wait(timeout=6)
        w = window_ref[0]

        def js(txt, err=False):
            try:
                flag = "true" if err else "false"
                if w:
                    w.evaluate_js(f"setStatus({json.dumps(txt, ensure_ascii=False)}, {flag})")
            except Exception:
                pass

        for attempt in range(1, RETRY_COUNT + 1):
            js(f"Проверка лицензии... (попытка {attempt} из {RETRY_COUNT})")
            try:
                result["authorized"] = bool(is_authorized(hwid))
                result["failed"] = False
                break
            except Exception as e:
                _log_to_file(f"is_authorized: попытка {attempt}/{RETRY_COUNT} не удалась: {e!r}")
                if attempt < RETRY_COUNT:
                    for sec in range(RETRY_DELAY, 0, -1):
                        js(f"Нет подключения. Повтор через {sec} сек... ({attempt}/{RETRY_COUNT})", err=True)
                        time.sleep(1)
                else:
                    result["failed"] = True

        result["done"] = True
        try:
            if w: w.destroy()
        except Exception:
            pass

    auth_thread = threading.Thread(target=_auth_loop, daemon=True)
    auth_thread.start()

    w = webview.create_window(
        'AHK Installer',
        f"file:///{tmp.name.replace(os.sep, '/')}",
        width=380, height=280,
        frameless=True, background_color='#010106'
    )
    window_ref[0] = w
    w.events.loaded += ready_event.set

    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass

    return result


def show_denied_window(hwid: str):
    keys_line = f'"{hwid}": ""'

    html = f"""<!DOCTYPE html><html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,700&family=Open+Sans+Condensed:ital,wght@0,700;1,700&display=swap' rel='stylesheet'>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
:root{{
  --bg:#010106;
  --border:rgba(255,255,255,.06);
  --text:#fff;--text2:rgba(255,255,255,.6);--text3:rgba(255,255,255,.36);
  --accent-grad:linear-gradient(168deg,#f9b701 -73.4%,#fda02f 58.52%,#ff9446 126.58%);
  --accent2:#f9b701;--accent3:#ff9446;
  --danger:#e25544;--danger-dim:rgba(226,85,68,.12);
  --font:'Open Sans',sans-serif;--font-head:'Open Sans Condensed','Open Sans',sans-serif;--mono:'JetBrains Mono',monospace;
}}
html,body{{width:100%;height:100%;overflow:hidden}}
body{{font-family:var(--font);color:var(--text);background:var(--bg);font-size:13px;
  display:flex;align-items:stretch;justify-content:stretch;
  user-select:none;-webkit-app-region:drag}}
.window{{
  width:100%;height:100%;
  background:
    radial-gradient(60% 50% at 14% -6%,rgba(249,183,1,.10),transparent 60%),
    radial-gradient(50% 40% at 100% 105%,rgba(226,85,68,.06),transparent 65%),
    var(--bg);
  border:1px solid #1a1a1e;border-radius:10px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;padding:26px;
  position:relative;overflow:hidden;-webkit-app-region:no-drag
}}
.win-close{{position:absolute;top:13px;right:13px;width:22px;height:22px;border-radius:6px;
  background:transparent;border:none;cursor:pointer;opacity:.4;
  display:flex;align-items:center;justify-content:center;transition:.2s;
  -webkit-app-region:no-drag}}
.win-close:hover{{background:var(--danger);opacity:1}}
.win-close svg{{width:8px;height:8px;stroke:#fff;stroke-width:2;fill:none;stroke-linecap:round}}
.logo-row{{display:flex;align-items:center;gap:10px}}
.logo-ico{{
  width:40px;height:40px;border-radius:9px;flex-shrink:0;
  background:var(--accent-grad);
  box-shadow:0 4px 14px rgba(253,160,47,.35),inset 0 1px 0 rgba(255,255,255,.3);
  display:flex;align-items:center;justify-content:center
}}
.logo-ico svg{{width:20px;height:20px;fill:#1a1106}}
.logo-txt{{font-family:var(--font-head);font-size:14px;font-weight:700;font-style:italic;
  color:var(--text);text-transform:uppercase;letter-spacing:.02em;line-height:1.2}}
.logo-txt span{{display:block;font-family:var(--font);font-size:9px;font-weight:400;font-style:normal;
  color:var(--text3);letter-spacing:.14em;text-transform:uppercase;margin-top:2px}}
.icon-wrap{{width:44px;height:44px;border-radius:11px;background:var(--danger-dim);
  border:1px solid rgba(226,85,68,.28);display:flex;align-items:center;
  justify-content:center;margin-top:2px}}
.icon-wrap svg{{width:20px;height:20px;stroke:var(--danger);stroke-width:1.8;fill:none;
  stroke-linecap:round;stroke-linejoin:round}}
h2{{font-family:var(--font-head);font-size:15px;font-weight:700;font-style:italic;
  color:var(--text);text-transform:uppercase;letter-spacing:.02em;text-align:center}}
.sub{{font-size:11px;color:var(--text3);text-align:center;line-height:1.65;max-width:280px}}
.field-label{{font-size:9px;color:var(--text3);text-transform:uppercase;
  letter-spacing:.08em;align-self:center}}
.copy-box{{
  width:100%;max-width:280px;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);border-radius:8px;
  padding:10px 14px 26px;
  font-family:var(--mono);font-size:11px;
  color:var(--accent2);cursor:pointer;word-break:break-all;
  transition:.2s ease;position:relative;-webkit-app-region:no-drag
}}
.copy-box:hover{{background:rgba(249,183,1,.08);border-color:rgba(249,183,1,.3)}}
.copy-hint{{position:absolute;bottom:8px;right:12px;font-size:9px;
  color:var(--text3);font-family:var(--font);letter-spacing:.04em;
  transition:color .2s;pointer-events:none}}
.divider{{width:100%;max-width:280px;height:1px;background:var(--border)}}
.tg-row{{display:flex;align-items:center;gap:6px;justify-content:center}}
.tg-lbl{{font-size:11px;color:var(--text3)}}
.tg-link{{font-size:11px;color:var(--accent2);font-weight:600;text-decoration:none;
  -webkit-app-region:no-drag;transition:color .15s}}
.tg-link:hover{{color:var(--accent3)}}
.btn{{width:100%;max-width:280px;height:36px;border:1px solid var(--border);border-radius:8px;
  cursor:pointer;font-family:var(--font-head);font-size:12px;font-weight:700;font-style:italic;
  text-transform:uppercase;letter-spacing:.02em;
  background:rgba(255,255,255,.06);color:var(--text);transition:background .15s;
  -webkit-app-region:no-drag}}
.btn:hover{{background:rgba(255,255,255,.12)}}
.btn:active{{transform:scale(.98)}}
</style></head><body>
<div class="window">
  <button class="win-close" onclick="window.pywebview&&pywebview.api?pywebview.api.close_app():window.close()">
    <svg viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/></svg>
  </button>
  <div class="logo-row">
    <div class="logo-ico">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 1.5L3.8 13.6h6.1L8.4 22.5l11.8-13.6h-6.9L13 1.5z"/></svg>
    </div>
    <div class="logo-txt">AHK Installer<span>Доступ</span></div>
  </div>
  <div class="icon-wrap">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>
  <h2>Нет доступа</h2>
  <p class="sub">Ваш ПК не авторизован.<br>Отправьте строку ниже создателю для получения доступа.</p>
  <span class="field-label">Скопируйте и отправьте создателю</span>
  <div class="copy-box" onclick="copyKeys()">
    {keys_line},
    <span class="copy-hint" id="badge">нажмите чтобы скопировать</span>
  </div>
  <div class="divider"></div>
  <div class="tg-row">
    <span class="tg-lbl">Написать создателю:</span>
    <a class="tg-link" href="#"
       onclick="window.pywebview&&pywebview.api&&pywebview.api.open_url('https://t.me/ZaharKonst');return false;">
      @ZaharKonst
    </a>
  </div>
  <button class="btn" onclick="window.pywebview&&pywebview.api?pywebview.api.close_app():window.close()">Закрыть</button>
</div>
<script>
var _txt = `{keys_line},`;
function copyKeys(){{
  if(navigator.clipboard){{
    navigator.clipboard.writeText(_txt);
    var b=document.getElementById('badge');
    b.textContent='скопировано \\u2713';b.style.color='#3dba7a';
    setTimeout(function(){{b.textContent='нажмите чтобы скопировать';b.style.color='';}},2000);
  }}
}}
</script></body></html>"""

    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()

    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
        def open_url(self, url):
            import webbrowser; webbrowser.open(url)

    api = _Q()
    w = webview.create_window('AHK Installer',
        f"file:///{tmp.name.replace(os.sep, '/')}",
        js_api=api, width=460, height=470,
        frameless=True, background_color='#010106')
    api._window = w
    ico = resource_path("icon.ico")
    try: webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError: webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass


def show_no_internet_window():
    html = """<!DOCTYPE html><html><head><meta charset='UTF-8'>
<link href='https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;1,700&family=Open+Sans+Condensed:ital,wght@0,700;1,700&display=swap' rel='stylesheet'>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#010106;--border:rgba(255,255,255,.06);
  --text:#fff;--text3:rgba(255,255,255,.36);
  --danger:#e25544;--danger-dim:rgba(226,85,68,.12);
  --font:'Open Sans',sans-serif;--font-head:'Open Sans Condensed','Open Sans',sans-serif;
}
html,body{width:100%;height:100%;overflow:hidden}
body{font-family:var(--font);color:var(--text);background:var(--bg);
  display:flex;align-items:stretch;justify-content:stretch;
  user-select:none;-webkit-app-region:drag}
.window{
  width:100%;height:100%;
  background:radial-gradient(60% 60% at 50% -10%,rgba(226,85,68,.08),transparent 65%),var(--bg);
  border:1px solid #1a1a1e;border-radius:10px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:10px;padding:24px;-webkit-app-region:no-drag
}
.icon-wrap{width:40px;height:40px;border-radius:10px;background:var(--danger-dim);
  border:1px solid rgba(226,85,68,.28);display:flex;align-items:center;
  justify-content:center;margin-bottom:4px}
.icon-wrap svg{width:18px;height:18px;stroke:var(--danger);stroke-width:1.8;fill:none;
  stroke-linecap:round;stroke-linejoin:round}
h2{font-family:var(--font-head);font-size:14px;font-weight:700;font-style:italic;
  color:var(--text);text-transform:uppercase;letter-spacing:.02em}
p{font-size:11px;color:var(--text3);text-align:center}
button{margin-top:6px;padding:0 20px;height:34px;background:rgba(255,255,255,.06);
  border:1px solid var(--border);color:#fff;border-radius:8px;cursor:pointer;
  font-family:var(--font-head);font-size:12px;font-weight:700;font-style:italic;
  text-transform:uppercase;letter-spacing:.02em;transition:background .15s;
  -webkit-app-region:no-drag}
button:hover{background:rgba(255,255,255,.12)}
</style></head><body>
<div class="window">
  <div class="icon-wrap">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  </div>
  <h2>Нет подключения</h2>
  <p>Не удалось подключиться после нескольких попыток</p>
  <button onclick="window.pywebview.api.close_app()">Закрыть</button>
</div>
</body></html>"""
    tmp = tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8')
    tmp.write(html); tmp.close()
    
    class _Q:
        def __init__(self): self._window = None
        def close_app(self):
            if self._window: self._window.destroy()
    
    api = _Q()
    w = webview.create_window('AHK Installer',
        f"file:///{tmp.name.replace(os.sep,'/')}",
        js_api=api, width=380, height=220,
        frameless=True, background_color='#010106')
    api._window = w
    ico = resource_path("icon.ico")
    try: webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError: webview.start(debug=False)
    try: os.unlink(tmp.name)
    except: pass


# ═══════════════════════════════════════════════════════
#  ЛОГИКА УСТАНОВЩИКА
# ═══════════════════════════════════════════════════════

_OLD_APPDATA_FOLDER = 'AHK_MVD'
_NEW_APPDATA_FOLDER = 'AHK_KONST'
_migration_done = False


def _migrate_old_appdata_folder():
    """Один раз переносит содержимое старой папки AHK_MVD в AHK_KONST
    (settings.json, install_log.txt и т.д.), не перезаписывая уже
    существующие в AHK_KONST файлы."""
    global _migration_done
    if _migration_done:
        return
    _migration_done = True
    try:
        import shutil
        appdata = os.environ.get('APPDATA') or os.path.expanduser('~')
        old_folder = Path(appdata) / _OLD_APPDATA_FOLDER
        new_folder = Path(appdata) / _NEW_APPDATA_FOLDER
        if old_folder == new_folder or not old_folder.exists():
            return
        new_folder.mkdir(parents=True, exist_ok=True)
        for item in old_folder.iterdir():
            dest = new_folder / item.name
            if dest.exists():
                continue
            try:
                if item.is_file():
                    shutil.copy2(item, dest)
                elif item.is_dir():
                    shutil.copytree(item, dest)
            except Exception:
                pass
        try:
            shutil.rmtree(old_folder)
        except Exception:
            pass
    except Exception:
        pass


def _log_to_file(msg: str):
    try:
        from datetime import datetime
        _migrate_old_appdata_folder()
        appdata = os.environ.get('APPDATA') or os.path.expanduser('~')
        folder = Path(appdata) / _NEW_APPDATA_FOLDER
        folder.mkdir(parents=True, exist_ok=True)
        with open(folder / 'install_log.txt', 'a', encoding='utf-8') as f:
            f.write(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] {msg}\n')
    except Exception:
        pass


def _settings_path() -> Path:
    _migrate_old_appdata_folder()
    appdata = os.environ.get('APPDATA') or os.path.expanduser('~')
    folder = Path(appdata) / _NEW_APPDATA_FOLDER
    folder.mkdir(parents=True, exist_ok=True)
    return folder / 'settings.json'


def load_settings() -> dict:
    try:
        p = _settings_path()
        if p.exists():
            return json.loads(p.read_text(encoding='utf-8'))
    except Exception:
        pass
    return {}


def save_settings(data: dict):
    try:
        p = _settings_path()
        current = {}
        if p.exists():
            try:
                current = json.loads(p.read_text(encoding='utf-8'))
            except Exception:
                pass
        current.update(data)
        p.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding='utf-8')
    except Exception:
        pass


def fetch_html() -> str:
    resp = requests.get(f"{GITHUB_RAW}/index.html", timeout=15)
    resp.raise_for_status()
    html = resp.text

    # Кладём index.html в отдельную temp-папку (а не файл со случайным именем),
    # чтобы рядом с ним лежал index.css и относительная ссылка
    # <link rel="stylesheet" href="index.css"> корректно резолвилась через file://
    tmp_dir = tempfile.mkdtemp(prefix="ahk_installer_ui_")
    html_path = os.path.join(tmp_dir, "index.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    try:
        css_resp = requests.get(f"{GITHUB_RAW}/index.css", timeout=15)
        css_resp.raise_for_status()
        css_path = os.path.join(tmp_dir, "index.css")
        with open(css_path, "w", encoding="utf-8") as f:
            f.write(css_resp.text)
    except Exception:
        # Если index.css не найден/не загрузился — не валим установщик,
        # окно просто откроется без стилей
        pass

    # Оригинальные CSS игры кладём рядом с index.html (подключаются внутри окна «Бинды»).
    # Сначала папка «AHK konst/Установщик», запасной вариант — та же папка, что и index.html.
    for name in GAME_UI_FILES:
        for base in (GAME_UI_RAW, GITHUB_RAW):
            try:
                r = requests.get(f"{base}/{name}", timeout=15)
                r.raise_for_status()
                with open(os.path.join(tmp_dir, name), "wb") as f:
                    f.write(r.content)
                break
            except Exception:
                continue

    return html_path


# ═══════════════════════════════════════════════════════
#  АВТО-СЧИТЫВАНИЕ ПУНКТОВ МЕНЮ ИЗ СКРИПТА СТРУКТУРЫ
#  (pravo.js и т.п.) — единый источник правды для биндов,
#  скрытия, порядка и таймера после отыгровок
# ═══════════════════════════════════════════════════════
import re as _re
from urllib.parse import quote as _quote

_MENU_CACHE: dict = {}

def _strip_js_line_comments(text: str) -> str:
    """Убирает // комментарии (только когда // не внутри строки в кавычках)."""
    out = []
    for line in text.split('\n'):
        in_str, quote_ch, i = False, '', 0
        while i < len(line):
            ch = line[i]
            if in_str:
                if ch == '\\':
                    i += 2
                    continue
                if ch == quote_ch:
                    in_str = False
            else:
                if ch in ('"', "'", '`'):
                    in_str, quote_ch = True, ch
                elif ch == '/' and line[i:i + 2] == '//':
                    line = line[:i]
                    break
            i += 1
        out.append(line)
    return '\n'.join(out)

def _split_top_level_objects(body: str) -> list:
    """Возвращает тела {...}-объектов верхнего уровня; вложенные {} и строки учитываются."""
    objs, depth, start, in_str, quote_ch, i = [], 0, None, False, '', 0
    while i < len(body):
        ch = body[i]
        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == quote_ch:
                in_str = False
        else:
            if ch in ('"', "'", '`'):
                in_str, quote_ch = True, ch
            elif ch == '{':
                if depth == 0:
                    start = i + 1
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0 and start is not None:
                    objs.append(body[start:i])
                    start = None
        i += 1
    return objs

def _array_body(js_text: str, var_name: str):
    """
    Тело JS-массива `const <var_name> = [ ... ]` без комментариев (// и /* */).
    Сканер учитывает строки и вложенные [], так что скобки внутри названий не мешают.
    None — если массива с таким именем нет.
    """
    m = _re.search(r'(?:const|let|var)\s+' + _re.escape(var_name) + r'\s*=\s*\[', js_text)
    if not m:
        return None
    n, i, depth, out = len(js_text), m.end(), 1, []
    while i < n:
        ch = js_text[i]
        two = js_text[i:i + 2]
        if two == '//':
            j = js_text.find('\n', i)
            i = n if j < 0 else j
            continue
        if two == '/*':
            j = js_text.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if ch in ('"', "'", '`'):
            q = ch
            out.append(ch)
            i += 1
            while i < n:
                c2 = js_text[i]
                out.append(c2)
                i += 1
                if c2 == '\\' and i < n:
                    out.append(js_text[i])
                    i += 1
                elif c2 == q:
                    break
            continue
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                break
        out.append(ch)
        i += 1
    return ''.join(out)

def _strip_numbering(name: str) -> str:
    """'1. Приветствие' -> 'Приветствие' (порядок и так задаётся списком)."""
    return _re.sub(r'^\s*\d+\s*[.)]\s*', '', name).strip()

def parse_povsednev_options(js_text: str) -> list:
    """
    Достаёт массив povsednevOptions из текста pravo.js и возвращает
    [{'action': 'greeting', 'name': 'Приветствие', 'needs_id': True}, ...]
    в том порядке, в котором они объявлены в скрипте.
    """
    body = _array_body(js_text, 'povsednevOptions')
    if body is None:
        return []
    items = []
    for chunk in _split_top_level_objects(body):
        a = _re.search(r'action\s*:\s*(["\'])(.+?)\1', chunk)
        if not a:
            continue
        n = _re.search(r'name\s*:\s*(["\'])(.+?)\1', chunk)
        nid = _re.search(r'needsId\s*:\s*(true|false)', chunk)
        items.append({
            'action': a.group(2),
            'name': _strip_numbering(n.group(2) if n else a.group(2)),
            'needs_id': bool(nid and nid.group(1) == 'true'),
        })
    return items

def parse_main_menu_options(js_text: str) -> list:
    """Пункты главного меню из реестра mainMenuOptions: [{'action','name'}, ...]."""
    body = _array_body(js_text, 'mainMenuOptions')
    if body is None:
        return []
    items = []
    for chunk in _split_top_level_objects(body):
        a = _re.search(r'action\s*:\s*(["\'])(.+?)\1', chunk)
        if not a:
            continue
        n = _re.search(r'name\s*:\s*(["\'])(.+?)\1', chunk)
        items.append({'action': a.group(2), 'name': _strip_numbering(n.group(2) if n else a.group(2))})
    return items

def parse_license_types(js_text: str) -> list:
    """Типы лицензий из _GIVE_LIC_TYPES: [{'type': 1, 'name': 'Права'}, ...]."""
    body = _array_body(js_text, '_GIVE_LIC_TYPES')
    if body is None:
        return []
    items = []
    for chunk in _split_top_level_objects(body):
        t = _re.search(r'\btype\s*:\s*(\d+)', chunk)
        n = _re.search(r'name\s*:\s*(["\'])(.+?)\1', chunk)
        if t and n:
            items.append({'type': int(t.group(1)), 'name': n.group(2).strip()})
    return items

def parse_menu_groups(js_text: str) -> list:
    """
    Всё меню скрипта по разделам (пустые разделы пропускаются):
      main      — главное меню «ПРАВИТЕЛЬСТВО»  (mainMenuOptions)
      povsednev — меню «Повседневная»           (povsednevOptions; только у него работает таймер /c 60)
      lic       — выдача конкретной лицензии    (_GIVE_LIC_TYPES; action = 'lic_<тип>')
    Каждый пункт: {'action', 'name', 'needs_id', 'timer'}.
    """
    groups = []
    main = [{'action': it['action'], 'name': it['name'], 'needs_id': False, 'timer': False}
            for it in parse_main_menu_options(js_text)]
    if main:
        groups.append({'id': 'main', 'title': 'Главное меню', 'items': main})
    pov = [{'action': it['action'], 'name': it['name'], 'needs_id': it['needs_id'], 'timer': True}
           for it in parse_povsednev_options(js_text)]
    if pov:
        groups.append({'id': 'povsednev', 'title': 'Повседневная', 'items': pov})
    lic = [{'action': 'lic_%d' % it['type'], 'name': 'Выдать: ' + it['name'], 'needs_id': True, 'timer': False}
           for it in parse_license_types(js_text)]
    if lic:
        groups.append({'id': 'lic', 'title': 'Выдача лицензии', 'items': lic})
    return groups

def parse_loader_target(loader_text: str):
    """Из LoadXxx.js берёт папку и имя основного скрипта (const folder / const filename)."""
    f = _re.search(r"const\s+folder\s*=\s*['\"]([^'\"]+)['\"]", loader_text)
    n = _re.search(r"const\s+filename\s*=\s*['\"]([^'\"]+)['\"]", loader_text)
    return (f.group(1) if f else '', n.group(1) if n else '')


class InstallerAPI:
    def __init__(self):
        self._saved = load_settings()
        saved_path = self._saved.get('radmir_path', '')
        if saved_path and Path(saved_path).exists():
            p = Path(saved_path)
            if (p / 'uiresources').exists() and (p / 'models').exists():
                self.radmir_path = p
            else:
                self.radmir_path = None
        else:
            self.radmir_path = None
        self._window = None

    def _set_status(self, eid, text, cls):
        if self._window:
            self._window.evaluate_js(
                f'document.getElementById("{eid}").textContent="{text}";'
                f'document.getElementById("{eid}").className="{cls}";'
            )

    def _notify(self, ok: bool):
        if self._window:
            self._window.evaluate_js(f'setGlobalStatus("{"ok" if ok else "err"}")')

    def _check_dirs(self):
        if not self.radmir_path: return False
        return ((self.radmir_path / "uiresources").exists() and
                (self.radmir_path / "models").exists())

    @staticmethod
    def _obfuscate(code):
        nl = chr(10)
        code = '(function(){' + nl + code + nl + '})();'
        codes = [ord(c) for c in code]
        n = len(codes)
        p1, p2, p3 = codes[:n//3], codes[n//3:(n*2)//3], codes[(n*2)//3:]
        def rnd(): return '_0x'+''.join(random.choices(string.ascii_letters+string.digits, k=6))
        v1,v2,v3,v4,v6 = rnd(),rnd(),rnd(),rnd(),rnd()
        # Direct eval — видит переменные модуля index.js (Oe, Ao, sr, Mu и т.д.)
        return (f"(function(){{const {v1}=[{','.join(map(str,p1))}];"
                f"const {v2}=[{','.join(map(str,p2))}];"
                f"const {v3}=[{','.join(map(str,p3))}];"
                f"const {v4}=[...{v1},...{v2},...{v3}];"
                f"return eval("
                f"{v4}.map(function({v6}){{return String.fromCharCode({v6})}}).join(''))}})();")
                
    _MARK_S = "//\u200b\u200c\u200b"
    _MARK_E = "//\u200c\u200b\u200c"
    _LEGACY_S = "// === HASSLE LOAD BOT CODE START ==="
    _LEGACY_E = "// === HASSLE LOAD BOT CODE END ==="

    @classmethod
    def _has_code(cls, content: str) -> bool:
        return (cls._MARK_S in content) or (cls._LEGACY_S in content)

    @classmethod
    def _remove_markers(cls, content: str) -> str:
        for S, E in [(cls._MARK_S, cls._MARK_E), (cls._LEGACY_S, cls._LEGACY_E)]:
            si = content.find(S)
            if si != -1:
                ei = content.find(E, si + len(S))
                if ei != -1:
                    content = content[:si] + content[ei + len(E):]
                    break
        return content.rstrip() + '\n'

    def _index_js(self):
        if not self.radmir_path:
            return None
        p = self.radmir_path / "uiresources" / "assets" / "Index.js"
        return p if p.exists() else None

    # ── ahk.js + index.html ─────────────────────────────────────────────────
    def _index_html(self):
        if not self.radmir_path:
            return None
        p = self.radmir_path / "uiresources" / "index.html"
        return p if p.exists() else None

    @staticmethod
    def _read_keep_nl(p):
        with open(p, 'r', encoding='utf-8', newline='') as f:
            return f.read()

    def _ahk_js_path(self):
        if not self.radmir_path:
            return None
        return self.radmir_path / "uiresources" / "assets" / "ahk.js"

    @staticmethod
    def _html_remove_block(html: str) -> str:
        pat = re.compile(r'[ \t]*' + re.escape(AHK_HTML_MARK_S) + r'.*?' + re.escape(AHK_HTML_MARK_E) + r'[ \t]*(?:\r?\n)?', re.S)
        return pat.sub('', html)

    @staticmethod
    def _html_has_block(html: str) -> bool:
        return AHK_HTML_MARK_S in html and 'assets/ahk.js' in html

    @classmethod
    def _html_add_block(cls, html: str) -> str:
        """Прописывает ahk.js в index.html ПОСЛЕ скрипта index.js (иначе модуль выполнится раньше игры)."""
        html = cls._html_remove_block(html)
        nl = '\r\n' if '\r\n' in html else '\n'
        block = f'    {AHK_HTML_MARK_S}{nl}    {AHK_HTML_TAG}{nl}    {AHK_HTML_MARK_E}{nl}'
        m_head = re.search(r'</head\s*>', html, re.I)
        if not m_head:
            raise ValueError("В index.html не найден тег </head>")
        pos = m_head.start()
        m_idx = re.search(r'<script[^>]*\bsrc\s*=\s*["\'][^"\']*index\.js[^"\']*["\'][^>]*>\s*</script\s*>', html, re.I)
        if m_idx and m_idx.start() > pos:
            # скрипт игры стоит ниже </head> — ставим ahk.js сразу после него
            end = m_idx.end()
            nl_end = html.find('\n', end)
            end = len(html) if nl_end == -1 else nl_end + 1
            return html[:end] + block + html[end:]
        line_start = html.rfind('\n', 0, pos) + 1
        if html[line_start:pos].strip() == '':
            pos = line_start
        else:
            block = nl + block
        return html[:pos] + block + html[pos:]

    @staticmethod
    def _split_hud_patch(code: str):
        """Вырезает старый блок HUD-патча из загрузчика. Возвращает (был_ли_блок, код_без_него)."""
        si = code.find(AHK_HUD_PATCH_S)
        if si == -1:
            return False, code
        ei = code.find(AHK_HUD_PATCH_E, si)
        if ei == -1:
            _log_to_file('_split_hud_patch: найден старт блока HUD-патча, но нет конца — оставляю как есть')
            return False, code
        nl = code.find('\n', ei)
        tail = code[nl + 1:] if nl != -1 else ''
        return True, code[:si] + '// (патч компонента Hud вынесен в начало ahk.js)\n' + tail

    @staticmethod
    def _build_module_interfaces(ifaces: list):
        """Возвращает (js_список_интерфейсов, js_список_side-effect) для ahk.js.
        import() пишем литералами — путь резолвится относительно ahk.js (assets/)."""
        entries, side = [], []
        for iface in ifaces or []:
            name  = iface["name"]
            files = list(iface.get("files", []))
            deps  = list(iface.get("deps", []))  # нативные зависимости (css и т.п.): подключаются, но не скачиваются
            itype = iface.get("type", "interface")
            js_file = next((f for f in files if f.endswith(".js")), files[0] if files else None)
            if not js_file:
                continue
            all_files = files + deps
            imp = json.dumps("./" + js_file)
            if itype == "sideEffect":
                side.append(f'  {{ load: () => import({imp}), files: {json.dumps(all_files)} }},')
                print(f'[Installer] "{name}" -> side-effect импорт')
                continue
            if name in NATIVE_INTERFACE_NAMES:
                print(f'[Installer] [!] Пропускаю "{name}" — совпадает с нативным интерфейсом игры')
                continue
            opts = {"hideHud": bool(iface.get("hideHud")), "hideChat": bool(iface.get("hideChat"))}
            if iface.get("hud"):
                opts["hud"] = True
            if iface.get("style"):
                opts["style"] = str(iface["style"])
            entries.append(f'  {{ name: {json.dumps(name)}, load: () => import({imp}), files: {json.dumps(all_files)}, options: {json.dumps(opts)} }},')
        return "\n".join(entries), "\n".join(side)

    def _build_ahk_module(self, ifaces: list, obf: str, with_hud: bool) -> str:
        entries, side = self._build_module_interfaces(ifaces)
        core = AHK_MODULE_CORE.replace('%%IFACES%%', entries).replace('%%SIDE_EFFECTS%%', side)
        parts = [self._MARK_S, core]
        if with_hud:
            parts.append(AHK_MODULE_HUD)
        parts += ['// ── AHK loader ──', obf, self._MARK_E]
        return ("\n".join(parts)).replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'

    def _remove_legacy_from_index_js(self) -> bool:
        """Убирает старый блок AHK из конца Index.js (прошлые версии установщика). True — файл изменён."""
        idx = self._index_js()
        if not idx:
            return False
        content = idx.read_text(encoding='utf-8')
        if not self._has_code(content):
            return False
        with open(idx, 'w', encoding='utf-8', newline='\n') as f:
            f.write(self._remove_markers(content).replace('\r\n', '\n'))
        return True

    def _migrate_legacy(self):
        idx = self._index_js()
        if not idx:
            return
        try:
            content = idx.read_text(encoding='utf-8')
            if self._LEGACY_S not in content:
                return
            si = content.find(self._LEGACY_S)
            ei = content.find(self._LEGACY_E, si + len(self._LEGACY_S))
            if si == -1 or ei == -1:
                return
            inner = content[si + len(self._LEGACY_S): ei]
            clean = content[:si] + content[ei + len(self._LEGACY_E):]
            new_content = (
                clean.rstrip() + '\n'
                + self._MARK_S + '\n'
                + inner.strip('\n') + '\n'
                + self._MARK_E + '\n'
            )
            new_content = new_content.replace('\r\n', '\n').replace('\r', '\n').rstrip() + '\n'
            with open(idx, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
        except Exception:
            pass

    def get_saved_settings(self) -> dict:
        self._migrate_legacy()
        result = dict(self._saved)
        result['path_valid'] = self.radmir_path is not None
        result['radmir_path'] = str(self.radmir_path) if self.radmir_path else ''
        try:
            _h2 = self._hassle2_normalize_root(load_settings().get('hassle2_path', ''))
            result['hassle2_path'] = str(_h2) if _h2 else ''
            result['hassle2_installed'] = bool(_h2 and (_h2 / 'HassleOnline' / 'Content' / 'Paks' / (HASSLE2_PAK_NAME + '.pak')).exists())
        except Exception:
            result['hassle2_path'] = ''
            result['hassle2_installed'] = False
        installed = False
        try:
            html_p, ahk_p = self._index_html(), self._ahk_js_path()
            if html_p and ahk_p and ahk_p.exists():
                installed = self._html_has_block(html_p.read_text(encoding='utf-8'))
            if not installed:
                idx = self._index_js()   # старая установка (код в конце Index.js) — тоже «установлен»
                if idx:
                    installed = self._has_code(idx.read_text(encoding='utf-8'))
        except Exception:
            installed = False
        result['code_installed'] = installed
        return result


    def get_menu_items(self, department: str = 'pravo') -> dict:
        """
        Пункты меню «Повседневная» для выбранной структуры — читаются прямо из
        её основного скрипта на GitHub (povsednevOptions), поэтому список биндов
        в установщике всегда совпадает с тем, что реально есть в pravo.js.
        Возвращает {'ok': bool, 'items': [...плоский список...], 'groups': [{'id','title','items'}], 'error': str}.
        """
        if department == 'gang':
            # У Банды пункты меню не биндятся (меню открывается одной кнопкой)
            return {'ok': True, 'items': [], 'groups': [], 'error': ''}
        loaders = {
            'fsb': FSB_AHK_URL, 'fsin': FSIN_AHK_URL,
            'pravo': PRAVO_AHK_URL, 'mvd': AHK_URL,
        }
        dept = department if department in loaders else 'mvd'
        if dept in _MENU_CACHE:
            return _MENU_CACHE[dept]
        try:
            loader_url = loaders[dept]
            ts = int(time.time())
            lt = requests.get(f"{loader_url}?_={ts}", timeout=15)
            lt.raise_for_status()
            _folder, filename = parse_loader_target(lt.text)
            if not filename:
                return {'ok': False, 'items': [], 'error': 'В загрузчике не найден filename'}
            script_url = loader_url.rsplit('/', 1)[0] + '/' + _quote(filename)
            st = requests.get(f"{script_url}?_={ts}", timeout=20)
            st.raise_for_status()
            groups = parse_menu_groups(st.text)
            if not groups:
                return {'ok': False, 'items': [], 'groups': [], 'error': 'пункты меню не найдены в ' + filename}
            # items — плоский список всех пунктов (для старого index.html), groups — по разделам
            flat = [it for g in groups for it in g['items']]
            result = {'ok': True, 'items': flat, 'groups': groups, 'error': ''}
            _MENU_CACHE[dept] = result
            return result
        except Exception as e:
            return {'ok': False, 'items': [], 'error': str(e)}

    @staticmethod
    def _fetch_custom_interfaces(department: str = 'mvd') -> list:
        import re, json, traceback
        if department == 'gang':
            return []   # у Банды своих кастом-интерфейсов нет — только gang.js
        intload_url = _intload_url(department)
        try:
            print(f'[Installer] Загружаю IntLoad.js: {intload_url}')
            resp = requests.get(intload_url, timeout=15)
            resp.raise_for_status()
            print(f'[Installer] HTTP {resp.status_code}, длина {len(resp.text)} байт')
            text = resp.text
            m = re.search(r'window\._duranCustomInterfaces\s*=\s*(\[)', text)
            if not m:
                print('[Installer] _duranCustomInterfaces не найден в IntLoad.js')
                _log_to_file('_fetch_custom_interfaces: _duranCustomInterfaces НЕ НАЙДЕН')
                return []
            start = m.start(1)
            depth, i = 0, start
            while i < len(text):
                if text[i] == '[':   depth += 1
                elif text[i] == ']':
                    depth -= 1
                    if depth == 0: break
                i += 1
            raw = text[start:i + 1]
            print(f'[Installer] Найден массив: {raw[:120]}')
            raw = re.sub(r',\s*([}\]])', r'\1', raw)
            raw = re.sub(r'([{,]\s*)([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*:', r'\1"\2":', raw)
            result = json.loads(raw)
            print(f'[Installer] Распарсено интерфейсов: '
                  f'{[r["name"] + ":" + r.get("type", "interface") for r in result]}')
            _log_to_file(f'_fetch_custom_interfaces OK: {[r["name"] + ":" + r.get("type", "interface") for r in result]}')
            return result
        except Exception as e:
            print(f'[Installer] Не удалось загрузить IntLoad.js: {e}')
            _log_to_file(f'_fetch_custom_interfaces ИСКЛЮЧЕНИЕ: {e}\n{traceback.format_exc()}')
            return []

    @staticmethod
    def _detect_var_names(content: str) -> tuple:
        """
        Определяет актуальные имена переменных словарей компонентов в Index.js.

        dd_var — словарь ленивых импортов:  VAR={Preloader:bd,FirstPersonConfig:f(()=>d(()=>import(...)))...}
        fd_var — словарь конфигов:          VAR={FirstPersonConfig:{open:{status:!1},show:!0,options:{}}...}

        Способы поиска (по очереди, берём первый сработавший):
          1) прямой паттерн  VAR={Preloader:  /  VAR={FirstPersonConfig:{open:
          2) по ключу FirstPersonConfig: берём ближайшее VAR={ слева от него
             (работает, даже если первым ключом стал не Preloader)
          3) по использованию в App: components:VAR,data(){return{TOAST_LAYER_ID  (dd)
                                     components:VAR,developmentMode               (fd)
        Возвращает (dd_var, fd_var). Фоллбэк: PC_DD_VAR_FALLBACK / PC_FD_VAR_FALLBACK.
        """
        import re
        ident = r'[A-Za-z_$][A-Za-z0-9_$]*'

        def _walk_back(pos):
            # ближайшее "VAR={" левее позиции pos (не дальше 400 символов)
            seg = content[max(0, pos - 400):pos]
            hits = list(re.finditer(r'(' + ident + r')\s*=\s*\{', seg))
            return hits[-1].group(1) if hits else None

        def _components_used(var):
            return bool(var) and bool(re.search(r'components\s*:\s*' + re.escape(var) + r'\s*[,}]', content))

        # ── dd_var ──
        dd_var, how = None, ''
        m = re.search(r'(' + ident + r')\s*=\s*\{Preloader\s*:', content)
        if m:
            dd_var, how = m.group(1), 'Preloader:'
        if not dd_var:
            m = re.search(r'FirstPersonConfig\s*:\s*' + ident + r'\(\(\)\s*=>\s*' + ident + r'\(\(\)\s*=>\s*import\(', content)
            if m:
                dd_var, how = _walk_back(m.start()), 'FirstPersonConfig:f(()=>d(()=>import'
        if not dd_var:
            m = re.search(r'components\s*:\s*(' + ident + r')\s*,\s*data\(\)\s*\{\s*return\s*\{\s*TOAST_LAYER_ID', content)
            if m:
                dd_var, how = m.group(1), 'components:VAR,data(){return{TOAST_LAYER_ID'
        if dd_var:
            _log_to_file(f'_detect_var_names: dd_var="{dd_var}" (найден по {how}; components:{dd_var} в App: {_components_used(dd_var)})')
        else:
            dd_var = PC_DD_VAR_FALLBACK
            _log_to_file(f'_detect_var_names: dd_var не найден, используем fallback "{dd_var}"')

        # ── fd_var ──
        fd_var, how = None, ''
        m = re.search(r'(' + ident + r')\s*=\s*\{FirstPersonConfig\s*:\s*\{open\s*:', content)
        if m:
            fd_var, how = m.group(1), 'FirstPersonConfig:{open:'
        if not fd_var:
            m = re.search(r'FirstPersonConfig\s*:\s*\{\s*open\s*:\s*\{\s*status\s*:', content)
            if m:
                fd_var, how = _walk_back(m.start()), 'walk-back от FirstPersonConfig:{open:'
        if not fd_var:
            m = re.search(r'components\s*:\s*(' + ident + r')\s*,\s*developmentMode', content)
            if m:
                fd_var, how = m.group(1), 'components:VAR,developmentMode'
        if fd_var:
            _log_to_file(f'_detect_var_names: fd_var="{fd_var}" (найден по {how}; components:{fd_var} в App: {_components_used(fd_var)})')
        else:
            fd_var = PC_FD_VAR_FALLBACK
            _log_to_file(f'_detect_var_names: fd_var не найден, используем fallback "{fd_var}"')

        if dd_var == fd_var:
            _log_to_file(f'_detect_var_names: ВНИМАНИЕ dd_var == fd_var == "{dd_var}" — детект неверный, берём фоллбэки')
            dd_var, fd_var = PC_DD_VAR_FALLBACK, PC_FD_VAR_FALLBACK
        return dd_var, fd_var

    @staticmethod
    def _detect_loader_names(content: str) -> tuple:
        """
        Определяет буквы хелперов, которыми Index.js оборачивает ленивые компоненты:
            FirstPersonConfig:f(()=>d(()=>import("./FirstPersonConfig.js"),[...],import.meta.url))
        f = defineAsyncComponent, d = preload-хелпер. Эти буквы тоже меняются между сборками,
        а сгенерированный блок вставляется в конец Index.js (тот же модуль), где они видны по имени.
        Возвращает (f_name, d_name). Фоллбэк: LOADER_F_FALLBACK / LOADER_D_FALLBACK.
        """
        import re
        ident = r'[A-Za-z_$][A-Za-z0-9_$]*'
        pat_key = r'FirstPersonConfig\s*:\s*(' + ident + r')\(\(\)\s*=>\s*(' + ident + r')\(\(\)\s*=>\s*import\('
        pat_any = r'[:,]\s*(' + ident + r')\(\(\)\s*=>\s*(' + ident + r')\(\(\)\s*=>\s*import\(\s*["\']\./'
        for pat, how in ((pat_key, 'FirstPersonConfig'), (pat_any, 'первый ленивый компонент')):
            m = re.search(pat, content)
            if m:
                f_name, d_name = m.group(1), m.group(2)
                _log_to_file(f'_detect_loader_names: f="{f_name}", d="{d_name}" (по {how})')
                return f_name, d_name
        _log_to_file(f'_detect_loader_names: не найдено, фоллбэк f="{LOADER_F_FALLBACK}", d="{LOADER_D_FALLBACK}"')
        return LOADER_F_FALLBACK, LOADER_D_FALLBACK

    @staticmethod
    def _names_look_valid(content: str, dd_var: str, fd_var: str, f_name: str, d_name: str) -> bool:
        """
        Проверяет, что найденные буквы реально существуют в Index.js и играют свои роли:
          • components:dd_var и components:fd_var используются в App (это и есть реестр движка);
          • dd_var != fd_var;
          • f и d определены в модуле (function f( / const f= / ,f= ).
        Если проверка не прошла — буквы использовать нельзя.
        """
        import re
        if not (dd_var and fd_var and f_name and d_name) or dd_var == fd_var:
            return False
        def used_in_app(v):
            return bool(re.search(r'components\s*:\s*' + re.escape(v) + r'\s*[,}]', content))
        def defined(n):
            e = re.escape(n)
            return bool(re.search(
                r'(?<![\w$.])(?:function\s+' + e + r'\s*\(|(?:const|let|var)\s+' + e + r'\s*=|[,;{}]\s*' + e + r'\s*=(?!=))',
                content))
        return used_in_app(dd_var) and used_in_app(fd_var) and defined(f_name) and defined(d_name)

    @classmethod
    def _resolve_loader_names(cls, content: str, fb_dd: str, fb_fd: str) -> tuple:
        """
        Итог: (dd_var, fd_var, f_name, d_name, ok, note).
        Сначала автодетект по Index.js; если буквы не проходят проверку — пробуем фоллбэки;
        если не проходят и они — ok=False (блок регистрации НЕ вставляем, чтобы не гадать вслепую).
        """
        dd, fd = cls._detect_var_names(content)
        f_name, d_name = cls._detect_loader_names(content)
        if cls._names_look_valid(content, dd, fd, f_name, d_name):
            return dd, fd, f_name, d_name, True, 'автодетект'
        _log_to_file(f'_resolve_loader_names: автодетект не прошёл проверку ({dd}/{fd}/{f_name}/{d_name}), пробую фоллбэки')
        if cls._names_look_valid(content, fb_dd, fb_fd, LOADER_F_FALLBACK, LOADER_D_FALLBACK):
            return fb_dd, fb_fd, LOADER_F_FALLBACK, LOADER_D_FALLBACK, True, 'фоллбэк'
        _log_to_file('_resolve_loader_names: ни автодетект, ни фоллбэк не прошли проверку — интерфейсы не регистрируем')
        return dd, fd, f_name, d_name, False, 'не удалось определить буквы'

    # ── Буквы Vue-helper-ов в экспортах Index.js ────────────────────────────────
    # Загрузчики интерфейсов импортируют helper-ы Vue из ./index.js по минифицированным
    # именам экспорта (o as openBlock, i as renderList ...). Эти буквы меняются при каждой
    # сборке игры — после обновления игры загрузчики молча ломались. Находим helper-ы по
    # сигнатурам их кода (внутренности Vue не меняются), а букву берём из export{...}.
    _VUE_HELPER_PATTERNS = {
        'Fragment':           r'([\w$]+)\s*=\s*Symbol\.for\("v-fgt"\)',
        'openBlock':          r'function\s+([\w$]+)\(e=!1\)\{[\w$]+\.push\([\w$]+=e\?null:\[\]\)\}',
        'createElementBlock': (r'function\s+([\w$]+)\(e,t,n,o,r,i\)\{return [\w$]+\([\w$]+\(e,t,n,o,r,i,!0\)\)\}function\s+[\w$]+\(e,t,n,o,r\)\{return [\w$]+\([\w$]+\(e,t,n,o,r,!0\)\)\}',
                                        r'function\s+(?P<n>[\w$]+)\((?P<a1>[\w$]+),(?P<a2>[\w$]+),(?P<a3>[\w$]+),(?P<a4>[\w$]+),(?P<a5>[\w$]+),(?P<a6>[\w$]+)\)\{return [\w$]+\([\w$]+\((?P=a1),(?P=a2),(?P=a3),(?P=a4),(?P=a5),(?P=a6),!0\)\)\}function\s+[\w$]+\((?P<b1>[\w$]+),(?P<b2>[\w$]+),(?P<b3>[\w$]+),(?P<b4>[\w$]+),(?P<b5>[\w$]+)\)\{return [\w$]+\([\w$]+\((?P=b1),(?P=b2),(?P=b3),(?P=b4),(?P=b5),!0\)\)\}'),
        'createBlock':        (r'function\s+[\w$]+\(e,t,n,o,r,i\)\{return [\w$]+\([\w$]+\(e,t,n,o,r,i,!0\)\)\}function\s+([\w$]+)\(e,t,n,o,r\)\{return [\w$]+\([\w$]+\(e,t,n,o,r,!0\)\)\}',
                                        r'function\s+[\w$]+\((?P<a1>[\w$]+),(?P<a2>[\w$]+),(?P<a3>[\w$]+),(?P<a4>[\w$]+),(?P<a5>[\w$]+),(?P<a6>[\w$]+)\)\{return [\w$]+\([\w$]+\((?P=a1),(?P=a2),(?P=a3),(?P=a4),(?P=a5),(?P=a6),!0\)\)\}function\s+(?P<n>[\w$]+)\((?P<b1>[\w$]+),(?P<b2>[\w$]+),(?P<b3>[\w$]+),(?P<b4>[\w$]+),(?P<b5>[\w$]+)\)\{return [\w$]+\([\w$]+\((?P=b1),(?P=b2),(?P=b3),(?P=b4),(?P=b5),!0\)\)\}'),
        'createBaseVNode':    (r'function\s+[\w$]+\(e,t,n,o,r,i\)\{return [\w$]+\(([\w$]+)\(e,t,n,o,r,i,!0\)\)\}function\s+[\w$]+\(e,t,n,o,r\)',
                                        r'function\s+[\w$]+\((?P<a1>[\w$]+),(?P<a2>[\w$]+),(?P<a3>[\w$]+),(?P<a4>[\w$]+),(?P<a5>[\w$]+),(?P<a6>[\w$]+)\)\{return [\w$]+\((?P<n>[\w$]+)\((?P=a1),(?P=a2),(?P=a3),(?P=a4),(?P=a5),(?P=a6),!0\)\)\}function\s+[\w$]+\((?P<b1>[\w$]+),(?P<b2>[\w$]+),(?P<b3>[\w$]+),(?P<b4>[\w$]+),(?P<b5>[\w$]+)\)\{return [\w$]+\([\w$]+\((?P=b1),(?P=b2),(?P=b3),(?P=b4),(?P=b5),!0\)\)\}'),
        'createVNode':        (r'function\s+[\w$]+\(e,t,n,o,r,i\)\{return [\w$]+\([\w$]+\(e,t,n,o,r,i,!0\)\)\}function\s+[\w$]+\(e,t,n,o,r\)\{return [\w$]+\(([\w$]+)\(e,t,n,o,r,!0\)\)\}',
                                        r'function\s+[\w$]+\((?P<a1>[\w$]+),(?P<a2>[\w$]+),(?P<a3>[\w$]+),(?P<a4>[\w$]+),(?P<a5>[\w$]+),(?P<a6>[\w$]+)\)\{return [\w$]+\([\w$]+\((?P=a1),(?P=a2),(?P=a3),(?P=a4),(?P=a5),(?P=a6),!0\)\)\}function\s+[\w$]+\((?P<b1>[\w$]+),(?P<b2>[\w$]+),(?P<b3>[\w$]+),(?P<b4>[\w$]+),(?P<b5>[\w$]+)\)\{return [\w$]+\((?P<n>[\w$]+)\((?P=b1),(?P=b2),(?P=b3),(?P=b4),(?P=b5),!0\)\)\}'),
        'createTextVNode':    r'function\s+([\w$]+)\(e=" ",t=0\)\{return [\w$]+\([\w$]+,null,e,t\)\}',
        'createCommentVNode': r'function\s+([\w$]+)\(e="",t=!1\)\{return t\?\([\w$]+\(\),[\w$]+\([\w$]+,null,e\)\):[\w$]+\([\w$]+,null,e\)\}',
        'toDisplayString':    r'([\w$]+)\s*=\s*e=>[\w$]+\(e\)\?e:e==null\?"":',
        'normalizeClass':     r'function\s+([\w$]+)\(e\)\{let t="";if\([\w$]+\(e\)\)t=e;else if',
        'normalizeStyle':     r'function\s+([\w$]+)\(e\)\{if\([\w$]+\(e\)\)\{const t=\{\};for\(let n=0;n<e\.length;n\+\+\)',
        '_export_sfc':        (r'([\w$]+)\s*=\s*\(e,t\)=>\{const n=e\.__vccOpts\|\|e;for\(const\[o,r\]of t\)n\[o\]=r;return n\}',
                                        r'(?P<n>[\w$]+)\s*=\s*\((?P<a>[\w$]+),(?P<b>[\w$]+)\)=>\{const (?P<c>[\w$]+)=(?P=a)\.__vccOpts\|\|(?P=a);for\(const\[(?P<k>[\w$]+),(?P<v>[\w$]+)\]of (?P=b)\)(?P=c)\[(?P=k)\]=(?P=v);return (?P=c)\}'),
        'resolveComponent':   r'function\s+([\w$]+)\(e,t\)\{return [\w$]+\([\w$]+,e,!0,t\)\|\|e\}',
        'withCtx':            r'function\s+([\w$]+)\(e,t=[\w$]+,n\)\{if\(!t\|\|e\._n\)return e;',
        'renderList':         (r'function\s+([\w$]+)\(e,t,n,o\)\{let r;const i=n&&n\[o\];',
                                        r'function\s+(?P<n>[\w$]+)\((?P<a>[\w$]+),(?P<b>[\w$]+),(?P<c>[\w$]+),(?P<d>[\w$]+)\)\{let [\w$]+;const [\w$]+=(?P=c)&&(?P=c)\[(?P=d)\];'),
        'renderSlot':         (r'function\s+([\w$]+)\(e,t,n=\{\},o,r\)\{',
                                        r'function\s+(?P<n>[\w$]+)\([\w$]+,[\w$]+,[\w$]+=\{\},[\w$]+,[\w$]+\)\{'),
        'withDirectives':     r'function\s+([\w$]+)\(e,t\)\{(?:const|let) n=[\w$]+;if\(n===null\)return e;',
        'vModelText':         r'([\w$]+)\s*=\s*\{created\(e,\{modifiers:\{lazy:t,trim:n,number:o\}\}',
        'vShow':              r'([\w$]+)\s*=\s*\{beforeMount\(e,\{value:t\},\{transition:n\}\)',
        'Transition':         r'([\w$]+)\.displayName="Transition"',
    }

    @classmethod
    def _detect_vue_aliases(cls, content: str) -> dict:
        """
        Возвращает {имя_helper'а: буква_экспорта} для текущей сборки Index.js,
        например {'renderList': 'q', 'openBlock': 'o', ...}. Что не нашлось — в словаре нет
        (такой импорт в загрузчике остаётся как есть).
        """
        import re
        m = re.search(r'export\s*\{([^{}]*)\}\s*;?\s*$', content.rstrip(), re.S)
        if not m:
            _log_to_file('_detect_vue_aliases: блок export{...} в конце Index.js не найден')
            return {}
        local_to_alias = {}
        for it in m.group(1).split(','):
            it = it.strip()
            if not it:
                continue
            loc, _, alias = it.partition(' as ')
            local_to_alias[loc.strip()] = (alias or loc).strip()
        res = {}
        for name, pat in cls._VUE_HELPER_PATTERNS.items():
            # pat — один шаблон или кортеж шаблонов (по порядку): сначала точный (как в сборке Radmir),
            # потом общий — в другой сборке (HASSLE 2) минификатор называет аргументы функций иначе.
            alias = None
            for p in (pat if isinstance(pat, (tuple, list)) else (pat,)):
                mm = re.search(p, content)
                if not mm:
                    continue
                gi = mm.re.groupindex
                alias = local_to_alias.get(mm.group('n') if 'n' in gi else mm.group(1))
                if alias:
                    break
            if alias:
                res[name] = alias
        # createElementVNode — синоним createBaseVNode
        if 'createBaseVNode' in res:
            res['createElementVNode'] = res['createBaseVNode']
        _log_to_file(f'_detect_vue_aliases: найдено {len(res)} helper-ов: {res}')
        return res

    @staticmethod
    def _patch_loader_imports(text: str, aliases: dict) -> tuple:
        """
        Переписывает  import{o as openBlock,i as renderList,...}from"./index.js"  в тексте загрузчика,
        подставляя актуальные буквы экспорта. Возвращает (новый_текст, [список_замен]).
        """
        import re
        changes = []
        def repl(m):
            parts = []
            for it in m.group(1).split(','):
                it = it.strip()
                if not it:
                    continue
                if ' as ' in it:
                    a, n = [x.strip() for x in it.split(' as ', 1)]
                    cur = aliases.get(n)
                    if cur and cur != a:
                        changes.append(f'{n}: {a} -> {cur}')
                        a = cur
                    parts.append(f'{a} as {n}')
                else:
                    parts.append(it)
            return 'import{' + ','.join(parts) + '}from"./index.js"'
        new = re.sub(r'import\s*\{([^{}]*)\}\s*from\s*["\']\./index\.js["\']', repl, text)
        return new, changes

    @staticmethod
    def _build_interfaces_block(ifaces: list, dd_var: str = PC_DD_VAR_FALLBACK, fd_var: str = PC_FD_VAR_FALLBACK,
                                f_name: str = LOADER_F_FALLBACK, d_name: str = LOADER_D_FALLBACK) -> str:
        if not ifaces:
            return ""
        native_names = {
            "ScreenNotification", "Menu", "Hud", "Dialog", "InventoryNew",
            "Console", "BattlePassWelcome", "BlackMarket", "FullScreenPreloader",
        }
        dd_parts, fd_parts, side_effects = [], [], []
        for iface in ifaces:
            name      = iface["name"]
            files     = iface["files"]
            deps      = iface.get("deps", [])  # нативные зависимости: включаются в d(), но НЕ скачиваются
            itype     = iface.get("type", "interface")
            js_file   = next((f for f in files if f.endswith(".js")), files[0])
            files_js  = "[" + ",".join(f'"{f}"' for f in list(files) + list(deps)) + "]"
            if itype == "sideEffect":
                side_effects.append(
                    f'{d_name}(()=>import("./{js_file}"),{files_js},import.meta.url);'
                )
                print(f'[Installer] "{name}" -> side-effect импорт')
                continue
            if name in native_names:
                print(f'[Installer] [!] Пропускаю "{name}" — совпадает с нативным интерфейсом игры')
                continue
            hide_hud  = "!0" if iface.get("hideHud")  else "!1"
            hide_chat = "!0" if iface.get("hideChat") else "!1"
            hud_flag  = iface.get("hud", False)
            style_val = iface.get("style", "")
            dd_parts.append(
                f'{name}:{f_name}(()=>{d_name}(()=>import("./{js_file}"),{files_js},import.meta.url))'
            )
            opts_list = [f"hideHud:{hide_hud}", f"hideChat:{hide_chat}"]
            if hud_flag:
                opts_list.append("hud:!0")
            if style_val:
                opts_list.append(f'style:"{style_val}"')
            opts_str = ",".join(opts_list)
            fd_parts.append(
                f'{name}:{{open:{{status:!1}},show:!0,options:{{{opts_str}}}}}'
            )
        # Каждый кусок обёрнут в try/catch: если буквы вдруг неверные, ошибка уйдёт в консоль,
        # а код АХК ниже по файлу всё равно выполнится (раньше ReferenceError ронял весь хвост Index.js).
        def _safe(code, label):
            return 'try{' + code + '}catch(_e){console.error("[AHK] ' + label + ':",_e)}'
        parts = []
        if dd_parts:
            parts.append(_safe(f'Object.assign({dd_var},{{{",".join(dd_parts)}}});', 'регистрация интерфейсов (импорты)'))
        if fd_parts:
            parts.append(_safe(f'Object.assign({fd_var},{{{",".join(fd_parts)}}});', 'регистрация интерфейсов (конфиги)'))
        for se in side_effects:
            parts.append(_safe(se, 'side-effect импорт'))
        return "".join(parts)

    def _deploy_custom_ui_files(self, ifaces: list, department: str = 'mvd', assets_dir=None, index_text=None):
        # assets_dir / index_text нужны для HASSLE 2: там нет папки uiresources, файлы
        # складываются во временную папку, а буквы Vue-хелперов берутся из index.js из pak.
        if assets_dir is None:
            if not self.radmir_path:
                return
            assets_dir = self.radmir_path / "uiresources" / "assets"
        if not assets_dir.exists():
            return
        deploy_ui_url = _deploy_ui_url(department)
        all_files = [f for iface in ifaces for f in iface.get("files", [])]
        kind = "загрузчик" if USE_LOADERS else "файл"
        # Буквы Vue-helper-ов (openBlock, renderList ...) в экспортах Index.js меняются при каждой
        # сборке игры. Определяем их один раз и подставляем в import{...}from"./index.js" загрузчиков.
        vue_aliases = {}
        try:
            if index_text is not None:
                vue_aliases = self._detect_vue_aliases(self._remove_markers(index_text))
                print(f'[Installer] Vue-helper-ы index.js (из pak): найдено {len(vue_aliases)}')
            _idx = assets_dir / "Index.js"
            if index_text is None and _idx.exists():
                _idx_clean = self._remove_markers(_idx.read_text(encoding='utf-8'))
                vue_aliases = self._detect_vue_aliases(_idx_clean)
                print(f'[Installer] Vue-helper-ы Index.js: найдено {len(vue_aliases)}')
        except Exception as _e:
            _log_to_file(f'_deploy_custom_ui_files: не удалось определить буквы helper-ов ({_e!r})')
        for filename in all_files:
            url = f"{deploy_ui_url}/{filename}"
            try:
                resp = requests.get(url, timeout=20)
                resp.raise_for_status()
                dest = assets_dir / filename
                content = resp.content
                if vue_aliases and filename.endswith(".js"):
                    try:
                        _txt, _chg = self._patch_loader_imports(content.decode('utf-8'), vue_aliases)
                        if _chg:
                            content = _txt.encode('utf-8')
                            print(f'[Installer] {filename}: исправлены буквы импорта ({"; ".join(_chg)})')
                            _log_to_file(f'{filename}: patched imports: {_chg}')
                    except Exception as _e:
                        _log_to_file(f'{filename}: не удалось поправить импорты ({_e!r})')
                dest.write_bytes(content)
                print(f'[Installer] Скопирован {kind} {filename} -> assets/')
            except Exception as e:
                print(f'[Installer] Не удалось скачать {kind} {filename}: {e}')

    def select_folder(self):
        r = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory='/', allow_multiple=False)
        if not r or not len(r):
            return None
        chosen = Path(r[0])
        if chosen.name.upper() != "RADMIR CRMP":
            return {"error": "not_radmir"}
        self.radmir_path = chosen
        current = load_settings()
        current['radmir_path'] = str(self.radmir_path)
        save_settings(current)
        return {"ok": True, "path": str(self.radmir_path)}

    def save_department(self, department: str) -> bool:
        """Сохраняет выбранную структуру (mvd/fsb/fsin/pravo/gang) в settings.json."""
        if department == 'fsb':    dept = 'fsb'
        elif department == 'fsin': dept = 'fsin'
        elif department == 'pravo':dept = 'pravo'
        elif department == 'gang': dept = 'gang'
        else:                      dept = 'mvd'
        save_settings({'department': dept})
        return True

    def insert_code(self, callsign, use_callsign, auto_password='', auto_grab=None, swap_enabled=True, swap_key='Alt+Q', eject_enabled=False, eject_key='Alt+U', menu_key='Alt+0', menu_hidden=None, menu_binds=None, menu_order=None, menu_timer=None, department='mvd', auto_reissue_lic=False, reissue_key='Alt+R', givelic_key=''):
        result_event = threading.Event()
        result_data = {"ok": False, "message": "Неизвестная ошибка"}

        def run():
            import traceback, sys
            try:
                if not self._check_dirs():
                    result_data["message"] = "Папка RADMIR CRMP не выбрана или некорректна."
                    return
                ifaces = self._fetch_custom_interfaces(department)
                self._deploy_custom_ui_files(ifaces, department)
                
                if department == 'fsb':     loader_url = FSB_AHK_URL
                elif department == 'fsin':  loader_url = FSIN_AHK_URL
                elif department == 'pravo': loader_url = PRAVO_AHK_URL
                elif department == 'gang':  loader_url = GANG_AHK_URL
                else:                       loader_url = AHK_URL
                code = None
                for attempt in range(3):
                    try:
                        resp = requests.get(loader_url, timeout=15)
                        resp.raise_for_status()
                        code = resp.text.strip()
                        break
                    except Exception as e:
                        if attempt == 2:
                            raise Exception("Не удалось загрузить данные. Проверьте интернет-соединение.")
                        time.sleep(2)
                        
                if not code:
                    result_data["message"] = "Загруженные данные пусты."
                    return
                code = code.replace('\r\n','\n').replace('\r','\n').strip()+'\n'
            except Exception as e:
                result_data["message"] = str(e)
                traceback.print_exc(file=sys.stdout)
                result_event.set()
                self._notify(False)
                return

            # Для Правительства авто-тазер и авто-выброс не используются
            # (не переприсваиваем swap_enabled/eject_enabled — внутри вложенной run() это делает их локальными)
            _swap_on  = bool(swap_enabled)  and department != 'pravo'
            _eject_on = bool(eject_enabled) and department != 'pravo'
            # ── Авто-перевыдача лицензии (только для Правительства) ────────────────
            safe_reissue_key = str(reissue_key).replace('"', '').replace("'", '')[:30] if reissue_key else ''
            if auto_reissue_lic and department == 'pravo':
                code = code.replace('const AUTO_REISSUE_LIC = false;', 'const AUTO_REISSUE_LIC = true;')
            if department == 'pravo' and safe_reissue_key:
                code = code.replace('const REISSUE_KEY = "Alt+R";', f'const REISSUE_KEY = "{safe_reissue_key}";')
            # ── Хоткей быстрой выдачи лицензии (только для Правительства) ────────────
            safe_givelic_key = str(givelic_key).replace('"', '').replace("'", '')[:30] if givelic_key else ''
            if department == 'pravo' and safe_givelic_key:
                code = code.replace('const GIVELIC_KEY = "";', f'const GIVELIC_KEY = "{safe_givelic_key}";')
            # ── Флаг помощника лицензёра (только для Правительства) ──────────────────
            # true если хотя бы одна из функций помощника включена: авто-перевыдача или быстрая выдача
            _licensor_helper = (bool(auto_reissue_lic) or bool(safe_givelic_key)) and department == 'pravo'
            # LICENSOR_HELPER_ENABLED управляет только кнопкой «Выдать лицензию» (Быстрая выдача).
            # Авто-перевыдача живёт в отдельном флаге AUTO_REISSUE_LIC — не трогаем здесь.
            if bool(safe_givelic_key) and department == 'pravo':
                code = code.replace('const LICENSOR_HELPER_ENABLED = false;', 'const LICENSOR_HELPER_ENABLED = true;')

            code = code.replace('const HWID = "";',       f'const HWID = "{get_hwid()}";')
            safe_swap_key = str(swap_key).replace('"', '').replace("'", '')[:30] if swap_key else ''
            if not _swap_on or not safe_swap_key:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = false;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', 'const SWAP_KEY = "";')
            else:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = true;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', f'const SWAP_KEY = "{safe_swap_key}";')
            safe_eject_key = str(eject_key).replace('"', '').replace("'", '')[:30] if eject_key else ''
            if not _eject_on or not safe_eject_key:
                # дефолт уже false — ничего не меняем, просто очищаем ключ
                code = code.replace('const EJECT_KEY = "Alt+U";', 'const EJECT_KEY = "";')
            else:
                code = code.replace('const EJECT_ENABLED = false;', 'const EJECT_ENABLED = true;')
                code = code.replace('const EJECT_KEY = "Alt+U";', f'const EJECT_KEY = "{safe_eject_key}";')
            safe_menu_key = str(menu_key).replace('"', '').replace("'", '')[:30] if menu_key else ''
            code = code.replace('const MENU_KEY = "Alt+0";', f'const MENU_KEY = "{safe_menu_key}";')
            hidden_list = menu_hidden if isinstance(menu_hidden, list) else []
            hidden_json = json.dumps(hidden_list)
            code = code.replace('const MENU_HIDDEN_ITEMS = [];', f'const MENU_HIDDEN_ITEMS = {hidden_json};')
            binds_dict = {k: v for k, v in (menu_binds or {}).items() if v}
            binds_json = json.dumps(binds_dict, ensure_ascii=False)
            code = code.replace('const MENU_BINDS = {};', f'const MENU_BINDS = {binds_json};')
            order_list = menu_order if isinstance(menu_order, list) and menu_order else []
            order_json = json.dumps(order_list)
            code = code.replace('const MENU_ORDER = [];', f'const MENU_ORDER = {order_json};')
            timer_list = menu_timer if isinstance(menu_timer, list) and menu_timer else []
            timer_json = json.dumps(timer_list)
            code = code.replace('const MENU_TIMER_ITEMS = [];', f'const MENU_TIMER_ITEMS = {timer_json};')
            if use_callsign and callsign:
                code = code.replace('const CALLSIGN = "";', f'const CALLSIGN = "{callsign}";')
            if auto_password:
                code = code.replace('const AUTO_PASSWORD = "";', f'const AUTO_PASSWORD = "{auto_password}";')
            items_dict = auto_grab.get('items', {}) if auto_grab else {}
            any_item = any(v for v in items_dict.values()) if items_dict else False
            if auto_grab and isinstance(auto_grab, dict) and auto_grab.get('enabled') and any_item:
                thr  = auto_grab.get('thresholds', {})
                menu = auto_grab.get('menu', {})
                items = auto_grab.get('items', {})
                code = code.replace('const AUTO_GRAB = false;', 'const AUTO_GRAB = true;')
                code = code.replace('var AUTO_GRAB = false;', 'var AUTO_GRAB = true;')
                if thr.get('magnum')  is not None:
                    code = code.replace('const AUTO_GRAB_THR_MAGNUM = 30;', f'const AUTO_GRAB_THR_MAGNUM = {int(thr["magnum"])};')
                if thr.get('ammo762') is not None:
                    code = code.replace('const AUTO_GRAB_THR_762 = 60;',    f'const AUTO_GRAB_THR_762 = {int(thr["ammo762"])};')
                if thr.get('ammo545') is not None:
                    code = code.replace('const AUTO_GRAB_THR_545 = 60;',    f'const AUTO_GRAB_THR_545 = {int(thr["ammo545"])};')
                if thr.get('ammo556') is not None:
                    code = code.replace('const AUTO_GRAB_THR_556 = 60;',    f'const AUTO_GRAB_THR_556 = {int(thr["ammo556"])};')
                if thr.get('ammo12x70') is not None:
                    code = code.replace('const AUTO_GRAB_THR_1270 = 20;',   f'const AUTO_GRAB_THR_1270 = {int(thr["ammo12x70"])};')
                for key, mkey in [
                    ('medkit',     'MEDKIT'),   ('baton',      'BATON'),   ('bat',        'BAT'),
                    ('shield',     'SHIELD'),   ('vest',       'VEST'),    ('deagle',     'DEAGLE'),
                    ('ammo_magnum','AMMO_MAGNUM'),('akm',      'AKM'),  ('ammo_762',  'AMMO_762'),
                    ('painkiller', 'PAINKILLERS'),('baton2',   'WAND'),
                    ('taumeter',   'RADAR_GUN'),('diag',       'DIAGNOSTICS'),
                    ('taser',      'TASER'),    ('aks74u',     'AKS74U'),
                    ('hk416',      'HK416'),    ('ammo_556',   'AMMO_556'),
                    ('remington',  'REMINGTON'),('ammo_545',   'AMMO_545'), ('ammo_12x70','AMMO_1270'),
                    ('flashbang',  'FLASHBANG'),('mask',       'MASK'),    ('repairkit',  'REPAIRKIT'),
                ]:
                    val = menu.get(key)
                    if val is not None:
                        code = code.replace(f'const AUTO_GRAB_MENU_{mkey} = -1;', f'const AUTO_GRAB_MENU_{mkey} = {int(val)};')
                skip = [k for k,v in items.items() if not v]
                skip_js = json.dumps(skip)
                code = code.replace('const AUTO_GRAB_SKIP = [];', f'const AUTO_GRAB_SKIP = {skip_js};')
                code = code.replace('var AUTO_GRAB_SKIP = [];', f'var AUTO_GRAB_SKIP = {skip_js};')
            try:
                # ── Собираем assets/ahk.js (интерфейсы + защищённый загрузчик) ──
                # Старый блок HUD-патча вырезаем из загрузчика — он использовал переменные Index.js,
                # в отдельном модуле их нет. Взамен вставляется AHK_MODULE_HUD.
                with_hud, code_clean = self._split_hud_patch(code)
                _log_to_file(f'ahk.js: ifaces={len(ifaces)}, hud_patch={with_hud}')
                obf = self._obfuscate(code_clean)
                module_text = self._build_ahk_module(ifaces, obf, with_hud)

                html_p = self._index_html()
                if not html_p:
                    result_data["message"] = "Файл index.html не найден в папке uiresources."
                    result_event.set()
                    self._notify(False)
                    return
                ahk_p = self._ahk_js_path()
                if not ahk_p.parent.exists():
                    result_data["message"] = "Папка uiresources/assets не найдена."
                    result_event.set()
                    self._notify(False)
                    return

                try:
                    # 1) ahk.js
                    with open(ahk_p, 'w', encoding='utf-8', newline='\n') as f:
                        f.write(module_text)
                    # 2) тег в index.html (после скрипта index.js)
                    html_old = self._read_keep_nl(html_p)
                    html_new = self._html_add_block(html_old)
                    if html_new != html_old:
                        with open(html_p, 'w', encoding='utf-8', newline='') as f:
                            f.write(html_new)
                    # 3) убираем код прошлых версий из конца Index.js (иначе выполнится дважды)
                    self._remove_legacy_from_index_js()
                except PermissionError:
                    result_data["message"] = "Файл заблокирован! Закройте игру (RADMIR CRMP) и повторите попытку."
                    result_event.set()
                    self._notify(False)
                    return
                _iface_warn = ""

                self._set_status("st-code","Установлен","cr-val ok")
                current = load_settings()
                if department == 'gang':
                    # Банда: сохраняем структуру, свою кнопку меню и автопароль —
                    # настройки фракций (позывной, снаряжение, бинды и т.д.) не трогаем
                    save_settings({
                        'department': 'gang',
                        'gang_menu_key': safe_menu_key,
                        'auto_password': auto_password,
                        'use_auto_password': bool(auto_password),
                        'radmir_path': str(self.radmir_path) if self.radmir_path else current.get('radmir_path', ''),
                    })
                else:
                    save_settings({
                        'callsign': callsign if use_callsign else '',
                        'use_callsign': bool(use_callsign),
                        'auto_password': auto_password,
                        'use_auto_password': bool(auto_password),
                        'radmir_path': str(self.radmir_path) if self.radmir_path else current.get('radmir_path', ''),
                        'auto_grab': (lambda ag: {**ag, 'enabled': ag.get('enabled', False) and any_item})(auto_grab) if auto_grab and isinstance(auto_grab, dict) else {},
                        'swap_enabled': _swap_on,
                        'swap_key': safe_swap_key if _swap_on else '',
                        'eject_enabled': _eject_on,
                        'eject_key': safe_eject_key if _eject_on else '',
                        'menu_key': safe_menu_key,
                        'menu_hidden': hidden_list,
                        'menu_binds': binds_dict,
                        'menu_order': order_list,
                        'menu_timer_items': timer_list,
                        'department': 'fsb' if department == 'fsb' else ('fsin' if department == 'fsin' else ('pravo' if department == 'pravo' else 'mvd')),
                        'auto_reissue_lic': bool(auto_reissue_lic) if department == 'pravo' else False,
                        'reissue_key': safe_reissue_key if (auto_reissue_lic and department == 'pravo') else '',
                        'givelic_key': safe_givelic_key if department == 'pravo' else '',
                        'givelic_on': bool(safe_givelic_key) and department == 'pravo',
                        'licensor_helper': (bool(auto_reissue_lic) or bool(safe_givelic_key)) and department == 'pravo',  # гейт: любая функция помощника включена
                    })
                result_data["ok"] = True
                result_data["message"] = "Код успешно установлен!" + _iface_warn
                self._notify(True)
            except Exception as e:
                result_data["message"] = f"Ошибка записи: {e}"
                traceback.print_exc(file=sys.stdout)
            finally:
                result_event.set()

        threading.Thread(target=run, daemon=True).start()
        result_event.wait(timeout=60)
        
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK Installer - Ошибка", 0x10 | 0x40000)
            except Exception:
                pass
                
        return result_data

    def remove_code(self):
        result_event = threading.Event()
        result_data = {"ok": False, "message": "Ошибка удаления"}

        def run():
            try:
                if not self._check_dirs():
                    result_data["message"] = "Папка не выбрана"
                    return
                try:
                    # 1) тег ahk.js из index.html
                    html_p = self._index_html()
                    if html_p:
                        html_old = self._read_keep_nl(html_p)
                        html_new = self._html_remove_block(html_old)
                        if html_new != html_old:
                            with open(html_p, 'w', encoding='utf-8', newline='') as f:
                                f.write(html_new)
                    # 2) сам ahk.js (только если это наш файл — по маркеру)
                    ahk_p = self._ahk_js_path()
                    if ahk_p and ahk_p.exists():
                        try:
                            ours = self._MARK_S in ahk_p.read_text(encoding='utf-8')
                        except Exception:
                            ours = False
                        if ours:
                            ahk_p.unlink()
                    # 3) код старых версий в конце Index.js
                    self._remove_legacy_from_index_js()
                except PermissionError:
                    result_data["message"] = "Файл заблокирован игрой! Закройте игру."
                    return
                self._set_status("st-code","Не установлен","cr-val muted")
                result_data["ok"] = True
                result_data["message"] = "Код успешно удален"
                self._notify(True)
            except Exception as e:
                result_data["message"] = str(e)
            finally:
                result_event.set()

        threading.Thread(target=run, daemon=True).start()
        result_event.wait(timeout=30)
        
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK Installer - Ошибка", 0x10 | 0x40000)
            except Exception:
                pass
                
        return result_data

    # ═══════════════════════════════════════════════════════════════════════
    # HASSLE / ТЕЛЕФОН
    # ═══════════════════════════════════════════════════════════════════════

    def _hassle_adb_ready(self):
        """Проверяет и при необходимости скачивает/распаковывает ADB."""
        try:
            if HASSLE_ADB_EXE.exists():
                return True
            HASSLE_ADB_DIR.mkdir(parents=True, exist_ok=True)
            zip_path = Path(tempfile.gettempdir()) / "adb_ahk_installer.zip"
            resp = requests.get(HASSLE_ADB_ZIP_URL, timeout=60)
            resp.raise_for_status()
            zip_path.write_bytes(resp.content)
            with zipfile.ZipFile(zip_path, "r") as z:
                z.extractall(HASSLE_ADB_DIR)
            return HASSLE_ADB_EXE.exists()
        except Exception as e:
            _log_to_file(f"_hassle_adb_ready: {e}")
            return False

    def _hassle_adb(self, args, timeout=30):
        """Запуск adb."""
        cmd = [str(HASSLE_ADB_EXE)] + args
        kwargs = dict(
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=timeout
        )
        if os.name == "nt":
            kwargs["creationflags"] = HASSLE_CREATE_NO_WINDOW
        return subprocess.run(cmd, **kwargs)

    def _hassle_device_param(self):
        """Ищет подключённое устройство и возвращает ['-s', device_id]."""
        try:
            self._hassle_adb(["start-server"], timeout=15)
        except Exception:
            pass
        try:
            r = self._hassle_adb(["devices"], timeout=15)
            for line in r.stdout.splitlines():
                line = line.strip()
                if not line or line.lower().startswith("list of devices"):
                    continue
                if line.endswith("device"):
                    dev = line.split()[0]
                    return ["-s", dev]
        except Exception as e:
            _log_to_file(f"_hassle_device_param: {e}")
        return []

    def hassle_detect_apps(self):
        """Ищет папки com.hassle.online* в /sdcard/Android/data."""
        if not self._hassle_adb_ready():
            return {"ok": False, "message": "ADB не готов"}
        param = self._hassle_device_param()
        try:
            r = self._hassle_adb(
                param + ["shell", "ls", "-1", HASSLE_STORAGE],
                timeout=25
            )
            if r.returncode != 0:
                return {
                    "ok": False,
                    "message": "Не удалось прочитать папку телефона. Проверьте ADB и доступ."
                }
            folders = [
                x.strip() for x in r.stdout.splitlines()
                if x.strip().startswith("com.hassle.online")
                and not x.strip().startswith("1com.hassle.online")
            ]
            return {"ok": True, "folders": folders}
        except Exception as e:
            return {"ok": False, "message": str(e)}

    def _hassle_remote_index_name(self, param, remote_dir):
        """Ищет Index.js или index.js в папке игры. Возвращает реальное имя файла."""
        try:
            r = self._hassle_adb(
                param + ["shell", "ls", "-1", remote_dir],
                timeout=25
            )
            if r.returncode != 0:
                return None
            names = [x.strip() for x in r.stdout.splitlines() if x.strip()]
            for exact in ("Index.js", "index.js"):
                if exact in names:
                    return exact
            lower_map = {x.lower(): x for x in names}
            return lower_map.get("index.js")
        except Exception:
            return None

    def _remove_all_hassle_markers(self, content: str) -> str:
        """Удаляет маркеры AHK installer и legacy (невидимые и старый текстовый формат)."""
        pairs = [
            (self._MARK_S, self._MARK_E),      # текущий формат — невидимые символы
            (self._LEGACY_S, self._LEGACY_E),   # старый формат — текстовые маркеры
        ]
        changed = True
        while changed:
            changed = False
            for s, e in pairs:
                si = content.find(s)
                if si != -1:
                    ei = content.find(e, si + len(s))
                    if ei != -1:
                        content = content[:si] + content[ei + len(e):]
                    else:
                        content = content[:si]
                    changed = True
        return content.rstrip() + "\n"

    def _hassle_build_code(self, department: str = "mvd"):
        """Готовит код для вставки в телефонный Index.js.
        Все настройки берёт из settings.json (сохраняются при вставке ПК-кода через insert_code),
        поэтому JS для телефона не обязан передавать auto_grab, swap, eject и т.д. явно —
        достаточно того, что пользователь уже вставил код для ПК с нужными настройками."""
        if department == "fsb":
            loader_url = FSB_AHK_URL
        elif department == "fsin":
            loader_url = FSIN_AHK_URL
        elif department == "pravo":
            loader_url = PRAVO_AHK_URL
        elif department == "gang":
            loader_url = GANG_AHK_URL
        else:
            loader_url = AHK_URL
        url = HASSLE_LOADER_URL or loader_url
        resp = requests.get(url, timeout=25)
        resp.raise_for_status()
        code = resp.text.replace("\r\n", "\n").replace("\r", "\n").strip() + "\n"
        saved = load_settings()
        if "HassleB/Load.js" in url:
            user = saved.get("hassle_user", "")
            acc  = saved.get("hassle_account", "")
            code = code.replace("const currentUser = '';", f"const currentUser = '{user}';")
            code = code.replace("const accountNumber = '';", f"const accountNumber = '{acc}';")
        else:
            # HWID
            code = code.replace('const HWID = "";', f'const HWID = "{get_hwid()}";')
            # Позывной
            if saved.get("use_callsign") and saved.get("callsign"):
                code = code.replace('const CALLSIGN = "";', f'const CALLSIGN = "{saved["callsign"]}";')
            # Автопароль
            if saved.get("auto_password"):
                code = code.replace('const AUTO_PASSWORD = "";', f'const AUTO_PASSWORD = "{saved["auto_password"]}";')
            # Смена места (swap)
            swap_enabled = saved.get("swap_enabled", True)
            swap_key     = saved.get("swap_key", "Alt+Q")
            safe_swap_key = str(swap_key).replace('"', '').replace("'", '')[:30] if swap_key else ''
            if not swap_enabled or not safe_swap_key:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = false;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', 'const SWAP_KEY = "";')
            else:
                code = code.replace('const SWAP_ENABLED = true;', 'const SWAP_ENABLED = true;')
                code = code.replace('const SWAP_KEY = "Alt+Q";', f'const SWAP_KEY = "{safe_swap_key}";')
            # Выход (eject)
            eject_enabled = saved.get("eject_enabled", False)
            eject_key     = saved.get("eject_key", "Alt+U")
            safe_eject_key = str(eject_key).replace('"', '').replace("'", '')[:30] if eject_key else ''
            if not eject_enabled or not safe_eject_key:
                code = code.replace('const EJECT_KEY = "Alt+U";', 'const EJECT_KEY = "";')
            else:
                code = code.replace('const EJECT_ENABLED = false;', 'const EJECT_ENABLED = true;')
                code = code.replace('const EJECT_KEY = "Alt+U";', f'const EJECT_KEY = "{safe_eject_key}";')
            # Клавиша меню
            menu_key = saved.get("gang_menu_key", "Alt+0") if department == "gang" else saved.get("menu_key", "Alt+0")
            safe_menu_key = str(menu_key).replace('"', '').replace("'", '')[:30] if menu_key else ''
            code = code.replace('const MENU_KEY = "Alt+0";', f'const MENU_KEY = "{safe_menu_key}";')
            # Скрытые пункты меню
            hidden_list = saved.get("menu_hidden", [])
            if not isinstance(hidden_list, list): hidden_list = []
            code = code.replace('const MENU_HIDDEN_ITEMS = [];', f'const MENU_HIDDEN_ITEMS = {json.dumps(hidden_list)};')
            # Привязки меню
            binds_dict = saved.get("menu_binds", {})
            if not isinstance(binds_dict, dict): binds_dict = {}
            code = code.replace('const MENU_BINDS = {};', f'const MENU_BINDS = {json.dumps(binds_dict, ensure_ascii=False)};')
            # Порядок меню
            order_list = saved.get("menu_order", [])
            if not isinstance(order_list, list): order_list = []
            code = code.replace('const MENU_ORDER = [];', f'const MENU_ORDER = {json.dumps(order_list)};')
            # Таймер меню
            timer_list = saved.get("menu_timer_items", [])
            if not isinstance(timer_list, list): timer_list = []
            code = code.replace('const MENU_TIMER_ITEMS = [];', f'const MENU_TIMER_ITEMS = {json.dumps(timer_list)};')
            # Автоснаряжение (AUTO_GRAB) — читаем из сохранённых настроек ПК
            auto_grab = saved.get("auto_grab", {})
            if isinstance(auto_grab, dict):
                items_dict = auto_grab.get('items', {})
                any_item = any(v for v in items_dict.values()) if items_dict else False
                if auto_grab.get('enabled') and any_item:
                    thr  = auto_grab.get('thresholds', {})
                    menu = auto_grab.get('menu', {})
                    items = auto_grab.get('items', {})
                    code = code.replace('const AUTO_GRAB = false;', 'const AUTO_GRAB = true;')
                    code = code.replace('var AUTO_GRAB = false;', 'var AUTO_GRAB = true;')
                    if thr.get('magnum')   is not None:
                        code = code.replace('const AUTO_GRAB_THR_MAGNUM = 30;', f'const AUTO_GRAB_THR_MAGNUM = {int(thr["magnum"])};')
                    if thr.get('ammo762')  is not None:
                        code = code.replace('const AUTO_GRAB_THR_762 = 60;',    f'const AUTO_GRAB_THR_762 = {int(thr["ammo762"])};')
                    if thr.get('ammo545')  is not None:
                        code = code.replace('const AUTO_GRAB_THR_545 = 60;',    f'const AUTO_GRAB_THR_545 = {int(thr["ammo545"])};')
                    if thr.get('ammo556')  is not None:
                        code = code.replace('const AUTO_GRAB_THR_556 = 60;',    f'const AUTO_GRAB_THR_556 = {int(thr["ammo556"])};')
                    if thr.get('ammo12x70') is not None:
                        code = code.replace('const AUTO_GRAB_THR_1270 = 20;',   f'const AUTO_GRAB_THR_1270 = {int(thr["ammo12x70"])};')
                    for key, mkey in [
                        ('medkit',      'MEDKIT'),    ('baton',      'BATON'),    ('bat',        'BAT'),
                        ('vest',        'VEST'),      ('deagle',     'DEAGLE'),
                        ('ammo_magnum', 'AMMO_MAGNUM'),('akm',       'AKM'),      ('ammo_762',   'AMMO_762'),
                        ('painkiller',  'PAINKILLERS'),('baton2',    'WAND'),
                        ('taumeter',    'RADAR_GUN'), ('diag',       'DIAGNOSTICS'),
                        ('shield',      'SHIELD'),    ('taser',      'TASER'),     ('aks74u',     'AKS74U'),
                        ('hk416',       'HK416'),     ('ammo_556',   'AMMO_556'),
                        ('remington',   'REMINGTON'), ('ammo_545',   'AMMO_545'), ('ammo_12x70', 'AMMO_1270'),
                        ('flashbang',   'FLASHBANG'), ('mask',       'MASK'),     ('repairkit',  'REPAIRKIT'),
                    ]:
                        val = menu.get(key)
                        if val is not None:
                            code = code.replace(f'const AUTO_GRAB_MENU_{mkey} = -1;', f'const AUTO_GRAB_MENU_{mkey} = {int(val)};')
                    skip = [k for k, v in items.items() if not v]
                    skip_js = json.dumps(skip)
                    code = code.replace('const AUTO_GRAB_SKIP = [];', f'const AUTO_GRAB_SKIP = {skip_js};')
                    code = code.replace('var AUTO_GRAB_SKIP = [];', f'var AUTO_GRAB_SKIP = {skip_js};')
            # ── Помощник лицензёра (только для Правительства) ─────────────────────
            # Если licensor_helper не был включён при вставке ПК-кода —
            # авто-перевыдача и /givelic не активируются и для Hastle тоже.
            dept_saved = saved.get('department', 'mvd')
            licensor_helper_saved = saved.get('licensor_helper', False)
            auto_reissue_lic_saved = saved.get('auto_reissue_lic', False) if licensor_helper_saved else False
            givelic_on_saved      = saved.get('givelic_on', False)         if licensor_helper_saved else False
            givelic_key_saved     = str(saved.get('givelic_key', '')).replace('"', '').replace("'", '')[:30] if givelic_on_saved else ''
            reissue_key_saved     = str(saved.get('reissue_key', 'Alt+R')).replace('"', '').replace("'", '')[:30]
            if auto_reissue_lic_saved and dept_saved == 'pravo':
                code = code.replace('const AUTO_REISSUE_LIC = false;', 'const AUTO_REISSUE_LIC = true;')
            if dept_saved == 'pravo' and reissue_key_saved:
                code = code.replace('const REISSUE_KEY = "Alt+R";', f'const REISSUE_KEY = "{reissue_key_saved}";')
            # ── Быстрая выдача лицензии для Hastle ──────────────────────────────────
            if dept_saved == 'pravo' and givelic_key_saved:
                code = code.replace('const GIVELIC_KEY = "";', f'const GIVELIC_KEY = "{givelic_key_saved}";')
            # ── Флаг помощника лицензёра для Hastle ──────────────────────────────────
            # LICENSOR_HELPER_ENABLED управляет только кнопкой «Выдать лицензию» (Быстрая выдача).
            # Авто-перевыдача уже обработана выше через AUTO_REISSUE_LIC — отдельный флаг.
            # Поэтому включаем только если givelic_on сохранён (галочка «Быстрая выдача» стояла).
            if licensor_helper_saved and givelic_on_saved and dept_saved == 'pravo':
                code = code.replace('const LICENSOR_HELPER_ENABLED = false;', 'const LICENSOR_HELPER_ENABLED = true;')
        return code

    def get_hassle_status(self):
        """Статус для UI: готов ли ADB, виден ли телефон, найдены ли папки."""
        try:
            adb_ok = self._hassle_adb_ready()
            if not adb_ok:
                return {"adb": False, "device": False, "folders": [], "saved_folder": ""}
            param = self._hassle_device_param()
            if not param:
                return {
                    "adb": True,
                    "device": False,
                    "folders": [],
                    "saved_folder": load_settings().get("hassle_app_folder", "")
                }
            apps = self.hassle_detect_apps()
            return {
                "adb": True,
                "device": True,
                "folders": apps.get("folders", []),
                "saved_folder": load_settings().get("hassle_app_folder", "")
            }
        except Exception as e:
            return {"adb": False, "device": False, "folders": [], "saved_folder": "", "error": str(e)}

    def insert_hassle_code(self, callsign='', use_callsign=False, auto_password='',
                           menu_key='Alt+0', department=None, app_folder=None,
                           auto_reissue_lic=False, reissue_key='Alt+R',
                           givelic_key='', licensor_helper=False, givelic_button_on=False, **_kwargs):
        """Вставляет AHK код в Index.js на телефоне.
        Настройки licensor (auto_reissue_lic, givelic_key и др.) передаются явно
        и сохраняются в settings.json, чтобы _hassle_build_code мог их применить —
        независимо от того, была ли ПК-вставка с этими же настройками.
        Остальные настройки (auto_grab, swap, eject) _hassle_build_code
        читает напрямую из settings.json, куда их сохраняет insert_code при вставке ПК."""
        _dept = department or load_settings().get('department', 'mvd')
        _is_pravo = _dept == 'pravo'
        _safe_reissue_key = str(reissue_key).replace('"', '').replace("'", '')[:30] if reissue_key else ''
        _safe_givelic_key = str(givelic_key).replace('"', '').replace("'", '')[:30] if givelic_key else ''
        _lh = bool(licensor_helper) and _is_pravo
        # save_settings делает merge, поэтому auto_grab и остальные ПК-настройки не затираются.
        if _dept == 'gang':
            # Банда: своя кнопка меню и автопароль — настройки фракций не трогаем
            save_settings({
                'gang_menu_key':     menu_key or 'Alt+0',
                'auto_password':     auto_password,
                'use_auto_password': bool(auto_password),
            })
        else:
            save_settings({
                'callsign':         callsign if use_callsign else '',
                'use_callsign':     bool(use_callsign),
                'auto_password':    auto_password,
                'menu_key':         menu_key or 'Alt+0',
                'licensor_helper':  _lh,
                'auto_reissue_lic': bool(auto_reissue_lic) and _is_pravo,
                'reissue_key':      _safe_reissue_key if (auto_reissue_lic and _is_pravo) else '',
                'givelic_key':      _safe_givelic_key if _is_pravo else '',
                # На Hassle клавиш нет — кнопка «Выдать лицензию» заменяет хоткей.
                # Поэтому givelic_on = True если галочка стоит (givelic_button_on),
                # даже когда givelic_key пуст (ключ не нужен на телефоне).
                'givelic_on':       (bool(_safe_givelic_key) or bool(givelic_button_on)) and _is_pravo,
            })
        result_event = threading.Event()
        result_data = {"ok": False, "message": "Неизвестная ошибка"}

        def run():
            nonlocal app_folder
            tmp_dir = None
            try:
                if not self._hassle_adb_ready():
                    result_data["message"] = "ADB не готов. Проверьте интернет и повторите."
                    return
                param = self._hassle_device_param()
                if not param:
                    result_data["message"] = "Телефон не найден. Включите отладку по USB и подтвердите доступ."
                    return
                if not app_folder:
                    saved_folder = load_settings().get("hassle_app_folder", "")
                    apps = self.hassle_detect_apps()
                    if not apps.get("ok") or not apps.get("folders"):
                        result_data["message"] = apps.get("message", "Папка игры не найдена")
                        return
                    folders = apps["folders"]
                    app_folder = saved_folder if saved_folder in folders else folders[0]
                remote_dir = f"{HASSLE_STORAGE}/{app_folder}/files/Assets/webview/assets"
                index_name = self._hassle_remote_index_name(param, remote_dir)
                if not index_name:
                    result_data["message"] = "Index.js не найден в папке игры на телефоне."
                    return
                remote_index = f"{remote_dir}/{index_name}"
                tmp_dir = tempfile.mkdtemp(prefix="ahk_hassle_")
                local_index = Path(tmp_dir) / index_name
                r = self._hassle_adb(param + ["pull", remote_index, str(local_index)], timeout=90)
                if r.returncode != 0 or not local_index.exists():
                    result_data["message"] = "Не удалось скачать Index.js с телефона."
                    return
                content = local_index.read_text(encoding="utf-8", errors="ignore")
                content = self._remove_all_hassle_markers(content)
                dept = department or load_settings().get("department", "mvd")
                code = self._hassle_build_code(dept)

                # Определяем буквы переменных из телефонного Index.js.
                # Телефон — отдельная сборка игры, буквы могут отличаться от ПК.
                # Автодетект ищет по паттернам {Preloader: и {FirstPersonConfig:{open:
                # Фоллбэк — HASSLE_DD_VAR_FALLBACK / HASSLE_FD_VAR_FALLBACK (не ПК-шные Id/bd!)
                _iface_warn_h = ""
                try:
                    dd_var_h, fd_var_h, f_name_h, d_name_h, names_ok_h, names_how_h = self._resolve_loader_names(
                        content, HASSLE_DD_VAR_FALLBACK, HASSLE_FD_VAR_FALLBACK)
                    _log_to_file(f'insert_hassle_code: dd_var="{dd_var_h}", fd_var="{fd_var_h}", f="{f_name_h}", d="{d_name_h}", ok={names_ok_h} ({names_how_h}, телефон)')
                except Exception as _e:
                    dd_var_h, fd_var_h = HASSLE_DD_VAR_FALLBACK, HASSLE_FD_VAR_FALLBACK
                    f_name_h, d_name_h, names_ok_h = LOADER_F_FALLBACK, LOADER_D_FALLBACK, False
                    _log_to_file(f'insert_hassle_code: не удалось определить буквы ({_e!r})')
                if not names_ok_h:
                    _iface_warn_h = (" Но кастом-интерфейсы НЕ зарегистрированы: не удалось определить буквы "
                                     "в Index.js телефона (смотрите лог установщика).")

                # Загружаем кастом-интерфейсы и собираем блок регистрации
                # с правильными переменными телефонного Index.js
                try:
                    ifaces_h = self._fetch_custom_interfaces(dept)
                    interfaces_block_h = (self._build_interfaces_block(ifaces_h, dd_var_h, fd_var_h, f_name_h, d_name_h)
                                          if names_ok_h else "")
                    _log_to_file(f'insert_hassle_code: interfaces_block len={len(interfaces_block_h)}, ifaces={len(ifaces_h)}')
                except Exception:
                    interfaces_block_h = ""
                    _log_to_file('insert_hassle_code: _build_interfaces_block failed, пропускаем')

                obf = self._obfuscate(code)
                new_content = (
                    content.rstrip() + "\n"
                    + self._MARK_S + "\n"
                    + interfaces_block_h + "\n"
                    + obf + "\n"
                    + self._MARK_E + "\n"
                )
                new_content = new_content.replace("\r\n", "\n").replace("\r", "\n")
                local_index.write_text(new_content, encoding="utf-8", newline="\n")

                # === ДЕПЛОЙ ЗАГРУЗЧИКОВ НА ТЕЛЕФОН ===
                # На ПК файлы загрузчиков копируются в assets/ через _deploy_custom_ui_files.
                # На Hassle делаем то же самое, но через ADB push.
                deploy_ui_url = _deploy_ui_url(dept)
                all_loader_files = [f for iface in ifaces_h for f in iface.get("files", [])]
                for filename in all_loader_files:
                    url = f"{deploy_ui_url}/{filename}"
                    try:
                        resp = requests.get(url, timeout=20)
                        resp.raise_for_status()
                        tmp_loader = Path(tmp_dir) / filename
                        tmp_loader.write_bytes(resp.content)
                        remote_dest = f"{remote_dir}/{filename}"
                        r2 = self._hassle_adb(param + ["push", str(tmp_loader), remote_dest], timeout=60)
                        if r2.returncode == 0:
                            _log_to_file(f"insert_hassle_code: запушен {filename} -> {remote_dest}")
                        else:
                            _log_to_file(f"insert_hassle_code: не удалось запушить {filename}: {r2.stderr}")
                    except Exception as e:
                        _log_to_file(f"insert_hassle_code: ошибка деплоя {filename}: {e}")
                # ======================================

                r = self._hassle_adb(param + ["push", str(local_index), remote_index], timeout=90)
                if r.returncode != 0:
                    result_data["message"] = "Не удалось записать Index.js на телефон."
                    return
                save_settings({"hassle_app_folder": app_folder})
                result_data["ok"] = True
                result_data["message"] = "Код успешно установлен!" + _iface_warn_h
                self._notify(True)
            except Exception as e:
                _log_to_file(f"insert_hassle_code: {e}")
                result_data["message"] = str(e)
            finally:
                if tmp_dir:
                    try:
                        shutil.rmtree(tmp_dir, ignore_errors=True)
                    except Exception:
                        pass
                result_event.set()

        threading.Thread(target=run, daemon=True).start()
        result_event.wait(timeout=120)
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK Installer - Hassle", 0x10 | 0x40000)
            except Exception:
                pass
        return result_data

    def remove_hassle_code(self, app_folder=None):
        """Удаляет код из Index.js на телефоне."""
        result_event = threading.Event()
        result_data = {"ok": False, "message": "Неизвестная ошибка"}

        def run():
            nonlocal app_folder
            tmp_dir = None
            try:
                if not self._hassle_adb_ready():
                    result_data["message"] = "ADB не готов."
                    return
                param = self._hassle_device_param()
                if not param:
                    result_data["message"] = "Телефон не найден."
                    return
                if not app_folder:
                    saved_folder = load_settings().get("hassle_app_folder", "")
                    apps = self.hassle_detect_apps()
                    if not apps.get("ok") or not apps.get("folders"):
                        result_data["message"] = apps.get("message", "Папка игры не найдена")
                        return
                    folders = apps["folders"]
                    app_folder = saved_folder if saved_folder in folders else folders[0]
                remote_dir = f"{HASSLE_STORAGE}/{app_folder}/files/Assets/webview/assets"
                index_name = self._hassle_remote_index_name(param, remote_dir)
                if not index_name:
                    result_data["message"] = "Index.js не найден."
                    return
                remote_index = f"{remote_dir}/{index_name}"
                tmp_dir = tempfile.mkdtemp(prefix="ahk_hassle_remove_")
                local_index = Path(tmp_dir) / index_name
                r = self._hassle_adb(param + ["pull", remote_index, str(local_index)], timeout=90)
                if r.returncode != 0 or not local_index.exists():
                    result_data["message"] = "Не удалось скачать Index.js."
                    return
                content = local_index.read_text(encoding="utf-8", errors="ignore")
                content = self._remove_all_hassle_markers(content)
                local_index.write_text(content, encoding="utf-8", newline="\n")
                r = self._hassle_adb(param + ["push", str(local_index), remote_index], timeout=90)
                if r.returncode != 0:
                    result_data["message"] = "Не удалось записать Index.js."
                    return
                result_data["ok"] = True
                result_data["message"] = "Код успешно удалён!"
                self._notify(True)
            except Exception as e:
                result_data["message"] = str(e)
            finally:
                if tmp_dir:
                    try:
                        shutil.rmtree(tmp_dir, ignore_errors=True)
                    except Exception:
                        pass
                result_event.set()

        threading.Thread(target=run, daemon=True).start()
        result_event.wait(timeout=90)
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK Installer - Hassle", 0x10 | 0x40000)
            except Exception:
                pass
        return result_data

    # ═══════════════════════════════════════════════════════════════════════
    # HASSLE 2 (ПК, UE5) — патч-pak с index.html + assets/ahk.js
    # ═══════════════════════════════════════════════════════════════════════

    @staticmethod
    def _hassle2_normalize_root(path):
        """Корень игры = папка, в которой лежит HassleOnline\\Content\\Paks
        (D:\\HASSLE GAMES\\Hassle Online). Если выбрали папку глубже
        (Binaries\\Win64, HassleOnline, Content\\Paks) — поднимаемся вверх до корня."""
        if not path:
            return None
        try:
            p = Path(path)
            for cand in [p] + list(p.parents)[:6]:
                if (cand / "HassleOnline" / "Content" / "Paks").is_dir():
                    return cand
        except Exception:
            pass
        return None

    @staticmethod
    def _hassle2_paks(root) -> Path:
        return Path(root) / "HassleOnline" / "Content" / "Paks"

    def select_hassle2_folder(self):
        r = self._window.create_file_dialog(webview.FOLDER_DIALOG, directory='/', allow_multiple=False)
        if not r or not len(r):
            return None
        root = self._hassle2_normalize_root(r[0])
        if not root:
            return {"error": "not_hassle2"}
        save_settings({'hassle2_path': str(root)})
        installed = (self._hassle2_paks(root) / (HASSLE2_PAK_NAME + '.pak')).exists()
        return {"ok": True, "path": str(root), "installed": installed}

    def _hassle2_repak(self):
        """Находит repak.exe (или скачивает его). None — если не получилось."""
        cands = []
        saved = load_settings().get('hassle2_repak', '')
        if saved:
            cands.append(Path(saved))
        cands.append(Path(resource_path('repak.exe')))
        try:
            exe_dir = Path(sys.executable).parent if getattr(sys, 'frozen', False) else Path(__file__).resolve().parent
            cands.append(exe_dir / 'repak.exe')
        except Exception:
            pass
        appdata = os.environ.get('APPDATA') or os.path.expanduser('~')
        tools_dir = Path(appdata) / _NEW_APPDATA_FOLDER / 'tools'
        dest = tools_dir / 'repak.exe'
        cands.append(dest)
        for c in cands:
            try:
                if c.is_file():
                    return c
            except Exception:
                pass
        for url in HASSLE2_REPAK_URLS:
            try:
                resp = requests.get(url, timeout=90)
                resp.raise_for_status()
                data = resp.content
                if data[:2] == b'PK':
                    with zipfile.ZipFile(io.BytesIO(data)) as z:
                        member = next((n for n in z.namelist() if n.lower().endswith('repak.exe')), None)
                        if not member:
                            continue
                        data = z.read(member)
                if data[:2] != b'MZ':
                    continue
                tools_dir.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
                _log_to_file(f'_hassle2_repak: скачан {url} -> {dest}')
                return dest
            except Exception as e:
                _log_to_file(f'_hassle2_repak: не удалось скачать {url}: {e}')
        return None

    @staticmethod
    def _hassle2_run(repak, args, timeout=60):
        kw = dict(capture_output=True, timeout=timeout)
        if os.name == 'nt':
            kw['creationflags'] = HASSLE_CREATE_NO_WINDOW
        return subprocess.run([str(repak)] + list(args), **kw)

    def _hassle2_pak_get(self, repak, pak, inner):
        """Достаёт файл из .pak через `repak get`. inner — путь внутри Main/ (index.html, assets/index.js).
        Точный вид пути repak зависит от версии, поэтому берём путь из `repak list` и пробуем варианты."""
        pak = Path(pak)
        if not pak.is_file():
            return None
        low_inner = inner.lower()
        cands = []
        try:
            r = self._hassle2_run(repak, ['list', str(pak)], timeout=90)
            for line in r.stdout.decode('utf-8', 'ignore').splitlines():
                l = line.strip().replace('\\', '/')
                ll = l.lower()
                if ll == low_inner or ll.endswith('userinterface/main/' + low_inner):
                    cands.append(l)
        except Exception as e:
            _log_to_file(f'_hassle2_pak_get: list {pak.name}: {e!r}')
        for extra in (inner, HASSLE2_MOUNT_REL + inner, HASSLE2_MOUNT + inner):
            if extra not in cands:
                cands.append(extra)
        for c in cands:
            try:
                r = self._hassle2_run(repak, ['get', str(pak), c], timeout=120)
                if r.returncode == 0 and r.stdout:
                    _log_to_file(f'_hassle2_pak_get: {pak.name}:{c} -> {len(r.stdout)} байт')
                    return r.stdout
            except Exception as e:
                _log_to_file(f'_hassle2_pak_get: get {pak.name}:{c}: {e!r}')
        _log_to_file(f'_hassle2_pak_get: {inner} не удалось достать из {pak.name}')
        return None

    @staticmethod
    def _hassle2_make_stub(paks, name, stub):
        """Пустой IoStore-контейнер (.utoc 144 байта + пустой .ucas) для патч-pak.
        Порт make_utoc.ps1 из HassleUI: заголовок берётся от родного .utoc, счётчики/флаги обнуляются."""
        import struct
        src_toc = Path(paks) / (stub + '.utoc')
        if not src_toc.is_file():
            raise Exception(f'Не найден {stub}.utoc в папке Paks — проверьте, что выбрана папка HASSLE 2.')
        src = src_toc.read_bytes()
        if len(src) < 144 or src[:16] != b'-==--==--==--==-':
            raise Exception(f'{stub}.utoc имеет неожиданный формат.')
        if struct.unpack_from('<I', src, 20)[0] != 144:
            raise Exception(f'{stub}.utoc: неожиданный размер заголовка TOC.')
        b = bytearray(src[:144])
        for off, ln in ((24, 4), (28, 4), (36, 4), (48, 4), (64, 16), (80, 1), (84, 4), (96, 4)):
            b[off:off + ln] = bytes(ln)
        b[56:64] = HASSLE2_CONTAINER_ID
        (Path(paks) / (name + '.utoc')).write_bytes(bytes(b))
        (Path(paks) / (name + '.ucas')).write_bytes(b'')

    def _hassle2_save_form(self, callsign, use_callsign, auto_password, menu_key, department,
                           auto_reissue_lic, reissue_key, givelic_key, licensor_helper, givelic_button_on):
        """Те же настройки, что сохраняет insert_hassle_code: _hassle_build_code читает их из settings.json."""
        _dept = department or load_settings().get('department', 'mvd')
        _is_pravo = _dept == 'pravo'
        _safe_reissue_key = str(reissue_key).replace('"', '').replace("'", '')[:30] if reissue_key else ''
        _safe_givelic_key = str(givelic_key).replace('"', '').replace("'", '')[:30] if givelic_key else ''
        _lh = bool(licensor_helper) and _is_pravo
        if _dept == 'gang':
            save_settings({
                'gang_menu_key':     menu_key or 'Alt+0',
                'auto_password':     auto_password,
                'use_auto_password': bool(auto_password),
            })
        else:
            save_settings({
                'callsign':         callsign if use_callsign else '',
                'use_callsign':     bool(use_callsign),
                'auto_password':    auto_password,
                'menu_key':         menu_key or 'Alt+0',
                'licensor_helper':  _lh,
                'auto_reissue_lic': bool(auto_reissue_lic) and _is_pravo,
                'reissue_key':      _safe_reissue_key if (auto_reissue_lic and _is_pravo) else '',
                'givelic_key':      _safe_givelic_key if _is_pravo else '',
                'givelic_on':       (bool(_safe_givelic_key) or bool(givelic_button_on)) and _is_pravo,
            })
        return _dept

    def _hassle2_delete_pak(self, paks):
        """Удаляет наш патч-pak (.pak/.utoc/.ucas). Возвращает список удалённых файлов."""
        removed = []
        for ext in ('.pak', '.utoc', '.ucas'):
            f = Path(paks) / (HASSLE2_PAK_NAME + ext)
            if f.exists():
                f.unlink()
                removed.append(f.name)
        return removed

    def insert_hassle2_code(self, callsign='', use_callsign=False, auto_password='',
                            menu_key='Alt+0', department=None, app_folder=None,
                            auto_reissue_lic=False, reissue_key='Alt+R',
                            givelic_key='', licensor_helper=False, givelic_button_on=False, **_kwargs):
        """HASSLE 2 (ПК): собирает патч-pak с index.html (+<script ahk.js>) и assets/ahk.js
        и кладёт его в <игра>\\HassleOnline\\Content\\Paks. Игровые pak не изменяются."""
        result_data = {"ok": False, "message": "Неизвестная ошибка"}
        tmp_dir = None
        try:
            root = self._hassle2_normalize_root(load_settings().get('hassle2_path', ''))
            if not root:
                result_data["message"] = "Папка HASSLE 2 не выбрана. Укажите папку игры, например D:\\HASSLE GAMES\\Hassle Online"
                return result_data
            paks = self._hassle2_paks(root)
            dept = self._hassle2_save_form(callsign, use_callsign, auto_password, menu_key, department,
                                           auto_reissue_lic, reissue_key, givelic_key, licensor_helper, givelic_button_on)

            repak = self._hassle2_repak()
            if not repak:
                result_data["message"] = ("Не найден repak.exe. Положите repak.exe рядом с установщиком "
                                          "(или загрузите в installerEXE/ на GitHub) и повторите.")
                return result_data

            code = self._hassle_build_code(dept)
            if not code:
                result_data["message"] = "Загруженные данные пусты."
                return result_data

            tmp_dir = tempfile.mkdtemp(prefix="ahk_hassle2_")
            main = Path(tmp_dir) / "Main"
            assets = main / "assets"
            assets.mkdir(parents=True)
            orig_pak = paks / HASSLE2_ORIG_PAK

            # 1) оригинальный index.html игры (из pak; если не вышло — копия из FModel-экспорта)
            html_old, html_src = None, 'встроенная копия'
            raw = self._hassle2_pak_get(repak, orig_pak, 'index.html')
            if raw:
                try:
                    txt = raw.decode('utf-8-sig')
                    if '<html' in txt.lower() and '</head' in txt.lower():
                        html_old, html_src = txt, 'из pak игры'
                except Exception:
                    pass
            if html_old is None:
                html_old = HASSLE2_INDEX_FALLBACK
            html_new = self._html_add_block(html_old)
            with open(main / "index.html", 'w', encoding='utf-8', newline='') as f:
                f.write(html_new)

            # 2) index.js игры — только чтобы определить буквы Vue-хелперов для загрузчиков интерфейсов
            index_text = None
            for p in (orig_pak, paks / HASSLE2_MOD_PAK_UI):
                rawjs = self._hassle2_pak_get(repak, p, 'assets/index.js')
                if rawjs and len(rawjs) > 100000:
                    index_text = rawjs.decode('utf-8', 'ignore')
                    break

            # 3) кастом-интерфейсы + assets/ahk.js
            ifaces = self._fetch_custom_interfaces(dept)
            self._deploy_custom_ui_files(ifaces, dept, assets_dir=assets, index_text=index_text)
            _, code_clean = self._split_hud_patch(code)   # HUD-патч Radmir для Hassle 2 не нужен
            obf = self._obfuscate(code_clean)
            module_text = self._build_ahk_module(ifaces, obf, False)
            with open(assets / "ahk.js", 'w', encoding='utf-8', newline='\n') as f:
                f.write(module_text)
            _log_to_file(f'insert_hassle2_code: index.html {html_src}, ifaces={len(ifaces)}, index.js из pak={index_text is not None}')

            # 4) pack -> Paks
            try:
                self._hassle2_delete_pak(paks)
            except PermissionError:
                result_data["message"] = "Файл заблокирован! Закройте игру (HASSLE 2) и повторите попытку."
                return result_data
            pak_out = paks / (HASSLE2_PAK_NAME + '.pak')
            kw = dict(capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=180)
            if os.name == 'nt':
                kw['creationflags'] = HASSLE_CREATE_NO_WINDOW
            r = subprocess.run([str(repak), 'pack', '--version', HASSLE2_PAK_VERSION,
                                '--mount-point', HASSLE2_MOUNT, str(main), str(pak_out)], **kw)
            if r.returncode != 0 or not pak_out.exists():
                tail = ((r.stderr or r.stdout or '').strip().splitlines() or [''])[-1]
                _log_to_file(f'insert_hassle2_code: repak pack code={r.returncode}\n{r.stdout}\n{r.stderr}')
                result_data["message"] = f"repak не смог собрать pak: {tail}"
                return result_data
            try:
                self._hassle2_make_stub(paks, HASSLE2_PAK_NAME, HASSLE2_STUB)
            except Exception:
                try:
                    self._hassle2_delete_pak(paks)
                except Exception:
                    pass
                raise

            save_settings({'hassle2_path': str(root)})
            result_data["ok"] = True
            result_data["message"] = "Код установлен! Перезапустите HASSLE 2."
            if index_text is None:
                result_data["message"] += (" (Не удалось прочитать index.js из pak — кастом-интерфейсы "
                                           "могут не открыться, см. лог установщика.)")
        except PermissionError:
            result_data["message"] = "Файл заблокирован! Закройте игру (HASSLE 2) и повторите попытку."
        except Exception as e:
            import traceback
            _log_to_file(f'insert_hassle2_code: {e!r}\n{traceback.format_exc()}')
            result_data["message"] = str(e)
        finally:
            if tmp_dir:
                shutil.rmtree(tmp_dir, ignore_errors=True)
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK Installer - HASSLE 2", 0x10 | 0x40000)
            except Exception:
                pass
        return result_data

    def remove_hassle2_code(self):
        """Удаляет патч-pak HASSLE 2 (игра возвращается к родному index.html)."""
        result_data = {"ok": False, "message": "Неизвестная ошибка"}
        try:
            root = self._hassle2_normalize_root(load_settings().get('hassle2_path', ''))
            if not root:
                result_data["message"] = "Папка HASSLE 2 не выбрана."
            else:
                removed = self._hassle2_delete_pak(self._hassle2_paks(root))
                result_data["ok"] = True
                result_data["message"] = "Код удалён" if removed else "Код не был установлен"
        except PermissionError:
            result_data["message"] = "Файл заблокирован игрой! Закройте HASSLE 2."
        except Exception as e:
            result_data["message"] = str(e)
        if not result_data["ok"]:
            try:
                import ctypes
                ctypes.windll.user32.MessageBoxW(0, result_data["message"], "AHK Installer - HASSLE 2", 0x10 | 0x40000)
            except Exception:
                pass
        return result_data

    def close_app(self):
        if self._window: self._window.destroy()

    def minimize_app(self):
        if self._window: self._window.minimize()

    def open_url(self, url):
        import webbrowser
        webbrowser.open(url)


# ═══════════════════════════════════════════════════════
#  MAIN — сначала авторизация, потом установщик
# ═══════════════════════════════════════════════════════

def main():
    hwid = get_hwid()
    result = run_auth_with_ui(hwid)

    if not result.get("done"):      # окно проверки закрыли, не дождавшись результата
        return

    if result["failed"]:
        show_no_internet_window()
        return

    if not result["authorized"]:
        show_denied_window(hwid)
        return

    html_tmp = fetch_html()
    url = f"file:///{html_tmp.replace(os.sep, '/')}"
    api = InstallerAPI()
    w = webview.create_window(
        title="AHK Installer", url=url, js_api=api,
        width=860, height=640, resizable=False,
        frameless=True, easy_drag=True,
        background_color="#111114", confirm_close=False,
    )
    api._window = w
    
    ico = resource_path("icon.ico")
    try:
        webview.start(icon=ico if os.path.exists(ico) else None, debug=False)
    except TypeError:
        webview.start(debug=False)
    try:
        import shutil
        shutil.rmtree(os.path.dirname(html_tmp), ignore_errors=True)
    except: pass


if __name__ == '__main__':
    main()
