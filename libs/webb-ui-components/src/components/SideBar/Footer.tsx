import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExternalLinkLine } from '@webb-tools/icons';

import { Typography } from '../../typography/Typography/index.js';
import { Link } from '../Link/index.js';
import { ThemeToggle } from '../ThemeToggle/index.js';
import { SideBarFooterProps } from './types.js';

export const SideBarFooter: FC<SideBarFooterProps> = ({
  Icon,
  name,
  isInternal,
  href,
  className,
  isExpanded,
  useNextThemesForThemeToggle,
}) => {
  return (
    <div
      className={twMerge(
        'flex items-center',
        isExpanded ? 'justify-between' : 'justify-center',
        className
      )}
    >
      <div className="flex items-center justify-between group">
        <Link href={href} target="_blank">
          <Icon
            width={24}
            height={24}
            className="cursor-pointer !fill-mono-100 dark:!fill-mono-60 group-hover:!fill-mono-200 dark:group-hover:!fill-mono-0"
          />
        </Link>

        {isExpanded && (
          <>
            <div className={isExpanded ? 'pl-2' : ''}>
              <Link href={href} target="_blank">
                <Typography
                  variant="body1"
                  className="cursor-pointer text-mono-100 dark:text-mono-60 group-hover:text-mono-200 dark:group-hover:text-mono-0"
                >
                  {name}
                </Typography>
              </Link>
            </div>

            {!isInternal ? (
              <div className={isExpanded ? 'pl-[20px]' : ''}>
                <Link href={href} target="_blank">
                  <ExternalLinkLine
                    className="cursor-pointer !fill-mono-100 dark:!fill-mono-60 group-hover:!fill-mono-200 dark:group-hover:!fill-mono-0"
                    width={24}
                    height={24}
                  />
                </Link>
              </div>
            ) : (
              ''
            )}
          </>
        )}
      </div>

      {isExpanded && (
        <ThemeToggle useNextThemes={useNextThemesForThemeToggle} />
      )}
    </div>
  );
};
