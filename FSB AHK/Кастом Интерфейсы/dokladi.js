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
//    "type"           — выбор Пост / Патруль
//    "name-input"     — ввод названия поста / города патрулирования
//    "duration-input" — время доклада (мин, шаг 10, мин. 30) → строит расписание
//    "stage"          — доклады отправляются САМИ по расписанию, ручного выбора
//                        стадии больше нет; экран лишь показывает обратный
//                        отсчёт до следующего доклада и кнопку отмены
//
//  Звание и фамилия берутся из window._mvdRank / window._mvdLastName —
//  так же, как в mvdF.js для "Приветствие". Отправка доклада делегируется
//  в window._mvdExecuteDoklad(type,name,stage) (см. mvdF.js).
//
//  ── Сессия доклада (window._dokladActive) ───────────────────────────────
//  Как только указано время доклада — сразу строится расписание отправки
//  (_dokladBuildSchedule: Начало сейчас же → Середина каждые 10 мин × N →
//  Конец) и "Начало" отправляется немедленно. window._dokladActive хранит
//  {type, name, duration, schedule:[{stage,at}], nextIndex} — nextIndex это
//  индекс следующей ещё не отправленной стадии в schedule.
//  Если меню закрыть и открыть заново, не отправив "Конец" и не нажав
//  "Отмена" — оно откроется сразу на экране "stage" с тем же постом/патрулём.
//  Сессия сбрасывается, когда планировщик сам отправляет "Конец", либо когда
//  нажата "Отмена" (последняя — чисто локально, без отправки на сервер).
//
//  ── Автоотправка (планировщик, НЕ зависит от того, открыто ли меню) ─────
//  window._dokladSendInterval (см. _dokladEnsureSendScheduler ниже) каждую
//  секунду сверяет Date.now() с schedule[nextIndex].at и, если время настало,
//  сам вызывает window._mvdExecuteDoklad(type,name,stage) — пользователю
//  ничего нажимать не нужно. Планировщик запускается сразу при подтверждении
//  времени и/или при повторном открытии меню (идемпотентно) и живёт до тех
//  пор, пока не отправлен "Конец" или не нажата "Отмена".
//
//  ── Обратный отсчёт (countdown ДО следующего доклада, не секундомер) ────
//  Пока меню открыто — отсчёт в интерфейсе обновляется локальным setInterval
//  компонента (this.timerInterval), с прямым обновлением DOM (CEF-fix, как
//  в AdvMenu.js), значение берётся из schedule[nextIndex].at - Date.now().
//  Когда меню закрыто — за всплывающий тост с тем же отсчётом отвечает
//  независимый фоновый интервал (window._dokladToastInterval, см.
//  _dokladEnsureBackgroundToast ниже).
// ══════════════════════════════════════════════════════════════════════════

// ─── SVG иконка стрелки ─────────────────────────────────────────────────────
const SVG_ARROW=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2L7 5L3 8" stroke="rgba(244,241,225,0.3)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ─── Пункты выбора типа доклада ─────────────────────────────────────────────
const TYPE_OPTIONS=[
    {id:"post",   label:"Пост"},
    {id:"patrol", label:"Патруль"},
];

// ─── Подписи стадий доклада (используются только для текста, доклады теперь
//     отправляются сами по расписанию — никакого ручного выбора стадии нет) ──
const STAGE_LABELS={start:"Начало",middle:"Середина",end:"Конец"};

