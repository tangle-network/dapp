import { DropdownMenuTrigger as DropdownButton } from '@radix-ui/react-dropdown-menu';
import {
  useWebContext,
  useConnectWallet,
} from '@webb-tools/api-provider-environment';
import type { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface.js';
import getChainFromConfig from '@webb-tools/dapp-config/utils/getChainFromConfig.js';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError.js';
import { ChainIcon } from '@webb-tools/icons/ChainIcon.js';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown/index.js';
import { MenuItem } from '@webb-tools/webb-ui-components/components/MenuItem/index.js';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea/index.js';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton.js';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI.js';
import { useCallback, useMemo } from 'react';
import useChainsFromRoute from '../../hooks/useChainsFromRoute.js';

const ActiveChainDropdown = () => {
  const { activeChain, activeWallet, apiConfig, switchChain, loading } =
    useWebContext();
  const { toggleModal } = useConnectWallet();
  const { srcTypedChainId } = useChainsFromRoute();
  const { notificationApi } = useWebbUI();

  const chain = useMemo(() => {
    if (activeChain) {
      return activeChain;
    }

    // Default to the chain from route if no active chain
    if (typeof srcTypedChainId === 'number' && activeChain !== null) {
      return apiConfig.chains[srcTypedChainId];
    }
  }, [activeChain, apiConfig.chains, srcTypedChainId]);

  const selectableChains = useMemo(
    () => apiConfig.getSupportedChains({ withEnv: true }),
    [apiConfig]
  );

  const handleSelectChain = useCallback(
    async (chainCfg: ChainConfig) => {
      const chain = getChainFromConfig(chainCfg);

      if (!activeWallet || !chain.wallets.includes(activeWallet.id)) {
        toggleModal(true, calculateTypedChainId(chain.chainType, chain.id));
      } else {
        const api = await switchChain(chain, activeWallet);
        if (!api) {
          notificationApi.addToQueue({
            variant: 'error',
            message: WebbError.getErrorMessage(WebbErrorCodes.SwitchChainFailed)
              .message,
          });
        }
      }
    },
    [activeWallet, notificationApi, switchChain, toggleModal]
  );

  return (
    <Dropdown>
      <DropdownButton asChild disabled={loading}>
        <ChainButtonCmp
          chain={chain}
          status="success"
          placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
          textClassname="hidden lg:!block"
        />
      </DropdownButton>
      <DropdownBody className="mt-2">
        <ScrollArea className="h-[var(--dropdown-height)]">
          <ul>
            {selectableChains.map((chain) => {
              return (
                <li key={`${chain.chainType}-${chain.id}`}>
                  <MenuItem
                    startIcon={<ChainIcon size="lg" name={chain.name} />}
                    onSelect={() => handleSelectChain(chain)}
                  >
                    {chain.name}
                  </MenuItem>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </DropdownBody>
    </Dropdown>
  );
};

export default ActiveChainDropdown;
