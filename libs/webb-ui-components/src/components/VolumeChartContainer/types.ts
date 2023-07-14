export type VolumeChartContainerProps = {
  currentVolumeValue: number;
  volumeValue: number | null;
  setVolumeValue: (value: number | null) => void;
  volumeDate: Date | null;
  setVolumeDate: (date: Date | null) => void;
  volumeData: any;
  isDarkMode: boolean;
};
