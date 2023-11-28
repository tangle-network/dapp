'use client';

import type { Nullable } from '@webb-tools/dapp-types/utils/types';
import { useEffect, useState } from 'react';

import { DAY, HOUR, MINUTE, SECOND } from '../constants';

function useTimeRemaining(fromTime: Date | null = null, intervalTime = SECOND) {
  const [days, setDays] = useState<Nullable<number>>(null);
  const [hours, setHours] = useState<Nullable<number>>(null);
  const [minutes, setMinutes] = useState<Nullable<number>>(null);
  const [seconds, setSeconds] = useState<Nullable<number>>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (fromTime == null) return;

      const now = new Date();
      const diff = fromTime.getTime() - now.getTime();

      const diffDays = Math.floor(diff / DAY);
      const diffHours = Math.floor((diff % DAY) / HOUR);
      const diffMinutes = Math.floor((diff % HOUR) / MINUTE);
      const diffSeconds = Math.floor((diff % MINUTE) / SECOND);

      setDays(diffDays);
      setHours(diffHours);
      setMinutes(diffMinutes);
      setSeconds(diffSeconds);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [fromTime, intervalTime]);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export default useTimeRemaining;
