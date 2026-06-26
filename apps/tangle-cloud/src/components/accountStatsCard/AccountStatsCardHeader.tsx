import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExternalLinkLine } from '@tangle-network/icons';
import { isPrimitive } from '@tangle-network/dapp-types';
import { AccountStatsCardHeaderProps } from '.';
import { Text } from '../sandbox/SandboxUi';

export const AccountStatsCardHeader: FC<AccountStatsCardHeaderProps> = ({
  className,
  title,
  description,
  descExternalLink,
  RightElement,
  IconElement,
  ...props
}) => {
  return (
    <div
      {...props}
      className={twMerge('flex items-start justify-between', className)}
    >
      <div className="flex items-center gap-4">
        {IconElement}

        <div>
          {isPrimitive(title) && title !== null && title !== undefined ? (
            <Text
              variant="h5"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              {title}
            </Text>
          ) : (
            title
          )}

          <div className="flex items-center gap-0.5 text-mono-100 dark:text-mono-60">
            {isPrimitive(description) &&
            description !== null &&
            description !== undefined ? (
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                {description}
              </Text>
            ) : (
              description
            )}

            {descExternalLink && (
              <a
                href={descExternalLink}
                target="_blank"
                rel="noreferrer"
                className="!text-inherit"
              >
                <ExternalLinkLine className="!fill-current" />
              </a>
            )}
          </div>
        </div>
      </div>

      {RightElement}
    </div>
  );
};

AccountStatsCardHeader.displayName = 'AccountStatsCardHeader';
