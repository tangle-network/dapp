import { Typography } from '@material-ui/core';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Config } from 'gridjs';
import { Grid } from 'gridjs-react';
import { FC, useEffect, useMemo } from 'react';

import { StatisticCard, StatisticCardProps } from './StatisticCard';
import { DKGEggnetStatisticsWrapper, DKGSignerWrapper, GridWrapper, StatisticCardsList } from './styled';
import { useDKGEggnetStats } from './useDKGEggnetStats';

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

  const displayData = useMemo<StatisticCardProps[]>(() => {
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
      <StatisticCardsList>
        {displayData.map((item) => (
          <StatisticCard {...item} key={item.title} />
        ))}
      </StatisticCardsList>

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
