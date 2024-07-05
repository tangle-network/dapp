import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { TokenListCard } from '@webb-tools/webb-ui-components/components/ListCard/TokenListCard';
import type { TokenListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';
import entries from 'lodash/entries';
import { useCallback, useMemo } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import type {
  DelegationFormFields,
  DelegatorInfo,
} from '../../../types/restake';

type Props = Partial<TokenListCardProps> & {
  setValue: UseFormSetValue<DelegationFormFields>;
  delegatorInfo: DelegatorInfo | null;
};

export default function AssetList({
  className,
  onClose,
  setValue,
  delegatorInfo,
  ...props
}: Props) {
  const { assetMap } = useRestakeContext();

  const selectableTokens = useMemo(() => {
    if (!isDefined(delegatorInfo)) {
      return [];
    }

    return entries(delegatorInfo.deposits)
      .filter(([assetId]) => Boolean(assetMap[assetId]))
      .map(([assetId, { amount }]) => {
        const asset = assetMap[assetId];

        return {
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          assetBalanceProps: {
            balance: +formatUnits(amount, asset.decimals),
          },
        } satisfies TokenListCardProps['selectTokens'][number];
      });
  }, [assetMap, delegatorInfo]);

  const handleAssetChange = useCallback(
    (asset: TokenListCardProps['selectTokens'][number]) => {
      setValue('assetId', asset.id);
      onClose?.();
    },
    [onClose, setValue],
  );

  return (
    <TokenListCard
      overrideTitleProps={{
        variant: 'h4',
      }}
      title={`Select an asset`}
      popularTokens={[]}
      selectTokens={selectableTokens}
      unavailableTokens={[]}
      onChange={handleAssetChange}
      {...props}
      onClose={onClose}
      className={twMerge(
        'dark:bg-[var(--restake-card-bg-dark)] p-0',
        className,
      )}
    />
  );
}
