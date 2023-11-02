import { ExternalLinkLine } from '@webb-tools/icons';
import cx from 'classnames';
import React, { useMemo } from 'react';
import type { EventFor } from '../../types';
import { Typography } from '../../typography/Typography';
import isSideBarItemActive from '../../utils/isSideBarItemActive';
import { Link } from '../Link';
import WithInfo from './WithInfo';
import { SideBarExtraSubItemProps, SideBarSubItemProps } from './types';
import useLinkProps from './useLinkProps';

export const SubItem: React.FC<
  SideBarSubItemProps & SideBarExtraSubItemProps
> = ({
  name,
  isInternal,
  href,
  isNext,
  isActive: isActiveProp,
  isDisabled,
  setItemIsActive,
  setSubItemIsActive,
  info,
  onClick,
  pathnameOrHash,
}) => {
  const linkProps = useLinkProps({ href, isInternal, isNext, isDisabled });

  const setIsActive = (event: EventFor<'a', 'onClick'>) => {
    onClick?.(event);
    if (setItemIsActive && setSubItemIsActive && isInternal) {
      setItemIsActive();
      setSubItemIsActive();
    }
  };

  const isActive = useMemo(() => {
    return isActiveProp || isSideBarItemActive(href, pathnameOrHash);
  }, [href, isActiveProp, pathnameOrHash]);

  return (
    <WithInfo info={info}>
      <Link
        {...linkProps}
        onClick={setIsActive}
        className={cx(
          'px-6 py-3 rounded-full',
          'group hover:bg-mono-20 dark:hover:bg-mono-160',
          { 'pointer-events-none bg-mono-20 dark:bg-mono-160': isActive },
          isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <li className="select-none">
          <div
            className={cx('flex items-center justify-between', {
              'text-mono-200 dark:text-mono-0': isActive && isInternal,
              'text-mono-100 dark:text-mono-100': !isActive || !isInternal,
              'pointer-events-none': isDisabled,
            })}
          >
            <div className="flex items-center gap-4 !text-inherit">
              <DotIcon width={20} height={20} />

              <Typography
                variant="body1"
                fw={isActive ? 'bold' : undefined}
                className="!text-inherit"
              >
                {name}
              </Typography>
            </div>

            {!isInternal && href && (
              <ExternalLinkLine className="hidden group-hover:block !fill-current" />
            )}
          </div>
        </li>
      </Link>
    </WithInfo>
  );
};

function DotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 21 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.564 13.334a3.333 3.333 0 110-6.667 3.333 3.333 0 010 6.667z"
        fill="currentColor"
      />
    </svg>
  );
}
