import{r as resolveComponent,o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,t as toDisplayString,f as createCommentVNode,g as createBlock,_ as _export_sfc}from"./index.js";

// Scope-атрибуты Phone.css — без них готовый CSS не применится
const V_PHONE="data-v-ebd754be";   // .phone, .phone__*
const V_CF="data-v-6929b3bf";      // .create-family-main*
const V_INPUT="data-v-8461b34f";   // .family-input*
const V_BTN="data-v-5b843504";     // .phone-button*
const V_ACT="data-v-c2b827a9";     // .phone-action-button*
const V_CHECK="data-v-3af4c368";   // .phone-check*

const SVG_CHECK=`<svg viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.77 8.9a.6.6 0 0 1-.85 0L1.6 6.58a.6.6 0 1 1 .85-.85l1.9 1.9 4.6-4.6a.6.6 0 1 1 .85.85L4.77 8.9Z"/></svg>`;
const SVG_CROSS=`<svg viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.6 3.25a.6.6 0 0 0-.85-.85L6 5.15 3.25 2.4a.6.6 0 0 0-.85.85L5.15 6 2.4 8.75a.6.6 0 1 0 .85.85L6 6.85l2.75 2.75a.6.6 0 0 0 .85-.85L6.85 6l2.75-2.75Z"/></svg>`;
const SVG_ARROW=`<svg viewBox="0 0 8 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M1.4 0.6 6.2 5 1.4 9.4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
const SVG_SHIELD=`<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 4 4 1.5v3.2c0 2.6-1.7 4.9-4 5.8-2.3-.9-4-3.2-4-5.8V7.5L12 6Z"/></svg>`;
const SVG_PROPS=`<svg viewBox="0 0 13 13" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect y="2" width="13" height="1.6" rx=".8"/><rect y="5.7" width="13" height="1.6" rx=".8"/><rect y="9.4" width="13" height="1.6" rx=".8"/><circle cx="4" cy="2.8" r="1.7" fill="#1c1917"/><circle cx="9" cy="6.5" r="1.7" fill="#1c1917"/><circle cx="6" cy="10.2" r="1.7" fill="#1c1917"/></svg>`;
const SVG_BACK=`<svg viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 4h7M7 4 4.2 1M7 4 4.2 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

const POVSEDNEV_OPTIONS=[
{action:"greeting",      label:"Приветствие",          needsId:true},
{action:"checkDocuments",label:"Проверка документов",  needsId:false},
];

// ─── helpers ───
const el=(tag,props,children)=>createBaseVNode(tag,props,children);
const scope=(...ids)=>{const p={};ids.forEach(i=>p[i]="");return p;};
const btn=(text,onClick,black)=>el("button",{
  class:normalizeClass(["phone-button","create-family-main__button",black?"black":""]),
  onClick,...scope(V_BTN,V_CF)},[text]);
const validation=(label,icon,status,statusCls,onClick)=>el("div",{
  class:normalizeClass(["create-family-main__validation",statusCls]),
  onClick,...scope(V_CF)},[
  el("div",{class:"create-family-main__validation-name",...scope(V_CF)},[
    el("span",{innerHTML:icon,style:"display:flex;height:1.204vh;width:1.204vh;margin-right:0.556vh"}),
    label]),
  el("div",{class:normalizeClass(["create-family-main__validation-status",statusCls||""]),...scope(V_CF)},[status])]);
const familyInput=(value,onInput,placeholder,number)=>el("div",{class:"family-input",...scope(V_INPUT)},[
  el("div",{class:"family-input__container",...scope(V_INPUT)},[
    el("div",{class:"family-input__inside-border",...scope(V_INPUT)}),
    value?createCommentVNode("",true):el("div",{class:"family-input__placeholder",...scope(V_INPUT)},placeholder),
    el("input",{class:"family-input__input",type:number?"number":"text",value,onInput,...scope(V_INPUT)},null,40,["value","onInput"])])]);

function render(_ctx,_cache,$props,$setup,$data,$options){
return (openBlock(),createElementBlock("div",{class:"phone phone_tablet",...scope(V_PHONE)},[
 el("div",{class:"phone__body-wrapper",...scope(V_PHONE)},[
  el("div",{class:"phone__body",...scope(V_PHONE)},[
   el("div",{class:"phone__body-border phone__body-border_outer",...scope(V_PHONE)}),
   el("div",{class:"phone__body-border phone__body-border_middle",...scope(V_PHONE)}),
   el("div",{class:"phone__body-border phone__body-border_inner",...scope(V_PHONE)}),
   el("div",{class:"phone__body-decor-button",...scope(V_PHONE)}),
   el("div",{class:"phone__body-decor-button phone__body-decor-button_top",...scope(V_PHONE)}),
   el("div",{class:"phone__body-decor-button phone__body-decor-button_right",...scope(V_PHONE)}),
   el("div",{class:"phone__screen-wrapper",...scope(V_PHONE)},[
    // ── Шапка (как в Phone tablet) ──
    el("div",{class:"phone__header",...scope(V_PHONE)},[
     el("div",{class:"phone__header-buttons",...scope(V_PHONE)},[
      el("div",{class:"phone-action-button phone-action-button_with-text phone-action-button_hover-red",onClick:$options.onBackClick,...scope(V_ACT)},[
       el("div",{class:"phone-action-button__icon",...scope(V_ACT)},[
        el("div",{class:"phone-action-button__icon-wrapper",innerHTML:SVG_BACK,...scope(V_ACT)})]),
       el("div",{class:"phone-action-button__text",...scope(V_ACT)},$options.backText)])]),
     el("div",{class:"phone__header-info",...scope(V_PHONE)},[
      el("div",{class:"phone__date",...scope(V_PHONE)},[
       $data.nowTime,
       el("span",null,$data.nowDate)]),
      el("div",{class:"phone__app-name",...scope(V_PHONE)},[
       el("div",{class:"phone__app-name-divider",...scope(V_PHONE)}),
       $options.appName])]),
     el("div",{class:"phone__toggle-properties",onClick:$event=>{$data.showProperties=!$data.showProperties},...scope(V_PHONE)},[
      el("span",{class:"phone__toggle-properties-icon",innerHTML:SVG_PROPS,...scope(V_PHONE)})])]),
    // ── Свойства (звук) ──
    $data.showProperties?(openBlock(),createElementBlock("div",{key:0,class:"phone__properties",...scope(V_PHONE)},[
     el("div",{class:"phone__property phone__property_silent",onClick:$event=>{$data.silent=!$data.silent},...scope(V_PHONE)},[
      el("div",{class:"phone__property-title",...scope(V_PHONE)},"беззвучный режим"),
      el("div",{class:normalizeClass(["phone-check",{"phone-check_active":$data.silent}]),...scope(V_CHECK)},[
       el("div",{class:"phone-check__icon",...scope(V_CHECK)})])])])):createCommentVNode("",true),
    // ── Экран ──
    el("div",{class:"phone__screen",...scope(V_PHONE)},[
     el("div",{class:"phone__content",...scope(V_PHONE)},[

      // ══ MAIN ══
      $data.screen==="main"?(openBlock(),createElementBlock("div",{key:"main",class:"create-family-main",...scope(V_CF)},[
       el("div",{class:"create-family-main__logo",innerHTML:SVG_SHIELD,style:"color:#eeeee6",...scope(V_CF)}),
       el("div",{class:"create-family-main__title",...scope(V_CF)},"МЕНЮ ФСИН"),
       el("div",{class:"create-family-main__description",...scope(V_CF)},"Повседневные действия, авто-функции, законы и доклады сотрудника ФСИН."),
       el("div",{class:"create-family-main__validations",...scope(V_CF)},
        (openBlock(true),createElementBlock(Fragment,null,renderList($options.mainMenuItems,(item)=>
         validation(item.label,
          item.toggleOn===false?SVG_CROSS:SVG_CHECK,
          item.toggleOn!==undefined?(item.toggleOn?"Вкл":"Выкл"):"Открыть",
          item.toggleOn===false?"":"create-family-main__validation_is-valid",
          $event=>$options.selectMain(item))),128))),
       el("div",{class:"create-family-main__buttons",...scope(V_CF)},[
        el("div",{class:"create-family-main__button-wrapper",...scope(V_CF)},[btn("ЗАКРЫТЬ",$options.close,true)]),
        el("div",{class:"create-family-main__button-wrapper",...scope(V_CF)},[btn("ПОВСЕДНЕВНАЯ",$event=>$options.selectMain({id:"povsednev"}),false)])])])):createCommentVNode("",true),

      // ══ POVSEDNEV ══
      $data.screen==="povsednev"?(openBlock(),createElementBlock("div",{key:"povsednev",class:"create-family-main",...scope(V_CF)},[
       el("div",{class:"create-family-main__title",...scope(V_CF)},"ПОВСЕДНЕВНАЯ"),
       familyInput($data.search,$event=>{$data.search=$event.target.value},"Поиск действия...",false),
       el("div",{class:"create-family-main__validations",...scope(V_CF)},
        (openBlock(true),createElementBlock(Fragment,null,renderList($options.filteredOptions,(opt)=>
         validation(opt.label,SVG_CHECK,$options.optNeedsId(opt)?"ID":"Выполнить","create-family-main__validation_is-valid",
          $event=>$options.selectOption(opt))),128)),
        $options.filteredOptions.length===0?el("div",{class:"create-family-main__description",...scope(V_CF)},"Ничего не найдено"):createCommentVNode("",true)),
       el("div",{class:"create-family-main__buttons",...scope(V_CF)},[
        el("div",{class:"create-family-main__button-wrapper",...scope(V_CF)},[btn("НАЗАД",$options.goBack,true)]),
        el("div",{class:"create-family-main__button-wrapper",...scope(V_CF)},[btn("ВЫПОЛНИТЬ",$options.confirmSelected,false)])])])):createCommentVNode("",true),

      // ══ ID INPUT ══
      $data.screen==="id-input"?(openBlock(),createElementBlock("div",{key:"id-input",class:"create-family-main",...scope(V_CF)},[
       el("div",{class:"create-family-main__title",...scope(V_CF)},"ВВОД ID"),
       el("div",{class:"create-family-main__description",...scope(V_CF)},$data.idInputLabel||"Введите ID игрока"),
       familyInput($data.idInputValue,$event=>{$data.idInputValue=$event.target.value},"ID игрока...",true),
       el("div",{class:"create-family-main__buttons",...scope(V_CF)},[
        el("div",{class:"create-family-main__button-wrapper",...scope(V_CF)},[btn("ОТМЕНА",$options.goBack,true)]),
        el("div",{class:"create-family-main__button-wrapper",...scope(V_CF)},[btn("ПОДТВЕРДИТЬ",$options.confirmIdInput,false)])])])):createCommentVNode("",true),

     ])])])])])])])));
}

const _sfc_main={
name:"MvdMenu",
data(){return{
 screen:"main",search:"",targetId:null,selectedIndex:0,
 autocuffOn:!!(typeof window._mvdAutoCuffEnabled!=="undefined"?window._mvdAutoCuffEnabled:false),
 autograbOn:!!(typeof window._mvdAutoGrabEnabled!=="undefined"?window._mvdAutoGrabEnabled:true),
 idInputValue:"",idInputLabel:"",showProperties:false,silent:false,
 nowTime:"00:00",nowDate:"",
}},
computed:{
 appName(){return this.screen==="main"?"ФСИН":this.screen==="povsednev"?"Повседневная":"Ввод ID";},
 backText(){return this.screen==="main"?"Закрыть":"Назад";},
 mainMenuItems(){
  const it=[{id:"povsednev",label:"Повседневная"},
   {id:"autocuff",label:"Auto-cuff",toggleOn:this.autocuffOn}];
  if(typeof window.AUTO_GRAB!=="undefined"&&window.AUTO_GRAB===true)
   it.push({id:"autograb",label:"Авто-снаряжение",toggleOn:this.autograbOn});
  it.push({id:"laws",label:"Законы"},{id:"doklady",label:"Доклады"});
  return it;},
 visibleOptions(){
  let o=[...POVSEDNEV_OPTIONS];
  const hid=(typeof window.MENU_HIDDEN_ITEMS!=="undefined"&&Array.isArray(window.MENU_HIDDEN_ITEMS))?window.MENU_HIDDEN_ITEMS:[];
  if(hid.length)o=o.filter(x=>!hid.includes(x.action));
  const ord=(typeof window.MENU_ORDER!=="undefined"&&Array.isArray(window.MENU_ORDER)&&window.MENU_ORDER.length)?window.MENU_ORDER:[];
  if(ord.length){const r=[];ord.forEach(a=>{const f=o.find(x=>x.action===a);if(f)r.push(f);});o.forEach(x=>{if(!r.find(y=>y.action===x.action))r.push(x);});o=r;}
  return o;},
 filteredOptions(){
  const q=this.search.trim().toLowerCase();
  return q?this.visibleOptions.filter(o=>o.label.toLowerCase().includes(q)):this.visibleOptions;},
},
methods:{
 updateClock(){const d=new Date();const M=["ЯНВАРЯ","ФЕВРАЛЯ","МАРТА","АПРЕЛЯ","МАЯ","ИЮНЯ","ИЮЛЯ","АВГУСТА","СЕНТЯБРЯ","ОКТЯБРЯ","НОЯБРЯ","ДЕКАБРЯ"];
  this.nowTime=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
  this.nowDate=d.getDate()+" "+M[d.getMonth()];},
 onBackClick(){this.goBack();},
 goBack(){
  if(this.screen==="id-input"){this.screen=this._idPrevScreen||"povsednev";this.idInputValue="";}
  else if(this.screen==="povsednev"){this.screen="main";this.search="";}
  else this.close();},
 selectMain(item){
  if(item.id==="povsednev")this.screen="povsednev";
  else if(item.id==="autocuff"){this.autocuffOn=!this.autocuffOn;if(typeof window._mvdToggleAutoCuff==="function")window._mvdToggleAutoCuff();}
  else if(item.id==="autograb"){this.autograbOn=!this.autograbOn;if(typeof window._mvdToggleAutoGrab==="function")window._mvdToggleAutoGrab();}
  else if(item.id==="laws"){window._duranOpenMode="laws";this.close();setTimeout(()=>window.openInterface("Zkm"),80);}
  else if(item.id==="doklady"){this.close();setTimeout(()=>window.openInterface("Dokladi"),80);}},
 optNeedsId(o){return o.needsId&&!(o.action==="greeting"&&window._mvdSkinId===15340);},
 selectOption(o){
  if(this.optNeedsId(o)){
   if(this.targetId!==null&&this.targetId!==-1){const id=this.targetId;this.close();
    setTimeout(()=>{window._mvdMenuPendingAction=o.action;if(typeof window._mvdExecuteAction==="function")window._mvdExecuteAction(o.action,id);},80);}
   else{this.idInputLabel="Введите ID игрока";this.idInputValue="";this._idPrevScreen="povsednev";this._pendingOpt=o;this.screen="id-input";}
  }else{this.close();setTimeout(()=>{if(typeof window._mvdExecuteAction==="function")window._mvdExecuteAction(o.action,this.targetId);},80);}},
 confirmSelected(){
  const l=this.screen==="main"?this.mainMenuItems:this.filteredOptions;
  if(!l.length)return;
  const it=l[Math.min(this.selectedIndex,l.length-1)];
  this.screen==="main"?this.selectMain(it):this.selectOption(it);},
 confirmIdInput(){
  const id=parseInt(String(this.idInputValue||"").trim(),10);
  const o=this._pendingOpt;
  if(o&&id>0){this.targetId=id;this.close();
   setTimeout(()=>{window._mvdMenuPendingAction=o.action;if(typeof window._mvdExecuteAction==="function")window._mvdExecuteAction(o.action,id);},80);}
  else this.goBack();},
 close(){window.closeInterface("MvdMenu");},
},
mounted(){
 // Phone.css лежит в той же папке — подключаем, если ещё не загружен
 if(!document.querySelector('link[data-mvd-phone-css]')){
  const l=document.createElement("link");
  l.rel="stylesheet";l.dataset.mvdPhoneCss="1";
  l.href=new URL("Phone.css",import.meta.url).href;
  document.head.appendChild(l);}
 this.updateClock();this._clock=setInterval(()=>this.updateClock(),1000);
 this.targetId=(typeof window._mvdMenuTargetId!=="undefined"&&window._mvdMenuTargetId!==null)?window._mvdMenuTargetId:null;
 window._mvdMenuTargetId=null;
 if(window._mvdMenuStartScreen==="povsednev")this.screen="povsednev";
 else if(window._mvdMenuStartScreen==="main")this.screen="main";
 window._mvdMenuStartScreen=null;
 const da=window._mvdMenuDirectAction;window._mvdMenuDirectAction=null;
 if(da){const o=POVSEDNEV_OPTIONS.find(x=>x.action===da);
  if(o){if(this.targetId!==null&&this.targetId!==-1){const id=this.targetId;this.close();
    setTimeout(()=>{window._mvdMenuPendingAction=o.action;if(typeof window._mvdExecuteAction==="function")window._mvdExecuteAction(o.action,id);},80);}
   else{this.idInputLabel="Введите ID игрока";this._idPrevScreen="povsednev";this._pendingOpt=o;this.screen="id-input";}}}
 this._onKey=(e)=>{
  if(e.keyCode===window.KEY_CODE_ARROW_TOP){e.preventDefault();this.selectedIndex=Math.max(0,this.selectedIndex-1);}
  else if(e.keyCode===window.KEY_CODE_ARROW_BOTTOM){e.preventDefault();this.selectedIndex++;}
  else if(e.keyCode===window.KEY_CODE_ENTER){this.screen==="id-input"?this.confirmIdInput():this.confirmSelected();}
  else if(e.keyCode===window.KEY_CODE_ESC){this.goBack();}};
 document.addEventListener("keydown",this._onKey,false);
 if(!window.App?.developmentMode)window.setDrawLabelStatus(true);
 window.setCursorStatus("MvdMenu",true);
},
unmounted(){clearInterval(this._clock);document.removeEventListener("keydown",this._onKey,false);},
};
const MvdMenu=_export_sfc(_sfc_main,[["render",render]]);
export{MvdMenu as default};
