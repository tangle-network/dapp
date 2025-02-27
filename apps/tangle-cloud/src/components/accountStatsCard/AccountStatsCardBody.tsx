import { type FC } from 'react';
import {
  Socials,
  StatsItem,
  Typography,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import { AccountStatsCardBodyProps } from '.';

export const AccountStatsCardBody: FC<AccountStatsCardBodyProps> = ({
  children,
  className,
  totalRestake = EMPTY_VALUE_PLACEHOLDER,
  restakers = EMPTY_VALUE_PLACEHOLDER,
  socialLinks = [],
  ...props
}) => {
  return (
    <div {...props} className="w-full space-y-5">
      <div className="grid grid-cols-2 gap-2 mb-10">
        <StatsItem
          className="gap-0"
          title={
            <Typography
              variant="label"
              className="text-mono-120 dark:!text-mono-100"
            >
              Total Restaked
            </Typography>
          }
          isError={false}
        >
          {totalRestake}
        </StatsItem>

        <StatsItem
          className="gap-0"
          title={
            <Typography
              variant="label"
              className="text-mono-120 dark:!text-mono-100"
            >
              Restakers
            </Typography>
          }
          tooltip="The total amount of restakers have delegated to this operator."
          isError={false}
        >
          {restakers}
        </StatsItem>
      </div>

      <Socials
        iconPlacement="end"
        iconClassName="text-mono-100 hover:text-mono-200 dark:hover:text-mono-40 dark:bg-mono-0/[20%] rounded-2xl py-1 px-2"
        className="justify-start items-start flex-wrap space-x-0 gap-2 "
        innerIconClassName="!w-1 !h-1 !fill-mono-0"
        socialConfigs={socialLinks}
      />
    </div>
  );
};

AccountStatsCardBody.displayName = 'AccountStatsCardBody';
