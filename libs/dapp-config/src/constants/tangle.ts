// MAINNET
export const TANGLE_MAINNET_WS_RPC_ENDPOINT = 'wss://rpc.tangle.tools';
export const TANGLE_MAINNET_HTTP_RPC_ENDPOINT = 'https://rpc.tangle.tools';
export const TANGLE_MAINNET_NATIVE_EXPLORER_URL =
  'https://tangle.statescan.io/';
export const TANGLE_MAINNET_EVM_EXPLORER_URL = 'https://explorer.tangle.tools/';

// TESTNET
export const TANGLE_TESTNET_WS_RPC_ENDPOINT = 'wss://testnet-rpc.tangle.tools';
export const TANGLE_TESTNET_HTTP_RPC_ENDPOINT =
  'https://testnet-rpc.tangle.tools';
export const TANGLE_TESTNET_NATIVE_EXPLORER_URL =
  'https://tangle-testnet.statescan.io/';
export const TANGLE_TESTNET_EVM_EXPLORER_URL =
  'https://testnet-explorer.tangle.tools';

// LOCAL
export const TANGLE_LOCAL_WS_RPC_ENDPOINT = 'ws://127.0.0.1:9944';
export const TANGLE_LOCAL_HTTP_RPC_ENDPOINT = 'http://127.0.0.1:9944';
// Note: there is no official explorer for the local dev network, using Polkadot.{js} dashboard
export const TANGLE_LOCAL_NATIVE_EXPLORER_URL = `https://polkadot.js.org/apps/?rpc=${TANGLE_TESTNET_WS_RPC_ENDPOINT}#/explorer`;
