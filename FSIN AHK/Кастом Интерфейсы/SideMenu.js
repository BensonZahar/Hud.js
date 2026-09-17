import{o as openBlock,c as createElementBlock,a as createElementVNode,n as normalizeClass,F as Fragment,i as renderList,t as toDisplayString,b as createVNode,r as resolveComponent,h as createBlock,w as withCtx,_ as _export_sfc}from"./index.js";
import{M as Modal,a as MODAL_TYPES,b as MODAL_COLOR_TYPES}from"./Modal.js";
import{C as ContaineredButton}from"./ContaineredButton.js";

// ─── Вспомогательные функции ────────────────────────────────────────────────

function sleep(ms){
    return new Promise(r=>setTimeout(r,ms));
}

/** Набирает text в строку ввода чата посимвольно, имитируя человека */
async function typeTextInChat(text){
    const hud=window.interface("Hud");
    if(!hud||!hud.$refs||!hud.$refs.chat)return;

    const chat=hud.$refs.chat;
    chat.open();           // открываем чат
    await sleep(200);      // ждём анимацию открытия

    chat.inputText="";
    for(let i=0;i<text.length;i++){
        chat.inputText=text.substring(0,i+1);

        // Vue обновляет el.value через очередь микрозадач ($nextTick).
        // Если читать el.value сразу — там ещё прошлый символ (off-by-one).
        await new Promise(r=>chat.$nextTick(r));

        if(chat.$refs&&chat.$refs.input){
            const el=chat.$refs.input;
            el.selectionStart=el.selectionEnd=el.value.length;
            el.scrollLeft=el.scrollWidth;
        }

        // случайная задержка 55–145 мс + пауза после пробела
        const delay=55+Math.random()*90+(text[i]===" "?90:0);
        await sleep(delay);
    }
}

/**
 * Отправляет массив сообщений в чат последовательно с паузой DELAY_MS.
 * Используется для одиночных message (не лекций).
 */
function sendSequentialMessages(messages, index = 0){
    if(index >= messages.length) return;
    window.sendChatInput(messages[index]);
    if(index + 1 < messages.length){
        setTimeout(()=>{ sendSequentialMessages(messages, index + 1); }, 4000);
    }
}

/**
 * Отправляет лекцию — имитирует человека, который «уходит на паузу»,
 * копирует строку снаружи и вставляет её обратно в чат.
 * Сообщение НЕ отправляется автоматически — ждём Enter от самого игрока.
 *
 *   1. openPauseMenu()              → «свернул игру, пошёл копировать»
 *   2. рандомная пауза 1.5–5 с      → копируем текст в блокноте / т.п.
 *   3. closePauseMenu()              → «вернулся в игру»
 *   4. пауза ~350 мс (анимация)
 *   5. открываем чат, вставляем текст мгновенно (Ctrl+V)
 *   6. ждём пока ИГРОК сам нажмёт Enter
 *   7. повторяем для следующей строки
 */
async function sendLectureMessages(messages){
    function getChat(){
        try{
            const hud=window.interface("Hud");
            return hud&&hud.$refs&&hud.$refs.chat||null;
        }catch(e){ return null; }
    }

    // Ждём закрытия чата — значит игрок нажал Enter (или ESC)
    function waitForChatClose(chat){
        return new Promise(resolve=>{
            if(!chat.isOpen){ resolve(); return; }
            const id=setInterval(()=>{
                if(!chat.isOpen){ clearInterval(id); resolve(); }
            },100);
            // Подстраховка: не ждём бесконечно — 5 минут максимум
            setTimeout(()=>{ clearInterval(id); resolve(); },5*60*1000);
        });
    }

    for(let i=0;i<messages.length;i++){
        const text=messages[i];

        // ── 1. Открываем PauseMenu — «заворачиваем игру» ─────────────────
        try{ window.openPauseMenu(); }catch(e){}

        // ── 2. Рандомная пауза 1.5–5 с — «копируем текст снаружи» ───────
        const pauseMs=1500+Math.random()*3500;
        await sleep(pauseMs);

        // ── 3. Закрываем PauseMenu — «вернулись в игру» ──────────────────
        try{ window.closePauseMenu(); }catch(e){}

        // Ждём анимацию закрытия меню
        await sleep(350);

        // ── 4. Открываем чат и мгновенно вставляем текст (Ctrl+V) ────────
        const chat=getChat();
        if(!chat){
            // Hud не готов — fallback на прямую отправку
            window.sendChatInput(text);
            await sleep(1000);
            continue;
        }

        chat.open();
        await sleep(150);

        chat.inputText=text;
        await new Promise(r=>{ try{ chat.$nextTick(r); }catch(e){ r(); } });

        // Курсор в конец поля, прокрутка к правому краю
        try{
            if(chat.$refs&&chat.$refs.input){
                const el=chat.$refs.input;
                el.selectionStart=el.selectionEnd=el.value.length;
                el.scrollLeft=el.scrollWidth;
            }
        }catch(e){}

        // ── 5. Ждём пока ИГРОК сам нажмёт Enter ──────────────────────────
        await waitForChatClose(chat);

        // Маленькая пауза между сообщениями перед следующей итерацией
        await sleep(200);
    }
}

