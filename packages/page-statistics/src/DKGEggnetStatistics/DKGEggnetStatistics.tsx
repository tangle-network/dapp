import { Typography } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Config } from 'gridjs';
import { Grid } from 'gridjs-react';
import { over } from 'lodash';
import { FC, useEffect, useMemo } from 'react';
import { ChartProps, Doughnut } from 'react-chartjs-2';

import { ChartLabelsWrapper } from './styled/ChartLabelsWrapper.styled';
import { StatisticCard, StatisticCardProps } from './StatisticCard';
import { ChartWrapper, DKGEggnetStatisticsWrapper, DKGSignerWrapper, GridWrapper, StatisticCardsList } from './styled';
import { useDKGEggnetStats } from './useDKGEggnetStats';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DKGEggnetStatistics: FC = () => {
  const { data, fetchData } = useDKGEggnetStats();
  const pallet = useColorPallet();

  const { dkgSigners, overviewData } = useMemo(() => {
    const { dkgSigners, ...overviewData } = data;
    const _dkgSigners = dkgSigners.map((item) => Object.values(item));
    return {
      dkgSigners: _dkgSigners,
      overviewData,
    };
  }, [data]);

  const displayOverviewData = useMemo<StatisticCardProps[]>(() => {
    const keys = Object.keys(overviewData) as (keyof typeof overviewData)[];

    return keys
      .map((key): StatisticCardProps | undefined => {
        switch (key) {
          case 'authorities':
            return {
              title: 'Participants',
              value: overviewData[key],
              description: 'Total number of participants',
            };

          case 'blockNumber':
            return {
              title: 'Latest Blocks',
              value: overviewData[key],
              description: 'Current block number',
            };

          case 'keygenThreshold':
            return {
              title: 'Keygen Threshold',
              value: overviewData[key],
              description: 'Current keygen threshold',
            };

          case 'proposerCount':
            return {
              title: 'Proposers',
              value: overviewData[key],
              description: 'Total number of proposers',
            };

          case 'signatureThreshold':
            return {
              title: 'Signature Threshold',
              value: overviewData[key],
              description: 'Current signature threshold',
            };

          case 'signedProposals':
            return {
              title: 'Signed Proposals',
              value: overviewData[key],
              description: 'Number of signed proposals',
            };

          case 'unsignedProposalQueue':
            return {
              title: 'Unsigned Proposals',
              value: overviewData[key],
              description: 'Number of unsigned proposals in queue',
            };

          default:
            return undefined;
        }
      })
      .filter((item): item is StatisticCardProps => !!item);
  }, [overviewData]);

  const chartColors = useMemo(
    () => ['rgba(243, 26, 26, 1)', 'rgba(9, 156, 0, 1)', 'rgba(44, 155, 212, 1)', 'rgba(184, 224, 0, 1)'],
    []
  );

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

  const chartLabels = useMemo<StatisticCardProps[]>(() => {
    const width = '116px';

    return [
      {
        title: 'Participants',
        value: overviewData['authorities'],
        labelColor: chartColors[0],
        width,
      },
      {
        title: 'Proposers',
        value: overviewData['proposerCount'],
        labelColor: chartColors[1],
        width,
      },
      {
        title: 'Signed Proposals',
        value: overviewData['signedProposals'],
        labelColor: chartColors[2],
        width,
      },
      {
        title: 'Unsigned Proposals',
        value: overviewData['unsignedProposalQueue'],
        labelColor: chartColors[3],
        width,
      },
    ];
  }, [chartColors, overviewData]);

  const chartData = useMemo(() => {
    const { authorities, proposerCount, signedProposals, unsignedProposalQueue } = overviewData;

    return {
      labels: ['Participants', 'Proposers', 'Signed Proposals', 'Unsigned Proposals'],
      datasets: [
        {
          label: 'Dataset',
          data: [authorities, proposerCount, signedProposals, unsignedProposalQueue],
          backgroundColor: chartColors,
          borderColor: chartColors,
          borderWidth: 1,
        },
      ],
    };
  }, [chartColors, overviewData]);

  const gridStyles = useMemo<Config['style']>(
    () =>
      pallet.type !== 'dark'
        ? {}
        : {
            th: {
              color: pallet.secondaryText,
              backgroundColor: pallet.layer1Background,
              border: `1px solid ${pallet.borderColor2}`,
            },
            td: {
              color: pallet.primaryText,
              backgroundColor: pallet.layer2Background,
              border: `1px solid ${pallet.borderColor2}`,
            },
            footer: {
              border: `1px solid ${pallet.borderColor2}`,
              backgroundColor: pallet.layer2Background,
            },
          },
    [pallet]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DKGEggnetStatisticsWrapper>
      <Flex row jc='space-evenly' ai='flex-start' wrap='wrap'>
        <StatisticCardsList>
          {displayOverviewData.map((item) => (
            <StatisticCard {...item} key={item.title} />
          ))}
        </StatisticCardsList>

        <ChartWrapper>
          <Typography variant='h6'>
            <b>Proposals Types and Status</b>
          </Typography>

          <ChartLabelsWrapper>
            {chartLabels.map((item) => (
              <StatisticCard {...item} key={item.title} />
            ))}
          </ChartLabelsWrapper>

          <Doughnut data={chartData} options={chartOpts} />
        </ChartWrapper>
      </Flex>

      <DKGSignerWrapper>
        <Typography variant='h6'>
          <b>DKG Signers</b>
        </Typography>
        <GridWrapper>
          <Grid
            style={gridStyles}
            className={{
              paginationSummary: 'webb-table-pagination-summary',
              paginationButton: 'webb-table-pagination-btn',
              paginationButtonCurrent: 'webb-table-pagination-btn-current',
            }}
            data={dkgSigners}
            columns={[
              {
                name: 'DKG Voters',
                formatter: (cell) => {
                  const cellStr = cell?.toString();
                  return cellStr ? `${cellStr.slice(2, 6)}...${cellStr.slice(-4)}` : cellStr;
                },
              },
              {
                name: 'IP',
              },
              {
                name: 'Uptime',
              },
              {
                name: 'Rewards',
              },
            ]}
            pagination={{
              enabled: true,
              limit: 10,
            }}
          />
        </GridWrapper>
      </DKGSignerWrapper>
    </DKGEggnetStatisticsWrapper>
  );
};
