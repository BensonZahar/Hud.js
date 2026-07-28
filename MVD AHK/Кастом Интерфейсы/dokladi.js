import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,g as createBlock,b as createVNode,_ as _export_sfc}from"./index.js";
import{C as ControlsContaineredButton}from"./ContaineredButton.js";

// ══════════════════════════════════════════════════════════════════════════
//  Dokladi.js — меню "Доклады" (доклад по посту / патрулю через /r)
//  Репозиторий: BensonZahar/Hud.js
//  Папка:       MVD AHK/Кастом Интерфейсы/
//
//  ЭТО «РЕАЛЬНЫЙ» ФАЙЛ КОМПОНЕНТА — именно его тянет с GitHub локальный
//  загрузчик dokladi.js (см. window.__prefetch_dokladi_js / _xhrGet в
//  локальном dokladi.js). Локальный dokladi.css оставлен пустым — стили
//  инжектятся отсюда же в mounted(), как в MvdMenu.js/zkm.js.
//
//  Экраны:
//    "type"       — выбор Пост / Патруль
//    "name-input" — ввод названия поста / города патрулирования
//    "stage"      — выбор Начало / Середина / Конец → отправка /r-доклада
//
//  Звание и фамилия берутся из window._mvdRank / window._mvdLastName —
//  так же, как в mvdF.js для "Приветствие". Отправка доклада делегируется
//  в window._mvdExecuteDoklad(type,name,stage) (см. mvdF.js).
//
//  ── Сессия доклада (window._dokladActive) ───────────────────────────────
//  Как только название подтверждено и открыт экран "stage" — сессия
//  считается активной: {type, name, timerStartAt} сохраняются в
//  window._dokladActive. timerStartAt появляется там, как только отправлен
//  хотя бы один доклад "Начало"/"Середина".
//  Если меню закрыть и открыть заново, не отправив "Конец" — оно откроется
//  сразу на экране "stage" с тем же постом/патрулём, минуя "type"/"name-input".
//  Сессия сбрасывается когда отправлен доклад "Конец" или нажата "Отмена"
//  (последняя — чисто локально, без отправки чего-либо на сервер).
//
//  ── Таймер (секундомер, считает ВВЕРХ, без предела) ─────────────────────
//  Момент старта (timerStartAt) хранится ТОЛЬКО в window._dokladActive —
//  это единственный источник правды, он пишется туда сразу же в момент
//  отправки "Начало"/"Середина" и не меняется, пока сессия жива. Поэтому
//  восстановление таймера при повторном открытии меню (mounted()) не
//  зависит от того, успел ли предыдущий экземпляр компонента корректно
//  отработать close()/unmounted() — раньше это было узким местом: если
//  интерфейс закрывался не через кнопку/ESC самого компонента (например,
//  внешним window.closeInterface('Dokladi') из другого места скрипта),
//  снимок таймера мог не сохраниться, и таймер пропадал насовсем до
//  следующего "Середина"/"Конец". Теперь такого разрыва просто не может
//  быть: значение уже лежит в window._dokladActive до всякого закрытия.
//
//  Пока меню открыто — обратный отсчёт в интерфейсе обновляется локальным
//  setInterval компонента (this.timerInterval), с прямым обновлением DOM
//  (CEF-fix, как в AdvMenu.js). Когда меню закрыто — за всплывающий тост
//  отвечает независимый от жизненного цикла компонента фоновый интервал
//  (window._dokladToastInterval, см. _dokladEnsureBackgroundToast ниже):
//  он читает timerStartAt из window._dokladActive напрямую, а не из
//  состояния конкретного экземпляра Vue-компонента.
// ══════════════════════════════════════════════════════════════════════════

// ─── SVG иконка стрелки ─────────────────────────────────────────────────────
const SVG_ARROW=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2L7 5L3 8" stroke="rgba(244,241,225,0.3)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ─── Пункты выбора типа доклада ─────────────────────────────────────────────
const TYPE_OPTIONS=[
    {id:"post",   label:"Пост"},
    {id:"patrol", label:"Патруль"},
];

// ─── Пункты выбора стадии доклада ───────────────────────────────────────────
const STAGE_OPTIONS=[
    {id:"start",  label:"Начало"},
    {id:"middle", label:"Середина"},
    {id:"end",    label:"Конец"},
];

