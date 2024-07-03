'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainIcon, ChevronDown, Spinner } from '@webb-tools/icons';
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
import useNetworkSwitcher from '../../hooks/useNetworkSwitcher';
import { PagePath } from '../../types';
import createCustomNetwork from '../../utils/createCustomNetwork';
import { NetworkSelectorDropdown } from './NetworkSelectorDropdown';

// TODO: Currently hard-coded, but shouldn't it always be the Tangle icon, since it's not switching chains but rather networks within Tangle? If so, find some constant somewhere instead of having it hard-coded here.
export const TANGLE_TESTNET_CHAIN_NAME = 'Tangle Testnet Native';

const NetworkSelectionButton: FC = () => {
  const { isConnecting, loading } = useWebContext();

  const { network } = useNetworkStore();
  const { switchNetwork, isCustom } = useNetworkSwitcher();
  const pathname = usePathname();

  // TODO: Handle switching network on EVM wallet here.
  const switchToCustomNetwork = useCallback(
    (customRpcEndpoint: string) =>
      switchNetwork(createCustomNetwork(customRpcEndpoint), true),
    [switchNetwork],
  );

  const networkName = useMemo(() => {
    if (isConnecting) return 'Connecting...';

    if (loading) return 'Loading...';

    return network?.name ?? 'Unknown Network';
  }, [isConnecting, loading, network?.name]);

  // Disable network switching when in Liquid Staking page,
  // since it would have no effect there.
  const isInLiquidStakingPath = pathname.startsWith(PagePath.LIQUID_STAKING);

  return isInLiquidStakingPath ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dropdown>
          <TriggerButton
            className="opacity-60 cursor-not-allowed hover:!bg-none dark:hover:!bg-none"
            networkName={TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.name}
          />
        </Dropdown>
      </TooltipTrigger>

      <TooltipBody side="bottom">
        Network can&apos;t be changed while you&apos;re in this page.
      </TooltipBody>
    </Tooltip>
  ) : (
    <Dropdown>
      <TriggerButton
        isLoading={isConnecting || loading}
        networkName={networkName}
      />

      <DropdownBody className="mt-1 bg-mono-0 dark:bg-mono-180">
        <NetworkSelectorDropdown
          isCustomEndpointSelected={isCustom}
          selectedNetwork={network}
          onSetCustomNetwork={switchToCustomNetwork}
          onNetworkChange={(newNetwork) => switchNetwork(newNetwork, false)}
        />
      </DropdownBody>
    </Dropdown>
  );
};

type TriggerButtonProps = {
  className?: string;
  networkName: string;
  isLoading?: boolean;
};

const TriggerButton: FC<TriggerButtonProps> = ({
  isLoading,
  networkName,
  className,
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
        <ChainIcon
          size="lg"
          className="shrink-0 grow-0"
          name={TANGLE_TESTNET_CHAIN_NAME}
        />
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
