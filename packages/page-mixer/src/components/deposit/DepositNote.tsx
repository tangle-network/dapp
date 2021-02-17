import { BalanceInputValue } from '@webb-dapp/react-components';
import { styled } from '@webb-dapp/ui-components';
import React, { FC, useMemo } from 'react';

import { InfoItem, InfoItemLabel, InfoItemValue, InfoRoot } from '../common';

interface WithdrawInfoProps {
  token: BalanceInputValue;
}

export const DepositNote: FC<WithdrawInfoProps> = ({ token }) => {
  const lpCurrencyId = useMemo(() => {
    return token.token;
  }, [token]);

  return (
    <InfoRoot>
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
