import{j as u}from"./jsx-runtime.Yf6r0-8m.js";import{r as s}from"./index.DoDIQzXB.js";const l=["down","lagging","timing out","giving errors","unreachable"];function f(){const[e,o]=s.useState(l[0]),[n,a]=s.useState(!1),[r,m]=s.useState(0);return s.useEffect(()=>{let t;return n?e.length>0?t=setTimeout(()=>{o(i=>i.slice(0,-1))},20):(a(!1),m(i=>(i+1)%l.length)):e!==l[r]?t=setTimeout(()=>{o(l[r].slice(0,e.length+1))},40):t=setTimeout(()=>{a(!0)},2e3),()=>clearTimeout(t)},[e,n,r]),u.jsx("span",{children:e||" "})}export{f as default};