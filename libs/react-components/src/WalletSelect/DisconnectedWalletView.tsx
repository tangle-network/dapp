import { Avatar, ButtonBase, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { ManagedWallet } from '@nepoche/dapp-config';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { SpaceBox } from '@nepoche/ui-components';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import React from 'react';
import styled from 'styled-components';

const CloseButton = styled.button`
  vertical-align: middle;
`;

const DisconnectedWalletWrapper = styled.div``;

type DisconnectedWalletViewProps = {
  close(): void;
  setSelectedWallet(wallet: ManagedWallet): void;
  wallets: ManagedWallet[];
};

export const DisconnectedWalletView: React.FC<DisconnectedWalletViewProps> = ({
  close,
  setSelectedWallet,
  wallets,
}) => {
  const palette = useColorPallet();

  return (
    <DisconnectedWalletWrapper>
      <Flex row ai={'flex-start'} className={'modal-heading'}>
        <Flex flex={1} col ai='flex-start'>
          <Typography variant={'h3'} color={'textPrimary'}>
            Connect your wallet
          </Typography>
          <SpaceBox height={8} />
          <Typography variant={'h6'} color={'textSecondary'}>
            Select your Wallet Provider
          </Typography>
        </Flex>
        <div style={{ display: 'flex', height: '100%' }}>
          <CloseButton as={ButtonBase} onClick={close}>
            <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M12.5074 10L19.5575 2.94985C20.1475 2.35988 20.1475 1.35693 19.5575 0.766962L19.233 0.442478C18.6431 -0.147493 17.6401 -0.147493 17.0501 0.442478L10 7.49263L2.94985 0.442478C2.35988 -0.147493 1.35693 -0.147493 0.766962 0.442478L0.442478 0.766962C-0.147493 1.35693 -0.147493 2.35988 0.442478 2.94985L7.49263 10L0.442478 17.0501C-0.147493 17.6401 -0.147493 18.6431 0.442478 19.233L0.766962 19.5575C1.35693 20.1475 2.35988 20.1475 2.94985 19.5575L10 12.5074L17.0501 19.5575C17.6401 20.1475 18.6431 20.1475 19.233 19.5575L19.5575 19.233C20.1475 18.6431 20.1475 17.6401 19.5575 17.0501L12.5074 10Z'
                fill={palette.primaryText}
              />
            </svg>
          </CloseButton>
        </div>
      </Flex>
      <SpaceBox height={16} />
      <List>
        {wallets.map((wallet) => {
          return (
            <ListItem
              key={wallet.name}
              disabled={!wallet.enabled}
              button
              onClick={async () => {
                setSelectedWallet(wallet);
                close();
              }}
              sx={{
                borderRadius: '8px',
                marginBottom: '16px',
                background: palette.heavySelectionBackground,
              }}
            >
              <ListItemAvatar>
                <Avatar style={{ background: 'transparent' }}>
                  <wallet.Logo />
                </Avatar>
              </ListItemAvatar>
              <ListItemText>
                <Flex row>
                  <Flex flex={1}>
                    <Typography>{wallet.title.toUpperCase()}</Typography>
                  </Flex>
                </Flex>
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </DisconnectedWalletWrapper>
  );
};
