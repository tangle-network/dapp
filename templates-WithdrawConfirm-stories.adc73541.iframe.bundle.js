"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[1369],{"./libs/webb-ui-components/src/stories/templates/WithdrawConfirm.stories.jsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>WithdrawConfirm_stories});var _Default_parameters,_Default_parameters_docs,_Default_parameters1,react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),dist=__webpack_require__("./node_modules/storybook-addon-remix-react-router/dist/index.js"),helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),src=__webpack_require__("./libs/icons/src/index.ts"),decimal=__webpack_require__("./node_modules/decimal.js/decimal.mjs"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),AmountInfo=__webpack_require__("./libs/webb-ui-components/src/containers/ConfirmationCard/AmountInfo.tsx"),Button=__webpack_require__("./libs/webb-ui-components/src/components/buttons/Button.tsx"),Chip=__webpack_require__("./libs/webb-ui-components/src/components/Chip/Chip.tsx"),Checkbox=__webpack_require__("./libs/webb-ui-components/src/components/CheckBox/Checkbox.tsx"),SteppedProgress=__webpack_require__("./libs/webb-ui-components/src/components/Progress/SteppedProgress.tsx"),SpendNoteInput=__webpack_require__("./libs/webb-ui-components/src/containers/ConfirmationCard/SpendNoteInput.tsx"),RefundAmount=__webpack_require__("./libs/webb-ui-components/src/containers/ConfirmationCard/RefundAmount.tsx"),TitleWithInfo=__webpack_require__("./libs/webb-ui-components/src/components/TitleWithInfo/TitleWithInfo.tsx"),typography=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),TxProgressor=__webpack_require__("./libs/webb-ui-components/src/components/TxProgressor/index.ts"),TxConfirmationRing=__webpack_require__("./libs/webb-ui-components/src/components/TxConfirmationRing/index.ts"),WrapperSection=__webpack_require__("./libs/webb-ui-components/src/containers/ConfirmationCard/WrapperSection.tsx"),utils=__webpack_require__("./libs/webb-ui-components/src/containers/ConfirmationCard/utils.ts"),_excluded=["actionBtnProps","amount","changeAmount","checkboxProps","className","fee","feeInfo","fungibleTokenSymbol","wrappableTokenSymbol","note","onClose","progress","totalProgress","receivingInfo","refundAmount","refundToken","relayerAddress","relayerAvatarTheme","txStatusMessage","txStatusColor","relayerExternalUrl","remainingAmount","title","sourceAddress","destAddress","sourceTypedChainId","destTypedChainId","poolAddress","poolExplorerUrl","newBalance","feesSection"],__jsx=react.createElement,WithdrawConfirm=(0,react.forwardRef)((function(_ref,ref){var _checkboxProps$childr,_actionBtnProps$child,actionBtnProps=_ref.actionBtnProps,amount=_ref.amount,changeAmount=_ref.changeAmount,checkboxProps=_ref.checkboxProps,className=_ref.className,token1Symbol=(_ref.fee,_ref.feeInfo,_ref.fungibleTokenSymbol),token2Symbol=_ref.wrappableTokenSymbol,note=_ref.note,onClose=_ref.onClose,progress=_ref.progress,totalProgress=_ref.totalProgress,refundAmount=(_ref.receivingInfo,_ref.refundAmount),refundToken=_ref.refundToken,txStatusMessage=(_ref.relayerAddress,_ref.relayerAvatarTheme,_ref.txStatusMessage),_ref$txStatusColor=_ref.txStatusColor,txStatusColor=void 0===_ref$txStatusColor?"blue":_ref$txStatusColor,_ref$title=(_ref.relayerExternalUrl,_ref.remainingAmount,_ref.title),title=void 0===_ref$title?"Confirm Withdrawal":_ref$title,sourceAddress=_ref.sourceAddress,destAddress=_ref.destAddress,sourceTypedChainId=_ref.sourceTypedChainId,destTypedChainId=_ref.destTypedChainId,poolAddress=_ref.poolAddress,poolExplorerUrl=_ref.poolExplorerUrl,newBalance=_ref.newBalance,feesSection=_ref.feesSection,props=objectWithoutProperties_default()(_ref,_excluded);return __jsx("div",extends_default()({},props,{className:(0,bundle_mjs.QP)("p-4 rounded-lg bg-mono-0 dark:bg-mono-190 flex flex-col justify-between gap-9",className),ref}),__jsx("div",{className:"space-y-4"},__jsx("div",{className:"flex items-center justify-between p-2"},__jsx(typography.o,{variant:"h5",fw:"bold"},title),__jsx("button",{onClick:onClose},__jsx(src.bm,{size:"lg"}))),"number"==typeof progress&&"number"==typeof totalProgress?__jsx("div",{className:"flex flex-col gap-3"},__jsx("div",{className:"flex items-center justify-between"},__jsx(TitleWithInfo.B,{title:"Status:",variant:"utility",titleClassName:"text-mono-200 dark:text-mono-0"}),__jsx(Chip.v,{color:txStatusColor},txStatusMessage)),__jsx(SteppedProgress.A,{steps:totalProgress,activeStep:progress})):null,__jsx(WrapperSection.A,null,__jsx(TxProgressor.jg,{txSourceInfo:{isSource:!0,typedChainId:sourceTypedChainId,amount:new decimal.A(-1*amount),tokenSymbol:token1Symbol,walletAddress:sourceAddress,accountType:"note",tokenType:"shielded"},txDestinationInfo:{typedChainId:destTypedChainId,amount:new decimal.A(amount),tokenSymbol:null!=token2Symbol?token2Symbol:token1Symbol,walletAddress:destAddress,accountType:"wallet",tokenType:"unshielded"}})),__jsx(TxConfirmationRing.A,{source:{address:sourceAddress,typedChainId:sourceTypedChainId,isNoteAccount:!0},dest:{address:destAddress,typedChainId:destTypedChainId,isNoteAccount:!1},title:token1Symbol,subtitle:poolAddress,externalLink:poolExplorerUrl}),__jsx("div",{className:"flex flex-col gap-1"},__jsx("div",{className:"flex items-center gap-0.5"},__jsx(src.gJ,{className:"fill-mono-120 dark:fill-mono-100"}),__jsx(TitleWithInfo.B,{title:"Change Note",info:"Unique identifier for the remaining shielded funds after transfer.",variant:"utility",titleClassName:"text-mono-120 dark:text-mono-100",className:"text-mono-120 dark:text-mono-100"})),"string"==typeof note&&__jsx(WrapperSection.A,null,__jsx(SpendNoteInput.A,{note}))),__jsx("div",{className:"flex flex-col gap-2"},__jsx(AmountInfo.A,{label:"Change Amount",amount:(0,utils.N)(changeAmount),tokenSymbol:token1Symbol,tooltipContent:"The value associated with the change note."}),__jsx(AmountInfo.A,{label:"New Balance",amount:(0,utils.N)(newBalance),tokenSymbol:token1Symbol,tooltipContent:"Your updated shielded balance of ".concat(token1Symbol," on destination chain after deposit.")})),feesSection,refundAmount&&__jsx(RefundAmount.A,{tokenSymbol:null!=refundToken?refundToken:"",amount:(0,utils.N)(refundAmount),refundAddress:destAddress}),__jsx(Checkbox.o,extends_default()({},checkboxProps,{wrapperClassName:(0,bundle_mjs.QP)("flex items-start",null==checkboxProps?void 0:checkboxProps.wrapperClassName)}),null!==(_checkboxProps$childr=null==checkboxProps?void 0:checkboxProps.children)&&void 0!==_checkboxProps$childr?_checkboxProps$childr:"I acknowledge that I've saved the change note note (if applicable), essential for future transactions and fund access.")),__jsx("div",{className:"flex flex-col gap-2"},__jsx(Button.A,extends_default()({},actionBtnProps,{isFullWidth:!0,className:"justify-center"}),null!==(_actionBtnProps$child=null==actionBtnProps?void 0:actionBtnProps.children)&&void 0!==_actionBtnProps$child?_actionBtnProps$child:"Withdraw"),!progress&&__jsx(Button.A,{variant:"secondary",isFullWidth:!0,className:"justify-center",onClick:onClose},"Back")))}));WithdrawConfirm.__docgenInfo={description:"",methods:[],displayName:"WithdrawConfirm",props:{txStatusColor:{defaultValue:{value:"'blue'",computed:!1},required:!1},title:{defaultValue:{value:"'Confirm Withdrawal'",computed:!1},required:!1}}};var WithdrawConfirm_stories_jsx=react.createElement;const WithdrawConfirm_stories={title:"Design System/Templates/WithdrawConfirm",component:WithdrawConfirm,decorators:[dist.y]};var Default=function Template(args){return WithdrawConfirm_stories_jsx("div",{className:"flex justify-center"},WithdrawConfirm_stories_jsx(WithdrawConfirm,args))}.bind({});Default.args={title:"Withdraw In-Progress",activeChains:["Optimism"],note:"webb://v2:vanchor/1099511627780:109951123431284u182p347130287412083741289341238412472389741382974",amount:1.01,changeAmount:2.02,fee:.001,progress:25,recipientAddress:"0xb507EcE3132875277d05045Bb1C914088A506443",fungibleTokenSymbol:"eth",wrappableTokenSymbol:"weth",relayerAddress:"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",relayerExternalUrl:"https://webb.tools",unshieldedAddress:"0xb507EcE3132875277d05045Bb1C914088A506443",destChain:"Optimism"},Default.parameters={...Default.parameters,docs:{...null===(_Default_parameters=Default.parameters)||void 0===_Default_parameters?void 0:_Default_parameters.docs,source:{originalSource:'args => <div className="flex justify-center">\n    <WithdrawConfirm {...args} />\n  </div>',...null===(_Default_parameters1=Default.parameters)||void 0===_Default_parameters1||null===(_Default_parameters_docs=_Default_parameters1.docs)||void 0===_Default_parameters_docs?void 0:_Default_parameters_docs.source}}};const __namedExportsOrder=["Default"]},"./libs/dapp-types/src/utils/isPrimitive.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function isPrimitive(value){return null===value||"object"!=typeof value&&"function"!=typeof value}__webpack_require__.d(__webpack_exports__,{A:()=>isPrimitive})},"./libs/webb-ui-components/src/components/Chip/Chip.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{v:()=>Chip});var helpers_extends=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),extends_default=__webpack_require__.n(helpers_extends),objectWithoutProperties=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),objectWithoutProperties_default=__webpack_require__.n(objectWithoutProperties),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),bundle_mjs=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),classNames={blue:{active:"text-blue-90 bg-blue-10 dark:text-blue-30 dark:bg-blue-120",disabled:"bg-blue-10 text-blue-40 dark:bg-blue-120 dark:text-blue-90",selected:"border-solid border-2 border-blue-90 dark:border-blue-30"},green:{active:"bg-green-10 text-green-90 dark:bg-green-120 dark:text-green-50",disabled:"bg-green-10 text-green-40 dark:bg-green-120 dark:text-green-90",selected:"border-solid border-2 border-green-90 dark:border-green-50"},purple:{active:"bg-purple-10 text-purple-90 dark:bg-purple-120 dark:text-purple-50",disabled:"bg-purple-10 text-purple-40 dark:bg-purple-120 dark:text-purple-90",selected:"border-solid border-2 border-purple-90 dark:border-purple-50"},red:{active:"bg-red-10 text-red-90 dark:bg-red-120 dark:text-red-50",disabled:"bg-red-10 text-red-40 dark:bg-red-120 dark:text-red-90",selected:"border-solid border-2 border-red-90 dark:border-red-50"},yellow:{active:"bg-yellow-10 text-yellow-90 dark:bg-yellow-120 dark:text-yellow-50",disabled:"bg-yellow-10 text-yellow-40 dark:bg-yellow-120 dark:text-yellow-90",selected:"border-solid border-2 border-yellow-90 dark:border-yellow-30"},grey:{active:"bg-inherit text-mono-120 dark:inherit dark:text-mono-80",disabled:"bg-mono-200/[5%] text-mono-160 dark:bg-mono-0/[5%] dark:text-mono-0",selected:"border-solid border-2 border-mono-120 dark:border-mono-80"},"dark-grey":{active:"bg-mono-100 dark:bg-mono-140 !text-mono-0",disabled:"!opacity-50",selected:"border-solid border-2 border-mono-120 dark:border-mono-80"}};var _excluded=["children","className","color","isDisabled","isSelected"],__jsx=react.createElement,Chip=react.forwardRef((function(props,ref){var children=props.children,classNameProp=props.className,_props$color=props.color,color=void 0===_props$color?"green":_props$color,isDisabled=props.isDisabled,isSelected=props.isSelected,restProps=objectWithoutProperties_default()(props,_excluded),baseClsx=(0,react.useMemo)((function(){return"box-border inline-flex items-center gap-2 px-3 py-1.5 rounded-full uppercase text-[12px] leading-[15px] font-bold"}),[]),className=(0,react.useMemo)((function(){var _getChipClassName=function getChipClassName(color,isDisabled,isSelected){var _classNames$color=classNames[color],active=_classNames$color.active,disabled=_classNames$color.disabled,selected=_classNames$color.selected;return{activeOrDisable:isDisabled?disabled:active,selected:isSelected?selected:""}}(color,isDisabled,isSelected),activeOrDisable=_getChipClassName.activeOrDisable,selected=_getChipClassName.selected;return(0,bundle_mjs.QP)(baseClsx,activeOrDisable,selected,classNameProp)}),[baseClsx,color,isDisabled,isSelected,classNameProp]);return __jsx("span",extends_default()({className},restProps,{ref}),children)}));Chip.__docgenInfo={description:'The `Chip` component\n\nProps:\n\n- `color`: The visual style of the badge (default: "green")\n- `isDisabled`: If `true`, the chip will display as disabled state\n\n@example\n\n```jsx\n <Chip>Active</Chip>\n <Chip color="red" isDisabled>Disabled</Chip>\n```',methods:[],displayName:"Chip"}},"./libs/webb-ui-components/src/components/Chip/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{v:()=>_Chip__WEBPACK_IMPORTED_MODULE_0__.v});var _Chip__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/Chip/Chip.tsx")},"./libs/webb-ui-components/src/components/TitleWithInfo/TitleWithInfo.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>TitleWithInfo});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/icons/src/index.ts"),_typography__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),tailwind_merge__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_Tooltip__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("./libs/webb-ui-components/src/components/Tooltip/index.ts"),_webb_tools_dapp_types_utils_isPrimitive__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("./libs/dapp-types/src/utils/isPrimitive.ts"),_excluded=["className","info","title","titleClassName","titleComponent","variant","isCenterInfo"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,TitleWithInfo=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)((function(_ref,ref){var className=_ref.className,info=_ref.info,title=_ref.title,titleClassName=_ref.titleClassName,_ref$titleComponent=_ref.titleComponent,titleComponent=void 0===_ref$titleComponent?"span":_ref$titleComponent,_ref$variant=_ref.variant,variant=void 0===_ref$variant?"body1":_ref$variant,isCenterInfo=_ref.isCenterInfo,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded),mergedClsx=(0,react__WEBPACK_IMPORTED_MODULE_2__.useMemo)((function(){return(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_6__.QP)("flex items-center space-x-1 text-mono-180 dark:text-mono-0",className)}),[className]);return __jsx("div",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{className:mergedClsx,ref}),__jsx(_typography__WEBPACK_IMPORTED_MODULE_4__.o,{component:titleComponent,variant,fw:"bold",className:titleClassName},title),info&&__jsx(_Tooltip__WEBPACK_IMPORTED_MODULE_5__.m_,null,__jsx(_Tooltip__WEBPACK_IMPORTED_MODULE_5__.k$,{className:"text-center",asChild:!0},__jsx("span",{className:"cursor-pointer !text-inherit"},__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.B$,{className:"!fill-current pointer-events-none"}))),__jsx(_Tooltip__WEBPACK_IMPORTED_MODULE_5__.SK,{className:"break-normal max-w-[200px]"},(0,_webb_tools_dapp_types_utils_isPrimitive__WEBPACK_IMPORTED_MODULE_7__.A)(info)&&null!=info?__jsx(_typography__WEBPACK_IMPORTED_MODULE_4__.o,{ta:isCenterInfo?"center":"left",variant:"body3",className:"break-normal"},info):info)))}));TitleWithInfo.__docgenInfo={description:"The re-useable title component with small info in a popup tooltip\n\n@example\n\n```jsx\n <TitleWithInfo title='Active key' info='This is the active key card' />\n```",methods:[],displayName:"TitleWithInfo",props:{titleComponent:{defaultValue:{value:"'span'",computed:!1},required:!1},variant:{defaultValue:{value:"'body1'",computed:!1},required:!1}}}},"./libs/webb-ui-components/src/components/TitleWithInfo/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{B:()=>_TitleWithInfo__WEBPACK_IMPORTED_MODULE_0__.B});var _TitleWithInfo__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/components/TitleWithInfo/TitleWithInfo.tsx")},"./libs/webb-ui-components/src/containers/ConfirmationCard/AmountInfo.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_typography__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),_components_IconWithTooltip__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/IconWithTooltip/index.ts"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/icons/src/index.ts"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement,AmountInfo=function AmountInfo(_ref){var label=_ref.label,amount=_ref.amount,tokenSymbol=_ref.tokenSymbol,tooltipContent=_ref.tooltipContent;return __jsx("div",{className:"flex items-center justify-between px-2"},__jsx("div",{className:"flex items-center gap-0.5"},__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.Sm,{className:"fill-mono-120 dark:fill-mono-100"}),__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.gJ,{className:"fill-mono-120 dark:fill-mono-100"}),__jsx(_typography__WEBPACK_IMPORTED_MODULE_1__.o,{variant:"utility",className:"text-mono-120 dark:text-mono-100"},label),tooltipContent&&__jsx(_components_IconWithTooltip__WEBPACK_IMPORTED_MODULE_2__.$,{icon:__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_3__.B$,{className:"fill-mono-120 dark:fill-mono-100"}),content:__jsx(_typography__WEBPACK_IMPORTED_MODULE_1__.o,{variant:"body3",className:"break-normal max-w-max"},tooltipContent),overrideTooltipBodyProps:{className:"max-w-[200px]"}})),__jsx(_typography__WEBPACK_IMPORTED_MODULE_1__.o,{variant:"body1",fw:"bold",className:"text-mono-190 dark:text-mono-40"},null!=amount?amount:"--"," ",tokenSymbol))};const __WEBPACK_DEFAULT_EXPORT__=AmountInfo;AmountInfo.__docgenInfo={description:"",methods:[],displayName:"AmountInfo",props:{label:{required:!0,tsType:{name:"string"},description:""},amount:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:""},tokenSymbol:{required:!0,tsType:{name:"string"},description:""},tooltipContent:{required:!1,tsType:{name:"string"},description:""}}}},"./libs/webb-ui-components/src/containers/ConfirmationCard/RefundAmount.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/icons/src/index.ts"),_components_CopyWithTooltip_CopyWithTooltip__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/components/CopyWithTooltip/CopyWithTooltip.tsx"),_components_IconWithTooltip__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/webb-ui-components/src/components/IconWithTooltip/index.ts"),_typography__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement,RefundAmount=function RefundAmount(_ref){var amount=_ref.amount,tokenSymbol=_ref.tokenSymbol,refundAddress=_ref.refundAddress;return __jsx("div",{className:"flex items-center justify-between px-2"},__jsx("div",{className:"flex items-center gap-0.5"},__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.Sm,{className:"fill-mono-120 dark:fill-mono-100"}),__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.Hq,{className:"fill-mono-120 dark:fill-mono-100"}),__jsx(_typography__WEBPACK_IMPORTED_MODULE_4__.o,{variant:"utility",className:"text-mono-120 dark:text-mono-100 break-normal"},"Refund Amount"),refundAddress&&__jsx(_components_IconWithTooltip__WEBPACK_IMPORTED_MODULE_3__.$,{icon:__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.B$,{className:"fill-mono-120 dark:fill-mono-100"}),content:__jsx("div",{className:"flex flex-col"},__jsx(_typography__WEBPACK_IMPORTED_MODULE_4__.o,{variant:"body3"},"Refund amount will be sent to: ",refundAddress),__jsx(_components_CopyWithTooltip_CopyWithTooltip__WEBPACK_IMPORTED_MODULE_2__.$,{textToCopy:refundAddress,className:"self-end justify-self-end"})),overrideTooltipBodyProps:{className:"max-w-[200px]"}})),__jsx("div",{className:"flex items-center gap-0.5"},__jsx(_typography__WEBPACK_IMPORTED_MODULE_4__.o,{variant:"body1",fw:"bold",className:"text-mono-190 dark:text-mono-40"},null!=amount?amount:"--"," ",tokenSymbol),__jsx(_components_IconWithTooltip__WEBPACK_IMPORTED_MODULE_3__.$,{icon:__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.B$,{className:"fill-mono-120 dark:fill-mono-100"}),content:__jsx(_typography__WEBPACK_IMPORTED_MODULE_4__.o,{variant:"body3",className:"break-normal max-w-max"},"Amount being refunded to recipient."),overrideTooltipBodyProps:{className:"max-w-[200px]"}})))};const __WEBPACK_DEFAULT_EXPORT__=RefundAmount;RefundAmount.__docgenInfo={description:"",methods:[],displayName:"RefundAmount",props:{amount:{required:!1,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:""},tokenSymbol:{required:!0,tsType:{name:"string"},description:""},refundAddress:{required:!1,tsType:{name:"string"},description:""}}}},"./libs/webb-ui-components/src/containers/ConfirmationCard/SpendNoteInput.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./libs/icons/src/index.ts"),_typography__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./libs/webb-ui-components/src/typography/index.ts"),_components_CopyWithTooltip_CopyWithTooltip__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./libs/webb-ui-components/src/components/CopyWithTooltip/CopyWithTooltip.tsx"),__jsx=react__WEBPACK_IMPORTED_MODULE_0__.createElement,SpendNoteInput=function SpendNoteInput(_ref){var note=_ref.note,_useState=(0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(!0),hidden=_useState[0],setHidden=_useState[1];return __jsx("div",{className:"flex items-center justify-between gap-1"},__jsx(_typography__WEBPACK_IMPORTED_MODULE_2__.o,{variant:"h5",fw:"bold",className:"block text-clip whitespace-nowrap overflow-hidden !text-mono-100"},hidden?"*".repeat(40):note),__jsx("div",{className:"flex items-center gap-1"},hidden?__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.Mf,{size:"lg",onClick:function onClick(){setHidden(!1)},className:"!fill-mono-100"}):__jsx(_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.Xp,{size:"lg",onClick:function onClick(){setHidden(!0)},className:"!fill-mono-100"}),__jsx(_components_CopyWithTooltip_CopyWithTooltip__WEBPACK_IMPORTED_MODULE_3__.$,{textToCopy:note,isButton:!1,iconSize:"lg",iconClassName:"!fill-mono-100"})))};const __WEBPACK_DEFAULT_EXPORT__=SpendNoteInput;SpendNoteInput.__docgenInfo={description:"",methods:[],displayName:"SpendNoteInput",props:{note:{required:!0,tsType:{name:"string"},description:""}}}},"./libs/webb-ui-components/src/containers/ConfirmationCard/WrapperSection.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});var _home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/extends.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0__),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/@babel/runtime/helpers/objectWithoutProperties.js"),_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default=__webpack_require__.n(_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1__),react__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),tailwind_merge__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("./node_modules/tailwind-merge/dist/bundle-mjs.mjs"),_excluded=["className","children"],__jsx=react__WEBPACK_IMPORTED_MODULE_2__.createElement,WrapperSection=(0,react__WEBPACK_IMPORTED_MODULE_2__.forwardRef)((function(_ref,ref){var className=_ref.className,children=_ref.children,props=_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_objectWithoutProperties_js__WEBPACK_IMPORTED_MODULE_1___default()(_ref,_excluded);return __jsx("div",_home_runner_work_webb_dapp_webb_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_extends_js__WEBPACK_IMPORTED_MODULE_0___default()({},props,{className:(0,tailwind_merge__WEBPACK_IMPORTED_MODULE_3__.QP)("px-4 py-2 rounded-lg bg-mono-20 dark:bg-mono-180",className),ref}),children)}));const __WEBPACK_DEFAULT_EXPORT__=WrapperSection;WrapperSection.__docgenInfo={description:"",methods:[],displayName:"WrapperSection"}},"./libs/webb-ui-components/src/containers/ConfirmationCard/utils.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{N:()=>formatTokenAmount});var _utils__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./libs/webb-ui-components/src/utils/index.ts"),formatTokenAmount=function formatTokenAmount(amount){return(0,_utils__WEBPACK_IMPORTED_MODULE_0__.bN)(amount,5,{roundingFunction:Math.round})}}}]);