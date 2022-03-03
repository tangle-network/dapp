import { Fade } from '@material-ui/core';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

type MixerTabsProps = {
  Deposit: JSX.Element;
  Withdraw: JSX.Element;
};

const ContentWrapper = styled.div`
  max-width: 500px;
  margin: auto;
  border-radius: 8px;
  ${({ theme }: { theme: Pallet }) => css`
    background: ${theme.layer1Background};
    border: 1px solid ${theme.borderColor};
  `}
`;

const TabHeader = styled.header`
  display: flex;
  align-items: center;
  max-width: 500px;
  margin: auto;
`;
const TabButton = styled.button<{ active?: boolean }>`
  width: 50%;
  display: flex;
  height: 46px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease-in-out;

  .mixer-tab-label {
    font-size: 16px;
    color: ${({ active, theme }) => {
      return !active ? (theme as Pallet).primaryText : (theme as Pallet).accentColor;
    }};
  }

  ${({ active, theme }) => {
    if (active) {
      if (theme.type === 'dark') {
        return css`
          background: #131313;
          border-right: 1px solid ${theme.accentColor};
          border-top: 1px solid ${theme.accentColor};
          border-left: 1px solid ${theme.accentColor};
        `;
      } else {
        return css`
          background: #ffffff;
          border-right: 1px solid ${theme.accentColor};
          border-top: 1px solid ${theme.accentColor};
          border-left: 1px solid ${theme.accentColor};
        `;
      }
    } else {
      return css`
        background: transparent;
        border-right: 1px solid ${theme.borderColor};
        border-top: 1px solid ${theme.borderColor};
        border-left: 1px solid ${theme.borderColor};
      `;
    }
  }}

  ${({ active, theme }) => {
    if (active) {
      return css`border-right: 1px solid #${theme.accentColor};`
    }
  }}

  border-radius: 12px 12px 0px 0px;
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
          {ActiveTab}
        </Fade>
      </ContentWrapper>
    </div>
  );
};
