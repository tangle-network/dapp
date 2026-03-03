import { ArrowRightUp } from '@tangle-network/icons/ArrowRightUp';
import { TokenIcon } from '@tangle-network/icons/TokenIcon';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC } from 'react';
import StakingDetailCard from './index';
import getDisplayValue from './utils';

type Props = {
  assetExternalLink?: string;
  getAssetLink?: string;
  limit?: string | number;
  name?: string;
  symbol?: string;
  tvl?: string | number;
};

const StakingAssetDetailCard: FC<Props> = ({
  assetExternalLink,
  getAssetLink,
  limit,
  name,
  symbol,
  tvl,
}) => {
  return (
    <StakingDetailCard.Root>
      <StakingDetailCard.Header
        IconElement={
          <TokenIcon
            className="[border-image:var(--tangle-gradient-border)] p-1"
            name={symbol}
            width={50}
            height={50}
          />
        }
        RightElement={
          getAssetLink ? (
            <Button
              variant="utility"
              size="sm"
              rightIcon={<ArrowRightUp className="!fill-current" />}
              href={getAssetLink}
              target="_blank"
              className="self-start"
            >
              Get asset
            </Button>
          ) : undefined
        }
        title={symbol}
        description={name}
        descExternalLink={assetExternalLink}
      />

      <StakingDetailCard.Body>
        <StakingDetailCard.Item title="Total Value Locked">
          {getDisplayValue(tvl)}
        </StakingDetailCard.Item>

        <StakingDetailCard.Item title="Current Limit">
          {getDisplayValue(limit)}
        </StakingDetailCard.Item>
      </StakingDetailCard.Body>
    </StakingDetailCard.Root>
  );
};

export default StakingAssetDetailCard;
