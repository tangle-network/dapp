import { useReadContract } from 'wagmi';
import { SHIELDED_CREDITS_ABI } from '../../abi/payments';
import { SHIELDED_CREDITS_ADDRESS } from '../../constants/payments';
import type { Address, Hex } from 'viem';

const useCreditAccountState = (commitment: Hex | undefined) => {
  return useReadContract({
    address: SHIELDED_CREDITS_ADDRESS as Address,
    abi: SHIELDED_CREDITS_ABI,
    functionName: 'getAccount',
    args: commitment ? [commitment] : undefined,
    query: {
      enabled: Boolean(SHIELDED_CREDITS_ADDRESS && commitment),
    },
  });
};

export default useCreditAccountState;
