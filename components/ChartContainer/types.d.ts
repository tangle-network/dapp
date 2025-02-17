export type ChartContainerProps = {
    heading?: string;
    defaultValue?: number;
    value: number | null;
    date: Date | null;
    filterType?: 'days' | 'tokensAndChains';
    daysFilterType?: DaysFilterType;
    setDaysFilterType?: (daysFilterType: DaysFilterType) => void;
    className?: string;
    children: React.ReactNode;
    valuePrefix?: string;
    valueSuffix?: string;
};
export type DaysFilterType = 'day' | 'week' | 'month';
