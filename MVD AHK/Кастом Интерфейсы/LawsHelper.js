import{r as resolveComponent,o as openBlock,c as createElementBlock,b as createVNode,a as createBaseVNode,F as Fragment,h as renderList,n as normalizeClass,e as createTextVNode,t as toDisplayString,f as createCommentVNode,w as withCtx,T as Transition,_ as _export_sfc}from"./index.js";

const _hoisted_1={class:"laws-helper iface-container"};
const _hoisted_2={class:"laws-helper__header"};
const _hoisted_3={class:"laws-helper__title"};
const _hoisted_4={class:"laws-helper__title-version"};
const _hoisted_5={class:"laws-helper__header-right"};
const _hoisted_6={class:"laws-helper__tabs"};
const _hoisted_7={class:"laws-helper__search"};
const _hoisted_8={class:"laws-helper__body"};

const SVG_SEARCH=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5.5" r="4" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/><line x1="8.5" y1="8.5" x2="13" y2="13" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SVG_STAR=`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3l3.09 6.26L26 10.27l-5 4.87 1.18 6.88L16 18.77l-6.18 3.25L11 15.14 6 10.27l6.91-1.01L16 3z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/></svg>`;
const SVG_BURGER=`<svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/><rect y="4.25" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/><rect y="8.5" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.6)"/></svg>`;
const SVG_CHECK=`<svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4l3 3 5-6" stroke="#1c1c1e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_RECEIPT=`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="2" width="20" height="24" rx="2" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/><line x1="8" y1="8" x2="20" y2="8" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/><line x1="8" y1="12" x2="20" y2="12" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/><line x1="8" y1="16" x2="16" y2="16" stroke="rgba(255,255,255,0.3)" stroke-width="1.2"/><line x1="8" y1="20" x2="14" y2="20" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/></svg>`;
const SVG_BACK=`<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L4 7l5 5" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ── SVG-иконки для пунктов меню (вместо эмодзи) ──────────────────
const ICONS={
	cop:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><rect x="5" y="1" width="6" height="1.5" rx="0.75" fill="currentColor"/></svg>`,
	helmet:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9C3 5.686 5.239 3 8 3s5 2.686 5 6v1H3V9z" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="10" width="12" height="2" rx="1" fill="currentColor"/></svg>`,
	radar:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="2" fill="currentColor"/><path d="M5 8a3 3 0 0 1 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M3 8a5 5 0 0 1 5-5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M11 8a3 3 0 0 1-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M13 8a5 5 0 0 1-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	cuff:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="8" r="2.5" stroke="currentColor" stroke-width="1.3"/><circle cx="11" cy="8" r="2.5" stroke="currentColor" stroke-width="1.3"/><line x1="7.5" y1="8" x2="8.5" y2="8" stroke="currentColor" stroke-width="1.3"/></svg>`,
	partner:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="5" r="2" stroke="currentColor" stroke-width="1.2"/><circle cx="10.5" cy="5" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M1 13c0-2.5 2-4 4.5-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M15 13c0-2.5-2-4-4.5-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M8 13c0-2.5 1-3.5 2.5-3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	wave:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8c1-2 2-2 3 0s2 2 3 0 2-2 3 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4 5l1.5 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	doc:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="1" width="10" height="14" rx="1.5" stroke="currentColor" stroke-width="1.3"/><line x1="6" y1="5" x2="10" y2="5" stroke="currentColor" stroke-width="1.2"/><line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" stroke-width="1.2"/><line x1="6" y1="11" x2="9" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>`,
	search_doc:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.3"/><line x1="13.8" y1="13.8" x2="15.5" y2="15.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	tablet:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="1" width="10" height="14" rx="2" stroke="currentColor" stroke-width="1.3"/><rect x="6" y="12" width="4" height="1" rx="0.5" fill="currentColor"/></svg>`,
	car:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9l1.5-4h9L14 9v3H2V9z" stroke="currentColor" stroke-width="1.3"/><circle cx="4.5" cy="12.5" r="1.2" stroke="currentColor" stroke-width="1.1"/><circle cx="11.5" cy="12.5" r="1.2" stroke="currentColor" stroke-width="1.1"/></svg>`,
	building:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="12" height="11" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M6 15V10h4v5" stroke="currentColor" stroke-width="1.2"/><path d="M2 7h12" stroke="currentColor" stroke-width="1.1"/><rect x="1" y="2" width="14" height="2.5" rx="0.75" fill="currentColor" opacity="0.5"/></svg>`,
	unlock:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 7V5a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="11" r="1" fill="currentColor"/></svg>`,
	siren:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="9" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M3 9H1M15 9h-2M8 4V2M4.5 5.5L3 4M11.5 5.5L13 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	magnify:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.3"/><line x1="9.5" y1="9.5" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
	walk:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="2.5" r="1.5" fill="currentColor"/><path d="M8 4.5l-2 4 2 1 1 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M8 4.5l1.5 3.5-1.5 1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M6 8.5l-2 2M9.5 8l2 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	check_circle:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 8l2.5 2.5L11 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
	money:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8.5" r="2" stroke="currentColor" stroke-width="1.2"/><line x1="1" y1="6.5" x2="15" y2="6.5" stroke="currentColor" stroke-width="1.1"/><line x1="1" y1="10.5" x2="15" y2="10.5" stroke="currentColor" stroke-width="1.1"/></svg>`,
	star_badge:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>`,
	flask:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h4M7 2v4L4 12a1 1 0 0 0 .9 1.5h6.2A1 1 0 0 0 12 12L9 6V2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	window_break:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M2 8h5l2-3 2 5 2-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	mask:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v1.5C14 10 11.3 13 8 13S2 10 2 7.5V6z" stroke="currentColor" stroke-width="1.3"/><line x1="5" y1="9" x2="11" y2="9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	fingerprint:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 14C5 14 2 11.5 2 8c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5 8c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M7 8a1 1 0 0 1 2 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	license:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="5" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/><line x1="9" y1="6" x2="13" y2="6" stroke="currentColor" stroke-width="1.2"/><line x1="9" y1="9" x2="13" y2="9" stroke="currentColor" stroke-width="1.2"/></svg>`,
	scale:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" stroke-width="1.3"/><line x1="3" y1="5" x2="13" y2="5" stroke="currentColor" stroke-width="1.3"/><path d="M3 5l-2 4h4z" stroke="currentColor" stroke-width="1.1"/><path d="M13 5l-2 4h4z" stroke="currentColor" stroke-width="1.1"/><line x1="5" y1="14" x2="11" y2="14" stroke="currentColor" stroke-width="1.3"/></svg>`,
	announce:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6h2l6-3v10l-6-3H2V6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 6c1 .5 1.5 1.2 1.5 2S13 9.5 12 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	repeat:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6a5 5 0 0 1 10 0v.5M13 10a5 5 0 0 1-10 0v-.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M11 4l2 2-2 2M5 8l-2 2 2 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
	book:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 2h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.3"/><line x1="5" y1="5" x2="10" y2="5" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="8" x2="10" y2="8" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="11" x2="8" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>`,
	weights:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="6" width="4" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="11" y="6" width="4" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="8.5" x2="11" y2="8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
	target:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg>`,
	scroll:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a2 2 0 0 1 0-4h1V3a1 1 0 0 0-1-1z" stroke="currentColor" stroke-width="1.3"/><line x1="7" y1="5" x2="11" y2="5" stroke="currentColor" stroke-width="1.2"/><line x1="7" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.2"/></svg>`,
	rank:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2l1 3h3l-2.5 2 1 3L8 8.5 5.5 10l1-3L4 5h3z" stroke="currentColor" stroke-width="1.2"/><line x1="3" y1="13" x2="13" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="5" y1="11.5" x2="11" y2="11.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	flag_start:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="2" x2="4" y2="14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4 2h8l-2 3 2 3H4V2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
	trophy:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 2h6v5a3 3 0 0 1-6 0V2z" stroke="currentColor" stroke-width="1.3"/><path d="M2 3h3v3a1.5 1.5 0 0 1-3 0V3zM11 3h3v3a1.5 1.5 0 0 1-3 0V3z" stroke="currentColor" stroke-width="1.2"/><line x1="8" y1="10" x2="8" y2="13" stroke="currentColor" stroke-width="1.3"/><line x1="5" y1="13" x2="11" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
	arm:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12l2-5 2-1 4-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="12" cy="3" r="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M6 7l1 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	pushup:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="4" r="1.5" fill="currentColor"/><path d="M2 11l4-3 3 2 3-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="1" y1="13" x2="15" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
	run:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="3" r="1.5" fill="currentColor"/><path d="M10 4.5l-2 3-3 1.5M8 7.5l1 4M5 9l-2 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M10 5l3-1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
	karate:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="3" r="1.5" fill="currentColor"/><path d="M9 4.5L7 8l-3 2M9 4.5l3 2M7 8l1 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
	play:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 3l9 5-9 5V3z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
	eye:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 8c0-1 3-5 7-5s7 4 7 5-3 5-7 5S1 9 1 8z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2"/></svg>`,
	radio:`<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M5 6l4-4 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="10" r="1.5" stroke="currentColor" stroke-width="1.2"/><line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" stroke-width="1.1"/></svg>`,
};

// ── Данные меню /dahk ─────────────────────────────────────────────
const DAHK_MENU_MAIN=[
	{id:"povsednev", label:"Повседневная", iconKey:"cop"},
	{id:"stroy",     label:"Строй",        iconKey:"helmet"},
	{id:"tracking",  label:"Отслеживание", iconKey:"radar",   toggle:true},
	{id:"autocuff",  label:"Auto-cuff",    iconKey:"cuff",    toggle:true},
	{id:"naparnick", label:"Напарник",     iconKey:"partner"},
];
const DAHK_POVSEDNEV=[
	{id:"greeting",       label:"Приветствие",            iconKey:"wave",         needsId:true},
	{id:"checkDocuments", label:"Проверка документов",    iconKey:"doc"},
	{id:"studyDocuments", label:"Изучение документов",    iconKey:"search_doc"},
	{id:"scanningTablet", label:"Сканирование",           iconKey:"tablet"},
	{id:"cuffing",        label:"Надевание наручников",   iconKey:"cuff",         needsId:true},
	{id:"putInCar",       label:"Посадка в машину",       iconKey:"car",          needsId:true},
	{id:"arrest",         label:"Доставка в участок",     iconKey:"building",     needsId:true},
	{id:"uncuffing",      label:"Снятие наручников",      iconKey:"unlock",       needsId:true},
	{id:"chase",          label:"Преследование",          iconKey:"siren",        needsId:true},
	{id:"search",         label:"Обыск",                  iconKey:"magnify",      needsId:true},
	{id:"escort",         label:"Конвоирование",          iconKey:"walk",         needsId:true},
	{id:"clearWanted",    label:"Снятие розыска",         iconKey:"check_circle", needsId:true},
	{id:"fine",           label:"Штраф [/ticket]",        iconKey:"money",        special:"fine"},
	{id:"wantedFine",     label:"Розыск [/su]",           iconKey:"star_badge",   special:"wanted"},
	{id:"confiscate",     label:"Изъятие веществ",        iconKey:"flask",        needsId:true},
	{id:"breakGlass",     label:"Разбитие стекла",        iconKey:"window_break", needsId:true},
	{id:"removeMask",     label:"Снятие маски",           iconKey:"mask"},
	{id:"fingerprint",    label:"Сканирование отпечатков",iconKey:"fingerprint"},
	{id:"takeLicense",    label:"Изъятие прав",           iconKey:"license",      needsId:true},
	{id:"miranda",        label:"Права Миранды",          iconKey:"scale"},
];
const DAHK_STROY=[
	{id:"stroy1",   label:"Объявление о строе (Основное)", iconKey:"announce", needsHour:true},
	{id:"stroy2",   label:"Объявление о строе (Повтор)",   iconKey:"repeat",   needsHour:true},
	{id:"lecture",  label:"Лекция",                        iconKey:"book",     sub:"lecture"},
	{id:"training", label:"Тренировка",                    iconKey:"weights",  sub:"training"},
	{id:"special",  label:"Спец.Задание",                  iconKey:"target",   sub:"special"},
];
const DAHK_LECTURE=[
	{id:"ust1", label:"Устав",        iconKey:"scroll"},
	{id:"sub1", label:"Субординация", iconKey:"rank"},
];
const DAHK_TRAINING=[
	{id:"trenya1", label:"Начало тренировки",      iconKey:"flag_start"},
	{id:"trenya2", label:"Разминка рук",            iconKey:"arm"},
	{id:"trenya3", label:"Отжимания",               iconKey:"pushup"},
	{id:"trenya4", label:"Бег по плацу",            iconKey:"run"},
	{id:"trenya5", label:"Восточное единоборство",  iconKey:"karate"},
	{id:"trenya6", label:"Завершение тренировки",   iconKey:"trophy"},
];
const DAHK_SPECIAL=[
	{id:"rp1", label:"Начало задания",    iconKey:"play"},
	{id:"rp2", label:"Завершение задания",iconKey:"flag_start"},
];
const DAHK_NAPARNICK=[
	{id:"partner_track",   label:"Следить за напарником", iconKey:"eye",   toggle:true},
	{id:"partner_message", label:"Сообщение напарнику",   iconKey:"radio", toggle:true},
];

