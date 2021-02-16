import { BalanceInputValue, FormatBalance } from '@webb-dapp/react-components';
import { useApi } from '@webb-dapp/react-hooks';
import { FixedPointNumber } from '@webb-tools/sdk-core';
import React, { FC, useMemo } from 'react';
import styled from 'styled-components';

import { InfoItem, InfoItemLabel, InfoItemValue, InfoRoot } from '../common';

const DepositBalance = styled(FormatBalance)`
  display: block;
  margin-bottom: 24px;
  font-size: 24px;
  line-height: 1.2083;
  text-align: center;
`;

interface DepositInfoProps {
  token1: BalanceInputValue;
  token2: BalanceInputValue;
}

export const WithdrawNote: FC<DepositInfoProps> = ({ token1, token2 }) => {
  const { api } = useApi();
  const balancePairs = useMemo(() => {
    return [
      {
        balance: new FixedPointNumber(token1.amount || 0),
        currency: token1.token,
      },
      {
        balance: new FixedPointNumber(token2.amount || 0),
        currency: token2.token,
      },
    ];
  }, [token1, token2]);

  return (
    <InfoRoot>
      <DepositBalance pair={balancePairs} pairSymbol='+' />
      <InfoItem>
        <InfoItemLabel>Exchange Rate</InfoItemLabel>
        <InfoItemValue></InfoItemValue>
      </InfoItem>
      <InfoItem>
        <InfoItemLabel>Current Pool Size</InfoItemLabel>
        <InfoItemValue></InfoItemValue>
      </InfoItem>
    </InfoRoot>
  );
};
