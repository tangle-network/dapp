"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[2086],{"./libs/icons/src/InformationLine.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>InformationLine});__webpack_require__("./node_modules/core-js/modules/es.object.assign.js");var _create_icon__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/icons/src/create-icon.tsx");const InformationLine=props=>(0,_create_icon__WEBPACK_IMPORTED_MODULE_1__.w)(Object.assign({},props,{viewBox:"0 0 16 16",d:"M7.999 14.667a6.666 6.666 0 110-13.333 6.666 6.666 0 010 13.333zm0-1.333a5.333 5.333 0 100-10.667 5.333 5.333 0 000 10.667zm-.667-8.667h1.333V6H7.332V4.667zm0 2.667h1.333v4H7.332v-4z",displayName:"InformationLine"}));InformationLine.__docgenInfo={description:"",methods:[],displayName:"InformationLine",props:{size:{required:!1,tsType:{name:"union",raw:"'md' | 'lg' | 'xl'",elements:[{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"}]},description:'The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)\n@default "md"'},darkMode:{required:!1,tsType:{name:"boolean"},description:""}},composes:["SVGBase"]}},"./libs/icons/src/create-icon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{w:()=>createIcon});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/core-js/modules/es.promise.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/icons/src/utils.ts");const _excluded=["className","d","defaultProps","displayName","path","viewBox","size","darkMode","colorUsingStroke"];function createIcon(options){const{className,d:pathDefinition,defaultProps={},displayName,path,viewBox="0 0 24 24",size="md",darkMode,colorUsingStroke=!1}=options,restOptions=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_5__.A)(options,_excluded),path_=react__WEBPACK_IMPORTED_MODULE_3__.Children.toArray(path),size_=(0,_utils__WEBPACK_IMPORTED_MODULE_4__.M1)(size),className_=colorUsingStroke?(0,_utils__WEBPACK_IMPORTED_MODULE_4__._1)(darkMode):(0,_utils__WEBPACK_IMPORTED_MODULE_4__.pM)(darkMode),minSizeClassName=(0,_utils__WEBPACK_IMPORTED_MODULE_4__.Tg)(size),Comp=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("svg",Object.assign({viewBox,width:size_,height:size_,style:{minWidth:size_,minHeight:size_},className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)(className_,colorUsingStroke?"fill-transparent":"stroke-transparent",minSizeClassName,className)},restOptions,defaultProps,props,{children:path_.length?path_:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)("path",{fill:"inherit",d:pathDefinition})}));return Comp.displayName=displayName,(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_2__.jsx)(Comp,{})}createIcon.__docgenInfo={description:"Create icon from `d` or `path` attribute\n@param {CreateIconOptions} options create icon options\n@returns the icon component",methods:[],displayName:"createIcon",props:{size:{required:!1,tsType:{name:"union",raw:"'md' | 'lg' | 'xl'",elements:[{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"}]},description:'The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)\n@default "md"'},darkMode:{required:!1,tsType:{name:"boolean"},description:""},viewBox:{required:!1,tsType:{name:"string"},description:'The icon `svg` viewBox\n@default "0 0 24 24"'},path:{required:!1,tsType:{name:"union",raw:"React.ReactElement | React.ReactElement[]",elements:[{name:"ReactReactElement",raw:"React.ReactElement"},{name:"Array",elements:[{name:"ReactReactElement",raw:"React.ReactElement"}],raw:"React.ReactElement[]"}]},description:"The `svg` path or group element"},d:{required:!1,tsType:{name:"string"},description:"If the `svg` has a single path, simply copy the path's `d` attribute"},displayName:{required:!1,tsType:{name:"string"},description:"The display name useful in the dev tools"},colorUsingStroke:{required:!1,tsType:{name:"boolean"},description:"Color using `stroke` instead of `fill`\n@default false"},defaultProps:{required:!1,tsType:{name:"ComponentProps",elements:[{name:"literal",value:"'svg'"}],raw:"ComponentProps<'svg'>"},description:"Default props automatically passed to the component; overwriteable"}},composes:["SVGBase"]}},"./libs/icons/src/utils.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{M1:()=>getIconSizeInPixel,Tg:()=>getMinSizeClassName,_1:()=>getStrokeColor,pM:()=>getFillColor,yF:()=>getFlexBasic});__webpack_require__("./node_modules/core-js/modules/es.error.cause.js");function getStrokeColor(darkMode){return void 0===darkMode?"stroke-mono-200 dark:stroke-mono-40":darkMode?"stroke-mono-40":"stroke-mono-200"}function getFillColor(darkMode){return void 0===darkMode?"fill-mono-200 dark:fill-mono-40":darkMode?"fill-mono-40":"fill-mono-200"}function getIconSizeInPixel(size){switch(size){case"xl":return"48px";case"lg":return"24px";case"md":return"16px";default:throw new Error("Unknown icon size")}}function getFlexBasic(size="md"){switch(size){case"xl":return"basis-12";case"lg":return"basis-6";case"md":return"basic-4";default:throw new Error("Unknown icon size")}}function getMinSizeClassName(size){switch(size){case"md":return"min-w-4 min-h-4";case"lg":return"min-w-6 min-h-6";case"xl":return"min-w-12 min-h-12";default:throw new Error("Unknown icon size")}}},"./libs/webb-ui-components/src/components/Disclaimer/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{M:()=>Disclaimer});var objectWithoutPropertiesLoose=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),InformationLine=__webpack_require__("./libs/icons/src/InformationLine.tsx"),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),typography=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts");const _excluded=["message","variant","className"];const Disclaimer=(0,react.forwardRef)(((_ref,ref)=>{let{message,variant,className}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const{main,text}=(0,react.useMemo)((()=>function getColors(variant){switch(variant){case"info":return{main:"border border-blue-70 bg-blue-10 text-blue-70 dark:bg-blue-120 dark:border-blue-120",text:"text-blue-70 dark:text-blue-50"};case"error":return{main:"border border-red-70 bg-red-10 text-red-70 dark:bg-red-120 dark:border-red-120",text:"text-red-70 dark:text-red-50"};case"warning":return{main:"border border-yellow-70 bg-yellow-10 text-yellow-70 dark:bg-yellow-120 dark:border-yellow-120",text:"text-yellow-70 dark:text-yellow-50"};case"success":return{main:"border border-green-70 bg-green-10 text-green-70 dark:bg-green-120 dark:border-green-120",text:"text-green-70 dark:text-green-50"}}}(variant)),[variant]),disclaimerWrapperClasses=(0,react.useMemo)((()=>(0,bundle_mjs.QP)(main,"rounded-xl px-3 py-2  flex items-stretch")),[main]);return(0,jsx_runtime.jsxs)("div",Object.assign({className:(0,bundle_mjs.QP)(disclaimerWrapperClasses,className)},props,{ref,children:[(0,jsx_runtime.jsx)("div",{className:text,children:(0,jsx_runtime.jsx)(InformationLine.B,{className:"!fill-current pointer-events-none"})}),(0,jsx_runtime.jsx)("div",{className:"px-2",children:(0,jsx_runtime.jsx)(typography.o,{variant:"body4",fw:"semibold",className:text,children:message})})]}))}));Disclaimer.__docgenInfo={description:"",methods:[],displayName:"Disclaimer",props:{variant:{required:!0,tsType:{name:"union",raw:"'info' | 'error' | 'warning' | 'success'",elements:[{name:"literal",value:"'info'"},{name:"literal",value:"'error'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'success'"}]},description:"Disclaimer variant will show the fitting colors and icon"},message:{required:!0,tsType:{name:"string"},description:"Disclaimer text message"}}}},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/index.js")),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=props=>{const{children,className,component,fw="normal",ta="left",variant}=props,restProps=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>null!=component?component:defaultComponent[variant]),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_2__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_2__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_2__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_1__.createElement)(_component,Object.assign({},restProps,{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}},"./libs/webb-ui-components/src/stories/molecules/Disclaimer.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{ErrorDisclaimer:()=>ErrorDisclaimer,InfoDisclaimer:()=>InfoDisclaimer,SuccessDisclaimer:()=>SuccessDisclaimer,WarningDisclaimer:()=>WarningDisclaimer,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/core-js/modules/es.object.assign.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_Disclaimer__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/Disclaimer/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/Disclaimer",component:_components_Disclaimer__WEBPACK_IMPORTED_MODULE_2__.M},Template=args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_Disclaimer__WEBPACK_IMPORTED_MODULE_2__.M,Object.assign({},args)),SuccessDisclaimer=Template.bind({});SuccessDisclaimer.args={message:"Information were store successfully",variant:"success"};const WarningDisclaimer=Template.bind({});WarningDisclaimer.args={message:"Make sure to store the info manually if it's failed to be stored automatically",variant:"warning"};const ErrorDisclaimer=Template.bind({});ErrorDisclaimer.args={message:"Failed to store the data automatically",variant:"error"};const InfoDisclaimer=Template.bind({});InfoDisclaimer.args={message:"Data is manually stored every 10s",variant:"info"};const __namedExportsOrder=["SuccessDisclaimer","WarningDisclaimer","ErrorDisclaimer","InfoDisclaimer"];SuccessDisclaimer.parameters={...SuccessDisclaimer.parameters,docs:{...SuccessDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...SuccessDisclaimer.parameters?.docs?.source}}},WarningDisclaimer.parameters={...WarningDisclaimer.parameters,docs:{...WarningDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...WarningDisclaimer.parameters?.docs?.source}}},ErrorDisclaimer.parameters={...ErrorDisclaimer.parameters,docs:{...ErrorDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...ErrorDisclaimer.parameters?.docs?.source}}},InfoDisclaimer.parameters={...InfoDisclaimer.parameters,docs:{...InfoDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...InfoDisclaimer.parameters?.docs?.source}}}},"./node_modules/core-js/internals/correct-is-regexp-logic.js":(module,__unused_webpack_exports,__webpack_require__)=>{var MATCH=__webpack_require__("./node_modules/core-js/internals/well-known-symbol.js")("match");module.exports=function(METHOD_NAME){var regexp=/./;try{"/./"[METHOD_NAME](regexp)}catch(error1){try{return regexp[MATCH]=!1,"/./"[METHOD_NAME](regexp)}catch(error2){}}return!1}},"./node_modules/core-js/internals/error-stack-clear.js":(module,__unused_webpack_exports,__webpack_require__)=>{var uncurryThis=__webpack_require__("./node_modules/core-js/internals/function-uncurry-this.js"),$Error=Error,replace=uncurryThis("".replace),TEST=String(new $Error("zxcasd").stack),V8_OR_CHAKRA_STACK_ENTRY=/\n\s*at [^:]*:[^\n]*/,IS_V8_OR_CHAKRA_STACK=V8_OR_CHAKRA_STACK_ENTRY.test(TEST);module.exports=function(stack,dropEntries){if(IS_V8_OR_CHAKRA_STACK&&"string"==typeof stack&&!$Error.prepareStackTrace)for(;dropEntries--;)stack=replace(stack,V8_OR_CHAKRA_STACK_ENTRY,"");return stack}},"./node_modules/core-js/internals/error-stack-install.js":(module,__unused_webpack_exports,__webpack_require__)=>{var createNonEnumerableProperty=__webpack_require__("./node_modules/core-js/internals/create-non-enumerable-property.js"),clearErrorStack=__webpack_require__("./node_modules/core-js/internals/error-stack-clear.js"),ERROR_STACK_INSTALLABLE=__webpack_require__("./node_modules/core-js/internals/error-stack-installable.js"),captureStackTrace=Error.captureStackTrace;module.exports=function(error,C,stack,dropEntries){ERROR_STACK_INSTALLABLE&&(captureStackTrace?captureStackTrace(error,C):createNonEnumerableProperty(error,"stack",clearErrorStack(stack,dropEntries)))}},"./node_modules/core-js/internals/error-stack-installable.js":(module,__unused_webpack_exports,__webpack_require__)=>{var fails=__webpack_require__("./node_modules/core-js/internals/fails.js"),createPropertyDescriptor=__webpack_require__("./node_modules/core-js/internals/create-property-descriptor.js");module.exports=!fails((function(){var error=new Error("a");return!("stack"in error)||(Object.defineProperty(error,"stack",createPropertyDescriptor(1,7)),7!==error.stack)}))},"./node_modules/core-js/internals/inherit-if-required.js":(module,__unused_webpack_exports,__webpack_require__)=>{var isCallable=__webpack_require__("./node_modules/core-js/internals/is-callable.js"),isObject=__webpack_require__("./node_modules/core-js/internals/is-object.js"),setPrototypeOf=__webpack_require__("./node_modules/core-js/internals/object-set-prototype-of.js");module.exports=function($this,dummy,Wrapper){var NewTarget,NewTargetPrototype;return setPrototypeOf&&isCallable(NewTarget=dummy.constructor)&&NewTarget!==Wrapper&&isObject(NewTargetPrototype=NewTarget.prototype)&&NewTargetPrototype!==Wrapper.prototype&&setPrototypeOf($this,NewTargetPrototype),$this}},"./node_modules/core-js/internals/install-error-cause.js":(module,__unused_webpack_exports,__webpack_require__)=>{var isObject=__webpack_require__("./node_modules/core-js/internals/is-object.js"),createNonEnumerableProperty=__webpack_require__("./node_modules/core-js/internals/create-non-enumerable-property.js");module.exports=function(O,options){isObject(options)&&"cause"in options&&createNonEnumerableProperty(O,"cause",options.cause)}},"./node_modules/core-js/internals/is-regexp.js":(module,__unused_webpack_exports,__webpack_require__)=>{var isObject=__webpack_require__("./node_modules/core-js/internals/is-object.js"),classof=__webpack_require__("./node_modules/core-js/internals/classof-raw.js"),MATCH=__webpack_require__("./node_modules/core-js/internals/well-known-symbol.js")("match");module.exports=function(it){var isRegExp;return isObject(it)&&(void 0!==(isRegExp=it[MATCH])?!!isRegExp:"RegExp"===classof(it))}},"./node_modules/core-js/internals/normalize-string-argument.js":(module,__unused_webpack_exports,__webpack_require__)=>{var toString=__webpack_require__("./node_modules/core-js/internals/to-string.js");module.exports=function(argument,$default){return void 0===argument?arguments.length<2?"":$default:toString(argument)}},"./node_modules/core-js/internals/not-a-regexp.js":(module,__unused_webpack_exports,__webpack_require__)=>{var isRegExp=__webpack_require__("./node_modules/core-js/internals/is-regexp.js"),$TypeError=TypeError;module.exports=function(it){if(isRegExp(it))throw new $TypeError("The method doesn't accept regular expressions");return it}},"./node_modules/core-js/internals/proxy-accessor.js":(module,__unused_webpack_exports,__webpack_require__)=>{var defineProperty=__webpack_require__("./node_modules/core-js/internals/object-define-property.js").f;module.exports=function(Target,Source,key){key in Target||defineProperty(Target,key,{configurable:!0,get:function(){return Source[key]},set:function(it){Source[key]=it}})}},"./node_modules/core-js/internals/wrap-error-constructor-with-cause.js":(module,__unused_webpack_exports,__webpack_require__)=>{var getBuiltIn=__webpack_require__("./node_modules/core-js/internals/get-built-in.js"),hasOwn=__webpack_require__("./node_modules/core-js/internals/has-own-property.js"),createNonEnumerableProperty=__webpack_require__("./node_modules/core-js/internals/create-non-enumerable-property.js"),isPrototypeOf=__webpack_require__("./node_modules/core-js/internals/object-is-prototype-of.js"),setPrototypeOf=__webpack_require__("./node_modules/core-js/internals/object-set-prototype-of.js"),copyConstructorProperties=__webpack_require__("./node_modules/core-js/internals/copy-constructor-properties.js"),proxyAccessor=__webpack_require__("./node_modules/core-js/internals/proxy-accessor.js"),inheritIfRequired=__webpack_require__("./node_modules/core-js/internals/inherit-if-required.js"),normalizeStringArgument=__webpack_require__("./node_modules/core-js/internals/normalize-string-argument.js"),installErrorCause=__webpack_require__("./node_modules/core-js/internals/install-error-cause.js"),installErrorStack=__webpack_require__("./node_modules/core-js/internals/error-stack-install.js"),DESCRIPTORS=__webpack_require__("./node_modules/core-js/internals/descriptors.js"),IS_PURE=__webpack_require__("./node_modules/core-js/internals/is-pure.js");module.exports=function(FULL_NAME,wrapper,FORCED,IS_AGGREGATE_ERROR){var OPTIONS_POSITION=IS_AGGREGATE_ERROR?2:1,path=FULL_NAME.split("."),ERROR_NAME=path[path.length-1],OriginalError=getBuiltIn.apply(null,path);if(OriginalError){var OriginalErrorPrototype=OriginalError.prototype;if(!IS_PURE&&hasOwn(OriginalErrorPrototype,"cause")&&delete OriginalErrorPrototype.cause,!FORCED)return OriginalError;var BaseError=getBuiltIn("Error"),WrappedError=wrapper((function(a,b){var message=normalizeStringArgument(IS_AGGREGATE_ERROR?b:a,void 0),result=IS_AGGREGATE_ERROR?new OriginalError(a):new OriginalError;return void 0!==message&&createNonEnumerableProperty(result,"message",message),installErrorStack(result,WrappedError,result.stack,2),this&&isPrototypeOf(OriginalErrorPrototype,this)&&inheritIfRequired(result,this,WrappedError),arguments.length>OPTIONS_POSITION&&installErrorCause(result,arguments[OPTIONS_POSITION]),result}));if(WrappedError.prototype=OriginalErrorPrototype,"Error"!==ERROR_NAME?setPrototypeOf?setPrototypeOf(WrappedError,BaseError):copyConstructorProperties(WrappedError,BaseError,{name:!0}):DESCRIPTORS&&"stackTraceLimit"in OriginalError&&(proxyAccessor(WrappedError,OriginalError,"stackTraceLimit"),proxyAccessor(WrappedError,OriginalError,"prepareStackTrace")),copyConstructorProperties(WrappedError,OriginalError),!IS_PURE)try{OriginalErrorPrototype.name!==ERROR_NAME&&createNonEnumerableProperty(OriginalErrorPrototype,"name",ERROR_NAME),OriginalErrorPrototype.constructor=WrappedError}catch(error){}return WrappedError}}},"./node_modules/core-js/modules/es.error.cause.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var $=__webpack_require__("./node_modules/core-js/internals/export.js"),global=__webpack_require__("./node_modules/core-js/internals/global.js"),apply=__webpack_require__("./node_modules/core-js/internals/function-apply.js"),wrapErrorConstructorWithCause=__webpack_require__("./node_modules/core-js/internals/wrap-error-constructor-with-cause.js"),WebAssembly=global.WebAssembly,FORCED=7!==new Error("e",{cause:7}).cause,exportGlobalErrorCauseWrapper=function(ERROR_NAME,wrapper){var O={};O[ERROR_NAME]=wrapErrorConstructorWithCause(ERROR_NAME,wrapper,FORCED),$({global:!0,constructor:!0,arity:1,forced:FORCED},O)},exportWebAssemblyErrorCauseWrapper=function(ERROR_NAME,wrapper){if(WebAssembly&&WebAssembly[ERROR_NAME]){var O={};O[ERROR_NAME]=wrapErrorConstructorWithCause("WebAssembly."+ERROR_NAME,wrapper,FORCED),$({target:"WebAssembly",stat:!0,constructor:!0,arity:1,forced:FORCED},O)}};exportGlobalErrorCauseWrapper("Error",(function(init){return function Error(message){return apply(init,this,arguments)}})),exportGlobalErrorCauseWrapper("EvalError",(function(init){return function EvalError(message){return apply(init,this,arguments)}})),exportGlobalErrorCauseWrapper("RangeError",(function(init){return function RangeError(message){return apply(init,this,arguments)}})),exportGlobalErrorCauseWrapper("ReferenceError",(function(init){return function ReferenceError(message){return apply(init,this,arguments)}})),exportGlobalErrorCauseWrapper("SyntaxError",(function(init){return function SyntaxError(message){return apply(init,this,arguments)}})),exportGlobalErrorCauseWrapper("TypeError",(function(init){return function TypeError(message){return apply(init,this,arguments)}})),exportGlobalErrorCauseWrapper("URIError",(function(init){return function URIError(message){return apply(init,this,arguments)}})),exportWebAssemblyErrorCauseWrapper("CompileError",(function(init){return function CompileError(message){return apply(init,this,arguments)}})),exportWebAssemblyErrorCauseWrapper("LinkError",(function(init){return function LinkError(message){return apply(init,this,arguments)}})),exportWebAssemblyErrorCauseWrapper("RuntimeError",(function(init){return function RuntimeError(message){return apply(init,this,arguments)}}))},"./node_modules/core-js/modules/es.string.starts-with.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var descriptor,$=__webpack_require__("./node_modules/core-js/internals/export.js"),uncurryThis=__webpack_require__("./node_modules/core-js/internals/function-uncurry-this-clause.js"),getOwnPropertyDescriptor=__webpack_require__("./node_modules/core-js/internals/object-get-own-property-descriptor.js").f,toLength=__webpack_require__("./node_modules/core-js/internals/to-length.js"),toString=__webpack_require__("./node_modules/core-js/internals/to-string.js"),notARegExp=__webpack_require__("./node_modules/core-js/internals/not-a-regexp.js"),requireObjectCoercible=__webpack_require__("./node_modules/core-js/internals/require-object-coercible.js"),correctIsRegExpLogic=__webpack_require__("./node_modules/core-js/internals/correct-is-regexp-logic.js"),IS_PURE=__webpack_require__("./node_modules/core-js/internals/is-pure.js"),stringSlice=uncurryThis("".slice),min=Math.min,CORRECT_IS_REGEXP_LOGIC=correctIsRegExpLogic("startsWith");$({target:"String",proto:!0,forced:!!(IS_PURE||CORRECT_IS_REGEXP_LOGIC||(descriptor=getOwnPropertyDescriptor(String.prototype,"startsWith"),!descriptor||descriptor.writable))&&!CORRECT_IS_REGEXP_LOGIC},{startsWith:function startsWith(searchString){var that=toString(requireObjectCoercible(this));notARegExp(searchString);var index=toLength(min(arguments.length>1?arguments[1]:void 0,that.length)),search=toString(searchString);return stringSlice(that,index,index+search.length)===search}})},"./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}__webpack_require__.d(__webpack_exports__,{A:()=>_objectWithoutPropertiesLoose})}}]);