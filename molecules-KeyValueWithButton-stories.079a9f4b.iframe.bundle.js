(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[8899],{"./src/components/KeyValueWithButton/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{L:()=>KeyValueWithButton});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),src=__webpack_require__("../icons/src/index.ts"),classnames=__webpack_require__("../../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),useCopyable=__webpack_require__("./src/hooks/useCopyable.ts"),shortenHex=__webpack_require__("./src/utils/shortenHex.ts"),shortenString=__webpack_require__("./src/utils/shortenString.ts"),isHex=__webpack_require__("../../node_modules/viem/_esm/utils/data/isHex.js"),LabelWithValue=__webpack_require__("./src/components/LabelWithValue/index.ts"),Tooltip=__webpack_require__("./src/components/Tooltip/index.ts");const _excluded=["className","hasShortenValue","isHiddenLabel","keyValue","labelVariant","size","valueFontWeight","valueVariant","label","isDisabledTooltip","onCopyButtonClick","displayCharCount","copyProps"],KeyValueWithButton=(0,react.forwardRef)(((_ref,ref)=>{let{className,hasShortenValue=!0,isHiddenLabel,keyValue,labelVariant,size="md",valueFontWeight,valueVariant,label="",isDisabledTooltip,onCopyButtonClick,displayCharCount=5,copyProps}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const copyableResult=(0,useCopyable.x)(),{copy,isCopied}=(0,react.useMemo)((()=>copyProps||copyableResult),[copyProps,copyableResult]),onCopy=(0,react.useCallback)((event=>{event.stopPropagation(),isCopied||copy(keyValue)}),[copy,isCopied,keyValue]),mergedClsx=(0,react.useMemo)((()=>(0,bundle_mjs.QP)("overflow-hidden rounded-lg","md"===size?"bg-mono-20 dark:bg-mono-160":"",className)),[className,size]),value=(0,react.useMemo)((()=>hasShortenValue?(0,isHex.q)(keyValue)?(0,shortenHex.f)(keyValue,displayCharCount):(0,shortenString.l)(keyValue,displayCharCount):keyValue),[displayCharCount,hasShortenValue,keyValue]);return(0,jsx_runtime.jsx)("div",(0,esm_extends.A)({},props,{className:mergedClsx,ref,children:(0,jsx_runtime.jsxs)("div",{className:classnames_default()("flex items-center","md"===size?"space-x-2":"space-x-1"),children:[(0,jsx_runtime.jsx)("div",{className:"md"===size?"py-1 pl-3":"",children:(0,jsx_runtime.jsxs)(Tooltip.m_,{children:[(0,jsx_runtime.jsx)(Tooltip.k$,{onClick:"function"==typeof onCopyButtonClick?onCopyButtonClick:onCopy,disabled:isDisabledTooltip,asChild:!0,children:(0,jsx_runtime.jsx)(LabelWithValue.G,{tabIndex:0,labelVariant,valueFontWeight,valueVariant,isHiddenLabel,label,value,className:classnames_default()("cursor-default",isDisabledTooltip?"pointer-events-none":"pointer-events-auto")})}),(0,jsx_runtime.jsx)(Tooltip.SK,{children:keyValue})]})}),(0,jsx_runtime.jsxs)(Tooltip.m_,{isOpen:isCopied,children:[(0,jsx_runtime.jsx)(Tooltip.k$,{className:classnames_default()("md"===size?"p-2 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-30":"",isCopied?"cursor-not-allowed":""),onClick:"function"==typeof onCopyButtonClick?onCopyButtonClick:onCopy,children:(0,jsx_runtime.jsx)(src.cz,{className:"md"===size?"!fill-current":""})}),(0,jsx_runtime.jsx)(Tooltip.SK,{children:isCopied?"Copied":"Copy"})]})]})}))}));KeyValueWithButton.__docgenInfo={description:"The `KeyValueWithButton` component contains the key label and the shortened key hash along with a copy button\n\n@example\n\n```jsx\n <KeyValueWithButton keyValue='0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6' />\n```",methods:[],displayName:"KeyValueWithButton",props:{label:{required:!1,tsType:{name:"string"},description:"The label value\n@default ''",defaultValue:{value:"''",computed:!1}},keyValue:{required:!0,tsType:{name:"string"},description:"The `key` hash value"},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"}]},description:'The component size\n@default "md"',defaultValue:{value:"'md'",computed:!1}},hasShortenValue:{required:!1,tsType:{name:"boolean"},description:"Whether format the value in the short form.\n@default true",defaultValue:{value:"true",computed:!1}},isDisabledTooltip:{required:!1,tsType:{name:"boolean"},description:"If `true`, the tooltip value will be disabled."},onCopyButtonClick:{required:!1,tsType:{name:"ComponentProps['onClick']",raw:"ComponentProps<'button'>['onClick']"},description:""},copyProps:{required:!1,tsType:{name:"signature",type:"object",raw:"{\n  /**\n   * The copy state, determine whether the value has copied or not\n   */\n  isCopied: boolean;\n\n  /**\n   * Copy the `value` string to clipboard\n   * @param value Represents the value to copy to clipboard\n   */\n  copy: (value: string) => void;\n\n  copiedText: string | undefined;\n}",signature:{properties:[{key:"isCopied",value:{name:"boolean",required:!0},description:"The copy state, determine whether the value has copied or not"},{key:"copy",value:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}},required:!0},description:"Copy the `value` string to clipboard\n@param value Represents the value to copy to clipboard"},{key:"copiedText",value:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}],required:!0}}]}},description:""},displayCharCount:{required:!1,tsType:{name:"number"},description:"@default 5",defaultValue:{value:"5",computed:!1}}},composes:["Omit","KeyValueWithButtonBaseProps"]}},"./src/components/Label/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{J:()=>Label});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),dist=__webpack_require__("../../node_modules/@radix-ui/react-label/dist/index.mjs"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const Label=props=>(0,jsx_runtime.jsx)(dist.b,(0,esm_extends.A)({},props,{className:(0,bundle_mjs.QP)("text-mono-120 dark:text-mono-120 font-bold text-lg",props.className)}));Label.__docgenInfo={description:"The accessible `Label` component\n\n@example\n\n```jsx\n <Label className='font-bold uppercase body4' htmlFor=\"username\">\n   Username\n </Label>\n```",methods:[],displayName:"Label"}},"./src/components/LabelWithValue/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{G:()=>LabelWithValue});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),classnames=__webpack_require__("../../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),typography=__webpack_require__("./src/typography/index.ts"),utils=__webpack_require__("./src/typography/utils/index.ts"),Label=__webpack_require__("./src/components/Label/index.ts"),Tooltip=__webpack_require__("./src/components/Tooltip/index.ts");const _excluded=["className","isHiddenLabel","label","labelVariant","value","valueTooltip","valueVariant","valueFontWeight"],LabelWithValue=(0,react.forwardRef)(((_ref,ref)=>{let{className,isHiddenLabel,label,labelVariant="utility",value,valueTooltip,valueVariant="body1",valueFontWeight="semibold"}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const mergedClsx=(0,react.useMemo)((()=>(0,bundle_mjs.QP)("flex items-center space-x-1 text-mono-140 dark:text-mono-80",className)),[className]);return(0,jsx_runtime.jsxs)("span",(0,esm_extends.A)({},props,{className:mergedClsx,ref,children:[label?(0,jsx_runtime.jsx)(Label.J,{hidden:isHiddenLabel,className:classnames_default()("!text-inherit",(0,utils.NC)(valueVariant,valueFontWeight),labelVariant,isHiddenLabel&&"hidden"),htmlFor:label,children:label}):null,!valueTooltip&&("string"==typeof value||"number"==typeof value?(0,jsx_runtime.jsx)(typography.o,{component:"span",variant:valueVariant,className:classnames_default()("!text-inherit",(0,utils.NC)(valueVariant,valueFontWeight)),children:value.toString()}):value),valueTooltip&&(0,jsx_runtime.jsxs)(Tooltip.m_,{children:[(0,jsx_runtime.jsx)(Tooltip.k$,{children:value}),(0,jsx_runtime.jsx)(Tooltip.SK,{children:valueTooltip})]})]}))}));LabelWithValue.__docgenInfo={description:"The `LabelWithValue` component\n\nReuseable component contains a small label with value after it\n\n```jsx\n <LabelWithValue label='session: ' value={'123'} />\n```",methods:[],displayName:"LabelWithValue",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},label:{required:!0,tsType:{name:"string"},description:"The label value"},labelVariant:{required:!1,tsType:{name:"union",raw:"| HeadingVariant\n| BodyVariant\n| MonospaceVariant\n| ParagraphVariant\n| LabelVariant\n| MarketingVariant",elements:[{name:"union",raw:"'h1' | 'h2' | 'h3' | 'h4' | 'h5'",elements:[{name:"literal",value:"'h1'"},{name:"literal",value:"'h2'"},{name:"literal",value:"'h3'"},{name:"literal",value:"'h4'"},{name:"literal",value:"'h5'"}]},{name:"union",raw:"'body1' | 'body2' | 'body3' | 'body4'",elements:[{name:"literal",value:"'body1'"},{name:"literal",value:"'body2'"},{name:"literal",value:"'body3'"},{name:"literal",value:"'body4'"}]},{name:"union",raw:"'mono1' | 'mono2' | 'mkt-monospace'",elements:[{name:"literal",value:"'mono1'"},{name:"literal",value:"'mono2'"},{name:"literal",value:"'mkt-monospace'"}]},{name:"union",raw:"'para1' | 'para2'",elements:[{name:"literal",value:"'para1'"},{name:"literal",value:"'para2'"}]},{name:"union",raw:"'label' | 'utility'",elements:[{name:"literal",value:"'label'"},{name:"literal",value:"'utility'"}]},{name:"union",raw:"| 'mkt-h1'\n| 'mkt-h2'\n| 'mkt-h3'\n| 'mkt-h4'\n| 'mkt-subheading'\n| 'mkt-body1'\n| 'mkt-body2'\n| 'mkt-small-caps'\n| 'mkt-caption'\n| 'mkt-monospace'",elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:'The label variant\n@default "utility"',defaultValue:{value:"'utility'",computed:!1}},value:{required:!0,tsType:{name:"union",raw:"string | number | ReactElement",elements:[{name:"string"},{name:"number"},{name:"ReactElement"}]},description:"The value to display"},isHiddenLabel:{required:!1,tsType:{name:"boolean"},description:"If `true`, it will displays only value"},valueVariant:{required:!1,tsType:{name:"union",raw:"| HeadingVariant\n| BodyVariant\n| MonospaceVariant\n| ParagraphVariant\n| LabelVariant\n| MarketingVariant",elements:[{name:"union",raw:"'h1' | 'h2' | 'h3' | 'h4' | 'h5'",elements:[{name:"literal",value:"'h1'"},{name:"literal",value:"'h2'"},{name:"literal",value:"'h3'"},{name:"literal",value:"'h4'"},{name:"literal",value:"'h5'"}]},{name:"union",raw:"'body1' | 'body2' | 'body3' | 'body4'",elements:[{name:"literal",value:"'body1'"},{name:"literal",value:"'body2'"},{name:"literal",value:"'body3'"},{name:"literal",value:"'body4'"}]},{name:"union",raw:"'mono1' | 'mono2' | 'mkt-monospace'",elements:[{name:"literal",value:"'mono1'"},{name:"literal",value:"'mono2'"},{name:"literal",value:"'mkt-monospace'"}]},{name:"union",raw:"'para1' | 'para2'",elements:[{name:"literal",value:"'para1'"},{name:"literal",value:"'para2'"}]},{name:"union",raw:"'label' | 'utility'",elements:[{name:"literal",value:"'label'"},{name:"literal",value:"'utility'"}]},{name:"union",raw:"| 'mkt-h1'\n| 'mkt-h2'\n| 'mkt-h3'\n| 'mkt-h4'\n| 'mkt-subheading'\n| 'mkt-body1'\n| 'mkt-body2'\n| 'mkt-small-caps'\n| 'mkt-caption'\n| 'mkt-monospace'",elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:'The label variant\n@default "body2"',defaultValue:{value:"'body1'",computed:!1}},valueTooltip:{required:!1,tsType:{name:"union",raw:"string | ReactElement",elements:[{name:"string"},{name:"ReactElement"}]},description:"The value will have the tooltip that contains the `valueTooltip` string to describe for the value.\nUsually use for shorten hex string"},valueFontWeight:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:'The typography font weight for the value\n@default "semibold"',defaultValue:{value:"'semibold'",computed:!1}}}}},"./src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],TooltipBody=_ref=>{let{button,children,className,title,isDisablePortal}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref,_excluded);const inner=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.UC,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_1___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded px-3 py-2","bg-mono-20 dark:bg-mono-200","border border-mono-60 dark:border-mono-180","webb-shadow-sm z-[9999]")},props,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className),children:[title&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h6",{className:"mb-2 utility",children:title}),children,button&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"flex justify-end mt-4",children:button})]})}));return isDisablePortal?inner:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.ZL,{children:inner})},TooltipTrigger=_ref2=>{let{children,className}=_ref2,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref2,_excluded2);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.l9,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({className},props,{children}))},Tooltip=_ref3=>{let{children,isDefaultOpen,isDisableHoverableContent,isOpen,onChange,delayDuration=100}=_ref3,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref3,_excluded3);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.Kq,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.bL,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration,children}))})};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./src/components/Tooltip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{SK:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.SK,k$:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.k$,m_:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.m_});var _Tooltip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/components/Tooltip/Tooltip.tsx")},"./src/hooks/useCopyable.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{x:()=>useCopyable});var copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/copy-to-clipboard/index.js"),copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0__),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js");const useCopyable=(display=3e3)=>{const ref=(0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(""),[isCopied,setIsCopied]=(0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(!1),timeoutRef_=(0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)();return(0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)((()=>()=>clearTimeout(timeoutRef_.current)),[]),{isCopied,copy:value=>{if(isCopied)return;ref.current=value,copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0___default()(value),setIsCopied(!0);const timeoutObj=setTimeout((()=>setIsCopied(!1)),display);timeoutRef_.current&&clearTimeout(timeoutRef_.current),timeoutRef_.current=timeoutObj},copiedText:ref.current}}},"./src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],DEFAULT_COMPONENT={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=_ref=>{let{children,className,component,fw="normal",ta="left",variant}=_ref,restProps=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__.A)(_ref,_excluded);const component_=null!=component?component:DEFAULT_COMPONENT[variant],className_=(0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_2__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_3__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(component_,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},restProps,{className:className_}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{fw:{defaultValue:{value:"'normal'",computed:!1},required:!1},ta:{defaultValue:{value:"'left'",computed:!1},required:!1}}}},"./src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/Typography.tsx")},"./src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/index.ts")},"./src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")||variant.startsWith("mkt-h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName})},"./src/utils/shortenHex.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{f:()=>shortenHex});const shortenHex=(hexStr,chars=4)=>{const hexLower=hexStr.toLowerCase(),isStartWith0x=hexLower.startsWith("0x");let startStr="",endStr="";return isStartWith0x&&hexLower.length<=2*chars+2?hexLower:!isStartWith0x&&hexLower.length<=2*chars?`0x${hexLower}`:(isStartWith0x?(startStr=hexLower.split("").slice(0,chars+2).join(""),endStr=hexLower.split("").slice(-chars).join("")):(startStr=hexLower.split("").slice(0,chars).join(""),endStr=hexLower.split("").slice(-chars).join("")),isStartWith0x?`${startStr}...${endStr}`:`0x${startStr}...${endStr}`)}},"./src/utils/shortenString.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{l:()=>shortenString});const shortenString=(str,chars=4)=>{if(str.length<=2*chars)return str;return`${str.split("").slice(0,chars).join("")}...${str.split("").slice(-chars).join("")}`}},"../../node_modules/@radix-ui/react-label/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{b:()=>Root});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/@radix-ui/react-primitive/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),Label=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_2__.sG.label,{...props,ref:forwardedRef,onMouseDown:event=>{event.target.closest("button, input, select, textarea")||(props.onMouseDown?.(event),!event.defaultPrevented&&event.detail>1&&event.preventDefault())}})));Label.displayName="Label";var Root=Label},"./src/stories/molecules/KeyValueWithButton.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_KeyValueWithButton__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/KeyValueWithButton/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/KeyValueWithButton",component:_components_KeyValueWithButton__WEBPACK_IMPORTED_MODULE_1__.L},Default=(args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_KeyValueWithButton__WEBPACK_IMPORTED_MODULE_1__.L,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({},args))).bind({});Default.args={keyValue:"0x958aa9ddbd62f989dec2fd1468bf436aebeb8be6",size:"sm",hasShortenValue:!0};const __namedExportsOrder=["Default"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"args => <KeyValueWithButton {...args} />",...Default.parameters?.docs?.source}}}},"../../node_modules/copy-to-clipboard/index.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var console=__webpack_require__("../../node_modules/console-browserify/index.js"),deselectCurrent=__webpack_require__("../../node_modules/toggle-selection/index.js"),clipboardToIE11Formatting={"text/plain":"Text","text/html":"Url",default:"Text"};module.exports=function copy(text,options){var debug,message,reselectPrevious,range,selection,mark,success=!1;options||(options={}),debug=options.debug||!1;try{if(reselectPrevious=deselectCurrent(),range=document.createRange(),selection=document.getSelection(),(mark=document.createElement("span")).textContent=text,mark.ariaHidden="true",mark.style.all="unset",mark.style.position="fixed",mark.style.top=0,mark.style.clip="rect(0, 0, 0, 0)",mark.style.whiteSpace="pre",mark.style.webkitUserSelect="text",mark.style.MozUserSelect="text",mark.style.msUserSelect="text",mark.style.userSelect="text",mark.addEventListener("copy",(function(e){if(e.stopPropagation(),options.format)if(e.preventDefault(),void 0===e.clipboardData){debug&&console.warn("unable to use e.clipboardData"),debug&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var format=clipboardToIE11Formatting[options.format]||clipboardToIE11Formatting.default;window.clipboardData.setData(format,text)}else e.clipboardData.clearData(),e.clipboardData.setData(options.format,text);options.onCopy&&(e.preventDefault(),options.onCopy(e.clipboardData))})),document.body.appendChild(mark),range.selectNodeContents(mark),selection.addRange(range),!document.execCommand("copy"))throw new Error("copy command was unsuccessful");success=!0}catch(err){debug&&console.error("unable to copy using execCommand: ",err),debug&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(options.format||"text",text),options.onCopy&&options.onCopy(window.clipboardData),success=!0}catch(err){debug&&console.error("unable to copy using clipboardData: ",err),debug&&console.error("falling back to prompt"),message=function format(message){var copyKey=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return message.replace(/#{\s*key\s*}/g,copyKey)}("message"in options?options.message:"Copy to clipboard: #{key}, Enter"),window.prompt(message,text)}}finally{selection&&("function"==typeof selection.removeRange?selection.removeRange(range):selection.removeAllRanges()),mark&&document.body.removeChild(mark),reselectPrevious()}return success}},"../../node_modules/toggle-selection/index.js":module=>{module.exports=function(){var selection=document.getSelection();if(!selection.rangeCount)return function(){};for(var active=document.activeElement,ranges=[],i=0;i<selection.rangeCount;i++)ranges.push(selection.getRangeAt(i));switch(active.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":active.blur();break;default:active=null}return selection.removeAllRanges(),function(){"Caret"===selection.type&&selection.removeAllRanges(),selection.rangeCount||ranges.forEach((function(range){selection.addRange(range)})),active&&active.focus()}}},"../../node_modules/viem/_esm/utils/data/isHex.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";function isHex(value,{strict=!0}={}){return!!value&&("string"==typeof value&&(strict?/^0x[0-9a-fA-F]*$/.test(value):value.startsWith("0x")))}__webpack_require__.d(__webpack_exports__,{q:()=>isHex})}}]);