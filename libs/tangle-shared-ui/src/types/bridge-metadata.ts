/**
 * Local bridge metadata types used by the dApp bridge config.
 *
 * We intentionally keep this in-repo to avoid hard dependency on an external
 * package during CI installs.
 */
export enum EVMTokenBridgeEnum {
  Hyperlane = 'hyperlane',
  Router = 'router',
  None = 'none',
}

export enum EVMTokenEnum {
  WETH = 'WETH',
  USDT = 'USDT',
  USDC = 'USDC',
  AVAIL = 'AVAIL',
  TNT = 'TNT',
}
