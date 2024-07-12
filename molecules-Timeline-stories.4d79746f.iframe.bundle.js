(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[1282],{"./libs/webb-ui-components/src/stories/molecules/Timeline.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _Default_parameters,_Default_parameters_docs,_Default_parameters1,react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_ngneat_falso__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@ngneat/falso/index.js"),_components_TimeLine__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/webb-ui-components/src/components/TimeLine/index.ts"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement;const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/TimeLine",component:_components_TimeLine__WEBPACK_IMPORTED_MODULE_1__.k};var Default=function Template(args){return __jsx(_components_TimeLine__WEBPACK_IMPORTED_MODULE_1__.k,null,__jsx(_components_TimeLine__WEBPACK_IMPORTED_MODULE_1__.N,args)," ")}.bind({});Default.args={title:"Proposed",time:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_2__.p_5)(),txHash:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_2__.zV4)(),externalUrl:"https://webb.tools"},Default.parameters={...Default.parameters,docs:{...null===(_Default_parameters=Default.parameters)||void 0===_Default_parameters?void 0:_Default_parameters.docs,source:{originalSource:"args => <TimeLine>\n    <TimeLineItem {...args} />{' '}\n  </TimeLine>",...null===(_Default_parameters1=Default.parameters)||void 0===_Default_parameters1||null===(_Default_parameters_docs=_Default_parameters1.docs)||void 0===_Default_parameters_docs?void 0:_Default_parameters_docs.source}}};const __namedExportsOrder=["Default"]},"./libs/webb-ui-components/src/components/Label/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{J:()=>Label});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),dist=__webpack_require__("./node_modules/@radix-ui/react-label/dist/index.mjs"),__jsx=react.createElement,Label=function Label(props){return __jsx(dist.b,props)};Label.__docgenInfo={description:"The accessible `Label` component\n\n@example\n\n```jsx\n <Label className='font-bold uppercase body4' htmlFor=\"username\">\n   Username\n </Label>\n```",methods:[],displayName:"Label"}},"./libs/webb-ui-components/src/components/LabelWithValue/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{G:()=>LabelWithValue});__webpack_require__("./node_modules/core-js/modules/es.regexp.to-string.js");var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),typography=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),utils=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts"),Label=__webpack_require__("./libs/webb-ui-components/src/components/Label/index.ts"),Tooltip=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/index.ts"),_excluded=["className","isHiddenLabel","label","labelVariant","value","valueTooltip","valueVariant","valueFontWeight"],__jsx=react.createElement,LabelWithValue=(0,react.forwardRef)((function(_ref,ref){var className=_ref.className,isHiddenLabel=_ref.isHiddenLabel,label=_ref.label,_ref$labelVariant=_ref.labelVariant,labelVariant=void 0===_ref$labelVariant?"utility":_ref$labelVariant,value=_ref.value,valueTooltip=_ref.valueTooltip,_ref$valueVariant=_ref.valueVariant,valueVariant=void 0===_ref$valueVariant?"body1":_ref$valueVariant,_ref$valueFontWeight=_ref.valueFontWeight,valueFontWeight=void 0===_ref$valueFontWeight?"semibold":_ref$valueFontWeight,props=objectWithoutProperties_default()(_ref,_excluded),mergedClsx=(0,react.useMemo)((function(){return(0,bundle_mjs.QP)("flex items-center space-x-1 text-mono-140 dark:text-mono-80",className)}),[className]);return __jsx("span",extends_default()({},props,{className:mergedClsx,ref}),label?__jsx(Label.J,{hidden:isHiddenLabel,className:classnames_default()("!text-inherit",(0,utils.NC)(valueVariant,valueFontWeight),labelVariant,isHiddenLabel&&"hidden"),htmlFor:label},label):null,!valueTooltip&&("string"==typeof value||"number"==typeof value?__jsx(typography.o,{component:"span",variant:valueVariant,className:classnames_default()("!text-inherit",(0,utils.NC)(valueVariant,valueFontWeight))},value.toString()):value),valueTooltip&&__jsx(Tooltip.m_,null,__jsx(Tooltip.k$,null,value),__jsx(Tooltip.SK,null,valueTooltip)))}));LabelWithValue.__docgenInfo={description:"The `LabelWithValue` component\n\nReuseable component contains a small label with value after it\n\n```jsx\n <LabelWithValue label='session: ' value={'123'} />\n```",methods:[],displayName:"LabelWithValue",props:{labelVariant:{defaultValue:{value:"'utility'",computed:!1},required:!1},valueVariant:{defaultValue:{value:"'body1'",computed:!1},required:!1},valueFontWeight:{defaultValue:{value:"'semibold'",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/TimeLine/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{k:()=>TimeLine,N:()=>TimeLineItem});var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["children","className"],__jsx=react.createElement,TimeLine=(0,react.forwardRef)((function(_ref,ref){var children=_ref.children,className=_ref.className,props=objectWithoutProperties_default()(_ref,_excluded);return __jsx("div",extends_default()({},props,{className:(0,bundle_mjs.QP)("flex flex-col space-y-2 border-l border-blue dark:border-blue-30","translate-x-3 transalte-y-0.5",className),ref}),children)}));TimeLine.__docgenInfo={description:"The `TimeLine` style wrapper\n\n@example\n\n```jsx\n   <TimeLine>\n     <TimeLineItem\n       title='Proposed'\n       time={randRecentDate()}\n       txHash={randEthereumAddress()}\n       externalUrl='https://webb.tools'\n     />\n   </TimeLine>\n```",methods:[],displayName:"TimeLine"};var src=__webpack_require__("./libs/icons/src/index.ts"),typography=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),utils=__webpack_require__("./libs/webb-ui-components/src/utils/index.ts"),formatRelative=__webpack_require__("./node_modules/date-fns/formatRelative.mjs"),LabelWithValue=__webpack_require__("./libs/webb-ui-components/src/components/LabelWithValue/index.ts"),TimeLineItem_excluded=["className","externalUrl","extraContent","isLoading","time","title","blockHash"],TimeLineItem_jsx=react.createElement,TimeLineItem=(0,react.forwardRef)((function(_ref,ref){var className=_ref.className,externalUrl=_ref.externalUrl,extraContent=_ref.extraContent,isLoading=_ref.isLoading,time=_ref.time,title=_ref.title,blockHash=_ref.blockHash,props=objectWithoutProperties_default()(_ref,TimeLineItem_excluded);return TimeLineItem_jsx("div",extends_default()({},props,{className:(0,bundle_mjs.QP)("flex flex-col -ml-3 -mt-0.5 space-y-1",className),ref}),TimeLineItem_jsx("div",{className:"flex items-center space-x-2"},isLoading?TimeLineItem_jsx(src.y$,{size:"lg",className:"inline-block rounded-full fill-mono-0 dark:fill-mono-180"}):TimeLineItem_jsx(src.ej,{size:"lg",className:"inline-block rounded-full fill-blue dark:fill-blue-30 bg-mono-0 dark:bg-mono-180"}),TimeLineItem_jsx(typography.o,{component:"span",variant:"body1",fw:"bold",className:"inline-block text-blue dark:text-blue-30"},title),TimeLineItem_jsx(typography.o,{variant:"utility",className:"inline-block capitalize"},(0,formatRelative.o)(time,new Date))),blockHash&&TimeLineItem_jsx("div",{className:"flex items-center ml-8 space-x-1"},TimeLineItem_jsx(LabelWithValue.G,{labelVariant:"body3",label:"block hash:",value:(0,utils.f2)(blockHash,3),valueTooltip:blockHash}),TimeLineItem_jsx("a",{href:externalUrl,target:"_blank",rel:"noopener noreferrer"},TimeLineItem_jsx(src.kX,null))),TimeLineItem_jsx("div",{className:"ml-8"},extraContent))}));TimeLineItem.__docgenInfo={description:"The `TimeLineItem`, must use inside `<TimeLine></TimeLine>` component\n\n@example\n\n```jsx\n   <TimeLineItem\n     title='Proposed'\n     time={randRecentDate()}\n     txHash={randEthereumAddress()}\n     externalUrl='https://webb.tools'\n   />\n\n   <TimeLineItem\n     title='Signed'\n     time={randRecentDate()}\n     txHash={randEthereumAddress()}\n     externalUrl='https://webb.tools'\n     extraContent={\n       <div className='flex items-center space-x-2'>\n         <KeyValueWithButton keyValue={randEthereumAddress()} size='sm' />\n         <Button variant='link' size='sm' className='uppercase'>\n           Detail\n         </Button>\n       </div>\n      }\n    />\n\n   <TimeLineItem\n     title='Key Rotated'\n     time={randRecentDate()}\n     txHash={randEthereumAddress()}\n     externalUrl='https://webb.tools'\n     extraContent={\n       <div className='flex items-center space-x-4'>\n         <LabelWithValue label='Height' value={1000654} />\n         <LabelWithValue label='Proposal' value='KeyRotation' />\n         <LabelWithValue\n           label='Proposers'\n           value={\n             <AvatarGroup total={randNumber({ min: 10, max: 20 })}>\n               {Object.values(keygen.authorities).map((au) => (\n                  <Avatar key={au.id} src={au.avatarUrl} alt={au.id} />\n               ))}\n             </AvatarGroup>\n           }\n         />\n         <Button size='sm' variant='link' className='uppercase'>\n           Details\n         </Button>\n       </div>\n     }\n   />\n```",methods:[],displayName:"TimeLineItem"}},"./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,TooltipBody=function TooltipBody(_ref){var button=_ref.button,children=_ref.children,className=_ref.className,title=_ref.title,isDisablePortal=_ref.isDisablePortal,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded),inner=__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.UC,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_3___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded p-2","bg-mono-20 dark:bg-mono-160","webb-shadow-sm z-[9999]")},props),__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.i3,{className:"fill-current text-mono-20 dark:text-mono-160 webb-shadow-sm"}),__jsx("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className)},title&&__jsx("h6",{className:"mb-2 utility"},title),children,button&&__jsx("div",{className:"flex justify-end mt-4"},button)));return isDisablePortal?inner:__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.ZL,null,inner)},TooltipTrigger=function TooltipTrigger(_ref2){var children=_ref2.children,className=_ref2.className,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref2,_excluded2);return __jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.l9,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({className},props),children)},Tooltip=function Tooltip(_ref3){var children=_ref3.children,isDefaultOpen=_ref3.isDefaultOpen,isDisableHoverableContent=_ref3.isDisableHoverableContent,isOpen=_ref3.isOpen,onChange=_ref3.onChange,_ref3$delayDuration=_ref3.delayDuration,delayDuration=void 0===_ref3$delayDuration?100:_ref3$delayDuration,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref3,_excluded3);return __jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.Kq,null,__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.bL,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration}),children))};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/Tooltip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{SK:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.SK,k$:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.k$,m_:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.m_});var _Tooltip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx")},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>Typography});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__),react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts"),_excluded=["children","className","component","fw","ta","variant"];function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=function Typography(props){var children=props.children,className=props.className,component=props.component,_props$fw=props.fw,fw=void 0===_props$fw?"normal":_props$fw,_props$ta=props.ta,ta=void 0===_props$ta?"left":_props$ta,variant=props.variant,restProps=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default()(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return null!=component?component:defaultComponent[variant]}),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("".concat(variant),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.Qe)(variant),className)}),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_3__.createElement)(_component,_objectSpread(_objectSpread({},restProps),{},{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}},"?d4c0":()=>{}}]);