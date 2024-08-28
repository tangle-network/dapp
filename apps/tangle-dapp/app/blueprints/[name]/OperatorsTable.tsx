'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';

import OperatorsTableUI from '../../../components/tables/Operators';
import useOperators from './useOperators';

const OperatorsTable: FC = () => {
  const operators = useOperators();

  return (
    <div className="space-y-5">
      {/* TODO: add name here */}
      <Typography variant="h4" fw="bold">
        Operators
      </Typography>

      <OperatorsTableUI
        operators={operators.map((o) => ({
          address: o.address,
          identityName: o.identityName,
          restakersCount: o.restakersCount,
          concentrationPercentage: o.concentration,
          tvlInUsd: o.liquidity.usdValue,
          vaultTokens: o.vaults,
        }))}
      />
    </div>
  );
};

export default OperatorsTable;
