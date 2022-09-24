import { useDonutColor } from '@webb-dapp/page-statistics/hooks';
import { Card, DropdownMenu, Label, TitleWithInfo } from '@webb-dapp/webb-ui-components/components';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { FC, useMemo, useState } from 'react';
import { ChartProps, Doughnut } from 'react-chartjs-2';

import { DonutDataType } from './types';

const labels = [DonutDataType.Open, DonutDataType.Rejected, DonutDataType.Signed, DonutDataType.Accepted];
const data = [9, 2, 3, 5];

export const DonutChartContainer = () => {
  const menuOptions = useMemo(() => ['Day', 'Week', 'Year', 'All Time'], []);
  const [selectIndex, setSelectIndex] = useState(0);

  const donutColors = useDonutColor();

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: 'Dataset',
          data,
          backgroundColor: labels.map((label) => donutColors[label].bg),
          borderColor: labels.map((label) => donutColors[label].borderColor),
          borderWidth: 1,
        },
      ],
    };
  }, [donutColors]);

  const chartOpts = useMemo<ChartProps['options']>(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
        title: {
          display: false,
          text: 'Proposals Types and Status',
        },
      },
    };
  }, []);

  return (
    <Card className='max-w-[450px]'>
      <div className='flex items-center justify-between'>
        <TitleWithInfo title='Proposal Types' variant='h5' />

        <DropdownMenu
          size='sm'
          menuOptions={menuOptions.map((opt) => ({ value: opt }))}
          value={menuOptions[selectIndex]}
          onChange={(nextVal) => setSelectIndex(menuOptions.indexOf(nextVal))}
        />
      </div>

      <div className='flex justify-center'>
        <div className='w-[196px] h-[196px]'>
          <Doughnut data={chartData} options={chartOpts} />
        </div>
      </div>

      <div className='flex items-center justify-between'>
        {labels.map((label, idx) => (
          <ChartLabel
            key={`${label}-${idx}`}
            label={label}
            value={data[idx].toString()}
            color={donutColors[label].textColor}
          />
        ))}
      </div>
    </Card>
  );
};

/***********************
 * Internal components *
 ***********************/

const ChartLabel: FC<{ label: string; value: string; color: string }> = (props) => {
  return (
    <div>
      <Typography variant='h5' fw='bold' className='inline-block mr-2' style={{ color: props.color }}>
        {props.value}
      </Typography>
      <Label style={{ color: props.color }}>{props.label}</Label>
    </div>
  );
};
