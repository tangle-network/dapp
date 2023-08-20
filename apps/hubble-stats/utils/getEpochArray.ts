const getEpochArray = (
  startEpoch: number,
  numberOfDays: number
): Array<number> => {
  return Array.from(
    { length: numberOfDays },
    (_, idx) => startEpoch + idx * 86400
  );
};

export default getEpochArray;
