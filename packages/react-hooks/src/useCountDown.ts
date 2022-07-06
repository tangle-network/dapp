import { useEffect, useState } from 'react';

/**
 *
 * @param targetDate Represents the target date to count down from
 * @returns an object containing `days`, `hours`, `minutes`, `seconds`, `isExpired` caculated from `targetDate`
 * and `zeroPad` function to format the number
 */
const useCountdown = (targetDate: number) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] = useState(countDownDate - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  /**
   *
   * @param value Represents the value to check for add leading `0`
   * @returns the value with leading `0` if value is less than `10`
   */
  const zeroPad = (value: number) => {
    return value < 10 ? '0' + value.toString() : value.toString();
  };

  return { ...getReturnValues(countDown), zeroPad };
};

/**
 *
 * @param countDown Represents the count down value to calculate time left
 * @returns an object containing `days`, `hours`, `minutes`, `seconds` and `isExpired` caculated from `targetDate`
 */
const getReturnValues = (countDown: number) => {
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: days + hours + minutes + seconds <= 0 };
};

export { useCountdown };
