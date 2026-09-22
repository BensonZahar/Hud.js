import{o as n,c as r,a as i,e as s,t as a,n as l,f as c,T as u,w as m,h as p}from"./index.js";

const g="data-v-3fa3a455",
v=i("div",{class:"taxi-event-notice__icon taxi-timer-label",[g]:"",innerHTML:"<span class=\"taxi-timer-label__top\">KONST</span><span class=\"taxi-timer-label__bot\">AHK</span>"},null,-1),
C=i("div",{class:"taxi-event-notice__wrapper-image",[g]:""},null,-1);

/* ─── Управление обводкой радара ─────────────────────────────────────────────
   variant 0 = danger (красный)
   variant 1 = activity (жёлтый)
   variant 2 = police (мигалки синий/красный — JS-стробоскоп на радаре,
               CSS-анимация на виджете)                                       */
let _policeTimer = null;

function _setRadarBorder(show, variant) {
  if (_policeTimer) { clearInterval(_policeTimer); _policeTimer = null; }
  try {
    const hud = window.interface("Hud");
    const tx  = hud?.radar?.taxiEvent;
    if (!tx) return;
    clearTimeout(tx.timerId);
    tx.timerId = null;
    if (!show) { tx.show = false; return; }

    if (variant === 2) {
      /* Полицейский режим: чередуем variant 0 (красный) и 1 (жёлтый) каждые
         275 мс — на радаре получается быстрый двухцветный пульс.             */
      tx.variant = 0; tx.show = true; tx.triggeredAt = Date.now();
      let _tick = 0;
      _policeTimer = setInterval(() => {
        try {
          const h = window.interface("Hud");
          const t = h?.radar?.taxiEvent;
          if (!t || !t.show) return;
          _tick++;
          t.variant = _tick % 2;
          t.triggeredAt = Date.now();
        } catch(e) {}
      }, 275);
    } else {
      tx.variant = (variant === 0) ? 0 : 1;
      tx.show = true;
      tx.triggeredAt = Date.now();
    }
  } catch(e) {}
}

const y = {
  name: "TimerK",
  props: { openParams: { default: null } },
  data: () => ({ visible: !1, remaining: 0, text: "Время подачи", variant: 1, timerId: null }),
  computed: {
    formatted() {
      const e = Math.max(0, this.remaining), t = Math.floor(e / 60), o = e % 60;
      return `${String(t).padStart(2, "0")}:${String(o).padStart(2, "0")}`;
    }
  },
  watch: {
    openParams: {
      immediate: !0,
      handler(e) {
        if (Array.isArray(e))          this.start(e[0], e[1], e[2]);
        else if (e && typeof e == "object") this.start(e.duration, e.text, e.variant);
      }
    }
  },
  beforeUnmount() { this.clear(); },
  methods: {
    /* variant 0 = красный (danger), 1 = жёлтый (activity), 2 = мигалки */
    start(e = 254, t = "Время подачи", o = 1) {
      this.clear();
      this.remaining = Math.max(0, parseInt(e) || 0);
      this.text      = t || "Время подачи";
      this.variant   = (o === 0) ? 0 : (o === 2) ? 2 : 1;
      this.visible   = !0;
      _setRadarBorder(true, this.variant);
      this.timerId = setInterval(() => {
        this.remaining -= 1;
        this.remaining <= 0 && this.finish();
      }, 1e3);
    },
    finish() {
      this.clear();
      this.visible = !1;
      this.$emit("finish");
      _setRadarBorder(false);
    },
    stop() {
      this.clear();
      this.visible = !1;
      _setRadarBorder(false);
    },
    clear() { this.timerId && (clearInterval(this.timerId), this.timerId = null); }
  },
  render() {
    return (n(), p(u, { name: "taxi-event-notice", appear: !0 }, {
      default: m(() => [
        this.visible
          ? (n(), r("div", {
              class: l(["taxi-event-notice", `taxi-event-notice--${this.variant}`, "taxi-timer-root"]),
              [g]: ""
            }, [
              v,
              (n(), r("div", { class: "taxi-event-notice__wrapper", [g]: "" }, [
                C,
                (n(), r("div", { class: "taxi-event-notice__wrapper-data", [g]: "" }, [
                  (n(), r("div", { class: "taxi-event-notice__wrapper-time", [g]: "" }, [s(a(this.formatted), 1)])),
                  (n(), r("div", { class: "taxi-event-notice__wrapper-text", [g]: "" }, [s(a(this.text), 1)]))
                ]))
              ]))
            ], 2))
          : c("", !0)
      ]),
      _: 1
    }));
  }
};
export { y as default };
