import {
  Avatar,
  ButtonBase,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { SupportedWallet } from '@webb-dapp/apps/configs/wallets/supported-wallets.config';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { above } from '@webb-dapp/ui-components/utils/responsive-utils';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import React from 'react';
import styled from 'styled-components';

const WalletMangerWrapper = styled.div`
  ${above.sm`
min-width:540px;

`}
`;
type WalletMangerProps = {
  close(): void;
  setSelectedWallet(wallet: Wallet): void;
  selectedWallet: Wallet | null;
  wallets: Wallet[];
};

const CloseManagerButton = styled.button``;

const WalletManagerContentWrapper = styled.div`
  padding: 1rem;

  .modal-heading {
    padding: 0 0.9rem;
  }
`;
const Badge = styled.span`
  background: red;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(51, 81, 242, 0.09);
  color: ${({ theme }) => theme.primary};
  margin: 0 9px;
`;

const StyledListItem = styled.li`
  && {
    border-radius: 12px;

    :hover,
    &.selected {
      background: #f3f5fe;
    }
  }
`;

type Wallet = {
  connected: boolean;
} & Omit<SupportedWallet, 'detect'>;

export const WalletManger: React.FC<WalletMangerProps> = ({ close, selectedWallet, setSelectedWallet, wallets }) => {
  async function handleWalletSelection(walletSelection: Wallet) {
    if (walletSelection.name === 'wallet connect') {
      const provider = new WalletConnectProvider({
        rpc: {
          1: 'https://mainnet.mycustomnode.com',
          3: 'https://ropsten.mycustomnode.com',
          42: 'http://localhost:9933',
          // ...
        },
      });
      const web3 = await Web3Provider.fromWalletConnectProvider(provider);
      const isConnected = await web3.eth.net.isListening();
      if (isConnected) {
        setSelectedWallet(walletSelection);
      }
    } else {
      setSelectedWallet(walletSelection);
      close();
    }
  }

  return (
    <WalletMangerWrapper>
      <WalletManagerContentWrapper>
        <Flex row ai={'center'} as={'header'}>
          <Flex flex={1} row ai='center'>
            <Typography variant={'h5'} color={'textPrimary'} className={'modal-heading'}>
              Select your wallet
            </Typography>
            <Badge color={'primary'}>{wallets.length}</Badge>
          </Flex>
          <Flex>
            <Tooltip title={'close'}>
              <CloseManagerButton as={ButtonBase} onClick={close}>
                <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M12.5074 10L19.5575 2.94985C20.1475 2.35988 20.1475 1.35693 19.5575 0.766962L19.233 0.442478C18.6431 -0.147493 17.6401 -0.147493 17.0501 0.442478L10 7.49263L2.94985 0.442478C2.35988 -0.147493 1.35693 -0.147493 0.766962 0.442478L0.442478 0.766962C-0.147493 1.35693 -0.147493 2.35988 0.442478 2.94985L7.49263 10L0.442478 17.0501C-0.147493 17.6401 -0.147493 18.6431 0.442478 19.233L0.766962 19.5575C1.35693 20.1475 2.35988 20.1475 2.94985 19.5575L10 12.5074L17.0501 19.5575C17.6401 20.1475 18.6431 20.1475 19.233 19.5575L19.5575 19.233C20.1475 18.6431 20.1475 17.6401 19.5575 17.0501L12.5074 10Z'
                    fill='#C8CEDD'
                  />
                </svg>
              </CloseManagerButton>
            </Tooltip>
          </Flex>
        </Flex>
        <SpaceBox height={16} />
        <List>
          {wallets.map((wallet) => {
            const connected = wallet.enabled;
            return (
              <StyledListItem
                key={wallet.name}
                classes={{
                  selected: 'selected',
                }}
                disabled={!wallet.enabled}
                selected={connected}
                as={ListItem}
                button
                onClick={async () => {
                  handleWalletSelection(wallet);
                }}
              >
                <ListItemAvatar>
                  <Avatar style={{ background: 'transparent' }}>
                    <wallet.logo />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>
                  <Flex row>
                    <Flex flex={1}>
                      <Typography>{wallet.title}</Typography>
                      <Typography>ETH</Typography>
                    </Flex>
                    {wallet.connected && (
                      <Flex row ai='center' as={Padding} jc={'space-between'}>
                        <svg width='15' height='15' viewBox='0 0 15 15' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M7.5 0C3.35785 0 0 3.35785 0 7.5C0 11.6421 3.35785 15 7.5 15C11.6422 15 15 11.6421 15 7.5C15 3.35785 11.6422 0 7.5 0ZM10.8734 6.22375L7.43652 9.66003C7.31445 9.7821 7.15454 9.84314 6.99463 9.84314C6.83472 9.84314 6.6748 9.7821 6.55273 9.66003L4.98962 8.09692C4.74548 7.85278 4.74548 7.45728 4.98962 7.21313C5.23376 6.96899 5.62927 6.96899 5.87341 7.21313L6.99463 8.33435L9.98962 5.33997C10.2338 5.09583 10.6293 5.09583 10.8734 5.33997C11.1176 5.58411 11.1176 5.97961 10.8734 6.22375Z'
                            fill='#52B684'
                          />
                        </svg>
                        <Padding as='span' x={0.2} />
                        <Typography>Connected</Typography>
                      </Flex>
                    )}
                  </Flex>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton>
                    <SvgIcon fontSize={'small'}>
                      <svg viewBox='0 0 4 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <circle cx='2' cy='2' r='2' fill='#C8CEDD' />
                        <ellipse cx='2' cy='6.25' rx='2' ry='1.75' fill='#C8CEDD' />
                        <circle cx='2' cy='10.5' r='2' fill='#C8CEDD' />
                      </svg>
                    </SvgIcon>
                  </IconButton>
                </ListItemSecondaryAction>
              </StyledListItem>
            );
          })}
        </List>
      </WalletManagerContentWrapper>
    </WalletMangerWrapper>
  );
};
