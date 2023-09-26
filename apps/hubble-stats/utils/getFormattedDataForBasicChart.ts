import { ChartDataRecord } from '../types';
import { getDateFromEpoch } from './date';

const getFormattedDataForBasicChart = (data: ChartDataRecord) => {
  return Object.keys(data).map((epoch) => {
    return {
      date: JSON.parse(
        JSON.stringify(getDateFromEpoch(+epoch))
      ) satisfies Date as Date,
      value: data[+epoch],
    };
  });
};

export default getFormattedDataForBasicChart;
