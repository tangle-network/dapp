import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{i as k}from"./isPrimitive-wBktTf-i.js";import{j as b,g as y,f as T}from"./ProposalBadge-aTrZS74o.js";import{g as s}from"./create-icon-BPUPqOkJ.js";import"./ChainIcon-MpKHrVma.js";import"./InformationLine-D6uBLwmF.js";import"./Spinner-C8gHa2rr.js";import"./Alert-CUeVEtwL.js";import"./StatusIndicator-BMH2ux_C.js";import{c as w}from"./index-BpvXyOxN.js";import{r as l}from"./index-C6mWTJJr.js";import{t}from"./bundle-mjs-D696Ktp4.js";import{T as x}from"./Typography-BXoXAd7x.js";const v=l.forwardRef(({children:o,className:n,isDisabled:d,isActive:m,Icon:r,tokenType:c="unshielded",placeholder:a="Select token",isDropdown:p=!0,...u},h)=>{const f=l.useMemo(()=>t(w("group px-4 py-2 rounded-full","flex items-center gap-1 max-w-fit","border border-mono-100 dark:border-mono-140","bg-mono-40 dark:bg-mono-170","enabled:hover:bg-mono-60 enabled:hover:dark:bg-mono-160","disabled:bg-[#E2E5EB]/20 dark:disabled:bg-[#3A3E53]/70"),n),[n]),g=m||d,i=c==="shielded"?e.jsx(b,{displayPlaceholder:typeof o>"u",size:"lg",className:t("shrink-0 grow-0",s("lg"))}):typeof o=="string"?e.jsx(y,{name:o.toLowerCase(),size:"lg",className:t("shrink-0 grow-0",s("lg"))}):r||null;return e.jsxs("button",{...u,disabled:g,className:f,ref:h,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[i!==null&&e.jsx("div",{children:i}),k(o)?e.jsx(x,{variant:"h5",fw:"bold",component:"span",className:"block whitespace-nowrap text-mono-200 dark:text-mono-40",children:o||a}):o||a]}),p&&e.jsx(T,{size:"lg",className:t("group-disabled:hidden","fill-mono-120 dark:fill-mono-100","shrink-0 grow-0",s("lg"))})]})});v.__docgenInfo={description:`The TokenSelector component

Props:
- children: the token symbol to display and render token icon
- className: the className to override styling
- isDisabled: whether the selector is disabled
- isActive: whether the selector is active
- tokenType: the token type to display (unshielded or shielded default: unshielded)

@example
\`\`\`jsx
 <TokenSelector />
 <TokenSelector isDisabled />
 <TokenSelector>WETH</TokenSelector>
\`\`\``,methods:[],displayName:"TokenSelector",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},Icon:{required:!1,tsType:{name:"ReactElement"},description:""},tokenType:{required:!1,tsType:{name:"union",raw:"'shielded' | 'unshielded'",elements:[{name:"literal",value:"'shielded'"},{name:"literal",value:"'unshielded'"}]},description:`The token type
@default 'unshielded'`,defaultValue:{value:"'unshielded'",computed:!1}},isActive:{required:!1,tsType:{name:"boolean"},description:"If `true`, the component will display as disable state"},isDisabled:{required:!1,tsType:{name:"boolean"},description:"If `true`, the component will display as disable state"},placeholder:{required:!1,tsType:{name:"ReactNode"},description:`The placeholder for the component
when the children is not provided
@default 'Select token'`,defaultValue:{value:"'Select token'",computed:!1}},isDropdown:{required:!1,tsType:{name:"boolean"},description:`Boolean indicate to render the dropdown chevron icon
@default true`,defaultValue:{value:"true",computed:!1}}},composes:["Omit"]};export{v as T};
