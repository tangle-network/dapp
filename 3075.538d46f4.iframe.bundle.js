"use strict";(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[3075],{"./src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],TooltipBody=_ref=>{let{button,children,className,title,isDisablePortal}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref,_excluded);const inner=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.UC,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_1___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded px-3 py-2","bg-mono-20 dark:bg-mono-200","border border-mono-60 dark:border-mono-180","webb-shadow-sm z-[9999]")},props,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className),children:[title&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h6",{className:"mb-2 utility",children:title}),children,button&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"flex justify-end mt-4",children:button})]})}));return isDisablePortal?inner:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.ZL,{children:inner})},TooltipTrigger=_ref2=>{let{children,className}=_ref2,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref2,_excluded2);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.l9,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({className},props,{children}))},Tooltip=_ref3=>{let{children,isDefaultOpen,isDisableHoverableContent,isOpen,onChange,delayDuration=100}=_ref3,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref3,_excluded3);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.Kq,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_3__.bL,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration,children}))})};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./src/components/Tooltip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.SK,k$:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.k$,m_:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.m_});var _Tooltip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/components/Tooltip/Tooltip.tsx")},"./src/components/buttons/Button.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>buttons_Button});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),utils=__webpack_require__("../icons/src/utils.ts"),classnames=__webpack_require__("../../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Spinner=__webpack_require__("../icons/src/Spinner.tsx");const ButtonSpinner=props=>{const{children=(0,jsx_runtime.jsx)(Spinner.A,{darkMode:props.darkMode,className:"w-5 h-5"}),className,hasLabel=!1,placement="start"}=props,mergedClassName=(0,bundle_mjs.QP)("flex items-center",hasLabel?"relative":"absolute",hasLabel?"start"===placement?"mr-2":"ml-2":void 0,className);return(0,jsx_runtime.jsx)("div",{className:mergedClassName,children})},buttons_ButtonSpinner=ButtonSpinner;ButtonSpinner.__docgenInfo={description:"",methods:[],displayName:"ButtonSpinner",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},hasLabel:{required:!1,tsType:{name:"boolean"},description:"Indicates if the button has a label or not\n@default false"},placement:{required:!1,tsType:{name:"union",raw:"'start' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:"It determines the placement of the spinner when `isLoading` is `true`"}}};const classNames={primary:{base:{common:"rounded-full px-9 py-2 bg-purple-40 border-2 border-transparent text-mono-0 font-bold dark:bg-purple-50 dark:border-2 dark:border-purple-50",hover:"hover:bg-purple-50 dark:hover:bg-purple-60 dark:hover:border-purple-60",active:"active:bg-purple-60 dark:active:bg-purple-70 dark:active:border-purple-70",disabled:"disabled:bg-mono-80 dark:disabled:bg-mono-120 dark:disabled:border-transparent dark:disabled:text-mono-60"},md:"body1",sm:"body3"},secondary:{base:{common:"rounded-full px-9 py-2 bg-mono-0 border border-mono-200 text-mono-200 font-bold dark:bg-mono-180 dark:border-mono-0 dark:text-mono-0",hover:"hover:border-mono-180 hover:text-mono-180 hover:bg-mono-20 dark:hover:border-mono-20 dark:hover:text-mono-20 dark:hover:border-mono-20 dark:hover:bg-mono-170",active:"active:bg-mono-40 active:text-mono-180 dark:active:text-mono-20 dark:active:bg-mono-160",disabled:"disabled:border-mono-100 disabled:text-mono-100 disabled:bg-mono-20 dark:disabled:border-mono-120 dark:disabled:text-mono-120 dark:disabled:bg-mono-160"},md:"body1",sm:"body3"},utility:{base:{common:"rounded-lg px-3 py-2 bg-blue-0 text-blue-60 dark:bg-blue-120 dark:text-blue-40 font-bold border border-transparent",hover:"hover:bg-blue-10 dark:hover:bg-blue-110 dark:hover:text-blue-30",active:"active:bg-blue-10 active:border-blue-40 dark:active:border-blue-110 dark:active:text-blue-30",disabled:"disabled:text-blue-30 disabled:border-transparent dark:disabled:bg-blue-120 dark:disabled:text-blue-90 dark:disabled:opacity-50"},md:"body1",sm:"body4 uppercase"},link:{base:{common:"text-blue-60 dark:text-blue-50 font-bold",hover:"hover:border-blue-70 dark:hover:text-blue-30",active:"active:text-blue-80 dark:active:text-blue-20",disabled:"disabled:text-blue-30 dark:disabled:text-blue-20"},md:"body1",sm:"body4 uppercase"}};var react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js");const _excluded=["as","children","className","isDisabled","isFullWidth","isLoading","leftIcon","loadingText","rightIcon","size","spinner","spinnerPlacement","variant","isJustIcon"],Button=(0,react.forwardRef)(((props,ref)=>{const{as:asProps,children,className,isDisabled,isFullWidth,isLoading,leftIcon,loadingText,rightIcon,size="md",spinner,spinnerPlacement="start",variant="primary",isJustIcon}=props,restProps=(0,objectWithoutPropertiesLoose.A)(props,_excluded),[buttonProps,{tagName:Component}]=function useButtonProps({href,isDisabled,onClick,rel,role,tabIndex=0,tagName,target,type}){tagName||(tagName=null!=href||null!=target||null!=rel?"a":"button");const meta={tagName};if("button"===tagName)return[{type:type||"button",disabled:isDisabled},meta];const handleClick=event=>{(isDisabled||"a"===tagName&&function isTrivialHref(href){return!href||"#"===href.trim()}(href))&&event.preventDefault(),isDisabled?event.stopPropagation():null==onClick||onClick(event)};return"a"===tagName&&(href||(href="#"),isDisabled&&(href=void 0)),[{role:null!=role?role:"button",disabled:void 0,tabIndex:isDisabled?void 0:tabIndex,href,target:"a"===tagName?target:void 0,"aria-disabled":isDisabled||void 0,rel:"a"===tagName?rel:void 0,onClick:handleClick,onKeyDown:event=>{" "===event.key&&(event.preventDefault(),handleClick(event))}},meta]}((0,esm_extends.A)({tagName:asProps,isDisabled},restProps)),mergedClassName=(0,bundle_mjs.QP)("max-w-max",classnames_default()({"w-full max-w-none justify-center":isFullWidth}),function getButtonClassNameByVariant(variant,size){const{active,common,disabled,hover}=classNames[variant].base;return(0,bundle_mjs.QP)(classNames[variant][size],"box-border flex justify-center items-center disabled:pointer-events-none text-center disabled:pointer-events-none",common,hover,active,disabled)}(variant,size),isJustIcon&&"utility"===variant?"p-2":"",className),contentProps={children,leftIcon,rightIcon,variant};return(0,jsx_runtime.jsxs)(Component,(0,esm_extends.A)({},restProps,buttonProps,{disabled:buttonProps.disabled||isLoading,className:classnames_default()(mergedClassName),ref,children:[isLoading&&"start"===spinnerPlacement&&(0,jsx_runtime.jsx)(buttons_ButtonSpinner,{hasLabel:!!loadingText,children:spinner}),isLoading?loadingText||(0,jsx_runtime.jsx)("span",{className:"opacity-0",children:(0,jsx_runtime.jsx)(ButtonContent,(0,esm_extends.A)({},contentProps))}):(0,jsx_runtime.jsx)(ButtonContent,(0,esm_extends.A)({},contentProps)),isLoading&&"end"===spinnerPlacement&&(0,jsx_runtime.jsx)(buttons_ButtonSpinner,{hasLabel:!!loadingText,placement:"end",children:spinner})]}))}));function ButtonContent(props){const{children,leftIcon,rightIcon,variant}=props;return(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[leftIcon&&(0,jsx_runtime.jsx)("span",{className:classnames_default()(children?"link"===variant?"mr-1":"mr-2":null,"block !text-inherit","grow-0 shrink-0",(0,utils.yF)(leftIcon.props.size)),children:leftIcon}),(0,jsx_runtime.jsx)("span",{className:classnames_default()("block !text-inherit whitespace-nowrap"),children}),rightIcon&&(0,jsx_runtime.jsx)("span",{className:classnames_default()(children?"link"===variant?"ml-1":"ml-2":null,"block !text-inherit","grow-0 shrink-0",(0,utils.yF)(rightIcon.props.size)),children:rightIcon})]})}const buttons_Button=Button;Button.__docgenInfo={description:'The Webb Button Component\n\nProps:\n\n- `isLoading`: If `true`, the button will show a spinner\n- `isDisabled`: If `true`, the button will be disabled\n- `loadingText`: The label to show in the button when `isLoading` is true. If no text is passed, it only shows the spinner\n- `variant`: The button variant (default `primary`)\n- `leftIcon`: If added, the button will show an icon before the button\'s label\n- `rightIcon`:If added, the button will show an icon after the button\'s label\n- `spinner`: Replace the spinner component when `isLoading` is set to `true`\n- `spinnerPlacement`: It determines the placement of the spinner when `isLoading` is `true`\n- `size`: The button size\n\n@example\n\n```jsx\n <Button variant="secondary">Button</Button>\n <Button variant="utility" isLoading>Button</Button>\n```',methods:[],displayName:"Button",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},as:{required:!1,tsType:{name:"union",raw:"keyof JSX.IntrinsicElements | JSXElementConstructor<any>",elements:[{name:"JSX.IntrinsicElements"},{name:"JSXElementConstructor",elements:[{name:"any"}],raw:"JSXElementConstructor<any>"}]},description:"Control the underlying rendered element directly by passing in a valid\ncomponent type"},href:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Optionally specify an href to render a `<a>` tag styled as a button"},target:{required:!1,tsType:{name:"union",raw:"HTMLAttributeAnchorTarget | undefined",elements:[{name:"HTMLAttributeAnchorTarget"},{name:"undefined"}]},description:"Anchor target, when rendering an anchor as a button"},rel:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:""},isLoading:{required:!1,tsType:{name:"boolean"},description:"If `true`, the button will show a spinner"},isDisabled:{required:!1,tsType:{name:"boolean"},description:"If `true`, the button will be disabled"},loadingText:{required:!1,tsType:{name:"string"},description:"The label to show in the button when `isLoading` is true\nIf no text is passed, it only shows the spinner"},variant:{required:!1,tsType:{name:"union",raw:"'primary' | 'secondary' | 'utility' | 'link'",elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"},{name:"literal",value:"'utility'"},{name:"literal",value:"'link'"}]},description:'The button variant\n@default "primary"'},leftIcon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement<IconBase>",elements:[{name:"IconBase"}]},description:"If added, the button will show an icon before the button's label\n@type React.ReactElement"},rightIcon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement<IconBase>",elements:[{name:"IconBase"}]},description:"If added, the button will show an icon after the button's label"},spinner:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement<IconBase>",elements:[{name:"IconBase"}]},description:"Replace the spinner component when `isLoading` is set to `true`\n@type React.ReactElement"},spinnerPlacement:{required:!1,tsType:{name:"union",raw:"'start' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:'It determines the placement of the spinner when isLoading is true\n@default "start"'},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"}]},description:'The button size\n@default "md"'},isFullWidth:{required:!1,tsType:{name:"boolean"},description:"If `true`, the button will display as full width"},isJustIcon:{required:!1,tsType:{name:"boolean"},description:"If `true`, the size of the button will be adjusted to fit the icon based on the variant"}},composes:["ButtonBase"]}},"./src/components/buttons/ChainOrTokenButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_typography__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/typography/index.ts"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../icons/src/index.ts"),_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("../icons/src/utils.ts"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),react__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["className","value","displayValue","status","textClassName","disabled","placeholder","iconType","onClick","showChevron"],ChainOrTokenButton=(0,react__WEBPACK_IMPORTED_MODULE_4__.forwardRef)(((_ref2,ref)=>{let{className,value,displayValue,status,textClassName,disabled,placeholder="Select Chain",iconType,onClick,showChevron=!0}=_ref2,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__.A)(_ref2,_excluded);const IconCmp="chain"===iconType?_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.PW:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.xz,isToken="token"===iconType,handleClick=(0,react__WEBPACK_IMPORTED_MODULE_4__.useCallback)((e=>{disabled||void 0===onClick||onClick(e)}),[disabled,onClick]),isClickable=void 0!==onClick&&!disabled;var _ref;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__.A)({},props,{onClick:handleClick,type:"button",className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)("rounded-lg px-4 py-2",!isClickable&&"cursor-default",isToken?"bg-mono-40 dark:bg-mono-170":"bg-mono-20 dark:bg-mono-180",isClickable&&(isToken?"hover:bg-mono-60 hover:dark:bg-mono-160":"hover:bg-mono-40 hover:dark:bg-mono-170"),className),ref,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"flex items-center justify-between mr-1",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"flex items-center gap-3 min-w-[120px]",children:[value&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(IconCmp,{status,size:"xl",spinnersize:"lg",className:classnames__WEBPACK_IMPORTED_MODULE_3___default()(`shrink-0 grow-0 ${(0,_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_8__.yF)("xl")}`),name:value}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_typography__WEBPACK_IMPORTED_MODULE_1__.o,{variant:"h5",fw:"bold",className:textClassName,children:null!==(_ref=null!=displayValue?displayValue:value)&&void 0!==_ref?_ref:placeholder})]}),!disabled&&showChevron&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.yQ,{size:"lg",className:classnames__WEBPACK_IMPORTED_MODULE_3___default()(`shrink-0 grow-0 ${(0,_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_8__.yF)("lg")}`)})]})}))}));ChainOrTokenButton.displayName="ChainOrTokenButton";const __WEBPACK_DEFAULT_EXPORT__=ChainOrTokenButton;ChainOrTokenButton.__docgenInfo={description:"",methods:[],displayName:"ChainOrTokenButton",props:{placeholder:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Select Chain'",computed:!1}},iconClassName:{required:!1,tsType:{name:"string"},description:""},iconType:{required:!0,tsType:{name:"union",raw:"'chain' | 'token'",elements:[{name:"literal",value:"'chain'"},{name:"literal",value:"'token'"}]},description:""},displayValue:{required:!1,tsType:{name:"string"},description:""},showChevron:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"true",computed:!1}},value:{required:!1,tsType:{name:"string"},description:"The text to display in the button"},status:{required:!1,tsType:{name:"StatusIndicatorProps['variant']",raw:"StatusIndicatorProps['variant']"},description:"The status of the button"},textClassName:{required:!1,tsType:{name:"string"},description:"The className of the chain name"},dropdownClassName:{required:!1,tsType:{name:"string"},description:"The className of the dropdown icon"}}}},"./src/components/buttons/IconButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_Tooltip__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/components/Tooltip/index.ts");const _excluded=["className","tooltip"],IconButton=(0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(((_ref,ref)=>{let{className,tooltip}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);const content=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},props,{type:"button",ref,className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("p-2 rounded-lg","hover:bg-mono-20 dark:hover:bg-mono-160","text-mono-200 dark:text-mono-0",className)}));return void 0!==tooltip?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_Tooltip__WEBPACK_IMPORTED_MODULE_2__.m_,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Tooltip__WEBPACK_IMPORTED_MODULE_2__.k$,{asChild:!0,children:content}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Tooltip__WEBPACK_IMPORTED_MODULE_2__.SK,{children:tooltip})]}):content}));IconButton.displayName="IconButton";const __WEBPACK_DEFAULT_EXPORT__=IconButton;IconButton.__docgenInfo={description:"",methods:[],displayName:"IconButton",props:{tooltip:{required:!1,tsType:{name:"string"},description:""}}}},"./src/components/buttons/LoadingPill.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../icons/src/index.ts"),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["className","status"],LoadingPill=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)(((_ref,ref)=>{let{className,status="loading"}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},props,{type:"button",className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("rounded-full border-2 py-2 px-4","bg-mono-0/10 border-mono-60","hover:bg-mono-0/30","dark:bg-mono-0/5 dark:border-mono-140","dark:hover:bg-mono-0/10",className),ref,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"flex items-center justify-center",children:"loading"===status?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.y$,{size:"lg"}):"success"===status?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.ej,{className:"fill-green-70 dark:fill-green-50",size:"lg"}):"error"===status&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.Eb,{className:"fill-red-70 dark:fill-red-50",size:"lg"})})}))})),__WEBPACK_DEFAULT_EXPORT__=LoadingPill;LoadingPill.__docgenInfo={description:"",methods:[],displayName:"LoadingPill",props:{status:{required:!1,tsType:{name:"union",raw:"'success' | 'loading' | 'error'",elements:[{name:"literal",value:"'success'"},{name:"literal",value:"'loading'"},{name:"literal",value:"'error'"}]},description:'Status of the pill\n@default "loading"',defaultValue:{value:"'loading'",computed:!1}}}}},"./src/components/buttons/WalletButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("../icons/src/utils.ts"),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),viem__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("../../node_modules/viem/_esm/utils/data/isHex.js"),_typography_Typography__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./src/typography/Typography/index.ts"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/utils/index.ts"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../icons/src/index.ts");const _excluded=["accountName","wallet","address","className","addressClassname"],WalletButton=(0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(((_ref,ref)=>{let{accountName,wallet,address,className,addressClassname}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__.A)(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__.A)({},props,{type:"button",ref,className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)("rounded-lg py-2 px-4 max-w-56","bg-mono-0/10 dark:bg-mono-0/5","hover:bg-mono-100/10 dark:hover:bg-mono-0/10","border-2 border-mono-60 dark:border-mono-140",className),children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"flex items-center gap-2",children:[(0,react__WEBPACK_IMPORTED_MODULE_1__.cloneElement)(wallet.Logo,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__.A)({},wallet.Logo.props,{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)(wallet.Logo.props.className,`shrink-0 grow-0 ${(0,_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_8__.yF)("lg")}`)})),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"flex items-center",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_typography_Typography__WEBPACK_IMPORTED_MODULE_2__.o,{variant:"body1",fw:"bold",component:"p",className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)("truncate dark:text-mono-0",addressClassname),children:accountName||((0,viem__WEBPACK_IMPORTED_MODULE_9__.q)(address)?`${(0,_utils__WEBPACK_IMPORTED_MODULE_3__.f2)(address)}`:`${(0,_utils__WEBPACK_IMPORTED_MODULE_3__.l1)(address)}`)}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_4__.yQ,{size:"lg"})]})]})}))})),__WEBPACK_DEFAULT_EXPORT__=WalletButton;WalletButton.__docgenInfo={description:"",methods:[],displayName:"WalletButton",props:{wallet:{required:!0,tsType:{name:"WalletConfig"},description:"The wallet to display in the button"},address:{required:!0,tsType:{name:"string"},description:"The current address of the wallet"},accountName:{required:!1,tsType:{name:"string"},description:"The name of the account to display\nprior to the address"},addressClassname:{required:!1,tsType:{name:"string"},description:""}}}},"./src/components/buttons/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{$n:()=>_Button__WEBPACK_IMPORTED_MODULE_0__.A,K0:()=>_IconButton__WEBPACK_IMPORTED_MODULE_2__.A});var _Button__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/components/buttons/Button.tsx"),_IconButton__WEBPACK_IMPORTED_MODULE_2__=(__webpack_require__("./src/components/buttons/ChainOrTokenButton.tsx"),__webpack_require__("./src/components/buttons/IconButton.tsx"));__webpack_require__("./src/components/buttons/LoadingPill.tsx"),__webpack_require__("./src/components/buttons/WalletButton.tsx")},"./src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],DEFAULT_COMPONENT={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=_ref=>{let{children,className,component,fw="normal",ta="left",variant}=_ref,restProps=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__.A)(_ref,_excluded);const component_=null!=component?component:DEFAULT_COMPONENT[variant],className_=(0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_2__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_3__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(component_,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},restProps,{className:className_}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{fw:{defaultValue:{value:"'normal'",computed:!1},required:!1},ta:{defaultValue:{value:"'left'",computed:!1},required:!1}}}},"./src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/Typography.tsx")},"./src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/index.ts")},"./src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")||variant.startsWith("mkt-h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName})}}]);