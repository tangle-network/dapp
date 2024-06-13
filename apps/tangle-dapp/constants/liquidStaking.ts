import { StaticAssetPath } from '.';

export enum LiquidStakingChain {
  Polkadot = 'Polkadot',
  Phala = 'Phala',
  Moonbeam = 'Moonbeam',
  Astar = 'Astar',
  Manta = 'Manta',
}

export enum LiquidStakingToken {
  DOT = 'DOT',
  GLMR = 'GLMR',
  MANTA = 'MANTA',
  ASTAR = 'ASTAR',
  PHALA = 'PHALA',
}

export const LiquidStakingChainToTokenMap: Record<
  LiquidStakingChain,
  LiquidStakingToken
> = {
  [LiquidStakingChain.Polkadot]: LiquidStakingToken.DOT,
  [LiquidStakingChain.Phala]: LiquidStakingToken.PHALA,
  [LiquidStakingChain.Moonbeam]: LiquidStakingToken.GLMR,
  [LiquidStakingChain.Astar]: LiquidStakingToken.ASTAR,
  [LiquidStakingChain.Manta]: LiquidStakingToken.MANTA,
};

export const LiquidStakingChainToLogoMap: Record<
  LiquidStakingChain,
  StaticAssetPath
> = {
  [LiquidStakingChain.Polkadot]: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  [LiquidStakingChain.Phala]: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  [LiquidStakingChain.Moonbeam]: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  [LiquidStakingChain.Astar]: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  [LiquidStakingChain.Manta]: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
};

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const TANGLE_LS_PREFIX_TOKEN_SYMBOL = 'tg';