function render(_ctx,_cache,$props,$setup,$data,$options){
	const currentTabKey=$options.visibleTabs[$data.currentTab]?.key;
	return (openBlock(), createElementBlock("div", _hoisted_1, [
		// ─── ШАПКА ────────────────────────────────────────────────────
		createBaseVNode("div", _hoisted_2, [
			createBaseVNode("div", _hoisted_3, [
				_cache[1] || (_cache[1] = createBaseVNode("span", {class:"laws-helper__title-main"}, "DURAN", -1)),
				_cache[2] || (_cache[2] = createBaseVNode("span", {class:"laws-helper__title-sub"}, "HELPER", -1)),
				createBaseVNode("span", _hoisted_4, toDisplayString($data.version), 1)
			]),
			createBaseVNode("div", _hoisted_6, [
				(openBlock(true), createElementBlock(Fragment, null, renderList($options.visibleTabs, (tab, i) => (
					openBlock(), createElementBlock("div", {
						class: normalizeClass(["laws-helper__tab", {"laws-helper__tab_active": i===$data.currentTab}]),
						key: tab.key,
						onClick: $event => $options.selectTab(i)
					}, toDisplayString(tab.title), 11, ["onClick"])
				)), 128))
			]),
			createBaseVNode("div", _hoisted_5, [
				createBaseVNode("div", {class:"laws-helper__icon-btn", innerHTML: SVG_BURGER}),
				createBaseVNode("div", {
					class: "laws-helper__icon-btn laws-helper__close-btn",
					onClick: $options.close
				}, "X", 8, ["onClick"])
			])
		]),
		// ─── ПОИСК (скрыт для таба МЕНЮ) ─────────────────────────────
		currentTabKey !== "dahk"
			? (openBlock(), createElementBlock("div", {key:"search", ...{class:"laws-helper__search"}}, [
				createBaseVNode("span", {class:"laws-helper__search-icon", innerHTML: SVG_SEARCH}),
				createBaseVNode("input", {
					type: "text",
					placeholder: currentTabKey === "fines" ? "Поиск статьи КоАП..." : "Поиск нарушения...",
					value: $data.search,
					onInput: $event => { $data.search = $event.target.value }
				}, null, 40, ["value","onInput","placeholder"])
			]))
			: createCommentVNode("", true),
		// ─── ТЕЛО ─────────────────────────────────────────────────────
		createBaseVNode("div", _hoisted_8, [
			// ═══ ТАБ: МЕНЮ /dahk ══════════════════════════════════════
			currentTabKey === "dahk"
				? (openBlock(), createElementBlock("div", {key:"dahk", class:"laws-helper__dahk"}, [
					// Хлебные крошки
					createBaseVNode("div", {class:"lh-dahk__breadcrumb"}, [
						$data.dahkLevel !== "main"
							? (openBlock(), createElementBlock("div", {
								key:"back",
								class:"lh-dahk__back",
								innerHTML: SVG_BACK + "<span>Назад</span>",
								onClick: $options.dahkBack
							}, null, 8, ["onClick"]))
							: createCommentVNode("", true),
						createBaseVNode("span", {class:"lh-dahk__breadcrumb-path"}, toDisplayString($options.dahkBreadcrumb), 1)
					]),
					// ── Уровень: MAIN ──────────────────────────────────
					$data.dahkLevel === "main"
						? (openBlock(), createElementBlock("div", {key:"main", class:"lh-dahk__list"}, [
							(openBlock(true), createElementBlock(Fragment, null, renderList($options.dahkMainItems, (item) => (
								openBlock(), createElementBlock("div", {
									key: item.id,
									class: normalizeClass(["lh-dahk__item", {"lh-dahk__item_toggle": item.toggle, "lh-dahk__item_on": $options.dahkToggleState(item.id)}]),
									onClick: $event => $options.dahkMainClick(item)
								}, [
									createBaseVNode("span", {class:"lh-dahk__item-icon lh-dahk__item-icon_svg", innerHTML: ICONS[item.iconKey]||""}),
									createBaseVNode("span", {class:"lh-dahk__item-label"}, toDisplayString(item.label), 1),
									item.toggle
										? (openBlock(), createElementBlock("span", {
											key:"badge",
											class: normalizeClass(["lh-dahk__badge", $options.dahkToggleState(item.id) ? "lh-dahk__badge_on" : "lh-dahk__badge_off"])
										}, toDisplayString($options.dahkToggleState(item.id) ? "ВКЛ" : "ВЫКЛ"), 2))
										: (openBlock(), createElementBlock("span", {key:"arr", class:"lh-dahk__arrow"}, "›"))
								], 10, ["onClick"])
							)), 128))
						]))
						: createCommentVNode("", true),
					// ── Уровень: POVSEDNEV ─────────────────────────────
					$data.dahkLevel === "povsednev"
						? (openBlock(), createElementBlock("div", {key:"pov", class:"lh-dahk__list"}, [
							(openBlock(true), createElementBlock(Fragment, null, renderList(DAHK_POVSEDNEV, (item) => (
								openBlock(), createElementBlock("div", {
									key: item.id,
									class: "lh-dahk__item",
									onClick: $event => $options.dahkActionClick(item)
								}, [
									createBaseVNode("span", {class:"lh-dahk__item-icon lh-dahk__item-icon_svg", innerHTML: ICONS[item.iconKey]||""}),
									createBaseVNode("span", {class:"lh-dahk__item-label"}, toDisplayString(item.label), 1),
									createBaseVNode("span", {class:"lh-dahk__arrow"}, "›")
								], 8, ["onClick"])
							)), 128))
						]))
						: createCommentVNode("", true),
					// ── Уровень: STROY ─────────────────────────────────
					$data.dahkLevel === "stroy"
						? (openBlock(), createElementBlock("div", {key:"stroy", class:"lh-dahk__list"}, [
							(openBlock(true), createElementBlock(Fragment, null, renderList(DAHK_STROY, (item) => (
								openBlock(), createElementBlock("div", {
									key: item.id,
									class: "lh-dahk__item",
									onClick: $event => $options.dahkStroyClick(item)
								}, [
									createBaseVNode("span", {class:"lh-dahk__item-icon lh-dahk__item-icon_svg", innerHTML: ICONS[item.iconKey]||""}),
									createBaseVNode("span", {class:"lh-dahk__item-label"}, toDisplayString(item.label), 1),
									createBaseVNode("span", {class:"lh-dahk__arrow"}, "›")
								], 8, ["onClick"])
							)), 128))
						]))
						: createCommentVNode("", true),
					// ── Уровень: LECTURE / TRAINING / SPECIAL ──────────
					($data.dahkLevel === "lecture" || $data.dahkLevel === "training" || $data.dahkLevel === "special")
						? (openBlock(), createElementBlock("div", {key:"sub", class:"lh-dahk__list"}, [
							(openBlock(true), createElementBlock(Fragment, null, renderList($options.dahkSubItems, (item) => (
								openBlock(), createElementBlock("div", {
									key: item.id,
									class: "lh-dahk__item",
									onClick: $event => $options.dahkSubClick(item)
								}, [
									createBaseVNode("span", {class:"lh-dahk__item-icon lh-dahk__item-icon_svg", innerHTML: ICONS[item.iconKey]||""}),
									createBaseVNode("span", {class:"lh-dahk__item-label"}, toDisplayString(item.label), 1),
									createBaseVNode("span", {class:"lh-dahk__arrow"}, "›")
								], 8, ["onClick"])
							)), 128))
						]))
						: createCommentVNode("", true),
			// ── Уровень: NAPARNICK ─────────────────────────────
					$data.dahkLevel === "naparnick"
						? (openBlock(), createElementBlock("div", {key:"nap", class:"lh-dahk__list"}, [
							// Секция задания ID напарника
							createBaseVNode("div", {class:"lh-dahk__partner-section"}, [
								createBaseVNode("div", {class:"lh-dahk__partner-current"}, [
									createBaseVNode("span", {class:"lh-dahk__input-label"}, "НАПАРНИК"),
									createBaseVNode("span", {class:"lh-dahk__partner-id-display"}, toDisplayString(window._mvdPartnerId||window._pendingPartnerId||"не задан"), 1)
								]),
								createBaseVNode("div", {class:"lh-dahk__input-row"}, [
									createBaseVNode("input", {
										class:"lh-dahk__input",
										type:"text",
										placeholder:"Введите ID напарника",
										value: $data.dahkPartnerIdInput,
										onInput: $event => { $data.dahkPartnerIdInput = $event.target.value },
										onKeydown: $event => { if($event.key==="Enter") $options.dahkSetPartner() }
									}, null, 40, ["value","onInput","onKeydown"]),
									createBaseVNode("button", {
										class:"lh-dahk__confirm-btn",
										onClick: $options.dahkSetPartner
									}, "ЗАДАТЬ", 8, ["onClick"])
								])
							]),
							(openBlock(true), createElementBlock(Fragment, null, renderList(DAHK_NAPARNICK, (item) => (
								openBlock(), createElementBlock("div", {
									key: item.id,
									class: normalizeClass(["lh-dahk__item lh-dahk__item_toggle", {"lh-dahk__item_on": $options.dahkToggleState(item.id)}]),
									onClick: $event => $options.dahkNaparnickToggle(item)
								}, [
									createBaseVNode("span", {class:"lh-dahk__item-icon lh-dahk__item-icon_svg", innerHTML: ICONS[item.iconKey]||""}),
									createBaseVNode("span", {class:"lh-dahk__item-label"}, toDisplayString(item.label), 1),
									createBaseVNode("span", {
										class: normalizeClass(["lh-dahk__badge", $options.dahkToggleState(item.id) ? "lh-dahk__badge_on" : "lh-dahk__badge_off"])
									}, toDisplayString($options.dahkToggleState(item.id) ? "ВКЛ" : "ВЫКЛ"), 2)
								], 10, ["onClick"])
							)), 128))
						]))
						: createCommentVNode("", true),
					// ── Уровень: INPUT ID ──────────────────────────────
					$data.dahkLevel === "inputId"
						? (openBlock(), createElementBlock("div", {key:"inputId", class:"lh-dahk__input-screen"}, [
							createBaseVNode("div", {class:"lh-dahk__input-screen-title"}, toDisplayString($data.dahkPendingAction?.label || "Действие"), 1),
							createBaseVNode("div", {class:"lh-dahk__input-screen-sub"}, "Введите ID игрока"),
							createBaseVNode("input", {
								class:"lh-dahk__input lh-dahk__input_big",
								type:"text",
								placeholder:"ID игрока",
								value: $data.dahkTargetId,
								onInput: $event => { $data.dahkTargetId = $event.target.value },
								onKeydown: $event => { if($event.key==="Enter") $options.dahkConfirmAction() }
							}, null, 40, ["value","onInput","onKeydown"]),
							createBaseVNode("div", {class:"lh-dahk__action-btns"}, [
								createBaseVNode("button", {
									class:"lh-dahk__btn lh-dahk__btn_cancel",
									onClick: $options.dahkBack
								}, "ОТМЕНА", 8, ["onClick"]),
								createBaseVNode("button", {
									class:"lh-dahk__btn lh-dahk__btn_confirm",
									onClick: $options.dahkConfirmAction
								}, "ВЫПОЛНИТЬ", 8, ["onClick"])
							])
						]))
						: createCommentVNode("", true),
					// ── Уровень: INPUT HOUR (строй) ────────────────────
					$data.dahkLevel === "inputHour"
						? (openBlock(), createElementBlock("div", {key:"inputHour", class:"lh-dahk__input-screen"}, [
							createBaseVNode("div", {class:"lh-dahk__input-screen-title"}, toDisplayString($data.dahkPendingAction?.label || "Строй"), 1),
							createBaseVNode("div", {class:"lh-dahk__input-screen-sub"}, "Время начала строя (МСК)"),
							createBaseVNode("div", {class:"lh-dahk__time-row"}, [
								createBaseVNode("input", {
									class:"lh-dahk__input lh-dahk__input_time",
									type:"text",
									placeholder:"Час (0–23)",
									value: $data.dahkHour,
									onInput: $event => { $data.dahkHour = $event.target.value }
								}, null, 40, ["value","onInput"]),
								createBaseVNode("span", {class:"lh-dahk__time-sep"}, ":"),
								createBaseVNode("input", {
									class:"lh-dahk__input lh-dahk__input_time",
									type:"text",
									placeholder:"Мин (0–59)",
									value: $data.dahkMinute,
									onInput: $event => { $data.dahkMinute = $event.target.value }
								}, null, 40, ["value","onInput"])
							]),
							createBaseVNode("div", {class:"lh-dahk__action-btns"}, [
								createBaseVNode("button", {
									class:"lh-dahk__btn lh-dahk__btn_cancel",
									onClick: $options.dahkBack
								}, "ОТМЕНА", 8, ["onClick"]),
								createBaseVNode("button", {
									class:"lh-dahk__btn lh-dahk__btn_confirm",
									onClick: $options.dahkConfirmHour
								}, "ВЫПОЛНИТЬ", 8, ["onClick"])
							])
						]))
						: createCommentVNode("", true),
					// ── Уровень: TRACKING INPUT ────────────────────────
					$data.dahkLevel === "trackingInput"
						? (openBlock(), createElementBlock("div", {key:"trackInput", class:"lh-dahk__input-screen"}, [
							createBaseVNode("div", {class:"lh-dahk__input-screen-title"}, "ОТСЛЕЖИВАНИЕ", 1),
							createBaseVNode("div", {class:"lh-dahk__input-screen-sub"}, "Введите ID для отслеживания"),
							createBaseVNode("input", {
								class:"lh-dahk__input lh-dahk__input_big",
								type:"text",
								placeholder:"ID игрока",
								value: $data.dahkTrackingId,
								onInput: $event => { $data.dahkTrackingId = $event.target.value },
								onKeydown: $event => { if($event.key==="Enter") $options.dahkConfirmTracking() }
							}, null, 40, ["value","onInput","onKeydown"]),
							createBaseVNode("div", {class:"lh-dahk__action-btns"}, [
								createBaseVNode("button", {
									class:"lh-dahk__btn lh-dahk__btn_cancel",
									onClick: $options.dahkBack
								}, "ОТМЕНА", 8, ["onClick"]),
								createBaseVNode("button", {
									class:"lh-dahk__btn lh-dahk__btn_confirm",
									onClick: $options.dahkConfirmTracking
								}, "НАЧАТЬ", 8, ["onClick"])
							])
						]))
						: createCommentVNode("", true)
				]))
			// ═══ ТАБ: РОЗЫСК ══════════════════════════════════════════
			: currentTabKey === "wanted"
				? (openBlock(), createElementBlock("div", {key:"wanted", class:"laws-helper__wanted-layout"}, [
					createBaseVNode("div", {class:"laws-helper__laws-list"}, [
						(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredArticles, (art) => (
							openBlock(), createElementBlock("div", {
								key: art.id,
								class: normalizeClass(["laws-helper__article-row", {"laws-helper__article-row_checked": $data.selectedArticles.includes(art.id)}]),
								onClick: $event => $options.toggleArticle(art.id)
							}, [
								createBaseVNode("div", {class:"laws-helper__article-check"}, [
									createBaseVNode("div", {
										class: normalizeClass(["laws-helper__checkbox", {"laws-helper__checkbox_checked": $data.selectedArticles.includes(art.id)}])
									}, [
										$data.selectedArticles.includes(art.id)
											? (openBlock(), createElementBlock("span", {key:"chk", class:"laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
											: createCommentVNode("", true)
									], 2)
								]),
								createBaseVNode("div", {class:"laws-helper__article-num"}, toDisplayString(art.num), 1),
								createBaseVNode("div", {
									class: normalizeClass(["laws-helper__article-type", "laws-helper__article-type_" + art.type.toLowerCase()])
								}, toDisplayString(art.type), 2),
								createBaseVNode("div", {class:"laws-helper__article-info"}, [
									createBaseVNode("div", {class:"laws-helper__article-title"}, toDisplayString(art.title), 1),
									art.note ? (openBlock(), createElementBlock("div", {key:"note", class:"laws-helper__article-note"}, "Примечание: " + toDisplayString(art.note), 1)) : createCommentVNode("", true)
								]),
								createBaseVNode("div", {class:"laws-helper__article-term"}, toDisplayString(art.term), 1)
							], 10, ["onClick"])
						)), 128))
					]),
					createBaseVNode("div", {class:"laws-helper__wanted-panel"}, [
						createBaseVNode("div", {class:"laws-helper__wanted-title"}, "ВЫДАЧА РОЗЫСКА"),
						createBaseVNode("div", {class:"laws-helper__wanted-title-line"}),
						$data.selectedArticles.length === 0
							? (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__wanted-empty"}, [
								createBaseVNode("div", {class:"laws-helper__wanted-star-icon", innerHTML: SVG_STAR}),
								createBaseVNode("div", {class:"laws-helper__wanted-empty-text"}, [
									createBaseVNode("span", null, "Список нарушений пуст."),
									createBaseVNode("span", null, "Кликните по статье слева,"),
									createBaseVNode("span", null, "чтобы добавить в розыск.")
								])
							]))
							: (openBlock(), createElementBlock("div", {key:"list", class:"laws-helper__wanted-selected-list"}, [
								(openBlock(true), createElementBlock(Fragment, null, renderList($options.selectedArticleObjects, (art) => (
									openBlock(), createElementBlock("div", {key:art.id, class:"laws-helper__wanted-sel-item"}, [
										createBaseVNode("span", {class:"laws-helper__wanted-sel-num"}, toDisplayString(art.num), 1),
										createBaseVNode("span", {class:"laws-helper__wanted-sel-title"}, toDisplayString(art.title), 1),
										createBaseVNode("span", {class:"laws-helper__wanted-sel-term"}, toDisplayString(art.term), 1)
									])
								)), 128))
							])),
						createBaseVNode("div", {class:"laws-helper__wanted-stars-row"}, [
							createBaseVNode("span", {class:"laws-helper__wanted-stars-label"}, "ЗВЕЗДЫ РОЗЫСКА:"),
							createBaseVNode("span", {class:"laws-helper__wanted-stars-value"}, toDisplayString($options.totalTerm) + " лет", 1)
						]),
						createBaseVNode("div", {class:"laws-helper__wanted-id-label"}, "ID НАРУШИТЕЛЯ"),
						createBaseVNode("input", {
							class: "laws-helper__wanted-id-input",
							type: "text",
							placeholder: "Введите ID нарушителя",
							value: $data.wantedId,
							onInput: $event => { $data.wantedId = $event.target.value }
						}, null, 40, ["value","onInput"]),
						createBaseVNode("div", {class:"laws-helper__wanted-btns"}, [
							createBaseVNode("button", {
								class: "laws-helper__wanted-btn laws-helper__wanted-btn_clear",
								onClick: $options.clearWanted
							}, "ОЧИСТИТЬ", 8, ["onClick"]),
							createBaseVNode("button", {
								class: "laws-helper__wanted-btn laws-helper__wanted-btn_issue",
								onClick: $options.issueWanted
							}, "ОБЪЯВИТЬ В РОЗЫСК", 8, ["onClick"])
						])
					])
				]))
			// ═══ ТАБ: ШТРАФЫ ══════════════════════════════════════════
			: currentTabKey === "fines"
				? (openBlock(), createElementBlock("div", {key:"fines", class:"laws-helper__wanted-layout"}, [
					createBaseVNode("div", {class:"laws-helper__laws-list"}, [
						createBaseVNode("div", {class:"laws-helper__fine-filter"}, [
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__fine-filter-btn", {"laws-helper__fine-filter-btn_active": $data.fineKoapType === "all"}]),
								onClick: $event => { $data.fineKoapType = "all"; }
							}, "Все", 10, ["onClick"]),
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__fine-filter-btn_dps", {"laws-helper__fine-filter-btn_active": $data.fineKoapType === "ДПС"}]),
								onClick: $event => { $data.fineKoapType = "ДПС"; }
							}, "ДПС", 10, ["onClick"]),
							createBaseVNode("div", {
								class: normalizeClass(["laws-helper__fine-filter-btn laws-helper__fine-filter-btn_pps", {"laws-helper__fine-filter-btn_active": $data.fineKoapType === "ППС"}]),
								onClick: $event => { $data.fineKoapType = "ППС"; }
							}, "ППС", 10, ["onClick"])
						]),
						(openBlock(true), createElementBlock(Fragment, null, renderList($options.filteredKoapArticles, (art) => (
							openBlock(), createElementBlock("div", {
								key: art.id,
								class: normalizeClass(["laws-helper__article-row", {"laws-helper__article-row_checked": $data.selectedFineArticles.includes(art.id)}]),
								onClick: $event => $options.toggleFineArticle(art.id)
							}, [
								createBaseVNode("div", {class:"laws-helper__article-check"}, [
									createBaseVNode("div", {
										class: normalizeClass(["laws-helper__checkbox", {"laws-helper__checkbox_checked": $data.selectedFineArticles.includes(art.id)}])
									}, [
										$data.selectedFineArticles.includes(art.id)
											? (openBlock(), createElementBlock("span", {key:"chk", class:"laws-helper__checkbox-svg", innerHTML: SVG_CHECK}))
											: createCommentVNode("", true)
									], 2)
								]),
								createBaseVNode("div", {class:"laws-helper__article-num"}, toDisplayString(art.num), 1),
								createBaseVNode("div", {
									class: normalizeClass(["laws-helper__article-type", "laws-helper__article-type_" + art.type.toLowerCase()])
								}, toDisplayString(art.type), 2),
								createBaseVNode("div", {class:"laws-helper__article-info"}, [
									createBaseVNode("div", {class:"laws-helper__article-title"}, toDisplayString(art.title), 1),
									art.note ? (openBlock(), createElementBlock("div", {key:"note", class:"laws-helper__article-note"}, toDisplayString(art.note), 1)) : createCommentVNode("", true)
								]),
								createBaseVNode("div", {class:"laws-helper__article-term"}, toDisplayString(art.fine.toLocaleString("ru-RU")) + " ₽", 1)
							], 10, ["onClick"])
						)), 128))
					]),
					createBaseVNode("div", {class:"laws-helper__wanted-panel"}, [
						createBaseVNode("div", {class:"laws-helper__wanted-title"}, "ВЫДАЧА ШТРАФА"),
						createBaseVNode("div", {class:"laws-helper__wanted-title-line laws-helper__fine-title-line"}),
						$data.selectedFineArticles.length === 0
							? (openBlock(), createElementBlock("div", {key:"empty", class:"laws-helper__wanted-empty"}, [
								createBaseVNode("div", {class:"laws-helper__wanted-star-icon", innerHTML: SVG_RECEIPT}),
								createBaseVNode("div", {class:"laws-helper__wanted-empty-text"}, [
									createBaseVNode("span", null, "Список нарушений пуст."),
									createBaseVNode("span", null, "Кликните по статье слева,"),
									createBaseVNode("span", null, "чтобы добавить в штраф.")
								])
							]))
							: (openBlock(), createElementBlock("div", {key:"list", class:"laws-helper__wanted-selected-list"}, [
								(openBlock(true), createElementBlock(Fragment, null, renderList($options.selectedFineArticleObjects, (art) => (
									openBlock(), createElementBlock("div", {key:art.id, class:"laws-helper__wanted-sel-item"}, [
										createBaseVNode("span", {class:"laws-helper__wanted-sel-num"}, toDisplayString(art.num), 1),
										createBaseVNode("span", {class:"laws-helper__wanted-sel-title"}, toDisplayString(art.title), 1),
										createBaseVNode("span", {class:"laws-helper__fine-sel-amount"}, toDisplayString(art.fine.toLocaleString("ru-RU")) + " ₽", 1)
									])
								)), 128))
							])),
						createBaseVNode("div", {class:"laws-helper__wanted-stars-row"}, [
							createBaseVNode("span", {class:"laws-helper__wanted-stars-label"}, "СУММА ШТРАФА:"),
							createBaseVNode("span", {class:"laws-helper__fine-total"}, toDisplayString($options.totalFine.toLocaleString("ru-RU")) + " ₽", 1)
						]),
						createBaseVNode("div", {class:"laws-helper__wanted-id-label"}, "ID НАРУШИТЕЛЯ"),
						createBaseVNode("input", {
							class: "laws-helper__wanted-id-input",
							type: "text",
							placeholder: "Введите ID нарушителя",
							value: $data.fineId,
							onInput: $event => { $data.fineId = $event.target.value }
						}, null, 40, ["value","onInput"]),
						createBaseVNode("div", {class:"laws-helper__wanted-btns"}, [
							createBaseVNode("button", {
								class: "laws-helper__wanted-btn laws-helper__wanted-btn_clear",
								onClick: $options.clearFine
							}, "ОЧИСТИТЬ", 8, ["onClick"]),
							createBaseVNode("button", {
								class: "laws-helper__wanted-btn laws-helper__fine-btn_issue",
								onClick: $options.issueFine
							}, "ВЫДАТЬ ШТРАФ", 8, ["onClick"])
						])
					])
				]))
			// ═══ ОСТАЛЬНЫЕ ТАБЫ ═══════════════════════════════════════
			: (openBlock(), createElementBlock("div", {key:"other", class:"laws-helper__content"}, [
				createBaseVNode("div", {innerHTML: $options.currentContent})
			]))
		])
	]));
}

