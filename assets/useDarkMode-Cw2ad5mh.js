import{r}from"./index-C6mWTJJr.js";import{u as m}from"./useLocalStorageState-Bkbv-WOc.js";function s(){return typeof window<"u"&&typeof window.document<"u"}function l(o="dark"){const[e,t]=m("theme",{defaultValue:o}),d=r.useMemo(()=>e==="dark",[e]);r.useEffect(()=>{s()&&(e==="dark"||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark"))},[e]),r.useEffect(()=>t(o),[o,t]);const n=r.useCallback(c=>{if(!s())return;const a=c??e==="dark"?"light":"dark";if(a!==e){switch(a){case"dark":{document.documentElement.classList.add("dark");break}case"light":{document.documentElement.classList.remove("dark");break}}t(a)}},[e,t]);return[d,n]}export{l as u};
