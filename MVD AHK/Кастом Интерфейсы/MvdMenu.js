import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc}from"./index.js";

// ─── SVG иконки (CEF не поддерживает unicode-символы надёжно) ───────────────
const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;

// GraffitiPattern — упрощённый SVG аналог игрового паттерна (как в Modal/Window)
const GRAFFITI_SVG=`<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:-60px;left:-40px;width:48.52vh;height:23.61vh;opacity:0.05;pointer-events:none;transform:rotate(148deg)"><line x1="0" y1="20" x2="400" y2="20" stroke="white" stroke-width="1.2"/><line x1="0" y1="40" x2="400" y2="40" stroke="white" stroke-width="1.2"/><line x1="0" y1="60" x2="400" y2="60" stroke="white" stroke-width="1.2"/><line x1="0" y1="80" x2="400" y2="80" stroke="white" stroke-width="1.2"/><line x1="0" y1="100" x2="400" y2="100" stroke="white" stroke-width="1.2"/><line x1="0" y1="120" x2="400" y2="120" stroke="white" stroke-width="1.2"/><line x1="0" y1="140" x2="400" y2="140" stroke="white" stroke-width="1.2"/><line x1="0" y1="160" x2="400" y2="160" stroke="white" stroke-width="1.2"/><line x1="0" y1="180" x2="400" y2="180" stroke="white" stroke-width="1.2"/><line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="1.2"/><line x1="20" y1="0" x2="20" y2="400" stroke="white" stroke-width="1.2"/><line x1="40" y1="0" x2="40" y2="400" stroke="white" stroke-width="1.2"/><line x1="60" y1="0" x2="60" y2="400" stroke="white" stroke-width="1.2"/><line x1="80" y1="0" x2="80" y2="400" stroke="white" stroke-width="1.2"/><line x1="100" y1="0" x2="100" y2="400" stroke="white" stroke-width="1.2"/></svg>`;

// ─── Пункты меню Повседневная (зеркало povsednevOptions из mvdN.js) ──────────
// action строго совпадает — mvdN.js их обрабатывает
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
    {action:"fine",          label:"Выдача штрафа  /ticket",   needsId:false, special:"fine"},
    {action:"wantedFine",    label:"Выдача розыска  /su",      needsId:false, special:"wanted"},
    {action:"confiscate",    label:"Изъятие веществ",          needsId:true},
    {action:"breakGlass",    label:"Разбитие стекла",          needsId:true},
    {action:"removeMask",    label:"Снятие маски",             needsId:false},
    {action:"fingerprint",   label:"Сканирование отпечатков",  needsId:false},
    {action:"takeLicense",   label:"Изъятие прав",             needsId:true},
    {action:"miranda",       label:"Права Миранды",            needsId:false},
];

// Иконки-теги для некоторых пунктов (как badge в zkm)
const ACTION_TAGS={
    fine:    {label:"/ticket", color:"rgba(61,186,122,"},
    wantedFine:{label:"/su",   color:"rgba(224,85,85,"},
    cuffing: {label:"/cuff",   color:"rgba(249,183,1,"},
    arrest:  {label:"/arrest", color:"rgba(249,183,1,"},
    clearWanted:{label:"/clear",color:"rgba(79,110,247,"},
    search:  {label:"/search", color:"rgba(79,110,247,"},
    escort:  {label:"/escort", color:"rgba(79,110,247,"},
    putInCar:{label:"/putpl",  color:"rgba(79,110,247,"},
    uncuffing:{label:"/uncuff",color:"rgba(79,110,247,"},
};

