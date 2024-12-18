"use strict";(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[2086],{"../icons/src/InformationLine.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>InformationLine});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_create_icon__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../icons/src/create-icon.tsx");const InformationLine=props=>(0,_create_icon__WEBPACK_IMPORTED_MODULE_0__.w)((0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_1__.A)({},props,{viewBox:"0 0 16 16",d:"M7.999 14.667a6.666 6.666 0 110-13.333 6.666 6.666 0 010 13.333zm0-1.333a5.333 5.333 0 100-10.667 5.333 5.333 0 000 10.667zm-.667-8.667h1.333V6H7.332V4.667zm0 2.667h1.333v4H7.332v-4z",displayName:"InformationLine"}));InformationLine.__docgenInfo={description:"",methods:[],displayName:"InformationLine",props:{size:{required:!1,tsType:{name:"union",raw:"'md' | 'lg' | 'xl' | '2xl'",elements:[{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"},{name:"literal",value:"'2xl'"}]},description:'The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)\n@default "md"'},darkMode:{required:!1,tsType:{name:"boolean"},description:""}},composes:["SVGBase"]}},"../icons/src/create-icon.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{w:()=>createIcon});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../icons/src/utils.ts");const _excluded=["className","d","defaultProps","displayName","path","viewBox","size","darkMode","colorUsingStroke"];function createIcon(options){const{className,d:pathDefinition,defaultProps={},displayName,path,viewBox="0 0 24 24",size="md",darkMode,colorUsingStroke=!1}=options,restOptions=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(options,_excluded),path_=react__WEBPACK_IMPORTED_MODULE_1__.Children.toArray(path),size_=(0,_utils__WEBPACK_IMPORTED_MODULE_3__.M1)(size),colorClassName=colorUsingStroke?(0,_utils__WEBPACK_IMPORTED_MODULE_3__._1)(darkMode):(0,_utils__WEBPACK_IMPORTED_MODULE_3__.pM)(darkMode),minSizeClassName=(0,_utils__WEBPACK_IMPORTED_MODULE_3__.Tg)(size),Comp=props=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({viewBox,width:size_,height:size_,style:{minWidth:size_,minHeight:size_},className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)(colorClassName,colorUsingStroke?"fill-transparent":"stroke-transparent",minSizeClassName,className)},restOptions,defaultProps,props,{children:path_.length?path_:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path",{fill:"inherit",d:pathDefinition})}));return Comp.displayName=displayName,(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(Comp,{})}createIcon.__docgenInfo={description:"Create icon from `d` or `path` attribute\n@param {CreateIconOptions} options create icon options\n@returns the icon component",methods:[],displayName:"createIcon",props:{size:{required:!1,tsType:{name:"union",raw:"'md' | 'lg' | 'xl' | '2xl'",elements:[{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"},{name:"literal",value:"'2xl'"}]},description:'The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)\n@default "md"'},darkMode:{required:!1,tsType:{name:"boolean"},description:""},viewBox:{required:!1,tsType:{name:"string"},description:'The icon `svg` viewBox\n@default "0 0 24 24"'},path:{required:!1,tsType:{name:"union",raw:"React.ReactElement | React.ReactElement[]",elements:[{name:"ReactReactElement",raw:"React.ReactElement"},{name:"Array",elements:[{name:"ReactReactElement",raw:"React.ReactElement"}],raw:"React.ReactElement[]"}]},description:"The `svg` path or group element"},d:{required:!1,tsType:{name:"string"},description:"If the `svg` has a single path, simply copy the path's `d` attribute"},displayName:{required:!1,tsType:{name:"string"},description:"The display name useful in the dev tools"},colorUsingStroke:{required:!1,tsType:{name:"boolean"},description:"Color using `stroke` instead of `fill`\n@default false"},defaultProps:{required:!1,tsType:{name:"ComponentProps",elements:[{name:"literal",value:"'svg'"}],raw:"ComponentProps<'svg'>"},description:"Default props automatically passed to the component; overwriteable"}},composes:["SVGBase"]}},"../icons/src/utils.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function getStrokeColor(darkMode){return void 0===darkMode?"stroke-mono-200 dark:stroke-mono-40":darkMode?"stroke-mono-40":"stroke-mono-200"}function getFillColor(darkMode){return void 0===darkMode?"fill-mono-200 dark:fill-mono-40":darkMode?"fill-mono-40":"fill-mono-200"}function getIconSizeInPixel(size){switch(size){case"2xl":return"48px";case"xl":return"40px";case"lg":return"32px";case"md":return"24px";default:throw new Error("Unknown icon size")}}function getFlexBasic(size="md"){switch(size){case"2xl":return"basis-12";case"xl":return"basis-10";case"lg":return"basis-8";case"md":return"basis-6";default:throw new Error("Unknown icon size")}}function getMinSizeClassName(size){switch(size){case"md":return"min-w-4 min-h-4";case"lg":return"min-w-8 min-h-8";case"xl":return"min-w-12 min-h-12";case"2xl":return"min-w-24 min-h-24";default:throw new Error("Unknown icon size")}}__webpack_require__.d(__webpack_exports__,{M1:()=>getIconSizeInPixel,Tg:()=>getMinSizeClassName,_1:()=>getStrokeColor,pM:()=>getFillColor,yF:()=>getFlexBasic})},"./src/components/Disclaimer/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{M:()=>Disclaimer});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),InformationLine=__webpack_require__("../icons/src/InformationLine.tsx"),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),typography=__webpack_require__("./src/typography/index.ts");const _excluded=["message","variant","className"];const Disclaimer=(0,react.forwardRef)(((_ref,ref)=>{let{message,variant,className}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const{main,text}=(0,react.useMemo)((()=>function getColors(variant){switch(variant){case"info":return{main:"border border-blue-70 bg-blue-10 text-blue-70 dark:bg-blue-120 dark:border-blue-120",text:"text-blue-70 dark:text-blue-50"};case"error":return{main:"border border-red-70 bg-red-10 text-red-70 dark:bg-red-120 dark:border-red-120",text:"text-red-70 dark:text-red-50"};case"warning":return{main:"border border-yellow-70 bg-yellow-10 text-yellow-70 dark:bg-yellow-120 dark:border-yellow-120",text:"text-yellow-70 dark:text-yellow-50"};case"success":return{main:"border border-green-70 bg-green-10 text-green-70 dark:bg-green-120 dark:border-green-120",text:"text-green-70 dark:text-green-50"}}}(variant)),[variant]),disclaimerWrapperClasses=(0,react.useMemo)((()=>(0,bundle_mjs.QP)(main,"rounded-xl px-3 py-2  flex items-stretch")),[main]);return(0,jsx_runtime.jsxs)("div",(0,esm_extends.A)({className:(0,bundle_mjs.QP)(disclaimerWrapperClasses,className)},props,{ref,children:[(0,jsx_runtime.jsx)("div",{className:text,children:(0,jsx_runtime.jsx)(InformationLine.B,{className:"!fill-current pointer-events-none"})}),(0,jsx_runtime.jsx)("div",{className:"px-2",children:(0,jsx_runtime.jsx)(typography.o,{variant:"body4",fw:"semibold",className:text,children:message})})]}))}));Disclaimer.__docgenInfo={description:"",methods:[],displayName:"Disclaimer",props:{variant:{required:!0,tsType:{name:"union",raw:"'info' | 'error' | 'warning' | 'success'",elements:[{name:"literal",value:"'info'"},{name:"literal",value:"'error'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'success'"}]},description:"Disclaimer variant will show the fitting colors and icon"},message:{required:!0,tsType:{name:"string"},description:"Disclaimer text message"}}}},"./src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],DEFAULT_COMPONENT={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=_ref=>{let{children,className,component,fw="normal",ta="left",variant}=_ref,restProps=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__.A)(_ref,_excluded);const component_=null!=component?component:DEFAULT_COMPONENT[variant],className_=(0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_2__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_3__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_3__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(component_,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({},restProps,{className:className_}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{fw:{defaultValue:{value:"'normal'",computed:!1},required:!1},ta:{defaultValue:{value:"'left'",computed:!1},required:!1}}}},"./src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/Typography.tsx")},"./src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./src/typography/Typography/index.ts")},"./src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")||variant.startsWith("mkt-h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName})},"./src/stories/molecules/Disclaimer.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{ErrorDisclaimer:()=>ErrorDisclaimer,InfoDisclaimer:()=>InfoDisclaimer,SuccessDisclaimer:()=>SuccessDisclaimer,WarningDisclaimer:()=>WarningDisclaimer,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_Disclaimer__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/Disclaimer/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/Disclaimer",component:_components_Disclaimer__WEBPACK_IMPORTED_MODULE_1__.M},Template=args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_Disclaimer__WEBPACK_IMPORTED_MODULE_1__.M,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({},args)),SuccessDisclaimer=Template.bind({});SuccessDisclaimer.args={message:"Information were store successfully",variant:"success"};const WarningDisclaimer=Template.bind({});WarningDisclaimer.args={message:"Make sure to store the info manually if it's failed to be stored automatically",variant:"warning"};const ErrorDisclaimer=Template.bind({});ErrorDisclaimer.args={message:"Failed to store the data automatically",variant:"error"};const InfoDisclaimer=Template.bind({});InfoDisclaimer.args={message:"Data is manually stored every 10s",variant:"info"};const __namedExportsOrder=["SuccessDisclaimer","WarningDisclaimer","ErrorDisclaimer","InfoDisclaimer"];SuccessDisclaimer.parameters={...SuccessDisclaimer.parameters,docs:{...SuccessDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...SuccessDisclaimer.parameters?.docs?.source}}},WarningDisclaimer.parameters={...WarningDisclaimer.parameters,docs:{...WarningDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...WarningDisclaimer.parameters?.docs?.source}}},ErrorDisclaimer.parameters={...ErrorDisclaimer.parameters,docs:{...ErrorDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...ErrorDisclaimer.parameters?.docs?.source}}},InfoDisclaimer.parameters={...InfoDisclaimer.parameters,docs:{...InfoDisclaimer.parameters?.docs,source:{originalSource:"args => <Disclaimer {...args} />",...InfoDisclaimer.parameters?.docs?.source}}}},"../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}__webpack_require__.d(__webpack_exports__,{A:()=>_objectWithoutPropertiesLoose})}}]);