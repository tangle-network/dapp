import { chainsConfig } from '@webb-tools/dapp-config';

export const findChainConfigByName = (name: string) => {
  const chainIds = Object.keys(chainsConfig);

  for (let i = 0; i < chainIds.length; i++) {
    const chainId = chainIds[i];
    const chainConfig = chainsConfig[Number(chainId)];

    if (chainConfig.name === name) {
      return chainConfig;
    }
  }

  return null;
};
