import { useReadContract } from 'wagmi';
import { ERC20_ABI } from '../../abi/payments';
import type { Address } from 'viem';

const useTokenBalance = (
  tokenAddress: Address | undefined,
  account: Address | undefined,
) => {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    query: {
      enabled: Boolean(tokenAddress && account),
    },
  });
};

export default useTokenBalance;
