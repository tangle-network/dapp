import { Typography } from '@mui/material';
import { GridWrapper } from '@webb-dapp/page-statistics/DKGStatistics/styled/shared';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Config, UserConfig } from 'gridjs';
import { Grid } from 'gridjs-react';
import React, { useMemo } from 'react';

import { Wrapper } from '../CastVote/styled';
import { IProposalVoter } from '../useProposalDetail';
import { ChipWrapper } from './styled';

export const VotersTable: React.FC<{ voters: IProposalVoter[] }> = ({ voters }) => {
  const pallet = useColorPallet();
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

  const gridColumns = useMemo<UserConfig['columns']>(() => {
    return [
      {
        name: 'Voter Address',
        formatter: (cell) => {
          const cellStr = cell?.toString();
          return cellStr ? `x${cellStr.slice(2, 6)}...${cellStr.slice(-4)}` : cellStr;
        },
      },
      {
        name: 'Vote',
        formatter: (cell) => (cell ? 'Yes' : 'No'),
      },
      {
        name: 'Payment',
        formatter: (_, row) => {
          const amount = row.cells[1].data;
          const symbol = row.cells[2].data;
          return `${amount} ${symbol}`;
        },
      },
    ];
  }, []);

  const gridData = useMemo(() => {
    return voters.map((voter) => Object.values(voter));
  }, [voters]);

  const GridElement = useMemo(() => {
    return React.createElement(Grid, {
      style: gridStyles,
      className: {
        paginationSummary: 'webb-table-pagination-summary',
        paginationButton: 'webb-table-pagination-btn',
        paginationButtonCurrent: 'webb-table-pagination-btn-current',
      },
      data: gridData,
      columns: gridColumns,
      pagination: {
        enabled: true,
        limit: 5,
      },
    });
  }, [gridColumns, gridData, gridStyles]);
  return (
    <Wrapper hasBorderBottom={false}>
      <Typography variant='h5' component='h6' style={{ fontWeight: 600 }}>
        Voters <ChipWrapper label={voters.length.toString()} />
      </Typography>

      <GridWrapper style={{ marginTop: '12px' }}>{GridElement}</GridWrapper>
    </Wrapper>
  );
};
