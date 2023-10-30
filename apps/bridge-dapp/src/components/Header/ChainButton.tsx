import { DropdownMenuTrigger as DropdownButton } from '@radix-ui/react-dropdown-menu';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import { chainsPopulated } from '@webb-tools/dapp-config';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import { MenuItem } from '@webb-tools/webb-ui-components';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton';
import { useMemo } from 'react';
import useChainsFromRoute from '../../hooks/useChainsFromRoute';

const ChainButton = () => {
  const { activeChain, apiConfig } = useWebContext();
  const { srcTypedChainId } = useChainsFromRoute();

  const chain = useMemo(() => {
    if (activeChain) {
      return activeChain;
    }

    // Default to the chain from route if no active chain
    if (typeof srcTypedChainId === 'number' && activeChain !== null) {
      return chainsPopulated[srcTypedChainId];
    }
  }, [activeChain, srcTypedChainId]);

  const selectableChains = useMemo(
    () => apiConfig.getSupportedChains({ withEnv: true }),
    [apiConfig]
  );

  return (
    <Dropdown>
      <DropdownButton asChild>
        <ChainButtonCmp
          chain={chain}
          status="success"
          placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
          textClassname="hidden md:block"
        />
      </DropdownButton>
      <DropdownBody className="mt-2">
        <ScrollArea className="h-[var(--active-chain-dropdown-height)]">
          <ul>
            {selectableChains.map((chain) => {
              return (
                <li key={`${chain.chainType}-${chain.id}`}>
                  <MenuItem
                    startIcon={<ChainIcon size="lg" name={chain.name} />}
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

export default ChainButton;
