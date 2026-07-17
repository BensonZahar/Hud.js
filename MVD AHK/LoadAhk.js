// === HASSLE HUD PATCH (FIXED — chat preservation, универсальный для Hud.js и index.js) ===
(function(){
console.log("[HAS] патч запускается");

// ═══════════════════════════════════════════════════════════════════════════════
// УНИВЕРСАЛЬНОСТЬ (Hud.js ИЛИ index.js)
// ═══════════════════════════════════════════════════════════════════════════════
function __hasLooksLikeHudComp(x) {
    return !!x && typeof x === "object" &&
        (typeof x.data === "function" || !!x.computed || !!x.components);
}

function __hasFindVueHelpers() {
    var ob = null, cb = null, cc = null;
    try { if (typeof o === "function") ob = o; } catch (e) {}
    try { if (typeof w === "function") cb = w; } catch (e) {}
    try { if (typeof h === "function") cc = h; } catch (e) {}
    try { if (!ob && typeof Oe === "function") ob = Oe; } catch (e) {}
    try { if (!cb && typeof Ao === "function") cb = Ao; } catch (e) {}
    try { if (!cc && typeof sr === "function") cc = sr; } catch (e) {}
    return { openBlock: ob, createBlock: cb, createCommentVNode: cc };
}

function __hasPatchHudComponent(__hasComp) {
    if (!__hasComp) { console.warn("[HAS] __hasPatchHudComponent вызван без компонента"); return; }

    if (typeof __hasComp.data === "function") {
        var __hasOrigData = __hasComp.data;
        __hasComp.data = function() {
            var s = __hasOrigData.apply(this, arguments);
            if (s && typeof s.__hassleForced === "undefined") s.__hassleForced = false;
            return s;
        };
        console.log("[HAS] data() обёрнут, __hassleForced будет добавлен");
    } else {
        console.warn("[HAS] Hud.data не функция — обёртка data() НЕ применена", __hasComp);
    }

    if (__hasComp.computed) {
        __hasComp.computed.isHassleHud = function() { return this.__hassleForced; };
        console.log("[HAS] computed.isHassleHud переопределён");
    } else {
        console.warn("[HAS] Hud.computed отсутствует — computed НЕ переопределён", __hasComp);
    }

    if (__hasComp.components && __hasComp.components.RadmirChat) {
        var __hasRadmirChatComp = __hasComp.components.RadmirChat;
        if (__hasRadmirChatComp.props) {
            if (__hasRadmirChatComp.props.isHudControls) __hasRadmirChatComp.props.isHudControls.default = true;
            if (__hasRadmirChatComp.props.canChatFadeout) __hasRadmirChatComp.props.canChatFadeout.default = true;
            if (__hasRadmirChatComp.props.useChatAnimation) __hasRadmirChatComp.props.useChatAnimation.default = true;
        }
        __hasComp.components.Chat = __hasRadmirChatComp;
        console.log("[HAS] components.Chat подменён на RadmirChat, дефолты форсированы");
    } else {
        console.warn("[HAS] Hud.components.RadmirChat не найден — подмена чат-компонента НЕ выполнена", __hasComp);
    }

    if (__hasComp.components && __hasComp.components.HudHassle && __hasComp.components.HudRadmir) {
        var __hasHudHassleComp = __hasComp.components.HudHassle;
        var __hasVoiceChatComp = __hasComp.components.HudRadmir.components && __hasComp.components.HudRadmir.components.VoiceChat;
        var __hasHelpers = __hasFindVueHelpers();
        var __hasBlockHelpersOk = typeof __hasHelpers.openBlock === "function" && typeof __hasHelpers.createBlock === "function" && typeof __hasHelpers.createCommentVNode === "function";
        if (!__hasBlockHelpersOk) {
            console.warn("[HAS] openBlock/createBlock/createCommentVNode недоступны в этой области видимости — VoiceChat-патч отключён во избежание краша");
        }
        if (__hasBlockHelpersOk && __hasVoiceChatComp && typeof __hasHudHassleComp.render === "function") {
            var __hasOrigHassleRender = __hasHudHassleComp.render;
            var o = __hasHelpers.openBlock, w = __hasHelpers.createBlock, h = __hasHelpers.createCommentVNode;
            __hasHudHassleComp.render = function() {
                var vnode = __hasOrigHassleRender.apply(this, arguments);
                try {
                    var props = arguments[2] || {};
                    var dataObj = props.data;
                    if (vnode && Array.isArray(vnode.children)) {
                        var showVoice = !!(dataObj && dataObj.useChat && dataObj.voiceChat && dataObj.voiceChat.show);
                        var vcNode;
                        if (showVoice) {
                            var chatFontSize = (window.App && window.App.chatFontSize) || 0;
                            var chatPageSize = (window.App && window.App.chatPageSize) || 1;
                            var chatHeightPx = (window.App && typeof window.App.vhToPx === "function") ? window.App.vhToPx(2.22 + 0.15 * chatFontSize) * chatPageSize : 0;
                            o();
                            vcNode = w(__hasVoiceChatComp, {
                                key: 0,
                                entries: dataObj.voiceChat.entries,
                                chatHeightPx: chatHeightPx,
                                isHudControls: dataObj.isHudControls,
                                isShowButtons: dataObj.voiceChat.showButtons,
                                isTransparent: window.isOpenedChat ? window.isOpenedChat() : false
                            }, null, 8, ["entries", "chatHeightPx", "isHudControls", "isShowButtons", "isTransparent"]);
                        } else {
                            vcNode = h("", true);
                        }
                        vnode.children.push(vcNode);
                        if (Array.isArray(vnode.dynamicChildren)) { vnode.dynamicChildren.push(vcNode); }
                    }
                } catch (err) { console.warn("[HAS] не удалось добавить VoiceChat внутрь HudHassle", err); }
                return vnode;
            };
            console.log("[HAS] HudHassle.render обёрнут — VoiceChat дорисовывается вручную (стабильная позиция, как у Radmir)");
        } else {
            console.warn("[HAS] не нашёл HudRadmir.components.VoiceChat, HudHassle.render или Vue-хелперы — VoiceChat в Hassle НЕ добавлен", __hasComp.components);
        }
    }

    var FRAGMENT_SYM = Symbol.for("v-fgt");

    function __hasFixChatFragmentKey(vnode) {
        if (!vnode) return;

        if (vnode.type === FRAGMENT_SYM && (vnode.key === 2 || vnode.key === 3)) {
            if (vnode.children && vnode.children.length > 0) {
                var hasChatRef = false;
                for (var i = 0; i < vnode.children.length; i++) {
                    var child = vnode.children[i];
                    if (child && child.props && child.props.ref === "chat") {
                        hasChatRef = true;
                        break;
                    }
                }
                if (hasChatRef) {
                    vnode.key = "__has_chat_fixed__";
                }
            }
        }

        if (vnode.children && Array.isArray(vnode.children)) {
            for (var j = 0; j < vnode.children.length; j++) {
                __hasFixChatFragmentKey(vnode.children[j]);
            }
        }
    }

    if (typeof __hasComp.render === "function") {
        var __hasOrigHudRender = __hasComp.render;
        __hasComp.render = function() {
            var vnode = __hasOrigHudRender.apply(this, arguments);
            try {
                __hasFixChatFragmentKey(vnode);
            } catch (err) {
                console.warn("[HAS] fixChatFragmentKey error:", err);
            }
            return vnode;
        };
        console.log("[HAS] Hud.render обёрнут — Fragment key чата будет зафиксирован");
    }
}

(function __hasInitCompPatch() {
    var comp = null;
    try { if (typeof Mu !== "undefined" && __hasLooksLikeHudComp(Mu)) comp = Mu; } catch (e) {}

    if (comp) {
        __hasPatchHudComponent(comp);
    } else {
        console.log("[HAS] Mu не найден/не похож на компонент Hud в этой области видимости — подгружаю чанк Hud.js вручную");
        import("./Hud.js").then(function(mod) {
            var loadedComp = mod && mod.default;
            if (__hasLooksLikeHudComp(loadedComp)) {
                __hasPatchHudComponent(loadedComp);
            } else {
                console.warn("[HAS] не удалось получить компонент Hud из чанка Hud.js", mod);
            }
        }).catch(function(err) {
            console.warn("[HAS] не удалось подгрузить чанк Hud.js", err);
        });
    }
})();

var __mvdChatAddFn = null;
var __mvdChatMessages = null;
var __mvdChatInst = null;

function __hasCaptureChatState() {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && hud.$refs && hud.$refs.chat) {
            var chat = hud.$refs.chat;
            __mvdChatAddFn = chat.add;
            __mvdChatMessages = chat.messages ? chat.messages.slice() : [];
            __mvdChatInst = chat;
            console.log("[HAS] chat state сохранён, messages:", __mvdChatMessages.length);
        }
    } catch (e) {
        console.warn("[HAS] captureChatState error:", e);
    }
}

