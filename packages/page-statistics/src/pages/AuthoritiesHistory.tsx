import { randNumber } from '@ngneat/falso';
import { Button, DropdownMenu, TitleWithInfo } from '@webb-dapp/webb-ui-components/components';
import { useDarkMode } from '@webb-dapp/webb-ui-components/hooks';
import { ArrowLeft } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { range } from '@webb-dapp/webb-ui-components/utils';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend as CLegend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import cx from 'classnames';
import { WebbColorsType } from 'page-statistics/types';
import { ComponentProps, FC, useCallback, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from /* preval */ '../../tailwind.config.js';
import { useSessionThreshold } from '@webb-dapp/page-statistics/provider/hooks/useSession';

const fullConfig = resolveConfig(tailwindConfig);

const webbColors = fullConfig.theme?.colors as unknown as WebbColorsType;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, CLegend);

const AuthoritiesHistory = () => {
  const historyOpts = useMemo(() => ['lastest session', 'all time'], []);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [isDarkMode, _] = useDarkMode();

  const menuOptions = useMemo<ComponentProps<typeof DropdownMenu>['menuOptions']>(
    () =>
      historyOpts.reduce((acc, cur) => {
        return [...acc, { value: cur }];
      }, [] as ComponentProps<typeof DropdownMenu>['menuOptions']),
    [historyOpts]
  );

  const onChange = useCallback(
    (nextVal: string) => {
      setSelectedIdx(historyOpts.indexOf(nextVal));
    },
    [historyOpts]
  );
  const thresholdHistory = useSessionThreshold();

  const data = useMemo<ChartData<'bar'>>(() => {
    const labels = thresholdHistory.val?.map((i) => i.sessionId) ?? [];
    const sig = thresholdHistory.val?.map((i) => i.signatureThreshold) ?? [];
    const keygen = thresholdHistory.val?.map((i) => i.keygenThreshold) ?? [];
    console.log({
      labels,
      sig,
      keygen,
    });
    return {
      labels,
      datasets: [
        {
          label: 'Keygen Threshold',
          data: keygen,
          backgroundColor: webbColors.purple['100'],
        },
        {
          label: 'Signature Threshold',
          data: sig,
          backgroundColor: webbColors.purple['60'],
        },
      ],
    };
  }, [thresholdHistory]);
  const options = useMemo<ChartOptions<'bar'>>(
    () => ({
      scales: {
        x: {
          stacked: !!selectedIdx,
          grid: {
            display: false,
            borderColor: webbColors.mono['80'],
          },
          ticks: {
            color: isDarkMode ? webbColors.mono['60'] : webbColors.mono['200'],
          },
        },
        y: {
          stacked: !!selectedIdx,
          grid: {
            display: false,
            borderColor: webbColors.mono['80'],
          },
          ticks: {
            color: isDarkMode ? webbColors.mono['60'] : webbColors.mono['200'],
          },
        },
      },
      responsive: true,
      plugins: {
        legend: {
          display: false,
          position: 'bottom' as const,
        },
        title: {
          display: false,
          position: 'bottom' as const,
          text: 'Session',
        },
      },
    }),
    [isDarkMode, selectedIdx]
  );

  return (
    <div className='flex flex-col p-8 space-y-4 rounded-lg bg-mono-0 dark:bg-mono-180'>
      <Link to='/authorities'>
        <Button varirant='utility' size='sm' className='uppercase' leftIcon={<ArrowLeft className='!fill-current' />}>
          Back
        </Button>
      </Link>

      {/** Graph */}
      <div className='flex flex-col space-y-4'>
        {/** Title */}
        <div className='flex items-center justify-between px-8'>
          <TitleWithInfo title='Network Thresholds History' info='Network Thresholds History' variant='h5' />

          <DropdownMenu
            menuOptions={menuOptions}
            size='sm'
            value={menuOptions[selectedIdx].value}
            onChange={onChange}
          />
        </div>

        <div className='px-4 pt-4'>
          <Bar options={options} data={data} />
        </div>

        <TitleWithInfo
          title={selectedIdx ? 'Month' : 'Session'}
          info={selectedIdx ? 'Month' : 'Session'}
          className='justify-center'
        />

        <div className='flex items-center justify-center space-x-2'>
          <Legend bgColorClsx='bg-purple-100'>{selectedIdx ? 'Avarage ' : ''}Keygen Threshold</Legend>
          <Legend bgColorClsx='bg-purple'>{selectedIdx ? 'Avarage ' : ''}Signature Threshold</Legend>
        </div>
      </div>
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const Legend: FC<{ bgColorClsx: string }> = ({ bgColorClsx, children }) => {
  return (
    <div className='flex items-center space-x-2'>
      <div className={cx('w-1 h-1', bgColorClsx)} />

      <Typography variant='body3' component='span' className='inline-block'>
        {children}
      </Typography>
    </div>
  );
};

export default AuthoritiesHistory;
