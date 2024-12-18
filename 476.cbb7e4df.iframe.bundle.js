"use strict";(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[476],{"../dapp-config/src/constants/tangle.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{function getPolkadotJsDashboardUrl(wsRpcEndpoint){return`https://polkadot.js.org/apps/?rpc=${wsRpcEndpoint}#/explorer`}__webpack_require__.d(__webpack_exports__,{Hp:()=>TANGLE_LOCAL_HTTP_RPC_ENDPOINT,fI:()=>TANGLE_LOCAL_WS_RPC_ENDPOINT,WA:()=>TANGLE_MAINNET_EVM_EXPLORER_URL,gC:()=>TANGLE_MAINNET_HTTP_RPC_ENDPOINT,vw:()=>TANGLE_MAINNET_NATIVE_EXPLORER_URL,us:()=>TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL,Wo:()=>TANGLE_MAINNET_WS_RPC_ENDPOINT,fd:()=>TANGLE_TESTNET_EVM_EXPLORER_URL,HN:()=>TANGLE_TESTNET_HTTP_RPC_ENDPOINT,Y5:()=>TANGLE_TESTNET_NATIVE_EXPLORER_URL,fK:()=>TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,xF:()=>TANGLE_TESTNET_WS_RPC_ENDPOINT,Tr:()=>TANGLE_TOKEN_DECIMALS});const TANGLE_MAINNET_WS_RPC_ENDPOINT="wss://rpc.tangle.tools",TANGLE_MAINNET_HTTP_RPC_ENDPOINT="https://rpc.tangle.tools",TANGLE_MAINNET_NATIVE_EXPLORER_URL=(getPolkadotJsDashboardUrl(TANGLE_MAINNET_WS_RPC_ENDPOINT),"https://tangle.statescan.io/"),TANGLE_MAINNET_EVM_EXPLORER_URL="https://explorer.tangle.tools/",TANGLE_MAINNET_NATIVE_TOKEN_SYMBOL="TNT",TANGLE_TESTNET_WS_RPC_ENDPOINT="wss://testnet-rpc.tangle.tools",TANGLE_TESTNET_HTTP_RPC_ENDPOINT="https://testnet-rpc.tangle.tools",TANGLE_TESTNET_NATIVE_EXPLORER_URL=(getPolkadotJsDashboardUrl(TANGLE_TESTNET_WS_RPC_ENDPOINT),`https://polkadot.js.org/apps/?rpc=${TANGLE_TESTNET_WS_RPC_ENDPOINT}#/explorer`),TANGLE_TESTNET_EVM_EXPLORER_URL="https://testnet-explorer.tangle.tools",TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL="tTNT",TANGLE_LOCAL_WS_RPC_ENDPOINT="ws://127.0.0.1:9944",TANGLE_LOCAL_HTTP_RPC_ENDPOINT="http://127.0.0.1:9944",TANGLE_TOKEN_DECIMALS=(getPolkadotJsDashboardUrl(TANGLE_LOCAL_WS_RPC_ENDPOINT),18)},"./src/constants/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{$i:()=>SOCIAL_URLS_RECORD,Ck:()=>TANGLE_TERMS_OF_SERVICE_URL,Gs:()=>SIDEBAR_OPEN_KEY,Ig:()=>EMPTY_VALUE_PLACEHOLDER,M$:()=>TANGLE_WHITEPAPER_URL,NZ:()=>WEBB_CAREERS_URL,SY:()=>footerNavs,VD:()=>TANGLE_PRESS_KIT_URL,Yk:()=>TANGLE_PRIVACY_POLICY_URL,ZH:()=>bottomLinks,a4:()=>WEBB_MKT_URL,bo:()=>WEBB_DOCS_URL,gc:()=>WEBB_AVAILABLE_SOCIALS,gk:()=>TANGLE_DOCS_URL,hS:()=>SOCIAL_ICONS_RECORD,kY:()=>TANGLE_GITHUB_URL,kZ:()=>logoConfig,m2:()=>TANGLE_TWITTER_URL,re:()=>TANGLE_MKT_URL,rg:()=>tangleLogoConfig,s7:()=>defaultSocialConfigs});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_webb_tools_dapp_config_constants_tangle__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../dapp-config/src/constants/tangle.ts"),_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../icons/src/index.ts");const commonExternalProps={target:"_blank"},logoConfig={name:"Logo",path:"/"},WEBB_MKT_URL="https://webb.tools",TANGLE_MKT_URL="https://tangle.tools",TANGLE_PRESS_KIT_URL="https://www.tangle.tools/press-kit",TANGLE_DOCS_URL="https://docs.tangle.tools/",TANGLE_GITHUB_URL="https://github.com/tangle-network/tangle",WEBB_DOCS_URL="https://docs.webb.tools/",TANGLE_WHITEPAPER_URL="https://github.com/webb-tools/tangle/blob/main/Tangle_Network_Whitepaper_March282024.pdf",WEBB_CAREERS_URL="https://wellfound.com/company/webb-4/jobs",TANGLE_TWITTER_URL="https://twitter.com/tangle_network",TANGLE_PRIVACY_POLICY_URL=new URL("/privacy-policy",TANGLE_MKT_URL).toString(),TANGLE_TERMS_OF_SERVICE_URL=new URL("/terms-of-service",TANGLE_MKT_URL).toString(),WEBB_AVAILABLE_SOCIALS=["telegram","discord","commonwealth","linkedin","twitter","github","youTube"],SOCIAL_URLS_RECORD={telegram:"https://t.me/webbprotocol",discord:"https://discord.com/invite/cv8EfJu3Tn",commonwealth:"https://commonwealth.im/webb",linkedin:"https://www.linkedin.com/company/webb-protocol",twitter:"https://twitter.com/webbprotocol",github:"https://github.com/webb-tools",youTube:"https://www.youtube.com/channel/UCDro1mNK9yHGQNDvFuucwVw"},SOCIAL_ICONS_RECORD={telegram:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.x3,discord:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.ci,commonwealth:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.zg,linkedin:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.wc,twitter:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.xq,github:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.P2,youTube:_webb_tools_icons__WEBPACK_IMPORTED_MODULE_1__.zW},tangleLogoConfig={name:"Tangle Logo",path:TANGLE_MKT_URL},footerNavs={dapp:[(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"bridge",href:"https://app.webb.tools"},commonExternalProps)],network:[(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"Tangle EVM Explorer",href:_webb_tools_dapp_config_constants_tangle__WEBPACK_IMPORTED_MODULE_0__.WA},commonExternalProps),(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"Tangle Native explorer",href:_webb_tools_dapp_config_constants_tangle__WEBPACK_IMPORTED_MODULE_0__.vw},commonExternalProps)],developer:[(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"documentation",href:WEBB_DOCS_URL},commonExternalProps),(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"source code",href:SOCIAL_URLS_RECORD.github},commonExternalProps)],resources:[(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"community",href:new URL("/docs/community",WEBB_DOCS_URL).toString()},commonExternalProps)],company:[(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"about us",href:WEBB_MKT_URL},commonExternalProps),(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"jobs",href:WEBB_CAREERS_URL},commonExternalProps)]},bottomLinks=[(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"Terms of Service",href:"https://webb.tools/terms-and-conditions"},commonExternalProps),(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({name:"Privacy Policy",href:"https://webb.tools/privacy-policy"},commonExternalProps)],defaultSocialConfigs=WEBB_AVAILABLE_SOCIALS.map((name=>({name,href:SOCIAL_URLS_RECORD[name],Icon:SOCIAL_ICONS_RECORD[name],target:"_blank",rel:"noopener noreferrer"}))),SIDEBAR_OPEN_KEY="isSidebarOpen",EMPTY_VALUE_PLACEHOLDER="—"},"./src/utils/forwardRef.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>forwardRef});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/next/dist/compiled/react/index.js");function forwardRef(render){return(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)(render)}},"./src/utils/getRoundedAmountString.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{b:()=>getRoundedAmountString});var _home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js"),numbro__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/numbro/dist/es/numbro.js");const _excluded=["roundingFunction","defaultPlaceholder"];function getRoundedAmountString(num,digits=3,formatOption={}){const{roundingFunction=Math.floor,defaultPlaceholder="-"}=formatOption,restOpts=(0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_objectWithoutPropertiesLoose_js__WEBPACK_IMPORTED_MODULE_1__.A)(formatOption,_excluded);if(0===num)return"0";if(!num)return defaultPlaceholder;if(num<0)return"< 0";const decimals=function getDecimals(digit){let s="0.";for(;--digit;)s+="0";return parseFloat(s+"1")}(digits);return num<decimals?`< ${decimals}`:(0,numbro__WEBPACK_IMPORTED_MODULE_0__.A)(num).format((0,_home_runner_work_dapp_dapp_node_modules_next_dist_compiled_babel_runtime_helpers_esm_extends_js__WEBPACK_IMPORTED_MODULE_2__.A)({average:num>1e3,totalLength:num<1e3?0:3,mantissa:digits,optionalMantissa:!0,trimMantissa:!0,thousandSeparated:!0,roundingFunction},restOpts))}},"./src/utils/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{CO:()=>calculateDateProgress,PK:()=>formatDateToUtc,Tl:()=>getPaginationItems,bN:()=>getRoundedAmountString.b,qy:()=>isSubstrateAddress_isSubstrateAddress,f2:()=>shortenHex.f,l1:()=>shortenString.l,Mg:()=>utils_toFixed});__webpack_require__("../../node_modules/assert/build/assert.js");var isValid=__webpack_require__("../../node_modules/date-fns/isValid.js"),differenceInMilliseconds=__webpack_require__("../../node_modules/date-fns/differenceInMilliseconds.js");const calculateDateProgress=(startDateStr,endDateStr,now)=>{if(null===startDateStr||null===endDateStr)return null;if(!(0,isValid.f)(startDateStr)||!(0,isValid.f)(endDateStr))return null;var _now_current_getTime;const currentTime=null!==(_now_current_getTime=null==now?void 0:now.current.getTime())&&void 0!==_now_current_getTime?_now_current_getTime:Date.now(),startDate=new Date(startDateStr),endDate=new Date(endDateStr);if((0,differenceInMilliseconds.b)(currentTime,startDate)<0)return null;const diffBetweenStartAndEnd=Math.abs(startDate.getTime()-endDate.getTime()),diffBetweenStartAndNow=Math.abs(startDate.getTime()-currentTime);return 0===diffBetweenStartAndEnd?null:diffBetweenStartAndNow>diffBetweenStartAndEnd?100:parseFloat((diffBetweenStartAndNow/diffBetweenStartAndEnd*100).toFixed(2))};__webpack_require__("../../node_modules/lodash/merge.js"),__webpack_require__("../../node_modules/console-browserify/index.js");var parseISO=__webpack_require__("../../node_modules/date-fns/parseISO.js"),utc=__webpack_require__("../../node_modules/@date-fns/utc/index.js");const formatDateToUtc=dateArg=>{if(!dateArg)return"TBD";if(!(0,isValid.f)(dateArg))throw new Error("Please provide valid date object");let dateISO;return dateISO="string"==typeof dateArg?(0,parseISO.H)(new Date(dateArg).toISOString()):(0,parseISO.H)(dateArg.toISOString()),new utc.at(dateISO.toString()).toString()};var AmountFormatStyle;!function(AmountFormatStyle){AmountFormatStyle[AmountFormatStyle.EXACT=0]="EXACT",AmountFormatStyle[AmountFormatStyle.SI=1]="SI",AmountFormatStyle[AmountFormatStyle.SHORT=2]="SHORT"}(AmountFormatStyle||(AmountFormatStyle={}));__webpack_require__("../../node_modules/lodash/round.js");__webpack_require__("./src/utils/forwardRef.tsx");const range=(start,end)=>{const length=end-start+1;return Array.from({length},((_,idx)=>start+idx))},getPaginationItems=options=>{const{boundaryCount=1,count=1,page=1,siblingCount=1}=options,startPages=range(1,Math.min(boundaryCount,count)),endPages=range(Math.max(count-boundaryCount+1,boundaryCount+1),count),siblingsStart=Math.max(Math.min(page-siblingCount,count-boundaryCount-2*siblingCount-1),boundaryCount+2),siblingsEnd=Math.min(Math.max(page+siblingCount,boundaryCount+2*siblingCount+2),endPages.length>0?endPages[0]-2:count-1);return[...startPages,...siblingsStart>boundaryCount+2?["start-ellipsis"]:boundaryCount+1<count-boundaryCount?[boundaryCount+1]:[],...range(siblingsStart,siblingsEnd),...siblingsEnd<count-boundaryCount-1?["end-ellipsis"]:count-boundaryCount>boundaryCount?[count-boundaryCount]:[],...endPages].filter((val=>"number"!=typeof val||val>0))};var getRoundedAmountString=__webpack_require__("./src/utils/getRoundedAmountString.ts"),isScientificNotation_console=__webpack_require__("../../node_modules/console-browserify/index.js");const utils_isScientificNotation=function isScientificNotation(value){const stringValue=value.toString();return stringValue.length>1e3?(isScientificNotation_console.error("isScientificNotation: value is too long"),!1):/^[+-]?\d+(\.\d+)?e[+-]?\d+$/i.test(stringValue)};var isAddress=__webpack_require__("../../node_modules/@polkadot/util-crypto/ethereum/isAddress.js"),is=__webpack_require__("../../node_modules/@polkadot/util-crypto/address/is.js");const isSubstrateAddress_isSubstrateAddress=address=>!(0,isAddress.q)(address)&&(0,is.P)(address);__webpack_require__("./src/constants/index.ts");var shortenHex=__webpack_require__("./src/utils/shortenHex.ts"),shortenString=__webpack_require__("./src/utils/shortenString.ts");var numberToString=__webpack_require__("./src/utils/numberToString.ts");const utils_toFixed=function toFixed(value,fractionDigits=2){const valueStr=utils_isScientificNotation(value)?(0,numberToString.A)(value):`${value}`,regex=new RegExp(`^-?\\d+(?:\\.\\d{0,${fractionDigits}})?`),matched=valueStr.match(regex);return matched&&null!=matched[0]?parseFloat(matched[0]):value}},"./src/utils/numberToString.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{A:()=>__WEBPACK_DEFAULT_EXPORT__});const __WEBPACK_DEFAULT_EXPORT__=function numberToString(num){let str=String(num);if(-1!==str.indexOf("e")){const exponent=parseInt(str.split("-")[1],10);str=num.toFixed(exponent)}return str}},"./src/utils/shortenHex.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{f:()=>shortenHex});const shortenHex=(hexStr,chars=4)=>{const hexLower=hexStr.toLowerCase(),isStartWith0x=hexLower.startsWith("0x");let startStr="",endStr="";return isStartWith0x&&hexLower.length<=2*chars+2?hexLower:!isStartWith0x&&hexLower.length<=2*chars?`0x${hexLower}`:(isStartWith0x?(startStr=hexLower.split("").slice(0,chars+2).join(""),endStr=hexLower.split("").slice(-chars).join("")):(startStr=hexLower.split("").slice(0,chars).join(""),endStr=hexLower.split("").slice(-chars).join("")),isStartWith0x?`${startStr}...${endStr}`:`0x${startStr}...${endStr}`)}},"./src/utils/shortenString.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{l:()=>shortenString});const shortenString=(str,chars=4)=>{if(str.length<=2*chars)return str;return`${str.split("").slice(0,chars).join("")}...${str.split("").slice(-chars).join("")}`}}}]);