function __hasRestoreChatState() {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && hud.$refs && hud.$refs.chat) {
            var chat = hud.$refs.chat;
            if (chat !== __mvdChatInst) {
                if (__mvdChatAddFn) {
                    chat.add = __mvdChatAddFn;
                }
                if (__mvdChatMessages && __mvdChatMessages.length > 0) {
                    chat.messages = __mvdChatMessages;
                    if (chat.$forceUpdate) chat.$forceUpdate();
                }
                __mvdChatInst = chat;
                console.log("[HAS] ✅ chat state восстановлен на новом инстансе");
            }
        }
    } catch (e) {
        console.warn("[HAS] restoreChatState error:", e);
    }
}

function __hasGetOwnNick() {
    try { var n = window.App && window.App.$store && window.App.$store.getters && window.App.$store.getters['player/nickName']; return n; }
    catch (e) { console.warn("[HAS] ошибка получения ника", e); return null; }
}
function __hasIsZahar() {
    return __hasGetOwnNick() === "Zahar_Loidov";
}

var NICK_PROFILES = {
    "Zahar_Loidov": { autoEnable: false, border: "default" },
    "Fura_Loidov":  { autoEnable: false, border: "default" }
};
var DEFAULT_PROFILE = { autoEnable: false, border: "default" };
function __hasGetNickProfile(nick) { return NICK_PROFILES[nick] || DEFAULT_PROFILE; }

