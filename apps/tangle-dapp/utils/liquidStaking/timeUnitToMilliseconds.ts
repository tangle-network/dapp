import { TanglePrimitivesTimeUnit } from '@polkadot/types/lookup';

import {
  LIQUID_STAKING_CHAIN_MAP,
  LiquidStakingChainId,
} from '../../constants/liquidStaking';

const estimateByEra = (chainId: LiquidStakingChainId, era: number): number => {
  const chain = LIQUID_STAKING_CHAIN_MAP[chainId];

  if (chain.substrateTimingSpec === undefined) {
    throw new Error(
      `Chain ${chain.name} does not have a Substrate timing specification`,
    );
  }

  return (
    chain.substrateTimingSpec.expectedBlockTimeMs *
    chain.substrateTimingSpec.blocksPerSession *
    chain.substrateTimingSpec.sessionsPerEra *
    era
  );
};

const timeUnitToMilliseconds = (
  chainId: LiquidStakingChainId,
  tangleTimeUnit: TanglePrimitivesTimeUnit,
): number => {
  switch (tangleTimeUnit.type) {
    // A conventional hour.
    case 'Hour': {
      return tangleTimeUnit.asHour.toNumber() * 60 * 60 * 1000;
    }
    // The duration of an era is chain-specific, so the timing spec
    // is required.
    case 'Era': {
      return estimateByEra(chainId, tangleTimeUnit.asEra.toNumber());
    }
    default: {
      // TODO: Add support for the remaining time unit types.
      throw new Error(
        `Time unit type not yet supported: ${tangleTimeUnit.type}`,
      );
    }
  }
};

export default timeUnitToMilliseconds;
