import {
  Chip,
  CopyWithTooltip,
  TimeProgress,
  Typography,
} from '@webb-tools/webb-ui-components';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { twMerge } from 'tailwind-merge';

import { getServiceDetailsInfo } from '../../../data/ServiceDetails';
import { getChipColorByServiceType } from '../../../utils';

interface InfoCardProps {
  serviceId: string;
  className?: string;
}

async function InfoCard({ serviceId, className }: InfoCardProps) {
  const { serviceType, thresholds, key, startTimestamp, endTimestamp } =
    await getServiceDetailsInfo(serviceId);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-1">
            <Typography
              variant="body1"
              fw="bold"
              className="text-mono-200 dark:text-mono-0"
            >
              Phase 1 ID: {serviceId}
            </Typography>
            <Chip color={getChipColorByServiceType(serviceType)}>
              {serviceType}
            </Chip>
            {thresholds && (
              <Chip color="dark-grey" className="py-1">
                {thresholds}
              </Chip>
            )}
          </div>

          {key && (
            <div className="flex items-center gap-2">
              <Typography
                variant="body1"
                fw="bold"
                className="text-mono-200 dark:text-mono-0"
              >
                Key:
              </Typography>
              <div className="overflow-hidden rounded-lg flex items-stretch">
                <div
                  className={twMerge(
                    'bg-mono-20 dark:bg-mono-160 px-3',
                    'flex items-center justify-center'
                  )}
                >
                  <Typography variant="body1">
                    {shortenString(key, 4)}
                  </Typography>
                </div>
                <CopyWithTooltip textToCopy={key} className="rounded-none" />
              </div>
            </div>
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
}

export default InfoCard;
