"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[4465],{"./libs/webb-ui-components/src/stories/molecules/CheckBoxMenu.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _Default_parameters,_Default_parameters_docs,_Default_parameters1,react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/icons/src/index.ts"),_components_CheckBoxMenu__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/CheckBoxMenu/index.ts"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement;const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/CheckBoxMenu",component:_components_CheckBoxMenu__WEBPACK_IMPORTED_MODULE_2__.L};var Default=function Template(args){return __jsx(_components_CheckBoxMenu__WEBPACK_IMPORTED_MODULE_2__.L,args)}.bind({});Default.args={label:"Filter",icon:__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.YG,null)},Default.parameters={...Default.parameters,docs:{...null===(_Default_parameters=Default.parameters)||void 0===_Default_parameters?void 0:_Default_parameters.docs,source:{originalSource:"args => <CheckBoxMenu {...args} />",...null===(_Default_parameters1=Default.parameters)||void 0===_Default_parameters1||null===(_Default_parameters_docs=_Default_parameters1.docs)||void 0===_Default_parameters_docs?void 0:_Default_parameters_docs.source}}};const __namedExportsOrder=["Default"]},"./libs/webb-ui-components/src/components/CheckBox/Checkbox.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>CheckBox});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_webb_tools_icons_InformationLine__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/icons/src/InformationLine.tsx"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_Tooltip_Tooltip__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx"),_buttons_Button__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./libs/webb-ui-components/src/components/buttons/Button.tsx"),__jsx=react__WEBPACK_IMPORTED_MODULE_1__.createElement,CheckBox=function CheckBox(props){var _info$buttonText,children=props.children,className=props.className,id=props.id,info=props.info,_props$inputProps=props.inputProps,inputProps=void 0===_props$inputProps?{}:_props$inputProps,isChecked=props.isChecked,isDisabled=props.isDisabled,labelClsxProp=props.labelClassName,_props$labelVariant=props.labelVariant,labelVariant=void 0===_props$labelVariant?"body1":_props$labelVariant,onChange=props.onChange,_props$spacingClassNa=props.spacingClassName,spacingClassName=void 0===_props$spacingClassNa?"ml-2":_props$spacingClassNa,wrapperClassName=props.wrapperClassName,mergedInputClsx=(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)("cursor-pointer disabled:cursor-not-allowed peer-disabled:cursor-not-allowed","form-checkbox peer transition-none bg-mono-0 w-[18px] h-[18px] rounded border border-mono-100 outline-none dark:bg-mono-180","enabled:hover:shadow-sm enabled:hover:shadow-blue-10 dark:hover:shadow-none","checked:bg-blue-70 dark:checked:bg-blue-50","disabled:border-mono-60 disabled:cursor-not-allowed disabled:bg-mono-0 disabled:shadow-none dark:disabled:bg-mono-140 dark:disabled:border-mono-120",className),labelClsx=classnames__WEBPACK_IMPORTED_MODULE_3___default()("inline-block peer-disabled:cursor-not-allowed peer-disabled:text-mono-100","text-mono-140 dark:text-mono-20",labelVariant,spacingClassName),mergedLabelClsx=(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)(labelClsx,labelClsxProp);return __jsx("label",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)("inline-flex min-h-[28px]",wrapperClassName)},__jsx("input",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({id,type:"checkbox",className:mergedInputClsx,checked:isChecked,onChange,disabled:isDisabled},inputProps)),children&&__jsx("label",{className:mergedLabelClsx},children),info&&__jsx(_Tooltip_Tooltip__WEBPACK_IMPORTED_MODULE_4__.m_,{delayDuration:100},__jsx(_Tooltip_Tooltip__WEBPACK_IMPORTED_MODULE_4__.k$,{className:"ml-1 text-center",asChild:!0},__jsx("span",{className:"cursor-pointer peer-disabled:text-mono-120"},__jsx(_webb_tools_icons_InformationLine__WEBPACK_IMPORTED_MODULE_2__.B,{className:"!fill-current pointer-events-none"}))),__jsx(_Tooltip_Tooltip__WEBPACK_IMPORTED_MODULE_4__.SK,{title:info.title,className:"max-w-[185px] break-normal",button:info.buttonProps&&__jsx(_buttons_Button__WEBPACK_IMPORTED_MODULE_5__.A,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},info.buttonProps,{variant:"utility",size:"sm"}),null!==(_info$buttonText=info.buttonText)&&void 0!==_info$buttonText?_info$buttonText:"Learn more")},info.content)))};CheckBox.__docgenInfo={description:"The `CheckBox` component\n\nProps:\n\n- `isDisabled`: If `true`, the checkbox will be disabled\n- `spacing`: The spacing between the checkbox and its label text (default: `4`)\n- `isChecked`: If `true`, the checkbox will be checked.\n- `onChange`: The callback invoked when the checked state of the `Checkbox` changes\n- `inputProps`: Additional props to be forwarded to the `input` element\n- `htmlFor`: Input id and value for `htmlFor` attribute of `<label></label>` tag\n- `labelClassName`: Class name in case of overriding the tailwind class of the `<label></label>` tag\n- `wrapperClassName`: Class name in case of overriding the tailwind class of the checkbox container\n\n@example\n\n```jsx\n <CheckBox />\n <CheckBox isDisabled />\n <CheckBox isDisabled>Check mark</CheckBox>\n```",methods:[],displayName:"CheckBox",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},isDisabled:{required:!1,tsType:{name:"boolean"},description:"If `true`, the checkbox will be disabled"},spacingClassName:{required:!1,tsType:{name:"string"},description:'The spacing between the checkbox and its label text\n@default "ml-4"\n@type tailwind spacing'},isChecked:{required:!1,tsType:{name:"boolean"},description:"If `true`, the checkbox will be checked.\nYou'll need to pass `onChange` to update its value (since it is now controlled)"},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(event: React.ChangeEvent<HTMLInputElement>) => void",signature:{arguments:[{type:{name:"ReactChangeEvent",raw:"React.ChangeEvent<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},name:"event"}],return:{name:"void"}}},description:"The callback invoked when the checked state of the `Checkbox` changes."},inputProps:{required:!1,tsType:{name:"ReactInputHTMLAttributes",raw:"React.InputHTMLAttributes<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},description:"Additional props to be forwarded to the `input` element"},labelClassName:{required:!1,tsType:{name:"string"},description:"Class name in case of overriding the tailwind class of the `<label></label>` tag"},wrapperClassName:{required:!1,tsType:{name:"string"},description:"Class name in case of overriding the tailwind class of the checkbox container"},labelVariant:{required:!1,tsType:{name:"union",raw:"| HeadingVariant\n| BodyVariant\n| MonospaceVariant\n| ParagraphVariant\n| LabelVariant\n| MarketingVariant",elements:[{name:"union",raw:"'h1' | 'h2' | 'h3' | 'h4' | 'h5'",elements:[{name:"literal",value:"'h1'"},{name:"literal",value:"'h2'"},{name:"literal",value:"'h3'"},{name:"literal",value:"'h4'"},{name:"literal",value:"'h5'"}]},{name:"union",raw:"'body1' | 'body2' | 'body3' | 'body4'",elements:[{name:"literal",value:"'body1'"},{name:"literal",value:"'body2'"},{name:"literal",value:"'body3'"},{name:"literal",value:"'body4'"}]},{name:"union",raw:"'mono1' | 'mono2' | 'mkt-monospace'",elements:[{name:"literal",value:"'mono1'"},{name:"literal",value:"'mono2'"},{name:"literal",value:"'mkt-monospace'"}]},{name:"union",raw:"'para1' | 'para2'",elements:[{name:"literal",value:"'para1'"},{name:"literal",value:"'para2'"}]},{name:"union",raw:"'label' | 'utility'",elements:[{name:"literal",value:"'label'"},{name:"literal",value:"'utility'"}]},{name:"union",raw:"| 'mkt-h1'\n| 'mkt-h2'\n| 'mkt-h3'\n| 'mkt-h4'\n| 'mkt-subheading'\n| 'mkt-body1'\n| 'mkt-body2'\n| 'mkt-small-caps'\n| 'mkt-caption'\n| 'mkt-monospace'",elements:[{name:"literal",value:"'mkt-h1'"},{name:"literal",value:"'mkt-h2'"},{name:"literal",value:"'mkt-h3'"},{name:"literal",value:"'mkt-h4'"},{name:"literal",value:"'mkt-subheading'"},{name:"literal",value:"'mkt-body1'"},{name:"literal",value:"'mkt-body2'"},{name:"literal",value:"'mkt-small-caps'"},{name:"literal",value:"'mkt-caption'"},{name:"literal",value:"'mkt-monospace'"}]}]},description:'The label typography variant\n@default "body1"'},info:{required:!1,tsType:{name:"Partial",elements:[{name:"signature",type:"object",raw:'{\n  /**\n   * The title of the info\n   */\n  title: string;\n\n  /**\n   * The content of the info\n   */\n  content: string;\n\n  /**\n   * The text of the button\n   * @default "Learn more"\n   */\n  buttonText: string;\n\n  /**\n   * Other props to be forwarded to the button (e.g. `href`, `onClick`)\n   */\n  buttonProps: ComponentProps<typeof Button>;\n}',signature:{properties:[{key:"title",value:{name:"string",required:!0},description:"The title of the info"},{key:"content",value:{name:"string",required:!0},description:"The content of the info"},{key:"buttonText",value:{name:"string",required:!0},description:'The text of the button\n@default "Learn more"'},{key:"buttonProps",value:{name:"ComponentProps",elements:[{name:"Button"}],raw:"ComponentProps<typeof Button>",required:!0},description:"Other props to be forwarded to the button (e.g. `href`, `onClick`)"}]}}],raw:'Partial<{\n  /**\n   * The title of the info\n   */\n  title: string;\n\n  /**\n   * The content of the info\n   */\n  content: string;\n\n  /**\n   * The text of the button\n   * @default "Learn more"\n   */\n  buttonText: string;\n\n  /**\n   * Other props to be forwarded to the button (e.g. `href`, `onClick`)\n   */\n  buttonProps: ComponentProps<typeof Button>;\n}>'},description:"More info about the checkbox"}}}},"./libs/webb-ui-components/src/components/CheckBox/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Checkbox__WEBPACK_IMPORTED_MODULE_0__.o});var _Checkbox__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/CheckBox/Checkbox.tsx")},"./libs/webb-ui-components/src/components/CheckBoxMenu/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{L:()=>CheckBoxMenu});__webpack_require__("./node_modules/core-js/modules/es.regexp.to-string.js");var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),CheckBox=__webpack_require__("./libs/webb-ui-components/src/components/CheckBox/index.ts"),_excluded=["checkboxProps","children","className","labelClassName","icon","label","onChange"],__jsx=react.createElement,CheckBoxMenu=react.forwardRef((function(_ref,ref){var checkboxProps=_ref.checkboxProps,clsxProp=(_ref.children,_ref.className),labelClassName=_ref.labelClassName,icon=_ref.icon,label=_ref.label,onChange=_ref.onChange,props=objectWithoutProperties_default()(_ref,_excluded),className=(0,react.useMemo)((function(){return(0,bundle_mjs.QP)(classnames_default()("flex cursor-pointer items-center px-4 py-2 text-base outline-none capitalize","text-mono-140 dark:text-mono-80","hover:bg-blue-0 dark:hover:bg-blue-120","radix-state-checked:text-blue dark:radix-state-checked:text-blue-50","radix-state-active:text-blue dark:radix-state-active:text-blue-50"),clsxProp)}),[clsxProp]),id=(0,react.useMemo)((function(){return Math.random().toString(16)}),[]),inputProps=(0,react.useMemo)((function(){return null!=checkboxProps?checkboxProps:{}}),[checkboxProps]);return __jsx("label",extends_default()({htmlFor:id,role:"listitem",className},props,{ref}),__jsx("span",{className:"text-inherit dark:text-inherit"},icon),__jsx("span",{className:classnames_default()("flex-grow px-2",labelClassName)},label),__jsx(CheckBox.o,extends_default()({id,onChange},inputProps)))}));CheckBoxMenu.__docgenInfo={description:"The `CheckBoxMenu` component\n\nProps:\n\n- `icon`: The optional icon displayed after the text\n- `label`: The label to be displayed could be string or JSX\n\n@example\n\n```jsx\n <CheckBoxMenu icon={<Filter />} label={Filter}/>\n <CheckBoxMenu\n   checkboxProps={{ isChecked: isChecked }}\n   icon={<Filter />} label={<h3>Filter</Filter>} onChange={() =>{ }\n />\n```",methods:[],displayName:"CheckBoxMenu"};__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/toConsumableArray.js"),react.createElement},"./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,TooltipBody=function TooltipBody(_ref){var button=_ref.button,children=_ref.children,className=_ref.className,title=_ref.title,isDisablePortal=_ref.isDisablePortal,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded),inner=__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.UC,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_3___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded p-2","bg-mono-20 dark:bg-mono-160","webb-shadow-sm z-[9999]")},props),__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.i3,{className:"fill-current text-mono-20 dark:text-mono-160 webb-shadow-sm"}),__jsx("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className)},title&&__jsx("h6",{className:"mb-2 utility"},title),children,button&&__jsx("div",{className:"flex justify-end mt-4"},button)));return isDisablePortal?inner:__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.ZL,null,inner)},TooltipTrigger=function TooltipTrigger(_ref2){var children=_ref2.children,className=_ref2.className,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref2,_excluded2);return __jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.l9,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({className},props),children)},Tooltip=function Tooltip(_ref3){var children=_ref3.children,isDefaultOpen=_ref3.isDefaultOpen,isDisableHoverableContent=_ref3.isDisableHoverableContent,isOpen=_ref3.isOpen,onChange=_ref3.onChange,_ref3$delayDuration=_ref3.delayDuration,delayDuration=void 0===_ref3$delayDuration?100:_ref3$delayDuration,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref3,_excluded3);return __jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.Kq,null,__jsx(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.bL,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration}),children))};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/buttons/Button.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>buttons_Button});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),defineProperty=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),defineProperty_default=__webpack_require__.n(defineProperty),slicedToArray=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js"),slicedToArray_default=__webpack_require__.n(slicedToArray),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),utils=__webpack_require__("./libs/icons/src/utils.ts"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Spinner=__webpack_require__("./libs/icons/src/Spinner.tsx"),__jsx=react.createElement,ButtonSpinner=function ButtonSpinner(props){var _props$children=props.children,children=void 0===_props$children?__jsx(Spinner.y,{darkMode:props.darkMode,className:"w-5 h-5"}):_props$children,className=props.className,_props$hasLabel=props.hasLabel,hasLabel=void 0!==_props$hasLabel&&_props$hasLabel,_props$placement=props.placement,placement=void 0===_props$placement?"start":_props$placement,mergedClassName=(0,bundle_mjs.QP)("flex items-center",hasLabel?"relative":"absolute",hasLabel?"start"===placement?"mr-2":"ml-2":void 0,className);return __jsx("div",{className:mergedClassName},children)};const buttons_ButtonSpinner=ButtonSpinner;ButtonSpinner.__docgenInfo={description:"",methods:[],displayName:"ButtonSpinner",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},hasLabel:{required:!1,tsType:{name:"boolean"},description:"Indicates if the button has a label or not\n@default false"},placement:{required:!1,tsType:{name:"union",raw:"'start' | 'end'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'end'"}]},description:"It determines the placement of the spinner when `isLoading` is `true`"}}};__webpack_require__("./node_modules/core-js/modules/es.string.trim.js");var classNames={primary:{base:{common:"rounded-full px-9 py-2 bg-purple-40 border-2 border-transparent text-mono-0 font-bold dark:bg-purple-50 dark:border-2 dark:border-purple-50",hover:"hover:bg-purple-50 dark:hover:bg-purple-60 dark:hover:border-purple-60",active:"active:bg-purple-60 dark:active:bg-purple-70 dark:active:border-purple-70",disabled:"disabled:bg-mono-80 dark:disabled:bg-mono-120 dark:disabled:border-transparent dark:disabled:text-mono-60"},md:"body1",sm:"body3"},secondary:{base:{common:"rounded-full px-9 py-2 bg-mono-0 border border-mono-200 text-mono-200 font-bold dark:bg-mono-180 dark:border-mono-0 dark:text-mono-0",hover:"hover:border-mono-180 hover:text-mono-180 hover:bg-mono-20 dark:hover:border-mono-20 dark:hover:text-mono-20 dark:hover:border-mono-20 dark:hover:bg-mono-170",active:"active:bg-mono-40 active:text-mono-180 dark:active:text-mono-20 dark:active:bg-mono-160",disabled:"disabled:border-mono-100 disabled:text-mono-100 disabled:bg-mono-20 dark:disabled:border-mono-120 dark:disabled:text-mono-120 dark:disabled:bg-mono-160"},md:"body1",sm:"body3"},utility:{base:{common:"rounded-lg px-3 py-2 bg-blue-0 text-blue-60 dark:bg-blue-120 dark:text-blue-40 font-bold border border-transparent",hover:"hover:bg-blue-10 dark:hover:text-blue-30",active:"active:bg-blue-10 active:border-blue-40 dark:active:border-blue-110 dark:active:text-blue-30",disabled:"disabled:text-blue-30 disabled:border-transparent dark:disabled:bg-blue-120 dark:disabled:text-blue-90"},md:"body1",sm:"body4 uppercase"},link:{base:{common:"text-blue-60 dark:text-blue-50 font-bold",hover:"hover:border-blue-70 dark:hover:text-blue-30",active:"active:text-blue-80 dark:active:text-blue-20",disabled:"disabled:text-blue-30 dark:disabled:text-blue-20"},md:"body1",sm:"body4 uppercase"}};var _excluded=["as","children","className","isDisabled","isFullWidth","isLoading","leftIcon","loadingText","rightIcon","size","spinner","spinnerPlacement","variant","isJustIcon"],Button_jsx=react.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}var Button=react.forwardRef((function(props,ref){var asProps=props.as,children=props.children,className=props.className,isDisabled=props.isDisabled,isFullWidth=props.isFullWidth,isLoading=props.isLoading,leftIcon=props.leftIcon,loadingText=props.loadingText,rightIcon=props.rightIcon,_props$size=props.size,size=void 0===_props$size?"md":_props$size,spinner=props.spinner,_props$spinnerPlaceme=props.spinnerPlacement,spinnerPlacement=void 0===_props$spinnerPlaceme?"start":_props$spinnerPlaceme,_props$variant=props.variant,variant=void 0===_props$variant?"primary":_props$variant,isJustIcon=props.isJustIcon,restProps=objectWithoutProperties_default()(props,_excluded),_useButtonProps=function useButtonProps(_ref){var href=_ref.href,isDisabled=_ref.isDisabled,onClick=_ref.onClick,rel=_ref.rel,role=_ref.role,_ref$tabIndex=_ref.tabIndex,tabIndex=void 0===_ref$tabIndex?0:_ref$tabIndex,tagName=_ref.tagName,target=_ref.target,type=_ref.type;tagName||(tagName=null!=href||null!=target||null!=rel?"a":"button");var meta={tagName};if("button"===tagName)return[{type:type||"button",disabled:isDisabled},meta];var handleClick=function handleClick(event){(isDisabled||"a"===tagName&&function isTrivialHref(href){return!href||"#"===href.trim()}(href))&&event.preventDefault(),isDisabled?event.stopPropagation():null==onClick||onClick(event)};return"a"===tagName&&(href||(href="#"),isDisabled&&(href=void 0)),[{role:null!=role?role:"button",disabled:void 0,tabIndex:isDisabled?void 0:tabIndex,href,target:"a"===tagName?target:void 0,"aria-disabled":isDisabled||void 0,rel:"a"===tagName?rel:void 0,onClick:handleClick,onKeyDown:function handleKeyDown(event){" "===event.key&&(event.preventDefault(),handleClick(event))}},meta]}(function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){defineProperty_default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}({tagName:asProps,isDisabled},restProps)),_useButtonProps2=slicedToArray_default()(_useButtonProps,2),buttonProps=_useButtonProps2[0],Component=_useButtonProps2[1].tagName,mergedClassName=(0,bundle_mjs.QP)("max-w-max",classnames_default()({"w-full max-w-none justify-center":isFullWidth}),function getButtonClassNameByVariant(variant,size){var _classNames$variant$b=classNames[variant].base,active=_classNames$variant$b.active,common=_classNames$variant$b.common,disabled=_classNames$variant$b.disabled,hover=_classNames$variant$b.hover;return(0,bundle_mjs.QP)(classNames[variant][size],"box-border flex justify-center items-center disabled:pointer-events-none text-center disabled:pointer-events-none",common,hover,active,disabled)}(variant,size),isJustIcon&&"utility"===variant?"p-2":"",className),contentProps={children,leftIcon,rightIcon,variant};return Button_jsx(Component,extends_default()({},restProps,buttonProps,{disabled:buttonProps.disabled||isLoading,className:classnames_default()(mergedClassName),ref}),isLoading&&"start"===spinnerPlacement&&Button_jsx(buttons_ButtonSpinner,{hasLabel:!!loadingText},spinner),isLoading?loadingText||Button_jsx("span",{className:"opacity-0"},Button_jsx(ButtonContent,contentProps)):Button_jsx(ButtonContent,contentProps),isLoading&&"end"===spinnerPlacement&&Button_jsx(buttons_ButtonSpinner,{hasLabel:!!loadingText,placement:"end"},spinner))}));function ButtonContent(props){var children=props.children,leftIcon=props.leftIcon,rightIcon=props.rightIcon,variant=props.variant;return Button_jsx(react.Fragment,null,leftIcon&&Button_jsx("span",{className:classnames_default()("link"===variant?"mr-1":"mr-2","block !text-inherit","grow-0 shrink-0",(0,utils.yF)(leftIcon.props.size))},leftIcon),Button_jsx("span",{className:classnames_default()("block !text-inherit whitespace-nowrap")},children),rightIcon&&Button_jsx("span",{className:classnames_default()("link"===variant?"ml-1":"ml-2","block !text-inherit","grow-0 shrink-0",(0,utils.yF)(rightIcon.props.size))},rightIcon))}const buttons_Button=Button;Button.__docgenInfo={description:'The Webb Button Component\n\nProps:\n\n- `isLoading`: If `true`, the button will show a spinner\n- `isDisabled`: If `true`, the button will be disabled\n- `loadingText`: The label to show in the button when `isLoading` is true. If no text is passed, it only shows the spinner\n- `variant`: The button variant (default `primary`)\n- `leftIcon`: If added, the button will show an icon before the button\'s label\n- `rightIcon`:If added, the button will show an icon after the button\'s label\n- `spinner`: Replace the spinner component when `isLoading` is set to `true`\n- `spinnerPlacement`: It determines the placement of the spinner when `isLoading` is `true`\n- `size`: The button size\n\n@example\n\n```jsx\n <Button variant="secondary">Button</Button>\n <Button variant="utility" isLoading>Button</Button>\n```',methods:[],displayName:"Button"}}}]);