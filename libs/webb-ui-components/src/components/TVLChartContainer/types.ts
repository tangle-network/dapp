export type TVLChartContainerProps = {
  currentTvlValue: number;
  tvlValue: number | null;
  setTvlValue: (value: number | null) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  tvlData: any;
  isDarkMode: boolean;
};
