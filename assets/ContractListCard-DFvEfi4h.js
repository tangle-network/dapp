import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{r as i}from"./index-C6mWTJJr.js";import{k as g,E as k}from"./ProposalBadge-aTrZS74o.js";import"./create-icon-BPUPqOkJ.js";import"./ChainIcon-MpKHrVma.js";import"./InformationLine-D6uBLwmF.js";import"./Spinner-C8gHa2rr.js";import"./Alert-CUeVEtwL.js";import"./StatusIndicator-BMH2ux_C.js";import{L as j,S as y}from"./ListCardWrapper-0Mq64WGO.js";import{T as p}from"./Typography-BXoXAd7x.js";import{S as m}from"./SkeletonLoader-CAIZ8TWK.js";import{I as b}from"./Input-oMzDo86x.js";import{L as w}from"./ListItem-DTjKuS8s.js";import"./index.browser.esm-BZmtMS8Q.js";import"./index-VMVr2VZz.js";import{s as L}from"./shortenHex-B699xSHv.js";import{s as S}from"./shortenString-JLwGCdNy.js";import{i as v}from"./isHex-DRjArRUf.js";const T=i.forwardRef(({isLoading:n,selectContractItems:s,...d},u)=>{const[t,x]=i.useState(""),h=i.useMemo(()=>s.filter(r=>{var o;return r.name.toLowerCase().includes(t.toLowerCase())||r.address.toLowerCase().includes(t.toLowerCase())||((o=r.blockExplorerUrl)==null?void 0:o.toLowerCase().includes(t.toLowerCase()))}),[s,t]);return e.jsxs(j,{title:"Select Contract",hideCloseButton:!0,...d,ref:u,children:[e.jsx("div",{className:"py-4",children:e.jsx(b,{id:"contract",rightIcon:e.jsx(g,{}),placeholder:"Search contracts",value:t,onChange:r=>x(r.toString()),isDisabled:n||s.length===0})}),e.jsxs(y,{className:"lg:min-w-[350px] h-[376px]",children:[n&&e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{size:"xl"}),e.jsx(m,{size:"xl"})]}),!n&&e.jsx("ul",{className:"py-2",children:h.map((r,o)=>{const{name:f,address:a,blockExplorerUrl:c,onSelectContract:l}=r;return e.jsxs(w,{className:"flex justify-between",onClick:()=>{l&&l()},children:[e.jsxs("div",{children:[e.jsx(p,{component:"span",variant:"h5",fw:"bold",className:"block cursor-default",children:f}),e.jsx(p,{component:"span",variant:"body1",fw:"bold",className:"cursor-default text-mono-100 dark:text-mono-80",children:v(a)?L(a):S(a)})]}),typeof c=="string"&&e.jsx("a",{href:c,target:"_blank",rel:"noreferrer noopener",className:"!text-inherit",onClick:C=>C.stopPropagation(),children:e.jsx(k,{className:"inline-block !fill-current"})})]},o)})})]})]})});T.__docgenInfo={description:"",methods:[],displayName:"ContractListCard",props:{selectContractItems:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  /**
   * The contract name
   */
  name: string;
  /**
   * The contract address
   */
  address: string;
  /**
   * The contract block explorer url (optional)
   */
  blockExplorerUrl?: string;

  /**
   * Callback when user hit a contract item
   */
  onSelectContract?: () => void;
}`,signature:{properties:[{key:"name",value:{name:"string",required:!0},description:"The contract name"},{key:"address",value:{name:"string",required:!0},description:"The contract address"},{key:"blockExplorerUrl",value:{name:"string",required:!1},description:"The contract block explorer url (optional)"},{key:"onSelectContract",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!1},description:"Callback when user hit a contract item"}]}}],raw:"ContractType[]"},description:""},isLoading:{required:!1,tsType:{name:"boolean"},description:""}},composes:["Omit"]};export{T as C};
