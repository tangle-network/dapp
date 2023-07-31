import { chainsConfig } from '@webb-tools/dapp-config/chains';

const getChainNamesByTypedId = (typedChainIds: number[]) => {
  return typedChainIds.map((typedChainId) => chainsConfig[typedChainId].name);
};

export default getChainNamesByTypedId;
