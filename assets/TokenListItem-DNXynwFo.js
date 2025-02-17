import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{y as j,g as v,j as N,E as I,R,u as q}from"./ProposalBadge-aTrZS74o.js";import"./create-icon-BPUPqOkJ.js";import"./ChainIcon-MpKHrVma.js";import"./InformationLine-D6uBLwmF.js";import"./Spinner-C8gHa2rr.js";import"./Alert-CUeVEtwL.js";import"./StatusIndicator-BMH2ux_C.js";import{r as o}from"./index-C6mWTJJr.js";import{T as l}from"./Typography-BXoXAd7x.js";import"./index.browser.esm-BZmtMS8Q.js";import{g as h}from"./getRoundedAmountString-DnoSM7dX.js";import{E as L}from"./index-VMVr2VZz.js";import{c as r}from"./index-BpvXyOxN.js";import{t as C}from"./bundle-mjs-D696Ktp4.js";import{I as B}from"./IconWithTooltip-zSSBUA4I.js";import{S as E}from"./SkeletonLoader-CAIZ8TWK.js";import{B as A}from"./Button-bTMyXnUe.js";import"./ChainOrTokenButton-B3p2-KpI.js";import"./IconButton-DI6br7aE.js";import"./LoadingPill-B9InIXuZ.js";import"./WalletButton-C4PPuQwO.js";import{L as P}from"./ListItem-DTjKuS8s.js";const f={green:{icon:r("fill-green-90 dark:fill-green-30"),wrapper:r("fill-green-10 dark:fill-green-120")},blue:{icon:r("fill-blue-90 dark:fill-blue-30"),wrapper:r("fill-blue-10 dark:fill-blue-120")},purple:{icon:r("fill-purpose-90 dark:fill-purpose-30"),wrapper:r("fill-purpose-10 dark:fill-purpose-120")},red:{icon:r("fill-red-90 dark:fill-red-30"),wrapper:r("fill-red-10 dark:fill-red-120")},yellow:{icon:r("fill-yellow-90 dark:fill-yellow-30"),wrapper:r("fill-yellow-10 dark:fill-yellow-120")}},b=o.forwardRef(({icon:n=e.jsx(j,{}),color:a="blue",...t},s)=>e.jsxs("svg",{...t,width:24,height:24,fill:"none",xmlns:"http://www.w3.org/2000/svg",ref:s,children:[e.jsx("rect",{width:24,height:24,rx:12,className:f[a].wrapper}),e.jsx("foreignObject",{x:4,y:4,width:16,height:16,children:o.cloneElement(n,{...n.props,className:C(n.props.className,f[a].icon),size:"md"})})]}));b.__docgenInfo={description:"",methods:[],displayName:"Badge",props:{icon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement<IconBase>",elements:[{name:"IconBase"}]},description:`The icon to be used in the badge.
@default <CheckboxBlankCircleLine />`,defaultValue:{value:"<CheckboxBlankCircleLine />",computed:!1}},color:{required:!1,tsType:{name:"union",raw:"'green' | 'blue' | 'purple' | 'red' | 'yellow'",elements:[{name:"literal",value:"'green'"},{name:"literal",value:"'blue'"},{name:"literal",value:"'purple'"},{name:"literal",value:"'red'"},{name:"literal",value:"'yellow'"}]},description:`The color of the badge.
@default 'blue'`,defaultValue:{value:"'blue'",computed:!1}}}};const S=({balance:n,balanceInUsd:a,subContent:t})=>e.jsxs("div",{children:[e.jsx(l,{ta:"right",variant:"h5",fw:"bold",children:h(n)}),typeof a=="number"?e.jsxs(l,{ta:"right",variant:"body3",fw:"semibold",className:"!text-mono-100",children:["$",h(a)]}):typeof t=="string"?e.jsx(l,{ta:"right",variant:"body3",fw:"semibold",className:"!text-mono-100",children:t}):null]}),_=({onClick:n})=>e.jsxs(e.Fragment,{children:[e.jsx(A,{variant:"link",onClick:n,size:"sm",className:"hidden group-hover:block",children:"Add to Wallet"}),e.jsx(l,{className:"block cursor-default group-hover:hidden",variant:"h5",fw:"bold",children:L})]}),U=({variant:n,children:a})=>{let t="blue",s;switch(n){case"warning":{t="yellow",s=e.jsx(q,{});break}default:{t="blue",s=e.jsx(R,{});break}}return e.jsx(B,{icon:e.jsx(b,{icon:s,color:t}),content:a})},z=o.forwardRef(({assetBadgeProps:n,assetBalanceProps:a,chainName:t,explorerUrl:s,isDisabled:d,name:g,onAddToken:y,symbol:u,tokenType:k="unshielded",isLoadingMetadata:T,...w},x)=>{const i=o.useRef(y),p=o.useMemo(()=>{if(typeof i.current=="function")return c=>{var m;c.stopPropagation(),(m=i.current)==null||m.call(i,c)}},[]);return e.jsxs(P,{...w,isDisabled:d,ref:x,children:[e.jsxs("div",{className:"flex items-center",children:[k==="unshielded"?e.jsx(v,{size:"lg",name:u,className:"mr-2"}):e.jsx(N,{chainName:t,size:"lg",className:"mr-2"}),e.jsxs("p",{children:[e.jsx(l,{component:"span",variant:"h5",fw:"bold",className:"block cursor-default",children:u}),e.jsxs(l,{component:"span",variant:"body1",fw:"bold",className:"cursor-default text-mono-100 dark:text-mono-80",children:[g," ",typeof s=="string"&&e.jsx("a",{href:s,target:"_blank",rel:"noreferrer noopener",className:"!text-inherit",onClick:c=>c.stopPropagation(),children:e.jsx(I,{className:"inline-block !fill-current"})})]})]})]}),typeof p=="function"&&!d?e.jsx(_,{onClick:p}):T?e.jsx(E,{size:"lg",className:"w-14"}):typeof a=="object"?e.jsx(S,{...a}):typeof n=="object"?e.jsx(U,{...n}):null]})});z.__docgenInfo={description:`TokenListItem component

Props:
- name: the name of the token
- symbol: the symbol of the token
- balance: the balance of the token
- onAddToken: callback when user hit the add token button

@example
\`\`\`tsx
<TokenListItem name="Ethereum" symbol="ETH" />
\`\`\``,methods:[],displayName:"TokenListItem",props:{id:{required:!0,tsType:{name:"string"},description:"The asset id"},name:{required:!0,tsType:{name:"string"},description:"The asset name"},symbol:{required:!0,tsType:{name:"string"},description:"The asset symbol (use to display the token logo)"},onAddToken:{required:!1,tsType:{name:"ReactComponentPropsWithoutRef['onClick']",raw:"PropsOf<'button'>['onClick']"},description:"Callback when user hit the add token button"},tokenType:{required:!1,tsType:{name:"union",raw:"'shielded' | 'unshielded'",elements:[{name:"literal",value:"'shielded'"},{name:"literal",value:"'unshielded'"}]},description:`The token type
@default 'unshielded'`,defaultValue:{value:"'unshielded'",computed:!1}},isLoadingMetadata:{required:!1,tsType:{name:"boolean"},description:"Boolean to indicate if the token metadata (balance, price) is loading"},assetBalanceProps:{required:!1,tsType:{name:"intersection",raw:`{
  /**
   * The asset balance of user
   */
  balance: number;

  /**
   * The asset balance in USD
   */
  balanceInUsd?: number;
} & {
  /**
   * The asset balance of user
   */
  balance: number;

  /**
   * The sub content below the balance
   */
  subContent?: string;
}`,elements:[{name:"signature",type:"object",raw:`{
  /**
   * The asset balance of user
   */
  balance: number;

  /**
   * The asset balance in USD
   */
  balanceInUsd?: number;
}`,signature:{properties:[{key:"balance",value:{name:"number",required:!0},description:"The asset balance of user"},{key:"balanceInUsd",value:{name:"number",required:!1},description:"The asset balance in USD"}]}},{name:"signature",type:"object",raw:`{
  /**
   * The asset balance of user
   */
  balance: number;

  /**
   * The sub content below the balance
   */
  subContent?: string;
}`,signature:{properties:[{key:"balance",value:{name:"number",required:!0},description:"The asset balance of user"},{key:"subContent",value:{name:"string",required:!1},description:"The sub content below the balance"}]}}]},description:`The asset balance props
@type {AssetBalanceType}`},assetBadgeProps:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  /**
   * The badge variant
   */
  variant: 'info' | 'warning';

  /**
   * The badge content
   */
  children: React.ReactNode;
}`,signature:{properties:[{key:"variant",value:{name:"union",raw:"'info' | 'warning'",elements:[{name:"literal",value:"'info'"},{name:"literal",value:"'warning'"}],required:!0},description:"The badge variant"},{key:"children",value:{name:"ReactReactNode",raw:"React.ReactNode",required:!0},description:"The badge content"}]}},description:`The asset badge props
@type {AssetBadgeInfoType}`},chainName:{required:!1,tsType:{name:"string"},description:"The chain name of the asset (use to display the chain logo)"},explorerUrl:{required:!1,tsType:{name:"string"},description:"The asset explorer url"}}};export{z as T};