// ══════════════════════════════════════════════════════════════════
//  КоАП статьи — ШТРАФЫ (ДПС + ППС)
// ══════════════════════════════════════════════════════════════════
const KOAP_ARTICLES=[
	{id:"dps-1.1",    num:"1.1",    type:"ДПС", title:"Управление т/с без регистрационного знака",                        note:"Искл: разрешено без номеров если пробег не превысил 100 км",  fine:5000},
	{id:"dps-2.1",    num:"2.1",    type:"ДПС", title:"Управление т/с с неисправным двигателем (дымление)",               note:"",                                                              fine:10000},
	{id:"dps-3.1",    num:"3.1",    type:"ДПС", title:"Управление т/с в алкогольном/наркотическом опьянении",             note:"+ изъятие водительского удостоверения",                         fine:20000},
	{id:"dps-3.2",    num:"3.2",    type:"ДПС", title:"Разговор по телефону во время движения",                            note:"",                                                              fine:5500},
	{id:"dps-3.3",    num:"3.3",    type:"ДПС", title:"Нарушение правил пользования звуковыми сигналами",                 note:"использование не по назначению, троллинг",                      fine:6500},
	{id:"dps-3.4",    num:"3.4",    type:"ДПС", title:"Движение с выключенными габаритными огнями (21:00–06:00)",         note:"",                                                              fine:5000},
	{id:"dps-3.5",    num:"3.5",    type:"ДПС", title:"Нарушение ПДД пешеходом",                                          note:"Искл: сотрудник ПО при исполнении",                             fine:5000},
	{id:"dps-3.6",    num:"3.6",    type:"ДПС", title:"Управление т/с с тонировкой стекол ниже 50%",                     note:"Искл: ФСБ при исполнении",                                     fine:15000},
	{id:"dps-3.7",    num:"3.7",    type:"ДПС", title:"Движение без пристегнутого ремня или надетого шлема",              note:"",                                                              fine:5000},
	{id:"dps-3.8",    num:"3.8",    type:"ДПС", title:"Намеренное создание дорожных заторов, помех",                      note:"",                                                              fine:10000},
	{id:"dps-4.1",    num:"4.1",    type:"ДПС", title:"Пересечение ж/д пути вне переезда или при закрытом шлагбауме",    note:"+ лишение водительского удостоверения",                         fine:25000},
	{id:"dps-5.1",    num:"5.1",    type:"ДПС", title:"Разворот или движение задним ходом по автомагистрали",             note:"",                                                              fine:15000},
	{id:"dps-6.1",    num:"6.1",    type:"ДПС", title:"Проезд на красный сигнал светофора",                               note:"",                                                              fine:10000},
	{id:"dps-6.1.1",  num:"6.1.1",  type:"ДПС", title:"Проезд на жёлтый сигнал светофора",                               note:"",                                                              fine:5000},
	{id:"dps-6.1.2",  num:"6.1.2",  type:"ДПС", title:"Проезд на запрещающий сигнал + ДТП",                              note:"+ лишение ВУ",                                                 fine:20000},
	{id:"dps-7.1",    num:"7.1",    type:"ДПС", title:"Разворот/движение задним ходом в запрещённых местах",              note:"пешеходный переход, мост, ж/д переезд",                        fine:15000},
	{id:"dps-7.2",    num:"7.2",    type:"ДПС", title:"Агрессивное вождение (таран, подрезы, выезды на встречную)",       note:"+ изъятие лицензии на вождение",                               fine:20000},
	{id:"dps-7.3",    num:"7.3",    type:"ДПС", title:"Невыполнение требования уступить дорогу с преимуществом",          note:"",                                                              fine:10000},
	{id:"dps-8.1",    num:"8.1",    type:"ДПС", title:"Остановка/стоянка/парковка в неположенном месте",                  note:"+ эвакуация; с аварийкой можно стоять до 5 мин",               fine:8000},
	{id:"dps-8.2",    num:"8.2",    type:"ДПС", title:"Движение т/с по велосипедным/пешеходным дорожкам, газонам",       note:"",                                                              fine:6500},
	{id:"dps-8.3",    num:"8.3",    type:"ДПС", title:"Движение т/с по встречной полосе",                                 note:"+ изъятие лицензии на вождение",                               fine:10000},
	{id:"dps-8.3.1",  num:"8.3.1",  type:"ДПС", title:"Движение по встречной полосе + ДТП",                              note:"+ изъятие лицензии",                                           fine:20000},
	{id:"dps-9.1",    num:"9.1",    type:"ДПС", title:"Разворот/поворот через сплошную линию разметки",                   note:"",                                                              fine:12000},
	{id:"dps-9.2",    num:"9.2",    type:"ДПС", title:"Разворот/поворот через двойную сплошную",                          note:"",                                                              fine:15000},
	{id:"dps-9.3",    num:"9.3",    type:"ДПС", title:"Пересечение двойной сплошной линии",                               note:"",                                                              fine:13000},
	{id:"dps-9.4",    num:"9.4",    type:"ДПС", title:"Пересечение сплошной линии разметки",                              note:"при ДТП — также изымается лицензия",                           fine:15000},
	{id:"dps-10.1",   num:"10.1",   type:"ДПС", title:"Непредоставление преимущества маршрутному транспорту",             note:"",                                                              fine:5000},
	{id:"dps-10.2",   num:"10.2",   type:"ДПС", title:"Непредоставление преимущества спец. службам с маячком/сиреной",   note:"+ изъятие лицензии",                                           fine:15000},
	{id:"dps-10.3",   num:"10.3",   type:"ДПС", title:"Непредоставление преимущества колонне гос. служб",                note:"+ изъятие лицензии",                                           fine:20000},
	{id:"dps-10.4",   num:"10.4",   type:"ДПС", title:"Невыполнение требования уступить дорогу пешеходам/велосипедистам",note:"",                                                              fine:10000},
	{id:"dps-11.1",   num:"11.1",   type:"ДПС", title:"Виновник ДТП без вреда здоровью",                                  note:"",                                                              fine:10000},
	{id:"dps-11.1.1", num:"11.1.1", type:"ДПС", title:"Виновник ДТП с тяжким вредом здоровью/смертью",                  note:"+ изъятие лицензии на оружие",                                 fine:25000},
	{id:"dps-11.2",   num:"11.2",   type:"ДПС", title:"Оставление места ДТП",                                             note:"",                                                              fine:15000},
	{id:"dps-11.3",   num:"11.3",   type:"ДПС", title:"Создание аварийных ситуаций, провокация на ДТП, автоподставы",    note:"+ изъятие водительского удостоверения",                         fine:20000},
	{id:"dps-12.1",   num:"12.1",   type:"ДПС", title:"Превышение скорости более чем на 30 км/ч (80–90 км/ч)",           note:"",                                                              fine:5000},
	{id:"dps-12.2",   num:"12.2",   type:"ДПС", title:"Превышение скорости более чем на 50 км/ч (90–120 км/ч)",          note:"",                                                              fine:7000},
	{id:"dps-12.3",   num:"12.3",   type:"ДПС", title:"Превышение на 30+ км/ч + ДТП",                                    note:"также изымается лицензия",                                     fine:15000},
	{id:"dps-12.4",   num:"12.4",   type:"ДПС", title:"Превышение на 50+ км/ч + ДТП",                                    note:"+ изъятие водительского удостоверения + лицензия",             fine:25000},
	{id:"dps-13.1",   num:"13.1",   type:"ДПС", title:"Оскорбление гражданского лица / сотрудника гос. структур",        note:"",                                                              fine:10000},
	{id:"dps-13.1.1", num:"13.1.1", type:"ДПС", title:"Не грубое оскорбление сотрудника правоохранительных органов",     note:"",                                                              fine:10000},
	{id:"dps-13.2",   num:"13.2",   type:"ДПС", title:"Мелкое хулиганство",                                               note:"нецензурная брань, громкие крики в общественных местах",       fine:8000},
	{id:"dps-13.3",   num:"13.3",   type:"ДПС", title:"Курение в общественных местах",                                    note:"",                                                              fine:5000},
	{id:"dps-13.4",   num:"13.4",   type:"ДПС", title:"Распитие спиртных напитков в общественных местах",                note:"",                                                              fine:7000},
	{id:"dps-13.5",   num:"13.5",   type:"ДПС", title:"Громкая музыка в жилых зонах в ночное время (23:00–06:00)",       note:"",                                                              fine:4000},
	{id:"dps-13.6",   num:"13.6",   type:"ДПС", title:"Ношение отмычек или спец. приспособлений для проникновения",      note:"",                                                              fine:15000},
	{id:"pps-20.1",   num:"20.1",   type:"ППС", title:"Оскорбление — унижение чести и достоинства",                       note:"",                                                              fine:5000},
	{id:"pps-20.2",   num:"20.2",   type:"ППС", title:"Дискриминация по полу, расе, национальности и т.д.",               note:"",                                                              fine:5000},
	{id:"pps-20.3",   num:"20.3",   type:"ППС", title:"Нанесение побоев или иных насильственных действий",                note:"или административный арест",                                   fine:30000},
	{id:"pps-20.4",   num:"20.4",   type:"ППС", title:"Занятие народной медициной без разрешения",                        note:"",                                                              fine:4000},
	{id:"pps-20.5",   num:"20.5",   type:"ППС", title:"Потребление наркотических средств без назначения врача",           note:"или административный арест",                                   fine:10000},
	{id:"pps-20.6",   num:"20.6",   type:"ППС", title:"Занятие проституцией",                                             note:"",                                                              fine:3000},
	{id:"pps-20.7",   num:"20.7",   type:"ППС", title:"Курение в общественных местах",                                    note:"",                                                              fine:3000},
	{id:"pps-20.8",   num:"20.8",   type:"ППС", title:"Распитие спиртных напитков в общественных местах",                note:"",                                                              fine:5000},
	{id:"pps-20.9",   num:"20.9",   type:"ППС", title:"Мелкое хулиганство",                                               note:"или административный арест",                                   fine:2000},
	{id:"pps-30.1",   num:"30.1",   type:"ППС", title:"Нарушение порядка проведения собрания/митинга/шествия",            note:"",                                                              fine:20000},
	{id:"pps-30.2",   num:"30.2",   type:"ППС", title:"Нарушение правил перевозки и транспортирования оружия",            note:"",                                                              fine:2000},
	{id:"pps-30.3",   num:"30.3",   type:"ППС", title:"Появление в общественном месте в состоянии опьянения",             note:"",                                                              fine:3000},
	{id:"pps-30.4",   num:"30.4",   type:"ППС", title:"Организация/участие в блокировании транспортных коммуникаций",     note:"",                                                              fine:100000},
	{id:"pps-40.1",   num:"40.1",   type:"ППС", title:"Подкуп избирателей",                                               note:"+ арест до 15 суток",                                          fine:120000},
	{id:"pps-40.2",   num:"40.2",   type:"ППС", title:"Агитация в день тишины",                                           note:"+ арест до 15 суток",                                          fine:200000},
];

