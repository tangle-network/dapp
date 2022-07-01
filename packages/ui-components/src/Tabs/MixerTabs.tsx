import { Fade } from '@material-ui/core';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { DepositIcon } from '../assets/DepositIcon';
import { WithdrawIcon } from '../assets/WithdrawIcon';

type MixerTabsProps = {
  Deposit: JSX.Element;
  Withdraw: JSX.Element;
};

const ContentWrapper = styled.div`
  max-width: 500px;
  margin: auto;
`;

export const TabHeader = styled.header`
  display: flex;
  align-items: center;
  max-width: 500px;
  margin: auto;
  margin-bottom: 24px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.layer1Background};
  justify-content: space-between;
  padding: 7px;
  box-sizing: border-box;
`;

export const TabButton = styled.button<{ active?: boolean }>`
  width: 48%;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease-in-out;
  height: 40px;
  margin: 0 2px;

  .mixer-tab-label {
    font-size: 16px;
    font-weight: ${({ active }) => (active ? '800' : 'normal')};
    color: ${({ theme }) => theme.primaryText};
    display: block;
  }

  background: ${({ active, theme }) => (active ? (theme.type === 'dark' ? theme.accentColor : '#fff') : 'transparent')};
  border-radius: 32px;
`;

export const MixerTabs: React.FC<MixerTabsProps> = ({ Deposit, Withdraw }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const switchToDeposit = useCallback(() => {
    setActiveTab('deposit');
  }, []);

  const switchToWithdraw = useCallback(() => {
    setActiveTab('withdraw');
  }, []);
  const ActiveTab = useMemo(() => {
    switch (activeTab) {
      case 'deposit':
        return Deposit;
      case 'withdraw':
        return Withdraw;
      default:
        return Deposit;
    }
  }, [Deposit, Withdraw, activeTab]);

  return (
    <div>
      <TabHeader>
        <TabButton onClick={switchToDeposit} active={activeTab === 'deposit'}>
          <DepositIcon style={{ display: 'block', marginRight: '8px' }} />
          <span className='mixer-tab-label'>Deposit</span>
        </TabButton>
        <TabButton onClick={switchToWithdraw} active={activeTab === 'withdraw'}>
          <WithdrawIcon style={{ display: 'block', marginRight: '8px' }} />
          <span className='mixer-tab-label'>Withdraw</span>
        </TabButton>
      </TabHeader>
      <ContentWrapper>
        <Fade timeout={300} in unmountOnExit mountOnEnter key={activeTab + 'fade'}>
          <div>{ActiveTab}</div>
        </Fade>
      </ContentWrapper>
    </div>
  );
};
