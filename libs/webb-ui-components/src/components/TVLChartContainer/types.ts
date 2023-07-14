export type TVLChartContainerProps = {
  currentTvlValue: number;
  tvlValue: number | null;
  setTvlValue: (value: number | null) => void;
  tvlDate: Date | null;
  setTVLDate: (date: Date | null) => void;
  tvlData: any;
  isDarkMode: boolean;
};
