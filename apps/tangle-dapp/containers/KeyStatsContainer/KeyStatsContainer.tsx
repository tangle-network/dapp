import cx from 'classnames';

import { KeyStatsItem } from '../../components/KeyStatsItem';

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
          'grid lg:gap-1 grid-cols-2 lg:grid-cols-5',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none',
          'lg:[&>div]:even:border-r',
          '[&>div]:border-b [&>div]:border-b-mono-40 [&>div]:dark:border-b-mono-160',
          'lg:[&>div]:nth-last-child(-n+5):border-b-0',
          '[&>div]:nth-last-child(-n+2):border-b-0'
        )}
      >
        {/* Validators */}
        <KeyStatsItem
          title="Validators"
          tooltip="Current # of active validators out of the total allowed."
          className="col-span-2 lg:col-span-1 lg:!border-b-0 !border-r-0 lg:!border-r"
        />

        {/* Waiting validators */}
        <KeyStatsItem
          title="Waiting"
          tooltip="Nodes waiting in line to become active validators."
          className="lg:!border-b-0"
        />

        {/* Active validators */}
        <KeyStatsItem
          title="Active/Nominators"
          tooltip="Current active nominators out of the total possible."
          className="lg:!border-b-0 !border-r-0 lg:!border-r"
        />

        {/* Ideal staked percentage */}
        <KeyStatsItem
          title="Ideal Staked"
          tooltip="The ideal % of all network tokens that should be staked."
          className="!border-b-0"
          suffix="%"
        />

        {/* Inflation percentage */}
        <KeyStatsItem
          title="Inflation"
          tooltip="The yearly % increase in the network’s total token supply."
          className="!border-b-0 !border-r-0"
          suffix="%"
        />
      </div>
    </div>
  );
};
