"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[3657],{"./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,TooltipBody=function TooltipBody(_ref){var button=_ref.button,children=_ref.children,className=_ref.className,title=_ref.title,isDisablePortal=_ref.isDisablePortal,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded),inner=__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.UC,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_3___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded p-2","bg-mono-20 dark:bg-mono-160","webb-shadow-sm z-[9999]")},props),__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.i3,{className:"fill-current text-mono-20 dark:text-mono-160 webb-shadow-sm"}),__jsx("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className)},title&&__jsx("h6",{className:"mb-2 utility"},title),children,button&&__jsx("div",{className:"flex justify-end mt-4"},button)));return isDisablePortal?inner:__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.ZL,null,inner)},TooltipTrigger=function TooltipTrigger(_ref2){var children=_ref2.children,className=_ref2.className,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref2,_excluded2);return __jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.l9,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({className},props),children)},Tooltip=function Tooltip(_ref3){var children=_ref3.children,isDefaultOpen=_ref3.isDefaultOpen,isDisableHoverableContent=_ref3.isDisableHoverableContent,isOpen=_ref3.isOpen,onChange=_ref3.onChange,_ref3$delayDuration=_ref3.delayDuration,delayDuration=void 0===_ref3$delayDuration?100:_ref3$delayDuration,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref3,_excluded3);return __jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.Kq,null,__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.bL,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration}),children))};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/Tooltip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.SK,k$:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.k$,m_:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.m_});var _Tooltip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx")},"./libs/webb-ui-components/src/components/buttons/Button.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>buttons_Button});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),defineProperty=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),defineProperty_default=__webpack_require__.n(defineProperty),slicedToArray=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js"),slicedToArray_default=__webpack_require__.n(slicedToArray),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),utils=__webpack_require__("./libs/icons/src/utils.ts"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Spinner=__webpack_require__("./libs/icons/src/Spinner.tsx"),__jsx=react.createElement,ButtonSpinner=function ButtonSpinner(props){var _props$children=props.children,children=void 0===_props$children?__jsx(Spinner.y,{darkMode:props.darkMode,className:"w-5 h-5"}):_props$children,className=props.className,_props$hasLabel=props.hasLabel,hasLabel=void 0!==_props$hasLabel&&_props$hasLabel,_props$placement=props.placement,placement=void 0===_props$placement?"start":_props$placement,mergedClassName=(0,bundle_mjs.QP)("flex items-center",hasLabel?"relative":"absolute",hasLabel?"start"===placement?"mr-2":"ml-2":void 0,className);return __jsx("div",{className:mergedClassName},children)};const buttons_ButtonSpinner=ButtonSpinner;ButtonSpinner.__docgenInfo={description:"",methods:[],displayName:"ButtonSpinner",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},hasLabel:{required:!1,tsType:{name:"boolean"},description:"Indicates if the button has a label or not\n@default false"},placement:{required:!1,tsType:{name:"union",raw:"'start' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:"It determines the placement of the spinner when `isLoading` is `true`"}}};__webpack_require__("./node_modules/core-js/modules/es.string.trim.js");var classNames={primary:{base:{common:"rounded-full px-9 py-2 bg-purple-40 border-2 border-transparent text-mono-0 font-bold dark:bg-purple-50 dark:border-2 dark:border-purple-50",hover:"hover:bg-purple-50 dark:hover:bg-purple-60 dark:hover:border-purple-60",active:"active:bg-purple-60 dark:active:bg-purple-70 dark:active:border-purple-70",disabled:"disabled:bg-mono-80 dark:disabled:bg-mono-120 dark:disabled:border-transparent dark:disabled:text-mono-60"},md:"body1",sm:"body3"},secondary:{base:{common:"rounded-full px-9 py-2 bg-mono-0 border border-mono-200 text-mono-200 font-bold dark:bg-mono-180 dark:border-mono-0 dark:text-mono-0",hover:"hover:border-mono-180 hover:text-mono-180 hover:bg-mono-20 dark:hover:border-mono-20 dark:hover:text-mono-20 dark:hover:border-mono-20 dark:hover:bg-mono-170",active:"active:bg-mono-40 active:text-mono-180 dark:active:text-mono-20 dark:active:bg-mono-160",disabled:"disabled:border-mono-100 disabled:text-mono-100 disabled:bg-mono-20 dark:disabled:border-mono-120 dark:disabled:text-mono-120 dark:disabled:bg-mono-160"},md:"body1",sm:"body3"},utility:{base:{common:"rounded-lg px-3 py-2 bg-blue-0 text-blue-60 dark:bg-blue-120 dark:text-blue-40 font-bold border border-transparent",hover:"hover:bg-blue-10 dark:hover:text-blue-30",active:"active:bg-blue-10 active:border-blue-40 dark:active:border-blue-110 dark:active:text-blue-30",disabled:"disabled:text-blue-30 disabled:border-transparent dark:disabled:bg-blue-120 dark:disabled:text-blue-90"},md:"body1",sm:"body4 uppercase"},link:{base:{common:"text-blue-60 dark:text-blue-50 font-bold",hover:"hover:border-blue-70 dark:hover:text-blue-30",active:"active:text-blue-80 dark:active:text-blue-20",disabled:"disabled:text-blue-30 dark:disabled:text-blue-20"},md:"body1",sm:"body4 uppercase"}};var _excluded=["as","children","className","isDisabled","isFullWidth","isLoading","leftIcon","loadingText","rightIcon","size","spinner","spinnerPlacement","variant","isJustIcon"],Button_jsx=react.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}var Button=react.forwardRef((function(props,ref){var asProps=props.as,children=props.children,className=props.className,isDisabled=props.isDisabled,isFullWidth=props.isFullWidth,isLoading=props.isLoading,leftIcon=props.leftIcon,loadingText=props.loadingText,rightIcon=props.rightIcon,_props$size=props.size,size=void 0===_props$size?"md":_props$size,spinner=props.spinner,_props$spinnerPlaceme=props.spinnerPlacement,spinnerPlacement=void 0===_props$spinnerPlaceme?"start":_props$spinnerPlaceme,_props$variant=props.variant,variant=void 0===_props$variant?"primary":_props$variant,isJustIcon=props.isJustIcon,restProps=objectWithoutProperties_default()(props,_excluded),_useButtonProps=function useButtonProps(_ref){var href=_ref.href,isDisabled=_ref.isDisabled,onClick=_ref.onClick,rel=_ref.rel,role=_ref.role,_ref$tabIndex=_ref.tabIndex,tabIndex=void 0===_ref$tabIndex?0:_ref$tabIndex,tagName=_ref.tagName,target=_ref.target,type=_ref.type;tagName||(tagName=null!=href||null!=target||null!=rel?"a":"button");var meta={tagName};if("button"===tagName)return[{type:type||"button",disabled:isDisabled},meta];var handleClick=function handleClick(event){(isDisabled||"a"===tagName&&function isTrivialHref(href){return!href||"#"===href.trim()}(href))&&event.preventDefault(),isDisabled?event.stopPropagation():null==onClick||onClick(event)};return"a"===tagName&&(href||(href="#"),isDisabled&&(href=void 0)),[{role:null!=role?role:"button",disabled:void 0,tabIndex:isDisabled?void 0:tabIndex,href,target:"a"===tagName?target:void 0,"aria-disabled":isDisabled||void 0,rel:"a"===tagName?rel:void 0,onClick:handleClick,onKeyDown:function handleKeyDown(event){" "===event.key&&(event.preventDefault(),handleClick(event))}},meta]}(function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){defineProperty_default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}({tagName:asProps,isDisabled},restProps)),_useButtonProps2=slicedToArray_default()(_useButtonProps,2),buttonProps=_useButtonProps2[0],Component=_useButtonProps2[1].tagName,mergedClassName=(0,bundle_mjs.QP)("max-w-max",classnames_default()({"w-full max-w-none justify-center":isFullWidth}),function getButtonClassNameByVariant(variant,size){var _classNames$variant$b=classNames[variant].base,active=_classNames$variant$b.active,common=_classNames$variant$b.common,disabled=_classNames$variant$b.disabled,hover=_classNames$variant$b.hover;return(0,bundle_mjs.QP)(classNames[variant][size],"box-border flex justify-center items-center disabled:pointer-events-none text-center disabled:pointer-events-none",common,hover,active,disabled)}(variant,size),isJustIcon&&"utility"===variant?"p-2":"",className),contentProps={children,leftIcon,rightIcon,variant};return Button_jsx(Component,extends_default()({},restProps,buttonProps,{disabled:buttonProps.disabled||isLoading,className:classnames_default()(mergedClassName),ref}),isLoading&&"start"===spinnerPlacement&&Button_jsx(buttons_ButtonSpinner,{hasLabel:!!loadingText},spinner),isLoading?loadingText||Button_jsx("span",{className:"opacity-0"},Button_jsx(ButtonContent,contentProps)):Button_jsx(ButtonContent,contentProps),isLoading&&"end"===spinnerPlacement&&Button_jsx(buttons_ButtonSpinner,{hasLabel:!!loadingText,placement:"end"},spinner))}));function ButtonContent(props){var children=props.children,leftIcon=props.leftIcon,rightIcon=props.rightIcon,variant=props.variant;return Button_jsx(react.Fragment,null,leftIcon&&Button_jsx("span",{className:classnames_default()("link"===variant?"mr-1":"mr-2","block !text-inherit","grow-0 shrink-0",(0,utils.yF)(leftIcon.props.size))},leftIcon),Button_jsx("span",{className:classnames_default()("block !text-inherit whitespace-nowrap")},children),rightIcon&&Button_jsx("span",{className:classnames_default()("link"===variant?"ml-1":"ml-2","block !text-inherit","grow-0 shrink-0",(0,utils.yF)(rightIcon.props.size))},rightIcon))}const buttons_Button=Button;Button.__docgenInfo={description:'The Webb Button Component\n\nProps:\n\n- `isLoading`: If `true`, the button will show a spinner\n- `isDisabled`: If `true`, the button will be disabled\n- `loadingText`: The label to show in the button when `isLoading` is true. If no text is passed, it only shows the spinner\n- `variant`: The button variant (default `primary`)\n- `leftIcon`: If added, the button will show an icon before the button\'s label\n- `rightIcon`:If added, the button will show an icon after the button\'s label\n- `spinner`: Replace the spinner component when `isLoading` is set to `true`\n- `spinnerPlacement`: It determines the placement of the spinner when `isLoading` is `true`\n- `size`: The button size\n\n@example\n\n```jsx\n <Button variant="secondary">Button</Button>\n <Button variant="utility" isLoading>Button</Button>\n```',methods:[],displayName:"Button"}},"./libs/webb-ui-components/src/components/buttons/ChainOrTokenButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/icons/src/index.ts"),_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/icons/src/utils.ts"),classnames__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_5___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__),tailwind_merge__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["className","value","status","textClassName","disabled","placeholder","iconType"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,ChainOrTokenButton=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)((function(_ref,ref){var className=_ref.className,value=_ref.value,status=_ref.status,textClassName=_ref.textClassName,disabled=_ref.disabled,_ref$placeholder=_ref.placeholder,placeholder=void 0===_ref$placeholder?"Select Chain":_ref$placeholder,iconType=_ref.iconType,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded),textClsx=(0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)("font-bold",textClassName)}),[textClassName]),IconCmp=(0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)((function(){return"chain"===iconType?_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.PW:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.xz}),[iconType]);return __jsx("button",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{type:"button",className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)("rounded-lg border-2 p-2 pl-4","bg-mono-0/10 border-mono-60","hover:bg-mono-0/30","dark:bg-mono-0/5 dark:border-mono-140","dark:hover:bg-mono-0/10",className),ref}),__jsx("div",{className:"flex items-center justify-between mr-1"},__jsx("div",{className:"flex items-center gap-2.5"},value&&__jsx(IconCmp,{status,size:"lg",className:classnames__WEBPACK_IMPORTED_MODULE_5___default()("shrink-0 grow-0 ".concat((0,_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_4__.yF)("lg"))),name:value}),__jsx("p",{className:textClsx},null!=value?value:placeholder)),!disabled&&__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.yQ,{size:"lg",className:classnames__WEBPACK_IMPORTED_MODULE_5___default()("shrink-0 grow-0 ".concat((0,_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_4__.yF)("lg")))})))}));ChainOrTokenButton.displayName="ChainOrTokenButton";const __WEBPACK_DEFAULT_EXPORT__=ChainOrTokenButton;ChainOrTokenButton.__docgenInfo={description:"",methods:[],displayName:"ChainOrTokenButton",props:{placeholder:{defaultValue:{value:"'Select Chain'",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/buttons/LoadingPill.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/icons/src/index.ts"),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["className","status"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,LoadingPill=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)((function(_ref,ref){var className=_ref.className,_ref$status=_ref.status,status=void 0===_ref$status?"loading":_ref$status,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded);return __jsx("button",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{type:"button",className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)("rounded-full border-2 py-2 px-4","bg-mono-0/10 border-mono-60","hover:bg-mono-0/30","dark:bg-mono-0/5 dark:border-mono-140","dark:hover:bg-mono-0/10",className),ref}),__jsx("div",{className:"flex items-center justify-center"},"loading"===status?__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.y$,{size:"lg"}):"success"===status?__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.ej,{className:"fill-green-70 dark:fill-green-50",size:"lg"}):"error"===status&&__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.Eb,{className:"fill-red-70 dark:fill-red-50",size:"lg"})))}));const __WEBPACK_DEFAULT_EXPORT__=LoadingPill;LoadingPill.__docgenInfo={description:"",methods:[],displayName:"LoadingPill",props:{status:{defaultValue:{value:"'loading'",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/buttons/WalletButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3__),react__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./libs/icons/src/utils.ts"),tailwind_merge__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),viem__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("./node_modules/viem/_esm/utils/data/isHex.js"),_typography_Typography__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),_utils__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./libs/webb-ui-components/src/utils/index.ts"),_excluded=["accountName","wallet","address","className","addressClassname"],__jsx=react__WEBPACK_IMPORTED_MODULE_4__.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2___default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var WalletButton=(0,react__WEBPACK_IMPORTED_MODULE_4__.forwardRef)((function(_ref,ref){var accountName=_ref.accountName,wallet=_ref.wallet,address=_ref.address,className=_ref.className,addressClassname=_ref.addressClassname,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3___default()(_ref,_excluded),addressClx=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_8__.QP)("truncate dark:text-mono-0",addressClassname)}),[addressClassname]);return __jsx("button",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1___default()({},props,{type:"button",ref,className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_8__.QP)("rounded-full border-2 py-2 px-4 max-w-52","bg-mono-0/10 border-mono-60","hover:bg-mono-0/30","dark:bg-mono-0/5 dark:border-mono-140","dark:hover:bg-mono-0/10",className)}),__jsx("div",{className:"flex items-center gap-2"},(0,react__WEBPACK_IMPORTED_MODULE_4__.cloneElement)(wallet.Logo,_objectSpread(_objectSpread({},wallet.Logo.props),{},{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_8__.QP)(wallet.Logo.props.className,"shrink-0 grow-0 ".concat((0,_webb_tools_icons_utils__WEBPACK_IMPORTED_MODULE_5__.yF)("lg")))})),__jsx(_typography_Typography__WEBPACK_IMPORTED_MODULE_6__.o,{variant:"body1",fw:"bold",component:"p",className:addressClx},accountName||((0,viem__WEBPACK_IMPORTED_MODULE_9__.q)(address)?"".concat((0,_utils__WEBPACK_IMPORTED_MODULE_7__.f2)(address)):"".concat((0,_utils__WEBPACK_IMPORTED_MODULE_7__.l1)(address))))))}));const __WEBPACK_DEFAULT_EXPORT__=WalletButton;WalletButton.__docgenInfo={description:"",methods:[],displayName:"WalletButton"}},"./libs/webb-ui-components/src/components/buttons/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Button:()=>Button.A,IconButton:()=>buttons_IconButton});var Button=__webpack_require__("./libs/webb-ui-components/src/components/buttons/Button.tsx"),helpers_extends=(__webpack_require__("./libs/webb-ui-components/src/components/buttons/ChainOrTokenButton.tsx"),__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js")),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Tooltip=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/index.ts"),_excluded=["className","tooltip"],__jsx=react.createElement,IconButton=(0,react.forwardRef)((function(_ref,ref){var className=_ref.className,tooltip=_ref.tooltip,props=objectWithoutProperties_default()(_ref,_excluded),content=__jsx("button",extends_default()({},props,{type:"button",ref,className:(0,bundle_mjs.QP)("p-2 rounded-lg","hover:bg-mono-20 dark:hover:bg-mono-160","text-mono-200 dark:text-mono-0",className)}));return void 0!==tooltip?__jsx(Tooltip.m_,null,__jsx(Tooltip.k$,{asChild:!0},content),__jsx(Tooltip.SK,null,tooltip)):content}));IconButton.displayName="IconButton";const buttons_IconButton=IconButton;IconButton.__docgenInfo={description:"",methods:[],displayName:"IconButton"};__webpack_require__("./libs/webb-ui-components/src/components/buttons/LoadingPill.tsx"),__webpack_require__("./libs/webb-ui-components/src/components/buttons/WalletButton.tsx")},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__),react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts"),_excluded=["children","className","component","fw","ta","variant"];function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=function Typography(props){var children=props.children,className=props.className,component=props.component,_props$fw=props.fw,fw=void 0===_props$fw?"normal":_props$fw,_props$ta=props.ta,ta=void 0===_props$ta?"left":_props$ta,variant=props.variant,restProps=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default()(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return null!=component?component:defaultComponent[variant]}),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("".concat(variant),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.Qe)(variant),className)}),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_3__.createElement)(_component,_objectSpread(_objectSpread({},restProps),{},{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}}}]);