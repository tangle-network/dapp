"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[4393],{"./node_modules/@radix-ui/react-dialog/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{HM:()=>DialogClose,UC:()=>Content,VY:()=>Description,ZL:()=>Portal,bL:()=>Root,bm:()=>Close,hE:()=>Title,hJ:()=>Overlay,l9:()=>Trigger,zM:()=>DialogTrigger});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./node_modules/@radix-ui/primitive/dist/index.mjs"),_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./node_modules/@radix-ui/react-compose-refs/dist/index.mjs"),_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@radix-ui/react-context/dist/index.mjs"),_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./node_modules/@radix-ui/react-id/dist/index.mjs"),_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs"),_radix_ui_react_dismissable_layer__WEBPACK_IMPORTED_MODULE_15__=__webpack_require__("./node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs"),_radix_ui_react_focus_scope__WEBPACK_IMPORTED_MODULE_14__=__webpack_require__("./node_modules/@radix-ui/react-focus-scope/dist/index.mjs"),_radix_ui_react_portal__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("./node_modules/@radix-ui/react-portal/dist/index.mjs"),_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("./node_modules/@radix-ui/react-presence/dist/index.mjs"),_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/@radix-ui/react-primitive/dist/index.mjs"),_radix_ui_react_focus_guards__WEBPACK_IMPORTED_MODULE_13__=__webpack_require__("./node_modules/@radix-ui/react-focus-guards/dist/index.mjs"),react_remove_scroll__WEBPACK_IMPORTED_MODULE_10__=__webpack_require__("./node_modules/react-remove-scroll/dist/es2015/Combination.js"),aria_hidden__WEBPACK_IMPORTED_MODULE_12__=__webpack_require__("./node_modules/aria-hidden/dist/es2015/index.js"),_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_11__=__webpack_require__("./node_modules/@radix-ui/react-slot/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),console=__webpack_require__("./node_modules/console-browserify/index.js"),[createDialogContext,createDialogScope]=(0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.A)("Dialog"),[DialogProvider,useDialogContext]=createDialogContext("Dialog"),Dialog=props=>{const{__scopeDialog,children,open:openProp,defaultOpen,onOpenChange,modal=!0}=props,triggerRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),contentRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),[open=!1,setOpen]=(0,_radix_ui_react_use_controllable_state__WEBPACK_IMPORTED_MODULE_3__.i)({prop:openProp,defaultProp:defaultOpen,onChange:onOpenChange});return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogProvider,{scope:__scopeDialog,triggerRef,contentRef,contentId:(0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.B)(),titleId:(0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.B)(),descriptionId:(0,_radix_ui_react_id__WEBPACK_IMPORTED_MODULE_4__.B)(),open,onOpenChange:setOpen,onOpenToggle:react__WEBPACK_IMPORTED_MODULE_0__.useCallback((()=>setOpen((prevOpen=>!prevOpen))),[setOpen]),modal,children})};Dialog.displayName="Dialog";var DialogTrigger=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...triggerProps}=props,context=useDialogContext("DialogTrigger",__scopeDialog),composedTriggerRef=(0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__.s)(forwardedRef,context.triggerRef);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.button,{type:"button","aria-haspopup":"dialog","aria-expanded":context.open,"aria-controls":context.contentId,"data-state":getState(context.open),...triggerProps,ref:composedTriggerRef,onClick:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onClick,context.onOpenToggle)})}));DialogTrigger.displayName="DialogTrigger";var[PortalProvider,usePortalContext]=createDialogContext("DialogPortal",{forceMount:void 0}),DialogPortal=props=>{const{__scopeDialog,forceMount,children,container}=props,context=useDialogContext("DialogPortal",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(PortalProvider,{scope:__scopeDialog,forceMount,children:react__WEBPACK_IMPORTED_MODULE_0__.Children.map(children,(child=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__.C,{present:forceMount||context.open,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_portal__WEBPACK_IMPORTED_MODULE_9__.Z,{asChild:!0,container,children:child})})))})};DialogPortal.displayName="DialogPortal";var DialogOverlay=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const portalContext=usePortalContext("DialogOverlay",props.__scopeDialog),{forceMount=portalContext.forceMount,...overlayProps}=props,context=useDialogContext("DialogOverlay",props.__scopeDialog);return context.modal?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__.C,{present:forceMount||context.open,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogOverlayImpl,{...overlayProps,ref:forwardedRef})}):null}));DialogOverlay.displayName="DialogOverlay";var DialogOverlayImpl=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...overlayProps}=props,context=useDialogContext("DialogOverlay",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(react_remove_scroll__WEBPACK_IMPORTED_MODULE_10__.A,{as:_radix_ui_react_slot__WEBPACK_IMPORTED_MODULE_11__.DX,allowPinchZoom:!0,shards:[context.contentRef],children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.div,{"data-state":getState(context.open),...overlayProps,ref:forwardedRef,style:{pointerEvents:"auto",...overlayProps.style}})})})),DialogContent=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const portalContext=usePortalContext("DialogContent",props.__scopeDialog),{forceMount=portalContext.forceMount,...contentProps}=props,context=useDialogContext("DialogContent",props.__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_presence__WEBPACK_IMPORTED_MODULE_8__.C,{present:forceMount||context.open,children:context.modal?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentModal,{...contentProps,ref:forwardedRef}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentNonModal,{...contentProps,ref:forwardedRef})})}));DialogContent.displayName="DialogContent";var DialogContentModal=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const context=useDialogContext("DialogContent",props.__scopeDialog),contentRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),composedRefs=(0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__.s)(forwardedRef,context.contentRef,contentRef);return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{const content=contentRef.current;if(content)return(0,aria_hidden__WEBPACK_IMPORTED_MODULE_12__.Eq)(content)}),[]),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentImpl,{...props,ref:composedRefs,trapFocus:context.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onCloseAutoFocus,(event=>{event.preventDefault(),context.triggerRef.current?.focus()})),onPointerDownOutside:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onPointerDownOutside,(event=>{const originalEvent=event.detail.originalEvent,ctrlLeftClick=0===originalEvent.button&&!0===originalEvent.ctrlKey;(2===originalEvent.button||ctrlLeftClick)&&event.preventDefault()})),onFocusOutside:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onFocusOutside,(event=>event.preventDefault()))})})),DialogContentNonModal=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const context=useDialogContext("DialogContent",props.__scopeDialog),hasInteractedOutsideRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(!1),hasPointerDownOutsideRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(!1);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DialogContentImpl,{...props,ref:forwardedRef,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:event=>{props.onCloseAutoFocus?.(event),event.defaultPrevented||(hasInteractedOutsideRef.current||context.triggerRef.current?.focus(),event.preventDefault()),hasInteractedOutsideRef.current=!1,hasPointerDownOutsideRef.current=!1},onInteractOutside:event=>{props.onInteractOutside?.(event),event.defaultPrevented||(hasInteractedOutsideRef.current=!0,"pointerdown"===event.detail.originalEvent.type&&(hasPointerDownOutsideRef.current=!0));const target=event.target,targetIsTrigger=context.triggerRef.current?.contains(target);targetIsTrigger&&event.preventDefault(),"focusin"===event.detail.originalEvent.type&&hasPointerDownOutsideRef.current&&event.preventDefault()}})})),DialogContentImpl=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,trapFocus,onOpenAutoFocus,onCloseAutoFocus,...contentProps}=props,context=useDialogContext("DialogContent",__scopeDialog),contentRef=react__WEBPACK_IMPORTED_MODULE_0__.useRef(null),composedRefs=(0,_radix_ui_react_compose_refs__WEBPACK_IMPORTED_MODULE_5__.s)(forwardedRef,contentRef);return(0,_radix_ui_react_focus_guards__WEBPACK_IMPORTED_MODULE_13__.Oh)(),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_focus_scope__WEBPACK_IMPORTED_MODULE_14__.n,{asChild:!0,loop:!0,trapped:trapFocus,onMountAutoFocus:onOpenAutoFocus,onUnmountAutoFocus:onCloseAutoFocus,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_dismissable_layer__WEBPACK_IMPORTED_MODULE_15__.qW,{role:"dialog",id:context.contentId,"aria-describedby":context.descriptionId,"aria-labelledby":context.titleId,"data-state":getState(context.open),...contentProps,ref:composedRefs,onDismiss:()=>context.onOpenChange(!1)})}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.Fragment,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(TitleWarning,{titleId:context.titleId}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(DescriptionWarning,{contentRef,descriptionId:context.descriptionId})]})]})})),DialogTitle=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...titleProps}=props,context=useDialogContext("DialogTitle",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.h2,{id:context.titleId,...titleProps,ref:forwardedRef})}));DialogTitle.displayName="DialogTitle";var DialogDescription=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...descriptionProps}=props,context=useDialogContext("DialogDescription",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.p,{id:context.descriptionId,...descriptionProps,ref:forwardedRef})}));DialogDescription.displayName="DialogDescription";var DialogClose=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeDialog,...closeProps}=props,context=useDialogContext("DialogClose",__scopeDialog);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_6__.sG.button,{type:"button",...closeProps,ref:forwardedRef,onClick:(0,_radix_ui_primitive__WEBPACK_IMPORTED_MODULE_7__.m)(props.onClick,(()=>context.onOpenChange(!1)))})}));function getState(open){return open?"open":"closed"}DialogClose.displayName="DialogClose";var[WarningProvider,useWarningContext]=(0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.q)("DialogTitleWarning",{contentName:"DialogContent",titleName:"DialogTitle",docsSlug:"dialog"}),TitleWarning=({titleId})=>{const titleWarningContext=useWarningContext("DialogTitleWarning"),MESSAGE=`\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.\n\nIf you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component.\n\nFor more information, see https://radix-ui.com/primitives/docs/components/${titleWarningContext.docsSlug}`;return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{if(titleId){document.getElementById(titleId)||console.error(MESSAGE)}}),[MESSAGE,titleId]),null},DescriptionWarning=({contentRef,descriptionId})=>{const MESSAGE=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${useWarningContext("DialogDescriptionWarning").contentName}}.`;return react__WEBPACK_IMPORTED_MODULE_0__.useEffect((()=>{const describedById=contentRef.current?.getAttribute("aria-describedby");if(descriptionId&&describedById){document.getElementById(descriptionId)||console.warn(MESSAGE)}}),[MESSAGE,contentRef,descriptionId]),null},Root=Dialog,Trigger=DialogTrigger,Portal=DialogPortal,Overlay=DialogOverlay,Content=DialogContent,Title=DialogTitle,Description=DialogDescription,Close=DialogClose},"./node_modules/@headlessui/react/dist/components/transition/transition.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{e:()=>Xe,_:()=>Ie});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),react_namespaceObject=__webpack_require__.t(react,2);function o(){let n=[],r={addEventListener:(e,t,s,a)=>(e.addEventListener(t,s,a),r.add((()=>e.removeEventListener(t,s,a)))),requestAnimationFrame(...e){let t=requestAnimationFrame(...e);return r.add((()=>cancelAnimationFrame(t)))},nextFrame:(...e)=>r.requestAnimationFrame((()=>r.requestAnimationFrame(...e))),setTimeout(...e){let t=setTimeout(...e);return r.add((()=>clearTimeout(t)))},microTask(...e){let t={current:!0};return function micro_task_t(e){"function"==typeof queueMicrotask?queueMicrotask(e):Promise.resolve().then(e).catch((o=>setTimeout((()=>{throw o}))))}((()=>{t.current&&e[0]()})),r.add((()=>{t.current=!1}))},style(e,t,s){let a=e.style.getPropertyValue(t);return Object.assign(e.style,{[t]:s}),this.add((()=>{Object.assign(e.style,{[t]:a})}))},group(e){let t=o();return e(t),this.add((()=>t.dispose()))},add:e=>(n.includes(e)||n.push(e),()=>{let t=n.indexOf(e);if(t>=0)for(let s of n.splice(t,1))s()}),dispose(){for(let e of n.splice(0))e()}};return r}function use_disposables_p(){let[e]=(0,react.useState)(o);return(0,react.useEffect)((()=>()=>e.dispose()),[e]),e}var i=Object.defineProperty,env_r=(t,e,n)=>(((t,e,n)=>{e in t?i(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n})(t,"symbol"!=typeof e?e+"":e,n),n);let s=new class env_o{constructor(){env_r(this,"current",this.detect()),env_r(this,"handoffState","pending"),env_r(this,"currentId",0)}set(e){this.current!==e&&(this.handoffState="pending",this.currentId=0,this.current=e)}reset(){this.set(this.detect())}nextId(){return++this.currentId}get isServer(){return"server"===this.current}get isClient(){return"client"===this.current}detect(){return"undefined"==typeof window||"undefined"==typeof document?"server":"client"}handoff(){"pending"===this.handoffState&&(this.handoffState="complete")}get isHandoffComplete(){return"complete"===this.handoffState}},use_iso_morphic_effect_n=(e,t)=>{s.isServer?(0,react.useEffect)(e,t):(0,react.useLayoutEffect)(e,t)};function use_latest_value_s(e){let r=(0,react.useRef)(e);return use_iso_morphic_effect_n((()=>{r.current=e}),[e]),r}let use_event_o=function(t){let e=use_latest_value_s(t);return react.useCallback(((...r)=>e.current(...r)),[e])};function use_on_disappear_m(s,n,l){let i=use_latest_value_s((t=>{let e=t.getBoundingClientRect();0===e.x&&0===e.y&&0===e.width&&0===e.height&&l()}));(0,react.useEffect)((()=>{if(!s)return;let t=null===n?null:n instanceof HTMLElement?n:n.current;if(!t)return;let e=o();if("undefined"!=typeof ResizeObserver){let r=new ResizeObserver((()=>i.current(t)));r.observe(t),e.add((()=>r.disconnect()))}if("undefined"!=typeof IntersectionObserver){let r=new IntersectionObserver((()=>i.current(t)));r.observe(t),e.add((()=>r.disconnect()))}return()=>e.dispose()}),[n,i,s])}function use_server_handoff_complete_l(){let r=function use_server_handoff_complete_s(){let r="undefined"==typeof document;return(o=>o.useSyncExternalStore)(react_namespaceObject)((()=>()=>{}),(()=>!1),(()=>!r))}(),[e,n]=react.useState(s.isHandoffComplete);return e&&!1===s.isHandoffComplete&&n(!1),react.useEffect((()=>{!0!==e&&n(!0)}),[e]),react.useEffect((()=>s.handoff()),[]),!r&&e}let u=Symbol();function use_sync_refs_y(...t){let n=(0,react.useRef)(t);(0,react.useEffect)((()=>{n.current=t}),[t]);let c=use_event_o((e=>{for(let o of n.current)null!=o&&("function"==typeof o?o(e):o.current=e)}));return t.every((e=>null==e||(null==e?void 0:e[u])))?void 0:c}var D=(i=>(i[i.None=0]="None",i[i.Closed=1]="Closed",i[i.Enter=2]="Enter",i[i.Leave=4]="Leave",i))(D||{});function use_transition_A(e){let a={};for(let t in e)!0===e[t]&&(a[`data-${t}`]="");return a}function V(e,a,t,r){let[i,u]=(0,react.useState)(t),{hasFlag:d,addFlag:f,removeFlag:s}=function c(u=0){let[t,l]=(0,react.useState)(u),g=(0,react.useCallback)((e=>l(e)),[t]),s=(0,react.useCallback)((e=>l((a=>a|e))),[t]),m=(0,react.useCallback)((e=>(t&e)===e),[t]),n=(0,react.useCallback)((e=>l((a=>a&~e))),[l]),F=(0,react.useCallback)((e=>l((a=>a^e))),[l]);return{flags:t,setFlag:g,addFlag:s,hasFlag:m,removeFlag:n,toggleFlag:F}}(e&&i?3:0),l=(0,react.useRef)(!1),n=(0,react.useRef)(!1),o=use_disposables_p();return use_iso_morphic_effect_n((function p(){var T;if(!e)return;t&&u(!0);let c=a.current;return c?(null==(T=null==r?void 0:r.start)||T.call(r,t),M(c,{inFlight:l,prepare(){n.current?n.current=!1:n.current=l.current,l.current=!0,!n.current&&(t?(f(3),s(4)):(f(4),s(2)))},run(){n.current?t?(s(3),f(4)):(s(4),f(3)):t?s(1):f(1)},done(){var m;n.current&&"function"==typeof c.getAnimations&&c.getAnimations().length>0||(l.current=!1,s(7),t||u(!1),null==(m=null==r?void 0:r.end)||m.call(r,t))}})):t?(f(3),o.nextFrame((()=>p()))):void 0}),[e,t,a,o]),e?[i,{closed:d(1),enter:d(2),leave:d(4),transition:d(2)||d(4)}]:[t,{closed:void 0,enter:void 0,leave:void 0,transition:void 0}]}function M(e,{prepare:a,run:t,done:r,inFlight:i}){let u=o();return function R(e,{inFlight:a,prepare:t}){if(null!=a&&a.current)return void t();let r=e.style.transition;e.style.transition="none",t(),e.offsetHeight,e.style.transition=r}(e,{prepare:a,inFlight:i}),u.nextFrame((()=>{u.add(function F(e,a){let t=function l(r){let e={called:!1};return(...t)=>{if(!e.called)return e.called=!0,r(...t)}}(a),r=o();if(!e)return r.dispose;let{transitionDuration:i,transitionDelay:u}=getComputedStyle(e),[d,f]=[i,u].map((l=>{let[n=0]=l.split(",").filter(Boolean).map((o=>o.includes("ms")?parseFloat(o):1e3*parseFloat(o))).sort(((o,p)=>p-o));return n})),s=d+f;if(0!==s){let l=r.group((n=>{let o=n.setTimeout((()=>{t(),n.dispose()}),s);n.addEventListener(e,"transitionrun",(p=>{p.target===p.currentTarget&&(o(),n.addEventListener(e,"transitioncancel",(c=>{c.target===c.currentTarget&&(t(),l())})))}))}));r.addEventListener(e,"transitionend",(n=>{n.target===n.currentTarget&&(t(),r.dispose())}))}else t();return r.dispose}(e,r)),t()})),u.dispose}let n=(0,react.createContext)(null);n.displayName="OpenClosedContext";var e,open_closed_i=((e=open_closed_i||{})[e.Open=1]="Open",e[e.Closed=2]="Closed",e[e.Closing=4]="Closing",e[e.Opening=8]="Opening",e);function open_closed_u(){return(0,react.useContext)(n)}function open_closed_c({value:o,children:t}){return react.createElement(n.Provider,{value:o},t)}function class_names_t(...r){return Array.from(new Set(r.flatMap((n=>"string"==typeof n?n.split(" "):[])))).filter(Boolean).join(" ")}function match_u(r,n,...a){if(r in n){let e=n[r];return"function"==typeof e?e(...a):e}let t=new Error(`Tried to handle "${r}" but there is no handler defined. Only defined handlers are: ${Object.keys(n).map((e=>`"${e}"`)).join(", ")}.`);throw Error.captureStackTrace&&Error.captureStackTrace(t,match_u),t}var a,render_M=((a=render_M||{})[a.None=0]="None",a[a.RenderStrategy=1]="RenderStrategy",a[a.Static=2]="Static",a),O=(e=>(e[e.Unmount=0]="Unmount",e[e.Hidden=1]="Hidden",e))(O||{});function H({ourProps:r,theirProps:n,slot:e,defaultTag:a,features:s,visible:t=!0,name:l,mergeRefs:i}){i=null!=i?i:A;let o=N(n,r);if(t)return b(o,e,a,l,i);let y=null!=s?s:0;if(2&y){let{static:f=!1,...u}=o;if(f)return b(u,e,a,l,i)}if(1&y){let{unmount:f=!0,...u}=o;return match_u(f?0:1,{0:()=>null,1:()=>b({...u,hidden:!0,style:{display:"none"}},e,a,l,i)})}return b(o,e,a,l,i)}function b(r,n={},e,a,s){let{as:t=e,children:l,refName:i="ref",...o}=h(r,["unmount","static"]),y=void 0!==r.ref?{[i]:r.ref}:{},f="function"==typeof l?l(n):l;"className"in o&&o.className&&"function"==typeof o.className&&(o.className=o.className(n)),o["aria-labelledby"]&&o["aria-labelledby"]===o.id&&(o["aria-labelledby"]=void 0);let u={};if(n){let d=!1,p=[];for(let[c,T]of Object.entries(n))"boolean"==typeof T&&(d=!0),!0===T&&p.push(c.replace(/([A-Z])/g,(g=>`-${g.toLowerCase()}`)));if(d){u["data-headlessui-state"]=p.join(" ");for(let c of p)u[`data-${c}`]=""}}if(t===react.Fragment&&(Object.keys(render_m(o)).length>0||Object.keys(render_m(u)).length>0)){if((0,react.isValidElement)(f)&&!(Array.isArray(f)&&f.length>1)){let d=f.props,p=null==d?void 0:d.className,c="function"==typeof p?(...F)=>class_names_t(p(...F),o.className):class_names_t(p,o.className),T=c?{className:c}:{},g=N(f.props,render_m(h(o,["ref"])));for(let F in u)F in g&&delete u[F];return(0,react.cloneElement)(f,Object.assign({},g,u,y,{ref:s(f.ref,y.ref)},T))}if(Object.keys(render_m(o)).length>0)throw new Error(['Passing props on "Fragment"!',"",`The current component <${a} /> is rendering a "Fragment".`,"However we need to passthrough the following props:",Object.keys(render_m(o)).concat(Object.keys(render_m(u))).map((d=>`  - ${d}`)).join("\n"),"","You can apply a few solutions:",['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',"Render a single element as the child so that we can forward the props onto that element."].map((d=>`  - ${d}`)).join("\n")].join("\n"))}return(0,react.createElement)(t,Object.assign({},h(o,["ref"]),t!==react.Fragment&&y,t!==react.Fragment&&u),f)}function A(...r){return r.every((n=>null==n))?void 0:n=>{for(let e of r)null!=e&&("function"==typeof e?e(n):e.current=n)}}function N(...r){if(0===r.length)return{};if(1===r.length)return r[0];let n={},e={};for(let s of r)for(let t in s)t.startsWith("on")&&"function"==typeof s[t]?(null!=e[t]||(e[t]=[]),e[t].push(s[t])):n[t]=s[t];if(n.disabled||n["aria-disabled"])for(let s in e)/^(on(?:Click|Pointer|Mouse|Key)(?:Down|Up|Press)?)$/.test(s)&&(e[s]=[t=>{var l;return null==(l=null==t?void 0:t.preventDefault)?void 0:l.call(t)}]);for(let s in e)Object.assign(n,{[s](t,...l){let i=e[s];for(let o of i){if((t instanceof Event||(null==t?void 0:t.nativeEvent)instanceof Event)&&t.defaultPrevented)return;o(t,...l)}}});return n}function W(r){var n;return Object.assign((0,react.forwardRef)(r),{displayName:null!=(n=r.displayName)?n:r.name})}function render_m(r){let n=Object.assign({},r);for(let e in n)void 0===n[e]&&delete n[e];return n}function h(r,n=[]){let e=Object.assign({},r);for(let a of n)a in e&&delete e[a];return e}function le(e){var t;return!!(e.enter||e.enterFrom||e.enterTo||e.leave||e.leaveFrom||e.leaveTo)||(null!=(t=e.as)?t:ue)!==react.Fragment||1===react.Children.count(e.children)}let transition_V=(0,react.createContext)(null);transition_V.displayName="TransitionContext";var xe=(i=>(i.Visible="visible",i.Hidden="hidden",i))(xe||{});let transition_w=(0,react.createContext)(null);function transition_M(e){return"children"in e?transition_M(e.children):e.current.filter((({el:t})=>null!==t.current)).filter((({state:t})=>"visible"===t)).length>0}function ae(e,t){let i=use_latest_value_s(e),l=(0,react.useRef)([]),S=function use_is_mounted_f(){let e=(0,react.useRef)(!1);return use_iso_morphic_effect_n((()=>(e.current=!0,()=>{e.current=!1})),[]),e}(),E=use_disposables_p(),u=use_event_o(((s,r=O.Hidden)=>{let n=l.current.findIndex((({el:o})=>o===s));-1!==n&&(match_u(r,{[O.Unmount](){l.current.splice(n,1)},[O.Hidden](){l.current[n].state="hidden"}}),E.microTask((()=>{var o;!transition_M(l)&&S.current&&(null==(o=i.current)||o.call(i))})))})),y=use_event_o((s=>{let r=l.current.find((({el:n})=>n===s));return r?"visible"!==r.state&&(r.state="visible"):l.current.push({el:s,state:"visible"}),()=>u(s,O.Unmount)})),c=(0,react.useRef)([]),f=(0,react.useRef)(Promise.resolve()),p=(0,react.useRef)({enter:[],leave:[]}),m=use_event_o(((s,r,n)=>{c.current.splice(0),t&&(t.chains.current[r]=t.chains.current[r].filter((([o])=>o!==s))),null==t||t.chains.current[r].push([s,new Promise((o=>{c.current.push(o)}))]),null==t||t.chains.current[r].push([s,new Promise((o=>{Promise.all(p.current[r].map((([R,x])=>x))).then((()=>o()))}))]),"enter"===r?f.current=f.current.then((()=>null==t?void 0:t.wait.current)).then((()=>n(r))):n(r)})),C=use_event_o(((s,r,n)=>{Promise.all(p.current[r].splice(0).map((([o,R])=>R))).then((()=>{var o;null==(o=c.current.shift())||o()})).then((()=>n(r)))}));return(0,react.useMemo)((()=>({children:l,register:y,unregister:u,onStart:m,onStop:C,wait:f,chains:p})),[y,u,l,m,C,p,f])}transition_w.displayName="NestingContext";let ue=react.Fragment,Te=render_M.RenderStrategy;let J=W((function He(e,t){let{show:i,appear:l=!1,unmount:S=!0,...E}=e,u=(0,react.useRef)(null),c=use_sync_refs_y(...le(e)?[u,t]:null===t?[]:[t]);use_server_handoff_complete_l();let f=open_closed_u();if(void 0===i&&null!==f&&(i=(f&open_closed_i.Open)===open_closed_i.Open),void 0===i)throw new Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");let[p,m]=(0,react.useState)(i?"visible":"hidden"),C=ae((()=>{i||m("hidden")})),[s,r]=(0,react.useState)(!0),n=(0,react.useRef)([i]);use_iso_morphic_effect_n((()=>{!1!==s&&n.current[n.current.length-1]!==i&&(n.current.push(i),r(!1))}),[n,i]);let o=(0,react.useMemo)((()=>({show:i,appear:l,initial:s})),[i,l,s]);use_on_disappear_m(i,u,(()=>m("hidden"))),use_iso_morphic_effect_n((()=>{i?m("visible"):!transition_M(C)&&null!==u.current&&m("hidden")}),[i,C]);let R={unmount:S},x=use_event_o((()=>{var h;s&&r(!1),null==(h=e.beforeEnter)||h.call(e)})),T=use_event_o((()=>{var h;s&&r(!1),null==(h=e.beforeLeave)||h.call(e)}));return react.createElement(transition_w.Provider,{value:C},react.createElement(transition_V.Provider,{value:o},H({ourProps:{...R,as:react.Fragment,children:react.createElement(de,{ref:c,...R,...E,beforeEnter:x,beforeLeave:T})},theirProps:{},defaultTag:react.Fragment,features:Te,visible:"visible"===p,name:"Transition"})))})),de=W((function De(e,t){var Z,$;let{transition:i=!0,beforeEnter:l,afterEnter:S,beforeLeave:E,afterLeave:u,enter:y,enterFrom:c,enterTo:f,entered:p,leave:m,leaveFrom:C,leaveTo:s,...r}=e,n=(0,react.useRef)(null),o=le(e),R=use_sync_refs_y(...o?[n,t]:null===t?[]:[t]),x=null==(Z=r.unmount)||Z?O.Unmount:O.Hidden,{show:T,appear:h,initial:X}=function Ne(){let e=(0,react.useContext)(transition_V);if(null===e)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}(),[g,U]=(0,react.useState)(T?"visible":"hidden"),z=function _e(){let e=(0,react.useContext)(transition_w);if(null===e)throw new Error("A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.");return e}(),{register:A,unregister:I}=z;use_iso_morphic_effect_n((()=>A(n)),[A,n]),use_iso_morphic_effect_n((()=>{if(x===O.Hidden&&n.current)return T&&"visible"!==g?void U("visible"):match_u(g,{hidden:()=>I(n),visible:()=>A(n)})}),[g,n,A,I,T,x]);let j=use_server_handoff_complete_l();use_iso_morphic_effect_n((()=>{if(o&&j&&"visible"===g&&null===n.current)throw new Error("Did you forget to passthrough the `ref` to the actual DOM node?")}),[n,g,j,o]);let fe=X&&!h,K=h&&T&&X,G=(0,react.useRef)(!1),F=ae((()=>{G.current||(U("hidden"),I(n))}),z),Q=use_event_o((B=>{G.current=!0;let L=B?"enter":"leave";F.onStart(n,L,(D=>{"enter"===D?null==l||l():"leave"===D&&(null==E||E())}))})),Y=use_event_o((B=>{let L=B?"enter":"leave";G.current=!1,F.onStop(n,L,(D=>{"enter"===D?null==S||S():"leave"===D&&(null==u||u())})),"leave"===L&&!transition_M(F)&&(U("hidden"),I(n))}));(0,react.useEffect)((()=>{o&&i||(Q(T),Y(T))}),[T,o,i]);let me=!(!i||!o||!j||fe),[,a]=V(me,n,T,{start:Q,end:Y}),ce=render_m({ref:R,className:(null==($=class_names_t(r.className,K&&y,K&&c,a.enter&&y,a.enter&&a.closed&&c,a.enter&&!a.closed&&f,a.leave&&m,a.leave&&!a.closed&&C,a.leave&&a.closed&&s,!a.transition&&T&&p))?void 0:$.trim())||void 0,...use_transition_A(a)}),_=0;return"visible"===g&&(_|=open_closed_i.Open),"hidden"===g&&(_|=open_closed_i.Closed),a.enter&&(_|=open_closed_i.Opening),a.leave&&(_|=open_closed_i.Closing),react.createElement(transition_w.Provider,{value:F},react.createElement(open_closed_c,{value:_},H({ourProps:ce,theirProps:r,defaultTag:ue,features:Te,visible:"visible"===g,name:"Transition.Child"})))})),Ie=W((function Ae(e,t){let i=null!==(0,react.useContext)(transition_V),l=null!==open_closed_u();return react.createElement(react.Fragment,null,!i&&l?react.createElement(J,{ref:t,...e}):react.createElement(de,{ref:t,...e}))})),Xe=Object.assign(J,{Child:Ie,Root:J})}}]);