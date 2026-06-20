import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc}from"./index.js";

// ─── SVG иконки ───────────────────────────────────────────────────────────────
const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(244,241,225,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(244,241,225,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_BACK=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L4 6L8 10" stroke="rgba(244,241,225,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_ARROW=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2L7 5L3 8" stroke="rgba(244,241,225,0.3)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// GraffitiPattern
const GRAFFITI_SVG=`<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:-60px;left:-40px;width:48.52vh;height:23.61vh;opacity:0.05;pointer-events:none;transform:rotate(148deg)"><line x1="0" y1="20" x2="400" y2="20" stroke="white" stroke-width="1.2"/><line x1="0" y1="40" x2="400" y2="40" stroke="white" stroke-width="1.2"/><line x1="0" y1="60" x2="400" y2="60" stroke="white" stroke-width="1.2"/><line x1="0" y1="80" x2="400" y2="80" stroke="white" stroke-width="1.2"/><line x1="0" y1="100" x2="400" y2="100" stroke="white" stroke-width="1.2"/><line x1="0" y1="120" x2="400" y2="120" stroke="white" stroke-width="1.2"/><line x1="0" y1="140" x2="400" y2="140" stroke="white" stroke-width="1.2"/><line x1="0" y1="160" x2="400" y2="160" stroke="white" stroke-width="1.2"/><line x1="0" y1="180" x2="400" y2="180" stroke="white" stroke-width="1.2"/><line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="1.2"/><line x1="20" y1="0" x2="20" y2="400" stroke="white" stroke-width="1.2"/><line x1="40" y1="0" x2="40" y2="400" stroke="white" stroke-width="1.2"/><line x1="60" y1="0" x2="60" y2="400" stroke="white" stroke-width="1.2"/><line x1="80" y1="0" x2="80" y2="400" stroke="white" stroke-width="1.2"/><line x1="100" y1="0" x2="100" y2="400" stroke="white" stroke-width="1.2"/></svg>`;

// ─── Пункты меню Повседневная ─────────────────────────────────────────────────
const POVSEDNEV_OPTIONS=[
    {action:"greeting",      label:"Приветствиее",              needsId:true},
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
                    // Кнопка назад (на главном экране закрывает меню)
                    createBaseVNode("div",{
                        class:"mvdmenu__back-btn",
                        innerHTML:SVG_BACK,
                        onClick:$options.goBack
                    }),
                    createBaseVNode("div",{class:"mvdmenu__title"},[
                        createBaseVNode("span",{class:"mvdmenu__title-main"},"МВД"),
                        createBaseVNode("span",{class:"mvdmenu__title-sub"},
                            toDisplayString($options.headerSubtitle)
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
                                        "mvdmenu__item_selected": $data.selectedIndex===i,
                                    }]),
                                    onClick:$event=>{$data.selectedIndex=i;$options.selectMain(item);}
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
                                          }, toDisplayString(item.toggleOn?"Вкл":"Выкл"), 3)
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
                                        "mvdmenu__item_selected": $data.selectedIndex===i,
                                    }]),
                                    onClick:$event=>{$data.selectedIndex=i;$options.selectOption(opt);}
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
            // ЭКРАН: id-input — Ввод ID
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="id-input"
                ? (openBlock(),createElementBlock(Fragment,{key:"id-input"},[
                    createBaseVNode("div",{class:"mvdmenu__id-input-wrap"},[
                        createBaseVNode("div",{class:"mvdmenu__id-input-label"},
                            toDisplayString($data.idInputLabel||"Введите ID игрока")
                        ),
                        createBaseVNode("div",{class:"mvdmenu__id-input-row"},[
                            createBaseVNode("input",{
                                class:"mvdmenu__id-input-field",
                                id:"mvdmenu-id-field",
                                type:"number",
                                min:"1",
                                placeholder:"ID игрока...",
                                value:$data.idInputValue,
                                onInput:$event=>{$data.idInputValue=$event.target.value},
                                onKeydown:$options.onIdInputKeydown,
                            },null,40,["value","onInput","onKeydown"])
                        ]),
                        createBaseVNode("div",{class:"mvdmenu__id-action-row"},[
                            createBaseVNode("div",{
                                class:"mvdmenu__id-confirm-btn",
                                onClick:$options.confirmIdInput
                            },"ПОДТВЕРДИТЬ"),
                        ])
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: partner — Меню напарника (кастомный, без старого диалога)
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="partner"
                ? (openBlock(),createElementBlock(Fragment,{key:"partner"},[
                    createBaseVNode("div",{class:"mvdmenu__list"},[
                        (openBlock(true),createElementBlock(Fragment,null,
                            renderList($options.partnerMenuItems,(item,i)=>(
                                openBlock(),createElementBlock("div",{
                                    key:item.id,
                                    class:normalizeClass(["mvdmenu__item",{
                                        "mvdmenu__item_toggle_on": item.toggleOn===true,
                                        "mvdmenu__item_toggle_off": item.toggleOn===false,
                                        "mvdmenu__item_selected": $data.selectedIndex===i,
                                    }]),
                                    onClick:$event=>{$data.selectedIndex=i;$options[item.onClick]();}
                                },[
                                    createBaseVNode("div",{class:"mvdmenu__item-num"},
                                        toDisplayString(String(i+1).padStart(2,"0"))
                                    ),
                                    createBaseVNode("div",{class:"mvdmenu__item-label"},
                                        toDisplayString(item.label)
                                    ),
                                    createBaseVNode("div",{
                                        class:normalizeClass(["mvdmenu__item-status",
                                            item.toggleOn?"mvdmenu__item-status_on":"mvdmenu__item-status_off"
                                        ])
                                    }, toDisplayString(item.toggleOn?"Вкл":"Выкл"), 3)
                                ],10,["onClick"])
                            ))
                        ,128))
                    ]),
                  ],64))
                : createCommentVNode("",true),

        ])
    ]));
}

