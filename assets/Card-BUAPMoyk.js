import{j as l}from"./jsx-runtime-BbjHj44Y.js";import{r as i}from"./index-C6mWTJJr.js";import{t as c}from"./bundle-mjs-D696Ktp4.js";var r=(e=>(e[e.DEFAULT=0]="DEFAULT",e[e.GLASS=1]="GLASS",e))(r||{});const m=e=>{switch(e){case r.GLASS:return"p-6 rounded-2xl border border-mono-0 dark:border-mono-160 bg-glass dark:bg-glass_dark";case r.DEFAULT:return""}},p=i.forwardRef(({children:e,className:a,withShadow:o=!1,tightPadding:n=!1,variant:t=r.DEFAULT,...s},d)=>l.jsx("div",{...s,className:c("rounded-xl","bg-mono-0 dark:bg-mono-200","border border-mono-60 dark:border-mono-170",o&&"shadow-tangle",n?"p-3":"p-6",m(t),a),ref:d,children:e}));p.__docgenInfo={description:`Sets up styles, and spacing vertically between \`block\` components.

@example

\`\`\`jsx
 <Card>
   ...
 </Card>

<Card>
  <TitleWithInfo title='Token Selector' variant='h4' />

  <div className='flex items-center space-x-4'>
    <TokenSelector>ETH</TokenSelector>
    <TokenSelector>DOT</TokenSelector>
    <TokenSelector isActive>KSM</TokenSelector>
  </div>
</Card>;
\`\`\``,methods:[],displayName:"Card",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!1,tsType:{name:"CardVariant"},description:"",defaultValue:{value:"CardVariant.DEFAULT",computed:!0}},withShadow:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},tightPadding:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};export{p as C};
