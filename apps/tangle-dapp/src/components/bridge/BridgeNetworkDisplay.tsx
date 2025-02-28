import { calculateTypedChainId, ChainType } from '@tangle-network/dapp-types';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { FC, useCallback, useMemo } from 'react';
import { chainsPopulated } from '@tangle-network/dapp-config';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components/components/Tooltip';
import { twMerge } from 'tailwind-merge';
import { Alert, ChainIcon, Spinner } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components/typography/Typography';

const BridgeNetworkDisplay: FC<{
  className?: string;
}> = ({ className }) => {
  const { activeChain, activeWallet, isConnecting, loading, switchChain } =
    useWebContext();

  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  const networkName = useMemo(() => {
    if (isConnecting) {
      return 'Connecting';
    } else if (loading) {
      return 'Loading';
    }

    return activeChain?.displayName ?? activeChain?.name ?? null;
  }, [isConnecting, loading, activeChain?.displayName, activeChain?.name]);

  const isWrongEvmNetwork = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    if (!isEvmWallet) {
      return false;
    }
    return activeChain?.name !== selectedSourceChain?.name;
  }, [activeChain?.name, activeWallet?.platform, selectedSourceChain?.name]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!activeWallet || !selectedSourceChain) {
      return;
    }

    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      selectedSourceChain.id,
    );

    const targetChain = chainsPopulated[typedChainId];

    switchChain(targetChain, activeWallet);
  }, [activeWallet, selectedSourceChain, switchChain]);

  return (
    <div className="flex items-center gap-1">
      {isWrongEvmNetwork && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className={twMerge(
                'cursor-pointer p-2 rounded-full',
                'bg-mono-0/10 dark:bg-mono-0/5',
                'hover:bg-mono-0/30 dark:hover:bg-mono-0/10',
                'border-mono-60 dark:border-mono-140',
              )}
              onClick={switchToCorrectEvmChain}
            >
              <Alert className="fill-red-70 dark:fill-red-50" />
            </div>
          </TooltipTrigger>

          <TooltipBody>Wrong EVM Chain Connected</TooltipBody>
        </Tooltip>
      )}

      {networkName && (
        <div
          className={twMerge(
            'flex items-center gap-2 rounded-lg py-2 px-3',
            'bg-transparent dark:bg-transparent',
            'border-2 border-mono-60/40 dark:border-mono-140/40',
            'cursor-not-allowed pointer-events-none select-none',
            className,
          )}
        >
          {loading ? (
            <Spinner size="md" />
          ) : (
            <ChainIcon
              size="lg"
              className="shrink-0 grow-0"
              name={networkName}
            />
          )}

          <div className="flex items-center gap-1">
            <Typography
              variant="body1"
              fw="bold"
              className="hidden dark:text-mono-0 sm:block"
            >
              {networkName}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgeNetworkDisplay;
