import {
	_ as Le,
	a as Be,
	b as xe,
	c as $e,
	d as ut,
	e as mt,
	f as re,
	g as Re,
	h as ft,
	i as Ne,
	j as Ye,
	k as Fe,
	l as Ke,
	m as Ze,
	n as Ue,
	o as Ve,
	p as Ge,
	q as We,
	r as ze,
	s as gt,
	t as qe,
	u as pt,
	v as Ct,
	w as vt,
	x as yt,
	y as wt,
	z as bt,
	A as St,
	B as Et,
	C as Tt,
	D as Mt,
	E as kt,
	F as It,
	G as Ot,
	H as Pt,
	I as Dt,
	J as At,
	K as Ht,
	L as Lt,
	M as Bt,
	N as xt,
	O as $t,
	P as Rt,
	Q as Nt,
	R as Yt,
	S as Ft,
	T as Kt,
	U as Zt,
	V as Ut,
	W as Vt,
	X as Gt,
	Y as Wt,
	Z as zt,
	$ as qt,
	a0 as Xt,
	a1 as jt,
	a2 as Jt,
	a3 as Qt,
	a4 as es,
	a5 as ts,
	a6 as ss,
	a7 as is,
	a8 as as,
	a9 as ns,
	aa as os,
	ab as rs,
	ac as ds,
	ad as ls,
	ae as cs,
	af as hs,
	ag as _s,
	ah as us,
	ai as ms,
	aj as fs,
	ak as gs,
	al as ps,
	am as Cs,
	an as vs,
	ao as ys,
	ap as ws,
	aq as bs,
	ar as Ss,
	as as Es,
	at as Ts,
	au as Ms,
	av as ks,
	aw as Is,
	ax as Os
} from "./hint2.js";
import {
	w as $
} from "./dom.js";
import {
	S as Ps
} from "./ScrollableContainer.js";
import {
	r as f,
	o as n,
	c as o,
	b as h,
	w as C,
	j as de,
	n as w,
	_ as g,
	a,
	F as b,
	i as M,
	d as m,
	t as p,
	e as k,
	p as A,
	f as H,
	h as y,
	g as _,
	k as V,
	v as Xe,
	l as je,
	T as E,
	m as le,
	q as Ds,
	s as As,
	D as Hs
} from "./index.js";
import {
	C as Ls,
	a as Bs
} from "./index2.js";
import {
	s as xs
} from "./colors.js";
import {
	C as $s
} from "./index3.js";
import {
	C as W,
	_ as Je
} from "./Button.js";
import {
	C as ce
} from "./ButtonContainer.js";
import {
	f as Qe
} from "./numbers.js";
import {
	U as z
} from "./MobileButton.js";
import {
	N as Rs
} from "./index4.js";
import {
	_ as Ns,
	a as Ys,
	b as Fs,
	c as Ks,
	d as Zs,
	e as Us
} from "./logo.js";
import {
	R as Vs
} from "./RangeSlider.js";
import "./telegram-authenticator.js";
import "./close2.js";
import "./donate.js";
import "./money.js";

function Gs(e, s, t, l, r, i) {
	const d = f("ScrollableContainer");
	return n(), o("div", {
		class: w(["scrolling-container", i.classes]),
		ref: "scrolling",
		style: {
			overflow: "auto"
		}
	}, [h(d, {
		type: 1,
		requiredVerticalScroll: r.requiredScroll,
		onContentScroll: i.onScroll
	}, {
		default: C(() => [de(e.$slots, "default", {}, void 0, !0)]),
		_: 3
	}, 8, ["requiredVerticalScroll", "onContentScroll"])], 2)
}
const Ws = {
		props: {
			chatIsOpened: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			ScrollableContainer: Ps
		},
		computed: {
			classes() {
				return {
					"scrolling-container_hidden": !this.chatIsOpened
				}
			}
		},
		data() {
			return {
				requiredScroll: -1
			}
		},
		methods: {
			scrollToTop() {
				$(() => {
					this.requiredScroll = 0
				})
			},
			scrollToBottom() {
				$(() => {
					this.scrollableWrapper && (this.requiredScroll = this.scrollableWrapper.scrollHeight)
				})
			},
			scrollByStep(e, s) {
				$(() => {
					this.scrollableWrapper && (s === "down" ? this.requiredScroll = this.scrollableWrapper.scrollTop + e : s === "up" && (this.requiredScroll = this.scrollableWrapper.scrollTop - e))
				})
			},
			onScroll(e) {
				this.scrollableWrapper = e.scrollableWrapper
			}
		}
	},
	zs = g(Ws, [
		["render", Gs],
		["__scopeId", "data-v-dadf1dfa"]
	]),
	fe = {
		й: "q",
		ц: "w",
		у: "e",
		к: "r",
		е: "t",
		н: "y",
		г: "u",
		ш: "i",
		щ: "o",
		з: "p",
		х: "[",
		ъ: "]",
		ф: "a",
		ы: "s",
		в: "d",
		а: "f",
		п: "g",
		р: "h",
		о: "j",
		л: "k",
		д: "l",
		ж: ";",
		э: "'",
		я: "z",
		ч: "x",
		с: "c",
		м: "v",
		и: "b",
		т: "n",
		ь: "m",
		б: ",",
		ю: ".",
		".": "/"
	};