var DEFAULTS = { chatLeft: 21.53, chatTop: 5.92, chatWidth: 45.89, chatHeight: 26.2, chatFontSize: 6, radarLeft: 6.67, radarTop: 6.57, radarSize: 35.8, infoRight: -1.82, infoTop: -4.35, infoScale: 100, voiceExtra: 7, controlsExtra: -7, border: "default" };
var PC_DEFAULTS = { chatLeft: 21.53, chatTop: 5.92, chatWidth: 45.89, chatHeight: 23.0, chatFontSize: 1, radarLeft: 6.67, radarTop: 6.57, radarSize: 30.8, infoRight: -1.82, infoTop: -1, infoScale: 75, voiceExtra: 7, controlsExtra: -7, border: "default" };
var settings = Object.assign({}, PC_DEFAULTS, { hassleForced: false });
var __hasSettingsNick = null;

var __hasOriginalSendChatInput = window.sendChatInput;

var panelEl = null;
var __hasActiveTab = "main"; // "main", "design", "sizes"

function __hasStorageKeyFor(nick) { return STORAGE_KEY + "::" + nick; }
function __hasLoadSettingsForNick(nick) {
    var profile = __hasGetNickProfile(nick);
    var nickDefaults = Object.assign({}, PC_DEFAULTS, { hassleForced: profile.autoEnable, border: profile.border });
    try {
        var raw = localStorage.getItem(__hasStorageKeyFor(nick));
        if (!raw) {
            var legacy = localStorage.getItem(STORAGE_KEY);
            if (legacy) { try { return Object.assign({}, nickDefaults, JSON.parse(legacy)); } catch (e) {} }
            return nickDefaults;
        }
        var parsed = JSON.parse(raw);
        return Object.assign({}, nickDefaults, parsed);
    } catch (e) { return nickDefaults; }
}
function __hasEnsureSettings() {
    var nick = __hasGetOwnNick();
    if (nick && nick !== __hasSettingsNick) {
        __hasSettingsNick = nick;
        settings = __hasLoadSettingsForNick(nick);
        console.log("[HAS] настройки загружены для ника", nick, settings);
    }
    return settings;
}
function __hasSaveSettings() {
    try {
        var key = __hasSettingsNick ? __hasStorageKeyFor(__hasSettingsNick) : STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(settings));
    } catch (e) { console.warn("[HAS] ошибка сохранения настроек", e); }
}

