import{j as k}from"./jsx-runtime.Yf6r0-8m.js";import{f as pe,c as te,d as fe,M as ee,W as L,s as q,y as G,a as C,n as K,H,$ as re,j as be,w as xe,D as ne,k as me,g as W,_ as U,q as B,u as ge,l as v,P as M,F as T,t as he}from"./use-is-mounted.LPfvORp8.js";import{r as s,G as R}from"./index.DoDIQzXB.js";function ve({onFocus:e}){let[t,n]=s.useState(!0),r=pe();return t?R.createElement(te,{as:"button",type:"button",features:fe.Focusable,onFocus:l=>{l.preventDefault();let a,o=50;function p(){if(o--<=0){a&&cancelAnimationFrame(a);return}if(e()){if(cancelAnimationFrame(a),!r.current)return;n(!1);return}a=requestAnimationFrame(p)}a=requestAnimationFrame(p)}}):null}const ae=s.createContext(null);function Te(){return{groups:new Map,get(e,t){var n;let r=this.groups.get(e);r||(r=new Map,this.groups.set(e,r));let l=(n=r.get(t))!=null?n:0;r.set(t,l+1);let a=Array.from(r.keys()).indexOf(t);function o(){let p=r.get(t);p>1?r.set(t,p-1):r.delete(t)}return[a,o]}}}function Pe({children:e}){let t=s.useRef(Te());return s.createElement(ae.Provider,{value:t},e)}function se(e){let t=s.useContext(ae);if(!t)throw new Error("You must wrap your component in a <StableCollection>");let n=s.useId(),[r,l]=t.current.get(e,n);return s.useEffect(()=>l,[]),r}var we=(e=>(e[e.Forwards=0]="Forwards",e[e.Backwards=1]="Backwards",e))(we||{}),Ie=(e=>(e[e.Less=-1]="Less",e[e.Equal=0]="Equal",e[e.Greater=1]="Greater",e))(Ie||{}),ye=(e=>(e[e.SetSelectedIndex=0]="SetSelectedIndex",e[e.RegisterTab=1]="RegisterTab",e[e.UnregisterTab=2]="UnregisterTab",e[e.RegisterPanel=3]="RegisterPanel",e[e.UnregisterPanel=4]="UnregisterPanel",e))(ye||{});let Ee={0(e,t){var n;let r=U(e.tabs,i=>i.current),l=U(e.panels,i=>i.current),a=r.filter(i=>{var x;return!((x=i.current)!=null&&x.hasAttribute("disabled"))}),o={...e,tabs:r,panels:l};if(t.index<0||t.index>r.length-1){let i=W(Math.sign(t.index-e.selectedIndex),{[-1]:()=>1,0:()=>W(Math.sign(t.index),{[-1]:()=>0,0:()=>0,1:()=>1}),1:()=>0});if(a.length===0)return o;let x=W(i,{0:()=>r.indexOf(a[0]),1:()=>r.indexOf(a[a.length-1])});return{...o,selectedIndex:x===-1?e.selectedIndex:x}}let p=r.slice(0,t.index),P=[...r.slice(t.index),...p].find(i=>a.includes(i));if(!P)return o;let b=(n=r.indexOf(P))!=null?n:e.selectedIndex;return b===-1&&(b=e.selectedIndex),{...o,selectedIndex:b}},1(e,t){if(e.tabs.includes(t.tab))return e;let n=e.tabs[e.selectedIndex],r=U([...e.tabs,t.tab],a=>a.current),l=e.selectedIndex;return e.info.current.isControlled||(l=r.indexOf(n),l===-1&&(l=e.selectedIndex)),{...e,tabs:r,selectedIndex:l}},2(e,t){return{...e,tabs:e.tabs.filter(n=>n!==t.tab)}},3(e,t){return e.panels.includes(t.panel)?e:{...e,panels:U([...e.panels,t.panel],n=>n.current)}},4(e,t){return{...e,panels:e.panels.filter(n=>n!==t.panel)}}},z=s.createContext(null);z.displayName="TabsDataContext";function N(e){let t=s.useContext(z);if(t===null){let n=new Error(`<${e} /> is missing a parent <Tab.Group /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(n,N),n}return t}let V=s.createContext(null);V.displayName="TabsActionsContext";function X(e){let t=s.useContext(V);if(t===null){let n=new Error(`<${e} /> is missing a parent <Tab.Group /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(n,X),n}return t}function $e(e,t){return W(t.type,Ee,e,t)}let Fe="div";function ke(e,t){let{defaultIndex:n=0,vertical:r=!1,manual:l=!1,onChange:a,selectedIndex:o=null,...p}=e;const P=r?"vertical":"horizontal",b=l?"manual":"auto";let i=o!==null,x=q({isControlled:i}),A=G(t),[f,c]=s.useReducer($e,{info:x,selectedIndex:o??n,tabs:[],panels:[]}),O=s.useMemo(()=>({selectedIndex:f.selectedIndex}),[f.selectedIndex]),m=q(a||(()=>{})),y=q(f.tabs),h=s.useMemo(()=>({orientation:P,activation:b,...f}),[P,b,f]),g=C(d=>(c({type:1,tab:d}),()=>c({type:2,tab:d}))),E=C(d=>(c({type:3,panel:d}),()=>c({type:4,panel:d}))),$=C(d=>{F.current!==d&&m.current(d),i||c({type:0,index:d})}),F=q(i?e.selectedIndex:f.selectedIndex),j=s.useMemo(()=>({registerTab:g,registerPanel:E,change:$}),[]);K(()=>{c({type:0,index:o??n})},[o]),K(()=>{if(F.current===void 0||f.tabs.length<=0)return;let d=U(f.tabs,w=>w.current);d.some((w,S)=>f.tabs[S]!==w)&&$(d.indexOf(f.tabs[F.current]))});let J={ref:A};return R.createElement(Pe,null,R.createElement(V.Provider,{value:j},R.createElement(z.Provider,{value:h},h.tabs.length<=0&&R.createElement(ve,{onFocus:()=>{var d,w;for(let S of y.current)if(((d=S.current)==null?void 0:d.tabIndex)===0)return(w=S.current)==null||w.focus(),!0;return!1}}),H({ourProps:J,theirProps:p,slot:O,defaultTag:Fe,name:"Tabs"}))))}let Ce="div";function Ae(e,t){let{orientation:n,selectedIndex:r}=N("Tab.List"),l=G(t),a=s.useMemo(()=>({selectedIndex:r}),[r]);return H({ourProps:{ref:l,role:"tablist","aria-orientation":n},theirProps:e,slot:a,defaultTag:Ce,name:"Tabs.List"})}let Se="button";function Me(e,t){var n,r;let l=s.useId(),{id:a=`headlessui-tabs-tab-${l}`,disabled:o=!1,autoFocus:p=!1,...P}=e,{orientation:b,activation:i,selectedIndex:x,tabs:A,panels:f}=N("Tab"),c=X("Tab"),O=N("Tab"),m=s.useRef(null),y=G(m,t);K(()=>c.registerTab(m),[c,m]);let h=se("tabs"),g=A.indexOf(m);g===-1&&(g=h);let E=g===x,$=C(u=>{var I;let _=u();if(_===B.Success&&i==="auto"){let ce=(I=ge(m))==null?void 0:I.activeElement,Z=O.tabs.findIndex(de=>de.current===ce);Z!==-1&&c.change(Z)}return _}),F=C(u=>{let I=A.map(_=>_.current).filter(Boolean);if(u.key===v.Space||u.key===v.Enter){u.preventDefault(),u.stopPropagation(),c.change(g);return}switch(u.key){case v.Home:case v.PageUp:return u.preventDefault(),u.stopPropagation(),$(()=>M(I,T.First));case v.End:case v.PageDown:return u.preventDefault(),u.stopPropagation(),$(()=>M(I,T.Last))}if($(()=>W(b,{vertical(){return u.key===v.ArrowUp?M(I,T.Previous|T.WrapAround):u.key===v.ArrowDown?M(I,T.Next|T.WrapAround):B.Error},horizontal(){return u.key===v.ArrowLeft?M(I,T.Previous|T.WrapAround):u.key===v.ArrowRight?M(I,T.Next|T.WrapAround):B.Error}}))===B.Success)return u.preventDefault()}),j=s.useRef(!1),J=C(()=>{var u;j.current||(j.current=!0,(u=m.current)==null||u.focus({preventScroll:!0}),c.change(g),he(()=>{j.current=!1}))}),d=C(u=>{u.preventDefault()}),{isFocusVisible:w,focusProps:S}=re({autoFocus:p}),{isHovered:Y,hoverProps:le}=be({isDisabled:o}),{pressed:Q,pressProps:oe}=xe({disabled:o}),ue=s.useMemo(()=>({selected:E,hover:Y,active:Q,focus:w,autofocus:p,disabled:o}),[E,Y,w,Q,p,o]),ie=ne({ref:y,onKeyDown:F,onMouseDown:d,onClick:J,id:a,role:"tab",type:me(e,m),"aria-controls":(r=(n=f[g])==null?void 0:n.current)==null?void 0:r.id,"aria-selected":E,tabIndex:E?0:-1,disabled:o||void 0,autoFocus:p},S,le,oe);return H({ourProps:ie,theirProps:P,slot:ue,defaultTag:Se,name:"Tabs.Tab"})}let Re="div";function Ne(e,t){let{selectedIndex:n}=N("Tab.Panels"),r=G(t),l=s.useMemo(()=>({selectedIndex:n}),[n]);return H({ourProps:{ref:r},theirProps:e,slot:l,defaultTag:Re,name:"Tabs.Panels"})}let Oe="div",je=ee.RenderStrategy|ee.Static;function De(e,t){var n,r,l,a;let o=s.useId(),{id:p=`headlessui-tabs-panel-${o}`,tabIndex:P=0,...b}=e,{selectedIndex:i,tabs:x,panels:A}=N("Tab.Panel"),f=X("Tab.Panel"),c=s.useRef(null),O=G(c,t);K(()=>f.registerPanel(c),[f,c]);let m=se("panels"),y=A.indexOf(c);y===-1&&(y=m);let h=y===i,{isFocusVisible:g,focusProps:E}=re(),$=s.useMemo(()=>({selected:h,focus:g}),[h,g]),F=ne({ref:O,id:p,role:"tabpanel","aria-labelledby":(r=(n=x[y])==null?void 0:n.current)==null?void 0:r.id,tabIndex:h?P:-1},E);return!h&&((l=b.unmount)==null||l)&&!((a=b.static)!=null&&a)?R.createElement(te,{as:"span","aria-hidden":"true",...F}):H({ourProps:F,theirProps:b,slot:$,defaultTag:Oe,features:je,visible:h,name:"Tabs.Panel"})}let Ue=L(Me),We=L(ke),Le=L(Ae),Ge=L(Ne),He=L(De),D=Object.assign(Ue,{Group:We,List:Le,Panels:Ge,Panel:He});const _e=`import Web3 from 'web3';
const routerUrl = "http://127.0.0.1:3034/r/TOKEN"
const web3 = new Web3(
    new Web3.providers.HttpProvider(routerUrl),
);
`,qe=`import { ethers } from "ethers";
const routerUrl = "http://127.0.0.1:3034/r/TOKEN"
const provider = new ethers.providers.JsonRpcProvider(routerUrl);
`,Be=`curl http://127.0.0.1:3034/r/TOKEN \\
  -X POST \\
  -H "Content-Type: application/json" \\
  --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}'
`,Ke=`from web3 import Web3
routerUrl = "http://127.0.0.1:3034/r/TOKEN"
web3 = Web3(Web3.HTTPProvider(routerUrl))
`;function Xe(){return k.jsx(D.Group,{children:k.jsx("div",{className:"px-4 sm:px-0 mx-auto max-w-2xl sm:mx-0 sm:max-w-none",children:k.jsxs("div",{className:"sm:mt-4 overflow-hidden rounded-xl bg-gray-900 ring-1 ring-white/10",children:[k.jsx("div",{className:"flex bg-gray-800 ring-1 ring-white/5",children:k.jsx(D.List,{className:"-mb-px flex text-sm font-medium leading-6 text-gray-400",children:["web3.ts","ethers.ts","curl.sh","web3.py"].map(e=>k.jsx(D,{className:" border-r border-gray-600/10 px-4 py-2 outline-none ui-selected:bg-gray-900 ui-selected:text-white",children:e},e))})}),k.jsx(D.Panels,{children:[_e,qe,Be,Ke].map((e,t)=>k.jsx(D.Panel,{as:"pre",className:"text-xs px-6 pb-14 pt-6 text-white whitespace-prewrap",children:e},t))})]})})})}export{Xe as default};
