import{o as openBlock,c as createElementBlock,a as createBaseVNode,F as Fragment,n as normalizeClass,t as toDisplayString,f as createCommentVNode,_ as _export_sfc}from"./index.js";

// ─── SVG ─────────────────────────────────────────────────────────────────────
const SVG_GAVEL=`<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="0.5" width="4.5" height="2.5" rx="0.5" transform="rotate(45 9 0.5)" fill="rgba(74,144,217,0.12)" stroke="rgba(74,144,217,0.65)" stroke-width="1.1"/><rect x="4.5" y="5" width="4.5" height="2.5" rx="0.5" transform="rotate(45 4.5 5)" fill="rgba(74,144,217,0.12)" stroke="rgba(74,144,217,0.65)" stroke-width="1.1"/><path d="M1.5 13.5H9" stroke="rgba(74,144,217,0.5)" stroke-width="1.3" stroke-linecap="round"/></svg>`;
const SVG_OK=`<svg width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5L3.5 7.5L10 1" stroke="#3dba7a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SVG_WARN=`<svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 1.5L12 10.5H1L6.5 1.5Z" stroke="rgba(249,183,1,0.55)" stroke-width="1.1" fill="rgba(249,183,1,0.07)"/><path d="M6.5 5V8M6.5 9.5V10" stroke="rgba(249,183,1,0.65)" stroke-width="1.1" stroke-linecap="round"/></svg>`;
const SVG_PERSON=`<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6.5" cy="4" r="2.3" stroke="currentColor" stroke-width="1.1"/><path d="M1.5 12C1.5 9.5 3.7 7.5 6.5 7.5C9.3 7.5 11.5 9.5 11.5 12" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`;

// ─── render ──────────────────────────────────────────────────────────────────
function render(_ctx,_cache,$props,$setup,$data,$options){
    return (openBlock(),createElementBlock("div",{class:"adv-menu iface-container"},[

        createBaseVNode("div",{class:"adv-menu__overlay",onClick:$options.close}),

        createBaseVNode("div",{class:"adv-menu__wrapper"},[

            createBaseVNode("div",{class:"adv-menu__top-accent"}),

            // ── Шапка ───────────────────────────────────────────────────────
            createBaseVNode("div",{class:"adv-menu__header"},[
                createBaseVNode("div",{class:"adv-menu__title"},[
                    createBaseVNode("span",{class:"adv-menu__title-main"},"МВД"),
                    createBaseVNode("span",{class:"adv-menu__title-sub"}," АДВОКАТ"),
                ]),
                createBaseVNode("div",{class:"adv-menu__close-btn",onClick:$options.close},"X"),
            ]),

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
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_request",onClick:$options.requestLawyer},"Требует →"),
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
                            createBaseVNode("span",{class:"adv-menu__call-info-label"},"Время вызова:"),
                            createBaseVNode("span",{class:"adv-menu__call-info-val"},toDisplayString($data.callTime)),
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
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_accept",onClick:$options.lawyerAccepted},"✓ Принял"),
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_timeout",onClick:$options.lawyerNotAccepted},"✗ Не принял"),
                    ]),
                    createBaseVNode("div",{class:"adv-menu__footer-nav"},[
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_back",onClick:$options.goBack},"← Назад"),
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_skip",onClick:$options.goSkip},"Пропустить →"),
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
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_back",onClick:$options.goBack},"← Назад"),
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_skip",onClick:$options.goSkip},"Пропустить →"),
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
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_back",onClick:$options.goBack},"← Назад"),
                        createBaseVNode("button",{class:"adv-menu__btn-nav adv-menu__btn-nav_skip",onClick:$options.goSkip},"Пропустить →"),
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
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_back",onClick:$options.goBack},"← Начало"),
                        createBaseVNode("button",{class:"adv-menu__btn adv-menu__btn_close",onClick:$options.close},"Закрыть"),
                    ]),
                ],64))
                :createCommentVNode("",true),

        ])
    ]));
}

