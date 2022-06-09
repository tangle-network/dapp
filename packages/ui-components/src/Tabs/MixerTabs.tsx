import { Fade } from '@material-ui/core';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { above } from '../utils/responsive-utils';

type MixerTabsProps = {
  Deposit: JSX.Element;
  Withdraw: JSX.Element;
};

const ContentWrapper = styled.div`
  max-width: 500px;
  margin: auto;
  border-radius: 0px 0px 8px 8px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
  `}

  ${above.xs`
    border-radius: 0px 0px 16px 16px;
  `}
`;

const TabHeader = styled.header`
  display: flex;
  align-items: center;
  max-width: 500px;
  margin: auto;
  border: 0.5px solid ${({ theme }) => theme.borderColor};
  border-radius: 16px 16px 0px 0px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  width: ${({ active }) => (active ? '60%' : '40%')};
  display: flex;
  height: 46px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease-in-out;

  ${above.xs`
    width: 50%;
  `}

  .mixer-tab-label {
    font-size: 16px;
    font-weight: ${({ active }) => (active ? '800' : 'normal')};
    color: ${({ active, theme }) => {
      return !active ? theme.primaryText : theme.type === 'dark' ? theme.accentColor : '#000000';
    }};
  }

  background: transparent;
  border-radius: 16px 16px 0px 0px;

  ${({ active, theme }) => {
    if (active) {
      if (theme.type === 'dark') {
        return css`
          border: 2px solid ${theme.accentColor};
        `;
      } else {
        return css`
          border: 1px solid #000;
        `;
      }
    }
  }}

  border-bottom: none;
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
          <span className='mixer-tab-label'>Deposit</span>
        </TabButton>
        <TabButton onClick={switchToWithdraw} active={activeTab === 'withdraw'}>
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
