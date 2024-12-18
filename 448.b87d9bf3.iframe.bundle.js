(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[448],{"./src/components/Avatar/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{e:()=>Avatar});var jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),dist=__webpack_require__("../../node_modules/@radix-ui/react-avatar/dist/index.mjs"),classnames=__webpack_require__("../../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),Typography=__webpack_require__("./src/typography/Typography/index.ts"),esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),react_identicon=__webpack_require__("../../node_modules/@polkadot/react-identicon/index.js");const Identicon=props=>(0,jsx_runtime.jsx)(react_identicon.Ay,(0,esm_extends.A)({},props));function getAvatarSizeInPx(size="md"){switch(size){case"sm":return 16;case"md":return 24;case"lg":return 48;default:throw new Error("Unknown avatar size in [getAvatarSizeInPx] function")}}Identicon.__docgenInfo={description:"",methods:[],displayName:"Identicon"};var Tooltip=__webpack_require__("./src/components/Tooltip/index.ts");const Avatar=({alt,className:outerClassName,darkMode,fallback,size:_size="md",sourceVariant:_sourceVariant="address",src,theme:_theme="polkadot",value:valueProp,tooltip})=>{const sizeClassName=(()=>{switch(_size){case"sm":return"w-4 h-4";case"md":return"w-6 h-6";case"lg":return"w-12 h-12"}})(),classNames=(0,react.useMemo)((()=>(darkMode=>({borderColor:"boolean"==typeof darkMode?darkMode?"border-mono-140":"border-mono-60":"border-mono-60 dark:border-mono-140",bg:"boolean"==typeof darkMode?darkMode?"bg-mono-140":"bg-mono-60":"bg-mono-60 dark:bg-mono-140",text:"boolean"==typeof darkMode?darkMode?"text-mono-60":"text-mono-140":"text-mono-140 dark:text-mono-60"}))(darkMode)),[darkMode]),typoVariant="md"===_size?"body4":"body1",valueAddress="address"===_sourceVariant?valueProp:void 0,avatar=(0,jsx_runtime.jsxs)(dist.bL,{className:(0,bundle_mjs.QP)("inline-flex items-center justify-center align-middle overflow-hidden rounded-full border box-border",sizeClassName,classNames.borderColor,classNames.bg,outerClassName),children:[valueAddress&&(0,jsx_runtime.jsx)(Identicon,{size:getAvatarSizeInPx(_size),value:valueAddress,theme:_theme,style:{cursor:"auto"}}),!valueAddress&&(0,jsx_runtime.jsxs)(jsx_runtime.Fragment,{children:[(0,jsx_runtime.jsx)(dist._V,{src,alt,className:"object-cover w-full h-full"}),fallback&&(0,jsx_runtime.jsx)(dist.H4,{className:classnames_default()("w-full h-full flex justify-center items-center",classNames.text),children:(0,jsx_runtime.jsx)(Typography.o,{variant:typoVariant,fw:"semibold",component:"span",className:classNames.text,children:fallback.substring(0,2)})})]})]});return void 0!==tooltip?(0,jsx_runtime.jsxs)(Tooltip.m_,{children:[(0,jsx_runtime.jsx)(Tooltip.k$,{children:avatar}),(0,jsx_runtime.jsx)(Tooltip.SK,{className:"break-normal max-w-[250px] text-center",children:tooltip})]}):avatar};Avatar.__docgenInfo={description:'Webb Avatar component\n\nProps:\n\n- `size`: Size of avatar - `md`: 24px, `lg`: 48px (default: `md`)\n- `darkMode`: Control darkMode using `js`, leave it\'s empty to control dark mode using `css`\n- `src`: Image source for avatar\n- `alt`: Alternative text if source is unavailable\n- `fallback`: Optional fallback text if source image is unavailable\n- `className`: Outer class name\n- `tooltip`: Tooltip text to display on hover\n\n@example\n\n<Avatar alt="Webb Logo" src="webblogo.png" />',methods:[],displayName:"Avatar",props:{size:{defaultValue:{value:"'md'",computed:!1},required:!1},sourceVariant:{defaultValue:{value:"'address'",computed:!1},required:!1},theme:{defaultValue:{value:"'polkadot'",computed:!1},required:!1}}}},"./src/components/Dropdown/Dropdown.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{m:()=>Dropdown});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_radix_ui_react_dropdown_menu__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs"),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["children","className","radixRootProps"],Dropdown=(0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(((_ref,ref)=>{let{children,className,radixRootProps}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_2__.A)(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_3__.A)({},props,{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)("relative inline-block text-left",className),ref,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_dropdown_menu__WEBPACK_IMPORTED_MODULE_5__.bL,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_3__.A)({modal:!1},radixRootProps,{children}))}))}));Dropdown.__docgenInfo={description:"The wrapper of Radix `DropdownRoot`",methods:[],displayName:"Dropdown",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},radixRootProps:{required:!1,tsType:{name:"RdxDropdownMenuProps"},description:"The root radix dropdown props"}}}},"./src/components/Dropdown/DropdownBasicButton.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{a:()=>DropdownBasicButton});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_radix_ui_react_dropdown_menu__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["children","className","isFullWidth"],DropdownBasicButton=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)(((_ref,ref)=>{let{children,className,isFullWidth}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_radix_ui_react_dropdown_menu__WEBPACK_IMPORTED_MODULE_4__.l9,{asChild:!0,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button",(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_5__.A)({},props,{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)(classnames__WEBPACK_IMPORTED_MODULE_1___default()({"block w-full":isFullWidth}),className),ref,children}))})}));DropdownBasicButton.__docgenInfo={description:"The `DropdownMenu` trigger function, must use inside the `Dropdown` component",methods:[],displayName:"DropdownBasicButton",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},isFullWidth:{required:!1,tsType:{name:"boolean"},description:"If true, the button will be rendered as a full width button"},hideChevron:{required:!1,tsType:{name:"boolean"},description:""}},composes:["Pick"]}},"./src/components/Dropdown/DropdownMenuItem.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_dropdown_menu__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs"),classnames__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/classnames/index.js"),classnames__WEBPACK_IMPORTED_MODULE_2___default=__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["children","className","leftIcon","rightIcon","textTransform","disabled","isActive"],DropdownMenuItem=(0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(((_ref,ref)=>{let{children,className:clsxProp,leftIcon,rightIcon,textTransform="capitalize",disabled=!1,isActive=!1}=_ref,props=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(_ref,_excluded);const className=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)(classnames__WEBPACK_IMPORTED_MODULE_2___default()("flex items-center px-4 py-2 text-base outline-none",disabled?"opacity-60":"cursor-pointer",{"hover:bg-blue-0 dark:hover:bg-mono-170":!disabled},{"focus:bg-blue-0 dark:focus:bg-mono-170":!disabled},{"hover:text-mono-200 dark:hover:text-mono-0":!disabled},{"focus:text-mono-200 dark:focus:text-mono-0":!disabled},{"bg-blue-0 dark:bg-mono-170":isActive},{"text-mono-200 dark:text-mono-0":isActive},"radix-state-checked:text-mono-200 dark:radix-state-checked:text-mono-0","radix-state-active:text-mono-200 dark:radix-state-active:text-mono-0"),textTransform,clsxProp)),[clsxProp,textTransform,disabled,isActive]);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_radix_ui_react_dropdown_menu__WEBPACK_IMPORTED_MODULE_5__.q7,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_6__.A)({className},props,{ref,children:[leftIcon&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"mr-2.5 shrink-0",children:leftIcon}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span",{className:"flex-grow text-inherit dark:text-inherit",children}),rightIcon&&(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"shrink-0",children:rightIcon})]}))})),__WEBPACK_DEFAULT_EXPORT__=DropdownMenuItem;DropdownMenuItem.__docgenInfo={description:"The DropdownMenuItem component (must be used inside the `Dropdown*` component)\n\nProps:\n\n- `rightIcon`: The icon displayed after the text\n- `leftIcon`: The icon displayed before the text\n- `textTransform`: The text transform style\n\n@example\n\n```jsx\n <DropdownMenuItem rightIcon={<Filter />}>Filter</DropdownMenuItem>\n <DropdownMenuItem>Item 1</DropdownMenuItem>\n```",methods:[],displayName:"DropdownMenuItem",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},isActive:{required:!1,tsType:{name:"boolean"},description:"Handle state if the item is being active",defaultValue:{value:"false",computed:!1}},leftIcon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement"},description:"The icon displayed on the left before the text"},rightIcon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement"},description:"The icon displayed on the right"},textTransform:{required:!1,tsType:{name:"union",raw:"'uppercase' | 'lowercase' | 'capitalize' | 'normal-case' | ''",elements:[{name:"literal",value:"'uppercase'"},{name:"literal",value:"'lowercase'"},{name:"literal",value:"'capitalize'"},{name:"literal",value:"'normal-case'"},{name:"literal",value:"''"}]},description:"The text transform\n@default 'capitalize'",defaultValue:{value:"'capitalize'",computed:!1}},disabled:{defaultValue:{value:"false",computed:!1},required:!1}},composes:["RdxDropdownMenuItemProps"]}},"./src/components/Dropdown/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{$r:()=>Dropdown_AccountDropdownBody,ms:()=>Dropdown.m,ax:()=>DropdownBasicButton.a,E9:()=>DropdownBody,gf:()=>DropdownButton,rI:()=>Dropdown_DropdownMenu,_2:()=>DropdownMenuItem.A});var Dropdown=__webpack_require__("./src/components/Dropdown/Dropdown.tsx"),DropdownBasicButton=__webpack_require__("./src/components/Dropdown/DropdownBasicButton.tsx"),esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),dist=__webpack_require__("../../node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs"),classnames=__webpack_require__("../../node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs");const _excluded=["children","className","size","isPortal"],DropdownBody=(0,react.forwardRef)(((_ref,ref)=>{let{children,className,size,isPortal=!0}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const inner=(0,jsx_runtime.jsx)(dist.UC,(0,esm_extends.A)({align:"end"},props,{sideOffset:"sm"===size?8:0,className:(0,bundle_mjs.QP)(classnames_default()("radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down","min-w-[176px] shadow-md overflow-x-hidden overflow-y-auto webb-shadow-md","md"===size?"rounded-b-lg border border-t-0":"rounded-lg border","border-mono-80 dark:border-mono-120","bg-mono-0 dark:bg-mono-180","max-h-[var(--radix-dropdown-menu-content-max-height)]"),className),ref,children}));return isPortal?(0,jsx_runtime.jsx)(dist.ZL,{children:inner}):inner}));DropdownBody.__docgenInfo={description:"The style wrapper around Radix `Content` and `Portal` component, must use inside the `Dropdown` component",methods:[],displayName:"DropdownBody",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},isPortal:{required:!1,tsType:{name:"boolean"},description:"If true, the dropdown will be rendered as a portal\n@default true",defaultValue:{value:"true",computed:!1}}},composes:["Pick","DropdownMenuContentProps"]};var src=__webpack_require__("../icons/src/index.ts");const DropdownButton_excluded=["className","icon","label","size","isFullWidth","hideChevron"],DropdownButton=(0,react.forwardRef)(((_ref,ref)=>{let{className,icon,label,size,isFullWidth,hideChevron}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,DropdownButton_excluded);return(0,jsx_runtime.jsx)(dist.l9,{asChild:!0,children:(0,jsx_runtime.jsxs)("button",(0,esm_extends.A)({},props,{className:(0,bundle_mjs.QP)(classnames_default()("border rounded-lg uppercase group","transition-none transition-[border-radius]","pl-4 py-2",isFullWidth&&"inline-block w-full","md"===size?"min-w-[176px]":"min-w-[96px]","flex items-center justify-between","bg-mono-0 dark:bg-mono-180","border-mono-80 dark:border-mono-120","text-mono-140 dark:text-mono-40","hover:enabled:border-blue-40 dark:hover:enabled:border-blue-70","enabled:radix-state-open:border-blue-40 dark:enabled:radix-state-open:border-blue-70","enabled:radix-state-open:bg-blue-0 dark:enabled:radix-state-open:bg-blue-120","sm"!==size&&"enabled:radix-state-open:rounded-t-lg","sm"!==size&&"enabled:radix-state-open:rounded-b-none"),className),ref,children:[(0,jsx_runtime.jsxs)("div",{className:"flex items-center max-w-full gap-1 overflow-x-hidden",children:[icon&&(0,jsx_runtime.jsx)("span",{className:"text-inherit",children:icon}),label&&(0,jsx_runtime.jsx)("span",{className:classnames_default()("text-inherit","md"===size?"body1":"body2"),children:label})]}),!hideChevron&&(0,jsx_runtime.jsx)(src.yQ,{className:"mx-2 transition-transform duration-300 ease-in-out enabled:group-radix-state-open:rotate-180"})]}))})}));DropdownButton.__docgenInfo={description:"The `DropdownMenu` trigger function, must use inside the `Dropdown` component",methods:[],displayName:"DropdownButton",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},isFullWidth:{required:!1,tsType:{name:"boolean"},description:"If true, the button will be rendered as a full width button"},hideChevron:{required:!1,tsType:{name:"boolean"},description:""}},composes:["Pick"]};var DropdownMenuItem=__webpack_require__("./src/components/Dropdown/DropdownMenuItem.tsx");const DropdownMenu=(0,react.forwardRef)(((props,ref)=>{const{className,icon:iconProp,label,menuOptions,onChange,size="md",value}=props,icon=(0,react.useMemo)((()=>{if(iconProp)return(0,react.cloneElement)(iconProp,(0,esm_extends.A)({},iconProp.props,{size:"md"===size?"lg":"md",className:(0,bundle_mjs.QP)("fill-current dark:fill-current",iconProp.props.className)}))}),[iconProp,size]),triggerText=(0,react.useMemo)((()=>{if(value)return value;if(!label&&!menuOptions.length)throw new Error("DropdownMenu without label needs an option list to render");return!label&&menuOptions.length>0?menuOptions[0].value:label}),[label,menuOptions,value]);return(0,jsx_runtime.jsxs)(Dropdown.m,{className,ref,children:[(0,jsx_runtime.jsx)(DropdownButton,{label:triggerText,icon,size}),(0,jsx_runtime.jsx)(DropdownBody,{size,children:(0,jsx_runtime.jsx)(dist.z6,{value,onValueChange:onChange,children:menuOptions.map((({icon,value},i)=>(0,jsx_runtime.jsx)(dist.hN,{value,asChild:!0,children:(0,jsx_runtime.jsx)(DropdownMenuItem.A,{rightIcon:icon,children:value})},`${value}-${i}`)))})})]})})),Dropdown_DropdownMenu=DropdownMenu;DropdownMenu.__docgenInfo={description:"The `DropdownMenu` component\n\n- `size`: The `Dropdown` size\n- `label`: The label to be display, if not provided, the `Dropdown` trigger will display the value property\n- `icon`: The icon before the `Dropdown` label\n- `menuOptions`: Options array to display\n- `value`: Current selected value (default will get the first item in the option list)\n- `onChange`: Callback function to update the value\n\n```jsx\n <DropdownMenu className='mr-3' size='sm' label='Filter' icon={<Filter />} menuOptions={dropdownOptions} />\n <DropdownMenu\n   label='Brand'\n   menuOptions={dropdownOptions}\n   value={value}\n   onChange={(nextVal) => setValue(nextVal)}\n />\n```",methods:[],displayName:"DropdownMenu",props:{size:{required:!1,tsType:{name:"union",raw:"'md' | 'sm'",elements:[{name:"literal",value:"'md'"},{name:"literal",value:"'sm'"}]},description:"The `Dropdown` size"},label:{required:!1,tsType:{name:"string"},description:"The label to be display, if not provided, the `Dropdown` trigger will display the value property"},icon:{required:!1,tsType:{name:"ReactReactElement",raw:"React.ReactElement"},description:"The icon before the `Dropdown` label"},menuOptions:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{\n  /**\n   * The item value and the display text\n   */\n  value: string;\n  /**\n   * Item icon\n   */\n  icon?: React.ReactElement;\n}",signature:{properties:[{key:"value",value:{name:"string",required:!0},description:"The item value and the display text"},{key:"icon",value:{name:"ReactReactElement",raw:"React.ReactElement",required:!1},description:"Item icon"}]}}],raw:"Array<DropDownMemuOption>"},description:"Options array to display"},value:{required:!1,tsType:{name:"string"},description:"Current selected value"},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(nextValue: string) => void",signature:{arguments:[{type:{name:"string"},name:"nextValue"}],return:{name:"void"}}},description:"Callback function to update the value"}},composes:["Omit"]};var isAddress=__webpack_require__("../../node_modules/@polkadot/util-crypto/ethereum/isAddress.js"),Avatar=__webpack_require__("./src/components/Avatar/index.ts"),Typography=__webpack_require__("./src/typography/Typography/index.ts"),utils=__webpack_require__("./src/utils/index.ts");const AccountDropdownBody=({accountItems,className,addressShortenFn})=>(0,jsx_runtime.jsx)(DropdownBody,{className:(0,bundle_mjs.QP)("radix-side-top:mb-2 radix-side-bottom:mt-2 w-[var(--radix-dropdown-menu-trigger-width)]",className),children:(0,jsx_runtime.jsx)("ul",{children:accountItems.map((({address,name,onClick})=>(0,jsx_runtime.jsx)("li",{onClick,children:(0,jsx_runtime.jsxs)(DropdownMenuItem.A,{textTransform:"",leftIcon:(0,jsx_runtime.jsx)(Avatar.e,{theme:(0,isAddress.q)(address)?"ethereum":(0,utils.qy)(address)?"substrate":void 0,value:address}),children:[name," ",(0,jsx_runtime.jsx)(Typography.o,{variant:"mkt-caption",children:addressShortenFn?addressShortenFn(address):address})]})},address)))})}),Dropdown_AccountDropdownBody=AccountDropdownBody;AccountDropdownBody.__docgenInfo={description:"",methods:[],displayName:"AccountDropdownBody",props:{accountItems:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:"{\n  address: string;\n  name: string;\n  onClick: () => void;\n}",signature:{properties:[{key:"address",value:{name:"string",required:!0}},{key:"name",value:{name:"string",required:!0}},{key:"onClick",value:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}},required:!0}}]}}],raw:"{\n  address: string;\n  name: string;\n  onClick: () => void;\n}[]"},description:""},className:{required:!1,tsType:{name:"string"},description:""},addressShortenFn:{required:!1,tsType:{name:"signature",type:"function",raw:"(address: string) => string",signature:{arguments:[{type:{name:"string"},name:"address"}],return:{name:"string"}}},description:""}}}},"?2e65":()=>{}}]);