function et(e) {
	return Array.from(e).map(t => fe[t] ? fe[t] : t).join("")
}
const ge = 100,
	qs = 1500,
	Xs = 3,
	js = 512,
	tt = {
		components: {
			Scrolling: zs
		},
		data() {
			return {
				MAX_INPUT_LENGTH: js,
				images: Object.assign({
					"/src/assets/images/hud/chat/message-icons/0.svg": Le,
					"/src/assets/images/hud/chat/message-icons/1.svg": Be,
					"/src/assets/images/hud/chat/message-icons/2.svg": xe,
					"/src/assets/images/hud/chat/message-icons/3.svg": $e
				}),
				messages: [],
				messageCounter: 0,
				isOpen: !1,
				canOpen: !0,
				inputText: "",
				connectStatusCodes: Ls,
				connectStatusInfo: Bs,
				currentHistoryItem: -1,
				currentBind: null,
				currentBindMessage: -1,
				isBindSent: !1
			}
		},
		methods: {
			getOnboardingOrPauseStatus() {
				return window.getInterfaceStatus("TrainingOnboarding") || window.getInterfaceStatus("PauseMenu")
			},
			onMessage(e, s) {},
			onOpenChat() {},
			onCloseChat() {},
			parseActions(e) {
				return e.match(/(\{btn:[0-9]+\:[0-9]+\:[0-9]+\})/g)
			},
			deleteChatMessage(e) {
				return this.messages = this.messages.filter(s => s.id != e), !1
			},
			parseMessageButtons(e) {
				let s = 0;
				const t = /(\{btn:[0-9]+\:[0-9]+\:[0-9]+\})/g,
					l = (d, c) => ({
						text: d,
						color: c
					}),
					r = (d, c, u) => ({
						button: d,
						action: c,
						value: u,
						isBtn: !0
					});
				return {
					strings: e.map(d => {
						const c = [];
						return d.text.split(t).forEach(u => {
							if (u.match(t)) {
								let S = u.replace("{", "").replace("}", "").split(":"),
									[T, v, O, x] = S;
								T === "btn" && (s = x, O != Xs ? c.push(r(v, O, x)) : c.push(l(u.replace(t, ""), d.color)))
							} else c.push(l(u.replace(t, ""), d.color))
						}), c
					}).flat(),
					valueId: s
				}
			},
			add(e, s, t) {
				const l = xs(e).map(d => ({
					...d,
					text: d.text.replace(/^\s/g, " ")
				}));
				let r = this.parseMessageButtons(l);
				e = r.strings;
				let i = !0;
				if (this.isOpen) {
					if (!this.$refs.scrolling) return;
					let d = this.$refs.scrolling.scrollableWrapper;
					d && d.scrollHeight - d.offsetHeight - d.scrollTop > 0 && (i = !1)
				}
				window.getInterfaceStatus("Connect") || this.messages.push({
					content: e,
					color: s,
					time: Date.now(),
					id: r.valueId,
					key: Date.now() + this.messageCounter++,
					modifierName: t
				}), this.onMessage(e, s), this.setConnectStatus(this.extractMessageText({
					content: e
				})), this.$nextTick(() => {
					i && this.$refs.scrolling.scrollToBottom()
				})
			},
			disableMessageModifier(e) {
				e.modifierName === "hide" && (e.modifierName = "")
			},
			clearAll() {
				this.messages = []
			},
			open() {
				this.isOpen || (this.onOpenChat(), window.stopVoiceRecord(0), this.isOpen = !0, !this.isMobile && window.setCursorStatus("Chat", !0), this.$nextTick(() => {
					this.$refs.scrolling.scrollToBottom(), this.$refs.input.focus(), this.inputText && this.moveCursorToEnd()
				}))
			},
			close() {
				this.isOpen && (this.isOpen = !1, this.onCloseChat(), !this.isMobile && window.setCursorStatus("Chat", !1), this.$nextTick(() => {
					this.$refs.scrolling.scrollToBottom(), this.$refs.input && this.$refs.input.blur()
				}))
			},
			prevHistory() {
				if (this.currentHistoryItem + 1 < this.history.length) {
					let e = this.history[++this.currentHistoryItem];
					this.inputText = e
				}
				this.moveCursorToEnd()
			},
			nextHistory() {
				if (this.currentHistoryItem - 1 >= 0) {
					let e = this.history[--this.currentHistoryItem];
					this.inputText = e
				} else this.history.includes(this.inputText) && (this.currentHistoryItem = -1, this.inputText = "");
				this.moveCursorToEnd()
			},
			moveCursorToEnd() {
				this.$nextTick(() => {
					const e = this.$refs.input;
					e.selectionStart = e.selectionEnd = e.value.length
				})
			},
			addHistory() {
				this.inputText && this.inputText.trim().length > 0 && this.$store.commit("keyboard/addHistory", this.inputText)
			},
			waitForNextBind() {
				return new Promise(e => {
					setTimeout(() => {
						e()
					}, qs)
				})
			},
			waitForBindSent() {
				this.isBindSent = !0
			},
			async playBind() {
				const {
					currentBind: e
				} = this, s = e.messages[++this.currentBindMessage];
				if (!s) {
					this.currentBindMessage = -1, this.currentBind = null;
					return
				}
				if (s.disabled) {
					this.inputText = (s.text + " ").trim(), this.open();
					return
				}
				window.sendChatInput(this.processInputText(s.text)), await this.waitForNextBind(), await this.playBind()
			},
			extractMessageText(e) {
				return e.content.map(s => s.text).join(" ")
			},
			async useBinder(e) {
				const s = await this.$store.dispatch("binder/checkMessage", e);
				return s ? (this.currentBind = s, await this.playBind(), !0) : !1
			},
			clearInput() {
				this.inputText = ""
			},
			sendChatInput(e) {
				return window.sendChatInput(this.processInputText(e))
			},
			async send() {
				if (!this.isOpen) return;
				if (this.$refs.hints) {
					let t = this.$refs.hints;
					if (t.currentHintIndex > -1) {
						t.currentHintIndex = -1;
						return
					}
				}
				this.currentHistoryItem = -1;
				const e = this.inputText;
				if (this.addHistory(), this.clearInput(), this.close(), this.currentBind) {
					this.sendChatInput(e), await this.waitForNextBind(), await this.playBind();
					return
				}
				await this.useBinder(e) || this.sendChatInput(e)
			},
			processInputText(e) {
				if (this.engine === "legacy" && e.length > 1 && e[0] === ".") {
					let s = e.split(" ");
					if (s.length > 0) return s[0] = et(s[0]), s.join(" ")
				}
				return e
			},
			setConnectStatus(e) {
				if (window.getInterfaceStatus("Connect") && window.interface("Connect").setStatus) {
					let s = this.getConnectStatus(e);
					s && window.interface("Connect").setStatus(s, e)
				}
			},
			getConnectStatus(e) {
				for (let s in this.connectStatusInfo)
					if (e.search(this.connectStatusInfo[s].text) != -1) return this.connectStatusInfo[s].id;
				return 0
			}
		},
		computed: {
			isMobile() {
				return this.$root.isMobile
			},
			engine() {
				return this.$root.engine
			},
			filteredMessages() {
				return this.messages.length >= ge ? this.messages.slice(this.messages.length - ge, this.messages.length) : this.messages
			},
			history() {
				return [...this.$store.getters["keyboard/history"]].reverse()
			}
		},
		mounted() {
			setTimeout(() => {
				this.$refs.scrolling.scrollToBottom()
			}, 100), this.close()
		}
	},
	Js = {},
	Qs = {
		width: "47",
		height: "47",
		viewBox: "0 0 47 47",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	ei = a("circle", {
		cx: "23.5",
		cy: "23.5",
		r: "23.5",
		fill: "#0D73FD"
	}, null, -1),
	ti = a("path", {
		d: "M24 16V32M24 16L19 20.8M24 16L29 20.8",
		stroke: "white",
		"stroke-width": "2",
		"stroke-linecap": "round"
	}, null, -1),
	si = [ei, ti];

function ii(e, s) {
	return n(), o("svg", Qs, si)
}
const ai = g(Js, [
		["render", ii]
	]),
	ni = e => (A("data-v-26947d6c"), e = e(), H(), e),
	oi = ["onClick"],
	ri = ni(() => a("img", {
		class: "chat-message-content__action-background",
		src: ut
	}, null, -1)),
	di = ["src"];

function li(e, s, t, l, r, i) {
	return n(), o("p", {
		class: "chat-message-content",
		cohinline: "",
		style: m({
			color: `#${t.color}`
		})
	}, [(n(!0), o(b, null, M(t.content, (d, c) => (n(), o(b, {
		key: c
	}, [d.isBtn ? (n(), o("span", {
		key: 0,
		class: "chat-message-content__action",
		onClick: u => i.onChatMessageAction(d)
	}, [ri, a("img", {
		class: "chat-message-content__action-image",
		src: e.images[`/src/assets/images/hud/chat/message-icons/${d.button}.svg`]
	}, null, 8, di)], 8, oi)) : d.color && d.color !== t.color ? (n(), o("span", {
		key: 1,
		style: m({
			color: `#${d.color}`
		})
	}, p(d.text), 5)) : (n(), o(b, {
		key: 2
	}, [k(p(d.text), 1)], 64))], 64))), 128))], 4)
}
const ci = {
		props: {
			content: {
				default: () => []
			},
			color: {
				default: ""
			}
		},
		data: () => ({
			images: Object.assign({
				"/src/assets/images/hud/chat/message-icons/0.svg": Le,
				"/src/assets/images/hud/chat/message-icons/1.svg": Be,
				"/src/assets/images/hud/chat/message-icons/2.svg": xe,
				"/src/assets/images/hud/chat/message-icons/3.svg": $e
			})
		}),
		methods: {
			onChatMessageAction(e) {
				window.onChatMessageAction(e.button, e.action, e.value)
			}
		}
	},
	hi = g(ci, [
		["render", li],
		["__scopeId", "data-v-26947d6c"]
	]),
	_i = {
		class: "chat-message"
	},
	ui = {
		key: 0,
		class: "chat-message__button-icon",
		src: mt
	},
	mi = {
		class: "chat-message__button-text"
	};

function fi(e, s, t, l, r, i) {
	const d = f("ChatMessageContent");
	return n(), o("div", _i, [t.item.modifierName ? (n(), o(b, {
		key: 1
	}, [a("p", {
		style: m({
			color: "#" + t.item.color,
			fontSize: t.fontSize,
			lineHeight: t.lineHeight
		})
	}, p(i.formatMessage(t.item).time), 5), t.item.modifierName ? (n(), o("div", {
		key: 0,
		class: w(["chat-message__button", {
			"chat-message__button_clickable": t.item.modifierName === "hide"
		}]),
		onClick: s[0] || (s[0] = c => e.$emit("disableMessageModifier"))
	}, [t.item.modifierName === "hide" ? (n(), o("img", ui)) : _("", !0), a("div", mi, p(t.item.modifierName === "hide" ? "СКРЫТО" : "УДАЛЕНО"), 1)], 2)) : _("", !0), h(d, {
		style: m({
			fontSize: t.fontSize,
			lineHeight: t.lineHeight
		}),
		color: t.item.color,
		content: i.formatMessage(t.item).content
	}, null, 8, ["style", "color", "content"])], 64)) : (n(), y(d, {
		key: 0,
		class: "chat-message__full-width-msg",
		style: m({
			fontSize: t.fontSize,
			lineHeight: t.lineHeight
		}),
		color: t.item.color,
		content: i.formatMessage(t.item).fullContent
	}, null, 8, ["style", "color", "content"]))])
}
const gi = {
		props: {
			fontSize: {
				default: ""
			},
			lineHeight: {
				default: ""
			},
			item: {
				default: () => ({})
			}
		},
		components: {
			ChatMessageContent: hi
		},
		computed: {
			timestamps() {
				return this.$root.chatTimestamps
			}
		},
		methods: {
			formatMessage(e) {
				let {
					content: s
				} = e, t = "", l = null;
				const r = new RegExp(/\{v:(?<nick>(?:(?!\{v:).)+?)\}/g);
				if (e.modifierName && (e.modifierName === "hide" || e.modifierName === "remove")) {
					for (let d = s.length - 1; d >= 0; d--) {
						const c = s[d].text && s[d].text.match(r);
						if (c) {
							l = {
								text: c[c.length - 1],
								color: s[d].color
							};
							break
						}
					}
					l ? s = [l] : this.$emit("disableMessageModifier")
				}
				if (this.timestamps) {
					const d = new Date(e.time);
					t = `[${this.formatTime(d)}]`
				}
				let i = s = s.map(d => ({
					...d,
					text: d.text ? d.text.replace(r, "$<nick>") : ""
				}));
				return this.timestamps && (i = [{
					text: `${t} `
				}, ...s]), {
					content: s,
					time: t,
					fullContent: i
				}
			},
			formatTime(e) {
				const s = i => String(i).padStart(2, "0"),
					t = s(e.getHours()),
					l = s(e.getMinutes()),
					r = s(e.getSeconds());
				return `${t}:${l}:${r}`
			}
		}
	},
	st = g(gi, [
		["render", fi],
		["__scopeId", "data-v-05a67b06"]
	]),
	pi = {
		class: "message"
	},
	Ci = {
		key: 0,
		class: "chat-input"
	},
	vi = ["maxlength"];

function yi(e, s, t, l, r, i) {
	const d = f("ChatMessage"),
		c = f("scrolling");
	return n(), o("div", {
		class: w(["chat-container", {
			chat_opened: e.isOpen
		}])
	}, [a("div", {
		class: "chat",
		style: m({
			transform: `scale(${t.ratioScale})`,
			left: `${47*t.ratioScale}vh`
		})
	}, [h(c, {
		class: "messages-list",
		onClick: e.open,
		ref: "scrolling"
	}, {
		default: C(() => [(n(!0), o(b, null, M(e.filteredMessages, (u, S) => (n(), o("div", pi, [h(d, {
			item: u,
			onDisableMessageModifier: T => e.disableMessageModifier(u)
		}, null, 8, ["item", "onDisableMessageModifier"])]))), 256))]),
		_: 1
	}, 8, ["onClick"]), e.isOpen ? (n(), o("div", Ci, [V(a("input", {
		ref: "input",
		"onUpdate:modelValue": s[0] || (s[0] = u => e.inputText = u),
		maxlength: e.MAX_INPUT_LENGTH
	}, null, 8, vi), [
		[Xe, e.inputText]
	])])) : _("", !0)], 4)], 2)
}
const wi = {
		props: {
			chatStatus: {
				type: Boolean
			},
			ratioScale: {
				type: Number
			}
		},
		components: {
			ChatSend: ai,
			ChatMessage: st
		},
		mixins: [tt],
		data: () => ({
			KEY_CODE_ENTER: window.KEY_CODE_ENTER,
			KEY_CODE_T: window.KEY_CODE_T,
			KEY_CODE_F6: window.KEY_CODE_F6,
			KEY_CODE_F1: window.KEY_CODE_F1,
			KEY_CODE_ESC: window.KEY_CODE_ESC,
			KEY_CODE_ARROW_TOP: window.KEY_CODE_ARROW_TOP,
			KEY_CODE_ARROW_BOTTOM: window.KEY_CODE_ARROW_BOTTOM,
			KEY_CODE_PAGE_UP: window.KEY_CODE_PAGE_UP,
			KEY_CODE_PAGE_DOWN: window.KEY_CODE_PAGE_DOWN,
			KEY_CODE_X: window.KEY_CODE_X,
			KEY_CODE_U: window.KEY_CODE_U,
			isInactive: !1,
			currentScale: 1
		}),
		created() {
			document.addEventListener("click", e => {
				!this.$el.contains(e.target) && !window.App.showKeyboard && this.close()
			})
		},
		computed: {
			deviceScreen() {
				return this.$root.deviceScreen
			}
		},
		mounted() {
			document.addEventListener("keydown", this.onKeyDown), document.addEventListener("keyup", this.onKeyUp)
		},
		beforeUnmount() {
			document.removeEventListener("keydown", this.onKeyDown), document.removeEventListener("keyup", this.onKeyUp)
		},
		methods: {
			scrollOnChange() {
				this.$nextTick(function() {
					this.$refs.scrolling.scrollToBottom()
				})
			},
			onKeyUp(e) {
				e.code == "Enter" && this.isOpen && this.send(e)
			},
			onKeyDown(e) {
				let {
					keyCode: s
				} = e;
				s === this.KEY_CODE_ESC && this.close(), s === this.KEY_CODE_F1 && this.$emit("help:open"), s === this.KEY_CODE_F6 && !this.getOnboardingOrPauseStatus() && (this.isOpen ? this.close() : this.open()), s === this.KEY_CODE_T && window.isBluredInput && !this.isOpen && this.canOpen && !this.getOnboardingOrPauseStatus() && this.open(), s === this.KEY_CODE_ARROW_TOP && this.isOpen && (this.$refs.hints && this.$refs.hints.currentHintIndex > -1 ? this.$refs.hints.currentHintIndex = -1 : this.prevHistory()), s === this.KEY_CODE_ARROW_BOTTOM && this.isOpen && this.nextHistory();
				let t = this.$refs.scrolling;
				s === this.KEY_CODE_PAGE_UP && waitForDOMCalced(() => {
					t.scrollByStep(SCROLL_STEP, "up")
				}), s === this.KEY_CODE_PAGE_DOWN && waitForDOMCalced(() => {
					t.scrollByStep(SCROLL_STEP, "down")
				}), (s == this.KEY_CODE_X || s == this.KEY_CODE_U) && !this.isOpen && !this.getOnboardingOrPauseStatus() && window.onVoiceRecordChange(s, !1), [this.KEY_CODE_PAGE_UP, this.KEY_CODE_PAGE_DOWN].includes(s) && (this.isInactive = !1, this.clearInactiveTimeout())
			}
		},
		watch: {
			chatStatus(e) {
				e && this.scrollOnChange()
			}
		}
	},
	bi = g(wi, [
		["render", yi]
	]),
	Si = {
		class: "radmir-chat-hints"
	},
	Ei = ["onClick"],
	Ti = {
		class: "radmir-chat-hints__item-overlap"
	};

function Mi(e, s, t, l, r, i) {
	return n(), o("div", Si, [(n(!0), o(b, null, M(i.hints, (d, c) => (n(), o("div", {
		class: w(["radmir-chat-hints__item", {
			"radmir-chat-hints__item_active": c === r.currentHintIndex
		}]),
		key: c,
		onClick: u => i.sendInput(d, u)
	}, [a("div", Ti, p(d.slice(0, t.input.length)), 1), k(p(d.slice(t.input.length)), 1)], 10, Ei))), 128))])
}
const ki = 5,
	Ii = {
		props: {
			input: {
				type: String,
				default: ""
			}
		},
		data() {
			return {
				KEY_CODE_ENTER: window.KEY_CODE_ENTER,
				KEY_CODE_ARROW_BOTTOM: window.KEY_CODE_ARROW_BOTTOM,
				KEY_CODE_ARROW_LEFT: window.KEY_CODE_ARROW_LEFT,
				KEY_CODE_ARROW_RIGHT: window.KEY_CODE_ARROW_RIGHT,
				currentHintIndex: -1
			}
		},
		created() {
			document.addEventListener("keydown", this.onKeyDown)
		},
		unmounted() {
			document.removeEventListener("keydown", this.onKeyDown)
		},
		methods: {
			sendInput(e, s) {
				s && s.stopPropagation(), this.$emit("input", e)
			},
			onKeyDown({
				keyCode: e
			}) {
				e === this.KEY_CODE_ARROW_BOTTOM && this.hints.length > 0 && (this.currentHintIndex = 0), e === this.KEY_CODE_ARROW_RIGHT && (this.currentHintIndex + 1 < this.hints.length ? this.currentHintIndex++ : this.currentHintIndex = 0), e === this.KEY_CODE_ARROW_LEFT && (this.currentHintIndex - 1 >= 0 ? this.currentHintIndex-- : this.currentHintIndex = this.hints.length - 1), e === this.KEY_CODE_ENTER && this.currentHint && this.sendInput(this.currentHint)
			}
		},
		computed: {
			hints() {
				return this.input.length > 1 && (this.input[0] === "/" || this.input[0] === ".") ? $s.filter(e => e.indexOf(et(this.input.toLowerCase())) === 0).slice(0, ki) : []
			},
			currentHint() {
				return this.hints[this.currentHintIndex]
			}
		},
		watch: {
			hints(e) {
				e.length === 0 && (this.currentHintIndex = -1)
			}
		}
	},
	Oi = g(Ii, [
		["render", Mi]
	]),
	Pi = {
		class: "hud-radmir-controls"
	},
	Di = {
		key: 0,
		class: "hud-radmir-controls__row"
	};

function Ai(e, s, t, l, r, i) {
	const d = f("ControlsButton"),
		c = f("ControlsButtonContainer");
	return n(), o("div", Pi, [t.isHudControls ? (n(), o("div", Di, [h(c, {
		text: "Чат"
	}, {
		default: C(() => [h(d, {
			keyCode: e.KEY_CODE_T,
			text: "T"
		}, null, 8, ["keyCode"])]),
		_: 1
	}), h(c, {
		text: "Управление"
	}, {
		default: C(() => [h(d, {
			keyCode: e.KEY_CODE_F1,
			text: "F1"
		}, null, 8, ["keyCode"])]),
		_: 1
	})])) : _("", !0)])
}
const Hi = {
		components: {
			ControlsButton: W,
			ControlsButtonContainer: ce
		},
		props: {
			isHudControls: {
				type: Boolean,
				default: !1
			}
		},
		data: () => ({
			KEY_CODE_T: window.KEY_CODE_T,
			KEY_CODE_X: window.KEY_CODE_X,
			KEY_CODE_F1: window.KEY_CODE_F1
		})
	},
	Li = g(Hi, [
		["render", Ai]
	]),
	ae = .15,
	Bi = 1.51,
	ne = 2.22,
	xi = a("div", {
		class: "radmir-chat__before"
	}, null, -1),
	$i = {
		class: "radmir-chat__container",
		ref: "container"
	},
	Ri = {
		key: 0,
		class: "radmir-chat-input"
	},
	Ni = {
		class: "radmir-chat-input__input"
	},
	Yi = ["maxlength"],
	Fi = {
		class: "radmir-chat-input__input-lang"
	},
	Ki = {
		class: "radmir-chat-input__hints"
	};

function Zi(e, s, t, l, r, i) {
	const d = f("ChatMessage"),
		c = f("scrolling"),
		u = f("HudControls"),
		S = f("ChatHints"),
		T = f("ControlsButton");
	return n(), o("div", {
		class: w(["radmir-chat", {
			"radmir-chat_opened": e.isOpen,
			"radmir-chat_inactive": r.isInactive
		}])
	}, [xi, a("div", $i, [h(c, {
		class: w(["radmir-chat__messages", {
			"radmir-chat__messages_hidden": !t.chatStatus
		}]),
		ref: "scrolling",
		chatIsOpened: e.isOpen,
		style: m({
			height: i.chatHeight
		})
	}, {
		default: C(() => [h(je, {
			name: "chat-message",
			css: t.useChatAnimation
		}, {
			default: C(() => [(n(!0), o(b, null, M(e.filteredMessages, (v, O) => (n(), o("div", {
				class: "radmir-chat__messages-item",
				key: v.key
			}, [h(d, {
				item: v,
				fontSize: `${r.DEFAULT_FONT_SIZE+r.FONT_SIZE_STEP*i.fontSize}vh`,
				lineHeight: `${r.DEFAULT_LINE_HEIGHT+r.FONT_SIZE_STEP*i.fontSize}vh`,
				onDisableMessageModifier: x => e.disableMessageModifier(v)
			}, null, 8, ["item", "fontSize", "lineHeight", "onDisableMessageModifier"])]))), 128))]),
			_: 1
		}, 8, ["css"])]),
		_: 1
	}, 8, ["chatIsOpened", "style", "class"]), h(E, {
		name: "fade"
	}, {
		default: C(() => [!e.isOpen && t.chatStatus ? (n(), y(u, {
			key: 0,
			class: "radmir-chat__controls",
			isHudControls: t.isHudControls,
			style: m({
				top: i.chatHeight
			})
		}, null, 8, ["isHudControls", "style"])) : _("", !0)]),
		_: 1
	}), e.isOpen ? (n(), o("div", Ri, [a("div", Ni, [V(a("input", {
		ref: "input",
		"onUpdate:modelValue": s[0] || (s[0] = v => e.inputText = v),
		onKeydown: s[1] || (s[1] = (...v) => i.onInputKeyDown && i.onInputKeyDown(...v)),
		maxlength: e.MAX_INPUT_LENGTH
	}, null, 40, Yi), [
		[Xe, e.inputText]
	]), a("div", Fi, p(i.keyboardLayout), 1)]), a("div", Ki, [h(S, {
		input: e.inputText,
		onInput: i.inputHint,
		ref: "hints"
	}, null, 8, ["input", "onInput"]), h(T, {
		keyCode: r.KEY_CODE_ENTER,
		text: "Enter",
		onPressed: e.send
	}, null, 8, ["keyCode", "onPressed"])])])) : _("", !0)], 512)], 2)
}
const pe = 2e4,
	Ce = 100,
	Ui = .05,
	Vi = .02,
	Gi = 1e-4,
	Wi = 3e-4,
	Y = 0,
	zi = {
		components: {
			ChatHints: Oi,
			ControlsButton: W,
			HudControls: Li,
			ChatMessage: st
		},
		props: {
			isHudControls: {
				type: Boolean,
				default: !1
			},
			chatStatus: {
				type: Boolean
			},
			canChatFadeout: {
				type: Boolean
			},
			useChatAnimation: {
				type: Boolean,
				default: !0
			}
		},
		mixins: [tt],
		data() {
			return {
				CHAT_INACTIVE_MAX_TIME: pe,
				FONT_SIZE_STEP: ae,
				DEFAULT_FONT_SIZE: Bi,
				DEFAULT_LINE_HEIGHT: ne,
				KEY_CODE_ENTER: window.KEY_CODE_ENTER,
				KEY_CODE_T: window.KEY_CODE_T,
				KEY_CODE_F6: window.KEY_CODE_F6,
				KEY_CODE_F1: window.KEY_CODE_F1,
				KEY_CODE_ESC: window.KEY_CODE_ESC,
				KEY_CODE_ARROW_TOP: window.KEY_CODE_ARROW_TOP,
				KEY_CODE_ARROW_BOTTOM: window.KEY_CODE_ARROW_BOTTOM,
				KEY_CODE_PAGE_UP: window.KEY_CODE_PAGE_UP,
				KEY_CODE_PAGE_DOWN: window.KEY_CODE_PAGE_DOWN,
				KEY_CODE_X: window.KEY_CODE_X,
				KEY_CODE_U: window.KEY_CODE_U,
				isInactive: !1,
				activeTimeout: null,
				pointerIsDown: !1,
				pointerX: 0,
				scrollAnimationFrame: null,
				activeMouseButtons: [],
				activeKeyboardButtons: []
			}
		},
		computed: {
			keyboardLayout() {
				return this.$root.keyboardLayout
			},
			pageSize() {
				return this.$root.chatPageSize
			},
			fontSize() {
				return this.$root.chatFontSize
			},
			chatHeight() {
				return `calc(${ne+ae*this.fontSize}vh * ${this.pageSize})`
			}
		},
		methods: {
			eraseWord() {
				const e = this.$refs.input,
					s = e.value,
					t = Math.min(e.selectionStart, s.length),
					l = " ";
				let r = t;
				s[t] === l && r--;
				for (let i = r; i >= 0; i--)
					if (!(s[i] !== l && i > 0)) {
						this.inputText = s.slice(0, i) + s.slice(t), e.setSelectionRange(i, i);
						return
					}
			},
			onInputKeyDown(e) {
				const {
					keyCode: s,
					ctrlKey: t
				} = e;
				if (s === window.KEY_CODE_BACKSPACE && t) {
					if (!this.$refs.input || this.$refs.input.selectionStart !== this.$refs.input.selectionEnd) return;
					e.preventDefault(), this.eraseWord()
				}
			},
			onMessage(e, s) {
				window.getInterfaceStatus("PlayerInteraction") || this.setInactiveTimeout()
			},
			onOpenChat() {
				this.$emit("openChat"), this.clearInactiveTimeout(), this.isInactive = !1, window.setChatInputStatus(!0)
			},
			onCloseChat() {
				this.setInactiveTimeout(), window.setChatInputStatus(!1)
			},
			setInactiveTimeout() {
				this.isInactive = !1, !this.isOpen && (this.clearInactiveTimeout(), this.canChatFadeout && (this.activeTimeout = setTimeout(() => {
					this.isInactive = !0
				}, pe)))
			},
			clearInactiveTimeout() {
				this.activeTimeout && clearTimeout(this.activeTimeout)
			},
			setIsInactive(e) {
				this.clearInactiveTimeout(), this.isInactive = e, e || this.setInactiveTimeout()
			},
			onKeyDown(e) {
				if (this.activeKeyboardButtons.includes(e.keyCode) || this.activeKeyboardButtons.push(e.keyCode), e.repeat) return;
				let {
					keyCode: s
				} = e;
				const t = s == this.KEY_CODE_X && this.activeMouseButtons.includes(Y);
				(s == this.KEY_CODE_X || s == this.KEY_CODE_U || t) && !this.isOpen && window.onVoiceRecordChange(t ? window.MEGAPHONE_KEY_CODE : s, !0)
			},
			onKeyUp(e) {
				let {
					keyCode: s
				} = e;
				this.activeKeyboardButtons = this.activeKeyboardButtons.filter(r => r !== s), s === this.KEY_CODE_ESC && this.close(), s === this.KEY_CODE_F1 && this.$emit("help:open"), s === this.KEY_CODE_F6 && !this.getOnboardingOrPauseStatus() && (this.isOpen ? this.close() : this.open()), s === this.KEY_CODE_T && window.isBluredInput && !this.isOpen && this.canOpen && !this.getOnboardingOrPauseStatus() && this.open(), s === this.KEY_CODE_ARROW_TOP && this.isOpen && (this.$refs.hints && this.$refs.hints.currentHintIndex > -1 ? this.$refs.hints.currentHintIndex = -1 : this.prevHistory()), s === this.KEY_CODE_ARROW_BOTTOM && this.isOpen && this.nextHistory();
				let t = this.$refs.scrolling;
				s === this.KEY_CODE_PAGE_UP && $(() => {
					t.scrollByStep(Ce, "up")
				}), s === this.KEY_CODE_PAGE_DOWN && $(() => {
					t.scrollByStep(Ce, "down")
				});
				const l = s == this.KEY_CODE_X && this.activeMouseButtons.includes(Y);
				(s == this.KEY_CODE_X || s == this.KEY_CODE_U || l) && !this.isOpen && !this.getOnboardingOrPauseStatus() && window.onVoiceRecordChange(l ? window.MEGAPHONE_KEY_CODE : s, !1), [this.KEY_CODE_PAGE_UP, this.KEY_CODE_PAGE_DOWN].includes(s) && (this.isInactive = !1, this.clearInactiveTimeout())
			},
			onClickOutside(e) {
				this.$refs.container.contains(e.target) || this.close()
			},
			inputHint(e) {
				const s = document.activeElement;
				this.inputText = e, $(() => {
					s && s.setSelectionRange(e.length, e.length)
				})
			},
			scrollOnChange() {
				this.$nextTick(function() {
					this.$refs.scrolling.scrollToBottom()
				})
			},
			onMouseDown(e) {
				this.pointerIsDown = !0, e.button == Y && this.activeKeyboardButtons.includes(this.KEY_CODE_X) && !this.isOpen && window.onVoiceRecordChange(window.MEGAPHONE_KEY_CODE, !0), this.activeMouseButtons.includes(e.button) || this.activeMouseButtons.push(e.button)
			},
			onMouseUp(e) {
				this.pointerIsDown = !1, e.button == Y && this.activeKeyboardButtons.includes(this.KEY_CODE_X) && !this.isOpen && window.onVoiceRecordChange(window.MEGAPHONE_KEY_CODE, !1), this.activeMouseButtons = this.activeMouseButtons.filter(t => t !== e.button)
			},
			onMouseMove(e) {
				this.pointerX = e.clientX
			},
			handleInputScroll(e) {
				const s = this.$refs.input;
				if (!s) return;
				const t = s.getBoundingClientRect(),
					l = t.width * Ui,
					r = t.width * Vi,
					i = s.scrollWidth * Gi,
					d = s.scrollWidth * Wi;
				this.pointerX < t.left + l ? s.scrollLeft -= (this.pointerX < t.left + r ? d : i) * e : this.pointerX > t.right - l && (s.scrollLeft += (this.pointerX > t.left - r ? d : i) * e)
			},
			clearScrollRequestAnimation() {
				this.scrollAnimationFrame && (cancelAnimationFrame(this.scrollAnimationFrame), this.scrollAnimationFrame = null)
			},
			startUpdatingScroll() {
				this.clearScrollRequestAnimation();
				let e;
				const s = t => {
					e || (e = t);
					const l = t - e;
					this.handleInputScroll(l), e = t, this.scrollAnimationFrame = requestAnimationFrame(s)
				};
				this.scrollAnimationFrame = requestAnimationFrame(s)
			}
		},
		mounted() {
			document.addEventListener("keyup", this.onKeyUp), document.addEventListener("keydown", this.onKeyDown), document.addEventListener("click", this.onClickOutside), window.addEventListener("mousedown", this.onMouseDown), window.addEventListener("mouseup", this.onMouseUp), document.addEventListener("mousemove", this.onMouseMove)
		},
		beforeUnmount() {
			document.removeEventListener("keyup", this.onKeyUp), document.removeEventListener("keydown", this.onKeyDown), document.removeEventListener("click", this.onClickOutside), window.removeEventListener("mousedown", this.onMouseDown), window.removeEventListener("mouseup", this.onMouseUp), document.removeEventListener("mousemove", this.onMouseMove)
		},
		watch: {
			pageSize() {
				this.scrollOnChange()
			},
			fontSize() {
				this.scrollOnChange()
			},
			chatStatus(e) {
				e && this.scrollOnChange()
			},
			canChatFadeout(e) {
				this.setInactiveTimeout()
			},
			pointerIsDown(e) {
				e ? this.startUpdatingScroll() : this.clearScrollRequestAnimation()
			}
		}
	},
	qi = g(zi, [
		["render", Zi]
	]),
	Xi = "" + new URL("patrons-bg.svg", import.meta.url).href,
	ji = "" + new URL("patrons-helloween-bg.svg", import.meta.url).href,
	it = "" + new URL("patrons-line-helloween.svg", import.meta.url).href;

function Ji(e, s, t, l, r, i) {
	return n(), o("div", {
		class: w(["hud-radmir-info-wanted", {
			"hud-radmir-info-wanted_hidden": t.value === 0
		}])
	}, [(n(!0), o(b, null, M(e.MAX_STARS_COUNT, (d, c) => (n(), o("img", {
		class: w(["hud-radmir-info-wanted__star", {
			"hud-radmir-info-wanted__star_active": e.MAX_STARS_COUNT - d < t.value
		}]),
		key: c,
		src: re
	}, null, 2))), 128))], 2)
}
const Qi = 6,
	ea = {
		props: {
			value: {
				type: Number,
				default: 0
			}
		},
		data: () => ({
			MAX_STARS_COUNT: Qi
		})
	},
	ta = g(ea, [
		["render", Ji],
		["__scopeId", "data-v-08d0c7de"]
	]),
	N = e => (A("data-v-a4475c76"), e = e(), H(), e),
	sa = {
		class: "hud-radmir-info-data__bars"
	},
	ia = {
		class: "hud-radmir-info-data__bar hud-radmir-info-data__bar_two"
	},
	aa = {
		key: 0,
		class: "hud-radmir-info-data__bar-content hud-radmir-info-data__bar_armour"
	},
	na = N(() => a("div", {
		class: "hud-radmir-info-data__bar__before"
	}, null, -1)),
	oa = N(() => a("div", {
		class: "hud-radmir-info-data__bar__after"
	}, null, -1)),
	ra = {
		key: 0,
		class: "hud-radmir-info-data__bar-value"
	},
	da = {
		key: 1,
		class: "hud-radmir-info-data__lamps hud-radmir-info-data__lamps_armour"
	},
	la = {
		class: "hud-radmir-info-data__bar-content hud-radmir-info-data__bar_health"
	},
	ca = N(() => a("div", {
		class: "hud-radmir-info-data__bar__before"
	}, null, -1)),
	ha = {
		class: "hud-radmir-info-data__bar-icon"
	},
	_a = {
		key: 0,
		class: "hud-radmir-info-data__bar-value"
	},
	ua = {
		key: 1,
		class: "hud-radmir-info-data__bar hud-radmir-info-data__bar_freeze"
	},
	ma = N(() => a("div", {
		class: "hud-radmir-info-data__bar_freeze__before"
	}, null, -1)),
	fa = {
		key: 0,
		class: "hud-radmir-info-data__lamps hud-radmir-info-data__lamps_freeze"
	},
	ga = {
		class: "hud-radmir-info-data__bar hud-radmir-info-data__bar-content hud-radmir-info-data__bar_hunger"
	},
	pa = N(() => a("div", {
		class: "hud-radmir-info-data__bar__before"
	}, null, -1)),
	Ca = {
		key: 0,
		class: "hud-radmir-info-data__bar-value"
	},
	va = {
		key: 1,
		class: "hud-radmir-info-data__lamps hud-radmir-info-data__lamps_hunger"
	},
	ya = {
		class: "hud-radmir-info-data__money"
	},
	wa = N(() => a("img", {
		src: Je
	}, null, -1));

function ba(e, s, t, l, r, i) {
	const d = f("InfoWanted");
	return n(), o("div", {
		class: w(["hud-radmir-info-data", {
			"hud-radmir-info-data_helloween": t.isHelloween,
			"hud-radmir-info-data_with-values": i.isShowValues
		}])
	}, [a("div", sa, [a("div", ia, [h(E, {
		name: "fade"
	}, {
		default: C(() => [t.info.armour ? (n(), o("div", aa, [na, oa, a("div", {
			class: "hud-radmir-info-data__progress-bar hud-radmir-info-data__progress-bar_armour",
			style: m({
				width: `${t.info.armour}%`,
				...r.STYLES.ARMOUR.bar
			})
		}, null, 4), a("div", {
			class: "hud-radmir-info-data__bar-icon",
			style: m(r.STYLES.ARMOUR.icon)
		}, [a("img", {
			src: Re,
			style: m(r.STYLES.ARMOUR.img)
		}, null, 4)], 4), i.isShowValues ? (n(), o("div", ra, p(t.info.armour), 1)) : _("", !0), t.isNewYear ? (n(), o("div", da)) : _("", !0)])) : _("", !0)]),
		_: 1
	}), a("div", la, [ca, a("div", {
		class: "hud-radmir-info-data__progress-bar",
		style: m({
			width: `${17.31*(Math.min(t.info.health,100)/100)}vh`,
			...r.STYLES.HEALTH.bar
		})
	}, null, 4), a("div", {
		class: "hud-radmir-info-data__progress-bar__bg",
		style: m(r.STYLES.HEALTH.barBg)
	}, null, 4), a("div", ha, [t.isNewYear ? (n(), o("img", {
		key: 0,
		src: ft,
		style: m(r.STYLES.HEALTH.newYearImg)
	}, null, 4)) : (n(), o("img", {
		key: 1,
		src: Ne,
		style: m(r.STYLES.HEALTH.img)
	}, null, 4))]), i.isShowValues ? (n(), o("div", _a, p(t.info.health), 1)) : _("", !0), t.info.isShowFreeze ? (n(), o("div", ua, [ma, a("div", {
		class: "hud-radmir-info-data__progress-bar hud-radmir-info-data__progress-bar_freeze",
		style: m({
			marginLeft: `${11.67*(1-t.info.freeze/100)}vh`,
			width: `${11.67*(t.info.freeze/100)}vh`,
			...r.STYLES.FREEZE.bar
		})
	}, null, 4), a("div", {
		class: "hud-radmir-info-data__progress-bar__bg",
		style: m(r.STYLES.FREEZE.barBg)
	}, null, 4), t.isNewYear ? (n(), o("div", fa)) : _("", !0)])) : _("", !0)])]), a("div", ga, [pa, a("div", {
		class: "hud-radmir-info-data__progress-bar hud-radmir-info-data__progress-bar_hunger",
		style: m({
			marginLeft: `${6.67*(1-t.info.hunger/100)}vh`,
			width: `${6.67*(t.info.hunger/100)}vh`,
			...r.STYLES.HUNGER.bar
		})
	}, null, 4), a("div", {
		class: "hud-radmir-info-data__progress-bar__bg hud-radmir-info-data__progress-bar_hunger",
		style: m(r.STYLES.HUNGER.barBg)
	}, null, 4), a("div", {
		class: "hud-radmir-info-data__bar-icon",
		style: m(r.STYLES.HUNGER.icon)
	}, [a("img", {
		src: Ye,
		style: m(r.STYLES.HUNGER.img)
	}, null, 4)], 4), i.isShowValues ? (n(), o("div", Ca, p(t.info.hunger), 1)) : _("", !0), t.isNewYear ? (n(), o("div", va)) : _("", !0)])]), a("div", ya, [wa, k(p(i.formatNumberWithSpaces(t.info.money)), 1)]), h(d, {
		class: "hud-radmir-info-data__wanted",
		value: t.info.wanted
	}, null, 8, ["value"])], 2)
}
const Sa = {
		ARMOUR: {
			icon: {
				right: "-0.93vh"
			},
			img: {
				width: "2.41vh",
				height: "2.96vh"
			},
			bar: {
				height: "1.11vh",
				background: "#2e87ff"
			}
		},
		HEALTH: {
			img: {
				width: "4.3vh",
				height: "3.56vh"
			},
			newYearImg: {
				width: "3.24vh",
				height: "3.8vh",
				marginTop: "0.93vh"
			},
			bar: {
				height: "1.11vh",
				background: "#EAD57C"
			},
			barBg: {
				width: "17.31vh",
				height: "1.11vh",
				background: "#beb58c"
			}
		},
		FREEZE: {
			bar: {
				height: "0.56vh",
				background: "#71CCDF"
			},
			barBg: {
				width: "11.67vh",
				height: "0.56vh",
				background: "#81a5ab"
			}
		},
		HUNGER: {
			icon: {
				right: "-1.85vh"
			},
			img: {
				width: "3.06vh",
				height: "2.78vh"
			},
			bar: {
				height: "1.11vh",
				background: "#F8F6ED"
			},
			barBg: {
				width: "6.67vh",
				height: "1.11vh",
				background: "#b5b5b2"
			}
		}
	},
	Ea = {
		props: {
			info: {
				type: Object,
				required: !0
			},
			isHelloween: {
				type: Boolean,
				default: !1
			},
			isNewYear: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			InfoWanted: ta
		},
		data() {
			return {
				STYLES: Sa
			}
		},
		computed: {
			isShowValues() {
				return this.info.isShowValues
			}
		},
		methods: {
			formatNumberWithSpaces: Qe
		}
	},
	Ta = g(Ea, [
		["render", ba],
		["__scopeId", "data-v-a4475c76"]
	]),
	Ma = {},
	ka = {
		width: "252",
		height: "233",
		viewBox: "0 0 252 233",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	Ia = a("path", {
		d: "M127.231 61.647C46.7883 23.0149 25.1726 64.5008 3.28339 76.8302L0 108.884L3.28339 219.027L211.779 233L252 140.943C251.726 87.2417 246.747 -15.7225 229.016 2.03184C206.853 24.2248 179.781 86.8834 127.231 61.647Z",
		fill: "#F4F1E1"
	}, null, -1),
	Oa = [Ia];

function Pa(e, s) {
	return n(), o("svg", ka, Oa)
}
const Da = g(Ma, [
		["render", Pa]
	]),
	he = e => (A("data-v-9fbddfdb"), e = e(), H(), e),
	Aa = he(() => a("div", {
		class: "hud-radmir-info__bg"
	}, null, -1)),
	Ha = {
		key: 0,
		class: "hud-radmir-info__content"
	},
	La = {
		class: "hud-radmir-info__fist"
	},
	Ba = ["src"],
	xa = {
		class: "hud-radmir-info__fist-content"
	},
	$a = {
		key: 0,
		class: "hud-radmir-info__breath"
	},
	Ra = he(() => a("img", {
		src: Ke
	}, null, -1)),
	Na = ["src"],
	Ya = {
		key: 2,
		class: "hud-radmir-info__fist-border",
		src: Fe
	},
	Fa = {
		class: "hud-radmir-info__server"
	},
	Ka = {
		class: "hud-radmir-info__server-value"
	},
	Za = {
		key: 1,
		class: "hud-radmir-info__patrons"
	},
	Ua = ["src"],
	Va = {
		class: "hud-radmir-info__patrons-content"
	},
	Ga = he(() => a("img", {
		src: Ze
	}, null, -1)),
	Wa = {
		class: "hud-radmir-info__patrons-value"
	},
	za = {
		class: "hud-radmir-info__patrons-value__total"
	},
	qa = {
		key: 0,
		src: it
	};

function Xa(e, s, t, l, r, i) {
	const d = f("InfoData"),
		c = f("IconBreathFill");
	return n(), o("div", {
		class: w(["hud-radmir-info", {
			"hud-radmir-info_helloween": t.isHelloween,
			"hud-radmir-info_new-year": t.isNewYear,
			"hud-radmir-info_easter": t.isEaster
		}])
	}, [t.bonus > 1 ? (n(), o("div", {
		key: 0,
		class: "hud-radmir-info__bonus",
		style: m({
			backgroundImage: `url('${e.bonuseImage[`/src/assets/images/hud/bonus/${t.bonus}.png`]}')`
		})
	}, null, 4)) : _("", !0), Aa, h(E, {
		name: "fade"
	}, {
		default: C(() => [t.info.showBars ? (n(), o("div", Ha, [h(d, {
			info: t.info,
			isHelloween: t.isHelloween,
			isNewYear: t.isNewYear
		}, null, 8, ["info", "isHelloween", "isNewYear"])])) : _("", !0)]),
		_: 1
	}), a("div", La, [t.info.weapon && t.info.breath >= 99 ? (n(), o("img", {
		key: 0,
		class: "hud-radmir-info__logo",
		src: i.logoImage
	}, null, 8, Ba)) : _("", !0), a("div", xa, [h(E, {
		name: "fade"
	}, {
		default: C(() => [t.info.breath < 99 ? (n(), o("div", $a, [Ra, a("div", {
			class: "hud-radmir-info__breath-fill",
			style: m({
				top: `${100-t.info.breath}%`
			})
		}, [h(c)], 4)])) : _("", !0)]),
		_: 1
	}), !t.info.weapon || t.info.breath < 99 ? (n(), o("img", {
		key: 0,
		class: "hud-radmir-info__fist-logo",
		src: i.logoImage,
		style: m({
			opacity: t.info.breath < 99 ? .25 : 1
		})
	}, null, 12, Na)) : (n(), o("div", {
		key: 1,
		class: "hud-radmir-info__fist-weapon",
		style: m({
			backgroundImage: `url('/images/hud/${t.info.weapon}.png')`
		})
	}, null, 4)), t.isNewYear ? (n(), o("img", Ya)) : _("", !0), a("div", Fa, [a("div", Ka, p(t.server), 1)])]), t.info.weapon ? (n(), o("div", Za, [a("img", {
		class: "hud-radmir-info__patrons-bg",
		src: i.patronsBackground
	}, null, 8, Ua), a("div", Va, [Ga, a("div", Wa, [a("div", za, p(t.info.ammoInClip), 1), t.isHelloween ? (n(), o("img", qa)) : (n(), o(b, {
		key: 1
	}, [k("|")], 64)), k(p(t.info.totalAmmo), 1)])])])) : _("", !0)])], 2)
}
const ja = {
		props: {
			info: {
				type: Object,
				required: !0
			},
			server: {
				type: Number,
				default: 1
			},
			bonus: {
				type: Number,
				default: 1
			},
			isHelloween: {
				type: Boolean,
				default: !1
			},
			isNewYear: {
				type: Boolean,
				default: !1
			},
			isEaster: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			InfoData: Ta,
			IconBreathFill: Da
		},
		data: () => ({
			bonuseImage: Object.assign({
				"/src/assets/images/hud/bonus/2.png": Ue,
				"/src/assets/images/hud/bonus/3.png": Ve
			}),
			patronIcons: Object.assign({
				"./assets/patrons-bg.svg": Xi,
				"./assets/patrons-helloween-bg.svg": ji,
				"./assets/patrons-line-helloween.svg": it
			}),
			logo: Object.assign({
				"/src/assets/images/hud/radmir-logo-helloween.png": Ge,
				"/src/assets/images/hud/radmir-logo-new-year.png": We,
				"/src/assets/images/hud/radmir-logo.png": ze
			})
		}),
		computed: {
			logoImage() {
				let e = null;
				return this.isHelloween && (e = "helloween"), this.isNewYear && (e = "new-year"), this.logo[`/src/assets/images/hud/radmir-logo${e?"-"+e:""}.png`]
			},
			patronsBackground() {
				let e = null;
				return this.isHelloween && (e = "helloween"), this.patronIcons[`./assets/patrons${e?"-"+e:""}-bg.svg`]
			}
		}
	},
	Ja = g(ja, [
		["render", Xa],
		["__scopeId", "data-v-9fbddfdb"]
	]),
	Qa = {},
	en = {
		width: "21",
		height: "20",
		viewBox: "0 0 21 20",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	tn = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M0 0H12.9231V12.0001H13.4615C15.2458 12.0001 16.6923 13.3432 16.6923 15.0001C16.6923 15.5524 17.1745 16.0001 17.7692 16.0001C18.364 16.0001 18.8462 15.5524 18.8462 15.0001V6.41429L14.8539 2.70718L16.3769 1.29297L21 5.58586V15.0001C21 16.6569 19.5535 18.0001 17.7692 18.0001C15.9849 18.0001 14.5385 16.6569 14.5385 15.0001C14.5385 14.4478 14.0563 14.0001 13.4615 14.0001H12.9231V20H0V0ZM2.15385 2H10.7692V8H2.15385V2Z",
		fill: "#F2EFDC"
	}, null, -1),
	sn = [tn];

function an(e, s) {
	return n(), o("svg", en, sn)
}
const nn = g(Qa, [
		["render", an]
	]),
	on = {},
	rn = {
		width: "28",
		height: "28",
		viewBox: "0 0 28 28",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	dn = a("path", {
		render: !0,
		d: "M26.6823 11.5405C26.1562 11.4154 25.5537 11.4715 24.9937 11.7086C24.4294 11.9458 23.9627 12.3339 23.6785 12.8082C23.373 13.3128 23.3094 13.8777 23.5045 14.3563C23.6997 14.835 24.1367 15.1886 24.7052 15.3266C24.8876 15.374 25.0786 15.3955 25.2737 15.3955C25.6428 15.3955 26.0289 15.3179 26.398 15.1627C27.6242 14.6452 28.2776 13.4809 27.8872 12.515C27.6921 12.0364 27.2508 11.6828 26.6823 11.5405Z",
		fill: "#F2EFDC"
	}, null, -1),
	ln = a("path", {
		render: !0,
		d: "M26.6823 11.5405C26.1562 11.4154 25.5537 11.4715 24.9937 11.7086C24.4294 11.9458 23.9627 12.3339 23.6785 12.8082C23.373 13.3128 23.3094 13.8777 23.5045 14.3563C23.6997 14.835 24.1367 15.1886 24.7052 15.3266C24.8876 15.374 25.0786 15.3955 25.2737 15.3955C25.6428 15.3955 26.0289 15.3179 26.398 15.1627C27.6242 14.6452 28.2776 13.4809 27.8872 12.515C27.6921 12.0364 27.2508 11.6828 26.6823 11.5405Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	cn = a("path", {
		render: !0,
		d: "M26.6823 11.5405C26.1562 11.4154 25.5537 11.4715 24.9937 11.7086C24.4294 11.9458 23.9627 12.3339 23.6785 12.8082C23.373 13.3128 23.3094 13.8777 23.5045 14.3563C23.6997 14.835 24.1367 15.1886 24.7052 15.3266C24.8876 15.374 25.0786 15.3955 25.2737 15.3955C25.6428 15.3955 26.0289 15.3179 26.398 15.1627C27.6242 14.6452 28.2776 13.4809 27.8872 12.515C27.6921 12.0364 27.2508 11.6828 26.6823 11.5405Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	hn = a("path", {
		render: !0,
		d: "M26.6823 11.5405C26.1562 11.4154 25.5537 11.4715 24.9937 11.7086C24.4294 11.9458 23.9627 12.3339 23.6785 12.8082C23.373 13.3128 23.3094 13.8777 23.5045 14.3563C23.6997 14.835 24.1367 15.1886 24.7052 15.3266C24.8876 15.374 25.0786 15.3955 25.2737 15.3955C25.6428 15.3955 26.0289 15.3179 26.398 15.1627C27.6242 14.6452 28.2776 13.4809 27.8872 12.515C27.6921 12.0364 27.2508 11.6828 26.6823 11.5405Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	_n = a("path", {
		render: !0,
		d: "M14.6331 24.1449C14.1027 24.0156 13.5045 24.0759 12.9402 24.3131C12.3759 24.5503 11.9135 24.9384 11.6292 25.4084C11.3195 25.9172 11.2559 26.4821 11.451 26.9608C11.7226 27.6248 12.4099 28 13.216 28C13.5766 28 13.9627 27.9267 14.3445 27.7628C15.5749 27.2497 16.2283 26.0854 15.8337 25.1152C15.6386 24.6365 15.2016 24.2829 14.6331 24.1449Z",
		fill: "#F2EFDC"
	}, null, -1),
	un = a("path", {
		render: !0,
		d: "M14.6331 24.1449C14.1027 24.0156 13.5045 24.0759 12.9402 24.3131C12.3759 24.5503 11.9135 24.9384 11.6292 25.4084C11.3195 25.9172 11.2559 26.4821 11.451 26.9608C11.7226 27.6248 12.4099 28 13.216 28C13.5766 28 13.9627 27.9267 14.3445 27.7628C15.5749 27.2497 16.2283 26.0854 15.8337 25.1152C15.6386 24.6365 15.2016 24.2829 14.6331 24.1449Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	mn = a("path", {
		render: !0,
		d: "M14.6331 24.1449C14.1027 24.0156 13.5045 24.0759 12.9402 24.3131C12.3759 24.5503 11.9135 24.9384 11.6292 25.4084C11.3195 25.9172 11.2559 26.4821 11.451 26.9608C11.7226 27.6248 12.4099 28 13.216 28C13.5766 28 13.9627 27.9267 14.3445 27.7628C15.5749 27.2497 16.2283 26.0854 15.8337 25.1152C15.6386 24.6365 15.2016 24.2829 14.6331 24.1449Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	fn = a("path", {
		render: !0,
		d: "M14.6331 24.1449C14.1027 24.0156 13.5045 24.0759 12.9402 24.3131C12.3759 24.5503 11.9135 24.9384 11.6292 25.4084C11.3195 25.9172 11.2559 26.4821 11.451 26.9608C11.7226 27.6248 12.4099 28 13.216 28C13.5766 28 13.9627 27.9267 14.3445 27.7628C15.5749 27.2497 16.2283 26.0854 15.8337 25.1152C15.6386 24.6365 15.2016 24.2829 14.6331 24.1449Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	gn = a("path", {
		render: !0,
		d: "M3.16081 6.43918C3.50446 6.43918 3.83115 6.35294 4.12814 6.18045C5.26094 5.51638 5.4858 3.74839 4.62878 2.24345C3.77175 0.734188 2.15105 0.0485541 1.02249 0.712627C0.352143 1.10503 0 1.88122 0 2.76091C0 3.37323 0.169708 4.03731 0.521851 4.65394C0.924907 5.36114 1.50616 5.9131 2.15953 6.21064C2.4947 6.36156 2.83412 6.43918 3.16081 6.43918Z",
		fill: "#F2EFDC"
	}, null, -1),
	pn = a("path", {
		render: !0,
		d: "M3.16081 6.43918C3.50446 6.43918 3.83115 6.35294 4.12814 6.18045C5.26094 5.51638 5.4858 3.74839 4.62878 2.24345C3.77175 0.734188 2.15105 0.0485541 1.02249 0.712627C0.352143 1.10503 0 1.88122 0 2.76091C0 3.37323 0.169708 4.03731 0.521851 4.65394C0.924907 5.36114 1.50616 5.9131 2.15953 6.21064C2.4947 6.36156 2.83412 6.43918 3.16081 6.43918Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	Cn = a("path", {
		render: !0,
		d: "M3.16081 6.43918C3.50446 6.43918 3.83115 6.35294 4.12814 6.18045C5.26094 5.51638 5.4858 3.74839 4.62878 2.24345C3.77175 0.734188 2.15105 0.0485541 1.02249 0.712627C0.352143 1.10503 0 1.88122 0 2.76091C0 3.37323 0.169708 4.03731 0.521851 4.65394C0.924907 5.36114 1.50616 5.9131 2.15953 6.21064C2.4947 6.36156 2.83412 6.43918 3.16081 6.43918Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	vn = a("path", {
		render: !0,
		d: "M3.16081 6.43918C3.50446 6.43918 3.83115 6.35294 4.12814 6.18045C5.26094 5.51638 5.4858 3.74839 4.62878 2.24345C3.77175 0.734188 2.15105 0.0485541 1.02249 0.712627C0.352143 1.10503 0 1.88122 0 2.76091C0 3.37323 0.169708 4.03731 0.521851 4.65394C0.924907 5.36114 1.50616 5.9131 2.15953 6.21064C2.4947 6.36156 2.83412 6.43918 3.16081 6.43918Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	yn = a("path", {
		render: !0,
		d: "M21.8117 23.3041C21.5571 23.7525 21.5486 24.3217 21.7862 24.8651C22.0068 25.3696 22.4184 25.818 22.9487 26.1285C23.4154 26.4045 23.9076 26.5382 24.3658 26.5382C25.0319 26.5382 25.6131 26.2536 25.9186 25.7146C26.4362 24.809 25.9356 23.5671 24.7858 22.8944C23.6318 22.2174 22.3293 22.3985 21.8117 23.3041Z",
		fill: "#F2EFDC"
	}, null, -1),
	wn = a("path", {
		render: !0,
		d: "M21.8117 23.3041C21.5571 23.7525 21.5486 24.3217 21.7862 24.8651C22.0068 25.3696 22.4184 25.818 22.9487 26.1285C23.4154 26.4045 23.9076 26.5382 24.3658 26.5382C25.0319 26.5382 25.6131 26.2536 25.9186 25.7146C26.4362 24.809 25.9356 23.5671 24.7858 22.8944C23.6318 22.2174 22.3293 22.3985 21.8117 23.3041Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	bn = a("path", {
		render: !0,
		d: "M21.8117 23.3041C21.5571 23.7525 21.5486 24.3217 21.7862 24.8651C22.0068 25.3696 22.4184 25.818 22.9487 26.1285C23.4154 26.4045 23.9076 26.5382 24.3658 26.5382C25.0319 26.5382 25.6131 26.2536 25.9186 25.7146C26.4362 24.809 25.9356 23.5671 24.7858 22.8944C23.6318 22.2174 22.3293 22.3985 21.8117 23.3041Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	Sn = a("path", {
		render: !0,
		d: "M21.8117 23.3041C21.5571 23.7525 21.5486 24.3217 21.7862 24.8651C22.0068 25.3696 22.4184 25.818 22.9487 26.1285C23.4154 26.4045 23.9076 26.5382 24.3658 26.5382C25.0319 26.5382 25.6131 26.2536 25.9186 25.7146C26.4362 24.809 25.9356 23.5671 24.7858 22.8944C23.6318 22.2174 22.3293 22.3985 21.8117 23.3041Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	En = a("path", {
		render: !0,
		d: "M22.9402 2.8299C22.5329 2.51942 21.9772 2.44612 21.4171 2.62723C20.8995 2.7954 20.4158 3.16194 20.0552 3.65784C19.6946 4.15805 19.4909 4.73588 19.4867 5.28783C19.4825 5.88291 19.7158 6.40037 20.1273 6.70654C20.3904 6.90489 20.7128 7.00407 21.0565 7.00407C21.2474 7.00407 21.4468 6.97389 21.6505 6.90921C22.1681 6.74103 22.6517 6.3745 23.0124 5.87429C23.373 5.37839 23.5767 4.80056 23.5809 4.2486C23.5851 3.65352 23.3518 3.13606 22.9402 2.8299Z",
		fill: "#F2EFDC"
	}, null, -1),
	Tn = a("path", {
		render: !0,
		d: "M22.9402 2.8299C22.5329 2.51942 21.9772 2.44612 21.4171 2.62723C20.8995 2.7954 20.4158 3.16194 20.0552 3.65784C19.6946 4.15805 19.4909 4.73588 19.4867 5.28783C19.4825 5.88291 19.7158 6.40037 20.1273 6.70654C20.3904 6.90489 20.7128 7.00407 21.0565 7.00407C21.2474 7.00407 21.4468 6.97389 21.6505 6.90921C22.1681 6.74103 22.6517 6.3745 23.0124 5.87429C23.373 5.37839 23.5767 4.80056 23.5809 4.2486C23.5851 3.65352 23.3518 3.13606 22.9402 2.8299Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	Mn = a("path", {
		render: !0,
		d: "M22.9402 2.8299C22.5329 2.51942 21.9772 2.44612 21.4171 2.62723C20.8995 2.7954 20.4158 3.16194 20.0552 3.65784C19.6946 4.15805 19.4909 4.73588 19.4867 5.28783C19.4825 5.88291 19.7158 6.40037 20.1273 6.70654C20.3904 6.90489 20.7128 7.00407 21.0565 7.00407C21.2474 7.00407 21.4468 6.97389 21.6505 6.90921C22.1681 6.74103 22.6517 6.3745 23.0124 5.87429C23.373 5.37839 23.5767 4.80056 23.5809 4.2486C23.5851 3.65352 23.3518 3.13606 22.9402 2.8299Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	kn = a("path", {
		render: !0,
		d: "M22.9402 2.8299C22.5329 2.51942 21.9772 2.44612 21.4171 2.62723C20.8995 2.7954 20.4158 3.16194 20.0552 3.65784C19.6946 4.15805 19.4909 4.73588 19.4867 5.28783C19.4825 5.88291 19.7158 6.40037 20.1273 6.70654C20.3904 6.90489 20.7128 7.00407 21.0565 7.00407C21.2474 7.00407 21.4468 6.97389 21.6505 6.90921C22.1681 6.74103 22.6517 6.3745 23.0124 5.87429C23.373 5.37839 23.5767 4.80056 23.5809 4.2486C23.5851 3.65352 23.3518 3.13606 22.9402 2.8299Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	In = a("path", {
		render: !0,
		d: "M3.30506 14.2614L4.56938 14.973C4.95547 15.1886 5.33731 15.4257 5.42216 15.7491C5.50702 16.0898 5.26518 16.4865 5.00638 16.9005C4.95122 16.991 4.89607 17.0773 4.84516 17.1635C3.8057 18.9272 4.04753 21.3075 5.40519 22.7003C6.16039 23.4722 7.20409 23.8603 8.23507 23.8603C9.18543 23.8603 10.1273 23.5283 10.8104 22.8513C11.2219 22.4459 11.5316 21.95 11.8329 21.4757C12.2784 20.7599 12.7026 20.0872 13.3772 19.8586C14.1282 19.6085 14.9767 20.0052 15.5537 20.3804C15.7871 20.5356 16.0162 20.6995 16.241 20.8634C16.7502 21.2385 17.2805 21.6266 17.8999 21.8681C19.3043 22.4287 21.3492 22.2389 22.376 20.7944C22.779 20.2252 22.6008 19.2894 22.2954 18.8668C22.0111 18.4701 21.5741 18.1553 21.1583 17.8492C20.7425 17.5516 20.314 17.2411 20.1231 16.9048C19.7031 16.1717 19.3 15.3222 19.4994 14.559C19.5715 14.283 19.7243 14.02 19.8855 13.7397L19.9364 13.6534C20.0382 13.4723 20.2461 13.2265 20.4625 12.9721C20.9207 12.4374 21.3917 11.8854 21.4553 11.3292C21.5656 10.4366 21.2686 9.57844 20.6874 9.09116C20.0467 8.55214 19.2618 8.52627 18.5024 8.50039C18.0357 8.48315 17.5902 8.47021 17.2041 8.33653C17.0641 8.2891 17.0344 8.2546 17.0302 8.24598C17.0217 8.23735 17.009 8.20286 16.9962 8.0778C16.958 7.6509 17.0471 7.20675 17.2381 6.82296C17.2932 6.71516 17.3526 6.60304 17.412 6.49093C17.7429 5.8786 18.1163 5.18434 17.9127 4.51596C17.7981 4.13649 17.5181 3.83032 17.0768 3.60609C16.6738 3.39479 15.9483 3.01964 15.1804 3.01964C14.633 3.01964 14.0603 3.20937 13.5639 3.78289C13.0717 4.35209 12.7917 5.15847 12.7578 6.12439L12.7535 6.28826C12.7451 6.6246 12.7366 6.93939 12.5923 7.13775C12.3505 7.4741 11.7268 7.4396 11.2474 7.34905C10.7552 7.25849 10.2673 7.13775 9.77941 6.99114C9.57152 6.92646 9.31271 6.84884 9.02845 6.89627C8.8248 6.93077 8.6254 7.02564 8.43872 7.18087C7.80231 7.70696 7.60291 8.67288 7.98899 9.38008C8.13324 9.64312 8.33689 9.84148 8.51509 10.0183L8.60418 10.1131C8.93936 10.4538 9.32544 10.967 9.25331 11.4758C9.21089 11.782 9.00724 11.9846 8.84602 12.1011C8.48963 12.3555 7.97626 12.4546 7.53078 12.3598C6.85619 12.2132 6.26222 11.7863 5.63854 11.3378C5.49429 11.23 5.35004 11.1265 5.20154 11.023C4.70515 10.678 4.10268 10.3201 3.40688 10.2598C2.57956 10.1908 1.80739 10.6134 1.52737 11.2904C1.27705 11.8854 1.42979 12.6487 1.90921 13.2265C2.30378 13.7052 2.83412 14.0027 3.30506 14.2614Z",
		fill: "#F2EFDC"
	}, null, -1),
	On = a("path", {
		render: !0,
		d: "M3.30506 14.2614L4.56938 14.973C4.95547 15.1886 5.33731 15.4257 5.42216 15.7491C5.50702 16.0898 5.26518 16.4865 5.00638 16.9005C4.95122 16.991 4.89607 17.0773 4.84516 17.1635C3.8057 18.9272 4.04753 21.3075 5.40519 22.7003C6.16039 23.4722 7.20409 23.8603 8.23507 23.8603C9.18543 23.8603 10.1273 23.5283 10.8104 22.8513C11.2219 22.4459 11.5316 21.95 11.8329 21.4757C12.2784 20.7599 12.7026 20.0872 13.3772 19.8586C14.1282 19.6085 14.9767 20.0052 15.5537 20.3804C15.7871 20.5356 16.0162 20.6995 16.241 20.8634C16.7502 21.2385 17.2805 21.6266 17.8999 21.8681C19.3043 22.4287 21.3492 22.2389 22.376 20.7944C22.779 20.2252 22.6008 19.2894 22.2954 18.8668C22.0111 18.4701 21.5741 18.1553 21.1583 17.8492C20.7425 17.5516 20.314 17.2411 20.1231 16.9048C19.7031 16.1717 19.3 15.3222 19.4994 14.559C19.5715 14.283 19.7243 14.02 19.8855 13.7397L19.9364 13.6534C20.0382 13.4723 20.2461 13.2265 20.4625 12.9721C20.9207 12.4374 21.3917 11.8854 21.4553 11.3292C21.5656 10.4366 21.2686 9.57844 20.6874 9.09116C20.0467 8.55214 19.2618 8.52627 18.5024 8.50039C18.0357 8.48315 17.5902 8.47021 17.2041 8.33653C17.0641 8.2891 17.0344 8.2546 17.0302 8.24598C17.0217 8.23735 17.009 8.20286 16.9962 8.0778C16.958 7.6509 17.0471 7.20675 17.2381 6.82296C17.2932 6.71516 17.3526 6.60304 17.412 6.49093C17.7429 5.8786 18.1163 5.18434 17.9127 4.51596C17.7981 4.13649 17.5181 3.83032 17.0768 3.60609C16.6738 3.39479 15.9483 3.01964 15.1804 3.01964C14.633 3.01964 14.0603 3.20937 13.5639 3.78289C13.0717 4.35209 12.7917 5.15847 12.7578 6.12439L12.7535 6.28826C12.7451 6.6246 12.7366 6.93939 12.5923 7.13775C12.3505 7.4741 11.7268 7.4396 11.2474 7.34905C10.7552 7.25849 10.2673 7.13775 9.77941 6.99114C9.57152 6.92646 9.31271 6.84884 9.02845 6.89627C8.8248 6.93077 8.6254 7.02564 8.43872 7.18087C7.80231 7.70696 7.60291 8.67288 7.98899 9.38008C8.13324 9.64312 8.33689 9.84148 8.51509 10.0183L8.60418 10.1131C8.93936 10.4538 9.32544 10.967 9.25331 11.4758C9.21089 11.782 9.00724 11.9846 8.84602 12.1011C8.48963 12.3555 7.97626 12.4546 7.53078 12.3598C6.85619 12.2132 6.26222 11.7863 5.63854 11.3378C5.49429 11.23 5.35004 11.1265 5.20154 11.023C4.70515 10.678 4.10268 10.3201 3.40688 10.2598C2.57956 10.1908 1.80739 10.6134 1.52737 11.2904C1.27705 11.8854 1.42979 12.6487 1.90921 13.2265C2.30378 13.7052 2.83412 14.0027 3.30506 14.2614Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	Pn = a("path", {
		render: !0,
		d: "M3.30506 14.2614L4.56938 14.973C4.95547 15.1886 5.33731 15.4257 5.42216 15.7491C5.50702 16.0898 5.26518 16.4865 5.00638 16.9005C4.95122 16.991 4.89607 17.0773 4.84516 17.1635C3.8057 18.9272 4.04753 21.3075 5.40519 22.7003C6.16039 23.4722 7.20409 23.8603 8.23507 23.8603C9.18543 23.8603 10.1273 23.5283 10.8104 22.8513C11.2219 22.4459 11.5316 21.95 11.8329 21.4757C12.2784 20.7599 12.7026 20.0872 13.3772 19.8586C14.1282 19.6085 14.9767 20.0052 15.5537 20.3804C15.7871 20.5356 16.0162 20.6995 16.241 20.8634C16.7502 21.2385 17.2805 21.6266 17.8999 21.8681C19.3043 22.4287 21.3492 22.2389 22.376 20.7944C22.779 20.2252 22.6008 19.2894 22.2954 18.8668C22.0111 18.4701 21.5741 18.1553 21.1583 17.8492C20.7425 17.5516 20.314 17.2411 20.1231 16.9048C19.7031 16.1717 19.3 15.3222 19.4994 14.559C19.5715 14.283 19.7243 14.02 19.8855 13.7397L19.9364 13.6534C20.0382 13.4723 20.2461 13.2265 20.4625 12.9721C20.9207 12.4374 21.3917 11.8854 21.4553 11.3292C21.5656 10.4366 21.2686 9.57844 20.6874 9.09116C20.0467 8.55214 19.2618 8.52627 18.5024 8.50039C18.0357 8.48315 17.5902 8.47021 17.2041 8.33653C17.0641 8.2891 17.0344 8.2546 17.0302 8.24598C17.0217 8.23735 17.009 8.20286 16.9962 8.0778C16.958 7.6509 17.0471 7.20675 17.2381 6.82296C17.2932 6.71516 17.3526 6.60304 17.412 6.49093C17.7429 5.8786 18.1163 5.18434 17.9127 4.51596C17.7981 4.13649 17.5181 3.83032 17.0768 3.60609C16.6738 3.39479 15.9483 3.01964 15.1804 3.01964C14.633 3.01964 14.0603 3.20937 13.5639 3.78289C13.0717 4.35209 12.7917 5.15847 12.7578 6.12439L12.7535 6.28826C12.7451 6.6246 12.7366 6.93939 12.5923 7.13775C12.3505 7.4741 11.7268 7.4396 11.2474 7.34905C10.7552 7.25849 10.2673 7.13775 9.77941 6.99114C9.57152 6.92646 9.31271 6.84884 9.02845 6.89627C8.8248 6.93077 8.6254 7.02564 8.43872 7.18087C7.80231 7.70696 7.60291 8.67288 7.98899 9.38008C8.13324 9.64312 8.33689 9.84148 8.51509 10.0183L8.60418 10.1131C8.93936 10.4538 9.32544 10.967 9.25331 11.4758C9.21089 11.782 9.00724 11.9846 8.84602 12.1011C8.48963 12.3555 7.97626 12.4546 7.53078 12.3598C6.85619 12.2132 6.26222 11.7863 5.63854 11.3378C5.49429 11.23 5.35004 11.1265 5.20154 11.023C4.70515 10.678 4.10268 10.3201 3.40688 10.2598C2.57956 10.1908 1.80739 10.6134 1.52737 11.2904C1.27705 11.8854 1.42979 12.6487 1.90921 13.2265C2.30378 13.7052 2.83412 14.0027 3.30506 14.2614Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	Dn = a("path", {
		render: !0,
		d: "M3.30506 14.2614L4.56938 14.973C4.95547 15.1886 5.33731 15.4257 5.42216 15.7491C5.50702 16.0898 5.26518 16.4865 5.00638 16.9005C4.95122 16.991 4.89607 17.0773 4.84516 17.1635C3.8057 18.9272 4.04753 21.3075 5.40519 22.7003C6.16039 23.4722 7.20409 23.8603 8.23507 23.8603C9.18543 23.8603 10.1273 23.5283 10.8104 22.8513C11.2219 22.4459 11.5316 21.95 11.8329 21.4757C12.2784 20.7599 12.7026 20.0872 13.3772 19.8586C14.1282 19.6085 14.9767 20.0052 15.5537 20.3804C15.7871 20.5356 16.0162 20.6995 16.241 20.8634C16.7502 21.2385 17.2805 21.6266 17.8999 21.8681C19.3043 22.4287 21.3492 22.2389 22.376 20.7944C22.779 20.2252 22.6008 19.2894 22.2954 18.8668C22.0111 18.4701 21.5741 18.1553 21.1583 17.8492C20.7425 17.5516 20.314 17.2411 20.1231 16.9048C19.7031 16.1717 19.3 15.3222 19.4994 14.559C19.5715 14.283 19.7243 14.02 19.8855 13.7397L19.9364 13.6534C20.0382 13.4723 20.2461 13.2265 20.4625 12.9721C20.9207 12.4374 21.3917 11.8854 21.4553 11.3292C21.5656 10.4366 21.2686 9.57844 20.6874 9.09116C20.0467 8.55214 19.2618 8.52627 18.5024 8.50039C18.0357 8.48315 17.5902 8.47021 17.2041 8.33653C17.0641 8.2891 17.0344 8.2546 17.0302 8.24598C17.0217 8.23735 17.009 8.20286 16.9962 8.0778C16.958 7.6509 17.0471 7.20675 17.2381 6.82296C17.2932 6.71516 17.3526 6.60304 17.412 6.49093C17.7429 5.8786 18.1163 5.18434 17.9127 4.51596C17.7981 4.13649 17.5181 3.83032 17.0768 3.60609C16.6738 3.39479 15.9483 3.01964 15.1804 3.01964C14.633 3.01964 14.0603 3.20937 13.5639 3.78289C13.0717 4.35209 12.7917 5.15847 12.7578 6.12439L12.7535 6.28826C12.7451 6.6246 12.7366 6.93939 12.5923 7.13775C12.3505 7.4741 11.7268 7.4396 11.2474 7.34905C10.7552 7.25849 10.2673 7.13775 9.77941 6.99114C9.57152 6.92646 9.31271 6.84884 9.02845 6.89627C8.8248 6.93077 8.6254 7.02564 8.43872 7.18087C7.80231 7.70696 7.60291 8.67288 7.98899 9.38008C8.13324 9.64312 8.33689 9.84148 8.51509 10.0183L8.60418 10.1131C8.93936 10.4538 9.32544 10.967 9.25331 11.4758C9.21089 11.782 9.00724 11.9846 8.84602 12.1011C8.48963 12.3555 7.97626 12.4546 7.53078 12.3598C6.85619 12.2132 6.26222 11.7863 5.63854 11.3378C5.49429 11.23 5.35004 11.1265 5.20154 11.023C4.70515 10.678 4.10268 10.3201 3.40688 10.2598C2.57956 10.1908 1.80739 10.6134 1.52737 11.2904C1.27705 11.8854 1.42979 12.6487 1.90921 13.2265C2.30378 13.7052 2.83412 14.0027 3.30506 14.2614Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	An = a("path", {
		render: !0,
		d: "M9.93215 4.71431C10.1019 4.71431 10.2716 4.68413 10.437 4.62376C10.9165 4.45127 11.2856 4.02437 11.451 3.45516C11.6038 2.92477 11.5741 2.31244 11.3704 1.7303C11.1668 1.14384 10.8061 0.652257 10.3607 0.341782C9.87699 0.0054328 9.32544 -0.0894348 8.84177 0.0873639C8.36235 0.25985 7.99324 0.686754 7.82777 1.25596C7.67503 1.78636 7.70473 2.39868 7.90838 2.98083C8.2775 4.03731 9.10482 4.71431 9.93215 4.71431Z",
		fill: "#F2EFDC"
	}, null, -1),
	Hn = a("path", {
		render: !0,
		d: "M9.93215 4.71431C10.1019 4.71431 10.2716 4.68413 10.437 4.62376C10.9165 4.45127 11.2856 4.02437 11.451 3.45516C11.6038 2.92477 11.5741 2.31244 11.3704 1.7303C11.1668 1.14384 10.8061 0.652257 10.3607 0.341782C9.87699 0.0054328 9.32544 -0.0894348 8.84177 0.0873639C8.36235 0.25985 7.99324 0.686754 7.82777 1.25596C7.67503 1.78636 7.70473 2.39868 7.90838 2.98083C8.2775 4.03731 9.10482 4.71431 9.93215 4.71431Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	Ln = a("path", {
		render: !0,
		d: "M9.93215 4.71431C10.1019 4.71431 10.2716 4.68413 10.437 4.62376C10.9165 4.45127 11.2856 4.02437 11.451 3.45516C11.6038 2.92477 11.5741 2.31244 11.3704 1.7303C11.1668 1.14384 10.8061 0.652257 10.3607 0.341782C9.87699 0.0054328 9.32544 -0.0894348 8.84177 0.0873639C8.36235 0.25985 7.99324 0.686754 7.82777 1.25596C7.67503 1.78636 7.70473 2.39868 7.90838 2.98083C8.2775 4.03731 9.10482 4.71431 9.93215 4.71431Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.25"
	}, null, -1),
	Bn = a("path", {
		render: !0,
		d: "M9.93215 4.71431C10.1019 4.71431 10.2716 4.68413 10.437 4.62376C10.9165 4.45127 11.2856 4.02437 11.451 3.45516C11.6038 2.92477 11.5741 2.31244 11.3704 1.7303C11.1668 1.14384 10.8061 0.652257 10.3607 0.341782C9.87699 0.0054328 9.32544 -0.0894348 8.84177 0.0873639C8.36235 0.25985 7.99324 0.686754 7.82777 1.25596C7.67503 1.78636 7.70473 2.39868 7.90838 2.98083C8.2775 4.03731 9.10482 4.71431 9.93215 4.71431Z",
		fill: "#F2EFDC",
		"fill-opacity": "0.7"
	}, null, -1),
	xn = [dn, ln, cn, hn, _n, un, mn, fn, gn, pn, Cn, vn, yn, wn, bn, Sn, En, Tn, Mn, kn, In, On, Pn, Dn, An, Hn, Ln, Bn];

function $n(e, s) {
	return n(), o("svg", rn, xn)
}
const Rn = g(on, [
		["render", $n]
	]),
	Nn = {
		class: "hud-radmir-speedometer-secondary__fuel"
	},
	Yn = a("path", {
		d: "M1.41822 74.55C23.7597 15.6868 89.5892 -13.9199 148.452 8.42162",
		stroke: "#F4F1E1",
		"stroke-opacity": "0.7",
		"stroke-width": "2",
		"stroke-dasharray": "1 8"
	}, null, -1),
	Fn = ["stroke-dashoffset"],
	Kn = a("div", {
		class: "hud-radmir-speedometer-secondary__data__before"
	}, null, -1),
	Zn = {
		class: "hud-radmir-speedometer-secondary__data-container"
	},
	Un = {
		class: "hud-radmir-speedometer-secondary__data-value"
	},
	Vn = {
		class: "hud-radmir-speedometer-secondary__data-text"
	},
	Gn = {
		class: "hud-radmir-speedometer-secondary__wash"
	},
	Wn = a("path", {
		d: "M95.2706 133.051C33.2653 122.126 -8.14356 63.0043 2.7814 0.998895",
		stroke: "#F4F1E1",
		"stroke-opacity": "0.7",
		"stroke-width": "2",
		"stroke-dasharray": "1 8"
	}, null, -1),
	zn = ["stroke-dashoffset"],
	qn = a("div", {
		class: "hud-radmir-speedometer-secondary__data__before"
	}, null, -1),
	Xn = {
		class: "hud-radmir-speedometer-secondary__data-container"
	},
	jn = {
		class: "hud-radmir-speedometer-secondary__data-value"
	},
	Jn = a("div", {
		class: "hud-radmir-speedometer-secondary__data-text"
	}, "загрязнение", -1);

function Qn(e, s, t, l, r, i) {
	const d = f("IconFuel"),
		c = f("IconWash");
	return n(), o("div", {
		class: w(["hud-radmir-speedometer-secondary", {
			"hud-radmir-speedometer-secondary_helloween": t.isHelloween
		}])
	}, [a("div", Nn, [(n(), o("svg", {
		class: w(["hud-radmir-speedometer-secondary__fill", {
			"hud-radmir-speedometer-secondary__fill_danger": i.isFuelDanger
		}]),
		style: {
			width: "13.80vh",
			height: "6.94vh"
		},
		viewBox: "0 0 149 75",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	}, [Yn, a("path", {
		class: "hud-radmir-speedometer-secondary__fill__fill",
		d: "M1.41822 74.55C23.7597 15.6868 89.5892 -13.9199 148.452 8.42162",
		stroke: "#F4F1E1",
		"stroke-width": "4",
		"stroke-dasharray": "300",
		"stroke-dashoffset": 300 - 180 * (t.speedometer.fuel / t.speedometer.maxFuel)
	}, null, 8, Fn)], 2)), a("div", {
		class: w(["hud-radmir-speedometer-secondary__data", {
			"hud-radmir-speedometer-secondary__data_danger": i.isFuelDanger
		}])
	}, [Kn, a("div", Zn, [a("div", Un, [h(d), k(p(t.speedometer.fuel > 0 ? t.speedometer.fuel : 0), 1)]), a("div", Vn, p(t.speedometer.isElectro ? "%" : "л"), 1)])], 2)]), a("div", Gn, [(n(), o("svg", {
		class: w(["hud-radmir-speedometer-secondary__fill", {
			"hud-radmir-speedometer-secondary__fill_danger": i.isWashDanger
		}]),
		style: {
			width: "8.89vh",
			height: "9.44vh"
		},
		viewBox: "0 0 96 102",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	}, [Wn, a("path", {
		class: "hud-radmir-speedometer-secondary__fill__fill",
		d: "M95.2706 133.051C33.2653 122.126 -8.14356 63.0043 2.7814 0.998895",
		stroke: "#F4F1E1",
		"stroke-width": "4",
		"stroke-dasharray": "300",
		"stroke-dashoffset": 235 - 115 * t.speedometer.params.wash
	}, null, 8, zn)], 2)), a("div", {
		class: w(["hud-radmir-speedometer-secondary__data", {
			"hud-radmir-speedometer-secondary__data_danger": i.isWashDanger
		}])
	}, [qn, a("div", Xn, [a("div", jn, [h(c), k(p((t.speedometer.params.wash * 100).toFixed(0)), 1)]), Jn])], 2)])], 2)
}
const eo = {
		props: {
			speedometer: {
				type: Object,
				required: !0
			},
			isHelloween: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			IconFuel: nn,
			IconWash: Rn
		},
		computed: {
			isWashDanger() {
				return 1 - this.speedometer.params.wash < .25
			},
			isFuelDanger() {
				return this.speedometer.fuel / this.speedometer.maxFuel * 100 < 10
			}
		}
	},
	to = g(eo, [
		["render", Qn]
	]),
	so = {},
	io = {
		width: "38",
		height: "13",
		viewBox: "0 0 38 13",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	ao = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M30.875 13C34.8101 13 38 10.0898 38 6.5C38 2.91022 34.8101 0 30.875 0C28.0914 0 25.6799 1.45669 24.5077 3.58008L24.5417 3.61111L23.75 6.86111L23.2019 3.61111H2.375L0 5.41667L3.5424 8.3246L5.54167 6.5L7.91667 8.66667H8.70833L10.2917 7.22222L11.875 8.66667H13.4583L15.0417 7.22222L16.625 8.66667H17.4167L19.7917 6.5L22.1667 8.66667H24.1551C25.1339 11.1913 27.7733 13 30.875 13ZM34.0417 7.94444C34.9161 7.94444 35.625 7.29774 35.625 6.5C35.625 5.70225 34.9161 5.05556 34.0417 5.05556C33.1672 5.05556 32.4583 5.70225 32.4583 6.5C32.4583 7.29774 33.1672 7.94444 34.0417 7.94444Z",
		fill: "#F8F6ED"
	}, null, -1),
	no = [ao];

function oo(e, s) {
	return n(), o("svg", io, no)
}
const at = g(so, [
		["render", oo]
	]),
	ro = {},
	lo = {
		width: "40",
		height: "25",
		viewBox: "0 0 40 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	co = a("path", {
		d: "M14.5455 3.57143V0H29.0909V3.57143H23.6364V5.35714L20 7.14286V3.57143H14.5455Z",
		fill: "#F8F6ED"
	}, null, -1),
	ho = a("path", {
		d: "M20 7.14286H10.9091L9.09091 10.7143H5.45455V21.4286H9.09091L10.9091 25H32.7273L34.5455 21.4286V10.7143L32.7273 7.14286H20Z",
		fill: "#F8F6ED"
	}, null, -1),
	_o = a("path", {
		d: "M0 8.92857H3.63636V23.2143H0V8.92857Z",
		fill: "#F8F6ED"
	}, null, -1),
	uo = a("path", {
		d: "M40 8.92857H36.3636V23.2143H40V8.92857Z",
		fill: "#F8F6ED"
	}, null, -1),
	mo = [co, ho, _o, uo];

function fo(e, s) {
	return n(), o("svg", lo, mo)
}
const go = g(ro, [
		["render", fo]
	]),
	po = {},
	Co = {
		width: "19",
		height: "26",
		viewBox: "0 0 19 26",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	vo = a("path", {
		d: "M7 5.07031C7.50705 1.68141 9.84258 -0.463552 12.9465 0.0855578C16.0262 0.630379 17.9604 2.21279 17.5 5.57028L15.7561 11.9648L12.981 11.7769L14.4889 6.14426L14.5 6.07028C14.7379 4.48018 14.2306 3.37592 12.5 3.06976C10.7694 2.7636 9.98231 3.96572 9.7444 5.55582L8.83418 9.31615L16.6829 11.9648L19 13.9804L4.63415 8.94136L1.39024 21.539L0 20.0273L3.2439 7.42965L6.15253 8.41119L7 5.07031Z",
		fill: "#F8F6ED"
	}, null, -1),
	yo = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M1.39024 21.539L5.56098 9.94918L19 13.9804L15.7561 25.5703L1.39024 21.539ZM12.0488 17.5078C12.0488 18.621 11.2189 19.5234 10.1951 19.5234C9.17137 19.5234 8.34146 18.621 8.34146 17.5078C8.34146 16.3946 9.17137 15.4922 10.1951 15.4922C11.2189 15.4922 12.0488 16.3946 12.0488 17.5078Z",
		fill: "#F8F6ED"
	}, null, -1),
	wo = [vo, yo];

