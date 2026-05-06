import { type ComponentProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { Avatar } from '../Avatar';
import type { ValidatorIdentityProps } from './types';
import { shortenString } from '../../utils/shortenString';
import { CopyWithTooltip } from '../CopyWithTooltip';
import ExternalLinkIcon from '../ExternalLinkIcon';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';

type Props = ComponentProps<'div'> & ValidatorIdentityProps;

export const ValidatorIdentity = forwardRef<HTMLDivElement, Props>(
  (
    {
      address,
      identityName,
      accountExplorerUrl,
      displayCharacterCount = 6,
      avatarSize,
      textVariant = 'body1',
      textWeight = 'normal',
      textClassName,
      showAddressInTooltip,
      subContent,
      className,
      ...props
    },
    ref,
  ) => {
    const mainContent = (
      <div className="flex items-center gap-2">
        {!showAddressInTooltip ? (
          <Typography
            variant={textVariant}
            fw={textWeight}
            className={twMerge('truncate', textClassName)}
          >
            {identityName || shortenString(address, displayCharacterCount)}
          </Typography>
        ) : (
          <Tooltip>
            <TooltipTrigger>
              <Typography
                variant={textVariant}
                fw={textWeight}
                className={twMerge('truncate', textClassName)}
              >
                {identityName || shortenString(address, displayCharacterCount)}
              </Typography>
            </TooltipTrigger>

            <TooltipBody className="max-w-none">{address}</TooltipBody>
          </Tooltip>
        )}

        <CopyWithTooltip
          copyLabel="Copy Address"
          textToCopy={address}
          isButton={false}
        />

        {accountExplorerUrl && (
          <ExternalLinkIcon
            onClick={(event) => event.stopPropagation()}
            href={accountExplorerUrl}
            className="fill-mono-160 dark:fill-mono-80"
          />
        )}
      </div>
    );

    return (
      <div
        {...props}
        className={twMerge('flex items-center gap-2', className)}
        ref={ref}
      >
        <Avatar
          sourceVariant="address"
          value={address}
          size={avatarSize}
          theme="substrate"
        >
          {address}
        </Avatar>

        {!subContent ? (
          mainContent
        ) : (
          <div className="space-y-1">
            {mainContent}
            {subContent}
          </div>
        )}
      </div>
    );
  },
);
