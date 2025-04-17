import { ArrowRightUp } from '@tangle-network/icons/ArrowRightUp';
import { TokenIcon } from '@tangle-network/icons/TokenIcon';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC } from 'react';
import RestakeDetailCard from './index';
import getDisplayValue from './utils';

type Props = {
  assetExternalLink?: string;
  getAssetLink?: string;
  limit?: string | number;
  name?: string;
  symbol?: string;
  tvl?: string | number;
};

const RestakeAssetDetailCard: FC<Props> = ({
  assetExternalLink,
  getAssetLink,
  limit,
  name,
  symbol,
  tvl,
}) => {
  return (
    <RestakeDetailCard.Root>
      <RestakeDetailCard.Header
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

      <RestakeDetailCard.Body>
        <RestakeDetailCard.Item title="Total Value Locked">
          {getDisplayValue(tvl)}
        </RestakeDetailCard.Item>

        <RestakeDetailCard.Item title="Current Limit">
          {getDisplayValue(limit)}
        </RestakeDetailCard.Item>
      </RestakeDetailCard.Body>
    </RestakeDetailCard.Root>
  );
};

export default RestakeAssetDetailCard;
