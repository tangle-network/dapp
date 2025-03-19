import { type ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Avatar } from '../Avatar';
import type { ValidatorIdentityProps } from './types';
import { shortenString } from '../../utils/shortenString';
import { CopyWithTooltip } from '../CopyWithTooltip';
import ExternalLinkIcon from '../ExternalLinkIcon';

type Props = ComponentProps<'div'> & ValidatorIdentityProps;

export const ValidatorIdentity = forwardRef<HTMLDivElement, Props>(
  (
    {
      address,
      identityName,
      accountExplorerUrl,
      displayCharacterCount = 6,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        className={twMerge('flex items-center space-x-2', className)}
        ref={ref}
      >
        <Avatar sourceVariant="address" value={address} theme="substrate">
          {address}
        </Avatar>

        <Typography variant="body1" fw="normal" className="truncate">
          {identityName || shortenString(address, displayCharacterCount)}
        </Typography>

        <CopyWithTooltip
          copyLabel="Copy Address"
          textToCopy={address}
          isButton={false}
        />

        {accountExplorerUrl && (
          <ExternalLinkIcon
            href={accountExplorerUrl}
            className="fill-mono-160 dark:fill-mono-80"
          />
        )}
      </div>
    );
  },
);
