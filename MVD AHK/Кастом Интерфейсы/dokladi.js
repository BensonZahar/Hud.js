import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,g as createBlock,b as createVNode,_ as _export_sfc}from"./index.js";
import{C as ControlsContaineredButton}from"./ContaineredButton.js";

// ══════════════════════════════════════════════════════════════════════════
//  Dokladi.js — меню "Доклады" (доклад по посту / патрулю через /r)
//  Репозиторий: BensonZahar/Hud.js
//  Папка:       MVD AHK/Кастом Интерфейсы/
//
//  Экраны:
//    "type"       — выбор Пост / Патруль
//    "name-input" — ввод названия поста/патруля
//    "stage"      — выбор Начало / Середина / Конец → отправка /r-доклада
//
//  Звание и фамилия берутся из window._mvdRank / window._mvdLastName —
//  так же, как в mvdF.js для "Приветствие" (executePovsednevAction/greeting).
//  Отправка доклада делегируется в window._mvdExecuteDoklad(type,name,stage)
//  (см. mvdF.js), которая при необходимости подгружает профиль игрока перед
//  отправкой сообщения.
// ══════════════════════════════════════════════════════════════════════════

// ─── SVG иконка стрелки (как в MvdMenu.js) ─────────────────────────────────
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
            // ЭКРАН: name-input — Ввод названия поста/патруля
            // ══════════════════════════════════════════════════════════════════
            $data.screen==="name-input"
                ? (openBlock(),createElementBlock(Fragment,{key:"name-input"},[
                    createBaseVNode("div",{class:"dokladi__name-input-wrap"},[
                        createBaseVNode("div",{class:"dokladi__name-input-label"},
                            toDisplayString($data.reportType==="post"
                                ? "Введите название поста"
                                : "Введите название патруля"), 1 /* TEXT */
                        ),
                        createBaseVNode("div",{class:"dokladi__name-input-row"},[
                            createBaseVNode("input",{
                                class:"dokladi__name-input-field",
                                id:"dokladi-name-field",
                                type:"text",
                                maxlength:"64",
                                placeholder:$data.reportType==="post" ? "Название поста..." : "Название патруля...",
                                value:$data.reportName,
                                onInput:$event=>{$data.reportName=$event.target.value},
                                onKeydown:$options.onNameInputKeydown,
                            },null,40,["placeholder","value","onInput","onKeydown"])
                        ]),
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ══════════════════════════════════════════════════════════════════
            // ЭКРАН: stage — выбор Начало / Середина / Конец
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
                    ])
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
            this.close();
            setTimeout(()=>{
                if(typeof window._mvdExecuteDoklad==="function")
                    window._mvdExecuteDoklad(type,name,stage);
            },80);
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
    }
};

const Dokladi=_export_sfc(_sfc_main,[["render",render]]);
export{Dokladi as default};
