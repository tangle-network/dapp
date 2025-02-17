import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{A as O}from"./react-icons.esm-Bsp6uUW8.js";import{c as U}from"./chain-config-ChLUb0m2.js";import{E as R,j as z,g as L}from"./ProposalBadge-aTrZS74o.js";import"./create-icon-BPUPqOkJ.js";import"./ChainIcon-MpKHrVma.js";import"./InformationLine-D6uBLwmF.js";import"./Spinner-C8gHa2rr.js";import"./Alert-CUeVEtwL.js";import{S as M}from"./StatusIndicator-BMH2ux_C.js";import{D as A}from"./decimal-A899wnYr.js";import{r as m}from"./index-C6mWTJJr.js";import{t as y}from"./bundle-mjs-D696Ktp4.js";import{T as w}from"./Typography-BXoXAd7x.js";import{A as W}from"./AddressChip-DtrHZX5v.js";import{C as $}from"./ChainChip-CLA7S5MZ.js";import{C as Y}from"./Chip-CU1xpYxs.js";import{S as K}from"./SteppedProgress-CT562l7T.js";import{T as V}from"./TitleWithInfo-TkXT9seP.js";const h=60,f=h*60,p=f*24,g=p*7,E=p*30,_=p*365;function B(o){const t=new Date(o);if(!Number.isNaN(t.valueOf()))return t;const r=String(o).match(/\d+/g);if(r==null||r.length<=2)return t;{const[a,s,...i]=r.map(v=>parseInt(v)),[d,l,u,c,n,T,x]=[a,s-1,...i];return new Date(Date.UTC(d,l,u,c,n,T,x))}}function F(o,t,r){const a=o!==1?t+"s":t;return o+" "+a+" "+r}const G=o=>{const{date:t,live:r=!0,maxPeriod:a=g,minPeriod:s=0,now:i=()=>Date.now(),formatter:d=F}=o,[l,u]=m.useState(i());m.useEffect(()=>{const I=(()=>{const D=B(t).valueOf();if(!D)return console.warn("Invalid Date provided"),0;const b=Math.round(Math.abs(l-D)/1e3),H=b<h?1e3:b<f?1e3*h:b<p?1e3*f:1e3*g,C=Math.min(Math.max(H,s*1e3),a*1e3);return C?setTimeout(()=>{u(i())},C):0})();return()=>{I&&clearTimeout(I)}},[t,r,a,s,i,l]);const c=B(t).valueOf();if(!c)return null;const n=Math.round(Math.abs(l-c)/1e3),T=c<l?"ago":"from now",[x,k]=n<h?[Math.round(n),"second"]:n<f?[Math.round(n/h),"minute"]:n<p?[Math.round(n/f),"hour"]:n<g?[Math.round(n/p),"day"]:n<E?[Math.round(n/g),"week"]:n<_?[Math.round(n/E),"month"]:[Math.round(n/_),"year"],v=F.bind(null,x,k,T);return d(x,k,T,c,v,i)},N=m.forwardRef(({className:o,children:t,...r},a)=>e.jsx("div",{...r,ref:a,className:y("w-full max-w-lg rounded-lg p-4","bg-mono-0 dark:bg-mono-180",o),children:t}));N.displayName="TxProgressorRoot";const J=o=>{switch(o){case"Deposit":return"green";case"Transfer":return"purple";case"Withdraw":return"yellow";case"Bridge":return"purple";default:return"dark-grey"}},P=m.forwardRef(({className:o,children:t,name:r,createdAt:a=Date.now(),...s},i)=>{const d=G({date:a});return e.jsxs("div",{...s,ref:i,className:y("flex items-center justify-between",o),children:[e.jsx(Y,{color:J(r),children:r}),e.jsx(w,{variant:"body2",className:"text-mono-120 dark:text-mono-100",children:d})]})});P.displayName="TxProgressorHeader";const j=({accountType:o="wallet",amount:t,className:r,tokenSymbol:a,tokenType:s="unshielded",typedChainId:i,isSource:d,walletAddress:l,tooltipContent:u,...c})=>{const n=U[i];return n?e.jsxs("div",{...c,className:y("space-y-2",r),children:[e.jsx(V,{title:d?"Source Chain":"Destination Chain",variant:"utility",titleClassName:"text-mono-120 dark:text-mono-80",className:"text-mono-120 dark:text-mono-80"}),e.jsxs("div",{className:"flex flex-col gap-2 md:flex-row md:items-center",children:[e.jsx($,{className:"px-2 py-1",chainName:n.name,chainType:n.group}),l&&e.jsx(W,{address:l,isNoteAccount:o==="note"})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsxs(w,{variant:"h5",fw:"semibold",className:"text-mono-200 dark:text-mono-0",children:[e.jsx("b",{children:t.greaterThan(new A(0))?`+${t.toDecimalPlaces(4).toString()}`:t.lessThan(new A(0))?`-${t.abs().toDecimalPlaces(4).toString()}`:`${t.toDecimalPlaces(4).toString()}`})," ",a]}),s==="shielded"?e.jsx(z,{size:"lg"}):e.jsx(L,{name:a,size:"lg"})]})]}):null};j.displayName="TxProgressorBodyItem";const S=m.forwardRef(({className:o,txSourceInfo:t,txDestinationInfo:r,...a},s)=>e.jsxs("div",{...a,ref:s,className:y("flex items-center justify-between",o),children:[e.jsx(j,{...t,isSource:!0}),e.jsx(O,{className:"w-5 h-5"}),e.jsx(j,{...r})]}));S.displayName="TxProgressorBody";const q=m.forwardRef(({className:o,status:t,steppedProgressProps:r,statusMessage:a,externalUrl:s,destinationTxStatus:i,destinationTxStatusMessage:d,destinationTxExplorerUrl:l,actionCmp:u,...c},n)=>e.jsxs("div",{...c,ref:n,className:y("mt-4 space-y-3",o),children:[r&&e.jsx(K,{...r}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{className:"flex items-center justify-between gap-1",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(M,{animated:!0,size:14,variant:t}),a&&e.jsx(w,{variant:"body1",component:"span",className:"inline-block",children:a}),s&&e.jsx("a",{href:s.toString(),rel:"noopener noreferrer",target:"_blank",children:e.jsx(R,{})})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[i&&e.jsx(M,{animated:!0,size:14,variant:i}),d&&e.jsx(w,{variant:"body1",component:"span",className:"inline-block",children:d}),l&&e.jsx("a",{href:l.toString(),rel:"noopener noreferrer",target:"_blank",children:e.jsx(R,{})})]})]}),u??null]})]}));q.displayName="TxProgressorFooter";const Te=Object.assign({},{Root:N,Header:P,Body:S,Footer:q});S.__docgenInfo={description:"",methods:[],displayName:"TxProgressorBody",props:{txSourceInfo:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  /**
   * The typed chain id to display
   * the chain info
   */
  typedChainId: number;

  /**
   * The wallet address to display
   */
  walletAddress?: string;

  /**
   * The account type to display
   * @default 'wallet'
   */
  accountType?: 'wallet' | 'note';

  /**
   * The amount of the transaction to display
   */
  amount: Decimal;

  /**
   * The token symbol to display the token info
   */
  tokenSymbol: string;

  /**
   * The token type to display the token icon or shielded icon
   * @default 'unshielded'
   */
  tokenType?: TokenType;

  /**
   * The isSource flag to display the source info
   */
  isSource?: boolean;

  /**
   * The text for the tooltip
   */
  tooltipContent?: string;
}`,signature:{properties:[{key:"typedChainId",value:{name:"number",required:!0},description:`The typed chain id to display
the chain info`},{key:"walletAddress",value:{name:"string",required:!1},description:"The wallet address to display"},{key:"accountType",value:{name:"union",raw:"'wallet' | 'note'",elements:[{name:"literal",value:"'wallet'"},{name:"literal",value:"'note'"}],required:!1},description:`The account type to display
@default 'wallet'`},{key:"amount",value:{name:"Decimal",required:!0},description:"The amount of the transaction to display"},{key:"tokenSymbol",value:{name:"string",required:!0},description:"The token symbol to display the token info"},{key:"tokenType",value:{name:"union",raw:"'shielded' | 'unshielded'",elements:[{name:"literal",value:"'shielded'"},{name:"literal",value:"'unshielded'"}],required:!1},description:`The token type to display the token icon or shielded icon
@default 'unshielded'`},{key:"isSource",value:{name:"boolean",required:!1},description:"The isSource flag to display the source info"},{key:"tooltipContent",value:{name:"string",required:!1},description:"The text for the tooltip"}]}},description:`The source info of the transaction
@type {TxInfo}`},txDestinationInfo:{required:!0,tsType:{name:"signature",type:"object",raw:`{
  /**
   * The typed chain id to display
   * the chain info
   */
  typedChainId: number;

  /**
   * The wallet address to display
   */
  walletAddress?: string;

  /**
   * The account type to display
   * @default 'wallet'
   */
  accountType?: 'wallet' | 'note';

  /**
   * The amount of the transaction to display
   */
  amount: Decimal;

  /**
   * The token symbol to display the token info
   */
  tokenSymbol: string;

  /**
   * The token type to display the token icon or shielded icon
   * @default 'unshielded'
   */
  tokenType?: TokenType;

  /**
   * The isSource flag to display the source info
   */
  isSource?: boolean;

  /**
   * The text for the tooltip
   */
  tooltipContent?: string;
}`,signature:{properties:[{key:"typedChainId",value:{name:"number",required:!0},description:`The typed chain id to display
the chain info`},{key:"walletAddress",value:{name:"string",required:!1},description:"The wallet address to display"},{key:"accountType",value:{name:"union",raw:"'wallet' | 'note'",elements:[{name:"literal",value:"'wallet'"},{name:"literal",value:"'note'"}],required:!1},description:`The account type to display
@default 'wallet'`},{key:"amount",value:{name:"Decimal",required:!0},description:"The amount of the transaction to display"},{key:"tokenSymbol",value:{name:"string",required:!0},description:"The token symbol to display the token info"},{key:"tokenType",value:{name:"union",raw:"'shielded' | 'unshielded'",elements:[{name:"literal",value:"'shielded'"},{name:"literal",value:"'unshielded'"}],required:!1},description:`The token type to display the token icon or shielded icon
@default 'unshielded'`},{key:"isSource",value:{name:"boolean",required:!1},description:"The isSource flag to display the source info"},{key:"tooltipContent",value:{name:"string",required:!1},description:"The text for the tooltip"}]}},description:`The destination info of the transaction
@type {TxInfo}`}}};q.__docgenInfo={description:"",methods:[],displayName:"TxProgressorFooter",props:{steppedProgressProps:{required:!1,tsType:{name:"SteppedProgressProps"},description:"The stepped progress props to display the progress bar component"},status:{required:!1,tsType:{name:"StatusIndicatorProps['variant']",raw:"StatusIndicatorProps['variant']"},description:`The status of the transaction
@default 'info'`},statusMessage:{required:!1,tsType:{name:"string"},description:`The status message of the transaction
to describe the current status`},externalUrl:{required:!1,tsType:{name:"URL"},description:"The external url to display the external link"},actionCmp:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:"The action props to display the action button"},destinationTxStatus:{required:!1,tsType:{name:"StatusIndicatorProps['variant']",raw:"StatusIndicatorProps['variant']"},description:`The destination tx status of the transaction
@default 'info'`},destinationTxStatusMessage:{required:!1,tsType:{name:"string"},description:`The destination tx status message of the transaction
to describe the current status`},destinationTxExplorerUrl:{required:!1,tsType:{name:"URL"},description:"The destination tx explorer url to display the external link"}}};P.__docgenInfo={description:"",methods:[],displayName:"TxProgressorHeader",props:{name:{required:!0,tsType:{name:"string"},description:"The name of the transaction"},createdAt:{required:!1,tsType:{name:"union",raw:"Date | number",elements:[{name:"Date"},{name:"number"}]},description:`Created time of the transaction
@default Date.now()`,defaultValue:{value:"Date.now()",computed:!0}}}};N.__docgenInfo={description:"",methods:[],displayName:"TxProgressorRoot"};export{Te as T};
