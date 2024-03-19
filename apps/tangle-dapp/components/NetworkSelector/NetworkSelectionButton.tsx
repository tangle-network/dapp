'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/webb-context';
import { ChainIcon, ChevronDown } from '@webb-tools/icons';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { NetworkSelector } from './NetworkSelector';

const NetworkSelectionButton: FC = () => {
  const { activeChain, activeAccount } = useWebContext();
  const [networkName, setNetworkName] = useState('Tangle Mainnet');

  return (
    activeAccount &&
    activeChain && (
      <Dropdown>
        <DropdownBasicButton>
          <TriggerButton networkName={networkName} />
        </DropdownBasicButton>

        <DropdownBody className="mt-1 bg-mono-0 dark:bg-mono-180">
          <NetworkSelector setNetworkName={setNetworkName} />
        </DropdownBody>
      </Dropdown>
    )
  );
};

const TriggerButton: FC<{ networkName: string }> = ({ networkName }) => {
  return (
    <button
      type="button"
      className={twMerge(
        'rounded-lg border-2 p-2 pl-4',
        'bg-mono-0/10 border-mono-60',
        'hover:bg-mono-0/30',
        'dark:bg-mono-0/5 dark:border-mono-140',
        'dark:hover:bg-mono-0/10',
        'flex items-center gap-2'
      )}
    >
      <ChainIcon
        status="success"
        size="lg"
        className="shrink-0 grow-0"
        // TODO: Currently hard-coded, but shouldn't it always be the Tangle icon, since it's not switching chains but rather networks within Tangle? If so, find some constant somewhere instead of having it hard-coded here.
        name="Tangle Testnet Native"
      />

      <div className="flex items-center gap-0">
        <p className="font-bold">{networkName}</p>

        <ChevronDown size="lg" className="shrink-0 grow-0" />
      </div>
    </button>
  );
};

export default NetworkSelectionButton;
