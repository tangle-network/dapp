'use client';

import { useEffect, useState } from 'react';

// Just some simple constants for readability
const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

function dateParser(date: string | number | Date): Date {
  const parsed = new Date(date);
  if (!Number.isNaN(parsed.valueOf())) {
    return parsed;
  }

  const parts = String(date).match(/\d+/g);
  if (parts == null || parts.length <= 2) {
    return parsed;
  } else {
    const [firstP, secondP, ...restPs] = parts.map((x) => parseInt(x));
    const [year, monthIdx, date, hours, minutes, seconds, ms] = [
      firstP,
      secondP - 1,
      ...restPs,
    ];
    const isoDate = new Date(
      Date.UTC(year, monthIdx, date, hours, minutes, seconds, ms)
    );
    return isoDate;
  }
}

function defaultFormatter(
  value: number,
  _unit: string,
  suffix: string
): string {
  const unit = value !== 1 ? _unit + 's' : _unit;

  return value + ' ' + unit + ' ' + suffix;
}

export type TimeAgoOptions = {
  /**
   * If the component should update itself over time
   * @default true
   */
  live?: boolean;

  /**
   * Minimum amount of time in seconds between re-renders
   * @default 0
   */
  minPeriod?: number;

  /**
   * Maximum time between re-renders in seconds. The component should update at least once every `x` seconds
   * @default WEEK
   */
  maxPeriod?: number;

  /**
   * The Date to display. An actual Date object or something that can be fed to new Date
   */
  date: string | number | Date;

  /**
   * A function that returns what Date.now would return. Primarily for server
   * @default Date.now
   */
  now?: () => number;

  /** A function to decide how to format the date.
   * If you use this, react-timeago is basically acting like a glorified setInterval for you.
   */
  formatter?: (
    value: number,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
    suffix: 'ago' | 'from now',
    epochMilliseconds: number,
    nextFormatter: () => React.ReactNode,
    now: () => number
  ) => React.ReactNode;
};

const useTimeAgo = (opts: TimeAgoOptions) => {
  const {
    date,
    live = true,
    maxPeriod = WEEK,
    minPeriod = 0,
    now = () => Date.now(),
    formatter = defaultFormatter,
  } = opts;

  const [timeNow, setTimeNow] = useState(now());

  useEffect(() => {
    const tick = (): 0 | NodeJS.Timeout => {
      const then = dateParser(date).valueOf();
      if (!then) {
        console.warn('Invalid Date provided');
        return 0;
      }
      const seconds = Math.round(Math.abs(timeNow - then) / 1000);

      const unboundPeriod =
        seconds < MINUTE
          ? 1000
          : seconds < HOUR
          ? 1000 * MINUTE
          : seconds < DAY
          ? 1000 * HOUR
          : 1000 * WEEK;

      const period = Math.min(
        Math.max(unboundPeriod, minPeriod * 1000),
        maxPeriod * 1000
      );

      if (period) {
        return setTimeout(() => {
          setTimeNow(now());
        }, period);
      }

      return 0;
    };
    const timeoutId = tick();
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [date, live, maxPeriod, minPeriod, now, timeNow]);

  const then = dateParser(date).valueOf();
  if (!then) {
    return null;
  }

  const seconds = Math.round(Math.abs(timeNow - then) / 1000);
  const suffix = then < timeNow ? 'ago' : 'from now';

  const [value, unit] =
    seconds < MINUTE
      ? ([Math.round(seconds), 'second'] as const)
      : seconds < HOUR
      ? ([Math.round(seconds / MINUTE), 'minute'] as const)
      : seconds < DAY
      ? ([Math.round(seconds / HOUR), 'hour'] as const)
      : seconds < WEEK
      ? ([Math.round(seconds / DAY), 'day'] as const)
      : seconds < MONTH
      ? ([Math.round(seconds / WEEK), 'week'] as const)
      : seconds < YEAR
      ? ([Math.round(seconds / MONTH), 'month'] as const)
      : ([Math.round(seconds / YEAR), 'year'] as const);

  const nextFormatter = defaultFormatter.bind(null, value, unit, suffix);

  return formatter(value, unit, suffix, then, nextFormatter, now);
};

export default useTimeAgo;
