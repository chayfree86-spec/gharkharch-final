import{a as e}from"./rolldown-runtime-Cyuzqnbw.js";import{en as t,rn as n}from"./vendor-core-cXKndpIn.js";var r=e(n(),1),i=t();function a({src:e,name:t,className:n=`h-10 w-10`,active:a=!0}){let[o,s]=(0,r.useState)(!1),c=e=>{let t=e.trim().split(/\s+/);return t.length===0||!t[0]?`?`:t.length===1?t[0].charAt(0).toUpperCase():(t[0].charAt(0)+t[t.length-1].charAt(0)).toUpperCase()},l=e=>{let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 55%, 42%)`},u=c(t),d=l(t);return!e||o?(0,i.jsx)(`div`,{className:`rounded-full flex items-center justify-center font-black text-white shadow-sm flex-shrink-0 text-xs border border-white/20 select-none transition-all duration-300
          ${n}
          ${a?``:`grayscale opacity-60`}
        `,style:{backgroundColor:d},title:t,children:u}):(0,i.jsx)(`img`,{src:e,alt:t,onError:()=>s(!0),referrerPolicy:`no-referrer`,className:`rounded-full object-cover flex-shrink-0 transition-all duration-300
        ${n}
        ${a?``:`grayscale opacity-60`}
      `})}export{a as t};