import React from 'react';
import { ExternalLinkLine } from '@webb-tools/icons';
import { Typography } from '../../typography/Typography';
import { twMerge } from 'tailwind-merge';
import { SideBarSubItemProps, SideBarExtraSubItemProps } from './types';
import { Link } from '../Link';

export const SubItem: React.FC<
  SideBarSubItemProps & SideBarExtraSubItemProps
> = ({
  name,
  isInternal,
  href,
  isActive,
  setItemIsActive,
  setSubItemIsActive,
}) => {
  const setIsActive = () => {
    if (setItemIsActive && setSubItemIsActive && isInternal) {
      setItemIsActive();
      setSubItemIsActive();
    }
  };

  return (
    <div onClick={setIsActive}>
      <Link href={href} aTagProps={{ target: '_blank' }}>
        <li className="select-none">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex gap-1">
              <span
                className={twMerge(
                  'h-1 w-1 bg-mono-100 dark:bg-mono-60 rounded-full mt-2 mr-2',
                  isActive && isInternal ? 'bg-mono-200 dark:bg-mono-0' : ''
                )}
              ></span>

              <Typography
                variant="body1"
                className={twMerge(
                  'text-mono-100 dark:text-mono-60',
                  isActive && isInternal ? 'text-mono-200 dark:text-mono-0' : ''
                )}
              >
                {name}
              </Typography>
            </div>

            {!isInternal && href && (
              <ExternalLinkLine
                className={twMerge(
                  '!fill-mono-100 dark:!fill-mono-60',
                  isActive && isInternal
                    ? '!fill-mono-200 dark:!fill-mono-0'
                    : ''
                )}
              />
            )}
          </div>
        </li>
      </Link>
    </div>
  );
};
