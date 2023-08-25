export type ChartContainerProps = {
  heading?: string;
  currentValue?: number;
  value: number | null;
  date: Date | null;
  filterType?: 'days' | 'tokensAndChains';

  // Days filter
  daysFilterType?: DaysFilterType;
  setDaysFilterType?: (daysFilterType: DaysFilterType) => void;

  //TODO:  Tokens and chains filter

  className?: string;
  children: React.ReactNode;

  valuePrefix?: string;
  valueSuffix?: string;
};

export type DaysFilterType = 'day' | 'week' | 'month';
