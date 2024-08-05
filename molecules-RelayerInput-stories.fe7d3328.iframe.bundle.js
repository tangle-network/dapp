"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[5189],{"./libs/dapp-types/src/utils/isPrimitive.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function isPrimitive(value){return null===value||"object"!=typeof value&&"function"!=typeof value}__webpack_require__.d(__webpack_exports__,{A:()=>isPrimitive})},"./libs/webb-ui-components/src/components/Avatar/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{e:()=>Avatar});var jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),dist=__webpack_require__("./node_modules/@radix-ui/react-avatar/dist/index.mjs"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Typography=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),dynamic=(__webpack_require__("./node_modules/core-js/modules/es.array.iterator.js"),__webpack_require__("./node_modules/core-js/modules/es.promise.js"),__webpack_require__("./node_modules/core-js/modules/web.dom-collections.iterator.js"),__webpack_require__("./node_modules/next/dynamic.js"));const Identicon=__webpack_require__.n(dynamic)()((()=>Promise.all([__webpack_require__.e(3221),__webpack_require__.e(2606),__webpack_require__.e(7782),__webpack_require__.e(7790)]).then(__webpack_require__.bind(__webpack_require__,"./node_modules/@polkadot/react-identicon/index.js"))),{loadableGenerated:{webpack:()=>["./node_modules/@polkadot/react-identicon/index.js"]},ssr:!1});__webpack_require__("./node_modules/core-js/modules/es.error.cause.js");function getAvatarSizeInPx(size="md"){switch(size){case"sm":return 16;case"md":return 24;case"lg":return 48;default:throw new Error("Unknown avatar size in [getAvatarSizeInPx] function")}}const Avatar=props=>{const{alt,className:outerClassName,darkMode,fallback,size="md",sourceVariant="address",src,theme="polkadot",value:valueProp}=props,sizeClassName=(0,react.useMemo)((()=>{switch(size){case"sm":return"w-4 h-4";case"md":default:return"w-6 h-6";case"lg":return"w-12 h-12"}}),[size]),classNames=(0,react.useMemo)((()=>(darkMode=>({borderColor:"boolean"==typeof darkMode?darkMode?"border-mono-140":"border-mono-60":"border-mono-60 dark:border-mono-140",bg:"boolean"==typeof darkMode?darkMode?"bg-mono-140":"bg-mono-60":"bg-mono-60 dark:bg-mono-140",text:"boolean"==typeof darkMode?darkMode?"text-mono-60":"text-mono-140":"text-mono-140 dark:text-mono-60"}))(darkMode)),[darkMode]),typoVariant=(0,react.useMemo)((()=>"md"===size?"body4":"body1"),[size]),valueAddress=(0,react.useMemo)((()=>"address"===sourceVariant?valueProp:void 0),[valueProp,sourceVariant]);return(0,jsx_runtime.jsxs)(dist.bL,{className:(0,bundle_mjs.QP)("inline-flex items-center justify-center align-middle overflow-hidden rounded-full border box-border",sizeClassName,classNames.borderColor,classNames.bg,outerClassName),children:[valueAddress&&(0,jsx_runtime.jsx)(Identicon,{size:getAvatarSizeInPx(size),value:valueAddress,theme,style:{cursor:"auto"}}),!valueAddress&&(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(dist._V,{src,alt,className:"object-cover w-full h-full"}),fallback&&(0,jsx_runtime.jsx)(dist.H4,{className:classnames_default()("w-full h-full flex justify-center items-center",classNames.text),children:(0,jsx_runtime.jsx)(Typography.o,{variant:typoVariant,fw:"semibold",component:"span",className:classNames.text,children:fallback.substring(0,2)})})]})]})};Avatar.__docgenInfo={description:'Webb Avatar component\n\nProps:\n\n- `size`: Size of avatar - `md`: 24px, `lg`: 48px (default: `md`)\n- `darkMode`: Control darkMode using `js`, leave it\'s empty to control dark mode using `css`\n- `src`: Image source for avatar\n- `alt`: Alternative text if source is unavailable\n- `fallback`: Optional fallback text if source image is unavailable\n- `className`: Outer class name\n\n@example\n\n<Avatar alt="Webb Logo" src="webblogo.png" />',methods:[],displayName:"Avatar",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:'Size of avatar, `sm`: 16px, `md`: 24px, `lg`: 48px (default: "md")'},src:{required:!1,tsType:{name:"string"},description:"Source for avatar"},alt:{required:!1,tsType:{name:"string"},description:"Alternative text if source is unavailable"},fallback:{required:!1,tsType:{name:"string"},description:"Fallback if source image is unavailable"},sourceVariant:{required:!1,tsType:{name:"union",raw:"'address' | 'uri'",elements:[{name:"literal",value:"'address'"},{name:"literal",value:"'uri'"}]},description:'Source type for the Avatar\n@default "address"'}},composes:["IdenticonBaseProps"]}},"./libs/webb-ui-components/src/components/BridgeInputs/InputWrapper.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>InputWrapper});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["children","className"],InputWrapper=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)(((_ref,ref)=>{let{children,className}=_ref,props=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);const mergedClsx=(0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)("bg-mono-0 dark:bg-mono-140 px-2.5 lg:px-4 py-2 lg:max-w-[518px] w-full rounded-lg flex items-center justify-between cursor-pointer",className)),[className]);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",Object.assign({},props,{className:mergedClsx,ref,children}))}));InputWrapper.__docgenInfo={description:"",methods:[],displayName:"InputWrapper"}},"./libs/webb-ui-components/src/components/BridgeInputs/RelayerInput.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>RelayerInput});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/icons/src/index.ts"),react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_typography_Typography__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),_utils_shortenString__WEBPACK_IMPORTED_MODULE_10__=__webpack_require__("./libs/webb-ui-components/src/utils/shortenString.ts"),_Avatar__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./libs/webb-ui-components/src/components/Avatar/index.ts"),_Label__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./libs/webb-ui-components/src/components/Label/index.ts"),_TitleWithInfo__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./libs/webb-ui-components/src/components/TitleWithInfo/index.ts"),_InputWrapper__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./libs/webb-ui-components/src/components/BridgeInputs/InputWrapper.tsx");const _excluded=["externalLink","id","info","relayerAddress","iconTheme"],RelayerInput=(0,react__WEBPACK_IMPORTED_MODULE_3__.forwardRef)(((_ref,ref)=>{let{externalLink,id,info,relayerAddress,iconTheme}=_ref,props=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_9__.A)(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_InputWrapper__WEBPACK_IMPORTED_MODULE_8__.o,Object.assign({},props,{ref,children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",{className:"flex flex-col space-y-1",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_Label__WEBPACK_IMPORTED_MODULE_6__.J,{htmlFor:id,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_TitleWithInfo__WEBPACK_IMPORTED_MODULE_7__.B,{title:"Relayer",variant:"utility",info,titleComponent:"span",className:"text-mono-100 dark:text-mono-80",titleClassName:"capitalize !text-inherit"})}),relayerAddress?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",{className:"flex items-center space-x-1",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_Avatar__WEBPACK_IMPORTED_MODULE_5__.e,{theme:iconTheme,value:relayerAddress}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_typography_Typography__WEBPACK_IMPORTED_MODULE_4__.o,{component:"span",variant:"h5",fw:"bold",children:(0,_utils_shortenString__WEBPACK_IMPORTED_MODULE_10__.l)(relayerAddress)}),externalLink&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("a",{target:"_blank",href:externalLink,rel:"noopener noreferrer",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.kX,{})})]}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_typography_Typography__WEBPACK_IMPORTED_MODULE_4__.o,{variant:"h5",fw:"bold",className:"text-black dark:text-white",children:"Add a relayer"})]}),relayerAddress?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.bm,{className:"inline-block"}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.c_,{className:"inline-block"})]}))}));RelayerInput.__docgenInfo={description:"The `RelayerInput` component\n\nProps:\n\n- `relayerAddress`: The relayer address to display\n- `externalLink`: The external url of a relayer\n\n@example\n\n```jsx\n<RelayerInput />\n<RelayerInput\n  relayerAddress='5DJEpHVVxSpaWGfdAzep11MK458y5JkHA5YvYm3dp3eawuXi'\n  externalLink='https://webb.tools'\n/>\n```",methods:[],displayName:"RelayerInput"}},"./libs/webb-ui-components/src/components/Label/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{J:()=>Label});__webpack_require__("./node_modules/core-js/modules/es.object.assign.js");var jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),dist=__webpack_require__("./node_modules/@radix-ui/react-label/dist/index.mjs");const Label=props=>(0,jsx_runtime.jsx)(dist.b,Object.assign({},props));Label.__docgenInfo={description:"The accessible `Label` component\n\n@example\n\n```jsx\n <Label className='font-bold uppercase body4' htmlFor=\"username\">\n   Username\n </Label>\n```",methods:[],displayName:"Label"}},"./libs/webb-ui-components/src/components/TitleWithInfo/TitleWithInfo.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>TitleWithInfo});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/icons/src/index.ts"),_typography__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),react__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_Tooltip__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/index.ts"),_webb_tools_dapp_types_utils_isPrimitive__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./libs/dapp-types/src/utils/isPrimitive.ts");const _excluded=["className","info","title","titleClassName","titleComponent","variant","isCenterInfo"],TitleWithInfo=(0,react__WEBPACK_IMPORTED_MODULE_4__.forwardRef)(((_ref,ref)=>{let{className,info,title,titleClassName,titleComponent="span",variant="body1",isCenterInfo}=_ref,props=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_6__.A)(_ref,_excluded);const mergedClsx=(0,react__WEBPACK_IMPORTED_MODULE_4__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_7__.QP)("flex items-center space-x-1 text-mono-180 dark:text-mono-0",className)),[className]);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",Object.assign({},props,{className:mergedClsx,ref,children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_typography__WEBPACK_IMPORTED_MODULE_3__.o,{component:titleComponent,variant,fw:"bold",className:titleClassName,children:title}),info&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_Tooltip__WEBPACK_IMPORTED_MODULE_5__.m_,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_Tooltip__WEBPACK_IMPORTED_MODULE_5__.k$,{className:"text-center",asChild:!0,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("span",{className:"cursor-pointer !text-inherit",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_2__.B$,{className:"!fill-current pointer-events-none"})})}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_Tooltip__WEBPACK_IMPORTED_MODULE_5__.SK,{className:"break-normal max-w-[200px]",children:(0,_webb_tools_dapp_types_utils_isPrimitive__WEBPACK_IMPORTED_MODULE_8__.A)(info)&&null!=info?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_typography__WEBPACK_IMPORTED_MODULE_3__.o,{ta:isCenterInfo?"center":"left",variant:"body3",className:"break-normal",children:info}):info})]})]}))}));TitleWithInfo.__docgenInfo={description:"The re-useable title component with small info in a popup tooltip\n\n@example\n\n```jsx\n <TitleWithInfo title='Active key' info='This is the active key card' />\n```",methods:[],displayName:"TitleWithInfo",props:{titleComponent:{defaultValue:{value:"'span'",computed:!1},required:!1},variant:{defaultValue:{value:"'body1'",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/TitleWithInfo/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>_TitleWithInfo__WEBPACK_IMPORTED_MODULE_0__.B});var _TitleWithInfo__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/TitleWithInfo/TitleWithInfo.tsx")},"./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>TooltipBody,k$:()=>TooltipTrigger,m_:()=>Tooltip});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@radix-ui/react-tooltip/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["button","children","className","title","isDisablePortal"],_excluded2=["children","className"],_excluded3=["children","isDefaultOpen","isDisableHoverableContent","isOpen","onChange","delayDuration"],TooltipBody=_ref=>{let{button,children,className,title,isDisablePortal}=_ref,props=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);const inner=(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.UC,Object.assign({sideOffset:4,className:classnames__WEBPACK_IMPORTED_MODULE_2___default()("radix-side-top:animate-slide-down-fade","radix-side-right:animate-slide-left-fade","radix-side-bottom:animate-slide-up-fade","radix-side-left:animate-slide-right-fade","inline-flex items-center break-all rounded p-2","bg-mono-20 dark:bg-mono-160","webb-shadow-sm z-[9999]")},props,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.i3,{className:"fill-current text-mono-20 dark:text-mono-160 webb-shadow-sm"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)("div",{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("body4 text-mono-140 dark:text-mono-80 font-normal min-w-0 max-w-[300px]",className),children:[title&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("h6",{className:"mb-2 utility",children:title}),children,button&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)("div",{className:"flex justify-end mt-4",children:button})]})]}));return isDisablePortal?inner:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.ZL,{children:inner})},TooltipTrigger=_ref2=>{let{children,className}=_ref2,props=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref2,_excluded2);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.l9,Object.assign({className},props,{children}))},Tooltip=_ref3=>{let{children,isDefaultOpen,isDisableHoverableContent,isOpen,onChange,delayDuration=100}=_ref3,props=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref3,_excluded3);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.Kq,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_tooltip__WEBPACK_IMPORTED_MODULE_4__.bL,Object.assign({},props,{defaultOpen:isDefaultOpen,open:isOpen,onOpenChange:onChange,disableHoverableContent:isDisableHoverableContent,delayDuration,children}))})};TooltipBody.__docgenInfo={description:"The `ToolTipBody` component, use after the `TooltipTrigger`.\nReresents the popup content of the tooltip.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipBody className='max-w-[185px] w-auto'>\n     <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n   </ToolTipBody>\n```",methods:[],displayName:"TooltipBody"},TooltipTrigger.__docgenInfo={description:"The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.\nMust use inside the `Tooltip` component.\n\n@example\n\n```jsx\n   <ToolTipTrigger>\n     <Chip color='blue'>Text only</Chip>\n   </ToolTipTrigger>\n```",methods:[],displayName:"TooltipTrigger"},Tooltip.__docgenInfo={description:"The `Tooltip` component.\n\n@example\n\n```jsx\n   <Tooltip isDefaultOpen>\n     <ToolTipTrigger>\n       <Chip color='blue'>Text only</Chip>\n     </ToolTipTrigger>\n     <ToolTipBody className='max-w-[185px] w-auto'>\n       <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>\n     </ToolTipBody>\n   </Tooltip>\n```",methods:[],displayName:"Tooltip",props:{delayDuration:{defaultValue:{value:"100",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/Tooltip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{SK:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.SK,k$:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.k$,m_:()=>_Tooltip__WEBPACK_IMPORTED_MODULE_0__.m_});var _Tooltip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/Tooltip.tsx")},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/index.js")),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=props=>{const{children,className,component,fw="normal",ta="left",variant}=props,restProps=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>null!=component?component:defaultComponent[variant]),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_2__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_2__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_2__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_1__.createElement)(_component,Object.assign({},restProps,{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}},"./libs/webb-ui-components/src/utils/shortenString.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{l:()=>shortenString});const shortenString=(str,chars=4)=>{if(str.length<=2*chars)return str;return`${str.split("").slice(0,chars).join("")}...${str.split("").slice(-chars).join("")}`}},"./libs/webb-ui-components/src/stories/molecules/RelayerInput.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,WithValueInput:()=>WithValueInput,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/core-js/modules/es.object.assign.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_BridgeInputs_RelayerInput__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/BridgeInputs/RelayerInput.tsx");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/RelayerInput",component:_components_BridgeInputs_RelayerInput__WEBPACK_IMPORTED_MODULE_2__.Z},Template=args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_BridgeInputs_RelayerInput__WEBPACK_IMPORTED_MODULE_2__.Z,Object.assign({},args)),Default=Template.bind({});Default.args={};const WithValueInput=Template.bind({});WithValueInput.args=Object.assign({},Default.args,{relayerAddress:"0x71C7656EC7ab88b098defB751B7401B5f6d8976F",externalLink:"https://webb.tools"});const __namedExportsOrder=["Default","WithValueInput"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"args => <RelayerInput {...args} />",...Default.parameters?.docs?.source}}},WithValueInput.parameters={...WithValueInput.parameters,docs:{...WithValueInput.parameters?.docs,source:{originalSource:"args => <RelayerInput {...args} />",...WithValueInput.parameters?.docs?.source}}}}}]);