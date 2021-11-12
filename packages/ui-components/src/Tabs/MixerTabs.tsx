import { Fade } from '@material-ui/core';
import { ContentWrapper } from '@webb-dapp/ui-components/ContentWrappers';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

type MixerTabsProps = {
  Deposit: JSX.Element;
  Withdraw: JSX.Element;
};
const TabHeader = styled.header`
  display: flex;
  align-items: center;
  background: ${({ theme }: { theme: Pallet }) => theme.tabHeader};

  justify-content: space-between;
  padding: 7px;
  border-radius: 32px;
`;
const TabButton = styled.button<{ active?: boolean }>`
  width: 48%;
  display: flex;
  height: 46px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease-in-out;
  margin: 0 2px;

  .mixer-tab-icon {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }
  .mixer-tab-label {
    font-size: 16px;
  }
  color: ${({ active, theme }) => {
    return !active ? (theme as Pallet).primaryText : (theme as Pallet).darkGray;
  }};

  ${({ active }) => {
    return active
      ? css`
          background: #ffffff;
          box-shadow: 0px 0px 14px rgba(54, 86, 233, 0.1);
        `
      : css`
          background: transparent;
        `;
  }}
  border-radius: 32px;
`;

const TabContent = styled.div`
  padding: 16px 0;
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
    <ContentWrapper>
      <TabHeader>
        <TabButton onClick={switchToDeposit} active={activeTab === 'deposit'}>
          <span className='mixer-tab-icon'>
            <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <circle cx='18' cy='18' r='18' fill='#3351F2' />
              <path
                d='M17.2929 27.1923C17.6834 27.5828 18.3166 27.5828 18.7071 27.1923L25.0711 20.8284C25.4616 20.4378 25.4616 19.8047 25.0711 19.4141C24.6805 19.0236 24.0474 19.0236 23.6569 19.4141L18 25.071L12.3431 19.4141C11.9526 19.0236 11.3195 19.0236 10.9289 19.4141C10.5384 19.8047 10.5384 20.4378 10.9289 20.8284L17.2929 27.1923ZM17 9.51465L17 26.4852L19 26.4852L19 9.51465L17 9.51465Z'
                fill='white'
              />
            </svg>
          </span>
          <span className='mixer-tab-label'>Deposit</span>
        </TabButton>
        <TabButton onClick={switchToWithdraw} active={activeTab === 'withdraw'}>
          <span className='mixer-tab-icon'>
            <svg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <circle cx='18' cy='18' r='18' fill='#52B684' />
              <path
                d='M17.2929 9.29289C17.6834 8.90237 18.3166 8.90237 18.7071 9.29289L25.0711 15.6569C25.4616 16.0474 25.4616 16.6805 25.0711 17.0711C24.6805 17.4616 24.0474 17.4616 23.6569 17.0711L18 11.4142L12.3431 17.0711C11.9526 17.4616 11.3195 17.4616 10.9289 17.0711C10.5384 16.6805 10.5384 16.0474 10.9289 15.6569L17.2929 9.29289ZM17 26L17 10L19 10L19 26L17 26Z'
                fill='white'
              />
            </svg>
          </span>
          <span className='mixer-tab-label'>Withdraw</span>
        </TabButton>
      </TabHeader>
      <Fade timeout={300} in unmountOnExit mountOnEnter key={activeTab + 'fade'}>
        <TabContent>{ActiveTab}</TabContent>
      </Fade>
    </ContentWrapper>
  );
};
