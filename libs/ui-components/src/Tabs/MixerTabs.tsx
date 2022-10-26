import { Fade } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { DepositIcon } from '../assets/DepositIcon';
import { RightArrowIcon } from '../assets/RightArrow';
import { WithdrawIcon } from '../assets/WithdrawIcon';
import { above } from '@nepoche/responsive-utils';

type MixerTabsProps = {
  Deposit: JSX.Element;
  Transfer?: JSX.Element;
  Withdraw: JSX.Element;
};

const ContentWrapper = styled.div`
  max-width: 500px;
  margin: auto;
`;

export const TabHeader = styled.header<{ size?: 'sm' }>`
  display: flex;
  align-items: center;
  max-width: ${({ size }) => (size === 'sm' ? '196px' : '500px')};
  margin: auto;
  margin-bottom: 24px;
  border-radius: ${({ size }) => (size === 'sm' ? '12px' : '32px')};
  background-color: ${({ theme }) => theme.layer1Background};
  justify-content: space-between;
  padding: 7px;
  box-sizing: border-box;
`;

export const TabButton = styled.button<{ active?: boolean; size?: 'sm' }>`
  width: 48%;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;

  transition: all 0.4s ease-in-out;
  height: ${({ size }) => (size === 'sm' ? '25px' : '40px')};
  margin: 0 2px;
  background: ${({ active, theme }) => (active ? (theme.type === 'dark' ? theme.accentColor : '#fff') : 'transparent')};
  border-radius: ${({ size }) => (size === 'sm' ? '8px' : '32px')};

  .icon {
    display: block;
    margin-right: 4px;

    ${above.xs(css`
      margin-right: 8px;
    `)}
  }

  .mixer-tab-label {
    font-size: 16px;
    font-weight: ${({ active }) => (active ? '800' : 'normal')};
    color: ${({ theme }) => theme.primaryText};
    display: block;
  }
`;

export const MixerTabs: React.FC<MixerTabsProps> = ({ Deposit, Transfer, Withdraw }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'transfer' | 'withdraw'>('deposit');
  const switchToDeposit = useCallback(() => {
    setActiveTab('deposit');
  }, []);
  const switchToTransfer = useCallback(() => {
    setActiveTab('transfer');
  }, []);
  const switchToWithdraw = useCallback(() => {
    setActiveTab('withdraw');
  }, []);
  const ActiveTab = useMemo(() => {
    switch (activeTab) {
      case 'deposit':
        return Deposit;
      case 'transfer':
        return Transfer;
      case 'withdraw':
        return Withdraw;
      default:
        return Deposit;
    }
  }, [Deposit, Transfer, Withdraw, activeTab]);

  return (
    <div>
      <TabHeader>
        <TabButton onClick={switchToDeposit} active={activeTab === 'deposit'}>
          <DepositIcon className='icon' />
          <span className='mixer-tab-label'>Deposit</span>
        </TabButton>
        {Transfer && (
          <TabButton onClick={switchToTransfer} active={activeTab === 'transfer'}>
            <RightArrowIcon />
            <span className='mixer-tab-label'>Transfer</span>
          </TabButton>
        )}
        <TabButton onClick={switchToWithdraw} active={activeTab === 'withdraw'}>
          <WithdrawIcon className='icon' />
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
