"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[2073],{"./libs/webb-ui-components/src/stories/molecules/AvatarGroup.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _Default_parameters,_Default_parameters_docs,_Default_parameters1,react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_components_Avatar__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/webb-ui-components/src/components/Avatar/index.ts"),_components_AvatarGroup__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/AvatarGroup/index.ts"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement;const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/AvatarGroup",component:_components_AvatarGroup__WEBPACK_IMPORTED_MODULE_2__.Z};var Default=function Template(args){return __jsx(_components_AvatarGroup__WEBPACK_IMPORTED_MODULE_2__.Z,args,__jsx(_components_Avatar__WEBPACK_IMPORTED_MODULE_1__.e,{src:"https://webb-assets.s3.amazonaws.com/WebbLogo.svg"}),__jsx(_components_Avatar__WEBPACK_IMPORTED_MODULE_1__.e,{src:"https://webb-assets.s3.amazonaws.com/WebbLogo.svg"}))}.bind({});Default.args={total:2},Default.parameters={...Default.parameters,docs:{...null===(_Default_parameters=Default.parameters)||void 0===_Default_parameters?void 0:_Default_parameters.docs,source:{originalSource:'args => <AvatarGroup {...args}>\n    <Avatar src="https://webb-assets.s3.amazonaws.com/WebbLogo.svg" />\n    <Avatar src="https://webb-assets.s3.amazonaws.com/WebbLogo.svg" />\n  </AvatarGroup>',...null===(_Default_parameters1=Default.parameters)||void 0===_Default_parameters1||null===(_Default_parameters_docs=_Default_parameters1.docs)||void 0===_Default_parameters_docs?void 0:_Default_parameters_docs.source}}};const __namedExportsOrder=["Default"]},"./libs/webb-ui-components/src/components/Avatar/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{e:()=>Avatar});var dist=__webpack_require__("./node_modules/@radix-ui/react-avatar/dist/index.mjs"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Typography=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),dynamic=(__webpack_require__("./node_modules/core-js/modules/es.array.iterator.js"),__webpack_require__("./node_modules/core-js/modules/es.promise.js"),__webpack_require__("./node_modules/core-js/modules/web.dom-collections.iterator.js"),__webpack_require__("./node_modules/next/dynamic.js")),Identicon=__webpack_require__.n(dynamic)()((function(){return Promise.all([__webpack_require__.e(7348),__webpack_require__.e(2606),__webpack_require__.e(219),__webpack_require__.e(7790)]).then(__webpack_require__.bind(__webpack_require__,"./node_modules/@polkadot/react-identicon/index.js"))}),{loadableGenerated:{webpack:()=>["./node_modules/@polkadot/react-identicon/index.js"]},ssr:!1,loadableGenerated:{webpack:function webpack(){return["./node_modules/@polkadot/react-identicon/index.js"]}}});__webpack_require__("./node_modules/core-js/modules/es.error.cause.js");function getAvatarSizeInPx(){switch(arguments.length>0&&void 0!==arguments[0]?arguments[0]:"md"){case"sm":return 16;case"md":return 24;case"lg":return 48;default:throw new Error("Unknown avatar size in [getAvatarSizeInPx] function")}}var __jsx=react.createElement,Avatar=function Avatar(props){var alt=props.alt,outerClassName=props.className,darkMode=props.darkMode,fallback=props.fallback,_props$size=props.size,size=void 0===_props$size?"md":_props$size,_props$sourceVariant=props.sourceVariant,sourceVariant=void 0===_props$sourceVariant?"address":_props$sourceVariant,src=props.src,_props$theme=props.theme,theme=void 0===_props$theme?"polkadot":_props$theme,valueProp=props.value,sizeClassName=(0,react.useMemo)((function(){switch(size){case"sm":return"w-4 h-4";case"md":default:return"w-6 h-6";case"lg":return"w-12 h-12"}}),[size]),classNames=(0,react.useMemo)((function(){return function getAvatarClassNames(darkMode){return{borderColor:"boolean"==typeof darkMode?darkMode?"border-mono-140":"border-mono-60":"border-mono-60 dark:border-mono-140",bg:"boolean"==typeof darkMode?darkMode?"bg-mono-140":"bg-mono-60":"bg-mono-60 dark:bg-mono-140",text:"boolean"==typeof darkMode?darkMode?"text-mono-60":"text-mono-140":"text-mono-140 dark:text-mono-60"}}(darkMode)}),[darkMode]),typoVariant=(0,react.useMemo)((function(){return"md"===size?"body4":"body1"}),[size]),valueAddress=(0,react.useMemo)((function(){return"address"===sourceVariant?valueProp:void 0}),[valueProp,sourceVariant]);return __jsx(dist.bL,{className:(0,bundle_mjs.QP)("inline-flex items-center justify-center align-middle overflow-hidden rounded-full border box-border",sizeClassName,classNames.borderColor,classNames.bg,outerClassName)},valueAddress&&__jsx(Identicon,{size:getAvatarSizeInPx(size),value:valueAddress,theme,style:{cursor:"auto"}}),!valueAddress&&__jsx(react.Fragment,null,__jsx(dist._V,{src,alt,className:"object-cover w-full h-full"}),fallback&&__jsx(dist.H4,{className:classnames_default()("w-full h-full flex justify-center items-center",classNames.text)},__jsx(Typography.o,{variant:typoVariant,fw:"semibold",component:"span",className:classNames.text},fallback.substring(0,2)))))};Avatar.__docgenInfo={description:'Webb Avatar component\n\nProps:\n\n- `size`: Size of avatar - `md`: 24px, `lg`: 48px (default: `md`)\n- `darkMode`: Control darkMode using `js`, leave it\'s empty to control dark mode using `css`\n- `src`: Image source for avatar\n- `alt`: Alternative text if source is unavailable\n- `fallback`: Optional fallback text if source image is unavailable\n- `className`: Outer class name\n\n@example\n\n<Avatar alt="Webb Logo" src="webblogo.png" />',methods:[],displayName:"Avatar",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:'Size of avatar, `sm`: 16px, `md`: 24px, `lg`: 48px (default: "md")'},src:{required:!1,tsType:{name:"string"},description:"Source for avatar"},alt:{required:!1,tsType:{name:"string"},description:"Alternative text if source is unavailable"},fallback:{required:!1,tsType:{name:"string"},description:"Fallback if source image is unavailable"},sourceVariant:{required:!1,tsType:{name:"union",raw:"'address' | 'uri'",elements:[{name:"literal",value:"'address'"},{name:"literal",value:"'uri'"}]},description:'Source type for the Avatar\n@default "address"'}},composes:["IdenticonBaseProps"]}},"./libs/webb-ui-components/src/components/AvatarGroup/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z:()=>AvatarGroup});__webpack_require__("./node_modules/core-js/modules/es.array.push.js"),__webpack_require__("./node_modules/core-js/modules/es.promise.js");var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),defineProperty=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),defineProperty_default=__webpack_require__.n(defineProperty),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Typography=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts"),_excluded=["children","className","max","total"],__jsx=react.createElement;function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){defineProperty_default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var AvatarGroup=(0,react.forwardRef)((function(_ref,ref){var childrenProp=_ref.children,className=_ref.className,_ref$max=_ref.max,max=void 0===_ref$max?3:_ref$max,total=_ref.total,props=objectWithoutProperties_default()(_ref,_excluded),children=(0,react.useMemo)((function(){return react.Children.toArray(childrenProp).filter((function(child){return react.isValidElement(child)}))}),[childrenProp]),totalAvatars=(0,react.useMemo)((function(){return total||children.length}),[children.length,total]),extraAvatars=(0,react.useMemo)((function(){return totalAvatars-max}),[totalAvatars,max]),mergedClsx=(0,react.useMemo)((function(){return(0,bundle_mjs.QP)("flex items-center space-x-1",className)}),[className]);return __jsx("div",extends_default()({},props,{className:mergedClsx,ref}),__jsx("div",{className:"translate-x-1"},children.slice(0,max).map((function(child,index){return react.cloneElement(child,_objectSpread(_objectSpread({key:index},child.props),{},{size:"md",className:"mx-[-4px] last:mx-0"}))}))),extraAvatars>0&&__jsx(Typography.o,{className:"inline-block translate-x-1",variant:"body3"},"+",extraAvatars," others"))}));AvatarGroup.__docgenInfo={description:'Webb Avatar Group - Use to display stacked avatar list\n\nProps:\n\n- `max`: Max avatars to show before +n (default: `3`)\n- `total`: The total number of avatars. Used for calculating the number of extra avatars (default: `children.length`)\n- `children`: Must be a list of `Avatar` components\n\n@example\n\n```jsx\n <AvatarGroup max={3}>\n   <Avatar alt="Authority1" src="/static/images/avatar/1.jpg" />\n   <Avatar alt="Authority2" src="/static/images/avatar/2.jpg" />\n   <Avatar alt="Authority3" src="/static/images/avatar/3.jpg" />\n </AvatarGroup>\n```',methods:[],displayName:"AvatarGroup",props:{max:{defaultValue:{value:"3",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});__webpack_require__("./node_modules/core-js/modules/es.array.push.js");var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/defineProperty.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2__),react__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts"),_excluded=["children","className","component","fw","ta","variant"];function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,o)}return t}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach((function(r){_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_defineProperty_js__WEBPACK_IMPORTED_MODULE_1___default()(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}var defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=function Typography(props){var children=props.children,className=props.className,component=props.component,_props$fw=props.fw,fw=void 0===_props$fw?"normal":_props$fw,_props$ta=props.ta,ta=void 0===_props$ta?"left":_props$ta,variant=props.variant,restProps=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_2___default()(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return null!=component?component:defaultComponent[variant]}),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_5__.QP)("".concat(variant),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_4__.Qe)(variant),className)}),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_3__.createElement)(_component,_objectSpread(_objectSpread({},restProps),{},{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}}}]);