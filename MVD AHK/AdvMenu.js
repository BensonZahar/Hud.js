import{o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc,r as resolveComponent,h as createBlock,w as withCtx}from"./index.js";
import{c as toMoscowTime}from"./timeZone.js";
import{M as Modal,a as MODAL_TYPES,b as MODAL_COLOR_TYPES}from"./Modal.js";
import"./AdvMenu.css";
// ─── SVG ─────────────────────────────────────────────────────────────────────
const SVG_GAVEL=`<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="0.5" width="4.5" height="2.5" rx="0.5" transform="rotate(45 9 0.5)" fill="rgba(74,144,217,0.12)" stroke="rgba(74,144,217,0.65)" stroke-width="1.1"/><rect x="4.5" y="5" width="4.5" height="2.5" rx="0.5" transform="rotate(45 4.5 5)" fill="rgba(74,144,217,0.12)" stroke="rgba(74,144,217,0.65)" stroke-width="1.1"/><path d="M1.5 13.5H9" stroke="rgba(74,144,217,0.5)" stroke-width="1.3" stroke-linecap="round"/></svg>`;
const SVG_OK=`<svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L3.5 7.5L10 1" stroke="#3dba7a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_WARN=`<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 1.5L12 10.5H1L6.5 1.5Z" stroke="rgba(249,183,1,0.55)" stroke-width="1.1" fill="rgba(249,183,1,0.07)"/><path d="M6.5 5V8M6.5 9.5V10" stroke="rgba(249,183,1,0.65)" stroke-width="1.1" stroke-linecap="round"/></svg>`;
const SVG_PERSON=`<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.5" cy="4" r="2.3" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 12C1.5 9.5 3.7 7.5 6.5 7.5C9.3 7.5 11.5 9.5 11.5 12" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`;
const SVG_SHIELD_MVD=`<svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1L13 3V7C13 10.5 10.5 13 7.5 14C4.5 13 2 10.5 2 7V3L7.5 1Z" fill="rgba(74,144,217,0.12)" stroke="rgba(74,144,217,0.7)" stroke-width="1.1" stroke-linejoin="round"/><path d="M5.2 7.4L6.9 9.1L9.9 5.9" stroke="rgba(74,144,217,0.9)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_SHIELD_FSIN=`<svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1L13 3V7C13 10.5 10.5 13 7.5 14C4.5 13 2 10.5 2 7V3L7.5 1Z" fill="rgba(226,85,68,0.10)" stroke="rgba(226,85,68,0.65)" stroke-width="1.1" stroke-linejoin="round"/><rect x="5.6" y="6.6" width="3.8" height="3.2" rx="0.5" stroke="rgba(226,85,68,0.9)" stroke-width="1"/><path d="M6.3 6.6V5.6C6.3 4.9 6.8 4.3 7.5 4.3C8.2 4.3 8.7 4.9 8.7 5.6V6.6" stroke="rgba(226,85,68,0.9)" stroke-width="1"/></svg>`;
// ─── SVG-иконки для кнопок (вместо юникод-символов ✓ ✗ → ←, которых нет в
// шрифте Open Sans внутри CEF — они рисовались квадратиками).
// currentColor — иконка наследует цвет текста кнопки и перекрашивается вместе с ней.
const SVG_ARROW_R=`<svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5H10.5M10.5 5L6.5 1M10.5 5L6.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_ARROW_L=`<svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5H1.5M1.5 5L5.5 1M1.5 5L5.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_CHECK=`<svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L3.5 7.5L10 1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_CROSS=`<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L8 8M8 1L1 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
// ─── render ──────────────────────────────────────────────────────────────────
// Раньше AdvMenu рисовал свою собственную «карточку» (фон/рамка/скругление/
// свечение/паттерн) через инжектированный <style>, значения которых были
// вручную скопированы из Modal.css. Теперь — сам компонент Modal (тот же
// подход, что у SideMenu.js). За счёт этого шапка, акцентная рамка/цвет и
// graffiti-паттерн гарантированно один-в-один с остальными диалогами системы.
//
//   type:      MODAL_TYPES.DEFAULT     — с тёмной подложкой (AdvMenu блокирующий
//              диалог, в отличие от SideMenu, который HUD-панель)
//   colorType: MODAL_COLOR_TYPES.BLUE  — синий акцент (#007aff), заменяет
//              кастомный .adv-menu__top-accent (#4a90d9) из старого кода
//   title:     "АДВОКАТ"              — рендерит сам Modal в шапке карточки;
//              кастомные .adv-menu__header / .adv-menu__close-btn удалены
//
// Оверлей: при клике Modal эмитит "close", мы слушаем onClose:$options.close
// и вызываем closeInterface. Кнопка "X" в шапке теперь не нужна — роль
// «закрыть» выполняет клик по подложке (стандарт Window/Modal).
//
// Перетаскивание окна (drag by header) удалено — оно несовместимо с позицио-
// нированием Modal (position:fixed; align-items/justify-content:center).
// Скрытие по Alt-hold: раньше через classList.add('adv-menu_hidden'), теперь
// через $data.menuVisible → prop isOpened Modal-а, что запускает его
// стандартную анимацию показа/скрытия (scale+fade, 0.1 s).
function render(_ctx,_cache,$props,$setup,$data,$options){
    const _component_Modal=resolveComponent("Modal");
    return openBlock(),createBlock(_component_Modal,{
        class:"window adv-menu",
        isOpened:$data.menuVisible,
        colorType:MODAL_COLOR_TYPES.BLUE,
        type:MODAL_TYPES.NO_OVERLAY,
        title:"АДВОКАТ",
        onClose:$options.close
    },{
        default:withCtx(()=>[
            // ════════════════════════════════════════════════════════════════
            // ЭКРАН: rights — Разъяснение прав
            // ════════════════════════════════════════════════════════════════
            $data.screen==="rights"
                ?(openBlock(),createElementBlock(Fragment,{key:"rights"},[
                    createBaseVNode("div",{class:"adv-menu__body"},[
                        createBaseVNode("div",{class:"adv-menu__section-hdr"},[
                            createBaseVNode("span",{class:"adv-menu__section-icon",innerHTML:SVG_GAVEL}),
                            createBaseVNode("span",{class:"adv-menu__section-title"},"Права задержанного — ч.7 ПК"),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__rights-list"},[
                            createBaseVNode("div",{class:"adv-menu__right-item"},[
                                createBaseVNode("div",{class:"adv-menu__right-bullet"}),
                                createBaseVNode("div",{class:"adv-menu__right-text"},"Право на молчание"),
                            ]),
                            createBaseVNode("div",{class:"adv-menu__right-item"},[
                                createBaseVNode("div",{class:"adv-menu__right-bullet"}),
                                createBaseVNode("div",{class:"adv-menu__right-text"},"Право на получение адвокатской помощи"),
                            ]),
                            createBaseVNode("div",{class:"adv-menu__right-item"},[
                                createBaseVNode("div",{class:"adv-menu__right-bullet"}),
                                createBaseVNode("div",{class:"adv-menu__right-text"},"Право на обжалование действий сотрудника"),
                            ]),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__divider"}),
                        createBaseVNode("div",{class:"adv-menu__question"},"Задержанный требует адвоката?"),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer"},[
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_refuse",onClick:$options.refuseLawyer},"Отказался"),
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_request",onClick:$options.goSelectLocation},[
                            createBaseVNode("span",{},"Требует"),
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_R}),
                        ]),
                    ]),
                ],64))
                :createCommentVNode("",true),
            // ════════════════════════════════════════════════════════════════
            // ЭКРАН: select_location — выбор места вызова (МВД / ФСИН)
            // ════════════════════════════════════════════════════════════════
            $data.screen==="select_location"
                ?(openBlock(),createElementBlock(Fragment,{key:"select_location"},[
                    createBaseVNode("div",{class:"adv-menu__body"},[
                        createBaseVNode("div",{class:"adv-menu__section-hdr"},[
                            createBaseVNode("span",{class:"adv-menu__section-icon",innerHTML:SVG_PERSON}),
                            createBaseVNode("span",{class:"adv-menu__section-title"},"Вызов адвоката"),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__question"},"Куда требуется адвокат?"),
                        createBaseVNode("div",{class:"adv-menu__loc-list"},[
                            // div, а не button — button в CEF не наследует font-family (квадратики)
                            createBaseVNode("div",{class:"adv-menu__loc-card adv-menu__loc-card_mvd",onClick:$options.requestLawyerMvd},[
                                createBaseVNode("span",{class:"adv-menu__loc-icon",innerHTML:SVG_SHIELD_MVD}),
                                createBaseVNode("span",{class:"adv-menu__loc-info"},[
                                    createBaseVNode("span",{class:"adv-menu__loc-name"},"МВД"),
                                    createBaseVNode("span",{class:"adv-menu__loc-desc"},"Отдел внутренних дел"),
                                ]),
                                createBaseVNode("span",{class:"adv-menu__loc-arrow",innerHTML:SVG_ARROW_R}),
                            ]),
                            createBaseVNode("div",{class:"adv-menu__loc-card adv-menu__loc-card_fsin",onClick:$options.requestLawyerFsin},[
                                createBaseVNode("span",{class:"adv-menu__loc-icon",innerHTML:SVG_SHIELD_FSIN}),
                                createBaseVNode("span",{class:"adv-menu__loc-info"},[
                                    createBaseVNode("span",{class:"adv-menu__loc-name"},"ФСИН"),
                                    createBaseVNode("span",{class:"adv-menu__loc-desc"},"СИЗО / исправительное учреждение"),
                                ]),
                                createBaseVNode("span",{class:"adv-menu__loc-arrow",innerHTML:SVG_ARROW_R}),
                            ]),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__hint"},[
                            createBaseVNode("span",{class:"adv-menu__hint-icon",innerHTML:SVG_WARN}),
                            createBaseVNode("span",{class:"adv-menu__hint-text"},"Вызов будет отправлен в /d с указанием места (время — серверное, МСК)"),
                        ]),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer"},[
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_back",onClick:$options.goBack},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_L}),
                            createBaseVNode("span",{},"Назад"),
                        ]),
                    ]),
                ],64))
                :createCommentVNode("",true),
            // ════════════════════════════════════════════════════════════════
            // ЭКРАН: awaiting_accept — 5 мин на принятие вызова
            // ════════════════════════════════════════════════════════════════
            $data.screen==="awaiting_accept"
                ?(openBlock(),createElementBlock(Fragment,{key:"awaiting_accept"},[
                    createBaseVNode("div",{class:"adv-menu__body"},[
                        createBaseVNode("div",{class:"adv-menu__call-sent"},[
                            createBaseVNode("span",{class:"adv-menu__call-sent-icon",innerHTML:SVG_OK}),
                            createBaseVNode("span",{},"Вызов отправлен в /d"),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__call-info"},[
                            createBaseVNode("span",{class:"adv-menu__call-info-label"},"Время вызова (МСК):"),
                            createBaseVNode("span",{class:"adv-menu__call-info-val"},toDisplayString($data.callTime)),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__call-info"},[
                            createBaseVNode("span",{class:"adv-menu__call-info-label"},"Место вызова:"),
                            createBaseVNode("span",{class:"adv-menu__call-info-val "+($data.location==="ФСИН"?"adv-menu__call-info-val_fsin":"")},toDisplayString($data.location)),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__phase-label"},"Ожидание принятия вызова"),
                        // id="adv-timer-disp" — обновляется напрямую через DOM (CEF-fix)
                        createBaseVNode("div",{id:"adv-timer-disp",class:"adv-menu__timer-display"},toDisplayString($options.timerDisplay)),
                        createBaseVNode("div",{class:"adv-menu__progress-track"},[
                            // id="adv-progress-bar" — ширина/класс warn обновляются напрямую
                            createBaseVNode("div",{id:"adv-progress-bar",class:"adv-menu__progress-fill",style:`width:${$options.timerPercent}%`}),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__phase-note"},"Время на принятие: 5 минут"),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer"},[
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_accept",onClick:$options.lawyerAccepted},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_CHECK}),
                            createBaseVNode("span",{},"Принял"),
                        ]),
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_timeout",onClick:$options.lawyerNotAccepted},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_CROSS}),
                            createBaseVNode("span",{},"Не принял"),
                        ]),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer-nav"},[
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_back",onClick:$options.goBack},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_L}),
                            createBaseVNode("span",{},"Назад"),
                        ]),
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_skip",onClick:$options.goSkip},[
                            createBaseVNode("span",{},"Пропустить"),
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_R}),
                        ]),
                    ]),
                ],64))
                :createCommentVNode("",true),
            // ════════════════════════════════════════════════════════════════
            // ЭКРАН: awaiting_arrival — 10 мин на приезд
            // ════════════════════════════════════════════════════════════════
            $data.screen==="awaiting_arrival"
                ?(openBlock(),createElementBlock(Fragment,{key:"awaiting_arrival"},[
                    createBaseVNode("div",{class:"adv-menu__body"},[
                        createBaseVNode("div",{class:"adv-menu__phase-badge adv-menu__phase-badge_arrival"},[
                            createBaseVNode("span",{class:"adv-menu__phase-badge-icon",innerHTML:SVG_PERSON,style:"color:#f9b701"}),
                            createBaseVNode("span",{},"Адвокат принял вызов"),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__phase-label"},"Ожидание приезда адвоката"),
                        createBaseVNode("div",{id:"adv-timer-disp",class:"adv-menu__timer-display adv-menu__timer-display_arrival"},toDisplayString($options.timerDisplay)),
                        createBaseVNode("div",{class:"adv-menu__progress-track"},[
                            createBaseVNode("div",{id:"adv-progress-bar",class:"adv-menu__progress-fill adv-menu__progress-fill_arrival",style:`width:${$options.timerPercent}%`}),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__phase-note"},"Время на приезд: 10 минут"),
                        createBaseVNode("div",{class:"adv-menu__hint"},[
                            createBaseVNode("span",{class:"adv-menu__hint-icon",innerHTML:SVG_WARN}),
                            createBaseVNode("span",{class:"adv-menu__hint-text"},"После прибытия адвокату положено 10 мин беседы с задержанным"),
                        ]),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer"},[
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_accept",onClick:$options.lawyerArrived},"Прибыл"),
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_timeout",onClick:$options.lawyerNotArrived},"Не прибыл"),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer-nav"},[
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_back",onClick:$options.goBack},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_L}),
                            createBaseVNode("span",{},"Назад"),
                        ]),
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_skip",onClick:$options.goSkip},[
                            createBaseVNode("span",{},"Пропустить"),
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_R}),
                        ]),
                    ]),
                ],64))
                :createCommentVNode("",true),
            // ════════════════════════════════════════════════════════════════
            // ЭКРАН: in_consultation — 10 мин беседы
            // ════════════════════════════════════════════════════════════════
            $data.screen==="in_consultation"
                ?(openBlock(),createElementBlock(Fragment,{key:"in_consultation"},[
                    createBaseVNode("div",{class:"adv-menu__body"},[
                        createBaseVNode("div",{class:"adv-menu__phase-badge adv-menu__phase-badge_consult"},[
                            createBaseVNode("span",{class:"adv-menu__phase-badge-icon",innerHTML:SVG_PERSON,style:"color:#a07bd4"}),
                            createBaseVNode("span",{},"Беседа адвоката с задержанным"),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__phase-label"},"Идёт беседа"),
                        createBaseVNode("div",{id:"adv-timer-disp",class:"adv-menu__timer-display adv-menu__timer-display_consult"},toDisplayString($options.timerDisplay)),
                        createBaseVNode("div",{class:"adv-menu__progress-track"},[
                            createBaseVNode("div",{id:"adv-progress-bar",class:"adv-menu__progress-fill adv-menu__progress-fill_consult",style:`width:${$options.timerPercent}%`}),
                        ]),
                        createBaseVNode("div",{class:"adv-menu__phase-note"},"Время беседы: 10 минут"),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer"},[
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_done",onClick:$options.consultationDone},"Беседа завершена"),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer-nav"},[
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_back",onClick:$options.goBack},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_L}),
                            createBaseVNode("span",{},"Назад"),
                        ]),
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_skip",onClick:$options.goSkip},[
                            createBaseVNode("span",{},"Пропустить"),
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_R}),
                        ]),
                    ]),
                ],64))
                :createCommentVNode("",true),
            // ════════════════════════════════════════════════════════════════
            // ЭКРАН: done states
            // ════════════════════════════════════════════════════════════════
            ($data.screen==="done_no_lawyer"||$data.screen==="done_no_accept"||$data.screen==="done_not_arrived"||$data.screen==="done_complete")
                ?(openBlock(),createElementBlock(Fragment,{key:"done"},[
                    createBaseVNode("div",{class:"adv-menu__body adv-menu__body_done"},[
                        createBaseVNode("div",{class:"adv-menu__done-icon",innerHTML:$data.screen==="done_complete"?SVG_OK:SVG_WARN}),
                        createBaseVNode("div",{class:"adv-menu__done-title"},toDisplayString($options.doneTitle)),
                        createBaseVNode("div",{class:"adv-menu__done-text"},toDisplayString($options.doneText)),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer"},[
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_back",onClick:$options.goBack},[
                            createBaseVNode("span",{class:"adv-menu__btn-ic",innerHTML:SVG_ARROW_L}),
                            createBaseVNode("span",{},"Начало"),
                        ]),
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_close",onClick:$options.close},"Закрыть"),
                    ]),
                ],64))
                :createCommentVNode("",true),
        ]),
        _:1
    });
}
// ─── Компонент ───────────────────────────────────────────────────────────────
const _sfc_main={
name:"AdvMenu",
// Modal регистрируем локально — так же, как делает SideMenu.js. resolveComponent
// в render() найдёт его через локальный реестр компонента без global-регистрации.
components:{Modal},
data(){
    return{
        screen:"rights",
        location:null,      // "МВД" | "ФСИН" — выбирается перед вызовом
        callTime:null,
        timerSeconds:0,
        timerTotal:300,
        timerInterval:null,
        timerPhase:null,
        timerEndAt:0,
        // ── menuVisible → prop isOpened Modal-а ───────────────────────────
        // true  = карточка видна (стандарт при открытии интерфейса)
        // false = Alt-hold скрыл окно (интерфейс НЕ закрыт; компонент живой
        //         и продолжает слушать клавиши — то же поведение, что раньше
        //         давал класс adv-menu_hidden на this.$el)
        menuVisible:false,
    };
},
computed:{
    // Используется только для начального рендера; далее обновляется через DOM напрямую
    timerDisplay(){
        const m=Math.floor(this.timerSeconds/60);
        const s=this.timerSeconds%60;
        return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
    },
    timerPercent(){
        if(!this.timerTotal)return 0;
        return Math.round((this.timerSeconds/this.timerTotal)*100);
    },
    doneTitle(){
        if(this.screen==="done_no_lawyer")return "Адвокат не требуется";
        if(this.screen==="done_no_accept")return "Право на адвоката реализовано";
        if(this.screen==="done_not_arrived")return "Адвокат не прибыл";
        if(this.screen==="done_complete")return "Беседа завершена";
        return "";
    },
    doneText(){
        const loc=this.location?(" ("+this.location+")"):"";
        if(this.screen==="done_no_lawyer")return "Задержанный отказался от адвоката. Задержание продолжается.";
        if(this.screen==="done_no_accept")return "Адвокат не принял вызов"+loc+" за 5 минут. Право на адвоката считается реализованным. Задержание продолжается.";
        if(this.screen==="done_not_arrived")return "Адвокат не прибыл"+loc+" в отведённое время. Зафиксируйте отсутствие в /adlist. Задержание продолжается.";
        if(this.screen==="done_complete")return "Беседа с адвокатом завершена. Задержание продолжается.";
        return "";
    },
},
methods:{
    // Скрывает курсор интерфейса и снимает фокус с активного поля ввода
    // (иначе можно продолжать печатать вслепую, не видя курсор/меню).
    // Запоминает поле, чтобы вернуть в него фокус при появлении курсора.
    hideCursor(){
        const ae=document.activeElement;
        if(ae&&this.$el&&this.$el.contains(ae)&&(ae.tagName==='INPUT'||ae.tagName==='TEXTAREA')){
            this._blurredInput=ae;
            ae.blur();
        } else {
            this._blurredInput=null;
        }
        window.setCursorStatus('AdvMenu',false);
    },
    // Показывает курсор обратно и возвращает фокус в поле ввода,
    // если оно было в фокусе до скрытия курсора
    showCursor(){
        window.setCursorStatus('AdvMenu',true);
        if(!window.App?.developmentMode) window.setDrawLabelStatus(true);
        const el=this._blurredInput;
        this._blurredInput=null;
        if(el){
            this.$nextTick(()=>{
                if(el.isConnected)el.focus();
            });
        }
    },
    // ── Серверное время (МСК) ─────────────────────────────────────────────
    // Тот же механизм, что в Docs (компонент DateTime): функция `c` из
    // timeZone.js конвертирует Date в московское время. Сервер Радмира
    // живёт по МСК, поэтому время вызова в /d совпадает с таймером в
    // документах независимо от часового пояса на ПК игрока.
    _getTime(){
        let msk=null;
        try{msk=toMoscowTime(new Date);}catch(e){}
        // Фолбэк: ручной сдвиг в UTC+3 (МСК без летнего времени с 2014 г.)
        if(!(msk instanceof Date)||isNaN(msk)){
            const n=new Date();
            msk=new Date(n.getTime()+(n.getTimezoneOffset()+180)*60000);
        }
        return String(msk.getHours()).padStart(2,"0")+":"+String(msk.getMinutes()).padStart(2,"0");
    },
    // ── Прямое обновление DOM таймера (обход Vue reactivity в CEF) ────────
    _updateTimerDOM(){
        const m=Math.floor(this.timerSeconds/60);
        const s=this.timerSeconds%60;
        const t=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
        const warn=this.timerSeconds<=60;
        const disp=document.getElementById("adv-timer-disp");
        if(disp){
            disp.textContent=t;
            if(warn) disp.classList.add("adv-menu__timer-display_warn");
            else     disp.classList.remove("adv-menu__timer-display_warn");
        }
        const bar=document.getElementById("adv-progress-bar");
        if(bar){
            const pct=this.timerTotal?Math.round((this.timerSeconds/this.timerTotal)*100):0;
            bar.style.width=pct+"%";
            if(warn) bar.classList.add("adv-menu__progress-fill_warn");
            else     bar.classList.remove("adv-menu__progress-fill_warn");
        }
    },
    // ── Таймер ───────────────────────────────────────────────────────────
    startTimer(seconds,phase){
        this._clearTimer();
        this.timerSeconds=seconds;
        this.timerTotal=seconds;
        this.timerPhase=phase;
        this.timerEndAt=Date.now()+seconds*1000;
        this._createToast();
        setTimeout(()=>this._updateTimerDOM(),30);
        this.timerInterval=setInterval(()=>{
            const rem=Math.max(0,Math.ceil((this.timerEndAt-Date.now())/1000));
            if(rem>0){
                if(rem!==this.timerSeconds){
                    this.timerSeconds=rem;
                    this._updateTimerDOM();
                    this._updateToast();
                }
            }else{
                this.timerSeconds=0;
                this._updateTimerDOM();
                this._clearTimer();
                this.timerPhase=null;
                this._removeToast();
                if(phase==="accept")           this.screen="done_no_accept";
                else if(phase==="arrival")     this.screen="done_not_arrived";
                else if(phase==="consultation")this.screen="done_complete";
            }
        },250);
    },
    _clearTimer(){
        if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
    },
    stopTimer(){
        this._clearTimer();
        this.timerPhase=null;
        this._removeToast();
        if(window._advToastInterval){clearInterval(window._advToastInterval);window._advToastInterval=null;}
    },
    // ── Toast ────────────────────────────────────────────────────────────
    _createToast(){
        this._removeToast();
        const el=document.createElement("div");
        el.id="adv-menu-toast";
        el.style.cssText="position:fixed;bottom:3vh;right:2vh;background:#141419f2;border:0.15vh solid rgba(74,144,217,0.55);border-radius:0.56vh;padding:0.56vh 1.11vh;pointer-events:none;z-index:9999;font-family:'Open Sans',sans-serif;min-width:10vh;box-shadow:0 0.56vh 1.85vh rgba(0,0,0,0.6);";
        document.body.appendChild(el);
        this._updateToast();
    },
    _removeToast(){
        const el=document.getElementById("adv-menu-toast");
        if(el)el.remove();
    },
    _updateToast(){
        const el=document.getElementById("adv-menu-toast");
        if(!el)return;
        const m=Math.floor(this.timerSeconds/60);
        const s=this.timerSeconds%60;
        const t=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
        const labels={accept:"Ожидание вызова",arrival:"Адвокат едет",consultation:"Беседа"};
        const colors={accept:"#4a90d9",arrival:"#f9b701",consultation:"#a07bd4"};
        const col=colors[this.timerPhase]||"#4a90d9";
        const tcol=this.timerSeconds<=60?"#e25544":col;
        const loc=this.location?" - "+this.location:"";
        el.innerHTML=`<div style="color:${col};font-size:0.87vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;">[АДВ] ${labels[this.timerPhase]||""}${loc}</div>`+
                     `<div style="color:${tcol};font-family:'Open Sans Condensed',monospace;font-size:1.85vh;font-style:italic;font-weight:700;">${t}</div>`;
    },
    // ── Навигация ─────────────────────────────────────────────────────────
    goBack(){
        this.stopTimer();
        if(this.screen==="rights"){
            this.close();
        }else{
            this.callTime=null;
            this.location=null;
            this.screen="rights";
        }
    },
    goSkip(){
        if(this.screen==="awaiting_accept")       this.lawyerAccepted();
        else if(this.screen==="awaiting_arrival") this.lawyerArrived();
        else if(this.screen==="in_consultation")  this.consultationDone();
    },
    // ── Флоу ─────────────────────────────────────────────────────────────
    refuseLawyer(){
        this.screen="done_no_lawyer";
    },
    goSelectLocation(){
        this.screen="select_location";
    },
    requestLawyerMvd(){
        this.requestLawyer("МВД");
    },
    requestLawyerFsin(){
        this.requestLawyer("ФСИН");
    },
    requestLawyer(loc){
        this.location=loc||"МВД";
        this.callTime=this._getTime();  // серверное время (МСК)
        // Тег отправителя — [МВД]; место вызова подставляется из выбора.
        // Если для ФСИН нужен свой тег, поправьте только эту строку:
        const msg=`/d [МВД]-[Пра-во] Требуется адвокат в ${this.location}. Время вызова ${this.callTime}`;
        if(typeof window.sendChatInput==="function")window.sendChatInput(msg);
        else if(typeof window.sendChatMessage==="function")window.sendChatMessage(msg);
        this.startTimer(300,"accept");
        this.screen="awaiting_accept";
    },
    lawyerAccepted(){
        this.startTimer(600,"arrival");
        this.screen="awaiting_arrival";
    },
    lawyerNotAccepted(){
        this.stopTimer();
        this.screen="done_no_accept";
    },
    lawyerArrived(){
        this.startTimer(600,"consultation");
        this.screen="in_consultation";
    },
    lawyerNotArrived(){
        this.stopTimer();
        this.screen="done_not_arrived";
    },
    consultationDone(){
        this.stopTimer();
        this.screen="done_complete";
    },
    // ── Закрытие (сохраняет состояние таймера) ────────────────────────────
    // Вызывается: (а) кликом по оверлею Modal (onClose), (б) ESC (onKeyUp),
    // (в) кнопкой «Закрыть» на done-экранах.
    close(){
        if(this.timerPhase&&this.timerSeconds>0){
            const endAt=Date.now()+this.timerSeconds*1000;
            const phase=this.timerPhase;
            const loc=this.location;
            window._advTimerState={screen:this.screen,callTime:this.callTime,timerEndAt:endAt,timerPhase:phase,location:loc};
            if(window._advToastInterval)clearInterval(window._advToastInterval);
            window._advToastInterval=setInterval(()=>{
                const rem=Math.max(0,Math.ceil((endAt-Date.now())/1000));
                const el=document.getElementById("adv-menu-toast");
                if(!el){clearInterval(window._advToastInterval);window._advToastInterval=null;return;}
                const m=Math.floor(rem/60);const s=rem%60;
                const t=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
                const labels={accept:"Ожидание вызова",arrival:"Адвокат едет",consultation:"Беседа"};
                const cols={accept:"#4a90d9",arrival:"#f9b701",consultation:"#a07bd4"};
                const col=cols[phase]||"#4a90d9";
                const tcol=rem<=60?"#e25544":col;
                const locSfx=loc?" - "+loc:"";
                el.innerHTML=`<div style="color:${col};font-size:0.87vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;">[АДВ] ${labels[phase]||""}${locSfx}</div>`+
                             `<div style="color:${tcol};font-family:'Open Sans Condensed',monospace;font-size:1.85vh;font-style:italic;font-weight:700;">${t}</div>`;
                if(rem===0){clearInterval(window._advToastInterval);window._advToastInterval=null;this._removeToast();window._advTimerState=null;}
            },1000);
        }else{
            window._advTimerState=null;
            if(window._advToastInterval){clearInterval(window._advToastInterval);window._advToastInterval=null;}
            this._removeToast();
        }
        this._clearTimer();
        this.timerPhase=null;
        window.closeInterface("AdvMenu");
    },
},
created(){this.$data.noAdaptation=true;},
mounted(){
    this.menuVisible=true;
    // Восстанавливаем состояние если было закрыто с активным таймером
    if(window._advToastInterval){clearInterval(window._advToastInterval);window._advToastInterval=null;}
    const saved=window._advTimerState;
    window._advTimerState=null;
    if(saved){
        const remaining=Math.ceil((saved.timerEndAt-Date.now())/1000);
        this.callTime=saved.callTime;
        this.location=saved.location||null;
        if(remaining>0){
            this.screen=saved.screen;
            this.startTimer(remaining,saved.timerPhase);
        }else{
            if(saved.timerPhase==="accept")           this.screen="done_no_accept";
            else if(saved.timerPhase==="arrival")     this.screen="done_not_arrived";
            else if(saved.timerPhase==="consultation")this.screen="done_complete";
        }
    }
    if(!window.App?.developmentMode)window.setDrawLabelStatus(true);

    // ── Alt-key state for cursor/menu toggle ────────────────────
    this._menuHidden=false;
    this._altHoldTimer=null;
    this._altHoldFired=false;
    this._blurredInput=null;
    const _ADV_ALT_HOLD_MS=500; // зажатие Alt — 500 мс
    this._prevOnKeyUp=window.onKeyUp;
    this._prevOnKeyDown=window.onKeyDown;
    // onKeyDown: запускаем таймер зажатия Alt
    window.onKeyDown=(e)=>{
        if(e===window.KEY_CODE_ALT){
            // !_altHoldFired — защита от повторного срабатывания из-за
            // автоповтора keydown, пока Alt всё ещё физически зажат:
            // новую реакцию можно получить только после отпускания клавиши
            if(!this._altHoldTimer&&!this._altHoldFired){
                this._altHoldTimer=setTimeout(()=>{
                    this._altHoldTimer=null;
                    this._altHoldFired=true;
                    // ── Зажатие Alt: переключает видимость меню туда-обратно.
                    //    Повторное зажатие снова показывает скрытое меню.
                    //    Раньше: this.$el.classList.add/remove('adv-menu_hidden')
                    //    Теперь: меняем $data.menuVisible → prop isOpened Modal-а
                    //    → Modal сам анимирует появление/скрытие карточки.
                    this._menuHidden=!this._menuHidden;
                    if(this._menuHidden){
                        this.menuVisible=false;
                        this.hideCursor();
                    } else {
                        this.menuVisible=true;
                        this.showCursor();
                    }
                },_ADV_ALT_HOLD_MS);
            }
            return;
        }
        if(typeof this._prevOnKeyDown==="function")this._prevOnKeyDown(e)
    }
    window.onKeyUp=(e)=>{
        if(e===window.KEY_CODE_ESC){this.close();return}
        if(e===window.KEY_CODE_ALT){
            if(this._altHoldTimer){
                // ── Короткий тап Alt: отменяем hold, переключаем только курсор ──
                // (только если меню видимо — когда скрыто курсор не нужен)
                clearTimeout(this._altHoldTimer);
                this._altHoldTimer=null;
                if(!this._menuHidden){
                    const _curActive=window.isCursorActive('AdvMenu');
                    if(_curActive){
                        // Курсор скрывается — снимаем фокус с поля ввода,
                        // чтобы текст не печатался "вслепую" со скрытым курсором
                        this.hideCursor();
                    } else {
                        this.showCursor();
                    }
                }
            }
            // Отпустили Alt — сбрасываем флаг сработавшего hold'а,
            // теперь новое зажатие снова сможет вызвать реакцию
            this._altHoldFired=false;
            return;
        }
        if(typeof this._prevOnKeyUp==="function")this._prevOnKeyUp(e)
    }
},
unmounted(){
    this._clearTimer();
    window.onKeyUp=this._prevOnKeyUp;
    window.onKeyDown=this._prevOnKeyDown;
    if(this._altHoldTimer)clearTimeout(this._altHoldTimer);
},
};
const AdvMenu=_export_sfc(_sfc_main,[["render",render]]);
export{AdvMenu as default};
