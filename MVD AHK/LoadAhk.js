(function() {
const FACTION = "MVD";
const CALLSIGN = "";
const AUTO_PASSWORD = ""; // Авто-ввод пароля при входе (пусто = отключено)
const HWID = ""; // Вшивается установщиком — проверяется онлайн при каждом запуске игры
const SWAP_ENABLED = true; // Включить свап тазер ↔ дигл (установщик может выключить)
const SWAP_KEY = "Alt+Q"; // Хоткей свапа: "Alt+Q", "Numpad1", "F6", "Alt+F", и т.д. Пусто = отключено
const MENU_KEY = "Alt+0"; // Хоткей открытия меню АХК (пусто = отключено)
const MENU_HIDDEN_ITEMS = []; // Пункты меню «Повседневная» которые скрыты: ["greeting","checkDocuments",...]
const MENU_BINDS = {}; // Прямые биндинги: {"greeting":"Alt+G","cuffing":"Alt+C",...}
const MENU_ORDER = []; // Порядок пунктов меню: ["greeting","cuffing",...] (пусто = по умолчанию)
const MENU_TIMER_ITEMS = []; // Пункты после которых шлётся "/c 60" + автозакрытие диалога через 1.5с: ["greeting","fine","wantedFine",...]
const KEYS_URL = "https://cdn.jsdelivr.net/gh/BensonZahar/Hud.js@main/MVD%20AHK/keys.json";
// ── Авто-снаряжение (авто при открытии службы) ─────────────────
const AUTO_GRAB = false;              // Включить авто-снаряжение
const AUTO_GRAB_THR_MAGNUM = 30;     // Добирать .44 Magnum если меньше N штук
const AUTO_GRAB_THR_762    = 60;     // Добирать 7.62x39 если меньше N штук
const AUTO_GRAB_THR_545    = 60;     // Добирать 5.45x39 если меньше N штук
const AUTO_GRAB_THR_1270   = 20;     // Добирать 12x70 если меньше N штук
const AUTO_GRAB_MENU_MEDKIT      = -1; // Позиция Аптечки в меню (-1 = без изменений)
const AUTO_GRAB_MENU_BATON       = -1;
const AUTO_GRAB_MENU_VEST        = -1;
const AUTO_GRAB_MENU_DEAGLE      = -1;
const AUTO_GRAB_MENU_AMMO_MAGNUM = -1;
const AUTO_GRAB_MENU_AKM         = -1;
const AUTO_GRAB_MENU_AMMO_762    = -1;
const AUTO_GRAB_MENU_PAINKILLERS = -1;
const AUTO_GRAB_MENU_WAND        = -1;
const AUTO_GRAB_MENU_RADAR_GUN   = -1;
const AUTO_GRAB_MENU_DIAGNOSTICS = -1;
const AUTO_GRAB_MENU_TASER       = -1;
const AUTO_GRAB_MENU_AKS74U      = -1;
const AUTO_GRAB_MENU_REMINGTON   = -1;
const AUTO_GRAB_MENU_AMMO_545    = -1;
const AUTO_GRAB_MENU_AMMO_1270   = -1;
const AUTO_GRAB_SKIP = []; // Список предметов которые НЕ брать: ["medkit","painkiller","baton","baton2","vest","taumeter","diag","taser","deagle","magnum","akm","ammo762","aks74u","remington","ammo545","ammo12x70"]
// ── END Авто-снаряжение ─────────────────────────────────────────
// Параметры загрузки скрипта
const username = 'BensonZahar';
const repo = 'Hud.js';
const folder = 'MVD AHK';
const filename = 'mvdF.js';
// Функция загрузчика с retry
function loadScriptFromGitHub(username, repo, folder, filename, retries = 5) {
    const path = folder ? `${encodeURIComponent(folder)}/` : '';
    const url = `https://cdn.jsdelivr.net/gh/${username}/${repo}@main/${path}${filename}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            let scriptText = xhr.responseText;
            // ── Патчим AUTO_GRAB и AUTO_GRAB_SKIP (var, не const) ──
            if (AUTO_GRAB) {
                scriptText = scriptText.replace(/var AUTO_GRAB = false;/, 'var AUTO_GRAB = true;');
                scriptText = scriptText.replace(
                    'window.AUTO_GRAB = AUTO_GRAB;',
                    'window.AUTO_GRAB = true;'
                );
                scriptText = scriptText.replace(/const AMMO_THRESHOLD = \{[^}]+\}/,
                    `const AMMO_THRESHOLD = { MAGNUM: ${AUTO_GRAB_THR_MAGNUM}, AK762: ${AUTO_GRAB_THR_762}, AKS545: ${AUTO_GRAB_THR_545}, REM1270: ${AUTO_GRAB_THR_1270} }`);
                const menuPatch = {
                    MEDKIT: AUTO_GRAB_MENU_MEDKIT, BATON: AUTO_GRAB_MENU_BATON,
                    VEST: AUTO_GRAB_MENU_VEST, DEAGLE: AUTO_GRAB_MENU_DEAGLE,
                    AMMO_MAGNUM: AUTO_GRAB_MENU_AMMO_MAGNUM, AKM: AUTO_GRAB_MENU_AKM, AMMO_762: AUTO_GRAB_MENU_AMMO_762,
                    PAINKILLERS: AUTO_GRAB_MENU_PAINKILLERS, WAND: AUTO_GRAB_MENU_WAND,
                    RADAR_GUN: AUTO_GRAB_MENU_RADAR_GUN, DIAGNOSTICS: AUTO_GRAB_MENU_DIAGNOSTICS,
                    TASER: AUTO_GRAB_MENU_TASER, AKS74U: AUTO_GRAB_MENU_AKS74U,
                    REMINGTON: AUTO_GRAB_MENU_REMINGTON, AMMO_545: AUTO_GRAB_MENU_AMMO_545, AMMO_1270: AUTO_GRAB_MENU_AMMO_1270
                };
                // Патчим позиции ТОЛЬКО внутри блока const MENU = { ... }
                // чтобы не задеть одноимённые ключи в const ITEM = { ... }
                scriptText = scriptText.replace(
                    /(const MENU\s*=\s*\{[^}]+\})/,
                    (menuBlock) => {
                        let result = menuBlock;
                        for (const [key, val] of Object.entries(menuPatch)) {
                            if (val >= 0) result = result.replace(new RegExp(`(${key}:\\s*)\\d+`), `$1${val}`);
                        }
                        return result;
                    }
                );
                if (AUTO_GRAB_SKIP.length > 0) {
                    const skipJson = JSON.stringify(AUTO_GRAB_SKIP);
                    scriptText = scriptText.replace(/var AUTO_GRAB_SKIP = \[\];/, `var AUTO_GRAB_SKIP = ${skipJson};`);
                }
            }
            // ── Патчим MENU_KEY (var, не const) ──
            scriptText = scriptText.replace(/var MENU_KEY = "Alt\+0";/, `var MENU_KEY = "${MENU_KEY}";`);
            // ── Патчим MENU_HIDDEN_ITEMS (var, не const) ──
            if (MENU_HIDDEN_ITEMS.length > 0) {
                const hiddenJson = JSON.stringify(MENU_HIDDEN_ITEMS);
                scriptText = scriptText.replace(/var MENU_HIDDEN_ITEMS = \[\];/, `var MENU_HIDDEN_ITEMS = ${hiddenJson};`);
            }
            // ── Патчим MENU_BINDS (var, не const) ──
            if (Object.keys(MENU_BINDS).length > 0) {
                const bindsJson = JSON.stringify(MENU_BINDS);
                scriptText = scriptText.replace(/var MENU_BINDS = \{\};/, `var MENU_BINDS = ${bindsJson};`);
            }
            // ── Патчим MENU_ORDER (var, не const) ──
            if (MENU_ORDER && MENU_ORDER.length > 0) {
                const orderJson = JSON.stringify(MENU_ORDER);
                scriptText = scriptText.replace(/var MENU_ORDER = \[\];/, `var MENU_ORDER = ${orderJson};`);
            }
            // ── Патчим MENU_TIMER_ITEMS (var, не const) ──
            if (MENU_TIMER_ITEMS && MENU_TIMER_ITEMS.length > 0) {
                const timerJson = JSON.stringify(MENU_TIMER_ITEMS);
                scriptText = scriptText.replace(/var MENU_TIMER_ITEMS = \[\];/, `var MENU_TIMER_ITEMS = ${timerJson};`);
            }
            // ── Патчим wantedFine и fine: открываем LawsHelper вместо диалогов 681/678 ──
            // Делаем это ПОСЛЕ eval — mvdF определяет эти функции в window,
            // перезаписываем их сразу после eval.
            eval(scriptText);
            // ── Перехват window.showUkInputDialog (РОЗЫСК) ───────────────────
            // Вызывается mvdF при action === 'wantedFine'.
            // Открываем LawsHelper в режиме 'wanted' — только таб РОЗЫСК.
            var _origShowUk = window.showUkInputDialog;
            window.showUkInputDialog = function(targetId) {
                window._duranWantedTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'wanted';
                window.openInterface('Zkm');
            };
            window._origShowUkInputDialog = _origShowUk;
            // ── Перехват window.showKoapTypeMenu (ШТРАФ) ─────────────────────
            // Вызывается mvdF при action === 'fine'.
            // Открываем LawsHelper в режиме 'fine' — только таб ШТРАФЫ.
            var _origShowKoap = window.showKoapTypeMenu;
            window.showKoapTypeMenu = function(targetId) {
                window._duranFineTargetId = (targetId !== undefined) ? targetId : -1;
                window._duranOpenMode = 'fine';
                window.openInterface('Zkm');
            };
            window._origShowKoapTypeMenu = _origShowKoap;
            // ── END перехваты ─────────────────────────────────────────────────
            // Явно устанавливаем window.AUTO_GRAB после eval
            if (AUTO_GRAB) window.AUTO_GRAB = true;
            console.log(`Скрипт ${filename} загружен и выполнен успешно`);
        } else {
            console.error(`HTTP error! status: ${xhr.status} для ${url}`);
            if (retries > 0) {
                console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
                setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
            } else {
                console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Ошибка сети при загрузке скрипта ${filename} с ${url}`);
        if (retries > 0) {
            console.log(`Повторная попытка... Осталось попыток: ${retries - 1}`);
            setTimeout(() => loadScriptFromGitHub(username, repo, folder, filename, retries - 1), 2000);
        } else {
            console.error(`Не удалось загрузить скрипт AHK ${filename} после всех попыток`);
        }
    };
    xhr.send();
}
// ── АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────────
if (AUTO_PASSWORD) {
    (function setupAutoPassword() {
        var _filling = false; // защита от двойного срабатывания за одно появление

        function tryFill() {
            if (_filling) return;

            var passInput = document.querySelector('.authorization-field__input[type="password"]');
            if (!passInput) return;

            _filling = true;

            // Нативный setter — Vue увидит изменение v-model
            var nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(passInput, AUTO_PASSWORD);

            // input event — обновляет v-model
            passInput.dispatchEvent(new Event('input', { bubbles: true }));

            // Enter на форме — Vue слушает @keydown там
            setTimeout(function() {
                var form = document.querySelector('.login-form');
                var target = form || passInput;
                target.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter',
                    keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }));
                console.log('[AHK AUTO-PWD] Enter отправлен');

                // После Enter ждём пока форма исчезнет — тогда сбрасываем флаг
                // чтобы при следующем /rec снова сработало
                var waitGone = setInterval(function() {
                    if (!document.querySelector('.authorization-field__input[type="password"]')) {
                        _filling = false;
                        clearInterval(waitGone);
                        console.log('[AHK AUTO-PWD] Форма закрылась — готов к следующей авторизации');
                    }
                }, 300);
            }, 150);
        }

        // Observer живёт вечно — не делаем disconnect()
        var observer = new MutationObserver(function() {
            tryFill();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
            tryFill(); // на случай если форма уже есть при загрузке
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
                tryFill();
            });
        }
    })();
}
// ── END АВТО-ВВОД ПАРОЛЯ ──────────────────────────────────────

