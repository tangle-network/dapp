import {
  Badge,
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import { Chain, useWebContext, Wallet } from '@webb-dapp/react-environment';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { appEvent } from '@webb-dapp/react-environment/app-event';

const NetworkManagerWrapper = styled.div`
  padding: 1rem;
`;
type NetworkManagerProps = {};

enum ConnectionStep {
  SelectChain = 'Select a chain',
  SelectWallet = 'Select wallet',
  Connecting = 'Connecting',
}

type ConnectingState = 'connecting' | 'connected' | 'no-connection' | 'error';
type NetworkManagerIndicatorProps = {
  connectionStatus: ConnectingState;
  connectionMetaData?: {
    hoverMessage?: string;
    chainName: string;
    details?: string;
    chainIcon: string | JSX.Element;
    tag?: string;
  };
  onClick?: (e: any) => void;
};

export const NetworkManager: React.FC<NetworkManagerProps> = () => {
  const [open, setOpen] = useState(false);

  const { activeChain, activeWallet, chains, isInit, switchChain: _switchChain } = useWebContext();
  const [connectionStatus, setConnectionStatus] = useState<ConnectingState>(
    activeChain ? 'connected' : isInit ? 'connecting' : 'no-connection'
  );
  const switchChain = useCallback(
    async (chain: Chain, wallet: Wallet) => {
      try {
        setConnectionStatus('connecting');
        const res = await _switchChain(chain, wallet);
        setConnectionStatus('connected');
        return res;
      } catch (e) {
        setConnectionStatus('error');
        throw e;
      }
    },
    [_switchChain]
  );

  const networks = useMemo(() => Object.values(chains), [chains]);
  const [connectionStep, setConnectionStep] = useState(ConnectionStep.SelectChain);
  const stepNumber = useMemo(() => {
    switch (connectionStep) {
      case ConnectionStep.SelectChain:
        return 1;
      case ConnectionStep.SelectWallet:
        return 2;
      case ConnectionStep.Connecting:
        return 3;
    }
  }, [connectionStep]);

  const [userSelectedChain, setUserSelectedChain] = useState<Chain | null>(null);
  const handleChange = (chain: Chain) => {
    setUserSelectedChain(chain);
    setConnectionStep(ConnectionStep.SelectWallet);
  };
  const handleCancel = useCallback(() => {
    console.log('cancel net manager');
    // setOpen(false);
    if (connectionStep !== ConnectionStep.Connecting) {
      setUserSelectedChain(null);
      setConnectionStep(ConnectionStep.SelectChain);
    }
  }, [connectionStep]);

  useEffect(() => {
    const off = appEvent.on('changeNetworkSwitcherVisibility', (next) => {
      console.log({
        changeNetworkSwitcherVisibility: next,
      });
      setOpen(next);
    });
    return () => off && off();
  }, []);
  const content = useMemo(() => {
    switch (connectionStep) {
      case ConnectionStep.SelectChain:
        return (
          <List>
            {networks.map((chain) => {
              const { id, logo, name, tag, url, wallets } = chain;
              const viaWallets = Object.values(wallets);
              const ChainIcon = logo;
              return (
                <ListItem
                  key={`${id}${url}-group`}
                  aria-label='gender'
                  selected={userSelectedChain?.id === id}
                  button
                  onClick={() => {
                    handleChange(chain);
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      title={'dev'}
                      badgeContent={tag?.toUpperCase()}
                      anchorOrigin={{
                        horizontal: 'left',
                        vertical: 'top',
                      }}
                      invisible={!tag}
                      color={'primary'}
                    >
                      <Avatar
                        style={{
                          background: '#fff',
                        }}
                        children={<ChainIcon />}
                      />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText>
                    <Typography variant={'h6'} component={'p'}>
                      <b>{name}</b>
                    </Typography>
                    <Padding>
                      <div>
                        <Typography color={'textSecondary'} display={'inline'}>
                          <b>URL:</b> {url || 'n/a'}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography color={'textSecondary'} display={'inline'}>
                          <b>Connectable via:</b>
                        </Typography>
                        {viaWallets.map((wallet) => {
                          const Logo = wallet.logo;
                          return (
                            <div
                              style={{
                                opacity: 0.8,
                                display: 'flex',
                                alignItems: 'center',
                                margin: '0 10px',
                              }}
                              id={url + wallet.name}
                            >
                              <span
                                style={{
                                  padding: '0 2px',
                                  width: 20,
                                  height: 20,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Logo />
                              </span>
                              <Typography color={'textSecondary'}>{wallet.name}</Typography>
                            </div>
                          );
                        })}
                      </div>
                    </Padding>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    {activeChain?.id === id && <Typography color='secondary'>connected</Typography>}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        );
      case ConnectionStep.SelectWallet: {
        if (!userSelectedChain) {
          return null;
        }
        const { id, logo, name, tag, url, wallets } = userSelectedChain;
        const viaWallets = Object.values(wallets);
        const ChainIcon = logo;
        return (
          <div>
            <ListItem key={`${id}${url}-group`} aria-label='gender' selected={activeChain?.id === id} component={'div'}>
              <ListItemAvatar>
                <Badge
                  title={'dev'}
                  badgeContent={tag?.toUpperCase()}
                  anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'top',
                  }}
                  invisible={!tag}
                  color={'primary'}
                >
                  <Avatar
                    style={{
                      background: '#fff',
                    }}
                    children={<ChainIcon />}
                  />
                </Badge>
              </ListItemAvatar>
              <ListItemText>
                <Typography variant={'h6'} component={'p'}>
                  <b>{name}</b>
                </Typography>
                <Padding>
                  <Typography color={'textSecondary'} display={'inline'}>
                    <b>URL:</b> {url || 'n/a'}
                  </Typography>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Connectable via:
                    {viaWallets.map((wallet) => {
                      const Logo = wallet.logo;
                      return (
                        <div
                          style={{
                            opacity: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            margin: '0 10px',
                          }}
                          id={url + wallet.name}
                        >
                          <span
                            style={{
                              padding: '0 2px',
                              width: 20,
                              height: 20,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Logo />
                          </span>
                          <Typography color={'textSecondary'}>{wallet.name}</Typography>
                        </div>
                      );
                    })}
                  </div>
                </Padding>
                <ListItemSecondaryAction>
                  {activeChain?.id === id && <Typography color='secondary'>connected</Typography>}
                </ListItemSecondaryAction>
              </ListItemText>
            </ListItem>
            <List>
              {viaWallets.map((wallet) => {
                const connectedWallet = activeWallet?.id === wallet.id; /*&& activeChain?.id === id*/
                return (
                  <ListItem
                    button
                    disabled={connectedWallet && activeChain?.id === id}
                    onClick={async () => {
                      setConnectionStep(ConnectionStep.Connecting);
                      await switchChain(userSelectedChain, wallet);
                      handleCancel();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    id={url + wallet.name}
                    key={url + wallet.name}
                  >
                    <ListItemAvatar>
                      <Avatar
                        style={{
                          background: '#fff',
                        }}
                      >
                        <wallet.logo />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText>
                      <span>{wallet.name}</span>
                    </ListItemText>
                    <ListItemSecondaryAction>
                      {connectedWallet && <Typography color='secondary'>Active</Typography>}
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </div>
        );
      }

      case ConnectionStep.Connecting:
        return <LinearProgress />;
    }
  }, [networks, activeWallet, activeChain, connectionStep, userSelectedChain, switchChain, handleCancel]);
  useEffect(() => {
    if (isInit) {
      return setConnectionStatus('connecting');
    }
    if (activeChain) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('no-connection');
    }
  }, [activeChain, isInit]);
  const chainInfo = useMemo<NetworkManagerIndicatorProps['connectionMetaData'] | undefined>(() => {
    if (!activeChain) {
      return undefined;
    }
    return {
      hoverMessage: activeChain.url,
      chainIcon: (
        <Avatar
          style={{
            height: 35,
            width: 35,
          }}
        >
          <activeChain.logo />
        </Avatar>
      ),
      details: activeChain.url,
      chainName: activeChain.name,
    };
  }, [activeChain]);
  return (
    <>
      <Tooltip title={'Network'}>
        <NetworkManagerIndicator
          connectionMetaData={chainInfo}
          connectionStatus={connectionStatus}
          onClick={() => {
            setOpen(true);
          }}
        />
      </Tooltip>

      <Modal
        open={open}
        onClose={() => {
          // if (connectionStep !== ConnectionStep.Connecting) {
          //   setOpen(false);
          // }
        }}
      >
        <NetworkManagerWrapper>
          <Typography variant={'h5'}>Manage Connection </Typography>

          <SpaceBox height={16} />

          <Flex row ai='center'>
            {connectionStep === ConnectionStep.SelectWallet && (
              <IconButton
                onClick={() => {
                  setConnectionStep(ConnectionStep.SelectChain);
                }}
              >
                <Icon>chevron_left</Icon>
              </IconButton>
            )}
            <Typography variant={'h6'}>
              <b>Step {stepNumber}:</b> {connectionStep}
            </Typography>
            <Flex flex={1} as={Padding}>
              <Divider />
            </Flex>
          </Flex>

          <SpaceBox height={8} />

          {content}
        </NetworkManagerWrapper>

        <Divider variant={'fullWidth'} />

        <Padding v as={'footer'}>
          <Flex row ai={'center'} jc={'flex-end'}>
            <Flex>
              <Button
                onClick={() => {
                  handleCancel();
                  setOpen(false);
                }}
              >
                <Padding>Cancel</Padding>
              </Button>
            </Flex>
          </Flex>
        </Padding>
      </Modal>
    </>
  );
};

const NetworkIndecatorWrapper = styled.button`
  && {
    min-height: 53px;
    border-radius: 32px;
    margin: 0 1rem;
    padding: 0 0.3rem;
    //background: ${({ theme }: { theme: Pallet }) => theme.background};
    position: relative;

    &:before {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 1;
      background: ${({ theme }: { theme: Pallet }) => (theme.type === 'light' ? 'white' : 'rgba(51, 81, 242, 0.28)')};
      border-radius: 32px;
    }

    &:after {
      z-index: 2;
      position: absolute;
      content: '';
      top: 2px;
      left: 2px;
      height: calc(100% - 4px);
      width: calc(100% - 4px);
      background: ${({ theme }: { theme: Pallet }) => (theme.type === 'light' ? 'rgba(71, 69, 83, 0.1)' : 'black')};
      border-radius: 32px;
    }

    *:first-child {
      position: relative;
      z-index: 3;
    }
  }

  cursor: pointer;
`;

export const NetworkManagerIndicator: React.FC<NetworkManagerIndicatorProps> = ({
  onClick,
  connectionMetaData,
  connectionStatus,
}) => {
  const icon = useMemo(() => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <Flex
            ai={'center'}
            jc={'center'}
            style={{
              width: 35,
              height: 35,
            }}
          >
            <Icon style={{ position: 'absolute' }} fontSize={'small'}>
              podcasts
            </Icon>
            <CircularProgress style={{ position: 'absolute' }} size={32} />
          </Flex>
        );

      case 'no-connection':
        return <Icon fontSize={'large'}>podcasts</Icon>;

      case 'error':
        return <Icon fontSize={'large'}>podcasts</Icon>;

      case 'connected':
      default:
        return connectionMetaData?.chainIcon ? connectionMetaData?.chainIcon : <Icon fontSize={'large'}>podcasts</Icon>;
    }
  }, [connectionMetaData, connectionStatus]);
  return (
    <NetworkIndecatorWrapper as={ButtonBase} onClick={onClick}>
      <Flex row ai={'center'} jc='space-between' as={Padding}>
        <Flex>{icon}</Flex>
        {connectionMetaData ? (
          <>
            <Padding />

            <Flex col>
              <Typography variant='body1'>
                <b style={{ whiteSpace: 'nowrap' }}>{connectionMetaData.chainName}</b>
              </Typography>

              <Typography color='textSecondary' variant='body2'>
                <b style={{ whiteSpace: 'nowrap' }}>{connectionMetaData.details}</b>
              </Typography>
            </Flex>
          </>
        ) : (
          ''
        )}
      </Flex>
    </NetworkIndecatorWrapper>
  );
};
