'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import ChainListCard from '@webb-tools/webb-ui-components/components/ListCard/ChainListCard';
import type { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { type ComponentProps, useCallback, useMemo } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import type { DepositFormFields } from '../../../types/restake';

type Props = Partial<ComponentProps<typeof ChainListCard>> & {
  setValue: UseFormSetValue<DepositFormFields>;
  watch: UseFormWatch<DepositFormFields>;
};

const ChainList = ({
  className,
  onClose,
  setValue,
  watch,
  ...props
}: Props) => {
  const { activeChain, loading, apiConfig } = useWebContext();

  const selectTypedChainId = watch('sourceTypedChainId');

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
      setValue('sourceTypedChainId', typedChainId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      onClose?.();
    },
    [onClose, setValue],
  );

  return (
    <ChainListCard
      chainType="source"
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
      onChange={handleChainChange}
      overrideScrollAreaProps={{
        className: 'h-[320px]',
      }}
      {...props}
      onClose={onClose}
      className={twMerge(
        'p-0 dark:bg-[var(--restake-card-bg-dark)]',
        className,
      )}
    />
  );
};

ChainList.displayName = 'ChainList';

export default ChainList;
