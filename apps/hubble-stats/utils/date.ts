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
