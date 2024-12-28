import { TokenListCard } from '@webb-tools/webb-ui-components/components/ListCard/TokenListCard';
import type { TokenListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { twMerge } from 'tailwind-merge';

const AssetList = ({
  className,
  title = 'Select Asset',
  unavailableTokens = [],
  selectTokens = [],
  ...props
}: Partial<TokenListCardProps>) => {
  return (
    <TokenListCard
      type="asset"
      overrideTitleProps={{
        variant: 'h4',
      }}
      {...props}
      selectTokens={[
        {
          id: 'webb',
          name: 'Webb',
          symbol: 'WEBB',
        },
      ]}
      title={title}
      className={twMerge(
        'h-full mx-auto dark:bg-[var(--restake-card-bg-dark)]',
        className,
      )}
      overrideInputProps={{
        placeholder: 'Search for an asset',
      }}
    />
  );
};

export default AssetList;
