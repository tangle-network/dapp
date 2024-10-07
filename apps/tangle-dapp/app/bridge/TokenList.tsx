'use client';

import { TokenListCard } from '@webb-tools/webb-ui-components/components/ListCard/TokenListCard';
import { type ComponentProps, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { BRIDGE_SUPPORTED_TOKENS } from '../../constants/bridge';
import { useBridge } from '../../context/BridgeContext';

type Props = Partial<ComponentProps<typeof TokenListCard>> & {
  isOpen: boolean;
};

const TokenList = ({ className, onClose, isOpen, ...props }: Props) => {
  const { selectedSourceChain, selectedToken, setSelectedTokenId } =
    useBridge();

  const tokens = useMemo(() => {
    return Object.entries(BRIDGE_SUPPORTED_TOKENS)
      .filter(([, token]) => token.chains.includes(selectedSourceChain.id))
      .map(([tokenId, token]) => ({
        id: tokenId,
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
      }));
  }, [selectedSourceChain.id]);

  const handleChange = (token: (typeof tokens)[number]) => {
    setSelectedTokenId(token.id);
    onClose?.();
  };

  return (
    <TokenListCard
      type="token"
      overrideTitleProps={{
        variant: 'h4',
      }}
      selectTokens={tokens}
      popularTokens={[]}
      unavailableTokens={[]}
      title="Select a Token"
      onChange={handleChange}
      value={selectedToken}
      {...props}
      onClose={onClose}
      className={twMerge(
        'h-full mx-auto dark:bg-[var(--restake-card-bg-dark)]',
        className,
      )}
      overrideInputProps={{
        placeholder: 'Search for a token',
      }}
    />
  );
};

TokenList.displayName = 'TokenList';

export default TokenList;
