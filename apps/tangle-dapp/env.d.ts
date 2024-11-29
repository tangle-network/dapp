/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BRIDGE_DAPP_WALLET_CONNECT_PROJECT_ID: string;
  readonly VITE_TANGLE_DAPP_USE_LOCAL_RPC_ENDPOINT: string;
  readonly VITE_OFAC_REGIONS: string;
  readonly VITE_OFAC_COUNTRY_CODES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
