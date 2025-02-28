import { useEffect, useMemo, useRef } from 'react';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import { isEqual } from 'lodash';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import { EvmAddress } from '@tangle-network/ui-components/types/address';

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

  return useReadContracts({
    contracts: contracts,
    query: {
      enabled: evmAddress !== null,
    },
  });
};

export default useErc20Balances;
