import { TxButton } from '@webb-dapp/react-components';
import { Alert, Button, Card, Information, styled } from '@webb-dapp/ui-components';
import { BareProps } from '@webb-dapp/ui-components/types';
import React, { FC } from 'react';

import { ReactComponent as AmountIcon } from '../assets/amount-icon.svg';
import { ReactComponent as ReceiveIcon } from '../assets/receive-icon.svg';
import { ReactComponent as WithdrawnIcon } from '../assets/withdrawn-icon.svg';

const TitleRoot = styled.div`
  display: flex;
  align-items: center;

  height: 48px;
  border-radius: 29px;
  border: 1px solid rgba(23, 61, 201, 0.21);
  padding: 6px 12px 6px 6px;
  background: var(--platform-background);

  font-size: 20px;
  color: var(--information-title-color);

  .title__icon {
    position: relative;
    display: grid;
    place-items: center;
    margin-right: 6px;
    width: 36px;
    height: 36px;
    background-color: rgba(1, 85, 255, 0.1);
    border-radius: 50%;

    & > svg {
      margin-right: -4px;
    }
  }
`;

export const WithdrawnTitle: FC<BareProps> = ({ children }) => {
  return (
    <TitleRoot>
      <div className='title__icon'>
        <WithdrawnIcon />
      </div>
      {children}
    </TitleRoot>
  );
};

export const DepositTitle: FC<BareProps> = ({ children }) => {
  return (
    <TitleRoot>
      <div className='title__icon'>
        <WithdrawnIcon />
      </div>
      {children}
    </TitleRoot>
  );
};

export const ReceiveTitle: FC<BareProps> = ({ children }) => {
  return (
    <TitleRoot>
      <div className='title__icon'>
        <ReceiveIcon />
      </div>
      {children}
    </TitleRoot>
  );
};

export const AmountTitle: FC<BareProps> = ({ children }) => {
  return (
    <TitleRoot>
      <div className='title__icon'>
        <AmountIcon />
      </div>
      {children}
    </TitleRoot>
  );
};

export const Addon = styled.div`
  padding: 0 8px;
  font-weight: 500;
  font-size: 18px;
  line-height: 1.1875;
  color: var(--color-primary);
`;

export const Error = styled.div`
  height: 32px;
  border-radius: 16px;
  padding: 8px;
  font-size: 20px;
  line-height: 1.2;
  color: var(--color-white);
  transition: height 0.2s;
  background: var(--color-red);
`;

export const InfoRoot = styled.div`
  padding: 16px;
  border-radius: 10px;
  background: #edf3ff;
  font-size: 16px;
  line-height: 1.1875;
  color: var(--text-color-primary);
`;

export const InfoItem = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const InfoItemLabel = styled.div`
  color: var(--color-primary);
`;

export const InfoItemValue = styled.div`
  color: var(--information-content-color);
`;

export const CardRoot = styled(Card)`
  margin: 48px auto;
  width: 550px;
  height: auto;
  border-radius: 22px;
  box-shadow: var(--card-shadow);

  .card__content {
    padding: 24px;
    padding-bottom: 12px;
  }
`;

export const CardTitle = styled.div`
  font-size: 24px;
  line-height: 1.2083;
  font-weight: 500;
  color: var(--text-color-second);
`;

export const CardSubTitle = styled.div`
  font-size: 16px;
  line-height: 1.1875;
  color: var(--text-color-second);
`;

export const CTxButton = styled(TxButton)`
  margin: 12px auto 0 auto;
  padding: 0 40px;
  border-radius: 10px;
`;

export const CAlert = styled(Alert)`
  padding: 16px;

  .alert__message {
    display: flex;
    align-items: center;
  }
`;

export const CMaxBtn = styled(Button)`
  min-width: auto;
  font-weight: bold;
`;

export const LiquidityInformation: FC = () => {
  return (
    <Information
      content='Liquidity Providers (LPs) earn a x.x% fee on trades proportional to their contribution share of the liquidity pool. Fees are automatically claimed when you withdraw your liquidity. Additional rewards can be earned through the LP Staking program.'
      title='Rewards for Providing Liquidity'
    />
  );
};
