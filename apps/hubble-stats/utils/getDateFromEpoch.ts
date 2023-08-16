const getDateFromEpoch = (epoch: number): Date => {
  const d = new Date(0);
  d.setUTCSeconds(epoch);
  return d;
};

export default getDateFromEpoch;
