import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { TransferConfirm } from '@webb-tools/webb-ui-components';
import { forwardRef, useMemo } from 'react';
import { TransferConfirmContainerProps } from './types';

export const TransferConfirmContainer = forwardRef<
  HTMLDivElement,
  TransferConfirmContainerProps
>(
  ({
    amount,
    changeAmount,
    currency,
    destChain,
    recipient,
    relayer,
    note,
    ...props
  }) => {
    const { activeApi, activeChain } = useWebContext();

    const activeChains = useMemo<string[]>(() => {
      if (!activeApi) {
        return [];
      }

      return Array.from(
        Object.values(activeApi.state.getBridgeOptions())
          .reduce((acc, bridge) => {
            const chains = Object.keys(bridge.targets).map(
              (presetTypeChainId) => {
                const chain = chainsPopulated[Number(presetTypeChainId)];
                return chain;
              }
            );

            chains.forEach((chain) => acc.add(chain.name));

            return acc;
          }, new Set<string>())
          .values()
      );
    }, [activeApi]);

    return (
      <TransferConfirm
        sourceChain={activeChain?.name}
        destChain={destChain.name}
        activeChains={activeChains}
        note={note}
        {...props}
      />
    );
  }
);
