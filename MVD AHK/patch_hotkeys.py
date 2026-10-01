# -*- coding: utf-8 -*-
"""python patch_hotkeys.py script <pravo.js|mvdF.js|fsb.js|fsin.js>   /   python patch_hotkeys.py load <LoadAhk.js|LoadFsb.js|LoadFsin.js>"""
import sys, io

HELPER = r'''// ── Универсальный матчер хоткеев (по физической клавише e.code, не зависит от раскладки) ──
var _HK_ALIAS = {up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright',esc:'escape'};
var _HK_PUNCT = {'-':'minus','=':'equal','[':'bracketleft',']':'bracketright',';':'semicolon',"'":'quote',',':'comma','.':'period','/':'slash','\\':'backslash','`':'backquote'};
var _HK_BTN = {0:'mouseleft',1:'mousemiddle',2:'mouseright',3:'mouseback',4:'mouseforward'};
var _hkCache = {};
function _hkParse(combo) {
    if (!combo) return null;
    if (_hkCache[combo]) return _hkCache[combo];
    var s = String(combo).trim(), parts = s.toLowerCase().split('+').map(function(x){ return x.trim(); }), main = '';
    if (s.charAt(s.length - 1) === '+') { main = '+'; parts = parts.filter(Boolean); }
    var h = { alt: parts.indexOf('alt') !== -1, ctrl: parts.indexOf('ctrl') !== -1, shift: parts.indexOf('shift') !== -1, main: main };
    if (!h.main) { for (var i = 0; i < parts.length; i++) { if (parts[i] !== 'alt' && parts[i] !== 'ctrl' && parts[i] !== 'shift') { h.main = parts[i]; break; } } }
    return (_hkCache[combo] = h);
}
function _hkMainMatch(e, m) {
    var t = e.type;
    if (t === 'wheel') return m === (e.deltaY < 0 ? 'wheelup' : 'wheeldown');
    if (t === 'mousedown' || t === 'mouseup') return m === _HK_BTN[e.button];
    var code = String(e.code || '').toLowerCase(), key = String(e.key || '').toLowerCase();
    if (!code || code === 'unidentified') return key === m || key === (_HK_ALIAS[m] || m);
    if (/^[a-z]$/.test(m))  return code === 'key' + m;
    if (/^[0-9]$/.test(m))  return code === 'digit' + m;
    if (m === 'enter')      return code === 'enter' || code === 'numpadenter';
    if (_HK_ALIAS[m])       return code === _HK_ALIAS[m];
    if (_HK_PUNCT[m])       return code === _HK_PUNCT[m];
    return code === m || key === m;   // F1-F24, Numpad*, Space, Tab, Home, Minus, Comma ... (+ старые сохранённые значения)
}
function _hkMatch(e, combo) {
    var h = _hkParse(combo);
    if (!h || !h.main) return false;
    if (h.alt !== !!e.altKey || h.ctrl !== !!e.ctrlKey || h.shift !== !!e.shiftKey) return false;
    return _hkMainMatch(e, h.main);
}
// Печатаем в чате/поле ввода — «голые» клавиши не должны срабатывать как бинд
function _hkTyping(e) {
    var t = e.target; if (!t || !t.tagName) return false;
    var editable = t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT';
    return editable && !e.altKey && !e.ctrlKey;
}
function _matchesCombo(e, combo) { return _hkMatch(e, combo); }
'''

def match_brace(src, open_idx):
    d = 0; i = open_idx; n = len(src); q = None
    while i < n:
        c = src[i]
        if q:
            if c == '\\': i += 1
            elif c == q: q = None
        elif c in '"\'`': q = c
        elif c == '/' and src[i+1:i+2] == '/':
            i = src.find('\n', i)
            if i < 0: break
        elif c == '{': d += 1
        elif c == '}':
            d -= 1
            if d == 0: return i
        i += 1
    raise ValueError('brace')

def cut_func(src, header, replacement):
    a = src.index(header); b = match_brace(src, src.index('{', a))
    return src[:a] + replacement + src[b+1:]

