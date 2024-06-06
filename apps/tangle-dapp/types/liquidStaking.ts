import { StaticAssetPath } from '../constants';

export enum LiquidStakingChain {
  Polkadot,
  Phala,
  Moonbeam,
  Astar,
  Manta,
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
