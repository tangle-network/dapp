import React, { FC, useMemo } from 'react';
import { BalanceInputValue, LPExchangeRate, LPSize, LPSizeWithShare } from '@webb-dapp/react-components';
import { styled } from '@webb-dapp/ui-components';
import { InfoItem, InfoItemLabel, InfoItemValue, InfoRoot } from '../common';

const CLPSizeWithShare = styled(LPSizeWithShare)`
  justify-content: center;
  margin-bottom: 24px;
  font-size: 24px;
  line-height: 1.2083;
`;

interface WithdrawInfoProps {
  token: BalanceInputValue;
}

export const WithdrawInfo: FC<WithdrawInfoProps> = ({ token }) => {
  const lpCurrencyId = useMemo(() => {
    return token.token;
  }, [token]);

  return (
    <InfoRoot>
      <CLPSizeWithShare lp={lpCurrencyId} share={token.amount} />
      <InfoItem>
        <InfoItemLabel>Exchange Rate</InfoItemLabel>
        <InfoItemValue>
          <LPExchangeRate lp={lpCurrencyId} />
        </InfoItemValue>
      </InfoItem>
      <InfoItem>
        <InfoItemLabel>Current Pool Size</InfoItemLabel>
        <InfoItemValue>
          <LPSize lp={lpCurrencyId} />
        </InfoItemValue>
      </InfoItem>
    </InfoRoot>
  );
};
