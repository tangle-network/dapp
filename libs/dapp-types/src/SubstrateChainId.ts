// Enums for network IDs / SS58 encodings for Substrate chains
export enum SubstrateChainId {
  Edgeware = 7,
  ProtocolSubstrateStandalone = 1080,
  LocalTangleStandalone = 1081, // Local Tangle Standalone
  TangleStandaloneTestnet = 1081, // Live Tangle Standalone Testnet
  Kusama = 2,
  Polkadot = 0,
}

export default SubstrateChainId;
