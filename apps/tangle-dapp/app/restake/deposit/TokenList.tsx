import { TokenListCard } from '@webb-tools/webb-ui-components/components/ListCard/TokenListCard';
import type { TokenListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useCallback, useMemo } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import type { DepositFormFields } from '../../../types/restake';

type Props = Partial<TokenListCardProps> & {
  setValue: UseFormSetValue<DepositFormFields>;
};

export default function TokenList({
  className,
  onClose,
  setValue,
  ...props
}: Props) {
  const { assetWithBalances } = useRestakeContext();

  const selectableTokens = useMemo(
    () =>
      assetWithBalances.map((asset) => {
        const balance = asset.balance;

        return {
          id: asset.assetId,
          name: asset.metadata.name,
          symbol: asset.metadata.symbol,
          ...(balance !== null
            ? {
                assetBalanceProps: {
                  balance: +formatUnits(
                    balance.balance,
                    asset.metadata.decimals,
                  ),
                },
              }
            : {}),
        } satisfies TokenListCardProps['selectTokens'][number];
      }),
    [assetWithBalances],
  );

  const handleTokenChange = useCallback(
    (token: TokenListCardProps['selectTokens'][number]) => {
      setValue('depositAssetId', token.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
      onClose?.();
    },
    [onClose, setValue],
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
      className={twMerge(
        'dark:bg-[var(--restake-card-bg-dark)] p-0',
        className,
      )}
    />
  );
}
