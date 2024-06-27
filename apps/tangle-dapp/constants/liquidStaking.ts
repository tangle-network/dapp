import { TanglePrimitivesCurrencyTokenSymbol } from '@polkadot/types/lookup';

import { StaticAssetPath } from '.';

export enum LiquidStakingChain {
  POLKADOT = 'Polkadot',
  PHALA = 'Phala',
  MOONBEAM = 'Moonbeam',
  ASTAR = 'Astar',
  MANTA = 'Manta',
  TANGLE_RESTAKING_PARACHAIN = 'Tangle Parachain',
}

export enum LiquidStakingToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTAR',
  PHALA = 'PHALA',
  TNT = 'TNT',
}

export const LS_CHAIN_TO_TOKEN: Record<LiquidStakingChain, LiquidStakingToken> =
  {
    [LiquidStakingChain.POLKADOT]: LiquidStakingToken.DOT,
    [LiquidStakingChain.PHALA]: LiquidStakingToken.PHALA,
    [LiquidStakingChain.MOONBEAM]: LiquidStakingToken.GLMR,
    [LiquidStakingChain.ASTAR]: LiquidStakingToken.ASTAR,
    [LiquidStakingChain.MANTA]: LiquidStakingToken.MANTA,
    [LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN]: LiquidStakingToken.TNT,
  };

export const LS_TOKEN_TO_CHAIN: Record<LiquidStakingToken, LiquidStakingChain> =
  {
    [LiquidStakingToken.DOT]: LiquidStakingChain.POLKADOT,
    [LiquidStakingToken.PHALA]: LiquidStakingChain.PHALA,
    [LiquidStakingToken.GLMR]: LiquidStakingChain.MOONBEAM,
    [LiquidStakingToken.ASTAR]: LiquidStakingChain.ASTAR,
    [LiquidStakingToken.MANTA]: LiquidStakingChain.MANTA,
    [LiquidStakingToken.TNT]: LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN,
  };

export const LS_CHAIN_TO_LOGO: Record<LiquidStakingChain, StaticAssetPath> = {
  [LiquidStakingChain.POLKADOT]: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  [LiquidStakingChain.PHALA]: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  [LiquidStakingChain.MOONBEAM]: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  [LiquidStakingChain.ASTAR]: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  [LiquidStakingChain.MANTA]: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  [LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN]:
    StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
};

// TODO: Instead of mapping to names, map to network/chain definitions themselves. This avoids redundancy and relies on a centralized definition for the network/chain which is better, since it simplifies future refactoring.
export const LS_CHAIN_TO_NETWORK_NAME: Record<LiquidStakingChain, string> = {
  [LiquidStakingChain.POLKADOT]: 'Polkadot Mainnet',
  [LiquidStakingChain.PHALA]: 'Phala',
  [LiquidStakingChain.MOONBEAM]: 'Moonbeam',
  [LiquidStakingChain.ASTAR]: 'Astar',
  [LiquidStakingChain.MANTA]: 'Manta',
  [LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN]: 'Tangle Parachain',
};

export const LS_TOKEN_TO_CURRENCY: Record<
  LiquidStakingToken,
  TanglePrimitivesCurrencyTokenSymbol['type']
> = {
  [LiquidStakingToken.DOT]: 'Dot',
  [LiquidStakingToken.PHALA]: 'Pha',
  // TODO: No currency entry for GLMR in the Tangle Primitives?
  [LiquidStakingToken.GLMR]: 'Dot',
  // TODO: No currency entry for ASTAR in the Tangle Primitives?
  [LiquidStakingToken.ASTAR]: 'Dot',
  // TODO: No currency entry for MANTA in the Tangle Primitives?
  [LiquidStakingToken.MANTA]: 'Dot',
  // TODO: This is temporary until the Tangle Primitives are updated with the correct currency token symbol for TNT.
  [LiquidStakingToken.TNT]: 'Bnc',
};

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LIQUID_STAKING_TOKEN_PREFIX = 'tg';

export const LS_CHAIN_TO_LOCAL_RPC_ENDPOINT: Record<
  LiquidStakingChain,
  string
> = {
  [LiquidStakingChain.POLKADOT]: 'ws://127.0.0.1:30334',
  [LiquidStakingChain.PHALA]: '',
  [LiquidStakingChain.MOONBEAM]: '',
  [LiquidStakingChain.ASTAR]: '',
  [LiquidStakingChain.MANTA]: '',
  [LiquidStakingChain.TANGLE_RESTAKING_PARACHAIN]: 'ws://127.0.0.1:59408',
};