MOUSE_INSTALL = r'''
// Мышь/колесо для MENU_BINDS (раньше бинды ловили только клавиатуру)
(function() {
    var wheel = false, btn = false;
    for (var a in MENU_BINDS) {
        var h = _hkParse(MENU_BINDS[a]); if (!h) continue;
        if (h.main === 'wheelup' || h.main === 'wheeldown') wheel = true;
        else if (h.main === 'mousemiddle' || h.main === 'mouseback' || h.main === 'mouseforward') btn = true;
    }
    if (wheel) window.addEventListener('wheel', function(e) { _menuBindsDispatch(e); }, { passive: false, capture: true });
    if (btn) {
        var downAt = {}, CLICK_MAX_MS = 400; // удержание дольше = камера GTA, не бинд
        window.addEventListener('mousedown', function(e) { downAt[e.button] = Date.now(); }, true);
        window.addEventListener('mouseup', function(e) {
            var t0 = downAt[e.button]; downAt[e.button] = 0;
            if (t0 && Date.now() - t0 <= CLICK_MAX_MS) _menuBindsDispatch(e);
        }, true);
    }
})();
'''

def patch_script(path, gate):
    src = io.open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in src
    src = src.replace('\r\n', '\n')
    src = cut_func(src, 'function _matchesCombo(e, combo) {', HELPER.rstrip('\n'))
    marker = "    // Прямые биндинги пунктов меню «Повседневная»\n    if (MENU_BINDS && typeof MENU_BINDS === 'object') {"
    a = src.index(marker); ifs = src.index('if (MENU_BINDS', a); b = match_brace(src, src.index('{', ifs))
    block = src[ifs:b+1]
    src = src[:a] + "    // Прямые биндинги пунктов меню — теперь обрабатываются в _menuBindsDispatch (capture, клавиатура + мышь)\n" + src[b+1:]
    dispatch = ("// Диспетчер прямых биндингов пунктов меню «Повседневная»: клавиатура, колесо, боковые/средняя кнопки мыши\n"
                "function _menuBindsDispatch(e) {\n"
                + (("    " + gate + "\n") if gate else "")
                + "    if (e.type === 'keydown' && (e.repeat || _hkTyping(e))) return;\n"
                "    " + block + "\n}\n"
                "window.addEventListener('keydown', function(e) { _menuBindsDispatch(e); }, true);\n"
                + MOUSE_INSTALL + "\n")
    k = src.index("// Обработчик горячих клавиш\nwindow.addEventListener('keydown'")
    src = src[:k] + dispatch + src[k:]
    m1 = src.index('    if (MENU_KEY) {\n        var parts = MENU_KEY')
    e1 = match_brace(src, src.index('{', m1))
    src = src[:m1] + "    if (MENU_KEY && !e.repeat && !_hkTyping(e) && _hkMatch(e, MENU_KEY)) {\n        sendChatInput('/dahk');\n    }" + src[e1+1:]
    src = src.replace("if (_rModOk && _rKeyOk && _lastGiveLicData) {", "if (!e.repeat && !_hkTyping(e) && _hkMatch(e, REISSUE_KEY) && _lastGiveLicData) {")
    src = src.replace("if (_gModOk && _gKeyOk) {", "if (!e.repeat && !_hkTyping(e) && _hkMatch(e, GIVELIC_KEY)) {")
    if crlf: src = src.replace('\n', '\r\n')
    io.open(path, 'w', encoding='utf-8', newline='').write(src)

def patch_load(path):
    src = io.open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in src
    src = src.replace('\r\n', '\n')
    i = src.index('\n(function() {\n') + len('\n(function() {\n')
    src = src[:i] + HELPER + '\n' + src[i:]
    pos = 0
    for keyname in ('EJECT_KEY', 'SWAP_KEY'):   # isMatch встречается дважды: сначала EJECT, затем SWAP
        while True:
            a = src.index('    function isMatch(e) {', pos)
            b = match_brace(src, src.index('{', a))
            if '_hkMatch' in src[a:b]: pos = b; continue
            break
        src = src[:a] + "    function isMatch(e) { return !e.repeat && !_hkTyping(e) && _hkMatch(e, %s); }" % keyname + src[b+1:]
        pos = a
    if crlf: src = src.replace('\n', '\r\n')
    io.open(path, 'w', encoding='utf-8', newline='').write(src)

if __name__ == '__main__':
    mode, path = sys.argv[1], sys.argv[2]
    if mode == 'script':
        gate = "if (!pravoSkins.includes(skinId)) return; // все хоткеи работают только при правительственном скине" if path.endswith('pravo.js') else ''
        patch_script(path, gate)
    else:
        patch_load(path)
    print('patched', path)