// ─── Компонент ────────────────────────────────────────────────────────────────
const _sfc_main={
    name:"MvdMenu",
    data(){
        return{
            // screen: "main" | "povsednev" | "partner" | "id-input"
            screen:"main",
            search:"",
            targetId:null,
            // ── Навигация по списку стрелочками/Enter ──
            selectedIndex:0,
            // ── Реактивные флаги тоглов главного меню (читаем из window сразу) ──
            trackingOn: !!(typeof window._mvdTrackingActive!=="undefined"
                ? window._mvdTrackingActive
                : (window._mvdCurrentScanId != null)),
            trackingNick: (typeof window._mvdTrackingNick!=="undefined" ? window._mvdTrackingNick : null),
            autocuffOn: !!(typeof window._mvdAutoCuffEnabled!=="undefined"
                ? window._mvdAutoCuffEnabled : false),
            autograbOn: !!(typeof window._mvdAutoGrabEnabled!=="undefined"
                ? window._mvdAutoGrabEnabled : true),
            // ── Напарник (читаем из window сразу, как trackingOn/autocuffOn) ──
            partnerTracking: (()=>{ try{ const s=window._mvdPartnerGetState&&window._mvdPartnerGetState(); return !!(s&&s.tracking); }catch(e){ return false; } })(),
            partnerMessage:  (()=>{ try{ const s=window._mvdPartnerGetState&&window._mvdPartnerGetState(); return !!(s&&s.message);  }catch(e){ return false; } })(),
            partnerNick:     (()=>{ try{ const s=window._mvdPartnerGetState&&window._mvdPartnerGetState(); return (s&&s.nick)||null;  }catch(e){ return null;  } })(),
            partnerId:       (()=>{ try{ const s=window._mvdPartnerGetState&&window._mvdPartnerGetState(); return (s&&s.id)||null;    }catch(e){ return null;  } })(),
            // ── ID-input ──
            idInputValue:"",
            idInputLabel:"Введите ID игрока",
            // "action" | "tracking" | "partner"
            idInputContext:null,
            _idPrevScreen:null,
        }
    },
    computed:{
        headerSubtitle(){
            if(this.screen==="main")            return " АХК";
            if(this.screen==="povsednev")       return " ПОВСЕДНЕВНАЯ";
            if(this.screen==="partner")         return " НАПАРНИК";
            if(this.screen==="id-input")        return this.idInputContext==="tracking"?" ОТСЛЕЖИВАНИЕ":this.idInputContext==="partner"?" НАПАРНИК":" ВВОД ID";
            return " АХК";
        },
        mainMenuItems(){
            const items=[];
            items.push({id:"povsednev", label:"Повседневная", arrow:true});
            const trackingLabel = this.trackingOn && this.trackingNick
                ? "Отслеживание: "+this.trackingNick+"["+(window._mvdCurrentScanId??"")+"]"
                : "Отслеживание";
            items.push({id:"tracking", label: trackingLabel, toggleOn: this.trackingOn});
            items.push({id:"autocuff", label:"Auto-cuff", toggleOn: this.autocuffOn});
            if(typeof window.AUTO_GRAB!=="undefined"&&window.AUTO_GRAB===true){
                items.push({id:"autograb", label:"Авто-снаряжение", toggleOn: this.autograbOn});
            }
            // Напарник — показываем текущий статус
            const partnerLabel = this.partnerTracking && this.partnerNick
                ? "Напарник: "+this.partnerNick+"["+this.partnerId+"]"
                : "Напарник";
            items.push({id:"naparnick", label: partnerLabel, arrow:true});
            items.push({id:"laws", label:"Законы", arrow:true});
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
        // ── Список пунктов меню напарника (через computed — как mainMenuItems) ──
        partnerMenuItems(){
            return [
                {
                    id:"tracking",
                    label: this.partnerTracking && this.partnerNick
                        ? "Следить: "+this.partnerNick+"["+this.partnerId+"]"
                        : "Следить за напарником",
                    toggleOn: this.partnerTracking,
                    onClick: "togglePartnerTracking"
                },
                {
                    id:"message",
                    label: "Сообщение для напарника",
                    toggleOn: this.partnerMessage,
                    onClick: "togglePartnerMessage"
                }
            ];
        },
        // ── Текущий список пунктов для клавиатурной навигации (зависит от экрана) ──
        currentListItems(){
            if(this.screen==="main")      return this.mainMenuItems;
            if(this.screen==="povsednev") return this.filteredOptions;
            if(this.screen==="partner")   return this.partnerMenuItems;
            return [];
        },
    },
    watch:{
        // Сбрасываем выделение при смене экрана или фильтрации поиском —
        // иначе индекс может "уехать" на несуществующий пункт
        screen(){ this.selectedIndex=0; },
        search(){ this.selectedIndex=0; },
    },
    methods:{
        // ── Клавиатурная навигация: стрелки двигают индекс по кругу, Enter подтверждает ──
        moveSelection(delta){
            const items=this.currentListItems;
            if(!items.length) return;
            const len=items.length;
            this.selectedIndex=((this.selectedIndex+delta)%len+len)%len;
            this.$nextTick(()=>{
                const sel=this.$el.querySelector(".mvdmenu__item_selected");
                if(sel) sel.scrollIntoView({block:"nearest"});
            });
        },
        confirmSelected(){
            const items=this.currentListItems;
            if(!items.length) return;
            const idx=Math.min(Math.max(this.selectedIndex,0),items.length-1);
            const item=items[idx];
            if(this.screen==="main") this.selectMain(item);
            else if(this.screen==="povsednev") this.selectOption(item);
            else if(this.screen==="partner" && typeof this[item.onClick]==="function") this[item.onClick]();
        },
        globalIndex(opt){
            return this.visibleOptions.indexOf(opt);
        },
        goBack(){
            if(this.screen==="id-input"){
                this.screen=this._idPrevScreen||"main";
                this.idInputValue="";
            } else if(this.screen==="povsednev"){
                this.screen="main";
                this.search="";
            } else if(this.screen==="partner"){
                this.screen="main";
            } else if(this.screen==="main"){
                this.close();
            }
        },
        // ── Главное меню ──────────────────────────────────────────────────────
        selectMain(item){
            if(item.id==="povsednev"){
                this.screen="povsednev";
            } else if(item.id==="tracking"){
                if(this.trackingOn || window._mvdCurrentScanId){
                    this.trackingOn=false;
                    this.close();
                    setTimeout(()=>{
                        if(typeof window._mvdToggleTracking==="function") window._mvdToggleTracking();
                    },80);
                } else {
                    // Собственный экран ввода ID для отслеживания
                    this.idInputLabel="Введите ID для отслеживания";
                    this.idInputValue=this.targetId!==null&&this.targetId!==-1?String(this.targetId):"";
                    this.idInputContext="tracking";
                    this._idPrevScreen="main";
                    this.screen="id-input";
                    this.$nextTick(()=>{ const f=document.getElementById("mvdmenu-id-field");if(f)f.focus(); });
                }
            } else if(item.id==="autocuff"){
                this.autocuffOn=!this.autocuffOn;
                if(typeof window._mvdToggleAutoCuff==="function") window._mvdToggleAutoCuff();
            } else if(item.id==="autograb"){
                this.autograbOn=!this.autograbOn;
                if(typeof window._mvdToggleAutoGrab==="function") window._mvdToggleAutoGrab();
            } else if(item.id==="naparnick"){
                this._syncPartnerState();
                this.screen="partner";
            } else if(item.id==="laws"){
                window._duranOpenMode="laws";
                this.close();
                setTimeout(()=>{
                    window.openInterface("Zkm");
                },80);
            }
        },
        // ── Синхронизация тоглов главного меню из window ─────────────────────
        _syncToggleState(){
            this.trackingOn = !!(typeof window._mvdTrackingActive!=="undefined"
                ? window._mvdTrackingActive
                : (window._mvdCurrentScanId != null));
            this.trackingNick = (typeof window._mvdTrackingNick!=="undefined" ? window._mvdTrackingNick : null);
            this.autocuffOn = !!(typeof window._mvdAutoCuffEnabled!=="undefined"
                ? window._mvdAutoCuffEnabled : false);
            this.autograbOn = !!(typeof window._mvdAutoGrabEnabled!=="undefined"
                ? window._mvdAutoGrabEnabled : true);
        },
        // ── Синхронизация состояния напарника из window ───────────────────────
        _syncPartnerState(){
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
                if(typeof window._mvdPartnerDisable==="function") window._mvdPartnerDisable();
                this.partnerTracking=false;
                this.partnerNick=null;
                this.partnerId=null;
            } else {
                // Собственный экран ввода ID напарника
                const cur=(this.partnerNick&&this.partnerId)?`Текущий: ${this.partnerNick}[${this.partnerId}]`:`Не задан`;
                this.idInputLabel=`Введите ID напарника (${cur})`;
                this.idInputValue=this.targetId!==null&&this.targetId!==-1?String(this.targetId):"";
                this.idInputContext="partner";
                this._idPrevScreen="partner";
                this.screen="id-input";
                this.$nextTick(()=>{ const f=document.getElementById("mvdmenu-id-field");if(f)f.focus(); });
            }
        },
        // ── Напарник — переключить сообщение ─────────────────────────────────
        togglePartnerMessage(){
            const newVal=!this.partnerMessage;
            if(typeof window._mvdPartnerSetMessage==="function") window._mvdPartnerSetMessage(newVal);
            this.partnerMessage=newVal;
            if(typeof this.$forceUpdate==="function") this.$forceUpdate();
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
                // Проверяем: если targetId уже задан — сразу выполняем, иначе показываем экран ввода
                if(this.targetId!==null&&this.targetId!==-1){
                    const id=this.targetId;
                    this.close();
                    setTimeout(()=>{
                        window._mvdMenuPendingAction=opt.action;
                        if(typeof window._mvdExecuteAction==="function")
                            window._mvdExecuteAction(opt.action,id);
                    },80);
                } else {
                    // Собственный экран ввода ID
                    this.idInputLabel="Введите ID игрока";
                    this.idInputValue="";
                    this.idInputContext="action";
                    this._idPrevScreen="povsednev";
                    this._pendingOpt=opt;
                    this.screen="id-input";
                    this.$nextTick(()=>{ const f=document.getElementById("mvdmenu-id-field");if(f)f.focus(); });
                }
            } else {
                this.close();
                setTimeout(()=>{
                    if(typeof window._mvdExecuteAction==="function")
                        window._mvdExecuteAction(opt.action,id);
                },80);
            }
        },
        // ── ID-input ──────────────────────────────────────────────────────
        openIdInput(label,defaultVal,context,prevScreen){
            this.idInputLabel=label||"Введите ID игрока";
            this.idInputValue=defaultVal!=null&&defaultVal!==-1?String(defaultVal):"";
            this.idInputContext=context;
            this._idPrevScreen=prevScreen||"main";
            this.screen="id-input";
            this.$nextTick(()=>{ const f=document.getElementById("mvdmenu-id-field");if(f)f.focus(); });
        },
        confirmIdInput(){
            const raw=String(this.idInputValue||"").trim();
            const id=raw===""?-1:parseInt(raw,10);
            const ctx=this.idInputContext;
            if(ctx==="action"){
                const opt=this._pendingOpt;
                if(opt&&id>0){
                    this.targetId=id;
                    this.close();
                    setTimeout(()=>{
                        window._mvdMenuPendingAction=opt.action;
                        if(typeof window._mvdExecuteAction==="function")
                            window._mvdExecuteAction(opt.action,id);
                    },80);
                } else {
                    this.screen=this._idPrevScreen||"povsednev";
                    this.idInputValue="";
                }
            } else if(ctx==="tracking"){
                if(id>0){
                    this.targetId=id;
                    this.close();
                    setTimeout(()=>{
                        if(typeof window._mvdStartTracking==="function") window._mvdStartTracking(id);
                    },80);
                } else {
                    this.screen="main";
                    this.idInputValue="";
                }
            } else if(ctx==="partner"){
                if(id>0){
                    this.targetId=id;
                    this.close();
                    setTimeout(()=>{
                        // Эмулируем ответ диалога 683 вручную
                        if(typeof window.sendClientEventCustom==="function")
                            window.sendClientEventCustom("custom","OnDialogResponse",683,1,0,String(id),"");
                    },80);
                } else {
                    this.screen="partner";
                    this.idInputValue="";
                }
            }
        },
        cancelIdInput(){
            this.idInputValue="";
            this.screen=this._idPrevScreen||"main";
        },
        onIdInputKeydown(e){
            if(e.key==="Escape") this.cancelIdInput();
        },
        close(){
            window.closeInterface("MvdMenu");
        }
    },
    created(){this.$data.noAdaptation=true},
    mounted(){
        const s=document.createElement("style");
        s.id="mvdmenu-style";
        s.textContent=`
.mvdmenu{align-items:center;display:flex;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:100vh;justify-content:center;left:0;position:absolute;text-transform:none;top:0;width:100vw;z-index:11;}
.mvdmenu__overlay{bottom:0;left:0;position:absolute;right:0;top:0;}
.mvdmenu__wrapper{background:#141419eb;border:0.19vh solid rgba(255,255,255,0.05);border-radius:0.74vh;box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(249,183,1,0.2),0 1.5vh 5vh rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;position:relative;width:36vh;z-index:1;}
.mvdmenu__top-accent{background:#f9b701;height:0.19vh;left:0;position:absolute;right:0;top:0;}
.mvdmenu__pattern{height:23.61vh;left:0;mask-image:linear-gradient(180deg,#d9d9d9,rgba(115,115,115,0) 70%);overflow:hidden;pointer-events:none;position:absolute;top:0;width:100%;}

/* Header */
.mvdmenu__header{align-items:center;background:transparent;border-bottom:0.19vh solid #f4f1e11a;display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.mvdmenu__header-left{align-items:center;display:flex;gap:0.74vh;}
.mvdmenu__back-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e199;cursor:pointer;display:flex;height:2.59vh;justify-content:center;transition:all 0.15s ease;width:2.59vh;flex-shrink:0;}
@media (platform:pc){.mvdmenu__back-btn:hover{background:#ffffff1a;}}
.mvdmenu__back-btn svg{height:1.2vh;width:1.2vh;}
.mvdmenu__title{align-items:baseline;display:flex;font-weight:700;gap:0.37vh;}
.mvdmenu__title-main{color:#f4f1e1;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.59vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-sub{color:#f9b701;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.59vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-version{color:#f4f1e166;font-family:"Open Sans",var(--fallback-font);font-size:1.11vh;font-style:normal;font-weight:400;margin-left:0.74vh;}
.mvdmenu__close-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e199;cursor:pointer;display:flex;font-size:1.48vh;font-weight:700;height:2.96vh;justify-content:center;transition:all 0.15s ease;width:2.96vh;}
@media (platform:pc){.mvdmenu__close-btn:hover{background:#e25544;border-color:#e25544;color:#fff;}}

/* Search */
.mvdmenu__search{align-items:center;background:#ffffff05;border-bottom:0.19vh solid #f4f1e11a;display:flex;gap:0.93vh;padding:0.93vh 1.67vh;position:relative;z-index:1;}
.mvdmenu__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.48vh;justify-content:center;width:1.48vh;}
.mvdmenu__search-icon svg{height:100%;width:100%;}
.mvdmenu__search input{-webkit-appearance:none;background:transparent;border:none;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;}
.mvdmenu__search input::placeholder{color:#f4f1e166;font-weight:400;}

/* List */
.mvdmenu__list{display:flex;flex-direction:column;max-height:48vh;overflow-y:auto;position:relative;z-index:1;}
.mvdmenu__list::-webkit-scrollbar{width:1.11vh;}
.mvdmenu__list::-webkit-scrollbar-thumb{background:linear-gradient(0deg,#bcbcbd,#fff 75%);border-radius:0.19vh;}
.mvdmenu__list::-webkit-scrollbar-track{background:#ffffff1a;border-radius:0.19vh;}

/* Items */
.mvdmenu__item{align-items:center;border-bottom:0.09vh solid #f4f1e10d;cursor:pointer;display:flex;gap:1.11vh;padding:0.93vh 1.48vh;transition:background 0.1s ease;}
@media (platform:pc){.mvdmenu__item:hover{background:rgba(255,255,255,.04);}}
.mvdmenu__item_fine{border-left:0.19vh solid rgba(61,186,122,.4);}
@media (platform:pc){.mvdmenu__item_fine:hover{background:rgba(61,186,122,.05);}}
.mvdmenu__item_wanted{border-left:0.19vh solid rgba(224,85,85,.4);}
@media (platform:pc){.mvdmenu__item_wanted:hover{background:rgba(224,85,85,.05);}}
.mvdmenu__item_toggle_on{border-left:0.19vh solid rgba(61,186,122,.5);}
@media (platform:pc){.mvdmenu__item_toggle_on:hover{background:rgba(61,186,122,.05);}}
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


/* ID Input screen */
.mvdmenu__id-input-wrap{display:flex;flex-direction:column;gap:1.3vh;padding:2vh 1.85vh 1.85vh;position:relative;z-index:1;}
.mvdmenu__id-input-label{color:#f4f1e1cc;font-size:1.3vh;font-weight:600;line-height:1.4;}
.mvdmenu__id-input-row{display:flex;gap:0.74vh;}
.mvdmenu__id-input-field{-webkit-appearance:none;appearance:none;background:#ffffff08;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;padding:0.74vh 1.11vh;transition:border-color 0.15s;}
.mvdmenu__id-input-field:focus{border-color:rgba(249,183,1,0.5);}
.mvdmenu__id-input-field::placeholder{color:#f4f1e144;font-weight:400;}
.mvdmenu__id-input-field::-webkit-inner-spin-button,.mvdmenu__id-input-field::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
.mvdmenu__id-action-row{display:flex;gap:0.74vh;}
.mvdmenu__id-confirm-btn{background:rgba(249,183,1,0.12);border:0.19vh solid rgba(249,183,1,0.25);border-radius:0.37vh;color:rgba(249,183,1,0.9);cursor:pointer;flex:1 1 auto;font-size:1.48vh;font-weight:700;letter-spacing:0.08vh;padding:1.3vh 0;text-align:center;transition:all 0.15s ease;}
@media (platform:pc){.mvdmenu__id-confirm-btn:hover{background:rgba(249,183,1,0.22);border-color:rgba(249,183,1,0.55);color:#f9b701;}}
        `;
        document.head.appendChild(s);

        // Читаем targetId
        this.targetId=(typeof window._mvdMenuTargetId!=="undefined"&&window._mvdMenuTargetId!==null)
            ?window._mvdMenuTargetId:null;
        window._mvdMenuTargetId=null;

        // Читаем начальный экран
        if(window._mvdMenuStartScreen==="povsednev"){
            this.screen="povsednev";
        } else if(window._mvdMenuStartScreen==="main"){
            this.screen="main";
        }
        window._mvdMenuStartScreen=null;

        // Синхронизируем состояние напарника при монтировании
        this._syncToggleState();
        this._syncPartnerState();

        // ESC handler
        this._prevOnKeyUp=window.onKeyUp;
        window.onKeyUp=(e)=>{
            if(e===window.KEY_CODE_ESC){
                if(this.screen==="id-input"){
                    this.cancelIdInput();
                } else if(this.screen==="povsednev"){
                    this.goBack();
                } else if(this.screen==="partner"){
                    this.goBack();
                } else {
                    this.close();
                }
                return;
            }
            // Навигация по списку стрелочками + подтверждение по Enter
            if(this.screen==="main"||this.screen==="povsednev"||this.screen==="partner"){
                if(e===window.KEY_CODE_ARROW_TOP){
                    this.moveSelection(-1);
                    return;
                }
                if(e===window.KEY_CODE_ARROW_BOTTOM){
                    this.moveSelection(1);
                    return;
                }
                if(e===window.KEY_CODE_ENTER){
                    this.confirmSelected();
                    return;
                }
            }
            // Подтверждение ввода ID по Enter
            // (нативный keydown на самом инпуте в этом клиенте не всегда долетает,
            // поэтому ловим Enter здесь же, как и для остальных экранов)
            if(this.screen==="id-input"){
                if(e===window.KEY_CODE_ENTER){
                    this.confirmIdInput();
                    return;
                }
            }
            if(typeof this._prevOnKeyUp==="function") this._prevOnKeyUp(e);
        };

        // showInterface → setCursorStatus(true) → setDrawLabelStatus(false) скрыл метки;
        // восстанавливаем явно, чтобы ники над игроками оставались видны
        if(!window.App?.developmentMode) window.setDrawLabelStatus(true);
    },
    unmounted(){
        window.onKeyUp=this._prevOnKeyUp;
        const s=document.getElementById("mvdmenu-style");
        if(s)s.remove();
    }
};

const MvdMenu=_export_sfc(_sfc_main,[["render",render]]);
export{MvdMenu as default};
