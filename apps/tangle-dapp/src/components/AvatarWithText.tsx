import { isEthereumAddress } from '@polkadot/util-crypto';
import { getFlexBasic } from '@tangle-network/icons/utils';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { toSubstrateAddress } from '@tangle-network/ui-components/utils/toSubstrateAddress';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import isEqual from 'lodash/isEqual';
import { type ComponentProps, memo, type ReactNode, useMemo } from 'react';
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
  const ss58Prefix = useNetworkStore((store) => store.network.ss58Prefix);

  const tangleFormattedAddress = useMemo(() => {
    return isEthereumAddress(accountAddress)
      ? accountAddress
      : toSubstrateAddress(accountAddress, ss58Prefix);
  }, [accountAddress, ss58Prefix]);

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
        value={tangleFormattedAddress}
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
            (isHex(tangleFormattedAddress)
              ? shortenHex(tangleFormattedAddress)
              : shortenString(tangleFormattedAddress))}
        </Typography>

        {description}
      </div>
    </div>
  );
};

export default memo(AvatarWithText, (prevProps, nextProps) =>
  isEqual(prevProps, nextProps),
);
