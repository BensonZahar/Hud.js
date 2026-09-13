// PhoneMenu.js — загрузчик PhoneMenu. Префетч JS и CSS из window.__prefetch_phonemenu_*
// Реальный код грузится динамически с GitHub и инжектируется через eval.
// Этот файл лишь импортирует все зависимости в scope и скачивает удалённый PhoneMenu.js.

// ── Все зависимости PhoneMenu.js — нужны для eval-scope удалённого кода ──
import{db as O_,da as L_,d7 as N_,d9 as R_,dd as F_,d8 as V_,dc as U_,d5 as O1,d6 as L1,hX as N1,hY as R1,hZ as F1,h_ as V1,h$ as U1,i0 as H1,i1 as G1,i2 as W1,i3 as Y1,i4 as K1,i5 as j1,i6 as Z1,i7 as z1,i8 as X1,i9 as q1,ia as J1,ib as Q1,ic as eh,id as sh,ie as th,ig as ih,ih as ah,ii as nh,ij as oh,n as rh,o as lh,p as H_,q as ch,r as G_,i as W_,iA as Y_,iy as K_,iz as j_,it as lo,ir as Z_,iv as z_,iq as X_,ix as q_,iu as J_,is as co,ip as _o,im as dh,io as _h,iw as mh,cK as Q_,cI as em,cG as uh,cw as sm,cq as tm,cv as mo,cu as im,cL as am,cM as nm,cO as uo,cH as om,cE as gh,cP as hh,cT as ph,cs as vh,cJ as fh,cN as bh,km as yh,kb as C_,kw as Ch,kW as Eh,kV as Ih,kd as go,kk as rm,kg as wh,kR as lm,k7 as cm,k8 as Sh,kl as Th,k3 as Mh,kh as Ph,kD as kh,kE as dm,k9 as xh,kv as Ah,kU as Dh,k4 as $h,k5 as Bh,k6 as Oh,kj as _m,kS as Lh,kT as Nh,kC as Rh,kf as Fh,kA as Vh,kJ as Uh,kK as Hh,kL as Gh,bL as E_,bM as I_,bN as w_,bO as S_,a as Wh,b as Yh,c as Kh,d as jh,e as Zh,f as zh,g as Xh,h as qh,j as mm,k as um,l as hm,m as pm,s as o6,t as r6,u as l6,v as c6,w as d6,x as _6,y as m6,z as u6,A as g6,B as h6,C as p6,D as ho,E as po,F as vo,G as fo,H as bo,I as yo,J as Co,K as Eo,L as Io,M as wo,N as So,O as To,P as Mo,Q as Po,R as ko,S as xo,T as Ao,U as Do,V as $o,W as Bo,X as Oo,Y as Lo,Z as No,$ as Ro,a0 as Fo,a1 as Vo,a2 as Uo,a3 as Ho,a4 as Go,a5 as Wo,a6 as Yo,a7 as Ko,a8 as jo,a9 as Zo,aa as zo,ab as Xo,ac as qo,ad as Jo,ae as Qo,af as er,ag as sr,ah as tr,ai as ir,aj as ar,ak as nr,al as or,am as rr,an as lr,ao as cr,ap as dr,aq as _r,ar as mr,as as ur,at as gr,au as hr,av as pr,aw as vr,ax as fr,ay as br,az as yr,aA as Cr,aB as Er,aC as Ir,aD as wr,aE as Sr,aF as Tr,aG as Mr,aH as Pr,aI as kr,aJ as xr,aK as Ar,aL as Dr,aM as $r,aN as Br,aO as Or,aP as Lr,aQ as Nr,aR as Rr,aS as Fr,aT as Vr,aU as Ur,aV as Hr,aW as Gr,aX as Wr,aY as Yr,aZ as Kr,a_ as jr,a$ as Zr,b0 as zr,b1 as Xr,b2 as qr,b3 as Jr,b4 as Qr,b5 as el,b6 as sl,b7 as tl,b8 as il,b9 as al,ba as nl,bb as ol,bc as rl,bd as ll,be as cl,bf as dl,bg as _l,bh as ml,bi as ul,bj as gl,bk as hl,bl as pl,bm as vl,bn as fl,bo as bl,bp as yl,bq as Cl,br as El,bs as Il,bt as wl,bu as Sl,bv as Tl,bw as Ml,bx as Pl,by as kl,bz as xl,bA as Al,bB as Dl,bC as $l,bD as Bl,bE as v6,bF as f6,bG as b6,bH as y6,bI as C6,bJ as E6,bK as I6,bP as vm,bQ as Jh,bR as w6,bS as S6,bT as T6,bU as M6,bV as P6,bW as k6,bX as x6,bY as A6,bZ as Qh,b_ as D6,b$ as $6,c0 as B6,c1 as O6,c2 as L6,c3 as N6,c4 as R6,c5 as ep,c6 as F6,c7 as V6,c8 as U6,c9 as Ol,ca as sp,cb as tp,cc as Ll,cd as Nl,ce as Rl,cf as Fl,cg as Ea,ch as Ia,ci as Vl,cj as Ul,ck as Hl,cl as wa,cm as Gl,cn as Wl,co as Yl,cp as Sa,cr as H6,ct as G6,cx as W6,cy as Y6,cz as K6,cA as j6,cB as Z6,cC as z6,cD as X6,cF as q6,cQ as J6,cR as Q6,cS as e4,cU as s4,cV as t4,cW as i4,cX as a4,cY as n4,cZ as o4,c_ as ip,c$ as ap,d0 as np,d1 as op,d2 as rp,d3 as lp,d4 as cp,de as dp,df as _p,dg as mp,dh as up,di as gp,dj as hp,dk as pp,dl as vp,dm as fp,dn as bp,dp as yp,dq as Cp,dr as r4,ds as l4,dt as c4,du as d4,dv as Ep,dw as Ip,dx as wp,dy as Sp,dz as _4,dA as m4,dB as u4,dC as g4,dD as h4,dE as p4,dF as v4,dG as Kl,dH as fm,dI as bm,dJ as jl,dK as ym,dL as Cm,dM as f4,dN as Em,dO as b4,dP as y4,dQ as C4,dR as E4,dS as I4,dT as w4,dU as S4,dV as T4,dW as M4,dX as P4,dY as k4,dZ as x4,d_ as A4,d$ as Im,e0 as wm,e1 as Sm,e2 as Zl,e3 as zl,e4 as Xl,e5 as ql,e6 as Jl,e7 as Ql,e8 as ec,e9 as sc,ea as tc,eb as ic,ec as ac,ed as nc,ee as oc,ef as rc,eg as lc,eh as cc,ei as dc,ej as _c,ek as mc,el as uc,em as gc,en as hc,eo as pc,ep as vc,eq as fc,er as bc,es as D4,et as $4,eu as Tm,ev as Mm,ew as yc,ex as Tp,ey as Mp,ez as Pp,eA as Cc,eB as Pm,eC as km,eD as Ec,eE as Ic,eF as Os,eG as js,eH as xm,eI as Am,eJ as Zs,eK as wc,eL as Ta,eM as Ma,eN as Pa,eO as ka,eP as Kt,eQ as jt,eR as Sc,eS as Tc,eT as Mc,eU as xa,eV as Aa,eW as Pc,eX as kc,eY as Dm,eZ as xc,e_ as Ac,e$ as Da,f0 as Zt,f1 as $m,f2 as Dc,f3 as $a,f4 as Bm,f5 as Om,f6 as $c,f7 as Ba,f8 as Oa,f9 as Lm,fa as Bc,fb as Oc,fc as La,fd as Lc,fe as Nc,ff as Nm,fg as zt,fh as Xt,fi as Na,fj as Ra,fk as zs,fl as Rc,fm as Fc,fn as Vc,fo as Fa,fp as qt,fq as Uc,fr as Va,fs as Ua,ft as Rm,fu as Jt,fv as Hc,fw as Fm,fx as Ha,fy as Ga,fz as Gc,fA as Wc,fB as Vm,fC as Um,fD as Yc,fE as Kc,fF as Qt,fG as Xs,fH as jc,fI as Hm,fJ as Gm,fK as ei,fL as Wm,fM as Ym,fN as Wa,fO as Km,fP as Ya,fQ as Zc,fR as jm,fS as B4,fT as kp,fU as xp,fV as Ap,fW as Dp,fX as $p,fY as Bp,fZ as Op,f_ as Lp,f$ as Np,g0 as Rp,g1 as Fp,g2 as zc,g3 as Ka,g4 as Vp,g5 as Up,g6 as Hp,g7 as Gp,g8 as Wp,g9 as Yp,ga as Kp,gb as jp,gc as Zp,gd as zp,ge as Xp,gf as qp,gg as Jp,gh as Qp,gi as ev,gj as Zm,gk as O4,gl as sv,gm as tv,gn as iv,go as L4,gp as N4,gq as av,gr as R4,gs as F4,gt as nv,gu as V4,gv as U4,gw as zm,gx as ov,gy as rv,gz as H4,gA as G4,gB as lv,gC as W4,gD as Y4,gE as cv,gF as dv,gG as _v,gH as mv,gI as uv,gJ as gv,gK as hv,gL as pv,gM as vv,gN as fv,gO as bv,gP as yv,gQ as Cv,gR as Ev,gS as Iv,gT as wv,gU as Sv,gV as Tv,gW as Mv,gX as Pv,gY as kv,gZ as xv,g_ as Av,g$ as Dv,h0 as $v,h1 as Bv,h2 as Ov,h3 as Lv,h4 as Nv,h5 as Rv,h6 as Fv,h7 as Vv,h8 as Uv,h9 as Hv,ha as Gv,hb as Wv,hc as Yv,hd as Kv,he as jv,hf as Zv,hg as zv,hh as Xv,hi as qv,hj as Jv,hk as Qv,hl as e0,hm as s0,hn as t0,ho as i0,hp as a0,hq as n0,hr as o0,hs as r0,ht as l0,hu as c0,hv as d0,hw as _0,hx as m0,hy as K4,hz as j4,hA as Xm,hB as u0,hC as qm,hD as g0,hE as Jm,hF as h0,hG as p0,hH as Xc,hI as Qm,hJ as eu,hK as v0,hL as f0,hM as b0,hN as y0,hO as C0,hP as E0,hQ as I0,hR as Z4,hS as su,hT as w0,hU as tu,hV as Ls,hW as Ns,ik as iu,il as ja,iB as qc,iC as Jc,iD as Qc,iE as ed,iF as sd,iG as S0,iH as z4,iI as X4,iJ as T0,iK as q4,iL as M0,iM as P0,iN as k0,iO as x0,iP as A0,iQ as D0,iR as $0,iS as J4,iT as Q4,iU as td,iV as au,iW as nu,iX as ou,iY as ru,iZ as lu,i_ as cu,i$ as du,j0 as _u,j1 as Za,j2 as id,j3 as za,j4 as si,j5 as Xa,j6 as qs,j7 as ad,j8 as ti,j9 as nd,ja as qa,jb as Ja,jc as Qa,jd as en,je as sn,jf as od,jg as ii,jh as rd,ji as ai,jj as ld,jk as cd,jl as ni,jm as tn,jn as oi,jo as ri,jp as Rs,jq as an,jr as nn,js as dd,jt as _d,ju as on,jv as rn,jw as ln,jx as cn,jy as md,jz as li,jA as dn,jB as ci,jC as ud,jD as di,jE as gd,jF as _n,jG as hd,jH as mn,jI as _i,jJ as pd,jK as un,jL as vd,jM as fd,jN as mi,jO as ui,jP as gi,jQ as gn,jR as hn,jS as B0,jT as O0,jU as mu,jV as uu,jW as gu,jX as hu,jY as pu,jZ as vu,j_ as fu,j$ as bu,k0 as yu,k1 as Cu,k2 as bd,ka as e8,kc as s8,ke as t8,ki as i8,kn as a8,ko as n8,kp as o8,kq as r8,kr as l8,ks as c8,kt as d8,ku as _8,kx as m8,ky as u8,kz as g8,kB as h8,kF as p8,kG as v8,kH as f8,kI as b8,kM as y8,kN as C8,kO as E8,kP as I8,kQ as w8,kX as S8,kY as L0,kZ as N0,k_ as R0,k$ as F0,l0 as V0,l1 as U0,l2 as Eu,l3 as Iu,l4 as wu,l5 as H0,l6 as G0,l7 as Su,l8 as Tu,l9 as W0,la as Y0,_ as Mu}from"./wallpaper_mobile.js";
import{w as as}from"./dom.js";
import{S as ae}from"./ScrollableContainer.js";
import{o as n,c as l,a as i,f as p,n as I,p as A,g as D,_ as y,r as g,b as m,w as b,h as C,F as k,i as B,d as $,t as f,e as P,T as N,u as Ge,l as je,k as me,I as De,U as T8,D as W,s as M,m as le,q as hi,y as Ce,z as $s,S as Pu,v as Nt,V as M8,W as qn,x as Vi,j as ks,B as ee,X as T_,Y as K0,K as Rt,N as Gi,A as so,Z as j0,$ as P8,a0 as k8,a1 as He,C as _s,H as x8,a2 as A8,a3 as gs,a4 as xe,a5 as $i,a6 as D8,a7 as $8,a8 as B8,a9 as t_,aa as O8,ab as L8,ac as N8}from"./index.js";
import{C as pi}from"./ContaineredButton.js";
import{C as ye,W as re,y as Oe,$ as R8,a0 as F8}from"./Button.js";
import{R as Be,I as V8,a as U8}from"./ArrowTop.js";
import{f as ht,T as ku,C as pn,c as H8}from"./ProfileCard.js";
import{B as J}from"./Button3.js";
import{I as Ut,S as Z0,M as z0,F as X0,a as zg,b as Xg,c as G8}from"./globals.js";
import{M as W8}from"./MarkCounter.js";
import{b as yd,c as xu,f as Y8,d as Au,g as Cd,p as Ht,e as Du,a as $u,h as K8,i as j8}from"./time.js";
import{_ as Bu,a as Ou,b as Lu,c as Nu,d as Ru,e as Fu,f as Vu,g as Uu}from"./6.js";
import{f as Q,a as Z8,c as he}from"./numbers.js";
import{P as Ed}from"./ProgressTimer.js";
import{u as Ui}from"./useTimer.js";
import{A as $e}from"./AnimatedLogo.js";
import{B as hs}from"./BtnWithTooltip.js";
import{u as z8,g as Id}from"./carImages.js";
import{c as Bs}from"./timeZone.js";
import{s as q0,h as Wi}from"./colors.js";
import{_ as be}from"./money.js";
import{A as J0}from"./AnimatedHourglass.js";
import{U as vn}from"./UnitsTime.js";
import{T as pt}from"./Tooltip.js";
import{_ as Hu}from"./new-points-bg.js";
import{R as Gu}from"./RangeSlider.js";
import{p as eo}from"./pluralization.js";
import{M as vi,d as X8}from"./MainMap.js";
import{S as q8}from"./index2.js";
import{I as J8}from"./InputField.js";
import{a as Tt,T as Mt}from"./sounds.js";
import{g as Q8,C as e7,M as s7,B as t7}from"./GPSPoints.js";
import{a as fn,_ as bn}from"./modal-attack.js";
import{_ as Q0}from"./taxi-banner-icon.js";
import{_ as e2}from"./DefaultMapMarkerOverwrite.js";
import{U as i7}from"./Button4.js";
import{M as a7}from"./Point.js";
import{I as n7}from"./Back3.js";
import{A as yn}from"./AnimatedLogoWithBg.js";
import{_ as s2,a as t2,b as i2,c as a2,d as n2,e as o2,f as r2,g as l2,h as c2,i as d2,j as _2,k as m2,l as u2,m as g2,n as h2,o as p2,p as v2,q as f2,r as b2,s as y2,t as C2,u as E2,v as I2,w as w2,x as S2,y as T2,z as M2,A as P2,B as k2,C as x2,D as A2,E as D2,F as $2,G as B2,H as O2,I as L2,J as N2,K as R2,L as F2,M as V2,N as U2,O as H2,P as G2,Q as W2,R as Y2,S as K2,T as j2,U as Z2,V as z2,W as X2,X as q2,Y as J2,Z as Q2,$ as ef,a0 as sf,a1 as tf,a2 as af,a3 as nf,a4 as of,a5 as rf,a6 as lf,a7 as cf,a8 as df,a9 as _f,aa as mf,ab as uf,ac as gf,ad as hf,ae as pf,af as vf,ag as ff,ah as bf,ai as yf,aj as Cf,ak as Ef,al as If,am as wf,an as Sf,ao as Tf,ap as Mf,aq as Pf,ar as kf,as as xf,at as Af,au as Df,av as $f,aw as Bf,ax as Of,ay as Lf,az as Nf,aA as Rf,aB as Ff}from"./trailer2.js";
import{_ as Vf,a as Uf,b as Hf,c as Gf,d as Wf,e as Yf,f as Kf,g as jf,h as Zf,i as zf,j as Xf,k as qf,l as Jf,m as Qf,n as eb,o as sb,p as tb,q as ib,r as ab,s as nb,t as ob,u as rb,v as lb,w as cb,x as db,y as _b,z as mb,A as ub,B as gb,C as hb,D as pb,E as vb,F as fb,G as bb,H as yb,I as Cb,J as Eb,K as Ib,L as wb,M as Sb,N as Tb,O as Mb,P as Pb,Q as kb,R as xb,S as Ab,T as Db,U as $b,V as Bb,W as Ob,X as Lb,Y as Nb,Z as Rb,$ as Fb,a0 as Vb,a1 as Ub,a2 as Hb,a3 as Gb,a4 as Wb,a5 as Yb,a6 as Kb,a7 as jb,a8 as Zb,a9 as zb,aa as Xb,ab as qb,ac as Jb,ad as Qb,ae as e3,af as s3,ag as t3,ah as i3,ai as a3,aj as n3,ak as o3,al as r3,am as l3,an as c3,ao as d3,ap as _3,aq as m3,ar as u3,as as g3,at as h3,au as p3,av as v3}from"./trailer5.js";
import{a as f3,C as b3}from"./CarShopInfo.js";
import{r as y3}from"./carBrands.js";
import{_ as o7,a as r7,b as l7,c as c7,d as d7,e as _7,f as m7,g as u7,h as g7,i as h7,j as p7,k as v7,l as f7,m as b7,n as y7,o as C7,p as E7,q as I7,r as w7,s as S7}from"./warning-icon.js";
import{_ as T7}from"./icon-user.js";
import{_ as M7}from"./improvements.js";
import{_ as P7}from"./round-icon-check.js";
import{_ as k7}from"./sad-icon.js";
import{h as Wu}from"./line-pattern.js";
import{_ as Cn}from"./stars.js";
import{S as wd}from"./SelectedTabLine.js";
import{C as fi}from"./CarNumberPlate.js";
import{M as Gt,a as x7}from"./MainNotification.js";
import{e as A7,f as D7,g as $7,h as B7,i as O7,j as L7,k as N7,l as R7}from"./icon-silver-vip.js";
import{_ as Yi,a as Ki,b as ji,c as Zi,d as zi,e as Xi,f as qi,g as Ji,h as Qi,i as ea,j as sa,k as ta,l as ia,m as aa,n as na,o as oa,p as ra,q as la,r as ca,s as da,t as _a,u as ma,v as ua,w as ga,x as ha,y as pa,z as va,A as fa,B as ba,C as ya}from"./92.js";
import{P as F7}from"./ProgressTimerView.js";
import{_ as Sd}from"./donate.js";
import{f as C3}from"./array.js";
import{_ as E3,W as V7}from"./Index5.js";
import{M as U7}from"./text.js";
import{C as M_}from"./ButtonContainer.js";
import{e as H7,f as G7,g as W7,h as Y7,i as K7,j as j7,k as Z7,l as z7,m as X7,n as q7,o as J7,p as Q7,q as eC,r as sC,s as tC,t as iC,u as aC,v as nC,w as oC,x as rC,y as lC,z as cC,A as dC,B as _C,C as mC,D as uC,E as gC,F as hC,G as pC,H as vC,I as fC,J as bC,K as yC,L as CC,M as EC,N as IC,O as wC,P as SC,Q as TC,R as MC,S as PC,T as kC,U as xC,V as AC}from"./phoneSharingCar.js";
import{T as DC}from"./TextHint.js";

