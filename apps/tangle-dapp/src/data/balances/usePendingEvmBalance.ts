import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useViemPublicClient from '@tangle-network/tangle-shared-ui/hooks/useViemPublicClient';
import { toEvmAddress } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PublicClient } from 'viem';

const fetchPendingEvmBalance = async <TPublicClient extends PublicClient>(
  viemPublicClient: TPublicClient,
  evmAddress20: EvmAddress,
) => {
  return viemPublicClient.getBalance({ address: evmAddress20 });
};

/**
 * See more here:
 * https://docs.tangle.tools/docs/use/addresses/#case-2-sending-from-evm-to-substrate
 */
const usePendingEvmBalance = () => {
  const viemPublicClient = useViemPublicClient();
  const { substrateAddress, isEvm } = useAgnosticAccountInfo();

  // Only check the EVM balance if the active account address
  // is a Substrate address.
  const evmAddress20 = useMemo(() => {
    if (substrateAddress === null || isEvm) {
      return null;
    }

    return toEvmAddress(substrateAddress);
  }, [isEvm, substrateAddress]);

  const { data: balance } = useQuery({
    queryKey: ['pendingEvmBalance', evmAddress20, viemPublicClient?.chain?.id],
    queryFn:
      viemPublicClient?.chain?.id !== undefined && evmAddress20 !== null
        ? () => fetchPendingEvmBalance(viemPublicClient, evmAddress20)
        : skipToken,
  });

  return balance;
};

export default usePendingEvmBalance;
