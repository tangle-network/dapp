import{j as t}from"./jsx-runtime-BbjHj44Y.js";import{r as m}from"./index-C6mWTJJr.js";import{t as o}from"./bundle-mjs-D696Ktp4.js";import{T as i}from"./Typography-BXoXAd7x.js";import{T as p}from"./TitleWithInfo-TkXT9seP.js";import{E as l}from"./index-VMVr2VZz.js";const f=m.forwardRef(({className:r,leftTextProps:e,rightContent:n,...s},a)=>t.jsxs("div",{...s,className:o("flex items-center justify-between",r),ref:a,children:[t.jsx(p,{...e,variant:e.variant??"utility",className:o("text-mono-100 dark:text-mono-80",e.className)}),n?typeof n=="string"?t.jsx(i,{variant:"body1",fw:"bold",className:"capitalize text-mono-180 dark:text-mono-80",children:n}):null:t.jsx(i,{variant:"body1",fw:"bold",className:"text-mono-180 dark:text-mono-80",children:l})]}));f.__docgenInfo={description:`The \`InfoItem\` component

Props:

- \`leftTextProps\`: The left text props (props of TitleWithInfo component)
- \`rightContent\`: Right-sided content

@example

\`\`\`jsx
  <InfoItem
    leftTextProps={{
     title: 'Depositing',
     variant: 'utility',
     info: 'Depositing',
    }}
   rightContent={amount}
 />
\`\`\``,methods:[],displayName:"InfoItem",props:{leftTextProps:{required:!0,tsType:{name:"ComponentProps",elements:[{name:"TitleWithInfo"}],raw:"ComponentProps<typeof TitleWithInfo>"},description:`The left text props (props of TitleWithInfo component)
@default { variant: 'utility' }`},rightContent:{required:!1,tsType:{name:"union",raw:"string | ReactElement",elements:[{name:"string"},{name:"ReactElement"}]},description:"Right content"}}};export{f as I};
