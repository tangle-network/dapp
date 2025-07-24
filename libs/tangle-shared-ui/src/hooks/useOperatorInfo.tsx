import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { toSubstrateAddress } from '@tangle-network/ui-components/utils/toSubstrateAddress';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import { useMemo } from 'react';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import useRestakeOperatorMap from '../data/restake/useRestakeOperatorMap';
import useNetworkStore from '../context/useNetworkStore';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components';

type UseOperatorInfo = {
  operatorAddress: SubstrateAddress | null;
  isOperator: boolean;
};

const useOperatorInfo = (useSs58Prefix = true): UseOperatorInfo => {
  const { result: operatorMap } = useRestakeOperatorMap();
  const [activeAccount] = useActiveAccount();
  const { network } = useNetworkStore();

  const substrateAddress = useMemo(() => {
    let operatorAddress: SubstrateAddress | null = null;
    let isOperator = false;

    // Wait for the active account address to be set.
    if (activeAccount === null) {
      return {
        operatorAddress,
        isOperator,
      };
    }

    if (
      isSolanaAddress(activeAccount.address) ||
      isEvmAddress(activeAccount.address)
    ) {
      return {
        operatorAddress,
        isOperator,
      };
    }

    // Determine the prefix to use based on the useSs58Prefix parameter.
    const prefix = useSs58Prefix ? network.ss58Prefix : undefined;

    try {
      operatorAddress = toSubstrateAddress(activeAccount.address, prefix);
      isOperator = true;
    } catch (err) {
      console.error('Error converting address to Substrate format:', err);
    }

    if (operatorAddress !== null) {
      const normalize = (addr: string) => {
        try {
          return u8aToHex(decodeAddress(addr));
        } catch {
          return null;
        }
      };

      const operatorKey = normalize(operatorAddress);
      if (
        operatorKey === null ||
        !Array.from(operatorMap.keys()).some(
          (addr) => normalize(addr) === operatorKey,
        )
      ) {
        isOperator = false;
      }
    }

    return {
      operatorAddress,
      isOperator,
    };
  }, [activeAccount, network.ss58Prefix, useSs58Prefix, operatorMap]);

  return substrateAddress;
};

export default useOperatorInfo;
