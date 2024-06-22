import { TokenListCard } from '@webb-tools/webb-ui-components/components/ListCard/TokenListCard';
import type { TokenListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import { useActions } from '../../../stores/deposit';

type Props = Partial<TokenListCardProps>;

export default function TokenList({ className, onClose, ...props }: Props) {
  const { assetMap, balances } = useRestakeContext();

  const { updateDepositAssetId } = useActions();

  const selectableTokens = useMemo(
    () =>
      Object.values(assetMap).map((asset) => {
        const balance = balances[asset.id];

        return {
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          ...(balance !== undefined
            ? {
                assetBalanceProps: {
                  balance: +formatUnits(balance.balance, asset.decimals),
                },
              }
            : {}),
        } satisfies TokenListCardProps['selectTokens'][number];
      }),
    [assetMap, balances],
  );

  const handleTokenChange = useCallback(
    (token: TokenListCardProps['selectTokens'][number]) => {
      updateDepositAssetId(token.id);
      onClose?.();
    },
    [onClose, updateDepositAssetId],
  );

  return (
    <TokenListCard
      overrideTitleProps={{
        variant: 'h4',
      }}
      title={`Select a token`}
      popularTokens={[]}
      selectTokens={selectableTokens}
      unavailableTokens={[]} // TODO: Add unavailable tokens
      onChange={handleTokenChange}
      {...props}
      onClose={onClose}
      className={twMerge('p-0 dark:bg-transparent', className)}
    />
  );
}
