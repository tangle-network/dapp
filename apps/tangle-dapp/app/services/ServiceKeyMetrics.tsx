'use client';
import {
  GroupLine,
  ListCheckIcon,
  LoopRightFillIcon,
  TimerLine,
} from '@webb-tools/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { ServicesKeyMetricItem } from '../../components';
import { useEraCountSubscription } from '../../data';
import {
  useActiveParticipantsNum,
  useActiveServicesNum,
  useCompletedServicesNum,
} from '../../data/ServiceKeyMetrics';

const ServiceKeyMetrics: FC = () => {
  const {
    data: eraCount,
    isLoading: eraCountLoading,
    error: eraCountError,
  } = useEraCountSubscription();

  const {
    data: activeParticipantsData,
    isLoading: activeParticipantsLoading,
    error: activeParticipantsError,
  } = useActiveParticipantsNum();

  const {
    data: activeServicesData,
    isLoading: activeServicesLoading,
    error: activeServicesError,
  } = useActiveServicesNum();

  const {
    data: completedServicesNum,
    isLoading: completedServicesLoading,
    error: completedServicesError,
  } = useCompletedServicesNum();

  return (
    <div
      className={twMerge(
        'w-full rounded-2xl overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border border-mono-0 dark:border-mono-160'
      )}
    >
      <div
        className={twMerge(
          'grid grid-cols-2 lg:grid-cols-4',
          '[&>div]:border-r [&>div]:border-mono-40 [&>div]:dark:border-mono-160'
        )}
      >
        <ServicesKeyMetricItem
          title="Current Era"
          Icon={TimerLine}
          isLoading={eraCountLoading}
          isError={!!eraCountError}
          value={eraCount}
          className="border-b lg:border-b-0"
        />
        <ServicesKeyMetricItem
          title="Active Participants"
          Icon={GroupLine}
          isLoading={activeParticipantsLoading}
          isError={!!activeParticipantsError}
          value={activeParticipantsData?.value}
          changeRate={activeParticipantsData?.changeRate}
          className="!border-r-0 lg:!border-r border-b lg:border-b-0"
        />
        <ServicesKeyMetricItem
          title="Active Services"
          Icon={LoopRightFillIcon}
          isLoading={activeServicesLoading}
          isError={!!activeServicesError}
          value={activeServicesData?.value}
          changeRate={activeServicesData?.changeRate}
        />
        <ServicesKeyMetricItem
          title="Completed Services"
          Icon={ListCheckIcon}
          isLoading={completedServicesLoading}
          isError={!!completedServicesError}
          value={completedServicesNum}
          className="!border-r-0"
        />
      </div>
    </div>
  );
};

export default ServiceKeyMetrics;