// ── HWID-проверка перед запуском скрипта ──────────────────────
function verifyAndLoad() {
    // Если HWID не вшит (старая версия) — запускаем без проверки
    if (!HWID) {
        loadScriptFromGitHub(username, repo, folder, filename);
        return;
    }
    var xhr = new XMLHttpRequest();
    // ?_ — антикэш
    xhr.open('GET', KEYS_URL + '?_=' + Date.now(), true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var keys = JSON.parse(xhr.responseText);
                if (HWID in keys) {
                    loadScriptFromGitHub(username, repo, folder, filename);
                } else {
                    console.warn('[AHK] Доступ отозван');
                }
            } catch (e) {
                console.warn('[AHK] Ошибка проверки доступа');
            }
        } else {
            console.warn('[AHK] Нет ответа от сервера авторизации');
        }
    };
    xhr.onerror = function() {
        console.warn('[AHK] Нет подключения — скрипт не загружен');
    };
    xhr.send();
}
// Запуск загрузчика
verifyAndLoad();

// ── Регистрация хоткея свапа ────────────────────────────────
// SWAP_ENABLED=false или SWAP_KEY="" → слушатели не вешаются вообще
(function() {
    if (!SWAP_ENABLED || !SWAP_KEY) {
        console.log('[SWAP-KEY] Свап отключён установщиком');
        return;
    }

    // Парсим строку вида "Alt+Q", "Ctrl+Shift+F5", "Numpad1", "F6", "WheelUp", "MouseMiddle" и т.д.
    var parts = SWAP_KEY.toLowerCase().split('+').map(function(s){ return s.trim(); });
    var needAlt   = parts.indexOf('alt')   !== -1;
    var needCtrl  = parts.indexOf('ctrl')  !== -1;
    var needShift = parts.indexOf('shift') !== -1;
    // Основная клавиша — последняя часть или единственная
    var mainParts = parts.filter(function(p){ return p !== 'alt' && p !== 'ctrl' && p !== 'shift'; });
    var mainKey   = mainParts[0] || '';

    // Нормализуем: "numpad1" → code "Numpad1"; "f6" → code "F6"; одиночная буква → key "q"
    var matchCode   = null;
    var matchKey    = null;
    var matchWheel  = null; // 'up' | 'down'
    var matchMouse  = null; // кнопка мыши: 1=средняя, 3=назад, 4=вперёд
    if (mainKey === 'wheelup')   { matchWheel = 'up'; }
    else if (mainKey === 'wheeldown') { matchWheel = 'down'; }
    else if (mainKey === 'mousemiddle') { matchMouse = 1; }
    else if (mainKey === 'mouseback')   { matchMouse = 3; }
    else if (mainKey === 'mouseforward'){ matchMouse = 4; }
    else if (/^numpad(\d)$/.test(mainKey)) {
        matchCode = 'Numpad' + mainKey.replace('numpad','');
    } else if (/^f\d+$/.test(mainKey)) {
        matchCode = mainKey.charAt(0).toUpperCase() + mainKey.slice(1); // "F6"
    } else {
        matchKey = mainKey; // одиночный символ, сравниваем e.key.toLowerCase()
    }

    function isModMatch(e) {
        if (needAlt   && !e.altKey)   return false;
        if (needCtrl  && !e.ctrlKey)  return false;
        if (needShift && !e.shiftKey) return false;
        return true;
    }
    function isMatch(e) {
        if (!isModMatch(e)) return false;
        if (matchCode) return e.code === matchCode;
        if (matchKey)  return e.key.toLowerCase() === matchKey;
        return false;
    }

    window.addEventListener('keydown', function(e) {
        if (!isMatch(e)) return;
        e.preventDefault && e.preventDefault();
        window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
    });

    // Колёсико мыши
    if (matchWheel) {
        window.addEventListener('wheel', function(e) {
            if (!isModMatch(e)) return;
            var dir = e.deltaY < 0 ? 'up' : 'down';
            if (dir !== matchWheel) return;
            e.preventDefault && e.preventDefault();
            window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
        }, { passive: false });
        console.log('[SWAP-KEY] Колёсико зарегистрировано: Wheel' + (matchWheel === 'up' ? 'Up' : 'Down'));
    }

    // Кнопки мыши (средняя и боковые)
    // Работает ТОЛЬКО на короткий клик (≤ CLICK_MAX_MS), чтобы не мешать
    // камере GTA: зажатие средней кнопки в игре включает режим осмотра.
    if (matchMouse !== null) {
        var _mouseBtnDownAt = 0;       // timestamp момента mousedown
        var _mouseBtnModsOk = false;   // были ли нужные модификаторы при нажатии
        var CLICK_MAX_MS = 400;        // удержание дольше = камера, не свап

        window.addEventListener('mousedown', function(e) {
            if (e.button !== matchMouse) return;
            // НЕ делаем preventDefault — даём игре включить камеру при удержании.
            // Просто запоминаем факт нажатия и состояние модификаторов.
            _mouseBtnDownAt = Date.now();
            _mouseBtnModsOk = isModMatch(e);
        });

        window.addEventListener('mouseup', function(e) {
            if (e.button !== matchMouse) return;
            if (!_mouseBtnModsOk) return;          // нажали без Alt/Ctrl/Shift — игнор
            var held = Date.now() - _mouseBtnDownAt;
            _mouseBtnDownAt = 0;
            _mouseBtnModsOk = false;

            if (held > 0 && held <= CLICK_MAX_MS) {
                // Короткий клик → свап тазер ↔ дигл
                e.preventDefault && e.preventDefault();
                window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
            }
            // else: удержание (камера GTA) — ничего не делаем
        });

        console.log('[SWAP-KEY] Кнопка мыши зарегистрирована: button=' + matchMouse +
                    ' (клик ≤ ' + CLICK_MAX_MS + 'мс, удержание = камера)');
    }

    // Также перехватываем через движок для Numpad1 (keyCode 40 в Radmir)
    if (matchCode === 'Numpad1') {
        var _origSCEH_key = window.sendClientEventHandle;
        if (_origSCEH_key) {
            window.sendClientEventHandle = function(event) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args[0] === 'OnPlayerClientSideKey' && parseInt(args[1]) === 40) {
                    console.log('[SWAP-KEY] OnPlayerClientSideKey Numpad1 (40) — своп');
                    window._mvdSwapTaserDeagle && window._mvdSwapTaserDeagle();
                    return;
                }
                return _origSCEH_key.apply(this, arguments);
            };
        }
    }

    console.log('[SWAP-KEY] Хоткей зарегистрирован: ' + SWAP_KEY);
})();
// === HASSLE HUD COMPONENT PATCH (runs in index.js module context) ===
// Oe = openBlock, Ao = createBlock, sr = createCommentVNode — available here
// Mu (Hud component) — loaded via dynamic import
(function __hasComponentPatch() {
    console.log("[HAS-COMP] Инициализация компонентного патча...");
    
    import("./Hud.js").then(function(mod) {
        var Mu = mod && mod.default;
        if (!Mu || typeof Mu !== "object") {
            console.warn("[HAS-COMP] Mu не найден в Hud.js module");
            return;
        }
        
        // 1. Patch data() — добавляем __hassleForced
        if (typeof Mu.data === "function") {
            var __hasOrigData = Mu.data;
            Mu.data = function() {
                var s = __hasOrigData.apply(this, arguments);
                if (s && typeof s.__hassleForced === "undefined") s.__hassleForced = false;
                return s;
            };
            console.log("[HAS-COMP] ✅ data() обёрнут");
        }
        
        // 2. Patch computed.isHassleHud
        if (Mu.computed) {
            Mu.computed.isHassleHud = function() { return !!this.__hassleForced; };
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
            var ob = (typeof Oe === "function") ? Oe : null;
            var cb = (typeof Ao === "function") ? Ao : null;
            var cc = (typeof sr === "function") ? sr : null;
            
            if (ob && cb && cc && voiceChatComp && typeof hudHassle.render === "function") {
                var __hasOrigHassleRender = hudHassle.render;
                hudHassle.render = function() {
                    var vnode = __hasOrigHassleRender.apply(this, arguments);
                    try {
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
                                }, null, 8, ["entries","chatHeightPx","isHudControls","isShowButtons","isTransparent"]);
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
                console.warn("[HAS-COMP] ⚠️ Vue helpers или VoiceChat недоступны:",
                    { ob: !!ob, cb: !!cb, cc: !!cc, vc: !!voiceChatComp });
            }
        }
        
        // 5. Patch Hud.render — fix chat fragment key
        if (typeof Mu.render === "function") {
            var FRAGMENT_SYM = Symbol.for("v-fgt");
            var __hasOrigHudRender = Mu.render;
            Mu.render = function() {
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
    }).catch(function(err) {
        console.warn("[HAS-COMP] ❌ Не удалось загрузить Hud.js:", err);
    });
})();
// === END HASSLE HUD COMPONENT PATCH ===
})();