function bo(e, s) {
	return n(), o("svg", Co, wo)
}
const So = g(po, [
		["render", bo]
	]),
	Eo = {},
	To = {
		width: "28",
		height: "17",
		viewBox: "0 0 28 17",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	Mo = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M11.3409 0.0806263C9.82644 2.71501 7.70617 9.74003 11.3409 16.765C12.1561 16.8725 13.091 16.9521 14.0929 16.9843C12.4851 14.0246 10.6648 9.17071 11.9996 5.5C12.2988 8.63993 13.6711 14.8382 16.8385 16.9467C22.1648 16.6214 28.0007 14.718 28.0007 8.8619C28.0007 0.783128 16.8942 -0.358437 11.3409 0.0806263Z",
		fill: "#F8F6ED"
	}, null, -1),
	ko = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M0 16.5796L8.15634 14.3903C7.99544 13.8279 7.86097 13.2695 7.75054 12.7165L0 14.7969V16.5796ZM0 13.1796L7.49998 11.1665C7.42664 10.5761 7.37921 9.99418 7.35454 9.42278L0 11.3969V13.1796ZM0 9.77965L7.3437 7.80844C7.36205 7.18561 7.40582 6.57898 7.47047 5.99167L0 7.9969V9.77965ZM0 6.37965L7.71931 4.30762C7.84365 3.63864 7.99254 3.00327 8.1576 2.40723L0 4.5969V6.37965Z",
		fill: "#F8F6ED",
		"fill-opacity": "0.85"
	}, null, -1),
	Io = [Mo, ko];

