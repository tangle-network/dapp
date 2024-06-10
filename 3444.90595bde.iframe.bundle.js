"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[3444],{"./libs/webb-ui-components/src/components/ErrorFallback/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{x:()=>ErrorFallback});__webpack_require__("./node_modules/core-js/modules/es.symbol.description.js"),__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _telegramInfo$href,_githubInfo$href,defineProperty=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),defineProperty_default=__webpack_require__.n(defineProperty),helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),constants=__webpack_require__("./libs/webb-ui-components/src/constants/index.ts"),typography=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),components_buttons=__webpack_require__("./libs/webb-ui-components/src/components/buttons/index.ts"),_excluded=["buttons","className","contactUsLinkProps","description","refreshPageButtonProps","reportIssueButtonProps","title"],__jsx=react.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){defineProperty_default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var telegramInfo=constants.s7.find((function(c){return"telegram"===c.name})),contactLink=null!==(_telegramInfo$href=null==telegramInfo?void 0:telegramInfo.href)&&void 0!==_telegramInfo$href?_telegramInfo$href:"",githubInfo=constants.s7.find((function(c){return"github"===c.name})),reportIssueLink="".concat(null!==(_githubInfo$href=null==githubInfo?void 0:githubInfo.href)&&void 0!==_githubInfo$href?_githubInfo$href:"","/webb-dapp/issues/new/choose"),ErrorFallback=(0,react.forwardRef)((function(_ref,ref){var buttons=_ref.buttons,className=_ref.className,contactUsLinkProps=_ref.contactUsLinkProps,descriptionProp=_ref.description,refreshPageButtonProps=_ref.refreshPageButtonProps,reportIssueButtonProps=_ref.reportIssueButtonProps,_ref$title=_ref.title,title=void 0===_ref$title?"Oops something went wrong.":_ref$title,props=objectWithoutProperties_default()(_ref,_excluded),description=(0,react.useMemo)((function(){return descriptionProp||["Please either refresh the page or try again later.",{noWrapper:!1,children:__jsx("span",{className:"inline-block w-9/12 mx-auto"},"If the issue persists, please"," ",__jsx(components_buttons.Button,extends_default()({href:contactLink,target:"_blank"},contactUsLinkProps,{variant:"link",className:"inline-block"}),"contact us")," ","or report the issue.")}]}),[contactUsLinkProps,descriptionProp]),buttonProps=(0,react.useMemo)((function(){if(buttons)return buttons;var commonButtonProps={className:"px-3 py-2 rounded-lg",size:"sm"};return[_objectSpread(_objectSpread(_objectSpread({onClick:function onClick(){return window.location.reload(!0)}},refreshPageButtonProps),commonButtonProps),{},{variant:"primary",children:"Refresh Page"}),_objectSpread(_objectSpread(_objectSpread({href:reportIssueLink,target:"_blank"},reportIssueButtonProps),commonButtonProps),{},{variant:"secondary",children:"Report issue"})]}),[buttons,refreshPageButtonProps,reportIssueButtonProps]);return __jsx("div",extends_default()({},props,{className:(0,bundle_mjs.QP)("bg-mono-0 dark:bg-mono-180 p-6 rounded-lg","max-w-xl space-y-4 mx-auto",className),ref}),__jsx(typography.o,{variant:"h4",fw:"bold",ta:"center"},title),__jsx("div",{className:"space-y-2"},description.map((function(desc,index){return"string"!=typeof desc&&desc.noWrapper?__jsx(react.Fragment,{key:index},desc.children):__jsx(typography.o,{key:index,className:"w-3/4 mx-auto",variant:"body1",ta:"center",fw:"semibold"},"string"==typeof desc?desc:desc.children)}))),__jsx("div",{className:"flex items-center justify-center gap-2"},buttonProps.map((function(buttonProps,index){return __jsx(components_buttons.Button,extends_default()({key:index},buttonProps))}))))}));ErrorFallback.__docgenInfo={description:"The `ErrorFallback` component, used to display an error message when an UI error occurs.\n\n- `title`: The error title to display (default is \"Oops something went wrong.)\n- `description`: The error description to display, can be a string or a react element (string with links, etc.). When noWrapper is true, the children will be rendered without a wrapper (`<Typography />`)\n- `buttons`: The button prop list for displaying the buttons in the error fallback component. if not provided, the default button will be rendered (refresh page and report issue)\n- `contactUsLinkProps`: Contact us link props, for overriding the default props\n- `refreshPageButtonProps`: Refresh page button props for overriding the default props\n- `reportIssueButtonProps`: Report issue button props for overriding the default props\n\n```jsx\n <ErrorFallback className='mr-3' />\n <ErrorFallback\n   title='An error occurred'\n   description='Please refresh the page or try again later.'\n />\n```",methods:[],displayName:"ErrorFallback",props:{title:{defaultValue:{value:"'Oops something went wrong.'",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/Notification/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{ph:()=>NotificationProvider,OT:()=>notificationApi});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),NotificationCTXDefaultValue={addToQueue:function addToQueue(){return 0},remove:function remove(){}},NotificationContext=react.createContext(NotificationCTXDefaultValue),src=__webpack_require__("./libs/icons/src/index.ts"),notistack_esm=__webpack_require__("./node_modules/notistack/notistack.esm.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Typography=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),__jsx=react.createElement,NotificationItem=(0,react.forwardRef)((function(props,ref){var id=props.id,message=props.message,Icon=props.Icon,secondaryMessage=props.secondaryMessage,style=props.style,variant=props.variant,className=props.className,DefaultIcon=(0,react.useMemo)((function(){switch(variant){case"success":return __jsx(src.ej,{size:"lg",className:"fill-green-70 dark:fill-green-30"});case"error":case"warning":return __jsx(src.Fc,{size:"lg",className:"!fill-yellow-70"});default:return __jsx(src.B$,{size:"lg",className:"fill-blue-70 dark:fill-blue-50"})}}),[variant]);return __jsx(notistack_esm.Zv,{ref,role:"alert",style,className:(0,bundle_mjs.QP)("p-4 w-[420px] rounded-lg","bg-mono-0 dark:bg-mono-140","flex items-start justify-between","shadow-md",className)},__jsx("div",{className:"flex space-x-3"},__jsx("div",{className:"pt-0.5"},null!=Icon?Icon:DefaultIcon),__jsx("div",{className:"space-y-1 max-w-[313px] overflow-x-hidden"},"string"==typeof message?__jsx(Typography.o,{variant:"h5",fw:"bold"},message):message,"string"==typeof secondaryMessage?__jsx(Typography.o,{variant:"body1"},secondaryMessage):secondaryMessage)),__jsx("button",{onClick:function onClick(){return(0,notistack_esm.mk)(id)}},__jsx(src.bm,{size:"lg"})))}));NotificationItem.__docgenInfo={description:"",methods:[],displayName:"NotificationItem"};__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var defineProperty=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),defineProperty_default=__webpack_require__.n(defineProperty),NotificationStacked_jsx=react.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){defineProperty_default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var _notificationApi=_objectSpread({},NotificationCTXDefaultValue),NotificationStacked=function NotificationStacked(_ref){var children=_ref.children,_useSnackbar=(0,notistack_esm.dh)(),closeSnackbar=_useSnackbar.closeSnackbar,enqueueSnackbar=_useSnackbar.enqueueSnackbar,addToQueue=(0,react.useCallback)((function(opts){var snackKey=opts.key||(new Date).getTime()+Math.random();return enqueueSnackbar(opts.message,_objectSpread(_objectSpread({},opts),{},{key:snackKey})),snackKey}),[enqueueSnackbar]),remove=(0,react.useCallback)((function(key){return closeSnackbar(key)}),[closeSnackbar]);return(0,react.useEffect)((function(){_notificationApi={addToQueue,remove}}),[addToQueue,remove]),NotificationStacked_jsx(NotificationContext.Provider,{value:{addToQueue,remove},children})},notificationApi=function notificationApi(opts){return _notificationApi.addToQueue(opts)};notificationApi.addToQueue=function(opts){return _notificationApi.addToQueue(opts)},notificationApi.remove=function(key){return _notificationApi.remove(key)},NotificationStacked.__docgenInfo={description:"",methods:[],displayName:"NotificationStacked",props:{children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""}}};var NotificationProvider_jsx=react.createElement,NotificationProvider=function NotificationProvider(_ref){var children=_ref.children,_ref$maxStack=_ref.maxStack,maxStack=void 0===_ref$maxStack?3:_ref$maxStack,_useState=(0,react.useState)(void 0),domRoot=_useState[0],setDomRoot=_useState[1];return(0,react.useEffect)((function(){var _document$getElementB,_document;setDomRoot(null!==(_document$getElementB=null===(_document=document)||void 0===_document?void 0:_document.getElementById("notification-root"))&&void 0!==_document$getElementB?_document$getElementB:void 0)}),[]),NotificationProvider_jsx(notistack_esm.n,{anchorOrigin:{horizontal:"right",vertical:"top"},autoHideDuration:5e3,preventDuplicate:!0,maxSnack:maxStack,domRoot,Components:{default:NotificationItem,error:NotificationItem,info:NotificationItem,success:NotificationItem,warning:NotificationItem}},NotificationProvider_jsx(NotificationStacked,{children}))};NotificationProvider.__docgenInfo={description:"",methods:[],displayName:"NotificationProvider",props:{children:{required:!1,tsType:{name:"ReactReactNode",raw:"React.ReactNode"},description:""},maxStack:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"3",computed:!1}}}}},"./libs/webb-ui-components/src/hooks/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{O$:()=>useCheckMobile,xw:()=>useCopyable.x,D2:()=>hooks_useDarkMode.D,X$:()=>useHiddenValue});__webpack_require__("./libs/webb-ui-components/src/hooks/useBreakpointValue.ts"),__webpack_require__("./node_modules/core-js/modules/es.regexp.exec.js"),__webpack_require__("./node_modules/core-js/modules/es.regexp.test.js");var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),useCheckMobile=function useCheckMobile(){var _useState=(0,react.useState)(!1),isMobile=_useState[0],setIsMobile=_useState[1];return(0,react.useEffect)((function(){var checkIsMobile=function checkIsMobile(){var isMobileCheck=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);setIsMobile(isMobileCheck)};return checkIsMobile(),window.addEventListener("resize",checkIsMobile),function(){window.removeEventListener("resize",checkIsMobile)}}),[]),{isMobile}},useCopyable=__webpack_require__("./libs/webb-ui-components/src/hooks/useCopyable.ts"),hooks_useDarkMode=__webpack_require__("./libs/webb-ui-components/src/hooks/useDarkMode.ts"),lib=(__webpack_require__("./libs/webb-ui-components/src/hooks/useMediaQuery.ts"),__webpack_require__("./node_modules/lodash/noop.js"),__webpack_require__("./libs/webb-ui-components/src/hooks/useTimeAgo.ts"),__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js"),__webpack_require__("./node_modules/@tanstack/table-core/build/lib/index.mjs")),toConsumableArray=(__webpack_require__("./node_modules/core-js/modules/es.json.stringify.js"),__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/toConsumableArray.js")),toConsumableArray_default=__webpack_require__.n(toConsumableArray),defineProperty=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),defineProperty_default=__webpack_require__.n(defineProperty),createClass=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/createClass.js"),createClass_default=__webpack_require__.n(createClass),classCallCheck=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/classCallCheck.js"),classCallCheck_default=__webpack_require__.n(classCallCheck),possibleConstructorReturn=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/possibleConstructorReturn.js"),possibleConstructorReturn_default=__webpack_require__.n(possibleConstructorReturn),getPrototypeOf=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/getPrototypeOf.js"),getPrototypeOf_default=__webpack_require__.n(getPrototypeOf),inherits=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/inherits.js"),inherits_default=__webpack_require__.n(inherits),app_util=__webpack_require__("./node_modules/@webb-tools/app-util/index.js"),console=__webpack_require__("./node_modules/console-browserify/index.js");function _callSuper(t,o,e){return o=getPrototypeOf_default()(o),possibleConstructorReturn_default()(t,_isNativeReflectConstruct()?Reflect.construct(o,e||[],getPrototypeOf_default()(t).constructor):o.apply(t,e))}function _isNativeReflectConstruct(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(_isNativeReflectConstruct=function _isNativeReflectConstruct(){return!!t})()}var LoggerEvent=function(_EventBus){function LoggerEvent(){var _this;return classCallCheck_default()(this,LoggerEvent),(_this=_callSuper(this,LoggerEvent)).sendEvent=_this.emit,_this}return inherits_default()(LoggerEvent,_EventBus),createClass_default()(LoggerEvent)}(app_util.l7),Color=function(Color){return Color.Reset="[0m",Color.Bright="[1m",Color.Dim="[2m",Color.Underscore="[4m",Color.Blink="[5m",Color.Reverse="[7m",Color.Hidden="[8m",Color.FgBlack="[30m",Color.FgRed="[31m",Color.FgGreen="[32m",Color.FgYellow="[33m",Color.FgBlue="[34m",Color.FgMagenta="[35m",Color.FgCyan="[36m",Color.FgWhite="[37m",Color.BgBlack="[40m",Color.BgRed="[41m",Color.BgGreen="[42m",Color.BgYellow="[43m",Color.BgBlue="[44m",Color.BgMagenta="[45m",Color.BgCyan="[46m",Color.BgWhite="[47m",Color}({}),LogLevel=function(LogLevel){return LogLevel[LogLevel.trace=0]="trace",LogLevel[LogLevel.log=1]="log",LogLevel[LogLevel.info=2]="info",LogLevel[LogLevel.warn=3]="warn",LogLevel[LogLevel.debug=4]="debug",LogLevel[LogLevel.error=5]="error",LogLevel}({}),LoggerService=function(){function LoggerService(ctx,logLevel){return classCallCheck_default()(this,LoggerService),this.ctx=ctx,this.logLevel=logLevel,defineProperty_default()(this,"mutedLogger",(function(){return null})),defineProperty_default()(this,"debug",function debug(){for(var _Function$prototype$b,_len=arguments.length,message=new Array(_len),_key=0;_key<_len;_key++)message[_key]=arguments[_key];var log=this.logger.apply(this,[LogLevel.debug,Color.FgBlack].concat(message));return log?(_Function$prototype$b=Function.prototype.bind).call.apply(_Function$prototype$b,[console.log,console].concat(toConsumableArray_default()(log))):this.mutedLogger}.call(this)),defineProperty_default()(this,"error",function error(){for(var _Function$prototype$b2,_len2=arguments.length,message=new Array(_len2),_key2=0;_key2<_len2;_key2++)message[_key2]=arguments[_key2];var log=this.logger.apply(this,[LogLevel.error,Color.FgRed].concat(message));return log?(_Function$prototype$b2=Function.prototype.bind).call.apply(_Function$prototype$b2,[console.log,console].concat(toConsumableArray_default()(log))):this.mutedLogger}.call(this)),defineProperty_default()(this,"info",function info(){for(var _Function$prototype$b3,_len3=arguments.length,message=new Array(_len3),_key3=0;_key3<_len3;_key3++)message[_key3]=arguments[_key3];var log=this.logger.apply(this,[LogLevel.info,Color.FgCyan].concat(message));return log?(_Function$prototype$b3=Function.prototype.bind).call.apply(_Function$prototype$b3,[console.log,console].concat(toConsumableArray_default()(log))):this.mutedLogger}.call(this)),defineProperty_default()(this,"warn",function warn(){for(var _Function$prototype$b4,_len4=arguments.length,message=new Array(_len4),_key4=0;_key4<_len4;_key4++)message[_key4]=arguments[_key4];var log=this.logger.apply(this,[LogLevel.warn,Color.FgYellow].concat(message));return log?(_Function$prototype$b4=Function.prototype.bind).call.apply(_Function$prototype$b4,[console.log,console].concat(toConsumableArray_default()(log))):this.mutedLogger}.call(this)),defineProperty_default()(this,"trace",function trace(){for(var _Function$prototype$b5,_len5=arguments.length,message=new Array(_len5),_key5=0;_key5<_len5;_key5++)message[_key5]=arguments[_key5];var log=this.logger.apply(this,[LogLevel.trace,Color.FgBlack].concat(message));return log?(_Function$prototype$b5=Function.prototype.bind).call.apply(_Function$prototype$b5,[console.log,console].concat(toConsumableArray_default()(log))):this.mutedLogger}.call(this)),defineProperty_default()(this,"log",function log(){for(var _Function$prototype$b6,_len6=arguments.length,message=new Array(_len6),_key6=0;_key6<_len6;_key6++)message[_key6]=arguments[_key6];var log=this.logger.apply(this,[LogLevel.log,Color.FgBlack].concat(message));return log?(_Function$prototype$b6=Function.prototype.bind).call.apply(_Function$prototype$b6,[console.log,console].concat(toConsumableArray_default()(log))):this.mutedLogger}.call(this)),this}return createClass_default()(LoggerService,[{key:"logger",value:function logger(){for(var _LoggerService$eventB,_LoggerService$eventB2,level=arguments.length>0&&void 0!==arguments[0]?arguments[0]:LogLevel.trace,color=arguments.length>1?arguments[1]:void 0,m="",_len7=arguments.length,message=new Array(_len7>2?_len7-2:0),_key7=2;_key7<_len7;_key7++)message[_key7-2]=arguments[_key7];try{m=JSON.stringify(message,null,2)}catch(_unused){m="Cant show message"}if(null===(_LoggerService$eventB=(_LoggerService$eventB2=LoggerService.eventBus).sendEvent)||void 0===_LoggerService$eventB||_LoggerService$eventB.call(_LoggerService$eventB2,"log",{ctx:this.ctx,level,log:m}),LoggerService._enabled&&this.logLevel<=level){var date=new Date;return["".concat(color,"[").concat(date.getHours(),":").concat(date.getMinutes(),":").concat(date.getSeconds(),"], [").concat(this.ctx,"] ")].concat(message)}}}],[{key:"new",value:function _new(ctx){var logger=new LoggerService(ctx,arguments.length>1&&void 0!==arguments[1]?arguments[1]:LogLevel.trace);return LoggerService._loggers[ctx]=logger,logger}},{key:"get",value:function get(ctx){var cachedLogger=LoggerService._loggers[ctx];return cachedLogger||LoggerService.new(ctx)}}])}();defineProperty_default()(LoggerService,"eventBus",new LoggerEvent),defineProperty_default()(LoggerService,"_loggers",{}),defineProperty_default()(LoggerService,"_enabled",!0);const logger_LoggerService=LoggerService;var Notification=__webpack_require__("./libs/webb-ui-components/src/components/Notification/index.ts"),ErrorFallback=__webpack_require__("./libs/webb-ui-components/src/components/ErrorFallback/index.ts"),__jsx=react.createElement;function WebbUIErrorBoudary_callSuper(t,o,e){return o=getPrototypeOf_default()(o),possibleConstructorReturn_default()(t,WebbUIErrorBoudary_isNativeReflectConstruct()?Reflect.construct(o,e||[],getPrototypeOf_default()(t).constructor):o.apply(t,e))}function WebbUIErrorBoudary_isNativeReflectConstruct(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(WebbUIErrorBoudary_isNativeReflectConstruct=function _isNativeReflectConstruct(){return!!t})()}var WebbUIErrorBoudary=function(_React$Component){function WebbUIErrorBoudary(){var _this;classCallCheck_default()(this,WebbUIErrorBoudary);for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++)args[_key]=arguments[_key];return _this=WebbUIErrorBoudary_callSuper(this,WebbUIErrorBoudary,[].concat(args)),defineProperty_default()(_this,"state",{hasError:!1,error:null,errorInfo:null}),_this}return inherits_default()(WebbUIErrorBoudary,_React$Component),createClass_default()(WebbUIErrorBoudary,[{key:"componentDidCatch",value:function componentDidCatch(error,errorInfo){this.props.logger.error(errorInfo),this.props.logger.debug({error,errorInfo})}},{key:"render",value:function render(){return this.state.hasError?__jsx("div",{className:"flex items-center justify-center w-screen h-screen"},__jsx(ErrorFallback.x,null)):this.props.children}}],[{key:"getDerivedStateFromError",value:function getDerivedStateFromError(error){return{hasError:!0,error}}}])}(react.Component);WebbUIErrorBoudary.__docgenInfo={description:"",methods:[],displayName:"WebbUIErrorBoudary",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},logger:{required:!0,tsType:{name:"LoggerService"},description:""}}};react.createElement,Notification.OT,lib.lQ,logger_LoggerService.get("app"),lib.lQ,logger_LoggerService.new("Stats App");var use_local_storage_state=__webpack_require__("./node_modules/use-local-storage-state/index.js");function useHiddenValue(){return(0,use_local_storage_state.A)("isHiddenValue",{defaultValue:!1})}},"./libs/webb-ui-components/src/hooks/useBreakpointValue.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _useMediaQuery__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/hooks/useMediaQuery.ts"),tailwindcss_resolveConfig__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/tailwindcss/resolveConfig.js"),config=__webpack_require__.n(tailwindcss_resolveConfig__WEBPACK_IMPORTED_MODULE_1__)()({content:[]});const __WEBPACK_DEFAULT_EXPORT__=function useBreakpointValue(breakpoint,value,fallback,breakpoints){var _breakpointsToUse,breakPointValue=null!==(_breakpointsToUse=(null!=breakpoints?breakpoints:config.theme.screens)[breakpoint])&&void 0!==_breakpointsToUse?_breakpointsToUse:config.theme.screens.md;return(0,_useMediaQuery__WEBPACK_IMPORTED_MODULE_0__.A)("(min-width: ".concat(breakPointValue,")"))?value:fallback}},"./libs/webb-ui-components/src/hooks/useCopyable.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{x:()=>useCopyable});var copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/copy-to-clipboard/index.js"),copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0__),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),useCopyable=function useCopyable(){var display=arguments.length>0&&void 0!==arguments[0]?arguments[0]:3e3,ref=(0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(""),_useState=(0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(!1),isCopied=_useState[0],setIsCopied=_useState[1],_timeoutRef=(0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)();return(0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)((function(){return function(){return clearTimeout(_timeoutRef.current)}}),[]),{isCopied,copy:function copy(value){if(!isCopied){ref.current=value,copy_to_clipboard__WEBPACK_IMPORTED_MODULE_0___default()(value),setIsCopied(!0);var timeoutObj=setTimeout((function(){return setIsCopied(!1)}),display);_timeoutRef.current&&clearTimeout(_timeoutRef.current),_timeoutRef.current=timeoutObj}},copiedText:ref.current}}},"./libs/webb-ui-components/src/hooks/useDarkMode.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{D:()=>useDarkMode,m:()=>useNextDarkMode});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0__),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),next_themes__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next-themes/dist/index.mjs"),use_local_storage_state__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/use-local-storage-state/index.js");function isBrowser(){return void 0!==window.document}function useDarkMode(){var defaultTheme=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"dark",_useLocalStorageState=(0,use_local_storage_state__WEBPACK_IMPORTED_MODULE_3__.A)("theme",{defaultValue:defaultTheme}),_useLocalStorageState2=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_0___default()(_useLocalStorageState,2),theme=_useLocalStorageState2[0],setTheme=_useLocalStorageState2[1],isDarkMode=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((function(){return"dark"===theme}),[theme]);return(0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)((function(){isBrowser()&&("dark"===theme||!("theme"in localStorage)&&window.matchMedia("(prefers-color-scheme: dark)").matches?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark"))}),[theme]),(0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)((function(){return setTheme(defaultTheme)}),[defaultTheme,setTheme]),[isDarkMode,(0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((function(nextThemeMode){if(isBrowser()){var _nextThemeMode=(null!=nextThemeMode?nextThemeMode:"dark"===theme)?"light":"dark";if(_nextThemeMode!==theme){switch(_nextThemeMode){case"dark":document.documentElement.classList.add("dark");break;case"light":document.documentElement.classList.remove("dark")}setTheme(_nextThemeMode)}}}),[theme,setTheme])]}function useNextDarkMode(){var _useTheme=(0,next_themes__WEBPACK_IMPORTED_MODULE_2__.D)(),theme=_useTheme.theme,setTheme=_useTheme.setTheme;return[(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((function(){return"dark"===theme}),[theme]),(0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((function(){if(isBrowser()){var _nextThemeMode="dark"===theme?"light":"dark";_nextThemeMode!==theme&&setTheme(_nextThemeMode)}}),[theme,setTheme])]}},"./libs/webb-ui-components/src/hooks/useMediaQuery.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>hooks_useMediaQuery});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");__webpack_require__("./node_modules/core-js/modules/es.regexp.exec.js"),__webpack_require__("./node_modules/core-js/modules/es.regexp.test.js");const utils_isSSR=function isSSR(){return!window.navigator||/ServerSideRendering|^Deno\//.test(window.navigator.userAgent)};const hooks_useIsomorphicEffect=function isBrowser(){return!utils_isSSR()}()?react.useLayoutEffect:react.useEffect;const hooks_useMediaQuery=function useMediaQuery(query){var _useState=(0,react.useState)(!1),matches=_useState[0],setMatches=_useState[1];return hooks_useIsomorphicEffect((function(){var mediaQuery=window.matchMedia(query);setMatches(mediaQuery.matches);var handler=function handler(event){setMatches(event.matches)};return"addEventListener"in mediaQuery&&mediaQuery.addEventListener("change",handler),"addListener"in mediaQuery&&mediaQuery.addListener(handler),function(){"addEventListener"in mediaQuery&&mediaQuery.removeEventListener("change",handler),"addListener"in mediaQuery&&mediaQuery.removeListener(handler)}}),[query]),matches}},"./libs/webb-ui-components/src/hooks/useTimeAgo.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/core-js/modules/es.parse-int.js"),__webpack_require__("./node_modules/core-js/modules/es.regexp.exec.js"),__webpack_require__("./node_modules/core-js/modules/es.string.match.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/slicedToArray.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/toConsumableArray.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toArray_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/toArray.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toArray_js__WEBPACK_IMPORTED_MODULE_5___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toArray_js__WEBPACK_IMPORTED_MODULE_5__),react__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),console=__webpack_require__("./node_modules/console-browserify/index.js"),DAY=86400;function dateParser(date){var parsed=new Date(date);if(!Number.isNaN(parsed.valueOf()))return parsed;var parts=String(date).match(/\d+/g);if(null==parts||parts.length<=2)return parsed;var _parts$map=parts.map((function(x){return parseInt(x)})),_parts$map2=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toArray_js__WEBPACK_IMPORTED_MODULE_5___default()(_parts$map),firstP=_parts$map2[0],secondP=_parts$map2[1],restPs=_parts$map2.slice(2),_ref=[firstP,secondP-1].concat(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_toConsumableArray_js__WEBPACK_IMPORTED_MODULE_4___default()(restPs)),year=_ref[0],monthIdx=_ref[1],_date=_ref[2],hours=_ref[3],minutes=_ref[4],seconds=_ref[5],ms=_ref[6];return new Date(Date.UTC(year,monthIdx,_date,hours,minutes,seconds,ms))}function defaultFormatter(value,_unit,suffix){return value+" "+(1!==value?_unit+"s":_unit)+" "+suffix}const __WEBPACK_DEFAULT_EXPORT__=function useTimeAgo(opts){var date=opts.date,_opts$live=opts.live,live=void 0===_opts$live||_opts$live,_opts$maxPeriod=opts.maxPeriod,maxPeriod=void 0===_opts$maxPeriod?604800:_opts$maxPeriod,_opts$minPeriod=opts.minPeriod,minPeriod=void 0===_opts$minPeriod?0:_opts$minPeriod,_opts$now=opts.now,now=void 0===_opts$now?function(){return Date.now()}:_opts$now,_opts$formatter=opts.formatter,formatter=void 0===_opts$formatter?defaultFormatter:_opts$formatter,_useState=(0,react__WEBPACK_IMPORTED_MODULE_6__.useState)(now()),timeNow=_useState[0],setTimeNow=_useState[1];(0,react__WEBPACK_IMPORTED_MODULE_6__.useEffect)((function(){var timeoutId=function tick(){var then=dateParser(date).valueOf();if(!then)return console.warn("Invalid Date provided"),0;var seconds=Math.round(Math.abs(timeNow-then)/1e3),unboundPeriod=seconds<60?1e3:seconds<3600?6e4:seconds<DAY?36e5:6048e5,period=Math.min(Math.max(unboundPeriod,1e3*minPeriod),1e3*maxPeriod);return period?setTimeout((function(){setTimeNow(now())}),period):0}();return function(){timeoutId&&clearTimeout(timeoutId)}}),[date,live,maxPeriod,minPeriod,now,timeNow]);var then=dateParser(date).valueOf();if(!then)return null;var seconds=Math.round(Math.abs(timeNow-then)/1e3),suffix=then<timeNow?"ago":"from now",_ref2=seconds<60?[Math.round(seconds),"second"]:seconds<3600?[Math.round(seconds/60),"minute"]:seconds<DAY?[Math.round(seconds/3600),"hour"]:seconds<604800?[Math.round(seconds/DAY),"day"]:seconds<2592e3?[Math.round(seconds/604800),"week"]:seconds<31536e3?[Math.round(seconds/2592e3),"month"]:[Math.round(seconds/31536e3),"year"],_ref3=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_slicedToArray_js__WEBPACK_IMPORTED_MODULE_3___default()(_ref2,2),value=_ref3[0],unit=_ref3[1];return formatter(value,unit,suffix,then,defaultFormatter.bind(null,value,unit,suffix),now)}}}]);