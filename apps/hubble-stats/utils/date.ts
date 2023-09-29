export const getEpochFromDate = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

export const getDateFromEpoch = (epoch: number): Date => {
  const d = new Date(0);
  d.setUTCSeconds(epoch);
  return d;
};

export const getEpochArray = (
  startEpoch: number,
  numberOfDays: number
): Array<number> => {
  return Array.from(
    { length: numberOfDays },
    (_, idx) => startEpoch + idx * 86400
  );
};

export const EPOCH_DAY_INTERVAL = 24 * 60 * 60;

export const getEpochNow = () => getEpochFromDate(new Date());
export const getEpoch24H = () =>
  getEpochFromDate(new Date()) - EPOCH_DAY_INTERVAL;

const EPOCH_START = process.env.HUBBLE_STATS_EPOCH_START
  ? +process.env.HUBBLE_STATS_EPOCH_START
  : 1692144000;

export const getEpochStart = () => {
  return EPOCH_START;
};

export const getDateNow = () => getDateFromEpoch(getEpochFromDate(new Date()));
export const getDate24H = () =>
  getDateFromEpoch(getEpochFromDate(new Date()) - EPOCH_DAY_INTERVAL);
export const getDate48H = () =>
  getDateFromEpoch(getEpochFromDate(new Date()) - 2 * EPOCH_DAY_INTERVAL);
export const getValidDatesToQuery = () => {
  return [getDateNow(), getDate24H(), getDate48H()];
};

/**
 * Total number of days have passed since the starting epoch
 */
export const getNumDatesFromStart = () => {
  return (
    1 +
    Math.floor(
      (new Date().getTime() / 1000 - getEpochStart()) / EPOCH_DAY_INTERVAL
    )
  );
};

export const getEpochDailyFromStart = () => {
  return getEpochArray(getEpochStart(), getNumDatesFromStart());
};

export const getTimePassedByEpoch = (epoch: number): string => {
  const now = Date.now() / 1000;
  const secondsAgo = now - epoch;

  if (secondsAgo < 60) {
    return `${Math.floor(secondsAgo)} ${
      secondsAgo === 1 ? 'second' : 'seconds'
    } ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
  } else {
    const daysAgo = Math.floor(secondsAgo / 86400);
    return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
  }
};

export const getDatePropsForChart = () => {
  return {
    startingEpoch: getEpochStart(),
    numDatesFromStart: getNumDatesFromStart(),
  };
};
