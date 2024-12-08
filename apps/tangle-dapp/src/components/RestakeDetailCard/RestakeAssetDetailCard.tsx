import { ArrowRightUp } from '@webb-tools/icons/ArrowRightUp';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';

import RestakeDetailCard from './index';
import { getDisplayValue } from './utils';

type RestakeAssetDetailCardProps = {
  assetExternalLink?: string;
  getAssetLink?: string;
  limit?: string | number;
  name?: string;
  symbol?: string;
  tvl?: string | number;
};

const RestakeAssetDetailCard = ({
  assetExternalLink,
  getAssetLink,
  limit,
  name,
  symbol,
  tvl,
}: RestakeAssetDetailCardProps) => {
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
