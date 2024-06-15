import { StaticAssetPath } from '.';

export enum LiquidStakingChain {
  Polkadot = 'Polkadot',
  Phala = 'Phala',
  Moonbeam = 'Moonbeam',
  Astar = 'Astar',
  Manta = 'Manta',
  TangleRestakingParachain = 'Tangle Parachain',
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
    [LiquidStakingChain.Polkadot]: LiquidStakingToken.DOT,
    [LiquidStakingChain.Phala]: LiquidStakingToken.PHALA,
    [LiquidStakingChain.Moonbeam]: LiquidStakingToken.GLMR,
    [LiquidStakingChain.Astar]: LiquidStakingToken.ASTAR,
    [LiquidStakingChain.Manta]: LiquidStakingToken.MANTA,
    [LiquidStakingChain.TangleRestakingParachain]: LiquidStakingToken.TNT,
  };

export const LS_TOKEN_TO_CHAIN: Record<LiquidStakingToken, LiquidStakingChain> =
  {
    [LiquidStakingToken.DOT]: LiquidStakingChain.Polkadot,
    [LiquidStakingToken.PHALA]: LiquidStakingChain.Phala,
    [LiquidStakingToken.GLMR]: LiquidStakingChain.Moonbeam,
    [LiquidStakingToken.ASTAR]: LiquidStakingChain.Astar,
    [LiquidStakingToken.MANTA]: LiquidStakingChain.Manta,
    [LiquidStakingToken.TNT]: LiquidStakingChain.TangleRestakingParachain,
  };

export const LS_CHAIN_TO_LOGO: Record<LiquidStakingChain, StaticAssetPath> = {
  [LiquidStakingChain.Polkadot]: StaticAssetPath.LIQUID_STAKING_TOKEN_POLKADOT,
  [LiquidStakingChain.Phala]: StaticAssetPath.LIQUID_STAKING_TOKEN_PHALA,
  [LiquidStakingChain.Moonbeam]: StaticAssetPath.LIQUID_STAKING_TOKEN_GLIMMER,
  [LiquidStakingChain.Astar]: StaticAssetPath.LIQUID_STAKING_TOKEN_ASTAR,
  [LiquidStakingChain.Manta]: StaticAssetPath.LIQUID_STAKING_TOKEN_MANTA,
  [LiquidStakingChain.TangleRestakingParachain]:
    StaticAssetPath.LIQUID_STAKING_TANGLE_LOGO,
};

// TODO: Instead of mapping to names, map to network/chain definitions themselves. This avoids redundancy and relies on a centralized definition for the network/chain which is better, since it simplifies future refactoring.
export const LS_CHAIN_TO_NETWORK_NAME: Record<LiquidStakingChain, string> = {
  [LiquidStakingChain.Polkadot]: 'Polkadot Mainnet',
  [LiquidStakingChain.Phala]: 'Phala',
  [LiquidStakingChain.Moonbeam]: 'Moonbeam',
  [LiquidStakingChain.Astar]: 'Astar',
  [LiquidStakingChain.Manta]: 'Manta',
  [LiquidStakingChain.TangleRestakingParachain]: 'Tangle Parachain',
};

export const TVS_TOOLTIP =
  "Total Value Staked (TVS) refers to the total value of assets that are currently staked for this network in fiat currency. Generally used as an indicator of a network's security and trustworthiness.";

export const LIQUID_STAKING_TOKEN_PREFIX = 'tg';
