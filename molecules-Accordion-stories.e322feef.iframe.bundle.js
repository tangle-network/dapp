"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[3047],{"./libs/webb-ui-components/src/components/Accordion/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{nD:()=>Accordion,J2:()=>AccordionButton,i8:()=>Accordion_AccordionButtonBase,ub:()=>AccordionContent,As:()=>AccordionItem});var objectWithoutPropertiesLoose=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js")),dist=__webpack_require__("./node_modules/@radix-ui/react-accordion/dist/index.mjs"),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");const _excluded=["darkMode"],Accordion=(0,react.forwardRef)(((_ref,ref)=>{let props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);return(0,jsx_runtime.jsx)(dist.bL,Object.assign({},props,{ref}))}));Accordion.__docgenInfo={description:"The wrapper around Radix Accordion Root, use for displaying collapsible content\n\n@example\n\n```jsx\n   <Accordion>\n     <AccordionItem value='item1'>\n       <AccordionButton>Click to expand</AccordionButton>\n       <AccordionContent>Expanded section</AccordionContent>\n     </AccordionItem>\n   </Accordion>\n```",methods:[],displayName:"Accordion"};var src=__webpack_require__("./libs/icons/src/index.ts"),typography=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),classnames=__webpack_require__("./node_modules/classnames/index.js"),classnames_default=__webpack_require__.n(classnames),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs");const AccordionButton_excluded=["children","className"],AccordionButton=(0,react.forwardRef)(((_ref,ref)=>{let{children,className}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,AccordionButton_excluded);return(0,jsx_runtime.jsxs)(dist.l9,Object.assign({},props,{className:(0,bundle_mjs.QP)(classnames_default()("group flex w-full select-none items-center justify-between px-4 py-2"),className),ref,children:[(0,jsx_runtime.jsx)(typography.o,{variant:"body1",component:"span",fw:"bold",className:"block",children}),(0,jsx_runtime.jsx)(src.yQ,{className:"block duration-300 ease-in-out transform group-radix-state-open:rotate-180"})]}))}));AccordionButton.__docgenInfo={description:"The style wrapper around Radix Accordion Trigger, must use inside `<AccordionItem></AccordionItem>` tag",methods:[],displayName:"AccordionButton"};const AccordionButtonBase=(0,react.forwardRef)(((props,ref)=>(0,jsx_runtime.jsx)(dist.Y9,{asChild:!0,children:(0,jsx_runtime.jsx)(dist.l9,Object.assign({},props,{ref}))}))),Accordion_AccordionButtonBase=AccordionButtonBase;AccordionButtonBase.__docgenInfo={description:"The wrapper around Radix Accordion Trigger, must use inside `<AccordionItem></AccordionItem>` tag",methods:[],displayName:"AccordionButtonBase"};const AccordionContent_excluded=["className"],AccordionContent=(0,react.forwardRef)(((_ref,ref)=>{let{className}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,AccordionContent_excluded);return(0,jsx_runtime.jsx)(dist.UC,Object.assign({},props,{className:(0,bundle_mjs.QP)("p-4",className),ref}))}));AccordionContent.__docgenInfo={description:"The style wrapper around Radix Accordion Content, must use inside `<AccordionItem></AccordionItem>` tag",methods:[],displayName:"AccordionContent"};const AccordionItem_excluded=["className"],AccordionItem=(0,react.forwardRef)(((_ref,ref)=>{let{className}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,AccordionItem_excluded);return(0,jsx_runtime.jsx)(dist.q7,Object.assign({},props,{className:(0,bundle_mjs.QP)("p-4",className),ref}))}));AccordionItem.__docgenInfo={description:"The style wrapper around Radix Accordion, must use inside `<Accordion></Accordion>` tag",methods:[],displayName:"AccordionItem"}},"./libs/webb-ui-components/src/typography/Typography/Typography.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>Typography});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),react__WEBPACK_IMPORTED_MODULE_1__=(__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/next/dist/compiled/react/index.js")),tailwind_merge__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_utils__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/typography/utils/index.ts");const _excluded=["children","className","component","fw","ta","variant"],defaultComponent={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",body1:"p",body2:"p",body3:"p",body4:"p",mono1:"span",mono2:"span",para1:"p",para2:"p",label:"span",utility:"span","mkt-h1":"h1","mkt-h2":"h2","mkt-h3":"h3","mkt-h4":"h4","mkt-subheading":"p","mkt-body1":"p","mkt-body2":"p","mkt-small-caps":"p","mkt-caption":"p","mkt-monospace":"p"},Typography=props=>{const{children,className,component,fw="normal",ta="left",variant}=props,restProps=(0,_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_3__.A)(props,_excluded),_component=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>null!=component?component:defaultComponent[variant]),[component,variant]),_className=(0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)((()=>(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_4__.QP)(`${variant}`,(0,_utils__WEBPACK_IMPORTED_MODULE_2__.sN)(ta),(0,_utils__WEBPACK_IMPORTED_MODULE_2__.NC)(variant,fw),(0,_utils__WEBPACK_IMPORTED_MODULE_2__.Qe)(variant),className)),[className,fw,ta,variant]);return(0,react__WEBPACK_IMPORTED_MODULE_1__.createElement)(_component,Object.assign({},restProps,{className:_className}),children)};Typography.__docgenInfo={description:'The Webb Typography component\n\nProps:\n- `variant`: Represent different variants of the component\n- `component`: The html tag (default: same as `variant` prop)\n- `fw`: Represent the **font weight** of the component (default: `normal`)\n- `ta`: Text align (default: `left`)\n- `darkMode`: Control component dark mode display in `js`, leave it\'s empty if you want to control dark mode in `css`\n\n@example\n\n```jsx\n<Typography variant="h1" fw="semibold" ta="center">This is heading 1</Typography>\n<Typography variant="h2" component="h3">This is heading 3 with variant h2</Typography>\n```',methods:[],displayName:"Typography",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},variant:{required:!0,tsType:{name:"TypoVariant"},description:"Represent different variants of the component"},component:{required:!1,tsType:{name:"ReactHTML"},description:"The html tag"},fw:{required:!1,tsType:{name:"union",raw:"| 'normal'\n| 'medium'\n| 'semibold'\n| 'bold'\n| 'black'",elements:[{name:"literal",value:"'normal'"},{name:"literal",value:"'medium'"},{name:"literal",value:"'semibold'"},{name:"literal",value:"'bold'"},{name:"literal",value:"'black'"}]},description:"Font weight"},ta:{required:!1,tsType:{name:"union",raw:"'center' | 'justify' | 'right' | 'left'",elements:[{name:"literal",value:"'center'"},{name:"literal",value:"'justify'"},{name:"literal",value:"'right'"},{name:"literal",value:"'left'"}]},description:"Text align"}}}},"./libs/webb-ui-components/src/typography/Typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/Typography.tsx")},"./libs/webb-ui-components/src/typography/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{o:()=>_Typography__WEBPACK_IMPORTED_MODULE_0__.o});var _Typography__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/typography/Typography/index.ts")},"./libs/webb-ui-components/src/typography/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{NC:()=>getFontWeightClassName,Qe:()=>getDefaultTextColor,sN:()=>getTextAlignClassName});__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");function getTextAlignClassName(textAlign){switch(textAlign){case"center":return"text-center";case"justify":return"text-justify";case"left":default:return"text-left";case"right":return"text-right"}}function getFontWeightClassName(variant,fontWeight){if(function isMonospaceVariant(variant){return-1!==["mono1","mono2","mkt-monospace"].indexOf(variant)}(variant)&&"semibold"===fontWeight)return"font-bold";if("label"===variant||"utility"===variant)return"";switch(fontWeight){case"normal":default:return"font-normal";case"medium":return"font-medium";case"semibold":return"font-semibold";case"bold":return"font-bold";case"black":return"font-black"}}function getDefaultTextColor(variant){return variant.startsWith("h")?"text-mono-200 dark:text-mono-00":"text-mono-160 dark:text-mono-80"}},"./libs/webb-ui-components/src/stories/molecules/Accordion.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,DefaultItem:()=>DefaultItem,Multiple:()=>Multiple,WithValue:()=>WithValue,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("./node_modules/core-js/modules/es.object.assign.js");var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_Accordion__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/Accordion/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/Accordion",component:_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.nD},Template=args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.nD,Object.assign({},args,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.As,{value:"helper1",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.J2,{children:"Helper 1"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.ub,{children:"Accordion content for helper 1"})]}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.As,{value:"helper2",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.J2,{children:"Helper 2"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_components_Accordion__WEBPACK_IMPORTED_MODULE_2__.ub,{children:"Accordion content for helper 2"})]})]})),Default=Template.bind({});Default.args={};const Multiple=Template.bind({});Multiple.args={type:"multiple"};const DefaultItem=Template.bind({});DefaultItem.args={type:"multiple",defaultValue:"helper2"};const WithValue=Template.bind({});WithValue.args={type:"multiple",value:["helper1","helper2"]};const __namedExportsOrder=["Default","Multiple","DefaultItem","WithValue"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"args => <Accordion {...args}>\n    <AccordionItem value={'helper1'}>\n      <AccordionButton>Helper 1</AccordionButton>\n      <AccordionContent>Accordion content for helper 1</AccordionContent>\n    </AccordionItem>\n    <AccordionItem value={'helper2'}>\n      <AccordionButton>Helper 2</AccordionButton>\n      <AccordionContent>Accordion content for helper 2</AccordionContent>\n    </AccordionItem>\n  </Accordion>",...Default.parameters?.docs?.source}}},Multiple.parameters={...Multiple.parameters,docs:{...Multiple.parameters?.docs,source:{originalSource:"args => <Accordion {...args}>\n    <AccordionItem value={'helper1'}>\n      <AccordionButton>Helper 1</AccordionButton>\n      <AccordionContent>Accordion content for helper 1</AccordionContent>\n    </AccordionItem>\n    <AccordionItem value={'helper2'}>\n      <AccordionButton>Helper 2</AccordionButton>\n      <AccordionContent>Accordion content for helper 2</AccordionContent>\n    </AccordionItem>\n  </Accordion>",...Multiple.parameters?.docs?.source}}},DefaultItem.parameters={...DefaultItem.parameters,docs:{...DefaultItem.parameters?.docs,source:{originalSource:"args => <Accordion {...args}>\n    <AccordionItem value={'helper1'}>\n      <AccordionButton>Helper 1</AccordionButton>\n      <AccordionContent>Accordion content for helper 1</AccordionContent>\n    </AccordionItem>\n    <AccordionItem value={'helper2'}>\n      <AccordionButton>Helper 2</AccordionButton>\n      <AccordionContent>Accordion content for helper 2</AccordionContent>\n    </AccordionItem>\n  </Accordion>",...DefaultItem.parameters?.docs?.source}}},WithValue.parameters={...WithValue.parameters,docs:{...WithValue.parameters?.docs,source:{originalSource:"args => <Accordion {...args}>\n    <AccordionItem value={'helper1'}>\n      <AccordionButton>Helper 1</AccordionButton>\n      <AccordionContent>Accordion content for helper 1</AccordionContent>\n    </AccordionItem>\n    <AccordionItem value={'helper2'}>\n      <AccordionButton>Helper 2</AccordionButton>\n      <AccordionContent>Accordion content for helper 2</AccordionContent>\n    </AccordionItem>\n  </Accordion>",...WithValue.parameters?.docs?.source}}}}}]);