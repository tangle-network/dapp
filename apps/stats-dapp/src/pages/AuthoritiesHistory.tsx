import { useSessionThreshold } from '../provider/hooks/useSession';
import {
  Button,
  DropdownMenu,
  TitleWithInfo,
} from '@webb-tools/webb-ui-components';
import { useDarkMode } from '@webb-tools/webb-ui-components';
import { ArrowLeft } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
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
  PointElement,
  LineElement,
} from 'chart.js';
import cx from 'classnames';
import React, {
  ComponentProps,
  FC,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { WebbColorsType } from '@webb-tools/webb-ui-components/types';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from /* preval */ '../../tailwind.config.js';
import { Config } from 'tailwindcss';

const fullConfig = resolveConfig(tailwindConfig as Config);

const webbColors = fullConfig.theme?.colors as unknown as WebbColorsType;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  CLegend,
  PointElement,
  LineElement
);

const AuthoritiesHistory = () => {
  const historyOpts = useMemo(() => ['lastest session', 'all time'], []);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [isDarkMode, _] = useDarkMode();

  const menuOptions = useMemo<
    ComponentProps<typeof DropdownMenu>['menuOptions']
  >(
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

  const isLatest = useMemo(() => selectedIdx === 0, [selectedIdx]);

  const thresholdHistory = useSessionThreshold(isLatest);

  const data = useMemo<ChartData<'line'>>(() => {
    const labels =
      thresholdHistory.val?.map((i) => i.sessionId).reverse() ?? [];
    const sig =
      thresholdHistory.val?.map((i) => i.signatureThreshold).reverse() ?? [];
    const keygen =
      thresholdHistory.val?.map((i) => i.keygenThreshold).reverse() ?? [];

    return {
      labels,
      datasets: [
        {
          label: 'Keygen Threshold',
          data: keygen,
          borderColor: webbColors.purple['100'],
          tension: 0.1,
        },
        {
          label: 'Signature Threshold',
          data: sig,
          borderColor: webbColors.purple['60'],
          tension: 0.1,
        },
      ],
    };
  }, [thresholdHistory, isLatest]);

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      scales: {
        x: {
          grid: {
            display: false,
            borderColor: webbColors.mono['80'],
          },
          ticks: {
            color: isDarkMode ? webbColors.mono['60'] : webbColors.mono['200'],
            callback: function (value, index, values) {
              return index === 0 ? '' : value;
            },
          },
        },
        y: {
          type: 'linear',
          grid: {
            display: false,
            borderColor: webbColors.mono['80'],
          },
          ticks: {
            color: isDarkMode ? webbColors.mono['60'] : webbColors.mono['200'],
            callback: (value: any) => {
              if (value % 1 === 0) {
                return value;
              }
            },
          },
          min: 0,
          max: 5,
          stepSize: 1,
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
    <div className="flex flex-col p-8 space-y-4 rounded-lg bg-mono-0 dark:bg-mono-180">
      <Link to="/authorities">
        <Button
          variant="utility"
          size="sm"
          leftIcon={<ArrowLeft className="!fill-current" />}
        >
          Back
        </Button>
      </Link>

      {/** Graph */}
      <div className="flex flex-col space-y-4">
        {/** Title */}
        <div className="flex items-center justify-between px-8">
          <TitleWithInfo
            title="Network Thresholds History"
            info="Network Thresholds History"
            variant="h5"
          />

          <DropdownMenu
            menuOptions={menuOptions}
            size="sm"
            value={menuOptions[selectedIdx].value}
            onChange={onChange}
          />
        </div>

        <div className="px-4 pt-4">
          <Line options={options} data={data} />
        </div>

        <TitleWithInfo
          title={selectedIdx ? 'Month' : 'Session'}
          info={selectedIdx ? 'Month' : 'Session'}
          className="justify-center"
        />

        <div className="flex items-center justify-center space-x-2">
          <Legend bgColorClsx="bg-purple-100">
            {selectedIdx ? 'Average ' : ''}Keygen Threshold
          </Legend>
          <Legend bgColorClsx="bg-purple">
            {selectedIdx ? 'Average ' : ''}Signature Threshold
          </Legend>
        </div>
      </div>
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const Legend: FC<{ bgColorClsx: string; children: React.ReactNode }> = ({
  bgColorClsx,
  children,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={cx('w-1 h-1', bgColorClsx)} />

      <Typography variant="body3" component="span" className="inline-block">
        {children}
      </Typography>
    </div>
  );
};

export default AuthoritiesHistory;