// ══════════════════════════════════════════════════════════════════
//  УК статьи — РОЗЫСК
// ══════════════════════════════════════════════════════════════════
const UK_ARTICLES=[
	{id:"1.1",    num:"1.1",    type:"УК", title:"Нападение на гражданское лицо без использования оружия",                                note:"", term:2},
	{id:"1.1.1",  num:"1.1.1",  type:"УК", title:"Побои",                                                                                  note:"", term:1},
	{id:"1.1.2",  num:"1.1.2",  type:"УК", title:"Нападение на гражданское лицо с применением холодного оружия",                          note:"", term:3},
	{id:"1.1.3",  num:"1.1.3",  type:"УК", title:"Вооружённое нападение на гражданское лицо",                                             note:"", term:4},
	{id:"1.2",    num:"1.2",    type:"УК", title:"Причинение смерти по неосторожности без оружия",                                        note:"", term:1},
	{id:"1.2.1",  num:"1.2.1",  type:"УК", title:"Причинение смерти по неосторожности при управлении транспортом",                        note:"", term:2},
	{id:"1.3",    num:"1.3",    type:"УК", title:"Угроза причинения вреда здоровью (слова)",                                              note:"", term:1},
	{id:"1.3.1",  num:"1.3.1",  type:"УК", title:"Угроза причинения вреда здоровью с использованием оружия",                             note:"", term:2},
	{id:"1.4",    num:"1.4",    type:"УК", title:"Изнасилование",                                                                          note:"", term:2},
	{id:"1.5",    num:"1.5",    type:"УК", title:"Воспрепятствование оказанию медицинской помощи",                                        note:"", term:2},
	{id:"2.1",    num:"2.1",    type:"УК", title:"Похищение человека",                                                                     note:"", term:4},
	{id:"2.2",    num:"2.2",    type:"УК", title:"Клевета",                                                                                note:"", term:2},
	{id:"3.1",    num:"3.1",    type:"УК", title:"Кража",                                                                                  note:"", term:2},
	{id:"3.1.1",  num:"3.1.1",  type:"УК", title:"Разбой",                                                                                note:"", term:3},
	{id:"3.2",    num:"3.2",    type:"УК", title:"Умышленное повреждение или порча частного имущества",                                   note:"", term:2},
	{id:"3.2.1",  num:"3.2.1",  type:"УК", title:"Умышленное повреждение или порча государственного имущества",                          note:"", term:3},
	{id:"4.1",    num:"4.1",    type:"УК", title:"Террористический акт",                                                                   note:"", term:6},
	{id:"4.1.1",  num:"4.1.1",  type:"УК", title:"Заведомо ложное сообщение об акте терроризма",                                         note:"", term:3},
	{id:"4.2",    num:"4.2",    type:"УК", title:"Несообщение о преступлении",                                                             note:"", term:2},
	{id:"4.3",    num:"4.3",    type:"УК", title:"Массовые беспорядки",                                                                    note:"", term:5},
	{id:"4.4",    num:"4.4",    type:"УК", title:"Участие в несанкционированных митингах",                                                note:"", term:2},
	{id:"4.4.1",  num:"4.4.1",  type:"УК", title:"Организация несанкционированного митинга",                                             note:"", term:3},
	{id:"4.5",    num:"4.5",    type:"УК", title:"Ношение оружия в открытом виде",                                                        note:"", term:2},
	{id:"4.5.1",  num:"4.5.1",  type:"УК", title:"Ношение оружия в открытом виде в общественных местах",                                note:"", term:3},
	{id:"4.5.2",  num:"4.5.2",  type:"УК", title:"Ношение оружия и патронов без лицензии",                                              note:"", term:2},
	{id:"4.5.3",  num:"4.5.3",  type:"УК", title:"Ношение оружия в открытом виде без лицензии",                                         note:"", term:4},
	{id:"4.5.4",  num:"4.5.4",  type:"УК", title:"Ношение оружия в открытом виде в общественных местах без лицензии",                   note:"", term:5},
	{id:"4.6",    num:"4.6",    type:"УК", title:"Незаконное приобретение/передача/изготовление оружия и боеприпасов",                   note:"", term:2},
	{id:"4.7",    num:"4.7",    type:"УК", title:"Помеха проведению мероприятий гос. структур",                                           note:"", term:1},
	{id:"4.8",    num:"4.8",    type:"УК", title:"Проникновение на желтую зону",                                                          note:"", term:2},
	{id:"4.8.1",  num:"4.8.1",  type:"УК", title:"Проникновение на красную зону",                                                        note:"", term:4},
	{id:"4.8.2",  num:"4.8.2",  type:"УК", title:"Проникновение на частную территорию без разрешения",                                  note:"", term:1},
	{id:"4.9",    num:"4.9",    type:"УК", title:"Соучастие в преступлении",                                                              note:"", term:3},
	{id:"5.1",    num:"5.1",    type:"УК", title:"Нападение на сотрудника гос. организации при исполнении",                              note:"", term:4},
	{id:"5.1.1",  num:"5.1.1",  type:"УК", title:"Нападение на сотрудника силовых структур при исполнении",                             note:"", term:5},
	{id:"5.1.2",  num:"5.1.2",  type:"УК", title:"Нападение на государственного деятеля при исполнении",                                note:"", term:6},
	{id:"5.2",    num:"5.2",    type:"УК", title:"Неподчинение законному требованию сотрудника ПО или МО",                               note:"", term:1},
	{id:"5.2.1",  num:"5.2.1",  type:"УК", title:"Побег от сотрудников ПО",                                                             note:"", term:2},
	{id:"5.3",    num:"5.3",    type:"УК", title:"Создание помехи сотруднику ПО при исполнении",                                         note:"", term:2},
	{id:"5.3.1",  num:"5.3.1",  type:"УК", title:"Провокация сотрудников правоохранительных органов",                                   note:"", term:2},
	{id:"5.4",    num:"5.4",    type:"УК", title:"Оскорбление сотрудников ПО в грубой форме",                                            note:"", term:1},
	{id:"5.5",    num:"5.5",    type:"УК", title:"Ложный вызов",                                                                          note:"", term:2},
	{id:"5.6",    num:"5.6",    type:"УК", title:"Дача ложных показаний",                                                                 note:"", term:2},
	{id:"5.7",    num:"5.7",    type:"УК", title:"Дача или попытка дачи взятки",                                                         note:"", term:3},
	{id:"5.8",    num:"5.8",    type:"УК", title:"Случайное разглашение государственной тайны",                                          note:"", term:1},
	{id:"5.8.1",  num:"5.8.1",  type:"УК", title:"Намеренное разглашение/передача гос. тайны",                                          note:"", term:3},
	{id:"5.9",    num:"5.9",    type:"УК", title:"Шпионаж",                                                                                note:"", term:4},
	{id:"5.10",   num:"5.10",   type:"УК", title:"Присвоение полномочий должностного лица",                                              note:"", term:3},
	{id:"6.1.1",  num:"6.1.1",  type:"УК", title:"Укрывательство преступлений",                                                         note:"", term:2},
	{id:"6.2",    num:"6.2",    type:"УК", title:"Превышение должностных полномочий",                                                     note:"", term:2},
	{id:"6.3",    num:"6.3",    type:"УК", title:"Халатность",                                                                            note:"", term:4},
	{id:"6.4",    num:"6.4",    type:"УК", title:"Разглашение сведений должностным лицом гос. тайны",                                    note:"", term:4},
	{id:"6.5",    num:"6.5",    type:"УК", title:"Вооружённый мятеж",                                                                     note:"", term:6},
	{id:"6.6",    num:"6.6",    type:"УК", title:"Неоказание помощи больному",                                                            note:"", term:3},
	{id:"6.7",    num:"6.7",    type:"УК", title:"Дезертирство",                                                                          note:"", term:3},
	{id:"6.8",    num:"6.8",    type:"УК", title:"Получение взятки должностным лицом",                                                   note:"", term:3},
	{id:"7.2",    num:"7.2",    type:"УК", title:"Хранение или перевозка наркотических веществ",                                         note:"", term:3},
	{id:"7.3",    num:"7.3",    type:"УК", title:"Приобретение, сбыт, распространение наркотических веществ",                           note:"", term:4},
	{id:"7.4",    num:"7.4",    type:"УК", title:"Производство, изготовление, выращивание наркотических веществ",                       note:"", term:3},
];

