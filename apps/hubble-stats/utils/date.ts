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

const EPOCH_DAY_INTERVAL = 24 * 60 * 60;

export const getEpochNow = () => getEpochFromDate(new Date());
/**
 * Total number of days have passed since the starting epoch
 */

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
