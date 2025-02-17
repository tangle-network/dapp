import{j as r}from"./jsx-runtime-BbjHj44Y.js";import{r as t}from"./index-C6mWTJJr.js";import{t as x}from"./bundle-mjs-D696Ktp4.js";import{S as h}from"./index-VMVr2VZz.js";import{T as d}from"./Typography-BXoXAd7x.js";import{B as u}from"./Button-bTMyXnUe.js";import"./ChainOrTokenButton-B3p2-KpI.js";import"./IconButton-DI6br7aE.js";import"./LoadingPill-B9InIXuZ.js";import"./WalletButton-C4PPuQwO.js";const v=h.telegram,T=`${h.github}/dapp/issues/new/choose`,R=t.forwardRef(({buttons:o,className:m,contactUsLinkProps:s,description:a,refreshPageButtonProps:i,reportIssueButtonProps:p,title:f="Oops something went wrong.",...g},b)=>{const[l,y]=t.useState(!1),w=t.useMemo(()=>a||["Please either refresh the page or try again later.",{noWrapper:!1,children:r.jsxs("span",{className:"inline-block w-9/12 mx-auto",children:["If the issue persists, please"," ",r.jsx(u,{href:v,target:"_blank",...s,variant:"link",className:"inline-block",children:"contact us"})," ","or report the issue."]})}],[s,a]),c=t.useCallback(()=>{localStorage.clear(),y(!0)},[]),k=t.useMemo(()=>{if(o)return o;const e={className:"px-3 py-2 rounded-lg",size:"sm"};return[{onClick:()=>window.location.reload(!0),...i,...e,variant:"primary",children:"Reload page"},{onClick:c,...e,variant:"secondary",children:"Clear cache",isDisabled:l},{href:T,target:"_blank",...p,...e,variant:"secondary",children:"Report issue"}]},[o,c,l,i,p]);return r.jsxs("div",{...g,className:x("bg-mono-0 dark:bg-mono-180 p-6 rounded-lg","max-w-xl space-y-4 mx-auto",m),ref:b,children:[r.jsx(d,{variant:"h4",fw:"bold",ta:"center",children:f}),r.jsx("div",{className:"space-y-2",children:w.map((e,n)=>typeof e=="string"||!e.noWrapper?r.jsx(d,{className:"w-3/4 mx-auto",variant:"body1",ta:"center",fw:"semibold",children:typeof e=="string"?e:e.children},n):r.jsx(t.Fragment,{children:e.children},n))}),r.jsx("div",{className:"flex items-center justify-center gap-2",children:k.map((e,n)=>r.jsx(u,{...e},n))})]})});R.__docgenInfo={description:"The `ErrorFallback` component, used to display an error message when an UI error occurs.\n\n- `title`: The error title to display (default is \"Oops something went wrong.)\n- `description`: The error description to display, can be a string or a react element (string with links, etc.). When noWrapper is true, the children will be rendered without a wrapper (`<Typography />`)\n- `buttons`: The button prop list for displaying the buttons in the error fallback component. if not provided, the default button will be rendered (refresh page and report issue)\n- `contactUsLinkProps`: Contact us link props, for overriding the default props\n- `refreshPageButtonProps`: Refresh page button props for overriding the default props\n- `reportIssueButtonProps`: Report issue button props for overriding the default props\n\n```jsx\n <ErrorFallback className='mr-3' />\n <ErrorFallback\n   title='An error occurred'\n   description='Please refresh the page or try again later.'\n />\n```",methods:[],displayName:"ErrorFallback",props:{title:{required:!1,tsType:{name:"string"},description:`The error title to display
@default "Oops something went wrong."`,defaultValue:{value:"'Oops something went wrong.'",computed:!1}},description:{required:!1,tsType:{name:"Array",elements:[{name:"union",raw:"string | { noWrapper: boolean; children: ReactElement }",elements:[{name:"string"},{name:"signature",type:"object",raw:"{ noWrapper: boolean; children: ReactElement }",signature:{properties:[{key:"noWrapper",value:{name:"boolean",required:!0}},{key:"children",value:{name:"ReactElement",required:!0}}]}}]}],raw:"Array<string | { noWrapper: boolean; children: ReactElement }>"},description:"The error description to display,\ncan be a string or a react element (string with links, etc.).\nWhen noWrapper is true, the children will be rendered without a wrapper (`<Typography />`)"},buttons:{required:!1,tsType:{name:"Array",elements:[{name:"ButtonProps"}],raw:"Array<ButtonProps>"},description:`The button prop list for displaying the buttons in the error fallback component.
if not provided, the default button will be rendered
(refresh page and report issue)`},contactUsLinkProps:{required:!1,tsType:{name:"ButtonProps"},description:"Contact us link props"},refreshPageButtonProps:{required:!1,tsType:{name:"ButtonProps"},description:"Refresh page button props"},reportIssueButtonProps:{required:!1,tsType:{name:"ButtonProps"},description:"Report issue button props"}}};export{R as E};
