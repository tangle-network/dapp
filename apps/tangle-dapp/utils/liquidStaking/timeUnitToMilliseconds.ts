import {
  LS_CHAIN_MAP,
  LsChainId,
  LsSimpleParachainTimeUnit,
} from '../../constants/liquidStaking';

const estimateByEra = (chainId: LsChainId, era: number): number => {
  const chain = LS_CHAIN_MAP[chainId];

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
  chainId: LsChainId,
  timeUnitInstance: LsSimpleParachainTimeUnit,
): number => {
  switch (timeUnitInstance.unit) {
    // A conventional hour.
    case 'Hour': {
      return timeUnitInstance.value * 60 * 60 * 1000;
    }
    // The duration of an era is chain-specific, so the timing spec
    // is required.
    case 'Era': {
      return estimateByEra(chainId, timeUnitInstance.value);
    }
    default: {
      // TODO: Add support for the remaining time unit types.
      throw new Error(
        `Time unit type not yet supported: ${timeUnitInstance.unit}`,
      );
    }
  }
};

export default timeUnitToMilliseconds;