// ─── Строит расписание отправки для указанного времени (мин, шаг 10, мин. 30) ──
// Начало → 10 мин → Середина ×N → 10 мин → Конец, где N = 1 + (duration-30)/10.
// Возвращает массив [{stage,at}], at — abs. unix ms относительно startAt.
function _dokladBuildSchedule(startAt,durationMin){
    const n=1+Math.floor((durationMin-30)/10);
    const schedule=[{stage:"start",at:startAt}];
    for(let i=1;i<=n;i++) schedule.push({stage:"middle",at:startAt+i*10*60*1000});
    schedule.push({stage:"end",at:startAt+(n+1)*10*60*1000});
    return schedule;
}

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
// Показывает время, ОСТАВШЕЕСЯ до следующего автоматического доклада
// (а не время, прошедшее с последнего) — берётся из active.schedule[active.nextIndex].
function _dokladRenderToast(){
    // Подавление тоста пока идёт скриншот / открыто "Точное время"
    if(window._dokladToastSuppressed) return;
    const active=window._dokladActive;
    const next=active&&active.schedule&&active.schedule[active.nextIndex];
    if(!active||!next) return;
    let el=document.getElementById("dokladi-toast");
    if(!el){
        el=document.createElement("div");
        el.id="dokladi-toast";
        el.style.cssText="position:fixed;bottom:3vh;right:2vh;background:#141419f2;border:0.15vh solid rgba(249,183,1,0.55);border-radius:0.56vh;padding:0.56vh 1.11vh;pointer-events:none;z-index:9999;font-family:'Open Sans',sans-serif;min-width:10vh;box-shadow:0 0.56vh 1.85vh rgba(0,0,0,0.6);";
        document.body.appendChild(el);
    }
    const s=Math.max(0,Math.ceil((next.at-Date.now())/1000));
    const label=active.type==="post" ? "Пост" : "Патруль";
    el.innerHTML=`<div style="color:#f9b701;font-size:0.87vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;">[ДОКЛАД] ${label} - ${active.name} · до "${STAGE_LABELS[next.stage]}"</div>`+
                 `<div style="color:#f4f1e1;font-family:'Open Sans Condensed',monospace;font-size:1.85vh;font-style:italic;font-weight:700;">${_dokladFormatTime(s)}</div>`;
}
// Гарантирует, что фоновый интервал тоста (визуальный, только пока меню закрыто)
// запущен, если есть активная сессия. Идемпотентна.
function _dokladEnsureBackgroundToast(){
    if(window._dokladToastInterval) return;
    window._dokladToastInterval=setInterval(()=>{
        const active=window._dokladActive;
        if(!active){
            clearInterval(window._dokladToastInterval);
            window._dokladToastInterval=null;
            _dokladRemoveToast();
            return;
        }
        // Пока меню открыто — обратный отсчёт и так виден в самом интерфейсе,
        // плавающий тост в этот момент не нужен.
        if(window._dokladMenuMounted){ _dokladRemoveToast(); return; }
        // Тост подавлен (скриншот / "Точное время") — убираем и не рисуем
        if(window._dokladToastSuppressed){ _dokladRemoveToast(); return; }
        _dokladRenderToast();
    },1000);
}

