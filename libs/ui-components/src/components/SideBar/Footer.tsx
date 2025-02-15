import { FC } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { ThemeToggle } from '../ThemeToggle';
import { SideBarFooterProps } from './types';

export const SideBarFooter: FC<SideBarFooterProps> = ({
  Icon,
  name,
  href,
  className,
  isExpanded,
}) => {
  return (
    <div
      className={twMerge(
        'flex items-center',
        isExpanded ? 'justify-between' : 'justify-center',
        className,
      )}
    >
      <div className="flex items-center justify-between group">
        {/* TODO: Should make the link generic (not depending on react-router) */}
        <Link to={href} target="_blank">
          <Icon
            width={24}
            height={24}
            className="cursor-pointer !fill-mono-100 dark:!fill-mono-60 group-hover:!fill-mono-200 dark:group-hover:!fill-mono-0"
          />
        </Link>

        {isExpanded && (
          <div className={isExpanded ? 'pl-2' : ''}>
            {/* TODO: Should make the link generic (not depending on react-router) */}
            <Link to={href} target="_blank">
              <Typography
                variant="body1"
                className="cursor-pointer text-mono-100 dark:text-mono-60 group-hover:text-mono-200 dark:group-hover:text-mono-0"
              >
                {name}
              </Typography>
            </Link>
          </div>
        )}
      </div>

      {isExpanded && <ThemeToggle />}
    </div>
  );
};
