import{d as O}from"./index-DrFu-skq.js";import"./index-C6mWTJJr.js";import"./_commonjsHelpers-BosuxZz1.js";const{useParameter:f,addons:S,useEffect:R,useMemo:B}=__STORYBOOK_MODULE_PREVIEW_API__,{deprecate:v}=__STORYBOOK_MODULE_CLIENT_LOGGER__;var L=Object.defineProperty,M=(e,t)=>{for(var r in t)L(e,r,{get:t[r],enumerable:!0})},a="themes",P=`storybook/${a}`,g="theme",_={},A={REGISTER_THEMES:`${P}/REGISTER_THEMES`},D={};M(D,{initializeThemeState:()=>h,pluckThemeFromContext:()=>d,useThemeParameters:()=>I});function d({globals:e}){return e[g]||""}function I(e){return v(O`The useThemeParameters function is deprecated. Please access parameters via the context directly instead e.g.
    - const { themeOverride } = context.parameters.themes ?? {};
    `),e?e.parameters[a]??_:f(a,_)}function h(e,t){S.getChannel().emit(A.REGISTER_THEMES,{defaultTheme:t,themes:e})}var N="html",T=e=>e.split(" ").filter(Boolean),k=({themes:e,defaultTheme:t,parentSelector:r=N})=>(h(Object.keys(e),t),(u,o)=>{let{themeOverride:m}=o.parameters[a]??{},n=d(o);return R(()=>{let c=m||n||t,s=document.querySelector(r);if(!s)return;Object.entries(e).filter(([E])=>E!==c).forEach(([E,p])=>{let l=T(p);l.length>0&&s.classList.remove(...l)});let i=T(e[c]);i.length>0&&s.classList.add(...i)},[m,n]),u()});const y={controls:{expanded:!0,matchers:{color:/(background|color)$/i,date:/Date$/}}},C=[k({themes:{light:"",dark:"dark"},defaultTheme:"light"})],H={decorators:C,parameters:y,tags:["autodocs"]};export{C as decorators,H as default,y as parameters};