function Oo(e, s) {
	return n(), o("svg", To, Io)
}
const Po = g(Eo, [
		["render", Oo]
	]),
	Do = {},
	Ao = {
		width: "35",
		height: "26",
		viewBox: "0 0 35 26",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	Ho = a("path", {
		render: !0,
		d: "M11.7434 10.2143H13.8158L12.4342 11.6071L10.1316 12.0714L6.90789 14.3929L8.51974 11.6071L11.2829 11.1429L11.7434 10.2143Z",
		fill: "white"
	}, null, -1),
	Lo = a("path", {
		render: !0,
		d: "M30.9402 0L35 7.34393L27.9681 11.5839L23.9083 4.24002L30.9402 0Z",
		fill: "white"
	}, null, -1),
	Bo = a("path", {
		render: !0,
		d: "M5.62548 15.2641L11.0917 21.76L4.05984 26L0 18.6561L5.62548 15.2641Z",
		fill: "white"
	}, null, -1),
	xo = a("path", {
		render: !0,
		d: "M14.0637 10.176L18.1235 17.52L15.9596 17.8456L14.6076 19.64L11.0917 21.76L7.03185 14.4161L10.5478 12.296L12.7117 11.9704L14.0637 10.176Z",
		fill: "white"
	}, null, -1),
	$o = a("path", {
		render: !0,
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M28.3741 12.3183L22.6903 2.03684L15.6585 6.27686L22.1542 18.0271L29.1861 13.7871L28.3741 12.3183ZM28.3741 12.3183L22.7486 15.7103L17.8768 6.89764L22.0959 4.35363L28.3741 12.3183Z",
		fill: "white"
	}, null, -1),
	Ro = a("path", {
		render: !0,
		d: "M24.4079 2.32143L23.0263 1.85714L24.4079 3.71429L30.8553 0L24.4079 2.32143Z",
		fill: "white"
	}, null, -1),
	No = [Ho, Lo, Bo, xo, $o, Ro];

function Yo(e, s) {
	return n(), o("svg", Ao, No)
}
const Fo = g(Do, [
		["render", Yo]
	]),
	Ko = {
		class: "hud-radmir-speedometer-indicators"
	};

function Zo(e, s, t, l, r, i) {
	return n(), o("div", Ko, [(n(!0), o(b, null, M(e.indicators, (d, c) => (n(), o("div", {
		class: w(["hud-radmir-speedometer-indicators__item", {
			"hud-radmir-speedometer-indicators__item_disabled": !t.speedometer.params[d]
		}]),
		key: c
	}, [(n(), y(le(`Icon${c}`)))], 2))), 128))])
}
const Uo = {
		props: {
			speedometer: {
				type: Object,
				required: !0
			}
		},
		data: () => ({
			indicators: {
				Lock: "doors",
				Lights: "lights",
				Rem: "rem",
				Key: "key"
			}
		}),
		components: {
			IconLock: So,
			IconLights: Po,
			IconRem: Fo,
			IconKey: at
		}
	},
	Vo = g(Uo, [
		["render", Zo]
	]),
	Go = {
		class: "hud-radmir-speedometer-mileage"
	},
	Wo = {
		class: "hud-radmir-speedometer-mileage__container"
	};

function zo(e, s, t, l, r, i) {
	return n(), o("div", Go, [a("div", Wo, [(n(!0), o(b, null, M(e.DIGITS_COUNT, (d, c) => (n(), o("div", {
		class: "hud-radmir-speedometer-mileage__item",
		key: c
	}, [(n(!0), o(b, null, M(i.digits, u => (n(), o("div", {
		class: "hud-radmir-speedometer-mileage__item-value",
		style: m({
			marginTop: u === e.MAX_DIGIT ? `${(e.MAX_DIGIT-Number(i.mileage[c]))*-2.04}vh` : 0
		}),
		key: u
	}, p(u), 5))), 128))]))), 128))])])
}
const ve = 7,
	ye = 9,
	qo = {
		props: {
			value: {
				type: Number,
				default: 0
			}
		},
		data: () => ({
			DIGITS_COUNT: ve,
			MAX_DIGIT: ye
		}),
		computed: {
			digits() {
				let e = [];
				for (let s = ye; s >= 0; --s) e.push(s);
				return e
			},
			mileage() {
				let e = this.value.toString(),
					s = "";
				for (let t = 0; t < ve - e.length; ++t) s += "0";
				return s + e
			}
		}
	},
	Xo = g(qo, [
		["render", zo],
		["__scopeId", "data-v-9101ac8b"]
	]),
	jo = {
		class: "hud-radmir-speedometer-hint"
	},
	Jo = {
		class: "hud-radmir-speedometer-hint__content"
	},
	Qo = {
		class: "hud-radmir-speedometer-hint__icon"
	},
	er = {
		class: "hud-radmir-speedometer-hint__text"
	};

function tr(e, s, t, l, r, i) {
	const d = f("ControlsButton"),
		c = f("ControlsButtonContainer");
	return n(), o("div", jo, [a("div", Jo, [a("div", Qo, [de(e.$slots, "default")]), a("div", er, [h(c, {
		text: t.text
	}, {
		default: C(() => [h(d, {
			text: t.keyText,
			keyCode: t.keyCode
		}, null, 8, ["text", "keyCode"])]),
		_: 1
	}, 8, ["text"])])])])
}
const sr = {
		props: {
			text: {
				type: String,
				required: !0
			},
			keyText: {
				type: String,
				required: !0
			},
			keyCode: {
				type: Number,
				required: !0
			}
		},
		components: {
			ControlsButtonContainer: ce,
			ControlsButton: W
		}
	},
	ir = g(sr, [
		["render", tr]
	]),
	ar = {},
	nr = {
		width: "25",
		height: "25",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	or = a("path", {
		d: "M14.8618 0L0 12.5L14.8618 25V15.3869L25 15.3869L14.8618 9.61339L14.8618 0Z",
		fill: "#F4F1E1"
	}, null, -1),
	rr = [or];

function dr(e, s) {
	return n(), o("svg", nr, rr)
}
const lr = g(ar, [
		["render", dr]
	]),
	cr = {},
	hr = {
		width: "25",
		height: "25",
		viewBox: "0 0 25 25",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	_r = a("path", {
		d: "M10.1382 0L25 12.5L10.1382 25V15.3869L0 15.3869L10.1382 9.61339L10.1382 0Z",
		fill: "#F4F1E1"
	}, null, -1),
	ur = [_r];

function mr(e, s) {
	return n(), o("svg", hr, ur)
}
const fr = g(cr, [
		["render", mr]
	]),
	gr = "" + new URL("speedometer-data-bg.svg", import.meta.url).href,
	nt = e => (A("data-v-b88ef658"), e = e(), H(), e),
	pr = {
		class: "hud-radmir-speedometer-main"
	},
	Cr = {
		class: "hud-radmir-speedometer-main__speed-fill",
		style: {
			width: "25.65vh",
			height: "27.04vh"
		},
		viewBox: "0 0 277 292",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	vr = nt(() => a("path", {
		d: "M163.888 327C73.9277 327 1 253.98 1 163.906C1 76.4798 69.7028 5.12014 156 1M276 45.5886C248.739 19.6833 212.532 3.12391 172.5 1.03611",
		stroke: "#F4F1E1",
		"stroke-opacity": "0.7",
		"stroke-width": "2",
		"stroke-linecap": "round",
		"stroke-dasharray": "0.1 8"
	}, null, -1)),
	yr = ["stroke-dashoffset"],
	wr = {
		key: 0,
		class: "hud-radmir-speedometer-main__data-bg",
		src: gr
	},
	br = {
		class: "hud-radmir-speedometer-main__data-value"
	},
	Sr = nt(() => a("div", {
		class: "hud-radmir-speedometer-main__data-text"
	}, "км/ч", -1));

function Er(e, s, t, l, r, i) {
	const d = f("SpeedometerMileage"),
		c = f("IconKey"),
		u = f("SpeedometerHint"),
		S = f("IconEngine"),
		T = f("SpeedometerIndicators");
	return n(), o("div", pr, [a("div", {
		class: w(["hud-radmir-speedometer-main__speed", {
			"hud-radmir-speedometer-main__speed_helloween": t.isHelloween
		}])
	}, [(n(), o("svg", Cr, [vr, a("path", {
		d: "M163.888 327C73.9277 327 1 253.98 1 163.906C1 76.4798 69.7028 5.12014 156 1L172.5 1.03611C212.532 3.12391 248.739 19.6833 276 45.5886",
		stroke: "#F4F1E1",
		"stroke-width": "4",
		"stroke-dasharray": "800",
		"stroke-dashoffset": 695 - 535 * (i.speedBar < 1 ? i.speedBar : 1)
	}, null, 8, yr)])), a("div", {
		class: w(["hud-radmir-speedometer-main__data", {
			"hud-radmir-speedometer-main__hidden": i.showKeyHint || i.showEngineHint
		}])
	}, [t.isHelloween ? (n(), o("img", wr)) : _("", !0), a("div", br, p(t.speedometer.speed), 1), Sr], 2), h(d, {
		class: w(["hud-radmir-speedometer-main__mileage", {
			"hud-radmir-speedometer-main__hidden": i.showKeyHint || i.showEngineHint
		}]),
		value: t.speedometer.mileage
	}, null, 8, ["value", "class"]), a("div", {
		class: w(["hud-radmir-speedometer-main__turns", {
			"hud-radmir-speedometer-main__hidden": i.showKeyHint || i.showEngineHint
		}])
	}, [(n(), o(b, null, M(["Left", "Right"], (v, O) => h(le(`IconTurn${v}`), {
		class: w(["hud-radmir-speedometer-main__turn", {
			"hud-radmir-speedometer-main__turn_active": t.speedometer.params.turns[v.toLowerCase()]
		}]),
		key: O
	}, null, 8, ["class"])), 64))], 2), h(E, {
		name: "fade"
	}, {
		default: C(() => [i.showKeyHint ? (n(), y(u, {
			key: 0,
			text: "Вставить ключ",
			keyText: "G",
			keyCode: e.KEY_CODE_G
		}, {
			default: C(() => [h(c, {
				style: {
					width: "5.56vh",
					height: "1.94vh"
				}
			})]),
			_: 1
		}, 8, ["keyCode"])) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "fade"
	}, {
		default: C(() => [i.showEngineHint ? (n(), y(u, {
			key: 0,
			text: "Запустить двигатель",
			keyText: "Ctrl",
			keyCode: e.KEY_CODE_CTRL
		}, {
			default: C(() => [h(S, {
				style: {
					width: "5.56vh",
					height: "2.78vh"
				}
			})]),
			_: 1
		}, 8, ["keyCode"])) : _("", !0)]),
		_: 1
	})], 2), h(T, {
		speedometer: t.speedometer
	}, null, 8, ["speedometer"])])
}
const Tr = {
		props: {
			speedometer: {
				type: Object,
				required: !0
			},
			isHelloween: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			SpeedometerHint: ir,
			SpeedometerIndicators: Vo,
			SpeedometerMileage: Xo,
			IconTurnLeft: lr,
			IconTurnRight: fr,
			IconKey: at,
			IconEngine: go
		},
		data: () => ({
			KEY_CODE_G: window.KEY_CODE_G,
			KEY_CODE_CTRL: window.KEY_CODE_CTRL
		}),
		computed: {
			speedBar() {
				return this.speedometer.speed / this.speedometer.maxSpeed
			},
			showKeyHint() {
				return !this.speedometer.params.key
			},
			showEngineHint() {
				return this.speedometer.params.key && !this.speedometer.params.temperature
			}
		}
	},
	Mr = g(Tr, [
		["render", Er],
		["__scopeId", "data-v-b88ef658"]
	]),
	kr = a("div", {
		class: "hud-radmir-speedometer-tachometer__before"
	}, null, -1),
	Ir = {
		class: "hud-radmir-speedometer-tachometer__fill",
		width: "106",
		height: "83",
		viewbox: "0 0 106 83",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	Or = a("path", {
		d: "M104.318 24.7554C93.9198 10.3537 77.1167 1 58.1575 1C26.5903 1 1 26.9309 1 58.9184C1 67.1224 2.68334 74.9281 5.71913 82",
		stroke: "#F4F1E1",
		"stroke-opacity": "0.7",
		"stroke-width": "2",
		"stroke-dasharray": "1 8"
	}, null, -1),
	Pr = ["stroke-dashoffset"],
	Dr = {
		class: "hud-radmir-speedometer-tachometer__data"
	},
	Ar = {
		class: "hud-radmir-speedometer-tachometer__data-text"
	},
	Hr = {
		class: "hud-radmir-speedometer-tachometer__data-value"
	};

function Lr(e, s, t, l, r, i) {
	return n(), o("div", {
		class: w(["hud-radmir-speedometer-tachometer", {
			"hud-radmir-speedometer-tachometer_glow": t.speedometer.tachometer.rpm / t.speedometer.tachometer.maxRpm > .5
		}])
	}, [kr, (n(), o("svg", Ir, [Or, a("path", {
		d: "M104.318 24.7554C93.9198 10.3537 77.1167 1 58.1575 1C26.5903 1 1 26.9309 1 58.9184C1 67.1224 2.68334 74.9281 5.71913 82",
		stroke: "#F4F1E1",
		"stroke-width": "4",
		"stroke-dasharray": "300",
		"stroke-dashoffset": 600 - 170 * (1 - t.speedometer.tachometer.rpm / t.speedometer.tachometer.maxRpm)
	}, null, 8, Pr)])), a("div", Dr, [a("div", Ar, p(t.speedometer.tachometer.gear), 1), a("div", Hr, p(t.speedometer.tachometer.rpm), 1)])], 2)
}
const Br = {
		props: {
			speedometer: {
				type: Object,
				required: !0
			}
		}
	},
	xr = g(Br, [
		["render", Lr]
	]),
	$r = e => (A("data-v-899fea6f"), e = e(), H(), e),
	Rr = $r(() => a("div", {
		class: "hud-radmir-speedometer__after"
	}, null, -1)),
	Nr = {
		key: 0,
		class: "hud-radmir-speedometer__new-year"
	};

function Yr(e, s, t, l, r, i) {
	const d = f("SpeedometerTachometer"),
		c = f("SpeedometerSecondary"),
		u = f("SpeedometerMain");
	return n(), o("div", {
		class: w(["hud-radmir-speedometer", {
			"hud-radmir-speedometer_helloween": t.isHelloween
		}])
	}, [Rr, t.isNewYear ? (n(), o("div", Nr)) : _("", !0), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.speedometer.tachometer.show ? (n(), y(d, {
			key: 0,
			speedometer: t.speedometer
		}, null, 8, ["speedometer"])) : _("", !0)]),
		_: 1
	}), h(c, {
		speedometer: t.speedometer,
		isHelloween: t.isHelloween
	}, null, 8, ["speedometer", "isHelloween"]), h(u, {
		speedometer: t.speedometer,
		isHelloween: t.isHelloween
	}, null, 8, ["speedometer", "isHelloween"])], 2)
}
const Fr = {
		props: {
			speedometer: {
				type: Object,
				required: !0
			},
			isHelloween: {
				type: Boolean,
				default: !1
			},
			isNewYear: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			SpeedometerSecondary: to,
			SpeedometerMain: Mr,
			SpeedometerTachometer: xr
		},
		data: () => ({
			KEY_CODE_G: window.KEY_CODE_G
		}),
		mounted() {
			document.addEventListener("keyup", this.onKeyUp)
		},
		unmounted() {
			document.removeEventListener("keyup", this.onKeyUp)
		},
		methods: {
			onKeyUp({
				keyCode: e
			}) {
				e === this.KEY_CODE_G && window.isBluredInput && sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "Speed_OnPlayerToggleKey")
			}
		}
	},
	Kr = g(Fr, [
		["render", Yr],
		["__scopeId", "data-v-899fea6f"]
	]),
	Zr = [{
		title: "Управление автомобилем",
		buttons: [{
			buttons: ["Alt+1"],
			label: "Открыть/закрыть автомобиль"
		}, {
			buttons: ["Shift"],
			label: "Ремень безопасности"
		}, {
			buttons: ["L.Ctrl"],
			label: "Запустить двигатель"
		}, {
			buttons: ["R.Ctrl"],
			label: "Закрыть машину"
		}, {
			buttons: ["Q", "E"],
			label: "Поворотники"
		}, {
			buttons: ["L.Alt"],
			label: "Фары"
		}, {
			buttons: ["G"],
			label: "Вставить ключ"
		}, {
			buttons: ["B"],
			label: "Включить/выключить сирену"
		}]
	}, {
		title: "Общее управление",
		buttons: [{
			buttons: ["ALT"],
			label: "Взаимодействие"
		}, {
			buttons: ["Z"],
			label: "Анимации"
		}, {
			buttons: ["TAB"],
			label: "Список игроков"
		}, {
			buttons: ["X"],
			label: "Микрофон"
		}, {
			buttons: ["F3"],
			label: "Персональные настройки голосового чата"
		}, {
			buttons: ["G"],
			label: "Сесть на пассажирское"
		}, {
			buttons: ["F"],
			label: "Сесть за руль"
		}, {
			buttons: ["O"],
			label: "Меню крафта"
		}, {
			buttons: ["F2"],
			label: "Подать жалобу"
		}, {
			buttons: ["M"],
			label: "Меню"
		}, {
			buttons: ["M"],
			label: "Быстрая карта (Зажать)"
		}, {
			buttons: ["F1"],
			label: "Быстрая помощь по управлению"
		}, {
			buttons: ["R"],
			label: "Радиальное меню"
		}, {
			buttons: ["J"],
			label: "Меню заданий"
		}, {
			buttons: ["I"],
			label: "Инвентарь"
		}, {
			buttons: ["P"],
			label: "Телефон"
		}, {
			buttons: ["Esc"],
			label: "Настройки (АФК/ЗАКРЫТЬ ЛЮБОЙ ИНТЕРФЕЙС/НАЗАД)"
		}]
	}, {
		title: "Управление вертолетом",
		buttons: [{
			buttons: ["Alt+1"],
			label: "Открыть/закрыть вертолет"
		}, {
			buttons: ["Shift"],
			label: "Ремень безопасности"
		}, {
			buttons: ["L.Ctrl"],
			label: "Запустить двигатель"
		}, {
			buttons: ["R.Ctrl"],
			label: "Закрыть вертолет"
		}, {
			buttons: ["Q", "E"],
			label: "Поворотники"
		}, {
			buttons: ["L.Alt"],
			label: "Фары"
		}, {
			buttons: ["G"],
			label: "Вставить ключ"
		}]
	}, {
		title: "Управление лодкой",
		buttons: [{
			buttons: ["Alt+1"],
			label: "Открыть/закрыть лодку"
		}, {
			buttons: ["Shift"],
			label: "Ремень безопасности"
		}, {
			buttons: ["L.Ctrl"],
			label: "Запустить двигатель"
		}, {
			buttons: ["R.Ctrl"],
			label: "Закрыть лодку"
		}, {
			buttons: ["Q", "E"],
			label: "Поворотники"
		}, {
			buttons: ["L.Alt"],
			label: "Фары"
		}, {
			buttons: ["G"],
			label: "Вставить ключ"
		}]
	}],
	Ur = {
		class: "hud-radmir-help"
	},
	Vr = a("div", {
		class: "hud-radmir-help__title"
	}, "Помощь по управлению", -1),
	Gr = {
		class: "hud-radmir-help__content"
	},
	Wr = {
		class: "hud-radmir-help__col-title"
	},
	zr = {
		class: "hud-radmir-help__col-content"
	},
	qr = {
		class: "hud-radmir-help__row-buttons"
	},
	Xr = {
		class: "hud-radmir-help__row-label"
	};

function jr(e, s, t, l, r, i) {
	const d = f("ControlsButton");
	return n(), o("div", Ur, [Vr, a("div", Gr, [(n(!0), o(b, null, M(e.CONTROLS, (c, u) => (n(), o("div", {
		class: "hud-radmir-help__col",
		key: u
	}, [a("div", Wr, p(c.title), 1), a("div", zr, [(n(!0), o(b, null, M(c.buttons, (S, T) => (n(), o("div", {
		class: "hud-radmir-help__row",
		key: T
	}, [a("div", qr, [(n(!0), o(b, null, M(S.buttons, (v, O) => (n(), y(d, {
		key: O,
		text: v
	}, null, 8, ["text"]))), 128))]), a("div", Xr, p(S.label), 1)]))), 128))])]))), 128))])])
}
const Jr = {
		components: {
			ControlsButton: W,
			ControlsButtonContainer: ce
		},
		data: () => ({
			CONTROLS: Zr
		})
	},
	Qr = g(Jr, [
		["render", jr]
	]),
	ed = {},
	td = {
		width: "18",
		height: "23",
		viewBox: "0 0 18 23",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	sd = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M7.27199 6.33619L2.59961 4V16.8L8.99961 20L15.3996 16.8V4L8.99961 7.2L8.99935 7.19987V19.8672L7.27199 6.33619Z",
		fill: "#65C466"
	}, null, -1),
	id = a("path", {
		d: "M1 1.19922L9 5.19922L17 1.19922V17.9992L9 21.9992L1 17.9992V1.19922Z",
		stroke: "#65C466",
		"stroke-opacity": "0.25"
	}, null, -1),
	ad = [sd, id];

function nd(e, s) {
	return n(), o("svg", td, ad)
}
const od = g(ed, [
		["render", nd]
	]),
	rd = {},
	dd = {
		width: "15",
		height: "16",
		viewBox: "0 0 15 16",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	ld = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M9.19798 0.0625C10.3989 0.373401 12.0284 1.11454 13.2456 2.46879C16.8837 6.51666 13.0916 13.7222 7.65305 13.9295C7.72842 14.5039 7.43144 15.7006 5.64057 15.8924H2.80469L3.33865 14.2402L6.16194 13.167L3.61012 13.3471L2.80469 10.7757H5.48056C6.04944 10.789 7.28037 11.1515 7.65305 12.4946C8.40795 12.6412 10.0377 12.4306 10.5174 10.4159C10.9971 8.4012 9.38475 7.07138 8.51863 6.65831L9.19798 0.0625Z",
		fill: "#0D73FD"
	}, null, -1),
	cd = a("path", {
		"fill-rule": "evenodd",
		"clip-rule": "evenodd",
		d: "M8.29086 0.00315412V6.59061C8.19771 6.58128 8.09678 6.57184 7.98873 6.56173C6.27206 6.40116 2.75571 6.07225 0 3.33053C1.63174 1.88616 4.73854 -0.0896734 8.29086 0.00315412ZM5.51367 3.75037C5.99908 3.75037 6.39258 3.35687 6.39258 2.87146C6.39258 2.38605 5.99908 1.99255 5.51367 1.99255C5.02827 1.99255 4.63477 2.38605 4.63477 2.87146C4.63477 3.35687 5.02827 3.75037 5.51367 3.75037Z",
		fill: "#0D73FD"
	}, null, -1),
	hd = [ld, cd];

function _d(e, s) {
	return n(), o("svg", dd, hd)
}
const ud = g(rd, [
		["render", _d]
	]),
	md = e => (A("data-v-208c69fb"), e = e(), H(), e),
	fd = {
		class: "map-mask"
	},
	gd = md(() => a("div", {
		class: "tile",
		"data-bind-for": "tile: {{radarData.visibleTiles}}",
		"data-bind-style-background-image": "{{tile.backgroundImage}}",
		"data-bind-style-transform": "{{tile.transform}}"
	}, null, -1)),
	pd = [gd],
	Cd = {
		class: "gang-zones__wrapper"
	},
	vd = ["d", "stroke-width"],
	yd = {
		class: "nearby-players-container",
		"data-bind-style-transform": "{{radarData.transform}}"
	},
	wd = {
		class: "nearby-player",
		"data-bind-for": "player: {{radarData.players}}"
	},
	bd = {
		class: "markers-container",
		"data-bind-style-transform": "{{radarData.transform}}"
	},
	Sd = {
		class: "player-icon"
	},
	Ed = ["src"];

