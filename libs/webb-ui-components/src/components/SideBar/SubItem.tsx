import { ExternalLinkLine } from '@webb-tools/icons';
import React, { useMemo } from 'react';
import isSideBarItemActive from '../../utils/isSideBarItemActive';
import { Typography } from '../../typography/Typography';
import { Link } from '../Link';
import cx from 'classnames';
import { SideBarExtraSubItemProps, SideBarSubItemProps } from './types';
import useLinkProps from './useLinkProps';
import WithInfo from './WithInfo';

export const SubItem: React.FC<
  SideBarSubItemProps & SideBarExtraSubItemProps
> = ({
  name,
  isInternal,
  href,
  isNext,
  isActive: isActiveProp,
  setItemIsActive,
  setSubItemIsActive,
  info,
}) => {
  const linkProps = useLinkProps({ href, isInternal, isNext });

  const setIsActive = () => {
    if (setItemIsActive && setSubItemIsActive && isInternal) {
      setItemIsActive();
      setSubItemIsActive();
    }
  };

  const isActive = useMemo(() => {
    return isActiveProp || isSideBarItemActive(href);
  }, [href, isActiveProp]);

  return (
    <WithInfo info={info}>
      <Link
        {...linkProps}
        onClick={setIsActive}
        className={cx(
          'px-6 py-3 rounded-full',
          'group hover:bg-mono-20 dark:hover:bg-mono-160',
          { 'pointer-events-none bg-mono-20 dark:bg-mono-160': isActive }
        )}
      >
        <li className="select-none">
          <div
            className={cx('flex items-center justify-between cursor-pointer', {
              'text-mono-200 dark:text-mono-0': isActive && isInternal,
              'text-mono-100 dark:text-mono-100': !isActive || !isInternal,
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