// ─── Render ─────────────────────────────────────────────────────────────────
//
// Раньше SideMenu рисовал свою собственную "карточку" (фон/рамка/скругление/
// свечение/паттерн), значения которых были вручную скопированы из Modal.css.
// Теперь вместо копий — сам компонент Modal (см. Window.js: TextWindow и
// прочие варианты окна делают ровно то же самое). За счёт этого заголовок,
// акцентная рамка/цвет и graffiti-паттерн гарантированно один-в-один с
// диалогами Window/Modal, а не "похожи на глаз". Разметка пункта меню — те же
// классы .window-table__item/.window-table__col, что рисуют списки в Window.js
// (см. Window.css), и стили теперь реально общие, а не скопированные: чанк
// Window.css добавлен в зависимости интерфейса "SideMenu" в реестре index.js
// (раньше он подгружался только вместе с интерфейсом "Window" и мог просто
// отсутствовать в браузере, если игрок открывал одно только меню).
//
//   type:      MODAL_TYPES.NO_OVERLAY   — без тёмной подложки на весь экран
//              (SideMenu — это постоянная HUD-панель, а не блокирующий диалог)
//   colorType: MODAL_COLOR_TYPES.ORANGE — тот же акцент f9b701, что и раньше

function render(ctx,_cache,$props,$setup,$data,$options){
    const _component_Modal=resolveComponent("Modal");
    const _component_ControlsContaineredButton=resolveComponent("ControlsContaineredButton");
    // class:"window side-menu" — класс "window" отдаёт CSS-переменные
    // --wd-margin/--wd-font-size (см. Window.css: ".window{--wd-margin:...;
    // --wd-font-size:...}"), которые использует .window-table__col ниже.
    // Раньше это не работало не из-за самого класса, а потому что Window.css
    // вообще не подгружался в браузер, когда открывали только SideMenu —
    // это отдельный чанк, и до сих пор он был в зависимостях только у
    // интерфейса "Window" в реестре index.js. Теперь "./Window.css" добавлен
    // и в зависимости интерфейса "SideMenu" (см. index.js, объект интерфейсов,
    // запись SideMenu:f(()=>d(()=>import("./SideMenu.js"),[...,"./Window.css"]...))),
    // так что чанк гарантированно грузится вместе с этой панелью, и класс
    // "window" здесь снова осмыслен.
    // title: когда открыто подменю (subMenuItems) — показываем его заголовок,
    // иначе — стандартный prop.title ("Меню")
    return openBlock(),createBlock(_component_Modal,{
        class:"window side-menu",
        isOpened:$data.panelIsOpened,
        colorType:$data.MODAL_COLOR_TYPES.ORANGE,
        type:$data.MODAL_TYPES.NO_OVERLAY,
        title:$data.subMenuItems ? $data.subMenuTitle : $props.title
    },{
        default:withCtx(()=>[
            // visibleItems: в главном меню = menuItems, в подменю = subMenuItems.
            // Класс "selected" — та же логика подсветки стрелками, что в Window.js.
            (openBlock(!0),createElementBlock(Fragment,null,renderList($options.visibleItems,(item,index)=>(
                openBlock(),createElementBlock("div",{
                    key:item.id,
                    class:normalizeClass(["window-table__item",{selected:$data.selected===index}]),
                    onClick:$event=>$options.select(item)
                },[
                    createElementVNode("div",{class:"window-table__col"},toDisplayString(item.title),1)
                ],10,["onClick"])
            )),128)),
            createElementVNode("div",{class:"side-menu__hints"},[
                // ESC: в подменю — «Назад» (goBack), в главном меню — «Закрыть меню» (close)
                createVNode(_component_ControlsContaineredButton,{
                    containerText:$data.subMenuItems ? "Назад" : "Закрыть меню",
                    keyCode:$data.KEY_CODE_ESC,
                    text:"ESC",
                    isPreview:!0,
                    clickable:!1
                },null,8,["containerText","keyCode"]),
                createVNode(_component_ControlsContaineredButton,{containerText:"×2 — скрыть/показать меню",keyCode:$data.KEY_CODE_ALT,text:"ALT",isPreview:!0,clickable:!1},null,8,["keyCode"]),
                createVNode(_component_ControlsContaineredButton,{containerText:"курсор вкл/выкл",keyCode:$data.KEY_CODE_ALT,text:"ALT",isPreview:!0,clickable:!1},null,8,["keyCode"])
            ])
        ]),
        _:1
    },8,["isOpened","colorType","type","title"]);
}