// ─── Фоновый тост (модульные функции — НЕ зависят от жизненного цикла
//     конкретного экземпляра Vue-компонента, читают всё из window._dokladActive) ──
function _dokladFormatTime(seconds){
    const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60;
    if(h>0) return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}
function _dokladRemoveToast(){
    const el=document.getElementById("dokladi-toast");
    if(el)el.remove();
}
function _dokladRenderToast(){
    const active=window._dokladActive;
    if(!active||!active.timerStartAt) return;
    let el=document.getElementById("dokladi-toast");
    if(!el){
        el=document.createElement("div");
        el.id="dokladi-toast";
        el.style.cssText="position:fixed;bottom:3vh;right:2vh;background:#141419f2;border:0.15vh solid rgba(249,183,1,0.55);border-radius:0.56vh;padding:0.56vh 1.11vh;pointer-events:none;z-index:9999;font-family:'Open Sans',sans-serif;min-width:10vh;box-shadow:0 0.56vh 1.85vh rgba(0,0,0,0.6);";
        document.body.appendChild(el);
    }
    const s=Math.max(0,Math.floor((Date.now()-active.timerStartAt)/1000));
    const label=active.type==="post" ? "Пост" : "Патруль";
    el.innerHTML=`<div style="color:#f9b701;font-size:0.87vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;">[ДОКЛАД] ${label} - ${active.name}</div>`+
                 `<div style="color:#f4f1e1;font-family:'Open Sans Condensed',monospace;font-size:1.85vh;font-style:italic;font-weight:700;">${_dokladFormatTime(s)}</div>`;
}
// Гарантирует, что фоновый интервал тоста запущен, если есть активная сессия
// с идущим таймером. Идемпотентна — повторный вызов ничего не сломает.
// Не зависит от того, смонтирован ли сейчас компонент Dokladi: единственное
// условие — наличие window._dokladActive.timerStartAt.
function _dokladEnsureBackgroundToast(){
    if(window._dokladToastInterval) return;
    window._dokladToastInterval=setInterval(()=>{
        const active=window._dokladActive;
        if(!active||!active.timerStartAt){
            clearInterval(window._dokladToastInterval);
            window._dokladToastInterval=null;
            _dokladRemoveToast();
            return;
        }
        // Пока меню открыто — таймер и так виден в самом интерфейсе,
        // плавающий тост в этот момент не нужен.
        if(window._dokladMenuMounted){ _dokladRemoveToast(); return; }
        _dokladRenderToast();
    },1000);
}

