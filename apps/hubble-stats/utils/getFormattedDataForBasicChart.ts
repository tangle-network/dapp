import { getDateFromEpoch } from './date';

const getFormattedDataForBasicChart = (data: { [epoch: string]: number }) => {
  return Object.keys(data).map((epoch) => {
    return {
      date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
      value: data[+epoch],
    };
  });
};

export default getFormattedDataForBasicChart;