// ─── Component options ───────────────────────────────────────────────────────

const SideMenuOptions={
    name:"SideMenu",
    props:{
        items:{type:Array,default:()=>[]},
        // Заголовок карточки — рисует сам Modal (см. render). Раньше у SideMenu
        // заголовка не было вовсе; теперь он есть "бесплатно" вместе с Modal.
        title:{type:String,default:"Меню"}
    },
    components:{
        Modal,
        ControlsContaineredButton:ContaineredButton
    },
    data(){
        return{
            KEY_CODE_ESC:window.KEY_CODE_ESC,
            KEY_CODE_ENTER:window.KEY_CODE_ENTER,
            KEY_CODE_ALT:18,          // ALT
            MODAL_TYPES,
            MODAL_COLOR_TYPES,
            panelIsOpened:false,
            // подсветка стрелками — тот же принцип, что в Window.js:TableWindow
            selected:0,
            // подменю: null = главное меню, Array = список пунктов подменю
            subMenuItems:null,
            subMenuTitle:'',
            // сохраняем позицию в главном меню при входе в подменю
            mainMenuSelected:0,
            // двойное нажатие ALT
            altPressCount:0,
            altPressTimer:null,
            // состояние курсора (актуально пока меню открыто)
            cursorEnabled:true
        };
    },
    computed:{
        menuItems(){
            // Список пунктов всегда берётся из fsin.js (window._stroiMenuItems).
            // Редактировать — только там, в блоке «НАСТРОЙКА SideMenu».
            return window._stroiMenuItems||[];
        },
        // Текущий видимый список: подменю (если открыто) или главное меню.
        // Используется в render и в обработчиках стрелок/Enter.
        visibleItems(){
            return this.subMenuItems || this.menuItems;
        }
    },
    created(){
        document.addEventListener("keyup",this.onKeyUp);
        // Стрелки — отдельным keydown-листенером, как в Window.js
        // (TableWindow.keyEvent): keydown, а не keyup, чтобы при удержании
        // клавиши подсветка бежала дальше, а не срабатывала один раз на отпускание.
        document.addEventListener("keydown",this.onArrowKeyDown);
    },
    unmounted(){
        document.removeEventListener("keyup",this.onKeyUp);
        document.removeEventListener("keydown",this.onArrowKeyDown);
        clearTimeout(this.altPressTimer);
        // подстраховка: если компонент размонтировался пока панель считалась открытой —
        // не оставляем значок рулетки скрытым навсегда
        document.body.classList.remove("side-menu-opened");
    },
    mounted(){
        this.panelIsOpened=true;
        window.setCursorStatus("SideMenu",true);
    },
    watch:{
        // Пока панель SideMenu видна — прячем значок рулетки в Hud (см. Hud.css:
        // "body.side-menu-opened .hud-radmir-info__bonus"). Общего стора между
        // SideMenu и Hud нет, поэтому сигналим через класс на <body>.
        panelIsOpened(isOpened){
            document.body.classList.toggle("side-menu-opened",isOpened);
        }
    },
    methods:{

        // ── Обработка клавиш ─────────────────────────────────────────────────

        onKeyUp(e){
            if(e.keyCode===this.KEY_CODE_ESC){
                // В подменю: ESC = назад в главное меню (как в Window/Modal).
                // В главном меню: ESC = полностью закрыть интерфейс.
                if(this.subMenuItems){ this.goBack(); } else { this.close(); }
                return;
            }
            if(e.keyCode===this.KEY_CODE_ALT){ this.handleAltPress(); return; }
            // ENTER — выбрать подсвеченный пункт. Проверяем panelIsOpened, чтобы
            // пока панель скрыта двойным ALT Enter не срабатывал вхолостую.
            if(e.keyCode===this.KEY_CODE_ENTER && this.panelIsOpened && this.visibleItems.length){
                this.select(this.visibleItems[this.selected]);
            }
        },

        /**
         * Стрелки вверх/вниз — подсветка пункта меню. Логика перенесена из
         * Window.js (TableWindow.keyEvent): ARROW_TOP/ARROW_BOTTOM, индекс по
         * модулю длины списка (зацикливание с последнего пункта на первый и
         * обратно). requiredVerticalScroll оттуда не переносим — у SideMenu
         * нет ScrollableContainer, список короткий и не скроллится. Проверка
         * panelIsOpened — по той же причине, что и у ENTER выше: пока панель
         * скрыта, стрелки не должны тайком менять подсветку под капотом.
         */
        onArrowKeyDown(e){
            if(!this.panelIsOpened)return;
            const total=this.visibleItems.length;
            if(!total)return;

            if(e.keyCode===window.KEY_CODE_ARROW_BOTTOM){
                this.selected=(this.selected+1)%total;
            } else if(e.keyCode===window.KEY_CODE_ARROW_TOP){
                this.selected=(this.selected-1+total)%total;
            }
        },

        /**
         * Логика ALT:
         *  • 1 нажатие (350 мс без повтора) — когда панель видна: переключить курсор
         *  • 2 нажатия подряд — скрыть/показать панель (интерфейс НЕ закрывается,
         *    компонент остаётся живым и продолжает слушать ALT)
         *    ESC — единственный способ полностью закрыть интерфейс
         */
        handleAltPress(){
            this.altPressCount++;

            if(this.altPressCount===1){
                this.altPressTimer=setTimeout(()=>{
                    // Одиночный ALT: переключить курсор только когда панель видна
                    if(this.panelIsOpened){
                        this.cursorEnabled=!this.cursorEnabled;
                        window.setCursorStatus("SideMenu",this.cursorEnabled);
                    }
                    this.altPressCount=0;
                    this.altPressTimer=null;
                },350);

            } else if(this.altPressCount>=2){
                clearTimeout(this.altPressTimer);
                this.altPressTimer=null;
                this.altPressCount=0;

                if(this.panelIsOpened){
                    // Скрываем панель — НЕ вызываем close()/closeInterface,
                    // иначе компонент размонтируется и перестанет слушать ALT
                    this.panelIsOpened=false;
                    this.cursorEnabled=false;
                    window.setCursorStatus("SideMenu",false);
                } else {
                    // Панель скрыта → показываем снова
                    this.panelIsOpened=true;
                    this.cursorEnabled=true;
                    window.setCursorStatus("SideMenu",true);
                }
            }
        },

        // ── Выбор пункта меню ────────────────────────────────────────────────

        /**
         * Открыть подменю для пункта с subItems.
         * Запоминаем текущую позицию selected, чтобы goBack() вернул курсор
         * ровно на тот пункт, с которого вошли в подменю.
         */
        openSubMenu(item){
            this.mainMenuSelected=this.selected;
            this.subMenuItems=item.subItems;
            this.subMenuTitle=item.title;
            this.selected=0;
        },

        /**
         * ESC внутри подменю — вернуться в главное меню.
         * Восстанавливает ранее сохранённую позицию selected.
         */
        goBack(){
            this.subMenuItems=null;
            this.subMenuTitle='';
            this.selected=this.mainMenuSelected;
        },

        select(item){
            // Case 1: пункт имеет subItems → показываем подменю (панель остаётся открытой)
            if(item.subItems&&item.subItems.length){
                this.openSubMenu(item);
                return;
            }

            // Ищем данные пункта: сначала в глобальном конфиге, потом в самом item.
            // Для пунктов подменю found = null (их нет в _stroiMenuItems верхнего уровня),
            // поэтому fallback на item.messages / item.message работает корректно.
            const found=(window._stroiMenuItems||[]).find(d=>d.id===item.id);
            const messages=(found&&found.messages)||item.messages||null;
            const message=messages?null:
                ((found&&found.message)||item.message
                ||("Сейчас пройдет "+item.title.toLowerCase()));

            // Скрываем панель и сбрасываем подменю
            this.panelIsOpened=false;
            this.cursorEnabled=false;
            window.setCursorStatus("SideMenu",false);
            this.subMenuItems=null;
            this.subMenuTitle='';

            if(messages&&messages.length){
                // Case 2: массив /s-сообщений (лекция) → имитируем копипасту:
                // случайная пауза, мгновенная вставка, отправка, и так по кругу.
                // Первая итерация не ждёт полную паузу сразу — даём 300 мс на
                // закрытие панели, а потом sendLectureMessages начинает свой цикл.
                setTimeout(()=>{ sendLectureMessages(messages); },300);
            } else {
                // Case 3: одно сообщение → набираем посимвольно в поле чата
                setTimeout(()=>{ typeTextInChat(message); },300);
            }
        },

        // ── Закрытие интерфейса ───────────────────────────────────────────────

        close(){
            this.panelIsOpened=false;
            this.subMenuItems=null;
            this.subMenuTitle='';
            this.altPressCount=0;
            clearTimeout(this.altPressTimer);
            this.altPressTimer=null;
            this.cursorEnabled=true;

            setTimeout(()=>{
                window.closeInterface("SideMenu");
            },250);
        }
    }
};

const SideMenu=_export_sfc(SideMenuOptions,[["render",render]]);
export{SideMenu as S};
export default SideMenu;
