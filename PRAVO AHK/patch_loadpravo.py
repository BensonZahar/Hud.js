# -*- coding: utf-8 -*-
"""python patch_loadpravo.py LoadPravo.js  — общий матчер + единый регистратор мыши/колеса для MENU_KEY, GIVELIC_KEY, REISSUE_KEY"""
import sys, io, re
sys.path.insert(0, __file__.rsplit('/', 1)[0] if '/' in __file__ else '.')
import patch_hotkeys as ph

NEW_BLOCK = r'''// ── Мышь/колесо для MENU_KEY, GIVELIC_KEY, REISSUE_KEY ───────
// Клавиатурные обработчики этих хоткеев живут в mvdF.js / pravo.js (keydown, общий матчер _hkMatch).
// Колесо и кнопки мыши keydown не ловит — регистрируем здесь тем же матчером (строгие модификаторы).
(function() {
    var CLICK_MAX_MS = 400; // удержание дольше = камера GTA, не хоткей
    function pravoOnly(fn) { return function() { if (window._isPravoSkin && window._isPravoSkin()) fn(); }; }
    function register(tag, combo, action) {
        var h = _hkParse(combo);
        if (!h) return;
        if (h.main === 'wheelup' || h.main === 'wheeldown') {
            window.addEventListener('wheel', function(e) {
                if (!_hkMatch(e, combo)) return;
                e.preventDefault && e.preventDefault();
                action();
            }, { passive: false, capture: true });
            console.log('[PRAVO ' + tag + '] Колесо зарегистрировано: ' + combo);
        } else if (h.main === 'mousemiddle' || h.main === 'mouseback' || h.main === 'mouseforward') {
            var downAt = {};
            window.addEventListener('mousedown', function(e) { downAt[e.button] = Date.now(); }, true);
            window.addEventListener('mouseup', function(e) {
                var t0 = downAt[e.button]; downAt[e.button] = 0;
                if (!t0 || Date.now() - t0 > CLICK_MAX_MS) return;
                if (!_hkMatch(e, combo)) return;
                e.preventDefault && e.preventDefault();
                action();
            }, true);
            console.log('[PRAVO ' + tag + '] Кнопка мыши зарегистрирована: ' + combo + ' (клик ≤ ' + CLICK_MAX_MS + ' мс)');
        }
        // обычная клавиша — обрабатывается keydown-обработчиком в mvdF.js / pravo.js
    }
    if (MENU_KEY) register('MENU-KEY', MENU_KEY, pravoOnly(function() {
        // sendChatInput доступен после загрузки mvdF.js
        if (typeof window.sendChatInput === 'function') window.sendChatInput('/dahk');
    }));
    if (GIVELIC_KEY) register('GIVELIC-KEY', GIVELIC_KEY, pravoOnly(function() {
        window.showGiveLicIdInputDialog && window.showGiveLicIdInputDialog();
    }));
    if (AUTO_REISSUE_LIC && REISSUE_KEY) register('REISSUE-KEY', REISSUE_KEY, pravoOnly(function() {
        // вся логика (snAdd, __mvdPrevSendChatInput) живёт в pravo.js
        window._pravoDoReissue && window._pravoDoReissue();
    }));
})();
'''

def patch(path):
    src = io.open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in src
    src = src.replace('\r\n', '\n')
    assert '_hkMatch' not in src, 'already patched'
    start = src.index('// ── Регистрация мыши/колеса для MENU_KEY')
    end = src.rindex('\n})()')            # финальная обёртка файла
    src = src[:start] + NEW_BLOCK + src[end:]
    i = src.index('\n(function() {\n') + len('\n(function() {\n')
    src = src[:i] + ph.HELPER + '\n' + src[i:]
    if crlf: src = src.replace('\n', '\r\n')
    io.open(path, 'w', encoding='utf-8', newline='').write(src)
    print('patched', path)

if __name__ == '__main__':
    patch(sys.argv[1])