function Td(e, s, t, l, r, i) {
	return n(), o("div", {
		class: "hud-hassle-map",
		style: m(i.mapStyle),
		"data-bind-style-transform": "{{radarData.rotate}}"
	}, [de(e.$slots, "default", {}, void 0, !0), a("div", fd, [a("div", {
		class: "tiles-container",
		style: m(i.tilesContainerStyle),
		"data-bind-style-transform": "{{radarData.transform}}"
	}, pd, 4), a("div", {
		class: "gang-zones",
		style: m(i.gangZonesContainerStyle),
		"data-bind-style-transform": "{{radarData.transform}}"
	}, [a("div", Cd, [(n(!0), o(b, null, M(Object.entries(i.gangZones), ([d, c]) => (n(), o("div", {
		class: "gang-zones__item",
		key: d,
		style: m(e.gangZonesStyles[d])
	}, null, 4))), 128))])], 4), (n(), o("svg", {
		class: "route",
		style: m(i.routeStyle),
		"data-bind-style-transform": "{{radarData.transform}}"
	}, [a("path", {
		d: i.routePath,
		stroke: "#FAB700",
		"stroke-width": i.routeWidth,
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		fill: "none"
	}, null, 8, vd)], 4))]), a("div", yd, [a("div", wd, [a("div", {
		class: "nearby-player-icon",
		style: m(i.nearbyPlayerStyle),
		"data-bind-style-transform": "{{player.transform}}",
		"data-bind-style-background-color": "{{player.color}}"
	}, null, 4)])]), a("div", bd, [a("div", {
		class: "marker",
		"data-bind-for": "marker: {{radarData.markers}}",
		style: m(i.markerStyle),
		"data-bind-style-transform": "{{marker.transform}}"
	}, [a("div", {
		class: "marker-icon",
		style: m(i.markerImageStyle),
		"data-bind-if": "{{marker.show}} && !{{marker.isCheckpoint}}",
		"data-bind-style-background-image": "{{marker.icon}}"
	}, null, 4), a("div", {
		class: "marker-checkpoint",
		"data-bind-if": "{{marker.show}} && {{marker.isCheckpoint}}",
		style: m(i.markerCheckpointStyle)
	}, null, 4)], 4)]), a("div", Sd, [a("img", {
		style: m(i.playerIconStyle),
		"data-bind-style-transform": "{{radarData.playerTransform}}",
		src: "/images/gps/player_arrow.png"
	}, null, 12, Ed)])], 4)
}
const Md = 1e3,
	kd = 12e3,
	oe = 6144,
	R = oe / kd,
	Id = .15,
	Od = .25,
	Q = .08,
	Pd = .1,
	ee = .08,
	Dd = .1,
	we = .25,
	be = 21,
	Se = 24,
	Ad = 5,
	Hd = 10,
	Ld = "checkpoint",
	Bd = {
		props: {
			isMobile: {
				type: Boolean,
				default: !1
			}
		},
		data: () => ({
			zoom: 1,
			scaledZoom: 1,
			rotationDegrees: 0,
			targetRotationDegrees: 0,
			visibleTiles: [],
			markers: {},
			nearbyPlayers: [],
			translate: {
				x: 0,
				y: 0
			},
			checkpointMarker: null,
			gangZonesStyles: {},
			flashedTimers: []
		}),
		computed: {
			routeWidth() {
				return this.isMobile ? Hd : Ad
			},
			mapWidth() {
				return this.isMobile ? Se : be
			},
			mapHeight() {
				return this.isMobile ? Se : be
			},
			playerPosition() {
				return this.$store.getters["player/position"]
			},
			playerIsInInterior() {
				return this.playerPosition.interior
			},
			mapStyle() {
				return {
					width: `${this.mapWidth}vh`,
					height: `${this.mapHeight}vh`
				}
			},
			tilesContainerStyle() {
				return {
					...this.playerIsInInterior && {
						display: "none"
					}
				}
			},
			gangZonesContainerStyle() {
				return {
					...this.playerIsInInterior && {
						display: "none"
					}
				}
			},
			markerToMapSizeRelation() {
				return this.isMobile ? Od : Id
			},
			markerImageStyle() {
				return {
					width: `${this.mapWidth*this.markerToMapSizeRelation}vh`,
					height: `${this.mapHeight*this.markerToMapSizeRelation}vh`
				}
			},
			markerCheckpointStyle() {
				return {
					width: `${this.mapWidth*Q}vh`,
					height: `${this.mapHeight*Q}vh`,
					borderWidth: `${this.mapHeight*Q*Pd}vh`
				}
			},
			nearbyPlayerStyle() {
				return {
					width: `${this.mapWidth*ee}vh`,
					height: `${this.mapHeight*ee}vh`,
					borderWidth: `${this.mapHeight*ee*Dd}vh`
				}
			},
			playerIconStyle() {
				return {
					width: `${this.mapWidth*we}vh`,
					height: `${this.mapHeight*we}vh`
				}
			},
			markerStyle() {
				return {
					width: `${this.mapWidth*this.markerToMapSizeRelation}vh`,
					height: `${this.mapHeight*this.markerToMapSizeRelation}vh`
				}
			},
			routeStyle() {
				return {
					...(this.playerIsInInterior || !this.route.length) && {
						display: "none"
					}
				}
			},
			routePath() {
				if (!this.route.length) return "";
				const e = {
						x: oe / 2,
						y: oe / 2
					},
					s = this.route[0];
				let t = `M${s[0]*R+e.x},${-s[1]*R+e.y}`;
				return this.route.slice(1).forEach(l => {
					t += ` L${l[0]*R+e.x},${-l[1]*R+e.y}`
				}), t
			},
			route() {
				return this.$store.getters["player/route"]
			},
			gangZones() {
				return this.$store.getters["player/gangZones"]
			},
			flashedGangZones() {
				return this.$store.getters["player/flashedGangZones"]
			}
		},
		mounted() {
			engine.on("CreateRadarObject", this.addMarker), engine.on("RemoveRadarObject", this.removeMarker)
		},
		unmounted() {
			this.clearGangZonesFlash()
		},
		methods: {
			fixGangZonesBounds(e) {
				return e.map(([s, t]) => [s * R, t * R])
			},
			updateGangZonesStyles() {
				const e = {};
				this.clearGangZonesFlash();
				for (const [s, t] of Object.entries(this.gangZones)) {
					const [l, ...r] = t, [i, d] = this.fixGangZonesBounds(r), c = d[0] - i[0], u = d[1] - i[1];
					e[s] = {
						background: l,
						transform: `translate(${i[0]+c/2}px, ${i[1]+u/2}px)`,
						width: `${Math.abs(c)}px`,
						height: `${Math.abs(u)}px`
					}, this.flashedGangZones[s] !== void 0 && this.setGangZoneFlash(s, l, this.flashedGangZones[s])
				}
				this.gangZonesStyles = e
			},
			setGangZoneFlash(e, s, t) {
				const l = setInterval(() => {
					const i = this.gangZonesStyles[e].background === t ? s : t;
					this.gangZonesStyles[e].background = i
				}, Md);
				this.flashedTimers.push(l)
			},
			clearGangZonesFlash() {
				for (const e of this.flashedTimers) clearInterval(e);
				this.flashedTimers = []
			},
			addMarker(e, s, t, l, r, i) {
				l === Ld && (this.checkpointMarker = e, this.$store.commit("player/setCheckpoint", {
					x: s,
					y: t
				}))
			},
			removeMarker(e) {
				e === this.checkpointMarker && (this.checkpointMarker = null, this.$store.commit("player/setCheckpoint", null))
			}
		},
		watch: {
			gangZones: {
				handler(e, s) {
					JSON.stringify(e) !== JSON.stringify(s) && this.updateGangZonesStyles()
				},
				deep: !0
			},
			flashedGangZones: {
				handler(e, s) {
					JSON.stringify(e) !== JSON.stringify(s) && this.updateGangZonesStyles()
				},
				deep: !0
			}
		}
	},
	ot = g(Bd, [
		["render", Td],
		["__scopeId", "data-v-208c69fb"]
	]),
	rt = e => (A("data-v-464e4ec2"), e = e(), H(), e),
	xd = {
		class: "hud-radmir-radar"
	},
	$d = {
		key: 0,
		class: "hud-radmir-radar__safe-zone"
	},
	Rd = rt(() => a("div", {
		class: "hud-radmir-radar__safe-zone__bg"
	}, null, -1)),
	Nd = {
		key: 0,
		class: "hud-radmir-radar__fishing-zone"
	},
	Yd = rt(() => a("div", {
		class: "hud-radmir-radar__fishing-zone__bg"
	}, null, -1)),
	Fd = {
		class: "hud-radmir-radar__radar"
	},
	Kd = {
		key: 0,
		class: "hud-radmir-radar__radar-bats",
		src: gt
	},
	Zd = {
		key: 1,
		class: "hud-radmir-radar__radar-border_new-year",
		src: qe
	},
	Ud = ["src"];

function Vd(e, s, t, l, r, i) {
	const d = f("IconSafeZone"),
		c = f("IconFishingZone"),
		u = f("HudMap");
	return n(), o("div", xd, [h(E, {
		name: "hud-greenzone"
	}, {
		default: C(() => [t.radar.greenZone && !t.radar.fishingZone ? (n(), o("div", $d, [Rd, h(d), k("Вы в безопасности")])) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "hud-greenzone"
	}, {
		default: C(() => [t.radar.fishingZone ? (n(), o("div", Nd, [Yd, h(c), k("Зона для рыбалки")])) : _("", !0)]),
		_: 1
	}), a("div", Fd, [a("div", {
		class: w(["hud-radmir-radar__map", {
			"hud-radmir-radar__map_hidden": !t.radar.show
		}])
	}, [h(u, null, {
		default: C(() => [t.isHelloween ? (n(), o("img", Kd)) : _("", !0), t.isNewYear ? (n(), o("img", Zd)) : _("", !0), a("img", {
			class: w(["hud-radmir-radar__radar-border", {
				"hud-radmir-radar__radar-border_helloween": t.isHelloween
			}]),
			src: e.borderIcons[`/src/assets/images/hud/radar/border${t.isHelloween?"-helloween":""}.png`]
		}, null, 10, Ud)]),
		_: 1
	})], 2)])])
}
const Gd = {
		props: {
			isHelloween: {
				type: Boolean,
				default: !1
			},
			isNewYear: {
				type: Boolean,
				default: !1
			},
			radar: {
				type: Object,
				required: !0
			}
		},
		components: {
			HudMap: ot,
			IconSafeZone: od,
			IconFishingZone: ud
		},
		data: () => ({
			borderIcons: Object.assign({
				"/src/assets/images/hud/radar/border-helloween.png": pt,
				"/src/assets/images/hud/radar/border-new-year.png": qe,
				"/src/assets/images/hud/radar/border.png": Ct,
				"/src/assets/images/hud/radar/safe-zone-bg.png": vt
			})
		})
	},
	Wd = g(Gd, [
		["render", Vd],
		["__scopeId", "data-v-464e4ec2"]
	]),
	zd = {
		class: "hud-radmir-wanted__content"
	},
	qd = {
		class: "hud-radmir-wanted__stars"
	},
	Xd = {
		class: "hud-radmir-wanted__title"
	};

function jd(e, s, t, l, r, i) {
	return n(), y(E, {
		name: "wanted-fade",
		appear: ""
	}, {
		default: C(() => [e.isShown ? (n(), o("div", {
			key: 0,
			class: w(["hud-radmir-wanted", {
				"hud-radmir-wanted_withdrawn": t.stars === 0
			}])
		}, [h(E, {
			name: "wanted-slide",
			appear: ""
		}, {
			default: C(() => [a("div", zd, [a("div", qd, [(n(!0), o(b, null, M(t.stars, d => (n(), o("img", {
				class: "hud-radmir-wanted__star",
				key: d,
				src: re
			}))), 128))]), a("div", Xd, p(t.stars > 0 ? "Вы объявлены в розыск" : "Розыск снят"), 1)])]),
			_: 1
		})], 2)) : _("", !0)]),
		_: 1
	})
}
const Jd = 5e3,
	Qd = {
		props: {
			stars: {
				type: Number,
				default: 0
			}
		},
		data: () => ({
			isShown: !1,
			timeout: null
		}),
		watch: {
			stars(e, s) {
				e > s && (this.timeout !== null && clearTimeout(this.timeout), this.isShown = !0, this.timeout = setTimeout(() => this.isShown = !1, Jd))
			}
		}
	},
	el = g(Qd, [
		["render", jd],
		["__scopeId", "data-v-b408833f"]
	]),
	tl = {
		key: 0,
		class: "hud-radmir-damage"
	};

function sl(e, s, t, l, r, i) {
	return n(), y(E, {
		name: "damage-fade",
		appear: ""
	}, {
		default: C(() => [e.isShown ? (n(), o("div", tl)) : _("", !0)]),
		_: 1
	})
}
const Ee = 3e3,
	il = {
		props: {
			health: {
				type: Number,
				default: 0
			},
			armour: {
				type: Number,
				default: 0
			},
			isEnabled: {
				type: Boolean,
				default: !1
			}
		},
		data: () => ({
			isShown: !1,
			timeout: null
		}),
		methods: {
			handleDamageHealth(e, s) {
				s - e > 5 && (this.timeout !== null && clearTimeout(this.timeout), this.isShown = !0, this.timeout = setTimeout(() => this.isShown = !1, Ee)), e > s && this.isShown && (this.isShown = !1)
			},
			handleDamageArmour(e, s) {
				s - e > 5 && (this.timeout !== null && clearTimeout(this.timeout), this.isShown = !0, this.timeout = setTimeout(() => this.isShown = !1, Ee))
			}
		},
		watch: {
			health(e, s) {
				this.isEnabled && this.handleDamageHealth(e, s)
			},
			armour(e, s) {
				this.isEnabled && this.handleDamageArmour(e, s)
			}
		}
	},
	al = g(il, [
		["render", sl]
	]),
	nl = {
		key: 0,
		class: "hud-radmir-drugs"
	};

function ol(e, s, t, l, r, i) {
	return n(), y(E, {
		name: "drugs-fade",
		appear: ""
	}, {
		default: C(() => [t.isShown ? (n(), o("div", nl)) : _("", !0)]),
		_: 1
	})
}
const rl = {
		props: {
			isShown: {
				type: Boolean,
				default: !1
			}
		}
	},
	dl = g(rl, [
		["render", ol],
		["__scopeId", "data-v-bcd3d886"]
	]),
	dt = {
		VOICE: 0,
		CALL: 1,
		MEGAPHONE: 2
	},
	P = {
		MIC: 0,
		PHONE: 1,
		MEGAPHONE: 2
	},
	ll = {
		props: ["type"],
		data() {
			return {
				ENTRY_TYPE: dt
			}
		}
	},
	cl = {
		key: 0,
		src: yt
	},
	hl = {
		key: 1,
		src: wt
	},
	_l = {
		key: 2,
		src: bt
	};

function ul(e, s, t, l, r, i) {
	return t.type === r.ENTRY_TYPE.VOICE ? (n(), o("img", cl)) : t.type === r.ENTRY_TYPE.CALL ? (n(), o("img", hl)) : t.type === r.ENTRY_TYPE.MEGAPHONE ? (n(), o("img", _l)) : _("", !0)
}
const ml = g(ll, [
		["render", ul]
	]),
	fl = {
		class: "voice-chat-entry"
	},
	gl = {
		class: "voice-chat-entry-info"
	},
	pl = {
		class: "voice-chat-entry__icon"
	},
	Cl = {
		class: "voice-chat-entry__name"
	},
	vl = {
		class: "voice-chat-entry__id"
	},
	yl = {
		key: 0,
		class: "voice-chat-entry-channel"
	};

function wl(e, s, t, l, r, i) {
	const d = f("SpeakerIcon");
	return n(), o("div", fl, [a("div", gl, [a("div", pl, [h(d, {
		type: t.entry.type
	}, null, 8, ["type"])]), a("div", Cl, p(t.entry.name), 1), a("div", vl, p(t.entry.id), 1)]), i.isChannel ? (n(), o("div", yl, p(t.entry.channel), 1)) : _("", !0)])
}
const bl = {
		props: ["entry"],
		components: {
			SpeakerIcon: ml
		},
		computed: {
			isChannel() {
				return typeof this.entry.channel < "u" && String(this.entry.channel).length
			}
		},
		data() {
			return {
				ENTRY_TYPE: dt
			}
		}
	},
	Sl = g(bl, [
		["render", wl],
		["__scopeId", "data-v-9611eb7d"]
	]),
	El = {
		props: {
			isActive: {
				type: Boolean,
				default: !1
			},
			isMuted: {
				type: Boolean,
				default: !1
			}
		}
	},
	Tl = {
		key: 0,
		src: St
	},
	Ml = {
		key: 1,
		src: Et
	},
	kl = {
		key: 2,
		src: Tt
	};

function Il(e, s, t, l, r, i) {
	return t.isMuted ? (n(), o("img", Tl)) : t.isActive ? (n(), o("img", Ml)) : (n(), o("img", kl))
}
const Ol = g(El, [
	["render", Il]
]);
const Pl = {
		props: {
			isActive: {
				type: Boolean,
				default: !1
			},
			isMuted: {
				type: Boolean,
				default: !1
			}
		}
	},
	Dl = {
		key: 0,
		src: Mt
	},
	Al = {
		key: 1,
		src: kt
	},
	Hl = {
		key: 2,
		src: It
	};

function Ll(e, s, t, l, r, i) {
	return t.isMuted ? (n(), o("img", Dl)) : t.isActive ? (n(), o("img", Al)) : (n(), o("img", Hl))
}
const Bl = g(Pl, [
		["render", Ll],
		["__scopeId", "data-v-353ecfc3"]
	]),
	xl = {
		props: {
			isActive: {
				type: Boolean,
				default: !1
			},
			isMuted: {
				type: Boolean,
				default: !1
			}
		}
	},
	$l = {
		key: 0,
		src: Ot
	},
	Rl = {
		key: 1,
		src: Pt
	},
	Nl = {
		key: 2,
		src: Dt
	};

function Yl(e, s, t, l, r, i) {
	return t.isMuted ? (n(), o("img", $l)) : t.isActive ? (n(), o("img", Rl)) : (n(), o("img", Nl))
}
const Fl = g(xl, [
		["render", Yl]
	]),
	Kl = {
		class: "voice-chat-button__icon"
	},
	Zl = {
		key: 0,
		class: "voice-chat-button__mouse-tip"
	},
	Ul = a("img", {
		class: "voice-chat-button__mouse-tip-mouse",
		src: At
	}, null, -1),
	Vl = a("img", {
		class: "voice-chat-button__mouse-tip-plus",
		src: Ht
	}, null, -1),
	Gl = [Ul, Vl],
	Wl = {
		key: 1,
		class: "voice-chat-button__tip"
	};

function zl(e, s, t, l, r, i) {
	return n(), o("div", {
		class: w(["voice-chat-button", {
			"voice-chat-button_active": t.isActive
		}])
	}, [a("div", Kl, [(n(), y(le(i.iconComponent), {
		isActive: t.isActive,
		isMuted: t.isMuted
	}, null, 8, ["isActive", "isMuted"]))]), i.isMegaphone ? (n(), o("div", Zl, Gl)) : _("", !0), t.isMuted ? _("", !0) : (n(), o("div", Wl, p(i.tipText), 1))], 2)
}
const ql = {
		props: ["type", "isActive", "isMuted"],
		components: {
			MicIcon: Ol,
			PhoneIcon: Bl,
			MegaphoneIcon: Fl
		},
		computed: {
			iconComponent() {
				return this.type === P.PHONE ? "PhoneIcon" : this.type === P.MEGAPHONE ? "MegaphoneIcon" : "MicIcon"
			},
			tipText() {
				return this.type === P.PHONE ? "U" : (this.type === P.MEGAPHONE, "X")
			},
			isMegaphone() {
				return this.type === P.MEGAPHONE
			}
		},
		data() {
			return {
				BUTTON_TYPE: P
			}
		}
	},
	Xl = g(ql, [
		["render", zl]
	]),
	jl = {
		class: "voice-chat__buttons"
	},
	Jl = {
		class: "voice-chat__entries"
	};

function Ql(e, s, t, l, r, i) {
	const d = f("Button"),
		c = f("Entry");
	return n(), o("div", {
		class: w(["voice-chat", i.classes]),
		style: m(i.styles)
	}, [h(E, {
		name: "slide",
		appear: ""
	}, {
		default: C(() => [a("div", jl, [h(E, {
			name: "slide",
			appear: ""
		}, {
			default: C(() => [i.chatButtonStatus ? (n(), y(d, {
				key: 0,
				type: r.BUTTON_TYPE.MIC,
				isActive: i.micButtonIsActive,
				isMuted: i.isVoiceMuted
			}, null, 8, ["type", "isActive", "isMuted"])) : _("", !0)]),
			_: 1
		}), h(E, {
			name: "slide",
			appear: ""
		}, {
			default: C(() => [i.radioButtonStatus ? (n(), y(d, {
				key: 0,
				type: r.BUTTON_TYPE.PHONE,
				isActive: i.phoneButtonIsActive,
				isMuted: i.isVoiceMuted
			}, null, 8, ["type", "isActive", "isMuted"])) : _("", !0)]),
			_: 1
		}), h(E, {
			name: "slide",
			appear: ""
		}, {
			default: C(() => [i.megaphoneButtonStatus ? (n(), y(d, {
				key: 0,
				type: r.BUTTON_TYPE.MEGAPHONE,
				isActive: i.megaphoneButtonIsActive,
				isMuted: i.isVoiceMuted
			}, null, 8, ["type", "isActive", "isMuted"])) : _("", !0)]),
			_: 1
		})])]),
		_: 1
	}), a("div", Jl, [h(je, {
		name: "slide",
		appear: ""
	}, {
		default: C(() => [(n(!0), o(b, null, M(t.entries, (u, S) => (n(), y(c, {
			entry: u,
			key: S
		}, null, 8, ["entry"]))), 128))]),
		_: 1
	})])], 6)
}
const e1 = {
		props: ["entries", "chatHeightPx", "isHudControls", "isTransparent", "isShowButtons"],
		components: {
			Entry: Sl,
			Button: Xl
		},
		data() {
			return {
				BUTTON_TYPE: P,
				KEY_CODE_X: window.KEY_CODE_X,
				KEY_CODE_U: window.KEY_CODE_U
			}
		},
		computed: {
			classes() {
				return {
					"voice-chat_controls": this.isHudControls,
					"voice-chat_transparent": this.isTransparent,
					"voice-chat_hidden-buttons": !this.isShowButtons
				}
			},
			styles() {
				return {
					top: `${this.chatHeightPx}px`
				}
			},
			isVoiceActive() {
				return this.$store.getters["voiceChat/isActive"]
			},
			voiceKeyCode() {
				return this.$store.getters["voiceChat/keyCode"]
			},
			micButtonIsActive() {
				return this.isVoiceActive && this.voiceKeyCode === this.KEY_CODE_X
			},
			phoneButtonIsActive() {
				return this.isVoiceActive && this.voiceKeyCode === this.KEY_CODE_U
			},
			megaphoneButtonIsActive() {
				return this.isVoiceActive && this.voiceKeyCode === window.MEGAPHONE_KEY_CODE
			},
			isVoiceMuted() {
				return this.$store.getters["voiceChat/isMuted"]
			},
			chatButtonStatus() {
				return this.$store.getters["voiceChat/chatButton"]
			},
			radioButtonStatus() {
				return this.$store.getters["voiceChat/radioButton"]
			},
			megaphoneButtonStatus() {
				return this.$store.getters["voiceChat/megaphoneButton"]
			}
		}
	},
	t1 = g(e1, [
		["render", Ql],
		["__scopeId", "data-v-ed8903dc"]
	]),
	lt = e => (A("data-v-935a3a23"), e = e(), H(), e),
	s1 = {
		class: "voice-chat-hint"
	},
	i1 = lt(() => a("div", {
		class: "voice-chat-hint__button"
	}, [a("div", {
		class: "voice-chat-hint__button-shadow"
	}), k("F3")], -1)),
	a1 = lt(() => a("div", {
		class: "voice-chat-hint__text"
	}, "Наст. Голосового чата", -1)),
	n1 = [i1, a1];

function o1(e, s) {
	return n(), o("div", s1, n1)
}
const r1 = {},
	d1 = g(r1, [
		["render", o1],
		["__scopeId", "data-v-935a3a23"]
	]),
	l1 = {
		class: "hud"
	};

function c1(e, s, t, l, r, i) {
	const d = f("HudWanted"),
		c = f("HudDamage"),
		u = f("HudDrugs"),
		S = f("HudHelp"),
		T = f("HudInfo"),
		v = f("HudSpeedometer"),
		O = f("HudRadar"),
		x = f("VoiceChat"),
		q = f("VoiceChatHint");
	return n(), o("div", l1, [h(d, {
		stars: t.data.info.wanted,
		ref: "wanted"
	}, null, 8, ["stars"]), h(c, {
		isEnabled: t.data.isEffectEnabled,
		health: t.data.info.health,
		armour: t.data.info.armour,
		ref: "damage"
	}, null, 8, ["isEnabled", "health", "armour"]), h(u, {
		isShown: t.data.isUseDrugs && t.data.isEffectEnabled,
		ref: "drugs"
	}, null, 8, ["isShown"]), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.data.isOpenedHelp ? (n(), y(S, {
			key: 0
		})) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.data.info.show ? (n(), y(T, {
			key: 0,
			info: t.data.info,
			server: t.data.server,
			bonus: t.data.bonus,
			isHelloween: t.data.isHelloween,
			isNewYear: t.data.isNewYear,
			isEaster: t.data.isEaster,
			style: m({
				transform: `scale(${t.scale})`
			})
		}, null, 8, ["info", "server", "bonus", "isHelloween", "isNewYear", "isEaster", "style"])) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "hud-speedometer"
	}, {
		default: C(() => [t.data.speedometer.show ? (n(), y(v, {
			key: 0,
			speedometer: t.data.speedometer,
			isHelloween: t.data.isHelloween,
			isNewYear: t.data.isNewYear,
			style: m({
				transform: `scale(${t.scale*.8523})`
			})
		}, null, 8, ["speedometer", "isHelloween", "isNewYear", "style"])) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "fade"
	}, {
		default: C(() => [h(O, {
			class: w({
				"hud-radar_hidden": !t.data.radar.show
			}),
			radar: t.data.radar,
			isHelloween: t.data.isHelloween,
			isNewYear: t.data.isNewYear
		}, null, 8, ["class", "radar", "isHelloween", "isNewYear"])]),
		_: 1
	}), t.data.useChat && t.data.voiceChat.show ? (n(), y(x, {
		key: 0,
		entries: t.data.voiceChat.entries,
		chatHeightPx: i.chatHeightPx,
		isHudControls: t.data.isHudControls,
		isShowButtons: t.data.voiceChat.showButtons,
		isTransparent: i.isOpenedChat()
	}, null, 8, ["entries", "chatHeightPx", "isHudControls", "isShowButtons", "isTransparent"])) : _("", !0), t.data.useChat && t.data.voiceChat.show && t.data.isHudControls ? (n(), y(q, {
		key: 1
	})) : _("", !0)])
}
const te = 5,
	h1 = {
		props: {
			data: {
				type: Object,
				required: !0
			},
			scale: {
				type: Number,
				default: 1
			}
		},
		components: {
			HudInfo: Ja,
			HudSpeedometer: Kr,
			HudHelp: Qr,
			HudRadar: Wd,
			HudWanted: el,
			HudDamage: al,
			HudDrugs: dl,
			VoiceChat: t1,
			VoiceChatHint: d1
		},
		computed: {
			chatPageSize() {
				return this.$root.chatPageSize
			},
			chatFontSize() {
				return this.$root.chatFontSize
			},
			chatHeightPx() {
				return this.$root.vhToPx(ne + ae * this.chatFontSize) * this.chatPageSize
			}
		},
		methods: {
			onTurnsToggle() {
				const {
					left: e,
					right: s
				} = this.data.speedometer.params.turns;
				window.stopSound(te), e && !s || s && !e ? window.playSound("speedometer/turn.mp3", !0, te) : e && s && window.playSound("speedometer/alarm.mp3", !0, te)
			},
			isOpenedChat() {
				return window.isOpenedChat()
			}
		},
		watch: {
			"data.speedometer.params.turns.left"() {
				this.onTurnsToggle()
			},
			"data.speedometer.params.turns.right"() {
				this.onTurnsToggle()
			}
		}
	},
	_1 = g(h1, [
		["render", c1],
		["__scopeId", "data-v-b2894feb"]
	]),
	D = e => (A("data-v-5ba50c2c"), e = e(), H(), e),
	u1 = {
		class: "hud-hassle-info-data__meta"
	},
	m1 = {
		key: 0,
		class: "hud-hassle-info-data__meta__before"
	},
	f1 = {
		class: "hud-hassle-info-data__meta__item"
	},
	g1 = D(() => a("img", {
		src: Lt
	}, null, -1)),
	p1 = D(() => a("div", {
		class: "hud-hassle-info-data__meta__item_gray"
	}, "в сети", -1)),
	C1 = {
		class: "hud-hassle-info-data__meta__item"
	},
	v1 = {
		class: "hud-hassle-info-data__meta__server"
	},
	y1 = {
		class: "hud-hassle-info-data__meta__server-value"
	},
	w1 = {
		class: "hud-hassle-info-data__bar"
	},
	b1 = {
		class: "hud-hassle-info-data__bar-content hud-hassle-info-data__bar_health"
	},
	S1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-content__before"
	}, null, -1)),
	E1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-icon"
	}, [a("img", {
		src: Ne,
		style: {
			width: "5.5556vh",
			height: "5vh",
			"margin-right": "3vh"
		}
	})], -1)),
	T1 = {
		key: 0,
		class: "hud-hassle-info-data__bar-value"
	},
	M1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-content__after"
	}, null, -1)),
	k1 = {
		key: 1,
		class: "hud-hassle-info-data__bar hud-hassle-info-data__bar_freeze"
	},
	I1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-content__before hud-hassle-info-data__bar-content__before_freeze"
	}, [a("div", {
		class: "hud-hassle-info-data__bar-content__before-bg"
	})], -1)),
	O1 = {
		class: "hud-hassle-info-data__bar hud-hassle-info-data__bar_two"
	},
	P1 = {
		key: 0,
		class: "hud-hassle-info-data__bar-content hud-hassle-info-data__bar_armour"
	},
	D1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-content__before"
	}, [a("div", {
		class: "hud-hassle-info-data__bar-content__before-bg"
	})], -1)),
	A1 = D(() => a("img", {
		src: Bt
	}, null, -1)),
	H1 = [A1],
	L1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-icon",
		style: {
			right: "-0.9259vh"
		}
	}, [a("img", {
		src: Re,
		style: {
			width: "3.5185vh",
			height: "5vh"
		}
	})], -1)),
	B1 = {
		key: 0,
		class: "hud-hassle-info-data__bar-value"
	},
	x1 = {
		class: "hud-hassle-info-data__bar-content hud-hassle-info-data__bar_hunger"
	},
	$1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-content__before"
	}, null, -1)),
	R1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-icon",
		style: {
			right: "-2.8519vh"
		}
	}, [a("img", {
		src: Ye,
		style: {
			width: "4.2593vh",
			height: "4.4vh"
		}
	})], -1)),
	N1 = {
		key: 0,
		class: "hud-hassle-info-data__bar-value"
	},
	Y1 = D(() => a("div", {
		class: "hud-hassle-info-data__bar-content__after"
	}, null, -1)),
	F1 = {
		class: "hud-hassle-info-data__money"
	},
	K1 = D(() => a("img", {
		src: Je
	}, null, -1));

function Z1(e, s, t, l, r, i) {
	return n(), o("div", {
		class: w(["hud-hassle-info-data", {
			"hud-hassle-info-data_helloween": t.isHelloween,
			"hud-hassle-info-data_with-values": i.isShowValues
		}])
	}, [a("div", u1, [i.isEditableMode ? _("", !0) : (n(), o("div", m1)), a("div", f1, [g1, k(p(t.info.online), 1), p1]), a("div", C1, "ID " + p(t.info.id), 1), a("div", v1, [a("div", y1, p(t.server), 1)])]), a("div", {
		class: w(["hud-hassle-info-data__bars", {
			"hud-hassle-info-data__bars_editable": i.isEditableMode
		}])
	}, [a("div", w1, [a("div", b1, [S1, a("div", {
		class: "hud-hassle-info-data__progress-bar",
		style: m({
			marginLeft: `${.5+20*(1-Math.min(t.info.health,100)/100)}vh`,
			width: `${20*(Math.min(t.info.health,100)/100)}vh`,
			height: "1.6vh",
			background: "#EAD57C"
		})
	}, null, 4), E1, i.isShowValues ? (n(), o("div", T1, p(Math.ceil(t.info.health)), 1)) : _("", !0), M1, t.info.isShowFreeze ? (n(), o("div", k1, [I1, a("div", {
		class: "hud-hassle-info-data__progress-bar hud-hassle-info-data__progress-bar_freeze",
		style: m({
			marginLeft: `${12.1296*(1-t.info.freeze/100)}vh`,
			width: `${12.1296*(t.info.freeze/100)}vh`,
			height: "0.5556vh",
			background: "#71CCDF"
		})
	}, null, 4)])) : _("", !0)])]), a("div", O1, [h(E, {
		name: "fade"
	}, {
		default: C(() => [t.info.armour ? (n(), o("div", P1, [D1, a("div", {
			class: "hud-hassle-info-data__progress-bar hud-hassle-info-data__progress-bar_armour",
			style: m({
				width: `${t.info.armour}%`
			})
		}, H1, 4), L1, i.isShowValues ? (n(), o("div", B1, p(Math.ceil(t.info.armour)), 1)) : _("", !0)])) : _("", !0)]),
		_: 1
	}), a("div", x1, [$1, a("div", {
		class: "hud-hassle-info-data__progress-bar",
		style: m({
			marginLeft: `${10.6481*(1-t.info.hunger/100)}vh`,
			width: `${10.6481*(t.info.hunger/100)}vh`,
			height: "1.6vh",
			background: "#F8F6ED"
		})
	}, null, 4), R1, i.isShowValues ? (n(), o("div", N1, p(Math.ceil(t.info.hunger)), 1)) : _("", !0), Y1])])], 2), a("div", F1, [K1, k(p(i.formatNumberWithSpaces(t.info.money)), 1)])], 2)
}
const U1 = {
		props: {
			info: {
				type: Object,
				required: !0
			},
			server: {
				type: Number,
				required: !0
			},
			isHelloween: {
				type: Boolean,
				default: !1
			},
			isNewYear: {
				type: Boolean,
				default: !1
			}
		},
		computed: {
			isShowValues() {
				return this.info.isShowValues
			},
			isEditableMode() {
				return this.$store.getters["settings/settings"].isControlsEditable
			}
		},
		methods: {
			formatNumberWithSpaces: Qe
		}
	},
	V1 = g(U1, [
		["render", Z1],
		["__scopeId", "data-v-5ba50c2c"]
	]);

