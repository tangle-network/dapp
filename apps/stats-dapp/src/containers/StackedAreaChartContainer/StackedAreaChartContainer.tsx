import { FC, useState, useMemo, useEffect } from 'react';
import {
  Card,
  TitleWithInfo,
  Chip,
} from '@webb-tools/webb-ui-components/components';
import { Spinner } from '@webb-tools/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  useProposalsOvertimeTotalCount,
  TimeRange,
} from '../../provider/hooks';
import { useStatsContext } from '../../provider/stats-provider';
import { WebbColorsType } from '@webb-tools/webb-ui-components/types';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from /* preval */ '../../../tailwind.config.js';
import { Config } from 'tailwindcss';
const fullConfig = resolveConfig(tailwindConfig as Config);
const webbColors = fullConfig.theme?.colors as unknown as WebbColorsType;

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const allProposals = [
  {
    type: 'RefreshVote',
    backgroundColor: '#85DC8E',
  },
  {
    type: 'ProposerSetUpdateProposal',
    backgroundColor: '#9BC5FC',
  },
  {
    type: 'AnchorCreateProposal',
    backgroundColor: '#EAB612',
  },
  {
    type: 'AnchorUpdateProposal',
    backgroundColor: '#4B3AA4',
  },
  {
    type: 'TokenAddProposal',
    backgroundColor: '#A0370B',
  },
  {
    type: 'TokenRemoveProposal',
    backgroundColor: '#288E32',
  },
  {
    type: 'WrappingFeeUpdateProposal',
    backgroundColor: '#EF570D',
  },
  {
    type: 'ResourceIdUpdateProposal',
    backgroundColor: '#624FBE',
  },
  {
    type: 'RescueTokensProposal',
    backgroundColor: '#B5A9F2',
  },
  {
    type: 'MaxDepositLimitUpdateProposal',
    backgroundColor: '#ECF4FF',
  },
  {
    type: 'MinWithdrawalLimitUpdateProposal',
    backgroundColor: '#FFE07C',
  },
  {
    type: 'SetVerifierProposal',
    backgroundColor: '#FFB18B',
  },
  {
    type: 'SetTreasuryHandlerProposal',
    backgroundColor: '#01550A',
  },
  {
    type: 'FeeRecipientUpdateProposal',
    backgroundColor: '#FFEDE4',
  },
];

export const StackedAreaChartContainer = () => {
  const { isDarkMode } = useStatsContext();

  const [timeRange, setTimeRange] = useState<TimeRange>('three-months');

  const { val: proposalOvertimeData, isLoading } =
    useProposalsOvertimeTotalCount(timeRange);

  const chartData = useMemo<ChartData<'line'>>(() => {
    return {
      labels: [...new Set(proposalOvertimeData?.map((data) => data.month))],
      datasets: proposalOvertimeData
        ? allProposals.map((proposal) => {
            return {
              label: proposal.type,
              data: proposalOvertimeData
                .filter(
                  (data) =>
                    data.proposalType.toLocaleLowerCase() ===
                    proposal.type.toLowerCase()
                )
                .map((data) => data.totalCount),
              backgroundColor: proposal.backgroundColor,
              fill: true,
              tension: 0.3,
              borderColor: proposal.backgroundColor,
              borderWidth: 0,
              radius: 0,
              hoverRadius: 0,
            };
          })
        : [],
    };
  }, [proposalOvertimeData]);

  const chartOptions = useMemo<ChartOptions<'line'>>(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 13,
            usePointStyle: true,
            pointStyle: 'rectRounded',
            pointStyleWidth: 16,
            color: isDarkMode ? webbColors.mono['40'] : webbColors.mono['160'],
          },
          align: 'start',
          onHover: (_, legendItem, legend) => {
            const datasetMeta = legend.chart.getDatasetMeta(
              legendItem.datasetIndex ? legendItem.datasetIndex : 0
            )._parsed;
            const totalNumberOfProposals = datasetMeta
              .map((data) => data.y)
              .reduce((accumulator, value) => {
                return accumulator + value;
              }, 0);

            const chart = legend.chart;
            const tooltip = chart.tooltip;

            const length =
              chart.data.datasets[
                legendItem.datasetIndex ? legendItem.datasetIndex : 0
              ].data.length;

            chart.data.datasets[
              legendItem.datasetIndex ? legendItem.datasetIndex : 0
            ].data[length - 1] = totalNumberOfProposals;

            tooltip?.setActiveElements(
              [
                {
                  datasetIndex: legendItem.datasetIndex
                    ? legendItem.datasetIndex
                    : 0,
                  index: length - 1,
                },
              ],
              {
                x: 0,
                y: 0,
              }
            );

            chart.update();
          },
        },
        tooltip: {
          callbacks: {
            title: () => {
              return `Total # of Proposals`;
            },
          },
          mode: 'index',
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: webbColors.mono['100'],
          },
        },
        y: {
          stacked: true,
          grid: {
            color: webbColors.mono['100'],
            borderDash: [4, 4],
          },
          ticks: {
            color: webbColors.mono['100'],
          },
        },
      },
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
    };
  }, [isDarkMode]);

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
            isSelected={timeRange === 'three-months' ? true : false}
            onClick={() => setTimeRange('three-months')}
          >
            3M
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

      <div className="flex items-center justify-between px-12 pt-4 pb-2">
        <TitleWithInfo
          title="Proposal #"
          variant="body2"
          titleClassName="text-mono-200 dark:text-mono-0"
        />
      </div>

      <div className="px-12 max-w-full">
        <div>
          {isLoading ? (
            <Spinner className="block mx-auto" size="xl" />
          ) : (
            <div>
              <Line options={chartOptions} data={chartData} className="h-96" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center pl-[438px]">
        <TitleWithInfo
          title="Month"
          variant="body2"
          titleClassName="text-mono-200 dark:text-mono-0"
        />
      </div>
    </Card>
  );
};
