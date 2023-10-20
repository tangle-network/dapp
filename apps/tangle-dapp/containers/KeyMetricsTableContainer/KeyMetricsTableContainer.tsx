import cx from 'classnames';
import { cache } from 'react';
import { KeyMetricItem } from '../../components/KeyMetricItem';
import {
  getValidatorsCount,
  getWaitingCount,
  getActiveAndDelegationCount,
  getIdealStakedPercentage,
  getInflationPercentage,
} from '../../data';

const getValidatorsCountData = cache(getValidatorsCount);
const getWaitingCountData = cache(getWaitingCount);
const getActiveAndDelegationCountData = cache(getActiveAndDelegationCount);
const getIdealStakedPercentageData = cache(getIdealStakedPercentage);
const getInflationPercentageData = cache(getInflationPercentage);

export const KeyMetricsTableContainer = () => {
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
          'grid gap-1 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none',
          'md:[&>div]:even:border-r',
          '[&>div]:border-b [&>div]:border-b-mono-40 [&>div]:dark:border-b-mono-160',
          'xl:[&>div]:nth-last-child(-n+5):border-b-0',
          'lg:[&>div]:nth-last-child(-n+4):border-b-0',
          'md:[&>div]:nth-last-child(-n+3):border-b-0',
          '[&>div]:nth-last-child(-n+2):border-b-0'
        )}
      >
        {/* Validators */}
        <KeyMetricItem
          title="Validators"
          tooltip="Current # of active validators out of the total allowed."
          dataFetcher={() => getValidatorsCountData()}
        />
        {/* Waiting */}
        <KeyMetricItem
          title="Waiting"
          tooltip="Nodes waiting in line to become active validators."
          dataFetcher={() => getWaitingCountData()}
        />
        {/* Active/Delegation */}
        <KeyMetricItem
          title="Active/Delegation"
          tooltip="Current active delegations out of the total possible."
          dataFetcher={() => getActiveAndDelegationCountData()}
        />
        {/* Ideal Staked */}
        <KeyMetricItem
          title="Ideal Staked"
          tooltip="The ideal % of all network tokens that should be staked."
          suffix="%"
          dataFetcher={() => getIdealStakedPercentageData()}
        />
        {/* Inflation */}
        <KeyMetricItem
          title="Inflation"
          tooltip="The yearly % increase in the network’s total token supply."
          suffix="%"
          dataFetcher={() => getInflationPercentageData()}
        />
      </div>
    </div>
  );
};