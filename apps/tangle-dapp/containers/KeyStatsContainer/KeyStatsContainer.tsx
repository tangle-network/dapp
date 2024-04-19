import { twMerge } from 'tailwind-merge';

import ActiveValidatorsKeyStat from './ActiveValidatorsKeyStat';
import ActualStakedPercentageKeyStat from './ActualStakedPercentageKeyStat';
import IdealStakedPercentageKeyStat from './IdealStakedPercentageKeyStat';
import InflationPercentageKeyStat from './InflationPercentageKeyStat';
import ValidatorCountKeyStat from './ValidatorCountKeyStat';
import WaitingValidatorsKeyStat from './WaitingValidatorsKeyStat';

export const KeyStatsContainer = () => {
  return (
    <div
      className={twMerge(
        'w-full rounded-lg overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160'
      )}
    >
      <div
        className={twMerge(
          'grid grid-cols-2 lg:grid-cols-3',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none lg:[&>div]:even:border-r',
          'lg:[&>div]:inline-block lg:[&>div]:basis-0 lg:[&>div]:grow',
          '[&>div]:border-b [&>div]:border-b-mono-40 [&>div]:dark:border-b-mono-160'
        )}
      >
        <ValidatorCountKeyStat />

        <WaitingValidatorsKeyStat />

        <ActiveValidatorsKeyStat />

        <ActualStakedPercentageKeyStat />

        <IdealStakedPercentageKeyStat />

        <InflationPercentageKeyStat />
      </div>
    </div>
  );
};