const _GH_BASE = 'https://raw.githubusercontent.com/BensonZahar/Hud.js/main/MVD%20AHK/' + encodeURIComponent('Кастом Интерфейсы') + '/';

function _xhrGet(url, attempt) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '?_=' + Date.now(), true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else if (attempt < 8) setTimeout(function() { _xhrGet(url, attempt+1).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
            else reject(new Error('HTTP ' + xhr.status));
        };
        xhr.onerror = function() {
            if (attempt < 8) setTimeout(function() { _xhrGet(url, attempt+1).then(resolve, reject); }, Math.min(1000*Math.pow(2, attempt), 16000));
            else reject(new Error('Network'));
        };
        xhr.send();
    });
}

// JS — критичен
let _text = window.__prefetch_phonemenu_js;
if (!_text) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _text = window.__prefetch_phonemenu_js; }
    if (!_text) { console.warn('[phonemenu] XHR JS самому'); _text = await _xhrGet(_GH_BASE + 'PhoneMenu.js', 0); }
} else { console.log('[phonemenu] \u2705 JS из префетча'); }

// CSS — опционален
let _cssText = window.__prefetch_phonemenu_css;
if (!_cssText && !window.__prefetch_phonemenu_css_failed) {
    if (window.__prefetch_promise) { await window.__prefetch_promise; _cssText = window.__prefetch_phonemenu_css; }
    if (!_cssText) {
        try { _cssText = await _xhrGet(_GH_BASE + 'PhoneMenu.css', 0); }
        catch (e) { console.warn('[phonemenu] CSS не загрузился:', e.message); }
    }
}

if (_cssText && !document.getElementById('phonemenu-style-remote')) {
    var s = document.createElement('style'); s.id = 'phonemenu-style-remote'; s.textContent = _cssText;
    document.head.appendChild(s);
}

// Убираем ВСЕ формы import из удалённого кода (они уже покрыты импортами выше)
_text = _text.replace(/^import\b[^\n]*/gm, '');
// Превращаем export { X as default } в window.__phoneMenuComp = X
_text = _text.replace(/^export\s*\{\s*([^}]+)\s*\}[;\s]*$/m, function(_, exp) {
    return 'window.__phoneMenuComp = ' + exp.split(' as ')[0].trim() + ';';
});
// Превращаем export default X в window.__phoneMenuComp = X (запасной вариант)
_text = _text.replace(/^export\s+default\s+/m, 'window.__phoneMenuComp = ');
try { eval(_text); } catch (e) { console.error('[phonemenu] eval упал:', e); throw e; }
const PhoneMenu = window.__phoneMenuComp; delete window.__phoneMenuComp;
if (!PhoneMenu) throw new Error('[phonemenu] компонент не загружен');
console.log('[phonemenu] готов:', PhoneMenu?.name);
export { PhoneMenu as default };
