import { type FC } from 'react';
import {
  Socials,
  StatsItem,
  Typography,
  Chip,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import { MapPinLine } from '@tangle-network/icons';
import { AccountStatsCardBodyProps } from '.';

export const AccountStatsCardBody: FC<AccountStatsCardBodyProps> = ({
  children,
  className,
  location,
  totalRestake = EMPTY_VALUE_PLACEHOLDER,
  restakers = EMPTY_VALUE_PLACEHOLDER,
  socialLinks = [],
  ...props
}) => {
  return (
    <div {...props} className="w-full space-y-5">
      <div className="grid grid-rows-2 grid-cols-2 gap-2 gap-y-10">
        <StatsItem
          className="gap-0"
          title={
            <Typography
              variant="label"
              className="text-mono-120 dark:!text-mono-100"
            >
              Total Restake
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

        <Socials
          iconPlacement="end"
          iconClassName="text-mono-100 hover:text-mono-200 dark:hover:text-mono-40 dark:bg-mono-0/[20%] rounded-2xl py-1 px-2"
          className="justify-start items-start flex-wrap space-x-0 gap-2 "
          innerIconClassName="!w-1 !h-1 !fill-mono-0"
          socialConfigs={socialLinks}
        />

        <Chip
          color="dark-grey"
          className="flex items-center self-start gap-2 w-fit !dark:bg-mono-0/[20%]"
        >
          <MapPinLine className="!fill-current" />

          {location?.trim() || 'Unknown'}
        </Chip>
      </div>
    </div>
  );
};

AccountStatsCardBody.displayName = 'AccountStatsCardBody';
