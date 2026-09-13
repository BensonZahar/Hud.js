import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,g as createBlock,b as createVNode,_ as _export_sfc}from"./index.js";
import{C as ControlsContaineredButton}from"./ContaineredButton.js";

// ─── SVG иконки ───────────────────────────────────────────────────────────────
const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(244,241,225,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(244,241,225,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_ARROW=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2L7 5L3 8" stroke="rgba(244,241,225,0.3)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// GraffitiPattern
const GRAFFITI_SVG=`<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:-60px;left:-40px;width:48.52vh;height:23.61vh;opacity:0.05;pointer-events:none;transform:rotate(148deg)"><line x1="0" y1="20" x2="400" y2="20" stroke="white" stroke-width="1.2"/><line x1="0" y1="40" x2="400" y2="40" stroke="white" stroke-width="1.2"/><line x1="0" y1="60" x2="400" y2="60" stroke="white" stroke-width="1.2"/><line x1="0" y1="80" x2="400" y2="80" stroke="white" stroke-width="1.2"/><line x1="0" y1="100" x2="400" y2="100" stroke="white" stroke-width="1.2"/><line x1="0" y1="120" x2="400" y2="120" stroke="white" stroke-width="1.2"/><line x1="0" y1="140" x2="400" y2="140" stroke="white" stroke-width="1.2"/><line x1="0" y1="160" x2="400" y2="160" stroke="white" stroke-width="1.2"/><line x1="0" y1="180" x2="400" y2="180" stroke="white" stroke-width="1.2"/><line x1="0" y1="200" x2="400" y2="200" stroke="white" stroke-width="1.2"/><line x1="20" y1="0" x2="20" y2="400" stroke="white" stroke-width="1.2"/><line x1="40" y1="0" x2="40" y2="400" stroke="white" stroke-width="1.2"/><line x1="60" y1="0" x2="60" y2="400" stroke="white" stroke-width="1.2"/><line x1="80" y1="0" x2="80" y2="400" stroke="white" stroke-width="1.2"/><line x1="100" y1="0" x2="100" y2="400" stroke="white" stroke-width="1.2"/></svg>`;

// ─── Пункты меню Повседневная ─────────────────────────────────────────────────
const POVSEDNEV_OPTIONS=[
{action:"greeting",      label:"Приветствие",              needsId:true},
{action:"checkDocuments",label:"Проверка документов",      needsId:false},
];
const ACTION_TAGS={};

// ─── render: ОБЁРТКА В ДИЗАЙН PHONE (один в один из Phone.js) ──────────────
function render(_ctx,_cache,$props,$setup,$data,$options){
const _component_ControlsContaineredButton=resolveComponent("ControlsContaineredButton");
return (openBlock(), createElementBlock("div",{class:"phone"},[
  createBaseVNode("div",{class:"phone__body-wrapper"},[
    createBaseVNode("div",{class:"phone__body"},[
      // Бордюры телефона (один в один из Phone)
      createBaseVNode("div",{class:"phone__body-border phone__body-border_outer"}),
      createBaseVNode("div",{class:"phone__body-border phone__body-border_middle"}),
      createBaseVNode("div",{class:"phone__body-border phone__body-border_inner"}),
      // Декоративные кнопки (один в один из Phone)
      createBaseVNode("div",{class:"phone__body-decor-button"}),
      createBaseVNode("div",{class:"phone__body-decor-button phone__body-decor-button_top"}),
      createBaseVNode("div",{class:"phone__body-decor-button phone__body-decor-button_right"}),
      // Экран телефона
      createBaseVNode("div",{class:"phone__screen-wrapper"},[
        // ── Шапка телефона (как в Phone) ──
        createBaseVNode("div",{class:"phone__header"},[
          createBaseVNode("div",{class:"phone__header-buttons"},[
            createBaseVNode("div",{class:"phone__close-control",onClick:$options.close},"✕")
          ]),
          createBaseVNode("div",{class:"phone__header-info"},[
            createBaseVNode("div",{class:"phone__app-name"},[
              createBaseVNode("span",{},
                toDisplayString($options.headerTitle),1)
            ])
          ])
        ]),
        // ── Контент экрана ──
        createBaseVNode("div",{class:"phone__screen"},[
          createBaseVNode("div",{class:"phone__content mvdmenu-phone-content"},[
            createBaseVNode("div",{class:"mvdmenu__pattern",innerHTML:GRAFFITI_SVG}),

            // ══════════════════════════════════════════════════════════════
            // ЭКРАН: main — МВД меню
            // ══════════════════════════════════════════════════════════════
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
                                        toDisplayString(String(i+1).padStart(2,"0")), 1
                                    ),
                                    createBaseVNode("div",{class:"mvdmenu__item-label"},
                                        toDisplayString(item.label), 1
                                    ),
                                    item.arrow
                                        ? createBaseVNode("div",{class:"mvdmenu__item-arrow",innerHTML:SVG_ARROW})
                                        : createCommentVNode("",true),
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

            // ══════════════════════════════════════════════════════════════
            // ЭКРАН: povsednev — Список повседневных действий
            // ══════════════════════════════════════════════════════════════
            $data.screen==="povsednev"
                ? (openBlock(),createElementBlock(Fragment,{key:"povsednev"},[
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
                                        "mvdmenu__item_selected": $data.selectedIndex===i,
                                    }]),
                                    onClick:$event=>{$data.selectedIndex=i;$options.selectOption(opt);}
                                },[
                                    createBaseVNode("div",{class:"mvdmenu__item-num"},
                                        toDisplayString(String($options.globalIndex(opt)+1).padStart(2,"0")), 1
                                    ),
                                    createBaseVNode("div",{class:"mvdmenu__item-label"},
                                        toDisplayString(opt.label), 1
                                    ),
                                    ACTION_TAGS[opt.action]
                                        ? createBaseVNode("div",{
                                            class:"mvdmenu__item-tag",
                                            style:`background:${ACTION_TAGS[opt.action].color}0.13);color:${ACTION_TAGS[opt.action].color}1)`
                                          },toDisplayString(ACTION_TAGS[opt.action].label), 1)
                                        : createCommentVNode("",true),
                                    $options.optNeedsId(opt)
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

            // ══════════════════════════════════════════════════════════════
            // ЭКРАН: id-input — Ввод ID
            // ══════════════════════════════════════════════════════════════
            $data.screen==="id-input"
                ? (openBlock(),createElementBlock(Fragment,{key:"id-input"},[
                    createBaseVNode("div",{class:"mvdmenu__id-input-wrap"},[
                        createBaseVNode("div",{class:"mvdmenu__id-input-label"},
                            toDisplayString($data.idInputLabel||"Введите ID игрока"), 1
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
                    ])
                  ],64))
                : createCommentVNode("",true),

            // ── Enter / ESC кнопки ──
            createBaseVNode("div",{class:"mvdmenu__footer"},[
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
          ]) // /mvdmenu-phone-content
        ]) // /phone__screen
      ]) // /phone__screen-wrapper
    ]) // /phone__body
  ]) // /phone__body-wrapper
]));
}

// ─── Компонент ────────────────────────────────────────────────────────────────
const _sfc_main={
name:"MvdMenu",
components:{ControlsContaineredButton},
data(){
return{
screen:"main",
search:"",
targetId:null,
KEY_CODE_ESC:window.KEY_CODE_ESC,
KEY_CODE_ENTER:window.KEY_CODE_ENTER,
selectedIndex:0,
autocuffOn: !!(typeof window._mvdAutoCuffEnabled!=="undefined"
    ? window._mvdAutoCuffEnabled : false),
autograbOn: !!(typeof window._mvdAutoGrabEnabled!=="undefined"
    ? window._mvdAutoGrabEnabled : true),
idInputValue:"",
idInputLabel:"Введите ID игрока",
idInputContext:null,
_idPrevScreen:null,
_debugInstanceId: Math.random().toString(36).slice(2,8),
}
},
computed:{
headerTitle(){
if(this.screen==="main")           return "KONST AHK";
if(this.screen==="povsednev")      return "ПОВСЕДНЕВНАЯ";
if(this.screen==="id-input")       return "ВВОД ID";
return "";
},
headerSubtitle(){
if(this.screen==="main")           return "";
if(this.screen==="povsednev")      return "ПОВСЕДНЕВНАЯ";
if(this.screen==="id-input")       return "ВВОД ID";
return "";
},
mainMenuItems(){
const items=[];
items.push({id:"povsednev", label:"Повседневная", arrow:true});
items.push({id:"autocuff", label:"Auto-cuff", toggleOn:this.autocuffOn});
if(typeof window.AUTO_GRAB!=="undefined"&&window.AUTO_GRAB===true){
items.push({id:"autograb", label:"Авто-снаряжение", toggleOn:this.autograbOn});
}
items.push({id:"laws", label:"Законы", arrow:true});
items.push({id:"doklady", label:"Доклады", arrow:true});
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
currentListItems(){
if(this.screen==="main")      return this.mainMenuItems;
if(this.screen==="povsednev") return this.filteredOptions;
return [];
},
footerConfirmText(){
return this.screen==="id-input" ? "Подтвердить" : "Выбрать";
},
footerBackText(){
if(this.screen==="main")     return "Закрыть";
if(this.screen==="id-input") return "Отмена";
return "Назад";
},
footerConfirmDisabled(){
if(this.screen==="id-input") return false;
return this.currentListItems.length===0;
},
},
watch:{
screen(){ this.selectedIndex=0; },
search(){ this.selectedIndex=0; },
},
methods:{
moveSelection(delta){
const items=this.currentListItems;
if(!items.length) return;
const len=items.length;
this.selectedIndex=((this.selectedIndex+delta)%len+len)%len;
this.$nextTick(()=>this._scrollSelectedIntoView());
},
_scrollSelectedIntoView(){
const list=this.$el.querySelector(".mvdmenu__list");
if(!list) return;
const sel=list.querySelector(".mvdmenu__item_selected");
if(!sel) return;
const itemHeight=sel.offsetHeight;
if(!itemHeight) return;
const buffer=2;
const maxScroll=Math.max(list.scrollHeight-list.clientHeight,0);
let target=itemHeight*(this.selectedIndex-buffer);
if(target<0) target=0;
if(target>maxScroll) target=maxScroll;
list.scrollTop=target;
},
confirmSelected(){
const items=this.currentListItems;
if(!items.length) return;
const idx=Math.min(Math.max(this.selectedIndex,0),items.length-1);
const item=items[idx];
if(this.screen==="main") this.selectMain(item);
else if(this.screen==="povsednev") this.selectOption(item);
},
footerConfirm(){
if(this.screen==="id-input") this.confirmIdInput();
else this.confirmSelected();
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
} else if(this.screen==="main"){
this.close();
}
},
selectMain(item){
if(item.id==="povsednev"){
this.screen="povsednev";
} else if(item.id==="autocuff"){
this.autocuffOn=!this.autocuffOn;
if(typeof window._mvdToggleAutoCuff==="function") window._mvdToggleAutoCuff();
} else if(item.id==="autograb"){
this.autograbOn=!this.autograbOn;
if(typeof window._mvdToggleAutoGrab==="function") window._mvdToggleAutoGrab();
} else if(item.id==="laws"){
window._duranOpenMode="laws";
this.close();
setTimeout(()=>{
window.openInterface("Zkm");
},80);
} else if(item.id==="doklady"){
this.close();
setTimeout(()=>{
window.openInterface("Dokladi");
},80);
}
},
_syncToggleState(){
this.autocuffOn = !!(typeof window._mvdAutoCuffEnabled!=="undefined"
    ? window._mvdAutoCuffEnabled : false);
this.autograbOn = !!(typeof window._mvdAutoGrabEnabled!=="undefined"
    ? window._mvdAutoGrabEnabled : true);
},
optNeedsId(opt){
return opt.needsId && !(opt.action==="greeting" && window._mvdSkinId===15340);
},
selectOption(opt){
const id=this.targetId;
if(this.optNeedsId(opt)){
if(this.targetId!==null&&this.targetId!==-1){
const id=this.targetId;
this.close();
setTimeout(()=>{
window._mvdMenuPendingAction=opt.action;
if(typeof window._mvdExecuteAction==="function")
window._mvdExecuteAction(opt.action,id);
},80);
} else {
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
},
hideCursor(){
const ae=document.activeElement;
if(ae&&this.$el&&this.$el.contains(ae)&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA')){
this._blurredInput=ae;
ae.blur();
} else {
this._blurredInput=null;
}
window.setCursorStatus('MvdMenu',false);
},
showCursor(){
window.setCursorStatus('MvdMenu',true);
if(!window.App?.developmentMode) window.setDrawLabelStatus(true);
const el=this._blurredInput;
this._blurredInput=null;
if(el){
this.$nextTick(()=>{
if(el.isConnected)el.focus();
});
}
}
},
created(){this.$data.noAdaptation=true},
mounted(){
const s=document.createElement("style");
s.id="mvdmenu-style";
s.textContent=`
/* ═══════════════════════════════════════════════════════════════
   ДИЗАЙН ТЕЛЕФОНА — ОДИН В ОДИН ИЗ Phone.js / Phone.css
   ═══════════════════════════════════════════════════════════════ */
.phone{align-items:center;display:flex;height:100%;justify-content:center;pointer-events:none;width:100%;--phone-width:31.11vh;--phone-height:62.2vh;--phone-bottom-margin:12vh}
.phone__body-wrapper{pointer-events:none;transform-origin:right bottom}
.phone__body{background:url(./body-bg.png) 50%/100% 100% no-repeat;border-radius:2.22vh;display:flex;flex-direction:column;height:var(--phone-height);padding:0.47vh;pointer-events:auto;position:relative;transform:translateX(calc(37.6vw - var(--phone-width)/2));transition:width 0.25s ease,height 0.25s ease,transform 0.25s ease;width:var(--phone-width);z-index:99999999}
.phone__body-border{pointer-events:none;position:absolute}
.phone__body-border_outer{border:0.09vh solid #eeeee633;border-radius:2.22vh;bottom:0;left:0;right:0;top:0}
.phone__body-border_middle{border:0.19vh solid #eeeee64d;border-radius:2.13vh;bottom:0.09vh;left:0.09vh;right:0.09vh;top:0.09vh}
.phone__body-border_inner{border:0.19vh solid #eeeee61a;border-radius:1.94vh;bottom:0.28vh;left:0.28vh;right:0.28vh;top:0.28vh}
.phone__body-decor-button{background:linear-gradient(135deg,#292524,#0c0a09);border-left:0.09vh solid #eeeee666;border-radius:2.22vh 0 0 2.22vh;height:2.96vh;left:-0.37vh;opacity:0.96;position:absolute;top:19.07vh;width:0.37vh}
.phone__body-decor-button_top{top:15.37vh}
.phone__body-decor-button_right{height:6.67vh;left:auto!important;right:-0.37vh;transform:scaleX(-1)}
.phone__screen-wrapper{background:#1c1917;border:0.09vh solid #eeeee60d;border-radius:1.48vh;flex:1 1;margin:0 0.28vh 0.38vh 0.28vh;overflow:hidden;position:relative}
.phone__header{align-items:center;display:flex;justify-content:space-between;padding:0.93vh;position:relative}
.phone__header-buttons{align-items:center;display:flex;justify-content:flex-start}
.phone__header-info{align-items:center;bottom:0;display:flex;flex:1 1;justify-content:flex-end;left:0;padding-right:3.71vh;pointer-events:none;position:absolute;right:0;top:0}
.phone__app-name{align-items:center;color:#eeeee6;display:flex;font-family:Open Sans;font-size:1.3vh;font-weight:700;justify-content:center}
.phone__close-control{cursor:pointer;color:#eeeee699;font-size:1.48vh;font-weight:700;cursor:pointer;padding:0.37vh;transition:color 0.2s ease}
.phone__close-control:hover{color:#e25544}
.phone__screen{border-radius:1.57vh;height:100%;position:relative}
.phone__content{display:flex;height:100%;justify-content:center;position:relative;width:100%}

/* ═══════════════════════════════════════════════════════════════
   СОДЕРЖИМОЕ MVD MENU ВНУТРИ ТЕЛЕФОНА
   ═══════════════════════════════════════════════════════════════ */
.mvdmenu-phone-content{align-items:center;display:flex;flex-direction:column;height:100%;justify-content:center;overflow:hidden;position:relative;width:100%;background:transparent}
.mvdmenu__pattern{position:absolute;top:0;left:0;width:100%;overflow:hidden;pointer-events:none;z-index:0}
.mvdmenu__header{display:none}
.mvdmenu__list{display:flex;flex-direction:column;max-height:36vh;overflow-y:auto;position:relative;z-index:1;width:90%}
.mvdmenu__list::-webkit-scrollbar{width:1.11vh}
.mvdmenu__list::-webkit-scrollbar-thumb{background:linear-gradient(0deg,#bcbcbd,#fff 75%);border-radius:0.19vh}
.mvdmenu__list::-webkit-scrollbar-track{background:#ffffff1a;border-radius:0.19vh}
.mvdmenu__item{align-items:center;border-bottom:0.09vh solid #f4f1e10d;cursor:pointer;display:flex;gap:1.11vh;padding:0.93vh 1.48vh;transition:background 0.1s ease}
.mvdmenu__item:hover{background:rgba(255,255,255,.04)}
.mvdmenu__item_toggle_on{border-left:0.19vh solid rgba(61,186,122,.5)}
.mvdmenu__item_toggle_off{border-left:0.19vh solid rgba(224,85,85,.3)}
.mvdmenu__item_selected{background:rgba(249,183,1,.1);border-left:0.19vh solid #f9b701}
.mvdmenu__item_selected .mvdmenu__item-label{color:#f4f1e1}
.mvdmenu__item-num{color:#f4f1e166;flex-shrink:0;font-size:1.11vh;font-weight:700;min-width:2.4vh}
.mvdmenu__item-label{color:#f4f1e1cc;flex:1 1 auto;font-size:1.3vh;font-weight:600;line-height:1.4}
.mvdmenu__item-tag{border-radius:0.22vh;flex-shrink:0;font-size:1.0vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.5vh}
.mvdmenu__item-id-badge{background:rgba(249,183,1,.1);border-radius:0.22vh;color:rgba(249,183,1,.7);flex-shrink:0;font-size:0.93vh;font-weight:700;letter-spacing:0.04vh;padding:0.15vh 0.46vh}
.mvdmenu__item-arrow{align-items:center;display:flex;flex-shrink:0;opacity:0.5}
.mvdmenu__item-arrow svg{height:1.11vh;width:1.11vh}
.mvdmenu__item-status{border-radius:0.22vh;flex-shrink:0;font-size:0.93vh;font-weight:700;padding:0.15vh 0.56vh}
.mvdmenu__item-status_on{background:rgba(61,186,122,.15);color:rgba(61,186,122,1)}
.mvdmenu__item-status_off{background:rgba(224,85,85,.12);color:rgba(224,85,85,0.9)}
.mvdmenu__search{align-items:center;background:#ffffff05;border-bottom:0.19vh solid #f4f1e11a;display:flex;gap:0.93vh;padding:0.93vh 1.67vh;position:relative;z-index:1;width:90%;box-sizing:border-box}
.mvdmenu__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.48vh;justify-content:center;width:1.48vh}
.mvdmenu__search-icon svg{height:100%;width:100%}
.mvdmenu__search input{-webkit-appearance:none;background:transparent;border:none;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none}
.mvdmenu__search input::placeholder{color:#f4f1e166;font-weight:400}
.mvdmenu__empty{color:#f4f1e166;font-size:1.3vh;font-style:italic;padding:2.22vh;text-align:center}
.mvdmenu__id-input-wrap{display:flex;flex-direction:column;gap:1.3vh;padding:2vh 1.85vh 1.85vh;position:relative;z-index:1;width:90%;box-sizing:border-box}
.mvdmenu__id-input-label{color:#f4f1e1cc;font-size:1.3vh;font-weight:600;line-height:1.4}
.mvdmenu__id-input-row{display:flex;gap:0.74vh}
.mvdmenu__id-input-field{-webkit-appearance:none;appearance:none;background:#ffffff08;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e1;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;font-weight:600;outline:none;padding:0.74vh 1.11vh;transition:border-color 0.15s}
.mvdmenu__id-input-field:focus{border-color:rgba(249,183,1,0.5)}
.mvdmenu__id-input-field::placeholder{color:#f4f1e144;font-weight:400}
.mvdmenu__id-input-field::-webkit-inner-spin-button,.mvdmenu__id-input-field::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.mvdmenu__footer{align-items:center;border-top:0.19vh solid #f4f1e11a;display:flex;padding:1.2vh 1.67vh;position:relative;z-index:1;width:90%;box-sizing:border-box}
.mvdmenu__footer .controls-button__container{margin-right:1.48vh}
.mvdmenu__footer .controls-button__container:last-child{margin-right:0}
.mvdmenu_hidden{display:none!important}
.mvdmenu__wrapper_dragging,.mvdmenu__wrapper_dragging *{cursor:grabbing!important}
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
// Прямой вызов конкретного действия «Повседневной»
const _directAction=window._mvdMenuDirectAction;
window._mvdMenuDirectAction=null;
if(_directAction){
const _opt=POVSEDNEV_OPTIONS.find(o=>o.action===_directAction);
if(_opt){
if(this.targetId!==null&&this.targetId!==-1){
const id=this.targetId;
this.close();
setTimeout(()=>{
window._mvdMenuPendingAction=_opt.action;
if(typeof window._mvdExecuteAction==="function")
window._mvdExecuteAction(_opt.action,id);
},80);
} else {
this.idInputLabel="Введите ID игрока";
this.idInputValue="";
this.idInputContext="action";
this._idPrevScreen="povsednev";
this._pendingOpt=_opt;
this.screen="id-input";
this.$nextTick(()=>{ const f=document.getElementById("mvdmenu-id-field");if(f)f.focus(); });
}
}
}
this._syncToggleState();
this._onArrowKeyDown=(e)=>{
if(this.screen!=="main"&&this.screen!=="povsednev") return;
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
// ── Alt-key state ──
this._menuHidden=false;
this._altHoldTimer=null;
this._altHoldFired=false;
this._blurredInput=null;
const _MVDMENU_ALT_HOLD_MS=500;
this._prevOnKeyUp=window.onKeyUp;
this._prevOnKeyDown=window.onKeyDown;
window.onKeyDown=(e)=>{
if(e===window.KEY_CODE_ALT){
if(!this._altHoldTimer&&!this._altHoldFired){
this._altHoldTimer=setTimeout(()=>{
this._altHoldTimer=null;
this._altHoldFired=true;
this._menuHidden=!this._menuHidden;
if(this._menuHidden){
this.$el.classList.add('mvdmenu_hidden');
this.hideCursor();
} else {
this.$el.classList.remove('mvdmenu_hidden');
this.showCursor();
}
},_MVDMENU_ALT_HOLD_MS);
}
return;
}
if(typeof this._prevOnKeyDown==="function")this._prevOnKeyDown(e)
}
window.onKeyUp=(e)=>{
if(e===window.KEY_CODE_ALT){
if(this._altHoldTimer){
clearTimeout(this._altHoldTimer);
this._altHoldTimer=null;
if(!this._menuHidden){
const _curActive=window.isCursorActive('MvdMenu');
if(_curActive){
this.hideCursor();
} else {
this.showCursor();
}
}
}
this._altHoldFired=false;
return;
}
if(typeof this._prevOnKeyUp==="function")this._prevOnKeyUp(e)
}
},
unmounted(){
document.removeEventListener("keydown",this._onArrowKeyDown,false);
window.onKeyUp=this._prevOnKeyUp;
window.onKeyDown=this._prevOnKeyDown;
if(this._altHoldTimer)clearTimeout(this._altHoldTimer);
const s=document.getElementById("mvdmenu-style");
if(s)s.remove();
}
};
const MvdMenu=_export_sfc(_sfc_main,[["render",render]]);
export{MvdMenu as default};
