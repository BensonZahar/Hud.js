// MvdMenu.dom.js — vanilla DOM реализация меню МВД
// Грузится из GitHub через LoadAhk.js (XHR + eval).
// Не требует Vue, не регистрируется в IntLoad, не нужен файл в ассетах.
// Экспортирует: window._mvdShowMenu(targetId?, startScreen?)
//               window._mvdCloseMenu()

(function () {

// ─── SVG иконки (скопированы из MvdMenu.js) ──────────────────────────────────
const SVG_SEARCH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(244,241,225,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(244,241,225,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>';
const SVG_BACK   = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L4 6L8 10" stroke="rgba(244,241,225,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SVG_ARROW  = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2L7 5L3 8" stroke="rgba(244,241,225,0.3)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const GRAFFITI_SVG = '<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:-60px;left:-40px;width:48.52vh;height:23.61vh;opacity:0.05;pointer-events:none;transform:rotate(148deg)"><line x1="0" y1="20" x2="400" y2="20" stroke="white" stroke-width="1.2"/><line x1="0" y1="40" x2="400" y2="40" stroke="white" stroke-width="1.2"/><line x1="0" y1="60" x2="400" y2="60" stroke="white" stroke-width="1.2"/><line x1="0" y1="80" x2="400" y2="80" stroke="white" stroke-width="1.2"/><line x1="0" y1="100" x2="400" y2="100" stroke="white" stroke-width="1.2"/><line x1="0" y1="120" x2="400" y2="120" stroke="white" stroke-width="1.2"/><line x1="0" y1="140" x2="400" y2="140" stroke="white" stroke-width="1.2"/><line x1="0" y1="160" x2="400" y2="160" stroke="white" stroke-width="1.2"/><line x1="0" y1="180" x2="400" y2="180" stroke="white" stroke-width="1.2"/><line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="1.2"/><line x1="20" y1="0" x2="20" y2="400" stroke="white" stroke-width="1.2"/><line x1="40" y1="0" x2="40" y2="400" stroke="white" stroke-width="1.2"/><line x1="60" y1="0" x2="60" y2="400" stroke="white" stroke-width="1.2"/><line x1="80" y1="0" x2="80" y2="400" stroke="white" stroke-width="1.2"/><line x1="100" y1="0" x2="100" y2="400" stroke="white" stroke-width="1.2"/></svg>';

// ─── CSS (идентичен MvdMenu.js mounted() + добавлен pointer-events fix) ───────
const CSS = `
.mvdmenu{align-items:center;display:flex;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:100vh;justify-content:center;left:0;position:fixed;text-transform:none;top:0;width:100vw;z-index:9999;pointer-events:auto;}
.mvdmenu__overlay{bottom:0;left:0;position:absolute;right:0;top:0;}
.mvdmenu__wrapper{background:#141419eb;border:0.19vh solid rgba(255,255,255,0.05);border-radius:0.74vh;box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(249,183,1,0.2),0 1.5vh 5vh rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;position:relative;width:36vh;z-index:1;}
.mvdmenu__top-accent{background:#f9b701;height:0.19vh;left:0;position:absolute;right:0;top:0;}
.mvdmenu__pattern{height:23.61vh;left:0;mask-image:linear-gradient(180deg,#d9d9d9,rgba(115,115,115,0) 70%);overflow:hidden;pointer-events:none;position:absolute;top:0;width:100%;}
.mvdmenu__header{align-items:center;background:transparent;border-bottom:0.19vh solid #f4f1e11a;display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.mvdmenu__header-left{align-items:center;display:flex;gap:0.74vh;}
.mvdmenu__back-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e199;cursor:pointer;display:flex;height:2.59vh;justify-content:center;transition:all 0.15s ease;width:2.59vh;flex-shrink:0;}
.mvdmenu__back-btn svg{height:1.2vh;width:1.2vh;}
.mvdmenu__title{align-items:baseline;display:flex;font-weight:700;gap:0.37vh;}
.mvdmenu__title-main{color:#f4f1e1;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.59vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-sub{color:#f9b701;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.59vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__close-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e199;cursor:pointer;display:flex;font-size:1.48vh;font-weight:700;height:2.96vh;justify-content:center;transition:all 0.15s ease;width:2.96vh;}
.mvdmenu__search{align-items:center;background:#ffffff05;border-bottom:0.19vh solid #f4f1e11a;display:flex;gap:0.93vh;padding:0.93vh 1.67vh;position:relative;z-index:1;}
.mvdmenu__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.48vh;justify-content:center;width:1.48vh;}
.mvdmenu__search-icon svg{height:100%;width:100%;}
.mvdmenu__search input{-webkit-appearance:none;background:transparent;border:none;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;}
.mvdmenu__search input::placeholder{color:#f4f1e166;font-weight:400;}
.mvdmenu__list{display:flex;flex-direction:column;max-height:48vh;overflow-y:auto;position:relative;z-index:1;}
.mvdmenu__list::-webkit-scrollbar{width:1.11vh;}
.mvdmenu__list::-webkit-scrollbar-thumb{background:linear-gradient(0deg,#bcbcbd,#fff 75%);border-radius:0.19vh;}
.mvdmenu__list::-webkit-scrollbar-track{background:#ffffff1a;border-radius:0.19vh;}
.mvdmenu__item{align-items:center;border-bottom:0.09vh solid #f4f1e10d;cursor:pointer;display:flex;gap:1.11vh;padding:0.93vh 1.48vh;transition:background 0.1s ease;}
.mvdmenu__item_fine{border-left:0.19vh solid rgba(61,186,122,.4);}
.mvdmenu__item_wanted{border-left:0.19vh solid rgba(224,85,85,.4);}
.mvdmenu__item_toggle_on{border-left:0.19vh solid rgba(61,186,122,.5);}
.mvdmenu__item_toggle_off{border-left:0.19vh solid rgba(224,85,85,.3);}
.mvdmenu__item_selected{background:rgba(249,183,1,.1);border-left:0.19vh solid #f9b701;}
.mvdmenu__item_selected .mvdmenu__item-label{color:#f4f1e1;}
.mvdmenu__item-num{color:#f4f1e166;flex-shrink:0;font-size:1.11vh;font-weight:700;min-width:2.4vh;}
.mvdmenu__item-label{color:#f4f1e1cc;flex:1 1 auto;font-size:1.3vh;font-weight:600;line-height:1.4;}
.mvdmenu__item-tag{border-radius:0.22vh;flex-shrink:0;font-size:1.0vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.5vh;}
.mvdmenu__item-id-badge{background:rgba(249,183,1,.1);border-radius:0.22vh;color:rgba(249,183,1,.7);flex-shrink:0;font-size:0.93vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.46vh;}
.mvdmenu__item-arrow{align-items:center;display:flex;flex-shrink:0;opacity:0.5;}
.mvdmenu__item-arrow svg{height:1.11vh;width:1.11vh;}
.mvdmenu__item-status{border-radius:0.22vh;flex-shrink:0;font-size:0.93vh;font-weight:700;padding:0.15vh 0.56vh;}
.mvdmenu__item-status_on{background:rgba(61,186,122,.15);color:rgba(61,186,122,1);}
.mvdmenu__item-status_off{background:rgba(224,85,85,.12);color:rgba(224,85,85,0.9);}
.mvdmenu__empty{color:#f4f1e166;font-size:1.3vh;font-style:italic;padding:2.22vh;text-align:center;}
.mvdmenu__id-input-wrap{display:flex;flex-direction:column;gap:1.3vh;padding:2vh 1.85vh 1.85vh;position:relative;z-index:1;}
.mvdmenu__id-input-label{color:#f4f1e1cc;font-size:1.3vh;font-weight:600;line-height:1.4;}
.mvdmenu__id-input-row{display:flex;gap:0.74vh;}
.mvdmenu__id-input-field{-webkit-appearance:none;appearance:none;background:#ffffff08;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;padding:0.74vh 1.11vh;transition:border-color 0.15s;}
.mvdmenu__id-input-field:focus{border-color:rgba(249,183,1,0.5);}
.mvdmenu__id-input-field::placeholder{color:#f4f1e144;font-weight:400;}
.mvdmenu__id-input-field::-webkit-inner-spin-button,.mvdmenu__id-input-field::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.mvdmenu__id-action-row{display:flex;gap:0.74vh;}
.mvdmenu__id-confirm-btn{background:rgba(249,183,1,0.12);border:0.19vh solid rgba(249,183,1,0.25);border-radius:0.37vh;color:rgba(249,183,1,0.9);cursor:pointer;flex:1 1 auto;font-size:1.48vh;font-weight:700;letter-spacing:0.08vh;padding:1.3vh 0;text-align:center;transition:all 0.15s ease;}
`;

// ─── Пункты меню (идентичны MvdMenu.js) ──────────────────────────────────────
const POVSEDNEV_OPTIONS = [
    {action:'greeting',      label:'Приветствие',              needsId:true},
    {action:'checkDocuments',label:'Проверка документов',      needsId:false},
    {action:'studyDocuments',label:'Изучение документов',      needsId:false},
    {action:'scanningTablet',label:'Сканирование',             needsId:false},
    {action:'cuffing',       label:'Надевание наручников',     needsId:true},
    {action:'putInCar',      label:'Посадка в машину',         needsId:true},
    {action:'arrest',        label:'Доставка в участок',       needsId:true},
    {action:'uncuffing',     label:'Снятие наручников',        needsId:true},
    {action:'chase',         label:'Преследование преступника',needsId:true},
    {action:'search',        label:'Обыск',                    needsId:true},
    {action:'escort',        label:'Конвоирование',            needsId:true},
    {action:'clearWanted',   label:'Снятие розыска',           needsId:true},
    {action:'fine',          label:'Выдача штрафа',            needsId:false, special:'fine'},
    {action:'wantedFine',    label:'Выдача розыска',           needsId:false, special:'wanted'},
    {action:'confiscate',    label:'Изъятие веществ',          needsId:true},
    {action:'breakGlass',    label:'Разбитие стекла',          needsId:true},
    {action:'removeMask',    label:'Снятие маски',             needsId:false},
    {action:'fingerprint',   label:'Сканирование отпечатков',  needsId:false},
    {action:'takeLicense',   label:'Изъятие прав',             needsId:true},
    {action:'miranda',       label:'Права Миранды',            needsId:false},
];

const ACTION_TAGS = {
    fine:       {label:'/ticket', color:'rgba(61,186,122,'},
    wantedFine: {label:'/su',     color:'rgba(224,85,85,'},
    cuffing:    {label:'/cuff',   color:'rgba(249,183,1,'},
    arrest:     {label:'/arrest', color:'rgba(249,183,1,'},
    clearWanted:{label:'/clear',  color:'rgba(79,110,247,'},
    search:     {label:'/search', color:'rgba(79,110,247,'},
    escort:     {label:'/escort', color:'rgba(79,110,247,'},
    putInCar:   {label:'/putpl',  color:'rgba(79,110,247,'},
    uncuffing:  {label:'/uncuff', color:'rgba(79,110,247,'},
};

// ─── Внутреннее состояние ─────────────────────────────────────────────────────
var _state = null;
var _el    = null;
var _prevOnKeyUp = undefined;

function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
function injectCSS() {
    if (document.getElementById('mvdmenu-dom-style')) return;
    var s = document.createElement('style');
    s.id = 'mvdmenu-dom-style';
    s.textContent = CSS;
    document.head.appendChild(s);
}

function removeCSS() {
    var s = document.getElementById('mvdmenu-dom-style');
    if (s) s.parentNode.removeChild(s);
}

// ─── Данные: производные списки ───────────────────────────────────────────────
function getVisibleOptions() {
    var opts = POVSEDNEV_OPTIONS.slice();
    var hidden = (Array.isArray(window.MENU_HIDDEN_ITEMS)) ? window.MENU_HIDDEN_ITEMS : [];
    if (hidden.length) opts = opts.filter(function(o){ return !hidden.includes(o.action); });
    var order = (Array.isArray(window.MENU_ORDER) && window.MENU_ORDER.length) ? window.MENU_ORDER : [];
    if (order.length) {
        var ordered = [];
        order.forEach(function(a){ var f=opts.find(function(o){return o.action===a;}); if(f) ordered.push(f); });
        opts.forEach(function(o){ if(!ordered.find(function(x){return x.action===o.action;})) ordered.push(o); });
        opts = ordered;
    }
    return opts;
}

function getFilteredOptions() {
    var q = (_state.search || '').trim().toLowerCase();
    if (!q) return getVisibleOptions();
    return getVisibleOptions().filter(function(o){
        return o.label.toLowerCase().includes(q) || o.action.toLowerCase().includes(q);
    });
}

function getMainMenuItems() {
    var items = [];
    items.push({id:'povsednev', label:'Повседневная', arrow:true});

    var trackingLabel = (_state.trackingOn && _state.trackingNick)
        ? 'Отслеживание: ' + _state.trackingNick + '[' + (window._mvdCurrentScanId != null ? window._mvdCurrentScanId : '') + ']'
        : 'Отслеживание';
    items.push({id:'tracking', label:trackingLabel, toggleOn:_state.trackingOn});
    items.push({id:'autocuff', label:'Auto-cuff',   toggleOn:_state.autocuffOn});

    if (typeof window.AUTO_GRAB !== 'undefined' && window.AUTO_GRAB === true) {
        items.push({id:'autograb', label:'Авто-снаряжение', toggleOn:_state.autograbOn});
    }
    var partnerLabel = (_state.partnerTracking && _state.partnerNick)
        ? 'Напарник: ' + _state.partnerNick + '[' + _state.partnerId + ']'
        : 'Напарник';
    items.push({id:'naparnick', label:partnerLabel, arrow:true});
    items.push({id:'laws', label:'Законы', arrow:true});
    return items;
}

function getPartnerMenuItems() {
    return [
        {
            id:'tracking',
            label: (_state.partnerTracking && _state.partnerNick)
                ? 'Следить: ' + _state.partnerNick + '[' + _state.partnerId + ']'
                : 'Следить за напарником',
            toggleOn: _state.partnerTracking,
            onClick:  'togglePartnerTracking'
        },
        {
            id:'message',
            label:   'Сообщение для напарника',
            toggleOn: _state.partnerMessage,
            onClick:  'togglePartnerMessage'
        }
    ];
}

function getCurrentListItems() {
    if (_state.screen === 'main')      return getMainMenuItems();
    if (_state.screen === 'povsednev') return getFilteredOptions();
    if (_state.screen === 'partner')   return getPartnerMenuItems();
    return [];
}

// ─── HTML-строители ───────────────────────────────────────────────────────────
function headerSubtitle() {
    switch (_state.screen) {
        case 'main':      return ' АХК';
        case 'povsednev': return ' ПОВСЕДНЕВНАЯ';
        case 'partner':   return ' НАПАРНИК';
        case 'id-input':
            if (_state.idInputContext === 'tracking') return ' ОТСЛЕЖИВАНИЕ';
            if (_state.idInputContext === 'partner')  return ' НАПАРНИК';
            return ' ВВОД ID';
        default: return ' АХК';
    }
}

function buildItemHtml(cls, i, num, label, extra) {
    return '<div class="' + cls + '" data-i="' + i + '">'
        + '<div class="mvdmenu__item-num">' + String(num).padStart(2,'0') + '</div>'
        + '<div class="mvdmenu__item-label">' + escHtml(label) + '</div>'
        + (extra || '')
        + '</div>';
}

function buildListHtml_main(items) {
    return items.map(function(item, i) {
        var cls = 'mvdmenu__item';
        if (item.toggleOn === true)         cls += ' mvdmenu__item_toggle_on';
        else if (item.toggleOn === false)   cls += ' mvdmenu__item_toggle_off';
        if (_state.selectedIndex === i)     cls += ' mvdmenu__item_selected';

        var extra = '';
        if (item.arrow) extra += '<div class="mvdmenu__item-arrow">' + SVG_ARROW + '</div>';
        if (item.toggleOn !== undefined) {
            var stCls = item.toggleOn ? 'mvdmenu__item-status_on' : 'mvdmenu__item-status_off';
            extra += '<div class="mvdmenu__item-status ' + stCls + '">' + (item.toggleOn ? 'Вкл' : 'Выкл') + '</div>';
        }
        return buildItemHtml(cls, i, i+1, item.label, extra);
    }).join('');
}

function buildListHtml_povsednev(opts, visible) {
    if (opts.length === 0) return '<div class="mvdmenu__empty">Ничего не найдено</div>';
    return opts.map(function(opt, i) {
        var cls = 'mvdmenu__item';
        if (opt.special === 'fine')         cls += ' mvdmenu__item_fine';
        if (opt.special === 'wanted')       cls += ' mvdmenu__item_wanted';
        if (_state.selectedIndex === i)     cls += ' mvdmenu__item_selected';

        var globalNum = visible.indexOf(opt) + 1;
        var extra = '';
        if (ACTION_TAGS[opt.action]) {
            var t = ACTION_TAGS[opt.action];
            extra += '<div class="mvdmenu__item-tag" style="background:' + t.color + '0.13);color:' + t.color + '1)">' + escHtml(t.label) + '</div>';
        }
        if (opt.needsId) extra += '<div class="mvdmenu__item-id-badge">ID</div>';
        return buildItemHtml(cls, i, globalNum, opt.label, extra);
    }).join('');
}

function buildListHtml_partner(items) {
    return items.map(function(item, i) {
        var cls = 'mvdmenu__item';
        if (item.toggleOn === true)         cls += ' mvdmenu__item_toggle_on';
        else if (item.toggleOn === false)   cls += ' mvdmenu__item_toggle_off';
        if (_state.selectedIndex === i)     cls += ' mvdmenu__item_selected';

        var stCls = item.toggleOn ? 'mvdmenu__item-status_on' : 'mvdmenu__item-status_off';
        var extra = '<div class="mvdmenu__item-status ' + stCls + '">' + (item.toggleOn ? 'Вкл' : 'Выкл') + '</div>';
        return buildItemHtml(cls, i, i+1, item.label, extra);
    }).join('');
}

// ─── Рендер ───────────────────────────────────────────────────────────────────

// Полный рендер (при смене экрана)
function render() {
    if (!_el) return;

    var contentHtml = buildContentHtml();

    _el.innerHTML =
        '<div class="mvdmenu__overlay" id="mvdmenu-overlay"></div>'
        + '<div class="mvdmenu__wrapper">'
        +   '<div class="mvdmenu__pattern">' + GRAFFITI_SVG + '</div>'
        +   '<div class="mvdmenu__top-accent"></div>'
        +   '<div class="mvdmenu__header">'
        +     '<div class="mvdmenu__header-left">'
        +       '<div class="mvdmenu__back-btn" id="mvdmenu-back">' + SVG_BACK + '</div>'
        +       '<div class="mvdmenu__title">'
        +         '<span class="mvdmenu__title-main">МВД</span>'
        +         '<span class="mvdmenu__title-sub">' + escHtml(headerSubtitle()) + '</span>'
        +       '</div>'
        +     '</div>'
        +     '<div class="mvdmenu__close-btn" id="mvdmenu-close">X</div>'
        +   '</div>'
        +   contentHtml
        + '</div>';

    bindEvents();

    // Фокус на поле ввода (для id-input)
    if (_state.screen === 'id-input') {
        setTimeout(function() {
            var f = document.getElementById('mvdmenu-id-field');
            if (f) { f.focus(); if (_state.idInputValue) f.value = _state.idInputValue; }
        }, 10);
    }
}

// Строит HTML содержимого под шапкой (зависит от screen)
function buildContentHtml() {
    var s = _state.screen;

    if (s === 'main') {
        return '<div class="mvdmenu__list" id="mvdmenu-list">'
            + buildListHtml_main(getMainMenuItems())
            + '</div>';
    }

    if (s === 'povsednev') {
        var visible = getVisibleOptions();
        var filtered = getFilteredOptions();
        return '<div class="mvdmenu__search" id="mvdmenu-search-wrap">'
            +   '<span class="mvdmenu__search-icon">' + SVG_SEARCH + '</span>'
            +   '<input type="text" id="mvdmenu-search" placeholder="Поиск действия..." autocomplete="off">'
            + '</div>'
            + '<div class="mvdmenu__list" id="mvdmenu-list">'
            + buildListHtml_povsednev(filtered, visible)
            + '</div>';
    }

    if (s === 'partner') {
        return '<div class="mvdmenu__list" id="mvdmenu-list">'
            + buildListHtml_partner(getPartnerMenuItems())
            + '</div>';
    }

    if (s === 'id-input') {
        return '<div class="mvdmenu__id-input-wrap">'
            + '<div class="mvdmenu__id-input-label">' + escHtml(_state.idInputLabel || 'Введите ID игрока') + '</div>'
            + '<div class="mvdmenu__id-input-row">'
            +   '<input class="mvdmenu__id-input-field" id="mvdmenu-id-field" type="number" min="1" placeholder="ID игрока...">'
            + '</div>'
            + '<div class="mvdmenu__id-action-row">'
            +   '<div class="mvdmenu__id-confirm-btn" id="mvdmenu-confirm">ПОДТВЕРДИТЬ</div>'
            + '</div>'
            + '</div>';
    }

    return '';
}

// Частичное обновление только списка (не теряем фокус на поиске)
function updateList() {
    if (!_el) return;
    var listEl = document.getElementById('mvdmenu-list');
    if (!listEl) return;

    var visible  = getVisibleOptions();
    var filtered = getFilteredOptions();
    listEl.innerHTML = buildListHtml_povsednev(filtered, visible);
    bindListClicks(filtered, listEl);
}

// Пересоздаём только заголовок (subtitle меняется при смене экрана)
function updateHeader() {
    var sub = _el && _el.querySelector('.mvdmenu__title-sub');
    if (sub) sub.textContent = headerSubtitle();
}

// ─── Привязка событий ─────────────────────────────────────────────────────────
function bindEvents() {
    if (!_el) return;

    // Overlay
    var overlay = document.getElementById('mvdmenu-overlay');
    if (overlay) overlay.addEventListener('click', closeMenu);

    // Close
    var closeBtn = document.getElementById('mvdmenu-close');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Back
    var backBtn = document.getElementById('mvdmenu-back');
    if (backBtn) backBtn.addEventListener('click', goBack);

    // Список: клики по пунктам
    var listEl = document.getElementById('mvdmenu-list');
    if (listEl) {
        if (_state.screen === 'main') {
            var mainItems = getMainMenuItems();
            bindListClicks(mainItems, listEl, function(i) { selectMain(mainItems[i]); });
        } else if (_state.screen === 'povsednev') {
            var filteredOpts = getFilteredOptions();
            bindListClicks(filteredOpts, listEl);
        } else if (_state.screen === 'partner') {
            var partnerItems = getPartnerMenuItems();
            bindListClicks(partnerItems, listEl, function(i) {
                var item = partnerItems[i];
                if (item && item.onClick === 'togglePartnerTracking') togglePartnerTracking();
                else if (item && item.onClick === 'togglePartnerMessage') togglePartnerMessage();
            });
        }
    }

    // Поиск
    var searchInput = document.getElementById('mvdmenu-search');
    if (searchInput) {
        searchInput.value = _state.search || '';
        searchInput.focus();
        searchInput.addEventListener('input', function(e) {
            _state.search = e.target.value;
            _state.selectedIndex = 0;
            updateList();
        });
    }

    // ID-ввод
    var idField = document.getElementById('mvdmenu-id-field');
    if (idField) {
        idField.addEventListener('input', function(e) { _state.idInputValue = e.target.value; });
    }
    var confirmBtn = document.getElementById('mvdmenu-confirm');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmIdInput);
}

// Привязывает клики на пункты списка
// handler(i) — опциональная кастомная функция; если нет — detectScreen
function bindListClicks(items, listEl, handler) {
    listEl.querySelectorAll('.mvdmenu__item').forEach(function(itemEl) {
        itemEl.addEventListener('click', function() {
            var i = parseInt(itemEl.dataset.i, 10);
            _state.selectedIndex = i;
            if (handler) {
                handler(i);
            } else {
                // povsednev по умолчанию
                selectOption(items[i]);
            }
        });
    });
}

// ─── Логика: навигация ────────────────────────────────────────────────────────
function moveSelection(delta) {
    var items = getCurrentListItems();
    if (!items.length) return;
    var len = items.length;
    _state.selectedIndex = ((_state.selectedIndex + delta) % len + len) % len;
    render();
    var sel = _el && _el.querySelector('.mvdmenu__item_selected');
    if (sel) sel.scrollIntoView({block:'nearest'});
}

function confirmSelected() {
    var items = getCurrentListItems();
    if (!items.length) return;
    var idx  = Math.max(0, Math.min(_state.selectedIndex, items.length - 1));
    var item = items[idx];
    if (_state.screen === 'main')      selectMain(item);
    else if (_state.screen === 'povsednev') selectOption(item);
    else if (_state.screen === 'partner') {
        if (item.onClick === 'togglePartnerTracking') togglePartnerTracking();
        else if (item.onClick === 'togglePartnerMessage') togglePartnerMessage();
    }
}

function goBack() {
    if (!_state) return;
    if (_state.screen === 'id-input') {
        _state.idInputValue = '';
        _state.screen = _state._idPrevScreen || 'main';
    } else if (_state.screen === 'povsednev') {
        _state.screen = 'main';
        _state.search = '';
    } else if (_state.screen === 'partner') {
        _state.screen = 'main';
    } else {
        closeMenu();
        return;
    }
    _state.selectedIndex = 0;
    render();
}

// ─── Логика: экраны ───────────────────────────────────────────────────────────
function openIdInput(label, defaultVal, context, prevScreen) {
    _state.idInputLabel   = label || 'Введите ID игрока';
    _state.idInputValue   = (defaultVal != null && defaultVal !== -1) ? String(defaultVal) : '';
    _state.idInputContext = context;
    _state._idPrevScreen  = prevScreen || 'main';
    _state.screen         = 'id-input';
    _state.selectedIndex  = 0;
    render();
}

function confirmIdInput() {
    var raw = String(_state.idInputValue || '').trim();
    var id  = raw === '' ? -1 : parseInt(raw, 10);
    var ctx = _state.idInputContext;

    if (ctx === 'action') {
        var opt = _state._pendingOpt;
        if (opt && id > 0) {
            _state.targetId = id;
            closeMenu();
            setTimeout(function() {
                window._mvdMenuPendingAction = opt.action;
                if (typeof window._mvdExecuteAction === 'function')
                    window._mvdExecuteAction(opt.action, id);
            }, 80);
        } else {
            _state.screen = _state._idPrevScreen || 'povsednev';
            _state.idInputValue = '';
            render();
        }

    } else if (ctx === 'tracking') {
        if (id > 0) {
            _state.targetId = id;
            closeMenu();
            setTimeout(function() {
                if (typeof window._mvdStartTracking === 'function') window._mvdStartTracking(id);
            }, 80);
        } else {
            _state.screen = 'main';
            _state.idInputValue = '';
            render();
        }

    } else if (ctx === 'partner') {
        if (id > 0) {
            _state.targetId = id;
            closeMenu();
            setTimeout(function() {
                if (typeof window.sendClientEventCustom === 'function')
                    window.sendClientEventCustom('custom', 'OnDialogResponse', 683, 1, 0, String(id), '');
            }, 80);
        } else {
            _state.screen = 'partner';
            _state.idInputValue = '';
            render();
        }
    }
}

function selectMain(item) {
    if (!item) return;

    if (item.id === 'povsednev') {
        _state.screen = 'povsednev';
        _state.selectedIndex = 0;
        render();

    } else if (item.id === 'tracking') {
        if (_state.trackingOn || window._mvdCurrentScanId) {
            _state.trackingOn = false;
            closeMenu();
            setTimeout(function() {
                if (typeof window._mvdToggleTracking === 'function') window._mvdToggleTracking();
            }, 80);
        } else {
            openIdInput(
                'Введите ID для отслеживания',
                (_state.targetId !== null && _state.targetId !== -1) ? _state.targetId : null,
                'tracking', 'main'
            );
        }

    } else if (item.id === 'autocuff') {
        _state.autocuffOn = !_state.autocuffOn;
        if (typeof window._mvdToggleAutoCuff === 'function') window._mvdToggleAutoCuff();
        render();

    } else if (item.id === 'autograb') {
        _state.autograbOn = !_state.autograbOn;
        if (typeof window._mvdToggleAutoGrab === 'function') window._mvdToggleAutoGrab();
        render();

    } else if (item.id === 'naparnick') {
        syncPartnerState();
        _state.screen = 'partner';
        _state.selectedIndex = 0;
        render();

    } else if (item.id === 'laws') {
        window._duranOpenMode = 'laws';
        closeMenu();
        setTimeout(function() { window.openInterface('Zkm'); }, 80);
    }
}

function selectOption(opt) {
    if (!opt) return;
    var id = _state.targetId;

    if (opt.special === 'fine') {
        closeMenu();
        setTimeout(function() {
            if (typeof window.showKoapTypeMenu === 'function') window.showKoapTypeMenu(id);
        }, 80);

    } else if (opt.special === 'wanted') {
        closeMenu();
        setTimeout(function() {
            if (typeof window.showUkInputDialog === 'function') window.showUkInputDialog(id);
        }, 80);

    } else if (opt.needsId) {
        if (_state.targetId !== null && _state.targetId !== -1) {
            var theId = _state.targetId;
            closeMenu();
            setTimeout(function() {
                window._mvdMenuPendingAction = opt.action;
                if (typeof window._mvdExecuteAction === 'function')
                    window._mvdExecuteAction(opt.action, theId);
            }, 80);
        } else {
            _state._pendingOpt = opt;
            openIdInput('Введите ID игрока', null, 'action', 'povsednev');
        }

    } else {
        closeMenu();
        setTimeout(function() {
            if (typeof window._mvdExecuteAction === 'function')
                window._mvdExecuteAction(opt.action, id);
        }, 80);
    }
}

// ─── Логика: напарник ─────────────────────────────────────────────────────────
function syncPartnerState() {
    if (typeof window._mvdPartnerGetState === 'function') {
        var s = window._mvdPartnerGetState();
        _state.partnerTracking = !!s.tracking;
        _state.partnerMessage  = !!s.message;
        _state.partnerNick     = s.nick || null;
        _state.partnerId       = s.id   || null;
    }
}

function togglePartnerTracking() {
    syncPartnerState();
    if (_state.partnerTracking) {
        if (typeof window._mvdPartnerDisable === 'function') window._mvdPartnerDisable();
        _state.partnerTracking = false;
        _state.partnerNick = null;
        _state.partnerId   = null;
        render();
    } else {
        var cur = (_state.partnerNick && _state.partnerId)
            ? ('Текущий: ' + _state.partnerNick + '[' + _state.partnerId + ']')
            : 'Не задан';
        openIdInput(
            'Введите ID напарника (' + cur + ')',
            (_state.targetId !== null && _state.targetId !== -1) ? _state.targetId : null,
            'partner', 'partner'
        );
    }
}

function togglePartnerMessage() {
    var newVal = !_state.partnerMessage;
    if (typeof window._mvdPartnerSetMessage === 'function') window._mvdPartnerSetMessage(newVal);
    _state.partnerMessage = newVal;
    render();
}

// ─── Открытие / закрытие ──────────────────────────────────────────────────────
function closeMenu() {
    if (!_el) return;
    if (_el.parentNode) _el.parentNode.removeChild(_el);
    _el    = null;
    _state = null;
    removeCSS();
    // Восстанавливаем клавиатурный обработчик
    if (_prevOnKeyUp !== undefined) window.onKeyUp = _prevOnKeyUp;
    _prevOnKeyUp = undefined;
}

// ─── Публичный API ────────────────────────────────────────────────────────────
window._mvdShowMenu = function(targetId, startScreen) {
    // Если уже открыто — закрыть
    if (_el) { closeMenu(); return; }

    // Поддержка старого механизма через window-переменные (mvdF.js)
    if (targetId === undefined || targetId === null)
        targetId = (window._mvdMenuTargetId != null) ? window._mvdMenuTargetId : null;
    window._mvdMenuTargetId = null;

    if (!startScreen && window._mvdMenuStartScreen)
        startScreen = window._mvdMenuStartScreen;
    window._mvdMenuStartScreen = null;

    // Инициализация состояния
    var ps = (typeof window._mvdPartnerGetState === 'function') ? window._mvdPartnerGetState() : {};
    _state = {
        screen:          startScreen === 'povsednev' ? 'povsednev' : 'main',
        search:          '',
        selectedIndex:   0,
        targetId:        (targetId !== undefined) ? targetId : null,
        trackingOn:      !!(typeof window._mvdTrackingActive !== 'undefined'
                             ? window._mvdTrackingActive : (window._mvdCurrentScanId != null)),
        trackingNick:    (typeof window._mvdTrackingNick !== 'undefined' ? window._mvdTrackingNick : null),
        autocuffOn:      !!(typeof window._mvdAutoCuffEnabled !== 'undefined' ? window._mvdAutoCuffEnabled : false),
        autograbOn:      !!(typeof window._mvdAutoGrabEnabled !== 'undefined' ? window._mvdAutoGrabEnabled : true),
        partnerTracking: !!(ps && ps.tracking),
        partnerMessage:  !!(ps && ps.message),
        partnerNick:     (ps && ps.nick) || null,
        partnerId:       (ps && ps.id)   || null,
        idInputValue:    '',
        idInputLabel:    'Введите ID игрока',
        idInputContext:  null,
        _idPrevScreen:   null,
        _pendingOpt:     null,
    };

    injectCSS();

    _el = document.createElement('div');
    _el.className = 'mvdmenu iface-container';
    _el.id = 'mvdmenu-dom-root';
    document.body.appendChild(_el);

    render();

    // Перехватываем onKeyUp движка (как это делал Vue-компонент в mounted)
    _prevOnKeyUp = window.onKeyUp;
    window.onKeyUp = function(e) {
        if (!_state) return;

        if (e === window.KEY_CODE_ESC) {
            if (_state.screen === 'id-input') {
                _state.idInputValue = '';
                _state.screen = _state._idPrevScreen || 'main';
                _state.selectedIndex = 0;
                render();
            } else {
                goBack();
            }
            return;
        }

        if (_state.screen === 'main' || _state.screen === 'povsednev' || _state.screen === 'partner') {
            if (e === window.KEY_CODE_ARROW_TOP)    { moveSelection(-1); return; }
            if (e === window.KEY_CODE_ARROW_BOTTOM) { moveSelection(1);  return; }
            if (e === window.KEY_CODE_ENTER)        { confirmSelected(); return; }
        }

        if (_state.screen === 'id-input' && e === window.KEY_CODE_ENTER) {
            confirmIdInput();
            return;
        }

        if (typeof _prevOnKeyUp === 'function') _prevOnKeyUp(e);
    };
};

window._mvdCloseMenu = closeMenu;

console.log('[MvdMenu.dom] v1 готов');

})();