function G1(e, s, t, l, r, i) {
	return n(), o("div", {
		class: w(["hud-hassle-info-wanted", {
			"hud-hassle-info-wanted_hidden": t.value === 0
		}])
	}, [(n(!0), o(b, null, M(e.MAX_STARS_COUNT, (d, c) => (n(), o("img", {
		class: w(["hud-hassle-info-wanted__star", {
			"hud-hassle-info-wanted__star_active": e.MAX_STARS_COUNT - d < t.value
		}]),
		key: c,
		src: re
	}, null, 2))), 128))], 2)
}
const W1 = 6,
	z1 = {
		props: {
			value: {
				type: Number,
				default: 0
			}
		},
		data: () => ({
			MAX_STARS_COUNT: W1
		})
	},
	q1 = g(z1, [
		["render", G1],
		["__scopeId", "data-v-da9d5a42"]
	]),
	X1 = {},
	j1 = {
		width: "252",
		height: "233",
		viewBox: "0 0 252 233",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	J1 = a("path", {
		d: "M127.231 61.647C46.7883 23.0149 25.1726 64.5008 3.28339 76.8302L0 108.884L3.28339 219.027L211.779 233L252 140.943C251.726 87.2417 246.747 -15.7225 229.016 2.03184C206.853 24.2248 179.781 86.8834 127.231 61.647Z",
		fill: "#F4F1E1"
	}, null, -1),
	Q1 = [J1];

function ec(e, s) {
	return n(), o("svg", j1, Q1)
}
const tc = g(X1, [
		["render", ec]
	]),
	sc = "" + new URL("patrons-line-helloween.svg", import.meta.url).href,
	ct = e => (A("data-v-d6958916"), e = e(), H(), e),
	ic = {
		key: 0,
		class: "hud-hassle-info__content"
	},
	ac = {
		class: "hud-hassle-info__fist"
	},
	nc = {
		key: 0,
		class: "hud-hassle-info__fist__before"
	},
	oc = ["src"],
	rc = {
		key: 0,
		class: "hud-hassle-info__breath"
	},
	dc = ct(() => a("img", {
		src: Ke
	}, null, -1)),
	lc = ["src"],
	cc = ["src"],
	hc = {
		key: 2,
		class: "hud-hassle-info__fist-lamps",
		src: xt
	},
	_c = {
		key: 2,
		class: "hud-hassle-info__patrons"
	},
	uc = {
		class: "hud-hassle-info__patrons-content"
	},
	mc = ct(() => a("img", {
		src: Ze
	}, null, -1)),
	fc = {
		class: "hud-hassle-info__patrons-value"
	},
	gc = {
		class: "hud-hassle-info__patrons-value__total"
	},
	pc = {
		key: 0,
		class: "divider",
		src: sc
	};

function Cc(e, s, t, l, r, i) {
	const d = f("InfoData"),
		c = f("IconBreathFill"),
		u = f("InfoWanted");
	return n(), o("div", {
		class: w(["hud-hassle-info", {
			"hud-hassle-info_helloween": t.isHelloween
		}])
	}, [t.bonus > 1 ? (n(), o("div", {
		key: 0,
		class: "hud-hassle-info__bonus",
		style: m({
			backgroundImage: `url('${e.bonuseImage[`/src/assets/images/hud/bonus/${t.bonus}.png`]}')`
		})
	}, null, 4)) : _("", !0), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.info.showBars ? (n(), o("div", ic, [h(d, {
			info: t.info,
			isHelloween: t.isHelloween,
			isNewYear: t.isNewYear,
			server: t.server
		}, null, 8, ["info", "isHelloween", "isNewYear", "server"])])) : _("", !0)]),
		_: 1
	}), a("div", ac, [i.isEditableMode ? _("", !0) : (n(), o("div", nc)), t.info.weapon && t.info.breath >= 99 ? (n(), o("img", {
		key: 1,
		class: "hud-hassle-info__logo",
		src: i.logoImage
	}, null, 8, oc)) : _("", !0), a("div", {
		class: "hud-hassle-info__fist-content",
		onClick: s[0] || (s[0] = (...S) => i.nextWeapon && i.nextWeapon(...S))
	}, [h(E, {
		name: "fade"
	}, {
		default: C(() => [t.info.breath < 99 ? (n(), o("div", rc, [dc, a("div", {
			class: "hud-hassle-info__breath-fill",
			style: m({
				top: `${100-t.info.breath}%`
			})
		}, [h(c)], 4)])) : _("", !0)]),
		_: 1
	}), !t.info.weapon || t.info.breath < 99 ? (n(), o("img", {
		key: 0,
		class: "hud-hassle-info__fist-logo",
		src: i.logoImage,
		style: m({
			opacity: t.info.breath < 99 ? .25 : 1
		})
	}, null, 12, lc)) : (n(), o("img", {
		key: 1,
		class: "hud-hassle-info__fist-weapon",
		src: `/images/hud/${t.info.weapon}.png`
	}, null, 8, cc)), t.isNewYear ? (n(), o("img", hc)) : _("", !0)]), t.info.weapon ? (n(), o("div", _c, [a("div", uc, [mc, a("div", fc, [a("div", gc, p(t.info.ammoInClip), 1), t.isHelloween ? (n(), o("img", pc)) : (n(), o(b, {
		key: 1
	}, [], 64)), k(p(t.info.totalAmmo), 1)])])])) : _("", !0), h(u, {
		class: "hud-hassle-info__wanted",
		value: t.info.wanted
	}, null, 8, ["value"])])], 2)
}
const vc = {
		props: {
			info: {
				type: Object,
				required: !0
			},
			server: {
				type: Number,
				default: 1
			},
			bonus: {
				type: Number,
				default: 1
			},
			isHelloween: {
				type: Boolean,
				default: !1
			},
			isNewYear: {
				type: Boolean,
				default: !1
			},
			isEaster: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			InfoData: V1,
			InfoWanted: q1,
			IconBreathFill: tc
		},
		data: () => ({
			bonuseImage: Object.assign({
				"/src/assets/images/hud/bonus/2.png": Ue,
				"/src/assets/images/hud/bonus/3.png": Ve
			}),
			hassleLogo: Object.assign({
				"/src/assets/images/hud/aim-snipe.png": $t,
				"/src/assets/images/hud/armour.png": Rt,
				"/src/assets/images/hud/bonus.png": Nt,
				"/src/assets/images/hud/breath.png": Yt,
				"/src/assets/images/hud/circle.png": Ft,
				"/src/assets/images/hud/drugs-effect.png": Kt,
				"/src/assets/images/hud/fist-bg-easter.png": Zt,
				"/src/assets/images/hud/fist-bg-new-year.png": Fe,
				"/src/assets/images/hud/fist-bg.png": Ut,
				"/src/assets/images/hud/hassle-logo-helloween.png": Vt,
				"/src/assets/images/hud/hassle-logo.png": Gt,
				"/src/assets/images/hud/health.png": Wt,
				"/src/assets/images/hud/hp-effect.png": zt,
				"/src/assets/images/hud/lamps.png": qt,
				"/src/assets/images/hud/ny-particles.png": Xt,
				"/src/assets/images/hud/radmir-logo-helloween.png": Ge,
				"/src/assets/images/hud/radmir-logo-new-year.png": We,
				"/src/assets/images/hud/radmir-logo.png": ze,
				"/src/assets/images/hud/ruble.png": jt,
				"/src/assets/images/hud/speedometer-bg-new-year.png": Jt,
				"/src/assets/images/hud/wanted-bg.png": Qt,
				"/src/assets/images/hud/wanted_active.png": es,
				"/src/assets/images/hud/wanted_back.png": ts,
				"/src/assets/images/hud/wanted_inactive.png": ss,
				"/src/assets/images/hud/weapon_back-helloween.png": is,
				"/src/assets/images/hud/weapon_back-ny.png": as,
				"/src/assets/images/hud/weapon_back.png": ns
			})
		}),
		computed: {
			logoImage() {
				return this.isHelloween ? this.hassleLogo["/src/assets/images/hud/hassle-logo-helloween.png"] : this.hassleLogo["/src/assets/images/hud/hassle-logo.png"]
			},
			isEditableMode() {
				return this.$store.getters["settings/settings"].isControlsEditable
			}
		},
		methods: {
			nextWeapon() {
				window.nextWeapon()
			}
		}
	},
	yc = g(vc, [
		["render", Cc],
		["__scopeId", "data-v-d6958916"]
	]),
	_e = e => (A("data-v-5f7c47d7"), e = e(), H(), e),
	wc = {
		class: "hud-hassle-meta"
	},
	bc = {
		class: "hud-hassle-meta__item"
	},
	Sc = _e(() => a("img", {
		src: os
	}, null, -1)),
	Ec = _e(() => a("div", {
		class: "hud-hassle-meta__item_gray"
	}, "мс", -1)),
	Tc = {
		class: "hud-hassle-meta__item"
	},
	Mc = _e(() => a("div", {
		class: "hud-hassle-meta__item_gray"
	}, "FPS", -1)),
	kc = {
		class: "hud-hassle-meta__item"
	},
	Ic = {
		class: "hud-hassle-meta__item_gray"
	};

function Oc(e, s, t, l, r, i) {
	return n(), o("div", wc, [a("div", bc, [Sc, k(p(t.ping), 1), Ec]), a("div", Tc, [Mc, k(p(t.fps), 1)]), a("div", kc, [k(p(i.formatedDate.day), 1), a("div", Ic, "/" + p(i.formatedDate.month), 1), k(p(i.formatedDate.time), 1)])])
}
const Pc = {
		props: {
			ping: {
				type: Number,
				default: 0
			},
			fps: {
				type: Number,
				default: 0
			}
		},
		data: () => ({
			date: new Date,
			dateInterval: null
		}),
		computed: {
			formatedDate() {
				const e = this.date.getDate().toString().padStart(2, "0"),
					s = this.date.getMonth().toString().padStart(2, "0"),
					t = this.date.toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit"
					});
				return {
					day: e,
					month: s,
					time: t
				}
			}
		},
		created() {
			this.startDateUpdate()
		},
		unmounted() {
			this.stopDateUpdate()
		},
		methods: {
			stopDateUpdate() {
				clearInterval(this.dateInterval)
			},
			startDateUpdate() {
				this.stopDateUpdate(), this.dateInterval = setInterval(() => this.updateDate(), 1e3 * 60)
			},
			updateDate() {
				this.date = new Date
			}
		}
	},
	Dc = g(Pc, [
		["render", Oc],
		["__scopeId", "data-v-5f7c47d7"]
	]);
class Ac {
	static calculateDistance(s, t, l, r) {
		return Math.hypot(l - s, r - t)
	}
}
const Hc = {
		class: "map-mask"
	},
	Lc = {
		class: "gang-zones__wrapper"
	},
	Bc = ["d", "stroke-width"],
	xc = ["src"],
	$c = {
		class: "player-icon"
	},
	Rc = ["src"];

function Nc(e, s, t, l, r, i) {
	return n(), o("div", {
		class: "hud-hassle-map",
		style: m(i.mapStyle)
	}, [a("div", Hc, [a("div", {
		class: "tiles-container",
		style: m(i.tilesContainerStyle)
	}, [(n(!0), o(b, null, M(e.visibleTiles, d => (n(), o("div", {
		class: "tile",
		key: d.id,
		style: m(i.tileStyle(d))
	}, null, 4))), 128))], 4), a("div", {
		class: "gang-zones",
		style: m(i.gangZonesContainerStyle)
	}, [a("div", Lc, [(n(!0), o(b, null, M(Object.entries(i.gangZones), ([d, c]) => (n(), o("div", {
		class: "gang-zones__item",
		key: d,
		style: m(e.gangZonesStyles[d])
	}, null, 4))), 128))])], 4), (n(), o("svg", {
		class: "route",
		style: m(i.routeStyle)
	}, [a("path", {
		d: i.routePath,
		stroke: "#FAB700",
		"stroke-width": i.routeWidth,
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		fill: "none"
	}, null, 8, Bc)], 4))]), a("div", {
		class: "nearby-players-container",
		style: m(i.nearbyPlayersContainerStyle)
	}, [(n(!0), o(b, null, M(e.nearbyPlayers, (d, c) => (n(), o("div", {
		class: "nearby-player",
		key: c
	}, [d.show ? (n(), o("div", {
		key: 0,
		class: "nearby-player-icon",
		style: m(i.getNearbyPlayerStyle(d))
	}, null, 4)) : _("", !0)]))), 128))], 4), a("div", {
		class: "markers-container",
		style: m(i.markersContainerStyle)
	}, [(n(!0), o(b, null, M(e.markers, d => (n(), o("div", {
		class: "marker",
		key: d.name,
		style: m(i.markerStyle(d))
	}, [d.show && !d.isCheckpoint ? (n(), o("img", {
		key: 0,
		style: m(i.markerImageStyle),
		src: d.icon
	}, null, 12, xc)) : _("", !0), d.show && d.isCheckpoint ? (n(), o("div", {
		key: 1,
		class: "marker-checkpoint",
		style: m(i.markerCheckpointStyle)
	}, null, 4)) : _("", !0)], 4))), 128))], 4), a("div", $c, [a("img", {
		style: m(i.playerIconStyle),
		src: "/images/gps/player_arrow.png"
	}, null, 12, Rc)])], 4)
}
const Yc = 1e3,
	Fc = 12e3,
	G = 6144,
	B = 256,
	Te = G / B,
	F = 512 / B,
	I = G / Fc,
	Kc = 255,
	Zc = .5,
	Uc = .15,
	Vc = .25,
	se = .08,
	Gc = .1,
	ie = .08,
	Wc = .1,
	Me = .25,
	ke = 21,
	Ie = 24,
	zc = .6,
	qc = 5,
	Xc = 10,
	jc = {
		props: {
			isMobile: {
				type: Boolean,
				default: !1
			}
		},
		data: () => ({
			zoom: 1,
			scaledZoom: 1,
			rotationDegrees: 0,
			targetRotationDegrees: 0,
			visibleTiles: [],
			markers: {},
			nearbyPlayers: [],
			translate: {
				x: 0,
				y: 0
			},
			gangZonesStyles: {},
			flashedTimers: []
		}),
		computed: {
			routeWidth() {
				return this.isMobile ? Xc : qc
			},
			mapWidth() {
				return this.isMobile ? Ie : ke
			},
			mapHeight() {
				return this.isMobile ? Ie : ke
			},
			playerPosition() {
				return this.$store.getters["player/position"]
			},
			playerIsInInterior() {
				return this.playerPosition.interior
			},
			mapStyle() {
				return {
					width: `${this.mapWidth}vh`,
					height: `${this.mapHeight}vh`,
					transform: `rotate(-${this.rotationDegrees}deg)`
				}
			},
			tilesContainerStyle() {
				return {
					transform: `scale(${this.scaledZoom}) translate(${this.translate.x}px, ${this.translate.y}px)`,
					...this.playerIsInInterior && {
						display: "none"
					}
				}
			},
			markersContainerStyle() {
				return {
					transform: `scale(${this.scaledZoom}) translate(${this.translate.x}px, ${this.translate.y}px)`
				}
			},
			gangZonesContainerStyle() {
				return {
					transform: `scale(${this.scaledZoom}) translate(${this.translate.x}px, ${this.translate.y}px)`,
					...this.playerIsInInterior && {
						display: "none"
					}
				}
			},
			markerToMapSizeRelation() {
				return this.isMobile ? Vc : Uc
			},
			markerImageStyle() {
				return {
					width: `${this.mapWidth*this.markerToMapSizeRelation}vh`,
					height: `${this.mapHeight*this.markerToMapSizeRelation}vh`
				}
			},
			markerCheckpointStyle() {
				return {
					width: `${this.mapWidth*se}vh`,
					height: `${this.mapHeight*se}vh`,
					borderWidth: `${this.mapHeight*se*Gc}vh`
				}
			},
			nearbyPlayersContainerStyle() {
				return {
					transform: `scale(${this.scaledZoom}) translate(${this.translate.x}px, ${this.translate.y}px)`
				}
			},
			playerIconStyle() {
				return {
					width: `${this.mapWidth*Me}vh`,
					height: `${this.mapHeight*Me}vh`,
					transform: `scale(${this.zoom}) rotate(${this.targetRotationDegrees}deg)`
				}
			},
			routeStyle() {
				return {
					transform: `scale(${this.scaledZoom}) translate(${this.translate.x}px, ${this.translate.y}px)`,
					...(this.playerIsInInterior || !this.route.length) && {
						display: "none"
					}
				}
			},
			routePath() {
				if (!this.route.length) return "";
				const e = {
						x: G / 2,
						y: G / 2
					},
					s = this.route[0];
				let t = `M${s[0]*I+e.x},${-s[1]*I+e.y}`;
				return this.route.slice(1).forEach(l => {
					t += ` L${l[0]*I+e.x},${-l[1]*I+e.y}`
				}), t
			},
			route() {
				return this.$store.getters["player/route"]
			},
			gangZones() {
				return this.$store.getters["player/gangZones"]
			},
			flashedGangZones() {
				return this.$store.getters["player/flashedGangZones"]
			}
		},
		mounted() {
			engine.on("UpdateRadar", this.update), engine.on("CreateRadarObject", this.addMarker), engine.on("RemoveRadarObject", this.removeMarker)
		},
		unmounted() {
			this.clearGangZonesFlash()
		},
		methods: {
			fixGangZonesBounds(e) {
				return e.map(([s, t]) => [s * I, t * I])
			},
			updateGangZonesStyles() {
				const e = {};
				this.clearGangZonesFlash();
				for (const [s, t] of Object.entries(this.gangZones)) {
					const [l, ...r] = t, [i, d] = this.fixGangZonesBounds(r), c = d[0] - i[0], u = d[1] - i[1];
					e[s] = {
						background: l,
						transform: `translate(${i[0]+c/2}px, ${i[1]+u/2}px)`,
						width: `${Math.abs(c)}px`,
						height: `${Math.abs(u)}px`
					}, this.flashedGangZones[s] !== void 0 && this.setGangZoneFlash(s, l, this.flashedGangZones[s])
				}
				this.gangZonesStyles = e
			},
			setGangZoneFlash(e, s, t) {
				const l = setInterval(() => {
					const i = this.gangZonesStyles[e].background === t ? s : t;
					this.gangZonesStyles[e].background = i
				}, Yc);
				this.flashedTimers.push(l)
			},
			clearGangZonesFlash() {
				for (const e of this.flashedTimers) clearInterval(e);
				this.flashedTimers = []
			},
			tileStyle(e) {
				return {
					backgroundImage: `url('images/hud/map/${Te/2+e.x}_${Te/2+e.y}.png')`,
					transform: `translate(${e.tilePosX}px, ${e.tilePosY}px)`
				}
			},
			markerStyle(e) {
				const s = e.displayPosX && e.displayPosY ? `translate(${e.displayPosX}px, ${-e.displayPosY}px)` : "";
				return {
					width: `${this.mapWidth*this.markerToMapSizeRelation}vh`,
					height: `${this.mapHeight*this.markerToMapSizeRelation}vh`,
					transform: `${s} rotate(${this.rotationDegrees}deg) scale(${1/this.scaledZoom}) `
				}
			},
			getNearbyPlayerStyle(e) {
				const s = e.displayPosX && e.displayPosY ? `translate(${e.displayPosX}px, ${-e.displayPosY}px)` : "";
				return {
					width: `${this.mapWidth*ie}vh`,
					height: `${this.mapHeight*ie}vh`,
					borderWidth: `${this.mapHeight*ie*Wc}vh`,
					transform: `${s} rotate(${this.rotationDegrees}deg) scale(${1/this.scaledZoom}) `,
					background: e.color,
					opacity: Math.max(Zc, e.opacity)
				}
			},
			update(e, s, t, l, r, i) {
				i = JSON.parse(i), this.translate = {
					x: -e * I,
					y: s * I
				}, this.updateVisibleTiles(e, s), this.updateMarkers(e, s), this.updateNearbyPlayers(i, e, s), this.zoom = r, this.scaledZoom = Math.min(r * window.scale, this.isMobile ? zc : r * window.scale), this.rotationDegrees = l, this.targetRotationDegrees = t
			},
			updateVisibleTiles(e, s) {
				const t = this.getTileIndex(e, s);
				let l = [];
				for (let r = t.x - F; r <= t.x + F; r++)
					for (let i = t.y - F; i <= t.y + F; i++) l.push({
						id: `tile-${r}-${i}`,
						x: r,
						y: i,
						tilePosX: r * B + B / 2,
						tilePosY: i * B + B / 2
					});
				this.visibleTiles = l
			},
			getTileIndex(e, s) {
				return {
					x: Math.floor(e * I / B),
					y: Math.floor(-s * I / B)
				}
			},
			addMarker(e, s, t, l, r, i) {
				const d = i == 1 || i == 3;
				this.markers[e] = {
					name: e,
					icon: `images/gps/${l}.png`,
					x: s * I,
					y: t * I,
					isGlobal: d,
					isCheckpoint: l == "checkpoint",
					show: !1
				}
			},
			removeMarker(e) {
				delete this.markers[e]
			},
			updateMarkers(e, s) {
				for (const t in this.markers) this.adjustMarkerPosition(this.markers[t], e, s)
			},
			updateNearbyPlayers(e, s, t) {
				this.nearbyPlayers = e.map(([l, r, i, d, c, u, S]) => ({
					...this.adjustMarkerPosition({
						x: l * I,
						y: r * I
					}, s, t),
					angle: i,
					color: `rgb(${d}, ${c}, ${u})`,
					opacity: S / Kc
				}))
			},
			adjustMarkerPosition(e, s, t) {
				s *= I, t *= I;
				let l = Ac.calculateDistance(e.x, e.y, s, t);
				const r = Math.atan2(e.y - t, e.x - s),
					d = this.mapWidth / 100 * window.innerHeight / (2 * this.scaledZoom);
				return l > d ? e.isGlobal ? (l = d, e.show = !0) : e.show = !1 : e.show = !0, e.displayPosX = s + l * Math.cos(r), e.displayPosY = t + l * Math.sin(r), e
			}
		},
		watch: {
			gangZones: {
				handler(e, s) {
					JSON.stringify(e) !== JSON.stringify(s) && this.updateGangZonesStyles()
				},
				deep: !0
			},
			flashedGangZones: {
				handler(e, s) {
					JSON.stringify(e) !== JSON.stringify(s) && this.updateGangZonesStyles()
				},
				deep: !0
			}
		}
	},
	Jc = g(jc, [
		["render", Nc],
		["__scopeId", "data-v-16d45bce"]
	]);

