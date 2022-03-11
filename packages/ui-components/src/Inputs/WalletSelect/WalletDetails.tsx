import { Avatar, Typography } from '@material-ui/core';
import { WalletId } from '@webb-dapp/apps/configs';
import { AccountManager } from '@webb-dapp/react-components/AccountManager/AccountManager';
import { useWebContext } from '@webb-dapp/react-environment';
import { ManagedWallet } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { useAccounts, useNativeCurrencyBalance, useNativeCurrencySymbol } from '@webb-dapp/react-hooks';
import React, { useMemo } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled, { css } from 'styled-components';

import { getRoundedAmountString } from '../..';

const ColorCircle1 = styled.div<{ color: string }>`
  position: absolute;
  border-radius: 50%;
  top: 80px;
  left: 40px;
  height: 120px;
  width: 120px;
  transform: rotate(-15deg)
  background: ${({ color }) => color};
`;

const ColorCircle2 = styled.div<{ color: string }>`
  position: absolute;
  border-radius: 50%;
  top: 80px;
  left: 60px;
  height: 120px;
  width: 120px;
  transform: rotate(-15deg);
  background: ${({ color }) => color};
`;

const ConnectionDetails = styled.div<{ walletId: number }>`
  display: flex;
  border-radius: 10px;
  width: 100%;
  height: 100px;
  z-index: 104;

  ${({ walletId }) => {
    if (walletId == WalletId.WalletConnectV1)
      return css`
        background: linear-gradient(133.59deg, #286afa 15.85%, #9db1fc 81.66%);
      `;
    else
      return css`
        background: linear-gradient(133.59deg, #fcad3a 15.85%, #fee4bf 81.66%);
      `;
  }}

  .text-section {
    width: 100%;
    display: flex;
    align-items: flex-start;
    margin: 0 20px;
  }

  .text-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
  }
`;

const BottomSelectionWrapper = styled.div`
  display: flex;
  height: 40px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin: 0 20px;

  .wallet-logo-wrapper {
    height: 20px;
    width: 20px;
    background: transparent;
  }

  .copy-button {
    cursor: pointer;
    height: 20px;
    padding: 0 10px;
    border-radius: 14px;
    border: 1px solid ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
  }
`;

const AddressDetails = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 60px;
  margin-top: -20px;
  z-index: 99;
  background: ${({ theme }) => theme.heavySelectionBackground};
  border-radius: 10px;
`;

const AccountName = styled.p`
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 300px;
  overflow: hidden;
  color: ${({ theme }) => theme.primaryText};
`;

type WalletDetailsProps = {
  wallet: ManagedWallet;
};

export const WalletDetails: React.FC<WalletDetailsProps> = ({ wallet }) => {
  const { activeChain } = useWebContext();
  const { active } = useAccounts();
  const name = useMemo(() => active?.name || active?.address || '', [active]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
      <ConnectionDetails walletId={wallet.id}>
        <div className='text-section'>
          <div className='text-container'>
            <Typography style={{ fontSize: '13px', color: 'black' }}>Balance</Typography>
            <Typography style={{ fontSize: '16px', color: 'black' }}>
              {getRoundedAmountString(Number(useNativeCurrencyBalance()))} {useNativeCurrencySymbol()}
            </Typography>
          </div>
          <div className='text-container'>
            <Typography style={{ fontSize: '13px', color: 'black' }}>Network</Typography>
            <Typography style={{ fontSize: '16px', color: 'black' }}>{activeChain?.name}</Typography>
          </div>
          <div className='text-container'>
            <Typography style={{ fontSize: '13px', color: 'black' }}>Wallet</Typography>
            <Typography style={{ fontSize: '16px', color: 'black' }}>{wallet.title}</Typography>
          </div>
        </div>
      </ConnectionDetails>
      <AddressDetails>
        <BottomSelectionWrapper>
          <Avatar className={'wallet-logo-wrapper'}>
            <wallet.logo />
          </Avatar>
          <div style={{ display: 'flex', flexGrow: '1', paddingLeft: '10px' }}>
            {wallet.id === WalletId.Polkadot ? (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                <AccountManager />
              </div>
            ) : (
              <>
                <AccountName>{name}</AccountName>
              </>
            )}
          </div>
          <CopyToClipboard text={active?.address} {...({ className: 'copy-button' } as any)}>
            <Typography style={{ fontSize: '13px' }}>
              <b>COPY</b>
            </Typography>
          </CopyToClipboard>
        </BottomSelectionWrapper>
      </AddressDetails>
    </div>
  );
};
