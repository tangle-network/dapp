'use client';

import {
  Chip,
  formatDateToUtc,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import useServiceInfoCard from '../../../data/serviceDetails/useServiceInfoCard';
import { getChipColorOfServiceType } from '../../../utils';

interface InfoCardProps {
  serviceId: string;
  className?: string;
}

const InfoCard: FC<InfoCardProps> = ({ serviceId, className }) => {
  const { serviceType, threshold, endDate } = useServiceInfoCard();

  return (
    <div
      className={twMerge(
        'p-5 space-y-4 rounded-2xl',
        'bg-glass dark:bg-glass_dark',
        'border border-mono-0 dark:border-mono-160',
        className,
      )}
    >
      <Typography variant="h4" fw="bold">
        Service Details
      </Typography>

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-1">
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0 whitespace-nowrap"
            >
              Phase 1 ID: {serviceId}
            </Typography>

            <div className="flex items-center gap-1">
              {serviceType && (
                <Chip
                  color={getChipColorOfServiceType(serviceType)}
                  className="whitespace-nowrap"
                >
                  {serviceType}
                </Chip>
              )}
              {threshold && (
                <Tooltip>
                  <TooltipTrigger>
                    <Chip color="dark-grey" className="py-1">
                      {threshold}
                    </Chip>
                  </TooltipTrigger>
                  <TooltipBody>Threshold</TooltipBody>
                </Tooltip>
              )}
            </div>
          </div>

          {endDate && (
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0 whitespace-nowrap"
            >
              {/* Check if the service has ended or not */}
              {endDate.getTime() > new Date().getTime()
                ? 'Expect to end at'
                : 'Ended at'}
              : {formatDateToUtc(endDate)}
            </Typography>
          )}
        </div>

        {/* TODO: cannot get start date with Polkadotjs */}
        {/* <TimeProgress
          startTime={startTimestamp}
          endTime={endTimestamp}
          labelClassName="text-mono-200 dark:text-mono-0"
        /> */}
      </div>
    </div>
  );
};

export default InfoCard;