// ─── Компонент ───────────────────────────────────────────────────────────────
const _sfc_main={
    name:"AdvMenu",
    data(){
        return{
            screen:"rights",
            callTime:null,
            timerSeconds:0,
            timerTotal:300,
            timerInterval:null,
            timerPhase:null,
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
            if(this.screen==="done_no_lawyer")return"Адвокат не требуется";
            if(this.screen==="done_no_accept")return"Право на адвоката реализовано";
            if(this.screen==="done_not_arrived")return"Адвокат не прибыл";
            if(this.screen==="done_complete")return"Беседа завершена";
            return"";
        },
        doneText(){
            if(this.screen==="done_no_lawyer")return"Задержанный отказался от адвоката. Задержание продолжается.";
            if(this.screen==="done_no_accept")return"Адвокат не принял вызов за 5 минут. Право на адвоката считается реализованным. Задержание продолжается.";
            if(this.screen==="done_not_arrived")return"Адвокат не прибыл в отведённое время. Зафиксируйте отсутствие в /adlist. Задержание продолжается.";
            if(this.screen==="done_complete")return"Беседа с адвокатом завершена. Задержание продолжается.";
            return"";
        },
    },
    methods:{
        _getTime(){
            const n=new Date();
            return String(n.getHours()).padStart(2,"0")+":"+String(n.getMinutes()).padStart(2,"0");
        },

        // ── Прямое обновление DOM таймера (обход Vue reactivity в CEF) ────────
        // Vue не перерисовывает компонент при изменении timerSeconds внутри
        // setInterval из-за патч-флагов CEF; обновляем DOM руками, как тост.
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
            this._createToast();
            // Ждём следующего тика чтобы Vue успел отрендерить элемент с id
            setTimeout(()=>this._updateTimerDOM(),30);
            this.timerInterval=setInterval(()=>{
                if(this.timerSeconds>0){
                    this.timerSeconds--;
                    this._updateTimerDOM();  // DOM напрямую
                    this._updateToast();
                }else{
                    this._clearTimer();
                    this.timerPhase=null;
                    this._removeToast();
                    if(phase==="accept")         this.screen="done_no_accept";
                    else if(phase==="arrival")   this.screen="done_not_arrived";
                    else if(phase==="consultation")this.screen="done_complete";
                }
            },1000);
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
            el.innerHTML=`<div style="color:${col};font-size:0.87vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;">[АДВ] ${labels[this.timerPhase]||""}</div>`+
                         `<div style="color:${tcol};font-family:'Open Sans Condensed',monospace;font-size:1.85vh;font-style:italic;font-weight:700;">${t}</div>`;
        },

        // ── Навигация ─────────────────────────────────────────────────────────
        goBack(){
            // Всегда возвращает на экран прав, отменяя текущий процесс
            this.stopTimer();
            if(this.screen==="rights"){
                this.close();
            }else{
                this.callTime=null;
                this.screen="rights";
            }
        },
        goSkip(){
            // Пропускает текущее ожидание, переходя на следующий этап
            if(this.screen==="awaiting_accept")      this.lawyerAccepted();
            else if(this.screen==="awaiting_arrival") this.lawyerArrived();
            else if(this.screen==="in_consultation")  this.consultationDone();
        },

        // ── Флоу ─────────────────────────────────────────────────────────────
        refuseLawyer(){
            this.screen="done_no_lawyer";
        },
        requestLawyer(){
            this.callTime=this._getTime();
            const msg=`/d [МВД]-[Пра-во] Требуется адвокат в МВД. Время вызова ${this.callTime}`;
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
        close(){
            if(this.timerPhase&&this.timerSeconds>0){
                const endAt=Date.now()+this.timerSeconds*1000;
                const phase=this.timerPhase;
                window._advTimerState={screen:this.screen,callTime:this.callTime,timerEndAt:endAt,timerPhase:phase};
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
                    el.innerHTML=`<div style="color:${col};font-size:0.87vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;">[АДВ] ${labels[phase]||""}</div>`+
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
        if(!document.getElementById("adv-menu-style")){
            const s=document.createElement("style");
            s.id="adv-menu-style";
            s.textContent=`
/* ════ AdvMenu ═══════════════════════════════════════════════════════ */
.adv-menu{align-items:center;display:flex;font-family:"Open Sans",var(--fallback-font);font-style:normal;height:100vh;justify-content:center;left:0;position:absolute;text-transform:none;top:0;width:100vw;z-index:11;}
.adv-menu__overlay{bottom:0;left:0;position:absolute;right:0;top:0;}
.adv-menu__wrapper{background:#141419eb;border:0.19vh solid rgba(255,255,255,0.05);border-radius:0.74vh;box-shadow:inset 0 3.89vh 4.81vh -2.96vh rgba(74,144,217,0.18),0 1.5vh 5vh rgba(0,0,0,.75);display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;position:relative;width:32vh;z-index:1;}
.adv-menu__top-accent{background:#4a90d9;height:0.19vh;left:0;position:absolute;right:0;top:0;}
/* Header */
.adv-menu__header{align-items:center;border-bottom:0.19vh solid #f4f1e11a;display:flex;justify-content:space-between;padding:1.2vh 1.67vh;position:relative;z-index:1;}
.adv-menu__title{align-items:baseline;display:flex;gap:0.37vh;}
.adv-menu__title-main{color:#f4f1e1;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.59vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.adv-menu__title-sub{color:#4a90d9;font-family:"Open Sans Condensed",var(--fallback-font);font-size:2.59vh;font-style:italic;font-weight:700;letter-spacing:0.1vh;text-transform:uppercase;}
.adv-menu__close-btn{align-items:center;background:#ffffff0d;border:0.19vh solid #f4f1e11a;border-radius:0.37vh;color:#f4f1e199;cursor:pointer;display:flex;font-size:1.48vh;font-weight:700;height:2.96vh;justify-content:center;transition:all 0.15s;width:2.96vh;}
@media (platform:pc){.adv-menu__close-btn:hover{background:#e25544;border-color:#e25544;color:#fff;}}
/* Body */
.adv-menu__body{display:flex;flex-direction:column;flex:1 1 auto;gap:1.11vh;padding:1.67vh;position:relative;z-index:1;}
.adv-menu__body_done{align-items:center;gap:0.74vh;justify-content:center;padding:2.96vh 1.85vh;text-align:center;}
/* Section header */
.adv-menu__section-hdr{align-items:center;display:flex;gap:0.56vh;}
.adv-menu__section-icon{align-items:center;display:flex;flex-shrink:0;}
.adv-menu__section-title{color:rgba(74,144,217,0.7);font-size:1.02vh;font-weight:700;letter-spacing:0.07vh;text-transform:uppercase;}
/* Rights list */
.adv-menu__rights-list{background:rgba(74,144,217,0.05);border:0.09vh solid rgba(74,144,217,0.14);border-radius:0.46vh;display:flex;flex-direction:column;gap:0.74vh;padding:1.11vh 1.11vh 1.11vh 0.93vh;}
.adv-menu__right-item{align-items:flex-start;display:flex;gap:0.74vh;}
.adv-menu__right-bullet{background:#4a90d9;border-radius:50%;flex-shrink:0;height:0.46vh;margin-top:0.74vh;width:0.46vh;}
.adv-menu__right-text{color:rgba(244,241,225,0.75);font-size:1.2vh;font-weight:600;line-height:1.5;}
/* Divider */
.adv-menu__divider{background:#f4f1e11a;height:0.09vh;}
/* Question */
.adv-menu__question{color:#f4f1e1cc;font-size:1.2vh;font-weight:600;text-align:center;}
/* Call sent */
.adv-menu__call-sent{align-items:center;background:rgba(61,186,122,0.08);border:0.09vh solid rgba(61,186,122,0.25);border-radius:0.37vh;color:#3dba7a;display:flex;font-size:1.2vh;font-weight:700;gap:0.56vh;padding:0.65vh 1.11vh;}
.adv-menu__call-sent-icon{align-items:center;display:flex;}
/* Call info */
.adv-menu__call-info{align-items:center;display:flex;gap:0.56vh;}
.adv-menu__call-info-label{color:#f4f1e166;font-size:1.11vh;font-weight:600;}
.adv-menu__call-info-val{color:#4a90d9;font-size:1.3vh;font-weight:700;}
/* Phase badge */
.adv-menu__phase-badge{align-items:center;border-radius:0.37vh;display:flex;font-size:1.2vh;font-weight:700;gap:0.56vh;padding:0.65vh 1.11vh;}
.adv-menu__phase-badge-icon{align-items:center;display:flex;flex-shrink:0;}
.adv-menu__phase-badge_arrival{background:rgba(249,183,1,0.08);border:0.09vh solid rgba(249,183,1,0.22);color:#f9b701;}
.adv-menu__phase-badge_consult{background:rgba(160,123,212,0.08);border:0.09vh solid rgba(160,123,212,0.22);color:#a07bd4;}
/* Phase label */
.adv-menu__phase-label{color:rgba(244,241,225,0.75);font-size:1.2vh;font-weight:600;text-align:center;}
/* Timer — обновляется напрямую через DOM */
.adv-menu__timer-display{color:#4a90d9;font-family:"Open Sans Condensed","Open Sans",monospace;font-size:5.37vh;font-style:italic;font-weight:700;letter-spacing:0.19vh;line-height:1;text-align:center;}
.adv-menu__timer-display_arrival{color:#f9b701;}
.adv-menu__timer-display_consult{color:#a07bd4;}
.adv-menu__timer-display_warn{color:#e25544!important;}
/* Progress bar — ширина обновляется напрямую через DOM */
.adv-menu__progress-track{background:#ffffff0d;border-radius:0.19vh;height:0.46vh;overflow:hidden;width:100%;}
.adv-menu__progress-fill{background:#4a90d9;border-radius:0.19vh;height:100%;transition:width 0.9s linear;}
.adv-menu__progress-fill_arrival{background:#f9b701;}
.adv-menu__progress-fill_consult{background:#a07bd4;}
.adv-menu__progress-fill_warn{background:#e25544!important;}
/* Phase note */
.adv-menu__phase-note{color:#f4f1e166;font-size:1.02vh;font-weight:600;text-align:center;}
/* Hint */
.adv-menu__hint{align-items:flex-start;display:flex;gap:0.46vh;}
.adv-menu__hint-icon{display:flex;flex-shrink:0;margin-top:0.09vh;}
.adv-menu__hint-text{color:#f4f1e166;font-size:1.08vh;line-height:1.4;}
/* Done */
.adv-menu__done-icon{margin-bottom:0.37vh;}
.adv-menu__done-icon svg{height:2vh;width:2vh;}
.adv-menu__done-title{color:#f4f1e1;font-size:1.48vh;font-weight:700;}
.adv-menu__done-text{color:#f4f1e199;font-size:1.18vh;line-height:1.5;}
/* Primary footer */
.adv-menu__footer{align-items:center;border-top:0.19vh solid #f4f1e11a;display:flex;gap:0.74vh;padding:1.2vh 1.67vh 0.74vh;position:relative;z-index:1;}
.adv-menu__btn{border:0.19vh solid;border-radius:0.37vh;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.18vh;font-weight:700;letter-spacing:0.03vh;padding:0.93vh 0.37vh;transition:all 0.15s;}
@media (platform:pc){.adv-menu__btn:hover{opacity:0.85;}}
.adv-menu__btn_refuse{background:#ffffff0d;border-color:#f4f1e11a;color:rgba(244,241,225,0.7);}
.adv-menu__btn_request{background:rgba(74,144,217,0.14);border-color:rgba(74,144,217,0.5);color:#4a90d9;}
@media (platform:pc){.adv-menu__btn_request:hover{background:rgba(74,144,217,0.24);opacity:1;}}
.adv-menu__btn_accept{background:rgba(61,186,122,0.12);border-color:rgba(61,186,122,0.45);color:#3dba7a;}
@media (platform:pc){.adv-menu__btn_accept:hover{background:rgba(61,186,122,0.22);opacity:1;}}
.adv-menu__btn_timeout{background:rgba(226,85,68,0.1);border-color:rgba(226,85,68,0.4);color:#e25544;}
@media (platform:pc){.adv-menu__btn_timeout:hover{background:rgba(226,85,68,0.2);opacity:1;}}
.adv-menu__btn_done{background:rgba(74,144,217,0.12);border-color:rgba(74,144,217,0.45);color:#4a90d9;}
@media (platform:pc){.adv-menu__btn_done:hover{background:rgba(74,144,217,0.22);opacity:1;}}
.adv-menu__btn_back{background:#ffffff08;border-color:#f4f1e114;color:rgba(244,241,225,0.5);}
@media (platform:pc){.adv-menu__btn_back:hover{background:#ffffff12;opacity:1;}}
.adv-menu__btn_close{background:#ffffff0d;border-color:#f4f1e11a;color:rgba(244,241,225,0.7);}
/* Secondary nav footer (Назад / Пропустить) */
.adv-menu__footer-nav{align-items:center;border-top:0.09vh solid #f4f1e10a;display:flex;gap:0.56vh;padding:0.56vh 1.67vh 0.93vh;position:relative;z-index:1;}
.adv-menu__btn-nav{background:transparent;border:none;border-radius:0.28vh;cursor:pointer;flex:1 1 auto;font-family:"Open Sans",Arial,sans-serif;font-size:1.08vh;font-weight:700;letter-spacing:0.03vh;padding:0.46vh 0.37vh;transition:all 0.15s;}
.adv-menu__btn-nav_back{color:rgba(244,241,225,0.35);text-align:left;}
@media (platform:pc){.adv-menu__btn-nav_back:hover{color:rgba(244,241,225,0.65);}}
.adv-menu__btn-nav_skip{color:rgba(74,144,217,0.5);text-align:right;}
@media (platform:pc){.adv-menu__btn-nav_skip:hover{color:rgba(74,144,217,0.85);}}
`;
            document.head.appendChild(s);
        }

        // Восстанавливаем состояние если было закрыто с активным таймером
        if(window._advToastInterval){clearInterval(window._advToastInterval);window._advToastInterval=null;}
        const saved=window._advTimerState;
        window._advTimerState=null;
        if(saved){
            const remaining=Math.ceil((saved.timerEndAt-Date.now())/1000);
            this.callTime=saved.callTime;
            if(remaining>0){
                this.screen=saved.screen;
                this.startTimer(remaining,saved.timerPhase);
            }else{
                if(saved.timerPhase==="accept")         this.screen="done_no_accept";
                else if(saved.timerPhase==="arrival")   this.screen="done_not_arrived";
                else if(saved.timerPhase==="consultation")this.screen="done_complete";
            }
        }

        if(!window.App?.developmentMode)window.setDrawLabelStatus(true);
    },

    unmounted(){
        this._clearTimer();
        const s=document.getElementById("adv-menu-style");
        if(s)s.remove();
    },
};

const AdvMenu=_export_sfc(_sfc_main,[["render",render]]);
export{AdvMenu as default};
