import { getContract } from 'viem';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import getViemValidAddressFormat from '@webb-tools/web3-api-provider/utils/getViemValidAddressFormat';

const getWrappingFeesPercentageByFungibleToken = async (
  address: string,
  typedChainId: number
) => {
  const client = getViemClient(typedChainId);
  const addressHex = getViemValidAddressFormat(address);

  const fungibleTokenContract = getContract({
    address: addressHex,
    abi: FungibleTokenWrapper__factory.abi,
    publicClient: client,
  });

  const feesPercentage = await fungibleTokenContract.read.feePercentage();
  return feesPercentage;
};

export default getWrappingFeesPercentageByFungibleToken;
