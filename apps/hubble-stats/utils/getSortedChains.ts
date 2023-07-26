import { chainsConfig } from '@webb-tools/dapp-config/chains';

/**
 * A function to sort chains by name
 * @param chainIds
 * @returns sorted chain ids
 */
const getSortedChains = (chainIds: number[]) => {
  return chainIds.sort((chain1, chain2) => {
    const chain1Group = chainsConfig[chain1].group;
    const chain2Group = chainsConfig[chain2].group;

    // if the chain groups are the same or one of the groups is undefined, sort by name
    if (
      chain1Group === chain2Group ||
      chain1Group === undefined ||
      chain2Group === undefined
    ) {
      return chainsConfig[chain1].name.localeCompare(chainsConfig[chain2].name);
    }

    // otherwise, sort by chain group
    return chain1Group.localeCompare(chain2Group);
  });
};

export default getSortedChains;
