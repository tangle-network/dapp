'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { Alert, ChainIcon, ChevronDown, Spinner } from '@webb-tools/icons';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { usePathname } from 'next/navigation';
import { type FC, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import useNetworkStore from '../../context/useNetworkStore';
import { useLiquidStakingStore } from '../../data/liquidStaking/useLiquidStakingStore';
import useNetworkSwitcher from '../../hooks/useNetworkSwitcher';
import { PagePath } from '../../types';
import createCustomNetwork from '../../utils/createCustomNetwork';
import isLsErc20TokenId from '../../utils/liquidStaking/isLsErc20TokenId';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';

// TODO: Currently hard-coded, but shouldn't it always be the Tangle icon, since it's not switching chains but rather networks within Tangle? If so, find some constant somewhere instead of having it hard-coded here.
export const TANGLE_TESTNET_CHAIN_NAME = 'Tangle Testnet Native';

const NetworkSelectionButton: FC = () => {
  const { activeChain, activeWallet, isConnecting, loading, switchChain } =
    useWebContext();

  const { network } = useNetworkStore();
  const { switchNetwork, isCustom } = useNetworkSwitcher();
  const pathname = usePathname();
  const { selectedProtocolId } = useLiquidStakingStore();

  // TODO: Handle switching network on EVM wallet here.
  const switchToCustomNetwork = useCallback(
    (customRpcEndpoint: string) =>
      switchNetwork(createCustomNetwork(customRpcEndpoint), true),
    [switchNetwork],
  );

  const networkName = useMemo(() => {
    if (isConnecting) {
      return 'Connecting...';
    } else if (loading) {
      return 'Loading...';
    }

    return network?.name ?? 'Unknown Network';
  }, [isConnecting, loading, network?.name]);

  // Disable network switching when in Liquid Staking page,
  // since it would have no effect there.
  const isInLiquidStakingPath = pathname.startsWith(PagePath.LIQUID_STAKING);

  const isInBridgePath = useMemo(
    () => pathname.startsWith(PagePath.BRIDGE),
    [pathname],
  );

  const isWrongEvmNetwork = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    return (
      isEvmWallet &&
      network.evmChainId !== undefined &&
      network.evmChainId !== activeChain?.id
    );
  }, [activeChain?.id, activeWallet?.platform, network.evmChainId]);

  const switchToCorrectEvmChain = useCallback(() => {
    if (!network.evmChainId || !activeWallet) {
      return;
    }

    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      network.evmChainId,
    );

    const targetChain = chainsPopulated[typedChainId];

    switchChain(targetChain, activeWallet);
  }, [activeWallet, network.evmChainId, switchChain]);

  if (isInBridgePath) {
    return null;
  }
  // Network can't be switched from the Tangle Restaking Parachain while
  // on liquid staking page.
  else if (isInLiquidStakingPath) {
    const liquidStakingNetworkName = isLsErc20TokenId(selectedProtocolId)
      ? 'Ethereum Mainnet'
      : TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.name;

    const chainIconName = isLsErc20TokenId(selectedProtocolId)
      ? 'ethereum'
      : TANGLE_TESTNET_CHAIN_NAME;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Dropdown>
            <TriggerButton
              className="opacity-60 cursor-not-allowed hover:!bg-none dark:hover:!bg-none"
              networkName={liquidStakingNetworkName}
              chainIconName={chainIconName}
            />
          </Dropdown>
        </TooltipTrigger>

        <TooltipBody side="bottom">
          Network can&apos;t be changed while you&apos;re in this page.
        </TooltipBody>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {isWrongEvmNetwork && (
        <Tooltip>
          <TooltipTrigger>
            <div
              className={twMerge(
                'cursor-pointer p-2 rounded-full',
                'bg-mono-0/10 border-mono-60',
                'dark:bg-mono-0/5 dark:border-mono-140',
                'hover:bg-mono-0/30',
                'dark:hover:bg-mono-0/10',
              )}
              onClick={switchToCorrectEvmChain}
            >
              <Alert className="fill-red-70 dark:fill-red-50" />
            </div>
          </TooltipTrigger>

          <TooltipBody>Wrong EVM Chain Connected</TooltipBody>
        </Tooltip>
      )}

      <Dropdown>
        <TriggerButton
          isLoading={isConnecting || loading}
          networkName={networkName}
          className="overflow-hidden"
        />

        <DropdownBody isPortal className="mt-2 bg-mono-0 dark:bg-mono-180">
          <NetworkSelectorDropdown
            isCustomEndpointSelected={isCustom}
            selectedNetwork={network}
            onSetCustomNetwork={switchToCustomNetwork}
            onNetworkChange={(newNetwork) => switchNetwork(newNetwork, false)}
          />
        </DropdownBody>
      </Dropdown>
    </div>
  );
};

type TriggerButtonProps = {
  className?: string;
  networkName: string;
  isLoading?: boolean;
  chainIconName?: string;
};

const TriggerButton: FC<TriggerButtonProps> = ({
  isLoading = false,
  networkName,
  className,
  chainIconName = TANGLE_TESTNET_CHAIN_NAME,
}) => {
  return (
    <DropdownBasicButton
      type="button"
      disabled={isLoading}
      className={twMerge(
        'rounded-lg border-2 p-2',
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        'flex items-center gap-2',
        className,
      )}
    >
      {isLoading ? (
        <Spinner size="lg" />
      ) : (
        <ChainIcon size="lg" className="shrink-0 grow-0" name={chainIconName} />
      )}

      <div className="flex items-center gap-0">
        <Typography
          variant="body1"
          fw="bold"
          className="hidden dark:text-mono-0 sm:block"
        >
          {networkName}
        </Typography>

        <ChevronDown size="lg" className="shrink-0 grow-0" />
      </div>
    </DropdownBasicButton>
  );
};

export default NetworkSelectionButton;
