(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function o(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=o(r);fetch(r.href,i)}})();const Oa="modulepreload",Sa=function(e,t){return new URL(e,t).href},Rr={},d=function(t,o,n){if(!o||o.length===0)return t();const r=document.getElementsByTagName("link");return Promise.all(o.map(i=>{if(i=Sa(i,n),i in Rr)return;Rr[i]=!0;const s=i.endsWith(".css"),l=s?'[rel="stylesheet"]':"";if(!!n)for(let c=r.length-1;c>=0;c--){const h=r[c];if(h.href===i&&(!s||h.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${i}"]${l}`))return;const u=document.createElement("link");if(u.rel=s?"stylesheet":Oa,s||(u.as="script",u.crossOrigin=""),u.href=i,document.head.appendChild(u),s)return new Promise((c,h)=>{u.addEventListener("load",c),u.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${i}`)))})})).then(()=>t()).catch(i=>{const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=i,window.dispatchEvent(s),!s.defaultPrevented)throw i})},ba=(e,t)=>{const o=e[t];return o?typeof o=="function"?o():Promise.resolve(o):new Promise((n,r)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(r.bind(null,new Error("Unknown variable dynamic import: "+t)))})};function zn(e,t){const o=Object.create(null),n=e.split(",");for(let r=0;r<n.length;r++)o[n[r]]=!0;return t?r=>!!o[r.toLowerCase()]:r=>!!o[r]}const ee={},Pt=[],Ne=()=>{},Aa=()=>!1,Ia=/^on[^a-z]/,tn=e=>Ia.test(e),qn=e=>e.startsWith("onUpdate:"),se=Object.assign,Xn=(e,t)=>{const o=e.indexOf(t);o>-1&&e.splice(o,1)},Da=Object.prototype.hasOwnProperty,j=(e,t)=>Da.call(e,t),L=Array.isArray,Rt=e=>_o(e)==="[object Map]",Bt=e=>_o(e)==="[object Set]",Lr=e=>_o(e)==="[object Date]",F=e=>typeof e=="function",re=e=>typeof e=="string",ao=e=>typeof e=="symbol",q=e=>e!==null&&typeof e=="object",Ri=e=>q(e)&&F(e.then)&&F(e.catch),Li=Object.prototype.toString,_o=e=>Li.call(e),Pa=e=>_o(e).slice(8,-1),Mi=e=>_o(e)==="[object Object]",Jn=e=>re(e)&&e!=="NaN"&&e[0]!=="-"&&""+parseInt(e,10)===e,Mo=zn(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),on=e=>{const t=Object.create(null);return o=>t[o]||(t[o]=e(o))},Ra=/-(\w)/g,Ye=on(e=>e.replace(Ra,(t,o)=>o?o.toUpperCase():"")),La=/\B([A-Z])/g,Ct=on(e=>e.replace(La,"-$1").toLowerCase()),nn=on(e=>e.charAt(0).toUpperCase()+e.slice(1)),En=on(e=>e?`on${nn(e)}`:""),lo=(e,t)=>!Object.is(e,t),Vo=(e,t)=>{for(let o=0;o<e.length;o++)e[o](t)},Yo=(e,t,o)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,value:o})},$o=e=>{const t=parseFloat(e);return isNaN(t)?e:t},Ma=e=>{const t=re(e)?Number(e):NaN;return isNaN(t)?e:t};let Mr;const Rn=()=>Mr||(Mr=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function mo(e){if(L(e)){const t={};for(let o=0;o<e.length;o++){const n=e[o],r=re(n)?xa(n):mo(n);if(r)for(const i in r)t[i]=r[i]}return t}else{if(re(e))return e;if(q(e))return e}}const Va=/;(?![^(]*\))/g,Ha=/:([^]+)/,Na=/\/\*[^]*?\*\//g;function xa(e){const t={};return e.replace(Na,"").split(Va).forEach(o=>{if(o){const n=o.split(Ha);n.length>1&&(t[n[0].trim()]=n[1].trim())}}),t}function tt(e){let t="";if(re(e))t=e;else if(L(e))for(let o=0;o<e.length;o++){const n=tt(e[o]);n&&(t+=n+" ")}else if(q(e))for(const o in e)e[o]&&(t+=o+" ");return t.trim()}const Ka="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Fa=zn(Ka);function Vi(e){return!!e||e===""}function Ba(e,t){if(e.length!==t.length)return!1;let o=!0;for(let n=0;o&&n<e.length;n++)o=vt(e[n],t[n]);return o}function vt(e,t){if(e===t)return!0;let o=Lr(e),n=Lr(t);if(o||n)return o&&n?e.getTime()===t.getTime():!1;if(o=ao(e),n=ao(t),o||n)return e===t;if(o=L(e),n=L(t),o||n)return o&&n?Ba(e,t):!1;if(o=q(e),n=q(t),o||n){if(!o||!n)return!1;const r=Object.keys(e).length,i=Object.keys(t).length;if(r!==i)return!1;for(const s in e){const l=e.hasOwnProperty(s),a=t.hasOwnProperty(s);if(l&&!a||!l&&a||!vt(e[s],t[s]))return!1}}return String(e)===String(t)}function Qn(e,t){return e.findIndex(o=>vt(o,t))}const Ua=e=>re(e)?e:e==null?"":L(e)||q(e)&&(e.toString===Li||!F(e.toString))?JSON.stringify(e,Hi,2):String(e),Hi=(e,t)=>t&&t.__v_isRef?Hi(e,t.value):Rt(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((o,[n,r])=>(o[`${n} =>`]=r,o),{})}:Bt(t)?{[`Set(${t.size})`]:[...t.values()]}:q(t)&&!L(t)&&!Mi(t)?String(t):t;let Le;class Ni{constructor(t=!1){this.detached=t,this._active=!0,this.effects=[],this.cleanups=[],this.parent=Le,!t&&Le&&(this.index=(Le.scopes||(Le.scopes=[])).push(this)-1)}get active(){return this._active}run(t){if(this._active){const o=Le;try{return Le=this,t()}finally{Le=o}}}on(){Le=this}off(){Le=this.parent}stop(t){if(this._active){let o,n;for(o=0,n=this.effects.length;o<n;o++)this.effects[o].stop();for(o=0,n=this.cleanups.length;o<n;o++)this.cleanups[o]();if(this.scopes)for(o=0,n=this.scopes.length;o<n;o++)this.scopes[o].stop(!0);if(!this.detached&&this.parent&&!t){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0,this._active=!1}}}function ka(e){return new Ni(e)}function Ya(e,t=Le){t&&t.active&&t.effects.push(e)}function $a(){return Le}const Zn=e=>{const t=new Set(e);return t.w=0,t.n=0,t},xi=e=>(e.w&rt)>0,Ki=e=>(e.n&rt)>0,ja=({deps:e})=>{if(e.length)for(let t=0;t<e.length;t++)e[t].w|=rt},Wa=e=>{const{deps:t}=e;if(t.length){let o=0;for(let n=0;n<t.length;n++){const r=t[n];xi(r)&&!Ki(r)?r.delete(e):t[o++]=r,r.w&=~rt,r.n&=~rt}t.length=o}},jo=new WeakMap;let zt=0,rt=1;const Ln=30;let Ve;const gt=Symbol(""),Mn=Symbol("");class er{constructor(t,o=null,n){this.fn=t,this.scheduler=o,this.active=!0,this.deps=[],this.parent=void 0,Ya(this,n)}run(){if(!this.active)return this.fn();let t=Ve,o=ot;for(;t;){if(t===this)return;t=t.parent}try{return this.parent=Ve,Ve=this,ot=!0,rt=1<<++zt,zt<=Ln?ja(this):Vr(this),this.fn()}finally{zt<=Ln&&Wa(this),rt=1<<--zt,Ve=this.parent,ot=o,this.parent=void 0,this.deferStop&&this.stop()}}stop(){Ve===this?this.deferStop=!0:this.active&&(Vr(this),this.onStop&&this.onStop(),this.active=!1)}}function Vr(e){const{deps:t}=e;if(t.length){for(let o=0;o<t.length;o++)t[o].delete(e);t.length=0}}let ot=!0;const Fi=[];function Ut(){Fi.push(ot),ot=!1}function kt(){const e=Fi.pop();ot=e===void 0?!0:e}function ye(e,t,o){if(ot&&Ve){let n=jo.get(e);n||jo.set(e,n=new Map);let r=n.get(o);r||n.set(o,r=Zn()),Bi(r)}}function Bi(e,t){let o=!1;zt<=Ln?Ki(e)||(e.n|=rt,o=!xi(e)):o=!e.has(Ve),o&&(e.add(Ve),Ve.deps.push(e))}function qe(e,t,o,n,r,i){const s=jo.get(e);if(!s)return;let l=[];if(t==="clear")l=[...s.values()];else if(o==="length"&&L(e)){const a=Number(n);s.forEach((u,c)=>{(c==="length"||c>=a)&&l.push(u)})}else switch(o!==void 0&&l.push(s.get(o)),t){case"add":L(e)?Jn(o)&&l.push(s.get("length")):(l.push(s.get(gt)),Rt(e)&&l.push(s.get(Mn)));break;case"delete":L(e)||(l.push(s.get(gt)),Rt(e)&&l.push(s.get(Mn)));break;case"set":Rt(e)&&l.push(s.get(gt));break}if(l.length===1)l[0]&&Vn(l[0]);else{const a=[];for(const u of l)u&&a.push(...u);Vn(Zn(a))}}function Vn(e,t){const o=L(e)?e:[...e];for(const n of o)n.computed&&Hr(n);for(const n of o)n.computed||Hr(n)}function Hr(e,t){(e!==Ve||e.allowRecurse)&&(e.scheduler?e.scheduler():e.run())}function Ga(e,t){var o;return(o=jo.get(e))==null?void 0:o.get(t)}const za=zn("__proto__,__v_isRef,__isVue"),Ui=new Set(Object.getOwnPropertyNames(Symbol).filter(e=>e!=="arguments"&&e!=="caller").map(e=>Symbol[e]).filter(ao)),qa=tr(),Xa=tr(!1,!0),Ja=tr(!0),Nr=Qa();function Qa(){const e={};return["includes","indexOf","lastIndexOf"].forEach(t=>{e[t]=function(...o){const n=$(this);for(let i=0,s=this.length;i<s;i++)ye(n,"get",i+"");const r=n[t](...o);return r===-1||r===!1?n[t](...o.map($)):r}}),["push","pop","shift","unshift","splice"].forEach(t=>{e[t]=function(...o){Ut();const n=$(this)[t].apply(this,o);return kt(),n}}),e}function Za(e){const t=$(this);return ye(t,"has",e),t.hasOwnProperty(e)}function tr(e=!1,t=!1){return function(n,r,i){if(r==="__v_isReactive")return!e;if(r==="__v_isReadonly")return e;if(r==="__v_isShallow")return t;if(r==="__v_raw"&&i===(e?t?wl:Wi:t?ji:$i).get(n))return n;const s=L(n);if(!e){if(s&&j(Nr,r))return Reflect.get(Nr,r,i);if(r==="hasOwnProperty")return Za}const l=Reflect.get(n,r,i);return(ao(r)?Ui.has(r):za(r))||(e||ye(n,"get",r),t)?l:fe(l)?s&&Jn(r)?l:l.value:q(l)?e?Gi(l):sn(l):l}}const el=ki(),tl=ki(!0);function ki(e=!1){return function(o,n,r,i){let s=o[n];if(Nt(s)&&fe(s)&&!fe(r))return!1;if(!e&&(!Wo(r)&&!Nt(r)&&(s=$(s),r=$(r)),!L(o)&&fe(s)&&!fe(r)))return s.value=r,!0;const l=L(o)&&Jn(n)?Number(n)<o.length:j(o,n),a=Reflect.set(o,n,r,i);return o===$(i)&&(l?lo(r,s)&&qe(o,"set",n,r):qe(o,"add",n,r)),a}}function ol(e,t){const o=j(e,t);e[t];const n=Reflect.deleteProperty(e,t);return n&&o&&qe(e,"delete",t,void 0),n}function nl(e,t){const o=Reflect.has(e,t);return(!ao(t)||!Ui.has(t))&&ye(e,"has",t),o}function rl(e){return ye(e,"iterate",L(e)?"length":gt),Reflect.ownKeys(e)}const Yi={get:qa,set:el,deleteProperty:ol,has:nl,ownKeys:rl},il={get:Ja,set(e,t){return!0},deleteProperty(e,t){return!0}},sl=se({},Yi,{get:Xa,set:tl}),or=e=>e,rn=e=>Reflect.getPrototypeOf(e);function yo(e,t,o=!1,n=!1){e=e.__v_raw;const r=$(e),i=$(t);o||(t!==i&&ye(r,"get",t),ye(r,"get",i));const{has:s}=rn(r),l=n?or:o?ir:uo;if(s.call(r,t))return l(e.get(t));if(s.call(r,i))return l(e.get(i));e!==r&&e.get(t)}function To(e,t=!1){const o=this.__v_raw,n=$(o),r=$(e);return t||(e!==r&&ye(n,"has",e),ye(n,"has",r)),e===r?o.has(e):o.has(e)||o.has(r)}function Oo(e,t=!1){return e=e.__v_raw,!t&&ye($(e),"iterate",gt),Reflect.get(e,"size",e)}function xr(e){e=$(e);const t=$(this);return rn(t).has.call(t,e)||(t.add(e),qe(t,"add",e,e)),this}function Kr(e,t){t=$(t);const o=$(this),{has:n,get:r}=rn(o);let i=n.call(o,e);i||(e=$(e),i=n.call(o,e));const s=r.call(o,e);return o.set(e,t),i?lo(t,s)&&qe(o,"set",e,t):qe(o,"add",e,t),this}function Fr(e){const t=$(this),{has:o,get:n}=rn(t);let r=o.call(t,e);r||(e=$(e),r=o.call(t,e)),n&&n.call(t,e);const i=t.delete(e);return r&&qe(t,"delete",e,void 0),i}function Br(){const e=$(this),t=e.size!==0,o=e.clear();return t&&qe(e,"clear",void 0,void 0),o}function So(e,t){return function(n,r){const i=this,s=i.__v_raw,l=$(s),a=t?or:e?ir:uo;return!e&&ye(l,"iterate",gt),s.forEach((u,c)=>n.call(r,a(u),a(c),i))}}function bo(e,t,o){return function(...n){const r=this.__v_raw,i=$(r),s=Rt(i),l=e==="entries"||e===Symbol.iterator&&s,a=e==="keys"&&s,u=r[e](...n),c=o?or:t?ir:uo;return!t&&ye(i,"iterate",a?Mn:gt),{next(){const{value:h,done:_}=u.next();return _?{value:h,done:_}:{value:l?[c(h[0]),c(h[1])]:c(h),done:_}},[Symbol.iterator](){return this}}}}function Je(e){return function(...t){return e==="delete"?!1:this}}function al(){const e={get(i){return yo(this,i)},get size(){return Oo(this)},has:To,add:xr,set:Kr,delete:Fr,clear:Br,forEach:So(!1,!1)},t={get(i){return yo(this,i,!1,!0)},get size(){return Oo(this)},has:To,add:xr,set:Kr,delete:Fr,clear:Br,forEach:So(!1,!0)},o={get(i){return yo(this,i,!0)},get size(){return Oo(this,!0)},has(i){return To.call(this,i,!0)},add:Je("add"),set:Je("set"),delete:Je("delete"),clear:Je("clear"),forEach:So(!0,!1)},n={get(i){return yo(this,i,!0,!0)},get size(){return Oo(this,!0)},has(i){return To.call(this,i,!0)},add:Je("add"),set:Je("set"),delete:Je("delete"),clear:Je("clear"),forEach:So(!0,!0)};return["keys","values","entries",Symbol.iterator].forEach(i=>{e[i]=bo(i,!1,!1),o[i]=bo(i,!0,!1),t[i]=bo(i,!1,!0),n[i]=bo(i,!0,!0)}),[e,o,t,n]}const[ll,ul,cl,dl]=al();function nr(e,t){const o=t?e?dl:cl:e?ul:ll;return(n,r,i)=>r==="__v_isReactive"?!e:r==="__v_isReadonly"?e:r==="__v_raw"?n:Reflect.get(j(o,r)&&r in n?o:n,r,i)}const fl={get:nr(!1,!1)},pl={get:nr(!1,!0)},hl={get:nr(!0,!1)},$i=new WeakMap,ji=new WeakMap,Wi=new WeakMap,wl=new WeakMap;function _l(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function ml(e){return e.__v_skip||!Object.isExtensible(e)?0:_l(Pa(e))}function sn(e){return Nt(e)?e:rr(e,!1,Yi,fl,$i)}function gl(e){return rr(e,!1,sl,pl,ji)}function Gi(e){return rr(e,!0,il,hl,Wi)}function rr(e,t,o,n,r){if(!q(e)||e.__v_raw&&!(t&&e.__v_isReactive))return e;const i=r.get(e);if(i)return i;const s=ml(e);if(s===0)return e;const l=new Proxy(e,s===2?n:o);return r.set(e,l),l}function Lt(e){return Nt(e)?Lt(e.__v_raw):!!(e&&e.__v_isReactive)}function Nt(e){return!!(e&&e.__v_isReadonly)}function Wo(e){return!!(e&&e.__v_isShallow)}function zi(e){return Lt(e)||Nt(e)}function $(e){const t=e&&e.__v_raw;return t?$(t):e}function qi(e){return Yo(e,"__v_skip",!0),e}const uo=e=>q(e)?sn(e):e,ir=e=>q(e)?Gi(e):e;function Xi(e){ot&&Ve&&(e=$(e),Bi(e.dep||(e.dep=Zn())))}function Ji(e,t){e=$(e);const o=e.dep;o&&Vn(o)}function fe(e){return!!(e&&e.__v_isRef===!0)}function Ho(e){return Qi(e,!1)}function bf(e){return Qi(e,!0)}function Qi(e,t){return fe(e)?e:new El(e,t)}class El{constructor(t,o){this.__v_isShallow=o,this.dep=void 0,this.__v_isRef=!0,this._rawValue=o?t:$(t),this._value=o?t:uo(t)}get value(){return Xi(this),this._value}set value(t){const o=this.__v_isShallow||Wo(t)||Nt(t);t=o?t:$(t),lo(t,this._rawValue)&&(this._rawValue=t,this._value=o?t:uo(t),Ji(this))}}function vl(e){return fe(e)?e.value:e}const Cl={get:(e,t,o)=>vl(Reflect.get(e,t,o)),set:(e,t,o,n)=>{const r=e[t];return fe(r)&&!fe(o)?(r.value=o,!0):Reflect.set(e,t,o,n)}};function Zi(e){return Lt(e)?e:new Proxy(e,Cl)}function Af(e){const t=L(e)?new Array(e.length):{};for(const o in e)t[o]=es(e,o);return t}class yl{constructor(t,o,n){this._object=t,this._key=o,this._defaultValue=n,this.__v_isRef=!0}get value(){const t=this._object[this._key];return t===void 0?this._defaultValue:t}set value(t){this._object[this._key]=t}get dep(){return Ga($(this._object),this._key)}}class Tl{constructor(t){this._getter=t,this.__v_isRef=!0,this.__v_isReadonly=!0}get value(){return this._getter()}}function If(e,t,o){return fe(e)?e:F(e)?new Tl(e):q(e)&&arguments.length>1?es(e,t,o):Ho(e)}function es(e,t,o){const n=e[t];return fe(n)?n:new yl(e,t,o)}class Ol{constructor(t,o,n,r){this._setter=o,this.dep=void 0,this.__v_isRef=!0,this.__v_isReadonly=!1,this._dirty=!0,this.effect=new er(t,()=>{this._dirty||(this._dirty=!0,Ji(this))}),this.effect.computed=this,this.effect.active=this._cacheable=!r,this.__v_isReadonly=n}get value(){const t=$(this);return Xi(t),(t._dirty||!t._cacheable)&&(t._dirty=!1,t._value=t.effect.run()),t._value}set value(t){this._setter(t)}}function Sl(e,t,o=!1){let n,r;const i=F(e);return i?(n=e,r=Ne):(n=e.get,r=e.set),new Ol(n,r,i||!r,o)}function nt(e,t,o,n){let r;try{r=n?e(...n):e()}catch(i){go(i,t,o)}return r}function De(e,t,o,n){if(F(e)){const i=nt(e,t,o,n);return i&&Ri(i)&&i.catch(s=>{go(s,t,o)}),i}const r=[];for(let i=0;i<e.length;i++)r.push(De(e[i],t,o,n));return r}function go(e,t,o,n=!0){const r=t?t.vnode:null;if(t){let i=t.parent;const s=t.proxy,l=o;for(;i;){const u=i.ec;if(u){for(let c=0;c<u.length;c++)if(u[c](e,s,l)===!1)return}i=i.parent}const a=t.appContext.config.errorHandler;if(a){nt(a,null,10,[e,s,l]);return}}bl(e,o,r,n)}function bl(e,t,o,n=!0){console.error(e)}let co=!1,Hn=!1;const ge=[];let ke=0;const Mt=[];let We=null,pt=0;const ts=Promise.resolve();let sr=null;function Al(e){const t=sr||ts;return e?t.then(this?e.bind(this):e):t}function Il(e){let t=ke+1,o=ge.length;for(;t<o;){const n=t+o>>>1;fo(ge[n])<e?t=n+1:o=n}return t}function an(e){(!ge.length||!ge.includes(e,co&&e.allowRecurse?ke+1:ke))&&(e.id==null?ge.push(e):ge.splice(Il(e.id),0,e),os())}function os(){!co&&!Hn&&(Hn=!0,sr=ts.then(rs))}function Dl(e){const t=ge.indexOf(e);t>ke&&ge.splice(t,1)}function Pl(e){L(e)?Mt.push(...e):(!We||!We.includes(e,e.allowRecurse?pt+1:pt))&&Mt.push(e),os()}function Ur(e,t=co?ke+1:0){for(;t<ge.length;t++){const o=ge[t];o&&o.pre&&(ge.splice(t,1),t--,o())}}function ns(e){if(Mt.length){const t=[...new Set(Mt)];if(Mt.length=0,We){We.push(...t);return}for(We=t,We.sort((o,n)=>fo(o)-fo(n)),pt=0;pt<We.length;pt++)We[pt]();We=null,pt=0}}const fo=e=>e.id==null?1/0:e.id,Rl=(e,t)=>{const o=fo(e)-fo(t);if(o===0){if(e.pre&&!t.pre)return-1;if(t.pre&&!e.pre)return 1}return o};function rs(e){Hn=!1,co=!0,ge.sort(Rl);const t=Ne;try{for(ke=0;ke<ge.length;ke++){const o=ge[ke];o&&o.active!==!1&&nt(o,null,14)}}finally{ke=0,ge.length=0,ns(),co=!1,sr=null,(ge.length||Mt.length)&&rs()}}function Ll(e,t,...o){if(e.isUnmounted)return;const n=e.vnode.props||ee;let r=o;const i=t.startsWith("update:"),s=i&&t.slice(7);if(s&&s in n){const c=`${s==="modelValue"?"model":s}Modifiers`,{number:h,trim:_}=n[c]||ee;_&&(r=o.map(v=>re(v)?v.trim():v)),h&&(r=o.map($o))}let l,a=n[l=En(t)]||n[l=En(Ye(t))];!a&&i&&(a=n[l=En(Ct(t))]),a&&De(a,e,6,r);const u=n[l+"Once"];if(u){if(!e.emitted)e.emitted={};else if(e.emitted[l])return;e.emitted[l]=!0,De(u,e,6,r)}}function is(e,t,o=!1){const n=t.emitsCache,r=n.get(e);if(r!==void 0)return r;const i=e.emits;let s={},l=!1;if(!F(e)){const a=u=>{const c=is(u,t,!0);c&&(l=!0,se(s,c))};!o&&t.mixins.length&&t.mixins.forEach(a),e.extends&&a(e.extends),e.mixins&&e.mixins.forEach(a)}return!i&&!l?(q(e)&&n.set(e,null),null):(L(i)?i.forEach(a=>s[a]=null):se(s,i),q(e)&&n.set(e,s),s)}function ln(e,t){return!e||!tn(t)?!1:(t=t.slice(2).replace(/Once$/,""),j(e,t[0].toLowerCase()+t.slice(1))||j(e,Ct(t))||j(e,t))}let _e=null,un=null;function Go(e){const t=_e;return _e=e,un=e&&e.type.__scopeId||null,t}function Df(e){un=e}function Pf(){un=null}function No(e,t=_e,o){if(!t||e._n)return e;const n=(...r)=>{n._d&&ti(-1);const i=Go(t);let s;try{s=e(...r)}finally{Go(i),n._d&&ti(1)}return s};return n._n=!0,n._c=!0,n._d=!0,n}function vn(e){const{type:t,vnode:o,proxy:n,withProxy:r,props:i,propsOptions:[s],slots:l,attrs:a,emit:u,render:c,renderCache:h,data:_,setupState:v,ctx:b,inheritAttrs:m}=e;let g,P;const M=Go(e);try{if(o.shapeFlag&4){const D=r||n;g=Ue(c.call(D,D,h,i,v,_,b)),P=a}else{const D=t;g=Ue(D.length>1?D(i,{attrs:a,slots:l,emit:u}):D(i,null)),P=t.props?a:Ml(a)}}catch(D){oo.length=0,go(D,e,1),g=Z(Pe)}let B=g;if(P&&m!==!1){const D=Object.keys(P),{shapeFlag:U}=B;D.length&&U&7&&(s&&D.some(qn)&&(P=Vl(P,s)),B=st(B,P))}return o.dirs&&(B=st(B),B.dirs=B.dirs?B.dirs.concat(o.dirs):o.dirs),o.transition&&(B.transition=o.transition),g=B,Go(M),g}const Ml=e=>{let t;for(const o in e)(o==="class"||o==="style"||tn(o))&&((t||(t={}))[o]=e[o]);return t},Vl=(e,t)=>{const o={};for(const n in e)(!qn(n)||!(n.slice(9)in t))&&(o[n]=e[n]);return o};function Hl(e,t,o){const{props:n,children:r,component:i}=e,{props:s,children:l,patchFlag:a}=t,u=i.emitsOptions;if(t.dirs||t.transition)return!0;if(o&&a>=0){if(a&1024)return!0;if(a&16)return n?kr(n,s,u):!!s;if(a&8){const c=t.dynamicProps;for(let h=0;h<c.length;h++){const _=c[h];if(s[_]!==n[_]&&!ln(u,_))return!0}}}else return(r||l)&&(!l||!l.$stable)?!0:n===s?!1:n?s?kr(n,s,u):!0:!!s;return!1}function kr(e,t,o){const n=Object.keys(t);if(n.length!==Object.keys(e).length)return!0;for(let r=0;r<n.length;r++){const i=n[r];if(t[i]!==e[i]&&!ln(o,i))return!0}return!1}function Nl({vnode:e,parent:t},o){for(;t&&t.subTree===e;)(e=t.vnode).el=o,t=t.parent}const xl=e=>e.__isSuspense;function Kl(e,t){t&&t.pendingBranch?L(e)?t.effects.push(...e):t.effects.push(e):Pl(e)}function Fl(e,t){return ar(e,null,{flush:"post"})}const Ao={};function Jt(e,t,o){return ar(e,t,o)}function ar(e,t,{immediate:o,deep:n,flush:r,onTrack:i,onTrigger:s}=ee){var l;const a=$a()===((l=ce)==null?void 0:l.scope)?ce:null;let u,c=!1,h=!1;if(fe(e)?(u=()=>e.value,c=Wo(e)):Lt(e)?(u=()=>e,n=!0):L(e)?(h=!0,c=e.some(D=>Lt(D)||Wo(D)),u=()=>e.map(D=>{if(fe(D))return D.value;if(Lt(D))return _t(D);if(F(D))return nt(D,a,2)})):F(e)?t?u=()=>nt(e,a,2):u=()=>{if(!(a&&a.isUnmounted))return _&&_(),De(e,a,3,[v])}:u=Ne,t&&n){const D=u;u=()=>_t(D())}let _,v=D=>{_=M.onStop=()=>{nt(D,a,4)}},b;if(Kt)if(v=Ne,t?o&&De(t,a,3,[u(),h?[]:void 0,v]):u(),r==="sync"){const D=Ku();b=D.__watcherHandles||(D.__watcherHandles=[])}else return Ne;let m=h?new Array(e.length).fill(Ao):Ao;const g=()=>{if(M.active)if(t){const D=M.run();(n||c||(h?D.some((U,k)=>lo(U,m[k])):lo(D,m)))&&(_&&_(),De(t,a,3,[D,m===Ao?void 0:h&&m[0]===Ao?[]:m,v]),m=D)}else M.run()};g.allowRecurse=!!t;let P;r==="sync"?P=g:r==="post"?P=()=>Ce(g,a&&a.suspense):(g.pre=!0,a&&(g.id=a.uid),P=()=>an(g));const M=new er(u,P);t?o?g():m=M.run():r==="post"?Ce(M.run.bind(M),a&&a.suspense):M.run();const B=()=>{M.stop(),a&&a.scope&&Xn(a.scope.effects,M)};return b&&b.push(B),B}function Bl(e,t,o){const n=this.proxy,r=re(e)?e.includes(".")?ss(n,e):()=>n[e]:e.bind(n,n);let i;F(t)?i=t:(i=t.handler,o=t);const s=ce;xt(this);const l=ar(r,i.bind(n),o);return s?xt(s):Et(),l}function ss(e,t){const o=t.split(".");return()=>{let n=e;for(let r=0;r<o.length&&n;r++)n=n[o[r]];return n}}function _t(e,t){if(!q(e)||e.__v_skip||(t=t||new Set,t.has(e)))return e;if(t.add(e),fe(e))_t(e.value,t);else if(L(e))for(let o=0;o<e.length;o++)_t(e[o],t);else if(Bt(e)||Rt(e))e.forEach(o=>{_t(o,t)});else if(Mi(e))for(const o in e)_t(e[o],t);return e}function Rf(e,t){const o=_e;if(o===null)return e;const n=pn(o)||o.proxy,r=e.dirs||(e.dirs=[]);for(let i=0;i<t.length;i++){let[s,l,a,u=ee]=t[i];s&&(F(s)&&(s={mounted:s,updated:s}),s.deep&&_t(l),r.push({dir:s,instance:n,value:l,oldValue:void 0,arg:a,modifiers:u}))}return e}function ct(e,t,o,n){const r=e.dirs,i=t&&t.dirs;for(let s=0;s<r.length;s++){const l=r[s];i&&(l.oldValue=i[s].value);let a=l.dir[n];a&&(Ut(),De(a,o,8,[e.el,l,e,t]),kt())}}function as(){const e={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return ur(()=>{e.isMounted=!0}),fs(()=>{e.isUnmounting=!0}),e}const Ae=[Function,Array],ls={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:Ae,onEnter:Ae,onAfterEnter:Ae,onEnterCancelled:Ae,onBeforeLeave:Ae,onLeave:Ae,onAfterLeave:Ae,onLeaveCancelled:Ae,onBeforeAppear:Ae,onAppear:Ae,onAfterAppear:Ae,onAppearCancelled:Ae},Ul={name:"BaseTransition",props:ls,setup(e,{slots:t}){const o=mr(),n=as();let r;return()=>{const i=t.default&&lr(t.default(),!0);if(!i||!i.length)return;let s=i[0];if(i.length>1){for(const m of i)if(m.type!==Pe){s=m;break}}const l=$(e),{mode:a}=l;if(n.isLeaving)return Cn(s);const u=Yr(s);if(!u)return Cn(s);const c=po(u,l,n,o);ho(u,c);const h=o.subTree,_=h&&Yr(h);let v=!1;const{getTransitionKey:b}=u.type;if(b){const m=b();r===void 0?r=m:m!==r&&(r=m,v=!0)}if(_&&_.type!==Pe&&(!ht(u,_)||v)){const m=po(_,l,n,o);if(ho(_,m),a==="out-in")return n.isLeaving=!0,m.afterLeave=()=>{n.isLeaving=!1,o.update.active!==!1&&o.update()},Cn(s);a==="in-out"&&u.type!==Pe&&(m.delayLeave=(g,P,M)=>{const B=us(n,_);B[String(_.key)]=_,g._leaveCb=()=>{P(),g._leaveCb=void 0,delete c.delayedLeave},c.delayedLeave=M})}return s}}},kl=Ul;function us(e,t){const{leavingVNodes:o}=e;let n=o.get(t.type);return n||(n=Object.create(null),o.set(t.type,n)),n}function po(e,t,o,n){const{appear:r,mode:i,persisted:s=!1,onBeforeEnter:l,onEnter:a,onAfterEnter:u,onEnterCancelled:c,onBeforeLeave:h,onLeave:_,onAfterLeave:v,onLeaveCancelled:b,onBeforeAppear:m,onAppear:g,onAfterAppear:P,onAppearCancelled:M}=t,B=String(e.key),D=us(o,e),U=(x,G)=>{x&&De(x,n,9,G)},k=(x,G)=>{const W=G[1];U(x,G),L(x)?x.every(ie=>ie.length<=1)&&W():x.length<=1&&W()},X={mode:i,persisted:s,beforeEnter(x){let G=l;if(!o.isMounted)if(r)G=m||l;else return;x._leaveCb&&x._leaveCb(!0);const W=D[B];W&&ht(e,W)&&W.el._leaveCb&&W.el._leaveCb(),U(G,[x])},enter(x){let G=a,W=u,ie=c;if(!o.isMounted)if(r)G=g||a,W=P||u,ie=M||c;else return;let V=!1;const oe=x._enterCb=Oe=>{V||(V=!0,Oe?U(ie,[x]):U(W,[x]),X.delayedLeave&&X.delayedLeave(),x._enterCb=void 0)};G?k(G,[x,oe]):oe()},leave(x,G){const W=String(e.key);if(x._enterCb&&x._enterCb(!0),o.isUnmounting)return G();U(h,[x]);let ie=!1;const V=x._leaveCb=oe=>{ie||(ie=!0,G(),oe?U(b,[x]):U(v,[x]),x._leaveCb=void 0,D[W]===e&&delete D[W])};D[W]=e,_?k(_,[x,V]):V()},clone(x){return po(x,t,o,n)}};return X}function Cn(e){if(Eo(e))return e=st(e),e.children=null,e}function Yr(e){return Eo(e)?e.children?e.children[0]:void 0:e}function ho(e,t){e.shapeFlag&6&&e.component?ho(e.component.subTree,t):e.shapeFlag&128?(e.ssContent.transition=t.clone(e.ssContent),e.ssFallback.transition=t.clone(e.ssFallback)):e.transition=t}function lr(e,t=!1,o){let n=[],r=0;for(let i=0;i<e.length;i++){let s=e[i];const l=o==null?s.key:String(o)+String(s.key!=null?s.key:i);s.type===me?(s.patchFlag&128&&r++,n=n.concat(lr(s.children,t,l))):(t||s.type!==Pe)&&n.push(l!=null?st(s,{key:l}):s)}if(r>1)for(let i=0;i<n.length;i++)n[i].patchFlag=-2;return n}function Yl(e,t){return F(e)?(()=>se({name:e.name},t,{setup:e}))():e}const Qt=e=>!!e.type.__asyncLoader;function f(e){F(e)&&(e={loader:e});const{loader:t,loadingComponent:o,errorComponent:n,delay:r=200,timeout:i,suspensible:s=!0,onError:l}=e;let a=null,u,c=0;const h=()=>(c++,a=null,_()),_=()=>{let v;return a||(v=a=t().catch(b=>{if(b=b instanceof Error?b:new Error(String(b)),l)return new Promise((m,g)=>{l(b,()=>m(h()),()=>g(b),c+1)});throw b}).then(b=>v!==a&&a?a:(b&&(b.__esModule||b[Symbol.toStringTag]==="Module")&&(b=b.default),u=b,b)))};return Yl({name:"AsyncComponentWrapper",__asyncLoader:_,get __asyncResolved(){return u},setup(){const v=ce;if(u)return()=>yn(u,v);const b=M=>{a=null,go(M,v,13,!n)};if(s&&v.suspense||Kt)return _().then(M=>()=>yn(M,v)).catch(M=>(b(M),()=>n?Z(n,{error:M}):null));const m=Ho(!1),g=Ho(),P=Ho(!!r);return r&&setTimeout(()=>{P.value=!1},r),i!=null&&setTimeout(()=>{if(!m.value&&!g.value){const M=new Error(`Async component timed out after ${i}ms.`);b(M),g.value=M}},i),_().then(()=>{m.value=!0,v.parent&&Eo(v.parent.vnode)&&an(v.parent.update)}).catch(M=>{b(M),g.value=M}),()=>{if(m.value&&u)return yn(u,v);if(g.value&&n)return Z(n,{error:g.value});if(o&&!P.value)return Z(o)}}})}function yn(e,t){const{ref:o,props:n,children:r,ce:i}=t.vnode,s=Z(e,n,r);return s.ref=o,s.ce=i,delete t.vnode.ce,s}const Eo=e=>e.type.__isKeepAlive;function $l(e,t){cs(e,"a",t)}function jl(e,t){cs(e,"da",t)}function cs(e,t,o=ce){const n=e.__wdc||(e.__wdc=()=>{let r=o;for(;r;){if(r.isDeactivated)return;r=r.parent}return e()});if(cn(t,n,o),o){let r=o.parent;for(;r&&r.parent;)Eo(r.parent.vnode)&&Wl(n,t,o,r),r=r.parent}}function Wl(e,t,o,n){const r=cn(t,e,n,!0);cr(()=>{Xn(n[t],r)},o)}function cn(e,t,o=ce,n=!1){if(o){const r=o[e]||(o[e]=[]),i=t.__weh||(t.__weh=(...s)=>{if(o.isUnmounted)return;Ut(),xt(o);const l=De(t,o,e,s);return Et(),kt(),l});return n?r.unshift(i):r.push(i),i}}const Xe=e=>(t,o=ce)=>(!Kt||e==="sp")&&cn(e,(...n)=>t(...n),o),Gl=Xe("bm"),ur=Xe("m"),zl=Xe("bu"),ds=Xe("u"),fs=Xe("bum"),cr=Xe("um"),ql=Xe("sp"),Xl=Xe("rtg"),Jl=Xe("rtc");function Ql(e,t=ce){cn("ec",e,t)}const dr="components",Zl="directives";function Io(e,t){return fr(dr,e,!0,t)||e}const ps=Symbol.for("v-ndc");function eu(e){return re(e)?fr(dr,e,!1)||e:e||ps}function Lf(e){return fr(Zl,e)}function fr(e,t,o=!0,n=!1){const r=_e||ce;if(r){const i=r.type;if(e===dr){const l=Vu(i,!1);if(l&&(l===t||l===Ye(t)||l===nn(Ye(t))))return i}const s=$r(r[e]||i[e],t)||$r(r.appContext[e],t);return!s&&n?i:s}}function $r(e,t){return e&&(e[t]||e[Ye(t)]||e[nn(Ye(t))])}function jr(e,t,o,n){let r;const i=o&&o[n];if(L(e)||re(e)){r=new Array(e.length);for(let s=0,l=e.length;s<l;s++)r[s]=t(e[s],s,void 0,i&&i[s])}else if(typeof e=="number"){r=new Array(e);for(let s=0;s<e;s++)r[s]=t(s+1,s,void 0,i&&i[s])}else if(q(e))if(e[Symbol.iterator])r=Array.from(e,(s,l)=>t(s,l,void 0,i&&i[l]));else{const s=Object.keys(e);r=new Array(s.length);for(let l=0,a=s.length;l<a;l++){const u=s[l];r[l]=t(e[u],u,l,i&&i[l])}}else r=[];return o&&(o[n]=r),r}function Mf(e,t){for(let o=0;o<t.length;o++){const n=t[o];if(L(n))for(let r=0;r<n.length;r++)e[n[r].name]=n[r].fn;else n&&(e[n.name]=n.key?(...r)=>{const i=n.fn(...r);return i&&(i.key=n.key),i}:n.fn)}return e}function tu(e,t,o={},n,r){if(_e.isCE||_e.parent&&Qt(_e.parent)&&_e.parent.isCE)return t!=="default"&&(o.name=t),Z("slot",o,n&&n());let i=e[t];i&&i._c&&(i._d=!1),ve();const s=i&&hs(i(o)),l=Xo(me,{key:o.key||s&&s.key||`_${t}`},s||(n?n():[]),s&&e._===1?64:-2);return!r&&l.scopeId&&(l.slotScopeIds=[l.scopeId+"-s"]),i&&i._c&&(i._d=!0),l}function hs(e){return e.some(t=>Jo(t)?!(t.type===Pe||t.type===me&&!hs(t.children)):!0)?e:null}const Nn=e=>e?Ss(e)?pn(e)||e.proxy:Nn(e.parent):null,Zt=se(Object.create(null),{$:e=>e,$el:e=>e.vnode.el,$data:e=>e.data,$props:e=>e.props,$attrs:e=>e.attrs,$slots:e=>e.slots,$refs:e=>e.refs,$parent:e=>Nn(e.parent),$root:e=>Nn(e.root),$emit:e=>e.emit,$options:e=>pr(e),$forceUpdate:e=>e.f||(e.f=()=>an(e.update)),$nextTick:e=>e.n||(e.n=Al.bind(e.proxy)),$watch:e=>Bl.bind(e)}),Tn=(e,t)=>e!==ee&&!e.__isScriptSetup&&j(e,t),ou={get({_:e},t){const{ctx:o,setupState:n,data:r,props:i,accessCache:s,type:l,appContext:a}=e;let u;if(t[0]!=="$"){const v=s[t];if(v!==void 0)switch(v){case 1:return n[t];case 2:return r[t];case 4:return o[t];case 3:return i[t]}else{if(Tn(n,t))return s[t]=1,n[t];if(r!==ee&&j(r,t))return s[t]=2,r[t];if((u=e.propsOptions[0])&&j(u,t))return s[t]=3,i[t];if(o!==ee&&j(o,t))return s[t]=4,o[t];xn&&(s[t]=0)}}const c=Zt[t];let h,_;if(c)return t==="$attrs"&&ye(e,"get",t),c(e);if((h=l.__cssModules)&&(h=h[t]))return h;if(o!==ee&&j(o,t))return s[t]=4,o[t];if(_=a.config.globalProperties,j(_,t))return _[t]},set({_:e},t,o){const{data:n,setupState:r,ctx:i}=e;return Tn(r,t)?(r[t]=o,!0):n!==ee&&j(n,t)?(n[t]=o,!0):j(e.props,t)||t[0]==="$"&&t.slice(1)in e?!1:(i[t]=o,!0)},has({_:{data:e,setupState:t,accessCache:o,ctx:n,appContext:r,propsOptions:i}},s){let l;return!!o[s]||e!==ee&&j(e,s)||Tn(t,s)||(l=i[0])&&j(l,s)||j(n,s)||j(Zt,s)||j(r.config.globalProperties,s)},defineProperty(e,t,o){return o.get!=null?e._.accessCache[t]=0:j(o,"value")&&this.set(e,t,o.value,null),Reflect.defineProperty(e,t,o)}};function Wr(e){return L(e)?e.reduce((t,o)=>(t[o]=null,t),{}):e}let xn=!0;function nu(e){const t=pr(e),o=e.proxy,n=e.ctx;xn=!1,t.beforeCreate&&Gr(t.beforeCreate,e,"bc");const{data:r,computed:i,methods:s,watch:l,provide:a,inject:u,created:c,beforeMount:h,mounted:_,beforeUpdate:v,updated:b,activated:m,deactivated:g,beforeDestroy:P,beforeUnmount:M,destroyed:B,unmounted:D,render:U,renderTracked:k,renderTriggered:X,errorCaptured:x,serverPrefetch:G,expose:W,inheritAttrs:ie,components:V,directives:oe,filters:Oe}=t;if(u&&ru(u,n,null),s)for(const ne in s){const J=s[ne];F(J)&&(n[ne]=J.bind(o))}if(r){const ne=r.call(o,o);q(ne)&&(e.data=sn(ne))}if(xn=!0,i)for(const ne in i){const J=i[ne],lt=F(J)?J.bind(o,o):F(J.get)?J.get.bind(o,o):Ne,vo=!F(J)&&F(J.set)?J.set.bind(o):Ne,ut=no({get:lt,set:vo});Object.defineProperty(n,ne,{enumerable:!0,configurable:!0,get:()=>ut.value,set:Ke=>ut.value=Ke})}if(l)for(const ne in l)ws(l[ne],n,o,ne);if(a){const ne=F(a)?a.call(o):a;Reflect.ownKeys(ne).forEach(J=>{cu(J,ne[J])})}c&&Gr(c,e,"c");function de(ne,J){L(J)?J.forEach(lt=>ne(lt.bind(o))):J&&ne(J.bind(o))}if(de(Gl,h),de(ur,_),de(zl,v),de(ds,b),de($l,m),de(jl,g),de(Ql,x),de(Jl,k),de(Xl,X),de(fs,M),de(cr,D),de(ql,G),L(W))if(W.length){const ne=e.exposed||(e.exposed={});W.forEach(J=>{Object.defineProperty(ne,J,{get:()=>o[J],set:lt=>o[J]=lt})})}else e.exposed||(e.exposed={});U&&e.render===Ne&&(e.render=U),ie!=null&&(e.inheritAttrs=ie),V&&(e.components=V),oe&&(e.directives=oe)}function ru(e,t,o=Ne){L(e)&&(e=Kn(e));for(const n in e){const r=e[n];let i;q(r)?"default"in r?i=xo(r.from||n,r.default,!0):i=xo(r.from||n):i=xo(r),fe(i)?Object.defineProperty(t,n,{enumerable:!0,configurable:!0,get:()=>i.value,set:s=>i.value=s}):t[n]=i}}function Gr(e,t,o){De(L(e)?e.map(n=>n.bind(t.proxy)):e.bind(t.proxy),t,o)}function ws(e,t,o,n){const r=n.includes(".")?ss(o,n):()=>o[n];if(re(e)){const i=t[e];F(i)&&Jt(r,i)}else if(F(e))Jt(r,e.bind(o));else if(q(e))if(L(e))e.forEach(i=>ws(i,t,o,n));else{const i=F(e.handler)?e.handler.bind(o):t[e.handler];F(i)&&Jt(r,i,e)}}function pr(e){const t=e.type,{mixins:o,extends:n}=t,{mixins:r,optionsCache:i,config:{optionMergeStrategies:s}}=e.appContext,l=i.get(t);let a;return l?a=l:!r.length&&!o&&!n?a=t:(a={},r.length&&r.forEach(u=>zo(a,u,s,!0)),zo(a,t,s)),q(t)&&i.set(t,a),a}function zo(e,t,o,n=!1){const{mixins:r,extends:i}=t;i&&zo(e,i,o,!0),r&&r.forEach(s=>zo(e,s,o,!0));for(const s in t)if(!(n&&s==="expose")){const l=iu[s]||o&&o[s];e[s]=l?l(e[s],t[s]):t[s]}return e}const iu={data:zr,props:qr,emits:qr,methods:qt,computed:qt,beforeCreate:Ee,created:Ee,beforeMount:Ee,mounted:Ee,beforeUpdate:Ee,updated:Ee,beforeDestroy:Ee,beforeUnmount:Ee,destroyed:Ee,unmounted:Ee,activated:Ee,deactivated:Ee,errorCaptured:Ee,serverPrefetch:Ee,components:qt,directives:qt,watch:au,provide:zr,inject:su};function zr(e,t){return t?e?function(){return se(F(e)?e.call(this,this):e,F(t)?t.call(this,this):t)}:t:e}function su(e,t){return qt(Kn(e),Kn(t))}function Kn(e){if(L(e)){const t={};for(let o=0;o<e.length;o++)t[e[o]]=e[o];return t}return e}function Ee(e,t){return e?[...new Set([].concat(e,t))]:t}function qt(e,t){return e?se(Object.create(null),e,t):t}function qr(e,t){return e?L(e)&&L(t)?[...new Set([...e,...t])]:se(Object.create(null),Wr(e),Wr(t??{})):t}function au(e,t){if(!e)return t;if(!t)return e;const o=se(Object.create(null),e);for(const n in t)o[n]=Ee(e[n],t[n]);return o}function _s(){return{app:null,config:{isNativeTag:Aa,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let lu=0;function uu(e,t){return function(n,r=null){F(n)||(n=se({},n)),r!=null&&!q(r)&&(r=null);const i=_s(),s=new Set;let l=!1;const a=i.app={_uid:lu++,_component:n,_props:r,_container:null,_context:i,_instance:null,version:Fu,get config(){return i.config},set config(u){},use(u,...c){return s.has(u)||(u&&F(u.install)?(s.add(u),u.install(a,...c)):F(u)&&(s.add(u),u(a,...c))),a},mixin(u){return i.mixins.includes(u)||i.mixins.push(u),a},component(u,c){return c?(i.components[u]=c,a):i.components[u]},directive(u,c){return c?(i.directives[u]=c,a):i.directives[u]},mount(u,c,h){if(!l){const _=Z(n,r);return _.appContext=i,c&&t?t(_,u):e(_,u,h),l=!0,a._container=u,u.__vue_app__=a,pn(_.component)||_.component.proxy}},unmount(){l&&(e(null,a._container),delete a._container.__vue_app__)},provide(u,c){return i.provides[u]=c,a},runWithContext(u){qo=a;try{return u()}finally{qo=null}}};return a}}let qo=null;function cu(e,t){if(ce){let o=ce.provides;const n=ce.parent&&ce.parent.provides;n===o&&(o=ce.provides=Object.create(n)),o[e]=t}}function xo(e,t,o=!1){const n=ce||_e;if(n||qo){const r=n?n.parent==null?n.vnode.appContext&&n.vnode.appContext.provides:n.parent.provides:qo._context.provides;if(r&&e in r)return r[e];if(arguments.length>1)return o&&F(t)?t.call(n&&n.proxy):t}}function du(e,t,o,n=!1){const r={},i={};Yo(i,fn,1),e.propsDefaults=Object.create(null),ms(e,t,r,i);for(const s in e.propsOptions[0])s in r||(r[s]=void 0);o?e.props=n?r:gl(r):e.type.props?e.props=r:e.props=i,e.attrs=i}function fu(e,t,o,n){const{props:r,attrs:i,vnode:{patchFlag:s}}=e,l=$(r),[a]=e.propsOptions;let u=!1;if((n||s>0)&&!(s&16)){if(s&8){const c=e.vnode.dynamicProps;for(let h=0;h<c.length;h++){let _=c[h];if(ln(e.emitsOptions,_))continue;const v=t[_];if(a)if(j(i,_))v!==i[_]&&(i[_]=v,u=!0);else{const b=Ye(_);r[b]=Fn(a,l,b,v,e,!1)}else v!==i[_]&&(i[_]=v,u=!0)}}}else{ms(e,t,r,i)&&(u=!0);let c;for(const h in l)(!t||!j(t,h)&&((c=Ct(h))===h||!j(t,c)))&&(a?o&&(o[h]!==void 0||o[c]!==void 0)&&(r[h]=Fn(a,l,h,void 0,e,!0)):delete r[h]);if(i!==l)for(const h in i)(!t||!j(t,h))&&(delete i[h],u=!0)}u&&qe(e,"set","$attrs")}function ms(e,t,o,n){const[r,i]=e.propsOptions;let s=!1,l;if(t)for(let a in t){if(Mo(a))continue;const u=t[a];let c;r&&j(r,c=Ye(a))?!i||!i.includes(c)?o[c]=u:(l||(l={}))[c]=u:ln(e.emitsOptions,a)||(!(a in n)||u!==n[a])&&(n[a]=u,s=!0)}if(i){const a=$(o),u=l||ee;for(let c=0;c<i.length;c++){const h=i[c];o[h]=Fn(r,a,h,u[h],e,!j(u,h))}}return s}function Fn(e,t,o,n,r,i){const s=e[o];if(s!=null){const l=j(s,"default");if(l&&n===void 0){const a=s.default;if(s.type!==Function&&!s.skipFactory&&F(a)){const{propsDefaults:u}=r;o in u?n=u[o]:(xt(r),n=u[o]=a.call(null,t),Et())}else n=a}s[0]&&(i&&!l?n=!1:s[1]&&(n===""||n===Ct(o))&&(n=!0))}return n}function gs(e,t,o=!1){const n=t.propsCache,r=n.get(e);if(r)return r;const i=e.props,s={},l=[];let a=!1;if(!F(e)){const c=h=>{a=!0;const[_,v]=gs(h,t,!0);se(s,_),v&&l.push(...v)};!o&&t.mixins.length&&t.mixins.forEach(c),e.extends&&c(e.extends),e.mixins&&e.mixins.forEach(c)}if(!i&&!a)return q(e)&&n.set(e,Pt),Pt;if(L(i))for(let c=0;c<i.length;c++){const h=Ye(i[c]);Xr(h)&&(s[h]=ee)}else if(i)for(const c in i){const h=Ye(c);if(Xr(h)){const _=i[c],v=s[h]=L(_)||F(_)?{type:_}:se({},_);if(v){const b=Zr(Boolean,v.type),m=Zr(String,v.type);v[0]=b>-1,v[1]=m<0||b<m,(b>-1||j(v,"default"))&&l.push(h)}}}const u=[s,l];return q(e)&&n.set(e,u),u}function Xr(e){return e[0]!=="$"}function Jr(e){const t=e&&e.toString().match(/^\s*(function|class) (\w+)/);return t?t[2]:e===null?"null":""}function Qr(e,t){return Jr(e)===Jr(t)}function Zr(e,t){return L(t)?t.findIndex(o=>Qr(o,e)):F(t)&&Qr(t,e)?0:-1}const Es=e=>e[0]==="_"||e==="$stable",hr=e=>L(e)?e.map(Ue):[Ue(e)],pu=(e,t,o)=>{if(t._n)return t;const n=No((...r)=>hr(t(...r)),o);return n._c=!1,n},vs=(e,t,o)=>{const n=e._ctx;for(const r in e){if(Es(r))continue;const i=e[r];if(F(i))t[r]=pu(r,i,n);else if(i!=null){const s=hr(i);t[r]=()=>s}}},Cs=(e,t)=>{const o=hr(t);e.slots.default=()=>o},hu=(e,t)=>{if(e.vnode.shapeFlag&32){const o=t._;o?(e.slots=$(t),Yo(t,"_",o)):vs(t,e.slots={})}else e.slots={},t&&Cs(e,t);Yo(e.slots,fn,1)},wu=(e,t,o)=>{const{vnode:n,slots:r}=e;let i=!0,s=ee;if(n.shapeFlag&32){const l=t._;l?o&&l===1?i=!1:(se(r,t),!o&&l===1&&delete r._):(i=!t.$stable,vs(t,r)),s=t}else t&&(Cs(e,t),s={default:1});if(i)for(const l in r)!Es(l)&&!(l in s)&&delete r[l]};function Bn(e,t,o,n,r=!1){if(L(e)){e.forEach((_,v)=>Bn(_,t&&(L(t)?t[v]:t),o,n,r));return}if(Qt(n)&&!r)return;const i=n.shapeFlag&4?pn(n.component)||n.component.proxy:n.el,s=r?null:i,{i:l,r:a}=e,u=t&&t.r,c=l.refs===ee?l.refs={}:l.refs,h=l.setupState;if(u!=null&&u!==a&&(re(u)?(c[u]=null,j(h,u)&&(h[u]=null)):fe(u)&&(u.value=null)),F(a))nt(a,l,12,[s,c]);else{const _=re(a),v=fe(a);if(_||v){const b=()=>{if(e.f){const m=_?j(h,a)?h[a]:c[a]:a.value;r?L(m)&&Xn(m,i):L(m)?m.includes(i)||m.push(i):_?(c[a]=[i],j(h,a)&&(h[a]=c[a])):(a.value=[i],e.k&&(c[e.k]=a.value))}else _?(c[a]=s,j(h,a)&&(h[a]=s)):v&&(a.value=s,e.k&&(c[e.k]=s))};s?(b.id=-1,Ce(b,o)):b()}}}const Ce=Kl;function _u(e){return mu(e)}function mu(e,t){const o=Rn();o.__VUE__=!0;const{insert:n,remove:r,patchProp:i,createElement:s,createText:l,createComment:a,setText:u,setElementText:c,parentNode:h,nextSibling:_,setScopeId:v=Ne,insertStaticContent:b}=e,m=(p,w,E,y=null,C=null,S=null,I=!1,O=null,A=!!w.dynamicChildren)=>{if(p===w)return;p&&!ht(p,w)&&(y=Co(p),Ke(p,C,S,!0),p=null),w.patchFlag===-2&&(A=!1,w.dynamicChildren=null);const{type:T,ref:H,shapeFlag:R}=w;switch(T){case dn:g(p,w,E,y);break;case Pe:P(p,w,E,y);break;case to:p==null&&M(w,E,y,I);break;case me:V(p,w,E,y,C,S,I,O,A);break;default:R&1?U(p,w,E,y,C,S,I,O,A):R&6?oe(p,w,E,y,C,S,I,O,A):(R&64||R&128)&&T.process(p,w,E,y,C,S,I,O,A,Ot)}H!=null&&C&&Bn(H,p&&p.ref,S,w||p,!w)},g=(p,w,E,y)=>{if(p==null)n(w.el=l(w.children),E,y);else{const C=w.el=p.el;w.children!==p.children&&u(C,w.children)}},P=(p,w,E,y)=>{p==null?n(w.el=a(w.children||""),E,y):w.el=p.el},M=(p,w,E,y)=>{[p.el,p.anchor]=b(p.children,w,E,y,p.el,p.anchor)},B=({el:p,anchor:w},E,y)=>{let C;for(;p&&p!==w;)C=_(p),n(p,E,y),p=C;n(w,E,y)},D=({el:p,anchor:w})=>{let E;for(;p&&p!==w;)E=_(p),r(p),p=E;r(w)},U=(p,w,E,y,C,S,I,O,A)=>{I=I||w.type==="svg",p==null?k(w,E,y,C,S,I,O,A):G(p,w,C,S,I,O,A)},k=(p,w,E,y,C,S,I,O)=>{let A,T;const{type:H,props:R,shapeFlag:N,transition:K,dirs:Y}=p;if(A=p.el=s(p.type,S,R&&R.is,R),N&8?c(A,p.children):N&16&&x(p.children,A,null,y,C,S&&H!=="foreignObject",I,O),Y&&ct(p,null,y,"created"),X(A,p,p.scopeId,I,y),R){for(const z in R)z!=="value"&&!Mo(z)&&i(A,z,null,R[z],S,p.children,y,C,$e);"value"in R&&i(A,"value",null,R.value),(T=R.onVnodeBeforeMount)&&Be(T,y,p)}Y&&ct(p,null,y,"beforeMount");const Q=(!C||C&&!C.pendingBranch)&&K&&!K.persisted;Q&&K.beforeEnter(A),n(A,w,E),((T=R&&R.onVnodeMounted)||Q||Y)&&Ce(()=>{T&&Be(T,y,p),Q&&K.enter(A),Y&&ct(p,null,y,"mounted")},C)},X=(p,w,E,y,C)=>{if(E&&v(p,E),y)for(let S=0;S<y.length;S++)v(p,y[S]);if(C){let S=C.subTree;if(w===S){const I=C.vnode;X(p,I,I.scopeId,I.slotScopeIds,C.parent)}}},x=(p,w,E,y,C,S,I,O,A=0)=>{for(let T=A;T<p.length;T++){const H=p[T]=O?et(p[T]):Ue(p[T]);m(null,H,w,E,y,C,S,I,O)}},G=(p,w,E,y,C,S,I)=>{const O=w.el=p.el;let{patchFlag:A,dynamicChildren:T,dirs:H}=w;A|=p.patchFlag&16;const R=p.props||ee,N=w.props||ee;let K;E&&dt(E,!1),(K=N.onVnodeBeforeUpdate)&&Be(K,E,w,p),H&&ct(w,p,E,"beforeUpdate"),E&&dt(E,!0);const Y=C&&w.type!=="foreignObject";if(T?W(p.dynamicChildren,T,O,E,y,Y,S):I||J(p,w,O,null,E,y,Y,S,!1),A>0){if(A&16)ie(O,w,R,N,E,y,C);else if(A&2&&R.class!==N.class&&i(O,"class",null,N.class,C),A&4&&i(O,"style",R.style,N.style,C),A&8){const Q=w.dynamicProps;for(let z=0;z<Q.length;z++){const ae=Q[z],Re=R[ae],St=N[ae];(St!==Re||ae==="value")&&i(O,ae,Re,St,C,p.children,E,y,$e)}}A&1&&p.children!==w.children&&c(O,w.children)}else!I&&T==null&&ie(O,w,R,N,E,y,C);((K=N.onVnodeUpdated)||H)&&Ce(()=>{K&&Be(K,E,w,p),H&&ct(w,p,E,"updated")},y)},W=(p,w,E,y,C,S,I)=>{for(let O=0;O<w.length;O++){const A=p[O],T=w[O],H=A.el&&(A.type===me||!ht(A,T)||A.shapeFlag&70)?h(A.el):E;m(A,T,H,null,y,C,S,I,!0)}},ie=(p,w,E,y,C,S,I)=>{if(E!==y){if(E!==ee)for(const O in E)!Mo(O)&&!(O in y)&&i(p,O,E[O],null,I,w.children,C,S,$e);for(const O in y){if(Mo(O))continue;const A=y[O],T=E[O];A!==T&&O!=="value"&&i(p,O,T,A,I,w.children,C,S,$e)}"value"in y&&i(p,"value",E.value,y.value)}},V=(p,w,E,y,C,S,I,O,A)=>{const T=w.el=p?p.el:l(""),H=w.anchor=p?p.anchor:l("");let{patchFlag:R,dynamicChildren:N,slotScopeIds:K}=w;K&&(O=O?O.concat(K):K),p==null?(n(T,E,y),n(H,E,y),x(w.children,E,H,C,S,I,O,A)):R>0&&R&64&&N&&p.dynamicChildren?(W(p.dynamicChildren,N,E,C,S,I,O),(w.key!=null||C&&w===C.subTree)&&wr(p,w,!0)):J(p,w,E,H,C,S,I,O,A)},oe=(p,w,E,y,C,S,I,O,A)=>{w.slotScopeIds=O,p==null?w.shapeFlag&512?C.ctx.activate(w,E,y,I,A):Oe(w,E,y,C,S,I,A):$t(p,w,A)},Oe=(p,w,E,y,C,S,I)=>{const O=p.component=Du(p,y,C);if(Eo(p)&&(O.ctx.renderer=Ot),Pu(O),O.asyncDep){if(C&&C.registerDep(O,de),!p.el){const A=O.subTree=Z(Pe);P(null,A,w,E)}return}de(O,p,w,E,C,S,I)},$t=(p,w,E)=>{const y=w.component=p.component;if(Hl(p,w,E))if(y.asyncDep&&!y.asyncResolved){ne(y,w,E);return}else y.next=w,Dl(y.update),y.update();else w.el=p.el,y.vnode=w},de=(p,w,E,y,C,S,I)=>{const O=()=>{if(p.isMounted){let{next:H,bu:R,u:N,parent:K,vnode:Y}=p,Q=H,z;dt(p,!1),H?(H.el=Y.el,ne(p,H,I)):H=Y,R&&Vo(R),(z=H.props&&H.props.onVnodeBeforeUpdate)&&Be(z,K,H,Y),dt(p,!0);const ae=vn(p),Re=p.subTree;p.subTree=ae,m(Re,ae,h(Re.el),Co(Re),p,C,S),H.el=ae.el,Q===null&&Nl(p,ae.el),N&&Ce(N,C),(z=H.props&&H.props.onVnodeUpdated)&&Ce(()=>Be(z,K,H,Y),C)}else{let H;const{el:R,props:N}=w,{bm:K,m:Y,parent:Q}=p,z=Qt(w);if(dt(p,!1),K&&Vo(K),!z&&(H=N&&N.onVnodeBeforeMount)&&Be(H,Q,w),dt(p,!0),R&&gn){const ae=()=>{p.subTree=vn(p),gn(R,p.subTree,p,C,null)};z?w.type.__asyncLoader().then(()=>!p.isUnmounted&&ae()):ae()}else{const ae=p.subTree=vn(p);m(null,ae,E,y,p,C,S),w.el=ae.el}if(Y&&Ce(Y,C),!z&&(H=N&&N.onVnodeMounted)){const ae=w;Ce(()=>Be(H,Q,ae),C)}(w.shapeFlag&256||Q&&Qt(Q.vnode)&&Q.vnode.shapeFlag&256)&&p.a&&Ce(p.a,C),p.isMounted=!0,w=E=y=null}},A=p.effect=new er(O,()=>an(T),p.scope),T=p.update=()=>A.run();T.id=p.uid,dt(p,!0),T()},ne=(p,w,E)=>{w.component=p;const y=p.vnode.props;p.vnode=w,p.next=null,fu(p,w.props,y,E),wu(p,w.children,E),Ut(),Ur(),kt()},J=(p,w,E,y,C,S,I,O,A=!1)=>{const T=p&&p.children,H=p?p.shapeFlag:0,R=w.children,{patchFlag:N,shapeFlag:K}=w;if(N>0){if(N&128){vo(T,R,E,y,C,S,I,O,A);return}else if(N&256){lt(T,R,E,y,C,S,I,O,A);return}}K&8?(H&16&&$e(T,C,S),R!==T&&c(E,R)):H&16?K&16?vo(T,R,E,y,C,S,I,O,A):$e(T,C,S,!0):(H&8&&c(E,""),K&16&&x(R,E,y,C,S,I,O,A))},lt=(p,w,E,y,C,S,I,O,A)=>{p=p||Pt,w=w||Pt;const T=p.length,H=w.length,R=Math.min(T,H);let N;for(N=0;N<R;N++){const K=w[N]=A?et(w[N]):Ue(w[N]);m(p[N],K,E,null,C,S,I,O,A)}T>H?$e(p,C,S,!0,!1,R):x(w,E,y,C,S,I,O,A,R)},vo=(p,w,E,y,C,S,I,O,A)=>{let T=0;const H=w.length;let R=p.length-1,N=H-1;for(;T<=R&&T<=N;){const K=p[T],Y=w[T]=A?et(w[T]):Ue(w[T]);if(ht(K,Y))m(K,Y,E,null,C,S,I,O,A);else break;T++}for(;T<=R&&T<=N;){const K=p[R],Y=w[N]=A?et(w[N]):Ue(w[N]);if(ht(K,Y))m(K,Y,E,null,C,S,I,O,A);else break;R--,N--}if(T>R){if(T<=N){const K=N+1,Y=K<H?w[K].el:y;for(;T<=N;)m(null,w[T]=A?et(w[T]):Ue(w[T]),E,Y,C,S,I,O,A),T++}}else if(T>N)for(;T<=R;)Ke(p[T],C,S,!0),T++;else{const K=T,Y=T,Q=new Map;for(T=Y;T<=N;T++){const Se=w[T]=A?et(w[T]):Ue(w[T]);Se.key!=null&&Q.set(Se.key,T)}let z,ae=0;const Re=N-Y+1;let St=!1,Ir=0;const jt=new Array(Re);for(T=0;T<Re;T++)jt[T]=0;for(T=K;T<=R;T++){const Se=p[T];if(ae>=Re){Ke(Se,C,S,!0);continue}let Fe;if(Se.key!=null)Fe=Q.get(Se.key);else for(z=Y;z<=N;z++)if(jt[z-Y]===0&&ht(Se,w[z])){Fe=z;break}Fe===void 0?Ke(Se,C,S,!0):(jt[Fe-Y]=T+1,Fe>=Ir?Ir=Fe:St=!0,m(Se,w[Fe],E,null,C,S,I,O,A),ae++)}const Dr=St?gu(jt):Pt;for(z=Dr.length-1,T=Re-1;T>=0;T--){const Se=Y+T,Fe=w[Se],Pr=Se+1<H?w[Se+1].el:y;jt[T]===0?m(null,Fe,E,Pr,C,S,I,O,A):St&&(z<0||T!==Dr[z]?ut(Fe,E,Pr,2):z--)}}},ut=(p,w,E,y,C=null)=>{const{el:S,type:I,transition:O,children:A,shapeFlag:T}=p;if(T&6){ut(p.component.subTree,w,E,y);return}if(T&128){p.suspense.move(w,E,y);return}if(T&64){I.move(p,w,E,Ot);return}if(I===me){n(S,w,E);for(let R=0;R<A.length;R++)ut(A[R],w,E,y);n(p.anchor,w,E);return}if(I===to){B(p,w,E);return}if(y!==2&&T&1&&O)if(y===0)O.beforeEnter(S),n(S,w,E),Ce(()=>O.enter(S),C);else{const{leave:R,delayLeave:N,afterLeave:K}=O,Y=()=>n(S,w,E),Q=()=>{R(S,()=>{Y(),K&&K()})};N?N(S,Y,Q):Q()}else n(S,w,E)},Ke=(p,w,E,y=!1,C=!1)=>{const{type:S,props:I,ref:O,children:A,dynamicChildren:T,shapeFlag:H,patchFlag:R,dirs:N}=p;if(O!=null&&Bn(O,null,E,p,!0),H&256){w.ctx.deactivate(p);return}const K=H&1&&N,Y=!Qt(p);let Q;if(Y&&(Q=I&&I.onVnodeBeforeUnmount)&&Be(Q,w,p),H&6)Ta(p.component,E,y);else{if(H&128){p.suspense.unmount(E,y);return}K&&ct(p,null,w,"beforeUnmount"),H&64?p.type.remove(p,w,E,C,Ot,y):T&&(S!==me||R>0&&R&64)?$e(T,w,E,!1,!0):(S===me&&R&384||!C&&H&16)&&$e(A,w,E),y&&br(p)}(Y&&(Q=I&&I.onVnodeUnmounted)||K)&&Ce(()=>{Q&&Be(Q,w,p),K&&ct(p,null,w,"unmounted")},E)},br=p=>{const{type:w,el:E,anchor:y,transition:C}=p;if(w===me){ya(E,y);return}if(w===to){D(p);return}const S=()=>{r(E),C&&!C.persisted&&C.afterLeave&&C.afterLeave()};if(p.shapeFlag&1&&C&&!C.persisted){const{leave:I,delayLeave:O}=C,A=()=>I(E,S);O?O(p.el,S,A):A()}else S()},ya=(p,w)=>{let E;for(;p!==w;)E=_(p),r(p),p=E;r(w)},Ta=(p,w,E)=>{const{bum:y,scope:C,update:S,subTree:I,um:O}=p;y&&Vo(y),C.stop(),S&&(S.active=!1,Ke(I,p,w,E)),O&&Ce(O,w),Ce(()=>{p.isUnmounted=!0},w),w&&w.pendingBranch&&!w.isUnmounted&&p.asyncDep&&!p.asyncResolved&&p.suspenseId===w.pendingId&&(w.deps--,w.deps===0&&w.resolve())},$e=(p,w,E,y=!1,C=!1,S=0)=>{for(let I=S;I<p.length;I++)Ke(p[I],w,E,y,C)},Co=p=>p.shapeFlag&6?Co(p.component.subTree):p.shapeFlag&128?p.suspense.next():_(p.anchor||p.el),Ar=(p,w,E)=>{p==null?w._vnode&&Ke(w._vnode,null,null,!0):m(w._vnode||null,p,w,null,null,null,E),Ur(),ns(),w._vnode=p},Ot={p:m,um:Ke,m:ut,r:br,mt:Oe,mc:x,pc:J,pbc:W,n:Co,o:e};let mn,gn;return t&&([mn,gn]=t(Ot)),{render:Ar,hydrate:mn,createApp:uu(Ar,mn)}}function dt({effect:e,update:t},o){e.allowRecurse=t.allowRecurse=o}function wr(e,t,o=!1){const n=e.children,r=t.children;if(L(n)&&L(r))for(let i=0;i<n.length;i++){const s=n[i];let l=r[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=r[i]=et(r[i]),l.el=s.el),o||wr(s,l)),l.type===dn&&(l.el=s.el)}}function gu(e){const t=e.slice(),o=[0];let n,r,i,s,l;const a=e.length;for(n=0;n<a;n++){const u=e[n];if(u!==0){if(r=o[o.length-1],e[r]<u){t[n]=r,o.push(n);continue}for(i=0,s=o.length-1;i<s;)l=i+s>>1,e[o[l]]<u?i=l+1:s=l;u<e[o[i]]&&(i>0&&(t[n]=o[i-1]),o[i]=n)}}for(i=o.length,s=o[i-1];i-- >0;)o[i]=s,s=t[s];return o}const Eu=e=>e.__isTeleport,eo=e=>e&&(e.disabled||e.disabled===""),ei=e=>typeof SVGElement<"u"&&e instanceof SVGElement,Un=(e,t)=>{const o=e&&e.to;return re(o)?t?t(o):null:o},vu={__isTeleport:!0,process(e,t,o,n,r,i,s,l,a,u){const{mc:c,pc:h,pbc:_,o:{insert:v,querySelector:b,createText:m,createComment:g}}=u,P=eo(t.props);let{shapeFlag:M,children:B,dynamicChildren:D}=t;if(e==null){const U=t.el=m(""),k=t.anchor=m("");v(U,o,n),v(k,o,n);const X=t.target=Un(t.props,b),x=t.targetAnchor=m("");X&&(v(x,X),s=s||ei(X));const G=(W,ie)=>{M&16&&c(B,W,ie,r,i,s,l,a)};P?G(o,k):X&&G(X,x)}else{t.el=e.el;const U=t.anchor=e.anchor,k=t.target=e.target,X=t.targetAnchor=e.targetAnchor,x=eo(e.props),G=x?o:k,W=x?U:X;if(s=s||ei(k),D?(_(e.dynamicChildren,D,G,r,i,s,l),wr(e,t,!0)):a||h(e,t,G,W,r,i,s,l,!1),P)x||Do(t,o,U,u,1);else if((t.props&&t.props.to)!==(e.props&&e.props.to)){const ie=t.target=Un(t.props,b);ie&&Do(t,ie,null,u,0)}else x&&Do(t,k,X,u,1)}ys(t)},remove(e,t,o,n,{um:r,o:{remove:i}},s){const{shapeFlag:l,children:a,anchor:u,targetAnchor:c,target:h,props:_}=e;if(h&&i(c),(s||!eo(_))&&(i(u),l&16))for(let v=0;v<a.length;v++){const b=a[v];r(b,t,o,!0,!!b.dynamicChildren)}},move:Do,hydrate:Cu};function Do(e,t,o,{o:{insert:n},m:r},i=2){i===0&&n(e.targetAnchor,t,o);const{el:s,anchor:l,shapeFlag:a,children:u,props:c}=e,h=i===2;if(h&&n(s,t,o),(!h||eo(c))&&a&16)for(let _=0;_<u.length;_++)r(u[_],t,o,2);h&&n(l,t,o)}function Cu(e,t,o,n,r,i,{o:{nextSibling:s,parentNode:l,querySelector:a}},u){const c=t.target=Un(t.props,a);if(c){const h=c._lpa||c.firstChild;if(t.shapeFlag&16)if(eo(t.props))t.anchor=u(s(e),t,l(e),o,n,r,i),t.targetAnchor=h;else{t.anchor=s(e);let _=h;for(;_;)if(_=s(_),_&&_.nodeType===8&&_.data==="teleport anchor"){t.targetAnchor=_,c._lpa=t.targetAnchor&&s(t.targetAnchor);break}u(h,t,c,o,n,r,i)}ys(t)}return t.anchor&&s(t.anchor)}const Vf=vu;function ys(e){const t=e.ctx;if(t&&t.ut){let o=e.children[0].el;for(;o!==e.targetAnchor;)o.nodeType===1&&o.setAttribute("data-v-owner",t.uid),o=o.nextSibling;t.ut()}}const me=Symbol.for("v-fgt"),dn=Symbol.for("v-txt"),Pe=Symbol.for("v-cmt"),to=Symbol.for("v-stc"),oo=[];let He=null;function ve(e=!1){oo.push(He=e?null:[])}function yu(){oo.pop(),He=oo[oo.length-1]||null}let wo=1;function ti(e){wo+=e}function Ts(e){return e.dynamicChildren=wo>0?He||Pt:null,yu(),wo>0&&He&&He.push(e),e}function Me(e,t,o,n,r,i){return Ts(it(e,t,o,n,r,i,!0))}function Xo(e,t,o,n,r){return Ts(Z(e,t,o,n,r,!0))}function Jo(e){return e?e.__v_isVNode===!0:!1}function ht(e,t){return e.type===t.type&&e.key===t.key}const fn="__vInternal",Os=({key:e})=>e??null,Ko=({ref:e,ref_key:t,ref_for:o})=>(typeof e=="number"&&(e=""+e),e!=null?re(e)||fe(e)||F(e)?{i:_e,r:e,k:t,f:!!o}:e:null);function it(e,t=null,o=null,n=0,r=null,i=e===me?0:1,s=!1,l=!1){const a={__v_isVNode:!0,__v_skip:!0,type:e,props:t,key:t&&Os(t),ref:t&&Ko(t),scopeId:un,slotScopeIds:null,children:o,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:n,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:_e};return l?(_r(a,o),i&128&&e.normalize(a)):o&&(a.shapeFlag|=re(o)?8:16),wo>0&&!s&&He&&(a.patchFlag>0||i&6)&&a.patchFlag!==32&&He.push(a),a}const Z=Tu;function Tu(e,t=null,o=null,n=0,r=null,i=!1){if((!e||e===ps)&&(e=Pe),Jo(e)){const l=st(e,t,!0);return o&&_r(l,o),wo>0&&!i&&He&&(l.shapeFlag&6?He[He.indexOf(e)]=l:He.push(l)),l.patchFlag|=-2,l}if(Hu(e)&&(e=e.__vccOpts),t){t=Ou(t);let{class:l,style:a}=t;l&&!re(l)&&(t.class=tt(l)),q(a)&&(zi(a)&&!L(a)&&(a=se({},a)),t.style=mo(a))}const s=re(e)?1:xl(e)?128:Eu(e)?64:q(e)?4:F(e)?2:0;return it(e,t,o,n,r,s,i,!0)}function Ou(e){return e?zi(e)||fn in e?se({},e):e:null}function st(e,t,o=!1){const{props:n,ref:r,patchFlag:i,children:s}=e,l=t?bu(n||{},t):n;return{__v_isVNode:!0,__v_skip:!0,type:e.type,props:l,key:l&&Os(l),ref:t&&t.ref?o&&r?L(r)?r.concat(Ko(t)):[r,Ko(t)]:Ko(t):r,scopeId:e.scopeId,slotScopeIds:e.slotScopeIds,children:s,target:e.target,targetAnchor:e.targetAnchor,staticCount:e.staticCount,shapeFlag:e.shapeFlag,patchFlag:t&&e.type!==me?i===-1?16:i|16:i,dynamicProps:e.dynamicProps,dynamicChildren:e.dynamicChildren,appContext:e.appContext,dirs:e.dirs,transition:e.transition,component:e.component,suspense:e.suspense,ssContent:e.ssContent&&st(e.ssContent),ssFallback:e.ssFallback&&st(e.ssFallback),el:e.el,anchor:e.anchor,ctx:e.ctx,ce:e.ce}}function Su(e=" ",t=0){return Z(dn,null,e,t)}function Hf(e,t){const o=Z(to,null,e);return o.staticCount=t,o}function Fo(e="",t=!1){return t?(ve(),Xo(Pe,null,e)):Z(Pe,null,e)}function Ue(e){return e==null||typeof e=="boolean"?Z(Pe):L(e)?Z(me,null,e.slice()):typeof e=="object"?et(e):Z(dn,null,String(e))}function et(e){return e.el===null&&e.patchFlag!==-1||e.memo?e:st(e)}function _r(e,t){let o=0;const{shapeFlag:n}=e;if(t==null)t=null;else if(L(t))o=16;else if(typeof t=="object")if(n&65){const r=t.default;r&&(r._c&&(r._d=!1),_r(e,r()),r._c&&(r._d=!0));return}else{o=32;const r=t._;!r&&!(fn in t)?t._ctx=_e:r===3&&_e&&(_e.slots._===1?t._=1:(t._=2,e.patchFlag|=1024))}else F(t)?(t={default:t,_ctx:_e},o=32):(t=String(t),n&64?(o=16,t=[Su(t)]):o=8);e.children=t,e.shapeFlag|=o}function bu(...e){const t={};for(let o=0;o<e.length;o++){const n=e[o];for(const r in n)if(r==="class")t.class!==n.class&&(t.class=tt([t.class,n.class]));else if(r==="style")t.style=mo([t.style,n.style]);else if(tn(r)){const i=t[r],s=n[r];s&&i!==s&&!(L(i)&&i.includes(s))&&(t[r]=i?[].concat(i,s):s)}else r!==""&&(t[r]=n[r])}return t}function Be(e,t,o,n=null){De(e,t,7,[o,n])}const Au=_s();let Iu=0;function Du(e,t,o){const n=e.type,r=(t?t.appContext:e.appContext)||Au,i={uid:Iu++,vnode:e,type:n,parent:t,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,scope:new Ni(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(r.provides),accessCache:null,renderCache:[],components:null,directives:null,propsOptions:gs(n,r),emitsOptions:is(n,r),emit:null,emitted:null,propsDefaults:ee,inheritAttrs:n.inheritAttrs,ctx:ee,data:ee,props:ee,attrs:ee,slots:ee,refs:ee,setupState:ee,setupContext:null,attrsProxy:null,slotsProxy:null,suspense:o,suspenseId:o?o.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=t?t.root:i,i.emit=Ll.bind(null,i),e.ce&&e.ce(i),i}let ce=null;const mr=()=>ce||_e;let gr,bt,oi="__VUE_INSTANCE_SETTERS__";(bt=Rn()[oi])||(bt=Rn()[oi]=[]),bt.push(e=>ce=e),gr=e=>{bt.length>1?bt.forEach(t=>t(e)):bt[0](e)};const xt=e=>{gr(e),e.scope.on()},Et=()=>{ce&&ce.scope.off(),gr(null)};function Ss(e){return e.vnode.shapeFlag&4}let Kt=!1;function Pu(e,t=!1){Kt=t;const{props:o,children:n}=e.vnode,r=Ss(e);du(e,o,r,t),hu(e,n);const i=r?Ru(e,t):void 0;return Kt=!1,i}function Ru(e,t){const o=e.type;e.accessCache=Object.create(null),e.proxy=qi(new Proxy(e.ctx,ou));const{setup:n}=o;if(n){const r=e.setupContext=n.length>1?Mu(e):null;xt(e),Ut();const i=nt(n,e,0,[e.props,r]);if(kt(),Et(),Ri(i)){if(i.then(Et,Et),t)return i.then(s=>{ni(e,s,t)}).catch(s=>{go(s,e,0)});e.asyncDep=i}else ni(e,i,t)}else bs(e,t)}function ni(e,t,o){F(t)?e.type.__ssrInlineRender?e.ssrRender=t:e.render=t:q(t)&&(e.setupState=Zi(t)),bs(e,o)}let ri;function bs(e,t,o){const n=e.type;if(!e.render){if(!t&&ri&&!n.render){const r=n.template||pr(e).template;if(r){const{isCustomElement:i,compilerOptions:s}=e.appContext.config,{delimiters:l,compilerOptions:a}=n,u=se(se({isCustomElement:i,delimiters:l},s),a);n.render=ri(r,u)}}e.render=n.render||Ne}xt(e),Ut(),nu(e),kt(),Et()}function Lu(e){return e.attrsProxy||(e.attrsProxy=new Proxy(e.attrs,{get(t,o){return ye(e,"get","$attrs"),t[o]}}))}function Mu(e){const t=o=>{e.exposed=o||{}};return{get attrs(){return Lu(e)},slots:e.slots,emit:e.emit,expose:t}}function pn(e){if(e.exposed)return e.exposeProxy||(e.exposeProxy=new Proxy(Zi(qi(e.exposed)),{get(t,o){if(o in t)return t[o];if(o in Zt)return Zt[o](e)},has(t,o){return o in t||o in Zt}}))}function Vu(e,t=!0){return F(e)?e.displayName||e.name:e.name||t&&e.__name}function Hu(e){return F(e)&&"__vccOpts"in e}const no=(e,t)=>Sl(e,t,Kt);function Nu(e,t,o){const n=arguments.length;return n===2?q(t)&&!L(t)?Jo(t)?Z(e,null,[t]):Z(e,t):Z(e,null,t):(n>3?o=Array.prototype.slice.call(arguments,2):n===3&&Jo(o)&&(o=[o]),Z(e,t,o))}const xu=Symbol.for("v-scx"),Ku=()=>xo(xu),Fu="3.3.4",Bu="http://www.w3.org/2000/svg",wt=typeof document<"u"?document:null,ii=wt&&wt.createElement("template"),Uu={insert:(e,t,o)=>{t.insertBefore(e,o||null)},remove:e=>{const t=e.parentNode;t&&t.removeChild(e)},createElement:(e,t,o,n)=>{const r=t?wt.createElementNS(Bu,e):wt.createElement(e,o?{is:o}:void 0);return e==="select"&&n&&n.multiple!=null&&r.setAttribute("multiple",n.multiple),r},createText:e=>wt.createTextNode(e),createComment:e=>wt.createComment(e),setText:(e,t)=>{e.nodeValue=t},setElementText:(e,t)=>{e.textContent=t},parentNode:e=>e.parentNode,nextSibling:e=>e.nextSibling,querySelector:e=>wt.querySelector(e),setScopeId(e,t){e.setAttribute(t,"")},insertStaticContent(e,t,o,n,r,i){const s=o?o.previousSibling:t.lastChild;if(r&&(r===i||r.nextSibling))for(;t.insertBefore(r.cloneNode(!0),o),!(r===i||!(r=r.nextSibling)););else{ii.innerHTML=n?`<svg>${e}</svg>`:e;const l=ii.content;if(n){const a=l.firstChild;for(;a.firstChild;)l.appendChild(a.firstChild);l.removeChild(a)}t.insertBefore(l,o)}return[s?s.nextSibling:t.firstChild,o?o.previousSibling:t.lastChild]}};function ku(e,t,o){const n=e._vtc;n&&(t=(t?[t,...n]:[...n]).join(" ")),t==null?e.removeAttribute("class"):o?e.setAttribute("class",t):e.className=t}function Yu(e,t,o){const n=e.style,r=re(o);if(o&&!r){if(t&&!re(t))for(const i in t)o[i]==null&&kn(n,i,"");for(const i in o)kn(n,i,o[i])}else{const i=n.display;r?t!==o&&(n.cssText=o):t&&e.removeAttribute("style"),"_vod"in e&&(n.display=i)}}const si=/\s*!important$/;function kn(e,t,o){if(L(o))o.forEach(n=>kn(e,t,n));else if(o==null&&(o=""),t.startsWith("--"))e.setProperty(t,o);else{const n=$u(e,t);si.test(o)?e.setProperty(Ct(n),o.replace(si,""),"important"):e[n]=o}}const ai=["Webkit","Moz","ms"],On={};function $u(e,t){const o=On[t];if(o)return o;let n=Ye(t);if(n!=="filter"&&n in e)return On[t]=n;n=nn(n);for(let r=0;r<ai.length;r++){const i=ai[r]+n;if(i in e)return On[t]=i}return t}const li="http://www.w3.org/1999/xlink";function ju(e,t,o,n,r){if(n&&t.startsWith("xlink:"))o==null?e.removeAttributeNS(li,t.slice(6,t.length)):e.setAttributeNS(li,t,o);else{const i=Fa(t);o==null||i&&!Vi(o)?e.removeAttribute(t):e.setAttribute(t,i?"":o)}}function Wu(e,t,o,n,r,i,s){if(t==="innerHTML"||t==="textContent"){n&&s(n,r,i),e[t]=o??"";return}const l=e.tagName;if(t==="value"&&l!=="PROGRESS"&&!l.includes("-")){e._value=o;const u=l==="OPTION"?e.getAttribute("value"):e.value,c=o??"";u!==c&&(e.value=c),o==null&&e.removeAttribute(t);return}let a=!1;if(o===""||o==null){const u=typeof e[t];u==="boolean"?o=Vi(o):o==null&&u==="string"?(o="",a=!0):u==="number"&&(o=0,a=!0)}try{e[t]=o}catch{}a&&e.removeAttribute(t)}function ze(e,t,o,n){e.addEventListener(t,o,n)}function Gu(e,t,o,n){e.removeEventListener(t,o,n)}function zu(e,t,o,n,r=null){const i=e._vei||(e._vei={}),s=i[t];if(n&&s)s.value=n;else{const[l,a]=qu(t);if(n){const u=i[t]=Qu(n,r);ze(e,l,u,a)}else s&&(Gu(e,l,s,a),i[t]=void 0)}}const ui=/(?:Once|Passive|Capture)$/;function qu(e){let t;if(ui.test(e)){t={};let n;for(;n=e.match(ui);)e=e.slice(0,e.length-n[0].length),t[n[0].toLowerCase()]=!0}return[e[2]===":"?e.slice(3):Ct(e.slice(2)),t]}let Sn=0;const Xu=Promise.resolve(),Ju=()=>Sn||(Xu.then(()=>Sn=0),Sn=Date.now());function Qu(e,t){const o=n=>{if(!n._vts)n._vts=Date.now();else if(n._vts<=o.attached)return;De(Zu(n,o.value),t,5,[n])};return o.value=e,o.attached=Ju(),o}function Zu(e,t){if(L(t)){const o=e.stopImmediatePropagation;return e.stopImmediatePropagation=()=>{o.call(e),e._stopped=!0},t.map(n=>r=>!r._stopped&&n&&n(r))}else return t}const ci=/^on[a-z]/,ec=(e,t,o,n,r=!1,i,s,l,a)=>{t==="class"?ku(e,n,r):t==="style"?Yu(e,o,n):tn(t)?qn(t)||zu(e,t,o,n,s):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):tc(e,t,n,r))?Wu(e,t,n,i,s,l,a):(t==="true-value"?e._trueValue=n:t==="false-value"&&(e._falseValue=n),ju(e,t,n,r))};function tc(e,t,o,n){return n?!!(t==="innerHTML"||t==="textContent"||t in e&&ci.test(t)&&F(o)):t==="spellcheck"||t==="draggable"||t==="translate"||t==="form"||t==="list"&&e.tagName==="INPUT"||t==="type"&&e.tagName==="TEXTAREA"||ci.test(t)&&re(o)?!1:t in e}function Nf(e){const t=mr();if(!t)return;const o=t.ut=(r=e(t.proxy))=>{Array.from(document.querySelectorAll(`[data-v-owner="${t.uid}"]`)).forEach(i=>$n(i,r))},n=()=>{const r=e(t.proxy);Yn(t.subTree,r),o(r)};Fl(n),ur(()=>{const r=new MutationObserver(n);r.observe(t.subTree.el.parentNode,{childList:!0}),cr(()=>r.disconnect())})}function Yn(e,t){if(e.shapeFlag&128){const o=e.suspense;e=o.activeBranch,o.pendingBranch&&!o.isHydrating&&o.effects.push(()=>{Yn(o.activeBranch,t)})}for(;e.component;)e=e.component.subTree;if(e.shapeFlag&1&&e.el)$n(e.el,t);else if(e.type===me)e.children.forEach(o=>Yn(o,t));else if(e.type===to){let{el:o,anchor:n}=e;for(;o&&($n(o,t),o!==n);)o=o.nextSibling}}function $n(e,t){if(e.nodeType===1){const o=e.style;for(const n in t)o.setProperty(`--${n}`,t[n])}}const Qe="transition",Wt="animation",Er=(e,{slots:t})=>Nu(kl,Is(e),t);Er.displayName="Transition";const As={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},oc=Er.props=se({},ls,As),ft=(e,t=[])=>{L(e)?e.forEach(o=>o(...t)):e&&e(...t)},di=e=>e?L(e)?e.some(t=>t.length>1):e.length>1:!1;function Is(e){const t={};for(const V in e)V in As||(t[V]=e[V]);if(e.css===!1)return t;const{name:o="v",type:n,duration:r,enterFromClass:i=`${o}-enter-from`,enterActiveClass:s=`${o}-enter-active`,enterToClass:l=`${o}-enter-to`,appearFromClass:a=i,appearActiveClass:u=s,appearToClass:c=l,leaveFromClass:h=`${o}-leave-from`,leaveActiveClass:_=`${o}-leave-active`,leaveToClass:v=`${o}-leave-to`}=e,b=nc(r),m=b&&b[0],g=b&&b[1],{onBeforeEnter:P,onEnter:M,onEnterCancelled:B,onLeave:D,onLeaveCancelled:U,onBeforeAppear:k=P,onAppear:X=M,onAppearCancelled:x=B}=t,G=(V,oe,Oe)=>{Ze(V,oe?c:l),Ze(V,oe?u:s),Oe&&Oe()},W=(V,oe)=>{V._isLeaving=!1,Ze(V,h),Ze(V,v),Ze(V,_),oe&&oe()},ie=V=>(oe,Oe)=>{const $t=V?X:M,de=()=>G(oe,V,Oe);ft($t,[oe,de]),fi(()=>{Ze(oe,V?a:i),je(oe,V?c:l),di($t)||pi(oe,n,m,de)})};return se(t,{onBeforeEnter(V){ft(P,[V]),je(V,i),je(V,s)},onBeforeAppear(V){ft(k,[V]),je(V,a),je(V,u)},onEnter:ie(!1),onAppear:ie(!0),onLeave(V,oe){V._isLeaving=!0;const Oe=()=>W(V,oe);je(V,h),Ps(),je(V,_),fi(()=>{V._isLeaving&&(Ze(V,h),je(V,v),di(D)||pi(V,n,g,Oe))}),ft(D,[V,Oe])},onEnterCancelled(V){G(V,!1),ft(B,[V])},onAppearCancelled(V){G(V,!0),ft(x,[V])},onLeaveCancelled(V){W(V),ft(U,[V])}})}function nc(e){if(e==null)return null;if(q(e))return[bn(e.enter),bn(e.leave)];{const t=bn(e);return[t,t]}}function bn(e){return Ma(e)}function je(e,t){t.split(/\s+/).forEach(o=>o&&e.classList.add(o)),(e._vtc||(e._vtc=new Set)).add(t)}function Ze(e,t){t.split(/\s+/).forEach(n=>n&&e.classList.remove(n));const{_vtc:o}=e;o&&(o.delete(t),o.size||(e._vtc=void 0))}function fi(e){requestAnimationFrame(()=>{requestAnimationFrame(e)})}let rc=0;function pi(e,t,o,n){const r=e._endId=++rc,i=()=>{r===e._endId&&n()};if(o)return setTimeout(i,o);const{type:s,timeout:l,propCount:a}=Ds(e,t);if(!s)return n();const u=s+"end";let c=0;const h=()=>{e.removeEventListener(u,_),i()},_=v=>{v.target===e&&++c>=a&&h()};setTimeout(()=>{c<a&&h()},l+1),e.addEventListener(u,_)}function Ds(e,t){const o=window.getComputedStyle(e),n=b=>(o[b]||"").split(", "),r=n(`${Qe}Delay`),i=n(`${Qe}Duration`),s=hi(r,i),l=n(`${Wt}Delay`),a=n(`${Wt}Duration`),u=hi(l,a);let c=null,h=0,_=0;t===Qe?s>0&&(c=Qe,h=s,_=i.length):t===Wt?u>0&&(c=Wt,h=u,_=a.length):(h=Math.max(s,u),c=h>0?s>u?Qe:Wt:null,_=c?c===Qe?i.length:a.length:0);const v=c===Qe&&/\b(transform|all)(,|$)/.test(n(`${Qe}Property`).toString());return{type:c,timeout:h,propCount:_,hasTransform:v}}function hi(e,t){for(;e.length<t.length;)e=e.concat(e);return Math.max(...t.map((o,n)=>wi(o)+wi(e[n])))}function wi(e){return Number(e.slice(0,-1).replace(",","."))*1e3}function Ps(){return document.body.offsetHeight}const Rs=new WeakMap,Ls=new WeakMap,Ms={name:"TransitionGroup",props:se({},oc,{tag:String,moveClass:String}),setup(e,{slots:t}){const o=mr(),n=as();let r,i;return ds(()=>{if(!r.length)return;const s=e.moveClass||`${e.name||"v"}-move`;if(!uc(r[0].el,o.vnode.el,s))return;r.forEach(sc),r.forEach(ac);const l=r.filter(lc);Ps(),l.forEach(a=>{const u=a.el,c=u.style;je(u,s),c.transform=c.webkitTransform=c.transitionDuration="";const h=u._moveCb=_=>{_&&_.target!==u||(!_||/transform$/.test(_.propertyName))&&(u.removeEventListener("transitionend",h),u._moveCb=null,Ze(u,s))};u.addEventListener("transitionend",h)})}),()=>{const s=$(e),l=Is(s);let a=s.tag||me;r=i,i=t.default?lr(t.default()):[];for(let u=0;u<i.length;u++){const c=i[u];c.key!=null&&ho(c,po(c,l,n,o))}if(r)for(let u=0;u<r.length;u++){const c=r[u];ho(c,po(c,l,n,o)),Rs.set(c,c.el.getBoundingClientRect())}return Z(a,null,i)}}},ic=e=>delete e.mode;Ms.props;const _i=Ms;function sc(e){const t=e.el;t._moveCb&&t._moveCb(),t._enterCb&&t._enterCb()}function ac(e){Ls.set(e,e.el.getBoundingClientRect())}function lc(e){const t=Rs.get(e),o=Ls.get(e),n=t.left-o.left,r=t.top-o.top;if(n||r){const i=e.el.style;return i.transform=i.webkitTransform=`translate(${n}px,${r}px)`,i.transitionDuration="0s",e}}function uc(e,t,o){const n=e.cloneNode();e._vtc&&e._vtc.forEach(s=>{s.split(/\s+/).forEach(l=>l&&n.classList.remove(l))}),o.split(/\s+/).forEach(s=>s&&n.classList.add(s)),n.style.display="none";const r=t.nodeType===1?t:t.parentNode;r.appendChild(n);const{hasTransform:i}=Ds(n);return r.removeChild(n),i}const at=e=>{const t=e.props["onUpdate:modelValue"]||!1;return L(t)?o=>Vo(t,o):t};function cc(e){e.target.composing=!0}function mi(e){const t=e.target;t.composing&&(t.composing=!1,t.dispatchEvent(new Event("input")))}const gi={created(e,{modifiers:{lazy:t,trim:o,number:n}},r){e._assign=at(r);const i=n||r.props&&r.props.type==="number";ze(e,t?"change":"input",s=>{if(s.target.composing)return;let l=e.value;o&&(l=l.trim()),i&&(l=$o(l)),e._assign(l)}),o&&ze(e,"change",()=>{e.value=e.value.trim()}),t||(ze(e,"compositionstart",cc),ze(e,"compositionend",mi),ze(e,"change",mi))},mounted(e,{value:t}){e.value=t??""},beforeUpdate(e,{value:t,modifiers:{lazy:o,trim:n,number:r}},i){if(e._assign=at(i),e.composing||document.activeElement===e&&e.type!=="range"&&(o||n&&e.value.trim()===t||(r||e.type==="number")&&$o(e.value)===t))return;const s=t??"";e.value!==s&&(e.value=s)}},dc={deep:!0,created(e,t,o){e._assign=at(o),ze(e,"change",()=>{const n=e._modelValue,r=Ft(e),i=e.checked,s=e._assign;if(L(n)){const l=Qn(n,r),a=l!==-1;if(i&&!a)s(n.concat(r));else if(!i&&a){const u=[...n];u.splice(l,1),s(u)}}else if(Bt(n)){const l=new Set(n);i?l.add(r):l.delete(r),s(l)}else s(Vs(e,i))})},mounted:Ei,beforeUpdate(e,t,o){e._assign=at(o),Ei(e,t,o)}};function Ei(e,{value:t,oldValue:o},n){e._modelValue=t,L(t)?e.checked=Qn(t,n.props.value)>-1:Bt(t)?e.checked=t.has(n.props.value):t!==o&&(e.checked=vt(t,Vs(e,!0)))}const fc={created(e,{value:t},o){e.checked=vt(t,o.props.value),e._assign=at(o),ze(e,"change",()=>{e._assign(Ft(e))})},beforeUpdate(e,{value:t,oldValue:o},n){e._assign=at(n),t!==o&&(e.checked=vt(t,n.props.value))}},pc={deep:!0,created(e,{value:t,modifiers:{number:o}},n){const r=Bt(t);ze(e,"change",()=>{const i=Array.prototype.filter.call(e.options,s=>s.selected).map(s=>o?$o(Ft(s)):Ft(s));e._assign(e.multiple?r?new Set(i):i:i[0])}),e._assign=at(n)},mounted(e,{value:t}){vi(e,t)},beforeUpdate(e,t,o){e._assign=at(o)},updated(e,{value:t}){vi(e,t)}};function vi(e,t){const o=e.multiple;if(!(o&&!L(t)&&!Bt(t))){for(let n=0,r=e.options.length;n<r;n++){const i=e.options[n],s=Ft(i);if(o)L(t)?i.selected=Qn(t,s)>-1:i.selected=t.has(s);else if(vt(Ft(i),t)){e.selectedIndex!==n&&(e.selectedIndex=n);return}}!o&&e.selectedIndex!==-1&&(e.selectedIndex=-1)}}function Ft(e){return"_value"in e?e._value:e.value}function Vs(e,t){const o=t?"_trueValue":"_falseValue";return o in e?e[o]:t}const xf={created(e,t,o){Po(e,t,o,null,"created")},mounted(e,t,o){Po(e,t,o,null,"mounted")},beforeUpdate(e,t,o,n){Po(e,t,o,n,"beforeUpdate")},updated(e,t,o,n){Po(e,t,o,n,"updated")}};function hc(e,t){switch(e){case"SELECT":return pc;case"TEXTAREA":return gi;default:switch(t){case"checkbox":return dc;case"radio":return fc;default:return gi}}}function Po(e,t,o,n,r){const s=hc(e.tagName,o.props&&o.props.type)[r];s&&s(e,t,o,n)}const wc=["ctrl","shift","alt","meta"],_c={stop:e=>e.stopPropagation(),prevent:e=>e.preventDefault(),self:e=>e.target!==e.currentTarget,ctrl:e=>!e.ctrlKey,shift:e=>!e.shiftKey,alt:e=>!e.altKey,meta:e=>!e.metaKey,left:e=>"button"in e&&e.button!==0,middle:e=>"button"in e&&e.button!==1,right:e=>"button"in e&&e.button!==2,exact:(e,t)=>wc.some(o=>e[`${o}Key`]&&!t.includes(o))},Kf=(e,t)=>(o,...n)=>{for(let r=0;r<t.length;r++){const i=_c[t[r]];if(i&&i(o,t))return}return e(o,...n)},mc={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Ff=(e,t)=>o=>{if(!("key"in o))return;const n=Ct(o.key);if(t.some(r=>r===n||mc[r]===n))return e(o)},Bf={beforeMount(e,{value:t},{transition:o}){e._vod=e.style.display==="none"?"":e.style.display,o&&t?o.beforeEnter(e):Gt(e,t)},mounted(e,{value:t},{transition:o}){o&&t&&o.enter(e)},updated(e,{value:t,oldValue:o},{transition:n}){!t!=!o&&(n?t?(n.beforeEnter(e),Gt(e,!0),n.enter(e)):n.leave(e,()=>{Gt(e,!1)}):Gt(e,t))},beforeUnmount(e,{value:t}){Gt(e,t)}};function Gt(e,t){e.style.display=t?e._vod:"none"}const gc=se({patchProp:ec},Uu);let Ci;function Ec(){return Ci||(Ci=_u(gc))}const vc=(...e)=>{const t=Ec().createApp(...e),{mount:o}=t;return t.mount=n=>{const r=Cc(n);if(!r)return;const i=t._component;!F(i)&&!i.render&&!i.template&&(i.template=r.innerHTML),r.innerHTML="";const s=o(r,!1,r instanceof SVGElement);return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),s},t};function Cc(e){return re(e)?document.querySelector(e):e}const yc=500,yi=2,Ti=3;let An=null;const Tc={mounted(){document.addEventListener("keydown",this.onKeyDownCtrlShiftSelect),document.addEventListener("click",this.onInputClickSelect)},unmounted(){document.removeEventListener("keydown",this.onKeyDownCtrlShiftSelect),document.removeEventListener("click",this.onInputClickSelect)},data(){return{inputClickDiscardTimeout:null,inputClickCounter:0}},methods:{onInputClickSelect(e){let t=document.activeElement;!t||t.tagName!=="INPUT"&&t.tagName!=="TEXTAREA"||(clearTimeout(this.inputClickDiscardTimeout),e.target!==An&&(this.discardClickedInput(),An=e.target),++this.inputClickCounter,this.inputClickCounter===yi&&this.selectWordAfterClick(t),this.inputClickCounter===Ti&&this.selectStringAfterClick(t),this.inputClickCounter>=Ti&&this.inputClickCounter>=yi&&(this.inputClickCounter=0),this.inputClickDiscardTimeout=setTimeout(this.discardClickedInput,yc))},discardClickedInput(){An=null,this.inputClickCounter=0},selectWordAfterClick(e){const t=this.mixinFindWordStart(e.value,e.selectionStart),o=this.mixinFindWordEnd(e.value,e.selectionStart);e.setSelectionRange(t,o)},selectStringAfterClick(e){e.setSelectionRange(0,e.value.length)},onKeyDownCtrlShiftSelect(e){if(e.ctrlKey&&(e.code==="ArrowLeft"||e.code==="ArrowRight")){e.preventDefault();let t=document.activeElement;(t&&t.tagName==="INPUT"||t.tagName==="TEXTAREA")&&this.mixinHandleCtrlArrow(t,e.code,e.shiftKey)}},mixinHandleCtrlArrow(e,t,o){const n=e.value,r=e.selectionStart,i=e.selectionEnd,s=r!==i,l=e.selectionDirection==="backward";let a,u=[0,0],c="forward";t==="ArrowLeft"?s&&!l?(a=this.mixinFindWordToSelectEnd(n,i,!0),u=[r,a]):(a=this.mixinFindWordToSelectStart(n,r),u=[a,i],c="backward"):t==="ArrowRight"&&(s&&l?(a=this.mixinFindWordToSelectStart(n,r,!0),u=[a,i],c="backward"):(a=this.mixinFindWordToSelectEnd(n,i),u=[r,a])),o?(e.setSelectionRange(...u),e.selectionDirection=c):e.setSelectionRange(a,a)},mixinFindWordToSelectStart(e,t,o=!1){if(!o&&t<=0||o&&t>=e.length)return t;let n=this.mixinFindWordStart(e,t),r=t;for(;o&&n<=t||!o&&n>=t;)n=this.mixinFindWordStart(e,r),r=o?r+1:r-1,o&&r===e.length?n=e.length:!o&&r===0&&(n=0);return n},mixinFindWordToSelectEnd(e,t,o=!1){let n=this.mixinFindWordEnd(e,t),r=t;for(;o&&n>=t||!o&&n<=t;)n=this.mixinFindWordEnd(e,r),o&&r===0&&(n=r),!o&&r===e.length-1&&(n=r),r=o?r-1:r+1;return n},mixinFindWordStart(e,t){for(;t>0&&/\s/.test(e[t-1])===!1;)t--;return t},mixinFindWordEnd(e,t){for(;t<e.length&&/\s/.test(e[t])===!1;)t++;return t}}},Oc={class:"loading-preloader iface-container"};function Sc(e,t,o,n,r,i){return ve(),Me("div",Oc)}const hn=(e,t)=>{const o=e.__vccOpts||e;for(const[n,r]of t)o[n]=r;return o},bc={},Ac=hn(bc,[["render",Sc]]),Ic={Preloader:Ac,FirstPersonConfig:f(()=>d(()=>import("./FirstPersonConfig.js"),["./FirstPersonConfig.js","./RangeSlider.js","./RangeSlider.css","./FirstPersonConfig.css"],import.meta.url)),InventoryNew:f(()=>d(()=>import("./Inventory.js"),["./Inventory.js","./dom.js","./DragAndDropMixin.js","./drag_and_drop.js","./DragAndDropMixin.css","./ItemInfo.js","./CarNumberPlate.js","./CarNumberPlate.css","./PressButton.js","./inventory2.js","./ScrollableContainer.js","./ScrollableContainer.css","./mouse.js","./telegram-authenticator.js","./ok.js","./PressButton.css","./warning-icon.js","./icon-info.js","./none.js","./money.js","./chip.js","./Close.js","./close2.js","./Button.js","./donate.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./Inventory.css"],import.meta.url)),Containers:f(()=>d(()=>import("./Containers.js"),["./Containers.js","./waves.js","./close3.js","./ItemInfo.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Button2.js","./BaseButton.css","./numbers.js","./Containers.css"],import.meta.url)),MiamiTicket:f(()=>d(()=>import("./MiamiTicket.js"),["./MiamiTicket.js","./close4.js","./MiamiTicket.css"],import.meta.url)),DanceTrack:f(()=>d(()=>import("./DanceTrack.js"),["./DanceTrack.js","./DanceInfo.js","./DanceTrack.css"],import.meta.url)),DanceList:f(()=>d(()=>import("./DanceList.js"),["./DanceList.js","./DanceInfo.js","./DanceList.css"],import.meta.url)),WindowCleaner:f(()=>d(()=>import("./WindowCleaner.js"),["./WindowCleaner.js","./WindowCleaner.css"],import.meta.url)),JobCard:f(()=>d(()=>import("./JobCard.js"),["./JobCard.js","./JobCard.css"],import.meta.url)),LifeGuardHeal:f(()=>d(()=>import("./LifeGuardHeal.js"),["./LifeGuardHeal.js","./LifeGuardHeal.css"],import.meta.url)),DisplayText:f(()=>d(()=>import("./DisplayText.js"),["./DisplayText.js","./DisplayText.css"],import.meta.url)),QuestsProgressInfo:f(()=>d(()=>import("./QuestsProgressInfo.js"),["./QuestsProgressInfo.js","./QuestsInfo.js","./QuestsProgressInfo.css"],import.meta.url)),QuestsTalks:f(()=>d(()=>import("./QuestsTalks.js"),["./QuestsTalks.js","./QuestsInfo.js","./QuestsTalks.css"],import.meta.url)),Hud:f(()=>d(()=>import("./Hud.js"),["./Hud.js","./hint2.js","./dom.js","./ScrollableContainer.js","./ScrollableContainer.css","./index2.js","./colors.js","./index3.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./numbers.js","./MobileButton.js","./logo.js","./MobileButton.css","./index4.js","./RangeSlider.js","./RangeSlider.css","./Hud.css"],import.meta.url)),Trade:f(()=>d(()=>import("./Trade.js"),["./Trade.js","./retry.js","./RubleIcon.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./Trade.css"],import.meta.url)),TradeItems:f(()=>d(()=>import("./TradeItems.js"),["./TradeItems.js","./drag_and_drop.js","./ItemInfo.js","./CarNumberPlate.js","./CarNumberPlate.css","./PressButton.js","./inventory2.js","./dom.js","./ScrollableContainer.js","./ScrollableContainer.css","./mouse.js","./telegram-authenticator.js","./ok.js","./PressButton.css","./numbers.js","./money.js","./exchange.js","./Close.js","./close2.js","./Button.js","./donate.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./TradeItems.css"],import.meta.url)),TradeSkin:f(()=>d(()=>import("./TradeSkin.js"),["./TradeSkin.js","./numbers.js","./offer2.js","./TradeSkin.css"],import.meta.url)),FootballInfo:f(()=>d(()=>import("./Info.js"),["./Info.js","./FootballMixin.js","./CommandLogo.js","./CommandLogo.css","./star.js","./Info.css","./_styles.css"],import.meta.url)),FootballImpactForce:f(()=>d(()=>import("./ImpactForce.js"),["./ImpactForce.js","./ImpactForce.css","./_styles.css"],import.meta.url)),FootballScoreboard:f(()=>d(()=>import("./Scoreboard.js"),["./Scoreboard.js","./CommandLogo.js","./CommandLogo.css","./Scoreboard.css","./_styles.css"],import.meta.url)),FootballPositions:f(()=>d(()=>import("./Positions.js"),["./Positions.js","./icons.js","./FootballMixin.js","./Positions.css","./_styles.css"],import.meta.url)),FootballCreateMatch:f(()=>d(()=>import("./CreateMatch.js"),["./CreateMatch.js","./CommandLogo.js","./CommandLogo.css","./Rubl.js","./Quit.js","./numbers.js","./CreateMatch.css","./_styles.css"],import.meta.url)),FootballBets:f(()=>d(()=>import("./Bets.js"),["./Bets.js","./CommandLogo.js","./CommandLogo.css","./Rubl.js","./Quit.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Bets.css","./_styles.css"],import.meta.url)),FootballCreateCommand:f(()=>d(()=>import("./CreateCommand.js"),["./CreateCommand.js","./CommandLogo.js","./CommandLogo.css","./Quit.js","./Rubl.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./CreateCommand.css"],import.meta.url)),FootballPlayer:f(()=>d(()=>import("./Player.js"),["./Player.js","./star.js","./unlike.js","./9.js","./arrow.js","./unlike2.js","./Quit.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./clubs.js","./Player.css","./_styles.css"],import.meta.url)),FootballClub:f(()=>d(()=>import("./Club.js"),["./Club.js","./CommandLogo.js","./CommandLogo.css","./FootballMixin.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./clubs.js","./Club.css","./_styles.css"],import.meta.url)),FootballViewer:f(()=>d(()=>import("./Viewer.js"),["./Viewer.js","./unlike2.js","./Viewer.css"],import.meta.url)),FootballTraining:f(()=>d(()=>import("./Training.js"),["./Training.js","./7.js","./Training.css"],import.meta.url)),FootballTop:f(()=>d(()=>import("./Top.js"),["./Top.js","./CommandLogo.js","./CommandLogo.css","./Search.js","./clubs.js","./arrow.js","./Top.css","./_styles.css"],import.meta.url)),FootballCardSelection:f(()=>d(()=>import("./CardSelection.js"),["./CardSelection.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./close5.js","./CardSelection.css"],import.meta.url)),FootballMatchStatistic:f(()=>d(()=>import("./MatchStatistic.js"),["./MatchStatistic.js","./9.js","./CommandLogo.js","./CommandLogo.css","./FootballMixin.js","./numbers.js","./star2.js","./MatchStatistic.css"],import.meta.url)),FootballPoints:f(()=>d(()=>import("./Points.js"),["./Points.js","./Points.css","./_styles.css"],import.meta.url)),FootballStats:f(()=>d(()=>import("./Stats.js"),["./Stats.js","./9.js","./CommandLogo.js","./CommandLogo.css","./Stats.css","./_styles.css"],import.meta.url)),BuyCarNumber:f(()=>d(()=>import("./BuyCarNumber.js"),["./BuyCarNumber.js","./reload.js","./CarNumberPlate.js","./CarNumberPlate.css","./Button2.js","./BaseButton.css","./numbers.js","./money.js","./BuyCarNumber.css"],import.meta.url)),Tinting:f(()=>d(()=>import("./Tinting.js"),["./Tinting.js","./tilde.js","./Tinting.css"],import.meta.url)),TintingOrder:f(()=>d(()=>import("./TintingOrder.js"),["./TintingOrder.js","./close6.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./RangeSlider.js","./RangeSlider.css","./numbers.js","./TintingOrder.css"],import.meta.url)),Ticket:f(()=>d(()=>import("./Ticket.js"),["./Ticket.js","./RubleIcon.js","./plus.js","./Ticket.css"],import.meta.url)),TruckersCarPark:f(()=>d(()=>import("./CarPark.js"),["./CarPark.js","./icons.js","./ruble.js","./check.js","./TruckScheme.js","./carBrands.js","./CarShopInfo.js","./TruckScheme.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./CarPark.css"],import.meta.url)),DrivingExam:f(()=>d(()=>import("./DrivingExam.js"),["./DrivingExam.js","./1.js","./icon_pdd_preview.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./DrivingExam.css"],import.meta.url)),DrivingExamTheory:f(()=>d(()=>import("./DrivingExamTheory.js"),["./DrivingExamTheory.js","./icon_pdd_preview.js","./DrivingExamTheory.css"],import.meta.url)),TruckRepair:f(()=>d(()=>import("./TruckRepair.js"),["./TruckRepair.js","./TruckScheme.js","./carBrands.js","./CarShopInfo.js","./TruckScheme.css","./RubleIcon.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./close7.js","./TruckRepair.css"],import.meta.url)),ProductLoad:f(()=>d(()=>import("./ProductLoad.js"),["./ProductLoad.js","./check.js","./ProductLoad.css"],import.meta.url)),ClothingShop:f(()=>d(()=>import("./ClothingShop.js"),["./ClothingShop.js","./back.js","./ClothingShop.css"],import.meta.url)),CharacterEditor:f(()=>d(()=>import("./CharacterEditor.js"),["./CharacterEditor.js","./confirm.js","./CharacterEditor.css"],import.meta.url)),GarbageAuctions:f(()=>d(()=>import("./Auctions.js"),["./Auctions.js","./ruble2.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ItemInfo.js","./Auctions.css"],import.meta.url)),Fuel:f(()=>d(()=>import("./Fuel.js"),["./Fuel.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./logo2.js","./numbers.js","./Fuel.css"],import.meta.url)),Stall:f(()=>d(()=>import("./Main.js"),["./Main.js","./ItemInfo.js","./CarNumberPlate.js","./CarNumberPlate.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Close8.js","./goods-bottom.js","./Main.css"],import.meta.url)),StallManage:f(()=>d(()=>import("./Manage.js"),["./Manage.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Close8.js","./11.js","./Manage.css"],import.meta.url)),StallCard:f(()=>d(()=>import("./Card.js"),["./Card.js","./Close8.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./shop.js","./Card.css"],import.meta.url)),GarbageMetalSearch:f(()=>d(()=>import("./MetalSearch.js"),["./MetalSearch.js","./search2.js","./MetalSearch.css"],import.meta.url)),Fishing:f(()=>d(()=>import("./Fishing.js"),["./Fishing.js","./Fishing.css"],import.meta.url)),InfoCard:f(()=>d(()=>import("./InfoCard.js"),["./InfoCard.js","./house.js","./numbers.js","./InfoCard.css"],import.meta.url)),Capture:f(()=>d(()=>import("./Capture.js"),["./Capture.js","./Capture.css"],import.meta.url)),CarsShop:f(()=>d(()=>import("./CarsShop.js"),["./CarsShop.js","./92.js","./trailer.js","./trailer2.js","./trailer3.js","./trailer4.js","./trailer5.js","./CarShopInfo.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./numbers.js","./cancel-icon.js","./CarsShop.css"],import.meta.url)),Window:f(()=>d(()=>import("./Window.js"),["./Window.js","./dom.js","./Modal.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./GraffitiPattern.js","./GraffitiPattern.css","./Modal.css","./ScrollableContainer.js","./ScrollableContainer.css","./ModalMobileButtons.js","./Button3.js","./Button2.css","./ModalMobileButtons.css","./ContaineredButton.js","./ButtonContainer.js","./ButtonContainer.css","./InputField.js","./globals.js","./InputField.css","./ArrowButton.js","./ArrowButton.css","./Window.css"],import.meta.url)),Craft:f(()=>d(()=>import("./Craft.js"),["./Craft.js","./92.js","./trailer.js","./trailer2.js","./trailer4.js","./trailer5.js","./TabButtons.js","./TabButtons.css","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Hint3.js","./Hint.css","./Close.js","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./ItemInfo.js","./carBrands.js","./CarShopInfo.js","./numbers.js","./error.js","./Craft.css"],import.meta.url)),CasinoCards:f(()=>d(()=>import("./Cards.js"),["./Cards.js","./close9.js","./numbers.js","./chip2.js","./Cards.css"],import.meta.url)),CasinoBlackjack:f(()=>d(()=>import("./Blackjack.js"),["./Blackjack.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./numbers.js","./stub.js","./chip2.js","./BaseButton.js","./BaseButton.css","./Blackjack.css"],import.meta.url)),CasinoDice:f(()=>d(()=>import("./Dice.js"),["./Dice.js","./wait.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./chip2.js","./Dice.css"],import.meta.url)),CasinoRullet:f(()=>d(()=>import("./Rullet.js"),["./Rullet.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./chips.js","./chip2.js","./Rullet.css"],import.meta.url)),CasinoSlots:f(()=>d(()=>import("./Slots.js"),["./Slots.js","./next.js","./numbers.js","./chip2.js","./Slots.css"],import.meta.url)),CasinoRoll:f(()=>d(()=>import("./Roll.js"),["./Roll.js","./result-circle.js","./Roll.css"],import.meta.url)),CasinoExchange:f(()=>d(()=>import("./CasinoExchange.js"),["./CasinoExchange.js","./black-bg.js","./illustration_0.js","./editor.js","./star3.js","./top-black-line.js","./copy.js","./arrow2.js","./top-arrow.js","./ok2.js","./yandex.js","./wrong.js","./illustration.js","./force.js","./money-1.js","./none2.js","./zw.js","./12.js","./open.js","./reload.js","./13.js","./shoot2.js","./trunkIcon.js","./4.js","./close10.js","./cancel-icon.js","./92.js","./trailer.js","./trailer2.js","./trailer4.js","./trailer5.js","./trailer3.js","./secret-particles.js","./93.js","./stub.js","./close9.js","./chip2.js","./wait.js","./result-circle.js","./chips.js","./next.js","./trash.js","./confirm.js","./close7.js","./back.js","./check2.js","./remove.js","./14.js","./waves.js","./close3.js","./error.js","./close11.js","./reward-particle.js","./lamp.js","./dead.js","./wear-wrench.js","./mark.js","./passport.js","./stamp.js","./dp.js","./Members.js","./free.js","./2.js","./vector.js","./x.js","./1.js","./table_BG.js","./94.js","./stone-tablet.js","./view.js","./engine.js","./ring.js","./pointer-icon.js","./close5.js","./star.js","./clubs.js","./unlike.js","./9.js","./star2.js","./arrow.js","./unlike2.js","./7.js","./wide_radial_mobile.js","./logo2.js","./bg.js","./icon.js","./ruble2.js","./search2.js","./tankIcon.js","./triangle_passive.js","./paper.js","./back2.js","./logo-finish.js","./logo3.js","./close12.js","./waiting-bg.js","./yellow-potion.js","./time.js","./illustration_1.js","./bomb.js","./line.js","./time2.js","./screamer.js","./taxi-preview.js","./341.js","./roll2.js","./hint2.js","./logo.js","./telegram-authenticator.js","./Button.js","./close2.js","./donate.js","./money.js","./Button.css","./logo_radmir.js","./icon-silver-vip.js","./house.js","./time3.js","./arrow3.js","./mouse.js","./chip.js","./paper2.js","./close13.js","./waiting.js","./spoiler-cell-separator.js","./send.js","./not-found.js","./background-3.js","./warning-icon.js","./icon-story.js","./icon-warning_white.js","./mark2.js","./icon-info.js","./icon-zoom.js","./gold_battle_pass.js","./unusual.js","./none.js","./close4.js","./stop.js","./timer.js","./label.js","./none3.js","./wallet.js","./stars.js","./wallet2.js","./placeholder.js","./22.js","./query.js","./bg2.js","./title.js","./radmir.js","./frame.js","./star-filled.js","./pointer.js","./stalls.js","./send2.js","./bell.js","./weapon-bg.js","./timer2.js","./timer3.js","./goods-bottom.js","./shop.js","./11.js","./stun2.js","./line2.js","./right-window_active.js","./speed.js","./plus.js","./close6.js","./tilde.js","./toilet-dirty.js","./retry.js","./exchange.js","./offer2.js","./close14.js","./skilled.js","./timer4.js","./ruble.js","./check.js","./close_mobile.js","./MenuCurrentIcon.js","./stock-item-light.js","./arrow4.js","./default.js","./logo4.js","./tuning_pneuma_logo_opacity_mobile.js","./72.js","./title-icon.js","./circle.js","./23.js","./bg3.js","./particles-black-jack.js","./underline_card_active_selected.js","./15.js","./weight_red.js","./ok.js","./tech.js","./thunder.js","./ButtonContainer.js","./ButtonContainer.css","./numbers.js","./CasinoExchange.css"],import.meta.url)),Watch:f(()=>d(()=>import("./Watch.js"),["./Watch.js","./15.js","./Watch.css"],import.meta.url)),Overlay:f(()=>d(()=>import("./Overlay.js"),["./Overlay.js","./dom.js","./Overlay.css"],import.meta.url)),Gardens:f(()=>d(()=>import("./Gardens.js"),["./Gardens.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Toggle.js","./Toggle.css","./tankIcon.js","./numbers.js","./Gardens.css"],import.meta.url)),Paintball:f(()=>d(()=>import("./Paintball.js"),["./Paintball.js","./numbers.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./title.js","./Paintball.css"],import.meta.url)),Loading:f(()=>d(()=>import("./Loading.js"),["./Loading.js","./dom.js","./AnimatedLogo.js","./logo_radmir.js","./AnimatedLogo.css","./GraffitiPattern.js","./GraffitiPattern.css","./Loading.css"],import.meta.url)),NewYear:f(()=>d(()=>import("./NewYear.js"),["./NewYear.js","./none3.js","./Button2.js","./BaseButton.css","./numbers.js","./wallet2.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./NewYear.css"],import.meta.url)),Helloween:f(()=>d(()=>import("./Helloween.js"),["./Helloween.js","./illustration_1.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Close.js","./Close.css","./numbers.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Helloween.css"],import.meta.url)),Phone:f(()=>d(()=>import("./Phone.js"),["./Phone.js","./time4.js","./timeZone.js","./taxi-preview.js","./Toggle.js","./Toggle.css","./dom.js","./ScrollableContainer.js","./ScrollableContainer.css","./numbers.js","./GPSPoints.js","./frame.js","./DefaultMapMarkerOverwrite.js","./Button4.js","./Button3.css","./Point.js","./Back3.js","./ArrowTop.js","./stars.js","./CloseMobile.js","./Phone.css"],import.meta.url)),PhoneAppPhoto:f(()=>d(()=>import("./Photo.js"),["./Photo.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Photo.css"],import.meta.url)),Drift:f(()=>d(()=>import("./Drift.js"),["./Drift.js","./trailer3.js","./numbers.js","./x.js","./Drift.css"],import.meta.url)),Music:f(()=>d(()=>import("./Music.js"),["./Music.js","./stop.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Music.css"],import.meta.url)),MusicPlayer:f(()=>d(()=>import("./MusicPlayer.js"),["./MusicPlayer.js","./MusicPlayer.css"],import.meta.url)),Report:f(()=>d(()=>import("./Report.js"),["./Report.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./dom.js","./time4.js","./send2.js","./Report.css"],import.meta.url)),Police:f(()=>d(()=>import("./Police.js"),["./Police.js","./star-filled.js","./telegram-authenticator.js","./close2.js","./DefaultMapMarkerOverwrite.js","./dom.js","./money.js","./Police.css"],import.meta.url)),AdminSpectate:f(()=>d(()=>import("./AdminSpectate.js"),["./AdminSpectate.js","./copy.js","./AdminSpectate.css"],import.meta.url)),Notification:f(()=>d(()=>import("./Notification.js"),["./Notification.js","./query.js","./Notification.css"],import.meta.url)),Billiard:f(()=>d(()=>import("./Billiard.js"),["./Billiard.js","./force.js","./numbers.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Billiard.css"],import.meta.url)),Accessories:f(()=>d(()=>import("./Accessories.js"),["./Accessories.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./TabButtons.js","./TabButtons.css","./Cards2.js","./RubleIcon.js","./Cards2.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Hint3.js","./Hint.css","./Close.js","./Close.css","./StorePreview.js","./ArrowButton.js","./ArrowButton.css","./numbers.js","./BaseButton.js","./BaseButton.css","./StorePreview.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./editor.js","./Accessories.css"],import.meta.url)),Auction:f(()=>d(()=>import("./Auction.js"),["./Auction.js","./top-arrow.js","./telegram-authenticator.js","./Button.js","./close2.js","./donate.js","./money.js","./Button.css","./TabButtons.js","./TabButtons.css","./RangeSlider.js","./RangeSlider.css","./numbers.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Close.js","./Close.css","./Auction.css"],import.meta.url)),ProgressBar:f(()=>d(()=>import("./ProgressBar.js"),["./ProgressBar.js","./RadialProgressBar.js","./RadialProgressBar.css","./ProgressBar.css"],import.meta.url)),BusTimer:f(()=>d(()=>import("./BusTimer.js"),["./BusTimer.js","./BusTimer.css"],import.meta.url)),Machinist:f(()=>d(()=>import("./Machinist.js"),["./Machinist.js","./Button4.js","./Button3.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./numbers.js","./Machinist.css"],import.meta.url)),GameText:f(()=>d(()=>import("./GameText.js"),["./GameText.js","./bg.js","./GameText.css"],import.meta.url)),Appartament:f(()=>d(()=>import("./Appartament.js"),["./Appartament.js","./open.js","./Heading.js","./Heading.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./numbers.js","./style.css"],import.meta.url)),FishingWork:f(()=>d(()=>import("./FishingWork.js"),["./FishingWork.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./FishingWork.css"],import.meta.url)),Business:f(()=>d(()=>import("./Business.js"),["./Business.js","./open.js","./Heading.js","./Heading.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./numbers.js","./style.css"],import.meta.url)),Shoot:f(()=>d(()=>import("./Shoot.js"),["./Shoot.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./weapon-bg.js","./close2.js","./Shoot.css"],import.meta.url)),Hint:f(()=>d(()=>import("./Hint.js"),["./Hint.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Hint2.css"],import.meta.url)),Select:f(()=>d(()=>import("./Select.js"),["./Select.js","./Button4.js","./Button3.css","./Select.css"],import.meta.url)),BuyTicket:f(()=>d(()=>import("./BuyTicket.js"),["./BuyTicket.js","./13.js","./Heading.js","./Heading.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./RubleIcon.js","./numbers.js","./BuyTicket.css"],import.meta.url)),Connect:f(()=>d(()=>import("./Connect.js"),["./Connect.js","./index2.js","./RadialProgressBar.js","./RadialProgressBar.css","./Connect.css"],import.meta.url)),Keyboard:f(()=>d(()=>import("./Keyboard.js"),["./Keyboard.js","./index3.js","./Bind.js","./send.js","./Keyboard.css"],import.meta.url)),LoadingScreen:f(()=>d(()=>import("./LoadingScreen.js"),["./LoadingScreen.js","./background-3.js","./LoadingScreen.css"],import.meta.url)),GameUpdate:f(()=>d(()=>import("./GameUpdate.js"),["./GameUpdate.js","./GameUpdate.css"],import.meta.url)),PlayerInteraction:f(()=>d(()=>import("./PlayerInteraction.js"),["./PlayerInteraction.js","./wide_radial_mobile.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./dom.js","./PlayerInteraction.css"],import.meta.url)),TuningStage:f(()=>d(()=>import("./Stage.js"),["./Stage.js","./arrow4.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Hint3.js","./Hint.css","./Close.js","./Close.css","./dom.js","./MobileButton2.js","./MobileButton2.css","./numbers.js","./close_mobile.js","./Stage.css"],import.meta.url)),TuningSprings:f(()=>d(()=>import("./Springs.js"),["./Springs.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./stock-item-light.js","./MobileButton2.js","./MobileButton2.css","./numbers.js","./close_mobile.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Springs.css"],import.meta.url)),TuningMenu:f(()=>d(()=>import("./Menu.js"),["./Menu.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./MenuCurrentIcon.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./AnimatedLogo.js","./logo_radmir.js","./AnimatedLogo.css","./Button3.js","./Button2.css","./numbers.js","./array.js","./Menu.css"],import.meta.url)),TuningPneuma:f(()=>d(()=>import("./Pneuma.js"),["./Pneuma.js","./tuning_pneuma_logo_opacity_mobile.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./numbers.js","./MobileButton2.js","./MobileButton2.css","./close_mobile.js","./Pneuma.css"],import.meta.url)),TuningPlayerPneuma:f(()=>d(()=>import("./PlayerPneuma.js"),["./PlayerPneuma.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Subtitle.js","./Subtitle.css","./logo4.js","./Close.js","./Close.css","./PlayerPneuma.css"],import.meta.url)),GangColor:f(()=>d(()=>import("./Color.js"),["./Color.js","./Heading.js","./Heading.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./black-bg.js","./arrow2.js","./Color.css"],import.meta.url)),GangCreate:f(()=>d(()=>import("./Create.js"),["./Create.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./numbers.js","./Create.css"],import.meta.url)),ClothingStore:f(()=>d(()=>import("./ClothingStore.js"),["./ClothingStore.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Cards2.js","./RubleIcon.js","./Cards2.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./StorePreview.js","./ArrowButton.js","./ArrowButton.css","./numbers.js","./BaseButton.js","./BaseButton.css","./StorePreview.css","./SmallSkinIds.js","./ClothingStore.css"],import.meta.url)),Death:f(()=>d(()=>import("./Death.js"),["./Death.js","./Button3.js","./Button2.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Death.css"],import.meta.url)),Menu:f(()=>d(()=>import("./Menu2.js"),["./Menu2.js","./Heading.js","./Heading.css","./back2.js","./Toggle.js","./Toggle.css","./RangeSlider.js","./RangeSlider.css","./dom.js","./Back3.js","./Menu2.css"],import.meta.url)),Rating:f(()=>d(()=>import("./Rating.js"),["./Rating.js","./Heading.js","./Heading.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Rating.css"],import.meta.url)),WeaponShop:f(()=>d(()=>import("./WeaponShop.js"),["./WeaponShop.js","./menu3.js","./index4.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./weight_red.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./ok.js","./TextHint.js","./icon-info.js","./TextHint.css","./Button3.js","./Button2.css","./Modal.js","./GraffitiPattern.js","./GraffitiPattern.css","./Modal.css","./ModalMobileButtons.js","./ModalMobileButtons.css","./globals.js","./WeaponShop.css"],import.meta.url)),Billboard:f(()=>d(()=>import("./Billboard.js"),["./Billboard.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./TabButtons.js","./TabButtons.css","./Cards2.js","./RubleIcon.js","./Cards2.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Container.js","./Container.css","./Hint3.js","./Hint.css","./Close.js","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Billboard.css"],import.meta.url)),ItemStore:f(()=>d(()=>import("./ItemStore.js"),["./ItemStore.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./TabButtons.js","./TabButtons.css","./Cards2.js","./RubleIcon.js","./Cards2.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Hint3.js","./Hint.css","./Close.js","./Close.css","./StorePreview.js","./ArrowButton.js","./ArrowButton.css","./numbers.js","./BaseButton.js","./BaseButton.css","./StorePreview.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./ItemStore.css"],import.meta.url)),Stun:f(()=>d(()=>import("./Stun.js"),["./Stun.js","./stun2.js","./Stun.css"],import.meta.url)),Diagnostics:f(()=>d(()=>import("./Diagnostics.js"),["./Diagnostics.js","./Rubl.js","./wear-wrench.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./trailer.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Diagnostics.css"],import.meta.url)),Box:f(()=>d(()=>import("./Box.js"),["./Box.js","./12.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Heading.js","./Heading.css","./ItemInfo.js","./Box.css"],import.meta.url)),Theory:f(()=>d(()=>import("./Theory.js"),["./Theory.js","./speed.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Theory.css"],import.meta.url)),Tutorial:f(()=>d(()=>import("./Tutorial.js"),["./Tutorial.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./circle.js","./Tutorial.css"],import.meta.url)),Interactions:f(()=>d(()=>import("./Interactions.js"),["./Interactions.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./arrow3.js","./Interactions.css"],import.meta.url)),DragRacing:f(()=>d(()=>import("./DragRacing.js"),["./DragRacing.js","./2.js","./trailer2.js","./Any.js","./CarShopInfo.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Container.js","./Container.css","./RadialProgressBar.js","./RadialProgressBar.css","./numbers.js","./RubleIcon.js","./RangeSlider.js","./RangeSlider.css","./Toggle.js","./Toggle.css","./pluralization.js","./Close.js","./Close.css","./DragRacing.css"],import.meta.url)),DragRacingLobby:f(()=>d(()=>import("./DragRacingLobby.js"),["./DragRacingLobby.js","./92.js","./trailer.js","./trailer2.js","./Any.js","./CarShopInfo.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Container.js","./Container.css","./Close.js","./Close.css","./arrow2.js","./Members.js","./DragRacingLobby.css"],import.meta.url)),TransportOrder:f(()=>d(()=>import("./TransportOrder.js"),["./TransportOrder.js","./trailer5.js","./Button2.js","./BaseButton.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./timer4.js","./money.js","./trailer2.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./time4.js","./TransportOrder.css"],import.meta.url)),UnansweredRequests:f(()=>d(()=>import("./UnansweredRequests.js"),["./UnansweredRequests.js","./time4.js","./timeZone.js","./UnansweredRequests.css"],import.meta.url)),InformationTimer:f(()=>d(()=>import("./InformationTimer.js"),["./InformationTimer.js","./dom.js","./time3.js","./InformationTimer.css"],import.meta.url)),Drugs:f(()=>d(()=>import("./Drugs.js"),["./Drugs.js","./table_BG.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Drugs.css"],import.meta.url)),Case:f(()=>d(()=>import("./Case.js"),["./Case.js","./secret-particles.js","./93.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Case.css"],import.meta.url)),CaseResult:f(()=>d(()=>import("./CaseResult.js"),["./CaseResult.js","./gold_battle_pass.js","./secret-particles.js","./inventory2.js","./ItemInfo.js","./numbers.js","./money.js","./CaseResult.css"],import.meta.url)),Docs:f(()=>d(()=>import("./Docs.js"),["./Docs.js","./mark.js","./passport.js","./stamp.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./defaultDocTypes.js","./FSBIdentityCard.js","./numbers.js","./timeZone.js","./FSBIdentityCard.css","./time4.js","./Docs.css"],import.meta.url)),Lottery:f(()=>d(()=>import("./Lottery.js"),["./Lottery.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./dom.js","./numbers.js","./TrottleMixin.js","./Lottery.css"],import.meta.url)),WeaponAssembly:f(()=>d(()=>import("./WeaponAssembly.js"),["./WeaponAssembly.js","./tech.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./WeaponAssembly.css"],import.meta.url)),FoodSorting:f(()=>d(()=>import("./FoodSorting.js"),["./FoodSorting.js","./pointer-icon.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./dom.js","./FoodSorting.css"],import.meta.url)),CarKey:f(()=>d(()=>import("./CarKey.js"),["./CarKey.js","./trailer2.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./trunkIcon.js","./CarKey.css"],import.meta.url)),RacePosition:f(()=>d(()=>import("./RacePosition.js"),["./RacePosition.js","./RacePosition.css"],import.meta.url)),ContainersBet:f(()=>d(()=>import("./ContainersBet.js"),["./ContainersBet.js","./zw.js","./numbers.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./close3.js","./ContainersBet.css"],import.meta.url)),Cargo:f(()=>d(()=>import("./Cargo.js"),["./Cargo.js","./4.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Cargo.css"],import.meta.url)),Hacking:f(()=>d(()=>import("./Hacking.js"),["./Hacking.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./paper.js","./Hacking.css"],import.meta.url)),DragRacingStart:f(()=>d(()=>import("./DragRacingStart.js"),["./DragRacingStart.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./free.js","./DragRacingStart.css"],import.meta.url)),ActorDialog:f(()=>d(()=>import("./ActorDialog.js"),["./ActorDialog.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./top-black-line.js","./ActorDialog.css"],import.meta.url)),Invitation:f(()=>d(()=>import("./Invitation.js"),["./Invitation.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./paper2.js","./Invitation.css"],import.meta.url)),HelloweenBook:f(()=>d(()=>import("./HelloweenBook.js"),["./HelloweenBook.js","./341.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./HelloweenBook.css"],import.meta.url)),HelloweenPotion:f(()=>d(()=>import("./HelloweenPotion.js"),["./HelloweenPotion.js","./yellow-potion.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./CloseMobile.js","./HelloweenPotion.css"],import.meta.url)),HelloweenGates:f(()=>d(()=>import("./HelloweenGates.js"),["./HelloweenGates.js","./roll2.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./MobileButton.js","./logo.js","./dom.js","./MobileButton.css","./CloseMobile.js","./HelloweenGates.css"],import.meta.url)),DonateItem:f(()=>d(()=>import("./DonateItem.js"),["./DonateItem.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./dp.js","./DonateItem.css"],import.meta.url)),MainMenu:f(()=>d(()=>import("./MainMenu.js"),["./MainMenu.js","./numbers.js","./icon-story.js","./Button3.js","./Button2.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Close.js","./Close.css","./MenuMobileParamsMixin.js","./warning-icon.js","./icon-info.js","./mark2.js","./time4.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./MenuMobileParamsMixin.css","./Modal.js","./GraffitiPattern.js","./GraffitiPattern.css","./Modal.css","./ContaineredButton.js","./ModalMobileButtons.js","./ModalMobileButtons.css","./none.js","./unusual.js","./achievements.js","./AnimatedLogo.js","./logo_radmir.js","./AnimatedLogo.css","./carBrands.js","./CarShopInfo.js","./index4.js","./timeZone.js","./mark.js","./defaultDocTypes.js","./FSBIdentityCard.js","./stamp.js","./FSBIdentityCard.css","./TextHint.js","./TextHint.css","./QuestsInfo.js","./InputField.js","./globals.js","./InputField.css","./CheckboxRange.js","./RangeSlider.js","./RangeSlider.css","./CheckboxRange.css","./yandex.js","./colors.js","./icon-silver-vip.js","./Map.vue_vue_type_style_index_0_scoped_2e73f05e_lang.js","./GPSPoints.js","./Map.css","./icon-zoom.js","./DefaultMapMarkerOverwrite.js","./Button4.js","./Button3.css","./Point.js","./MainMap.js","./MainMap.css","./Back3.js","./ArrowTop.js","./DailyRewardsPrizes.js","./gold_battle_pass.js","./ItemInfo.js","./icon-warning_white.js","./MainMenu.css"],import.meta.url)),PauseMenu:f(()=>d(()=>import("./PauseMenu.js"),["./PauseMenu.js","./Modal.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./GraffitiPattern.js","./GraffitiPattern.css","./Modal.css","./ModalMobileButtons.js","./Button3.js","./Button2.css","./ModalMobileButtons.css","./ContaineredButton.js","./ButtonContainer.js","./ButtonContainer.css","./index4.js","./MenuMobileParamsMixin.js","./warning-icon.js","./icon-info.js","./mark2.js","./time4.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./MenuMobileParamsMixin.css","./radmir.js","./AnimatedLogo.js","./logo_radmir.js","./AnimatedLogo.css","./PauseMenu.css","./style2.css"],import.meta.url)),SelectSpawn:f(()=>d(()=>import("./SelectSpawn.js"),["./SelectSpawn.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./CloseMobile.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./SelectSpawn.css"],import.meta.url)),Taumeter:f(()=>d(()=>import("./Taumeter.js"),["./Taumeter.js","./right-window_active.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Taumeter.css"],import.meta.url)),Newspaper:f(()=>d(()=>import("./Newspaper.js"),["./Newspaper.js","./22.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Newspaper.css"],import.meta.url)),Wires:f(()=>d(()=>import("./Wires.js"),["./Wires.js","./thunder.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Wires.css"],import.meta.url)),EngineRepair:f(()=>d(()=>import("./EngineRepair.js"),["./EngineRepair.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./dom.js","./engine.js","./EngineRepair.css"],import.meta.url)),ObjectEditor:f(()=>d(()=>import("./ObjectEditor.js"),["./ObjectEditor.js","./bg2.js","./ObjectEditor.css"],import.meta.url)),Authorization:f(()=>d(()=>import("./Authorization.js"),["./Authorization.js","./wrong.js","./Authorization.css"],import.meta.url)),Darkness:f(()=>d(()=>import("./Darkness.js"),["./Darkness.js","./lamp.js","./Darkness.css"],import.meta.url)),BattlePassWelcome:f(()=>d(()=>import("./BattlePassWelcome.js"),["./BattlePassWelcome.js","./ContaineredButton.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./ModalMobileButtons.js","./Button3.js","./Button2.css","./ModalMobileButtons.css","./menu3.js","./index4.js","./BattlePassWelcome.css"],import.meta.url)),ScreenNotification:f(()=>d(()=>import("./ScreenNotification.js"),["./ScreenNotification.js","./colors.js","./bell.js","./ScreenNotification.css"],import.meta.url)),BlackMarket:f(()=>d(()=>import("./BlackMarket.js"),["./BlackMarket.js","./money-1.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./BlackMarket.css"],import.meta.url)),Subtitles:f(()=>d(()=>import("./Subtitles.js"),["./Subtitles.js","./line2.js","./Subtitles.css"],import.meta.url)),Bookmaker:f(()=>d(()=>import("./Bookmaker.js"),["./Bookmaker.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./zw.js","./numbers.js","./none2.js","./colors.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Bookmaker.css"],import.meta.url)),GangTimer:f(()=>d(()=>import("./GangTimer.js"),["./GangTimer.js","./icon.js","./GangTimer.css"],import.meta.url)),BattleMansionEnd:f(()=>d(()=>import("./BattleMansionEnd.js"),["./BattleMansionEnd.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./illustration.js","./BattleMansionEnd.css"],import.meta.url)),Offer:f(()=>d(()=>import("./Offer.js"),["./Offer.js","./colors.js","./Offer.css"],import.meta.url)),DailyRewards:f(()=>d(()=>import("./DailyRewards.js"),["./DailyRewards.js","./DailyRewardsPrizes.js","./gold_battle_pass.js","./ItemInfo.js","./reward-particle.js","./DailyRewards.css"],import.meta.url)),Invite:f(()=>d(()=>import("./Invite.js"),["./Invite.js","./waiting.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./InputResponseFix.js","./Invite.css"],import.meta.url)),InviteList:f(()=>d(()=>import("./InviteList.js"),["./InviteList.js","./time4.js","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Search.js","./close13.js","./InviteList.css"],import.meta.url)),AccessoriesExchange:f(()=>d(()=>import("./AccessoriesExchange.js"),["./AccessoriesExchange.js","./illustration_0.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Close.js","./Close.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./AccessoriesExchange.css"],import.meta.url)),Video:f(()=>d(()=>import("./Video.js"),["./Video.js","./Video.css"],import.meta.url)),SummerGates:f(()=>d(()=>import("./SummerGates.js"),["./SummerGates.js","./triangle_passive.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./SummerGates.css"],import.meta.url)),Wardrobe:f(()=>d(()=>import("./Wardrobe.js"),["./Wardrobe.js","./DragAndDropMixin.js","./drag_and_drop.js","./dom.js","./DragAndDropMixin.css","./ButtonContainer.js","./ButtonContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./underline_card_active_selected.js","./numbers.js","./Wardrobe.css"],import.meta.url)),Harvesting:f(()=>d(()=>import("./Harvesting.js"),["./Harvesting.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./dom.js","./Harvesting.css"],import.meta.url)),Binder:f(()=>d(()=>import("./Binder.js"),["./Binder.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./DragAndDropMixin.js","./drag_and_drop.js","./DragAndDropMixin.css","./InputResponseFix.js","./Bind.js","./Binder.css"],import.meta.url)),Camera:f(()=>d(()=>import("./Camera.js"),["./Camera.js","./RangeSlider.js","./RangeSlider.css","./frame.js","./shoot2.js","./Camera.css"],import.meta.url)),HelloweenBoss:f(()=>d(()=>import("./HelloweenBoss.js"),["./HelloweenBoss.js","./logo3.js","./logo-finish.js","./HelloweenBoss.css"],import.meta.url)),HelloweenBossHP:f(()=>d(()=>import("./HelloweenBossHP.js"),["./HelloweenBossHP.js","./logo3.js","./HelloweenBossHP.css"],import.meta.url)),HelloweenMiniGame:f(()=>d(()=>import("./HelloweenMiniGame.js"),["./HelloweenMiniGame.js","./waiting-bg.js","./numbers.js","./HelloweenMiniGame.css"],import.meta.url)),HelloweenBuild:f(()=>d(()=>import("./HelloweenBuild.js"),["./HelloweenBuild.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./close12.js","./HelloweenBuild.css"],import.meta.url)),Tablet:f(()=>d(()=>import("./Tablet.js"),["./Tablet.js","./close10.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./CarNumberPlate.js","./CarNumberPlate.css","./numbers.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./globals.js","./time4.js","./RangeSlider.js","./RangeSlider.css","./ContaineredButton.js","./ButtonContainer.js","./ButtonContainer.css","./trailer2.js","./trailer5.js","./CarShopInfo.js","./icon-silver-vip.js","./colors.js","./cancel-icon.js","./92.js","./trailer.js","./trailer4.js","./trailer3.js","./array.js","./timeZone.js","./Close.js","./Close.css","./Tablet.css"],import.meta.url)),Vignette:f(()=>d(()=>import("./Vignette.js"),["./Vignette.js","./23.js","./Vignette.css"],import.meta.url)),Endurance:f(()=>d(()=>import("./Endurance.js"),["./Endurance.js","./Endurance.css"],import.meta.url)),Wanted:f(()=>d(()=>import("./Wanted.js"),["./Wanted.js","./particles-black-jack.js","./Button2.js","./BaseButton.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Wanted.css"],import.meta.url)),SnowBalls:f(()=>d(()=>import("./SnowBalls.js"),["./SnowBalls.js","./numbers.js","./timer3.js","./SnowBalls.css"],import.meta.url)),DBD:f(()=>d(()=>import("./DBD.js"),["./DBD.js","./dead.js","./DBD.css"],import.meta.url)),NewYearGift:f(()=>d(()=>import("./NewYearGift.js"),["./NewYearGift.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./dom.js","./label.js","./NewYearGift.css"],import.meta.url)),NewYearCalendar:f(()=>d(()=>import("./NewYearCalendar.js"),["./NewYearCalendar.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./dom.js","./timer.js","./NewYearCalendar.css"],import.meta.url)),DriftRegister:f(()=>d(()=>import("./DriftRegister.js"),["./DriftRegister.js","./vector.js","./numbers.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./wallet2.js","./DriftRegister.css"],import.meta.url)),Console:f(()=>d(()=>import("./Console.js"),["./Console.js","./Console.css"],import.meta.url)),TrainingRole:f(()=>d(()=>import("./TrainingRole.js"),["./TrainingRole.js","./skilled.js","./Button2.js","./BaseButton.css","./TrainingRole.css"],import.meta.url)),TrainingOnboarding:f(()=>d(()=>import("./TrainingOnboarding.js"),["./TrainingOnboarding.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./dom.js","./close14.js","./TrainingOnboarding.css"],import.meta.url)),TrainingHint:f(()=>d(()=>import("./TrainingHint.js"),["./TrainingHint.js","./TrainingHint.css"],import.meta.url)),News:f(()=>d(()=>import("./News.js"),["./News.js","./Button2.js","./BaseButton.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./placeholder.js","./News.css"],import.meta.url)),TuningStyling:f(()=>d(()=>import("./TuningStyling.js"),["./TuningStyling.js","./default.js","./Button2.js","./BaseButton.css","./numbers.js","./money.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./TuningStyling.css"],import.meta.url)),CustomMap:f(()=>d(()=>import("./CustomMap.js"),["./CustomMap.js","./DefaultMapMarkerOverwrite.js","./dom.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./Point.js","./close11.js","./CustomMap.css"],import.meta.url)),Employment:f(()=>d(()=>import("./Employment.js"),["./Employment.js","./employment2.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ButtonContainer.js","./ButtonContainer.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./view.js","./Button2.js","./BaseButton.css","./Subtitle.js","./Subtitle.css","./numbers.js","./Employment.css"],import.meta.url)),AuthMobile:f(()=>d(()=>import("./AuthMobile.js"),["./AuthMobile.js","./yandex.js","./ok2.js","./registration.js","./AuthMobile.css"],import.meta.url)),CharacterSelection:f(()=>d(()=>import("./CharacterSelection.js"),["./CharacterSelection.js","./trash.js","./money.js","./donate.js","./chip2.js","./CharacterSelection.css"],import.meta.url)),ToiletCleaning:f(()=>d(()=>import("./ToiletCleaning.js"),["./ToiletCleaning.js","./toilet-dirty.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./ToiletCleaning.css"],import.meta.url)),JailCamera:f(()=>d(()=>import("./JailCamera.js"),["./JailCamera.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./Close.js","./Close.css","./BaseButton.js","./BaseButton.css","./timeZone.js","./time4.js","./JailCamera.css"],import.meta.url)),JailBook:f(()=>d(()=>import("./JailBook.js"),["./JailBook.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./spoiler-cell-separator.js","./ButtonContainer.js","./ButtonContainer.css","./time4.js","./JailBook.css"],import.meta.url)),Turner:f(()=>d(()=>import("./Turner.js"),["./Turner.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./BaseButton.js","./BaseButton.css","./72.js","./TrottleMixin.js","./dom.js","./Turner.css"],import.meta.url)),QTE:f(()=>d(()=>import("./QTE.js"),["./QTE.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./pointer.js","./QTE.css"],import.meta.url)),FindItems:f(()=>d(()=>import("./FindItems.js"),["./FindItems.js","./ring.js","./dom.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./FindItems.css"],import.meta.url)),EgyptMarket:f(()=>d(()=>import("./EgyptMarket.js"),["./EgyptMarket.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./Close.js","./Close.css","./numbers.js","./stone-tablet.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./EgyptMarket.css"],import.meta.url)),AchievementNotification:f(()=>d(()=>import("./AchievementNotification.js"),["./AchievementNotification.js","./unusual.js","./star3.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./achievements.js","./menu3.js","./index4.js","./AchievementNotification.css","./style2.css"],import.meta.url)),FastMap:f(()=>d(()=>import("./FastMap.js"),["./FastMap.js","./GPSPoints.js","./Map.vue_vue_type_style_index_0_scoped_2e73f05e_lang.js","./Map.css","./DefaultMapMarkerOverwrite.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./MainMap.js","./MainMap.css","./ButtonContainer.js","./ButtonContainer.css","./ContaineredButton.js","./Close.js","./Close.css","./icon-zoom.js","./FastMap.css","./Button3.css","./InputField.css"],import.meta.url)),NewYearElves:f(()=>d(()=>import("./NewYearElves.js"),["./NewYearElves.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./wallet.js","./numbers.js","./stars.js","./BaseButton.js","./BaseButton.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./NewYearElves.css"],import.meta.url)),HelloweenRoyalRace:f(()=>d(()=>import("./HelloweenRoyalRace.js"),["./HelloweenRoyalRace.js","./line.js","./time2.js","./HelloweenRoyalRace.css"],import.meta.url)),HelloweenChase:f(()=>d(()=>import("./HelloweenChase.js"),["./HelloweenChase.js","./time.js","./HelloweenChase.css"],import.meta.url)),HelloweenHotPotato:f(()=>d(()=>import("./HelloweenHotPotato.js"),["./HelloweenHotPotato.js","./bomb.js","./time2.js","./HelloweenHotPotato.css"],import.meta.url)),HelloweenScreamer:f(()=>d(()=>import("./HelloweenScreamer.js"),["./HelloweenScreamer.js","./screamer.js","./HelloweenScreamer.css"],import.meta.url)),FullScreenPreloader:f(()=>d(()=>import("./FullScreenPreloader.js"),["./FullScreenPreloader.js","./AnimatedLogo.js","./logo_radmir.js","./AnimatedLogo.css","./GraffitiPattern.js","./GraffitiPattern.css","./FullScreenPreloader.css"],import.meta.url)),AlertNotification:f(()=>d(()=>import("./AlertNotification.js"),["./AlertNotification.js","./icon-warning_white.js","./AlertNotification.css"],import.meta.url)),WaitingPlayers:f(()=>d(()=>import("./WaitingPlayers.js"),["./WaitingPlayers.js","./bg3.js","./WaitingPlayers.css"],import.meta.url)),NewYearTelegraph:f(()=>d(()=>import("./NewYearTelegraph.js"),["./NewYearTelegraph.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./NewYearTelegraph.css"],import.meta.url)),NewYearParkour:f(()=>d(()=>import("./NewYearParkour.js"),["./NewYearParkour.js","./line.js","./NewYearParkour.css"],import.meta.url)),NewYearArmsRace:f(()=>d(()=>import("./NewYearArmsRace.js"),["./NewYearArmsRace.js","./line.js","./NewYearArmsRace.css"],import.meta.url)),NewYearHungerGame:f(()=>d(()=>import("./NewYearHungerGame.js"),["./NewYearHungerGame.js","./NewYearHungerGame.css"],import.meta.url)),VoiceChatSettings:f(()=>d(()=>import("./VoiceChatSettings.js"),["./VoiceChatSettings.js","./CheckboxRange.js","./RangeSlider.js","./RangeSlider.css","./CheckboxRange.css","./Modal.js","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./GraffitiPattern.js","./GraffitiPattern.css","./Modal.css","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./ContaineredButton.js","./ButtonContainer.js","./ButtonContainer.css","./VoiceChatSettings.css"],import.meta.url)),EasterFoundFragment:f(()=>d(()=>import("./EasterFoundFragment.js"),["./EasterFoundFragment.js","./94.js","./EasterFoundFragment.css"],import.meta.url)),TutorialHint:f(()=>d(()=>import("./TutorialHint.js"),["./TutorialHint.js","./title-icon.js","./GraffitiPattern.js","./GraffitiPattern.css","./ContaineredButton.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./ButtonContainer.js","./ButtonContainer.css","./menu3.js","./index4.js","./colors.js","./TutorialHint.css"],import.meta.url)),Realtor:f(()=>d(()=>import("./Realtor.js"),["./Realtor.js","./employment2.js","./Button.js","./telegram-authenticator.js","./close2.js","./donate.js","./money.js","./Button.css","./numbers.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./Close.js","./Close.css","./timeZone.js","./time4.js","./stalls.js","./MainMap.js","./DefaultMapMarkerOverwrite.js","./GPSPoints.js","./MainMap.css","./mockOnDev.js","./Realtor.css"],import.meta.url)),IdentityCard:f(()=>d(()=>import("./IdentityCard.js"),["./IdentityCard.js","./FSBIdentityCard.js","./numbers.js","./timeZone.js","./stamp.js","./FSBIdentityCard.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./dom.js","./IdentityCard.css"],import.meta.url)),SiegeProgress:f(()=>d(()=>import("./SiegeProgress.js"),["./SiegeProgress.js","./useTimer.js","./time4.js","./timer2.js","./SiegeProgress.css"],import.meta.url)),UniversalStore:f(()=>d(()=>import("./UniversalStore.js"),["./UniversalStore.js","./Heading.js","./Heading.css","./Subtitle.js","./Subtitle.css","./Cards2.js","./RubleIcon.js","./Cards2.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./StorePreview.js","./ArrowButton.js","./ArrowButton.css","./numbers.js","./BaseButton.js","./BaseButton.css","./StorePreview.css","./SmallSkinIds.js","./UniversalStore.css"],import.meta.url)),LeaderBoard:f(()=>d(()=>import("./LeaderBoard.js"),["./LeaderBoard.js","./ScrollableContainer.js","./dom.js","./ScrollableContainer.css","./numbers.js","./not-found.js","./gold_battle_pass.js","./useTimer.js","./pluralization.js","./time4.js","./GraffitiPattern.js","./GraffitiPattern.css","./Close.js","./telegram-authenticator.js","./close2.js","./Button.js","./donate.js","./money.js","./Button.css","./Close.css","./mockOnDev.js","./LeaderBoard.css"],import.meta.url))},Dc={FirstPersonConfig:{open:{status:!1},show:!0,options:{}},InventoryNew:{open:{status:!1},show:!0,options:{hideHud:!0,style:"z-index: 3"}},Containers:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},ContainersBet:{open:{status:!1},show:!0,options:{hideHud:!0}},MiamiTicket:{open:{status:!1},show:!0,options:{}},DanceTrack:{open:{status:!1},show:!0,options:{hud:!0}},DanceList:{open:{status:!1},show:!0,options:{}},WindowCleaner:{open:{status:!1},show:!0,options:{allowAnyInterfaces:!0,showRadarButtons:!0}},JobCard:{open:{status:!1},show:!0,options:{}},LifeGuardHeal:{open:{status:!1},show:!0,options:{}},DisplayText:{open:{status:!1},show:!0,options:{hud:!0}},QuestsProgressInfo:{open:{status:!1},show:!0,options:{showControlsButton:!0,hud:!0}},QuestsTalks:{open:{status:!1},show:!0,options:{hud:!0}},Hud:{open:{status:!1},show:!0,options:{hud:!0}},Trade:{open:{status:!1},show:!0,options:{hideHud:!0,style:"z-index: 3"}},TradeItems:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:"mobile",style:"z-index: 3"}},FootballInfo:{open:{status:!1},show:!0,options:{hud:!0}},FootballImpactForce:{open:{status:!1},show:!0,options:{hud:!0}},FootballScoreboard:{open:{status:!1},show:!0,options:{hud:!0}},FootballPositions:{open:{status:!1},show:!0,options:{}},FootballCreateMatch:{open:{status:!1},show:!0,options:{}},FootballBets:{open:{status:!1},show:!0,options:{}},FootballCreateCommand:{open:{status:!1},show:!0,options:{}},FootballPlayer:{open:{status:!1},show:!0,options:{}},FootballClub:{open:{status:!1},show:!0,options:{}},FootballViewer:{open:{status:!1},show:!0,options:{hud:!0}},FootballTraining:{open:{status:!1},show:!1,options:{hud:!0}},FootballTop:{open:{status:!1},show:!0,options:{}},FootballCardSelection:{open:{status:!1},show:!0,options:{}},FootballMatchStatistic:{open:{status:!1},show:!0,options:{}},FootballPoints:{open:{status:!1},show:!0,options:{hud:!0}},FootballStats:{open:{status:!1},show:!0,options:{hud:!0}},BuyCarNumber:{open:{status:!1},show:!0,options:{}},Tinting:{open:{status:!1},show:!0,options:{}},TintingOrder:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:"mobile"}},Ticket:{open:{status:!1},show:!0,options:{}},TruckersCarPark:{open:{status:!1},show:!0,options:{}},DrivingExam:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},TruckRepair:{open:{status:!1},show:!0,options:{}},DrivingExamTheory:{open:{status:!1},show:!0,options:{}},ProductLoad:{open:{status:!1},show:!0,options:{hud:!0}},ClothingShop:{open:{status:!1},show:!0,options:{}},CharacterEditor:{open:{status:!1},show:!0,options:{}},GarbageAuctions:{open:{status:!1},show:!0,options:{}},Stall:{open:{status:!1},show:!0,options:{}},StallManage:{open:{status:!1},show:!0,options:{}},StallCard:{open:{status:!1},show:!0,options:{}},Craft:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Fuel:{open:{status:!1},show:!0,options:{hideChat:"mobile"}},GarbageMetalSearch:{open:{status:!1},show:!0,options:{hud:!0}},Fishing:{open:{status:!1},show:!0,options:{allowAnyInterfaces:!0}},InfoCard:{open:{status:!1},show:!0,options:{hud:!0}},CasinoCards:{open:{status:!1},show:!0,options:{hideHud:!0}},CasinoBlackjack:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},CasinoDice:{open:{status:!1},show:!0,options:{}},CasinoRullet:{open:{status:!1},show:!0,options:{showControlsButton:!0,hideHud:!0,hideChat:"mobile"}},CasinoSlots:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},CasinoRoll:{open:{status:!1},show:!0,options:{hideHud:!0}},CasinoExchange:{open:{status:!1},show:!0,options:{hideChat:"mobile"}},Capture:{open:{status:!1},show:!0,options:{hud:!0}},Death:{open:{status:!1},show:!0,options:{}},Overlay:{open:{status:!1},show:!0,options:{}},TradeSkin:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Watch:{open:{status:!1},show:!0,options:{showControlsButton:!0,hud:!0}},CarsShop:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Gardens:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Paintball:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Video:{open:{status:!1},show:!0,options:{hud:!0,hideHud:!0,hideChat:!0,style:"z-index: 2"}},Loading:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},NewYear:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Helloween:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},AccessoriesExchange:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Phone:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: 2"}},Drift:{open:{status:!1},show:!0,options:{hud:!0}},PhoneAppPhoto:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Music:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},MusicPlayer:{open:{status:!1},show:!0,options:{hud:!0}},Report:{open:{status:!1},show:!0,options:{}},Police:{open:{status:!1},show:!0,options:{}},AdminSpectate:{open:{status:!1},show:!0,options:{hud:!0,hideHud:!0,hideControllers:!0}},Notification:{open:{status:!1},show:!0,options:{hud:!0}},Billiard:{open:{status:!1},show:!0,options:{hud:!0}},Accessories:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Auction:{open:{status:!1},show:!0,options:{}},ProgressBar:{open:{status:!1},show:!0,options:{style:"z-index: 2",hud:!0},BusTimer:{open:{status:!1},show:!0,options:{hud:!0}},Machinist:{open:{status:!1},show:!0,options:{hud:!0}},FishingWork:{open:{status:!1},show:!0,options:{hud:!0}},Hint:{open:{status:!1},show:!0,options:{hud:!0}},Select:{open:{status:!1},show:!0,options:{}},BuyTicket:{open:{status:!1},show:!0,options:{}}},BusTimer:{open:{status:!1},show:!0,options:{hud:!0}},Machinist:{open:{status:!1},show:!0,options:{hud:!0}},GameText:{open:{status:!1},show:!0,options:{hud:!0,showControlsButton:!0,style:"z-index: 4"}},Appartament:{open:{status:!1},show:!0,options:{hud:!0}},FishingWork:{open:{status:!1},show:!0,options:{}},Business:{open:{status:!1},show:!0,options:{hud:!0}},Shoot:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Hint:{open:{status:!1},show:!0,options:{hud:!0}},Select:{open:{status:!1},show:!0,options:{}},BuyTicket:{open:{status:!1},show:!0,options:{}},Connect:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0,hud:!0,hideControllers:!0}},PlayerInteraction:{open:{status:!1},show:!0,options:{hideChat:"mobile"}},GameUpdate:{open:{status:!1},show:!0,options:{}},GangColor:{open:{status:!1},show:!0,options:{hideChat:"mobile"}},LoadingScreen:{open:{status:!1},show:!0,options:{}},TuningStage:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0,hideControllers:!0}},TuningSprings:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},TuningMenu:{open:{status:!1},show:!0,options:{hud:!0,hideHud:!0,hideChat:!0,hideControllers:!0}},TuningPneuma:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:"mobile"}},TuningPlayerPneuma:{open:{status:!1},show:!0,options:{hideHud:!0}},GangCreate:{open:{status:!1},show:!0,options:{hideHud:!0}},ClothingStore:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Rating:{open:{status:!1},show:!0,options:{}},WeaponShop:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},Billboard:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},ItemStore:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Box:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Stun:{open:{status:!1},show:!0,options:{hud:!0,hideHud:!0,hideChat:!0}},Diagnostics:{open:{status:!1},show:!0,options:{}},Theory:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Tutorial:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},TransportOrder:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},UnansweredRequests:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: 0"}},DragRacing:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},DragRacingLobby:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Drugs:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},Interactions:{open:{status:!1},show:!0,options:{hud:!0,showControlsButton:!0,blockedByFullScreen:!0}},InformationTimer:{open:{status:!1},show:!0,options:{hud:!0,blockedByFullScreen:!0}},Case:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},CaseResult:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Docs:{open:{status:!1},show:!0,options:{hideChat:!1,hideHud:!1}},Lottery:{open:{status:!1},show:!0,options:{}},WeaponAssembly:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},FoodSorting:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},CarKey:{open:{status:!1},show:!0,options:{hud:!0}},RacePosition:{open:{status:!1},show:!0,options:{hud:!0}},Cargo:{open:{status:!1},show:!0,options:{hud:!0,hideHud:!0}},Hacking:{open:{status:!1},show:!0,options:{hideHud:!0}},DragRacingStart:{open:{status:!1},show:!0,options:{}},Invitation:{open:{status:!1},show:!0,options:{}},ActorDialog:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},HelloweenBook:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},HelloweenPotion:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},HelloweenGates:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},DonateItem:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},MainMenu:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0,style:"z-index: 3"}},PauseMenu:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0,style:"z-index: 3"}},SelectSpawn:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},Taumeter:{open:{status:!1},show:!0,options:{hud:!1}},Newspaper:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},Wires:{open:{status:!1},show:!0,options:{hud:!1}},Wardrobe:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},EngineRepair:{open:{status:!1},show:!0,options:{hideChat:!0,hideHud:!0}},ObjectEditor:{open:{status:!1},show:!0,options:{allowAnyInterfaces:!0}},Authorization:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Darkness:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: -1"}},GangTimer:{open:{status:!1},show:!0,options:{hud:!0}},Bookmaker:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},BattlePassWelcome:{open:{status:!1},show:!0,options:{hud:!1}},ScreenNotification:{open:{status:!1},show:!0,options:{hud:!0,showControlsButton:!0}},BlackMarket:{open:{status:!1},show:!0,options:{hideHud:!0}},Subtitles:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: 3"}},BattleMansionEnd:{open:{status:!1},show:!0,options:{hud:!0,hideChat:"mobile"}},Invite:{open:{status:!1},show:!0,options:{}},InviteList:{open:{status:!1},show:!0,options:{}},Offer:{open:{status:!1},show:!0,options:{hud:!0,showControlsButton:!0}},DailyRewards:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Menu:{open:{status:!1},show:!1,options:{style:"z-index: 5"}},SummerGates:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Harvesting:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Binder:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Camera:{open:{status:!1},show:!0,options:{hud:!0,hideHud:!0,hideChat:!0,hideControllers:!0,useInvisibleJoystick:!0}},HelloweenBoss:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: -1"}},HelloweenBossHP:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: -1"}},HelloweenMiniGame:{open:{status:!1},show:!0,options:{hud:!0}},Tablet:{open:{status:!1},show:!0,options:{hideHud:!0}},HelloweenBuild:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Vignette:{open:{status:!1},show:!0,options:{hud:!0}},Endurance:{open:{status:!1},show:!0,options:{hud:!0}},Wanted:{open:{status:!1},show:!0,options:{hud:!1,hideChat:!0}},SnowBalls:{open:{status:!1},show:!0,options:{hud:!0}},DBD:{open:{status:!1},show:!0,options:{hud:!0}},NewYearGift:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},NewYearCalendar:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},DriftRegister:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},TrainingRole:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},TrainingOnboarding:{open:{status:!1},show:!0,options:{allowAnyInterfaces:!0,showRadarButtons:!0,style:"z-index: 1000"}},TrainingHint:{open:{status:!1},show:!0,options:{hud:!0,style:"z-index: 2"}},News:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},TuningStyling:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},CustomMap:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Employment:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},AuthMobile:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},CharacterSelection:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},ToiletCleaning:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},JailCamera:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},JailBook:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},Turner:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},QTE:{open:{status:!1},show:!0,options:{}},FindItems:{open:{status:!1},show:!0,options:{}},EgyptMarket:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},AchievementNotification:{open:{status:!1},show:!0,options:{hud:!0}},FastMap:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},NewYearElves:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},HelloweenRoyalRace:{open:{status:!1},show:!0,options:{hud:!0}},HelloweenChase:{open:{status:!1},show:!0,options:{hud:!0}},HelloweenHotPotato:{open:{status:!1},show:!0,options:{hud:!0}},HelloweenScreamer:{open:{status:!1},show:!0,options:{hud:!0}},FullScreenPreloader:{open:{status:!1},show:!1,options:{hud:!0,style:"z-index: 1000"}},AlertNotification:{open:{status:!1},show:!1,options:{hud:!0}},WaitingPlayers:{open:{status:!1},show:!0,options:{hud:!0}},NewYearTelegraph:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},NewYearParkour:{open:{status:!1},show:!0,options:{hud:!0}},NewYearArmsRace:{open:{status:!1},show:!0,options:{hud:!0}},NewYearHungerGame:{open:{status:!1},show:!0,options:{hud:!0}},VoiceChatSettings:{open:{status:!1},show:!0,options:{hud:!1}},EasterFoundFragment:{open:{status:!1},show:!0,options:{hud:!0}},TutorialHint:{open:{status:!1},show:!0,options:{hud:!0}},Realtor:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},IdentityCard:{open:{status:!1},show:!0,options:{}},SiegeProgress:{open:{status:!1},show:!0,options:{hud:!0}},UniversalStore:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}},LeaderBoard:{open:{status:!1},show:!0,options:{hideHud:!0,hideChat:!0}}},Pc={"00000409":"EN","00040409":"EN","00030409":"EN","00020409":"EN","00010409":"EN","00000452":"EN","00000809":"EN","00000419":"RU","00020419":"RU","00010419":"RU","00020422":"UA","00000422":"UA"};const Rc={key:0,class:"development-controls"},Lc={class:"interface"},Mc={key:0,class:"interface interface-keyboard"},Vc={key:1,class:"app__build-date"},Hc=it("div",{class:"version",style:{display:"none"}},[it("a",null,"Ver. 0.1.76-8.5-23-4")],-1);function Nc(e,t,o,n,r,i){const s=Io("Console"),l=Io("hud"),a=Io("Keyboard"),u=Io("window");return ve(),Me("div",{class:tt(["app",`app_${r.theme}`])},[r.developmentMode?(ve(),Me("div",Rc,[it("button",{onClick:t[0]||(t[0]=c=>r.components.BuyCarNumber.open.status=!r.components.BuyCarNumber.open.status)},"BuyCarNumber")])):Fo("",!0),Z(s,{ref:"console",class:tt({interface_hidden:!(r.isConsoleActive&&r.isDevelopment)})},null,8,["class"]),it("div",Lc,[Z(l,{class:tt(["interface-component",{interface_hidden:!r.components.Hud.show}]),ref:"Hud"},null,8,["class"])]),Z(Er,{name:"fade"},{default:No(()=>[i.isMobile&&r.showKeyboard==="game"?(ve(),Me("div",Mc,[Z(a,{class:"interface-component"})])):Fo("",!0)]),_:1}),Z(_i,{name:"fade"},{default:No(()=>[(ve(!0),Me(me,null,jr(i.openedComponents,(c,h,_)=>(ve(),Me("div",{class:"interface",key:h,style:mo(c.options.style)},[(ve(),Xo(eu(h),{class:tt(["interface-component",{interface_hidden:i.checkInterfaceHidden(c)}]),ref_for:!0,ref:h,openParams:c.open.params},null,8,["class","openParams"]))],4))),128))]),_:1}),Z(_i,{name:"fade"},{default:No(()=>[(ve(!0),Me(me,null,jr(r.dialogsQueue.slice(0,1).sort((c,h)=>h[1]-c[1]),c=>(ve(),Xo(u,{class:"interface--dialog",priority:r.components[`Window${c[0]}`].priority,key:`Window${c[0]}`,ref_for:!0,ref:`Window${c[0]}`,openParams:r.components[`Window${c[0]}`].open.params,stringParam:r.components[`Window${c[0]}`].stringParam},null,8,["priority","openParams","stringParam"]))),128))]),_:1}),i.isTestServer&&r.buildDateStatus?(ve(),Me("div",Vc,"UI Build date: "+Ua(i.buildDate),1)):Fo("",!0),Hc],2)}const xc=1920,Kc=1080,Fc=1.75,Bc=0,Uc={components:Ic,mixins:[Tc],data(){return{screen:{height:0,scale:1},isConsoleActive:!0,displayStatus:!0,dialogIdx:0,dialogsQueue:[],showKeyboard:!1,components:Dc,developmentMode:!1,engine:"legacy",theme:"dark",keyboardLayoutName:"00000419",chatPageSize:10,chatFontSize:0,chatTimestamps:!0,platform:"none",deviceModel:"none",onCreatedOpenedInterfaces:["Menu","ScreenNotification","FullScreenPreloader"],deviceScreen:{},isDevelopment:!1,specialOffsetWidthVwValue:0,buildDateStatus:!0}},provide(){return{specialOffsetWidthVw:no(()=>this.specialOffsetWidthVw),isMobile:no(()=>this.isMobile),isIOS:no(()=>this.isIOS)}},computed:{buildDate(){return"2025-07-23T09:23:48.379Z"},isTestServer(){return+this.$store.getters["player/serverId"]===Bc},openedComponents(){let e={};for(let t in this.components){let o=this.components[t];o.open.status&&(e[t]=o)}return e},showFootballInterfaces(){return["CreateCommand","CreateMatch","Info","Scoreboard","Positions","ImpactForce","Bets","Player","Club","Training","Viewer","Top","CardSelection","MatchStatistic","Points","Stats"].some(e=>this.components[`Football${e}`].open.status===!0)},keyboardLayout(){return Pc[this.keyboardLayoutName]||""},isSquareMobile(){return this.isMobile&&this.isSquare},isMobile(){return this.platform=="Android"||this.platform=="iOS"},isIOS(){return this.platform=="iOS"},specialOffsetWidthVw(){return this.specialOffsetWidthVwValue},isSquare(){return window.innerWidth/window.innerHeight<=Fc}},mounted(){this.engine!="legacy"&&document.body.classList.add("hassle"),this.$nextTick(()=>{this.openOnCreatedOpenedInterfaces(),this.onResize()}),window.addEventListener("resize",this.onResize),this.setSpecialOffset()},unmounted(){window.removeEventListener("resize",this.onResize)},watch:{deviceScreen:function(){this.setSpecialOffset()},isMobile(){return this.updateBaseFontSize()}},methods:{setConsoleActive(e){this.isConsoleActive=e},updateBaseFontSize(){document.documentElement.style.fontSize=`${16*window.scale}px`},setSpecialOffset(){const e=this.isSpecialDevice();let t=0;e&&(t=this.deviceScreen.safeArea.left/this.deviceScreen.width*100),this.specialOffsetWidthVwValue=isNaN(t)?0:t,document.documentElement.style.setProperty("--special-offset",`${this.specialOffsetWidthVwValue}vw`)},isSpecialDevice(){if(this.deviceScreen.safeArea==null)return!1;const e=this.deviceScreen.safeArea.right-this.deviceScreen.safeArea.left,t=this.deviceScreen.safeArea.bottom-this.deviceScreen.safeArea.top;return!(e==this.deviceScreen.width&&t==this.deviceScreen.height)},openOnCreatedOpenedInterfaces(){for(const e of this.onCreatedOpenedInterfaces)this.components[e].open.status=!0},onResize(){window.scale=(window.innerWidth+window.innerHeight)/(1920+1080),this.getScreenData(),this.updateBaseFontSize()},addDialogInQueue(e=!1,t=[],o=!1){!o&&this.dialogsQueue.length&&this.closeLastDialog();const n=!window.interface("Hud").isShowControllers&&!window.interface("Hud").isShowRadar,r=`Window${this.dialogIdx}`;this.components[r]={open:{params:e?JSON.parse(e):""},stringParam:t,priority:o,options:{},isDialog:!0},this.dialogsQueue.unshift([this.dialogIdx++,o]),n||(window.interface("Hud").isShowRadar=!0),window.setCursorStatus(r,!0)},closeLastDialog(){const e=this.dialogsQueue.shift();delete this.components[`Window${e}`],setTimeout(()=>{window.setCursorStatus(`Window${e[0]}`,!1),this.dialogsQueue.length||(window.interface("Hud").isShowRadar=!1)},200),this.$forceUpdate()},clearAllDialogs(){const e=this.dialogsQueue;this.dialogsQueue=[];for(const t of e)delete this.components[`Window${t}`];this.$forceUpdate()},isDialogInterface(e){return e.indexOf("Window")>-1},getScreenData(){const e=document.documentElement.offsetWidth,t=document.documentElement.offsetHeight;this.screen={width:e,height:t,scale:{width:e/xc,height:t/Kc}}},checkInterfaceHidden(e){return e.options.blockedByFullScreen&&!!Object.keys(this.openedComponents).find(o=>this.openedComponents[o].show&&!this.openedComponents[o].options.hud&&!this.openedComponents[o].options.allowAnyInterfaces)||!e.show},pxToVw(e){const t=this.screen;return e/t.width*100},pxToVh(e){const t=this.screen;return e/t.height*100},vwToPx(e){const t=this.screen;return e/100*t.width},vhToPx(e){const t=this.screen;return e/100*t.height}}},kc=hn(Uc,[["render",Nc]]);function Oi(e){return e.type.indexOf("mouse")!==-1?e.clientX:e.touches[0].clientX}function Si(e){return e.type.indexOf("mouse")!==-1?e.clientY:e.touches[0].clientY}var Yc=function(){var e=!1;try{var t=Object.defineProperty({},"passive",{get:function(){e=!0}});window.addEventListener("test",null,t)}catch{}return e}(),$c={install:function(e,t){var o=Object.assign({},{disableClick:!1,tapTolerance:10,swipeTolerance:30,touchHoldTolerance:400,longTapTimeInterval:400,touchClass:"",dragFrequency:100,rollOverFrequency:100},t);function n(m){var g=this.$$touchObj,P=m.type.indexOf("touch")>=0,M=m.type.indexOf("mouse")>=0,B=this;P&&(g.lastTouchStartTime=m.timeStamp),!(M&&g.lastTouchStartTime&&m.timeStamp-g.lastTouchStartTime<350)&&(g.touchStarted||(h(this),g.touchStarted=!0,g.touchMoved=!1,g.swipeOutBounded=!1,g.startX=Oi(m),g.startY=Si(m),g.currentX=0,g.currentY=0,g.touchStartTime=m.timeStamp,g.hasSwipe=u(this,"swipe")||u(this,"swipe.left")||u(this,"swipe.right")||u(this,"swipe.top")||u(this,"swipe.bottom"),u(this,"hold")&&(g.touchHoldTimer=setTimeout(function(){g.touchHoldTimer=null,c(m,B,"hold")},g.options.touchHoldTolerance)),c(m,this,"press")))}function r(m){var g=this.$$touchObj,P=Oi(m),M=Si(m),B=g.currentX!=P||g.currentY!=M;if(g.currentX=P,g.currentY=M,g.touchMoved){if(g.hasSwipe&&!g.swipeOutBounded){var U=g.options.swipeTolerance;g.swipeOutBounded=Math.abs(g.startX-g.currentX)>U&&Math.abs(g.startY-g.currentY)>U}}else{var D=g.options.tapTolerance;g.touchMoved=Math.abs(g.startX-g.currentX)>D||Math.abs(g.startY-g.currentY)>D,g.touchMoved&&(v(g),c(m,this,"drag.once"))}if(u(this,"rollover")&&B){var k=m.timeStamp,X=g.options.rollOverFrequency;(g.touchRollTime==null||k>g.touchRollTime+X)&&(g.touchRollTime=k,c(m,this,"rollover"))}if(u(this,"drag")&&g.touchStarted&&g.touchMoved&&B){var k=m.timeStamp,X=g.options.dragFrequency;(g.touchDragTime==null||k>g.touchDragTime+X)&&(g.touchDragTime=k,c(m,this,"drag"))}}function i(){var m=this.$$touchObj;v(m),_(this),m.touchStarted=m.touchMoved=!1,m.startX=m.startY=0}function s(m){var g=this.$$touchObj,P=m.type.indexOf("touch")>=0,M=m.type.indexOf("mouse")>=0;P&&(g.lastTouchEndTime=m.timeStamp);var B=P&&!g.touchHoldTimer;if(v(g),g.touchStarted=!1,_(this),!(M&&g.lastTouchEndTime&&m.timeStamp-g.lastTouchEndTime<350))if(c(m,this,"release"),g.touchMoved){if(g.hasSwipe&&!g.swipeOutBounded){var D=g.options.swipeTolerance,U,k=Math.abs(g.startY-g.currentY),X=Math.abs(g.startX-g.currentX);(k>D||X>D)&&(k>X?U=g.startY>g.currentY?"top":"bottom":U=g.startX>g.currentX?"left":"right",u(this,"swipe."+U)?c(m,this,"swipe."+U,U):c(m,this,"swipe",U))}}else if(u(this,"longtap")&&m.timeStamp-g.touchStartTime>g.options.longTapTimeInterval)m.cancelable&&m.preventDefault(),c(m,this,"longtap");else if(u(this,"hold")&&B){m.cancelable&&m.preventDefault();return}else c(m,this,"tap")}function l(){h(this)}function a(){_(this)}function u(m,g){var P=m.$$touchObj.callbacks[g];return P!=null&&P.length>0}function c(m,g,P,M){var B=g.$$touchObj,D=B.callbacks[P];if(D==null||D.length===0)return null;for(var U=0;U<D.length;U++){var k=D[U];k.modifiers.stop&&m.stopPropagation(),k.modifiers.prevent&&m.preventDefault(),!(k.modifiers.self&&m.target!==m.currentTarget)&&typeof k.value=="function"&&(M?k.value(M,m):k.value(m))}}function h(m){var g=m.$$touchObj.options.touchClass;g&&m.classList.add(g)}function _(m){var g=m.$$touchObj.options.touchClass;g&&m.classList.remove(g)}function v(m){m.touchHoldTimer&&(clearTimeout(m.touchHoldTimer),m.touchHoldTimer=null)}function b(m,g){var P=m.$$touchObj||{callbacks:{},hasBindTouchEvents:!1,options:o};return g&&(P.options=Object.assign({},P.options,g)),m.$$touchObj=P,m.$$touchObj}e.directive("touch",{beforeMount:function(m,g){var P=b(m),M=Yc?{passive:!0}:!1,B=g.arg||"tap";switch(B){case"swipe":var D=g.modifiers;if(D.left||D.right||D.top||D.bottom){for(var U in g.modifiers)if(["left","right","top","bottom"].indexOf(U)>=0){var k="swipe."+U;P.callbacks[k]=P.callbacks[k]||[],P.callbacks[k].push(g)}}else P.callbacks.swipe=P.callbacks.swipe||[],P.callbacks.swipe.push(g);break;case"press":case"drag":g.modifiers.disablePassive&&(M=!1);default:P.callbacks[B]=P.callbacks[B]||[],P.callbacks[B].push(g)}P.hasBindTouchEvents||(m.addEventListener("touchstart",n,M),m.addEventListener("touchmove",r,M),m.addEventListener("touchcancel",i),m.addEventListener("touchend",s),P.options.disableClick||(m.addEventListener("mousedown",n),m.addEventListener("mousemove",r),m.addEventListener("mouseup",s),m.addEventListener("mouseenter",l),m.addEventListener("mouseleave",a)),P.hasBindTouchEvents=!0)},unmounted:function(m){m.removeEventListener("touchstart",n),m.removeEventListener("touchmove",r),m.removeEventListener("touchcancel",i),m.removeEventListener("touchend",s),m.$$touchObj&&!m.$$touchObj.options.disableClick&&(m.removeEventListener("mousedown",n),m.removeEventListener("mousemove",r),m.removeEventListener("mouseup",s),m.removeEventListener("mouseenter",l),m.removeEventListener("mouseleave",a)),delete m.$$touchObj}}),e.directive("touch-class",{beforeMount:function(m,g){b(m,{touchClass:g.value})}}),e.directive("touch-options",{beforeMount:function(m,g){b(m,g.value)}})}};const jc={data(){return{globalInputIsFocused:!1}},mounted(){this.addInputListeners()},updated(){this.addInputListeners()},unmounted(){this.globalInputIsFocused&&this.onInputBlur(),this.removeInputListeners()},methods:{addInputListeners(){if(!this.$el.querySelectorAll)return;[...this.$el.querySelectorAll("input"),...this.$el.querySelectorAll("textarea")].forEach(t=>{t.hasEventListeners||(t.addEventListener("focus",this.onInputFocus),t.addEventListener("blur",this.onInputBlur),t.hasEventListeners=!0)})},removeInputListeners(){if(!this.$el.querySelectorAll)return;[...this.$el.querySelectorAll("input"),...this.$el.querySelectorAll("textarea")].forEach(t=>{t.removeEventListener("focus",this.onInputFocus),t.removeEventListener("blur",this.onInputBlur),t.hasEventListeners=!1})},onInputFocus(){window.isBluredInput=!1,this.globalInputIsFocused=!0,window.setInputFocus(this.globalInputIsFocused)},onInputBlur(){window.isBluredInput=!0,this.globalInputIsFocused=!1,window.setInputFocus(this.globalInputIsFocused)}}};function Wc(){return Hs().__VUE_DEVTOOLS_GLOBAL_HOOK__}function Hs(){return typeof navigator<"u"&&typeof window<"u"?window:typeof global<"u"?global:{}}const Gc=typeof Proxy=="function",zc="devtools-plugin:setup",qc="plugin:settings:set";let At,jn;function Xc(){var e;return At!==void 0||(typeof window<"u"&&window.performance?(At=!0,jn=window.performance):typeof global<"u"&&(!((e=global.perf_hooks)===null||e===void 0)&&e.performance)?(At=!0,jn=global.perf_hooks.performance):At=!1),At}function Jc(){return Xc()?jn.now():Date.now()}class Qc{constructor(t,o){this.target=null,this.targetQueue=[],this.onQueue=[],this.plugin=t,this.hook=o;const n={};if(t.settings)for(const s in t.settings){const l=t.settings[s];n[s]=l.defaultValue}const r=`__vue-devtools-plugin-settings__${t.id}`;let i=Object.assign({},n);try{const s=localStorage.getItem(r),l=JSON.parse(s);Object.assign(i,l)}catch{}this.fallbacks={getSettings(){return i},setSettings(s){try{localStorage.setItem(r,JSON.stringify(s))}catch{}i=s},now(){return Jc()}},o&&o.on(qc,(s,l)=>{s===this.plugin.id&&this.fallbacks.setSettings(l)}),this.proxiedOn=new Proxy({},{get:(s,l)=>this.target?this.target.on[l]:(...a)=>{this.onQueue.push({method:l,args:a})}}),this.proxiedTarget=new Proxy({},{get:(s,l)=>this.target?this.target[l]:l==="on"?this.proxiedOn:Object.keys(this.fallbacks).includes(l)?(...a)=>(this.targetQueue.push({method:l,args:a,resolve:()=>{}}),this.fallbacks[l](...a)):(...a)=>new Promise(u=>{this.targetQueue.push({method:l,args:a,resolve:u})})})}async setRealTarget(t){this.target=t;for(const o of this.onQueue)this.target.on[o.method](...o.args);for(const o of this.targetQueue)o.resolve(await this.target[o.method](...o.args))}}function Zc(e,t){const o=e,n=Hs(),r=Wc(),i=Gc&&o.enableEarlyProxy;if(r&&(n.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__||!i))r.emit(zc,e,t);else{const s=i?new Qc(o,r):null;(n.__VUE_DEVTOOLS_PLUGINS__=n.__VUE_DEVTOOLS_PLUGINS__||[]).push({pluginDescriptor:o,setupFn:t,proxy:s}),s&&t(s.proxiedTarget)}}/*!
 * vuex v4.1.0
 * (c) 2022 Evan You
 * @license MIT
 */var ed="store";function Yt(e,t){Object.keys(e).forEach(function(o){return t(e[o],o)})}function Ns(e){return e!==null&&typeof e=="object"}function td(e){return e&&typeof e.then=="function"}function od(e,t){return function(){return e(t)}}function xs(e,t,o){return t.indexOf(e)<0&&(o&&o.prepend?t.unshift(e):t.push(e)),function(){var n=t.indexOf(e);n>-1&&t.splice(n,1)}}function Ks(e,t){e._actions=Object.create(null),e._mutations=Object.create(null),e._wrappedGetters=Object.create(null),e._modulesNamespaceMap=Object.create(null);var o=e.state;wn(e,o,[],e._modules.root,!0),vr(e,o,t)}function vr(e,t,o){var n=e._state,r=e._scope;e.getters={},e._makeLocalGettersCache=Object.create(null);var i=e._wrappedGetters,s={},l={},a=ka(!0);a.run(function(){Yt(i,function(u,c){s[c]=od(u,e),l[c]=no(function(){return s[c]()}),Object.defineProperty(e.getters,c,{get:function(){return l[c].value},enumerable:!0})})}),e._state=sn({data:t}),e._scope=a,e.strict&&ad(e),n&&o&&e._withCommit(function(){n.data=null}),r&&r.stop()}function wn(e,t,o,n,r){var i=!o.length,s=e._modules.getNamespace(o);if(n.namespaced&&(e._modulesNamespaceMap[s],e._modulesNamespaceMap[s]=n),!i&&!r){var l=Cr(t,o.slice(0,-1)),a=o[o.length-1];e._withCommit(function(){l[a]=n.state})}var u=n.context=nd(e,s,o);n.forEachMutation(function(c,h){var _=s+h;rd(e,_,c,u)}),n.forEachAction(function(c,h){var _=c.root?h:s+h,v=c.handler||c;id(e,_,v,u)}),n.forEachGetter(function(c,h){var _=s+h;sd(e,_,c,u)}),n.forEachChild(function(c,h){wn(e,t,o.concat(h),c,r)})}function nd(e,t,o){var n=t==="",r={dispatch:n?e.dispatch:function(i,s,l){var a=Qo(i,s,l),u=a.payload,c=a.options,h=a.type;return(!c||!c.root)&&(h=t+h),e.dispatch(h,u)},commit:n?e.commit:function(i,s,l){var a=Qo(i,s,l),u=a.payload,c=a.options,h=a.type;(!c||!c.root)&&(h=t+h),e.commit(h,u,c)}};return Object.defineProperties(r,{getters:{get:n?function(){return e.getters}:function(){return Fs(e,t)}},state:{get:function(){return Cr(e.state,o)}}}),r}function Fs(e,t){if(!e._makeLocalGettersCache[t]){var o={},n=t.length;Object.keys(e.getters).forEach(function(r){if(r.slice(0,n)===t){var i=r.slice(n);Object.defineProperty(o,i,{get:function(){return e.getters[r]},enumerable:!0})}}),e._makeLocalGettersCache[t]=o}return e._makeLocalGettersCache[t]}function rd(e,t,o,n){var r=e._mutations[t]||(e._mutations[t]=[]);r.push(function(s){o.call(e,n.state,s)})}function id(e,t,o,n){var r=e._actions[t]||(e._actions[t]=[]);r.push(function(s){var l=o.call(e,{dispatch:n.dispatch,commit:n.commit,getters:n.getters,state:n.state,rootGetters:e.getters,rootState:e.state},s);return td(l)||(l=Promise.resolve(l)),e._devtoolHook?l.catch(function(a){throw e._devtoolHook.emit("vuex:error",a),a}):l})}function sd(e,t,o,n){e._wrappedGetters[t]||(e._wrappedGetters[t]=function(i){return o(n.state,n.getters,i.state,i.getters)})}function ad(e){Jt(function(){return e._state.data},function(){},{deep:!0,flush:"sync"})}function Cr(e,t){return t.reduce(function(o,n){return o[n]},e)}function Qo(e,t,o){return Ns(e)&&e.type&&(o=t,t=e,e=e.type),{type:e,payload:t,options:o}}var ld="vuex bindings",bi="vuex:mutations",In="vuex:actions",It="vuex",ud=0;function cd(e,t){Zc({id:"org.vuejs.vuex",app:e,label:"Vuex",homepage:"https://next.vuex.vuejs.org/",logo:"https://vuejs.org/images/icons/favicon-96x96.png",packageName:"vuex",componentStateTypes:[ld]},function(o){o.addTimelineLayer({id:bi,label:"Vuex Mutations",color:Ai}),o.addTimelineLayer({id:In,label:"Vuex Actions",color:Ai}),o.addInspector({id:It,label:"Vuex",icon:"storage",treeFilterPlaceholder:"Filter stores..."}),o.on.getInspectorTree(function(n){if(n.app===e&&n.inspectorId===It)if(n.filter){var r=[];Ys(r,t._modules.root,n.filter,""),n.rootNodes=r}else n.rootNodes=[ks(t._modules.root,"")]}),o.on.getInspectorState(function(n){if(n.app===e&&n.inspectorId===It){var r=n.nodeId;Fs(t,r),n.state=pd(wd(t._modules,r),r==="root"?t.getters:t._makeLocalGettersCache,r)}}),o.on.editInspectorState(function(n){if(n.app===e&&n.inspectorId===It){var r=n.nodeId,i=n.path;r!=="root"&&(i=r.split("/").filter(Boolean).concat(i)),t._withCommit(function(){n.set(t._state.data,i,n.state.value)})}}),t.subscribe(function(n,r){var i={};n.payload&&(i.payload=n.payload),i.state=r,o.notifyComponentUpdate(),o.sendInspectorTree(It),o.sendInspectorState(It),o.addTimelineEvent({layerId:bi,event:{time:Date.now(),title:n.type,data:i}})}),t.subscribeAction({before:function(n,r){var i={};n.payload&&(i.payload=n.payload),n._id=ud++,n._time=Date.now(),i.state=r,o.addTimelineEvent({layerId:In,event:{time:n._time,title:n.type,groupId:n._id,subtitle:"start",data:i}})},after:function(n,r){var i={},s=Date.now()-n._time;i.duration={_custom:{type:"duration",display:s+"ms",tooltip:"Action duration",value:s}},n.payload&&(i.payload=n.payload),i.state=r,o.addTimelineEvent({layerId:In,event:{time:Date.now(),title:n.type,groupId:n._id,subtitle:"end",data:i}})}})})}var Ai=8702998,dd=6710886,fd=16777215,Bs={label:"namespaced",textColor:fd,backgroundColor:dd};function Us(e){return e&&e!=="root"?e.split("/").slice(-2,-1)[0]:"Root"}function ks(e,t){return{id:t||"root",label:Us(t),tags:e.namespaced?[Bs]:[],children:Object.keys(e._children).map(function(o){return ks(e._children[o],t+o+"/")})}}function Ys(e,t,o,n){n.includes(o)&&e.push({id:n||"root",label:n.endsWith("/")?n.slice(0,n.length-1):n||"Root",tags:t.namespaced?[Bs]:[]}),Object.keys(t._children).forEach(function(r){Ys(e,t._children[r],o,n+r+"/")})}function pd(e,t,o){t=o==="root"?t:t[o];var n=Object.keys(t),r={state:Object.keys(e.state).map(function(s){return{key:s,editable:!0,value:e.state[s]}})};if(n.length){var i=hd(t);r.getters=Object.keys(i).map(function(s){return{key:s.endsWith("/")?Us(s):s,editable:!1,value:Wn(function(){return i[s]})}})}return r}function hd(e){var t={};return Object.keys(e).forEach(function(o){var n=o.split("/");if(n.length>1){var r=t,i=n.pop();n.forEach(function(s){r[s]||(r[s]={_custom:{value:{},display:s,tooltip:"Module",abstract:!0}}),r=r[s]._custom.value}),r[i]=Wn(function(){return e[o]})}else t[o]=Wn(function(){return e[o]})}),t}function wd(e,t){var o=t.split("/").filter(function(n){return n});return o.reduce(function(n,r,i){var s=n[r];if(!s)throw new Error('Missing module "'+r+'" for path "'+t+'".');return i===o.length-1?s:s._children},t==="root"?e:e.root._children)}function Wn(e){try{return e()}catch(t){return t}}var xe=function(t,o){this.runtime=o,this._children=Object.create(null),this._rawModule=t;var n=t.state;this.state=(typeof n=="function"?n():n)||{}},$s={namespaced:{configurable:!0}};$s.namespaced.get=function(){return!!this._rawModule.namespaced};xe.prototype.addChild=function(t,o){this._children[t]=o};xe.prototype.removeChild=function(t){delete this._children[t]};xe.prototype.getChild=function(t){return this._children[t]};xe.prototype.hasChild=function(t){return t in this._children};xe.prototype.update=function(t){this._rawModule.namespaced=t.namespaced,t.actions&&(this._rawModule.actions=t.actions),t.mutations&&(this._rawModule.mutations=t.mutations),t.getters&&(this._rawModule.getters=t.getters)};xe.prototype.forEachChild=function(t){Yt(this._children,t)};xe.prototype.forEachGetter=function(t){this._rawModule.getters&&Yt(this._rawModule.getters,t)};xe.prototype.forEachAction=function(t){this._rawModule.actions&&Yt(this._rawModule.actions,t)};xe.prototype.forEachMutation=function(t){this._rawModule.mutations&&Yt(this._rawModule.mutations,t)};Object.defineProperties(xe.prototype,$s);var yt=function(t){this.register([],t,!1)};yt.prototype.get=function(t){return t.reduce(function(o,n){return o.getChild(n)},this.root)};yt.prototype.getNamespace=function(t){var o=this.root;return t.reduce(function(n,r){return o=o.getChild(r),n+(o.namespaced?r+"/":"")},"")};yt.prototype.update=function(t){js([],this.root,t)};yt.prototype.register=function(t,o,n){var r=this;n===void 0&&(n=!0);var i=new xe(o,n);if(t.length===0)this.root=i;else{var s=this.get(t.slice(0,-1));s.addChild(t[t.length-1],i)}o.modules&&Yt(o.modules,function(l,a){r.register(t.concat(a),l,n)})};yt.prototype.unregister=function(t){var o=this.get(t.slice(0,-1)),n=t[t.length-1],r=o.getChild(n);r&&r.runtime&&o.removeChild(n)};yt.prototype.isRegistered=function(t){var o=this.get(t.slice(0,-1)),n=t[t.length-1];return o?o.hasChild(n):!1};function js(e,t,o){if(t.update(o),o.modules)for(var n in o.modules){if(!t.getChild(n))return;js(e.concat(n),t.getChild(n),o.modules[n])}}function _d(e){return new Te(e)}var Te=function(t){var o=this;t===void 0&&(t={});var n=t.plugins;n===void 0&&(n=[]);var r=t.strict;r===void 0&&(r=!1);var i=t.devtools;this._committing=!1,this._actions=Object.create(null),this._actionSubscribers=[],this._mutations=Object.create(null),this._wrappedGetters=Object.create(null),this._modules=new yt(t),this._modulesNamespaceMap=Object.create(null),this._subscribers=[],this._makeLocalGettersCache=Object.create(null),this._scope=null,this._devtools=i;var s=this,l=this,a=l.dispatch,u=l.commit;this.dispatch=function(_,v){return a.call(s,_,v)},this.commit=function(_,v,b){return u.call(s,_,v,b)},this.strict=r;var c=this._modules.root.state;wn(this,c,[],this._modules.root),vr(this,c),n.forEach(function(h){return h(o)})},yr={state:{configurable:!0}};Te.prototype.install=function(t,o){t.provide(o||ed,this),t.config.globalProperties.$store=this;var n=this._devtools!==void 0?this._devtools:!1;n&&cd(t,this)};yr.state.get=function(){return this._state.data};yr.state.set=function(e){};Te.prototype.commit=function(t,o,n){var r=this,i=Qo(t,o,n),s=i.type,l=i.payload,a={type:s,payload:l},u=this._mutations[s];u&&(this._withCommit(function(){u.forEach(function(h){h(l)})}),this._subscribers.slice().forEach(function(c){return c(a,r.state)}))};Te.prototype.dispatch=function(t,o){var n=this,r=Qo(t,o),i=r.type,s=r.payload,l={type:i,payload:s},a=this._actions[i];if(a){try{this._actionSubscribers.slice().filter(function(c){return c.before}).forEach(function(c){return c.before(l,n.state)})}catch{}var u=a.length>1?Promise.all(a.map(function(c){return c(s)})):a[0](s);return new Promise(function(c,h){u.then(function(_){try{n._actionSubscribers.filter(function(v){return v.after}).forEach(function(v){return v.after(l,n.state)})}catch{}c(_)},function(_){try{n._actionSubscribers.filter(function(v){return v.error}).forEach(function(v){return v.error(l,n.state,_)})}catch{}h(_)})})}};Te.prototype.subscribe=function(t,o){return xs(t,this._subscribers,o)};Te.prototype.subscribeAction=function(t,o){var n=typeof t=="function"?{before:t}:t;return xs(n,this._actionSubscribers,o)};Te.prototype.watch=function(t,o,n){var r=this;return Jt(function(){return t(r.state,r.getters)},o,Object.assign({},n))};Te.prototype.replaceState=function(t){var o=this;this._withCommit(function(){o._state.data=t})};Te.prototype.registerModule=function(t,o,n){n===void 0&&(n={}),typeof t=="string"&&(t=[t]),this._modules.register(t,o),wn(this,this.state,t,this._modules.get(t),n.preserveState),vr(this,this.state)};Te.prototype.unregisterModule=function(t){var o=this;typeof t=="string"&&(t=[t]),this._modules.unregister(t),this._withCommit(function(){var n=Cr(o.state,t.slice(0,-1));delete n[t[t.length-1]]}),Ks(this)};Te.prototype.hasModule=function(t){return typeof t=="string"&&(t=[t]),this._modules.isRegistered(t)};Te.prototype.hotUpdate=function(t){this._modules.update(t),Ks(this,!0)};Te.prototype._withCommit=function(t){var o=this._committing;this._committing=!0,t(),this._committing=o};Object.defineProperties(Te.prototype,yr);var Uf=Ed(function(e,t){var o={};return md(t).forEach(function(n){var r=n.key,i=n.val;i=e+i,o[r]=function(){if(!(e&&!vd(this.$store,"mapGetters",e)))return this.$store.getters[i]},o[r].vuex=!0}),o});function md(e){return gd(e)?Array.isArray(e)?e.map(function(t){return{key:t,val:t}}):Object.keys(e).map(function(t){return{key:t,val:e[t]}}):[]}function gd(e){return Array.isArray(e)||Ns(e)}function Ed(e){return function(t,o){return typeof t!="string"?(o=t,t=""):t.charAt(t.length-1)!=="/"&&(t+="/"),e(t,o)}}function vd(e,t,o){var n=e._modulesNamespaceMap[o];return n}const Ws={namespaced:!0,state:()=>({nickName:"",selectedServer:-1,pauseTime:0,timerId:null,servers:{},online:{}}),mutations:{addPauseTime(e){e.pauseTime++},resetPauseTime(e){e.pauseTime=0,e.timerId=null},setServers(e,t){e.servers=t},setOnline(e,t){e.online=t},setNickName(e,t){e.nickName=t},setSelectedServer(e,t){e.selectedServer=t},setTimerId(e,t){e.timerId=t}},getters:{nickName(e){return e.nickName},selectedServer(e){return e.selectedServer},servers(e){return e.servers},online(e){return e.online},pauseTime(e){const t=new Date(e.pauseTime*1e3),o=Date.formatNumber(t.getSeconds()),n=Date.formatNumber(t.getMinutes()),r=Date.formatNumber(t.getHours());let i=`${n}:${o}`;return e.pauseTime>=3600&&(i=`${r}:${i}`),i},timerId(e){return e.timerId},isPaused(e){return e.pauseTime>0}},actions:{addPauseTime(e){e.commit("addPauseTime")},resetPauseTime(e){e.commit("resetPauseTime")}}},Cd=Object.freeze(Object.defineProperty({__proto__:null,default:Ws},Symbol.toStringTag,{value:"Module"})),yd=2340,Td=1080,pe=e=>e/yd*100,he=e=>e/Td*100,we=100,Ii={Jump:{x:pe(2082),y:he(702),size:108,scale:we},Aim:{x:pe(1864),y:he(762),size:154,scale:we},Atack:{x:pe(1864),y:he(762),size:154,scale:we},Patron:{x:pe(2082),y:he(702),size:108,scale:we},SecondPatron:{x:pe(427),y:he(388),size:108,scale:we},Dive:{x:pe(1864),y:he(762),size:154,scale:we},LeaveCar:{x:pe(1676),y:he(904),size:78,scale:we},SeatCar:{x:pe(1722),y:he(904),size:78,scale:we},Voice:{x:pe(1887),y:he(590),size:108,scale:we},Radio:{x:pe(1730),y:he(558),size:108,scale:we},Megaphone:{x:pe(1600),y:he(558),size:108,scale:we},Beep:{x:pe(1731),y:he(735),size:78,scale:we},PedalStop:{x:pe(1818),y:he(828),size:154,scale:we},PedalGas:{x:pe(2036),y:he(828),size:154,scale:we},HandBrake:{x:pe(2082),y:he(656),size:108,scale:we},TurnLeft:{x:pe(150),y:he(796),size:154,scale:we},TurnRight:{x:pe(368),y:he(796),size:154,scale:we}},kf={REDIRECT_LINK:0,CONNECT:1,INPUT_CODE:2},Yf={MAIN_CATEGORY_SERVER_SETTING_BUTTON:0,MAIN_CATEGORY_SERVER_SETTING_OTHER:1},Od={BUTTON:0,CHECKBOX:1,RANGE:2,SLIDER:3,DROPDOWN:4,EMAIL:5,NICKNAME:6,TELEGRAM:7,SECURITY_INFO:8,PASSWORD:9,KEY:10,RANGE_STEP:11,DEVELOPMENT:12},$f={NOT_CONNECTED:0,CONNECTED:1},jf=e=>Di.hasOwnProperty(e)?Di[e]:Object.keys(le).find(t=>le[t]===e),Di={49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9,MOUSE0:"ЛКМ",MOUSE1:"MOUSE1",MOUSE2:"ПКМ",MOUSE3:"MOUSE3",MOUSE4:"MOUSE4"},Gn={MOUSE0:1,MOUSE1:2,MOUSE2:3,MOUSE3:6,MOUSE4:7,32:32,27:1e3,112:1001,113:1002,114:1003,115:1004,116:1005,117:1006,118:1007,119:1008,120:1009,121:1010,122:1011,123:1012,46:1014,33:1017,34:1018,38:1019,40:1020,37:1021,39:1022,8:1042,9:1043,20:1044,13:1045,16:1046,17:1049,18:1051,91:1053},Wf=e=>{const t=window.App.$store.getters["settings/settings"].actionControlNameForComputer,o=window.App.$store.getters["settings/settings"].controls;return Object.values(o).reduce((n,r,i)=>(t[i]&&t[i].actionType==e&&(window.pushToUsedKeys(r[t[i].indexKey]),n.push({id:i,label:t[i].name,type:Od.KEY,keys:[r[t[i].indexKey]],default:t[i].default,onResetInClient:s=>{window.replaceUsedKey(s.keys[0],s.default),s.keys=[s.default],s.callback(s)},callback:s=>{const l=s.id;if(window.App.engine=="legacy")for(var a=0;a<4;a++){var u=s.keys[0];Gn[u]&&(u=Gn[u]),window.setControl(l,a,u)}else console.error("not impl")}})),n),[])},Sd=e=>(e.forEach((t,o)=>{Object.entries(Gn).forEach(([n,r])=>{const i=t.indexOf(r);i!==-1&&(e[o][i]=parseInt(n)||n)})}),e),le={ESC:27,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,ARROWUP:38,ARROWDOWN:40,ARROWLEFT:37,ARROWRIGHT:39,NUM0:96,NUM1:97,NUM2:98,NUM3:99,NUM4:100,NUM5:101,NUM6:102,NUM7:103,NUM8:104,NUM9:105,BACKQUOTE:192,N0:48,N1:49,N2:50,N3:51,N4:52,N5:53,N6:54,N7:55,N8:56,N9:57,MINUS:189,EQUAL:187,BACKSPACE:8,TAB:9,CAPSLOCK:20,SHIFT:16,CTRL:17,ALT:18,SPACE:32,ENTER:13,Q:81,W:87,E:69,R:82,T:84,Y:89,U:85,I:73,O:79,P:80,LEFTBRACKET:219,RIGHTBRACKET:221,BACKSLASH:220,A:65,S:83,D:68,F:70,G:71,H:72,J:74,K:75,L:76,SEMICOLON:186,QUOTE:222,Z:90,X:88,C:67,V:86,B:66,N:78,M:77,COMMA:188,PERIOD:190,SLASH:191,MOUSE_LEFT:"MOUSE0",MOUSE_MIDDLE:"MOUSE1",MOUSE_RIGHT:"MOUSE2",MOUSE_THIRD:"MOUSE3",MOUSE_FOURTH:"MOUSE4"},ue={GENERAL:0,ON_FOOT:1,VEHICLE:2},Gs={namespaced:!0,state:()=>({requiredControlsVersion:1,settings:{actionControlNameForComputer:{0:{name:"Огонь",indexKey:0,default:le.MOUSE_LEFT,actionType:ue.ON_FOOT},4:{name:"Идти вперед",indexKey:1,default:le.W,actionType:ue.ON_FOOT},5:{name:"Идти назад",indexKey:1,default:le.S,actionType:ue.ON_FOOT},6:{name:"Идти влево",indexKey:1,default:le.A,actionType:ue.ON_FOOT},7:{name:"Идти вправо",indexKey:1,default:le.D,actionType:ue.ON_FOOT},10:{name:"Сесть/Выйти с авто",indexKey:1,default:le.F,actionType:ue.VEHICLE},12:{name:"Прыжок",indexKey:0,default:le.SHIFT,actionType:ue.ON_FOOT},13:{name:"Быстрый бег",indexKey:0,default:le.SPACE,actionType:ue.ON_FOOT},15:{name:"Присесть",indexKey:0,default:le.C,actionType:ue.ON_FOOT},17:{name:"Медленный шаг",indexKey:0,default:le.ALT,actionType:ue.ON_FOOT},24:{name:"Ехать вперед",indexKey:0,default:le.W,actionType:ue.VEHICLE},25:{name:"Ехать назад",indexKey:0,default:le.S,actionType:ue.VEHICLE},34:{name:"Поворот налево (вертолёт/самолёт)",indexKey:0,default:le.Q,actionType:ue.VEHICLE},35:{name:"Поворот направо (вертолёт/самолёт)",indexKey:0,default:le.E,actionType:ue.VEHICLE},20:{name:"Ехать влево",indexKey:0,default:le.A,actionType:ue.VEHICLE},21:{name:"Ехать вправо",indexKey:0,default:le.D,actionType:ue.VEHICLE},45:{name:"Прицелиться",indexKey:0,default:le.MOUSE_RIGHT,actionType:ue.ON_FOOT},49:{name:"Сесть на пассажирское",indexKey:0,default:le.G,actionType:ue.VEHICLE}},capacity:20,customEnabled:!1,graphicsQuality:1,texturesQuality:1,shadowsQuality:1,maxFPS:30,drawDistance:50,postProcessing:!0,antiAliasing:0,resolution:100,soundsVolume:1,useJoystick:!0,useNativeKeyboard:!1,vSync:!0,customInterfaces:!1,customInterfacesAddress:"",updateChannel:"main",voiceChatSound:0,isControlsEditable:!1,controls:{...Ii},usedKeys:[],mouseSensitivity:0,invertMouse:!1,brightness:0,wideScreen:!1,videoMode:1,videoModes:[],frameLimiter:!1,mouseFlying:!1}}),mutations:{setSettings(e,t){e.settings={...e.settings,...t}},setSettingsProperty(e,t){window.App.engine=="legacy"&&t.key==="controls"&&(t.value=Sd(t.value)),e.settings[t.key]=t.value},setControlParams(e,{name:t,payload:o}){e.settings.controls[t]=o},setEditableMode(e,t){e.settings.isControlsEditable=t},resetControls(e){e.settings.controls={...Ii}},setControlsVersion(e,t){e.settings.controls.version=t},pushToUsedKeys(e,t){e.settings.usedKeys.push(t)},replaceUsedKey(e,{oldKey:t,newKey:o}){const n=e.settings.usedKeys.indexOf(t);n!==-1&&(e.settings.usedKeys.splice(n,1,o),e.settings.usedKeys=[...e.settings.usedKeys])}},getters:{settings(e){return e.settings},controlsVersion(e){return e.settings.controls.version},requiredControlsVersion(e){return e.requiredControlsVersion}}},bd=Object.freeze(Object.defineProperty({__proto__:null,ACTION_CONTROL_FOR_COMPUTER:ue,default:Gs},Symbol.toStringTag,{value:"Module"})),Gf={NONE:-1,GREY:0,BLUE:1,VIOLET:2,RED:3,YELLOW:4},zf={CAPACITY:0,MAX_SEATS:1,MAX_FUEL:2,FUEL_TYPE:3},Ad={NONE:0,SILVER:1,GOLD:2,PLATINUM:3},zs={namespaced:!0,state:()=>({nickName:"Name_Surname",level:0,passedHours:0,money:0,bankMoney:0,donate:0,casinoChips:0,vip:Ad.NONE,gameVersion:"1.0.0",currentServer:1,telegramUrl:"https://radmir.online",donatePaymentUrl:"https://radmir.online",advertisingServiceUrl:"https://service.hassleconnect.com/api/advertisement",knowledgeServiceUrl:"https://service.hassleconnect.com/api/knowledge-base",actionRedirectUri:"",skinId:206,isPlayerConnected:!1,position:{x:0,y:0,angle:0,interior:!1},gangZones:{},flashedGangZones:{},route:[],checkpoint:null}),mutations:{setPlayerConnectedStatus(e,t){e.isPlayerConnected=t},setActionRedirectUri(e,t){e.actionRedirectUri=t},setDonatePaymentUrl(e,t){e.donatePaymentUrl=t},setAdvertisingUrl(e,t){e.advertisingServiceUrl=t},setTelegramBotConnectUrl(e,t){e.telegramUrl=t},setNickName(e,t){e.nickName=t},setSkin(e,t){e.skinId=t},setVip(e,t){e.vip=t},setLevel(e,t){e.level=t},setPassedHours(e,t){e.passedHours=t},setMoney(e,t){e.money=t},setBankMoney(e,t){e.bankMoney=t},setDonate(e,t){e.donate=t},setCasinoChips(e,t){e.casinoChips=t},setServer(e,t){e.currentServer=t},setGameVersion(e,t){e.gameVersion=t},setPosition(e,t){e.position={...t}},setRoute(e,t){e.route=t},setCheckpoint(e,t){e.checkpoint=t},setGangZones(e,t){e.gangZones=t.reduce((o,[n,...r])=>(o[n]=r,o),{})},addGangZone(e,[t,...o]){e.gangZones={...e.gangZones,[t]:o}},removeGangZone(e,t){e.gangZones={...e.gangZones},delete e.gangZones[t]},enableGangZoneFlash(e,[t,o]){e.flashedGangZones={...e.flashedGangZones,[t]:o}},disableGangZoneFlash(e,t){e.flashedGangZones={...e.flashedGangZones},delete e.flashedGangZones[t]}},getters:{isPlayerConnected(e){return e.isPlayerConnected},actionRedirectUri(e){return e.actionRedirectUri},donatePaymentUrl(e){return e.donatePaymentUrl},knowledgeServiceUrl(e){return e.knowledgeServiceUrl},advertisingServiceUrl(e){return e.advertisingServiceUrl},telegramUrl(e){return e.telegramUrl},nickName(e){return e.nickName},level(e){return e.level},passedHours(e){return e.passedHours},money(e){return e.money},bankMoney(e){return e.bankMoney},donate(e){return e.donate},casinoChips(e){return e.casinoChips},gameVersion(e){return e.gameVersion},position(e){return e.position},route(e){return e.route},checkpoint(e){return e.checkpoint},skinId(e){return e.skinId},vip(e){return e.vip},serverId(e){return e.currentServer},gangZones(e){return e.gangZones},flashedGangZones(e){return e.flashedGangZones}},actions:{updateMoney(e,[t,o,n]){e.commit("setMoney",t),e.commit("setBankMoney",o),e.commit("setDonate",n)}}},Id=Object.freeze(Object.defineProperty({__proto__:null,default:zs},Symbol.toStringTag,{value:"Module"})),Dd=30,qs={namespaced:!0,state:()=>({lang:"ru",history:[]}),mutations:{setLang(e,t){e.lang=t},addHistory(e,t){e.history.length>0&&e.history[e.history.length-1]===t||(e.history.push(t),e.history.length>Dd&&(e.history=e.history.slice(1)))}},getters:{lang(e){return e.lang},history(e){return e.history}}},Pd=Object.freeze(Object.defineProperty({__proto__:null,default:qs},Symbol.toStringTag,{value:"Module"})),Xs={namespaced:!0,state:()=>({cars:{}}),mutations:{addCars(e,{showroomID:t,cars:o}){e.cars[t]=[...e.cars[t]||[],...o]}},getters:{cars(e){return e.cars}}},Rd=Object.freeze(Object.defineProperty({__proto__:null,default:Xs},Symbol.toStringTag,{value:"Module"})),Js={namespaced:!0,state:()=>({binds:[]}),mutations:{addBinds(e,t){e.binds=[...e.binds,...t]},setBind(e,{id:t,data:o}){const n=e.binds.findIndex(r=>r.id===t);n!==-1&&(e.binds[n]=o)},removeBind(e,t){e.binds=e.binds.filter(o=>o.id!==t)},resetBinds(e){e.binds=[]},removeBindsInterval(e,t){e.binds=e.binds.filter(o=>o.id>t)}},actions:{checkMessage({state:e},t){const o=e.binds.find(({action:n})=>n.toLowerCase()===t.toLowerCase());return o||!1}},getters:{binds(e){return e.binds}}},Ld=Object.freeze(Object.defineProperty({__proto__:null,default:Js},Symbol.toStringTag,{value:"Module"})),Qs={namespaced:!0,state:()=>({favouriteIds:[],cdnUploadLink:"http://138.197.186.77:3000/api",cdnLoadLink:"https://hassle.fra1.cdn.digitaloceanspaces.com/av/",adHourPrice:0,adHourOldPrice:0,adHourDiscount:0,adToTopPrice:0,adToTopOldPrice:0,adToTopDiscount:0,adHoursMax:72,maxDescriptionLength:165,maxRejectionReasonLength:165,maxNameLength:20,likeDelay:1e3,emptyImagesAlertText:""}),mutations:{addFavourite(e,t){e.favouriteIds.includes(t)||e.favouriteIds.push(t)},removeFavourite(e,t){e.favouriteIds=e.favouriteIds.filter(o=>o!==t)},setFavourites(e,t){e.favouriteIds=t},setCdnUploadLink(e,t){e.cdnUploadLink=t},setCdnLoadLink(e,t){e.cdnLoadLink=t},setAdHourPrice(e,t){e.adHourPrice=t},setAdHourOldPrice(e,t){e.adHourOldPrice=t},setAdHourDiscount(e,t){e.adHourDiscount=t},setAdToTopPrice(e,t){e.adToTopPrice=t},setAdToTopOldPrice(e,t){e.adToTopOldPrice=t},setAdToTopDiscount(e,t){e.adToTopDiscount=t},setAdHoursMax(e,t){e.adHoursMax=t},setMaxDescriptionLength(e,t){e.maxDescriptionLength=t},setMaxRejectionReasonLength(e,t){e.maxRejectionReasonLength=t},setMaxNameLength(e,t){e.maxNameLength=t},setLikeDelay(e,t){e.likeDelay=t},setEmptyImagesAlertText(e,t){e.emptyImagesAlertText=t}},getters:{favouriteIds(e){return e.favouriteIds},cdnUploadLink(e){return e.cdnUploadLink},cdnLoadLink(e){return e.cdnLoadLink},adHourPrice(e){return e.adHourPrice},adHourOldPrice(e){return e.adHourOldPrice},adHourDiscount(e){return e.adHourDiscount},adToTopPrice(e){return e.adToTopPrice},adToTopOldPrice(e){return e.adToTopOldPrice},adToTopDiscount(e){return e.adToTopDiscount},adHoursMax(e){return e.adHoursMax},maxDescriptionLength(e){return e.maxDescriptionLength},maxRejectionReasonLength(e){return e.maxRejectionReasonLength},maxNameLength(e){return e.maxNameLength},likeDelay(e){return e.likeDelay},emptyImagesAlertText(e){return e.emptyImagesAlertText}}},Md=Object.freeze(Object.defineProperty({__proto__:null,default:Qs},Symbol.toStringTag,{value:"Module"})),Zs={namespaced:!0,state:()=>({photoUrls:[]}),mutations:{addPhoto(e,t){const o=t.split("/");t=o.splice(o.indexOf("assets")+1,o.length).join("/"),e.photoUrls.push(`./${t}`)}},getters:{photoUrls(e){return e.photoUrls}}},Vd=Object.freeze(Object.defineProperty({__proto__:null,default:Zs},Symbol.toStringTag,{value:"Module"})),ea={namespaced:!0,state:()=>({history:[]}),mutations:{setHistory(e,t){e.history=t},addHistory(e,t){e.history=[...t,...e.history]}},getters:{history(e){return e.history}}},Hd=Object.freeze(Object.defineProperty({__proto__:null,default:ea},Symbol.toStringTag,{value:"Module"})),ta={namespaced:!0,state:()=>({cartItems:[]}),mutations:{addIndexToCart(e,{index:t,extraIndex:o,number:n}){(!e.cartItems.length||e.cartItems.findIndex(r=>r.index===t)===-1)&&e.cartItems.push({index:t,extraIndex:o,number:n,amount:1})},removeIndexFromCart(e,t){e.cartItems=e.cartItems.filter(o=>o.index!==t)},incrementCartItemAmount(e,t){const o=e.cartItems.findIndex(n=>n.index===t);o!==-1&&(e.cartItems[o].amount+=1)},decrementCartItemAmount(e,t){const o=e.cartItems.findIndex(n=>n.index===t);o!==-1&&(e.cartItems[o].amount-=1)},clearCart(e){e.cartItems=[]}},getters:{cartItems(e){return e.cartItems}}},Nd=Object.freeze(Object.defineProperty({__proto__:null,default:ta},Symbol.toStringTag,{value:"Module"})),oa={namespaced:!0,state:()=>({playerNotification:null,NOTIFICATION_STATUS:{NONE:0,DANGER:1,BROWN:2}}),mutations:{setJson(e,t){var o=JSON.parse(t);o.sort((n,r)=>r[0]-n[0]),o={isNotRead:o[0],items:o[1].map(n=>n={time:n[0],title:n[1],text:n[2],danger:n[3]==e.NOTIFICATION_STATUS.DANGER,brown:n[3]==e.NOTIFICATION_STATUS.BROWN})},e.playerNotification=o},set(e,t){e.playerNotification=t}},getters:{playerNotification(e){return e.playerNotification}}},xd=Object.freeze(Object.defineProperty({__proto__:null,default:oa},Symbol.toStringTag,{value:"Module"})),na={namespaced:!0,state:()=>({voiceChat:{isActive:!1,keyCode:-1,isMuted:!1},buttons:{chat:!0,radio:!1,megaphone:!1}}),mutations:{setVoiceChat(e,t){e.voiceChat={...e.voiceChat,...t}},setVoiceChatMuted(e,t){e.voiceChat.isMuted=t},setChatButtonStatus(e,t){e.buttons.chat=t},setRadioButtonStatus(e,t){e.buttons.radio=t},setMegaphoneButtonStatus(e,t){e.buttons.megaphone=t}},getters:{isActive(e){return e.voiceChat.isActive},keyCode(e){return e.voiceChat.keyCode},isMuted(e){return e.voiceChat.isMuted},chatButton(e){return e.buttons.chat},radioButton(e){return e.buttons.radio},megaphoneButton(e){return e.buttons.megaphone}}},Kd=Object.freeze(Object.defineProperty({__proto__:null,default:na},Symbol.toStringTag,{value:"Module"})),ra={namespaced:!0,state:()=>({bannedPhrases:[],criticalValue:null}),mutations:{setBannedPhrases(e,t){e.bannedPhrases=[...t]},addBannedPhrases(e,t){e.bannedPhrases=[...e.bannedPhrases,...t]},setCriticalValue(e,t){e.criticalValue=t}},getters:{bannedPhrases(e){return e.bannedPhrases},criticalValue(e){return e.criticalValue}}},Fd=Object.freeze(Object.defineProperty({__proto__:null,default:ra},Symbol.toStringTag,{value:"Module"})),te=_d({modules:{menu:Ws,settings:Gs,player:zs,keyboard:qs,carShop:Xs,binder:Js,ravito:Qs,photos:Zs,draw:ea,main_menu:ta,notifications:oa,voiceChat:na,chat:ra}});window.KEY_CODE_ENTER=13;window.KEY_CODE_ALT=18;window.KEY_CODE_SPACE=32;window.KEY_CODE_ESC=27;window.KEY_CODE_W=87;window.KEY_CODE_A=65;window.KEY_CODE_S=83;window.KEY_CODE_D=68;window.KEY_CODE_SHIFT=16;window.KEY_CODE_CTRL=17;window.KEY_CODE_H=72;window.KEY_CODE_B=66;window.KEY_CODE_I=73;window.KEY_CODE_J=74;window.KEY_CODE_C=67;window.KEY_CODE_Q=81;window.KEY_CODE_E=69;window.KEY_CODE_F=70;window.KEY_CODE_F6=117;window.KEY_CODE_F8=119;window.KEY_CODE_TAB=9;window.KEY_CODE_R=82;window.KEY_CODE_X=88;window.KEY_CODE_1=49;window.KEY_CODE_CAPS_LOCK=20;window.KEY_CODE_ARROW_LEFT=37;window.KEY_CODE_ARROW_RIGHT=39;window.KEY_CODE_ARROW_TOP=38;window.KEY_CODE_ARROW_BOTTOM=40;window.KEY_CODE_COMMA=188;window.KEY_CODE_PERIOD=190;window.KEY_CODE_UP=38;window.KEY_CODE_M=77;window.KEY_CODE_2=50;window.KEY_CODE_L=76;window.KEY_CODE_K=75;window.KEY_CODE_U=85;window.KEY_CODE_T=84;window.KEY_CODE_F1=112;window.KEY_CODE_F5=116;window.KEY_CODE_F6=117;window.KEY_CODE_F7=118;window.KEY_CODE_LEFT_SHIFT=16;window.KEY_CODE_Z=90;window.KEY_CODE_O=79;window.KEY_CODE_G=71;window.KEY_CODE_F2=113;window.KEY_CODE_P=80;window.KEY_CODE_PAGE_UP=33;window.KEY_CODE_PAGE_DOWN=34;window.KEY_CODE_NUMPAD_1=97;window.KEY_CODE_R_ALT=18;window.KEY_CODE_Y=89;window.KEY_CODE_N=78;window.KEY_CODE_BACKSPACE=8;const Bd={key:0,class:"hover-wrapper__lignt-container"};function Ud(e,t,o,n,r,i){return ve(),Me("div",{class:tt(["hover-wrapper",i.classes]),onMouseenter:t[0]||(t[0]=(...s)=>i.playHoverSound&&i.playHoverSound(...s)),onClick:t[1]||(t[1]=(...s)=>i.playClickSound&&i.playClickSound(...s))},[tu(e.$slots,"default"),o.isAnimated?(ve(),Me("div",Bd,[it("div",{class:"hover-wrapper__light",style:mo({background:`linear-gradient(279deg, rgba(255, 255, 255, 0) 25.05%, rgba(255, 255, 255, ${i.lightOpacity}) 49.05%, rgba(255, 255, 255, 0) 73.37%)`})},null,4)])):Fo("",!0)],34)}const kd="UI/UI_button_point.mp3",Yd="UI/UI_click_02.mp3",$d={props:{isBright:{type:Boolean,default:!1},hoverSound:{type:String,default:kd},clickSound:{type:String,default:Yd},isAnimated:{type:Boolean,default:!0}},computed:{lightOpacity(){return this.isBright?.7:.2},classes(){return{"hover-wrapper_hoverable":!this.isMobile}},isMobile(){return this.$root.isMobile}},methods:{playHoverSound(){this.hoverSound.length&&window.playSound(this.hoverSound)},playClickSound(){this.clickSound.length&&window.playSound(this.clickSound)}}},jd=hn($d,[["render",Ud]]),Wd={class:"skeleton-loader"},Gd=it("div",{class:"skeleton-loader__light"},null,-1),zd=[Gd];function qd(e,t){return ve(),Me("div",Wd,zd)}const Xd={},Jd=hn(Xd,[["render",qd]]),Ro={...window.console};var Qd=["assert","count","debug","dir","dirxml","error","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","table","time","timeEnd","trace","warn"];class Zd{error(...t){const o=this.getConsole();o&&o.error(...t)}log(...t){const o=this.getConsole();o&&o.log(...t)}getConsole(){return window.App.$refs.console}}const Dn=new Zd;for(const e of Qd)console[e]=function(){Ro&&e in Ro&&(Ro[e].apply(Ro,arguments),e in Dn&&Dn[e].apply(Dn,arguments))};(function(e){typeof module=="object"&&module.exports?module.exports=e(global,global.engine,!1):window.engine=e(window,window.engine,!0)})(function(e,t,o){var n=t!==void 0;if(t=t||{},t._Initialized)return t;var r=[2,0,3,0];function i(){this.events={}}function s(a,u){this.code=a,this.context=u}i.prototype._createClear=function(a,u,c,h){return function(){var _=a.events[u];if(_){var v=-1;if(c===void 0){for(var b=0;b<_.length;++b)if(_[b].wasInCPP!==void 0){v=b;break}}else v=_.indexOf(c);v!=-1&&(_.splice(v,1),_.length===0&&delete a.events[u])}else t.RemoveOnHandler!==void 0&&t.RemoveOnHandler(u,c,h||t)}},i.prototype.on=function(a,u,c){var h=this.events[a];h===void 0&&(h=this.events[a]=[]);var _=new s(u,c||this);return h.push(_),{clear:this._createClear(this,a,_,c)}},i.prototype.off=function(a,u,c){var h=this.events[a];if(h!==void 0){c=c||this;var _,v=h.length;for(_=0;_<v;++_){var b=h[_];if(b.code==u&&b.context==c)break}_<v&&(h.splice(_,1),h.length===0&&delete this.events[a])}else t.RemoveOnHandler(a,u,c||this)},i.prototype.trigger=function(a){var u=this.events[a];if(u!==void 0){var c=Array.prototype.slice.call(arguments,1);return u.forEach(function(h){h.code.apply(h.context,c)}),!0}return!1},t.isAttached=n,t.isAttached||(i.prototype.on=function(a,u,c){var h=this.events[a];this.browserCallbackOn&&this.browserCallbackOn(a,u,c),h===void 0&&(h=this.events[a]=[]);var _=new s(u,c||this);return h.push(_),{clear:this._createClear(this,a,_)}},i.prototype.off=function(a,u,c){var h=this.events[a];if(h!==void 0){c=c||this;var _,v=h.length;for(_=0;_<v;++_){var b=h[_];if(b.code==u&&b.context==c)break}_<v&&(h.splice(_,1),h.length===0&&(delete this.events[a],this.browserCallbackOff&&this.browserCallbackOff(a,u,c)))}},t.SendMessage=function(a,u){var c=Array.prototype.slice.call(arguments,2),h=t._ActiveRequests[u];delete t._ActiveRequests[u];var _=function(){var v=t._mocks[a];v!==void 0&&h.resolve(v.apply(t,c))};window.setTimeout(_,16)},t.TriggerEvent=function(){var a=Array.prototype.slice.call(arguments),u=function(){var c=t._mocks[a[0]];c!==void 0&&c.apply(t,a.slice(1))};return window.setTimeout(u,16),t._mocks[a[0]]!==void 0},t.BindingsReady=function(){t._OnReady()},t.createJSModel=function(a,u){e[a]=u},t.updateWholeModel=function(){},t.synchronizeModels=function(){},t.enableImmediateLayout=function(){},t.isImmediateLayoutEnabled=function(){return!0},t.executeImmediateLayoutSync=function(){},t._mocks={},t._mockImpl=function(a,u,c,h){u&&(this._mocks[a]=u);var _=u.toString().replace("function "+u.name+"(",""),v=_.indexOf(")"),b=_.substr(0,v);this.browserCallbackMock&&this.browserCallbackMock(a,b,c,!!h)},t.mock=function(a,u,c){this._mockImpl(a,u,!0,c)}),t.events={};for(var l in i.prototype)t[l]=i.prototype[l];return t.isAttached&&(t.on=function(a,u,c){return u?(t.AddOrRemoveOnHandler(a,u,c||t),{clear:this._createClear(this,a,u,c)}):(console.error("No handler specified for engine.on"),{clear:function(){}})}),t.whenReady=new Promise(a=>{t.on("Ready",a)}),t._trigger=i.prototype.trigger,t.trigger=function(){this._trigger.apply(this,arguments)||this.TriggerEvent.apply(this,arguments)},t.isAttached&&(t.mock=function(){}),t._BindingsReady=!1,t._ContentLoaded=!1,t._RequestId=0,t._ActiveRequests={},t.call=function(){t._RequestId++;var a=t._RequestId,u=Array.prototype.slice.call(arguments);u.splice(1,0,a);var c=new Promise(function(h,_){t._ActiveRequests[a]={resolve:h,reject:_},t.SendMessage.apply(t,u)});return c},t._Result=function(a){var u=t._ActiveRequests[a];if(u!==void 0){delete t._ActiveRequests[a];var c=Array.prototype.slice.call(arguments);c.shift(),u.resolve.apply(u,c)}},t._Reject=function(a){var u=t._ActiveRequests[a];u!==void 0&&(delete t._ActiveRequests[a],requestAnimationFrame(()=>u.reject("No handler registered")))},t._ForEachError=function(a,u){for(var c=a.length,h=0;h<c;++h)u(a[h].first,a[h].second)},t._TriggerError=function(a){t.trigger("Error",a)},t._OnError=function(a,u){if(a===null||a===0)t._ForEachError(u,t._TriggerError);else{var c=t._ActiveRequests[a];delete t._ActiveRequests[a],c.reject(new Error(u[0].second))}if(u.length)throw new Error(u[0].second)},t._OnReady=function(){t._BindingsReady=!0,t._ContentLoaded&&t.trigger("Ready")},t._OnContentLoaded=function(){t._ContentLoaded=!0,t._BindingsReady&&t.trigger("Ready")},o?e.addEventListener("DOMContentLoaded",function(){t._OnContentLoaded()}):t._ContentLoaded=!0,t.on("_Result",t._Result,t),t.on("_Reject",t._Reject,t),t.on("_OnReady",t._OnReady,t),t.on("_OnError",t._OnError,t),t.dependency=new WeakMap,t.hasAttachedUpdateListner=!1,t.onUpdateWholeModel=a=>{(t.dependency.get(a)||[]).forEach(c=>t.updateWholeModel(c))},t.createObservableModel=a=>{const u={set:(c,h,_)=>{t.updateWholeModel(window[a]),c[h]=_}};t.createJSModel(a,new Proxy({},u))},t.addSynchronizationDependency=(a,u)=>{t.hasAttachedUpdateListner||(t.addDataBindEventListner("updateWholeModel",t.onUpdateWholeModel),t.hasAttachedUpdateListner=!0);let c=t.dependency.get(a);c||(c=[],t.dependency.set(a,c)),c.push(u)},t.removeSynchronizationDependency=(a,u)=>{let c=t.dependency.get(a)||[];c.splice(c.indexOf(u),1)},t.BindingsReady(r[0],r[1],r[2],r[3]),t._Initialized=!0,t});const Pi=window.KEY_CODE_H,ef=window.KEY_CODE_B;let Lo=!1,Pn=!1;function tf(){sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"CarSiren_OnPlayerSirenEnable")}function of(){sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"CarSiren_OnPlayerBeepDisable")}function nf(){sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"CarSiren_OnPlayerBeepEnable")}function rf(){sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"CarSiren_OnPlayerBeepDisable")}window.addEventListener("load",()=>{let e=window.interface("Hud");const t=()=>e?!!e.speedometer.show:!1;document.addEventListener("keydown",({keyCode:o})=>{let n=window.isOpenedChat();o===Pi&&!Lo&&t()&&!n&&(Lo=!0,nf())}),document.addEventListener("keyup",({keyCode:o})=>{let n=window.isOpenedChat();o===Pi&&t()&&!n&&Lo&&(Lo=!1,rf()),o===ef&&t()&&!n&&window.isBluredInput&&(Pn?of():tf(),Pn=!Pn)})});const sf=e=>e>1e3?`${(e/1e3).toFixed(2)}км`:`${e.toFixed(2)}м`,af=(e,t,o,n,r=!0)=>{const i=Math.hypot(o-e,n-t);return r?sf(i):i};let Xt=[],Vt={},lf=0;const Bo={},Uo={},Ht={},uf={VOL:2},cf=100;let ro=!1,ia=!1;window.startVoiceRecord=e=>{ro||window.inputFocus||window.getInterfaceStatus("PauseMenu")||window.getInterfaceStatus("MainMenu")||(sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnVoiceChatStartRecord",e),engine.trigger("SetVoiceRecord",!0),ro=e,window.App.$store.commit("voiceChat/setVoiceChat",{isActive:!0,keyCode:e}),console.log(`[client] startVoiceRecord [keyCode: ${e}]`))};window.stopVoiceRecord=(e=cf)=>{if(window.App.developmentMode){console.log("[client] stopVoiceRecord");return}if(!ro)return;let t=()=>{sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnVoiceChatEndRecord",ro),engine.trigger("SetVoiceRecord",!1),ro=null,window.App.$store.commit("voiceChat/setVoiceChat",{isActive:!1}),console.log("[client] stopVoiceRecord")};e>0?setTimeout(()=>{t()},e):t()};const df=15;window.setClipboardText=e=>{engine.trigger("SetClipboardText",e)};window.setPlayerOxygen=e=>{engine.trigger("SetPlayerOxygen",e)};window.openLink=e=>{engine.trigger("OpenLink",e)};window.getRoute=(e,t,o,n,r,i,s,l)=>{if(window.App.developmentMode){console.log("[client] getRoute",e,t,o,n,r,i,s,l);return}window.startNavigationInterval(n,r,i)};window.quitGame=()=>{if(window.App.developmentMode){console.log("[client] quitGame");return}engine.trigger("QuitGame")};window.onRouteReceived=e=>{console.log(e)};window.setDisplayRadarMarker=e=>{client.setDisplayRadarMarker(e)};window.setVehiclePaintJob=(e,t,o)=>{if(window.App.developmentMode){console.log("[client] setVehiclePaintJob",e,t,o);return}engine.trigger("SetVehiclePaintJob",e,t,o)};window.resetVehiclePaintJob=e=>{if(window.App.developmentMode){console.log("[client] resetVehiclePaintJob",e);return}engine.trigger("ResetVehiclePaintJob",e)};window.onChatMessageAction=(e,t,o)=>{sendClientEventHandle(gm.EVENT_EXECUTE_PUBLIC,"ChatMessage_OnPlayerAction",parseInt(e),parseInt(t),parseInt(o))};window.updatePlayers=()=>{window.App.developmentMode||engine.trigger("UpdatePlayers")};window.updatePlayerList=()=>{window.App.developmentMode||engine.trigger("UpdatePlayersList")};window.onUpdatePlayersList=e=>{if(!window.App.developmentMode&&window.getInterfaceStatus("MainMenu")){let t=window.interface("MainMenu");t.setCurrentOnline(e.count+1),t.updatePlayerList(e)}};window.createCorona=(e,t,o,n,r,i,s,l,a,u,c,h,_,v,b,m,g,P,M,B,D)=>{window.App.developmentMode||window.App.engine==="legacy"&&engine.trigger("CreateCorona",parseInt(e),parseInt(t),parseInt(o),parseInt(n),parseInt(r),parseFloat(i),parseFloat(s),parseFloat(l),parseFloat(a),parseFloat(u),parseInt(c),parseInt(h),!!_,!!v,parseFloat(b),!!m,parseFloat(g),parseInt(P),parseFloat(M),!!B,!!D)};window.attachCoronaToVehicle=(e,t)=>{window.App.developmentMode||window.App.engine==="legacy"&&engine.trigger("AttachCoronaToVehicle",parseInt(e),parseInt(t))};window.destroyCorona=e=>{window.App.developmentMode||window.App.engine==="legacy"&&engine.trigger("DestroyCorona",parseInt(e))};window.setVehicleMaterial=(e,t,o,n,r,i,s,l,a)=>{window.App.developmentMode||window.App.engine==="legacy"&&engine.trigger("SetVehicleMaterial",parseInt(e),t,parseInt(o),parseInt(n),parseInt(r),parseInt(i),parseFloat(s),parseFloat(l),parseFloat(a))};window.setVehicleLightStatus=(e,t,o)=>{window.App.developmentMode||engine.trigger("SetVehicleLightStatus",parseInt(e),parseInt(t),!!o)};window.resetVehicleMaterial=(e,t)=>{window.App.developmentMode||window.App.engine==="legacy"&&engine.trigger("ResetVehicleMaterial",parseInt(e),t)};window.createArea=(e,t,o,n,r)=>{window.App.developmentMode||engine.trigger("CreateArea",e,t,o,n,r)};window.destroyArea=e=>{window.App.developmentMode||engine.trigger("DestroyArea",e)};window.createAreasGroup=e=>{if(window.App.developmentMode)return;let t=JSON.parse(e);for(let o in t)window.createArea(t[o][0],t[o][1],t[o][2],t[o][3],t[o][4])};window.setDrawLabelTrueStateBlocker=e=>{ia=e};window.setDrawLabelStatus=e=>{window.App.developmentMode||e&&ia||engine.trigger("SetDrawLabelStatus",e)};window.setChatInputStatus=e=>{window.App.developmentMode||engine.trigger("SetChatInputStatus",e)};window.isOpenedChat=()=>{let e=window.interface("Hud");if(!e||!e.$refs)return!1;let t=e.$refs.chat;return t?t.isOpen:!1};window.sendClientEventHandle=(e,...t)=>{if(window.App.developmentMode){if(t[0]==="EndedInitializeBrowser")return;console.log(`[engine] call ${t}`);return}let o={event:e,args:t};engine.trigger("SendClientEvent",JSON.stringify(o))};window.sendClientEvent=(e,...t)=>{if(window.App.developmentMode){console.log(`[engine] call ${e} ${t}`);return}let o={};typeof t[0]=="object"&&(o=t[0],t.shift()),!(window.isOpenedChat()&&!o.ignoreChat)&&window.sendClientEventHandle(e,...t)};window.sendClientKeyEvent=e=>{engine.trigger("SendKeyEvent",e)};window.setCursorStyle=(e="default")=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("SetCursorStyle",e)};window.isCursorActive=e=>window.App.developmentMode?!1:window.cursorStatus===!0||Xt.includes(e);window.setCursorStatus=(e,t)=>{var n,r,i;if(window.App.developmentMode)return;typeof t=="number"&&(t=t==1);let o=Xt.indexOf(e);if(t)o==-1&&Xt.push(e);else if(o!=-1&&Xt.splice(o,1),Xt.length>0)return;window.cursorStatus=t,window.App.isMobile&&(window.interface("Hud").isShowControllers=!t),engine.trigger("SetCursorStatus",t),!(t&&((i=(r=(n=window.interface("Hud"))==null?void 0:n.$refs)==null?void 0:r.chat)!=null&&i.isOpen))&&window.setDrawLabelStatus(!t)};window.setHudStatus=e=>{e=!1,!window.App.developmentMode&&engine.trigger("SetHudStatus",e)};window.createVirtualButton=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("CreateVirtualButton",e)};window.virtualControlTouchStart=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("VirtualControlTouchStart",e)};window.virtualControlMove=(e,t,o)=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("VirtualControlMove",e,t,o)};window.virtualControlTouchEnd=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("VirtualControlTouchEnd",e)};window.onScreenButtonCreate=e=>{Tr(e,"OnScreenButtonCreate")};window.onScreenJoystickCreate=e=>{Tr(e,"OnScreenJoystickCreate")};window.onScreenTouchPadCreate=e=>{Tr(e,"OnScreenTouchPadCreate")};let Tr=(e,t)=>{window.App.developmentMode||(Vt[e]=(Vt[e]||0)+1,!(Vt[e]>1)&&window.App.engine!="legacy"&&engine.trigger(t,e))};const sa="<Keyboard>/x",aa="<Keyboard>/u",la="<Keyboard>/x<Mouse>2";window.onScreenControlTouchStart=e=>{window.App.developmentMode||window.App.engine!="legacy"&&(e===sa?window.onVoiceRecordChange(window.VOICE_CHAT_KEY_CODE,!0):e===aa?window.onVoiceRecordChange(window.RADIO_KEY_CODE,!0):e===la?window.onVoiceRecordChange(window.MEGAPHONE_KEY_CODE,!0):engine.trigger("OnScreenControlTouchStart",e))};window.onScreenControlTouchMove=(e,t,o)=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("OnScreenControlTouchMove",e,t,o)};window.onScreenControlTouchEnd=e=>{window.App.developmentMode||window.App.engine!="legacy"&&(e===sa?window.onVoiceRecordChange(window.VOICE_CHAT_KEY_CODE,!1):e===aa?window.onVoiceRecordChange(window.RADIO_KEY_CODE,!1):e===la?window.onVoiceRecordChange(window.MEGAPHONE_KEY_CODE,!1):engine.trigger("OnScreenControlTouchEnd",e))};window.onScreenControlSetValue=(e,t)=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("OnScreenControlSetValue",e,t)};window.onScreenControlRemove=e=>{window.App.developmentMode||(Vt[e]--,Vt[e]==0&&(delete Vt[e],window.App.engine!="legacy"&&engine.trigger("OnScreenControlRemove",e)))};window.setAimMode=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("SetAimMode",e)};window.nextWeapon=()=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("NextWeapon")};window.setWaypoint=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("SetWaypoint",e.x,e.y)};window.setRoute=e=>{window.App.$store.commit("player/setRoute",e)};window.onScreenTap=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("OnScreenTap",e.x,e.y)};window.saveSettings=()=>{if(!window.App.developmentMode&&window.App.engine!="legacy"){let e=JSON.stringify(App.$store.getters["settings/settings"]);engine.trigger("SaveSettings",e)}};window.saveControlsSettings=e=>{window.App.developmentMode||window.App.engine!="legacy"&&engine.trigger("SaveControlsSettings",JSON.stringify(e))};window.openFirstPersonConfig=()=>{engine.trigger("OpenFirstPersonConfig")};window.getNavigationPath=(e,t,o,n=0)=>{engine.trigger("GetNavigationPath",e,t,o,n)};window.setWaypoint=(e,t)=>{engine.trigger("SetWaypoint",e,t)};window.disableWaypoint=()=>{engine.trigger("DisableWaypoint")};window.engine!=null&&(engine.on("OnEngineInitialized",(e,t)=>{let o=window.App;o.engine=e,o.platform=t,o.isMobile&&(d(()=>import("./touches.js"),[],import.meta.url),window.onScreenTouchPadCreate("<Mouse>/delta")),window.updateCurrentSettings()}),engine.on("OnReceivingCurrentSettings",e=>{window.onReceivingCurrentSettings(e)}),engine.on("UpdateScreenInfo",e=>{window.App.deviceScreen=JSON.parse(e)}),engine.on("SoundPlayingStarted",e=>{}),engine.on("SoundPlayingEnded",e=>{}),engine.on("UpdatePlayerPosition",(e,t,o,n,r)=>{window.App.$store.commit("player/setPosition",{x:e,y:t,z:o,interior:r,angle:n})}),engine.on("NavigationPathUpdated",e=>{const t=window.interface("Map");e=JSON.parse(e),e=e.map(([l,a,u])=>[l,a]);const[o,n]=e[e.length-1],{x:r,y:i}=window.App.$store.getters["player/position"];if(af(o,n,r,i,!1)<df)window.disableWaypoint(),window.discardRoute();else{if(window.setRoute(e),!t)return;t.setRoute(e)}}),engine.on("OpenInterface",(e,t)=>{window.openInterface(e,t)}),engine.on("CloseInterface",e=>{window.closeInterface(e)}),engine.on("CursorStatusChanged",e=>{window.setCursorStatus("Server",e)}),engine.on("WebRequestCompleted",(e,t,o)=>{if(!Bo[e])return;let n;try{n=JSON.parse(o)}catch{n=o}Bo[e](t,n),delete Bo[e]}),engine.on("OnSoundLoadFailed",(e,t)=>{console.log(`[sound] OnSoundLoadFailed ${e} - ${t}`),sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"Sound_OnLoadFailed",e,t)}));window.discardRoute=()=>{window.stopNavigationInterval();const e=window.interface("Map");window.setRoute([]),e&&(e.point.show=!1,e.setRoute([]))};const ua=e=>{const t=lf++;return Bo[t]=e,t};window.sendWebRequest=(e,t,o,n)=>{if(window.App.engine==="legacy"||window.App.engine==="Unity"){var r=new XMLHttpRequest;r.open(t,e,!0),r.onload=function(){n&&n(r.status,r.responseText)},r.send(JSON.stringify(o))}else{const i=ua(n),s=JSON.stringify(o);engine.trigger("SendWebRequest",i,e,t,s)}};window.uploadPhotos=(e,t,o,n)=>{const r=ua(n),i=JSON.stringify(o),s=JSON.stringify(t);engine.trigger("UploadPhotos",r,e,s,i)};window.setGangZones=e=>{window.App.$store.commit("player/setGangZones",e)};window.addGangZones=e=>{const t=window.App;for(const o of e)t.$store.commit("player/addGangZone",o)};window.removeGangZone=e=>{window.App.$store.commit("player/removeGangZone",e)};window.enableGangZoneFlash=(e,t)=>{window.App.$store.commit("player/enableGangZoneFlash",[e,t])};window.disableGangZoneFlash=e=>{window.App.$store.commit("player/disableGangZoneFlash",e)};window.setInvertMouse=e=>{engine.trigger("SetInvertMouse",e);const t="invertMouse";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setMouseFlying=e=>{engine.trigger("SetMouseFlying",e);const t="mouseFlying";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.updateCurrentSettings=()=>{engine.trigger("UpdateCurrentSettings")};window.onReceivingCurrentSettings=e=>{const t=JSON.parse(e);for(var o=0;o<Object.keys(t).length;o++){const n=Object.keys(t)[o],r=Object.values(t)[o];window.App.$store.commit("settings/setSettingsProperty",{key:n,value:r})}};window.setDrawDistance=e=>{engine.trigger("SetDrawDistance",e);const t="drawDistance";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setWideScreen=e=>{engine.trigger("SetWideScreen",e);const t="wideScreen";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setQuality=e=>{engine.trigger("SetQuality",e);const t="graphicsQuality";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setFrameLimiter=e=>{engine.trigger("SetFrameLimiter",e);const t="frameLimiter";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setMouseSensitivity=e=>{engine.trigger("SetMouseSensitivity",e);const t="mouseSensitivity";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setBrightness=e=>{engine.trigger("SetBrightness",e);const t="brightness";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setAntiAliasing=e=>{engine.trigger("SetAntiAliasing",e);const t="antiAliasing";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setVideoMode=e=>{engine.trigger("SetVideoMode",e);const t="videoMod";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setSoundsVolume=e=>{engine.trigger("SetVolume",e);const t="soundsVolume";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setMaxFPS=e=>{const t="maxFPS";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setPostProcessing=e=>{const t="postProcessing";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setTexturesQuality=e=>{const t="texturesQuality";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setShadowsQuality=e=>{const t="shadowsQuality";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setResolution=e=>{const t="resolution";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setCustomEnabled=e=>{const t="customEnabled";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setUseNativeKeyboard=e=>{const t="useNativeKeyboard";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.setUseJoystick=e=>{const t="useJoystick";window.App.$store.commit("settings/setSettingsProperty",{key:t,value:e})};window.pushToUsedKeys=e=>{window.App.$store.commit("settings/pushToUsedKeys",e)};window.replaceUsedKey=(e,t)=>{window.App.$store.commit("settings/replaceUsedKey",{oldKey:e,newKey:t})};const ff=(e,t)=>{Uo[e]=t};window.checkAndDestroyTimerThread=e=>{Ht[e]&&(clearTimeout(Ht[e]),delete Ht[e])};window.playSound=(e,t=!1,o=0,n=0,r=!0,i=()=>{})=>{window.checkAndDestroyTimerThread(o);var s=e;window.isValidHttpUrl(s)||(s=`uiresources/sounds/${s}`),t=!!t,ff(o,i),engine.trigger("Sound_Create2D",o,s,n>0?n:window.globalVolume,r,t)};engine.on("OnSoundEnded",e=>{Uo[e]&&(Uo[e](),delete Uo[e])});window.stopSound=(e=0)=>{engine.trigger("Sound_Destroy",e)};window.pauseSound=e=>{if(window.App.developmentMode){console.log("[client] pauseSound3D sound",e);return}engine.trigger("Sound_Pause",e)};window.resumeSound3D=e=>{if(window.App.developmentMode){console.log("[client] resumeSound3D sound",e);return}engine.trigger("Sound3D_Play",e)};window.changeSound3D=(e,t,o,n,r,i,s,l,a,u,c)=>{if(window.App.developmentMode){console.log("[client] changeSound sound",e,t,o,n,r,i,u);return}engine.trigger("Sound_Destroy",e),window.createSound3D(e,t,o,n,r,i,s,l,a,u)};window.createSound3D=(e,t,o,n,r,i,s,l,a,u)=>{if(window.App.developmentMode){console.log("[client] create sound",e,path,o,n,r,i,u);return}var c=t;window.isValidHttpUrl(c)||(c=`uiresources/sounds/${c}`),engine.trigger("Sound_Create3D",e,c,o,n,r,i,s,l,a,u)};window.attachSound3DToBot=(e,t,o,n,r)=>{if(window.App.developmentMode){console.log("[client] attachSoundToBot",e,t,o,n,r);return}engine.trigger("Sound_AttachToBot",e,t,o,n,r)};window.attachSoundToVehicle=(e,t,o,n,r)=>{if(window.App.developmentMode){console.log("[client] attachSoundToVehicle",e,t,o,n,r);return}engine.trigger("Sound_AttachToVehicle",e,t,o,n,r)};window.attachSound3DToPlayer=(e,t,o,n,r)=>{if(window.App.developmentMode){console.log("[client] attachSoundToPlayer",e,t,o,n,r);return}engine.trigger("Sound_AttachToPlayer",e,t,o,n,r)};window.setSound3DPosition=(e,t)=>{if(window.App.developmentMode){console.log("[client] Sound_SetChannelPosition",e,t);return}engine.trigger("Sound_SetChannelPosition",e,t)};window.destroySound=(e,t)=>{if(window.App.developmentMode){console.log("[client] destroySound",e);return}engine.trigger("Sound_SlideAttribute",e,uf.VOL,0,t);var o=setTimeout(()=>{engine.trigger("Sound_Destroy",e),Ht[e]&&delete Ht[e]},t+10);window.checkAndDestroyTimerThread(e),Ht[e]=o};window.soundSlideAttribute=(e,t,o,n)=>{engine.trigger("Sound_SlideAttribute",e,t,o,n)};window.setControl=(e,t,o)=>{console.log("[client] setControl",e,t,o),engine.trigger("SetControl",e,t,o);const n="controls";var r=window.App.$store.getters["settings/settings"].controls;r[e][t]=o,window.App.$store.commit("settings/setSettingsProperty",{key:n,value:r})};window.sendDonateBuy=e=>{engine.trigger("PurchaseProduct",e)};window.setPlayerChatBubble=(e,t,o,n,r)=>{window.containsBannedPhrase(t)||engine.trigger("SetPlayerChatBubble",e,t,o,n,r)};window.getAdvertising=(e,t,o)=>{const{server:n,username:r}=o;var i=window.App.$store.getters["player/advertisingServiceUrl"];window.sendWebRequest(`${i}?place=${e}&server=${n}&username=${r}`,"GET",[],t)};window.getKnowledgeBaseCategories=e=>{var t=window.App.$store.getters["player/knowledgeServiceUrl"];window.sendWebRequest(`${t}/categories`,"GET",[],e)};window.getKnowledgeBaseSearch=(e,t="")=>{var o=window.App.$store.getters["player/knowledgeServiceUrl"];window.sendWebRequest(`${o}/search?query=${t}`,"GET",[],e)};window.getKnowledgeBasePosts=(e,t)=>{var o=window.App.$store.getters["player/knowledgeServiceUrl"];window.sendWebRequest(`${o}/posts/${t}`,"GET",[],e)};window.stroboscopeParams=[{red:246,green:0,blue:0,alpha:150,radius:.6,coronaType:0,flareType:0,enableReflection:!1,checkObstacles:!1,angle:0,longDistance:!1,nearClip:.1,fadeState:1,onlyFromBelow:!1,reflectionDelay:!1,lightAlign:0,material:"lightbarl"},{red:0,green:0,blue:246,alpha:150,radius:.6,coronaType:0,flareType:0,enableReflection:!1,checkObstacles:!1,angle:0,longDistance:!1,nearClip:.1,fadeState:1,onlyFromBelow:!1,reflectionDelay:!1,lightAlign:1,material:"lightbarr"},{red:246,green:0,blue:0,alpha:150,radius:.4,coronaType:0,flareType:0,enableReflection:!1,checkObstacles:!1,angle:0,longDistance:!1,nearClip:.1,fadeState:1,onlyFromBelow:!1,reflectionDelay:!1,lightAlign:0,material:"lightbarl"},{red:0,green:0,blue:246,alpha:150,radius:.4,coronaType:0,flareType:0,enableReflection:!1,checkObstacles:!1,angle:0,longDistance:!1,nearClip:.1,fadeState:1,onlyFromBelow:!1,reflectionDelay:!1,lightAlign:1,material:"lightbarr"}];window.stroboscopesLightIndexes={FRONT_LEFT:0,FRONT_RIGHT:1,REAR_LEFT:2,REAR_RIGHT:3};window.stroboscopes={};window.stroboscopesTimer=null;window.stroboscopesTimerPeriod=50;window.addStroboscopes=e=>{let t=JSON.parse(e);for(let o in t)window.addStroboscopeEffect(t[o][0],t[o][1],t[o][2],t[o][3],t[o][4],t[o][5],t[o][6],t[o][7],t[o][9],t[o][10]);Object.keys(window.stroboscopes).length>0&&!window.stroboscopesTimer&&(window.stroboscopesTimer=setInterval(window.updateStroboscopes,window.stroboscopesTimerPeriod))};window.EnableStroboscope=e=>{window.destroyCorona(e),window.createCorona(parseInt(e),window.stroboscopes[e].red,window.stroboscopes[e].green,window.stroboscopes[e].blue,window.stroboscopes[e].alpha,window.stroboscopes[e].posX,window.stroboscopes[e].posY,window.stroboscopes[e].posZ,window.stroboscopes[e].radius,window.stroboscopes[e].farClip,window.stroboscopes[e].coronaType,window.stroboscopes[e].flareType,window.stroboscopes[e].enableReflection,window.stroboscopes[e].checkObstacles,window.stroboscopes[e].angle,window.stroboscopes[e].longDistance,window.stroboscopes[e].nearClip,window.stroboscopes[e].fadeState,window.stroboscopes[e].fadeSpeed,window.stroboscopes[e].onlyFromBelow,window.stroboscopes[e].reflectionDelay),window.updateStroboscopeMaterial(e),window.attachCoronaToVehicle(e,window.stroboscopes[e].vehicleId),window.stroboscopes[e].lightAlign?(window.setVehicleLightStatus(window.stroboscopes[e].vehicleId,window.stroboscopesLightIndexes.FRONT_LEFT,!0),window.setVehicleLightStatus(window.stroboscopes[e].vehicleId,window.stroboscopesLightIndexes.FRONT_RIGHT,!1)):(window.setVehicleLightStatus(window.stroboscopes[e].vehicleId,window.stroboscopesLightIndexes.FRONT_LEFT,!1),window.setVehicleLightStatus(window.stroboscopes[e].vehicleId,window.stroboscopesLightIndexes.FRONT_RIGHT,!0))};window.updateStroboscopeMaterial=e=>{window.stroboscopes[e].material!="null"&&window.setVehicleMaterial(window.stroboscopes[e].vehicleId,window.stroboscopes[e].material,window.stroboscopes[e].red,window.stroboscopes[e].green,window.stroboscopes[e].blue,255,32,0,0)};window.DisableStroboscope=e=>{window.destroyCorona(e),window.stroboscopes[e].material!="null"&&window.resetVehicleMaterial(window.stroboscopes[e].vehicleId,window.stroboscopes[e].material)};window.delStroboscopes=e=>{let t=JSON.parse(e);for(let o in t){let n=t[o];window.destroyCorona(n),window.stroboscopes[n].material!="null"&&window.resetVehicleMaterial(window.stroboscopes[n].vehicleId,window.stroboscopes[n].material),delete window.stroboscopes[n]}window.stroboscopesTimer&&Object.keys(window.stroboscopes).length==0&&(clearInterval(window.stroboscopesTimer),window.stroboscopesTimer=null)};window.addStroboscopeEffect=(e,t,o,n,r,i,s,l,a,u=-1)=>{window.stroboscopes[e]={vehicleId:l,red:window.stroboscopeParams[t].red,green:window.stroboscopeParams[t].green,blue:window.stroboscopeParams[t].blue,alpha:window.stroboscopeParams[t].alpha,posX:o,posY:n,posZ:r,radius:window.stroboscopeParams[t].radius,farClip:i,coronaType:window.stroboscopeParams[t].coronaType,flareType:window.stroboscopeParams[t].flareType,enableReflection:window.stroboscopeParams[t].enableReflection,checkObstacles:window.stroboscopeParams[t].checkObstacles,angle:window.stroboscopeParams[t].angle,longDistance:window.stroboscopeParams[t].longDistance,nearClip:window.stroboscopeParams[t].nearClip,fadeState:window.stroboscopeParams[t].fadeState,fadeSpeed:a,onlyFromBelow:window.stroboscopeParams[t].onlyFromBelow,reflectionDelay:window.stroboscopeParams[t].reflectionDelay,maxRenewalTime:s,currentRenewalTime:0,lightAlign:window.stroboscopeParams[t].lightAlign,material:window.stroboscopeParams[t].material,concurrent:u}};window.updateStroboscopes=()=>{for(let e in window.stroboscopes)window.stroboscopes[e].currentRenewalTime+=window.stroboscopesTimerPeriod,window.stroboscopes[e].maxRenewalTime<=window.stroboscopes[e].currentRenewalTime?(window.stroboscopes[e].currentRenewalTime=0,window.stroboscopes[e].concurrent!=-1&&window.DisableStroboscope(window.stroboscopes[e].concurrent),window.EnableStroboscope(e)):window.stroboscopes[e].maxRenewalTime/2<=window.stroboscopes[e].currentRenewalTime&&window.stroboscopes[e].concurrent==-1&&window.DisableStroboscope(e)};window.pinchEvent={prevDistance:null,touches:new Map};const ca=()=>{const[e,t]=window.pinchEvent.touches.values();return Math.hypot((e.pageX-t.pageX)/window.innerWidth,(e.pageY-t.pageY)/window.innerHeight)},pf=()=>{window.pinchEvent.touches.clear(),window.pinchEvent.prevDistance=null,engine.trigger("PinchGestureEnd")},da=()=>{if(!window.App.isMobile)return!1;const e=window.interface("Hud");if(!e.isShowControllers&&!e.useInvisibleJoystick)return!1;const t=e.$refs.hassle;if(!t)return!0;const o=t.$refs.controls;if(!o)return!0;const n=o.$refs.joystick;return!(n&&n.show)};window.addEventListener("touchstart",e=>{if(!da())return;for(const n of e.touches){if(!(n.target.nativeElement||n.target).matches(".hud-iface"))return;window.pinchEvent.touches.set(n.identifier,n)}const[t,o]=window.pinchEvent.touches.values();!t||!o||(window.pinchEvent.prevDistance=ca(e.touches),engine.trigger("PinchGestureStart"))});window.addEventListener("touchend",e=>{if(window.pinchEvent.touches.size!==0){for(const t of e.touches)window.pinchEvent.touches.delete(t.identifier);window.pinchEvent.prevDistance=null,engine.trigger("PinchGestureEnd")}});window.addEventListener("touchmove",e=>{for(const t of e.touches)window.pinchEvent.touches.has(t.identifier)&&window.pinchEvent.touches.set(t.identifier,t)});window.addEventListener("touchmove",e=>{if(window.pinchEvent.touches.size!==2)return;if(!da()){pf();return}const[t,o]=window.pinchEvent.touches.values();if(!t||!o)return;const n=ca(),r=n-window.pinchEvent.prevDistance;window.pinchEvent.prevDistance=n,engine.trigger("PinchGestureMove",r)});function hf(){return window.App.$store.getters["chat/bannedPhrases"]}function wf(){return window.App.$store.getters["chat/criticalValue"]}const _f={а:"[аa@]",б:"[б6b]",в:"[вvb]",г:"[гgr]",д:"[дd]",е:"[еeё3]",ж:"[жzh]",з:"[з3z]",и:"[иu]",й:"[йu]",к:"[кk]",л:"[лl]",м:"[мm]",н:"[нh]",о:"[оo0]",п:"[пp]",р:"[рpr]",с:"[сsc$]",т:"[тt]",у:"[уy]",ф:"[фfph]",х:"[хxh]",ц:"[цc]",ч:"[чch4]",ш:"[шw]",щ:"[щw]",ы:"[ыbi]",э:"[эe]",ю:"[юiu]",я:"[яya]"};function mf(e){return/[.*+?^${}()|[\]\\]/.test(e)?`\\${e}`:e}function gf(e){return e.split("").map(o=>{const n=mf(o.toLowerCase());return _f[n]||`[${n}]`}).join("(?:[^а-яa-z0-9]{0,2})?")}function Ef(e,t){return t.some(o=>{const n=gf(o);return new RegExp(n,"i").test(e)})}function vf(e){if(!e||!/\{v:[^}]+\}/.test(e))return!1;const t=hf(),o=wf();if(t.length==0)return!1;const r=e.replace(/\{v:[^}]+\}/,"").split(/[.!?]/).map(i=>i.trim().toLowerCase());for(const i of r)for(const{level:s,patterns:l,strategy:a}of t)if(l.every(c=>Ef(i,c))&&o>=s)return a;return!1}window.containsBannedPhrase=vf;window.setChatBannedPhrases=e=>{window.App.$store.commit("chat/setBannedPhrases",e)};window.setChatCriticalValue=e=>{window.App.$store.commit("chat/setCriticalValue",e)};window.addChatBannedPhrases=e=>{window.App.$store.commit("chat/addBannedPhrases",e)};window.onChatMessage=(e,t)=>{const o=window.containsBannedPhrase(e);let n="";o&&(console.log("[chat] Blocked invalid message:",o,e),n=o),window.App.developmentMode&&console.log("[chat] Processing message:",e,t,o),t=t.slice(2);let r=window.interface("Hud");r&&r.$refs.chat?r.$refs.chat.add(e,t,n):window.App.developmentMode&&console.warn("[chat] Unable to add message — HUD not available")};window.sendChatInput=e=>{window.App.developmentMode||engine.trigger("SendChatInput",e)};window.updateConfigurationBannedMessage=async(e,t)=>{var i;const o=(i=window.App)==null?void 0:i.developmentMode,n=(...s)=>{o&&console.log("[chat-config]",...s)},r=s=>{try{const l=JSON.parse(s.trim());if(!Array.isArray(l))throw new Error("Invalid format: expected an array of banned phrases");window.setChatBannedPhrases(l),window.setChatCriticalValue(e),n("Critical value:",e),n("Loaded banned phrases:",enrichedData),n(`Total phrases loaded: ${enrichedData.length}`)}catch(l){console.log("[chat-config] Error processing configuration:",l.message),o&&console.debug("[chat-config] Debug info:",{criticalValue:e,hostUrl:t,parseError:l})}};try{window.sendWebRequest(t,"GET",[],(s,l)=>{s===200?r(l):console.error(`[chat-config] Failed to fetch data. Status code: ${s}`)})}catch(s){console.error("[chat-config] Error initiating configuration request:",s.message),o&&console.debug("[chat-config] Debug info:",{criticalValue:e,hostUrl:t,requestError:s})}};const Tt=vc(kc);Tt.component("GlobalHoverWrapper",jd);Tt.component("SkeletonLoader",Jd);Tt.config.errorHandler=e=>{console.error(e)};Tt.use($c);Tt.use(te);Tt.mixin(jc);window.App=Tt.mount("#app");let mt,Dt=[],_n=0,ko=0,be=0,io=0,Ie={refs:1,prevStates:{chat:!0,info:!0,radar:!0,speedometer:!0,interactions:!1}},Ge={},so,fa=!1,pa=null,Zo=null;window.audio=[];const Cf=300,yf=2;window.KEY_CODE_ENTER=13;window.KEY_CODE_ALT=18;window.KEY_CODE_SPACE=32;window.KEY_CODE_ESC=27;window.KEY_CODE_W=87;window.KEY_CODE_A=65;window.KEY_CODE_S=83;window.KEY_CODE_D=68;window.KEY_CODE_SHIFT=16;window.KEY_CODE_CTRL=17;window.KEY_CODE_G=71;window.KEY_CODE_H=72;window.KEY_CODE_B=66;window.KEY_CODE_I=73;window.KEY_CODE_J=74;window.KEY_CODE_C=67;window.KEY_CODE_Q=81;window.KEY_CODE_E=69;window.KEY_CODE_F=70;window.KEY_CODE_F6=117;window.KEY_CODE_F8=119;window.KEY_CODE_TAB=9;window.KEY_CODE_R=82;window.KEY_CODE_X=88;window.KEY_CODE_1=49;window.KEY_CODE_CAPS_LOCK=20;window.KEY_CODE_ARROW_LEFT=37;window.KEY_CODE_ARROW_RIGHT=39;window.KEY_CODE_ARROW_TOP=38;window.KEY_CODE_ARROW_BOTTOM=40;window.KEY_CODE_COMMA=188;window.KEY_CODE_PERIOD=190;window.KEY_CODE_UP=38;window.KEY_CODE_M=77;window.KEY_CODE_V=86;window.KEY_CODE_2=50;window.KEY_CODE_L=76;window.KEY_CODE_K=75;window.KEY_CODE_U=85;window.KEY_CODE_T=84;window.KEY_CODE_F1=112;window.KEY_CODE_F5=116;window.KEY_CODE_F7=118;window.KEY_CODE_LEFT_SHIFT=16;window.KEY_CODE_Z=90;window.KEY_CODE_O=79;window.KEY_CODE_F2=113;window.KEY_CODE_P=80;window.KEY_CODE_PAGE_UP=33;window.KEY_CODE_PAGE_DOWN=34;window.KEY_CODE_NUMPAD_1=97;window.KEY_CODE_BACKSPACE=8;window.KEY_CODE_F3=114;window.VOICE_CHAT_KEY_CODE=window.KEY_CODE_X;window.RADIO_KEY_CODE=window.KEY_CODE_U;window.MEGAPHONE_KEY_CODE=882;window.DEFAULT_SCREEN_WIDTH=1920;window.DEFAULT_SCREEN_HEIGHT=1080;window.cursorStatus=!1;window.globalVolume=1;window.blockInterfaces=!1;window.inputFocus=!1;window.isBluredInput=!0;window.currentKeyboardInput=null;try{navigator.platform="Win"}catch(e){console.log(e.message)}window.visibleInterfaceOrder=[];window.setCanOpenChat=e=>{const t=window.interface("Hud");if(!t)return;const o=t.$refs.chat;o&&o.setIsInactive&&(o.canOpen=e)};window.setCloseChat=()=>{const e=window.interface("Hud");if(!e)return;e.$refs.chat.close()};window.deleteChatMessage=e=>{let t=window.interface("Hud");t&&t.$refs.chat&&t.$refs.chat.deleteChatMessage(e)};window.clearChat=()=>{let e=window.interface("Hud");e&&e.$refs.chat&&e.$refs.chat.clearAll()};window.onVoiceRecordChange=(e,t)=>{const o=te.getters["voiceChat/chatButton"],n=te.getters["voiceChat/radioButton"],r=te.getters["voiceChat/megaphoneButton"],i=e===window.VOICE_CHAT_KEY_CODE&&!o||e===window.RADIO_KEY_CODE&&!n||e===window.MEGAPHONE_KEY_CODE&&!r;te.getters["voiceChat/isMuted"]||i||(t?window.startVoiceRecord(e):window.stopVoiceRecord())};window.showKeyboard=e=>{e==null&&(e="game"),e==="native"&&engine.trigger("OpenKeyboard",""),window.App.showKeyboard=e,window.setHudStatus(!1),be++};window.hideKeyboard=()=>{window.App.showKeyboard=!1,be>0&&--be,be===0&&window.setHudStatus(!0)};window.setChatIsInactive=e=>{const t=window.interface("Hud");if(!t)return;const o=t.$refs.chat;o&&o.setIsInactive&&o.setIsInactive(e)};window.manualHideHud=()=>{let e=window.interface("Hud");Ie.prevStates={chat:e.chatStatus,info:e.info.showBars,radar:e.radar.show,speedometer:e.speedometer.show,voiceChat:e.voiceChat.show,buildDateStatus:window.App.buildDateStatus,interactions:window.getInterfaceStatus("Interactions")},e.setChatStatus(!1),e.hideInfoBars(),e.hideRadar(),e.hideSpeedometer(),e.hideVoiceChat(),window.App.buildDateStatus=!1,Ie.prevStates.interactions&&window.hideInterface("Interactions")};window.manualShowHud=()=>{let e=window.interface("Hud");Ie.prevStates.chat&&e.setChatStatus(!0),Ie.prevStates.info&&(e.info.showBars=!0),Ie.prevStates.radar&&(e.radar.show=!0),Ie.prevStates.speedometer&&(e.speedometer.show=!0),Ie.prevStates.voiceChat&&(e.voiceChat.show=!0),Ie.prevStates.interactions&&window.showInterface("Interactions"),window.App.buildDateStatus=!0};window.manualHideHudListener=()=>{document.addEventListener("keyup",({keyCode:e})=>{e===window.KEY_CODE_F7&&(Ie.refs++,Ie.refs%3===0?(window.manualHideHud(),Ie.refs=0):Ie.refs%3===1&&window.manualShowHud())})};window.addEventListener("load",()=>{window.setDrawLabelStatus(!0),window.manualHideHudListener();let e=0;so||(so=setInterval(()=>{e++,e>=yf&&typeof window.confirmBrowserInitialize<"u"&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"EndedInitializeBrowser")},1e3))});window.confirmBrowserInitialize=()=>{so&&(clearInterval(so),so=0)};window.addDialogInQueue=(e=!1,t=[],o=!1)=>{window.App.addDialogInQueue(e,t,o)};window.closeLastDialog=()=>{window.App.closeLastDialog()};window.adaptate=(e,t=-1)=>{let o=setInterval(()=>{try{let n=window.interface(e);n.$data.noAdaptation||(n.$el.style.transform=`scale(${window.scale})`),clearInterval(o)}catch{return}},10)};const Tf=()=>(-180-new Date().getTimezoneOffset())*60;window.convertTimestampToClient=e=>e-Tf();window.serverDate=(e=Math.floor(Date.now()/1e3))=>new Date(window.convertTimestampToClient(e)*1e3);window.updateParams=(e,t)=>{!window.getInterfaceStatus(e)||!t||window.interface(e).setInterfaceParams(JSON.parse(t))};window.shouldHideChat=e=>{const t=e.options.hideChat;if(typeof t=="string"){const o=window.App.isMobile;return t==="mobile"&&o||t==="computer"&&!o}return t};window.openInterface=async(e,t,o=[])=>{if(window.getInterfaceStatus(e)||window.blockInterfaces)return;e==="Authorization"&&window.getInterfaceStatus("Connect")&&window.closeInterface("Connect");let n=window.component(e);if(n.open.status=!0,n.options.hideControllers&&(window.interface("Hud").isShowControllers=!1),n.options.showRadarButtons&&(window.interface("Hud").isShowRadarButtons=!0),n.options.showRadar&&(window.interface("Hud").isShowRadar=!0),t&&(typeof t=="object"?n.open.params=t:n.open.params=JSON.parse(t.replace(/\n/,"\\n"))),o&&(n.stringParam=o),n.store){let r=await ba(Object.assign({"./store/modules/binder.js":()=>d(()=>Promise.resolve().then(()=>Ld),void 0,import.meta.url),"./store/modules/carShop.js":()=>d(()=>Promise.resolve().then(()=>Rd),void 0,import.meta.url),"./store/modules/chat.js":()=>d(()=>Promise.resolve().then(()=>Fd),void 0,import.meta.url),"./store/modules/draw.js":()=>d(()=>Promise.resolve().then(()=>Hd),void 0,import.meta.url),"./store/modules/keyboard.js":()=>d(()=>Promise.resolve().then(()=>Pd),void 0,import.meta.url),"./store/modules/main_menu.js":()=>d(()=>Promise.resolve().then(()=>Nd),void 0,import.meta.url),"./store/modules/menu.js":()=>d(()=>Promise.resolve().then(()=>Cd),void 0,import.meta.url),"./store/modules/notifications.js":()=>d(()=>Promise.resolve().then(()=>xd),void 0,import.meta.url),"./store/modules/photos.js":()=>d(()=>Promise.resolve().then(()=>Vd),void 0,import.meta.url),"./store/modules/player.js":()=>d(()=>Promise.resolve().then(()=>Id),void 0,import.meta.url),"./store/modules/ravito.js":()=>d(()=>Promise.resolve().then(()=>Md),void 0,import.meta.url),"./store/modules/registration.js":()=>d(()=>import("./registration.js"),[],import.meta.url),"./store/modules/settings.js":()=>d(()=>Promise.resolve().then(()=>bd),void 0,import.meta.url),"./store/modules/voiceChat.js":()=>d(()=>Promise.resolve().then(()=>Kd),void 0,import.meta.url)}),`./store/modules/${n.store}.js`);window.App.$store.registerModule(n.store,r.default)}window.showInterface(e),window.adaptate(e),n.options.hud||(mt&&!n.options.allowAnyInterfaces&&(window.hideInterface(mt),Dt.push(mt)),mt=e),n.options.hideHud&&(window.interface("Hud").hideInfo(),window.setDrawLabelStatus(!1),window.setHudStatus(!1),_n++,be++),window.shouldHideChat(n)&&(window.interface("Hud").setChatStatus(!1),ko++),n.options.useInvisibleJoystick&&window.interface("Hud").setInvisibleJoystickState(!0)};window.component=e=>{let t=window.App.components[e];return!t&&window.AppDev&&window.AppDev.$children&&window.AppDev.$children[0]&&window.AppDev.$children[0].components&&(t=window.AppDev.$children[0].components[e]),t};window.interface=e=>{let t=window.App.$refs[e];return!t&&window.AppDev&&(t=window.AppDev.$children[0].$refs[e]),t&&t.length&&(t=t[0]),t||!1};window.closeInterface=e=>{if(!window.getInterfaceStatus(e))return;let t=window.component(e);if(t.open.status=!1,window.hideInterface(e),window.blockInterfaces=!1,t.options.hideControllers&&(window.interface("Hud").isShowControllers=!0),t.options.showRadarButtons&&(window.interface("Hud").isShowRadarButtons=!1),t.options.showRadar&&(window.interface("Hud").isShowRadar=!1),t.store&&window.App.$store.unregisterModule(t.store),e==mt){if(mt=null,Dt.length>0){let n=Dt.pop();mt=n,window.showInterface(n)}}else if(Dt.length>0){let n=Dt.indexOf(e);Dt.splice(n,1)}const o=window.interface("Hud");t.options.hideHud&&--_n<=0&&!t.options.manualReturn&&(o&&o.openInfo(),window.setDrawLabelStatus(!0),window.setHudStatus(!0)),t.options.hideHud&&(be>0&&--be,be===0&&window.setHudStatus(!0)),window.shouldHideChat(t)&&(ko>0&&--ko,ko===0&&!t.options.manualReturn&&o&&o.setChatStatus(!0)),t.options.useInvisibleJoystick&&o&&o.setInvisibleJoystickState(!1)};window.showInterface=e=>{let t=window.component(e);t.show=!0;let o=window.interface(e);try{if(o){let n=[];window.getRecursiveComponents(o,n);for(let r of n){let i=r.shown;i&&i()}}}finally{if(!t.options.showControlsButton){const n=window.interface("Hud");n&&n.setKeyButtonsDisplay(!1)}t.options.hud||(window.setCursorStatus(e,!0),window.setHudStatus(!1),be++)}window.visibleInterfaceOrder.push(e)};window.hideInterface=e=>{let t=window.component(e);t.show=!1;let o=window.interface(e);if(o){let r=[];window.getRecursiveComponents(o,r);for(let i of r){let s=i.hidden;s&&s()}}t.options.hud||(window.setCursorStatus(e,!1),be>0&&--be,be===0&&window.setHudStatus(!0));const n=window.interface("Hud");n&&n.setKeyButtonsDisplay(!0),window.visibleInterfaceOrder=window.visibleInterfaceOrder.filter(r=>r!==e)};window.getRecursiveComponents=(e,t)=>{if(!e)return;t.push(e);const o=e&&e.$refs?Object.entries(e.$refs||{}):[];for(let[n,r]of o)window.getRecursiveComponents(r,t)};window.getInterfaceStatus=e=>{let t=window.component(e);return t&&t.open?t.open.status:void 0};window.gm={EVENT_EXECUTE_PUBLIC:0,SET_FIRST_PERSON_CONFIG:1,LOCAL_CHAT_MESSAGE:2,SET_VOICE_CHAT_STATUS:3};window.updateGlobalVolume=e=>{window.globalVolume=e};window.setCurrentVolume=(e,t=0)=>{audio[t].volume=e};window.playBackgroundSound=()=>{};window.playAdditionalSound=e=>{let t=new Audio;t.currentTime=0,t.src=e,t.volume=window.globalVolume,t.play()};window.getRandomInt=(e,t)=>Math.floor(Math.random()*(t-e))+e;window.formatNumber=e=>e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".");window.getTimeFormatSeconds=(e,t,o)=>{const n=Math.floor(e/3600).toString().padStart(2,"0"),r=Math.floor(e%3600/60).toString().padStart(2,"0"),i=Math.floor(e%60).toString().padStart(2,"0");return t?r+":"+i:o?n+":"+r:n+":"+r+":"+i};window.setInputFocus=e=>{window.inputFocus=e,engine.trigger("SetInputFocus",e)};window.IsCasinoInterfaceStatus=()=>!!(window.getInterfaceStatus("CasinoRullet")||window.getInterfaceStatus("CasinoRoll")||window.getInterfaceStatus("CasinoSlots")||window.getInterfaceStatus("CasinoCards")||window.getInterfaceStatus("CasinoDice"));document.addEventListener("keydown",e=>{onKeyDown(e.keyCode)});document.addEventListener("keyup",e=>{onKeyUp(e.keyCode)});window.IsDialogOpened=()=>window.App.dialogsQueue.length>0;window.getOnCreatedInterfaces=()=>window.App.onCreatedOpenedInterfaces;window.getHideHudRefs=()=>_n;window.getHideRadarRefs=()=>be;window.getOpenedInterfacesMap=()=>{let e={};const t=window.App.components;for(const o in t)t[o].open.status&&(e[o]=window.interface(o));return e};window.getOpenedInterfaces=()=>{const e=window.App.components,t=[];for(const o in e)e[o].open.status&&t.push(window.interface(o));return t};window.getOpenedControllableInterfaces=()=>{const e=window.App.components,t=[];for(const o in e)e[o].open.status&&!e[o].options.hud&&e[o].show&&t.push(window.interface(o));return t};window.getControllableElements=e=>{const t=[];for(const o in e){const n=e[o];n&&n.controllable&&t.push(n)}return t};window.getControllableElementByIndex=(e,t)=>{for(const o of e)if(o.controllableIndex==t)return o;return!1};window.setActiveControllableComponent=e=>{const t=window.getOpenedInterfaces();for(const o of t){const n=window.getControllableElements(o.$refs);for(const r of n)r.active&&r.setActive(!1)}e.setActive(!0)};window.getNeighRowElements=(e,t,o)=>{const n=t.children[o],r=[];let i=o+e,s=t.children[i],l=0;for(;s;){if(s=t.children[i],s&&(e==1&&s.offsetTop>n.offsetTop||e==-1&&s.offsetTop<n.offsetTop)){let a=Math.abs(s.offsetTop-n.offsetTop);(l==0&&a>0||l>0&&a==l)&&r.push({el:s,index:i}),l==0&&(l=a)}i+=e}return r};let en=!1;function Of(){window.inputFocus||(window.getInterfaceStatus("FastMap")&&closeInterface("FastMap"),ha(),window.setCanOpenChat(!1),Zo=setTimeout(()=>{Zo=null,!window.getInterfaceStatus("MainMenu")&&!en&&(openInterface("FastMap"),sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerOpenFastMap",window.KEY_CODE_M),en=!0)},Cf))}function Sf(){window.inputFocus||(Zo?(ha(),!en&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",window.KEY_CODE_M)):window.cursorStatus||closeInterface("FastMap"),en=window.getInterfaceStatus("FastMap"))}function ha(){clearTimeout(Zo),window.setCanOpenChat(!0)}window.onKeyUp=e=>{if(Ge[e]=!1,[window.KEY_CODE_ARROW_RIGHT,window.KEY_CODE_ARROW_LEFT,window.KEY_CODE_ARROW_TOP,window.KEY_CODE_ARROW_BOTTOM,window.KEY_CODE_E,window.KEY_CODE_Q].indexOf(e)>-1){const o=window.getOpenedInterfaces();for(const n of o)if(n){const r=window.getControllableElements(n.$refs);for(const i of r)if(i.active){if(e==window.KEY_CODE_ARROW_RIGHT&&(i.activeElement+1<i.data.length?i.select(i.activeElement+1):i.select(0)),e==window.KEY_CODE_ARROW_LEFT&&(i.activeElement-1>=0?i.select(i.activeElement-1):i.select(i.data.length-1)),e==window.KEY_CODE_ARROW_BOTTOM||e==window.KEY_CODE_ARROW_TOP){const l=e==window.KEY_CODE_ARROW_TOP?-1:1,a=i.$refs.container,u=a.children[i.activeElement];let c=window.getNeighRowElements(l,a,i.activeElement);if(e==window.KEY_CODE_ARROW_TOP&&(c=c.reverse()),c.length){let h=null;for(const _ of c)if(u.offsetLeft<=_.el.offsetLeft+_.el.offsetWidth&&_.el.offsetLeft+_.el.offsetWidth<=u.offsetLeft+u.offsetWidth){h=_;break}h?i.select(h.index):i.select(c[0].index)}}let s=i.controllableIndex;if(e==window.KEY_CODE_E&&(s+1<r.length?s++:s=0),e==window.KEY_CODE_Q&&(s-1>=0?s--:s=r.length-1),[window.KEY_CODE_E,window.KEY_CODE_Q].indexOf(e)>-1){i.setActive(!1),window.getControllableElementByIndex(r,s).setActive(!0);return}}}}switch(e){case KEY_CODE_E:wa()||sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",e);break;case KEY_CODE_K:case KEY_CODE_F3:case KEY_CODE_Q:window.canSendClientSideKey(e)&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",e);break;case KEY_CODE_M:Sf();break}window.checkAndOpenPauseMenu(e)};window.checkAndOpenPauseMenu=e=>{if(e==KEY_CODE_ESC&&!window.inputFocus){const t=window.visibleInterfaceOrder.filter(r=>!window.App.components[r].options.hud);if(io>0){--io;return}const o=window.getInterfaceStatus("CarKey"),n=window.getInterfaceStatus("BattleMansionEnd");_n==0&&io==0&&!window.App.developmentMode&&!window.IsDialogOpened()&&!t.length&&!o&&!n&&window.openPauseMenu()}};window.canSendClientSideKey=e=>{if(e===KEY_CODE_E||e===KEY_CODE_Q||e===KEY_CODE_K||e===KEY_CODE_LEFT_SHIFT||e===KEY_CODE_Z||e===KEY_CODE_O||e===KEY_CODE_F2||e===KEY_CODE_M||e===KEY_CODE_P){const t=window.interface("Hud");if(t)return!window.cursorStatus&&t.info.show}return!0};window.onKeyDown=e=>{if(!Ge[e]){if(Ge[e]=!0,window.getInterfaceStatus("Report")){const t=window.interface("Report"),o=t.$data.chat.status,n=t.$data.CHAT_STATUSES;e==KEY_CODE_ENTER&&o==n.ACTIVE&&!t.$data.createAppeal.open&&t.sendMessage()}if(!window.getInterfaceStatus("TrainingOnboarding")&&!(window.getInterfaceStatus("PauseMenu")||window.getInterfaceStatus("MainMenu")||window.getInterfaceStatus("FastMap")&&e!==KEY_CODE_M)){switch(e){case KEY_CODE_1:Ge[KEY_CODE_ALT]&&window.canSendClientSideKey(e)&&window.isBluredInput&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",5e3+Ge[KEY_CODE_ALT]+Ge[KEY_CODE_1]);break;case KEY_CODE_M:Of();break;case KEY_CODE_COMMA:case KEY_CODE_PERIOD:case KEY_CODE_LEFT_SHIFT:case KEY_CODE_Z:case KEY_CODE_O:case KEY_CODE_F2:case KEY_CODE_P:case KEY_CODE_L:window.canSendClientSideKey(e)&&window.isBluredInput&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",e)}if(window.getInterfaceStatus("CarsShop")&&window.onCarShopKeyDown(e),window.getInterfaceStatus("PhoneAppPhoto")&&e==KEY_CODE_F8&&window.interface("PhoneAppPhoto").takeShoot(!0),!window.inputFocus&&!window.getInterfaceStatus("Police")&&(e==KEY_CODE_H&&window.getInterfaceStatus("Inventory")?window.App.components.Inventory.open.params[0][0]==2&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnInventoryDisplayChange"):e==KEY_CODE_I?sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnInventoryDisplayChange"):(e==KEY_CODE_J||e==KEY_CODE_R)&&!window.IsDialogOpened()&&window.isBluredInput&&(e==KEY_CODE_R?sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"MenuInt_OnPlayerKey"):e==KEY_CODE_J&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"MainMenu_OnPlayerOpenQuests"))),!window.inputFocus&&(e==KEY_CODE_B||e==KEY_CODE_ALT)&&Ge[KEY_CODE_ALT]&&Ge[KEY_CODE_B]&&!window.getInterfaceStatus("Police")&&(window.getInterfaceStatus("FirstPersonConfig")?window.closeInterface("FirstPersonConfig"):window.openFirstPersonConfig()),wa())switch(e){case KEY_CODE_LEFT_SHIFT:(!window.canSendClientSideKey(e)||!window.isBluredInput)&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",e);break;case KEY_CODE_SPACE:case KEY_CODE_CTRL:case KEY_CODE_W:case KEY_CODE_A:case KEY_CODE_S:case KEY_CODE_D:case KEY_CODE_E:case KEY_CODE_C:case KEY_CODE_ALT:case KEY_CODE_ENTER:case KEY_CODE_ESC:sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerClientSideKey",e)}else window.getInterfaceStatus("WindowCleaner")&&e==KEY_CODE_ALT&&(window.cursorStatus?window.cursorStatus=!1:window.cursorStatus=!0,window.setCursorStatus("WindowCleaner",window.cursorStatus))}}};function wa(){return!window.inputFocus&&(window.getInterfaceStatus("DanceTrack")||window.getInterfaceStatus("Fishing")||window.getInterfaceStatus("CasinoRullet")||window.getInterfaceStatus("AdminSpectate")||window.getInterfaceStatus("Accessories")||window.getInterfaceStatus("Machinist")||window.getInterfaceStatus("Death")||window.getInterfaceStatus("TuningMenu")||window.getInterfaceStatus("TuningStage")||window.getInterfaceStatus("Interactions")||window.getInterfaceStatus("TuningPlayerPneuma")||window.getInterfaceStatus("TuningPneuma")||window.getInterfaceStatus("Machinist"))}window.sendKeyEvent=e=>{onKeyDown(e),onKeyUp(e)};window.setMouseHandler=e=>{fa=e};window.onmousedown=e=>{fa==!0&&sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerMouseButtons",e.button+1)};window.onDeviceLost=()=>{if(window.getInterfaceStatus("MusicPlayer")){const e=window.interface("MusicPlayer");e&&e.onDeviceLost()}window.stopVoiceRecord(0),window.setCloseChat(),window.closeFastMap(),sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerDeviceLost")};window.onDeviceRestore=()=>{if(Ge={},window.getInterfaceStatus("MusicPlayer")){const e=window.interface("MusicPlayer");e&&e.onDeviceRestore()}sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerDeviceRestore")};function Or(e,t){if(window.App.isMobile)for(let o of t.touches){let n=o.screenX/window.innerWidth,r=1-o.screenY/window.innerHeight;engine.trigger(e,o.identifier,n,r,o.target.className)}}function Sr(e,t){let o=t.screenX/window.innerWidth,n=1-t.screenY/window.innerHeight;engine.trigger(e,t.button,o,n,t.target.className)}var _a=e=>Or("TouchStart",e),ma=e=>Or("TouchEnd",e),ga=e=>Or("TouchMove",e);window.startCaptureTouchEvents=()=>{window.addEventListener("touchstart",_a),window.addEventListener("touchend",ma),window.addEventListener("touchmove",ga)};window.stopCaptureTouchEvents=()=>{window.removeEventListener("touchstart",_a),window.removeEventListener("touchend",ma),window.removeEventListener("touchmove",ga)};var Ea=e=>Sr("MouseDown",e),va=e=>Sr("MouseUp",e),Ca=e=>Sr("MouseMove",e);window.startCaptureMouseEvents=()=>{window.addEventListener("mousedown",Ea),window.addEventListener("mouseup",va),window.addEventListener("mousemove",Ca)};window.stopCaptureMouseEvents=()=>{window.removeEventListener("mousedown",Ea),window.removeEventListener("mouseup",va),window.removeEventListener("mousemove",Ca)};Number.random=(e,t)=>{let o=e-.5+Math.random()*(t-e+1);return Math.round(o)};Date.formatNumber=e=>e<10?`0${e}`:e;window.getServerName=()=>window.App.isMobile?"HASSLE":"Radmir";window.onPlayerStartLegacyEditObject=()=>{window.App.engine==="legacy"&&io++};window.onPlayerStopLegacyEditObject=()=>{window.App.engine==="legacy"&&io--};String.escapeHtml=e=>{const t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};return e.replace(/[&<>"']/g,o=>t[o])};window.nativeKeyboardInput=e=>{window.currentKeyboardInput.value=e,window.currentKeyboardInput.dispatchEvent(new Event("input"));const t={code:"Enter",key:"Enter",charCode:13,keyCode:13,view:window,bubbles:!0},o=new KeyboardEvent("keydown",t),n=new KeyboardEvent("keyup",t);setTimeout(()=>{document.dispatchEvent(o),document.dispatchEvent(n)},0)};window.onTakePhoto=e=>{te.commit("photos/addPhoto",e),sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"OnPlayerTakePhoto")};window.stopNavigationInterval=()=>{clearInterval(pa)};window.startNavigationInterval=(e,t,o=0)=>{window.stopNavigationInterval(),pa=setInterval(()=>{window.getNavigationPath(e,t,o)},500)};window.setPlayerNickName=e=>{te.commit("player/setNickName",e)};window.setPlayerLevel=e=>{te.commit("player/setLevel",e)};window.setPlayerPassedHours=e=>{te.commit("player/setPassedHours",e)};window.setPlayerMoney=e=>{te.commit("player/setMoney",e)};window.setPlayerBankMoney=e=>{te.commit("player/setBankMoney",e)};window.setPlayerDonate=e=>{te.commit("player/setDonate",e)};window.setPlayerCasinoChips=e=>{te.commit("player/setCasinoChips",e)};window.setCurrentServer=e=>{te.commit("player/setServer",e)};window.setGameVersion=e=>{te.commit("player/setGameVersion",e)};window.setPlayerSkinId=e=>{te.commit("player/setSkin",e)};window.setPlayerNotification=e=>{te.commit("notifications/setJson",e)};window.setPlayerVipStatus=e=>{te.commit("player/setVip",e)};window.setDonatePaymentUrl=e=>{te.commit("player/setDonatePaymentUrl",e)};window.setTelegramBotConnectUrl=e=>{te.commit("player/setTelegramBotConnectUrl",e)};window.setAdvertisingUrl=e=>{te.commit("player/setAdvertisingUrl",e)};window.setVoiceChatVolume=e=>{const t="voiceChatSound";sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"PlayerSetting_OnVoiceChange",e),te.commit("settings/setSettingsProperty",{key:t,value:e})};window.setVoiceChatPlayer=(e,t)=>{sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"P3_OnPlayerChangeVolume",e,t)};window.resetVoiceChatPlayers=()=>{sendClientEvent(gm.EVENT_EXECUTE_PUBLIC,"PlayerSetting_OnPlayersVoiceReset")};window.setActionRedirectUri=e=>{te.commit("player/setActionRedirectUri",e)};window.setPlayerConnectedStatus=e=>{te.commit("player/setPlayerConnectedStatus",e)};window.clearCart=()=>{te.commit("main_menu/clearCart")};window.isValidHttpUrl=e=>/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i.test(e);window.fixEncodeCyrillicURL=e=>(e.indexOf("%D0%B8%CC%86")>=0&&(e=e.split("%D0%B8%CC%86").join("%D0%B9")),e.indexOf("%D0%B5%CC%88")>=0&&(e=e.split("%D0%B5%CC%88").join("%D1%91")),e.indexOf("%D0%95%CC%88")>=0&&(e=e.split("%D0%95%CC%88").join("%D0%81")),e);window.showFullScreenPreloader=()=>{window.showInterface("FullScreenPreloader")};window.hideFullScreenPreloader=()=>{window.hideInterface("FullScreenPreloader")};window.openPauseMenu=()=>{window.playSound("UI/UI_menuesc_open.mp3"),window.openInterface("PauseMenu")};window.closePauseMenu=()=>{window.playSound("UI/UI_menuesc_close.mp3"),window.closeInterface("PauseMenu")};window.closeFastMap=()=>{window.closeInterface("FastMap")};export{ue as $,Yl as A,bf as B,Nu as C,Ii as D,Fu as E,me as F,Ho as G,ur as H,fs as I,Jt as J,$ as K,zi as L,Bf as M,f as N,d as O,xf as P,cr as Q,Ff as R,no as S,Er as T,Uf as U,xo as V,Af as W,Od as X,$f as Y,Wf as Z,hn as _,it as a,Yf as a0,le as a1,kf as a2,jf as a3,Gf as a4,zf as a5,af as a6,vl as a7,Mf as a8,Ad as a9,If as aa,fe as ab,cu as ac,Al as ad,Z as b,Me as c,mo as d,Su as e,Pf as f,Fo as g,Xo as h,jr as i,tu as j,Rf as k,_i as l,eu as m,tt as n,ve as o,Df as p,Hf as q,Io as r,Lf as s,Ua as t,Vf as u,gi as v,No as w,sn as x,Nf as y,Kf as z};

// в случае index оставить это в hud.js 
if (tt?.methods?.add) {
	const originalAdd = tt.methods.add;
	tt.methods.add = function(e, s, t) {
		const result = originalAdd.call(this, e, s, t);
		window.OnChatAddMessage?.(e, s, t);
		return result;
	};
} 
// Глобальный объект для хранения состояния AFK-запроса и ID последнего приветственного сообщения
const globalState = {
	awaitingAfkAccount: false,
	awaitingAfkId: false,
	afkTargetAccount: null,
	lastWelcomeMessageId: null // Для хранения ID последнего приветственного сообщения
};

// Определяем радиусы чата
const CHAT_RADIUS = {
	SELF: 0, // Собственное сообщение
	CLOSE: 1, // Близко (< radius/4)
	MEDIUM: 2, // Средне (< radius/2)
	FAR: 3, // Далеко (>= radius/2)
	RADIO: 4, // Рация
	UNKNOWN: -1 // Неизвестный цвет
};

function normalizeColor(color) {
	let normalized = color.toString().toUpperCase();
	// Удаляем префикс #, если есть
	if (normalized.startsWith('#')) {
		normalized = normalized.slice(1);
	}
	// Если цвет в формате RGBA (8 символов), убираем альфа-канал
	if (normalized.length === 8) {
		normalized = normalized.slice(0, 6);
	}
	// Добавляем префикс 0x
	return '0x' + normalized;
}

function getChatRadius(color) {
	const normalizedColor = normalizeColor(color);

	switch (normalizedColor) {
		case '0xEEEEEE':
			return CHAT_RADIUS.SELF;
		case '0xCECECE':
			return CHAT_RADIUS.CLOSE;
		case '0x999999':
			return CHAT_RADIUS.MEDIUM;
		case '0x6B6B6B':
			return CHAT_RADIUS.FAR;
		case '0x33CC66':
			return CHAT_RADIUS.RADIO;
		default:
			return CHAT_RADIUS.UNKNOWN;
	}
}

// КОНФИГУРАЦИЯ
const userConfig = {
	botToken: '8184449811:AAE-nssyxdjAGnCkNCKTMN8rc2xgWEaVOFA',
	chatIds: ['1046461621'],
	keywords: [],
	clearDelay: 3000,
	maxAttempts: 15,
	checkInterval: 1000,
	debug: true,
	podbrosCooldown: 30000,
	afkSettings: {},
	lastSalaryInfo: null,
	paydayNotifications: true,
	trackPlayerId: true,
	idCheckInterval: 10000,
	govMessagesEnabled: true,
	govMessageCooldown: 360000,
	govMessageThreshold: 10,
	govMessageKeywords: ["тут", "здесь"],
	trackLocationRequests: false,
	locationKeywords: ["местоположение", "место", "позиция", "координаты"],
	notificationDeleteDelay: 5000 // Задержка для удаления уведомлений об изменении настроек
};

const config = {
	...userConfig,
	lastUpdateId: 0,
	activeUsers: {},
	lastPodbrosTime: 0,
	podbrosCounter: 0,
	initialized: false,
	accountInfo: {
		nickname: null,
		server: null
	},
	lastPlayerId: null,
	govMessageTrackers: {},
	isSitting: false,
	afkCycle: {
		active: false,
		startTime: null,
		totalPlayTime: 0,
		currentPlayTime: 0,
		currentPauseTime: 0,
		cycleTimer: null,
		playTimer: null,
		pauseTimer: null,
		mainTimer: null,
		mode: 'fixed'
	},
	nicknameLogged: false
};

let displayName = `User [S${config.accountInfo.server || 'Не указан'}]`;
let uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;

// Настройка автовхода
const autoLoginConfig = {
	password: "zahar2007", // Ваш пароль
	enabled: true, // Флаг активации автовхода
	maxAttempts: 10, // Максимум попыток
	attemptInterval: 1000 // Интервал между попытками (мс)
};

function debugLog(message) {
    if (config.debug) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}:${seconds}`;
        console.log(`[${currentTime}] [DEBUG][${config.accountInfo.nickname || 'Unknown'}]`, message);
    }
}

function getPlayerIdFromHUD() {
	try {
		const hudElements = document.querySelectorAll('.hud-hassle-info-data');
		if (hudElements.length > 0) {
			const idElement = hudElements[0].querySelector('div:nth-child(3)');
			if (idElement) {
				const idText = idElement.textContent;
				const idMatch = idText.match(/ID\s*(\d+)/);
				if (idMatch) return idMatch[1];
			}
		}
		return null;
	} catch (e) {
		debugLog(`Ошибка при получении HUD ID: ${e.message}`);
		return null;
	}
}

function trackPlayerId() {
	if (!config.trackPlayerId) return;

	const currentId = getPlayerIdFromHUD();

	if (currentId && currentId !== config.lastPlayerId) {
		debugLog(`Обнаружен новый ID (HUD): ${currentId}`);
		config.lastPlayerId = currentId;
	}

	setTimeout(trackPlayerId, config.idCheckInterval);
}

function trackNicknameAndServer() {
	try {
		const nickname = window.interface("Menu").$store.getters["menu/nickName"];
		const serverId = window.interface("Menu").$store.getters["menu/selectedServer"];
		if (nickname && serverId && !config.nicknameLogged) {
			console.log(`nickname: ${nickname}, Server: ${serverId}`);
			config.nicknameLogged = true;
			config.accountInfo.nickname = nickname;
			config.accountInfo.server = serverId.toString();
			displayName = `${config.accountInfo.nickname} [S${config.accountInfo.server}]`;
			uniqueId = `${config.accountInfo.nickname}_${config.accountInfo.server}`;
			sendWelcomeMessage();
			registerUser();
		} else if (!nickname || !serverId) {
			debugLog(`Ник или сервер не получены: nickname=${nickname}, server=${serverId}`);
		}
	} catch (e) {
		debugLog(`Ошибка при получении ника/сервера: ${e.message}`);
	}
	setTimeout(trackNicknameAndServer, 900);
}

function createButton(text, command) {
	return {
		text: text,
		callback_data: command
	};
}

function deleteMessage(chatId, messageId) {
	const url = `https://api.telegram.org/bot${config.botToken}/deleteMessage`;
	const payload = {
		chat_id: chatId,
		message_id: messageId
	};

	const xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(payload));
}

function sendToTelegram(message, silent = false, replyMarkup = null, deleteAfter = null) {
	config.chatIds.forEach(chatId => {
		const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
		const payload = {
			chat_id: chatId,
			text: message,
			parse_mode: 'HTML',
			disable_notification: silent,
			reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
		};

		const xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
			if (xhr.status === 200) {
				debugLog(`Сообщение отправлено в Telegram чат ${chatId}`);
				const data = JSON.parse(xhr.responseText);
				const messageId = data.result.message_id;
				if (deleteAfter) {
					setTimeout(() => {
						deleteMessage(chatId, messageId);
					}, deleteAfter);
				}
				// Сохраняем ID приветственного сообщения
				if (message.includes('Hassle | Bot TG') && message.includes('Текущие настройки')) {
					globalState.lastWelcomeMessageId = messageId;
				}
			} else {
				debugLog(`Ошибка Telegram API для чата ${chatId}:`, xhr.status, xhr.responseText);
			}
		};
		xhr.onerror = function() {
			debugLog(`Ошибка сети при отправке в чат ${chatId}`);
		};
		xhr.send(JSON.stringify(payload));
	});
}

function editMessageReplyMarkup(chatId, messageId, replyMarkup) {
	const url = `https://api.telegram.org/bot${config.botToken}/editMessageReplyMarkup`;
	const payload = {
		chat_id: chatId,
		message_id: messageId,
		reply_markup: replyMarkup
	};

	const xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify(payload));
}

function editMessageText(chatId, messageId, text, replyMarkup = null) {
	const url = `https://api.telegram.org/bot${config.botToken}/editMessageText`;
	const payload = {
		chat_id: chatId,
		message_id: messageId,
		text: text,
		parse_mode: 'HTML',
		reply_markup: replyMarkup ? JSON.stringify(replyMarkup) : undefined
	};

	const xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
		if (xhr.status === 200) {
			debugLog(`Сообщение отредактировано в Telegram чате ${chatId}`);
		} else {
			debugLog(`Ошибка редактирования сообщения в чате ${chatId}:`, xhr.status, xhr.responseText);
		}
	};
	xhr.onerror = function() {
		debugLog(`Ошибка сети при редактировании в чате ${chatId}`);
	};
	xhr.send(JSON.stringify(payload));
}

function sendWelcomeMessage() {
	if (!config.accountInfo.nickname) {
		debugLog('Ник не определен, откладываем отправку приветственного сообщения');
		return;
	}
	const playerIdDisplay = config.lastPlayerId ? ` (ID: ${config.lastPlayerId})` : '';
	const message = `🟢 <b>Hassle | Bot TG</b>\n` +
		`Ник: ${config.accountInfo.nickname}${playerIdDisplay}\n` +
		`Сервер: ${config.accountInfo.server || 'Не указан'}\n\n` +
		`🔔 <b>Текущие настройки:</b>\n` +
		`├ Уведомления PayDay: ${config.paydayNotifications ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
		`├ Уведомления от сотрудников: ${config.govMessagesEnabled ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}\n` +
		`└ Отслеживание местоположения: ${config.trackLocationRequests ? '🟢 ВКЛ' : '🔴 ВЫКЛ'}`;

	const replyMarkup = {
		inline_keyboard: [
			[createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
		]
	};

	config.chatIds.forEach(chatId => {
		if (globalState.lastWelcomeMessageId) {
			editMessageText(chatId, globalState.lastWelcomeMessageId, message, replyMarkup);
		} else {
			// Если нет ID, отправляем новое и сохраняем ID в onload sendToTelegram
			sendToTelegram(message, false, replyMarkup);
		}
	});
}

function showControlsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[createButton("⚙️ Функции", `show_local_functions_${uniqueId}`)],
			[createButton("📋 Общие функции", `show_global_functions_${uniqueId}`)],
			[createButton("⬆️ Свернуть", `hide_controls_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showGlobalFunctionsMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[createButton("🔔 PayDay", `show_payday_options_${uniqueIdParam}`)],
			[createButton("🏛️ Сообщ.", `show_soob_options_${uniqueIdParam}`)],
			[createButton("📍 Место", `show_mesto_options_${uniqueIdParam}`)],
			[
				createButton("🌙 AFK Ночь", `global_afk_n_${uniqueIdParam}`),
				createButton("🔄 AFK", `global_afk_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `show_controls_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showPayDayOptionsMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `global_p_on_${uniqueIdParam}`),
				createButton("🔕 ВЫКЛ", `global_p_off_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showSoobOptionsMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `global_soob_on_${uniqueIdParam}`),
				createButton("🔕 ВЫКЛ", `global_soob_off_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showMestoOptionsMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `global_mesto_on_${uniqueIdParam}`),
				createButton("🔕 ВЫКЛ", `global_mesto_off_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showAFKNightModesMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("С паузами", `afk_n_with_pauses_${uniqueIdParam}`),
				createButton("Без пауз", `afk_n_without_pauses_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `show_global_functions_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showAFKWithPausesSubMenu(chatId, messageId, uniqueIdParam) {
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("5/5 минут", `afk_n_fixed_${uniqueIdParam}`),
				createButton("Рандомное время", `afk_n_random_${uniqueIdParam}`)
			],
			[createButton("⬅️ Назад", `global_afk_n_${uniqueIdParam}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalFunctionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[createButton("🚶 Движение", `show_movement_controls_${uniqueId}`)],
			[createButton("🏛️ Увед. правик", `show_local_soob_options_${uniqueId}`)],
			[createButton("📍 Отслеживание", `show_local_mesto_options_${uniqueId}`)],
			[createButton("📝 Написать в чат", `request_chat_message_${uniqueId}`)],
			[createButton("⬅️ Назад", `show_controls_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showMovementControlsMenu(chatId, messageId, isNotification = false) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const backButton = isNotification ? [] : [
		[createButton("⬆️ Свернуть", `show_local_functions_${uniqueId}`)]
	];
	const sitStandButton = config.isSitting ?
		createButton("🧍 Встать", `move_stand_${uniqueId}`) :
		createButton("🪑 Сесть", `move_sit_${uniqueId}`);
	const replyMarkup = {
		inline_keyboard: [
			[createButton("⬆️ Вперед", `move_forward_${uniqueId}`)],
			[createButton("⬅️ Влево", `move_left_${uniqueId}`), createButton("➡️ Вправо", `move_right_${uniqueId}`)],
			[createButton("⬇️ Назад", `move_back_${uniqueId}`)],
			[createButton("🆙 Прыжок", `move_jump_${uniqueId}`)],
			[sitStandButton],
			...backButton
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalSoobOptionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `local_soob_on_${uniqueId}`),
				createButton("🔕 ВЫКЛ", `local_soob_off_${uniqueId}`)
			],
			[createButton("⬅️ Назад", `show_local_functions_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function showLocalMestoOptionsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[
				createButton("🔔 ВКЛ", `local_mesto_on_${uniqueId}`),
				createButton("🔕 ВЫКЛ", `local_mesto_off_${uniqueId}`)
			],
			[createButton("⬅️ Назад", `show_local_functions_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function hideControlsMenu(chatId, messageId) {
	if (!config.accountInfo.nickname) {
		sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНик не определен`, false, null, config.notificationDeleteDelay);
		return;
	}
	const replyMarkup = {
		inline_keyboard: [
			[createButton("⚙️ Управление", `show_controls_${uniqueId}`)]
		]
	};

	editMessageReplyMarkup(chatId, messageId, replyMarkup);
}

function checkTelegramCommands() {
	const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${config.lastUpdateId + 1}`;

	const xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function() {
		if (xhr.status === 200) {
			try {
				const data = JSON.parse(xhr.responseText);
				if (data.ok && data.result.length > 0) {
					processUpdates(data.result);
				}
			} catch (e) {
				debugLog('Ошибка парсинга ответа Telegram:', e);
			}
		}
		setTimeout(checkTelegramCommands, 1000);
	};
	xhr.onerror = function(error) {
		debugLog('Ошибка при проверке команд:', error);
		setTimeout(checkTelegramCommands, 1000);
	};
	xhr.send();
}

function processUpdates(updates) {
	for (const update of updates) {
		config.lastUpdateId = update.update_id;

		if (update.message) {
			const message = update.message.text ? update.message.text.trim() : '';

			// Проверяем, является ли сообщение ответом на запрос ввода
			if (update.message.reply_to_message) {
				const replyToText = update.message.reply_to_message.text || '';

				// Ответ на запрос сообщения для чата
				if (replyToText.includes(`✉️ Введите сообщение для ${displayName}:`)) {
					const textToSend = message;
					if (textToSend) {
						debugLog(`[${displayName}] Отправка сообщения: ${textToSend}`);
						try {
							sendChatInput(textToSend);
							sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`, false, null, config.notificationDeleteDelay);
						} catch (err) {
							const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
							debugLog(errorMsg);
							sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
						}
					}
					continue;
				}

				// Ответ на запрос ответа администратору
				if (replyToText.includes(`✉️ Введите ответ администратору для ${displayName}:`)) {
					const textToSend = message;
					if (textToSend) {
						debugLog(`[${displayName}] Отправка ответа администратору: ${textToSend}`);
						try {
							sendChatInput(textToSend);
							sendToTelegram(`✅ <b>Ответ администратору отправлен ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`, false, null, config.notificationDeleteDelay);
						} catch (err) {
							const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить ответ\n<code>${err.message}</code>`;
							debugLog(errorMsg);
							sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
						}
					}
					continue;
				}

				// Ответ на запрос ника для AFK
				if (replyToText.includes(`✉️ Введите ник аккаунта для активации AFK режима:`)) {
					const accountNickname = message.trim();
					if (accountNickname && accountNickname === config.accountInfo.nickname) {
						globalState.afkTargetAccount = accountNickname;
						globalState.awaitingAfkAccount = false;
						globalState.awaitingAfkId = true;
						sendToTelegram(`✉️ Введите ID для активации AFK режима для ${displayName}:`, false, {
							force_reply: true
						});
					} else {
						sendToTelegram(`❌ <b>Ошибка:</b> Неверный ник аккаунта. Попробуйте снова.`, false, {
							force_reply: true
						}, config.notificationDeleteDelay);
					}
					continue;
				}

				// Ответ на запрос ID для AFK
				if (replyToText.includes(`✉️ Введите ID для активации AFK режима для`) && globalState.awaitingAfkId) {
					const id = message.trim();
					if (globalState.afkTargetAccount === config.accountInfo.nickname) {
						const idFormats = [id];
						if (id.includes('-')) {
							idFormats.push(id.replace(/-/g, ''));
						} else if (id.length === 3) {
							idFormats.push(`${id[0]}-${id[1]}-${id[2]}`);
						}

						config.afkSettings = {
							id: id,
							formats: idFormats,
							active: true
						};

						globalState.awaitingAfkId = false;
						globalState.afkTargetAccount = null;

						sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null, config.notificationDeleteDelay);
					}
					continue;
				}
			}

			// Глобальные команды (работают на все аккаунты)
			if (message === '/p_off') {
				config.paydayNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/p_on') {
				config.paydayNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления о PayDay включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/soob_off') {
				config.govMessagesEnabled = false;
				sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/soob_on') {
				config.govMessagesEnabled = true;
				sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/mesto_on') {
				config.trackLocationRequests = true;
				sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message === '/mesto_off') {
				config.trackLocationRequests = false;
				sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `)) {
				const textToSend = message.replace(`/chat${config.accountInfo.nickname}_${config.accountInfo.server} `, '').trim();
				debugLog(`[${displayName}] Получено сообщение: ${textToSend}`);
				try {
					sendChatInput(textToSend);
					sendToTelegram(`✅ <b>Сообщение отправлено ${displayName}:</b>\n<code>${textToSend.replace(/</g, '<')}</code>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить сообщение\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith('/afk ')) {
				const parts = message.split(' ');
				if (parts.length >= 3) {
					const targetNickname = parts[1];
					const id = parts[2];

					if (targetNickname === config.accountInfo.nickname) {
						const idFormats = [id];
						if (id.includes('-')) {
							idFormats.push(id.replace(/-/g, ''));
						} else if (id.length === 3) {
							idFormats.push(`${id[0]}-${id[1]}-${id[2]}`);
						}

						config.afkSettings = {
							id: id,
							formats: idFormats,
							active: true
						};

						sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID: ${id}\nФорматы: ${idFormats.join(', ')}`, false, null, config.notificationDeleteDelay);
					}
				}
			} else if (message.startsWith('/afk_n')) {
				const parts = message.split(' ');
				let targetNickname = config.accountInfo.nickname;

				if (parts.length >= 2 && parts[1]) {
					targetNickname = parts[1];
				}

				if (targetNickname === config.accountInfo.nickname) {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
						continue;
					}

					const idFormats = [hudId];
					if (hudId.includes('-')) {
						idFormats.push(hudId.replace(/-/g, ''));
					} else if (hudId.length === 3) {
						idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
					}

					config.afkSettings = {
						id: hudId,
						formats: idFormats,
						active: true
					};

					startAFKCycle();

					sendToTelegram(`🔄 <b>AFK режим активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith('/register ')) {
				const parts = message.split(' ');
				if (parts.length >= 2) {
					const nickname = parts[1];
					config.activeUsers[nickname] = config.accountInfo.nickname || `User_${nickname}`;
					debugLog(`[${displayName}] Зарегистрирован пользователь: ${nickname} - ${config.accountInfo.nickname}`);
				}
			} else if (message === '/list') {
				if (globalState.lastWelcomeMessageId) {
					config.chatIds.forEach(chatId => {
						deleteMessage(chatId, globalState.lastWelcomeMessageId);
					});
					globalState.lastWelcomeMessageId = null;
				}
				sendWelcomeMessage();
			}
		} else if (update.callback_query) {
			const message = update.callback_query.data;
			const chatId = update.callback_query.message.chat.id;
			const messageId = update.callback_query.message.message_id;

			// Определяем глобальные команды, которые должны применяться ко всем аккаунтам
			const isGlobalCommand = message.startsWith('global_') ||
				message.startsWith('afk_n_') ||
				message.startsWith('show_payday_options_') ||
				message.startsWith('show_soob_options_') ||
				message.startsWith('show_mesto_options_') ||
				message.startsWith('show_global_functions_');

			let callbackUniqueId = null;
			if (message.startsWith('show_controls_')) {
				callbackUniqueId = message.replace('show_controls_', '');
			} else if (message.startsWith('show_local_functions_')) {
				callbackUniqueId = message.replace('show_local_functions_', '');
			} else if (message.startsWith('show_movement_controls_')) {
				callbackUniqueId = message.replace('show_movement_controls_', '');
			} else if (message.startsWith('show_movement_')) {
				callbackUniqueId = message.replace('show_movement_', '');
			} else if (message.startsWith('hide_controls_')) {
				callbackUniqueId = message.replace('hide_controls_', '');
			} else if (message.startsWith('request_chat_message_')) {
				callbackUniqueId = message.replace('request_chat_message_', '');
			} else if (message.startsWith('local_soob_on_')) {
				callbackUniqueId = message.replace('local_soob_on_', '');
			} else if (message.startsWith('local_soob_off_')) {
				callbackUniqueId = message.replace('local_soob_off_', '');
			} else if (message.startsWith('local_mesto_on_')) {
				callbackUniqueId = message.replace('local_mesto_on_', '');
			} else if (message.startsWith('local_mesto_off_')) {
				callbackUniqueId = message.replace('local_mesto_off_', '');
			} else if (message.startsWith('move_forward_')) {
				callbackUniqueId = message.replace('move_forward_', '');
			} else if (message.startsWith('move_back_')) {
				callbackUniqueId = message.replace('move_back_', '');
			} else if (message.startsWith('move_left_')) {
				callbackUniqueId = message.replace('move_left_', '');
			} else if (message.startsWith('move_right_')) {
				callbackUniqueId = message.replace('move_right_', '');
			} else if (message.startsWith('move_jump_')) {
				callbackUniqueId = message.replace('move_jump_', '');
			} else if (message.startsWith('move_sit_')) {
				callbackUniqueId = message.replace('move_sit_', '');
			} else if (message.startsWith('move_stand_')) {
				callbackUniqueId = message.replace('move_stand_', '');
			} else if (message.startsWith('admin_reply_')) {
				callbackUniqueId = message.replace('admin_reply_', '');
			} else if (message.startsWith('show_local_soob_options_')) {
				callbackUniqueId = message.replace('show_local_soob_options_', '');
			} else if (message.startsWith('show_local_mesto_options_')) {
				callbackUniqueId = message.replace('show_local_mesto_options_', '');
			} else if (message.startsWith('global_p_on_')) {
				callbackUniqueId = message.replace('global_p_on_', '');
			} else if (message.startsWith('global_p_off_')) {
				callbackUniqueId = message.replace('global_p_off_', '');
			} else if (message.startsWith('global_soob_on_')) {
				callbackUniqueId = message.replace('global_soob_on_', '');
			} else if (message.startsWith('global_soob_off_')) {
				callbackUniqueId = message.replace('global_soob_off_', '');
			} else if (message.startsWith('global_mesto_on_')) {
				callbackUniqueId = message.replace('global_mesto_on_', '');
			} else if (message.startsWith('global_mesto_off_')) {
				callbackUniqueId = message.replace('global_mesto_off_', '');
			} else if (message.startsWith('global_afk_n_')) {
				callbackUniqueId = message.replace('global_afk_n_', '');
			} else if (message.startsWith('global_afk_')) {
				callbackUniqueId = message.replace('global_afk_', '');
			} else if (message.startsWith('afk_n_with_pauses_')) {
				callbackUniqueId = message.replace('afk_n_with_pauses_', '');
			} else if (message.startsWith('afk_n_without_pauses_')) {
				callbackUniqueId = message.replace('afk_n_without_pauses_', '');
			} else if (message.startsWith('afk_n_fixed_')) {
				callbackUniqueId = message.replace('afk_n_fixed_', '');
			} else if (message.startsWith('afk_n_random_')) {
				callbackUniqueId = message.replace('afk_n_random_', '');
			} else if (message.startsWith('show_payday_options_')) {
				callbackUniqueId = message.replace('show_payday_options_', '');
			} else if (message.startsWith('show_soob_options_')) {
				callbackUniqueId = message.replace('show_soob_options_', '');
			} else if (message.startsWith('show_mesto_options_')) {
				callbackUniqueId = message.replace('show_mesto_options_', '');
			} else if (message.startsWith('show_global_functions_')) {
				callbackUniqueId = message.replace('show_global_functions_', '');
			}

			// Проверяем, является ли команда локальной (только для текущего аккаунта)
			const isForThisBot = isGlobalCommand ||
				(callbackUniqueId && callbackUniqueId === uniqueId) ||
				(update.callback_query.message.text && update.callback_query.message.text.includes(displayName)) ||
				(update.callback_query.message.reply_to_message &&
					update.callback_query.message.reply_to_message.text &&
					update.callback_query.message.reply_to_message.text.includes(displayName));

			if (!isForThisBot) {
				debugLog(`Игнорируем callback_query, так как он не для этого бота (${displayName}): ${message}`);
				continue;
			}

			// Обработка команд
			if (message.startsWith(`show_controls_`)) {
				showControlsMenu(chatId, messageId);
			} else if (message.startsWith(`show_global_functions_`)) {
				showGlobalFunctionsMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`show_local_functions_`)) {
				showLocalFunctionsMenu(chatId, messageId);
			} else if (message.startsWith(`show_movement_controls_`)) {
				showMovementControlsMenu(chatId, messageId);
			} else if (message.startsWith("show_movement_")) {
				showMovementControlsMenu(chatId, messageId, true);
			} else if (message.startsWith(`hide_controls_`)) {
				hideControlsMenu(chatId, messageId);
			} else if (message.startsWith(`request_chat_message_`)) {
				const requestMsg = `✉️ Введите сообщение для ${displayName}:\n(Будет отправлено как /chat${config.accountInfo.nickname}_${config.accountInfo.server} ваш_текст)`;
				sendToTelegram(requestMsg, false, {
					force_reply: true
				});
			} else if (message.startsWith(`show_payday_options_`)) {
				showPayDayOptionsMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`show_soob_options_`)) {
				showSoobOptionsMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`show_mesto_options_`)) {
				showMestoOptionsMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`global_p_on_`)) {
				config.paydayNotifications = true;
				sendToTelegram(`🔔 <b>Уведомления о PayDay включены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_p_off_`)) {
				config.paydayNotifications = false;
				sendToTelegram(`🔕 <b>Уведомления о PayDay отключены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_soob_on_`)) {
				config.govMessagesEnabled = true;
				sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_soob_off_`)) {
				config.govMessagesEnabled = false;
				sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_mesto_on_`)) {
				config.trackLocationRequests = true;
				sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_mesto_off_`)) {
				config.trackLocationRequests = false;
				sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для всех аккаунтов</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith(`global_afk_n_`)) {
				showAFKNightModesMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`afk_n_with_pauses_`)) {
				showAFKWithPausesSubMenu(chatId, messageId, callbackUniqueId);
			} else if (message.startsWith(`afk_n_without_pauses_`)) {
				if (config.afkSettings.active) {
					sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} else {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
					} else {
						const idFormats = [hudId];
						if (hudId.includes('-')) {
							idFormats.push(hudId.replace(/-/g, ''));
						} else if (hudId.length === 3) {
							idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
						}

						config.afkSettings = {
							id: hudId,
							formats: idFormats,
							active: true
						};
						config.afkCycle.mode = 'none';

						sendToTelegram(`🔄 <b>AFK режим (без пауз) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}`, false, null, config.notificationDeleteDelay);
					}
				}
			} else if (message.startsWith(`afk_n_fixed_`)) {
				if (config.afkSettings.active) {
					sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} else {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
					} else {
						const idFormats = [hudId];
						if (hudId.includes('-')) {
							idFormats.push(hudId.replace(/-/g, ''));
						} else if (hudId.length === 3) {
							idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
						}

						config.afkSettings = {
							id: hudId,
							formats: idFormats,
							active: true
						};
						config.afkCycle.mode = 'fixed';
						startAFKCycle();

						sendToTelegram(`🔄 <b>AFK режим (с паузами 5/5) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null, config.notificationDeleteDelay);
					}
				}
			} else if (message.startsWith(`afk_n_random_`)) {
				if (config.afkSettings.active) {
					sendToTelegram(`🔄 <b>AFK режим уже активирован для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} else {
					const hudId = getPlayerIdFromHUD();
					if (!hudId) {
						sendToTelegram(`❌ <b>Ошибка ${displayName}:</b> Не удалось получить ID из HUD`, false, null, config.notificationDeleteDelay);
					} else {
						const idFormats = [hudId];
						if (hudId.includes('-')) {
							idFormats.push(hudId.replace(/-/g, ''));
						} else if (hudId.length === 3) {
							idFormats.push(`${hudId[0]}-${hudId[1]}-${hudId[2]}`);
						}

						config.afkSettings = {
							id: hudId,
							formats: idFormats,
							active: true
						};
						config.afkCycle.mode = 'random';
						startAFKCycle();

						sendToTelegram(`🔄 <b>AFK режим (с рандомными паузами) активирован для ${displayName}</b>\nID из HUD: ${hudId}\nФорматы: ${idFormats.join(', ')}\n🔁 <b>Запущен AFK цикл для PayDay</b>`, false, null, config.notificationDeleteDelay);
					}
				}
			} else if (message.startsWith(`global_afk_`)) {
				if (!globalState.awaitingAfkAccount) {
					globalState.awaitingAfkAccount = true;
					const requestMsg = `✉️ Введите ник аккаунта для активации AFK режима:`;
					sendToTelegram(requestMsg, false, {
						force_reply: true
					});
				}
			} else if (message.startsWith("admin_reply_")) {
				const requestMsg = `✉️ Введите ответ администратору для ${displayName}:`;
				sendToTelegram(requestMsg, false, {
					force_reply: true
				});
			} else if (message.startsWith("move_forward_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, 1);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение вперед на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение вперед\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_back_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", 0, -1);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение назад на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение назад\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_left_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", -1, 0);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение влево на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение влево\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_right_")) {
				try {
					window.onScreenControlTouchStart("<Gamepad>/leftStick");
					window.onScreenControlTouchMove("<Gamepad>/leftStick", 1, 0);
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Gamepad>/leftStick");
					}, 500);
					sendToTelegram(`🚶 <b>Движение вправо на 0.5 сек для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать движение вправо\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_jump_")) {
				try {
					window.onScreenControlTouchStart("<Keyboard>/leftShift");
					setTimeout(() => {
						window.onScreenControlTouchEnd("<Keyboard>/leftShift");
					}, 500);
					sendToTelegram(`🆙 <b>Прыжок выполнен для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось симулировать прыжок\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_sit_")) {
				try {
					window.onScreenControlTouchStart("<Keyboard>/c");
					setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
					config.isSitting = true;
					sendToTelegram(`✅ <b>Команда "Сесть" отправлена ${displayName}</b>`, false, null, config.notificationDeleteDelay);
					showMovementControlsMenu(chatId, messageId, false);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Сесть"\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("move_stand_")) {
				try {
					window.onScreenControlTouchStart("<Keyboard>/c");
					setTimeout(() => window.onScreenControlTouchEnd("<Keyboard>/c"), 500);
					config.isSitting = false;
					sendToTelegram(`✅ <b>Команда "Встать" отправлена ${displayName}</b>`, false, null, config.notificationDeleteDelay);
					showMovementControlsMenu(chatId, messageId, false);
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить команду "Встать"\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			} else if (message.startsWith("show_local_soob_options_")) {
				showLocalSoobOptionsMenu(chatId, messageId);
			} else if (message.startsWith("show_local_mesto_options_")) {
				showLocalMestoOptionsMenu(chatId, messageId);
			} else if (message.startsWith("local_soob_on_")) {
				config.govMessagesEnabled = true;
				sendToTelegram(`🔔 <b>Уведомления от сотрудников правительства включены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_soob_off_")) {
				config.govMessagesEnabled = false;
				sendToTelegram(`🔕 <b>Уведомления от сотрудников правительства отключены для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_mesto_on_")) {
				config.trackLocationRequests = true;
				sendToTelegram(`📍 <b>Отслеживание запросов местоположения включено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			} else if (message.startsWith("local_mesto_off_")) {
				config.trackLocationRequests = false;
				sendToTelegram(`🔕 <b>Отслеживание запросов местоположения отключено для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
				sendWelcomeMessage();
			}
		}
	}
}

function registerUser() {
	if (!config.accountInfo.nickname) {
		debugLog('Ник не определен, регистрация отложена');
		return;
	}
	config.activeUsers[config.accountInfo.nickname] = config.accountInfo.nickname;
	debugLog(`Пользователь ${displayName} зарегистрирован локально`);
}

function isNonRPMessage(message) {
	return message.includes('((') && message.includes('))');
}

function checkIDFormats(message) {
	const idRegex = /(\d-\d-\d|\d{3})/g;
	const matches = message.match(idRegex);
	return matches ? matches : [];
}

function checkRoleAndActionConditions(lowerCaseMessage) {
	const hasRoleKeyword = (
		lowerCaseMessage.indexOf("депутат") !== -1 ||
		lowerCaseMessage.indexOf("вице-губернатор") !== -1 ||
		lowerCaseMessage.indexOf("губернатор") !== -1 ||
		lowerCaseMessage.indexOf("лицензёр") !== -1
	);

	const hasActionKeyword = (
		lowerCaseMessage.indexOf("место") !== -1 ||
		lowerCaseMessage.indexOf("ваше") !== -1 ||
		lowerCaseMessage.indexOf("жетон") !== -1
	);

	return hasRoleKeyword && hasActionKeyword;
}

function checkAFKConditions(msg, lowerCaseMessage) {
	if (!config.afkSettings.active) return false;

	const hasConditions = checkRoleAndActionConditions(lowerCaseMessage);
	const hasID = config.afkSettings.formats.some(format => msg.includes(format));

	return hasConditions && hasID;
}

function checkLocationRequest(msg, lowerCaseMessage) {
	if (!config.trackLocationRequests && !isTargetingPlayer(msg)) {
		return false;
	}

	const hasRoleKeyword = /(депутат|вице-губернатор|губернатор|лицензёр)/i.test(lowerCaseMessage);
	const hasActionKeyword = config.locationKeywords.some(word => lowerCaseMessage.includes(word));
	const hasID = isTargetingPlayer(msg);

	return hasRoleKeyword && (hasActionKeyword || hasID);
}

function isTargetingPlayer(msg) {
	if (!config.lastPlayerId) return false;

	const idFormats = [
		config.lastPlayerId,
		config.lastPlayerId.split('').join('-')
	];

	return idFormats.some(format => msg.includes(format));
}

function processSalaryAndBalance(msg) {
    if (!config.paydayNotifications) {
        debugLog('PayDay пропущен: уведомления выкл');
        return;
    }

    // Проверка на новые тексты (отрицательные сценарии)
    if (msg.includes("Для получения зарплаты необходимо находиться в игре минимум 25 минут")) {
        debugLog(`Обнаружено предупреждение о 25 минутах`);
        const message = `- PayDay | ${displayName}:\nДля получения зарплаты необходимо находиться в игре минимум 25 минут`;
        sendToTelegram(message);
        config.lastSalaryInfo = null; // Сброс, чтобы избежать конфликтов
        return;
    }

    if (msg.includes("Вы не должны находиться на паузе для получения зарплаты")) {
        debugLog(`Обнаружено предупреждение о паузе`);
        const message = `- PayDay | ${displayName}:\nВы не должны находиться на паузе для получения зарплаты`;
        sendToTelegram(message);
        config.lastSalaryInfo = null; // Сброс
        return;
    }

    if (msg.includes("Для получения опыта необходимо находиться в игре минимум 10 минут")) {
        debugLog(`Обнаружено предупреждение о 10 минутах для опыта`);
        const message = `- PayDay | ${displayName}:\nДля получения опыта необходимо находиться в игре минимум 10 минут`;
        sendToTelegram(message);
        config.lastSalaryInfo = null; // Сброс
        return;
    }

	const salaryMatch = msg.match(/Зарплата: \{[\w]+\}(\d+) руб/);
	if (salaryMatch) {
		debugLog(`Зарплата спарсена: ${salaryMatch[1]}`);
		config.lastSalaryInfo = config.lastSalaryInfo || {};
		config.lastSalaryInfo.salary = salaryMatch[1];
		debugLog(`Обнаружена зарплата: ${salaryMatch[1]} руб`);
	}

	const balanceMatch = msg.match(/Текущий баланс счета: \{[\w]+\}(\d+) руб/);
	if (balanceMatch) {
		debugLog(`Баланс спарсен: ${balanceMatch[1]}`);
		config.lastSalaryInfo = config.lastSalaryInfo || {};
		config.lastSalaryInfo.balance = balanceMatch[1];
		debugLog(`Обнаружен баланс счета: ${balanceMatch[1]} руб`);
	}

	if (config.lastSalaryInfo && config.lastSalaryInfo.salary && config.lastSalaryInfo.balance) {
		const message = `+ PayDay | ${displayName}:\nЗарплата: ${config.lastSalaryInfo.salary} руб\nБаланс счета: ${config.lastSalaryInfo.balance} руб`;
		sendToTelegram(message);
		config.lastSalaryInfo = null;
	}
}

function checkGovMessageConditions(msg, senderName, senderId) {
	if (!config.govMessagesEnabled) return false;

	const lowerMsg = msg.toLowerCase();
	const hasKeyword = config.govMessageKeywords.some(keyword =>
		lowerMsg.includes(keyword.toLowerCase())
	);

	const trackerKey = `${senderName}_${senderId}`;
	const now = Date.now();
	let tracker = config.govMessageTrackers[trackerKey];

	if (!tracker) {
		tracker = {
			count: 1,
			lastMessageTime: now,
			cooldownEnd: 0
		};
		config.govMessageTrackers[trackerKey] = tracker;
		return true;
	}

	if (hasKeyword && tracker.cooldownEnd > 0) {
		debugLog(`Ключевое слово найдено — снимаем блокировку для ${senderName}`);
		tracker.cooldownEnd = 0;
		tracker.count = 1;
		return true;
	}

	if (now < tracker.cooldownEnd) {
		return false;
	}

	if (now - tracker.lastMessageTime > config.govMessageCooldown) {
		tracker.count = 1;
		tracker.lastMessageTime = now;
		return true;
	}

	tracker.count++;
	tracker.lastMessageTime = now;

	if (tracker.count > config.govMessageThreshold) {
		tracker.cooldownEnd = now + config.govMessageCooldown;
		debugLog(`Блокируем уведомления от ${senderName} на 6 минут`);
		return false;
	}

	return true;
}

function startAFKCycle() {
	config.afkCycle.active = true;
	config.afkCycle.startTime = Date.now();
	config.afkCycle.totalPlayTime = 0;

	debugLog(`AFK цикл запущен для ${displayName}`);
	sendToTelegram(`🔄 <b>AFK цикл запущен для ${displayName}</b>\nОжидание PayDay сообщения "Текущее время:"`, false, null, config.notificationDeleteDelay);
}

function stopAFKCycle() {
	if (config.afkCycle.cycleTimer) {
		clearTimeout(config.afkCycle.cycleTimer);
	}
	if (config.afkCycle.playTimer) {
		clearTimeout(config.afkCycle.playTimer);
	}
	if (config.afkCycle.pauseTimer) {
		clearTimeout(config.afkCycle.pauseTimer);
	}
	if (config.afkCycle.mainTimer) {
		clearTimeout(config.afkCycle.mainTimer);
	}

	config.afkCycle.active = false;
	debugLog(`AFK цикл остановлен для ${displayName}`);
	sendToTelegram(`⏹️ <b>AFK цикл остановлен для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
}

function startPlayPhase() {
	if (!config.afkCycle.active) return;

	debugLog(`Начинаем игровую фазу для ${displayName}`);
	sendToTelegram(`▶️ Игровая фаза начата для ${displayName}`, false, null, config.notificationDeleteDelay);

	try {
		if (typeof closeInterface === 'function') {
			closeInterface("PauseMenu");
			debugLog(`Выход из паузы для ${displayName}`);
		}
	} catch (e) {
		debugLog(`Ошибка при выходе из паузы: ${e.message}`);
	}

	config.afkCycle.currentPlayTime = 0;

	let playDurationMs;
	if (config.afkCycle.mode === 'fixed') {
		playDurationMs = 5 * 60 * 1000;
	} else if (config.afkCycle.mode === 'random') {
		const minMin = 2;
		const maxMin = 8;
		const remainingPlay = 25 * 60 * 1000 - config.afkCycle.totalPlayTime;
		if (remainingPlay <= 0) {
			enterPauseUntilEnd();
			return;
		}
		const maxPossible = Math.min(maxMin * 60 * 1000, remainingPlay);
		const minPossible = Math.min(minMin * 60 * 1000, maxPossible);
		playDurationMs = Math.floor(Math.random() * (maxPossible - minPossible + 1) + minPossible);
	}

	debugLog(`Игровая фаза: ${playDurationMs / 60000} минут`);

	config.afkCycle.playTimer = setTimeout(() => {
		config.afkCycle.totalPlayTime += playDurationMs;

		if (config.afkCycle.totalPlayTime < 25 * 60 * 1000) {
			startPausePhase();
		} else {
			debugLog(`Отыграно 25 минут, ставим на паузу до следующего PayDay для ${displayName}`);
			sendToTelegram(`💤 <b>Отыграно 25 минут для ${displayName}</b>\nСтавим на паузу до следующего PayDay`, false, null, config.notificationDeleteDelay);
			enterPauseUntilEnd();
		}
	}, playDurationMs);
}

function startPausePhase() {
	if (!config.afkCycle.active) return;

	debugLog(`Начинаем фазу паузы для ${displayName}`);

	try {
		if (typeof openInterface === 'function') {
			openInterface("PauseMenu");
			debugLog(`Вход в паузу для ${displayName}`);
		}
	} catch (e) {
		debugLog(`Ошибка при входе в паузу: ${e.message}`);
	}

	config.afkCycle.currentPauseTime = 0;

	let pauseDurationMs;
	if (config.afkCycle.mode === 'fixed') {
		pauseDurationMs = 5 * 60 * 1000;
	} else if (config.afkCycle.mode === 'random') {
		const minMin = 2;
		const maxMin = 8;
		pauseDurationMs = Math.floor(Math.random() * ((maxMin - minMin) * 60 * 1000 + 1) + minMin * 60 * 1000);
	}

	debugLog(`Пауза: ${pauseDurationMs / 60000} минут`);

	config.afkCycle.pauseTimer = setTimeout(() => {
		startPlayPhase();
	}, pauseDurationMs);
}

function enterPauseUntilEnd() {
	try {
		if (typeof openInterface === 'function') {
			openInterface("PauseMenu");
			debugLog(`Вход в паузу до конца для ${displayName}`);
		}
	} catch (e) {
		debugLog(`Ошибка при входе в паузу до конца: ${e.message}`);
	}
}

function handlePayDayTimeMessage() {
	if (!config.afkSettings.active || config.afkCycle.mode === 'none') {
		return;
	}

	if (config.afkCycle.cycleTimer) {
		clearTimeout(config.afkCycle.cycleTimer);
	}
	if (config.afkCycle.playTimer) {
		clearTimeout(config.afkCycle.playTimer);
	}
	if (config.afkCycle.pauseTimer) {
		clearTimeout(config.afkCycle.pauseTimer);
	}
	if (config.afkCycle.mainTimer) {
		clearTimeout(config.afkCycle.mainTimer);
	}

	const mainTimerDuration = 59 * 60 * 1000;

	config.afkCycle.mainTimer = setTimeout(() => {
		try {
			if (typeof closeInterface === 'function') {
				closeInterface("PauseMenu");
				debugLog(`Выход из паузы перед следующим PayDay для ${displayName}`);
				sendToTelegram(`▶️ <b>Выход из паузы перед следующим PayDay для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
			}
		} catch (e) {
			debugLog(`Ошибка при выходе из паузы: ${e.message}`);
		}

		if (config.afkCycle.playTimer) clearTimeout(config.afkCycle.playTimer);
		if (config.afkCycle.pauseTimer) clearTimeout(config.afkCycle.pauseTimer);

		debugLog(`Готов к следующему PayDay для ${displayName}`);
		sendToTelegram(`⏰ <b>Готов к следующему PayDay для ${displayName}</b>\nОжидание сообщения "Текущее время:"`, false, null, config.notificationDeleteDelay);
	}, mainTimerDuration);

	if (!config.afkCycle.active) {
		startAFKCycle();
	}

	config.afkCycle.startTime = Date.now();
	config.afkCycle.totalPlayTime = 0;

	const modeText = config.afkCycle.mode === 'fixed' ? '5 мин играем, 5 мин пауза' : 'рандомное время игры/паузы';
	debugLog(`Обнаружено сообщение "Текущее время:", начинаем AFK цикл для ${displayName}`);
	sendToTelegram(`⏰ <b>Обнаружен PayDay для ${displayName}</b>\nНачинаем AFK цикл: ${modeText}\nГлавный таймер: 59 минут`, false, null, config.notificationDeleteDelay);

	startPlayPhase();
}

// Функция для автоматического ввода пароля
function setupAutoLogin(attempt = 1) {
	if (!autoLoginConfig.enabled) {
		debugLog('Автовход отключен');
		return;
	}

	if (attempt > autoLoginConfig.maxAttempts) {
		const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось выполнить автовход после ${autoLoginConfig.maxAttempts} попыток`;
		debugLog(errorMsg);
		sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
		return;
	}

	// Проверяем, открыт ли интерфейс Authorization
	if (!window.getInterfaceStatus("Authorization")) {
		debugLog(`Попытка ${attempt}: Интерфейс Authorization не открыт, повтор через ${autoLoginConfig.attemptInterval}мс`);
		setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
		return;
	}

	// Получаем экземпляр Authorization
	const authInstance = window.interface("Authorization");
	if (!authInstance) {
		debugLog(`Попытка ${attempt}: Экземпляр Authorization не найден, повтор через ${autoLoginConfig.attemptInterval}мс`);
		setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
		return;
	}

	// Получаем экземпляр Login через getInstance("auth")
	const loginInstance = authInstance.getInstance("auth");
	if (!loginInstance) {
		debugLog(`Попытка ${attempt}: Экземпляр Login не найден, повтор через ${autoLoginConfig.attemptInterval}мс`);
		setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
		return;
	}

	// Устанавливаем пароль
	debugLog(`[${displayName}] Автоввод пароля: ${autoLoginConfig.password}`);
	loginInstance.password.value = autoLoginConfig.password;

	// Ждем обновления DOM и эмулируем нажатие кнопки "Войти"
	setTimeout(() => {
		if (loginInstance.password.value === autoLoginConfig.password) {
			debugLog(`[${displayName}] Эмуляция нажатия кнопки "Войти"`);
			try {
				loginInstance.onClickEvent("play");
				sendToTelegram(`✅ <b>Автовход выполнен для ${displayName}</b>`, false, null, config.notificationDeleteDelay);
			} catch (err) {
				const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось выполнить вход\n<code>${err.message}</code>`;
				debugLog(errorMsg);
				sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
			}
		} else {
			debugLog(`[${displayName}] Ошибка: пароль не установлен, повтор через ${autoLoginConfig.attemptInterval}мс`);
			setTimeout(() => setupAutoLogin(attempt + 1), autoLoginConfig.attemptInterval);
		}
	}, 100);
}

// Функция инициализации автовхода
function initializeAutoLogin() {
	if (!autoLoginConfig.enabled) {
		debugLog('Автовход отключен в конфигурации');
		return;
	}

	// Проверяем, открыт ли интерфейс Authorization
	if (window.getInterfaceStatus("Authorization")) {
		debugLog('Интерфейс Authorization уже открыт, запускаем автовход');
		setupAutoLogin();
	} else {
		// Открываем интерфейс Authorization с параметрами
		const openParams = [
			"auth", // Страница авторизации
			config.accountInfo.nickname || "Pavel_Nabokov", // Логин (замените на ваш, если известен)
			"", // Сервер
			"", // Бонусы
			"", // Хэллоуин
			"", // Новый год
			"", // Пасха
			"https://radmir.online/recovery-password", // Восстановление пароля
			{ // Дополнительные параметры
				autoLogin: {
					password: autoLoginConfig.password,
					enabled: autoLoginConfig.enabled
				}
			}
		];
		debugLog(`Открываем интерфейс Authorization для ${displayName}`);
		try {
			window.openInterface("Authorization", JSON.stringify(openParams));
		} catch (err) {
			debugLog(`Ошибка при открытии Authorization: ${err.message}`);
			sendToTelegram(`❌ <b>Ошибка ${displayName}</b>\nНе удалось открыть интерфейс Authorization\n<code>${err.message}</code>`, false, null, config.notificationDeleteDelay);
			return;
		}

		// Ожидаем открытия интерфейса
		let attempts = 0;
		const checkInterval = setInterval(() => {
			attempts++;
			if (window.getInterfaceStatus("Authorization")) {
				clearInterval(checkInterval);
				debugLog('Интерфейс Authorization открыт, запускаем автовход');
				setTimeout(setupAutoLogin, 1000); // Задержка для полной инициализации
			} else if (attempts >= autoLoginConfig.maxAttempts) {
				clearInterval(checkInterval);
				const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось открыть Authorization после ${autoLoginConfig.maxAttempts} попыток`;
				debugLog(errorMsg);
				sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
			} else {
				debugLog(`Попытка ${attempts}: Ожидание открытия Authorization`);
			}
		}, autoLoginConfig.attemptInterval);
	}
}

// Перехват window.openInterface для автоматического входа
const originalOpenInterface = window.openInterface;
window.openInterface = function(interfaceName, params, additionalParams) {
	const result = originalOpenInterface.call(this, interfaceName, params, additionalParams);

	if (interfaceName === "Authorization") {
		debugLog(`[${displayName}] Открыт интерфейс Authorization, инициализация автовхода`);
		setTimeout(initializeAutoLogin, 500); // Задержка для инициализации компонента
	}

	return result;
};

function initializeChatMonitor() {
	if (typeof sendChatInput === 'undefined') {
		const errorMsg = '❌ <b>Ошибка</b>\nsendChatInput не найден';
		debugLog(errorMsg);
		sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
		return false;
	}

	if (typeof window.playSound === 'undefined') {
		debugLog('Функция playSound не найдена, создаем свою');
		window.playSound = function(url, loop, volume) {
			const audio = new Audio(url);
			audio.loop = loop || false;
			audio.volume = volume || 1.0;
			audio.play().catch(e => debugLog('Ошибка воспроизведения звука:', e));
		};
	}

	window.OnChatAddMessage = function(e, i, t) {
	// если что убрать
    debugLog(`Чат-сообщение: ${e} | Цвет: ${i} | Тип: ${t} | Пауза: ${window.getInterfaceStatus("PauseMenu")}`);
		const msg = String(e);
		const lowerCaseMessage = msg.toLowerCase();
		const currentTime = Date.now();
		const chatRadius = getChatRadius(i);

		// Для отладки, выводим сообщения в консоль
		// console.log(msg); // сооб в чат

        // Проверка сообщения "Текущее время:" для AFK
	    if (msg.includes("Текущее время:") && config.afkSettings.active) {
	        handlePayDayTimeMessage();
	    }
	
	    // Проверка сообщения о возобновлении работы сервера для AFK ночь
	    if (config.afkSettings.active && config.afkCycle.active && msg.includes("Сервер возобновит работу в течение минуты...")) {
	        debugLog('Обнаружено сообщение о возобновлении работы сервера!');
	        sendChatInput("/q");
	        sendToTelegram(`⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо условию AFK ночь: Сервер возобновит работу`, false, null, config.notificationDeleteDelay);
	    }

		if (lowerCaseMessage.includes("зареспавнил вас")) {
			debugLog(`Обнаружен респавн для ${displayName}!`);
			const replyMarkup = {
				inline_keyboard: [
					[
						createButton("📝 Ответить", `admin_reply_${uniqueId}`),
						createButton("🚶 Движения", `show_movement_${uniqueId}`)
					]
				]
			};
			sendToTelegram(`🔄 <b>Вас зареспавнили! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
			window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
		}

		if (lowerCaseMessage.includes("вы были кикнуты по подозрению в читерстве")) {
			debugLog(`Обнаружен кик анти-читом для ${displayName}!`);
			const replyMarkup = {
				inline_keyboard: [
					[
						createButton("📝 Ответить", `admin_reply_${uniqueId}`),
						createButton("🚶 Движения", `show_movement_${uniqueId}`)
					]
				]
			};
			sendToTelegram(`🚫 <b>Вас кикнул анти-чит! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
			window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
		}

		const govMessageRegex = /^- (.+?) \{CCFF00}\(\{v:([^}]+)}\)\[(\d+)\]/;
		const govMatch = msg.match(govMessageRegex);
		if (govMatch) {
			const messageText = govMatch[1];
			const senderName = govMatch[2];
			const senderId = govMatch[3];

			// Проверяем, что сообщение отправлено из радиуса CLOSE
			if (chatRadius === CHAT_RADIUS.CLOSE) {
				if (checkGovMessageConditions(messageText, senderName, senderId)) {
					const replyMarkup = {
						inline_keyboard: [
							[
								createButton("📝 Ответить", `admin_reply_${uniqueId}`),
								createButton("🚶 Движения", `show_movement_${uniqueId}`)
							]
						]
					};
					sendToTelegram(`🏛️ <b>Сообщение от сотрудника правительства (${displayName}):</b>\n👤 ${senderName} [ID: ${senderId}]\n💬 ${messageText}`, false, replyMarkup);
				}
			}
		}

		processSalaryAndBalance(msg);

		if (config.keywords.some(kw => lowerCaseMessage.includes(kw.toLowerCase()))) {
			debugLog('Найдено ключевое слово:', msg);
			sendToTelegram(`🔔 <b>Обнаружено ключевое слово (${displayName}):</b>\n<code>${msg.replace(/</g, '<')}</code>`);

			setTimeout(() => {
				try {
					sendChatInput("/c");
					debugLog('Команда /c отправлена');
				} catch (err) {
					const errorMsg = `❌ <b>Ошибка ${displayName}</b>\nНе удалось отправить /c\n<code>${err.message}</code>`;
					debugLog(errorMsg);
					sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
				}
			}, config.clearDelay);
		}

		if ((lowerCaseMessage.indexOf("администратор") !== -1 && lowerCaseMessage.indexOf("для") !== -1) ||
			(msg.includes("[A]") && msg.includes("((")) ||
			(lowerCaseMessage.includes("подбросил") &&
				(currentTime - config.lastPodbrosTime > config.podbrosCooldown || config.podbrosCounter < 2))) {

			if (lowerCaseMessage.includes("подбросил")) {
				config.podbrosCounter++;
				if (config.podbrosCounter <= 2) {
					debugLog('Обнаружен подброс!');
					const replyMarkup = {
						inline_keyboard: [
							[
								createButton("📝 Ответить", `admin_reply_${uniqueId}`),
								createButton("🚶 Движения", `show_movement_${uniqueId}`)
							]
						]
					};
					sendToTelegram(`🚨 <b>Обнаружен подброс! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
					window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
				}

				if (currentTime - config.lastPodbrosTime > config.podbrosCooldown) {
					config.podbrosCounter = 0;
				}
				config.lastPodbrosTime = currentTime;
			} else {
				debugLog('Обнаружен администратор!');
				const replyMarkup = {
					inline_keyboard: [
						[
							createButton("📝 Ответить администратору", `admin_reply_${uniqueId}`),
							createButton("🚶 Движения", `show_movement_${uniqueId}`)
						]
					]
				};
				sendToTelegram(`🚨 <b>Обнаружен администратор! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
				window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/uved.mp3", false, 1.0);
			}
		}

		if (!isNonRPMessage(msg) && (
				(lowerCaseMessage.indexOf("депутат") !== -1 ||
					lowerCaseMessage.indexOf("вице-губернатор") !== -1 ||
					lowerCaseMessage.indexOf("губернатор") !== -1 ||
					lowerCaseMessage.indexOf("лицензёр") !== -1 ||
					lowerCaseMessage.indexOf("адвокат") !== -1) &&
				(lowerCaseMessage.indexOf("строй") !== -1 ||
					lowerCaseMessage.indexOf("сбор") !== -1 ||
					lowerCaseMessage.indexOf("готовность") !== -1 ||
					lowerCaseMessage.indexOf("конф") !== -1)
			) && (chatRadius === CHAT_RADIUS.RADIO)) {
			debugLog('Обнаружен сбор/строй!');
			sendToTelegram(`📢 <b>Обнаружен сбор/строй! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`);
			window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/steroi.mp3", false, 1.0);

			setTimeout(() => {
				sendChatInput("/q");
				debugLog('Отправлена команда /q');
				sendToTelegram(`✅ <b>Отправлено /q (${displayName})</b>`, false, null, config.notificationDeleteDelay);
			}, 30);
		}

		if (lowerCaseMessage.indexOf("администратор") !== -1 &&
			lowerCaseMessage.indexOf("кикнул") !== -1 &&
			msg.includes(config.accountInfo.nickname)) {
			debugLog(`Обнаружен кик ${displayName}!`);
			const replyMarkup = {
				inline_keyboard: [
					[
						createButton("📝 Ответить", `admin_reply_${uniqueId}`),
						createButton("🚶 Движения", `show_movement_${uniqueId}`)
					]
				]
			};
			sendToTelegram(`💢 <b>КИК АДМИНИСТРАТОРА! (${displayName})</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
			window.playSound("https://raw.githubusercontent.com/ZaharQqqq/Sound/main/kick.mp3", false, 1.0);
		}

		if (!isNonRPMessage(msg) && checkLocationRequest(msg, lowerCaseMessage)) {
			debugLog('Обнаружен запрос местоположения!');
			const replyMarkup = {
				inline_keyboard: [
					[
						createButton("📝 Ответить", `admin_reply_${uniqueId}`),
						createButton("🚶 Движения", `show_movement_${uniqueId}`)
					]
				]
			};
			sendToTelegram(`📍 <b>Обнаружен запрос местоположения (${displayName}):</b>\n<code>${msg.replace(/</g, '<')}</code>`, false, replyMarkup);
		}

		if (!isNonRPMessage(msg) && checkAFKConditions(msg, lowerCaseMessage)) {
			debugLog('Обнаружено AFK условие!');
			sendChatInput("/q");
			sendToTelegram(`⚡ <b>Автоматически отправлено /q (${displayName})</b>\nПо AFK условию для ID: ${config.afkSettings.id}\n<code>${msg.replace(/</g, '<')}</code>`, false, null, config.notificationDeleteDelay);
		}
	};

	debugLog('Мониторинг успешно активирован');

	if (!config.initialized) {
		trackNicknameAndServer();
		config.initialized = true;

		if (config.trackPlayerId) {
			debugLog('Запуск отслеживания ID игрока через HUD...');
			trackPlayerId();
		}
	}

	checkTelegramCommands();
	return true;
}

debugLog('Скрипт запущен');

if (!initializeChatMonitor()) {
	let attempts = 0;
	const intervalId = setInterval(() => {
		attempts++;

		if (initializeChatMonitor()) {
			clearInterval(intervalId);
		} else if (attempts >= config.maxAttempts) {
			clearInterval(intervalId);
			const errorMsg = `❌ <b>Ошибка</b>\nНе удалось инициализировать после ${config.maxAttempts} попыток`;
			debugLog(errorMsg);
			sendToTelegram(errorMsg, false, null, config.notificationDeleteDelay);
		} else {
			debugLog(`Попытка инициализации #${attempts}`);
		}
	}, config.checkInterval);
}