// ─── render ─────────────────────────────────────────────────────────────────
function render(_ctx,_cache,$props,$setup,$data,$options){
    const _component_ControlsContaineredButton=resolveComponent("ControlsContaineredButton");
    return (openBlock(), createElementBlock("div",{class:"dokladi iface-container"},[

        // Overlay
        createBaseVNode("div",{class:"dokladi__overlay",onClick:$options.close}),

        // Wrapper
        createBaseVNode("div",{class:"dokladi__wrapper"},[

            createBaseVNode("div",{class:"dokladi__top-accent"}),

            // ── Header ───────────────────────────────────────────────────────
            createBaseVNode("div",{class:"dokladi__header"},[
                createBaseVNode("div",{class:"dokladi__title"},[
                    createBaseVNode("span",{class:"dokladi__title-main"},"KONST"),
                    createBaseVNode("span",{class:"dokladi__title-ahk"},"AHK"),
                    createBaseVNode("span",{class:"dokladi__title-sub"},
                        toDisplayString($options.headerSubtitle), 1 /* TEXT */
                    )
                ]),
                createBaseVNode("div",{class:"dokladi__close-btn",onClick:$options.close},"X")
            ]),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: type — выбор Пост / Патруль
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="type"
                ? (openBlock(),createElementBlock(Fragment,{key:"type"},[
                    createBaseVNode("div",{class:"dokladi__list"},[
                        (openBlock(true),createElementBlock(Fragment,null,
                            renderList(TYPE_OPTIONS,(item,i)=>(
                                openBlock(),createElementBlock("div",{
                                    key:item.id,
                                    class:normalizeClass(["dokladi__item",{
                                        "dokladi__item_selected": $data.selectedIndex===i,
                                    }]),
                                    onClick:$event=>{$data.selectedIndex=i;$options.selectType(item);}
                                },[
                                    createBaseVNode("div",{class:"dokladi__item-num"},
                                        toDisplayString(String(i+1).padStart(2,"0")), 1 /* TEXT */
                                    ),
                                    createBaseVNode("div",{class:"dokladi__item-label"},
                                        toDisplayString(item.label), 1 /* TEXT */
                                    ),
                                    createBaseVNode("div",{class:"dokladi__item-arrow",innerHTML:SVG_ARROW}),
                                ],10,["onClick"])
                            ))
                        ,128))
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: name-input — Ввод названия поста / города патрулирования
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="name-input"
                ? (openBlock(),createElementBlock(Fragment,{key:"name-input"},[
                    createBaseVNode("div",{class:"dokladi__name-input-wrap"},[
                        createBaseVNode("div",{class:"dokladi__name-input-label"},
                            toDisplayString($data.reportType==="post"
                                ? "Введите название поста"
                                : "Введите город патрулирования"), 1 /* TEXT */
                        ),
                        createBaseVNode("div",{class:"dokladi__name-input-row"},[
                            createBaseVNode("input",{
                                class:"dokladi__name-input-field",
                                id:"dokladi-name-field",
                                type:"text",
                                maxlength:"64",
                                placeholder:$data.reportType==="post" ? "Название поста..." : "Город патрулирования...",
                                value:$data.reportName,
                                onInput:$event=>{$data.reportName=$event.target.value},
                                onKeydown:$options.onNameInputKeydown,
                            },null,40,["placeholder","value","onInput","onKeydown"])
                        ]),
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: stage — выбор Начало / Середина / Конец + таймер
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="stage"
                ? (openBlock(),createElementBlock(Fragment,{key:"stage"},[
                    createBaseVNode("div",{class:"dokladi__stage-current"},[
                        createBaseVNode("span",{class:"dokladi__stage-current-type"},
                            toDisplayString($data.reportType==="post" ? "Пост:" : "Патруль:"), 1 /* TEXT */
                        ),
                        createBaseVNode("span",{class:"dokladi__stage-current-name"},
                            toDisplayString($data.reportName), 1 /* TEXT */
                        )
                    ]),
                    // Таймер — показывается только если уже был отправлен хотя бы один доклад
                    // (Начало/Середина) в этой сессии; до этого timerRunning===false.
                    $data.timerRunning
                        ? (openBlock(),createElementBlock(Fragment,{key:"timer"},[
                            createBaseVNode("div",{class:"dokladi__phase-label"},"Время с последнего доклада"),
                            // id="dokladi-timer-disp" — обновляется напрямую через DOM (CEF-fix, как в AdvMenu.js)
                            createBaseVNode("div",{id:"dokladi-timer-disp",class:"dokladi__timer-display"},
                                toDisplayString($options.timerDisplay), 1 /* TEXT */
                            ),
                          ],64))
                        : createCommentVNode("",true),
                    createBaseVNode("div",{class:"dokladi__list"},[
                        (openBlock(true),createElementBlock(Fragment,null,
                            renderList(STAGE_OPTIONS,(item,i)=>(
                                openBlock(),createElementBlock("div",{
                                    key:item.id,
                                    class:normalizeClass(["dokladi__item",{
                                        "dokladi__item_selected": $data.selectedIndex===i,
                                    }]),
                                    onClick:$event=>{$data.selectedIndex=i;$options.selectStage(item);}
                                },[
                                    createBaseVNode("div",{class:"dokladi__item-num"},
                                        toDisplayString(String(i+1).padStart(2,"0")), 1 /* TEXT */
                                    ),
                                    createBaseVNode("div",{class:"dokladi__item-label"},
                                        toDisplayString(item.label), 1 /* TEXT */
                                    ),
                                ],10,["onClick"])
                            ))
                        ,128))
                    ]),
                    // ── Отмена доклада — локальный сброс сессии, без отправки на сервер ──
                    createBaseVNode("div",{class:"dokladi__cancel-btn",onClick:$options.cancelReport},"Отменить доклад"),
                  ],64))
                : createCommentVNode("",true),

            // ── Footer: Enter = подтвердить, ESC = назад/закрыть ──────────────
            createBaseVNode("div",{class:"dokladi__footer"},[
                (openBlock(),createBlock(_component_ControlsContaineredButton,{
                    key:0,
                    containerText:$options.footerConfirmText,
                    text:"Enter",
                    keyCode:$data.KEY_CODE_ENTER,
                    disabled:$options.footerConfirmDisabled,
                    onPressed:$options.footerConfirm
                },null,8,["containerText","keyCode","disabled","onPressed"])),
                (openBlock(),createBlock(_component_ControlsContaineredButton,{
                    key:1,
                    containerText:$options.footerBackText,
                    keyCode:$data.KEY_CODE_ESC,
                    onPressed:$options.goBack
                },null,8,["containerText","keyCode","onPressed"]))
            ]),

        ])
    ]));
}

// ─── Компонент ────────────────────────────────────────────────────────────────
const _sfc_main={
    name:"Dokladi",
    components:{ControlsContaineredButton},
    data(){
        return{
            // screen: "type" | "name-input" | "stage"
            screen:"type",
            KEY_CODE_ESC:window.KEY_CODE_ESC,
            KEY_CODE_ENTER:window.KEY_CODE_ENTER,
            selectedIndex:0,
            reportType:null,   // "post" | "patrol"
            reportName:"",
            // ── Таймер (секундомер, считает ВВЕРХ — как долго прошло с доклада) ──
            timerRunning:false,
            timerSeconds:0,
            timerStartAt:0,
            timerInterval:null,
        }
    },
    computed:{
        headerSubtitle(){
            if(this.screen==="type")       return "ДОКЛАДЫ";
            if(this.screen==="name-input") return this.reportType==="post" ? "ПОСТ" : "ПАТРУЛЬ";
            if(this.screen==="stage")      return this.reportType==="post" ? "ПОСТ" : "ПАТРУЛЬ";
            return "ДОКЛАДЫ";
        },
        currentListItems(){
            if(this.screen==="type")  return TYPE_OPTIONS;
            if(this.screen==="stage") return STAGE_OPTIONS;
            return [];
        },
        footerConfirmText(){
            return this.screen==="name-input" ? "Подтвердить" : "Выбрать";
        },
        footerBackText(){
            if(this.screen==="type") return "Закрыть";
            return "Назад";
        },
        footerConfirmDisabled(){
            if(this.screen==="name-input") return this.reportName.trim().length===0;
            return this.currentListItems.length===0;
        },
        // Используется только для начального рендера; далее обновляется через DOM напрямую (как в AdvMenu.js)
        timerDisplay(){
            return _dokladFormatTime(this.timerSeconds);
        },
    },
    watch:{
        screen(){ this.selectedIndex=0; },
    },
    methods:{
        // ── Клавиатурная навигация по спискам ────────────────────────────────
        moveSelection(delta){
            const items=this.currentListItems;
            if(!items.length) return;
            const len=items.length;
            this.selectedIndex=((this.selectedIndex+delta)%len+len)%len;
        },
        confirmSelected(){
            if(this.screen==="type"){
                const items=TYPE_OPTIONS;
                const idx=Math.min(Math.max(this.selectedIndex,0),items.length-1);
                this.selectType(items[idx]);
            } else if(this.screen==="name-input"){
                this.confirmNameInput();
            } else if(this.screen==="stage"){
                const items=STAGE_OPTIONS;
                const idx=Math.min(Math.max(this.selectedIndex,0),items.length-1);
                this.selectStage(items[idx]);
            }
        },
        footerConfirm(){
            this.confirmSelected();
        },
        goBack(){
            if(this.screen==="stage"){
                // Возврат к вводу названия не трогает уже идущий таймер/сессию —
                // они не сбрасываются, просто перевыбор экрана.
                this.screen="name-input";
                this.$nextTick(()=>{ const f=document.getElementById("dokladi-name-field");if(f)f.focus(); });
            } else if(this.screen==="name-input"){
                this.reportType=null;
                this.screen="type";
            } else if(this.screen==="type"){
                this.close();
            }
        },
        // ── Экран type — выбор Пост/Патруль ──────────────────────────────────
        selectType(item){
            this.reportType=item.id;
            // Подставляем последнее использованное название для этого типа,
            // чтобы для "Середина"/"Конец" не нужно было вбивать его заново.
            const saved=item.id==="post" ? window._mvdDokladPostName : window._mvdDokladPatrolName;
            this.reportName=saved||"";
            this.screen="name-input";
            this.$nextTick(()=>{ const f=document.getElementById("dokladi-name-field");if(f)f.focus(); });
        },
        // ── Экран name-input — подтверждение названия ────────────────────────
        confirmNameInput(){
            const name=String(this.reportName||"").trim();
            if(!name) return;
            this.reportName=name;
            if(this.reportType==="post") window._mvdDokladPostName=name;
            else if(this.reportType==="patrol") window._mvdDokladPatrolName=name;
            // Помечаем сессию активной — при следующем открытии меню Доклады
            // сразу попадём на этот же экран stage с этим постом/патрулём,
            // минуя выбор типа и ввод названия (пока не будет отправлен "Конец"
            // или нажата "Отмена"). timerStartAt появится тут же, в
            // selectStage(), как только будет отправлено "Начало"/"Середина".
            window._dokladActive={type:this.reportType,name:this.reportName,timerStartAt:null};
            this.screen="stage";
        },
        onNameInputKeydown(e){
            if(e.key==="Escape"){ this.goBack(); return; }
            if(e.key==="Enter"){ this.confirmNameInput(); }
        },
        // ── Экран stage — выбор Начало/Середина/Конец → отправка доклада ────
        selectStage(item){
            const type=this.reportType;
            const name=this.reportName;
            const stage=item.id;
            // Закрываем меню СРАЗУ, при любой стадии (не только "Конец") — чтобы
            // оно не мешало (не попадало в кадр) скриншоту, который делается сразу
            // после отправки доклада в рацию. Таймер/сессия при этом не теряются:
            // window._dokladActive хранит их независимо, а после unmounted()
            // автоматически включается фоновый тост (_dokladEnsureBackgroundToast) —
            // так что для "Начало"/"Середина" пользователь всё равно видит секундомер.
            this.close();
            // Небольшая пауза (как и раньше было только для "Конец") — даём
            // интерфейсу реально исчезнуть с экрана, прежде чем отправлять доклад
            // в рацию и жать F8 на скриншот.
            setTimeout(()=>{
                // Отправляем доклад в рацию (там же — приписка "c 60" и нажатие F8
                // для скриншота-пруфа).
                if(typeof window._mvdExecuteDoklad==="function")
                    window._mvdExecuteDoklad(type,name,stage);
                if(stage==="end"){
                    // Финальный доклад — сессию и таймер завершаем через 1.5с после
                    // отправки/скриншота (точное время, чтобы F8 гарантированно
                    // успел сработать, пока сессия ещё формально активна).
                    setTimeout(()=>{
                        this._stopTimer();
                        this._endSession();
                    },1500);
                } else {
                    // "Начало"/"Середина" — (пере)запускаем секундомер; меню уже
                    // закрыто, дальше таймер держит фоновый тост.
                    // timerStartAt пишем СРАЗУ в window._dokladActive — это
                    // единственный источник правды для восстановления таймера при
                    // переоткрытии меню, он не зависит от того, отработает ли
                    // корректно close()/unmounted() следующего закрытия интерфейса.
                    const startAt=Date.now();
                    window._dokladActive={type,name,timerStartAt:startAt};
                    this._startTimer(startAt);
                }
            },80);
        },
        // ── Отмена доклада — локальный сброс без отправки чего-либо на сервер ──
        cancelReport(){
            this._stopTimer();
            this._endSession();
            this.reportType=null;
            this.reportName="";
            this.screen="type";
            this.selectedIndex=0;
            this.close();
        },
        // Сбрасывает сессию/таймер/тост — общая часть для "Конец" и "Отмена"
        _endSession(){
            window._dokladActive=null;
            if(window._dokladToastInterval){clearInterval(window._dokladToastInterval);window._dokladToastInterval=null;}
            _dokladRemoveToast();
        },
        // ── Таймер: секундомер (считает вверх, без предела) ──────────────────
        _startTimer(startAt){
            this._clearTimerInterval();
            this.timerStartAt=startAt;
            this.timerSeconds=Math.max(0,Math.floor((Date.now()-startAt)/1000));
            this.timerRunning=true;
            setTimeout(()=>this._updateTimerDOM(),30);
            this.timerInterval=setInterval(()=>{
                this.timerSeconds=Math.max(0,Math.floor((Date.now()-this.timerStartAt)/1000));
                this._updateTimerDOM();
            },1000);
        },
        _clearTimerInterval(){
            if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
        },
        _stopTimer(){
            this._clearTimerInterval();
            this.timerRunning=false;
            this.timerSeconds=0;
        },
        // ── Прямое обновление DOM таймера (обход Vue reactivity в CEF, как в AdvMenu.js) ──
        _updateTimerDOM(){
            const disp=document.getElementById("dokladi-timer-disp");
            if(disp) disp.textContent=this.timerDisplay;
        },
        close(){
            window.closeInterface("Dokladi");
        }
    },
    created(){this.$data.noAdaptation=true},
    mounted(){
        const s=document.createElement("style");
        s.id="dokladi-style";
        s.textContent=`
.dokladi{align-items:center;display:flex;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:100vh;justify-content:center;left:0;position:absolute;text-transform:none;top:0;width:100vw;z-index:11;}
.dokladi__overlay{bottom:0;left:0;position:absolute;right:0;top:0;}
.dokladi__wrapper{background:#141419eb;border:0.19vh solid rgba(255,255,255,0.05);border-radius:0.74vh;box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(249,183,1,0.2),0 1.5vh 5vh rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;position:relative;width:36vh;z-index:1;}
.dokladi__top-accent{background:#f9b701;height:0.19vh;left:0;position:absolute;right:0;top:0;}

/* Header */
.dokladi__header{align-items:center;background:transparent;border-bottom:0.19vh solid #f4f1e11a;display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.dokladi__title{align-items:baseline;display:flex;font-family:"Open Sans Condensed",var(--fallback-font);font-style:italic;font-weight:700;gap:0.56vh;text-transform:uppercase;}
.dokladi__title-main{color:#f4f1e1;font-size:2.4vh;letter-spacing:0.1vh;line-height:normal;}
.dokladi__title-ahk{color:#f9b701;font-size:2.4vh;letter-spacing:0.1vh;line-height:normal;}
.dokladi__title-sub{color:#f4f1e166;font-size:1.11vh;font-style:normal;font-weight:400;margin-left:0.74vh;text-transform:none;}
.dokladi__close-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e199;cursor:pointer;display:flex;font-size:1.48vh;font-weight:700;height:2.96vh;justify-content:center;transition:all 0.15s ease;width:2.96vh;}
@media (platform:pc){.dokladi__close-btn:hover{background:#e25544;border-color:#e25544;color:#fff;}}

/* List */
.dokladi__list{display:flex;flex-direction:column;max-height:48vh;overflow-y:auto;position:relative;z-index:1;}
.dokladi__list::-webkit-scrollbar{width:1.11vh;}
.dokladi__list::-webkit-scrollbar-thumb{background:linear-gradient(0deg,#bcbcbd,#fff 75%);border-radius:0.19vh;}
.dokladi__list::-webkit-scrollbar-track{background:#ffffff1a;border-radius:0.19vh;}

/* Items */
.dokladi__item{align-items:center;border-bottom:0.09vh solid #f4f1e10d;cursor:pointer;display:flex;gap:1.11vh;padding:0.93vh 1.48vh;transition:background 0.1s ease;}
@media (platform:pc){.dokladi__item:hover{background:rgba(255,255,255,.04);}}
.dokladi__item_selected{background:rgba(249,183,1,.1);border-left:0.19vh solid #f9b701;}
.dokladi__item_selected .dokladi__item-label{color:#f4f1e1;}
.dokladi__item-num{color:#f4f1e166;flex-shrink:0;font-size:1.11vh;font-weight:700;min-width:2.4vh;}
.dokladi__item-label{color:#f4f1e1cc;flex:1 1 auto;font-size:1.3vh;font-weight:600;line-height:1.4;}
.dokladi__item-arrow{align-items:center;display:flex;flex-shrink:0;opacity:0.5;}
.dokladi__item-arrow svg{height:1.11vh;width:1.11vh;}

/* Текущий пост/патруль на экране stage */
.dokladi__stage-current{align-items:baseline;display:flex;gap:0.56vh;padding:1.2vh 1.67vh 0.56vh;position:relative;z-index:1;}
.dokladi__stage-current-type{color:#f4f1e166;font-size:1.11vh;font-weight:700;text-transform:uppercase;}
.dokladi__stage-current-name{color:#f9b701;font-size:1.3vh;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* Таймер (секундомер с последнего доклада) */
.dokladi__phase-label{color:rgba(244,241,225,0.75);font-size:1.2vh;font-weight:600;padding:0 1.67vh;text-align:center;}
.dokladi__timer-display{color:#f9b701;font-family:"Open Sans Condensed","Open Sans",monospace;font-size:4.44vh;font-style:italic;font-weight:700;letter-spacing:0.19vh;line-height:1;padding:0.56vh 0 1.11vh;text-align:center;}

/* Отмена доклада */
.dokladi__cancel-btn{color:#e2554499;cursor:pointer;font-size:1.11vh;font-weight:700;padding:0.93vh 1.67vh 0;text-align:center;text-decoration:underline;text-underline-offset:0.19vh;transition:color 0.15s ease;}
@media (platform:pc){.dokladi__cancel-btn:hover{color:#e25544;}}

/* Name input screen */
.dokladi__name-input-wrap{display:flex;flex-direction:column;gap:1.3vh;padding:2vh 1.85vh 1.85vh;position:relative;z-index:1;}
.dokladi__name-input-label{color:#f4f1e1cc;font-size:1.3vh;font-weight:600;line-height:1.4;}
.dokladi__name-input-row{display:flex;gap:0.74vh;}
.dokladi__name-input-field{-webkit-appearance:none;appearance:none;background:#ffffff08;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;padding:0.74vh 1.11vh;transition:border-color 0.15s;}
.dokladi__name-input-field:focus{border-color:rgba(249,183,1,0.5);}
.dokladi__name-input-field::placeholder{color:#f4f1e144;font-weight:400;}

/* Footer */
.dokladi__footer{align-items:center;border-top:0.19vh solid #f4f1e11a;display:flex;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.dokladi__footer .controls-button__container{margin-right:1.48vh;}
.dokladi__footer .controls-button__container:last-child{margin-right:0;}
        `;
        document.head.appendChild(s);

        // Компонент сейчас смонтирован — фоновый тост (если он крутился, пока
        // меню было закрыто) больше не нужен, свой таймер покажет сам интерфейс.
        window._dokladMenuMounted=true;
        _dokladRemoveToast();

        // ── Восстановление активной сессии/таймера ───────────────────────────
        // timerStartAt читаем напрямую из window._dokladActive — она пишется
        // туда в момент отправки "Начало"/"Середина" и не зависит от того,
        // как именно был закрыт предыдущий экземпляр интерфейса.
        const active=window._dokladActive;
        if(active){
            this.reportType=active.type;
            this.reportName=active.name;
            this.screen="stage";
            if(active.timerStartAt){
                this._startTimer(active.timerStartAt);
            }
        }

        // Навигация по списку стрелками (keydown — с автоповтором, как в MvdMenu.js)
        this._onArrowKeyDown=(e)=>{
            if(this.screen!=="type"&&this.screen!=="stage") return;
            if(e.keyCode===window.KEY_CODE_ARROW_TOP){
                e.preventDefault();
                this.moveSelection(-1);
            } else if(e.keyCode===window.KEY_CODE_ARROW_BOTTOM){
                e.preventDefault();
                this.moveSelection(1);
            }
        };
        document.addEventListener("keydown",this._onArrowKeyDown,false);

        if(!window.App?.developmentMode) window.setDrawLabelStatus(true);
    },
    unmounted(){
        document.removeEventListener("keydown",this._onArrowKeyDown,false);
        const s=document.getElementById("dokladi-style");
        if(s)s.remove();
        // Компонент больше не смонтирован — если сессия с таймером всё ещё
        // активна, включаем независимый фоновый тост (см. _dokladEnsureBackgroundToast
        // выше). Он сам читает timerStartAt из window._dokladActive, поэтому
        // корректно работает даже если этот unmounted() почему-либо не успел
        // отработать полностью — ключевые данные уже лежат в window, а не здесь.
        window._dokladMenuMounted=false;
        if(window._dokladActive&&window._dokladActive.timerStartAt){
            _dokladEnsureBackgroundToast();
        } else {
            _dokladRemoveToast();
        }
        this._clearTimerInterval();
    }
};

const Dokladi=_export_sfc(_sfc_main,[["render",render]]);
export{Dokladi as default};
