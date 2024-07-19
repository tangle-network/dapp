import { isEthereumAddress } from '@polkadot/util-crypto';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils/shortenHex';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import isEqual from 'lodash/isEqual';
import { type ComponentProps, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { isHex } from 'viem';

type Props = ComponentProps<'div'> & {
  accountAddress: string;
  identityName?: string | null;
  overrideAvatarProps?: Partial<ComponentProps<typeof Avatar>>;
  overrideTypographyProps?: Partial<ComponentProps<typeof Typography>>;
};

const AvatarWithText = ({
  accountAddress,
  className,
  identityName,
  overrideAvatarProps,
  overrideTypographyProps,
  ...props
}: Props) => {
  return (
    <div
      {...props}
      className={twMerge(
        'flex items-center max-w-xs space-x-2 grow',
        className,
      )}
    >
      <Avatar
        // TODO: Determine the theme instead of hardcoding it
        theme={isEthereumAddress(accountAddress) ? 'ethereum' : 'substrate'}
        value={accountAddress}
        {...overrideAvatarProps}
        className={twMerge(
          `${getFlexBasic()} shrink-0`,
          overrideAvatarProps?.className,
        )}
      />

      <Typography
        component="span"
        variant="body2"
        {...overrideTypographyProps}
        className={twMerge(
          'truncate inline-block',
          overrideTypographyProps?.className,
        )}
      >
        {identityName || isHex(accountAddress)
          ? shortenHex(accountAddress)
          : shortenString(accountAddress)}
      </Typography>
    </div>
  );
};

export default memo(AvatarWithText, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps),
);
