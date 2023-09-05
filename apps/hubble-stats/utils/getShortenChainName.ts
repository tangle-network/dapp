import { chainsConfig } from '@webb-tools/dapp-config/chains';

const getShortenChainName = (typedChainId: number) => {
  return chainsConfig[typedChainId].name.split(' ').pop();
};

export default getShortenChainName;
