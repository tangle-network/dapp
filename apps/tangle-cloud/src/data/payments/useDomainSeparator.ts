import { useReadContract } from 'wagmi';
import { SHIELDED_CREDITS_ABI } from '../../abi/payments';
import { SHIELDED_CREDITS_ADDRESS } from '../../constants/payments';
import type { Address } from 'viem';

const useDomainSeparator = () => {
  return useReadContract({
    address: SHIELDED_CREDITS_ADDRESS as Address,
    abi: SHIELDED_CREDITS_ABI,
    functionName: 'DOMAIN_SEPARATOR',
    query: {
      enabled: Boolean(SHIELDED_CREDITS_ADDRESS),
    },
  });
};

export default useDomainSeparator;