// ── Планировщик автоотправки докладов ───────────────────────────────────────
// ПОЛНОСТЬЮ независим от жизненного цикла Vue-компонента и от того, открыто
// ли меню — иначе доклады не будут "отправляться сами", когда игрок закрыл
// интерфейс. Единственный источник правды — window._dokladActive.schedule /
// .nextIndex. Идемпотентен: повторный вызов не создаёт второй интервал.
function _dokladEnsureSendScheduler(){
    if(window._dokladSendInterval) return;
    window._dokladSendInterval=setInterval(()=>{
        const active=window._dokladActive;
        if(!active||!active.schedule){
            clearInterval(window._dokladSendInterval);
            window._dokladSendInterval=null;
            return;
        }
        const next=active.schedule[active.nextIndex];
        if(!next) return; // всё уже отправлено, ждём _endSession
        if(Date.now()<next.at) return;
        if(typeof window._mvdExecuteDoklad==="function")
            window._mvdExecuteDoklad(active.type,active.name,next.stage);
        active.nextIndex+=1;
        if(next.stage==="end"){
            // Сессия завершена — сбрасываем всё и глушим планировщик/тост.
            window._dokladActive=null;
            clearInterval(window._dokladSendInterval);
            window._dokladSendInterval=null;
            if(window._dokladToastInterval){clearInterval(window._dokladToastInterval);window._dokladToastInterval=null;}
            _dokladRemoveToast();
        }
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
            // ЭКРАН: duration-input — Указание времени доклада (мин, шаг 10, мин. 30)
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="duration-input"
                ? (openBlock(),createElementBlock(Fragment,{key:"duration-input"},[
                    createBaseVNode("div",{class:"dokladi__name-input-wrap"},[
                        createBaseVNode("div",{class:"dokladi__name-input-label"},
                            "Укажите время доклада (мин), не менее 30, шагом 10"
                        ),
                        createBaseVNode("div",{class:"dokladi__name-input-row"},[
                            createBaseVNode("input",{
                                class:"dokladi__name-input-field",
                                id:"dokladi-duration-field",
                                type:"number",
                                min:"30",
                                step:"10",
                                inputmode:"numeric",
                                placeholder:"30, 40, 50...",
                                value:$data.reportDuration,
                                onInput:$event=>{
                                    $data.reportDuration=$event.target.value.replace(/[^0-9]/g,"");
                                    $data.durationError="";
                                },
                                onKeydown:$options.onDurationInputKeydown,
                            },null,40,["value","onInput","onKeydown"])
                        ]),
                        $data.durationError
                            ? (openBlock(),createElementBlock("div",{key:"err",class:"dokladi__duration-error"},
                                toDisplayString($data.durationError), 1 /* TEXT */
                              ))
                            : createCommentVNode("",true),
                        $options.durationValid
                            ? (openBlock(),createElementBlock("div",{key:"preview",class:"dokladi__duration-preview"},
                                toDisplayString($options.scheduleDescription), 1 /* TEXT */
                              ))
                            : createCommentVNode("",true),
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: stage — доклады отправляются САМИ по расписанию, никакого
            // ручного выбора стадии здесь больше нет — только статус/отсчёт.
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
                    // Расчётный график докладов, посчитанный из указанного времени
                    // (Начало → 10 мин → Середина × N → 10 мин → Конец)
                    createBaseVNode("div",{class:"dokladi__stage-schedule"},
                        toDisplayString($options.scheduleDescription), 1 /* TEXT */
                    ),
                    // Обратный отсчёт до СЛЕДУЮЩЕГО доклада (а не "сколько прошло с последнего") —
                    // показывается, пока в расписании есть неотправленные стадии.
                    $options.nextStageLabel
                        ? (openBlock(),createElementBlock(Fragment,{key:"timer"},[
                            createBaseVNode("div",{class:"dokladi__phase-label"},
                                toDisplayString(`До доклада «${$options.nextStageLabel}»`), 1 /* TEXT */
                            ),
                            // id="dokladi-timer-disp" — обновляется напрямую через DOM (CEF-fix, как в AdvMenu.js)
                            createBaseVNode("div",{id:"dokladi-timer-disp",class:"dokladi__timer-display"},
                                toDisplayString($options.timerDisplay), 1 /* TEXT */
                            ),
                          ],64))
                        : (openBlock(),createElementBlock("div",{key:"done",class:"dokladi__phase-label"},
                            "Все доклады отправлены"
                          )),
                    createBaseVNode("div",{class:"dokladi__stage-schedule"},
                        "Доклады отправляются автоматически — ничего нажимать не нужно."
                    ),
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
            // ── Указанное пользователем время доклада (мин, шаг 10, минимум 30) ──
            reportDuration:"",
            durationError:"",
            // ── Отсчёт ДО следующего автодоклада (в секундах, ≥0). Источник правды —
            // window._dokladActive.schedule/.nextIndex, это только для отрисовки.
            secondsToNext:0,
            timerInterval:null,
        }
    },
    computed:{
        headerSubtitle(){
            if(this.screen==="type")       return "ДОКЛАДЫ";
            if(this.screen==="name-input")     return this.reportType==="post" ? "ПОСТ" : "ПАТРУЛЬ";
            if(this.screen==="duration-input") return this.reportType==="post" ? "ПОСТ" : "ПАТРУЛЬ";
            if(this.screen==="stage")          return this.reportType==="post" ? "ПОСТ" : "ПАТРУЛЬ";
            return "ДОКЛАДЫ";
        },
        // Только экран "type" остаётся кликабельным списком — на "stage" доклады
        // отправляются сами, там нечего выбирать.
        currentListItems(){
            if(this.screen==="type")  return TYPE_OPTIONS;
            return [];
        },
        footerConfirmText(){
            if(this.screen==="name-input"||this.screen==="duration-input") return "Подтвердить";
            if(this.screen==="stage") return "Отменить доклад";
            return "Выбрать";
        },
        footerBackText(){
            if(this.screen==="type") return "Закрыть";
            if(this.screen==="stage") return "Скрыть";
            return "Назад";
        },
        footerConfirmDisabled(){
            if(this.screen==="name-input")     return this.reportName.trim().length===0;
            if(this.screen==="duration-input") return !this.durationValid;
            if(this.screen==="stage")          return false; // Enter = "Отменить доклад"
            return this.currentListItems.length===0;
        },
        // Метка стадии, которая будет отправлена следующей (или "" если всё уже отправлено)
        nextStageLabel(){
            const active=window._dokladActive;
            const next=active&&active.schedule&&active.schedule[active.nextIndex];
            return next ? STAGE_LABELS[next.stage] : "";
        },
        // Используется только для начального рендера; далее обновляется через DOM напрямую (как в AdvMenu.js)
        timerDisplay(){
            return _dokladFormatTime(this.secondsToNext);
        },
        // ── Валидация указанного времени доклада: целое число, не меньше 30, шаг 10 ──
        durationValid(){
            const val=parseInt(this.reportDuration,10);
            return Number.isFinite(val)&&val>=30&&val%10===0;
        },
        // ── Сколько раз нужно доложить "Середина" при указанном времени ─────────
        // Правило: 30 → Начало, 10 мин, Середина, 10 мин, Конец (1 середина).
        //          40 → Начало, 10 мин, Середина, 10 мин, Середина, 10 мин, Конец (2 середины).
        //          Т.е. на каждые +10 к 30 добавляется ещё одна "Середина".
        middleTotal(){
            const val=parseInt(this.reportDuration,10);
            if(!Number.isFinite(val)||val<30) return 0;
            return 1+Math.floor((val-30)/10);
        },
        // ── Человекочитаемое описание графика докладов для текущего времени ─────
        scheduleDescription(){
            const n=this.middleTotal;
            if(!n) return "";
            // Склонение "раз/раза/раз" по стандартным правилам русского языка
            const mod10=n%10,mod100=n%100;
            let times;
            if(mod10===1&&mod100!==11) times="раз";
            else if(mod10>=2&&mod10<=4&&(mod100<10||mod100>=20)) times="раза";
            else times="раз";
            return `Начало → 10 мин → Середина (${n} ${times}, каждые 10 мин) → 10 мин → Конец`;
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
            } else if(this.screen==="duration-input"){
                this.confirmDurationInput();
            } else if(this.screen==="stage"){
                // На "stage" отправлять/выбирать нечего — доклады уходят сами по
                // расписанию, Enter здесь переиспользован под кнопку "Отменить доклад".
                this.cancelReport();
            }
        },
        footerConfirm(){
            this.confirmSelected();
        },
        goBack(){
            if(this.screen==="stage"){
                // Доклад "Начало" уже ушёл автоматически, менять время задним числом
                // нельзя — просто прячем меню, сессия и авторассылка продолжаются
                // в фоне (см. _dokladEnsureSendScheduler).
                this.close();
            } else if(this.screen==="duration-input"){
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
            // сразу попадём на этот же экран (duration-input, пока время не указано,
            // либо stage, если оно уже было указано) с этим постом/патрулём, минуя
            // выбор типа и ввод названия (пока не отправится "Конец" или не нажата
            // "Отмена"). schedule/nextIndex появятся тут же, в confirmDurationInput().
            window._dokladActive={type:this.reportType,name:this.reportName,duration:null,schedule:null,nextIndex:0};
            this.durationError="";
            this.screen="duration-input";
            this.$nextTick(()=>{ const f=document.getElementById("dokladi-duration-field");if(f)f.focus(); });
        },
        onNameInputKeydown(e){
            if(e.key==="Escape"){ this.goBack(); return; }
            if(e.key==="Enter"){ this.confirmNameInput(); }
        },
        // ── Экран duration-input — подтверждение времени доклада ────────────
        // Правило пересчёта (шаг 10 минут, минимум 30):
        //   30 → Начало · 10 мин · Середина · 10 мин · Конец            (1 середина)
        //   40 → Начало · 10 мин · Середина · 10 мин · Середина · 10 мин · Конец (2 середины)
        //   50, 60, ... — по той же схеме, +1 "Середина" на каждые +10 минут.
        // Меньше 30 указать нельзя — подтверждение блокируется.
        confirmDurationInput(){
            const val=parseInt(this.reportDuration,10);
            if(!Number.isFinite(val)||val<30){
                this.durationError="Время не может быть меньше 30 минут";
                return;
            }
            if(val%10!==0){
                this.durationError="Время нужно указывать шагом 10 (30, 40, 50...)";
                return;
            }
            this.durationError="";
            this.reportDuration=val;
            // Строим расписание и СРАЗУ отправляем "Начало" — дальше всё уходит
            // само по таймеру, никаких дополнительных действий пользователя.
            const startAt=Date.now();
            const schedule=_dokladBuildSchedule(startAt,val);
            window._dokladActive={type:this.reportType,name:this.reportName,duration:val,schedule,nextIndex:0};
            if(typeof window._mvdExecuteDoklad==="function")
                window._mvdExecuteDoklad(this.reportType,this.reportName,"start");
            window._dokladActive.nextIndex=1;
            _dokladEnsureSendScheduler();
            this.screen="stage";
            this._startCountdown();
        },
        onDurationInputKeydown(e){
            if(e.key==="Escape"){ this.goBack(); return; }
            if(e.key==="Enter"){ this.confirmDurationInput(); }
        },
        // ── Отмена доклада — локальный сброс без отправки чего-либо на сервер ──
        cancelReport(){
            this._stopCountdown();
            this._endSession();
            this.reportType=null;
            this.reportName="";
            this.reportDuration="";
            this.durationError="";
            this.screen="type";
            this.selectedIndex=0;
            this.close();
        },
        // Сбрасывает сессию/планировщик/тост — общая часть для "Отмена"
        // (штатное завершение "Конец" сбрасывается самим планировщиком, см. _dokladEnsureSendScheduler)
        _endSession(){
            window._dokladActive=null;
            if(window._dokladSendInterval){clearInterval(window._dokladSendInterval);window._dokladSendInterval=null;}
            if(window._dokladToastInterval){clearInterval(window._dokladToastInterval);window._dokladToastInterval=null;}
            _dokladRemoveToast();
        },
        // ── Обратный отсчёт до следующего автодоклада (только отображение —
        //    сама отправка идёт в фоновом _dokladEnsureSendScheduler) ───────────
        _startCountdown(){
            this._clearTimerInterval();
            this._tickCountdown();
            setTimeout(()=>this._updateTimerDOM(),30);
            this.timerInterval=setInterval(()=>{
                this._tickCountdown();
                this._updateTimerDOM();
                // Сессия закончилась (планировщик отправил "Конец" и обнулил active) —
                // закрываем экран отсчёта сам собой.
                if(!window._dokladActive&&this.screen==="stage"){
                    this._stopCountdown();
                }
            },1000);
        },
        _tickCountdown(){
            const active=window._dokladActive;
            const next=active&&active.schedule&&active.schedule[active.nextIndex];
            this.secondsToNext=next ? Math.max(0,Math.ceil((next.at-Date.now())/1000)) : 0;
        },
        _clearTimerInterval(){
            if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
        },
        _stopCountdown(){
            this._clearTimerInterval();
            this.secondsToNext=0;
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
.dokladi__duration-error{color:#e25544;font-size:1.11vh;font-weight:600;line-height:1.4;}
.dokladi__duration-preview{color:#f9b701cc;font-size:1.11vh;font-weight:600;line-height:1.4;}

/* Расчётный график докладов на экране stage */
.dokladi__stage-schedule{color:#f4f1e166;font-size:1.02vh;font-weight:600;line-height:1.4;padding:0 1.67vh 0.74vh;}

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

        // ── Восстановление активной сессии ────────────────────────────────────
        // schedule/nextIndex читаем напрямую из window._dokladActive — фоновый
        // планировщик (_dokladEnsureSendScheduler) продолжает слать доклады
        // независимо от того, было ли открыто меню всё это время.
        const active=window._dokladActive;
        if(active){
            this.reportType=active.type;
            this.reportName=active.name;
            this.reportDuration=active.duration||"";
            if(active.duration&&active.schedule){
                // Время уже было указано ранее — сразу продолжаем с экрана stage,
                // авторассылка уже (или ещё) идёт в фоне.
                this.screen="stage";
                _dokladEnsureSendScheduler();
                this._startCountdown();
            } else {
                // Название подтверждено, но время доклада ещё не указано —
                // продолжаем с того места, где остановились.
                this.screen="duration-input";
                this.$nextTick(()=>{ const f=document.getElementById("dokladi-duration-field");if(f)f.focus(); });
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
        // Компонент больше не смонтирован — доклады продолжают уходить сами
        // (планировщик независим и не останавливается здесь), но нужно включить
        // всплывающий тост с обратным отсчётом, раз меню больше не показывает его.
        window._dokladMenuMounted=false;
        if(window._dokladActive){
            _dokladEnsureBackgroundToast();
        } else {
            _dokladRemoveToast();
        }
        this._clearTimerInterval();
    }
};

const Dokladi=_export_sfc(_sfc_main,[["render",render]]);
export{Dokladi as default};
