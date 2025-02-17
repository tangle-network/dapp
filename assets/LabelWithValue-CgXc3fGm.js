import{j as e}from"./jsx-runtime-BbjHj44Y.js";import{c as o}from"./index-BpvXyOxN.js";import{r as s}from"./index-C6mWTJJr.js";import{t as v}from"./bundle-mjs-D696Ktp4.js";import{g as u,T as b}from"./Typography-BXoXAd7x.js";import{L as y}from"./Label-DpPnCd0G.js";import{T as k,a as f,b as g}from"./Tooltip-BHOFDjF6.js";const w=s.forwardRef(({className:m,isHiddenLabel:i,label:l,labelVariant:d="utility",value:a,valueTooltip:n,valueVariant:t="body1",valueFontWeight:r="semibold",...p},h)=>{const c=s.useMemo(()=>v("flex items-center space-x-1 text-mono-140 dark:text-mono-80",m),[m]);return e.jsxs("span",{...p,className:c,ref:h,children:[l?e.jsx(y,{hidden:i,className:o("!text-inherit",u(t,r),d,i&&"hidden"),htmlFor:l,children:l}):null,!n&&(typeof a=="string"||typeof a=="number"?e.jsx(b,{component:"span",variant:t,className:o("!text-inherit",u(t,r)),children:a.toString()}):a),n&&e.jsxs(k,{children:[e.jsx(f,{children:a}),e.jsx(g,{children:n})]})]})});w.__docgenInfo={description:"The `LabelWithValue` component\n\nReuseable component contains a small label with value after it\n\n```jsx\n <LabelWithValue label='session: ' value={'123'} />\n```",methods:[],displayName:"LabelWithValue",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},label:{required:!0,tsType:{name:"string"},description:"The label value"},labelVariant:{required:!1,tsType:{name:"union",raw:`| HeadingVariant
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
| 'mkt-monospace'`,elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:`The label variant
@default "utility"`,defaultValue:{value:"'utility'",computed:!1}},value:{required:!0,tsType:{name:"union",raw:"string | number | ReactElement",elements:[{name:"string"},{name:"number"},{name:"ReactElement"}]},description:"The value to display"},isHiddenLabel:{required:!1,tsType:{name:"boolean"},description:"If `true`, it will displays only value"},valueVariant:{required:!1,tsType:{name:"union",raw:`| HeadingVariant
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
| 'mkt-monospace'`,elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:`The label variant
@default "body2"`,defaultValue:{value:"'body1'",computed:!1}},valueTooltip:{required:!1,tsType:{name:"union",raw:"string | ReactElement",elements:[{name:"string"},{name:"ReactElement"}]},description:"The value will have the tooltip that contains the `valueTooltip` string to describe for the value.\nUsually use for shorten hex string"},valueFontWeight:{required:!1,tsType:{name:"union",raw:`| 'normal'
| 'medium'
| 'semibold'
| 'bold'
| 'black'`,elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:`The typography font weight for the value
@default "semibold"`,defaultValue:{value:"'semibold'",computed:!1}}}};export{w as L};
