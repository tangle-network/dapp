import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{T as C}from"./Typography-BXoXAd7x.js";import{f as b,g as N}from"./ProposalBadge-aTrZS74o.js";import{g as i}from"./create-icon-BPUPqOkJ.js";import{C as w}from"./ChainIcon-MpKHrVma.js";import"./InformationLine-D6uBLwmF.js";import"./Spinner-C8gHa2rr.js";import"./Alert-CUeVEtwL.js";import"./StatusIndicator-BMH2ux_C.js";import{c as m}from"./index-BpvXyOxN.js";import{r as l}from"./index-C6mWTJJr.js";import{t as j}from"./bundle-mjs-D696Ktp4.js";const p=l.forwardRef(({className:c,value:o,displayValue:d,status:u,textClassName:h,disabled:r,placeholder:f="Select Chain",iconType:s,onClick:t,showChevron:g=!0,...T},x)=>{const y=s==="chain"?w:N,a=s==="token",v=l.useCallback(k=>{r||t===void 0||t(k)},[r,t]),n=t!==void 0&&!r;return e.jsx("button",{...T,onClick:v,type:"button",ref:x,className:j("rounded-lg px-4 py-3",!n&&"cursor-default",a?"bg-mono-40 dark:bg-mono-170":"bg-mono-20 dark:bg-mono-180",n&&(a?"hover:bg-mono-60 hover:dark:bg-mono-160":"hover:bg-mono-40 hover:dark:bg-mono-170"),c),children:e.jsxs("div",{className:"flex items-center justify-between mr-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[o&&e.jsx("div",{children:e.jsx(y,{status:u,size:"lg",spinnerSize:"md",className:m(`shrink-0 grow-0 ${i("xl")}`),name:o})}),e.jsx(C,{variant:"h5",fw:"bold",className:h,children:d??o??f})]}),!r&&g&&e.jsx(b,{size:"lg",className:m(`shrink-0 grow-0 ${i("lg")} ml-1`)})]})})});p.displayName="ChainOrTokenButton";p.__docgenInfo={description:"",methods:[],displayName:"ChainOrTokenButton",props:{placeholder:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Select Chain'",computed:!1}},iconClassName:{required:!1,tsType:{name:"string"},description:""},iconType:{required:!0,tsType:{name:"union",raw:"'chain' | 'token'",elements:[{name:"literal",value:"'chain'"},{name:"literal",value:"'token'"}]},description:""},displayValue:{required:!1,tsType:{name:"string"},description:""},showChevron:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},value:{required:!1,tsType:{name:"string"},description:"The text to display in the button"},status:{required:!1,tsType:{name:"StatusIndicatorProps['variant']",raw:"StatusIndicatorProps['variant']"},description:"The status of the button"},textClassName:{required:!1,tsType:{name:"string"},description:"The className of the chain name"},dropdownClassName:{required:!1,tsType:{name:"string"},description:"The className of the dropdown icon"}}};export{p as C};
