(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[1247],{"./libs/webb-ui-components/src/stories/organisms/NetworkThresholdCard.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/core-js/modules/es.object.keys.js"),__webpack_require__("./node_modules/core-js/modules/es.symbol.js"),__webpack_require__("./node_modules/core-js/modules/es.array.filter.js"),__webpack_require__("./node_modules/core-js/modules/es.object.to-string.js"),__webpack_require__("./node_modules/core-js/modules/es.object.get-own-property-descriptor.js"),__webpack_require__("./node_modules/core-js/modules/es.array.for-each.js"),__webpack_require__("./node_modules/core-js/modules/web.dom-collections.for-each.js"),__webpack_require__("./node_modules/core-js/modules/es.object.get-own-property-descriptors.js"),__webpack_require__("./node_modules/core-js/modules/es.object.define-properties.js"),__webpack_require__("./node_modules/core-js/modules/es.object.define-property.js");var _Default$parameters,_Default$parameters2,_Default$parameters2$,_home_runner_work_webb_dapp_webb_dapp_node_modules_nx_js_node_modules_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_10__=__webpack_require__("./node_modules/@nx/js/node_modules/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_nx_js_node_modules_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_10___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_nx_js_node_modules_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_10__),react__WEBPACK_IMPORTED_MODULE_12__=(__webpack_require__("./node_modules/core-js/modules/es.function.bind.js"),__webpack_require__("./node_modules/react/index.js")),_webb_tools_webb_ui_components_components_NetworkThresholdsCard__WEBPACK_IMPORTED_MODULE_13__=__webpack_require__("./libs/webb-ui-components/src/components/NetworkThresholdsCard/index.ts"),_ngneat_falso__WEBPACK_IMPORTED_MODULE_15__=__webpack_require__("./node_modules/@ngneat/falso/index.esm.js"),storybook_addon_react_router_v6__WEBPACK_IMPORTED_MODULE_14__=__webpack_require__("./node_modules/storybook-addon-react-router-v6/dist/index.mjs");function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter((function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable}))),keys.push.apply(keys,symbols)}return keys}function _objectSpread(target){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?ownKeys(Object(source),!0).forEach((function(key){_home_runner_work_webb_dapp_webb_dapp_node_modules_nx_js_node_modules_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_10___default()(target,key,source[key])})):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(Object(source)).forEach((function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key))}))}return target}const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Organisms/NetworkThresholdsCard",component:_webb_tools_webb_ui_components_components_NetworkThresholdsCard__WEBPACK_IMPORTED_MODULE_13__.x,decorators:[storybook_addon_react_router_v6__WEBPACK_IMPORTED_MODULE_14__.E]};var Template=function Template(args){return react__WEBPACK_IMPORTED_MODULE_12__.createElement(_webb_tools_webb_ui_components_components_NetworkThresholdsCard__WEBPACK_IMPORTED_MODULE_13__.x,args)};Template.displayName="Template";var Default=Template.bind({});Default.args={title:"Network Thresholds",titleInfo:"Network Thresholds",keygenThreshold:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_15__.s8S)({min:2,max:20}),signatureThreshold:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_15__.s8S)({min:2,max:20}),startTime:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_15__.Ygd)(),endTime:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_15__.UaM)(),thresholdType:"current",sessionNumber:(0,_ngneat_falso__WEBPACK_IMPORTED_MODULE_15__.s8S)({min:100,max:1e3}),keyValue:"0x026d513cf4e5f0e605a6584322382bd5896d4f0dfdd1e9a7",viewHistoryUrl:"https://webb.tools"},Default.parameters=_objectSpread(_objectSpread({},Default.parameters),{},{docs:_objectSpread(_objectSpread({},null===(_Default$parameters=Default.parameters)||void 0===_Default$parameters?void 0:_Default$parameters.docs),{},{source:_objectSpread({originalSource:"args => <NetworkThresholdsCard {...args} />"},null===(_Default$parameters2=Default.parameters)||void 0===_Default$parameters2||null===(_Default$parameters2$=_Default$parameters2.docs)||void 0===_Default$parameters2$?void 0:_Default$parameters2$.source)})});var __namedExportsOrder=["Default"]},"./node_modules/core-js/internals/engine-is-bun.js":module=>{module.exports="function"==typeof Bun&&Bun&&"string"==typeof Bun.version},"./node_modules/core-js/internals/function-bind.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var uncurryThis=__webpack_require__("./node_modules/core-js/internals/function-uncurry-this.js"),aCallable=__webpack_require__("./node_modules/core-js/internals/a-callable.js"),isObject=__webpack_require__("./node_modules/core-js/internals/is-object.js"),hasOwn=__webpack_require__("./node_modules/core-js/internals/has-own-property.js"),arraySlice=__webpack_require__("./node_modules/core-js/internals/array-slice.js"),NATIVE_BIND=__webpack_require__("./node_modules/core-js/internals/function-bind-native.js"),$Function=Function,concat=uncurryThis([].concat),join=uncurryThis([].join),factories={};module.exports=NATIVE_BIND?$Function.bind:function bind(that){var F=aCallable(this),Prototype=F.prototype,partArgs=arraySlice(arguments,1),boundFunction=function bound(){var args=concat(partArgs,arraySlice(arguments));return this instanceof boundFunction?function(C,argsLength,args){if(!hasOwn(factories,argsLength)){for(var list=[],i=0;i<argsLength;i++)list[i]="a["+i+"]";factories[argsLength]=$Function("C,a","return new C("+join(list,",")+")")}return factories[argsLength](C,args)}(F,args.length,args):F.apply(that,args)};return isObject(Prototype)&&(boundFunction.prototype=Prototype),boundFunction}},"./node_modules/core-js/internals/schedulers-fix.js":(module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var version,global=__webpack_require__("./node_modules/core-js/internals/global.js"),apply=__webpack_require__("./node_modules/core-js/internals/function-apply.js"),isCallable=__webpack_require__("./node_modules/core-js/internals/is-callable.js"),ENGINE_IS_BUN=__webpack_require__("./node_modules/core-js/internals/engine-is-bun.js"),USER_AGENT=__webpack_require__("./node_modules/core-js/internals/engine-user-agent.js"),arraySlice=__webpack_require__("./node_modules/core-js/internals/array-slice.js"),validateArgumentsLength=__webpack_require__("./node_modules/core-js/internals/validate-arguments-length.js"),Function=global.Function,WRAP=/MSIE .\./.test(USER_AGENT)||ENGINE_IS_BUN&&((version=global.Bun.version.split(".")).length<3||0==version[0]&&(version[1]<3||3==version[1]&&0==version[2]));module.exports=function(scheduler,hasTimeArg){var firstParamIndex=hasTimeArg?2:1;return WRAP?function(handler,timeout){var boundArgs=validateArgumentsLength(arguments.length,1)>firstParamIndex,fn=isCallable(handler)?handler:Function(handler),params=boundArgs?arraySlice(arguments,firstParamIndex):[],callback=boundArgs?function(){apply(fn,this,params)}:fn;return hasTimeArg?scheduler(callback,timeout):scheduler(callback)}:scheduler}},"./node_modules/core-js/modules/es.array.map.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{"use strict";var $=__webpack_require__("./node_modules/core-js/internals/export.js"),$map=__webpack_require__("./node_modules/core-js/internals/array-iteration.js").map;$({target:"Array",proto:!0,forced:!__webpack_require__("./node_modules/core-js/internals/array-method-has-species-support.js")("map")},{map:function map(callbackfn){return $map(this,callbackfn,arguments.length>1?arguments[1]:void 0)}})},"./node_modules/core-js/modules/es.function.bind.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var $=__webpack_require__("./node_modules/core-js/internals/export.js"),bind=__webpack_require__("./node_modules/core-js/internals/function-bind.js");$({target:"Function",proto:!0,forced:Function.bind!==bind},{bind})},"./node_modules/core-js/modules/web.set-interval.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var $=__webpack_require__("./node_modules/core-js/internals/export.js"),global=__webpack_require__("./node_modules/core-js/internals/global.js"),setInterval=__webpack_require__("./node_modules/core-js/internals/schedulers-fix.js")(global.setInterval,!0);$({global:!0,bind:!0,forced:global.setInterval!==setInterval},{setInterval})},"./node_modules/core-js/modules/web.set-timeout.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{var $=__webpack_require__("./node_modules/core-js/internals/export.js"),global=__webpack_require__("./node_modules/core-js/internals/global.js"),setTimeout=__webpack_require__("./node_modules/core-js/internals/schedulers-fix.js")(global.setTimeout,!0);$({global:!0,bind:!0,forced:global.setTimeout!==setTimeout},{setTimeout})},"./node_modules/core-js/modules/web.timers.js":(__unused_webpack_module,__unused_webpack_exports,__webpack_require__)=>{__webpack_require__("./node_modules/core-js/modules/web.set-interval.js"),__webpack_require__("./node_modules/core-js/modules/web.set-timeout.js")},"./node_modules/storybook-addon-react-router-v6/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{E:()=>Dt});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_storybook_preview_api__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("@storybook/preview-api"),react_router_dom__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/react-router/dist/index.js"),react_router_dom__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/react-router-dom/dist/index.js"),react_router_dom__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/@remix-run/router/dist/router.js"),_storybook_core_events__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("@storybook/core-events"),h="storybook/react-router-v6",o={CLEAR:`${h}/clear`,NAVIGATION:`${h}/navigation`,STORY_LOADED:`${h}/story-loaded`,ROUTE_MATCHES:`${h}/route-matches`,ACTION_INVOKED:`${h}/action_invoked`,ACTION_SETTLED:`${h}/action_settled`,LOADER_INVOKED:`${h}/loader_invoked`,LOADER_SETTLED:`${h}/loader_settled`},P=react__WEBPACK_IMPORTED_MODULE_0__.createContext([]),A=()=>react__WEBPACK_IMPORTED_MODULE_0__.useContext(P),F=()=>{let r=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0),e=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.TH)(),t=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.UO)(),[a]=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_4__.lr)(),n=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.ur)(),s=A(),p={};a.forEach(((u,i)=>{p[i]=u}));let c=(()=>{let r=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.TH)();return`${r.pathname}${r.search}${r.hash}`})(),m=s.map((u=>[u.route.path,u.params]));return u=>{switch(u){case o.STORY_LOADED:{let i={url:c,path:e.pathname,routeParams:t,searchParams:p,routeMatches:m,hash:e.hash,routeState:e.state};return{key:`${o.STORY_LOADED}_${r.current++}`,type:o.STORY_LOADED,data:i}}case o.NAVIGATION:{let i={url:c,path:e.pathname,routeParams:t,searchParams:p,hash:e.hash,routeState:e.state,routeMatches:m,navigationType:n};return{key:`${o.NAVIGATION}_${r.current++}`,type:o.NAVIGATION,data:i}}case o.ROUTE_MATCHES:return{key:`${o.ROUTE_MATCHES}_${r.current++}`,type:o.ROUTE_MATCHES,data:{matches:m}}}}};async function v(r){let a,e=r.clone(),t=e.headers.get("content-type")||"";switch(!0){case t.startsWith("text"):a=await e.text();break;case t.startsWith("application/json"):a=await e.json();break;case t.startsWith("multipart/form-data"):case t.startsWith("application/x-www-form-urlencoded"):a=function tt(r){let e={};return r.forEach(((t,a)=>{t instanceof File?e[a]={filename:t.name,filesize:t.size,filetype:t.type}:e[a]=t})),e}(await e.formData());break;default:await e.arrayBuffer().then((s=>s.byteLength))}return a}var $=({children:r})=>{let e=_storybook_preview_api__WEBPACK_IMPORTED_MODULE_1__.addons.getChannel(),t=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.TH)(),[a,n]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(),[s,p]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!1),[c,m]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]),u=F(),i=A(),E=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(function k(){let r={};return r.promise=new Promise(((e,t)=>{r.resolve=e,r.reject=t})),r}());return(0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)((()=>{n(t)})),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{s&&E.current.resolve()}),[s]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{m(i);let l=setTimeout((()=>{s||(p(!0),e.emit(o.STORY_LOADED,u(o.STORY_LOADED)))}),0);return()=>clearTimeout(l)}),[s,i]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{void 0!==a&&a.key!==t.key&&E.current.promise.then((()=>{e.emit(o.NAVIGATION,u(o.NAVIGATION))}))}),[t]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{s&&i.length>c.length&&(m(i),e.emit(o.ROUTE_MATCHES,u(o.ROUTE_MATCHES)))}),[i]),react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment,null,r)},H=({children:r,routePath:e,routeParams:t,searchParams:a,routeState:n,browserPath:s,hydrationData:p})=>{let c=_storybook_preview_api__WEBPACK_IMPORTED_MODULE_1__.addons.getChannel(),[m,u]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(),[i,E]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0),l=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();return c.on(_storybook_core_events__WEBPACK_IMPORTED_MODULE_2__.STORY_ARGS_UPDATED,(()=>{E((R=>R+1))})),(0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)((()=>{let R=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_5__.Gn)(e||"",t),f=new URLSearchParams(a).toString(),y={search:f.length>0?`?${f}`:"",state:n};void 0!==s&&(y.pathname=s),void 0===s&&""!==R&&(y.pathname=R),void 0!==l.current&&Object.assign(y,l.current);let d=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.i7)(r),T=(0,react_router_dom__WEBPACK_IMPORTED_MODULE_3__.bi)(d,{initialEntries:[y],hydrationData:p});T.subscribe((N=>{l.current=N.location})),u(T)}),[i]),void 0===m?null:react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.pG,{router:m,fallbackElement:react__WEBPACK_IMPORTED_MODULE_0__.createElement(lt,null)})};function lt(){return react__WEBPACK_IMPORTED_MODULE_0__.createElement("p",null,"Performing initial data load")}var _=()=>async(r,e)=>{switch(r){case o.ACTION_INVOKED:{let{request:t,params:a,context:n}=e,s={url:t.url,method:t.method,body:await v(t)};return{type:o.ACTION_INVOKED,data:{params:a,request:s,context:n}}}case o.ACTION_SETTLED:return{type:o.ACTION_SETTLED,data:e};case o.LOADER_INVOKED:{let{request:t,params:a,context:n}=e,s={url:t.url,method:t.method,body:v(t)};return{type:o.LOADER_INVOKED,data:{params:a,request:s,context:n}}}case o.LOADER_SETTLED:return{type:o.LOADER_SETTLED,data:e}}},Y=({children:r,browserPath:e,routePath:t="*",routeParams:a,routeHandle:n,searchParams:s,routeState:p,outlet:c,hydrationData:m,action:u,loader:i,errorElement:E,shouldRevalidate:l,routeId:R})=>{let f=_storybook_preview_api__WEBPACK_IMPORTED_MODULE_1__.addons.getChannel(),[g,y]=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)([]);react_router_dom__WEBPACK_IMPORTED_MODULE_3__.pW.Provider._context=new Proxy(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.pW.Provider._context??{},{set:(N,w,S)=>("_currentValue"===w&&y((I=>void 0!==S&&S.matches.length>I.length?S.matches:I)),Reflect.set(N,w,S))});let d=function Et(r){return null!==r&&"object"==typeof r&&Object.prototype.hasOwnProperty.call(r,"element")}(c)?c:{element:c},T={element:d.element,handle:d.handle,errorElement:d.errorElement,action:void 0!==d.action?K(f,d.action):void 0,loader:void 0!==d.loader?q(f,d.loader):void 0};return react__WEBPACK_IMPORTED_MODULE_0__.createElement(P.Provider,{value:g},react__WEBPACK_IMPORTED_MODULE_0__.createElement(H,{routePath:t,routeParams:a,routeState:p,searchParams:s,browserPath:e,hydrationData:m},react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.AW,{id:R,path:t,handle:n,action:void 0!==u?K(f,u):void 0,loader:void 0!==i?q(f,i):void 0,shouldRevalidate:l,errorElement:E,element:react__WEBPACK_IMPORTED_MODULE_0__.createElement($,null,r)},void 0!==d.element&&void 0===d.path&&react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.AW,{index:!0,...T}),void 0!==d.element&&react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__.AW,{path:d.path,...T}))))};function K(r,e){let t=_();return async function(a){if(void 0===e)return;r.emit(o.ACTION_INVOKED,await t(o.ACTION_INVOKED,a));let n=await e(a);return r.emit(o.ACTION_SETTLED,await t(o.ACTION_SETTLED,n)),n}}function q(r,e){let t=_();return async function(a){if(void 0===e)return;r.emit(o.LOADER_INVOKED,await t(o.LOADER_INVOKED,a));let n=await e(a);return r.emit(o.LOADER_SETTLED,await t(o.LOADER_SETTLED,n)),n}}var Dt=(0,_storybook_preview_api__WEBPACK_IMPORTED_MODULE_1__.makeDecorator)({name:"withRouter",parameterName:"reactRouter",wrapper:(r,e,{parameters:t={}})=>{let{routePath:a="*",routeParams:n,routeState:s,routeHandle:p,searchParams:c,outlet:m,browserPath:u,loader:i,action:E,errorElement:l,hydrationData:R,shouldRevalidate:f,routeId:g}=t;if("string"!=typeof a)throw new Error("React Router decorator : `path` must be a string");if(void 0!==n&&"object"!=typeof n)throw new Error("React Router decorator : `params` must be an object with strings as values");if(void 0!==c&&"object"!=typeof c)throw new Error("React Router decorator : `search` must be an object with strings as values");return react__WEBPACK_IMPORTED_MODULE_0__.createElement(Y,{browserPath:u,routePath:a,routeParams:n,searchParams:c,routeState:s,routeHandle:p,outlet:m,loader:i,action:E,errorElement:l,hydrationData:R,shouldRevalidate:f,routeId:g},r(e))}})},"?d4c0":()=>{}}]);