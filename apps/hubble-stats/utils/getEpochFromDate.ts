const getEpochFromDate = (date: Date): number => {
  return date.getTime() / 1000;
};

export default getEpochFromDate;
