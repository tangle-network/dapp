'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import ChainListCard from '@webb-tools/webb-ui-components/components/ListCard/ChainListCard';
import type { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useRouter } from 'next/navigation';
import { type ComponentProps, useCallback, useMemo } from 'react';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../../constants/restake';
import { useActions, useSourceTypedChainId } from '../../../../stores/deposit';

const Page = () => {
  const router = useRouter();

  const { activeChain, loading, apiConfig } = useWebContext();

  const selectTypedChainId = useSourceTypedChainId();
  const { updateSourceTypedChainId } = useActions();

  const selectedChain = useMemo(
    () => apiConfig.chains[selectTypedChainId],
    [apiConfig.chains, selectTypedChainId],
  );

  const chains = useMemo(
    () =>
      SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.map(
        (typedChainId) =>
          [typedChainId, apiConfig.chains[typedChainId]] as const,
      )
        .filter(([, chain]) => Boolean(chain))
        .map(([typedChainId, chain]) => ({
          typedChainId,
          name: chain.name,
          tag: chain.tag,
          needSwitchWallet:
            activeChain?.id !== chain.id &&
            activeChain?.chainType !== chain.chainType,
        })),
    [activeChain?.chainType, activeChain?.id, apiConfig.chains],
  );

  const defaultCategory = useMemo<
    ComponentProps<typeof ChainListCard>['defaultCategory']
  >(() => {
    return selectedChain?.tag ?? activeChain?.tag ?? 'test';
  }, [activeChain?.tag, selectedChain?.tag]);

  const handleChainChange = useCallback(
    ({ typedChainId }: ChainType) => {
      updateSourceTypedChainId(typedChainId);
      router.push('/restake/deposit');
    },
    [router, updateSourceTypedChainId],
  );

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <ChainListCard
      chainType="source"
      className="p-0"
      chains={chains}
      activeTypedChainId={
        activeChain
          ? calculateTypedChainId(activeChain.chainType, activeChain.id)
          : undefined
      }
      defaultCategory={defaultCategory}
      isConnectingToChain={loading}
      onChange={handleChainChange}
      onClose={handleClose}
      overrideScrollAreaProps={{
        className: 'h-[320px]',
      }}
    />
  );
};

export default Page;
