import { isEthereumAddress } from '@polkadot/util-crypto';
import { getFlexBasic } from '@tangle-network/icons/utils';
import { Avatar } from '@tangle-network/webb-ui-components/components/Avatar';
import { Typography } from '@tangle-network/webb-ui-components/typography/Typography';
import { shortenHex } from '@tangle-network/webb-ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/webb-ui-components/utils/shortenString';
import isEqual from 'lodash/isEqual';
import { type ComponentProps, memo, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { isHex } from 'viem';

type Props = ComponentProps<'div'> & {
  accountAddress: string;
  description?: ReactNode;
  identityName?: string | null;
  overrideAvatarProps?: Partial<ComponentProps<typeof Avatar>>;
  overrideTypographyProps?: Partial<ComponentProps<typeof Typography>>;
};

const AvatarWithText = ({
  accountAddress,
  className,
  description,
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
        theme={isEthereumAddress(accountAddress) ? 'ethereum' : 'substrate'}
        value={accountAddress}
        {...overrideAvatarProps}
        className={twMerge(
          `${getFlexBasic('lg')} shrink-0`,
          overrideAvatarProps?.className,
        )}
      />

      <div>
        <Typography
          component="span"
          variant="body2"
          {...overrideTypographyProps}
          className={twMerge(
            'truncate block',
            overrideTypographyProps?.className,
          )}
        >
          {identityName ||
            (isHex(accountAddress)
              ? shortenHex(accountAddress)
              : shortenString(accountAddress))}
        </Typography>

        {description}
      </div>
    </div>
  );
};

export default memo(AvatarWithText, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps),
);
