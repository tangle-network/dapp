"use strict";(self.webpackChunkwebb_monorepo=self.webpackChunkwebb_monorepo||[]).push([[1704],{"./libs/dapp-types/src/ChainId.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{Z5:()=>src_EVMChainId,OV:()=>PresetTypedChainId,YJ:()=>src_SubstrateChainId});var EVMChainId,typed_chain_id=__webpack_require__("./node_modules/@webb-tools/sdk-core/typed-chain-id.js");!function(EVMChainId){EVMChainId[EVMChainId.EthereumMainNet=1]="EthereumMainNet",EVMChainId[EVMChainId.Goerli=5]="Goerli",EVMChainId[EVMChainId.Sepolia=11155111]="Sepolia",EVMChainId[EVMChainId.Ganache=1337]="Ganache",EVMChainId[EVMChainId.Edgeware=2021]="Edgeware",EVMChainId[EVMChainId.HarmonyTestnet0=16667e5]="HarmonyTestnet0",EVMChainId[EVMChainId.HarmonyTestnet1=1666700001]="HarmonyTestnet1",EVMChainId[EVMChainId.Shiden=336]="Shiden",EVMChainId[EVMChainId.OptimismTestnet=420]="OptimismTestnet",EVMChainId[EVMChainId.ArbitrumTestnet=421613]="ArbitrumTestnet",EVMChainId[EVMChainId.PolygonTestnet=80001]="PolygonTestnet",EVMChainId[EVMChainId.MoonbaseAlpha=1287]="MoonbaseAlpha",EVMChainId[EVMChainId.AvalancheFuji=43113]="AvalancheFuji",EVMChainId[EVMChainId.ScrollSepolia=534351]="ScrollSepolia",EVMChainId[EVMChainId.TangleLocalEVM=3287]="TangleLocalEVM",EVMChainId[EVMChainId.TangleTestnetEVM=3799]="TangleTestnetEVM",EVMChainId[EVMChainId.TangleMainnetEVM=5845]="TangleMainnetEVM",EVMChainId[EVMChainId.HermesLocalnet=3884533462]="HermesLocalnet",EVMChainId[EVMChainId.AthenaLocalnet=3884533461]="AthenaLocalnet",EVMChainId[EVMChainId.DemeterLocalnet=3884533463]="DemeterLocalnet"}(EVMChainId||(EVMChainId={}));const src_EVMChainId=EVMChainId;var SubstrateChainId;!function(SubstrateChainId){SubstrateChainId[SubstrateChainId.Edgeware=7]="Edgeware",SubstrateChainId[SubstrateChainId.TangleLocalNative=3287]="TangleLocalNative",SubstrateChainId[SubstrateChainId.TangleTestnetNative=3799]="TangleTestnetNative",SubstrateChainId[SubstrateChainId.TangleMainnetNative=5845]="TangleMainnetNative",SubstrateChainId[SubstrateChainId.Kusama=2]="Kusama",SubstrateChainId[SubstrateChainId.Polkadot=0]="Polkadot",SubstrateChainId[SubstrateChainId.RococoPhala=5231]="RococoPhala"}(SubstrateChainId||(SubstrateChainId={}));const src_SubstrateChainId=SubstrateChainId;var PresetTypedChainId;!function(PresetTypedChainId){PresetTypedChainId[PresetTypedChainId.EthereumMainNet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.EthereumMainNet)]="EthereumMainNet",PresetTypedChainId[PresetTypedChainId.Goerli=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.Goerli)]="Goerli",PresetTypedChainId[PresetTypedChainId.Sepolia=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.Sepolia)]="Sepolia",PresetTypedChainId[PresetTypedChainId.HarmonyTestnet1=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.HarmonyTestnet1)]="HarmonyTestnet1",PresetTypedChainId[PresetTypedChainId.HarmonyTestnet0=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.HarmonyTestnet0)]="HarmonyTestnet0",PresetTypedChainId[PresetTypedChainId.Ganache=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.Ganache)]="Ganache",PresetTypedChainId[PresetTypedChainId.Shiden=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.Shiden)]="Shiden",PresetTypedChainId[PresetTypedChainId.OptimismTestnet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.OptimismTestnet)]="OptimismTestnet",PresetTypedChainId[PresetTypedChainId.ArbitrumTestnet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.ArbitrumTestnet)]="ArbitrumTestnet",PresetTypedChainId[PresetTypedChainId.PolygonTestnet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.PolygonTestnet)]="PolygonTestnet",PresetTypedChainId[PresetTypedChainId.TangleMainnetNative=(0,typed_chain_id.lh)(typed_chain_id.IG.Substrate,src_SubstrateChainId.TangleMainnetNative)]="TangleMainnetNative",PresetTypedChainId[PresetTypedChainId.TangleTestnetNative=(0,typed_chain_id.lh)(typed_chain_id.IG.Substrate,src_SubstrateChainId.TangleTestnetNative)]="TangleTestnetNative",PresetTypedChainId[PresetTypedChainId.TangleLocalNative=(0,typed_chain_id.lh)(typed_chain_id.IG.Substrate,src_SubstrateChainId.TangleLocalNative)]="TangleLocalNative",PresetTypedChainId[PresetTypedChainId.Kusama=(0,typed_chain_id.lh)(typed_chain_id.IG.KusamaRelayChain,src_SubstrateChainId.Kusama)]="Kusama",PresetTypedChainId[PresetTypedChainId.Polkadot=(0,typed_chain_id.lh)(typed_chain_id.IG.PolkadotRelayChain,src_SubstrateChainId.Polkadot)]="Polkadot",PresetTypedChainId[PresetTypedChainId.RococoPhala=(0,typed_chain_id.lh)(typed_chain_id.IG.Substrate,src_SubstrateChainId.RococoPhala)]="RococoPhala",PresetTypedChainId[PresetTypedChainId.MoonbaseAlpha=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.MoonbaseAlpha)]="MoonbaseAlpha",PresetTypedChainId[PresetTypedChainId.AvalancheFuji=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.AvalancheFuji)]="AvalancheFuji",PresetTypedChainId[PresetTypedChainId.ScrollSepolia=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.ScrollSepolia)]="ScrollSepolia",PresetTypedChainId[PresetTypedChainId.HermesLocalnet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.HermesLocalnet)]="HermesLocalnet",PresetTypedChainId[PresetTypedChainId.AthenaLocalnet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.AthenaLocalnet)]="AthenaLocalnet",PresetTypedChainId[PresetTypedChainId.DemeterLocalnet=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.DemeterLocalnet)]="DemeterLocalnet",PresetTypedChainId[PresetTypedChainId.TangleLocalEVM=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.TangleLocalEVM)]="TangleLocalEVM",PresetTypedChainId[PresetTypedChainId.TangleTestnetEVM=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.TangleTestnetEVM)]="TangleTestnetEVM",PresetTypedChainId[PresetTypedChainId.TangleMainnetEVM=(0,typed_chain_id.lh)(typed_chain_id.IG.EVM,src_EVMChainId.TangleMainnetEVM)]="TangleMainnetEVM"}(PresetTypedChainId||(PresetTypedChainId={}))},"./libs/dapp-types/src/WalletId.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{var WalletId;__webpack_require__.d(__webpack_exports__,{v:()=>WalletId}),function(WalletId){WalletId[WalletId.Polkadot=1]="Polkadot",WalletId[WalletId.MetaMask=2]="MetaMask",WalletId[WalletId.WalletConnectV2=3]="WalletConnectV2",WalletId[WalletId.Rainbow=4]="Rainbow",WalletId[WalletId.OneWallet=5]="OneWallet",WalletId[WalletId.Talisman=6]="Talisman",WalletId[WalletId.SubWallet=7]="SubWallet"}(WalletId||(WalletId={}))},"./libs/dapp-types/src/WebbError.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{F:()=>WebbError,j:()=>WebbErrorCodes});var WebbErrorCodes;__webpack_require__("./node_modules/core-js/modules/es.error.cause.js"),__webpack_require__("./node_modules/core-js/modules/es.array.iterator.js"),__webpack_require__("./node_modules/core-js/modules/web.dom-collections.iterator.js");!function(WebbErrorCodes){WebbErrorCodes[WebbErrorCodes.ApiNotReady=0]="ApiNotReady",WebbErrorCodes[WebbErrorCodes.NoCurrencyAvailable=1]="NoCurrencyAvailable",WebbErrorCodes[WebbErrorCodes.NoFungibleTokenAvailable=2]="NoFungibleTokenAvailable",WebbErrorCodes[WebbErrorCodes.NoWrappableTokenAvailable=3]="NoWrappableTokenAvailable",WebbErrorCodes[WebbErrorCodes.NoSignRaw=4]="NoSignRaw",WebbErrorCodes[WebbErrorCodes.UnsupportedProvider=5]="UnsupportedProvider",WebbErrorCodes[WebbErrorCodes.UnsupportedChain=6]="UnsupportedChain",WebbErrorCodes[WebbErrorCodes.UnsupportedWallet=7]="UnsupportedWallet",WebbErrorCodes[WebbErrorCodes.UnselectedChain=8]="UnselectedChain",WebbErrorCodes[WebbErrorCodes.UnsupportedBrowser=9]="UnsupportedBrowser",WebbErrorCodes[WebbErrorCodes.NoAccountAvailable=10]="NoAccountAvailable",WebbErrorCodes[WebbErrorCodes.NoActiveBridge=11]="NoActiveBridge",WebbErrorCodes[WebbErrorCodes.NoEndpointsConfigured=12]="NoEndpointsConfigured",WebbErrorCodes[WebbErrorCodes.NoClaimsPalletFound=13]="NoClaimsPalletFound",WebbErrorCodes[WebbErrorCodes.NoClientAvailable=14]="NoClientAvailable",WebbErrorCodes[WebbErrorCodes.NoSwitchChainMethod=15]="NoSwitchChainMethod",WebbErrorCodes[WebbErrorCodes.NoteParsingFailure=16]="NoteParsingFailure",WebbErrorCodes[WebbErrorCodes.PolkadotJSExtensionNotInstalled=17]="PolkadotJSExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.TalismanExtensionNotInstalled=18]="TalismanExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.SubWalletExtensionNotInstalled=19]="SubWalletExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.MetaMaskExtensionNotInstalled=20]="MetaMaskExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.RainbowExtensionNotInstalled=21]="RainbowExtensionNotInstalled",WebbErrorCodes[WebbErrorCodes.UnknownWallet=22]="UnknownWallet",WebbErrorCodes[WebbErrorCodes.InsufficientProviderInterface=23]="InsufficientProviderInterface",WebbErrorCodes[WebbErrorCodes.EVMSessionAlreadyEnded=24]="EVMSessionAlreadyEnded",WebbErrorCodes[WebbErrorCodes.NoRelayerSupport=25]="NoRelayerSupport",WebbErrorCodes[WebbErrorCodes.RelayerMisbehaving=26]="RelayerMisbehaving",WebbErrorCodes[WebbErrorCodes.ChainIdTypeUnformatted=27]="ChainIdTypeUnformatted",WebbErrorCodes[WebbErrorCodes.AmountToWithdrawExceedsTheDepositedAmount=28]="AmountToWithdrawExceedsTheDepositedAmount",WebbErrorCodes[WebbErrorCodes.TransactionCancelled=29]="TransactionCancelled",WebbErrorCodes[WebbErrorCodes.TransactionInProgress=30]="TransactionInProgress",WebbErrorCodes[WebbErrorCodes.NotImplemented=31]="NotImplemented",WebbErrorCodes[WebbErrorCodes.AnchorIdNotFound=32]="AnchorIdNotFound",WebbErrorCodes[WebbErrorCodes.InsufficientDiskSpace=33]="InsufficientDiskSpace",WebbErrorCodes[WebbErrorCodes.InvalidArguments=34]="InvalidArguments",WebbErrorCodes[WebbErrorCodes.NoConnectorConfigured=35]="NoConnectorConfigured",WebbErrorCodes[WebbErrorCodes.CommitmentNotInTree=36]="CommitmentNotInTree",WebbErrorCodes[WebbErrorCodes.SwitchAccountFailed=37]="SwitchAccountFailed",WebbErrorCodes[WebbErrorCodes.SwitchChainFailed=38]="SwitchChainFailed",WebbErrorCodes[WebbErrorCodes.FailedToSendTx=39]="FailedToSendTx",WebbErrorCodes[WebbErrorCodes.FailedToConnectWallet=40]="FailedToConnectWallet",WebbErrorCodes[WebbErrorCodes.FailedToDisconnect=41]="FailedToDisconnect",WebbErrorCodes[WebbErrorCodes.KeyPairNotFound=42]="KeyPairNotFound",WebbErrorCodes[WebbErrorCodes.NotesNotReady=43]="NotesNotReady",WebbErrorCodes[WebbErrorCodes.InvalidAmount=44]="InvalidAmount",WebbErrorCodes[WebbErrorCodes.InvalidEnumValue=45]="InvalidEnumValue",WebbErrorCodes[WebbErrorCodes.UnknownError=46]="UnknownError"}(WebbErrorCodes||(WebbErrorCodes={}));class WebbError extends Error{static from(code){return new WebbError(code)}static getErrorMessage(code){const errorMessage=WebbError.errorMessageMap.get(code);if(errorMessage)return errorMessage;switch(code){case 0:return{code,message:"Api is not ready"};case 2:return{code,message:"No fungible token is available"};case 3:return{code,message:"No wrappable token is available"};case 5:return{code,message:"Unsupported provider"};case 6:return{code,message:"You have switched to unsupported chain"};case 7:return{code,message:"You have selected unsupported wallet"};case 8:return{code,message:"User did not select the chain"};case 9:return{code,message:"Unsupported browser"};case 10:return{code,message:"No account available"};case 4:return{code,message:"No `signRaw` function for this injector"};case 16:return{code,message:"Failed to parse deposit note"};case 17:return{code,message:"PolkadotJS extension not installed"};case 18:return{code,message:"Talisman extension not installed"};case 19:return{code:19,message:"SubWallet extension not installed"};case 20:return{code,message:"MetaMask extension not installed"};case 21:return{code,message:"Rainbow extension not installed"};case 22:return{code:22,message:"Unknown wallet"};case 23:return{code,message:"switched to insufficient api interface"};case 24:return{code,message:"Attempt to end session and it' already ended or unknown error"};case 25:return{code,message:"Attempt to use a relayer which does not support the functionality"};case 26:return{code,message:"The selected relayer is not operating properly"};case 27:return{code,message:"Parsing of a ChainIdType failed"};case 28:return{code,message:"The amount to withdraw is more than the already deposited amount"};case 29:return{code,message:"Transaction is cancelled"};case 30:return{code,message:"There is a transaction in progress"};case 11:return{code,message:"No active bridge"};case 1:return{code,message:"No currency is available"};case 12:return{code,message:"Missing endpoints in the configuration"};case 13:return{code,message:"No claims pallet found"};case 14:return{code,message:"No client available"};case 15:return{code,message:"No switch chain method found"};case 32:return{code,message:"Not found the anchor identifier"};case 31:return{code,message:"Not implemented"};case 33:return{code,message:"Insufficient disk space, please make sure you have at least 500MB of free space"};case 34:return{code,message:"Invalid arguments"};case 35:return{code,message:"No connector configured for the wallet"};case 36:return{code,message:"Relayer has not yet relayed the commitment to the destination chain"};case 37:return{code,message:"Failed to switch account"};case 38:return{code,message:"Failed to switch chain"};case 39:return{code,message:"Failed to send the transaction to the relayer"};case 42:return{code,message:"Key pair not found"};case 43:return{code,message:"Some of the notes are not ready, maybe waiting for 5-20 minutes and try again"};case 44:return{code,message:"Invalid amount"};case 40:return{code,message:"Failed to connect wallet"};case 41:return{code,message:"Failed to disconnect"};case 45:return{code,message:"Invalid or unhandled enum value"};default:return{code,message:"Unknown error"}}}toString(){return this.message}constructor(code){super(WebbError.getErrorMessage(code).message),this.code=code,this.errorMessage=WebbError.getErrorMessage(code)}}WebbError.errorMessageMap=new Map},"./libs/dapp-types/src/index.ts":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{OV:()=>ChainId.OV,YJ:()=>ChainId.YJ});var CurrencyType,CurrencyRole,ChainId=__webpack_require__("./libs/dapp-types/src/ChainId.ts");!function(CurrencyType){CurrencyType[CurrencyType.ERC20=0]="ERC20",CurrencyType[CurrencyType.NATIVE=1]="NATIVE",CurrencyType[CurrencyType.ORML=2]="ORML"}(CurrencyType||(CurrencyType={})),function(CurrencyRole){CurrencyRole[CurrencyRole.Wrappable=0]="Wrappable",CurrencyRole[CurrencyRole.Governable=1]="Governable"}(CurrencyRole||(CurrencyRole={}));__webpack_require__("./node_modules/core-js/modules/es.promise.js");var app_util=__webpack_require__("./node_modules/@webb-tools/app-util/index.js");app_util.l7;__webpack_require__("./node_modules/core-js/modules/es.array.iterator.js"),__webpack_require__("./node_modules/core-js/modules/es.object.assign.js"),__webpack_require__("./node_modules/core-js/modules/web.dom-collections.iterator.js");class Storage extends app_util.l7{static get(key){return Storage.instances.get(key)}static async newFresh(name,handler){const instance=new Storage(name,handler);return Storage.instances.set(name,instance),await instance.commit(name,handler.inner),instance}static async newFromCache(name,data){const storage=await data.fetch(name),instance=new Storage(name,Object.assign({},data,{inner:storage}));return Storage.instances.set(name,instance),instance}async get(key){return this.data[key]}async dump(){return this.data}async reset(data){this.data=data,await this.commit(this.name,this.data),this.emit("update",this.data)}async set(key,data){this.data=Object.assign({},this.data,{[key]:data}),await this.commit(this.name,this.data),this.emit("update",this.data)}constructor(name,data){super(),this.name=name,this.data=data.inner,this.fetch=data.fetch,this.commit=data.commit}}Storage.instances=new Map;__webpack_require__("./libs/dapp-types/src/WalletId.ts"),__webpack_require__("./libs/dapp-types/src/WebbError.ts"),__webpack_require__("./node_modules/core-js/modules/es.regexp.exec.js"),__webpack_require__("./node_modules/core-js/modules/es.string.replace.js"),__webpack_require__("./node_modules/core-js/modules/es.string.starts-with.js");__webpack_require__("./node_modules/core-js/modules/web.url.js"),__webpack_require__("./node_modules/core-js/modules/web.url.to-json.js"),__webpack_require__("./node_modules/core-js/modules/web.url-search-params.js"),__webpack_require__("./node_modules/core-js/modules/web.url-search-params.delete.js"),__webpack_require__("./node_modules/core-js/modules/web.url-search-params.has.js"),__webpack_require__("./node_modules/core-js/modules/web.url-search-params.size.js")}}]);