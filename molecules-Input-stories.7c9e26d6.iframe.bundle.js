/*! For license information please see molecules-Input-stories.7c9e26d6.iframe.bundle.js.LICENSE.txt */
(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[5397],{"./libs/webb-ui-components/src/stories/molecules/Input.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,IsDisabled:()=>IsDisabled,IsInvalid:()=>IsInvalid,WithError:()=>WithError,WithPlaceholder:()=>WithPlaceholder,WithReadonly:()=>WithReadonly,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _Default_parameters,_Default_parameters_docs,_Default_parameters1,_WithPlaceholder_parameters,_WithPlaceholder_parameters_docs,_WithPlaceholder_parameters1,_WithReadonly_parameters,_WithReadonly_parameters_docs,_WithReadonly_parameters1,_IsDisabled_parameters,_IsDisabled_parameters_docs,_IsDisabled_parameters1,_IsInvalid_parameters,_IsInvalid_parameters_docs,_IsInvalid_parameters1,_WithError_parameters,_WithError_parameters_docs,_WithError_parameters1,react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_components_Input_Input__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/webb-ui-components/src/components/Input/Input.tsx"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement;const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/Input",component:_components_Input_Input__WEBPACK_IMPORTED_MODULE_1__.p};var Template=function Template(args){return __jsx(_components_Input_Input__WEBPACK_IMPORTED_MODULE_1__.p,args)},Default=Template.bind({});Default.args={id:"Default"};var WithPlaceholder=Template.bind({});WithPlaceholder.args={id:"default",placeholder:"With placeholder",className:"mt-3"};var WithReadonly=Template.bind({});WithReadonly.args={id:"readonly",value:"Readonly",isReadOnly:!0,className:"mt-3"};var IsDisabled=Template.bind({});IsDisabled.args={id:"disabled",name:"disabled",value:"disabled",isDisabled:!0,className:"mt-3"};var IsInvalid=Template.bind({});IsInvalid.args={id:"invalid",value:"isInvalid",isInvalid:!0,className:"mt-3"};var WithError=Template.bind({});WithError.args={id:"withError",value:"withError",isInvalid:!0,errorMessage:"Error message",className:"mt-3"},Default.parameters={...Default.parameters,docs:{...null===(_Default_parameters=Default.parameters)||void 0===_Default_parameters?void 0:_Default_parameters.docs,source:{originalSource:"args => <Input {...args} />",...null===(_Default_parameters1=Default.parameters)||void 0===_Default_parameters1||null===(_Default_parameters_docs=_Default_parameters1.docs)||void 0===_Default_parameters_docs?void 0:_Default_parameters_docs.source}}},WithPlaceholder.parameters={...WithPlaceholder.parameters,docs:{...null===(_WithPlaceholder_parameters=WithPlaceholder.parameters)||void 0===_WithPlaceholder_parameters?void 0:_WithPlaceholder_parameters.docs,source:{originalSource:"args => <Input {...args} />",...null===(_WithPlaceholder_parameters1=WithPlaceholder.parameters)||void 0===_WithPlaceholder_parameters1||null===(_WithPlaceholder_parameters_docs=_WithPlaceholder_parameters1.docs)||void 0===_WithPlaceholder_parameters_docs?void 0:_WithPlaceholder_parameters_docs.source}}},WithReadonly.parameters={...WithReadonly.parameters,docs:{...null===(_WithReadonly_parameters=WithReadonly.parameters)||void 0===_WithReadonly_parameters?void 0:_WithReadonly_parameters.docs,source:{originalSource:"args => <Input {...args} />",...null===(_WithReadonly_parameters1=WithReadonly.parameters)||void 0===_WithReadonly_parameters1||null===(_WithReadonly_parameters_docs=_WithReadonly_parameters1.docs)||void 0===_WithReadonly_parameters_docs?void 0:_WithReadonly_parameters_docs.source}}},IsDisabled.parameters={...IsDisabled.parameters,docs:{...null===(_IsDisabled_parameters=IsDisabled.parameters)||void 0===_IsDisabled_parameters?void 0:_IsDisabled_parameters.docs,source:{originalSource:"args => <Input {...args} />",...null===(_IsDisabled_parameters1=IsDisabled.parameters)||void 0===_IsDisabled_parameters1||null===(_IsDisabled_parameters_docs=_IsDisabled_parameters1.docs)||void 0===_IsDisabled_parameters_docs?void 0:_IsDisabled_parameters_docs.source}}},IsInvalid.parameters={...IsInvalid.parameters,docs:{...null===(_IsInvalid_parameters=IsInvalid.parameters)||void 0===_IsInvalid_parameters?void 0:_IsInvalid_parameters.docs,source:{originalSource:"args => <Input {...args} />",...null===(_IsInvalid_parameters1=IsInvalid.parameters)||void 0===_IsInvalid_parameters1||null===(_IsInvalid_parameters_docs=_IsInvalid_parameters1.docs)||void 0===_IsInvalid_parameters_docs?void 0:_IsInvalid_parameters_docs.source}}},WithError.parameters={...WithError.parameters,docs:{...null===(_WithError_parameters=WithError.parameters)||void 0===_WithError_parameters?void 0:_WithError_parameters.docs,source:{originalSource:"args => <Input {...args} />",...null===(_WithError_parameters1=WithError.parameters)||void 0===_WithError_parameters1||null===(_WithError_parameters_docs=_WithError_parameters1.docs)||void 0===_WithError_parameters_docs?void 0:_WithError_parameters_docs.source}}};const __namedExportsOrder=["Default","WithPlaceholder","WithReadonly","IsDisabled","IsInvalid","WithError"]},"./libs/webb-ui-components/src/components/Input/Input.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{p:()=>Input});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3__),classnames__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_5___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__),react__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_typography_Typography__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),_excluded=["className","debounceTime","errorMessage","htmlSize","id","isDisabled","isInvalid","isReadOnly","isRequired","leftIcon","onChange","rightIcon","size","type","value","inputRef","inputClassName","isControlled"],__jsx=react__WEBPACK_IMPORTED_MODULE_4__.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_2___default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var Input=function Input(props){var className=props.className,debounceTime=props.debounceTime,errorMessage=props.errorMessage,htmlSize=props.htmlSize,id=props.id,isDisabled=props.isDisabled,isInvalidProp=props.isInvalid,isReadOnly=props.isReadOnly,isRequired=props.isRequired,leftIconProp=props.leftIcon,_onChange=props.onChange,rightIconProp=props.rightIcon,_props$size=props.size,size=void 0===_props$size?"md":_props$size,_props$type=props.type,type=void 0===_props$type?"text":_props$type,_props$value=props.value,propValue=void 0===_props$value?"":_props$value,inputRef=props.inputRef,inputClassName=props.inputClassName,_props$isControlled=props.isControlled,isControlled=void 0!==_props$isControlled&&_props$isControlled,restProps=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_3___default()(props,_excluded),_useState=(0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(""),value=_useState[0],setValue=_useState[1],_useState2=(0,react__WEBPACK_IMPORTED_MODULE_4__.useState)(null),cursor=_useState2[0],setCursor=_useState2[1],controlledValue=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return isControlled?propValue:value}),[isControlled,propValue,value]);(0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)((function(){if(debounceTime){var timeout=setTimeout((function(){null==_onChange||_onChange(null!=controlledValue?controlledValue:"")}),debounceTime);return function(){return clearTimeout(timeout)}}}),[debounceTime,_onChange,controlledValue]),(0,react__WEBPACK_IMPORTED_MODULE_4__.useEffect)((function(){var _inputRef$current;null==inputRef||null===(_inputRef$current=inputRef.current)||void 0===_inputRef$current||_inputRef$current.setSelectionRange(cursor,cursor)}),[inputRef,cursor,controlledValue]);var leftIcon=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){if(leftIconProp)return react__WEBPACK_IMPORTED_MODULE_4__.cloneElement(leftIconProp,_objectSpread(_objectSpread({},leftIconProp.props),{},{size:"md"}))}),[leftIconProp]),rightIcon=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){if(rightIconProp)return react__WEBPACK_IMPORTED_MODULE_4__.cloneElement(rightIconProp,_objectSpread(_objectSpread({},rightIconProp.props),{},{size:"md"}))}),[rightIconProp]),isInvalid=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return isInvalidProp||errorMessage}),[isInvalidProp,errorMessage]),paddingX=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return leftIconProp&&rightIconProp?"px-8":leftIconProp?"pl-8 pr-4":rightIconProp?"pl-4 pr-8":"px-4"}),[leftIconProp,rightIconProp]),inputClsxBase=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return classnames__WEBPACK_IMPORTED_MODULE_5___default()("form-input w-full transition-none text-[16px] leading-[30px] bg-mono-0 rounded-lg text-mono-140 dark:bg-mono-200 dark:text-mono-40 invalid:border-red-70 dark:invalid:border-red-50 py-2",paddingX,isInvalid?"border-red-70 dark:border-red-50":"border-mono-80 dark:border-mono-120")}),[isInvalid,paddingX]),inputClsxHover=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return"hover:border-blue-40 dark:hover:border-blue-70"}),[]),inputClsxFocus=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return"focus:bg-blue-0 focus:border-blue-40 dark:focus:bg-blue-120 dark:focus:border-blue-70"}),[]),inputClsxDisabled=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return"disabled:text-mono-100 dark:disabled:text-mono-120 disabled:bg-mono-40 dark:disabled:bg-mono-160 disabled:cursor-not-allowed disabled:hover:border-mono-80 dark:disabled:hover:border-mono-120"}),[]),mergedInputClsx=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)("placeholder:text-mono-100 dark:placeholder:text-mono-80 placeholder:text-[16px]","md"===size?(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)(inputClsxBase,inputClsxHover,inputClsxFocus,inputClsxDisabled):classnames__WEBPACK_IMPORTED_MODULE_5___default()("border-none w-full bg-transparent focus:ring-0 p-0 h4 leading-[30px] font-bold","text-mono-200 dark:text-mono-0"),inputClassName)}),[inputClsxBase,inputClsxDisabled,inputClsxFocus,inputClsxHover,size,inputClassName]),iconClsx=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((function(){return classnames__WEBPACK_IMPORTED_MODULE_5___default()((0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)("text-mono-140 dark:text-mono-40",isDisabled?"text-mono-100 dark:text-mono-120":""))}),[isDisabled]);return __jsx("div",{className},__jsx("div",{className:classnames__WEBPACK_IMPORTED_MODULE_5___default()("relative",{"shadow-sm":"md"===size})},leftIcon&&__jsx("div",{className:"absolute inset-y-0 left-0 flex items-center pl-2"},__jsx("span",{className:iconClsx},leftIcon)),__jsx("input",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_1___default()({ref:inputRef,size:htmlSize,type,name:id,id,disabled:isDisabled,readOnly:isReadOnly,required:isRequired,className:mergedInputClsx,value:controlledValue,onChange:function onChange(e){setCursor(e.target.selectionStart),isControlled&&void 0!==_onChange?_onChange(e.target.value):setValue(e.target.value)}},restProps)),rightIcon&&__jsx("div",{className:"absolute inset-y-0 right-0 flex items-center pr-2"},__jsx("span",{className:iconClsx},rightIcon))),errorMessage&&__jsx(_typography_Typography__WEBPACK_IMPORTED_MODULE_6__.o,{component:"p",variant:"body4",fw:"bold",className:"mt-2 text-red-70 dark:text-red-50"},errorMessage))};Input.__docgenInfo={description:"The `Input` component\n\nProps:\n\n- `id`: The input id\n- `htmlSize`: The native HTML `size` attribute to be passed to the `input`\n- `isRequired`: The `required` attribute of input tab\n- `isDisabled`: The `disabled` attribute of input tab\n- `isRequired`: If `true`, the form control will be readonly\n- `isValid`: If `true`, the input will change to the error state\n- `value`: The input value, change the value by `onChange` function for controlled component\n- `onChange`: The `onChange` function to control the value of the input\n- `errorMessage`: The error message to be displayed if the input is invalid\n- `leftIcon`: If added, the input will show an icon before the input value\n- `rightIcon`: If added, the button will show an icon after the input value\n\n@example\n\n```jsx\n <Input id='default' />\n <Input id='placeholder' placeholder='With placeholder' className='mt-3' />\n <Input id='readonly' value='Readonly' isReadOnly className='mt-3' />\n <Input\n   id='disabled'\n   isDisabled\n   value='isDisabled'\n   leftIcon={<Graph className='fill-current dark:fill-current' />}\n   className='mt-3'\n />\n <Input id='invalid' isInvalid value='isInvalid' className='mt-3' />\n <Input id='withError' isInvalid value='With Error' errorMessage='Error message' className='mt-3' />\n <Input id='iconLeft' value='Icon left' leftIcon={<Coin size='xl' />} className='mt-3' />\n <Input id='iconRight' value='Icon right' rightIcon={<Search size='xl' />} className='mt-3' />\n```",methods:[],displayName:"Input",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},id:{required:!0,tsType:{name:"string"},description:"The input id"},htmlSize:{required:!1,tsType:{name:"number"},description:"The native HTML `size` attribute to be passed to the `input`"},isRequired:{required:!1,tsType:{name:"boolean"},description:"The `required` attribute of input tab"},isDisabled:{required:!1,tsType:{name:"boolean"},description:"The `disabled` attribute of input tab"},isReadOnly:{required:!1,tsType:{name:"boolean"},description:"If `true`, the form control will be readonly"},isInvalid:{required:!1,tsType:{name:"boolean"},description:"If `true`, the input will change to the error state"},value:{required:!1,tsType:{name:"string"},description:"The input value, change the value by `onChange` function for controlled component"},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(nextValue: string) => void",signature:{arguments:[{type:{name:"string"},name:"nextValue"}],return:{name:"void"}}},description:"The `onChange` function to control the value of the input"},isControlled:{required:!1,tsType:{name:"boolean"},description:"Whether to not change the value of the input from user input event.\n\nBy default, the input's value is changed by user input, and not\ndirectly from the `value` prop.\n\n@default false"},errorMessage:{required:!1,tsType:{name:"string"},description:"The error message to be displayed if the input is invalid"},leftIcon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement"},description:"If added, the input will show an icon before the input value\n@type React.ReactElement"},rightIcon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement"},description:"If added, the button will show an icon after the input value\n@type React.ReactElement"},debounceTime:{required:!1,tsType:{name:"number"},description:"If provided, the input will have an debounce time in `ms`\n@default 300"},size:{required:!1,tsType:{name:"union",raw:"'md' | 'sm'",elements:[{name:"literal",value:"'md'"},{name:"literal",value:"'sm'"}]},description:'The input size\n@default "md"'},inputRef:{required:!1,tsType:{name:"union",raw:"React.RefObject<HTMLInputElement> | null",elements:[{name:"ReactRefObject",raw:"React.RefObject<HTMLInputElement>",elements:[{name:"HTMLInputElement"}]},{name:"null"}]},description:"The input ref\n@type React.RefObject<HTMLInputElement>"},inputClassName:{required:!1,tsType:{name:"string"},description:"A specific class to be added to the input element (not the wrapper)\n@type string"}},composes:["Omit"]}},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>Typography});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__),react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts"),_excluded=["children","className","component","fw","ta","variant"];function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=function Typography(props){var children=props.children,className=props.className,component=props.component,_props$fw=props.fw,fw=void 0===_props$fw?"normal":_props$fw,_props$ta=props.ta,ta=void 0===_props$ta?"left":_props$ta,variant=props.variant,restProps=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default()(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return null!=component?component:defaultComponent[variant]}),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("".concat(variant),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.Qe)(variant),className)}),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_3__.createElement)(_component,_objectSpread(_objectSpread({},restProps),{},{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}},"./node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes="",i=0;i<arguments.length;i++){var arg=arguments[i];arg&&(classes=appendClass(classes,parseValue(arg)))}return classes}function parseValue(arg){if("string"==typeof arg||"number"==typeof arg)return arg;if("object"!=typeof arg)return"";if(Array.isArray(arg))return classNames.apply(null,arg);if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]"))return arg.toString();var classes="";for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&(classes=appendClass(classes,key));return classes}function appendClass(value,newClass){return newClass?value?value+" "+newClass:value+newClass:value}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"./node_modules/core-js/internals/array-set-length.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var DESCRIPTORS=__webpack_require__("./node_modules/core-js/internals/descriptors.js"),isArray=__webpack_require__("./node_modules/core-js/internals/is-array.js"),$TypeError=TypeError,getOwnPropertyDescriptor=Object.getOwnPropertyDescriptor,SILENT_ON_NON_WRITABLE_LENGTH_SET=DESCRIPTORS&&!function(){if(void 0!==this)return!0;try{Object.defineProperty([],"length",{writable:!1}).length=1}catch(error){return error instanceof TypeError}}();module.exports=SILENT_ON_NON_WRITABLE_LENGTH_SET?function(O,length){if(isArray(O)&&!getOwnPropertyDescriptor(O,"length").writable)throw new $TypeError("Cannot set read only .length");return O.length=length}:function(O,length){return O.length=length}},"./node_modules/core-js/internals/correct-is-regexp-logic.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var MATCH=__webpack_require__("./node_modules/core-js/internals/well-known-symbol.js")("match");module.exports=function(METHOD_NAME){var regexp=/./;try{"/./"[METHOD_NAME](regexp)}catch(error1){try{return regexp[MATCH]=!1,"/./"[METHOD_NAME](regexp)}catch(error2){}}return!1}},"./node_modules/core-js/internals/does-not-exceed-safe-integer.js":module=>{"use strict";var $TypeError=TypeError;module.exports=function(it){if(it>9007199254740991)throw $TypeError("Maximum allowed index exceeded");return it}},"./node_modules/core-js/internals/is-array.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var classof=__webpack_require__("./node_modules/core-js/internals/classof-raw.js");module.exports=Array.isArray||function isArray(argument){return"Array"===classof(argument)}},"./node_modules/core-js/internals/is-regexp.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var isObject=__webpack_require__("./node_modules/core-js/internals/is-object.js"),classof=__webpack_require__("./node_modules/core-js/internals/classof-raw.js"),MATCH=__webpack_require__("./node_modules/core-js/internals/well-known-symbol.js")("match");module.exports=function(it){var isRegExp;return isObject(it)&&(void 0!==(isRegExp=it[MATCH])?!!isRegExp:"RegExp"===classof(it))}},"./node_modules/core-js/internals/not-a-regexp.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var isRegExp=__webpack_require__("./node_modules/core-js/internals/is-regexp.js"),$TypeError=TypeError;module.exports=function(it){if(isRegExp(it))throw new $TypeError("The method doesn't accept regular expressions");return it}},"./node_modules/core-js/modules/es.array.push.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var $=__webpack_require__("./node_modules/core-js/internals/export.js"),toObject=__webpack_require__("./node_modules/core-js/internals/to-object.js"),lengthOfArrayLike=__webpack_require__("./node_modules/core-js/internals/length-of-array-like.js"),setArrayLength=__webpack_require__("./node_modules/core-js/internals/array-set-length.js"),doesNotExceedSafeInteger=__webpack_require__("./node_modules/core-js/internals/does-not-exceed-safe-integer.js");$({target:"Array",proto:!0,arity:1,forced:__webpack_require__("./node_modules/core-js/internals/fails.js")((function(){return 4294967297!==[].push.call({length:4294967296},1)}))||!function(){try{Object.defineProperty([],"length",{writable:!1}).push()}catch(error){return error instanceof TypeError}}()},{push:function push(item){var O=toObject(this),len=lengthOfArrayLike(O),argCount=arguments.length;doesNotExceedSafeInteger(len+argCount);for(var i=0;i<argCount;i++)O[len]=arguments[i],len++;return setArrayLength(O,len),len}})},"./node_modules/core-js/modules/es.string.starts-with.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var descriptor,$=__webpack_require__("./node_modules/core-js/internals/export.js"),uncurryThis=__webpack_require__("./node_modules/core-js/internals/function-uncurry-this-clause.js"),getOwnPropertyDescriptor=__webpack_require__("./node_modules/core-js/internals/object-get-own-property-descriptor.js").f,toLength=__webpack_require__("./node_modules/core-js/internals/to-length.js"),toString=__webpack_require__("./node_modules/core-js/internals/to-string.js"),notARegExp=__webpack_require__("./node_modules/core-js/internals/not-a-regexp.js"),requireObjectCoercible=__webpack_require__("./node_modules/core-js/internals/require-object-coercible.js"),correctIsRegExpLogic=__webpack_require__("./node_modules/core-js/internals/correct-is-regexp-logic.js"),IS_PURE=__webpack_require__("./node_modules/core-js/internals/is-pure.js"),stringSlice=uncurryThis("".slice),min=Math.min,CORRECT_IS_REGEXP_LOGIC=correctIsRegExpLogic("startsWith");$({target:"String",proto:!0,forced:!!(IS_PURE||CORRECT_IS_REGEXP_LOGIC||(descriptor=getOwnPropertyDescriptor(String.prototype,"startsWith"),!descriptor||descriptor.writable))&&!CORRECT_IS_REGEXP_LOGIC},{startsWith:function startsWith(searchString){var that=toString(requireObjectCoercible(this));notARegExp(searchString);var index=toLength(min(arguments.length>1?arguments[1]:void 0,that.length)),search=toString(searchString);return stringSlice(that,index,index+search.length)===search}})},"./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js":(module,__unused_webpack_exports,__webpack_require__)=>{var toPropertyKey=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/toPropertyKey.js");module.exports=function _defineProperty(obj,key,value){return(key=toPropertyKey(key))in obj?Object.defineProperty(obj,key,{value,enumerable:!0,configurable:!0,writable:!0}):obj[key]=value,obj},module.exports.__esModule=!0,module.exports.default=module.exports},"./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js":module=>{function _extends(){return module.exports=_extends=Object.assign?Object.assign.bind():function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target},module.exports.__esModule=!0,module.exports.default=module.exports,_extends.apply(this,arguments)}module.exports=_extends,module.exports.__esModule=!0,module.exports.default=module.exports},"./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js":(module,__unused_webpack_exports,__webpack_require__)=>{var objectWithoutPropertiesLoose=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutPropertiesLoose.js");module.exports=function _objectWithoutProperties(source,excluded){if(null==source)return{};var key,i,target=objectWithoutPropertiesLoose(source,excluded);if(Object.getOwnPropertySymbols){var sourceSymbolKeys=Object.getOwnPropertySymbols(source);for(i=0;i<sourceSymbolKeys.length;i++)key=sourceSymbolKeys[i],excluded.indexOf(key)>=0||Object.prototype.propertyIsEnumerable.call(source,key)&&(target[key]=source[key])}return target},module.exports.__esModule=!0,module.exports.default=module.exports},"./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutPropertiesLoose.js":module=>{module.exports=function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target},module.exports.__esModule=!0,module.exports.default=module.exports},"./node_modules/next/dist/compiled/@babel/runtime/helpers/toPrimitive.js":(module,__unused_webpack_exports,__webpack_require__)=>{var _typeof=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/typeof.js").default;module.exports=function _toPrimitive(input,hint){if("object"!==_typeof(input)||null===input)return input;var prim=input[Symbol.toPrimitive];if(void 0!==prim){var res=prim.call(input,hint||"default");if("object"!==_typeof(res))return res;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===hint?String:Number)(input)},module.exports.__esModule=!0,module.exports.default=module.exports},"./node_modules/next/dist/compiled/@babel/runtime/helpers/toPropertyKey.js":(module,__unused_webpack_exports,__webpack_require__)=>{var _typeof=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/typeof.js").default,toPrimitive=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/toPrimitive.js");module.exports=function _toPropertyKey(arg){var key=toPrimitive(arg,"string");return"symbol"===_typeof(key)?key:String(key)},module.exports.__esModule=!0,module.exports.default=module.exports},"./node_modules/next/dist/compiled/@babel/runtime/helpers/typeof.js":module=>{function _typeof(obj){return module.exports=_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(obj){return typeof obj}:function(obj){return obj&&"function"==typeof Symbol&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj},module.exports.__esModule=!0,module.exports.default=module.exports,_typeof(obj)}module.exports=_typeof,module.exports.__esModule=!0,module.exports.default=module.exports}}]);