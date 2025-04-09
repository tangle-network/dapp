import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { isEqual } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';

const useErc20Balances = (assetAddressesArg: EvmAddress[]) => {
  const { evmAddress } = useAgnosticAccountInfo();
  const assetAddressesRef = useRef(assetAddressesArg);

  // Shallow compare the asset addresses.
  useEffect(() => {
    if (!isEqual(assetAddressesRef.current, assetAddressesArg)) {
      assetAddressesRef.current = assetAddressesArg;
    }
  }, [assetAddressesArg]);

  const contracts = useMemo(() => {
    if (evmAddress === null) {
      return [];
    }

    return assetAddressesRef.current.map((address) => ({
      address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [evmAddress] as const,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmAddress, assetAddressesRef.current]);

  const { isPending, ...rest } = useReadContracts({
    contracts: contracts,
    query: {
      enabled: evmAddress !== null,
      placeholderData: (prev) => prev,
    },
  });

  return {
    ...rest,
    // If the evm address is not set, we don't want to show a loading state.
    isPending: evmAddress === null ? false : isPending,
  };
};

export default useErc20Balances;
