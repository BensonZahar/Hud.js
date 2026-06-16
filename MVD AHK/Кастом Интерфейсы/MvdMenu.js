import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc}from"./index.js";

// ─── SVG иконки ───────────────────────────────────────────────────────────────
const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_BACK=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L4 6L8 10" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_ARROW=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2L7 5L3 8" stroke="rgba(255,255,255,0.3)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// GraffitiPattern
const GRAFFITI_SVG=`<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:-60px;left:-40px;width:48.52vh;height:23.61vh;opacity:0.05;pointer-events:none;transform:rotate(148deg)"><line x1="0" y1="20" x2="400" y2="20" stroke="white" stroke-width="1.2"/><line x1="0" y1="40" x2="400" y2="40" stroke="white" stroke-width="1.2"/><line x1="0" y1="60" x2="400" y2="60" stroke="white" stroke-width="1.2"/><line x1="0" y1="80" x2="400" y2="80" stroke="white" stroke-width="1.2"/><line x1="0" y1="100" x2="400" y2="100" stroke="white" stroke-width="1.2"/><line x1="0" y1="120" x2="400" y2="120" stroke="white" stroke-width="1.2"/><line x1="0" y1="140" x2="400" y2="140" stroke="white" stroke-width="1.2"/><line x1="0" y1="160" x2="400" y2="160" stroke="white" stroke-width="1.2"/><line x1="0" y1="180" x2="400" y2="180" stroke="white" stroke-width="1.2"/><line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="1.2"/><line x1="20" y1="0" x2="20" y2="400" stroke="white" stroke-width="1.2"/><line x1="40" y1="0" x2="40" y2="400" stroke="white" stroke-width="1.2"/><line x1="60" y1="0" x2="60" y2="400" stroke="white" stroke-width="1.2"/><line x1="80" y1="0" x2="80" y2="400" stroke="white" stroke-width="1.2"/><line x1="100" y1="0" x2="100" y2="400" stroke="white" stroke-width="1.2"/></svg>`;

// ─── Пункты меню Повседневная ─────────────────────────────────────────────────
const POVSEDNEV_OPTIONS=[
    {action:"greeting",      label:"Приветствие",              needsId:true},
    {action:"checkDocuments",label:"Проверка документов",      needsId:false},
    {action:"studyDocuments",label:"Изучение документов",      needsId:false},
    {action:"scanningTablet",label:"Сканирование",             needsId:false},
    {action:"cuffing",       label:"Надевание наручников",     needsId:true},
    {action:"putInCar",      label:"Посадка в машину",         needsId:true},
    {action:"arrest",        label:"Доставка в участок",       needsId:true},
    {action:"uncuffing",     label:"Снятие наручников",        needsId:true},
    {action:"chase",         label:"Преследование преступника",needsId:true},
    {action:"search",        label:"Обыск",                    needsId:true},
    {action:"escort",        label:"Конвоирование",            needsId:true},
    {action:"clearWanted",   label:"Снятие розыска",           needsId:true},
    {action:"fine",          label:"Выдача штрафа",            needsId:false, special:"fine"},
    {action:"wantedFine",    label:"Выдача розыска",           needsId:false, special:"wanted"},
    {action:"confiscate",    label:"Изъятие веществ",          needsId:true},
    {action:"breakGlass",    label:"Разбитие стекла",          needsId:true},
    {action:"removeMask",    label:"Снятие маски",             needsId:false},
    {action:"fingerprint",   label:"Сканирование отпечатков",  needsId:false},
    {action:"takeLicense",   label:"Изъятие прав",             needsId:true},
    {action:"miranda",       label:"Права Миранды",            needsId:false},
];

const ACTION_TAGS={
    fine:       {label:"/ticket", color:"rgba(61,186,122,"},
    wantedFine: {label:"/su",     color:"rgba(224,85,85,"},
    cuffing:    {label:"/cuff",   color:"rgba(249,183,1,"},
    arrest:     {label:"/arrest", color:"rgba(249,183,1,"},
    clearWanted:{label:"/clear",  color:"rgba(79,110,247,"},
    search:     {label:"/search", color:"rgba(79,110,247,"},
    escort:     {label:"/escort", color:"rgba(79,110,247,"},
    putInCar:   {label:"/putpl",  color:"rgba(79,110,247,"},
    uncuffing:  {label:"/uncuff", color:"rgba(79,110,247,"},
};

