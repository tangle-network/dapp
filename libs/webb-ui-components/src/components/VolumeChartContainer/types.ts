export type VolumeChartContainerProps = {
  currentVolumeValue: number;
  volumeValue: number | null;
  setVolumeValue: (value: number | null) => void;
  volumeDate: Date | null;
  setVolumeDate: (date: Date | null) => void;
  volumeData: any;
  volumeDataType: VolumeDataType;
  setVolumeDataType: (value: VolumeDataType) => void;
  isDarkMode: boolean;
};

export type VolumeDataType = 'Day' | 'Week' | 'Month';
