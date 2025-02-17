import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{I as x}from"./InformationLine-D6uBLwmF.js";import{c as v}from"./index-BpvXyOxN.js";import{t}from"./bundle-mjs-D696Ktp4.js";import{T as C,a as y,b as w}from"./Tooltip-BHOFDjF6.js";import{B as T}from"./Button-bTMyXnUe.js";const N=l=>{const{children:o,className:r,id:i,info:n,inputProps:s={},isChecked:d,isDisabled:m,labelClassName:c,labelVariant:p="body1",onChange:u,spacingClassName:h="ml-2",wrapperClassName:b,labelProps:a}=l,k=t("cursor-pointer disabled:cursor-not-allowed peer-disabled:cursor-not-allowed","form-checkbox peer transition-none bg-mono-0 w-[18px] h-[18px] rounded border-2 border-mono-100 outline-none dark:bg-mono-180 focus:ring-offset-0 focus:ring-0","enabled:hover:shadow-sm enabled:hover:shadow-blue-10 dark:hover:shadow-none","checked:bg-blue-50 dark:checked:bg-blue-50 checked:hover:bg-blue-50 dark:checked:hover:bg-blue-50 checked:active:bg-blue-60 dark:checked:active:bg-blue-40","disabled:border-mono-60 dark:disabled:border-mono-140 disabled:cursor-not-allowed disabled:shadow-none",r),f=v("inline-block peer-disabled:cursor-not-allowed peer-disabled:text-mono-100","text-mono-140 dark:text-mono-20",p,h),g=t(f,c);return e.jsxs("label",{...a,className:t("inline-flex",a==null?void 0:a.className,b),children:[e.jsxs("div",{className:"relative group min-h-[28px] min-w-[28px]",children:[e.jsx("input",{id:i,type:"checkbox",className:t(k,"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"),checked:d,onChange:u,disabled:m,...s}),e.jsx("span",{className:t("w-[34px] h-[34px] rounded-full","absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2","bg-[rgba(89,83,249,0.10)] group-active:bg-[rgba(89,83,249,0.20)]","dark:bg-[rgba(89,83,249,0.20)] dark:group-active:bg-[rgba(89,83,249,0.30)]","opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out")})]}),o&&e.jsx("span",{className:g,children:o}),n&&e.jsxs(C,{delayDuration:100,children:[e.jsx(y,{className:"ml-1 text-center",asChild:!0,children:e.jsx("span",{className:"cursor-pointer peer-disabled:text-mono-120",children:e.jsx(x,{className:"!fill-current pointer-events-none"})})}),e.jsx(w,{title:n.title,className:"max-w-[185px]",button:n.buttonProps&&e.jsx(T,{...n.buttonProps,variant:"utility",size:"sm",children:n.buttonText??"Learn more"}),children:n.content})]})]})};N.__docgenInfo={description:"The `CheckBox` component\n\nProps:\n\n- `isDisabled`: If `true`, the checkbox will be disabled\n- `spacing`: The spacing between the checkbox and its label text (default: `4`)\n- `isChecked`: If `true`, the checkbox will be checked.\n- `onChange`: The callback invoked when the checked state of the `Checkbox` changes\n- `inputProps`: Additional props to be forwarded to the `input` element\n- `htmlFor`: Input id and value for `htmlFor` attribute of `<label></label>` tag\n- `labelClassName`: Class name in case of overriding the tailwind class of the `<label></label>` tag\n- `wrapperClassName`: Class name in case of overriding the tailwind class of the checkbox container\n\n@example\n\n```jsx\n <CheckBox />\n <CheckBox isDisabled />\n <CheckBox isDisabled>Check mark</CheckBox>\n```",methods:[],displayName:"CheckBox",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},isDisabled:{required:!1,tsType:{name:"boolean"},description:"If `true`, the checkbox will be disabled"},spacingClassName:{required:!1,tsType:{name:"string"},description:`The spacing between the checkbox and its label text
@default "ml-4"
@type tailwind spacing`},isChecked:{required:!1,tsType:{name:"boolean"},description:"If `true`, the checkbox will be checked.\nYou'll need to pass `onChange` to update its value (since it is now controlled)"},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: React.ChangeEvent<HTMLInputElement>) => void",signature:{arguments:[{type:{name:"ReactChangeEvent",raw:"React.ChangeEvent<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},name:"event"}],return:{name:"void"}}},description:"The callback invoked when the checked state of the `Checkbox` changes."},inputProps:{required:!1,tsType:{name:"ReactInputHTMLAttributes",raw:"React.InputHTMLAttributes<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},description:"Additional props to be forwarded to the `input` element"},labelClassName:{required:!1,tsType:{name:"string"},description:"Class name in case of overriding the tailwind class of the `<label></label>` tag"},wrapperClassName:{required:!1,tsType:{name:"string"},description:"Class name in case of overriding the tailwind class of the checkbox container"},labelVariant:{required:!1,tsType:{name:"union",raw:`| HeadingVariant
| BodyVariant
| MonospaceVariant
| ParagraphVariant
| LabelVariant
| MarketingVariant`,elements:[{name:"union",raw:"'h1' | 'h2' | 'h3' | 'h4' | 'h5'",elements:[{name:"literal",value:"'h1'"},{name:"literal",value:"'h2'"},{name:"literal",value:"'h3'"},{name:"literal",value:"'h4'"},{name:"literal",value:"'h5'"}]},{name:"union",raw:"'body1' | 'body2' | 'body3' | 'body4'",elements:[{name:"literal",value:"'body1'"},{name:"literal",value:"'body2'"},{name:"literal",value:"'body3'"},{name:"literal",value:"'body4'"}]},{name:"union",raw:"'mono1' | 'mono2' | 'mkt-monospace'",elements:[{name:"literal",value:"'mono1'"},{name:"literal",value:"'mono2'"},{name:"literal",value:"'mkt-monospace'"}]},{name:"union",raw:"'para1' | 'para2'",elements:[{name:"literal",value:"'para1'"},{name:"literal",value:"'para2'"}]},{name:"union",raw:"'label' | 'utility'",elements:[{name:"literal",value:"'label'"},{name:"literal",value:"'utility'"}]},{name:"union",raw:`| 'mkt-h1'
| 'mkt-h2'
| 'mkt-h3'
| 'mkt-h4'
| 'mkt-subheading'
| 'mkt-body1'
| 'mkt-body2'
| 'mkt-small-caps'
| 'mkt-caption'
| 'mkt-monospace'`,elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:`The label typography variant
@default "body1"`},labelProps:{required:!1,tsType:{name:"ComponentProps",elements:[{name:"literal",value:"'label'"}],raw:"ComponentProps<'label'>"},description:""},info:{required:!1,tsType:{name:"Partial",elements:[{name:"signature",type:"object",raw:`{
  /**
   * The title of the info
   */
  title: string;

  /**
   * The content of the info
   */
  content: string;

  /**
   * The text of the button
   * @default "Learn more"
   */
  buttonText: string;

  /**
   * Other props to be forwarded to the button (e.g. \`href\`, \`onClick\`)
   */
  buttonProps: ComponentProps<typeof Button>;
}`,signature:{properties:[{key:"title",value:{name:"string",required:!0},description:"The title of the info"},{key:"content",value:{name:"string",required:!0},description:"The content of the info"},{key:"buttonText",value:{name:"string",required:!0},description:`The text of the button
@default "Learn more"`},{key:"buttonProps",value:{name:"ComponentProps",elements:[{name:"Button"}],raw:"ComponentProps<typeof Button>",required:!0},description:"Other props to be forwarded to the button (e.g. `href`, `onClick`)"}]}}],raw:`Partial<{
  /**
   * The title of the info
   */
  title: string;

  /**
   * The content of the info
   */
  content: string;

  /**
   * The text of the button
   * @default "Learn more"
   */
  buttonText: string;

  /**
   * Other props to be forwarded to the button (e.g. \`href\`, \`onClick\`)
   */
  buttonProps: ComponentProps<typeof Button>;
}>`},description:"More info about the checkbox"}}};export{N as C};
