const getEpochFromDate = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

export default getEpochFromDate;
