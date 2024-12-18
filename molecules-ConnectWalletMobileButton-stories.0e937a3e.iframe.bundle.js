"use strict";(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[4686],{"./src/components/BottomDialog/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{GT:()=>BottomDialog,gh:()=>BottomDialogPortal,Ct:()=>BottomDialogTrigger});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),dist=__webpack_require__("../../node_modules/@radix-ui/react-dialog/dist/index.mjs");const _excluded=["children","className","radixRootProps"],BottomDialog=(0,react.forwardRef)(((_ref,ref)=>{let{children,className,radixRootProps}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);return(0,jsx_runtime.jsx)("div",(0,esm_extends.A)({},props,{className,ref,children:(0,jsx_runtime.jsx)(dist.bL,(0,esm_extends.A)({},radixRootProps,{children}))}))}));BottomDialog.__docgenInfo={description:"",methods:[],displayName:"BottomDialog",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},radixRootProps:{required:!1,tsType:{name:"RdxDialogProps"},description:""}}};const BottomDialogTrigger=(0,react.forwardRef)(((props,ref)=>(0,jsx_runtime.jsx)(dist.l9,(0,esm_extends.A)({asChild:!0},props,{ref}))));BottomDialogTrigger.__docgenInfo={description:"",methods:[],displayName:"BottomDialogTrigger",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""}},composes:["RdxDialogTriggerProps"]};var Close=__webpack_require__("../icons/src/Close.tsx"),bundle_mjs=__webpack_require__("../../node_modules/tailwind-merge/dist/bundle-mjs.mjs"),typography=__webpack_require__("./src/typography/index.ts"),buttons=__webpack_require__("./src/components/buttons/index.ts");const BottomDialogPortal_excluded=["children","title","actionButtonsProps","overlayProps","contentProps","className"],BottomDialogPortal=(0,react.forwardRef)(((_ref,ref)=>{let{children,title,actionButtonsProps,overlayProps,contentProps,className}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,BottomDialogPortal_excluded);return(0,jsx_runtime.jsxs)(dist.ZL,(0,esm_extends.A)({},props,{children:[(0,jsx_runtime.jsx)(dist.hJ,(0,esm_extends.A)({},overlayProps,{className:"fixed inset-0 bg-[rgba(0,0,0,0.1)] animate-[showDialogOverlay_150ms]"})),(0,jsx_runtime.jsxs)(dist.UC,(0,esm_extends.A)({},contentProps,{className:(0,bundle_mjs.QP)("!bg-mono-0 dark:!bg-mono-160 rounded-xl fixed bottom-0","animate-[bottomDialogSlideUp_400ms]",className),ref,children:[(0,jsx_runtime.jsx)(dist.hE,{asChild:!0,children:(0,jsx_runtime.jsxs)("div",{className:"flex items-center justify-between pt-9 px-9",children:[(0,jsx_runtime.jsx)(typography.o,{variant:"h4",fw:"bold",children:title}),(0,jsx_runtime.jsx)(dist.bm,{children:(0,jsx_runtime.jsx)(Close.b,{})})]})}),(0,jsx_runtime.jsx)(dist.VY,{asChild:!0,children:(0,jsx_runtime.jsxs)("div",{children:[(0,jsx_runtime.jsx)("div",{className:"p-9",children}),actionButtonsProps&&(0,jsx_runtime.jsx)("div",{className:"flex flex-col gap-2 py-6 px-9 border-t border-[#D3D8E2] dark:border-[#4E5463]",children:actionButtonsProps.map(((buttonProps,idx)=>(0,jsx_runtime.jsx)(dist.bm,{asChild:!0,children:(0,jsx_runtime.jsx)(buttons.$n,(0,esm_extends.A)({},buttonProps))},idx)))})]})})]}))]}))}));BottomDialogPortal.__docgenInfo={description:"",methods:[],displayName:"BottomDialogPortal",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},title:{required:!1,tsType:{name:"string"},description:""},actionButtonsProps:{required:!1,tsType:{name:"Array",elements:[{name:"ButtonProps"}],raw:"ButtonProps[]"},description:""},overlayProps:{required:!1,tsType:{name:"RdxDialogOverlayProps"},description:""},contentProps:{required:!1,tsType:{name:"RdxDialogContentProps"},description:""}},composes:["RdxDialogPortalProps"]}},"./src/components/ConnectWalletMobileButton/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>ConnectWalletMobileButton});var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),objectWithoutPropertiesLoose=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),jsx_runtime=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),react=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),typography=__webpack_require__("./src/typography/index.ts"),BottomDialog=__webpack_require__("./src/components/BottomDialog/index.ts"),buttons=__webpack_require__("./src/components/buttons/index.ts");const _excluded=["className","title","children","extraActionButtons"],ConnectWalletMobileButton=(0,react.forwardRef)(((_ref,ref)=>{let{className,title="Switch to Desktop",children,extraActionButtons=[]}=_ref,props=(0,objectWithoutPropertiesLoose.A)(_ref,_excluded);const actionButtonsProps=[{children:"Continue on Desktop",isFullWidth:!0},...extraActionButtons];return(0,jsx_runtime.jsxs)(BottomDialog.GT,{ref,children:[(0,jsx_runtime.jsx)(BottomDialog.Ct,{children:(0,jsx_runtime.jsx)(buttons.$n,(0,esm_extends.A)({},props,{className,children:"Connect"}))}),(0,jsx_runtime.jsx)(BottomDialog.gh,{title,actionButtonsProps,className:"w-full",children:children||(0,jsx_runtime.jsx)("div",{className:"flex flex-col gap-4",children:(0,jsx_runtime.jsx)(typography.o,{variant:"body1",children:"For the best experience, we recommend using our desktop interface."})})})]})}));ConnectWalletMobileButton.__docgenInfo={description:"",methods:[],displayName:"ConnectWalletMobileButton",props:{className:{required:!1,tsType:{name:"string"},description:"The tailwindcss className to override the style"},darkMode:{required:!1,tsType:{name:"boolean"},description:"Control dark mode using `js`, if it's empty, the component will control dark mode in `css`"},children:{required:!1,tsType:{name:"union",raw:"React.ReactNode | string",elements:[{name:"ReactReactNode",raw:"React.ReactNode"},{name:"string"}]},description:""},title:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Switch to Desktop'",computed:!1}},extraActionButtons:{required:!1,tsType:{name:"Array",elements:[{name:"ButtonProps"}],raw:"Array<ButtonProps>"},description:"",defaultValue:{value:"[]",computed:!1}}},composes:["Pick"]}},"../../node_modules/@radix-ui/react-dialog/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{UC:()=>Content,VY:()=>Description,ZL:()=>Portal,bL:()=>Root,bm:()=>Close,hE:()=>Title,hJ:()=>Overlay,l9:()=>Trigger,zM:()=>DialogTrigger});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js"),_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("../../node_modules/@radix-ui/primitive/dist/index.mjs"),_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("../../node_modules/@radix-ui/react-compose-refs/dist/index.mjs"),_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/@radix-ui/react-context/dist/index.mjs"),_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("../../node_modules/@radix-ui/react-id/dist/index.mjs"),_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs"),_radix_ui_react_dismissable_layer__WEBPACK_IMPORTED_MODULE_15__=__webpack_require__("../../node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs"),_radix_ui_react_focus_scope__WEBPACK_IMPORTED_MODULE_14__=__webpack_require__("../../node_modules/@radix-ui/react-focus-scope/dist/index.mjs"),_radix_ui_react_portal__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("../../node_modules/@radix-ui/react-portal/dist/index.mjs"),_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("../../node_modules/@radix-ui/react-presence/dist/index.mjs"),_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("../../node_modules/@radix-ui/react-primitive/dist/index.mjs"),_radix_ui_react_focus_guards__WEBPACK_IMPORTED_MODULE_13__=__webpack_require__("../../node_modules/@radix-ui/react-focus-guards/dist/index.mjs"),react_remove_scroll__WEBPACK_IMPORTED_MODULE_10__=__webpack_require__("../../node_modules/react-remove-scroll/dist/es2015/Combination.js"),aria_hidden__WEBPACK_IMPORTED_MODULE_12__=__webpack_require__("../../node_modules/aria-hidden/dist/es2015/index.js"),_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_11__=__webpack_require__("../../node_modules/@radix-ui/react-slot/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),console=__webpack_require__("../../node_modules/console-browserify/index.js"),[createDialogContext,createDialogScope]=(0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.A)("Dialog"),[DialogProvider,useDialogContext]=createDialogContext("Dialog"),Dialog=props=>{const{__scopeDialog,children,open:openProp,defaultOpen,onOpenChange,modal=!0}=props,triggerRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),contentRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),[open=!1,setOpen]=(0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_3__.i)({prop:openProp,defaultProp:defaultOpen,onChange:onOpenChange});return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogProvider,{scope:__scopeDialog,triggerRef,contentRef,contentId:(0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.B)(),titleId:(0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.B)(),descriptionId:(0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.B)(),open,onOpenChange:setOpen,onOpenToggle:react__WEBPACK_IMPORTED_MODULE_0__.useCallback((()=>setOpen((prevOpen=>!prevOpen))),[setOpen]),modal,children})};Dialog.displayName="Dialog";var DialogTrigger=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...triggerProps}=props,context=useDialogContext("DialogTrigger",__scopeDialog),composedTriggerRef=(0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__.s)(forwardedRef,context.triggerRef);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.button,{type:"button","aria-haspopup":"dialog","aria-expanded":context.open,"aria-controls":context.contentId,"data-state":getState(context.open),...triggerProps,ref:composedTriggerRef,onClick:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onClick,context.onOpenToggle)})}));DialogTrigger.displayName="DialogTrigger";var[PortalProvider,usePortalContext]=createDialogContext("DialogPortal",{forceMount:void 0}),DialogPortal=props=>{const{__scopeDialog,forceMount,children,container}=props,context=useDialogContext("DialogPortal",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(PortalProvider,{scope:__scopeDialog,forceMount,children:react__WEBPACK_IMPORTED_MODULE_0__.Children.map(children,(child=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__.C,{present:forceMount||context.open,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_portal__WEBPACK_IMPORTED_MODULE_9__.Z,{asChild:!0,container,children:child})})))})};DialogPortal.displayName="DialogPortal";var DialogOverlay=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const portalContext=usePortalContext("DialogOverlay",props.__scopeDialog),{forceMount=portalContext.forceMount,...overlayProps}=props,context=useDialogContext("DialogOverlay",props.__scopeDialog);return context.modal?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__.C,{present:forceMount||context.open,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogOverlayImpl,{...overlayProps,ref:forwardedRef})}):null}));DialogOverlay.displayName="DialogOverlay";var DialogOverlayImpl=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...overlayProps}=props,context=useDialogContext("DialogOverlay",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(react_remove_scroll__WEBPACK_IMPORTED_MODULE_10__.A,{as:_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_11__.DX,allowPinchZoom:!0,shards:[context.contentRef],children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.div,{"data-state":getState(context.open),...overlayProps,ref:forwardedRef,style:{pointerEvents:"auto",...overlayProps.style}})})})),DialogContent=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const portalContext=usePortalContext("DialogContent",props.__scopeDialog),{forceMount=portalContext.forceMount,...contentProps}=props,context=useDialogContext("DialogContent",props.__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__.C,{present:forceMount||context.open,children:context.modal?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentModal,{...contentProps,ref:forwardedRef}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentNonModal,{...contentProps,ref:forwardedRef})})}));DialogContent.displayName="DialogContent";var DialogContentModal=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const context=useDialogContext("DialogContent",props.__scopeDialog),contentRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),composedRefs=(0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__.s)(forwardedRef,context.contentRef,contentRef);return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{const content=contentRef.current;if(content)return(0,aria_hidden__WEBPACK_IMPORTED_MODULE_12__.Eq)(content)}),[]),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentImpl,{...props,ref:composedRefs,trapFocus:context.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onCloseAutoFocus,(event=>{event.preventDefault(),context.triggerRef.current?.focus()})),onPointerDownOutside:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onPointerDownOutside,(event=>{const originalEvent=event.detail.originalEvent,ctrlLeftClick=0===originalEvent.button&&!0===originalEvent.ctrlKey;(2===originalEvent.button||ctrlLeftClick)&&event.preventDefault()})),onFocusOutside:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onFocusOutside,(event=>event.preventDefault()))})})),DialogContentNonModal=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const context=useDialogContext("DialogContent",props.__scopeDialog),hasInteractedOutsideRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(!1),hasPointerDownOutsideRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(!1);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentImpl,{...props,ref:forwardedRef,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:event=>{props.onCloseAutoFocus?.(event),event.defaultPrevented||(hasInteractedOutsideRef.current||context.triggerRef.current?.focus(),event.preventDefault()),hasInteractedOutsideRef.current=!1,hasPointerDownOutsideRef.current=!1},onInteractOutside:event=>{props.onInteractOutside?.(event),event.defaultPrevented||(hasInteractedOutsideRef.current=!0,"pointerdown"===event.detail.originalEvent.type&&(hasPointerDownOutsideRef.current=!0));const target=event.target,targetIsTrigger=context.triggerRef.current?.contains(target);targetIsTrigger&&event.preventDefault(),"focusin"===event.detail.originalEvent.type&&hasPointerDownOutsideRef.current&&event.preventDefault()}})})),DialogContentImpl=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,trapFocus,onOpenAutoFocus,onCloseAutoFocus,...contentProps}=props,context=useDialogContext("DialogContent",__scopeDialog),contentRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),composedRefs=(0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__.s)(forwardedRef,contentRef);return(0,_radix_ui_react_focus_guards__WEBPACK_IMPORTED_MODULE_13__.Oh)(),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_focus_scope__WEBPACK_IMPORTED_MODULE_14__.n,{asChild:!0,loop:!0,trapped:trapFocus,onMountAutoFocus:onOpenAutoFocus,onUnmountAutoFocus:onCloseAutoFocus,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_dismissable_layer__WEBPACK_IMPORTED_MODULE_15__.qW,{role:"dialog",id:context.contentId,"aria-describedby":context.descriptionId,"aria-labelledby":context.titleId,"data-state":getState(context.open),...contentProps,ref:composedRefs,onDismiss:()=>context.onOpenChange(!1)})}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(TitleWarning,{titleId:context.titleId}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DescriptionWarning,{contentRef,descriptionId:context.descriptionId})]})]})})),DialogTitle=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...titleProps}=props,context=useDialogContext("DialogTitle",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.h2,{id:context.titleId,...titleProps,ref:forwardedRef})}));DialogTitle.displayName="DialogTitle";var DialogDescription=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...descriptionProps}=props,context=useDialogContext("DialogDescription",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.p,{id:context.descriptionId,...descriptionProps,ref:forwardedRef})}));DialogDescription.displayName="DialogDescription";var DialogClose=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...closeProps}=props,context=useDialogContext("DialogClose",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.button,{type:"button",...closeProps,ref:forwardedRef,onClick:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onClick,(()=>context.onOpenChange(!1)))})}));function getState(open){return open?"open":"closed"}DialogClose.displayName="DialogClose";var[WarningProvider,useWarningContext]=(0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.q)("DialogTitleWarning",{contentName:"DialogContent",titleName:"DialogTitle",docsSlug:"dialog"}),TitleWarning=({titleId})=>{const titleWarningContext=useWarningContext("DialogTitleWarning"),MESSAGE=`\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.\n\nIf you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.\n\nFor more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{if(titleId){document.getElementById(titleId)||console.error(MESSAGE)}}),[MESSAGE,titleId]),null},DescriptionWarning=({contentRef,descriptionId})=>{const MESSAGE=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${useWarningContext("DialogDescriptionWarning").contentName}}.`;return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{const describedById=contentRef.current?.getAttribute("aria-describedby");if(descriptionId&&describedById){document.getElementById(descriptionId)||console.warn(MESSAGE)}}),[MESSAGE,contentRef,descriptionId]),null},Root=Dialog,Trigger=DialogTrigger,Portal=DialogPortal,Overlay=DialogOverlay,Content=DialogContent,Title=DialogTitle,Description=DialogDescription,Close=DialogClose},"./src/stories/molecules/ConnectWalletMobileButton.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/jsx-runtime.js"),_components_ConnectWalletMobileButton__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/components/ConnectWalletMobileButton/index.ts");const __WEBPACK_DEFAULT_EXPORT__={title:"Design System/Molecules/ConnectWalletMobileButton",component:_components_ConnectWalletMobileButton__WEBPACK_IMPORTED_MODULE_1__.A},Default=(args=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_components_ConnectWalletMobileButton__WEBPACK_IMPORTED_MODULE_1__.A,(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({},args))).bind({});Default.args={className:"lg:flex"};const __namedExportsOrder=["Default"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"args => <ConnectWalletMobileButton {...args} />",...Default.parameters?.docs?.source}}}},"../../node_modules/viem/_esm/utils/data/isHex.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function isHex(value,{strict=!0}={}){return!!value&&("string"==typeof value&&(strict?/^0x[0-9a-fA-F]*$/.test(value):value.startsWith("0x")))}__webpack_require__.d(__webpack_exports__,{q:()=>isHex})}}]);