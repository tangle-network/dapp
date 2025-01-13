"use strict";(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[9201],{"../dapp-types/src/utils/isPrimitive.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function isPrimitive(value){return null===value||"object"!=typeof value&&"function"!=typeof value}__webpack_require__.d(__webpack_exports__,{A:()=>isPrimitive})},"./src/components/Card/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>Card});var CardVariant,esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");!function(CardVariant){CardVariant[CardVariant.DEFAULT=0]="DEFAULT",CardVariant[CardVariant.GLASS=1]="GLASS"}(CardVariant||(CardVariant={}));const Card_CardVariant=CardVariant,_excluded=["children","className","withShadow","tightPadding","variant"],getVariantClass=variant=>{switch(variant){case Card_CardVariant.GLASS:return"p-6 rounded-2xl border border-mono-0 dark:border-mono-160 bg-glass dark:bg-glass_dark";case Card_CardVariant.DEFAULT:return""}},Card=(0,react.forwardRef)(((_ref,ref)=>{let{children,className,withShadow=!1,tightPadding=!1,variant=Card_CardVariant.DEFAULT}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);return(0,jsx_runtime.jsx)("div",(0,esm_extends.A)({},props,{className:(0,bundle_mjs.QP)("rounded-xl","bg-mono-0 dark:bg-mono-200","border border-mono-60 dark:border-mono-170",withShadow&&"shadow-webb-lg dark:shadow-webb-lg-dark",tightPadding?"p-3":"p-6",getVariantClass(variant),className),ref,children}))}));Card.__docgenInfo={description:"Sets up styles, and spacing vertically between `block` components.\n\n@example\n\n```jsx\n <Card>\n   ...\n </Card>\n\n<Card>\n  <TitleWithInfo title='Token Selector' variant='h4' />\n\n  <div className='flex items-center space-x-4'>\n    <TokenSelector>ETH</TokenSelector>\n    <TokenSelector>DOT</TokenSelector>\n    <TokenSelector isActive>KSM</TokenSelector>\n  </div>\n</Card>;\n```",methods:[],displayName:"Card",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!1,tsType:{name:"CardVariant"},description:"",defaultValue:{value:"CardVariant.DEFAULT",computed:!0}},withShadow:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},tightPadding:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}}},"./src/components/TitleWithInfo/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>TitleWithInfo});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),src=__webpack_require__("../icons/src/index.ts"),typography=__webpack_require__("./src/typography/index.ts"),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Tooltip=__webpack_require__("./src/components/Tooltip/index.ts"),isPrimitive=__webpack_require__("../dapp-types/src/utils/isPrimitive.ts");const _excluded=["className","info","title","titleClassName","titleComponent","variant","isCenterInfo"],TitleWithInfo=(0,react.forwardRef)(((_ref,ref)=>{let{className,info,title,titleClassName,titleComponent="span",variant="body1",isCenterInfo}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const mergedClsx=(0,react.useMemo)((()=>(0,bundle_mjs.QP)("flex items-center space-x-1 text-mono-180 dark:text-mono-0",className)),[className]);return(0,jsx_runtime.jsxs)("div",(0,esm_extends.A)({},props,{className:mergedClsx,ref,children:[(0,jsx_runtime.jsx)(typography.o,{component:titleComponent,variant,fw:"bold",className:titleClassName,children:title}),info&&(0,jsx_runtime.jsxs)(Tooltip.m_,{children:[(0,jsx_runtime.jsx)(Tooltip.k$,{className:"text-center",asChild:!0,children:(0,jsx_runtime.jsx)("span",{className:"cursor-pointer !text-inherit",children:(0,jsx_runtime.jsx)(src.B$,{className:"!fill-current pointer-events-none"})})}),(0,jsx_runtime.jsx)(Tooltip.SK,{className:"break-normal max-w-[200px]",children:(0,isPrimitive.A)(info)&&null!=info?(0,jsx_runtime.jsx)(typography.o,{ta:isCenterInfo?"center":"left",variant:"body3",className:"break-normal",children:info}):info})]})]}))}));TitleWithInfo.__docgenInfo={description:"The re-useable title component with small info in a popup tooltip\n\n@example\n\n```jsx\n <TitleWithInfo title='Active key' info='This is the active key card' />\n```",methods:[],displayName:"TitleWithInfo",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},title:{required:!0,tsType:{name:"string"},description:"The `title` to be displayed"},variant:{required:!1,tsType:{name:"union",raw:"| HeadingVariant\n| BodyVariant\n| MonospaceVariant\n| ParagraphVariant\n| LabelVariant\n| MarketingVariant",elements:[{name:"union",raw:"'h1' | 'h2' | 'h3' | 'h4' | 'h5'",elements:[{name:"literal",value:"'h1'"},{name:"literal",value:"'h2'"},{name:"literal",value:"'h3'"},{name:"literal",value:"'h4'"},{name:"literal",value:"'h5'"}]},{name:"union",raw:"'body1' | 'body2' | 'body3' | 'body4'",elements:[{name:"literal",value:"'body1'"},{name:"literal",value:"'body2'"},{name:"literal",value:"'body3'"},{name:"literal",value:"'body4'"}]},{name:"union",raw:"'mono1' | 'mono2' | 'mkt-monospace'",elements:[{name:"literal",value:"'mono1'"},{name:"literal",value:"'mono2'"},{name:"literal",value:"'mkt-monospace'"}]},{name:"union",raw:"'para1' | 'para2'",elements:[{name:"literal",value:"'para1'"},{name:"literal",value:"'para2'"}]},{name:"union",raw:"'label' | 'utility'",elements:[{name:"literal",value:"'label'"},{name:"literal",value:"'utility'"}]},{name:"union",raw:"| 'mkt-h1'\n| 'mkt-h2'\n| 'mkt-h3'\n| 'mkt-h4'\n| 'mkt-subheading'\n| 'mkt-body1'\n| 'mkt-body2'\n| 'mkt-small-caps'\n| 'mkt-caption'\n| 'mkt-monospace'",elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:'The `title` variant\n@default "body1"',defaultValue:{value:"'body1'",computed:!1}},titleComponent:{required:!1,tsType:{name:"WebbTypographyProps['component']",raw:"WebbTypographyProps['component']"},description:"The title tab\n@default <span></span>",defaultValue:{value:"'span'",computed:!1}},titleClassName:{required:!1,tsType:{name:"string"},description:"The class name of the title"},info:{required:!1,tsType:{name:"ReactNode"},description:"The `info` appears inside the tooltip to describe the title"},isCenterInfo:{required:!1,tsType:{name:"boolean"},description:"Whether center the info"}}}},"./src/components/TokenSelector/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>components_TokenSelector});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),isPrimitive=__webpack_require__("../dapp-types/src/utils/isPrimitive.ts"),src=__webpack_require__("../icons/src/index.ts"),utils=__webpack_require__("../icons/src/utils.ts"),classnames=__webpack_require__("../../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Typography=__webpack_require__("./src/typography/Typography/index.ts");const _excluded=["children","className","isDisabled","isActive","Icon","tokenType","placeholder","isDropdown"],TokenSelector=(0,react.forwardRef)(((_ref,ref)=>{let{children,className,isDisabled,isActive,Icon,tokenType="unshielded",placeholder="Select token",isDropdown=!0}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const mergedClsx=(0,react.useMemo)((()=>(0,bundle_mjs.QP)(classnames_default()("group px-4 py-2 rounded-full","flex items-center gap-1 max-w-fit","border border-mono-100 dark:border-mono-140","bg-mono-40 dark:bg-mono-170","enabled:hover:bg-mono-60 enabled:hover:dark:bg-mono-160","disabled:bg-[#E2E5EB]/20 dark:disabled:bg-[#3A3E53]/70"),className)),[className]),disabled=isActive||isDisabled,icon="shielded"===tokenType?(0,jsx_runtime.jsx)(src.Gp,{displayPlaceholder:void 0===children,size:"lg",className:(0,bundle_mjs.QP)("shrink-0 grow-0",(0,utils.yF)("lg"))}):"string"==typeof children?(0,jsx_runtime.jsx)(src.xz,{name:children.toLowerCase(),size:"lg",className:(0,bundle_mjs.QP)("shrink-0 grow-0",(0,utils.yF)("lg"))}):Icon||null;return(0,jsx_runtime.jsxs)("button",(0,esm_extends.A)({},props,{disabled,className:mergedClsx,ref,children:[(0,jsx_runtime.jsxs)("div",{className:"flex items-center gap-2",children:[null!==icon&&(0,jsx_runtime.jsx)("div",{children:icon}),(0,isPrimitive.A)(children)?(0,jsx_runtime.jsx)(Typography.o,{variant:"h5",fw:"bold",component:"span",className:"block whitespace-nowrap text-mono-200 dark:text-mono-40",children:children||placeholder}):children||placeholder]}),isDropdown&&(0,jsx_runtime.jsx)(src.yQ,{size:"lg",className:(0,bundle_mjs.QP)("group-disabled:hidden","fill-mono-120 dark:fill-mono-100","shrink-0 grow-0",(0,utils.yF)("lg"))})]}))})),TokenSelector_TokenSelector=TokenSelector;TokenSelector.__docgenInfo={description:"The TokenSelector component\n\nProps:\n- children: the token symbol to display and render token icon\n- className: the className to override styling\n- isDisabled: whether the selector is disabled\n- isActive: whether the selector is active\n- tokenType: the token type to display (unshielded or shielded default: unshielded)\n\n@example\n```jsx\n <TokenSelector />\n <TokenSelector isDisabled />\n <TokenSelector>WETH</TokenSelector>\n```",methods:[],displayName:"TokenSelector",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},Icon:{required:!1,tsType:{name:"ReactElement"},description:""},tokenType:{required:!1,tsType:{name:"union",raw:"'shielded' | 'unshielded'",elements:[{name:"literal",value:"'shielded'"},{name:"literal",value:"'unshielded'"}]},description:"The token type\n@default 'unshielded'",defaultValue:{value:"'unshielded'",computed:!1}},isActive:{required:!1,tsType:{name:"boolean"},description:"If `true`, the component will display as disable state"},isDisabled:{required:!1,tsType:{name:"boolean"},description:"If `true`, the component will display as disable state"},placeholder:{required:!1,tsType:{name:"ReactNode"},description:"The placeholder for the component\nwhen the children is not provided\n@default 'Select token'",defaultValue:{value:"'Select token'",computed:!1}},isDropdown:{required:!1,tsType:{name:"boolean"},description:"Boolean indicate to render the dropdown chevron icon\n@default true",defaultValue:{value:"true",computed:!1}}},composes:["Omit"]};const components_TokenSelector=TokenSelector_TokenSelector},"./src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],TooltipBody=_ref=>{let{button,children,className,title,isDisablePortal}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref,_excluded);const inner=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.UC,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_1___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded px-3 py-2","bg-mono-20 dark:bg-mono-200","border border-mono-60 dark:border-mono-180","webb-shadow-sm z-[9999]")},props,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className),children:[title&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h6",{className:"mb-2 utility",children:title}),children,button&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"flex justify-end mt-4",children:button})]})}));return isDisablePortal?inner:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.ZL,{children:inner})},TooltipTrigger=_ref2=>{let{children,className}=_ref2,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref2,_excluded2);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.l9,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({className},props,{children}))},Tooltip=_ref3=>{let{children,isDefaultOpen,isDisableHoverableContent,isOpen,onChange,delayDuration=100}=_ref3,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref3,_excluded3);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.Kq,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.bL,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration,children}))})};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./src/components/Tooltip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.SK,k$:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.k$,m_:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.m_});var _Tooltip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/components/Tooltip/Tooltip.tsx")},"./src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],DEFAULT_COMPONENT={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=_ref=>{let{children,className,component,fw="normal",ta="left",variant}=_ref,restProps=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__.A)(_ref,_excluded);const component_=null!=component?component:DEFAULT_COMPONENT[variant],className_=(0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_2__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_3__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(component_,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},restProps,{className:className_}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{fw:{defaultValue:{value:"'normal'",computed:!1},required:!1},ta:{defaultValue:{value:"'left'",computed:!1},required:!1}}}},"./src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/Typography.tsx")},"./src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/index.ts")},"./src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")||variant.startsWith("mkt-h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName})},"./src/stories/molecules/Card.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Primary:()=>Primary,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_Card__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/Card/index.ts"),_components_TitleWithInfo__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/TitleWithInfo/index.ts"),_components_TokenSelector__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/components/TokenSelector/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/Card",component:_components_Card__WEBPACK_IMPORTED_MODULE_1__.Z},Primary=(args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_components_Card__WEBPACK_IMPORTED_MODULE_1__.Z,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},args,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_TitleWithInfo__WEBPACK_IMPORTED_MODULE_2__.B,{title:"Token Selector",variant:"h4"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_TokenSelector__WEBPACK_IMPORTED_MODULE_3__.A,{children:"ETH"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_TokenSelector__WEBPACK_IMPORTED_MODULE_3__.A,{children:"DOT"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_TokenSelector__WEBPACK_IMPORTED_MODULE_3__.A,{isActive:!0,children:"KSM"})]})]}))).bind({});Primary.args={};const __namedExportsOrder=["Primary"];Primary.parameters={...Primary.parameters,docs:{...Primary.parameters?.docs,source:{originalSource:'args => <Card {...args}>\n    <TitleWithInfo title="Token Selector" variant="h4" />\n    <div className="flex items-center space-x-4">\n      <TokenSelector>ETH</TokenSelector>\n      <TokenSelector>DOT</TokenSelector>\n      <TokenSelector isActive>KSM</TokenSelector>\n    </div>\n  </Card>',...Primary.parameters?.docs?.source}}}}}]);