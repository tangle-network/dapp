'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import type { FC } from 'react';

import { END_DATE } from '../../constants';
import useTimeRemaining from '../../hooks/useTimeRemaining';

const TimeRemaining = () => {
  const { days, hours, minutes, seconds } = useTimeRemaining(END_DATE);

  return (
    <div className="space-y-[32px]">
      <Typography
        variant="mkt-small-caps"
        fw="bold"
        className="text-center text-mono-200"
      >
        Time Remaining
      </Typography>
      <div className="flex justify-between gap-6 px-4 md:justify-center md:gap-12">
        <CountdownItem
          timeUnit="Days"
          value={typeof days === 'number' ? days.toString() : null}
        />
        <CountdownItem
          timeUnit="Hours"
          value={typeof hours === 'number' ? hours.toString() : null}
        />
        <CountdownItem
          timeUnit="Minutes"
          value={typeof minutes === 'number' ? minutes.toString() : null}
        />
        <CountdownItem
          timeUnit="Seconds"
          value={typeof seconds === 'number' ? seconds.toString() : null}
        />
      </div>
    </div>
  );
};

export default TimeRemaining;

/** @internal */
const CountdownItem: FC<{ timeUnit: string; value: string | null }> = ({
  timeUnit,
  value,
}) => {
  const convertedValue = !value
    ? '--'
    : value.length === 1
    ? `0${value}`
    : value;

  return (
    <div className="flex flex-col items-center w-full gap-3 md:w-auto">
      <div className="flex w-full gap-3 md:w-auto md:gap-4">
        {convertedValue.split('').map((char, idx) => (
          <div
            className={cx(
              'w-full aspect-[5/8] md:aspect-auto md:w-[55px] md:h-[92px]',
              'border border-mono-0 rounded-xl',
              'flex justify-center items-center',
              'bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0.5)_100%)]',
              'shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
            )}
            key={idx}
          >
            <Typography
              variant="mkt-h3"
              fw="black"
              className="text-center text-mono-200"
            >
              {char}
            </Typography>
          </div>
        ))}
      </div>
      <Typography
        variant="mkt-small-caps"
        fw="black"
        className="text-center text-mono-200"
      >
        {timeUnit}
      </Typography>
    </div>
  );
};