// ─── render ──────────────────────────────────────────────────────────────────
function render(_ctx,_cache,$props,$setup,$data,$options){
    return (openBlock(), createElementBlock("div", {class:"mvdmenu iface-container"}, [

        // ── Overlay (как в Modal) ────────────────────────────────────────────
        createBaseVNode("div",{
            class:"mvdmenu__overlay",
            onClick:$options.close
        }),

        // ── Контейнер (Modal-wrapper DNA) ───────────────────────────────────
        createBaseVNode("div",{class:"mvdmenu__wrapper"}, [

            // GraffitiPattern-фон (как в Modal)
            createBaseVNode("div",{class:"mvdmenu__pattern",innerHTML:GRAFFITI_SVG}),

            // Золотая inset-рамка сверху (Modal border-top DNA)
            createBaseVNode("div",{class:"mvdmenu__top-accent"}),

            // ── Заголовок (Open Sans Condensed italic — как в Modal) ─────────
            createBaseVNode("div",{class:"mvdmenu__header"}, [
                createBaseVNode("div",{class:"mvdmenu__title-block"}, [
                    createBaseVNode("div",{class:"mvdmenu__title"}, [
                        createBaseVNode("span",{class:"mvdmenu__title-main"},"МВД"),
                        createBaseVNode("span",{class:"mvdmenu__title-sub"}," АХК"),
                        createBaseVNode("span",{class:"mvdmenu__title-version"},
                            toDisplayString($data.targetId !== null && $data.targetId !== -1
                                ? `ID: ${$data.targetId}`
                                : "ПОВСЕДНЕВНАЯ")
                        )
                    ])
                ]),
                // Закрыть
                createBaseVNode("div",{
                    class:"mvdmenu__close-btn",
                    onClick:$options.close
                },"X")
            ]),

            // ── Поиск (стиль zkm) ────────────────────────────────────────────
            createBaseVNode("div",{class:"mvdmenu__search"}, [
                createBaseVNode("span",{class:"mvdmenu__search-icon",innerHTML:SVG_SEARCH}),
                createBaseVNode("input",{
                    type:"text",
                    placeholder:"Поиск действия...",
                    value:$data.search,
                    onInput:$event=>{$data.search=$event.target.value}
                },null,40,["value","onInput"])
            ]),

            // ── Список пунктов (стиль zkm article-row) ───────────────────────
            createBaseVNode("div",{class:"mvdmenu__list"}, [
                (openBlock(true), createElementBlock(Fragment, null,
                    renderList($options.filteredOptions,(opt,i)=>(
                        openBlock(), createElementBlock("div",{
                            key:opt.action,
                            class:normalizeClass(["mvdmenu__item", {
                                "mvdmenu__item_special": opt.special,
                                "mvdmenu__item_fine":    opt.special==="fine",
                                "mvdmenu__item_wanted":  opt.special==="wanted",
                            }]),
                            onClick:$event=>$options.selectOption(opt)
                        },[
                            // Номер
                            createBaseVNode("div",{class:"mvdmenu__item-num"},
                                toDisplayString(String($options.globalIndex(opt)+1).padStart(2,"0"))
                            ),
                            // Название
                            createBaseVNode("div",{class:"mvdmenu__item-label"},
                                toDisplayString(opt.label)
                            ),
                            // Тег (badge) если есть
                            ACTION_TAGS[opt.action]
                                ? createBaseVNode("div",{
                                    class:"mvdmenu__item-tag",
                                    style:`background:${ACTION_TAGS[opt.action].color}0.13);color:${ACTION_TAGS[opt.action].color}1)`
                                  }, toDisplayString(ACTION_TAGS[opt.action].label))
                                : createCommentVNode("",true),
                            // Иконка стрелки если нужен ID
                            opt.needsId
                                ? createBaseVNode("div",{class:"mvdmenu__item-id-badge"},"ID")
                                : createCommentVNode("",true),
                        ], 10, ["onClick"])
                    ))
                , 128)),

                // Пусто
                $options.filteredOptions.length===0
                    ? createBaseVNode("div",{class:"mvdmenu__empty"},"Ничего не найдено")
                    : createCommentVNode("",true)
            ]),

            // ── Футер ─────────────────────────────────────────────────────────
            createBaseVNode("div",{class:"mvdmenu__footer"}, [
                createBaseVNode("span",{class:"mvdmenu__footer-hint"},
                    toDisplayString($data.targetId !== null && $data.targetId !== -1
                        ? `Цель: ID ${$data.targetId}`
                        : "ID не задан — потребуется при необходимости")
                ),
                createBaseVNode("div",{
                    class:"mvdmenu__close-footer-btn",
                    onClick:$options.close
                },"ЗАКРЫТЬ")
            ])
        ])
    ]));
}

