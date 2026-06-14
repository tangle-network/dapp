import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { useMemo } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';

const useErc20Balances = (assetAddressesArg: EvmAddress[]) => {
  const { evmAddress } = useAgnosticAccountInfo();

  const contracts = useMemo(() => {
    if (evmAddress === null) {
      return [];
    }

    return assetAddressesArg.map((address) => ({
      address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [evmAddress] as const,
    }));
  }, [evmAddress, assetAddressesArg]);

  const { isLoading, ...rest } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: evmAddress !== null,
    },
  });

  return {
    ...rest,
    // If the evm address is not set, we don't want to show a loading state.
    isLoading: evmAddress === null ? false : isLoading,
  };
};

export default useErc20Balances;
