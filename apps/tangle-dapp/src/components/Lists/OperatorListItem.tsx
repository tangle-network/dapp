import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import AvatarWithText from '../AvatarWithText';
import {
  EMPTY_VALUE_PLACEHOLDER,
  KeyValueWithButton,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

type Props = {
  accountAddress: SubstrateAddress;
  identity?: string;
  rightContentTop?: string;
  rightContentBottom?: string;
};

const OperatorListItem: FC<Props> = ({
  accountAddress,
  identity,
  rightContentTop,
  rightContentBottom,
}) => {
  return (
    <>
      <AvatarWithText
        accountAddress={accountAddress}
        overrideAvatarProps={{ size: 'lg' }}
        overrideTypographyProps={{ variant: 'h5' }}
        identityName={identity}
        description={<KeyValueWithButton size="sm" keyValue={accountAddress} />}
      />

      {(rightContentTop !== undefined || rightContentBottom !== undefined) && (
        <div className="space-y-1">
          <Typography variant="h5" fw="bold">
            {rightContentTop ?? EMPTY_VALUE_PLACEHOLDER}
          </Typography>

          {rightContentBottom !== undefined && (
            <Typography
              ta="right"
              variant="body3"
              fw="semibold"
              className="text-mono-100 dark:text-mono-100"
            >
              rightContentBottom
            </Typography>
          )}
        </div>
      )}
    </>
  );
};

export default OperatorListItem;