// ─── Компонент ───────────────────────────────────────────────────────────────
const _sfc_main={
    name:"MvdMenu",
    data(){
        return{
            search:"",
            targetId:null,   // заполняется из window._mvdMenuTargetId перед openInterface
        }
    },
    computed:{
        // Применяем MENU_HIDDEN_ITEMS и MENU_ORDER из mvdN.js (если есть)
        visibleOptions(){
            let opts=[...POVSEDNEV_OPTIONS];
            // Скрытые пункты
            const hidden=(typeof window.MENU_HIDDEN_ITEMS!=="undefined"&&Array.isArray(window.MENU_HIDDEN_ITEMS))
                ?window.MENU_HIDDEN_ITEMS:[];
            if(hidden.length) opts=opts.filter(o=>!hidden.includes(o.action));
            // Порядок
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
        selectOption(opt){
            this.close();
            // Передаём управление обратно в mvdN.js через глобальные функции
            const id=this.targetId;
            // Небольшая задержка — дать окну закрыться до выполнения действия
            setTimeout(()=>{
                if(opt.special==="fine"){
                    // → штрафы через zkm
                    if(typeof window.showKoapTypeMenu==="function") window.showKoapTypeMenu(id);
                } else if(opt.special==="wanted"){
                    // → розыск через zkm
                    if(typeof window.showUkInputDialog==="function") window.showUkInputDialog(id);
                } else if(opt.needsId){
                    // → диалог ввода ID → executePovsednevAction
                    window._mvdMenuPendingAction=opt.action;
                    if(typeof window.showIdInputDialog==="function") window.showIdInputDialog(id!=null?id:-1);
                    else {
                        // fallback — напрямую выполнить если ID уже есть
                        if(id!=null&&id!==-1&&typeof window._mvdExecuteAction==="function")
                            window._mvdExecuteAction(opt.action,id);
                    }
                } else {
                    // → выполнить сразу
                    if(typeof window._mvdExecuteAction==="function") window._mvdExecuteAction(opt.action,id);
                }
            },80);
        },
        close(){
            window.closeInterface("MvdMenu");
        }
    },
    created(){this.$data.noAdaptation=true},
    mounted(){
        // ── CSS (injected, как в zkm) ────────────────────────────────────────
        const s=document.createElement("style");
        s.id="mvdmenu-style";
        s.textContent=`

/* ── Overlay (Modal DNA) ─────────────────────────────────────────── */
.mvdmenu{align-items:center;display:flex;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:100vh;justify-content:center;left:0;position:absolute;text-transform:none;top:0;width:100vw;z-index:11;}
.mvdmenu__overlay{background:#010106eb;bottom:0;left:0;position:absolute;right:0;top:0;}

/* ── Wrapper (Modal-container-wrapper DNA) ───────────────────────── */
.mvdmenu__wrapper{background:#141419eb;border:0.19vh solid rgba(255,255,255,0.05);border-radius:0.74vh;box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(249,183,1,0.2),0 1.5vh 5vh rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;position:relative;width:36vh;z-index:1;}

/* Золотая рамка сверху (Modal border-top DNA) */
.mvdmenu__top-accent{background:#f9b701;height:0.19vh;left:0;position:absolute;right:0;top:0;}

/* GraffitiPattern (Modal pattern DNA) */
.mvdmenu__pattern{height:23.61vh;left:0;mask-image:linear-gradient(180deg,#d9d9d9,rgba(115,115,115,0) 70%);overflow:hidden;pointer-events:none;position:absolute;top:0;width:100%;}

/* ── Header (zkm header DNA + Modal title DNA) ────────────────────── */
.mvdmenu__header{align-items:center;background:rgba(10,10,14,0.6);border-bottom:0.09vh solid rgba(255,255,255,.07);display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.mvdmenu__title-block{align-items:baseline;display:flex;}
.mvdmenu__title{align-items:baseline;display:flex;font-weight:700;gap:0.37vh;}

/* Open Sans Condensed italic — точно как Modal .modal__title */
.mvdmenu__title-main{color:#fff;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.22vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-sub{color:#f9b701;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.22vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.mvdmenu__title-version{color:rgba(255,255,255,.35);font-family:"Open Sans",var(--fallback-font);font-size:1.11vh;font-style:normal;font-weight:400;margin-left:0.74vh;}

/* Закрыть */
.mvdmenu__close-btn{align-items:center;background:rgba(255,255,255,.06);border-radius:0.37vh;color:rgba(255,255,255,.5);cursor:pointer;display:flex;font-size:1.3vh;font-weight:700;height:2.96vh;justify-content:center;transition:all 0.15s ease;width:2.96vh;}
@media (platform:pc){.mvdmenu__close-btn:hover{background:#e05555;color:#fff;}}

/* ── Поиск (zkm search DNA) ──────────────────────────────────────── */
.mvdmenu__search{align-items:center;background:rgba(18,18,23,0.8);border-bottom:0.09vh solid rgba(255,255,255,.07);display:flex;gap:0.93vh;padding:0.74vh 1.48vh;position:relative;z-index:1;}
.mvdmenu__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.48vh;justify-content:center;width:1.48vh;}
.mvdmenu__search-icon svg{height:100%;width:100%;}
.mvdmenu__search input{-webkit-appearance:none;background:transparent;border:none;color:#e8e6f0;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.3vh;outline:none;}
.mvdmenu__search input::placeholder{color:rgba(255,255,255,.25);}

/* ── Список (zkm article-row DNA) ────────────────────────────────── */
.mvdmenu__list{display:flex;flex-direction:column;max-height:48vh;overflow-y:auto;position:relative;z-index:1;}
.mvdmenu__list::-webkit-scrollbar{width:0.28vh;}
.mvdmenu__list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:0.19vh;}
.mvdmenu__list::-webkit-scrollbar-track{background:transparent;}

.mvdmenu__item{align-items:center;border-bottom:0.09vh solid rgba(255,255,255,.04);cursor:pointer;display:flex;gap:1.11vh;padding:0.93vh 1.48vh;transition:background 0.1s ease;}
@media (platform:pc){.mvdmenu__item:hover{background:rgba(255,255,255,.04);}}

/* Специальные пункты — штрафы и розыск */
.mvdmenu__item_fine{border-left:0.19vh solid rgba(61,186,122,.4);}
@media (platform:pc){.mvdmenu__item_fine:hover{background:rgba(61,186,122,.05);}}
.mvdmenu__item_wanted{border-left:0.19vh solid rgba(224,85,85,.4);}
@media (platform:pc){.mvdmenu__item_wanted:hover{background:rgba(224,85,85,.05);}}

/* Номер (zkm article-num DNA) */
.mvdmenu__item-num{color:rgba(255,255,255,.25);flex-shrink:0;font-size:1.11vh;font-weight:700;min-width:2.4vh;}

/* Название */
.mvdmenu__item-label{color:rgba(255,255,255,.87);flex:1 1 auto;font-size:1.3vh;font-weight:600;line-height:1.4;}

/* Тег команды (zkm article-type badge DNA) */
.mvdmenu__item-tag{border-radius:0.22vh;flex-shrink:0;font-size:1.0vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.5vh;}

/* ID badge */
.mvdmenu__item-id-badge{background:rgba(249,183,1,.1);border-radius:0.22vh;color:rgba(249,183,1,.7);flex-shrink:0;font-size:0.93vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.46vh;}

/* Пусто */
.mvdmenu__empty{color:rgba(255,255,255,.25);font-size:1.3vh;font-style:italic;padding:2.22vh;text-align:center;}

/* ── Футер ───────────────────────────────────────────────────────── */
.mvdmenu__footer{align-items:center;background:rgba(10,10,14,0.5);border-top:0.09vh solid rgba(255,255,255,.06);display:flex;justify-content:space-between;padding:0.93vh 1.48vh;position:relative;z-index:1;}
.mvdmenu__footer-hint{color:rgba(255,255,255,.28);font-size:1.11vh;font-weight:400;}
.mvdmenu__close-footer-btn{background:rgba(255,255,255,.06);border-radius:0.37vh;color:rgba(255,255,255,.5);cursor:pointer;font-size:1.0vh;font-weight:700;letter-spacing:0.05vh;padding:0.46vh 1.11vh;transition:all 0.15s ease;}
@media (platform:pc){.mvdmenu__close-footer-btn:hover{background:rgba(255,255,255,.12);color:#fff;}}
        `;
        document.head.appendChild(s);

        // Читаем targetId и pending action из глобальных переменных
        this.targetId=(typeof window._mvdMenuTargetId!=="undefined")?window._mvdMenuTargetId:null;
        window._mvdMenuTargetId=null;

        // ESC → закрыть
        this._prevOnKeyUp=window.onKeyUp;
        window.onKeyUp=(e)=>{
            if(e===window.KEY_CODE_ESC){this.close();return;}
            if(typeof this._prevOnKeyUp==="function")this._prevOnKeyUp(e);
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