function __hasToast(text) {
    var el = document.createElement("div"); el.textContent = text;
    el.style.cssText = "position:fixed;top:12vh;left:50%;transform:translateX(-50%) translateY(-6px);background:rgba(17,21,29,0.92);color:#d2a65e;border:1px solid #1f242e;border-radius:8px;padding:10px 18px;font:600 14px/1.3 Open Sans,var(--fallback-font),sans-serif;z-index:999999;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,0.4);opacity:0;transition:opacity .2s,transform .2s;";
    document.body.appendChild(el);
    requestAnimationFrame(function() { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
    setTimeout(function() { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(-6px)"; setTimeout(function() { el.remove(); }, 250); }, 1800);
}

function __hasInjectChatStyle() {
    if (document.getElementById("__has-chat-style")) { console.log("[HAS] стиль уже вставлен"); return; }
    var style = document.createElement("style"); style.id = "__has-chat-style";
    style.textContent =
        "body.__has-chat-hassle-pos .radmir-chat{left:var(--has-chat-left)!important;top:var(--has-chat-top)!important;width:var(--has-chat-width)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__messages{width:var(--has-chat-width)!important;height:var(--has-chat-height)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat-input{width:var(--has-chat-width)!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat-input__input{border-top:0!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__before{background:linear-gradient(180deg,#1414149e 33.5%,#14141400)!important;height:71.85vh!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat_opened .radmir-chat__before{opacity:1!important;}  " +
        "body.__has-chat-hassle-pos .radmir-chat__controls{top:var(--has-chat-controls-top)!important;transform:scale(var(--has-chat-controls-scale))!important;transform-origin:left top!important;z-index:50!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-radar{left:var(--has-radar-left)!important;top:var(--has-radar-top)!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-radar__map{transform:scale(var(--has-radar-scale))!important;opacity:1!important;visibility:visible!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-radar{left:var(--has-radar-left)!important;top:var(--has-radar-top)!important;bottom:auto!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-radar__map{transform:scale(var(--has-radar-scale))!important;opacity:1!important;visibility:visible!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-info{right:var(--has-info-right)!important;top:var(--has-info-top)!important;transform:scale(var(--has-info-scale))!important;}  " +
        "body.__has-chat-hassle-pos .hud-radmir-info{right:var(--has-info-right)!important;top:var(--has-info-top)!important;transform:scale(var(--has-info-scale))!important;}  " +
        "body.__has-chat-hassle-pos .voice-chat{left:var(--has-voicechat-left)!important;top:var(--has-voicechat-top)!important;margin-top:0!important;z-index:50!important;visibility:visible!important;opacity:1!important;}  " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__joystick, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__pedals, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__buttons, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__threangel, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls-right_top, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls-right_bottom, " +
        "body.__has-chat-hassle-pos .hud-hassle-controls__close, " +
        "body.__has-chat-hassle-pos .hud-hassle-speedometer__controls, " +
        "body.__has-chat-hassle-pos .hud-hassle-radar .mobile-button, " +
        "body.__has-chat-hassle-pos .mobile-button{display:none!important;pointer-events:none!important;}  ";
    document.head.appendChild(style);
    console.log("[HAS] стиль вставлен в head");
}

function __hasApplyCSSVars() {
    var r = document.documentElement.style;
    r.setProperty("--has-chat-left", settings.chatLeft + "vw");
    r.setProperty("--has-chat-top", settings.chatTop + "vh");
    r.setProperty("--has-chat-width", settings.chatWidth + "vw");
    r.setProperty("--has-chat-height", settings.chatHeight + "vh");
    r.setProperty("--has-radar-left", settings.radarLeft + "vh");
    r.setProperty("--has-radar-top", settings.radarTop + "vh");
    r.setProperty("--has-radar-scale", (settings.radarSize / DEFAULTS.radarSize).toFixed(4));
    r.setProperty("--has-info-right", settings.infoRight + "vw");
    r.setProperty("--has-info-top", settings.infoTop + "vh");
    r.setProperty("--has-info-scale", (settings.infoScale / 100).toFixed(4));
    var controlsScale = 1 + settings.chatFontSize * 0.045;
    var controlsTop = settings.chatTop + settings.chatHeight + 1.2 + (settings.controlsExtra || 0);
    r.setProperty("--has-chat-controls-top", controlsTop + "vh");
    r.setProperty("--has-chat-controls-scale", controlsScale.toFixed(3));
    var HINT_ROW_HEIGHT_VH = 3;
    var voiceTop = controlsTop + HINT_ROW_HEIGHT_VH * controlsScale + 1 + (settings.voiceExtra || 0);
    r.setProperty("--has-voicechat-left", settings.chatLeft + "vw");
    r.setProperty("--has-voicechat-top", voiceTop + "vh");
    console.log("[HAS] CSS-переменные применены");
}

function __hasApplyToHud() {
    var hud = window.interface && window.interface("Hud");
    if (!hud) { console.warn("[HAS] __hasApplyToHud: hud не найден"); return; }
    window.App.chatFontSize = settings.chatFontSize;
    hud.isHelloween = settings.border === "helloween";
    hud.isNewYear = settings.border === "newyear";
    if (hud.voiceChat) {
        hud.voiceChat.show = true;
        hud.voiceChat.showButtons = true;
        console.log("[HAS] voiceChat.show/showButtons принудительно включены");
    } else {
        console.warn("[HAS] hud.voiceChat не найден на инстансе");
    }
}
function __hasApplyAll() { __hasApplyCSSVars(); __hasApplyToHud(); }

function __hasSetForced(hud, val, silent) {
    __hasCaptureChatState();

    hud.__hassleForced = val; settings.hassleForced = val;
    document.body.classList.toggle("__has-chat-hassle-pos", val);
    console.log("[HAS] __hassleForced = ", val, "| body class: ", document.body.classList.contains("__has-chat-hassle-pos"));
    if (val) { __hasApplyAll(); window.updatePlayerList && window.updatePlayerList(); }
    else {
        window.App.chatFontSize = 0; hud.isHelloween = false; hud.isNewYear = false;
        if (!silent) __hasHidePanel();
    }
    __hasSaveSettings();

    setTimeout(__hasRestoreChatState, 100);
    setTimeout(__hasRestoreChatState, 300);
    setTimeout(__hasRestoreChatState, 600);

    setTimeout(function() {
        console.log("[HAS] DOM-проверка: ", {
            ".radmir-chat": !!document.querySelector(".radmir-chat"),
            ".radmir-chat__controls": !!document.querySelector(".radmir-chat__controls"),
            ".voice-chat": !!document.querySelector(".voice-chat"),
            ".chat (Hassle-вариант)": !!document.querySelector(".chat-container"),
            "isHassleHud (computed)": hud.isHassleHud
        });
    }, 300);
}

function __hasSlider(label, key, min, max, step) {
    var row = document.createElement("div"); row.style.cssText = "margin-bottom:10px;";
    var top = document.createElement("div"); top.style.cssText = "display:flex;justify-content:space-between;color:#f4f1e1;font-size:12px;margin-bottom:4px;font-family:Open Sans,var(--fallback-font),sans-serif;";
    var lbl = document.createElement("span"); lbl.textContent = label;
    var val = document.createElement("span"); val.textContent = settings[key]; val.style.color = "#d2a65e";
    top.appendChild(lbl); top.appendChild(val);
    var input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = settings[key];
    input.style.cssText = "width:100%;accent-color:#d2a65e;";
    input.addEventListener("input", function() { settings[key] = parseFloat(input.value); val.textContent = settings[key]; __hasApplyAll(); __hasSaveSettings(); });
    row.appendChild(top); row.appendChild(input); return row;
}

function __hasBuildPanel() {
    if (panelEl) {
        // Обновляем контент активной вкладки
        __hasRenderTabContent();
        return panelEl;
    }
    
    var p = document.createElement("div");
    p.style.cssText = "position:fixed;top:8vh;right:1.5vw;width:580px;max-height:88vh;overflow-y:auto;overflow-x:hidden;background:rgba(17,21,29,0.95);border:1px solid #1f242e;border-radius:10px;padding:14px;z-index:999998;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:Open Sans,var(--fallback-font),sans-serif;display:none;";
    
    var header = document.createElement("div"); header.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;";
    var title = document.createElement("div"); title.textContent = "HASSLE HUD"; title.style.cssText = "color:#d2a65e;font-weight:700;font-size:13px;letter-spacing:0.5px;";
    var closeBtn = document.createElement("div"); closeBtn.textContent = "\u2715"; closeBtn.style.cssText = "color:#f4f1e199;cursor:pointer;font-size:14px;padding:2px 6px;";
    closeBtn.addEventListener("click", function() { __hasHidePanel(); });
    header.appendChild(title); header.appendChild(closeBtn); p.appendChild(header);
    
    // Вкладки
    var tabsContainer = document.createElement("div");
    tabsContainer.style.cssText = "display:flex;gap:4px;margin-bottom:16px;border-bottom:1px solid #1f242e;padding-bottom:8px;";
    
    var tabs = [
        { id: "main", label: "🎛 Основное" },
        { id: "design", label: "🎨 Дизайн" }
    ];
    if (__hasIsZahar()) {
        tabs.push({ id: "sizes", label: "📏 Размеры" });
    }
    
    var tabButtons = {};
    tabs.forEach(function(tab) {
        var btn = document.createElement("div");
        btn.textContent = tab.label;
        btn.dataset.tab = tab.id;
        btn.style.cssText = "flex:1;text-align:center;padding:8px 12px;border-radius:6px 6px 0 0;font-size:12px;cursor:pointer;border:1px solid transparent;color:#f4f1e199;transition:all 0.2s;";
        btn.addEventListener("click", function() {
            __hasActiveTab = tab.id;
            __hasRenderTabContent();
        });
        tabsContainer.appendChild(btn);
        tabButtons[tab.id] = btn;
    });
    p.appendChild(tabsContainer);
    
    // Контейнер для контента вкладки
    var contentContainer = document.createElement("div");
    contentContainer.style.cssText = "min-height:400px;";
    p.appendChild(contentContainer);
    
    document.body.appendChild(p);
    panelEl = p;
    panelEl.__tabButtons = tabButtons;
    panelEl.__contentContainer = contentContainer;
    
    __hasRenderTabContent();
    return p;
}

function __hasRenderTabContent() {
    if (!panelEl) return;
    
    var contentContainer = panelEl.__contentContainer;
    contentContainer.innerHTML = "";
    
    // Обновляем стили кнопок табов
    Object.keys(panelEl.__tabButtons).forEach(function(tabId) {
        var btn = panelEl.__tabButtons[tabId];
        if (tabId === __hasActiveTab) {
            btn.style.background = "#d2a65e";
            btn.style.color = "#11151d";
            btn.style.borderColor = "#d2a65e";
            btn.style.fontWeight = "600";
        } else {
            btn.style.background = "transparent";
            btn.style.color = "#f4f1e199";
            btn.style.borderColor = "transparent";
            btn.style.fontWeight = "400";
        }
    });
    
    if (__hasActiveTab === "main") {
        __hasRenderMainTab(contentContainer);
    } else if (__hasActiveTab === "design") {
        __hasRenderDesignTab(contentContainer);
    } else if (__hasActiveTab === "sizes") {
        if (__hasIsZahar()) {
            __hasRenderSizesTab(contentContainer);
        } else {
            var msg = document.createElement("div");
            msg.textContent = "Эта вкладка доступна только для Zahar_Loidov";
            msg.style.cssText = "color:#f4f1e199;text-align:center;padding:40px 20px;font-size:13px;";
            contentContainer.appendChild(msg);
        }
    }
}

function __hasRenderMainTab(container) {
    var hud = window.interface && window.interface("Hud");
    
    // Статус
    var statusBox = document.createElement("div");
    statusBox.style.cssText = "background:rgba(210,166,94,0.1);border:1px solid #d2a65e44;border-radius:8px;padding:12px;margin-bottom:16px;";
    
    var statusLabel = document.createElement("div");
    statusLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin-bottom:6px;";
    statusLabel.textContent = "Статус Hassle HUD";
    
    var statusValue = document.createElement("div");
    statusValue.style.cssText = "color:#d2a65e;font-size:14px;font-weight:600;";
    statusValue.textContent = hud && hud.__hassleForced ? "✅ Включено" : "⭕ Выключено";
    
    statusBox.appendChild(statusLabel);
    statusBox.appendChild(statusValue);
    container.appendChild(statusBox);
    
    // Кнопка переключения
    var toggleBtn = document.createElement("div");
    toggleBtn.textContent = hud && hud.__hassleForced ? "Выключить Hassle HUD" : "Включить Hassle HUD";
    toggleBtn.style.cssText = "text-align:center;padding:12px;border-radius:8px;font-size:13px;cursor:pointer;border:2px solid #d2a65e;color:#d2a65e;font-weight:600;margin-bottom:16px;transition:all 0.2s;";
    toggleBtn.addEventListener("mouseenter", function() {
        toggleBtn.style.background = "#d2a65e";
        toggleBtn.style.color = "#11151d";
    });
    toggleBtn.addEventListener("mouseleave", function() {
        toggleBtn.style.background = "transparent";
        toggleBtn.style.color = "#d2a65e";
    });
    toggleBtn.addEventListener("click", function() {
        if (!hud) return;
        __hasSetForced(hud, !hud.__hassleForced);
        __hasRenderTabContent();
    });
    container.appendChild(toggleBtn);
    
    // Разделитель
    var divider = document.createElement("div");
    divider.style.cssText = "height:1px;background:#1f242e;margin:16px 0;";
    container.appendChild(divider);
    
    // Пресеты
    var presetsLabel = document.createElement("div");
    presetsLabel.textContent = "Быстрые пресеты";
    presetsLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin-bottom:8px;";
    container.appendChild(presetsLabel);
    
    var pcBtn = document.createElement("div");
    pcBtn.textContent = "🖥 ПК размер";
    pcBtn.style.cssText = "text-align:center;padding:10px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #1f242e;color:#f4f1e199;margin-bottom:8px;transition:all 0.2s;";
    pcBtn.addEventListener("mouseenter", function() {
        pcBtn.style.borderColor = "#d2a65e";
        pcBtn.style.color = "#d2a65e";
    });
    pcBtn.addEventListener("mouseleave", function() {
        pcBtn.style.borderColor = "#1f242e";
        pcBtn.style.color = "#f4f1e199";
    });
    pcBtn.addEventListener("click", function() {
        settings = Object.assign({}, PC_DEFAULTS, { hassleForced: settings.hassleForced, border: settings.border });
        __hasSaveSettings();
        __hasApplyAll();
        __hasToast("Пресет ПК применён");
    });
    container.appendChild(pcBtn);
    
    var hassleBtn = document.createElement("div");
    hassleBtn.textContent = "🎮 Hassle размер";
    hassleBtn.style.cssText = "text-align:center;padding:10px;border-radius:6px;font-size:12px;cursor:pointer;border:1px solid #1f242e;color:#d2a65e;margin-bottom:8px;transition:all 0.2s;";
    hassleBtn.addEventListener("mouseenter", function() {
        hassleBtn.style.background = "#d2a65e";
        hassleBtn.style.color = "#11151d";
    });
    hassleBtn.addEventListener("mouseleave", function() {
        hassleBtn.style.background = "transparent";
        hassleBtn.style.color = "#d2a65e";
    });
    hassleBtn.addEventListener("click", function() {
        settings = Object.assign({}, DEFAULTS, { hassleForced: settings.hassleForced, border: settings.border });
        __hasSaveSettings();
        __hasApplyAll();
        __hasToast("Пресет Hassle применён");
    });
    container.appendChild(hassleBtn);
    
    // Подсказки
    var hintsBox = document.createElement("div");
    hintsBox.style.cssText = "background:rgba(255,255,255,0.03);border-radius:6px;padding:10px;margin-top:16px;";
    
    var hintsTitle = document.createElement("div");
    hintsTitle.textContent = "Команды чата:";
    hintsTitle.style.cssText = "color:#d2a65e;font-size:11px;font-weight:600;margin-bottom:6px;";
    
    var hint1 = document.createElement("div");
    hint1.innerHTML = "<code style='color:#f4f1e1;background:#1f242e;padding:2px 6px;border-radius:3px;'>/has</code> — включить/выключить Hassle HUD";
    hint1.style.cssText = "color:#f4f1e199;font-size:11px;margin-bottom:4px;";
    
    var hint2 = document.createElement("div");
    hint2.innerHTML = "<code style='color:#f4f1e1;background:#1f242e;padding:2px 6px;border-radius:3px;'>/has_s</code> — открыть это меню";
    hint2.style.cssText = "color:#f4f1e199;font-size:11px;";
    
    hintsBox.appendChild(hintsTitle);
    hintsBox.appendChild(hint1);
    hintsBox.appendChild(hint2);
    container.appendChild(hintsBox);
}

function __hasRenderDesignTab(container) {
    var borderLabel = document.createElement("div");
    borderLabel.textContent = "Бордер радара";
    borderLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin-bottom:12px;";
    container.appendChild(borderLabel);
    
    var borderRow = document.createElement("div");
    borderRow.style.cssText = "display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;";
    
    var borderOptions = [
        ["default", "Обычный", "🟢"],
        ["helloween", "Хэллоуин", "🎃"],
        ["newyear", "Новый год", "🎄"]
    ];
    
    var borderButtons = [];
    borderOptions.forEach(function(opt) {
        var btn = document.createElement("div");
        btn.innerHTML = opt[2] + " " + opt[1];
        btn.dataset.value = opt[0];
        btn.style.cssText = "flex:1 1 auto;text-align:center;padding:12px 8px;border-radius:8px;font-size:12px;cursor:pointer;border:2px solid #1f242e;color:#f4f1e1;transition:all 0.2s;min-width:120px;";
        
        if (settings.border === opt[0]) {
            btn.style.borderColor = "#d2a65e";
            btn.style.background = "rgba(210,166,94,0.15)";
            btn.style.color = "#d2a65e";
            btn.style.fontWeight = "600";
        }
        
        btn.addEventListener("mouseenter", function() {
            if (settings.border !== opt[0]) {
                btn.style.borderColor = "#d2a65e88";
            }
        });
        btn.addEventListener("mouseleave", function() {
            if (settings.border !== opt[0]) {
                btn.style.borderColor = "#1f242e";
            }
        });
        
        btn.addEventListener("click", function() {
            settings.border = opt[0];
            borderButtons.forEach(function(b) {
                var active = b.dataset.value === settings.border;
                b.style.borderColor = active ? "#d2a65e" : "#1f242e";
                b.style.background = active ? "rgba(210,166,94,0.15)" : "transparent";
                b.style.color = active ? "#d2a65e" : "#f4f1e1";
                b.style.fontWeight = active ? "600" : "400";
            });
            __hasApplyAll();
            __hasSaveSettings();
            __hasToast("Бордер: " + opt[1]);
        });
        
        borderButtons.push(btn);
        borderRow.appendChild(btn);
    });
    container.appendChild(borderRow);
    
    // Информация
    var infoBox = document.createElement("div");
    infoBox.style.cssText = "background:rgba(255,255,255,0.03);border-radius:6px;padding:12px;margin-top:16px;";
    
    var infoTitle = document.createElement("div");
    infoTitle.textContent = "ℹ️ О бордерах";
    infoTitle.style.cssText = "color:#d2a65e;font-size:11px;font-weight:600;margin-bottom:8px;";
    
    var infoText = document.createElement("div");
    infoText.textContent = "Бордеры меняют визуальное оформление радара в режиме Hassle HUD. Выбор сохраняется автоматически и применяется сразу.";
    infoText.style.cssText = "color:#f4f1e199;font-size:11px;line-height:1.5;";
    
    infoBox.appendChild(infoTitle);
    infoBox.appendChild(infoText);
    container.appendChild(infoBox);
}

function __hasRenderSizesTab(container) {
    if (!__hasIsZahar()) {
        var msg = document.createElement("div");
        msg.textContent = "⚠️ Доступ только для Zahar_Loidov";
        msg.style.cssText = "color:#f4f1e199;text-align:center;padding:40px 20px;font-size:13px;";
        container.appendChild(msg);
        return;
    }
    
    // Чат
    var chatLabel = document.createElement("div");
    chatLabel.textContent = "📝 Чат";
    chatLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 12px;";
    container.appendChild(chatLabel);
    
    container.appendChild(__hasSlider("Слева (vw)", "chatLeft", 0, 60, 0.1));
    container.appendChild(__hasSlider("Сверху (vh)", "chatTop", 0, 40, 0.1));
    container.appendChild(__hasSlider("Ширина (vw)", "chatWidth", 20, 70, 0.1));
    container.appendChild(__hasSlider("Высота (vh)", "chatHeight", 10, 50, 0.1));
    container.appendChild(__hasSlider("Размер шрифта", "chatFontSize", -5, 20, 1));
    container.appendChild(__hasSlider("Смещение T ЧАТ / F1 (vh)", "controlsExtra", -25, 10, 0.1));
    container.appendChild(__hasSlider("Отступ ГС ниже подсказок (vh)", "voiceExtra", -5, 15, 0.1));
    
    var divider1 = document.createElement("div");
    divider1.style.cssText = "height:1px;background:#1f242e;margin:20px 0;";
    container.appendChild(divider1);
    
    // Радар
    var radarLabel = document.createElement("div");
    radarLabel.textContent = "🗺 Радар";
    radarLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 12px;";
    container.appendChild(radarLabel);
    
    container.appendChild(__hasSlider("Слева (vh)", "radarLeft", 0, 40, 0.1));
    container.appendChild(__hasSlider("Сверху (vh)", "radarTop", 0, 40, 0.1));
    container.appendChild(__hasSlider("Размер (vh)", "radarSize", 15, 60, 0.1));
    
    var divider2 = document.createElement("div");
    divider2.style.cssText = "height:1px;background:#1f242e;margin:20px 0;";
    container.appendChild(divider2);
    
    // Правый HUD
    var infoLabel = document.createElement("div");
    infoLabel.textContent = "ℹ️ Правый HUD";
    infoLabel.style.cssText = "color:#f4f1e199;font-size:11px;text-transform:uppercase;margin:0 0 12px;";
    container.appendChild(infoLabel);
    
    container.appendChild(__hasSlider("Справа (vw)", "infoRight", -10, 20, 0.1));
    container.appendChild(__hasSlider("Сверху (vh)", "infoTop", -10, 20, 0.1));
    container.appendChild(__hasSlider("Масштаб (%)", "infoScale", 50, 200, 1));
}

function __hasShowPanel() {
    __hasBuildPanel();
    panelEl.style.display = "block";
    window.setCursorStatus && window.setCursorStatus("HasPanel", true);
}

function __hasHidePanel() {
    if (panelEl) panelEl.style.display = "none";
    window.setCursorStatus && window.setCursorStatus("HasPanel", false);
}

function __hasIsPanelOpen() {
    return !!panelEl && panelEl.style.display !== "none";
}

window.sendChatInput = function(e) {
    if (!e || typeof e !== "string") {
        return __hasOriginalSendChatInput(e);
    }

    var trimmed = e.trim();
    if (!trimmed) {
        return __hasOriginalSendChatInput(e);
    }

    var firstSpace = trimmed.indexOf(" ");
    var cmd = (firstSpace === -1 ? trimmed : trimmed.substring(0, firstSpace)).toLowerCase();

    if (cmd === "/has" || cmd === "/has_s") {
        __hasEnsureSettings();
    }

    if (cmd === "/has") {
        var hud = window.interface && window.interface("Hud");
        if (!hud) {
            console.warn("[HAS] /has: hud не инициализирован");
            __hasToast("HASSLE: HUD \u043d\u0435 \u0438\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d");
            return;
        }
        __hasInjectChatStyle();
        __hasSetForced(hud, !hud.__hassleForced);
        __hasToast(hud.__hassleForced ? "HASSLE HUD: \u0432\u043a\u043b\u044e\u0447\u0435\u043d" : "HASSLE HUD: \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d");
        return;
    } else if (cmd === "/has_s") {
        var hud = window.interface && window.interface("Hud");
        if (!hud) {
            console.warn("[HAS] /has_s: hud не инициализирован");
            __hasToast("HASSLE: HUD \u043d\u0435 \u0438\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d");
            return;
        }
        __hasInjectChatStyle();
        if (!hud.__hassleForced) __hasSetForced(hud, true, true);
        if (__hasIsPanelOpen()) { __hasHidePanel(); } else { __hasShowPanel(); }
        return;
    }

    return __hasOriginalSendChatInput(e);
};

var __hasOriginalOnUpdatePlayersList = window.onUpdatePlayersList;
window.onUpdatePlayersList = function(e) {
    try {
        var hud = window.interface && window.interface("Hud");
        if (hud && e && typeof e.count === "number") { hud.info.online = e.count + 1; }
        if (hud && e && e.local && e.local.id != null) {
            var realId = parseInt(e.local.id, 10);
            if (!isNaN(realId) && realId !== 0 && realId !== hud.info.id) { hud.info.id = realId; }
        }
    } catch (err) { console.warn("[HAS] onUpdatePlayersList ошибка", err); }
    if (__hasOriginalOnUpdatePlayersList) return __hasOriginalOnUpdatePlayersList(e);
};

setInterval(function() {
    var hud = window.interface && window.interface("Hud");
    if (hud && hud.__hassleForced && window.updatePlayerList) window.updatePlayerList();
}, 15000);

window.setPlayerId = function(id) {
    var hud = window.interface && window.interface("Hud");
    if (hud) hud.info.id = parseInt(id) || 0;
};

(function __hasAutoInit() {
    var tries = 0, maxTries = 200;
    var timer = setInterval(function() {
        tries++;
        var hud = window.interface && window.interface("Hud");
        if (hud) {
            clearInterval(timer);
            console.log("[HAS] подготовка: HUD найден (автовключение отключено)");
            __hasEnsureSettings();
            __hasInjectChatStyle();
        } else if (tries >= maxTries) {
            console.warn("[HAS] подготовка: не дождались HUD");
            clearInterval(timer);
        }
    }, 150);
})();

setInterval(function() {
    var hud = window.interface && window.interface("Hud");
    if (hud && hud.$refs && hud.$refs.chat && __mvdChatAddFn) {
        if (hud.$refs.chat !== __mvdChatInst) {
            console.log("[HAS] ⚠️ Обнаружен новый инстанс чата — восстанавливаем state");
            __hasRestoreChatState();
        }
    }
}, 3000);

})();
// === END HASSLE HUD PATCH ===
