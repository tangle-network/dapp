'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import ChainListCard from '@webb-tools/webb-ui-components/components/ListCard/ChainListCard';
import { type ComponentProps, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../constants/restake';

type Props = Partial<ComponentProps<typeof ChainListCard>> & {
  selectedTypedChainId?: number | null;
};

const ChainList = ({
  className,
  onClose,
  selectedTypedChainId,
  ...props
}: Props) => {
  const { activeChain, loading, apiConfig } = useWebContext();

  const selectedChain = useMemo(
    () =>
      typeof selectedTypedChainId === 'number'
        ? apiConfig.chains[selectedTypedChainId]
        : null,
    [apiConfig.chains, selectedTypedChainId],
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

  return (
    <ChainListCard
      chainType="source"
      disclaimer=""
      overrideTitleProps={{
        variant: 'h4',
      }}
      chains={chains}
      activeTypedChainId={
        activeChain
          ? calculateTypedChainId(activeChain.chainType, activeChain.id)
          : undefined
      }
      defaultCategory={defaultCategory}
      isConnectingToChain={loading}
      {...props}
      onClose={onClose}
      className={twMerge(
        'h-full mx-auto dark:bg-[var(--restake-card-bg-dark)]',
        className,
      )}
    />
  );
};

ChainList.displayName = 'ChainList';

export default ChainList;
