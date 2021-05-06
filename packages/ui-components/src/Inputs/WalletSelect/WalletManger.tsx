import {
  Avatar,
  Button,
  ButtonBase,
  Divider,
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
                  const provider = new WalletConnectProvider({
                    rpc: {
                      1: 'https://mainnet.mycustomnode.com',
                      3: 'https://ropsten.mycustomnode.com',
                      // ...
                    },
                  });
                  const web3 = await Web3Provider.fromWalletConnectProvider(provider);
                  const isConnected = await web3.eth.net.isListening();
                  console.log(isConnected);
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
                    {connected && (
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
      <Divider />
      <Padding v as={'footer'}>
        <Flex row ai={'center'}>
          <Flex flex={1}>
            <Button color='primary'>
              <svg width='12' height='16' viewBox='0 0 12 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M0.177376 3.51503C0.121172 3.45784 0.0765611 3.3898 0.0461176 3.31484C0.015674 3.23988 0 3.15948 0 3.07827C0 2.99706 0.015674 2.91666 0.0461176 2.8417C0.0765611 2.76674 0.121172 2.6987 0.177376 2.64151L2.57599 0.180911C2.6319 0.123555 2.69827 0.0780579 2.77132 0.0470172C2.84437 0.0159765 2.92267 8.54667e-10 3.00174 0C3.08081 -8.54667e-10 3.1591 0.0159765 3.23215 0.0470172C3.30521 0.0780579 3.37158 0.123555 3.42749 0.180911C3.4834 0.238266 3.52775 0.306358 3.55801 0.381297C3.58827 0.456235 3.60384 0.536554 3.60384 0.617668C3.60384 0.698781 3.58827 0.7791 3.55801 0.854039C3.52775 0.928978 3.4834 0.997069 3.42749 1.05442L2.04829 2.46312H7.79896C8.91222 2.46312 9.97989 2.91679 10.7671 3.72433C11.5543 4.53188 11.9965 5.62714 11.9965 6.76917C11.9965 6.93232 11.9333 7.08879 11.8209 7.20415C11.7084 7.31951 11.5559 7.38432 11.3969 7.38432C11.2378 7.38432 11.0853 7.31951 10.9729 7.20415C10.8604 7.08879 10.7972 6.93232 10.7972 6.76917C10.7972 6.36526 10.7197 5.9653 10.569 5.59213C10.4183 5.21897 10.1975 4.8799 9.91905 4.59429C9.64063 4.30868 9.31011 4.08212 8.94634 3.92755C8.58258 3.77298 8.19269 3.69342 7.79896 3.69342H2.04829L3.42749 5.10212C3.4837 5.1593 3.52831 5.22734 3.55875 5.3023C3.58919 5.37726 3.60487 5.45767 3.60487 5.53887C3.60487 5.62008 3.58919 5.70048 3.55875 5.77544C3.52831 5.85041 3.4837 5.91844 3.42749 5.97563C3.37175 6.03329 3.30542 6.07905 3.23235 6.11028C3.15928 6.14151 3.0809 6.15759 3.00174 6.15759C2.92258 6.15759 2.8442 6.14151 2.77113 6.11028C2.69805 6.07905 2.63173 6.03329 2.57599 5.97563L0.177376 3.51503ZM9.42401 10.0233C9.3111 9.90749 9.15795 9.84241 8.99826 9.84241C8.83857 9.84241 8.68543 9.90749 8.57251 10.0233C8.45959 10.1392 8.39616 10.2963 8.39616 10.4601C8.39616 10.6239 8.45959 10.781 8.57251 10.8968L9.95171 12.3055H4.20104C3.40585 12.3055 2.64324 11.9815 2.08095 11.4047C1.51867 10.8278 1.20278 10.0455 1.20278 9.22978C1.20278 9.06663 1.1396 8.91016 1.02715 8.7948C0.914691 8.67944 0.762167 8.61463 0.603129 8.61463C0.444092 8.61463 0.291568 8.67944 0.179111 8.7948C0.0666546 8.91016 0.00347699 9.06663 0.00347699 9.22978C0.00347699 10.3718 0.44572 11.4671 1.23292 12.2746C2.02011 13.0822 3.08778 13.5358 4.20104 13.5358H9.95171L8.57251 14.9445C8.5163 15.0017 8.47169 15.0697 8.44125 15.1447C8.41081 15.2197 8.39513 15.3001 8.39513 15.3813C8.39513 15.4625 8.41081 15.5429 8.44125 15.6179C8.47169 15.6928 8.5163 15.7609 8.57251 15.818C8.62825 15.8757 8.69458 15.9215 8.76765 15.9527C8.84072 15.9839 8.9191 16 8.99826 16C9.07742 16 9.1558 15.9839 9.22887 15.9527C9.30195 15.9215 9.36827 15.8757 9.42401 15.818L11.8226 13.3574C11.8788 13.3003 11.9234 13.2322 11.9539 13.1573C11.9843 13.0823 12 13.0019 12 12.9207C12 12.8395 11.9843 12.7591 11.9539 12.6841C11.9234 12.6091 11.8788 12.5411 11.8226 12.4839L9.42401 10.0233Z'
                  fill='#3351F2'
                />
              </svg>
              <Padding>Switch providers</Padding>
            </Button>
          </Flex>
          <Flex flex={1}>
            <Button color='primary'>
              <svg width='19' height='16' viewBox='0 0 19 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M17.8989 7.14272L14.471 1.42843C14.3142 1.16816 14.0891 0.952039 13.8184 0.801633C13.5476 0.651228 13.2406 0.571803 12.928 0.571289H6.0721C5.75948 0.571803 5.45247 0.651228 5.18172 0.801633C4.91097 0.952039 4.68595 1.16816 4.52912 1.42843L1.10116 7.14272C0.945307 7.40348 0.863281 7.69904 0.863281 7.99986C0.863281 8.30069 0.945307 8.59624 1.10116 8.857L4.52912 14.5713C4.68595 14.8316 4.91097 15.0477 5.18172 15.1981C5.45247 15.3485 5.75948 15.4279 6.0721 15.4284H12.928C13.2406 15.4279 13.5476 15.3485 13.8184 15.1981C14.0891 15.0477 14.3142 14.8316 14.471 14.5713L17.8989 8.857C18.0548 8.59624 18.1368 8.30069 18.1368 7.99986C18.1368 7.69904 18.0548 7.40348 17.8989 7.14272ZM16.8703 8.28557L13.4426 13.9999C13.3904 14.0867 13.3154 14.1588 13.2251 14.2089C13.1348 14.259 13.0325 14.2855 12.9282 14.2856H6.0721C5.96788 14.2855 5.86551 14.259 5.77525 14.2089C5.68498 14.1588 5.61 14.0867 5.55779 13.9999L2.12978 8.28557C2.07792 8.19862 2.05064 8.10012 2.05064 7.99986C2.05064 7.89961 2.07792 7.8011 2.12978 7.71415L5.55755 1.99986C5.60976 1.91305 5.68475 1.84096 5.77501 1.79082C5.86527 1.74067 5.96764 1.71423 6.07186 1.71415H12.928C13.0322 1.71423 13.1346 1.74067 13.2249 1.79082C13.3151 1.84096 13.3901 1.91305 13.4423 1.99986L16.8703 7.71415C16.9222 7.8011 16.9495 7.89961 16.9495 7.99986C16.9495 8.10012 16.9222 8.19862 16.8703 8.28557Z'
                  fill='#3351F2'
                />
                <path
                  d='M12.7321 4.32687C12.5754 4.06663 12.3505 3.85052 12.0798 3.70011C11.8092 3.5497 11.5022 3.47026 11.1897 3.46973H7.81043C7.4979 3.47026 7.19098 3.5497 6.92033 3.70011C6.64967 3.85052 6.42476 4.06663 6.26805 4.32687L4.57841 7.1427C4.42259 7.40347 4.34058 7.69902 4.34058 7.99984C4.34058 8.30066 4.42259 8.59621 4.57841 8.85698L6.26805 11.6728C6.42476 11.9331 6.64967 12.1492 6.92033 12.2996C7.19098 12.45 7.4979 12.5294 7.81043 12.53H11.1897C11.5022 12.5294 11.8092 12.45 12.0798 12.2996C12.3505 12.1492 12.5754 11.9331 12.7321 11.6728L14.4217 8.85698C14.5775 8.59621 14.6596 8.30066 14.6596 7.99984C14.6596 7.69902 14.5775 7.40347 14.4217 7.1427L12.7321 4.32687ZM13.393 8.28556L11.7034 11.1014C11.6513 11.1881 11.5764 11.2602 11.4862 11.3103C11.3961 11.3605 11.2938 11.3869 11.1897 11.3871H7.81043C7.70631 11.3869 7.60405 11.3605 7.5139 11.3103C7.42375 11.2602 7.34885 11.1881 7.29672 11.1014L5.60709 8.28556C5.55521 8.19861 5.52791 8.1001 5.52791 7.99984C5.52791 7.89958 5.55521 7.80107 5.60709 7.71413L7.29672 4.8983C7.34885 4.81155 7.42375 4.73951 7.5139 4.68937C7.60405 4.63922 7.70631 4.61275 7.81043 4.61258H11.1897C11.2938 4.61275 11.3961 4.63922 11.4862 4.68937C11.5764 4.73951 11.6513 4.81155 11.7034 4.8983L13.393 7.71413C13.4449 7.80107 13.4722 7.89958 13.4722 7.99984C13.4722 8.1001 13.4449 8.19861 13.393 8.28556Z'
                  fill='#3351F2'
                />
              </svg>
              <Padding>Manage my wallets</Padding>
            </Button>
          </Flex>
        </Flex>
      </Padding>
    </WalletMangerWrapper>
  );
};
