import { Children, type FC } from 'react';
import { Socials, StatsItem } from '@tangle-network/ui-components';
import { AccountStatsCardBodyProps } from '.';
import cx from 'classnames';

export const AccountStatsCardBody: FC<AccountStatsCardBodyProps> = ({
  children,
  className,
  statsItems = [],
  socialLinks = [],
  ...props
}) => {
  return (
    <div {...props} className="w-full space-y-5">
      <div className="grid grid-cols-2">
        {Children.toArray(
          statsItems.map((item, index) => (
            <StatsItem
              className={cx('gap-0 border-mono-100 dark:border-mono-140 p-2', {
                'border-r': index % 2 === 0,
                'border-b': index < statsItems.length - 2,
                'pl-5': index % 2 === 1,
              })}
              title={item.title}
              tooltip={item.tooltip}
            >
              {item.children}
            </StatsItem>
          )),
        )}
      </div>

      <Socials
        iconPlacement="end"
        iconClassName="text-mono-0 dark:text-mono-100 bg-mono-100 dark:bg-mono-0/[20%] rounded-2xl py-1 px-2"
        className="justify-start items-start flex-wrap space-x-0 gap-2 "
        innerIconClassName="!w-1 !h-1 !fill-mono-0"
        socialConfigs={socialLinks}
      />
    </div>
  );
};

AccountStatsCardBody.displayName = 'AccountStatsCardBody';
