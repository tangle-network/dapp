'use client';

import { useChainModal } from '@rainbow-me/rainbowkit';
import { ChainIcon, Spinner } from '@tangle-network/icons';
import { ChevronDown } from '@tangle-network/icons/ChevronDown';
import { Typography } from '@tangle-network/ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAccount, useChainId } from 'wagmi';
import { config } from '@tangle-network/dapp-config/wagmi-config';

const ChainSelectorButton: FC = () => {
  const { openChainModal } = useChainModal();
  const { isConnecting } = useAccount();
  const chainId = useChainId();

  // Find the current chain from config
  const currentChain = config.chains.find((c) => c.id === chainId);
  const chainName = currentChain?.name ?? 'Select Chain';

  return (
    <button
      type="button"
      onClick={openChainModal}
      disabled={isConnecting}
      className={twMerge(
        'rounded-lg border-2 p-2 flex items-center gap-2',
        'bg-mono-0/10 dark:bg-mono-0/5',
        'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
        'border-2 border-mono-60 dark:border-mono-140',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {isConnecting ? (
        <Spinner size="lg" />
      ) : (
        <ChainIcon size="lg" className="shrink-0 grow-0" name={chainName} />
      )}

      <Typography
        variant="body1"
        fw="bold"
        className="hidden dark:text-mono-0 sm:block"
      >
        {chainName}
      </Typography>

      <ChevronDown size="lg" className="shrink-0 grow-0" />
    </button>
  );
};

export default ChainSelectorButton;
