export const getDateFromEpoch = (epoch: number): Date => {
  const d = new Date(0);
  d.setUTCSeconds(epoch);
  return d;
};

export const EPOCH_DAY_INTERVAL = 24 * 60 * 60;

const getEpochNow = () => Math.floor(new Date().getTime() / 1000);

const EPOCH_START = process.env.HUBBLE_STATS_EPOCH_START
  ? +process.env.HUBBLE_STATS_EPOCH_START
  : 1692144000;

const getEpochStart = () => {
  return EPOCH_START;
};

export const getDateDataForPage = () => {
  const epochStart = getEpochStart();
  const epochNow = getEpochNow();

  return {
    epochStart,
    epochNow,
    numDatesFromStart:
      1 + Math.floor((epochNow - epochStart) / EPOCH_DAY_INTERVAL),
  };
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
