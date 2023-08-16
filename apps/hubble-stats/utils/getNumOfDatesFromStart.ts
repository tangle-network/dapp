import { startingEpoch } from '../constants';

const getNumOfDatesFromStart = () => {
  const today = new Date();
  const todayEpoch = today.getTime() / 1000;
  return 1 + Math.floor((todayEpoch - startingEpoch) / 86400);
};

export default getNumOfDatesFromStart;