const _sfc_main={
	name:"LawsHelper",
	data(){
		return{
			version:"V4.2.0",
			search:"",
			mode:null,
			currentTab:0,
			// ── РОЗЫСК ───────────────────────────────────────────────
			wantedId:"",
			selectedArticles:[],
			// ── ШТРАФЫ ───────────────────────────────────────────────
			fineId:"",
			fineKoapType:"all",
			selectedFineArticles:[],
			// ── МЕНЮ /dahk ───────────────────────────────────────────
			dahkLevel:"main",         // "main"|"povsednev"|"stroy"|"lecture"|"training"|"special"|"naparnick"|"inputId"|"inputHour"|"trackingInput"
			dahkLevelHistory:[],      // стек для кнопки "Назад"
			dahkPendingAction:null,   // текущее действие ожидающее ID/час
			dahkTargetId:"",          // поле ввода ID
			dahkHour:"",              // поле ввода часа строя
			dahkMinute:"",            // поле ввода минут строя
			dahkTrackingId:"",        // поле ввода ID для отслеживания
			dahkPartnerIdInput:"",    // поле ввода ID напарника
			// ── ТАБЫ ─────────────────────────────────────────────────
			tabs:[
				{key:"dahk",   title:"МЕНЮ"},
				{key:"fines",  title:"ШТРАФЫ"},
				{key:"wanted", title:"РОЗЫСК"},
				{key:"laws",   title:"ЗАКОНЫ"},
				{key:"binder", title:"БИНДЕР"},
			],
			content:{
				laws:`<b>[ЕУСС] Единый устав Силовых Структур</b><br><br>Тестовый раздел "Законы". Здесь будет содержимое УК, КоАП и других нормативных актов.`,
				binder:`<div class="laws-helper__placeholder">Раздел "Биндер" — в разработке</div>`
			}
		}
	},
	computed:{
		visibleTabs(){
			if(this.mode==="wanted")return this.tabs.filter(t=>t.key==="wanted");
			if(this.mode==="fine")  return this.tabs.filter(t=>t.key==="fines");
			return this.tabs;
		},
		// ── МЕНЮ: хлебные крошки ─────────────────────────────────
		dahkBreadcrumb(){
			const map={
				main:"МВД",
				povsednev:"Повседневная",
				stroy:"Строй",
				lecture:"Лекция",
				training:"Тренировка",
				special:"Спец.Задание",
				naparnick:"Напарник",
				inputId:"Ввод ID",
				inputHour:"Время строя",
				trackingInput:"Отслеживание",
			};
			return map[this.dahkLevel]||"МВД";
		},
		// ── МЕНЮ: главные пункты с учётом состояния toggles ──────
		dahkMainItems(){
			// Фильтруем «Строй» если нет доступа (stroyRanks в mvdN)
			// Доступность определяем по наличию функции в window
			const items=[...DAHK_MENU_MAIN];
			return items;
		},
		// ── Подпункты подменю строя ───────────────────────────────
		dahkSubItems(){
			if(this.dahkLevel==="lecture")  return DAHK_LECTURE;
			if(this.dahkLevel==="training") return DAHK_TRAINING;
			if(this.dahkLevel==="special")  return DAHK_SPECIAL;
			return[];
		},
		// ── РОЗЫСК ───────────────────────────────────────────────
		filteredArticles(){
			const q=this.search.trim().toLowerCase();
			if(!q)return UK_ARTICLES;
			return UK_ARTICLES.filter(a=>
				a.num.includes(q)||
				a.title.toLowerCase().includes(q)||
				(a.note&&a.note.toLowerCase().includes(q))
			);
		},
		selectedArticleObjects(){
			return UK_ARTICLES.filter(a=>this.selectedArticles.includes(a.id));
		},
		totalTerm(){
			return this.selectedArticleObjects.reduce((s,a)=>s+a.term,0);
		},
		// ── ШТРАФЫ ───────────────────────────────────────────────
		filteredKoapArticles(){
			let arts=KOAP_ARTICLES;
			if(this.fineKoapType!=="all")arts=arts.filter(a=>a.type===this.fineKoapType);
			const q=this.search.trim().toLowerCase();
			if(!q)return arts;
			return arts.filter(a=>
				a.num.includes(q)||
				a.title.toLowerCase().includes(q)||
				(a.note&&a.note.toLowerCase().includes(q))
			);
		},
		selectedFineArticleObjects(){
			return KOAP_ARTICLES.filter(a=>this.selectedFineArticles.includes(a.id));
		},
		totalFine(){
			return this.selectedFineArticleObjects.reduce((s,a)=>s+a.fine,0);
		},
		currentContent(){
			const vtabs=this.visibleTabs;
			const tab=vtabs[this.currentTab];
			if(!tab)return"";
			return this.content[tab.key]||"";
		}
	},
	created(){this.$data.noAdaptation=!0},
	mounted(){
		const _style=document.createElement("style");
		_style.id="laws-helper-style";
		_style.textContent=`
.laws-helper{background:#1c1c1ef2;border:0.09vh solid #ffffff14;border-radius:0.56vh;box-shadow:0 1vh 4vh #00000080;color:#fff;display:flex;flex-direction:column;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:46vh;left:29.3vw;overflow:hidden;position:absolute;text-transform:none;top:18.5vh;width:48vw;z-index:10;}
.laws-helper__header{align-items:center;background:#1c1c1e;border-bottom:0.09vh solid #ffffff14;display:flex;justify-content:space-between;padding:1.2vh 1.67vh;}
.laws-helper__title{align-items:baseline;display:flex;font-weight:700;gap:0.56vh;}
.laws-helper__title-main{color:#fff;font-size:2.04vh;letter-spacing:0.15vh;}
.laws-helper__title-sub{color:#ffc14d;font-size:2.04vh;letter-spacing:0.15vh;}
.laws-helper__title-version{color:#ffffff55;font-size:1.2vh;font-weight:400;margin-left:0.74vh;}
.laws-helper__tabs{display:flex;gap:0.37vh;}
.laws-helper__tab{background:transparent;border-bottom:0.19vh solid transparent;color:#ffffff66;cursor:pointer;font-size:1.3vh;font-weight:700;letter-spacing:0.07vh;padding:0.74vh 1.3vh;transition:all 0.15s ease;}
@media (platform:pc){.laws-helper__tab:hover{color:#ffffffcc;}}
.laws-helper__tab_active{border-bottom:0.19vh solid #ffc14d;color:#ffc14d;}
.laws-helper__header-right{align-items:center;display:flex;gap:0.74vh;margin-left:1.48vh;}
.laws-helper__icon-btn{align-items:center;background:#2c2c2e;border-radius:0.37vh;color:#ffffff99;cursor:pointer;display:flex;flex-direction:column;font-size:1.3vh;font-weight:700;gap:0.28vh;height:3.15vh;justify-content:center;transition:all 0.15s ease;width:3.15vh;}
@media (platform:pc){.laws-helper__icon-btn:hover{background:#3a3a3c;color:#fff;}}
.laws-helper__close-btn{font-size:1.48vh;font-weight:700;letter-spacing:0;}
@media (platform:pc){.laws-helper__close-btn:hover{background:#e25544;color:#fff;}}
.laws-helper__search{align-items:center;background:#232325;border-bottom:0.09vh solid #ffffff14;display:flex;gap:0.93vh;padding:0.93vh 1.67vh;}
.laws-helper__search-icon{align-items:center;display:flex;flex-shrink:0;height:1.67vh;justify-content:center;width:1.67vh;}
.laws-helper__search-icon svg{height:100%;width:100%;}
.laws-helper__search input{-webkit-appearance:none;background:transparent;border:none;color:#fff;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.48vh;outline:none;}
.laws-helper__search input::placeholder{color:#ffffff44;}
.laws-helper__body{display:flex;flex:1 1 auto;overflow:hidden;}
.laws-helper__content{color:#ffffffcc;flex:1 1 auto;font-size:1.67vh;line-height:1.6;overflow-y:auto;padding:1.85vh 2.22vh;width:100%;}
.laws-helper__content::-webkit-scrollbar{width:0.37vh;}
.laws-helper__content::-webkit-scrollbar-thumb{background:#ffffff26;border-radius:0.37vh;}
.laws-helper__content::-webkit-scrollbar-track{background:transparent;}
.laws-helper__placeholder{color:#ffffff44;font-size:1.48vh;font-style:italic;margin-top:2.96vh;text-align:center;}
.laws-helper__wanted-layout{display:flex;flex:1 1 auto;overflow:hidden;width:100%;}
.laws-helper__laws-list{border-right:0.09vh solid #ffffff14;display:flex;flex-direction:column;flex:1 1 auto;overflow-y:auto;padding:0;}
.laws-helper__laws-list::-webkit-scrollbar{width:0.37vh;}
.laws-helper__laws-list::-webkit-scrollbar-thumb{background:#ffffff1a;border-radius:0.37vh;}
.laws-helper__laws-list::-webkit-scrollbar-track{background:transparent;}
.laws-helper__article-row{align-items:flex-start;border-bottom:0.09vh solid #ffffff0a;cursor:pointer;display:flex;gap:1.11vh;padding:1.11vh 1.48vh;transition:background 0.12s ease;}
@media (platform:pc){.laws-helper__article-row:hover{background:#ffffff08;}}
.laws-helper__article-row_checked{background:#ffffff0d;}
.laws-helper__article-check{flex-shrink:0;margin-top:0.19vh;padding-top:0.1vh;}
.laws-helper__checkbox{align-items:center;background:transparent;border:0.15vh solid #ffffff44;border-radius:0.22vh;display:flex;height:1.48vh;justify-content:center;overflow:hidden;transition:all 0.12s ease;width:1.48vh;}
.laws-helper__checkbox_checked{background:#ffc14d;border-color:#ffc14d;}
.laws-helper__checkbox-svg{align-items:center;display:flex;height:100%;justify-content:center;width:100%;}
.laws-helper__checkbox-svg svg{height:0.93vh;width:0.93vh;}
.laws-helper__article-num{color:#ffffff55;flex-shrink:0;font-size:1.3vh;font-weight:600;margin-top:0.09vh;min-width:3.5vh;}
.laws-helper__article-type{border-radius:0.22vh;flex-shrink:0;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;margin-top:0.15vh;padding:0.19vh 0.56vh;}
.laws-helper__article-type_ук{background:#e2554422;color:#e25544;}
.laws-helper__article-type_коап{background:#ffc14d22;color:#ffc14d;}
.laws-helper__article-type_дпс{background:#4caf5022;color:#4caf50;}
.laws-helper__article-type_ппс{background:#2196f322;color:#2196f3;}
.laws-helper__article-info{flex:1 1 auto;}
.laws-helper__article-title{color:#ffffffdd;font-size:1.3vh;font-weight:600;line-height:1.4;}
.laws-helper__article-note{color:#ffffff66;font-size:1.2vh;line-height:1.4;margin-top:0.28vh;}
.laws-helper__article-term{color:#ffffff88;flex-shrink:0;font-size:1.2vh;font-weight:600;margin-top:0.09vh;white-space:nowrap;}
.laws-helper__wanted-panel{background:#1e1e20;border-left:0.09vh solid #ffffff0a;display:flex;flex-direction:column;flex-shrink:0;padding:1.48vh 1.67vh;width:22vh;}
.laws-helper__wanted-title{color:#ffffffcc;font-size:1.2vh;font-weight:700;letter-spacing:0.09vh;margin-bottom:0.56vh;}
.laws-helper__wanted-title-line{background:#ffc14d;border-radius:0.19vh;height:0.19vh;margin-bottom:1.11vh;width:100%;}
.laws-helper__fine-title-line{background:#4caf50!important;}
.laws-helper__wanted-empty{align-items:center;display:flex;flex-direction:column;flex:1 1 auto;gap:0.74vh;justify-content:flex-start;padding-top:1.85vh;}
.laws-helper__wanted-star-icon{align-items:center;display:flex;justify-content:center;}
.laws-helper__wanted-star-icon svg{height:3.7vh;width:3.7vh;}
.laws-helper__wanted-empty-text{display:flex;flex-direction:column;gap:0.19vh;text-align:center;}
.laws-helper__wanted-empty-text span{color:#ffffff44;font-size:1.11vh;line-height:1.5;}
.laws-helper__wanted-selected-list{display:flex;flex:1 1 auto;flex-direction:column;gap:0.37vh;margin-bottom:0.74vh;overflow-y:auto;}
.laws-helper__wanted-selected-list::-webkit-scrollbar{width:0.28vh;}
.laws-helper__wanted-selected-list::-webkit-scrollbar-thumb{background:#ffffff1a;border-radius:0.19vh;}
.laws-helper__wanted-sel-item{align-items:center;border-bottom:0.09vh solid #ffffff0a;display:flex;gap:0.56vh;padding:0.37vh 0;}
.laws-helper__wanted-sel-num{color:#ffc14d;font-size:1.11vh;font-weight:700;}
.laws-helper__wanted-sel-title{color:#ffffffcc;flex:1 1 auto;font-size:1.11vh;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.laws-helper__wanted-sel-term{color:#ffffff66;font-size:1.11vh;font-weight:600;white-space:nowrap;}
.laws-helper__fine-sel-amount{color:#4caf50;font-size:1.11vh;font-weight:600;white-space:nowrap;}
.laws-helper__wanted-stars-row{align-items:baseline;display:flex;gap:0.56vh;justify-content:space-between;margin-top:auto;padding-top:1.11vh;}
.laws-helper__wanted-stars-label{color:#ffffff66;font-size:1.11vh;font-weight:600;letter-spacing:0.04vh;}
.laws-helper__wanted-stars-value{color:#ffc14d;font-size:1.67vh;font-weight:700;}
.laws-helper__fine-total{color:#4caf50;font-size:1.48vh;font-weight:700;}
.laws-helper__wanted-id-label{color:#ffffff55;font-size:1.11vh;font-weight:700;letter-spacing:0.07vh;margin-bottom:0.56vh;margin-top:1.11vh;}
.laws-helper__wanted-id-input{-webkit-appearance:none;background:#2a2a2c;border:0.09vh solid #ffffff1a;border-radius:0.37vh;box-sizing:border-box;color:#fff;font-family:"Open Sans",Arial,sans-serif;font-size:1.3vh;outline:none;padding:0.74vh 0.93vh;width:100%;}
.laws-helper__wanted-id-input::placeholder{color:#ffffff44;}
.laws-helper__wanted-btns{display:flex;gap:0.56vh;margin-top:0.93vh;}
.laws-helper__wanted-btn{border:none;border-radius:0.37vh;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;padding:0.93vh 0.37vh;transition:opacity 0.15s ease;}
@media (platform:pc){.laws-helper__wanted-btn:hover{opacity:0.85;}}
.laws-helper__wanted-btn_clear{background:#2c2c2e;color:#ffffffcc;}
.laws-helper__wanted-btn_issue{background:#e25544;color:#fff;}
.laws-helper__fine-btn_issue{background:#4caf50;border:none;border-radius:0.37vh;color:#fff;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;padding:0.93vh 0.37vh;transition:opacity 0.15s ease;}
@media (platform:pc){.laws-helper__fine-btn_issue:hover{opacity:0.85;}}
.laws-helper__fine-filter{align-items:center;background:#1a1a1c;border-bottom:0.09vh solid #ffffff0a;display:flex;flex-shrink:0;gap:0.46vh;padding:0.74vh 1.11vh;}
.laws-helper__fine-filter-btn{background:transparent;border:0.09vh solid #ffffff22;border-radius:0.37vh;color:#ffffff66;cursor:pointer;font-size:1.2vh;font-weight:700;padding:0.37vh 0.93vh;transition:all 0.12s ease;}
.laws-helper__fine-filter-btn_active{border-color:#ffffff44;color:#fff;}
.laws-helper__fine-filter-btn_dps.laws-helper__fine-filter-btn_active{background:#4caf5022;border-color:#4caf5066;color:#4caf50;}
.laws-helper__fine-filter-btn_pps.laws-helper__fine-filter-btn_active{background:#2196f322;border-color:#2196f366;color:#2196f3;}
/* ─── МЕНЮ /dahk ─────────────────────────────────────────── */
.laws-helper__dahk{display:flex;flex:1 1 auto;flex-direction:column;overflow:hidden;}
.lh-dahk__breadcrumb{align-items:center;background:#1a1a1c;border-bottom:0.09vh solid #ffffff0d;display:flex;flex-shrink:0;gap:0.74vh;min-height:3.33vh;padding:0 1.48vh;}
.lh-dahk__back{align-items:center;color:#ffffff55;cursor:pointer;display:flex;font-size:1.2vh;font-weight:600;gap:0.37vh;letter-spacing:0.04vh;padding:0.56vh 0.74vh;transition:color 0.12s ease;}
.lh-dahk__back svg{height:1.3vh;width:1.3vh;}
.lh-dahk__back span{font-size:1.2vh;}
@media (platform:pc){.lh-dahk__back:hover{color:#ffffffcc;}}
.lh-dahk__breadcrumb-path{color:#ffffff33;font-size:1.11vh;font-weight:700;letter-spacing:0.07vh;margin-left:auto;padding-right:0.37vh;text-transform:uppercase;}
.lh-dahk__list{display:flex;flex:1 1 auto;flex-direction:column;gap:0;overflow-y:auto;padding:0.56vh 0;}
.lh-dahk__list::-webkit-scrollbar{width:0.37vh;}
.lh-dahk__list::-webkit-scrollbar-thumb{background:#ffffff1a;border-radius:0.37vh;}
.lh-dahk__list::-webkit-scrollbar-track{background:transparent;}
.lh-dahk__item{align-items:center;border-bottom:0.09vh solid #ffffff06;cursor:pointer;display:flex;gap:1.11vh;padding:1.11vh 1.85vh;transition:background 0.1s ease;}
@media (platform:pc){.lh-dahk__item:hover{background:#ffffff08;}}
.lh-dahk__item_on{background:#ffc14d0a;}
.lh-dahk__item-icon{flex-shrink:0;font-size:1.48vh;width:2vh;}
.lh-dahk__item-label{color:#ffffffdd;flex:1 1 auto;font-size:1.3vh;font-weight:600;}
.lh-dahk__arrow{color:#ffffff33;font-size:1.67vh;font-weight:300;}
.lh-dahk__badge{border-radius:0.22vh;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;padding:0.19vh 0.56vh;}
.lh-dahk__badge_on{background:#4caf5022;color:#4caf50;}
.lh-dahk__badge_off{background:#e2554422;color:#e25544;}
.lh-dahk__input-screen{align-items:center;display:flex;flex:1 1 auto;flex-direction:column;justify-content:center;padding:2.22vh 3.7vh;}
.lh-dahk__input-screen-title{color:#fff;font-size:1.67vh;font-weight:700;letter-spacing:0.09vh;margin-bottom:0.56vh;text-align:center;text-transform:uppercase;}
.lh-dahk__input-screen-sub{color:#ffffff55;font-size:1.2vh;margin-bottom:1.67vh;text-align:center;}
.lh-dahk__input{-webkit-appearance:none;background:#232325;border:0.09vh solid #ffffff1a;border-radius:0.37vh;box-sizing:border-box;color:#fff;font-family:"Open Sans",Arial,sans-serif;font-size:1.3vh;outline:none;padding:0.74vh 1.11vh;transition:border-color 0.12s ease;width:100%;}
.lh-dahk__input::placeholder{color:#ffffff44;}
.lh-dahk__input:focus{border-color:#ffffff44;}
.lh-dahk__input_big{font-size:1.67vh;margin-bottom:1.48vh;padding:1.11vh 1.48vh;text-align:center;}
.lh-dahk__input_time{text-align:center;width:8vh;}
.lh-dahk__time-row{align-items:center;display:flex;gap:0.74vh;margin-bottom:1.48vh;}
.lh-dahk__time-sep{color:#ffffff55;font-size:2vh;font-weight:700;}
.lh-dahk__action-btns{display:flex;gap:0.74vh;width:100%;}
.lh-dahk__btn{border:none;border-radius:0.37vh;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.2vh;font-weight:700;letter-spacing:0.04vh;padding:0.93vh;transition:opacity 0.15s ease;}
@media (platform:pc){.lh-dahk__btn:hover{opacity:0.85;}}
.lh-dahk__btn_cancel{background:#2c2c2e;color:#ffffffcc;}
.lh-dahk__btn_confirm{background:#ffc14d;color:#1c1c1e;}
.lh-dahk__input-row{align-items:center;display:flex;gap:0.74vh;margin-bottom:0.74vh;padding:0.74vh 1.48vh 0;}
.lh-dahk__input-label{color:#ffffff55;flex-shrink:0;font-size:1.11vh;font-weight:700;letter-spacing:0.07vh;}
.lh-dahk__confirm-btn{background:#ffc14d;border:none;border-radius:0.37vh;color:#1c1c1e;cursor:pointer;flex-shrink:0;font-family:"Open Sans",Arial,sans-serif;font-size:1.11vh;font-weight:700;padding:0.56vh 1.11vh;}
.lh-dahk__item-icon_svg{align-items:center;color:rgba(255,255,255,0.55);display:flex;height:1.85vh;justify-content:center;width:1.85vh;}
.lh-dahk__item_on .lh-dahk__item-icon_svg{color:rgba(255,193,77,0.8);}
.lh-dahk__item-icon_svg svg{height:100%;width:100%;}
.lh-dahk__partner-section{background:#1a1a1c;border-bottom:0.09vh solid #ffffff0d;flex-shrink:0;padding:0.74vh 0 0.37vh;}
.lh-dahk__partner-current{align-items:center;display:flex;gap:0.74vh;justify-content:space-between;padding:0 1.48vh 0.56vh;}
.lh-dahk__partner-id-display{background:#2c2c2e;border-radius:0.22vh;color:#ffc14d;font-size:1.11vh;font-weight:700;letter-spacing:0.04vh;padding:0.19vh 0.74vh;}`;
		document.head.appendChild(_style);
		// ── Гарантируем что худ и чат остаются видимыми ──────────────
		// IntLoad регистрирует hideHud:false, hideChat:false, но на всякий
		// случай явно показываем их если движок успел скрыть
		try {
			if(typeof window.showHud==="function") window.showHud();
			if(typeof window.showChat==="function") window.showChat();
			// Альтернативные API некоторых версий движка
			if(typeof window._setHudVisible==="function") window._setHudVisible(true);
			if(typeof window._setChatVisible==="function") window._setChatVisible(true);
		} catch(e) {}
		const openMode=window._duranOpenMode||null;
		window._duranOpenMode=null;
		this.mode=openMode;
		if(openMode==="fine"){
			this.currentTab=this.tabs.findIndex(t=>t.key==="fines");
			if(this.currentTab<0)this.currentTab=0;
			if(window._duranFineTargetId&&window._duranFineTargetId!==-1){
				this.fineId=String(window._duranFineTargetId);
			}
		} else if(openMode==="wanted"){
			this.currentTab=this.tabs.findIndex(t=>t.key==="wanted");
			if(this.currentTab<0)this.currentTab=0;
			if(window._duranWantedTargetId&&window._duranWantedTargetId!==-1){
				this.wantedId=String(window._duranWantedTargetId);
			}
		} else {
			// Открыт без режима — дефолт на МЕНЮ
			this.currentTab=0;
			// Если IntLoad задал начальный уровень (showPovsednevMenuPage / showStroyMenuPage)
			const initLevel=window._duranInitLevel||null;
			window._duranInitLevel=null;
			if(initLevel==="povsednev"||initLevel==="stroy"){
				this.dahkLevel=initLevel;
			}
			// Предзаполняем targetId если пришёл из mvdN
			const tId=window._duranTargetId;
			window._duranTargetId=null;
			if(tId!=null&&tId!==-1&&tId!==""){
				this.dahkTargetId=String(tId);
			}
		}
		this._prevOnKeyUp=window.onKeyUp;
		window.onKeyUp=(e)=>{
			if(e===window.KEY_CODE_ESC){this.close();return}
			if(typeof this._prevOnKeyUp==="function")this._prevOnKeyUp(e)
		}
	},
	unmounted(){
		window.onKeyUp=this._prevOnKeyUp;
		const s=document.getElementById("laws-helper-style");
		if(s)s.remove()
	},
	methods:{
		selectTab(i){this.currentTab=i;this.search=""},
		// ════════════════════════════════════════════════════
		//  РОЗЫСК
		// ════════════════════════════════════════════════════
		toggleArticle(id){
			const idx=this.selectedArticles.indexOf(id);
			if(idx===-1)this.selectedArticles.push(id);
			else this.selectedArticles.splice(idx,1)
		},
		clearWanted(){this.selectedArticles=[];this.wantedId="";window._duranWantedTargetId=null},
		issueWanted(){
			const id=this.wantedId.trim();
			if(!id||this.selectedArticles.length===0)return;
			const totalStars=this.totalTerm;
			const lastCode=this.selectedArticleObjects.map(a=>a.num+" УК").join(", ");
			if(window._mvdSetLastWantedCode)window._mvdSetLastWantedCode(lastCode);
			const cmd=`/su ${id} ${totalStars}`;
			if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
			else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
			this.close()
		},
		// ════════════════════════════════════════════════════
		//  ШТРАФЫ
		// ════════════════════════════════════════════════════
		toggleFineArticle(id){
			const idx=this.selectedFineArticles.indexOf(id);
			if(idx===-1)this.selectedFineArticles.push(id);
			else this.selectedFineArticles.splice(idx,1)
		},
		clearFine(){
			this.selectedFineArticles=[];
			this.fineId="";
			window._duranFineTargetId=null
		},
		issueFine(){
			const id=this.fineId.trim();
			if(!id||this.selectedFineArticles.length===0)return;
			const arts=this.selectedFineArticleObjects;
			arts.forEach((art,i)=>{
				setTimeout(()=>{
					const cmd=`/ticket ${id} ${art.fine} ${art.num} КоАП`;
					if(typeof window.sendChatInput==="function")window.sendChatInput(cmd);
					else if(typeof window.sendChatMessage==="function")window.sendChatMessage(cmd);
				},i*500);
			});
			this.close()
		},
		// ════════════════════════════════════════════════════
		//  МЕНЮ /dahk — навигация
		// ════════════════════════════════════════════════════
		dahkNav(level){
			this.dahkLevelHistory.push(this.dahkLevel);
			this.dahkLevel=level;
		},
		dahkBack(){
			if(this.dahkLevelHistory.length>0){
				this.dahkLevel=this.dahkLevelHistory.pop();
			} else {
				this.dahkLevel="main";
			}
			this.dahkPendingAction=null;
			this.dahkTargetId="";
			this.dahkHour="";
			this.dahkMinute="";
			this.dahkTrackingId="";
		},
		// Состояние тогглов из mvdN
		dahkToggleState(id){
			try{
				const st=typeof window._mvdGetState==="function"?window._mvdGetState():{};
				if(id==="tracking")       return !!st.currentScanId;
				if(id==="autocuff")       return !!st.autoCuffEnabled;
				if(id==="partner_track")  return !!st.partnerTrackingEnabled;
				if(id==="partner_message")return !!st.partnerMessageEnabled;
			}catch(e){}
			return false;
		},
		// Клик по главному меню
		dahkMainClick(item){
			if(item.id==="povsednev"){ this.dahkNav("povsednev"); return; }
			if(item.id==="stroy"){     this.dahkNav("stroy");     return; }
			if(item.id==="naparnick"){ this.dahkNav("naparnick"); return; }
			if(item.id==="tracking"){
				const active=this.dahkToggleState("tracking");
				if(active){
					// Стоп отслеживания
					if(typeof window.showMvdSubMenu==="function"){
						// Через mvdN API — имитируем HandleMvdSubCommand("tracking")
						if(typeof window._mvdStopTracking==="function") window._mvdStopTracking();
						else if(window.sendChatInput) window.sendChatInput("/pg stop");
					}
				} else {
					this.dahkNav("trackingInput");
				}
				return;
			}
			if(item.id==="autocuff"){
				// Тогглим autocuff через mvdN
				if(typeof window._mvdToggleAutoCuff==="function") window._mvdToggleAutoCuff();
				// Форсируем ре-рендер
				this.$forceUpdate();
				return;
			}
		},
		// Клик по действию повседневной
		dahkActionClick(item){
			if(item.special==="fine"){
				// Открываем ШТРАФЫ в том же интерфейсе
				const fineIdx=this.tabs.findIndex(t=>t.key==="fines");
				if(fineIdx>=0){this.currentTab=fineIdx;}
				return;
			}
			if(item.special==="wanted"){
				// Открываем РОЗЫСК в том же интерфейсе
				const wantedIdx=this.tabs.findIndex(t=>t.key==="wanted");
				if(wantedIdx>=0){this.currentTab=wantedIdx;}
				return;
			}
			this.dahkPendingAction=item;
			if(item.needsId){
				// Предзаполняем ID из giveLicenseTo если есть
				const preId=window._mvdGiveLicenseTo;
				if(preId&&preId!==-1&&preId!==-0) this.dahkTargetId=String(preId);
				else this.dahkTargetId="";
				this.dahkNav("inputId");
			} else {
				this.dahkExecute(item.id,null);
			}
		},
		// Клик по пункту строя
		dahkStroyClick(item){
			if(item.sub){
				this.dahkNav(item.sub);
				return;
			}
			this.dahkPendingAction=item;
			if(item.needsHour){
				this.dahkHour="";
				this.dahkMinute="";
				this.dahkNav("inputHour");
			} else {
				this.dahkExecuteStroy(item.id,null,null);
			}
		},
		// Клик по подпункту (лекция/тренировка/спец)
		dahkSubClick(item){
			this.dahkPendingAction=item;
			this.dahkExecuteStroy(item.id,null,null);
		},
		// Клик по пункту напарника
		dahkNaparnickToggle(item){
			if(item.id==="partner_track"){
				const active=this.dahkToggleState("partner_track");
				if(active){
					// Уже включён — выключаем
					if(typeof window._mvdTogglePartnerTrack==="function") window._mvdTogglePartnerTrack();
					else { window._mvdPartnerTrackEnabled=false; window._mvdPartnerNick=null; window._mvdPartnerId=null; }
				} else {
					// Выключен — нужен ID напарника
					const curId=window._mvdPartnerId||window._pendingPartnerId;
					if(curId){
						// ID уже известен — просто включаем
						if(typeof window._mvdTogglePartnerTrack==="function") window._mvdTogglePartnerTrack();
						else window._mvdPartnerTrackEnabled=true;
					} else {
						// Запрашиваем ID
						this.dahkPartnerIdInput="";
						// НЕ навигируем, input-row уже виден на экране naparnick
					}
				}
			} else if(item.id==="partner_message"){
				if(typeof window._mvdTogglePartnerMessage==="function") window._mvdTogglePartnerMessage();
				else window._mvdPartnerMessageEnabled=!window._mvdPartnerMessageEnabled;
			}
			this.$forceUpdate();
		},
		dahkSetPartner(){
			const id=this.dahkPartnerIdInput.trim();
			if(!id)return;
			// Сохраняем ID напарника
			window._pendingPartnerId=id;
			window._mvdPartnerId=id;
			if(typeof window._mvdSetPartnerId==="function"){
				window._mvdSetPartnerId(id);
			} else {
				if(typeof window.sendChatInput==="function") window.sendChatInput(`/id ${id}`);
			}
			// Автоматически включаем отслеживание после задания ID
			setTimeout(()=>{
				if(!this.dahkToggleState("partner_track")){
					if(typeof window._mvdTogglePartnerTrack==="function") window._mvdTogglePartnerTrack();
					else window._mvdPartnerTrackEnabled=true;
				}
				this.$forceUpdate();
			},300);
			this.dahkPartnerIdInput="";
		},
		// Подтверждение ввода ID → выполнить действие
		dahkConfirmAction(){
			const id=this.dahkTargetId.trim();
			if(!id||!this.dahkPendingAction)return;
			const action=this.dahkPendingAction;
			this.dahkBack(); // возврат к списку
			this.dahkExecute(action.id,id);
		},
		// Подтверждение ввода часа/минуты строя
		dahkConfirmHour(){
			const h=this.dahkHour.trim()||"00";
			const m=this.dahkMinute.trim()||"00";
			const action=this.dahkPendingAction;
			this.dahkBack();
			this.dahkExecuteStroy(action.id,h,m);
		},
		// Подтверждение ввода ID для отслеживания
		dahkConfirmTracking(){
			const id=this.dahkTrackingId.trim();
			if(!id)return;
			this.dahkBack();
			// Запускаем отслеживание через mvdN API
			if(typeof window._mvdStartTracking==="function"){
				window._mvdStartTracking(id);
			} else if(typeof window.sendChatInput==="function"){
				window.sendChatInput(`/setmark ${id}`);
				window.sendChatInput(`/pg ${id}`);
			}
			this.close();
		},
		// Выполнение действия повседневной
		dahkExecute(action,targetId){
			const send=window.sendChatInput||window.sendChatMessage;
			if(!send)return;
			const delay=(msgs,delays)=>{
				msgs.forEach((m,i)=>setTimeout(()=>send(m),delays[i]||0));
			};
			switch(action){
				case"greeting":
					delay([
						`Здравия желаю, Вас беспокоит ${window._mvdRANK||""} - ${window._mvdFIRST_NAME||""} ${window._mvdLAST_NAME||""}.`,
						`/doc ${targetId}`
					],[0,1000]);break;
				case"checkDocuments":
					delay([
						"Будьте добры предъявить Ваши документы, а именно:",
						"Паспорт, вод.права и документы на т/с.",
						"/n /pass [id], /carpass [id]",
						"А также, отстегните пожалуйста ремень безопасности.",
						"/n /rem"
					],[0,1000,1000,1000,1000]);break;
				case"studyDocuments":
					delay([
						"/me взял документы","/do Документы в руке.",
						"/me открыл документы на нужной странице","/do Документы открыты.",
						"/me осмотрел страницу","/do Страница осмотрена.",
						"/me закрыл документы","/do Документы закрыты.",
						"/me вернул документы"
					],[0,1500,1500,1500,1500,1500,1500,1500,1500]);break;
				case"scanningTablet":
					delay([
						"/me достал фоторобот из кармана","/do Фоторобот в руке.",
						"/me сделал снимок лица, затем сравнил с подозреваемым",
						"Вы задержаны так как находитесь в федеральном розыске."
					],[0,1000,1000,1000]);break;
				case"cuffing":
					delay(["/do Наручники в руке.","/me надел наручники на человека напротив",`/cuff ${targetId}`],[0,300,300]);break;
				case"putInCar":
					delay(["/me открыл дверь автомобиля","/do Дверь открыта.","/me посадил преступника в патрульный автомобиль",`/putpl ${targetId}`],[0,1000,1000,1000]);break;
				case"arrest":
					delay(["/me открыл двери ППС","/do Двери открыты.","/me провел человека в участок","/do Человек в участке.",`/arrest ${targetId}`],[0,1000,1000,1000,1000]);break;
				case"uncuffing":
					delay(["/me снял наручники с преступника","/me повесил наручники на пояс","/do Наручники на поясе.",`/uncuff ${targetId}`,"/me отпустил преступника","/do Человек свободен.",`/escort ${targetId}`],[0,600,600,600,600,600,600]);break;
				case"chase":
					delay(["/me взял рацию в руки","/do Рация в руках.","/me сообщил диспетчеру, о погоне за нарушителем",`/Pg ${targetId}`],[0,500,500,500]);break;
				case"search":
					delay(["Сейчас я проведу у вас обыск.","Повернитесь спиной и поднимите руки.","/me достал резиновые перчатки","/me надел перчатки на руки","/me провёл руками по верхним частям тела","/me провёл руками по нижним частям тела",`/search ${targetId}`],[0,1000,1004,1007,1010,1000,1000]);break;
				case"escort":
					delay(["/me схватил задержанного за руки","/me заломал задержанного и повёл задержанного",`/escort ${targetId}`],[0,300,300]);break;
				case"clearWanted":
					delay(["/me взял рацию в руки, затем зажал кнопку","/do Кнопка зажата.","/me сообщил данные подозреваемого диспетчеру","/do Данные сообщены диспетчеру.","/do Диспетчер: С подозреваемого снят розыск.",`/clear ${targetId}`],[0,700,700,700,700,700]);break;
				case"confiscate":
					delay(["Я нащупал что то.","/me аккуратно нащупал и достал запрещенный предмет/вещество","/do Пакет для вещественных докозательств в кармане.","/me достал этот пакет и положил туда запрещенную вещь/вещество и закрыл пакет",`/remove ${targetId}`],[0,500,500,500,500]);break;
				case"breakGlass":
					delay(["/me открыл дверь авто.","/me вытащил человека с авто",`/ejectout ${targetId}`],[0,300,300]);break;
				case"removeMask":
					delay(["/do Человек напротив находится в маске.","/me протянув правую руку вперёд, сорвал маску с лица у человека напротив","/do Маска сорвана, человек находится без маски на лице.","/n Команда для снятие маски: /reset или /maskoff"],[0,400,400,400]);break;
				case"fingerprint":
					delay(["/do Аппарат 'CТОЛ' в кармане.","/me резким движением достал Аппарат","/do Аппарат 'СТОЛ' в руке.","/me резким движением потянул руку гражданина напротив и приложил его палец к аппарату","/do Процесс сканирования начат.","/do Процесс завершен.","/do Личность установлена."],[0,700,700,700,700,700,700]);break;
				case"takeLicense":
					delay(["/me взял права, затем переложил их в левую руку","/me взял блокнот и ручку в правую руку","/do Блокнот и ручка в руке.","/me записал данные о нарушении и нарушителе в блокнот","/do Данные заполнены.","/me забрал водительские права","/do Водительские права изъяты.",`/takelic ${targetId}`],[0,1000,1000,1000,1000,1000,1000,1000]);break;
				case"miranda":
					delay(["Вы задержаны. Вам необходимо знать ваши права.","Вы имеете право хранить молчание.","Вы имеете право на получение адвокатской помощи.","Вы имеете право на обжалование действий сотрудника силовой структуры.","Вам ясны ваши права?"],[0,1500,1500,1500,1500]);break;
			}
			this.close();
		},
		// Выполнение действия строя
		dahkExecuteStroy(action,hour,minute){
			const send=window.sendChatInput||window.sendChatMessage;
			if(!send)return;
			const delay=(msgs,delays)=>msgs.forEach((m,i)=>setTimeout(()=>send(m),delays[i]||0));
			const tag=window._mvdRANK_TAG||`[${window._mvdRANK||"МВД"}]`;
			switch(action){
				case"stroy1":
					delay([`/r ${tag} Внимание.`,`/r ${tag} Прошу прийти на плац.`,`/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.`,`/r ${tag} Касается это всего младшего состава.`,`/r ${tag} Спасибо за внимание.`],[0,1700,1700,1700,1700]);break;
				case"stroy2":
					delay([`/r ${tag} Внимание.*Повторяя*`,`/r ${tag} Прошу прийти на плац.*Повторяя*`,`/r ${tag} Напомню, строй начнется в ${hour}:${minute} по МСК.*Повторяя*`,`/r ${tag} Касается это всего младшего состава.*Повторяя*`,`/r ${tag} Спасибо за внимание.*Повторяя*`],[0,1500,1500,1500,1500]);break;
				case"ust1":
					delay(["/s Итак бойцы, сейчас я вам проведу лекцию на тему \"Устав\".","/s Устав устанавливает стандарты служебной деятельности.","/s Следование Уставу способствует дисциплине. Каждый сотрудник обязан знать свои права и обязанности","/s Знать устав - ваша обязанность. Незнание не освобождает от наказания.","/s Следование Уставу положительно сказывается на нашем имидже в глазах граждан","/s Соблюдение Устава — это не только ваша обязанность, но и залог успешной службы.","/s Лекция окончена.","/c 060"],[0,1000,1000,1000,1000,1000,1000,1000]);break;
				case"sub1":
					delay(["/s Коллеги,я хочу прочитать лекцию на тему \"Субординцация\"","/s В силовых структурах нет слов: \"можно\",\"да\",\"нет\",\"привет\"","/s Обращаться нужно так:","/s \"Разрешите\",\"Так точно\",\"Никак нет\",\"Здравия желаю\"","/s Ко всем обращаться строго по званию.К примеру:","Т.Полковник,т.Сержант,т.Подполковник и т.д","/s Обращаться ко всем сослуживцам без исключения только на \"Вы\"","/s Запрещенно перечить или огрызаться со старшими по званию.","/s Не соблюдение субординации, это прямое нарушение","/c 060"],[0,2000,2000,2000,2000,2000,2000,2000,2000,2000]);break;
				case"trenya1":
					delay([`/s Здравия. Я ${window._mvdRANK||""} ${window._mvdLAST_NAME||""}.`,"/s Сегодня я проведу вам тренировку","/s Начнём с приседаний."],[0,1700,1700]);break;
				case"trenya2":
					delay(["/s Закончили.","/s Дальше разминка рук.","/n /anim 8 1","/c 60"],[0,1700,1700,1700]);break;
				case"trenya3":
					delay(["/s Закончили.","/s Отжимания.","/n /anim 6 23","/c 60"],[0,1500,1500,1500]);break;
				case"trenya4":
					delay(["/s Закончили.","/s Бег по плацу 3 круга.","/s Без прыжков."],[0,1500,1500]);break;
				case"trenya5":
					delay(["/s Восточное единоборство.","/n /anim 8 2"],[0,1500]);break;
				case"trenya6":
					delay(["/s Закончили.","/s На этом наша тренировка закончена, но не расходимся."],[0,1500]);break;
				case"rp1":
					delay(["/s Хочу вам сказать.","/s У меня для вас есть задания."],[0,1700]);break;
				case"rp2":
					delay(["/s Всем спасибо за помощь.","/s Помогли очень сильно.","/s На этой ноте я хочу вам сказать...","/s Вы свободны, можете идти."],[0,1500,1500,1500]);break;
			}
			this.close();
		},
		close(){window.closeInterface("LawsHelper")}
	}
};

const LawsHelper=_export_sfc(_sfc_main,[["render",render]]);
export{LawsHelper as default};