// ─── render ───────────────────────────────────────────────────────────────────
function render(_ctx,_cache,$props,$setup,$data,$options){
    return (openBlock(), createElementBlock("div",{class:"mvdmenu iface-container"},[

        // Overlay
        createBaseVNode("div",{class:"mvdmenu__overlay",onClick:$options.close}),

        // Wrapper
        createBaseVNode("div",{class:"mvdmenu__wrapper"},[

            createBaseVNode("div",{class:"mvdmenu__pattern",innerHTML:GRAFFITI_SVG}),
            createBaseVNode("div",{class:"mvdmenu__top-accent"}),

            // ── Header ───────────────────────────────────────────────────────
            createBaseVNode("div",{class:"mvdmenu__header"},[
                createBaseVNode("div",{class:"mvdmenu__header-left"},[
                    // Кнопка назад (только на не-main экранах)
                    $data.screen!=="main"
                        ? createBaseVNode("div",{
                            class:"mvdmenu__back-btn",
                            innerHTML:SVG_BACK,
                            onClick:$options.goBack
                          })
                        : createCommentVNode("",true),
                    createBaseVNode("div",{class:"mvdmenu__title"},[
                        createBaseVNode("span",{class:"mvdmenu__title-main"},"МВД"),
                        createBaseVNode("span",{class:"mvdmenu__title-sub"}," АХК"),
                        createBaseVNode("span",{class:"mvdmenu__title-version"},
                            toDisplayString($options.headerVersion)
                        )
                    ])
                ]),
                createBaseVNode("div",{class:"mvdmenu__close-btn",onClick:$options.close},"X")
            ]),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: main — МВД меню
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="main"
                ? (openBlock(),createElementBlock(Fragment,{key:"main"},[
                    createBaseVNode("div",{class:"mvdmenu__list"},[
                        (openBlock(true),createElementBlock(Fragment,null,
                            renderList($options.mainMenuItems,(item,i)=>(
                                openBlock(),createElementBlock("div",{
                                    key:item.id,
                                    class:normalizeClass(["mvdmenu__item",{
                                        "mvdmenu__item_toggle_on": item.toggleOn===true,
                                        "mvdmenu__item_toggle_off": item.toggleOn===false,
                                    }]),
                                    onClick:$event=>$options.selectMain(item)
                                },[
                                    createBaseVNode("div",{class:"mvdmenu__item-num"},
                                        toDisplayString(String(i+1).padStart(2,"0"))
                                    ),
                                    createBaseVNode("div",{class:"mvdmenu__item-label"},
                                        toDisplayString(item.label)
                                    ),
                                    // Стрелка → для пунктов-переходов
                                    item.arrow
                                        ? createBaseVNode("div",{class:"mvdmenu__item-arrow",innerHTML:SVG_ARROW})
                                        : createCommentVNode("",true),
                                    // Статус toggle
                                    item.toggleOn!==undefined
                                        ? createBaseVNode("div",{
                                            class:normalizeClass(["mvdmenu__item-status",
                                                item.toggleOn?"mvdmenu__item-status_on":"mvdmenu__item-status_off"
                                            ])
                                          }, toDisplayString(item.toggleOn?"Вкл":"Выкл"))
                                        : createCommentVNode("",true),
                                ],10,["onClick"])
                            ))
                        ,128))
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: povsednev — Список повседневных действий
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="povsednev"
                ? (openBlock(),createElementBlock(Fragment,{key:"povsednev"},[
                    // Поиск
                    createBaseVNode("div",{class:"mvdmenu__search"},[
                        createBaseVNode("span",{class:"mvdmenu__search-icon",innerHTML:SVG_SEARCH}),
                        createBaseVNode("input",{
                            type:"text",
                            placeholder:"Поиск действия...",
                            value:$data.search,
                            onInput:$event=>{$data.search=$event.target.value}
                        },null,40,["value","onInput"])
                    ]),
                    createBaseVNode("div",{class:"mvdmenu__list"},[
                        (openBlock(true),createElementBlock(Fragment,null,
                            renderList($options.filteredOptions,(opt,i)=>(
                                openBlock(),createElementBlock("div",{
                                    key:opt.action,
                                    class:normalizeClass(["mvdmenu__item",{
                                        "mvdmenu__item_fine":    opt.special==="fine",
                                        "mvdmenu__item_wanted":  opt.special==="wanted",
                                    }]),
                                    onClick:$event=>$options.selectOption(opt)
                                },[
                                    createBaseVNode("div",{class:"mvdmenu__item-num"},
                                        toDisplayString(String($options.globalIndex(opt)+1).padStart(2,"0"))
                                    ),
                                    createBaseVNode("div",{class:"mvdmenu__item-label"},
                                        toDisplayString(opt.label)
                                    ),
                                    ACTION_TAGS[opt.action]
                                        ? createBaseVNode("div",{
                                            class:"mvdmenu__item-tag",
                                            style:`background:${ACTION_TAGS[opt.action].color}0.13);color:${ACTION_TAGS[opt.action].color}1)`
                                          },toDisplayString(ACTION_TAGS[opt.action].label))
                                        : createCommentVNode("",true),
                                    opt.needsId
                                        ? createBaseVNode("div",{class:"mvdmenu__item-id-badge"},"ID")
                                        : createCommentVNode("",true),
                                ],10,["onClick"])
                            ))
                        ,128)),
                        $options.filteredOptions.length===0
                            ? createBaseVNode("div",{class:"mvdmenu__empty"},"Ничего не найдено")
                            : createCommentVNode("",true)
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: idInput — Ввод ID игрока
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="idInput"
                ? createBaseVNode("div",{key:"idInput",class:"mvdmenu__id-screen"},[
                    createBaseVNode("div",{class:"mvdmenu__id-action-label"},
                        toDisplayString($data.pendingActionLabel)
                    ),
                    createBaseVNode("div",{class:"mvdmenu__id-hint"},"Введите ID игрока:"),
                    createBaseVNode("div",{class:"mvdmenu__id-input-row"},[
                        createBaseVNode("input",{
                            class:"mvdmenu__id-input",
                            type:"text",
                            placeholder:"Введите ID...",
                            value:$data.idValue,
                            onInput:$event=>{$data.idValue=$event.target.value},
                            onKeydown:$event=>{if($event.key==="Enter")$options.confirmId()},
                        },null,40,["value","onInput","onKeydown"]),
                    ]),
                    // Подсказка: если targetId уже задан
                    $data.targetId!==null&&$data.targetId!==-1
                        ? createBaseVNode("div",{class:"mvdmenu__id-saved-hint"},
                            toDisplayString("Прошлый ID: "+$data.targetId+" (Enter без ввода)")
                          )
                        : createCommentVNode("",true),
                    // Кнопка подтвердить внутри экрана
                    createBaseVNode("div",{
                        class:normalizeClass(["mvdmenu__id-confirm-big",{
                            "mvdmenu__id-confirm-big_active":
                                $data.idValue.trim().length>0||($data.targetId!==null&&$data.targetId!==-1)
                        }]),
                        onClick:$options.confirmId
                    },"ПОДТВЕРДИТЬ",2),
                ])
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: partner — Меню напарника (кастомный, без старого диалога)
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="partner"
                ? (openBlock(),createElementBlock(Fragment,{key:"partner"},[
                    createBaseVNode("div",{class:"mvdmenu__list"},[
                        // 1. Следить за напарником
                        createBaseVNode("div",{
                            class:normalizeClass(["mvdmenu__item",{
                                "mvdmenu__item_toggle_on": $data.partnerTracking,
                                "mvdmenu__item_toggle_off": !$data.partnerTracking,
                            }]),
                            onClick:$options.togglePartnerTracking
                        },[
                            createBaseVNode("div",{class:"mvdmenu__item-num"},"01"),
                            createBaseVNode("div",{class:"mvdmenu__item-label"},
                                toDisplayString($data.partnerTracking && $data.partnerNick
                                    ? "Следить: "+$data.partnerNick+"["+$data.partnerId+"]"
                                    : "Следить за напарником")
                            ),
                            createBaseVNode("div",{
                                class:normalizeClass(["mvdmenu__item-status",
                                    $data.partnerTracking?"mvdmenu__item-status_on":"mvdmenu__item-status_off"
                                ])
                            }, toDisplayString($data.partnerTracking?"Вкл":"Выкл"))
                        ],2),
                        // 2. Сообщение для напарника
                        createBaseVNode("div",{
                            class:normalizeClass(["mvdmenu__item",{
                                "mvdmenu__item_toggle_on": $data.partnerMessage,
                                "mvdmenu__item_toggle_off": !$data.partnerMessage,
                            }]),
                            onClick:$options.togglePartnerMessage
                        },[
                            createBaseVNode("div",{class:"mvdmenu__item-num"},"02"),
                            createBaseVNode("div",{class:"mvdmenu__item-label"},"Сообщение для напарника"),
                            createBaseVNode("div",{
                                class:normalizeClass(["mvdmenu__item-status",
                                    $data.partnerMessage?"mvdmenu__item-status_on":"mvdmenu__item-status_off"
                                ])
                            }, toDisplayString($data.partnerMessage?"Вкл":"Выкл"))
                        ],2),
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: partnerIdInput — Ввод ID напарника
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="partnerIdInput"
                ? createBaseVNode("div",{key:"partnerIdInput",class:"mvdmenu__id-screen"},[
                    createBaseVNode("div",{class:"mvdmenu__id-action-label"},"Следить за напарником"),
                    createBaseVNode("div",{class:"mvdmenu__id-hint"},
                        toDisplayString($data.partnerNick && $data.partnerId
                            ? "Текущий: "+$data.partnerNick+"["+$data.partnerId+"]"
                            : "Введите ID напарника:")
                    ),
                    createBaseVNode("div",{class:"mvdmenu__id-input-row"},[
                        createBaseVNode("input",{
                            class:"mvdmenu__id-input",
                            type:"text",
                            placeholder:"ID напарника...",
                            value:$data.partnerIdValue,
                            onInput:$event=>{$data.partnerIdValue=$event.target.value},
                            onKeydown:$event=>{if($event.key==="Enter")$options.confirmPartnerId()},
                        },null,40,["value","onInput","onKeydown"]),
                    ]),
                ])
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: trackingInput — Ввод ID для отслеживания
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="trackingInput"
                ? createBaseVNode("div",{key:"trackingInput",class:"mvdmenu__id-screen"},[
                    createBaseVNode("div",{class:"mvdmenu__id-action-label"},"Отслеживание"),
                    createBaseVNode("div",{class:"mvdmenu__id-hint"},"Введите ID для отслеживания:"),
                    createBaseVNode("div",{class:"mvdmenu__id-input-row"},[
                        createBaseVNode("input",{
                            class:"mvdmenu__id-input",
                            type:"text",
                            placeholder:"ID игрока...",
                            value:$data.trackingIdValue,
                            onInput:$event=>{$data.trackingIdValue=$event.target.value},
                            onKeydown:$event=>{if($event.key==="Enter")$options.confirmTrackingId()},
                        },null,40,["value","onInput","onKeydown"]),
                    ]),
                ])
                : createCommentVNode("",true),

            // ── Footer ───────────────────────────────────────────────────────
            createBaseVNode("div",{class:"mvdmenu__footer"},[
                createBaseVNode("span",{class:"mvdmenu__footer-hint"},
                    toDisplayString(
                        $data.screen==="partnerIdInput"
                            ? ($data.partnerNick && $data.partnerId ? "Текущий напарник: "+$data.partnerNick+"["+$data.partnerId+"]" : "Введите ID напарника")
                            : $data.screen==="trackingInput"
                                ? "Введите ID и нажмите Enter"
                                : ($data.targetId!==null&&$data.targetId!==-1
                                    ? "Цель: ID "+$data.targetId
                                    : ($data.screen==="idInput" ? "ID не задан" : "ID не задан — потребуется при необходимости"))
                    )
                ),
                createBaseVNode("div",{class:"mvdmenu__footer-actions"},[
                    createBaseVNode("div",{class:"mvdmenu__close-footer-btn",onClick:$options.close},"ЗАКРЫТЬ")
                ])
            ])

        ])
    ]));
}

// ─── Компонент ────────────────────────────────────────────────────────────────
const _sfc_main={
    name:"MvdMenu",
    data(){
        return{
            // screen: "main" | "povsednev" | "idInput" | "partner" | "partnerIdInput"
            screen:"main",
            search:"",
            targetId:null,
            idValue:"",
            pendingAction:null,
            pendingActionLabel:"",
            // ── Напарник (синк с window) ──
            partnerTracking: false,
            partnerMessage:  false,
            partnerNick:     null,
            partnerId:       null,
            partnerIdValue:  "",
            // ── Отслеживание ──
            trackingIdValue: "",
        }
    },
    computed:{
        headerVersion(){
            if(this.screen==="main")            return "МЕНЮ";
            if(this.screen==="povsednev")       return "ПОВСЕДНЕВНАЯ";
            if(this.screen==="idInput")         return "ВВОД ID";
            if(this.screen==="partner")         return "НАПАРНИК";
            if(this.screen==="partnerIdInput")  return "ID НАПАРНИКА";
            if(this.screen==="trackingInput")   return "ОТСЛЕЖИВАНИЕ";
            return "";
        },
        mainMenuItems(){
            const items=[];
            items.push({id:"povsednev", label:"Повседневная", arrow:true});
            const trackingOn = !!(typeof window._mvdTrackingActive!=="undefined"
                ? window._mvdTrackingActive
                : (window._mvdCurrentScanId != null));
            items.push({id:"tracking", label:"Отслеживание", toggleOn: trackingOn});
            const autocuffOn = !!(typeof window._mvdAutoCuffEnabled!=="undefined"
                ? window._mvdAutoCuffEnabled : false);
            items.push({id:"autocuff", label:"Auto-cuff", toggleOn: autocuffOn});
            if(typeof window.AUTO_GRAB!=="undefined"&&window.AUTO_GRAB===true){
                const grabOn = !!(typeof window._mvdAutoGrabEnabled!=="undefined"
                    ? window._mvdAutoGrabEnabled : true);
                items.push({id:"autograb", label:"Авто-снаряжение", toggleOn: grabOn});
            }
            // Напарник — показываем текущий статус
            const partnerLabel = this.partnerTracking && this.partnerNick
                ? "Напарник: "+this.partnerNick+"["+this.partnerId+"]"
                : "Напарник";
            items.push({id:"naparnick", label: partnerLabel, arrow:true});
            return items;
        },
        visibleOptions(){
            let opts=[...POVSEDNEV_OPTIONS];
            const hidden=(typeof window.MENU_HIDDEN_ITEMS!=="undefined"&&Array.isArray(window.MENU_HIDDEN_ITEMS))
                ?window.MENU_HIDDEN_ITEMS:[];
            if(hidden.length) opts=opts.filter(o=>!hidden.includes(o.action));
            const order=(typeof window.MENU_ORDER!=="undefined"&&Array.isArray(window.MENU_ORDER)&&window.MENU_ORDER.length)
                ?window.MENU_ORDER:[];
            if(order.length){
                const ordered=[];
                order.forEach(a=>{const f=opts.find(o=>o.action===a);if(f)ordered.push(f);});
                opts.forEach(o=>{if(!ordered.find(x=>x.action===o.action))ordered.push(o);});
                opts=ordered;
            }
            return opts;
        },
        filteredOptions(){
            const q=this.search.trim().toLowerCase();
            if(!q)return this.visibleOptions;
            return this.visibleOptions.filter(o=>o.label.toLowerCase().includes(q)||o.action.toLowerCase().includes(q));
        },
    },
    methods:{
        globalIndex(opt){
            return this.visibleOptions.indexOf(opt);
        },
        goBack(){
            if(this.screen==="idInput"){
                this.screen="povsednev";
                this.pendingAction=null;
                this.pendingActionLabel="";
                this.idValue="";
            } else if(this.screen==="povsednev"){
                this.screen="main";
                this.search="";
            } else if(this.screen==="partnerIdInput"){
                this.screen="partner";
                this.partnerIdValue="";
            } else if(this.screen==="partner"){
                this.screen="main";
            } else if(this.screen==="trackingInput"){
                this.screen="main";
                this.trackingIdValue="";
            }
        },
        // ── Главное меню ──────────────────────────────────────────────────────
        selectMain(item){
            if(item.id==="povsednev"){
                this.screen="povsednev";
            } else if(item.id==="tracking"){
                // Если уже активно — останавливаем через window
                if(window._mvdCurrentScanId){
                    this.close();
                    setTimeout(()=>{
                        if(typeof window._mvdToggleTracking==="function") window._mvdToggleTracking();
                    },80);
                } else {
                    // Открываем кастомный экран ввода ID для отслеживания
                    this.trackingIdValue="";
                    this.screen="trackingInput";
                    this.$nextTick(()=>{
                        setTimeout(()=>{
                            const inp=this.$el.querySelector(".mvdmenu__id-input");
                            if(inp){inp.focus();inp.select();}
                        },60);
                    });
                }
            } else if(item.id==="autocuff"){
                this.close();
                setTimeout(()=>{
                    if(typeof window._mvdToggleAutoCuff==="function") window._mvdToggleAutoCuff();
                },80);
            } else if(item.id==="autograb"){
                this.close();
                setTimeout(()=>{
                    if(typeof window._mvdToggleAutoGrab==="function") window._mvdToggleAutoGrab();
                },80);
            } else if(item.id==="naparnick"){
                // Открываем кастомный экран напарника — БЕЗ старого диалога
                this._syncPartnerState();
                this.screen="partner";
            }
        },
        // ── Синхронизация состояния напарника из window ───────────────────────
        _syncPartnerState(){
            // mvdN хранит состояние в замыкании, экспортируем через window
            if(typeof window._mvdPartnerGetState==="function"){
                const s=window._mvdPartnerGetState();
                this.partnerTracking = !!s.tracking;
                this.partnerMessage  = !!s.message;
                this.partnerNick     = s.nick || null;
                this.partnerId       = s.id   || null;
            }
        },
        // ── Напарник — переключить слежку ────────────────────────────────────
        togglePartnerTracking(){
            this._syncPartnerState();
            if(this.partnerTracking){
                // Отключить
                if(typeof window._mvdPartnerDisable==="function") window._mvdPartnerDisable();
                this.partnerTracking=false;
                this.partnerNick=null;
                this.partnerId=null;
            } else {
                // Запросить ID — переходим на экран ввода
                this.partnerIdValue="";
                this.screen="partnerIdInput";
                setTimeout(()=>{
                    const inp=document.querySelector(".mvdmenu__id-input");
                    if(inp){inp.focus();inp.select();}
                },60);
            }
        },
        // ── Напарник — переключить сообщение ─────────────────────────────────
        togglePartnerMessage(){
            const newVal=!this.partnerMessage;
            if(typeof window._mvdPartnerSetMessage==="function") window._mvdPartnerSetMessage(newVal);
            this.partnerMessage=newVal;
        },
        // ── Напарник — подтвердить ID ─────────────────────────────────────────
        confirmPartnerId(){
            const idStr=this.partnerIdValue.trim();
            if(!idStr) return;
            const rawId=parseInt(idStr,10);
            if(isNaN(rawId)||rawId<=0) return;
            if(typeof window._mvdPartnerSetId==="function") window._mvdPartnerSetId(rawId);
            this.partnerId=rawId;
            this.partnerTracking=true;
            this.partnerNick=null; // ник подтянется из ответа /id
            this.partnerIdValue="";
            this.screen="partner";
        },
        // ── Отслеживание — подтвердить ID ────────────────────────────────────
        confirmTrackingId(){
            const idStr=this.trackingIdValue.trim();
            if(!idStr) return;
            const rawId=parseInt(idStr,10);
            if(isNaN(rawId)||rawId<=0) return;
            this.trackingIdValue="";
            this.close();
            setTimeout(()=>{
                if(typeof window.startTracking==="function") window.startTracking(rawId);
                else if(typeof window._mvdStartTracking==="function") window._mvdStartTracking(rawId);
                else if(typeof window.showTrackingInputDialog==="function") window.showTrackingInputDialog(rawId);
            },80);
        },
        // ── Повседневная — выбор действия ────────────────────────────────────
        selectOption(opt){
            const id=this.targetId;
            if(opt.special==="fine"){
                this.close();
                setTimeout(()=>{
                    if(typeof window.showKoapTypeMenu==="function") window.showKoapTypeMenu(id);
                },80);
            } else if(opt.special==="wanted"){
                this.close();
                setTimeout(()=>{
                    if(typeof window.showUkInputDialog==="function") window.showUkInputDialog(id);
                },80);
            } else if(opt.needsId){
                this.pendingAction=opt.action;
                this.pendingActionLabel=opt.label;
                this.idValue=(id!==null&&id!==-1)?String(id):"";
                this.screen="idInput";
                this.$nextTick(()=>{
                    setTimeout(()=>{
                        const inp=this.$el.querySelector(".mvdmenu__id-input");
                        if(inp){inp.focus();inp.select();}
                    },60);
                });
            } else {
                this.close();
                setTimeout(()=>{
                    if(typeof window._mvdExecuteAction==="function")
                        window._mvdExecuteAction(opt.action,id);
                },80);
            }
        },
        // ── Подтверждение ввода ID ────────────────────────────────────────────
        confirmId(){
            let id=this.idValue.trim();
            if(!id&&this.targetId!==null&&this.targetId!==-1) id=String(this.targetId);
            if(!id) return;
            const action=this.pendingAction;
            this.targetId=id;
            this.pendingAction=null;
            this.pendingActionLabel="";
            this.idValue="";
            this.close();
            setTimeout(()=>{
                if(typeof window._mvdExecuteAction==="function")
                    window._mvdExecuteAction(action,id);
            },80);
        },
        close(){
            window.closeInterface("MvdMenu");
        }
    },
    created(){this.$data.noAdaptation=true},
    mounted(){
        // CSS — вставляем СНАЧАЛА, до любых reactive-изменений (screen/targetId),
        // чтобы первый перерендер не происходил без применённых стилей
        // (старая версия без переключения screen такой проблемы не имела)
        const s=document.createElement("style");
        s.id="mvdmenu-style";
        s.textContent=`
.mvdmenu{align-items:center;display:flex;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:100vh;justify-content:center;left:0;position:absolute;text-transform:none;top:0;width:100vw;z-index:11;}
.mvdmenu__overlay{background:#010106eb;bottom:0;left:0;position:absolute;right:0;top:0;}
.mvdmenu__wrapper{background:#141419eb;border:0.19vh solid rgba(255,255,255,0.05);border-radius:0.74vh;box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(249,183,1,0.2),0 1.5vh 5vh rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;position:relative;width:36vh;z-index:1;}
.mvdmenu__top-accent{background:#f9b701;height:0.19vh;left:0;position:absolute;right:0;top:0;}
.mvdmenu__pattern{height:23.61vh;left:0;mask-image:linear-gradient(180deg,#d9d9d9,rgba(115,115,115,0) 70%);overflow:hidden;pointer-events:none;position:absolute;top:0;width:100%;}

/* Header */
.mvdmenu__header{align-items:center;background:rgba(10,10,14,0.6);border-bottom:0.09vh solid rgba(255,255,255,.07);display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.mvdmenu__header-left{align-items:center;display:flex;gap:0.74vh;}
.mvdmenu__back-btn{align-items:center;background:rgba(255,255,255,.06);border-radius:0.37vh;color:rgba(255,255,255,.5);cursor:pointer;display:flex;height:2.59vh;justify-content:center;transition:all 0.15s ease;width:2.59vh;flex-shrink:0;}
@media (platform:pc){.mvdmenu__back-btn:hover{background:rgba(255,255,255,.14);}}
.mvdmenu__back-btn svg{height:1.2vh;width:1.2vh;}
.mvdmenu__title{align-items:baseline;display:flex;font-weight:700;gap:0.37vh;}
.mvdmenu__title-main{color:#fff;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.22vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-sub{color:#f9b701;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.22vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-version{color:rgba(255,255,255,.35);font-family:"Open Sans",var(--fallback-font);font-size:1.11vh;font-style:normal;font-weight:400;margin-left:0.74vh;}
.mvdmenu__close-btn{align-items:center;background:rgba(255,255,255,.06);border-radius:0.37vh;color:rgba(255,255,255,.5);cursor:pointer;display:flex;font-size:1.3vh;font-weight:700;height:2.96vh;justify-content:center;transition:all 0.15s ease;width:2.96vh;}
@media (platform:pc){.mvdmenu__close-btn:hover{background:#e05555;color:#fff;}}

/* Search */
.mvdmenu__search{align-items:center;background:rgba(18,18,23,0.8);border-bottom:0.09vh solid rgba(255,255,255,.07);display:flex;gap:0.93vh;padding:0.74vh 1.48vh;position:relative;z-index:1;}
.mvdmenu__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.48vh;justify-content:center;width:1.48vh;}
.mvdmenu__search-icon svg{height:100%;width:100%;}
.mvdmenu__search input{-webkit-appearance:none;background:transparent;border:none;color:#e8e6f0;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.3vh;outline:none;}
.mvdmenu__search input::placeholder{color:rgba(255,255,255,.25);}

/* List */
.mvdmenu__list{display:flex;flex-direction:column;max-height:48vh;overflow-y:auto;position:relative;z-index:1;}
.mvdmenu__list::-webkit-scrollbar{width:0.28vh;}
.mvdmenu__list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:0.19vh;}
.mvdmenu__list::-webkit-scrollbar-track{background:transparent;}

/* Items */
.mvdmenu__item{align-items:center;border-bottom:0.09vh solid rgba(255,255,255,.04);cursor:pointer;display:flex;gap:1.11vh;padding:0.93vh 1.48vh;transition:background 0.1s ease;}
@media (platform:pc){.mvdmenu__item:hover{background:rgba(255,255,255,.04);}}
.mvdmenu__item_fine{border-left:0.19vh solid rgba(61,186,122,.4);}
@media (platform:pc){.mvdmenu__item_fine:hover{background:rgba(61,186,122,.05);}}
.mvdmenu__item_wanted{border-left:0.19vh solid rgba(224,85,85,.4);}
@media (platform:pc){.mvdmenu__item_wanted:hover{background:rgba(224,85,85,.05);}}
.mvdmenu__item_toggle_on{border-left:0.19vh solid rgba(61,186,122,.5);}
@media (platform:pc){.mvdmenu__item_toggle_on:hover{background:rgba(61,186,122,.05);}}
.mvdmenu__item_toggle_off{border-left:0.19vh solid rgba(224,85,85,.3);}
.mvdmenu__item-num{color:rgba(255,255,255,.25);flex-shrink:0;font-size:1.11vh;font-weight:700;min-width:2.4vh;}
.mvdmenu__item-label{color:rgba(255,255,255,.87);flex:1 1 auto;font-size:1.3vh;font-weight:600;line-height:1.4;}
.mvdmenu__item-tag{border-radius:0.22vh;flex-shrink:0;font-size:1.0vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.5vh;}
.mvdmenu__item-id-badge{background:rgba(249,183,1,.1);border-radius:0.22vh;color:rgba(249,183,1,.7);flex-shrink:0;font-size:0.93vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.46vh;}
.mvdmenu__item-arrow{align-items:center;display:flex;flex-shrink:0;opacity:0.5;}
.mvdmenu__item-arrow svg{height:1.11vh;width:1.11vh;}
.mvdmenu__item-status{border-radius:0.22vh;flex-shrink:0;font-size:0.93vh;font-weight:700;padding:0.15vh 0.56vh;}
.mvdmenu__item-status_on{background:rgba(61,186,122,.15);color:rgba(61,186,122,1);}
.mvdmenu__item-status_off{background:rgba(224,85,85,.12);color:rgba(224,85,85,0.9);}
.mvdmenu__empty{color:rgba(255,255,255,.25);font-size:1.3vh;font-style:italic;padding:2.22vh;text-align:center;}

/* ID Input screen */
.mvdmenu__id-screen{align-items:stretch;display:flex;flex-direction:column;gap:1.2vh;padding:2vh 2vh 1.6vh;position:relative;z-index:1;}
.mvdmenu__id-action-label{background:rgba(249,183,1,.08);border:0.09vh solid rgba(249,183,1,.2);border-radius:0.37vh;color:rgba(249,183,1,.9);font-size:1.3vh;font-weight:700;padding:0.74vh 1.48vh;text-align:center;width:100%;box-sizing:border-box;}
.mvdmenu__id-hint{color:rgba(255,255,255,.45);font-size:1.2vh;text-align:center;}
.mvdmenu__id-input-row{align-items:center;display:flex;width:100%;}
.mvdmenu__id-input{-webkit-appearance:none;background:rgba(255,255,255,.06);border:0.09vh solid rgba(255,255,255,.14);border-radius:0.46vh;caret-color:#f9b701;color:#e8e6f0;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.85vh;outline:none;padding:0.93vh 1.2vh;transition:border-color 0.15s ease;width:100%;box-sizing:border-box;}
.mvdmenu__id-input:focus{border-color:rgba(249,183,1,.55);}
.mvdmenu__id-input::placeholder{color:rgba(255,255,255,.22);}
/* Большая кнопка подтвердить */
.mvdmenu__id-confirm-big{align-items:center;background:rgba(255,255,255,.05);border:0.09vh solid rgba(255,255,255,.1);border-radius:0.46vh;color:rgba(255,255,255,.35);cursor:pointer;display:flex;font-size:1.2vh;font-weight:700;justify-content:center;letter-spacing:0.08vh;padding:1vh 0;transition:all 0.15s ease;width:100%;box-sizing:border-box;}
.mvdmenu__id-confirm-big_active{background:rgba(249,183,1,.15);border-color:rgba(249,183,1,.4);color:#f9b701;}
@media (platform:pc){.mvdmenu__id-confirm-big_active:hover{background:rgba(249,183,1,.28);border-color:rgba(249,183,1,.7);}}
.mvdmenu__id-saved-hint{color:rgba(255,255,255,.22);font-size:1.0vh;text-align:center;}
.mvdmenu__id-confirm-footer{flex:0 0 auto;padding:0.46vh 1.11vh;width:auto;}

/* Footer */
.mvdmenu__footer{align-items:center;background:rgba(10,10,14,0.5);border-top:0.09vh solid rgba(255,255,255,.06);display:flex;gap:0.74vh;justify-content:space-between;padding:0.93vh 1.48vh;position:relative;z-index:1;}
.mvdmenu__footer-hint{color:rgba(255,255,255,.28);flex:1 1 auto;font-size:1.11vh;font-weight:400;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mvdmenu__footer-actions{align-items:center;display:flex;flex-shrink:0;gap:0.46vh;}
.mvdmenu__close-footer-btn{background:rgba(255,255,255,.06);border-radius:0.37vh;color:rgba(255,255,255,.5);cursor:pointer;flex-shrink:0;font-size:1.0vh;font-weight:700;letter-spacing:0.05vh;padding:0.46vh 1.11vh;transition:all 0.15s ease;white-space:nowrap;}
@media (platform:pc){.mvdmenu__close-footer-btn:hover{background:rgba(255,255,255,.12);color:#fff;}}
        `;
        document.head.appendChild(s);

        // Читаем targetId
        this.targetId=(typeof window._mvdMenuTargetId!=="undefined"&&window._mvdMenuTargetId!==null)
            ?window._mvdMenuTargetId:null;
        window._mvdMenuTargetId=null;

        // Читаем начальный экран (povsednev если открыто из showPovsednevMenuPage,
        // main если открыто общим хоткеем МВД)
        if(window._mvdMenuStartScreen==="povsednev"){
            this.screen="povsednev";
        } else if(window._mvdMenuStartScreen==="main"){
            this.screen="main";
        }
        window._mvdMenuStartScreen=null;

        // Автофокус, если открылись прямо на экране ввода ID
        if(this.screen==="idInput"){
            this.$nextTick(()=>{
                setTimeout(()=>{
                    const inp=this.$el.querySelector(".mvdmenu__id-input");
                    if(inp){inp.focus();inp.select();}
                },60);
            });
        }

        // Синхронизируем состояние напарника при монтировании
        this._syncPartnerState();

        // ESC handler
        this._prevOnKeyUp=window.onKeyUp;
        window.onKeyUp=(e)=>{
            if(e===window.KEY_CODE_ESC){
                if(this.screen==="idInput"){
                    this.goBack();
                } else if(this.screen==="povsednev"){
                    this.goBack();
                } else if(this.screen==="partner"){
                    this.goBack();
                } else if(this.screen==="partnerIdInput"){
                    this.goBack();
                } else if(this.screen==="trackingInput"){
                    this.goBack();
                } else {
                    this.close();
                }
                return;
            }
            if(typeof this._prevOnKeyUp==="function") this._prevOnKeyUp(e);
        };
    },
    unmounted(){
        window.onKeyUp=this._prevOnKeyUp;
        const s=document.getElementById("mvdmenu-style");
        if(s)s.remove();
    }
};

const MvdMenu=_export_sfc(_sfc_main,[["render",render]]);
export{MvdMenu as default};
