import React, { FC, useEffect, useMemo } from 'react';

import { StatisticCard, StatisticCardProps } from './StatisticCard';
import { DKGEggnetStatisticsWrapper, StatisticCardsList } from './styled';
import { DKGEggnetData, useDKGEggnetStats } from './useDKGEggnetStats';

export const DKGEggnetStatistics: FC = () => {
  const { data, fetchData } = useDKGEggnetStats();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { dkgSigners: _, overviewData } = useMemo(() => {
    const { dkgSigners, ...overviewData } = data;

    return {
      dkgSigners,
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

  return (
    <DKGEggnetStatisticsWrapper>
      <StatisticCardsList>
        {displayData.map((item) => (
          <StatisticCard {...item} key={item.title} />
        ))}
      </StatisticCardsList>
    </DKGEggnetStatisticsWrapper>
  );
};
