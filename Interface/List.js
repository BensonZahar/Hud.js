// ============================================
// 📦 СЕКЦИЯ 1: Регистрация кастомных интерфейсов
// ============================================

const customComponents = {
    Theory2: p(() => d(() => import("./Theory2.js"), ["./Theory2.js", "./speed.js", "./Close.js", "./telegram-authenticator.js", "./long-arrow-left-secondary.js", "./close2.js", "./Button.js", "./donate.js", "./money.js", "./Button.css", "./Close.css", "./ScrollableContainer.js", "./dom.js", "./ScrollableContainer.css", "./Theory2.css"], import.meta.url)),
    
    CustomInterface1: p(() => d(() => import("./CustomInterface1.js"), ["./CustomInterface1.js", "./CustomInterface1.css"], import.meta.url)),
    
    MyAwesomeUI: p(() => d(() => import("./MyAwesomeUI.js"), ["./MyAwesomeUI.js", "./Button.js", "./Button.css", "./Close.js", "./Close.css", "./MyAwesomeUI.css"], import.meta.url))
};

// ============================================
// ⚙️ СЕКЦИЯ 2: Конфигурация интерфейсов
// ============================================

const customConfig = {
    Theory2: {
        open: {
            status: !1
        },
        show: !0,
        options: {
            hideHud: !0,
            hideChat: !0
        }
    },
    
    CustomInterface1: {
        open: {
            status: !1
        },
        show: !0,
        options: {
            hideHud: !1,
            hideChat: !1
        }
    },
    
    MyAwesomeUI: {
        open: {
            status: !1
        },
        show: !0,
        options: {
            hideHud: !0,
            hideChat: !0,
            showControlsButton: !0
        }
    }
};
