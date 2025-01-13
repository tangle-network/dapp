"use strict";(self.webpackChunk_webb_tools_webb_ui_components=self.webpackChunk_webb_tools_webb_ui_components||[]).push([[2241],{"../dapp-types/src/ChainId.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z5:()=>src_EVMChainId,OV:()=>PresetTypedChainId,lJ:()=>src_SolanaChainId,YJ:()=>src_SubstrateChainId});var EVMChainId,TypedChainId=__webpack_require__("../dapp-types/src/TypedChainId.ts");!function(EVMChainId){EVMChainId[EVMChainId.EthereumMainNet=1]="EthereumMainNet",EVMChainId[EVMChainId.Goerli=5]="Goerli",EVMChainId[EVMChainId.Sepolia=11155111]="Sepolia",EVMChainId[EVMChainId.Holesky=17e3]="Holesky",EVMChainId[EVMChainId.Ganache=1337]="Ganache",EVMChainId[EVMChainId.Edgeware=2021]="Edgeware",EVMChainId[EVMChainId.HarmonyTestnet0=16667e5]="HarmonyTestnet0",EVMChainId[EVMChainId.HarmonyTestnet1=1666700001]="HarmonyTestnet1",EVMChainId[EVMChainId.Shiden=336]="Shiden",EVMChainId[EVMChainId.OptimismTestnet=420]="OptimismTestnet",EVMChainId[EVMChainId.ArbitrumTestnet=421613]="ArbitrumTestnet",EVMChainId[EVMChainId.PolygonTestnet=80001]="PolygonTestnet",EVMChainId[EVMChainId.MoonbaseAlpha=1287]="MoonbaseAlpha",EVMChainId[EVMChainId.AvalancheFuji=43113]="AvalancheFuji",EVMChainId[EVMChainId.ScrollSepolia=534351]="ScrollSepolia",EVMChainId[EVMChainId.Polygon=137]="Polygon",EVMChainId[EVMChainId.Arbitrum=42161]="Arbitrum",EVMChainId[EVMChainId.Optimism=10]="Optimism",EVMChainId[EVMChainId.Linea=59144]="Linea",EVMChainId[EVMChainId.Base=8453]="Base",EVMChainId[EVMChainId.BSC=56]="BSC",EVMChainId[EVMChainId.TangleLocalEVM=3287]="TangleLocalEVM",EVMChainId[EVMChainId.TangleTestnetEVM=3799]="TangleTestnetEVM",EVMChainId[EVMChainId.TangleMainnetEVM=5845]="TangleMainnetEVM",EVMChainId[EVMChainId.HermesLocalnet=3884533462]="HermesLocalnet",EVMChainId[EVMChainId.AthenaLocalnet=3884533461]="AthenaLocalnet",EVMChainId[EVMChainId.DemeterLocalnet=3884533463]="DemeterLocalnet"}(EVMChainId||(EVMChainId={}));const src_EVMChainId=EVMChainId;var SubstrateChainId;!function(SubstrateChainId){SubstrateChainId[SubstrateChainId.Edgeware=7]="Edgeware",SubstrateChainId[SubstrateChainId.TangleLocalNative=3287]="TangleLocalNative",SubstrateChainId[SubstrateChainId.TangleTestnetNative=3799]="TangleTestnetNative",SubstrateChainId[SubstrateChainId.TangleMainnetNative=5845]="TangleMainnetNative",SubstrateChainId[SubstrateChainId.Kusama=2]="Kusama",SubstrateChainId[SubstrateChainId.Polkadot=0]="Polkadot",SubstrateChainId[SubstrateChainId.RococoPhala=5231]="RococoPhala"}(SubstrateChainId||(SubstrateChainId={}));const src_SubstrateChainId=SubstrateChainId;var SolanaChainId;!function(SolanaChainId){SolanaChainId[SolanaChainId.SolanaMainnet=101]="SolanaMainnet"}(SolanaChainId||(SolanaChainId={}));const src_SolanaChainId=SolanaChainId;var PresetTypedChainId;!function(PresetTypedChainId){PresetTypedChainId[PresetTypedChainId.EthereumMainNet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.EthereumMainNet)]="EthereumMainNet",PresetTypedChainId[PresetTypedChainId.Goerli=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Goerli)]="Goerli",PresetTypedChainId[PresetTypedChainId.Sepolia=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Sepolia)]="Sepolia",PresetTypedChainId[PresetTypedChainId.Holesky=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Holesky)]="Holesky",PresetTypedChainId[PresetTypedChainId.HarmonyTestnet1=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.HarmonyTestnet1)]="HarmonyTestnet1",PresetTypedChainId[PresetTypedChainId.HarmonyTestnet0=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.HarmonyTestnet0)]="HarmonyTestnet0",PresetTypedChainId[PresetTypedChainId.Ganache=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Ganache)]="Ganache",PresetTypedChainId[PresetTypedChainId.Shiden=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Shiden)]="Shiden",PresetTypedChainId[PresetTypedChainId.OptimismTestnet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.OptimismTestnet)]="OptimismTestnet",PresetTypedChainId[PresetTypedChainId.ArbitrumTestnet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.ArbitrumTestnet)]="ArbitrumTestnet",PresetTypedChainId[PresetTypedChainId.PolygonTestnet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.PolygonTestnet)]="PolygonTestnet",PresetTypedChainId[PresetTypedChainId.TangleMainnetNative=(0,TypedChainId.lh)(TypedChainId.IG.Substrate,src_SubstrateChainId.TangleMainnetNative)]="TangleMainnetNative",PresetTypedChainId[PresetTypedChainId.TangleTestnetNative=(0,TypedChainId.lh)(TypedChainId.IG.Substrate,src_SubstrateChainId.TangleTestnetNative)]="TangleTestnetNative",PresetTypedChainId[PresetTypedChainId.TangleLocalNative=(0,TypedChainId.lh)(TypedChainId.IG.Substrate,src_SubstrateChainId.TangleLocalNative)]="TangleLocalNative",PresetTypedChainId[PresetTypedChainId.Kusama=(0,TypedChainId.lh)(TypedChainId.IG.KusamaRelayChain,src_SubstrateChainId.Kusama)]="Kusama",PresetTypedChainId[PresetTypedChainId.Polkadot=(0,TypedChainId.lh)(TypedChainId.IG.PolkadotRelayChain,src_SubstrateChainId.Polkadot)]="Polkadot",PresetTypedChainId[PresetTypedChainId.RococoPhala=(0,TypedChainId.lh)(TypedChainId.IG.Substrate,src_SubstrateChainId.RococoPhala)]="RococoPhala",PresetTypedChainId[PresetTypedChainId.MoonbaseAlpha=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.MoonbaseAlpha)]="MoonbaseAlpha",PresetTypedChainId[PresetTypedChainId.AvalancheFuji=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.AvalancheFuji)]="AvalancheFuji",PresetTypedChainId[PresetTypedChainId.ScrollSepolia=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.ScrollSepolia)]="ScrollSepolia",PresetTypedChainId[PresetTypedChainId.Polygon=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Polygon)]="Polygon",PresetTypedChainId[PresetTypedChainId.Arbitrum=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Arbitrum)]="Arbitrum",PresetTypedChainId[PresetTypedChainId.Optimism=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Optimism)]="Optimism",PresetTypedChainId[PresetTypedChainId.Linea=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Linea)]="Linea",PresetTypedChainId[PresetTypedChainId.Base=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.Base)]="Base",PresetTypedChainId[PresetTypedChainId.BSC=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.BSC)]="BSC",PresetTypedChainId[PresetTypedChainId.HermesLocalnet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.HermesLocalnet)]="HermesLocalnet",PresetTypedChainId[PresetTypedChainId.AthenaLocalnet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.AthenaLocalnet)]="AthenaLocalnet",PresetTypedChainId[PresetTypedChainId.DemeterLocalnet=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.DemeterLocalnet)]="DemeterLocalnet",PresetTypedChainId[PresetTypedChainId.TangleLocalEVM=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.TangleLocalEVM)]="TangleLocalEVM",PresetTypedChainId[PresetTypedChainId.TangleTestnetEVM=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.TangleTestnetEVM)]="TangleTestnetEVM",PresetTypedChainId[PresetTypedChainId.TangleMainnetEVM=(0,TypedChainId.lh)(TypedChainId.IG.EVM,src_EVMChainId.TangleMainnetEVM)]="TangleMainnetEVM",PresetTypedChainId[PresetTypedChainId.SolanaMainnet=(0,TypedChainId.lh)(TypedChainId.IG.Solana,src_SolanaChainId.SolanaMainnet)]="SolanaMainnet"}(PresetTypedChainId||(PresetTypedChainId={}))},"../dapp-types/src/EventBus.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{l:()=>EventBus});class EventBus{on(event,cb){const listeners=this.subscriptions[event];var _this_subscriptions,_this_subscriptions_event;listeners&&-1!==listeners.indexOf(cb)||(this.subscriptions[event]=[...null!==(_this_subscriptions_event=null===(_this_subscriptions=this.subscriptions)||void 0===_this_subscriptions?void 0:_this_subscriptions[event])&&void 0!==_this_subscriptions_event?_this_subscriptions_event:[],cb]);return()=>this.off(event,cb)}emit(event,data){var _this_subscriptions_event;null===(_this_subscriptions_event=this.subscriptions[event])||void 0===_this_subscriptions_event||_this_subscriptions_event.forEach((cb=>cb(data)))}off(event,cb){const listeners=this.subscriptions[event];var _listeners_filter;this.subscriptions[event]=null!==(_listeners_filter=null==listeners?void 0:listeners.filter((c=>c!==cb)))&&void 0!==_listeners_filter?_listeners_filter:[]}once(event,cb){var _this_subscriptions;const hookedCb=val=>{cb(val),this.off(event,hookedCb)};var _this_subscriptions_event;return this.subscriptions[event]=[...null!==(_this_subscriptions_event=null===(_this_subscriptions=this.subscriptions)||void 0===_this_subscriptions?void 0:_this_subscriptions[event])&&void 0!==_this_subscriptions_event?_this_subscriptions_event:[],hookedCb],()=>this.off(event,hookedCb)}unsubscribeAll(){this.subscriptions={}}unsubscribeAllForEvent(event){this.subscriptions[event]=[]}constructor(){this.sendEvent=void 0,this.subscriptions={}}}},"../dapp-types/src/TypedChainId.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{var ChainType;__webpack_require__.d(__webpack_exports__,{IG:()=>ChainType,lh:()=>calculateTypedChainId}),function(ChainType){ChainType[ChainType.None=0]="None",ChainType[ChainType.EVM=256]="EVM",ChainType[ChainType.Substrate=512]="Substrate",ChainType[ChainType.SubstrateDevelopment=592]="SubstrateDevelopment",ChainType[ChainType.PolkadotRelayChain=769]="PolkadotRelayChain",ChainType[ChainType.KusamaRelayChain=770]="KusamaRelayChain",ChainType[ChainType.PolkadotParachain=784]="PolkadotParachain",ChainType[ChainType.KusamaParachain=785]="KusamaParachain",ChainType[ChainType.Cosmos=1024]="Cosmos",ChainType[ChainType.Solana=1280]="Solana"}(ChainType||(ChainType={}));const numToByteArray=(num,min)=>{let arr=[];for(;num>0;)arr.push(num%256),num=Math.floor(num/256);for(arr.reverse();arr.length<min;)arr=[0,...arr];return arr},byteArrayToNum=arr=>{let n=0;for(const i of arr)n=256*n+i;return n};const calculateTypedChainId=(chainType,chainId)=>{const fullArray=[...numToByteArray(chainType,2),...numToByteArray(chainId,4)];return byteArrayToNum(fullArray)}},"../dapp-types/src/WalletId.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{var WalletId;__webpack_require__.d(__webpack_exports__,{v:()=>WalletId}),function(WalletId){WalletId[WalletId.Polkadot=1]="Polkadot",WalletId[WalletId.MetaMask=2]="MetaMask",WalletId[WalletId.WalletConnectV2=3]="WalletConnectV2",WalletId[WalletId.Rainbow=4]="Rainbow",WalletId[WalletId.OneWallet=5]="OneWallet",WalletId[WalletId.Talisman=6]="Talisman",WalletId[WalletId.SubWallet=7]="SubWallet"}(WalletId||(WalletId={}))},"../dapp-types/src/WebbError.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{var WebbErrorCodes;__webpack_require__.d(__webpack_exports__,{F:()=>WebbError,j:()=>WebbErrorCodes}),function(WebbErrorCodes){WebbErrorCodes[WebbErrorCodes.ApiNotReady=0]="ApiNotReady",WebbErrorCodes[WebbErrorCodes.NoCurrencyAvailable=1]="NoCurrencyAvailable",WebbErrorCodes[WebbErrorCodes.NoFungibleTokenAvailable=2]="NoFungibleTokenAvailable",WebbErrorCodes[WebbErrorCodes.NoWrappableTokenAvailable=3]="NoWrappableTokenAvailable",WebbErrorCodes[WebbErrorCodes.NoSignRaw=4]="NoSignRaw",WebbErrorCodes[WebbErrorCodes.UnsupportedProvider=5]="UnsupportedProvider",WebbErrorCodes[WebbErrorCodes.UnsupportedChain=6]="UnsupportedChain",WebbErrorCodes[WebbErrorCodes.UnsupportedWallet=7]="UnsupportedWallet",WebbErrorCodes[WebbErrorCodes.UnselectedChain=8]="UnselectedChain",WebbErrorCodes[WebbErrorCodes.UnsupportedBrowser=9]="UnsupportedBrowser",WebbErrorCodes[WebbErrorCodes.NoAccountAvailable=10]="NoAccountAvailable",WebbErrorCodes[WebbErrorCodes.NoActiveBridge=11]="NoActiveBridge",WebbErrorCodes[WebbErrorCodes.NoEndpointsConfigured=12]="NoEndpointsConfigured",WebbErrorCodes[WebbErrorCodes.NoClaimsPalletFound=13]="NoClaimsPalletFound",WebbErrorCodes[WebbErrorCodes.NoClientAvailable=14]="NoClientAvailable",WebbErrorCodes[WebbErrorCodes.NoSwitchChainMethod=15]="NoSwitchChainMethod",WebbErrorCodes[WebbErrorCodes.NoteParsingFailure=16]="NoteParsingFailure",WebbErrorCodes[WebbErrorCodes.PolkadotJSExtensionNotInstalled=17]="PolkadotJSExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.TalismanExtensionNotInstalled=18]="TalismanExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.SubWalletExtensionNotInstalled=19]="SubWalletExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.MetaMaskExtensionNotInstalled=20]="MetaMaskExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.RainbowExtensionNotInstalled=21]="RainbowExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.UnknownWallet=22]="UnknownWallet",WebbErrorCodes[WebbErrorCodes.InsufficientProviderInterface=23]="InsufficientProviderInterface",WebbErrorCodes[WebbErrorCodes.EVMSessionAlreadyEnded=24]="EVMSessionAlreadyEnded",WebbErrorCodes[WebbErrorCodes.ChainIdTypeUnformatted=25]="ChainIdTypeUnformatted",WebbErrorCodes[WebbErrorCodes.AmountToWithdrawExceedsTheDepositedAmount=26]="AmountToWithdrawExceedsTheDepositedAmount",WebbErrorCodes[WebbErrorCodes.TransactionCancelled=27]="TransactionCancelled",WebbErrorCodes[WebbErrorCodes.TransactionInProgress=28]="TransactionInProgress",WebbErrorCodes[WebbErrorCodes.NotImplemented=29]="NotImplemented",WebbErrorCodes[WebbErrorCodes.AnchorIdNotFound=30]="AnchorIdNotFound",WebbErrorCodes[WebbErrorCodes.InsufficientDiskSpace=31]="InsufficientDiskSpace",WebbErrorCodes[WebbErrorCodes.InvalidArguments=32]="InvalidArguments",WebbErrorCodes[WebbErrorCodes.NoConnectorConfigured=33]="NoConnectorConfigured",WebbErrorCodes[WebbErrorCodes.CommitmentNotInTree=34]="CommitmentNotInTree",WebbErrorCodes[WebbErrorCodes.SwitchAccountFailed=35]="SwitchAccountFailed",WebbErrorCodes[WebbErrorCodes.SwitchChainFailed=36]="SwitchChainFailed",WebbErrorCodes[WebbErrorCodes.FailedToSendTx=37]="FailedToSendTx",WebbErrorCodes[WebbErrorCodes.FailedToConnectWallet=38]="FailedToConnectWallet",WebbErrorCodes[WebbErrorCodes.FailedToDisconnect=39]="FailedToDisconnect",WebbErrorCodes[WebbErrorCodes.KeyPairNotFound=40]="KeyPairNotFound",WebbErrorCodes[WebbErrorCodes.NotesNotReady=41]="NotesNotReady",WebbErrorCodes[WebbErrorCodes.InvalidAmount=42]="InvalidAmount",WebbErrorCodes[WebbErrorCodes.InvalidEnumValue=43]="InvalidEnumValue",WebbErrorCodes[WebbErrorCodes.UnknownError=44]="UnknownError"}(WebbErrorCodes||(WebbErrorCodes={}));class WebbError extends Error{static from(code){return new WebbError(code)}static getErrorMessage(code){const errorMessage=WebbError.errorMessageMap.get(code);if(errorMessage)return errorMessage;switch(code){case 0:return{code,message:"Api is not ready"};case 2:return{code,message:"No fungible token is available"};case 3:return{code,message:"No wrappable token is available"};case 5:return{code,message:"Unsupported provider"};case 6:return{code,message:"You have switched to unsupported chain"};case 7:return{code,message:"You have selected unsupported wallet"};case 8:return{code,message:"User did not select the chain"};case 9:return{code,message:"Unsupported browser"};case 10:return{code,message:"No account available"};case 4:return{code,message:"No `signRaw` function for this injector"};case 16:return{code,message:"Failed to parse deposit note"};case 17:return{code,message:"PolkadotJS extension not installed"};case 18:return{code,message:"Talisman extension not installed"};case 19:return{code:19,message:"SubWallet extension not installed"};case 20:return{code,message:"MetaMask extension not installed"};case 21:return{code,message:"Rainbow extension not installed"};case 22:return{code:22,message:"Unknown wallet"};case 23:return{code,message:"switched to insufficient api interface"};case 24:return{code,message:"Attempt to end session and it' already ended or unknown error"};case 25:return{code,message:"Parsing of a ChainIdType failed"};case 26:return{code,message:"The amount to withdraw is more than the already deposited amount"};case 27:return{code,message:"Transaction is cancelled"};case 28:return{code,message:"There is a transaction in progress"};case 11:return{code,message:"No active bridge"};case 1:return{code,message:"No currency is available"};case 12:return{code,message:"Missing endpoints in the configuration"};case 13:return{code,message:"No claims pallet found"};case 14:return{code,message:"No client available"};case 15:return{code,message:"No switch chain method found"};case 30:return{code,message:"Not found the anchor identifier"};case 29:return{code,message:"Not implemented"};case 31:return{code,message:"Insufficient disk space, please make sure you have at least 500MB of free space"};case 32:return{code,message:"Invalid arguments"};case 33:return{code,message:"No connector configured for the wallet"};case 34:return{code,message:"Relayer has not yet relayed the commitment to the destination chain"};case 35:return{code,message:"Failed to switch account"};case 36:return{code,message:"Failed to switch chain"};case 37:return{code,message:"Failed to send the transaction"};case 40:return{code,message:"Key pair not found"};case 41:return{code,message:"Some of the notes are not ready, maybe waiting for 5-20 minutes and try again"};case 42:return{code,message:"Invalid amount"};case 38:return{code,message:"Failed to connect wallet"};case 39:return{code,message:"Failed to disconnect"};case 43:return{code,message:"Invalid or unhandled enum value"};default:return{code,message:"Unknown error"}}}toString(){return this.message}constructor(code){super(WebbError.getErrorMessage(code).message),this.code=code,this.errorMessage=WebbError.getErrorMessage(code)}}WebbError.errorMessageMap=new Map},"../dapp-types/src/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{OV:()=>ChainId.OV,lJ:()=>ChainId.lJ,YJ:()=>ChainId.YJ});var CurrencyType,CurrencyRole,ChainId=__webpack_require__("../dapp-types/src/ChainId.ts");!function(CurrencyType){CurrencyType[CurrencyType.ERC20=0]="ERC20",CurrencyType[CurrencyType.NATIVE=1]="NATIVE",CurrencyType[CurrencyType.ORML=2]="ORML"}(CurrencyType||(CurrencyType={})),function(CurrencyRole){CurrencyRole[CurrencyRole.Wrappable=0]="Wrappable",CurrencyRole[CurrencyRole.Governable=1]="Governable"}(CurrencyRole||(CurrencyRole={}));var esm_extends=__webpack_require__("../../node_modules/next/dist/compiled/@babel/runtime/helpers/esm/extends.js"),EventBus=__webpack_require__("../dapp-types/src/EventBus.ts");class Storage extends EventBus.l{static get(key){return Storage.instances.get(key)}static async newFresh(name,handler){const instance=new Storage(name,handler);return Storage.instances.set(name,instance),await instance.commit(name,handler.inner),instance}static async newFromCache(name,data){const storage=await data.fetch(name),instance=new Storage(name,(0,esm_extends.A)({},data,{inner:storage}));return Storage.instances.set(name,instance),instance}async get(key){return this.data[key]}async dump(){return this.data}async reset(data){this.data=data,await this.commit(this.name,this.data),this.emit("update",this.data)}async set(key,data){this.data=(0,esm_extends.A)({},this.data,{[key]:data}),await this.commit(this.name,this.data),this.emit("update",this.data)}constructor(name,data){super(),this.name=name,this.data=data.inner,this.fetch=data.fetch,this.commit=data.commit}}Storage.instances=new Map;__webpack_require__("../dapp-types/src/WalletId.ts"),__webpack_require__("../dapp-types/src/WebbError.ts")}}]);