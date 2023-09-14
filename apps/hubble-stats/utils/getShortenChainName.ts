import { chainsConfig } from '@webb-tools/dapp-config/chains';

const getShortenChainName = (typedChainId: number) => {
  const fullChainName = chainsConfig[typedChainId].name;
  return fullChainName.split(' ').pop();
};

export default getShortenChainName;
