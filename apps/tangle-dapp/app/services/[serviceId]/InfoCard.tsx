'use client';

import { Chip, TimeProgress, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { useServiceDetailsInfo } from '../../../data/ServiceDetails';
import { getChipColorOfServiceType } from '../../../utils';

interface InfoCardProps {
  serviceId: string;
  className?: string;
}

const InfoCard: FC<InfoCardProps> = ({ serviceId, className }) => {
  const { serviceType, thresholds, startTimestamp, endTimestamp } =
    useServiceDetailsInfo(serviceId);

  return (
    <div
      className={twMerge(
        'p-5 space-y-4 rounded-2xl',
        'bg-glass dark:bg-glass_dark',
        'border border-mono-0 dark:border-mono-160',
        className
      )}
    >
      <Typography variant="h4" fw="bold">
        Service Details
      </Typography>

      <div className="space-y-3">
        <div className="flex items-center gap-1">
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            Phase 1 ID: {serviceId}
          </Typography>
          <Chip color={getChipColorOfServiceType(serviceType)}>
            {serviceType}
          </Chip>
          {thresholds && (
            <Chip color="dark-grey" className="py-1">
              {thresholds}
            </Chip>
          )}
        </div>

        <TimeProgress
          startTime={startTimestamp}
          endTime={endTimestamp}
          labelClassName="text-mono-200 dark:text-mono-0"
        />
      </div>
    </div>
  );
};

export default InfoCard;
