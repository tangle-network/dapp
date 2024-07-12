"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[8104,6667,9048],{"./node_modules/@radix-ui/react-label/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{b:()=>Root});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@radix-ui/react-primitive/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),Label=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_2__.sG.label,{...props,ref:forwardedRef,onMouseDown:event=>{event.target.closest("button, input, select, textarea")||(props.onMouseDown?.(event),!event.defaultPrevented&&event.detail>1&&event.preventDefault())}})));Label.displayName="Label";var Root=Label},"./node_modules/@radix-ui/react-progress/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{C1:()=>Indicator,bL:()=>Root});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/@radix-ui/react-context/dist/index.mjs"),_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/@radix-ui/react-primitive/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),console=__webpack_require__("./node_modules/console-browserify/index.js"),[createProgressContext,createProgressScope]=(0,_radix_ui_react_context__WEBPACK_IMPORTED_MODULE_2__.A)("Progress"),[ProgressProvider,useProgressContext]=createProgressContext("Progress"),Progress=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeProgress,value:valueProp=null,max:maxProp,getValueLabel=defaultGetValueLabel,...progressProps}=props;!maxProp&&0!==maxProp||isValidMaxNumber(maxProp)||console.error(function getInvalidMaxError(propValue,componentName){return`Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`100\`.`}(`${maxProp}`,"Progress"));const max=isValidMaxNumber(maxProp)?maxProp:100;null===valueProp||isValidValueNumber(valueProp,max)||console.error(function getInvalidValueError(propValue,componentName){return`Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:\n  - a positive number\n  - less than the value passed to \`max\` (or 100 if no \`max\` prop is set)\n  - \`null\` or \`undefined\` if the progress is indeterminate.\n\nDefaulting to \`null\`.`}(`${valueProp}`,"Progress"));const value=isValidValueNumber(valueProp,max)?valueProp:null,valueLabel=isNumber(value)?getValueLabel(value,max):void 0;return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(ProgressProvider,{scope:__scopeProgress,value,max,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_3__.sG.div,{"aria-valuemax":max,"aria-valuemin":0,"aria-valuenow":isNumber(value)?value:void 0,"aria-valuetext":valueLabel,role:"progressbar","data-state":getProgressState(value,max),"data-value":value??void 0,"data-max":max,...progressProps,ref:forwardedRef})})}));Progress.displayName="Progress";var ProgressIndicator=react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(((props,forwardedRef)=>{const{__scopeProgress,...indicatorProps}=props,context=useProgressContext("ProgressIndicator",__scopeProgress);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_radix_ui_react_primitive__WEBPACK_IMPORTED_MODULE_3__.sG.div,{"data-state":getProgressState(context.value,context.max),"data-value":context.value??void 0,"data-max":context.max,...indicatorProps,ref:forwardedRef})}));function defaultGetValueLabel(value,max){return`${Math.round(value/max*100)}%`}function getProgressState(value,maxValue){return null==value?"indeterminate":value===maxValue?"complete":"loading"}function isNumber(value){return"number"==typeof value}function isValidMaxNumber(max){return isNumber(max)&&!isNaN(max)&&max>0}function isValidValueNumber(value,max){return isNumber(value)&&!isNaN(value)&&value<=max&&value>=0}ProgressIndicator.displayName="ProgressIndicator";var Root=Progress,Indicator=ProgressIndicator},"./node_modules/@radix-ui/react-tooltip/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{i3:()=>Arrow2,UC:()=>Content2,ZL:()=>Portal,Kq:()=>Provider,bL:()=>Root3,k$:()=>TooltipTrigger,l9:()=>Trigger});var react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),dist=__webpack_require__("./node_modules/@radix-ui/primitive/dist/index.mjs"),react_compose_refs_dist=__webpack_require__("./node_modules/@radix-ui/react-compose-refs/dist/index.mjs"),react_context_dist=__webpack_require__("./node_modules/@radix-ui/react-context/dist/index.mjs"),react_dismissable_layer_dist=__webpack_require__("./node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs"),react_id_dist=__webpack_require__("./node_modules/@radix-ui/react-id/dist/index.mjs"),react_popper_dist=__webpack_require__("./node_modules/@radix-ui/react-popper/dist/index.mjs"),react_portal_dist=__webpack_require__("./node_modules/@radix-ui/react-portal/dist/index.mjs"),react_presence_dist=__webpack_require__("./node_modules/@radix-ui/react-presence/dist/index.mjs"),react_primitive_dist=__webpack_require__("./node_modules/@radix-ui/react-primitive/dist/index.mjs"),react_slot_dist=__webpack_require__("./node_modules/@radix-ui/react-slot/dist/index.mjs"),react_use_controllable_state_dist=__webpack_require__("./node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs"),jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),VisuallyHidden=react.forwardRef(((props,forwardedRef)=>(0,jsx_runtime.jsx)(react_primitive_dist.sG.span,{...props,ref:forwardedRef,style:{position:"absolute",border:0,width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",wordWrap:"normal",...props.style}})));VisuallyHidden.displayName="VisuallyHidden";var Root=VisuallyHidden,[createTooltipContext,createTooltipScope]=(0,react_context_dist.A)("Tooltip",[react_popper_dist.Bk]),usePopperScope=(0,react_popper_dist.Bk)(),DEFAULT_DELAY_DURATION=700,[TooltipProviderContextProvider,useTooltipProviderContext]=createTooltipContext("TooltipProvider"),TooltipProvider=props=>{const{__scopeTooltip,delayDuration=DEFAULT_DELAY_DURATION,skipDelayDuration=300,disableHoverableContent=!1,children}=props,[isOpenDelayed,setIsOpenDelayed]=react.useState(!0),isPointerInTransitRef=react.useRef(!1),skipDelayTimerRef=react.useRef(0);return react.useEffect((()=>{const skipDelayTimer=skipDelayTimerRef.current;return()=>window.clearTimeout(skipDelayTimer)}),[]),(0,jsx_runtime.jsx)(TooltipProviderContextProvider,{scope:__scopeTooltip,isOpenDelayed,delayDuration,onOpen:react.useCallback((()=>{window.clearTimeout(skipDelayTimerRef.current),setIsOpenDelayed(!1)}),[]),onClose:react.useCallback((()=>{window.clearTimeout(skipDelayTimerRef.current),skipDelayTimerRef.current=window.setTimeout((()=>setIsOpenDelayed(!0)),skipDelayDuration)}),[skipDelayDuration]),isPointerInTransitRef,onPointerInTransitChange:react.useCallback((inTransit=>{isPointerInTransitRef.current=inTransit}),[]),disableHoverableContent,children})};TooltipProvider.displayName="TooltipProvider";var[TooltipContextProvider,useTooltipContext]=createTooltipContext("Tooltip"),Tooltip=props=>{const{__scopeTooltip,children,open:openProp,defaultOpen=!1,onOpenChange,disableHoverableContent:disableHoverableContentProp,delayDuration:delayDurationProp}=props,providerContext=useTooltipProviderContext("Tooltip",props.__scopeTooltip),popperScope=usePopperScope(__scopeTooltip),[trigger,setTrigger]=react.useState(null),contentId=(0,react_id_dist.B)(),openTimerRef=react.useRef(0),disableHoverableContent=disableHoverableContentProp??providerContext.disableHoverableContent,delayDuration=delayDurationProp??providerContext.delayDuration,wasOpenDelayedRef=react.useRef(!1),[open=!1,setOpen]=(0,react_use_controllable_state_dist.i)({prop:openProp,defaultProp:defaultOpen,onChange:open2=>{open2?(providerContext.onOpen(),document.dispatchEvent(new CustomEvent("tooltip.open"))):providerContext.onClose(),onOpenChange?.(open2)}}),stateAttribute=react.useMemo((()=>open?wasOpenDelayedRef.current?"delayed-open":"instant-open":"closed"),[open]),handleOpen=react.useCallback((()=>{window.clearTimeout(openTimerRef.current),wasOpenDelayedRef.current=!1,setOpen(!0)}),[setOpen]),handleClose=react.useCallback((()=>{window.clearTimeout(openTimerRef.current),setOpen(!1)}),[setOpen]),handleDelayedOpen=react.useCallback((()=>{window.clearTimeout(openTimerRef.current),openTimerRef.current=window.setTimeout((()=>{wasOpenDelayedRef.current=!0,setOpen(!0)}),delayDuration)}),[delayDuration,setOpen]);return react.useEffect((()=>()=>window.clearTimeout(openTimerRef.current)),[]),(0,jsx_runtime.jsx)(react_popper_dist.bL,{...popperScope,children:(0,jsx_runtime.jsx)(TooltipContextProvider,{scope:__scopeTooltip,contentId,open,stateAttribute,trigger,onTriggerChange:setTrigger,onTriggerEnter:react.useCallback((()=>{providerContext.isOpenDelayed?handleDelayedOpen():handleOpen()}),[providerContext.isOpenDelayed,handleDelayedOpen,handleOpen]),onTriggerLeave:react.useCallback((()=>{disableHoverableContent?handleClose():window.clearTimeout(openTimerRef.current)}),[handleClose,disableHoverableContent]),onOpen:handleOpen,onClose:handleClose,disableHoverableContent,children})})};Tooltip.displayName="Tooltip";var TooltipTrigger=react.forwardRef(((props,forwardedRef)=>{const{__scopeTooltip,...triggerProps}=props,context=useTooltipContext("TooltipTrigger",__scopeTooltip),providerContext=useTooltipProviderContext("TooltipTrigger",__scopeTooltip),popperScope=usePopperScope(__scopeTooltip),ref=react.useRef(null),composedRefs=(0,react_compose_refs_dist.s)(forwardedRef,ref,context.onTriggerChange),isPointerDownRef=react.useRef(!1),hasPointerMoveOpenedRef=react.useRef(!1),handlePointerUp=react.useCallback((()=>isPointerDownRef.current=!1),[]);return react.useEffect((()=>()=>document.removeEventListener("pointerup",handlePointerUp)),[handlePointerUp]),(0,jsx_runtime.jsx)(react_popper_dist.Mz,{asChild:!0,...popperScope,children:(0,jsx_runtime.jsx)(react_primitive_dist.sG.button,{"aria-describedby":context.open?context.contentId:void 0,"data-state":context.stateAttribute,...triggerProps,ref:composedRefs,onPointerMove:(0,dist.m)(props.onPointerMove,(event=>{"touch"!==event.pointerType&&(hasPointerMoveOpenedRef.current||providerContext.isPointerInTransitRef.current||(context.onTriggerEnter(),hasPointerMoveOpenedRef.current=!0))})),onPointerLeave:(0,dist.m)(props.onPointerLeave,(()=>{context.onTriggerLeave(),hasPointerMoveOpenedRef.current=!1})),onPointerDown:(0,dist.m)(props.onPointerDown,(()=>{isPointerDownRef.current=!0,document.addEventListener("pointerup",handlePointerUp,{once:!0})})),onFocus:(0,dist.m)(props.onFocus,(()=>{isPointerDownRef.current||context.onOpen()})),onBlur:(0,dist.m)(props.onBlur,context.onClose),onClick:(0,dist.m)(props.onClick,context.onClose)})})}));TooltipTrigger.displayName="TooltipTrigger";var[PortalProvider,usePortalContext]=createTooltipContext("TooltipPortal",{forceMount:void 0}),TooltipPortal=props=>{const{__scopeTooltip,forceMount,children,container}=props,context=useTooltipContext("TooltipPortal",__scopeTooltip);return(0,jsx_runtime.jsx)(PortalProvider,{scope:__scopeTooltip,forceMount,children:(0,jsx_runtime.jsx)(react_presence_dist.C,{present:forceMount||context.open,children:(0,jsx_runtime.jsx)(react_portal_dist.Z,{asChild:!0,container,children})})})};TooltipPortal.displayName="TooltipPortal";var TooltipContent=react.forwardRef(((props,forwardedRef)=>{const portalContext=usePortalContext("TooltipContent",props.__scopeTooltip),{forceMount=portalContext.forceMount,side="top",...contentProps}=props,context=useTooltipContext("TooltipContent",props.__scopeTooltip);return(0,jsx_runtime.jsx)(react_presence_dist.C,{present:forceMount||context.open,children:context.disableHoverableContent?(0,jsx_runtime.jsx)(TooltipContentImpl,{side,...contentProps,ref:forwardedRef}):(0,jsx_runtime.jsx)(TooltipContentHoverable,{side,...contentProps,ref:forwardedRef})})})),TooltipContentHoverable=react.forwardRef(((props,forwardedRef)=>{const context=useTooltipContext("TooltipContent",props.__scopeTooltip),providerContext=useTooltipProviderContext("TooltipContent",props.__scopeTooltip),ref=react.useRef(null),composedRefs=(0,react_compose_refs_dist.s)(forwardedRef,ref),[pointerGraceArea,setPointerGraceArea]=react.useState(null),{trigger,onClose}=context,content=ref.current,{onPointerInTransitChange}=providerContext,handleRemoveGraceArea=react.useCallback((()=>{setPointerGraceArea(null),onPointerInTransitChange(!1)}),[onPointerInTransitChange]),handleCreateGraceArea=react.useCallback(((event,hoverTarget)=>{const currentTarget=event.currentTarget,exitPoint={x:event.clientX,y:event.clientY},paddedExitPoints=function getPaddedExitPoints(exitPoint,exitSide,padding=5){const paddedExitPoints=[];switch(exitSide){case"top":paddedExitPoints.push({x:exitPoint.x-padding,y:exitPoint.y+padding},{x:exitPoint.x+padding,y:exitPoint.y+padding});break;case"bottom":paddedExitPoints.push({x:exitPoint.x-padding,y:exitPoint.y-padding},{x:exitPoint.x+padding,y:exitPoint.y-padding});break;case"left":paddedExitPoints.push({x:exitPoint.x+padding,y:exitPoint.y-padding},{x:exitPoint.x+padding,y:exitPoint.y+padding});break;case"right":paddedExitPoints.push({x:exitPoint.x-padding,y:exitPoint.y-padding},{x:exitPoint.x-padding,y:exitPoint.y+padding})}return paddedExitPoints}(exitPoint,function getExitSideFromRect(point,rect){const top=Math.abs(rect.top-point.y),bottom=Math.abs(rect.bottom-point.y),right=Math.abs(rect.right-point.x),left=Math.abs(rect.left-point.x);switch(Math.min(top,bottom,right,left)){case left:return"left";case right:return"right";case top:return"top";case bottom:return"bottom";default:throw new Error("unreachable")}}(exitPoint,currentTarget.getBoundingClientRect())),graceArea=function getHull(points){const newPoints=points.slice();return newPoints.sort(((a,b)=>a.x<b.x?-1:a.x>b.x?1:a.y<b.y?-1:a.y>b.y?1:0)),function getHullPresorted(points){if(points.length<=1)return points.slice();const upperHull=[];for(let i=0;i<points.length;i++){const p=points[i];for(;upperHull.length>=2;){const q=upperHull[upperHull.length-1],r=upperHull[upperHull.length-2];if(!((q.x-r.x)*(p.y-r.y)>=(q.y-r.y)*(p.x-r.x)))break;upperHull.pop()}upperHull.push(p)}upperHull.pop();const lowerHull=[];for(let i=points.length-1;i>=0;i--){const p=points[i];for(;lowerHull.length>=2;){const q=lowerHull[lowerHull.length-1],r=lowerHull[lowerHull.length-2];if(!((q.x-r.x)*(p.y-r.y)>=(q.y-r.y)*(p.x-r.x)))break;lowerHull.pop()}lowerHull.push(p)}return lowerHull.pop(),1===upperHull.length&&1===lowerHull.length&&upperHull[0].x===lowerHull[0].x&&upperHull[0].y===lowerHull[0].y?upperHull:upperHull.concat(lowerHull)}(newPoints)}([...paddedExitPoints,...function getPointsFromRect(rect){const{top,right,bottom,left}=rect;return[{x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}]}(hoverTarget.getBoundingClientRect())]);setPointerGraceArea(graceArea),onPointerInTransitChange(!0)}),[onPointerInTransitChange]);return react.useEffect((()=>()=>handleRemoveGraceArea()),[handleRemoveGraceArea]),react.useEffect((()=>{if(trigger&&content){const handleTriggerLeave=event=>handleCreateGraceArea(event,content),handleContentLeave=event=>handleCreateGraceArea(event,trigger);return trigger.addEventListener("pointerleave",handleTriggerLeave),content.addEventListener("pointerleave",handleContentLeave),()=>{trigger.removeEventListener("pointerleave",handleTriggerLeave),content.removeEventListener("pointerleave",handleContentLeave)}}}),[trigger,content,handleCreateGraceArea,handleRemoveGraceArea]),react.useEffect((()=>{if(pointerGraceArea){const handleTrackPointerGrace=event=>{const target=event.target,pointerPosition={x:event.clientX,y:event.clientY},hasEnteredTarget=trigger?.contains(target)||content?.contains(target),isPointerOutsideGraceArea=!function isPointInPolygon(point,polygon){const{x,y}=point;let inside=!1;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const xi=polygon[i].x,yi=polygon[i].y,xj=polygon[j].x,yj=polygon[j].y;yi>y!=yj>y&&x<(xj-xi)*(y-yi)/(yj-yi)+xi&&(inside=!inside)}return inside}(pointerPosition,pointerGraceArea);hasEnteredTarget?handleRemoveGraceArea():isPointerOutsideGraceArea&&(handleRemoveGraceArea(),onClose())};return document.addEventListener("pointermove",handleTrackPointerGrace),()=>document.removeEventListener("pointermove",handleTrackPointerGrace)}}),[trigger,content,pointerGraceArea,onClose,handleRemoveGraceArea]),(0,jsx_runtime.jsx)(TooltipContentImpl,{...props,ref:composedRefs})})),[VisuallyHiddenContentContextProvider,useVisuallyHiddenContentContext]=createTooltipContext("Tooltip",{isInside:!1}),TooltipContentImpl=react.forwardRef(((props,forwardedRef)=>{const{__scopeTooltip,children,"aria-label":ariaLabel,onEscapeKeyDown,onPointerDownOutside,...contentProps}=props,context=useTooltipContext("TooltipContent",__scopeTooltip),popperScope=usePopperScope(__scopeTooltip),{onClose}=context;return react.useEffect((()=>(document.addEventListener("tooltip.open",onClose),()=>document.removeEventListener("tooltip.open",onClose))),[onClose]),react.useEffect((()=>{if(context.trigger){const handleScroll=event=>{const target=event.target;target?.contains(context.trigger)&&onClose()};return window.addEventListener("scroll",handleScroll,{capture:!0}),()=>window.removeEventListener("scroll",handleScroll,{capture:!0})}}),[context.trigger,onClose]),(0,jsx_runtime.jsx)(react_dismissable_layer_dist.qW,{asChild:!0,disableOutsidePointerEvents:!1,onEscapeKeyDown,onPointerDownOutside,onFocusOutside:event=>event.preventDefault(),onDismiss:onClose,children:(0,jsx_runtime.jsxs)(react_popper_dist.UC,{"data-state":context.stateAttribute,...popperScope,...contentProps,ref:forwardedRef,style:{...contentProps.style,"--radix-tooltip-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-tooltip-content-available-width":"var(--radix-popper-available-width)","--radix-tooltip-content-available-height":"var(--radix-popper-available-height)","--radix-tooltip-trigger-width":"var(--radix-popper-anchor-width)","--radix-tooltip-trigger-height":"var(--radix-popper-anchor-height)"},children:[(0,jsx_runtime.jsx)(react_slot_dist.xV,{children}),(0,jsx_runtime.jsx)(VisuallyHiddenContentContextProvider,{scope:__scopeTooltip,isInside:!0,children:(0,jsx_runtime.jsx)(Root,{id:context.contentId,role:"tooltip",children:ariaLabel||children})})]})})}));TooltipContent.displayName="TooltipContent";var TooltipArrow=react.forwardRef(((props,forwardedRef)=>{const{__scopeTooltip,...arrowProps}=props,popperScope=usePopperScope(__scopeTooltip);return useVisuallyHiddenContentContext("TooltipArrow",__scopeTooltip).isInside?null:(0,jsx_runtime.jsx)(react_popper_dist.i3,{...popperScope,...arrowProps,ref:forwardedRef})}));TooltipArrow.displayName="TooltipArrow";var Provider=TooltipProvider,Root3=Tooltip,Trigger=TooltipTrigger,Portal=TooltipPortal,Content2=TooltipContent,Arrow2=TooltipArrow}}]);