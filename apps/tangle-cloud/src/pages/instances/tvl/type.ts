import { BN } from "@polkadot/util";

export interface TvlItem {
  tokenSymbol: string;
  tokenName: string;
  tokenImg: string;
  apy: number;
  tvl: BN | string | null;
  tvlInUSD: number | null;
  liquidity: BN | string | null;
  liquidityInUSD: number | null;
}
