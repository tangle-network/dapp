'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import { StatusVariant } from '@webb-tools/icons/StatusIndicator/types';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components';
import ChainButtonCmp from '@webb-tools/webb-ui-components/components/buttons/ChainButton';

import { NetworkSelector } from '../NetworkSelector/NetworkSelector';

const ChainSelector = () => {
  const { activeChain, activeAccount } = useWebContext();
  const chain = activeChain ?? undefined;

  const status: StatusVariant =
    activeChain === null
      ? 'warning'
      : activeChain === undefined
      ? 'error'
      : 'success';

  return (
    activeAccount &&
    chain && (
      <Dropdown>
        <DropdownBasicButton>
          <ChainButtonCmp
            chain={chain}
            status={status}
            placeholder={activeChain === null ? 'Unsupported Chain' : undefined}
            textClassname="hidden lg:block"
          />
        </DropdownBasicButton>

        <DropdownBody className="mt-1 bg-mono-0 dark:bg-mono-180">
          <NetworkSelector />
        </DropdownBody>
      </Dropdown>
    )
  );
};

export default ChainSelector;
