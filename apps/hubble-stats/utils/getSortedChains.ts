import { chainsConfig } from '@webb-tools/dapp-config/chains';

/**
 * A function to sort chains by name
 * @param chainIds
 * @returns sorted chain ids
 */
const getSortedChains = (chainIds: number[]) => {
  return chainIds.sort((chain1, chain2) =>
    chainsConfig[chain1].name.localeCompare(chainsConfig[chain2].name)
  );
};

export default getSortedChains;
