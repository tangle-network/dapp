import { getEpochDailyFromStart, getDateFromEpoch } from './date';

type VolumeDataType = {
  [epoch: string]: { deposit: number; withdrawal: number };
};

const getFormattedDataForVolumeChart = (
  depositData: { [epoch: string]: number },
  withdrawalData: { [epoch: string]: number }
) => {
  const volumeData: VolumeDataType = getEpochDailyFromStart().reduce(
    (volumeMap, epoch) => {
      volumeMap[epoch] = {
        deposit: depositData[epoch] ? depositData[epoch] : 0,
        withdrawal: withdrawalData[epoch] ? withdrawalData[epoch] : 0,
      };
      return volumeMap;
    },
    {} as VolumeDataType
  );

  return Object.keys(volumeData).map((epoch) => {
    return {
      date: JSON.parse(JSON.stringify(getDateFromEpoch(+epoch))),
      deposit: volumeData[+epoch].deposit,
      withdrawal: volumeData[+epoch].withdrawal,
    };
  });
};

export default getFormattedDataForVolumeChart;