function Qc(e, s, t, l, r, i) {
	const d = f("LegacyHudMap"),
		c = f("HudMap"),
		u = f("UIMobileButton");
	return n(), o("div", {
		class: "hud-hassle-radar",
		style: m({
			transform: `scale(${t.ratioScale})`
		})
	}, [a("div", {
		class: w(["hud-hassle-radar__map", {
			"hud-hassle-radar__map_hidden": !i.radarIsVisible
		}])
	}, [i.useLegacyMap ? (n(), y(d, {
		key: 0,
		isMobile: !0
	})) : (n(), y(c, {
		key: 1,
		isMobile: !0
	}))], 2), a("div", {
		class: w(["hud-hassle-radar__controls", {
			"hud-hassle-radar__controls_hidden": !t.isShowControllers && !t.isShowRadarButtons
		}])
	}, [h(u, {
		class: "mobile-button_1",
		key: "FAQ",
		size: 54,
		onTouchstart: i.openFAQ
	}, null, 8, ["onTouchstart"]), h(u, {
		class: "hud-hassle-radar__menu-button mobile-button_2",
		key: "Menu",
		size: 78,
		onTouchend: i.openMenu
	}, null, 8, ["onTouchend"]), h(u, {
		class: "hud-hassle-radar__inventory-button mobile-button_3",
		key: "Inventory",
		size: 78,
		onTouchstart: s[0] || (s[0] = S => i.keyDown(e.KEY_CODE_I))
	}), h(u, {
		class: "hud-hassle-radar__player-interaction-button mobile-button_4",
		key: "PlayerInteraction",
		size: 78,
		onTouchstart: s[1] || (s[1] = S => i.keyDown(e.KEY_CODE_R))
	}), h(u, {
		class: "mobile-button_5",
		key: "Phone",
		size: 78,
		onTouchstart: s[2] || (s[2] = S => i.keyDown(e.KEY_CODE_P))
	}), a("div", {
		class: "hud-hassle-radar__clickable-zone",
		onTouchend: s[3] || (s[3] = (...S) => i.openMap && i.openMap(...S))
	}, null, 32)], 2)], 4)
}
const eh = {
		props: ["ratioScale", "radar", "isShowControllers", "isShowRadarButtons", "isShowRadar"],
		components: {
			LegacyHudMap: Jc,
			HudMap: ot,
			UIMobileButton: z
		},
		data: () => ({
			KEY_CODE_P: window.KEY_CODE_P,
			KEY_CODE_R: window.KEY_CODE_R,
			KEY_CODE_I: window.KEY_CODE_I,
			KEY_CODE_M: window.KEY_CODE_M
		}),
		computed: {
			useLegacyMap() {
				return window.App.engine == "Unity"
			},
			radarIsVisible() {
				return this.radar.show && (this.isShowControllers || this.isShowRadar)
			}
		},
		methods: {
			openFAQ() {
				sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnReportOpenFaq")
			},
			openMap() {
				openInterface("MainMenu", `["${Rs}"]`)
			},
			keyDown(e) {
				window.onKeyDown(e), setTimeout(() => {
					window.onKeyUp(e)
				}, 100)
			},
			openMenu() {
				window.openPauseMenu()
			}
		}
	},
	th = g(eh, [
		["render", Qc],
		["__scopeId", "data-v-c7a49b9c"]
	]),
	sh = {},
	ih = {
		width: "50",
		height: "50",
		viewBox: "0 0 50 50",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	ah = Ds('<g opacity="0.45"><path d="M1 1L49 49M1 49L49 1" stroke="url(#paint0_linear_3203_238)"></path><path d="M1 1L49 49M1 49L49 1" stroke="url(#paint1_radial_3203_238)" stroke-opacity="0.7"></path><path d="M1 1L49 49M1 49L49 1" stroke="url(#paint2_radial_3203_238)" stroke-opacity="0.25"></path><path d="M1 1L49 49M1 49L49 1" stroke="url(#paint3_radial_3203_238)" stroke-opacity="0.7"></path></g><defs><linearGradient id="paint0_linear_3203_238" x1="-42.222" y1="91.6506" x2="-42.5979" y2="91.2721" gradientUnits="userSpaceOnUse"><stop stop-color="#F8F6ED"></stop><stop offset="1" stop-color="#C8C8C7"></stop></linearGradient><radialGradient id="paint1_radial_3203_238" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-13.6232 63.0012) rotate(-44.9931) scale(110.582 1.33285)"><stop stop-color="white"></stop><stop offset="0.485819" stop-color="white" stop-opacity="0"></stop></radialGradient><radialGradient id="paint2_radial_3203_238" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(27.7712 22.0127) rotate(-45.2996) scale(52.3305 15.157)"><stop stop-color="white"></stop><stop offset="0.414616" stop-color="white" stop-opacity="0"></stop></radialGradient><radialGradient id="paint3_radial_3203_238" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10.2003 39.4686) rotate(-45.1878) scale(28.5604 0.365781)"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></radialGradient></defs>', 2),
	nh = [ah];

function oh(e, s) {
	return n(), o("svg", ih, nh)
}
const rh = g(sh, [
		["render", oh]
	]),
	dh = {
		key: 0,
		class: "joystick__sprint"
	},
	lh = a("img", {
		class: "joystick__sprint-hint",
		src: rs
	}, null, -1),
	ch = ["src"],
	hh = {
		class: "mobile-button__content",
		ref: "joystick_content"
	};

function _h(e, s, t, l, r, i) {
	const d = f("UIMobileButton");
	return n(), o("div", {
		class: "joystick-container",
		onTouchstart: s[1] || (s[1] = (...c) => i.onStartTouchContainer && i.onStartTouchContainer(...c)),
		onTouchend: s[2] || (s[2] = (...c) => i.touchEnd && i.touchEnd(...c))
	}, [a("div", {
		class: "mobile-button joystick",
		ref: "joystick_button",
		onClick: s[0] || (s[0] = c => i.click()),
		style: m({
			width: i.buttonSize,
			height: i.buttonSize,
			opacity: r.show ? 1 : 0,
			left: r.position.x + "px",
			top: r.position.y + "px"
		})
	}, [h(E, {
		name: "fade"
	}, {
		default: C(() => [r.isShownSprint && t.useSprint ? (n(), o("div", dh, [h(d, {
			key: "Sprint",
			size: 78,
			active: r.isSprintActive,
			icon: "Sprint"
		}, null, 8, ["active"]), lh])) : _("", !0)]),
		_: 1
	}), a("img", {
		class: "joystick-bg",
		src: r.joystickBg["/src/assets/images/hud/mobile/joystick-bg.png"]
	}, null, 8, ch), a("div", hh, [a("div", {
		class: "mobile-button__joystick",
		ref: "joystick",
		style: m({
			marginLeft: `${r.deltaX}px`,
			marginTop: `${r.deltaY}px`,
			...i.squareMobileJoystickStyles
		})
	}, null, 4)], 512)], 4)], 32)
}
const uh = .4,
	mh = .7,
	fh = 1.3,
	K = "<Keyboard>/Space",
	gh = .8,
	ph = {
		components: {
			UIMobileButton: z,
			IconCross: rh
		},
		props: {
			size: {
				default: 222
			},
			useSprint: {
				default: !1
			},
			isSquareMobile: {
				default: !1
			}
		},
		data() {
			return {
				joystickBg: Object.assign({
					"/src/assets/images/hud/mobile/bg.png": Ns,
					"/src/assets/images/hud/mobile/button-bg.png": Ys,
					"/src/assets/images/hud/mobile/info-bar-bg.png": Fs,
					"/src/assets/images/hud/mobile/joystick-bg copy.png": Ks,
					"/src/assets/images/hud/mobile/joystick-bg.png": Zs,
					"/src/assets/images/hud/mobile/logo.png": Us
				}),
				SCREEN_RESOLUTION: 1080,
				isShownSprint: !1,
				isSprintActive: !1,
				show: !1,
				touchIdentifier: null,
				lastTouchTime: 0,
				isCrouch: !1,
				position: {
					x: 0,
					y: 0
				},
				minDeltaX: 0,
				minDeltaY: 0,
				maxDeltaX: 0,
				maxDeltaY: 0,
				baseJoystickPosition: null,
				positionUpdated: !1,
				deltaX: 0,
				deltaY: 0
			}
		},
		computed: {
			buttonSize() {
				return this.size / this.SCREEN_RESOLUTION * 100 + "vh"
			},
			stickValue() {
				return {
					x: this.deltaX / this.maxDeltaX,
					y: -this.deltaY / this.maxDeltaY
				}
			},
			maxDeltaOffset() {
				return this.useSprint ? Math.abs(this.maxDeltaY - this.minDeltaY) * uh : 0
			},
			squareMobileJoystickStyles() {
				return this.isSquareMobile ? {
					transform: `scale(${gh})`
				} : {}
			}
		},
		methods: {
			onStartTouchContainer(e) {
				if (this.touchIdentifier != null) return;
				const t = e.currentTarget.getBoundingClientRect(),
					l = this.$refs.joystick_button,
					r = e.touches[e.touches.length - 1];
				this.position = {
					x: r.clientX - t.left - l.offsetWidth / 2,
					y: r.clientY - t.top - l.offsetHeight / 2
				}, this.touchIdentifier = r.identifier, this.baseJoystickPosition = {
					left: r.clientX,
					top: r.clientY
				}, this.touchStart()
			},
			click(e) {
				this.$emit("click", e)
			},
			touchStart() {
				this.updateLimits(), this.show = !0, window.onScreenControlTouchStart("<Gamepad>/leftStick"), Date.now() - this.lastTouchTime < 300 && (this.isCrouch = !0, window.onScreenControlTouchStart("<Keyboard>/c")), this.lastTouchTime = Date.now()
			},
			onSprintEnabled() {
				window.onScreenControlTouchStart(K)
			},
			onSprintDisabled() {
				window.onScreenControlTouchEnd(K)
			},
			onMoving() {
				if (!this.useSprint) return;
				const {
					y: e
				} = this.stickValue;
				this.isShownSprint = e > mh, this.isSprintActive = e > fh, this.isSprintActive ? this.onSprintEnabled() : this.onSprintDisabled()
			},
			moving(e) {
				const {
					maxDeltaOffset: s
				} = this;
				for (let t of e.touches) {
					if (t.identifier != this.touchIdentifier) continue;
					let l = t.clientY - this.baseJoystickPosition.top;
					l > this.maxDeltaY + s ? l = this.maxDeltaY + s : l < this.minDeltaY - s && (l = this.minDeltaY - s), this.deltaY = l;
					let r = t.clientX - this.baseJoystickPosition.left;
					r > this.maxDeltaX + s ? r = this.maxDeltaX + s : r < this.minDeltaX - s && (r = this.minDeltaX - s), this.deltaX = r, this.positionUpdated = !0
				}
				this.onMoving()
			},
			touchEnd(e) {
				this.isShownSprint = !1, this.isSprintActive = !1, this.onSprintDisabled(), this.show = !1, this.touchIdentifier = null, this.deltaX = 0, this.deltaY = 0, this.isCrouch && (this.isCrouch = !1, window.onScreenControlTouchEnd("<Keyboard>/c")), $(() => {
					window.onScreenControlTouchEnd("<Gamepad>/leftStick")
				})
			},
			updateLimits() {
				const e = this.$refs.joystick_content,
					s = this.$refs.joystick,
					t = e.getBoundingClientRect(),
					l = s.getBoundingClientRect();
				this.maxDeltaX = e.offsetWidth - (l.left - t.left), this.maxDeltaY = e.offsetHeight - (l.top - t.top), this.minDeltaX = t.left - l.left - s.offsetWidth, this.minDeltaY = t.top - l.top - s.offsetHeight
			}
		},
		mounted() {
			this.$el.addEventListener("touchend", this.touchEnd), this.$el.addEventListener("touchmove", this.moving), window.onScreenButtonCreate("<Keyboard>/c"), window.onScreenJoystickCreate("<Gamepad>/leftStick")
		},
		created() {
			window.onScreenButtonCreate(K), this.moveInterval = setInterval(() => {
				if (this.positionUpdated) {
					const {
						x: e,
						y: s
					} = this.stickValue;
					window.onScreenControlTouchMove("<Gamepad>/leftStick", e, s), this.positionUpdated = !1
				}
			}, 100)
		},
		unmounted() {
			window.onScreenControlRemove(K), this.show && (clearInterval(this.moveInterval), this.deltaX = 0, this.deltaY = 0, this.isCrouch && window.onScreenControlTouchEnd("<Keyboard>/c"), window.onScreenControlTouchEnd("<Gamepad>/leftStick"), window.onScreenControlRemove("<Gamepad>/leftStick"), window.onScreenControlRemove("<Keyboard>/c"))
		}
	},
	Ch = g(ph, [
		["render", _h]
	]),
	vh = {},
	yh = {
		width: "40",
		height: "39",
		viewBox: "0 0 40 39",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	wh = a("path", {
		d: "M39.023 0L23.7797 23.62L0 38.761L15.2434 15.141L39.023 0Z",
		fill: "#141414"
	}, null, -1),
	bh = a("path", {
		d: "M39.0238 38.7619L15.2441 23.6209L0.000774298 0.000878883L23.7804 15.1419L39.0238 38.7619Z",
		fill: "#141414"
	}, null, -1),
	Sh = [wh, bh];

function Eh(e, s) {
	return n(), o("svg", yh, Sh)
}
const Th = g(vh, [
		["render", Eh]
	]),
	Mh = {
		class: "hud-hassle-controls__close__icon"
	},
	kh = {
		class: "hud-hassle-controls__size"
	},
	Ih = {
		class: "hud-hassle-controls__size__content"
	},
	Oh = a("div", {
		class: "hud-hassle-controls__size__content-title"
	}, "Размер кнопки", -1),
	Ph = {
		key: 0,
		class: "hud-hassle-controls__size__content-value"
	},
	Dh = ["data-native"];

function Ah(e, s, t, l, r, i) {
	const d = f("IconClose"),
		c = f("RangeSlider"),
		u = f("UIMobileButton"),
		S = f("UIMobileJoystick"),
		T = As("touch");
	return n(), o("div", {
		class: w(["hud-hassle-controls", {
			"hud-hassle-controls_editable": i.isEditableMode
		}])
	}, [t.isShowControllers ? (n(), o(b, {
		key: 0
	}, [i.isEditableMode ? (n(), o("div", {
		key: 0,
		class: "hud-hassle-controls__close",
		onTouchend: s[0] || (s[0] = (...v) => i.closeEditable && i.closeEditable(...v))
	}, [a("div", Mh, [h(d)])], 32)) : _("", !0), i.isEditableMode ? (n(), o("div", {
		key: 1,
		class: w(["hud-hassle-controls__current", {
			"hud-hassle-controls__current_disabled": !e.currentButton
		}])
	}, [a("div", kh, [a("div", Ih, [Oh, e.currentButton ? (n(), o("div", Ph, p(Math.round(i.countButtonSize)) + " %", 1)) : _("", !0)]), h(c, {
		min: 20,
		max: 200,
		value: i.countButtonSize,
		bgColor: "white",
		lineBg: "rgba(255, 255, 255, 0.25)",
		onValueChanged: i.changeScale
	}, null, 8, ["value", "onValueChanged"])]), a("div", {
		class: "hud-hassle-controls__button",
		onClick: s[1] || (s[1] = (...v) => i.resetButton && i.resetButton(...v))
	}, "По умолчанию")], 2)) : _("", !0)], 64)) : _("", !0), a("div", {
		class: "hud-hassle-controls__buttons",
		"data-native": i.isEditableMode ? void 0 : !0
	}, [t.isShowControllers ? (n(), o(b, {
		key: 0
	}, [h(u, {
		key: "Voice",
		active: i.isActiveButton("Voice"),
		onMousedown: s[2] || (s[2] = v => i.selectButton("Voice")),
		name: "<Keyboard>/x",
		icon: "VoiceActive",
		editable: i.isEditableMode,
		position: i.controls.Voice,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), i.radioButtonStatus ? (n(), y(u, {
		key: "Radio",
		active: i.isActiveButton("Radio"),
		onPointerdown: s[3] || (s[3] = v => i.selectButton("Radio")),
		name: "<Keyboard>/u",
		editable: i.isEditableMode,
		position: i.controls.Radio,
		"onPosition:updated": i.updatePosition,
		useVw: !0
	}, null, 8, ["active", "editable", "position", "onPosition:updated"])) : _("", !0), i.megaphoneButtonStatus ? (n(), y(u, {
		key: "Megaphone",
		active: i.isActiveButton("Megaphone"),
		onPointerdown: s[4] || (s[4] = v => i.selectButton("Megaphone")),
		name: "<Keyboard>/x<Mouse>2",
		editable: i.isEditableMode,
		position: i.controls.Megaphone,
		"onPosition:updated": i.updatePosition,
		useVw: !0
	}, null, 8, ["active", "editable", "position", "onPosition:updated"])) : _("", !0), i.isSpeedometerShown ? (n(), o(b, {
		key: 3
	}, [i.useJoystick ? _("", !0) : (n(), o(b, {
		key: 0
	}, [h(u, {
		key: "TurnLeft",
		active: i.isActiveButton("TurnLeft"),
		onMousedown: s[11] || (s[11] = v => i.selectButton("TurnLeft")),
		name: "<Keyboard>/a",
		editable: i.isEditableMode,
		position: i.controls.TurnLeft,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		style: {
			"z-index": "100"
		},
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), h(u, {
		key: "TurnRight",
		active: i.isActiveButton("TurnRight"),
		onMousedown: s[12] || (s[12] = v => i.selectButton("TurnRight")),
		name: "<Keyboard>/d",
		editable: i.isEditableMode,
		position: i.controls.TurnRight,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		style: {
			"z-index": "100"
		},
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"])], 64)), h(u, {
		name: "<Keyboard>/space",
		key: "HandBrake",
		active: i.isActiveButton("HandBrake"),
		onMousedown: s[13] || (s[13] = v => i.selectButton("HandBrake")),
		editable: i.isEditableMode,
		position: i.controls.HandBrake,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), h(u, {
		key: "Beep",
		active: i.isActiveButton("Beep"),
		onMousedown: s[14] || (s[14] = v => i.selectButton("Beep")),
		name: "<Keyboard>/h",
		editable: i.isEditableMode,
		position: i.controls.Beep,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), V(h(u, {
		name: "<Keyboard>/s",
		key: "PedalStop",
		active: i.isActiveButton("PedalStop"),
		onMousedown: s[15] || (s[15] = v => i.selectButton("PedalStop")),
		editable: i.isEditableMode,
		position: i.controls.PedalStop,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), [
		[T, i.startTouchPedalStop, "press"],
		[T, i.stopTouchPedalStop, "release"]
	]), V(h(u, {
		name: "<Keyboard>/w",
		key: "PedalGas",
		active: i.isActiveButton("PedalGas"),
		onMousedown: s[16] || (s[16] = v => i.selectButton("PedalGas")),
		editable: i.isEditableMode,
		position: i.controls.PedalGas,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), [
		[T, i.startTouchPedalGas, "press"],
		[T, i.stopTouchPedalGas, "release"]
	])], 64)) : (n(), o(b, {
		key: 2
	}, [i.isPassenger ? _("", !0) : (n(), o(b, {
		key: 0
	}, [i.isAimMode ? _("", !0) : (n(), y(u, {
		active: i.isActiveButton("Jump"),
		onMousedown: s[5] || (s[5] = v => i.selectButton("Jump")),
		key: "Jump",
		name: "<Keyboard>/leftShift",
		editable: i.isEditableMode,
		position: i.controls.Jump,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"])), i.isWeaponActive && !i.isMeleeWeapon ? (n(), y(u, {
		onMousedown: s[6] || (s[6] = v => i.selectButton("Aim")),
		key: "Aim",
		onTouchStartInvoked: i.toggleAim,
		active: i.isActiveButton("Aim") || i.isAimMode,
		editable: i.isEditableMode,
		position: i.controls.Aim,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["onTouchStartInvoked", "active", "editable", "position", "onPosition:updated", "isSquareMobile"])) : _("", !0), i.isPlayerSwiming ? (n(), y(u, {
		key: "Dive",
		active: i.isActiveButton("Dive"),
		onMousedown: s[10] || (s[10] = v => i.selectButton("Dive")),
		name: "<Mouse>/leftButton",
		editable: i.isEditableMode,
		position: i.controls.Dive,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"])) : (n(), o(b, {
		key: 2
	}, [i.isWeaponActive && !i.isMeleeWeapon && i.isAimMode && i.totalAmmo ? (n(), o(b, {
		key: 0
	}, [h(u, {
		active: i.isActiveButton("Patron"),
		onMousedown: s[7] || (s[7] = v => i.selectButton("Patron")),
		key: "Patron",
		name: "<Mouse>/leftButton",
		editable: i.isEditableMode,
		position: i.controls.Patron,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"]), h(u, {
		active: i.isActiveButton("SecondPatron"),
		onMousedown: s[8] || (s[8] = v => i.selectButton("SecondPatron")),
		key: "Patron",
		positionKey: "SecondPatron",
		name: "<Mouse>/leftButton",
		editable: i.isEditableMode,
		position: i.controls.SecondPatron,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"])], 64)) : _("", !0), !i.isWeaponActive || i.isMeleeWeapon ? (n(), y(u, {
		active: i.isActiveButton("Atack"),
		onMousedown: s[9] || (s[9] = v => i.selectButton("Atack")),
		key: "Atack",
		name: "<Mouse>/leftButton",
		editable: i.isEditableMode,
		position: i.controls.Atack,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"])) : _("", !0)], 64))], 64))], 64)), i.isSpeedometerShown || i.isPassenger ? (n(), y(u, {
		key: "LeaveCar",
		active: i.isActiveButton("LeaveCar"),
		onMousedown: s[17] || (s[17] = v => i.selectButton("LeaveCar")),
		name: "<Keyboard>/f",
		editable: i.isEditableMode,
		position: i.controls.LeaveCar,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "editable", "position", "onPosition:updated", "isSquareMobile"])) : i.hasNearestVehicle ? (n(), y(u, {
		key: "SeatCar",
		active: i.isActiveButton("SeatCar"),
		onMousedown: s[18] || (s[18] = v => i.selectButton("SeatCar")),
		name: "<Keyboard>/f&<Keyboard>/g",
		longTouch: !0,
		onTouchEnd: i.onTrySeatCar,
		editable: i.isEditableMode,
		position: i.controls.SeatCar,
		"onPosition:updated": i.updatePosition,
		useVw: !0,
		isSquareMobile: t.isSquareMobile
	}, null, 8, ["active", "onTouchEnd", "editable", "position", "onPosition:updated", "isSquareMobile"])) : _("", !0)], 64)) : _("", !0), !i.isEditableMode && (t.useInvisibleJoystick || t.isShowControllers) ? (n(), y(E, {
		key: 1,
		name: "fade"
	}, {
		default: C(() => [t.data.speedometer.show && i.settings.useJoystick || !t.data.speedometer.show ? (n(), o("div", {
			key: 0,
			class: w(["hud-hassle-controls__joystick", {
				"hud-hassle-controls__joystick_invisible": t.useInvisibleJoystick
			}])
		}, [h(S, {
			ref: "joystick",
			useSprint: !i.isPassenger && !i.isSpeedometerShown,
			isSquareMobile: t.isSquareMobile
		}, null, 8, ["useSprint", "isSquareMobile"])], 2)) : _("", !0)]),
		_: 1
	})) : _("", !0)], 8, Dh)], 2)
}
const Z = 100,
	Hh = {
		props: ["data", "useInvisibleJoystick", "isShowControllers", "isSquareMobile"],
		components: {
			UIMobileButton: z,
			UIMobileJoystick: Ch,
			RangeSlider: Vs,
			IconClose: Th
		},
		data: () => ({
			DEFAULT_BUTTON_SCALE: Z,
			currentButton: null
		}),
		computed: {
			isSpeedometerShown() {
				return this.data.speedometer.show
			},
			isAimMode() {
				return this.data.isAimMode
			},
			isPassenger() {
				return this.data.isPassenger
			},
			isPlayerSwiming() {
				return this.data.isPlayerSwiming
			},
			isWeaponActive() {
				return !!this.data.info.weapon
			},
			isMeleeWeapon() {
				const e = this.data.info.weapon;
				return (e >= 1 && e <= 15 || e === 46) && e !== 9
			},
			totalAmmo() {
				return this.data.info.totalAmmo
			},
			hasNearestVehicle() {
				return this.data.hasNearestVehicle
			},
			settings() {
				return this.$store.getters["settings/settings"]
			},
			controls() {
				return this.settings.controls ? this.settings.controls : {}
			},
			useJoystick() {
				return this.settings.useJoystick
			},
			isEditableMode() {
				return this.settings.isControlsEditable
			},
			countButtonSize() {
				return this.currentButton ? this.currentButton.scale : Z
			},
			radioButtonStatus() {
				return this.$store.getters["voiceChat/radioButton"]
			},
			megaphoneButtonStatus() {
				return this.$store.getters["voiceChat/megaphoneButton"]
			}
		},
		methods: {
			saveSettings() {
				window.saveControlsSettings(this.controls)
			},
			updatePosition(e, s) {
				this.updateButtonData(e, s)
			},
			closeEditable() {
				this.$store.commit("settings/setEditableMode", !1), window.setDrawLabelStatus(!0), window.setHudStatus(!0), this.currentButton = null, this.saveSettings()
			},
			resetButton() {
				this.changeScale(Z), this.currentButton.scale = Z;
				const {
					key: e
				} = this.currentButton;
				this.updateButtonData(e, Hs[e])
			},
			changeScale(e) {
				const {
					key: s
				} = this.currentButton;
				this.currentButton.scale = e, this.setButtonScale(s, e)
			},
			isActiveButton(e) {
				return this.isEditableMode && this.currentButton && this.currentButton.key === e
			},
			selectButton(e) {
				this.currentButton = {
					key: e,
					scale: this.controls[e].scale
				}
			},
			setButtonScale(e, s) {
				this.updateButtonData(e, {
					scale: s
				})
			},
			updateButtonData(e, s) {
				this.$store.commit("settings/setControlParams", {
					name: e,
					payload: {
						...this.controls[e],
						...s
					}
				})
			},
			toggleAim() {
				this.isEditableMode || this.$emit("toggleAim")
			},
			startTouchPedalStop() {
				this.isEditableMode || this.$emit("startTouchPedalStop")
			},
			stopTouchPedalStop() {
				this.isEditableMode || this.$emit("stopTouchPedalStop")
			},
			startTouchPedalGas() {
				this.isEditableMode || this.$emit("startTouchPedalGas")
			},
			stopTouchPedalGas() {
				this.isEditableMode || this.$emit("stopTouchPedalGas")
			},
			onTrySeatCar(e) {
				this.isEditableMode || this.$emit("onTrySeatCar", e)
			}
		}
	},
	Lh = g(Hh, [
		["render", Ah]
	]),
	Bh = {
		class: "hud-hassle-speedometer-appliances__fuel"
	},
	xh = {
		class: "hud-hassle-speedometer-appliances__fuel-value"
	},
	$h = a("img", {
		src: ds
	}, null, -1),
	Rh = {
		class: "hud-hassle-speedometer-appliances__fuel-value__value"
	},
	Nh = {
		style: {
			width: "5.93vh",
			height: "12.31vh"
		},
		viewBox: "0 0 64 133",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	Yh = ["stroke-dashoffset"],
	Fh = {
		class: "hud-hassle-speedometer-appliances__main"
	},
	Kh = {
		class: "hud-hassle-speedometer-appliances__main__fill",
		style: {
			width: "29.26vh",
			height: "13.43vh"
		},
		viewBox: "0 0 316 145",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	Zh = ["stroke-dashoffset"],
	Uh = {
		key: 0,
		class: "hud-hassle-speedometer-appliances__speed-bg",
		src: ls
	},
	Vh = {
		class: "hud-hassle-speedometer-appliances__speed"
	},
	Gh = {
		class: "hud-hassle-speedometer-appliances__speed__value"
	},
	Wh = a("div", {
		class: "hud-hassle-speedometer-appliances__speed__text"
	}, "км/ч", -1),
	zh = {
		class: "hud-hassle-speedometer-appliances__mileage"
	},
	qh = {
		class: "hud-hassle-speedometer-appliances__mileage__zeros"
	},
	Xh = {
		class: "hud-hassle-speedometer-appliances__mileage__value"
	},
	jh = {
		class: "hud-hassle-speedometer-appliances__wash"
	},
	Jh = {
		class: "hud-hassle-speedometer-appliances__wash-value"
	},
	Qh = a("img", {
		src: cs
	}, null, -1),
	e_ = {
		class: "hud-hassle-speedometer-appliances__wash-value__value"
	},
	t_ = {
		style: {
			width: "5.93vh",
			height: "12.31vh"
		},
		viewBox: "0 0 64 133",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg"
	},
	s_ = ["stroke-dashoffset"];

function i_(e, s, t, l, r, i) {
	return n(), o("div", {
		class: w(["hud-hassle-speedometer-appliances", {
			"hud-hassle-speedometer-appliances_helloween": t.isHelloween
		}])
	}, [a("div", Bh, [a("div", xh, [$h, a("div", Rh, p(t.speedometer.fuel) + "л", 1)]), (n(), o("svg", Nh, [a("path", {
		d: "M10.1558 197.699C5.62098 180.821 3.2002 163.057 3.2002 144.719C3.2002 90.3406 24.4863 41.0109 59.0592 4.85239L61.0542 2.85742",
		stroke: "#72D373",
		"stroke-width": "6",
		"stroke-dasharray": "300",
		"stroke-dashoffset": 235 - 145 * (t.speedometer.fuel / t.speedometer.maxFuel)
	}, null, 8, Yh)]))]), a("div", Fh, [(n(), o("svg", Kh, [a("path", {
		d: "M34.6042 204.937L12.1385 211C6.22381 194.546 3 176.801 3 158.3C3 72.5304 72.2918 3 157.768 3C243.243 3 313 72.5304 313 158.3C313 176.801 309.776 194.546 303.862 211L281.396 204.937",
		stroke: "#F4F1E1",
		"stroke-width": "6",
		"stroke-dasharray": "600",
		"stroke-dashoffset": 510 - 465 * (t.speedometer.speedBar < 1 ? t.speedometer.speedBar : 1),
		style: {
			transition: "all 0.25s ease"
		}
	}, null, 8, Zh)])), t.isHelloween ? (n(), o("img", Uh)) : _("", !0), a("div", Vh, [a("div", Gh, p(t.speedometer.speed), 1), Wh]), a("div", zh, [a("div", qh, p(i.mileage.zeros), 1), a("div", Xh, p(i.mileage.value), 1)])]), a("div", jh, [a("div", Jh, [Qh, a("div", e_, p(i.wash) + "%", 1)]), (n(), o("svg", t_, [a("path", {
		d: "M53.0991 197.699C57.6339 180.821 60.0547 163.057 60.0547 144.719C60.0547 90.3406 38.7685 41.0109 4.19567 4.85239L2.20071 2.85742",
		stroke: "#F4F1E1",
		"stroke-width": "6",
		"stroke-dasharray": "300",
		"stroke-dashoffset": 235 - 145 * t.speedometer.params.wash
	}, null, 8, s_)]))])], 2)
}
const a_ = {
		props: ["speedometer", "isHelloween"],
		computed: {
			mileage() {
				const e = this.speedometer.mileage;
				return {
					zeros: Array.from(e.toString().padStart(6, "f")).filter(t => t === "f").join("").split("f").join("0"),
					value: e
				}
			},
			wash() {
				return Math.ceil((1 - this.speedometer.params.wash) * 100)
			}
		}
	},
	n_ = g(a_, [
		["render", i_]
	]),
	o_ = {
		class: "hud-hassle-speedometer"
	},
	r_ = {
		key: 0,
		class: "hud-hassle-speedometer__controls"
	},
	d_ = {
		class: "hud-hassle-speedometer__hint"
	},
	l_ = a("img", {
		src: hs
	}, null, -1);

function c_(e, s, t, l, r, i) {
	const d = f("UIMobileButton"),
		c = f("SpeedometerAppliances");
	return n(), o("div", o_, [h(E, {
		name: "controls"
	}, {
		default: C(() => [e.isControlsShown ? (n(), o("div", r_, [h(d, {
			size: 78,
			key: "Engine",
			active: t.speedometer.params.temperature,
			onClick: i.setCarParamEngine
		}, null, 8, ["active", "onClick"]), h(d, {
			size: 78,
			key: "Key",
			active: t.speedometer.params.key,
			onClick: i.setCarParamKey
		}, null, 8, ["active", "onClick"]), h(d, {
			size: 78,
			key: "Lock",
			active: t.speedometer.params.doors,
			onClick: i.setCarParamLock
		}, null, 8, ["active", "onClick"]), h(d, {
			size: 78,
			key: "Rem",
			active: t.speedometer.params.rem,
			onClick: i.setCarParamRem
		}, null, 8, ["active", "onClick"]), h(d, {
			size: 78,
			key: "Lights",
			active: t.speedometer.params.lights,
			onClick: i.setCarParamLights
		}, null, 8, ["active", "onClick"])])) : _("", !0)]),
		_: 1
	}), a("div", {
		class: "hud-hassle-speedometer__appliances",
		onClick: s[0] || (s[0] = u => e.isControlsShown = !e.isControlsShown)
	}, [a("div", d_, [l_, k(p(e.isControlsShown ? "Закрыть" : "Меню"), 1)]), h(c, {
		speedometer: t.speedometer,
		isHelloween: t.isHelloween
	}, null, 8, ["speedometer", "isHelloween"])])])
}
const h_ = {
		props: ["speedometer", "isHelloween"],
		components: {
			UIMobileButton: z,
			SpeedometerAppliances: n_
		},
		data: () => ({
			isControlsShown: !1
		}),
		methods: {
			closeControls() {
				this.isControlsShown = !1
			},
			setCarParamEngine() {
				this.$emit("setCarParamEngine")
			},
			setCarParamKey() {
				this.$emit("setCarParamKey")
			},
			setCarParamLock() {
				this.$emit("setCarParamLock")
			},
			setCarParamRem() {
				this.$emit("setCarParamRem")
			},
			setCarParamLights() {
				this.$emit("setCarParamLights")
			}
		}
	},
	__ = g(h_, [
		["render", c_]
	]),
	u_ = {
		class: "hud hud-hassle"
	};

function m_(e, s, t, l, r, i) {
	const d = f("HudRadar"),
		c = f("HudControls"),
		u = f("HudInfo"),
		S = f("HudMeta"),
		T = f("HudSpeedometer");
	return n(), o("div", u_, [i.getConnectingStatus() ? (n(), y(d, {
		key: 0,
		ratioScale: t.ratioScale,
		radar: t.data.radar,
		isShowControllers: t.data.isShowControllers,
		isShowRadarButtons: t.data.isShowRadarButtons,
		isShowRadar: t.data.isShowRadar
	}, null, 8, ["ratioScale", "radar", "isShowControllers", "isShowRadarButtons", "isShowRadar"])) : _("", !0), i.getConnectingStatus() ? (n(), y(c, {
		key: 1,
		ref: "controls",
		isShowControllers: t.data.isShowControllers,
		useInvisibleJoystick: t.useInvisibleJoystick,
		data: t.data,
		isSquareMobile: t.isSquareMobile,
		onStartTouchPedalStop: i.startTouchPedalStop,
		onStopTouchPedalStop: i.stopTouchPedalStop,
		onStartTouchPedalGas: i.startTouchPedalGas,
		onStopTouchPedalGas: i.stopTouchPedalGas,
		onOnTrySeatCar: i.onTrySeatCar,
		onToggleAim: i.toggleAim
	}, null, 8, ["isShowControllers", "useInvisibleJoystick", "data", "isSquareMobile", "onStartTouchPedalStop", "onStopTouchPedalStop", "onStartTouchPedalGas", "onStopTouchPedalGas", "onOnTrySeatCar", "onToggleAim"])) : _("", !0), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.data.info.show ? (n(), y(u, {
			key: 0,
			info: t.data.info,
			server: t.data.server,
			bonus: t.data.bonus,
			isHelloween: t.data.isHelloween,
			isNewYear: t.data.isNewYear,
			isEaster: t.data.isEaster,
			style: m({
				transform: `scale(${t.ratioScale})`
			}),
			isSquareMobile: t.isSquareMobile
		}, null, 8, ["info", "server", "bonus", "isHelloween", "isNewYear", "isEaster", "style", "isSquareMobile"])) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.data.meta.show ? (n(), y(S, {
			key: 0,
			ping: t.data.meta.ping,
			fps: t.data.meta.fps
		}, null, 8, ["ping", "fps"])) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "fade"
	}, {
		default: C(() => [t.data.speedometer.show && !i.isEditableMode ? (n(), y(T, {
			key: 0,
			ref: "speedometer",
			speedometer: t.data.speedometer,
			isHelloween: t.data.isHelloween,
			style: m({
				transform: `scale(${i.speedometerScale})`
			}),
			onSetCarParamEngine: i.setCarParamEngine,
			onSetCarParamKey: i.setCarParamKey,
			onSetCarParamLock: i.setCarParamLock,
			onSetCarParamRem: i.setCarParamRem,
			onSetCarParamLights: i.setCarParamLights
		}, null, 8, ["speedometer", "isHelloween", "style", "onSetCarParamEngine", "onSetCarParamKey", "onSetCarParamLock", "onSetCarParamRem", "onSetCarParamLights"])) : _("", !0)]),
		_: 1
	})])
}
const f_ = {
		props: {
			data: {
				type: Object,
				required: !0
			},
			scale: {
				type: Number,
				default: 1
			},
			ratioScale: {
				type: Number,
				default: 1
			},
			useInvisibleJoystick: {
				type: Boolean,
				default: !1
			},
			isSquareMobile: {
				type: Boolean,
				default: !1
			}
		},
		components: {
			HudInfo: yc,
			HudMeta: Dc,
			HudRadar: th,
			HudControls: Lh,
			HudSpeedometer: __
		},
		computed: {
			speedometerScale() {
				return this.scale ? !this.scale || this.scale === 1 ? this.isSquareMobile ? 1.2 : .9 : this.scale : this.isSquareMobile ? 1.2 : .9
			},
			isEditableMode() {
				return this.$store.getters["settings/settings"].isControlsEditable
			}
		},
		methods: {
			getConnectingStatus() {
				return !window.getInterfaceStatus("Connect")
			},
			closeSpeedometer() {
				const e = this.$refs.speedometer;
				e.isControlsShown && e.closeControls()
			},
			toggleAim() {
				this.$emit("toggleAim")
			},
			startTouchPedalStop() {
				this.$emit("startTouchPedalStop"), this.closeSpeedometer()
			},
			stopTouchPedalStop() {
				this.$emit("stopTouchPedalStop")
			},
			startTouchPedalGas() {
				this.$emit("startTouchPedalGas"), this.closeSpeedometer()
			},
			stopTouchPedalGas() {
				this.$emit("stopTouchPedalGas")
			},
			setCarParamEngine() {
				this.$emit("setCarParamEngine")
			},
			setCarParamKey() {
				this.$emit("setCarParamKey")
			},
			setCarParamLock() {
				this.$emit("setCarParamLock")
			},
			setCarParamRem() {
				this.$emit("setCarParamRem")
			},
			setCarParamLights() {
				this.$emit("setCarParamLights")
			},
			onTrySeatCar(e) {
				this.$emit("onTrySeatCar", e)
			}
		}
	},
	g_ = g(f_, [
		["render", m_],
		["__scopeId", "data-v-13d519fa"]
	]),
	p_ = {
		class: "sniper-aim"
	};

function C_(e, s) {
	return n(), o("div", p_)
}
const v_ = {},
	y_ = g(v_, [
		["render", C_],
		["__scopeId", "data-v-bc63a694"]
	]);
const Oe = 1920,
	w_ = 2340,
	b_ = 1080,
	Pe = 1.45,
	U = 250,
	S_ = 500,
	De = 5,
	Ae = 13,
	E_ = 2,
	He = 30,
	T_ = {
		name: "hud",
		components: {
			HudRadmir: _1,
			HudHassle: g_,
			Chat: bi,
			RadmirChat: qi,
			HassleSniperAim: y_
		},
		data() {
			return {
				serversLogo: Object.assign({
					"/src/assets/images/hud/servers/0.png": _s,
					"/src/assets/images/hud/servers/1.png": us,
					"/src/assets/images/hud/servers/10.png": ms,
					"/src/assets/images/hud/servers/11.png": fs,
					"/src/assets/images/hud/servers/12.png": gs,
					"/src/assets/images/hud/servers/13.png": ps,
					"/src/assets/images/hud/servers/14.png": Cs,
					"/src/assets/images/hud/servers/15.png": vs,
					"/src/assets/images/hud/servers/16.png": ys,
					"/src/assets/images/hud/servers/17.png": ws,
					"/src/assets/images/hud/servers/2.png": bs,
					"/src/assets/images/hud/servers/3.png": Ss,
					"/src/assets/images/hud/servers/4.png": Es,
					"/src/assets/images/hud/servers/5.png": Ts,
					"/src/assets/images/hud/servers/6.png": Ms,
					"/src/assets/images/hud/servers/7.png": ks,
					"/src/assets/images/hud/servers/8.png": Is,
					"/src/assets/images/hud/servers/9.png": Os
				}),
				urlLogo: "",
				isShowLogo: !0,
				server: -1,
				bonus: 1,
				hudType: 0,
				ratioScale: 1,
				isHelloween: !1,
				isNewYear: !1,
				isEaster: !1,
				isVoiceAvailable: !0,
				isShowControllers: !1,
				isShowRadarButtons: !1,
				isShowRadar: !1,
				isEffectEnabled: !0,
				isHudControls: !1,
				isPlayerSwiming: !1,
				isPassenger: !1,
				hasNearestVehicle: !1,
				isAimMode: !1,
				useInvisibleJoystick: !1,
				isOpenedHelp: !1,
				isUseDrugs: !1,
				aim: {
					show: !1,
					isSniper: !1,
					dispersion: 1,
					duration: U,
					dispersionTimout: null
				},
				useChat: !0,
				useChatAnimation: !0,
				chatStatus: !0,
				canChatFadeout: !0,
				playerList: {
					show: !1,
					playerid: 2,
					players: [
						[1, "Pavel_Addams", 47],
						[2, "Pavel_Addams", 47],
						[3, "Pavel_Addams", 47],
						[4, "Pavel_Addams", 47],
						[5, "Pavel_Addams", 47],
						[6, "Pavel_Addams", 47],
						[7, "Pavel_Addams", 47],
						[8, "Pavel_Addams", 47],
						[9, "Pavel_Addams", 47],
						[10, "Pavel_Addams", 47]
					]
				},
				activeControl: {
					pedal: {
						stop: !1,
						gas: !1
					}
				},
				meta: {
					show: !1,
					ping: 0,
					fps: 0
				},
				info: {
					type: 0,
					isShowValues: !0,
					isShowFreeze: !1,
					show: !1,
					showBars: !0,
					weapon: 0,
					ammoInClip: 0,
					totalAmmo: 0,
					money: 0,
					health: 50,
					armour: 0,
					hunger: 50,
					breath: 100,
					freeze: 0,
					wanted: 0,
					online: 1,
					id: 0
				},
				speedometer: {
					show: !1,
					controls: {
						state: 0,
						timout: null
					},
					updateDelay: 100,
					scale: 1,
					speed: 0,
					maxSpeed: 180,
					speedBar: 1,
					fuel: 25,
					maxFuel: 100,
					mileage: 3400,
					measuring: 0,
					measuringStartTime: 0,
					isElectro: !1,
					params: {
						doors: !0,
						temperature: !1,
						lights: !1,
						rem: !0,
						engine: !0,
						key: !0,
						wear: 0,
						damage: 0,
						wash: .5,
						turns: {
							left: !1,
							right: !1
						}
					},
					tachometer: {
						show: !1,
						maxRpm: 8e3,
						rpm: 1500,
						gear: "D4",
						gearsCount: 6
					}
				},
				radar: {
					show: !1,
					greenZone: !1,
					fishingZone: !1,
					point: {
						show: !1,
						distance: 253
					},
					gps: {
						show: !1,
						distance: 1292
					}
				},
				time: {
					show: !1,
					string: ""
				},
				buttons: {
					show: !1,
					open: !1,
					keys: {
						I: {
							show: !0,
							code: KEY_CODE_I
						},
						Y: {
							show: !0
						},
						N: {
							show: !0
						},
						H: {
							show: !0,
							code: KEY_CODE_H
						},
						G: {
							show: !1
						},
						E: {
							show: !1,
							code: KEY_CODE_E
						},
						Q: {
							show: !1,
							code: KEY_CODE_Q
						},
						J: {
							show: !0,
							code: KEY_CODE_J
						},
						F: {
							show: !0
						},
						Numpad4: {
							show: !1
						},
						Numpad6: {
							show: !1
						},
						Alt: {
							show: !0
						},
						2: {
							show: !0
						}
					}
				},
				voiceChat: {
					show: !1,
					showButtons: !0,
					entries: []
				}
			}
		},
		watch: {
			"info.weapon": function() {
				this.isAimMode = !1, window.setAimMode(!1)
			}
		},
		computed: {
			settings() {
				return this.$store.getters["settings/settings"]
			},
			isMobile() {
				return this.$root.isMobile
			},
			deviceModel() {
				return this.$root.deviceModel
			},
			isSpecialDevice() {
				return this.$root.isSpecialDevice()
			},
			windowHeight() {
				return window.screen.height
			},
			scale() {
				return this.isMobile ? this.getScale(w_) : window.screen.width / window.screen.height <= Pe ? this.getScale() : 1
			},
			engine() {
				return this.$root.engine
			},
			developmentMode() {
				return this.$root.developmentMode
			},
			useCameraWeapon() {
				return this.info.weapon == 43
			},
			isVoiceActive() {
				return this.$store.getters["voiceChat/isActive"]
			},
			voiceKeyCode() {
				return this.$store.getters["voiceChat/keyCode"]
			},
			isSquareMobile() {
				return this.$root.isSquareMobile
			},
			chatPageSize() {
				return this.$root.chatPageSize
			},
			maxVoiceChatEntries() {
				if (this.chatPageSize <= Ae) return De;
				const e = Math.floor((this.chatPageSize - Ae) / E_);
				return De - e
			},
			isHassleHud() {
				return this.engine !== "legacy" && this.isMobile
			}
		},
		methods: {
			setInvisibleJoystickState(e) {
				this.useInvisibleJoystick = e
			},
			updateRatioScale() {
				const e = window.innerWidth,
					s = window.innerHeight,
					t = 1.75;
				let r = e / s / t;
				r > 1 && (r = 1), this.ratioScale = r
			},
			setChatAnimationState(e) {
				this.useChatAnimation = e
			},
			getSVGArc([e, s], [t, l], [r, i], d) {
				const c = ([
						[L, X],
						[j, J]
					], [ue, me]) => [L * ue + X * me, j * ue + J * me],
					u = L => [
						[Math.cos(L), -Math.sin(L)],
						[Math.sin(L), Math.cos(L)]
					],
					S = ([L, X], [j, J]) => [L + j, X + J];
				i = i % (2 * Math.PI);
				const T = u(d),
					[v, O] = S(c(T, [t * Math.cos(r), l * Math.sin(r)]), [e, s]),
					[x, q] = S(c(T, [t * Math.cos(r + i), l * Math.sin(r + i)]), [e, s]),
					ht = i > Math.PI ? 1 : 0,
					_t = i > 0 ? 1 : 0;
				return "M " + v + " " + O + " A " + [t, l, d / (2 * Math.PI) * 360, ht, _t, x, q].join(" ")
			},
			setEffectEnabled(e) {
				this.isEffectEnabled = e
			},
			setShowControls(e) {
				this.isHudControls = e
			},
			setEffectUseDrugs(e, s) {
				this.isUseDrugs = e, s > 0 && setTimeout(() => {
					this.isUseDrugs = !1
				}, s)
			},
			getGearNumber(e) {
				return e[0] === "N" ? 0 : Number.parseInt(e.split(/[^0-9]/g).join(""))
			},
			getGearType(e) {
				return e[0] === "N" ? "D" : e.split(/[^A-Za-z]/g).join("")
			},
			getScale(e = Oe) {
				const s = window.screen.width,
					t = window.screen.height,
					l = window.screen.width / window.screen.height;
				return e === Oe ? l / Pe : (s + t) / (e + b_)
			},
			showLogo() {
				this.isShowLogo = !0
			},
			hideLogo() {
				this.isShowLogo = !1
			},
			startTouchTurn(e) {},
			stopTouchTurn(e) {},
			setInfoValuesVisible(e) {
				this.info.isShowValues = e, this.voiceChat.showButtons = e
			},
			setCanChatFadeout(e) {
				this.canChatFadeout = e
			},
			setNewYear(e) {
				this.isNewYear = !!e
			},
			setHelloween(e) {
				this.isHelloween = !!e
			},
			setEaster(e) {
				this.isEaster = !!e
			},
			setLogoUrl(e) {
				this.urlLogo = e
			},
			setServer(e) {
				this.server = e
			},
			setBonus(e) {
				this.bonus = e
			},
			setVoiceAvailable(e) {
				this.isVoiceAvailable = e
			},
			onTrySeatCar(e) {
				let s = "<Keyboard>/f";
				e >= 1500 && (s = "<Keyboard>/g"), window.onScreenControlTouchStart(s), setTimeout(() => window.onScreenControlTouchEnd(s), 250)
			},
			setAim(e, s = !1) {
				this.useCameraWeapon ? e ? window.openInterface("Camera") : window.closeInterface("Camera") : this.aim = {
					show: e,
					isSniper: s,
					dispersion: 1,
					duration: U
				}
			},
			setAimDispersion(e) {
				this.aim.duration = U, this.aim.dispersion = e, clearTimeout(this.aim.dispersionTimout), this.aim.dispersionTimout = setTimeout(() => {
					this.aim.duration = S_ * e, this.aim.dispersion = 1
				}, U)
			},
			setHudType(e) {
				this.hudType = e
			},
			getPlayer() {
				return this.playerList.players.filter(e => e[0] == this.playerList.playerid)[0] || null
			},
			setType(e) {
				this.info.type = e
			},
			hideInfo() {
				this.voiceChat.show = !1, this.radar.show = !1, this.info.show = !1
			},
			hideRadar() {
				this.radar.show = !1
			},
			hideInfoBars() {
				this.info.showBars = !1
			},
			hideVoiceChat() {
				this.voiceChat.show = !1
			},
			openInfo() {
				this.voiceChat.show = !0, this.radar.show = !0, this.info.show = !0
			},
			showSpeedometerControls() {
				clearTimeout(this.speedometer.controls.timeout), this.speedometer.controls.state = 1, this.speedometer.controls.timeout = setTimeout(() => {
					this.speedometer.controls.state = 2, this.speedometer.controls.timeout = setTimeout(() => {
						this.speedometer.controls.state = 3, this.speedometer.controls.timeout = setTimeout(() => this.speedometer.controls.state = 4, 5e3)
					}, 500)
				}, 250)
			},
			hideSpeedometerControls() {
				clearTimeout(this.speedometer.controls.timeout), this.speedometer.controls.state = 2, this.speedometer.controls.timeout = setTimeout(() => {
					this.speedometer.controls.state = 1, this.speedometer.controls.timeout = setTimeout(() => {
						this.speedometer.controls.state = 0
					}, 250)
				}, 500)
			},
			setCarParamEngine() {
				window.sendClientKeyEvent("Action")
			},
			setCarParamKey() {
				window.sendClientKeyEvent("AnalogUp"), window.sendClientKeyEvent("AnalogLeft"), sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "Speed_OnPlayerToggleKey")
			},
			setCarParamLock() {
				sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnPlayerLockVehicle")
			},
			setCarParamRem() {
				sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnPlayerClientSideKey", window.KEY_CODE_SHIFT)
			},
			setCarParamLights() {
				window.sendClientKeyEvent("Fire")
			},
			showControllers() {
				this.isShowControllers = !0
			},
			hideControllers() {
				this.isShowControllers = !1
			},
			showTime() {
				this.time.show = !0
			},
			hideTime() {
				this.time.show = !1
			},
			updateTime(e) {
				this.time.string = e
			},
			updateHungerLevel(e) {
				this.info.hunger = e
			},
			updateFreeze(e) {
				this.info.freeze = e
			},
			showFreeze() {
				this.info.isShowFreeze = !0
			},
			hideFreeze() {
				this.info.isShowFreeze = !1
			},
			showPersonalTag(e) {
				this.radar.point.show = !0, this.radar.point.distance = e
			},
			hidePersonalTag() {
				this.point.show = !1
			},
			hideGreenZoneTab() {
				this.radar.greenZone = !1
			},
			showGreenZoneTab() {
				this.radar.greenZone = !0
			},
			showFishingZone() {
				this.radar.fishingZone = !0
			},
			hideFishingZone() {
				this.radar.fishingZone = !1
			},
			showGPS(e) {
				this.radar.gps.show = !0, this.radar.gps.distance = e
			},
			hideGPS() {
				this.radar.gps.show = !1
			},
			setMaxSpeed(e) {
				this.speedometer.maxSpeed = e
			},
			setSpeed(e) {
				this.speedometer.speed = this.speedometer.measuring > 0 ? Math.ceil(parseInt(e) * 1.33) : parseInt(e), this.speedometer.speedBar = e / this.speedometer.maxSpeed, this.speedometer.measuring > 0 && (this.speedometer.speed == 0 ? this.speedometer.measuringStartTime = new Date : this.speedometer.measuring <= this.speedometer.speed && this.speedometer.measuringStartTime > 0 && (sendClientEvent(gm.EVENT_EXECUTE_PUBLIC, "OnPlayerSpeedometrMeasuring", new Date - this.speedometer.measuringStartTime), this.speedometer.measuringStartTime = 0))
			},
			showTachometer() {
				this.speedometer.tachometer.show = !0
			},
			hideTachometer() {
				this.speedometer.tachometer.show = !1
			},
			setTachometerData(e, s, t, l) {
				this.speedometer.tachometer = {
					...this.speedometer.tachometer,
					rpm: e,
					maxRpm: s,
					gear: t,
					gearsCount: l
				}
			},
			setMeasuring(e) {
				this.speedometer.measuring = e
			},
			setMileage(e) {
				e = parseInt(e);
				let t = e.toString().length,
					l = "";
				for (let r = 0; r < 6 - t; ++r) l += "0";
				l += e.toString(), this.speedometer.mileage = l
			},
			showSpeedometer(e, s, t) {
				this.speedometer.params.damage = 0, this.speedometer.params.wash = 0, this.speedometer.maxSpeed = s, this.speedometer.isElectro = t, this.updateSpeedometer(e), this.speedometer.show = !0
			},
			updateSpeedometer(e) {
				this.speedometer.params.lights = e[0], this.speedometer.params.temperature = e[1], this.speedometer.params.rem = e[2], this.speedometer.params.doors = e[3], this.setMileage(e[4]), this.speedometer.fuel = Math.floor(e[5]), this.speedometer.maxFuel = e[6], this.speedometer.params.key = e[7], e.length > 8 && (this.speedometer.params.damage = e[8] / 100, this.speedometer.params.wash = e[9] / 100)
			},
			setTurnLightStatus(e, s) {
				let t = e ? "right" : "left",
					l = e ? "left" : "right",
					r = !1;
				this.speedometer.params.turns[l] && s && (this.speedometer.params.turns[l] = !1, r = !0), setTimeout(() => {
					this.speedometer.params.turns[t] = s, r && (this.speedometer.params.turns[l] = !0)
				}, r ? 100 : 0)
			},
			hideSpeedometer() {
				const e = this.speedometer.controls.state;
				e && this.hideSpeedometerControls(), setTimeout(() => {
					this.speedometer.show = !1, this.speedometer.params.turns.left = !1, this.speedometer.params.turns.right = !1
				}, e ? 750 : 0)
			},
			buttonAction(e) {
				let s = this.buttons.keys[e].code;
				s && sendKeyEvent(s), window.sendClientKeyEvent(e)
			},
			setButtonDisplay(e, s) {
				this.buttons.keys[e].show = s
			},
			setKeyButtonsDisplay(e) {
				this.buttons.show = e
			},
			changeVoiceState(e, s) {
				this.$store.commit("voiceChat/setVoiceChat", {
					isActive: s,
					keyCode: e
				})
			},
			startVoiceChatRecord() {
				this.isVoiceActive = !0, sendClientEvent(gm.SET_VOICE_CHAT_STATUS, !0)
			},
			stopVoiceChatRecord() {
				this.isVoiceActive = !1, sendClientEvent(gm.SET_VOICE_CHAT_STATUS, !1)
			},
			toggleAim() {
				this.isAimMode = !this.isAimMode, window.setAimMode(this.isAimMode)
			},
			startTouchPedalStop() {
				this.activeControl.pedal.stop = !0
			},
			stopTouchPedalStop() {
				this.activeControl.pedal.stop = !1
			},
			startTouchPedalGas() {
				this.activeControl.pedal.gas = !0, this.speedometer.controls.state && this.hideSpeedometerControls()
			},
			stopTouchPedalGas() {
				this.activeControl.pedal.gas = !1
			},
			setTime(e) {
				this.time.current = e
			},
			toggleTurn(e) {
				this.setTurnLightStatus(e, !this.speedometer.params.turns[e ? "right" : "left"]), e ? this.buttonAction("Numpad6") : this.buttonAction("Numpad4")
			},
			setChatStatus(e) {
				this.useChat && (this.chatStatus = e)
			},
			formatMileage(e) {
				e = e.toString();
				let t = "";
				if (e.length < 6) {
					for (let l = 0; l < 6 - e.length; ++l) t += "0";
					return t + e
				}
				return e
			},
			formatSpeedmetrNumber(e, s) {
				const t = this.speedometer.numbers,
					l = this.speedometer.speed;
				let r = 0;
				for (const d of t) l >= d && (r = d);
				return l >= e ? "white" : `rgba(255, 255, 255, ${1-.15*(s-t.indexOf(r))})`
			},
			formatSpeed() {
				return this.speedometer.speedBar < 1 ? this.speedometer.speedBar : 1
			},
			calculateHealthPoints() {
				const l = 328 * (1 - this.info.health / 100) + 23,
					r = 322 * (1 - this.info.health / 100) + 23,
					i = 325 * (1 - this.info.health / 100) + 6;
				return `${i>325?325:i},16 ${l>328?328:l},5 328,5 322,28 ${r>322?322:r},28`
			},
			calculateHungerPoints() {
				const s = 296 * (1 - this.info.hunger / 100) + 13,
					t = 296 * (1 - this.info.hunger / 100) + 23;
				return `${s>296?296:s},5 296,5 296,13 ${t>296?296:t},13`
			},
			calculateArmourPoints() {
				const t = 315 * (1 - this.info.armour / 100) + 23,
					l = 310 * (1 - this.info.armour / 100) + 13;
				return `${t>315?315:t},5, 315,5 310,13, ${l>310?310:l},13`
			},
			addVoiceChatEntry(e) {
				if (this.voiceChat.entries.length >= this.maxVoiceChatEntries) return;
				const s = typeof e == "string" ? JSON.parse(e) : e,
					t = {
						type: s[0],
						name: s[1],
						id: s[2],
						isPlaySound: s[3],
						channel: s[4],
						streamId: s[5]
					};
				t.isPlaySound && window.playSound(`voice_chat/${t.type}_start.mp3`, !1, He), this.voiceChat.entries.push(t)
			},
			removeVoiceChatEntry(e) {
				const s = this.voiceChat.entries.find(t => t.isPlaySound && e.some(l => l[0] === t.id && l[1] === t.streamId));
				s && window.playSound(`voice_chat/${s.type}_end.mp3`, !1, He), this.voiceChat.entries = this.voiceChat.entries.filter(t => !e.some(l => l[0] === t.id && l[1] === t.streamId))
			},
			showVoiceChatButton(e) {
				e === P.MIC && this.$store.commit("voiceChat/setChatButtonStatus", !0), e === P.PHONE && this.$store.commit("voiceChat/setRadioButtonStatus", !0), e === P.MEGAPHONE && this.$store.commit("voiceChat/setMegaphoneButtonStatus", !0)
			},
			hideVoiceChatButton(e) {
				e === P.MIC && this.$store.commit("voiceChat/setChatButtonStatus", !1), e === P.PHONE && this.$store.commit("voiceChat/setRadioButtonStatus", !1), e === P.MEGAPHONE && this.$store.commit("voiceChat/setMegaphoneButtonStatus", !1)
			},
			setVoiceChatMuted(e) {
				this.$store.commit("voiceChat/setVoiceChatMuted", e)
			}
		},
		mounted() {
			this.updateRatioScale()
		},
		created() {
			let e = null,
				s = 0,
				t = 0;
			window.addEventListener("touchstart", d => {
				for (let c of d.touches)
					if ((c.target.nativeElement || c.target).matches(".hud-iface")) {
						e = c.identifier, s = c.clientX, t = c.clientY, window.onScreenControlTouchStart("<Mouse>/delta");
						break
					}
			}), window.addEventListener("touchmove", d => {
				if (e != null)
					for (let c of d.touches) {
						if (c.identifier != e) continue;
						let u = (window.App.deviceScreen.width + window.App.deviceScreen.height) / (window.screen.width + window.screen.height),
							S = (c.clientX - s) * u,
							T = (c.clientY - t) * u;
						s = c.clientX, t = c.clientY, window.onScreenControlTouchMove("<Mouse>/delta", S, -T);
						break
					}
			}), window.addEventListener("touchend", d => {
				if (e != null) {
					for (let c of d.touches)
						if (c.identifier == e) {
							e = null, window.onScreenControlTouchEnd("<Mouse>/delta");
							break
						}
				}
			});
			let l = {};
			const r = d => {
					(d.target.nativeElement || d.target).matches(".hud-iface") && (l = {
						screenX: d.screenX,
						screenY: d.screenY,
						time: Date.now()
					})
				},
				i = d => {
					if (!l.time) return;
					if (Date.now() - l.time > 200) {
						l = {};
						return
					}
					Math.hypot(l.screenX - d.screenX, l.screenY - d.screenY) > 20 || onScreenTap({
						x: l.screenX / window.innerWidth,
						y: 1 - l.screenY / window.innerHeight
					})
				};
			window.addEventListener("mousedown", d => {
				d.button === 0 && r({
					target: d.target,
					screenX: d.screenX,
					screenY: d.screenY
				})
			}), window.addEventListener("mouseup", d => {
				d.button === 0 && i({
					screenX: d.screenX,
					screenY: d.screenY
				})
			}), window.addEventListener("touchstart", d => {
				if (d.touches.length !== 1) return;
				const c = d.touches[0];
				r({
					target: d.target,
					screenX: c.screenX,
					screenY: c.screenY
				})
			}), window.addEventListener("touchend", d => {
				if (d.touches.length !== 1) return;
				const c = d.touches[0];
				i({
					screenX: c.screenX,
					screenY: c.screenY
				})
			}), window.addEventListener("keydown", ({
				keyCode: d
			}) => {
				this.engine === "legacy" && this.chatStatus && d === window.KEY_CODE_F5 && this.setChatStatus(!1)
			}), window.addEventListener("keyup", ({
				keyCode: d
			}) => {
				this.engine === "legacy" && !this.chatStatus && d === window.KEY_CODE_F5 && this.setChatStatus(!0)
			})
		}
	},
	M_ = {
		class: "hud-iface"
	},
	k_ = {
		key: 0,
		class: "hud-aim__sniper"
	},
	I_ = {
		key: 0,
		class: "hud-aim"
	};

function O_(e, s, t, l, r, i) {
	const d = f("HassleSniperAim"),
		c = f("HudRadmir"),
		u = f("HudHassle"),
		S = f("RadmirChat"),
		T = f("chat");
	return n(), o("div", M_, [h(E, {
		name: "aim"
	}, {
		default: C(() => [r.aim.show && r.aim.isSniper && i.engine === "legacy" ? (n(), o("div", k_)) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "aim"
	}, {
		default: C(() => [r.aim.show && r.aim.isSniper && i.engine !== "legacy" ? (n(), y(d, {
			key: 0
		})) : _("", !0)]),
		_: 1
	}), h(E, {
		name: "aim"
	}, {
		default: C(() => [r.aim.show && !r.aim.isSniper ? (n(), o("div", I_, [a("div", {
			class: "hud-aim__container",
			style: m({
				transitionDuration: `${r.aim.duration}ms`,
				width: `${48*r.aim.dispersion}px`,
				height: `${48*r.aim.dispersion}px`
			})
		}, [(n(), o(b, null, M(4, (v, O) => a("div", {
			class: "hud-aim__arrow",
			key: O
		})), 64))], 4)])) : _("", !0)]),
		_: 1
	}), i.isHassleHud ? (n(), y(u, {
		key: 1,
		data: e.$data,
		scale: i.scale,
		ratioScale: r.ratioScale,
		useInvisibleJoystick: r.useInvisibleJoystick,
		isSquareMobile: i.isSquareMobile,
		ref: "hassle",
		onStartTouchPedalStop: i.startTouchPedalStop,
		onStopTouchPedalStop: i.stopTouchPedalStop,
		onStartTouchPedalGas: i.startTouchPedalGas,
		onStopTouchPedalGas: i.stopTouchPedalGas,
		onSetCarParamEngine: i.setCarParamEngine,
		onSetCarParamKey: i.setCarParamKey,
		onSetCarParamLock: i.setCarParamLock,
		onSetCarParamRem: i.setCarParamRem,
		onSetCarParamLights: i.setCarParamLights,
		onOnTrySeatCar: i.onTrySeatCar,
		onToggleAim: i.toggleAim
	}, null, 8, ["data", "scale", "ratioScale", "useInvisibleJoystick", "isSquareMobile", "onStartTouchPedalStop", "onStopTouchPedalStop", "onStartTouchPedalGas", "onStopTouchPedalGas", "onSetCarParamEngine", "onSetCarParamKey", "onSetCarParamLock", "onSetCarParamRem", "onSetCarParamLights", "onOnTrySeatCar", "onToggleAim"])) : (n(), y(c, {
		key: 0,
		data: e.$data,
		scale: i.scale,
		ref: "radmir"
	}, null, 8, ["data", "scale"])), i.isHassleHud ? (n(), o(b, {
		key: 3
	}, [r.useChat ? (n(), y(T, {
		key: 0,
		class: w({
			"hassle-chat_hidden": !r.chatStatus
		}),
		ref: "chat",
		chatStatus: r.chatStatus,
		ratioScale: r.ratioScale,
		"onHelp:open": s[2] || (s[2] = v => r.isOpenedHelp = !r.isOpenedHelp)
	}, null, 8, ["class", "chatStatus", "ratioScale"])) : _("", !0)], 64)) : (n(), o(b, {
		key: 2
	}, [r.useChat ? (n(), y(S, {
		key: 0,
		ref: "chat",
		isHudControls: r.isHudControls,
		chatStatus: r.chatStatus,
		canChatFadeout: r.canChatFadeout,
		useChatAnimation: r.useChatAnimation,
		"onHelp:open": s[0] || (s[0] = v => r.isOpenedHelp = !r.isOpenedHelp),
		onOpenChat: s[1] || (s[1] = v => i.changeVoiceState(i.voiceKeyCode, !1))
	}, null, 8, ["isHudControls", "chatStatus", "canChatFadeout", "useChatAnimation"])) : _("", !0)], 64))])
}
const z_ = g(T_, [
	["render", O_],
	["__scopeId", "data-v-e3b593fd"]
]);
export {
	z_ as
	default
};
