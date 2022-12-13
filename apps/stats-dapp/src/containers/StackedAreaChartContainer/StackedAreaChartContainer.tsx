import {
  Card,
  TitleWithInfo,
  Chip,
} from '@webb-tools/webb-ui-components/components';
import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { FC, useState, useMemo } from 'react';

export type TimeRange = 'Day' | 'Week' | 'Year' | 'All Time';

type StackedAreaChartContainer = {
  isLoading: boolean;
};

export const StackedAreaChartContainer: FC<StackedAreaChartContainer> = ({
  isLoading,
}) => {
  const [timeRange, setTimeRange] = useState('all');

  return (
    <Card className="flex flex-col space-y-4 max-w-full">
      <div className="flex items-center justify-between px-12">
        <TitleWithInfo
          title="Proposals Overtime"
          variant="h5"
          info="Proposals Overtime"
        />
        <div className="flex items-center justify-between gap-5">
          <Chip
            color="blue"
            className="px-3 py-1 cursor-pointer"
            isSelected={timeRange === 'all' ? true : false}
            onClick={() => setTimeRange('all')}
          >
            All
          </Chip>
          <Chip
            color="blue"
            className="px-3 py-1 cursor-pointer"
            isSelected={timeRange === 'one-month' ? true : false}
            onClick={() => setTimeRange('one-month')}
          >
            1M
          </Chip>
          <Chip
            color="blue"
            className="px-3 py-1 cursor-pointer"
            isSelected={timeRange === 'six-months' ? true : false}
            onClick={() => setTimeRange('six-months')}
          >
            6M
          </Chip>
          <Chip
            color="blue"
            className="px-3 py-1 cursor-pointer"
            isSelected={timeRange === 'one-year' ? true : false}
            onClick={() => setTimeRange('one-year')}
          >
            1Y
          </Chip>
          <Chip
            color="blue"
            className="px-3 py-1 cursor-pointer"
            isSelected={timeRange === 'year-to-date' ? true : false}
            onClick={() => setTimeRange('year-to-date')}
          >
            YTD
          </Chip>
        </div>
      </div>

      <div className="flex gap-4 px-12">
        {/* CHART */}
        <div className="border-2 border-red w-2/3 p-2">
          <Spinner className="block mx-auto" />
        </div>
        {/* LEGEND */}
        <div className="border-2 border-red w-1/3 p-2">LEGEND</div>
      </div>
    </Card>
  );
};
