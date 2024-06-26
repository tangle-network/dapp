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
  const { assetMap, balances } = useRestakeContext();

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
