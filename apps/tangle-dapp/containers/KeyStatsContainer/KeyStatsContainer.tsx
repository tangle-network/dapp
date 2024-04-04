import cx from 'classnames';

import ActiveValidatorsKeyStat from './ActiveValidatorsKeyStat';
import ActualStakedPercentageKeyStat from './ActualStakedPercentageKeyStat';
import IdealStakedPercentageKeyStat from './IdealStakedPercentageKeyStat';
import InflationPercentageKeyStat from './InflationPercentageKeyStat';
import ValidatorCountKeyStat from './ValidatorCountKeyStat';
import WaitingValidatorsKeyStat from './WaitingValidatorsKeyStat';

export const KeyStatsContainer = () => {
  return (
    <div
      className={cx(
        'w-full rounded-lg overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160'
      )}
    >
      <div
        className={cx(
          'grid lg:gap-1 grid-cols-2 lg:grid-cols-6',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none',
          'lg:[&>div]:even:border-r',
          '[&>div]:border-b [&>div]:border-b-mono-40 [&>div]:dark:border-b-mono-160',
          'lg:[&>div]:nth-last-child(-n+5):border-b-0',
          '[&>div]:nth-last-child(-n+2):border-b-0'
        )}
      >
        <ValidatorCountKeyStat />

        <WaitingValidatorsKeyStat />

        <ActiveValidatorsKeyStat />

        {/* TODO: check this */}
        <ActualStakedPercentageKeyStat />

        <IdealStakedPercentageKeyStat />

        <InflationPercentageKeyStat />
      </div>
    </div>
  );
};
