/*! For license information please see atoms-StatusIndicator-stories.4bbfb8c3.iframe.bundle.js.LICENSE.txt */
(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[365],{"../icons/src/StatusIndicator/StatusIndicator.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["animated","variant","size"],classes={success:{indicator:classnames__WEBPACK_IMPORTED_MODULE_1___default()("fill-green-70 dark:fill-green-50"),stroke:classnames__WEBPACK_IMPORTED_MODULE_1___default()("stroke-[#288E32] dark:stroke-[#4CB457]")},warning:{indicator:classnames__WEBPACK_IMPORTED_MODULE_1___default()("fill-yellow-70 darkcx(:fill-yellow-50"),stroke:classnames__WEBPACK_IMPORTED_MODULE_1___default()("stroke-[#EAB612] dark:stroke-[#F8D567]")},error:{indicator:classnames__WEBPACK_IMPORTED_MODULE_1___default()("fill-red-70 darkcx(:fill-red-50"),stroke:classnames__WEBPACK_IMPORTED_MODULE_1___default()("stroke-[#EF570D] dark:stroke-[#FF874D]")},info:{indicator:classnames__WEBPACK_IMPORTED_MODULE_1___default()("fill-blue-70 darkcx(:fill-blue-50"),stroke:classnames__WEBPACK_IMPORTED_MODULE_1___default()("stroke-[#23579D] dark:stroke-[#23579D]")}},StatusIndicator=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)(((_ref,ref)=>{let{animated,variant="info",size=12}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);const haftSize=size/2;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("svg",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_4__.A)({width:2*haftSize,height:2*haftSize,viewBox:`0 0 ${2*haftSize} ${2*haftSize}`,fill:"none"},props,{ref,className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("rounded-full",props.className),children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("rect",{x:haftSize/2,y:haftSize/2,width:haftSize,height:haftSize,rx:haftSize/2,className:classes[variant].indicator}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("rect",{x:haftSize/4,y:haftSize/4,width:1.5*haftSize,height:1.5*haftSize,rx:.75*haftSize,className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)(classnames__WEBPACK_IMPORTED_MODULE_1___default()({"animate-ping":animated}),"origin-center",classes[variant].stroke),strokeOpacity:"0.3",strokeWidth:haftSize/2})]}))})),__WEBPACK_DEFAULT_EXPORT__=StatusIndicator;StatusIndicator.__docgenInfo={description:"",methods:[],displayName:"StatusIndicator",props:{variant:{required:!1,tsType:{name:"union",raw:"'success' | 'warning' | 'error' | 'info'",elements:[{name:"literal",value:"'success'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'error'"},{name:"literal",value:"'info'"}]},description:"The color variant of the status indicator.\n@default 'info'",defaultValue:{value:"'info'",computed:!1}},size:{required:!1,tsType:{name:"number"},description:"The size of the status indicator.\n@default 12",defaultValue:{value:"12",computed:!1}},animated:{required:!1,tsType:{name:"boolean"},description:"Whether the status indicator should be animated."}},composes:["ComponentProps"]}},"../icons/src/StatusIndicator/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});const __WEBPACK_DEFAULT_EXPORT__=__webpack_require__("../icons/src/StatusIndicator/StatusIndicator.tsx").A},"./src/stories/atoms/StatusIndicator.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{CustomSize:()=>CustomSize,Default:()=>Default,Error:()=>Error,Info:()=>Info,Success:()=>Success,Warning:()=>Warning,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../icons/src/StatusIndicator/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Atoms/StatusIndicator",component:_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A},Default={render:()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A,{})},Info={render:()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A,{variant:"info"})},Warning={render:()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A,{variant:"warning"})},Error={render:()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A,{variant:"error"})},Success={render:()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A,{variant:"success"})},CustomSize={render:()=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_webb_tools_icons_StatusIndicator__WEBPACK_IMPORTED_MODULE_1__.A,{size:24})},__namedExportsOrder=["Default","Info","Warning","Error","Success","CustomSize"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  render: () => <StatusIndicator />\n}",...Default.parameters?.docs?.source}}},Info.parameters={...Info.parameters,docs:{...Info.parameters?.docs,source:{originalSource:'{\n  render: () => <StatusIndicator variant="info" />\n}',...Info.parameters?.docs?.source}}},Warning.parameters={...Warning.parameters,docs:{...Warning.parameters?.docs,source:{originalSource:'{\n  render: () => <StatusIndicator variant="warning" />\n}',...Warning.parameters?.docs?.source}}},Error.parameters={...Error.parameters,docs:{...Error.parameters?.docs,source:{originalSource:'{\n  render: () => <StatusIndicator variant="error" />\n}',...Error.parameters?.docs?.source}}},Success.parameters={...Success.parameters,docs:{...Success.parameters?.docs,source:{originalSource:'{\n  render: () => <StatusIndicator variant="success" />\n}',...Success.parameters?.docs?.source}}},CustomSize.parameters={...CustomSize.parameters,docs:{...CustomSize.parameters?.docs,source:{originalSource:"{\n  render: () => <StatusIndicator size={24} />\n}",...CustomSize.parameters?.docs?.source}}}},"../../node_modules/classnames/index.js":(module,exports)=>{var __WEBPACK_AMD_DEFINE_RESULT__;!function(){"use strict";var hasOwn={}.hasOwnProperty;function classNames(){for(var classes="",i=0;i<arguments.length;i++){var arg=arguments[i];arg&&(classes=appendClass(classes,parseValue(arg)))}return classes}function parseValue(arg){if("string"==typeof arg||"number"==typeof arg)return arg;if("object"!=typeof arg)return"";if(Array.isArray(arg))return classNames.apply(null,arg);if(arg.toString!==Object.prototype.toString&&!arg.toString.toString().includes("[native code]"))return arg.toString();var classes="";for(var key in arg)hasOwn.call(arg,key)&&arg[key]&&(classes=appendClass(classes,key));return classes}function appendClass(value,newClass){return newClass?value?value+" "+newClass:value+newClass:value}module.exports?(classNames.default=classNames,module.exports=classNames):void 0===(__WEBPACK_AMD_DEFINE_RESULT__=function(){return classNames}.apply(exports,[]))||(module.exports=__WEBPACK_AMD_DEFINE_RESULT__)}()},"../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";function _objectWithoutPropertiesLoose(source,excluded){if(null==source)return{};var key,i,target={},sourceKeys=Object.keys(source);for(i=0;i<sourceKeys.length;i++)key=sourceKeys[i],excluded.indexOf(key)>=0||(target[key]=source[key]);return target}__webpack_require__.d(__webpack_exports__,{A:()=>_objectWithoutPropertiesLoose})}}]);