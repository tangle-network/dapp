import { isEthereumAddress } from '@polkadot/util-crypto';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils/shortenHex';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import isEqual from 'lodash/isEqual';
import { type ComponentProps, memo } from 'react';
import { isHex } from 'viem';

type Props = {
  accountAddress: string;
  overrideAvatarProps?: Partial<ComponentProps<typeof Avatar>>;
  overrideTypographyProps?: Partial<ComponentProps<typeof Typography>>;
};

const AvatarWithText = ({
  accountAddress,
  overrideAvatarProps,
  overrideTypographyProps,
}: Props) => {
  return (
    <div className="flex items-center max-w-xs space-x-2 grow">
      <Avatar
        // TODO: Determine the theme instead of hardcoding it
        theme={isEthereumAddress(accountAddress) ? 'ethereum' : 'substrate'}
        value={accountAddress}
        className={`${getFlexBasic()} shrink-0`}
        {...overrideAvatarProps}
      />

      <Typography
        variant="body2"
        className="truncate"
        {...overrideTypographyProps}
      >
        {isHex(accountAddress)
          ? shortenHex(accountAddress)
          : shortenString(accountAddress)}
      </Typography>
    </div>
  );
};

export default memo(AvatarWithText, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps),
);
