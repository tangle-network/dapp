import { chainsConfig } from '@webb-tools/dapp-config/chains';

const getShortenChainName = (typedChainId: number) => {
  const fullChainName = chainsConfig[typedChainId].name;

  // check for Orbit chains
  if (fullChainName.toLowerCase().includes('orbit')) {
    return fullChainName.split(' ')[0];
  }

  return fullChainName.split(' ').pop();
};

export default getShortenChainName;
