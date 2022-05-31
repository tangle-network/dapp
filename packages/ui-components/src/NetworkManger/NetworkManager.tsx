import {
  Avatar,
  Badge,
  Button,
  ButtonBase,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { Chain, Wallet } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment';
import { appEvent } from '@webb-dapp/react-environment/app-event';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const NetworkManagerWrapper = styled.div`
  padding: 1rem;
  ${({ theme }: { theme: Pallet }) => css`
    color: ${theme.primaryText};
    background: ${theme.layer2Background};
  `}
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

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NetworkManager: React.FC<NetworkManagerProps> = () => {
  const [open, setOpen] = useState(false);

  const [radioButtonFilter, setRadioButtonFilter] = useState('dev');

  const { activeChain, activeWallet, chains, isConnecting, switchChain: _switchChain } = useWebContext();
  const [connectionStatus, setConnectionStatus] = useState<ConnectingState>(
    activeChain ? 'connected' : isConnecting ? 'connecting' : 'no-connection'
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

  const filteredNetworks = useMemo(() => {
    if (radioButtonFilter == null) {
      return Object.values(chains);
    }

    return Object.values(chains).filter((item) => {
      return item.tag == radioButtonFilter;
    });
  }, [chains, radioButtonFilter]);

  const handleRadioFilter = (event: any) => {
    setRadioButtonFilter(event.target.value);
  };

  const filterSection = useMemo(() => {
    return (
      <FilterSection>
        <FormControl>
          <RadioGroup value={radioButtonFilter} onChange={handleRadioFilter} row>
            <FormControlLabel value='live' control={<Radio />} label='live' />
            <FormControlLabel value='test' control={<Radio />} label='test' />
            <FormControlLabel value='dev' control={<Radio />} label='dev' />
          </RadioGroup>
        </FormControl>
      </FilterSection>
    );
  }, [radioButtonFilter]);

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
    setOpen(false);
    if (connectionStep !== ConnectionStep.Connecting) {
      setUserSelectedChain(null);
      setConnectionStep(ConnectionStep.SelectChain);
    }
  }, [connectionStep]);

  useEffect(() => {
    const off = appEvent.on('changeNetworkSwitcherVisibility', (next) => {
      setOpen(next);
    });
    return () => off && off();
  }, []);
  const content = useMemo(() => {
    switch (connectionStep) {
      case ConnectionStep.SelectChain:
        return (
          <List>
            {filteredNetworks.map((chain, inx) => {
              const { id, logo, name, tag, url, wallets } = chain;
              const viaWallets = Object.values(wallets);
              const ChainIcon = logo;
              return (
                <React.Fragment key={`${id}${url}-group`}>
                  <ListItem
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
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {viaWallets.map((wallet) => {
                            const Logo = wallet.logo;
                            return (
                              <div
                                style={{
                                  opacity: 0.8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  margin: '0 10px 0 0',
                                }}
                                id={url + wallet.name}
                                key={`${url}+${wallet.name}`}
                              >
                                <span
                                  style={{
                                    padding: '0 2px 0 0',
                                    width: 20,
                                    height: 20,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Logo />
                                </span>
                                <Typography color={'textSecondary'} variant={'caption'}>
                                  {wallet.name}
                                </Typography>
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
                  <Divider variant={'fullWidth'} />
                </React.Fragment>
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
                      const next = await switchChain(userSelectedChain, wallet);
                      if (next) {
                        handleCancel();
                      } else {
                        setUserSelectedChain(null);
                        setConnectionStep(ConnectionStep.SelectChain);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    id={url + wallet.name}
                    key={`${url}+${wallet.name}`}
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
  }, [filteredNetworks, activeWallet, activeChain, connectionStep, userSelectedChain, switchChain, handleCancel]);
  useEffect(() => {
    if (isConnecting) {
      return setConnectionStatus('connecting');
    }
    if (activeChain) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('no-connection');
    }
  }, [activeChain, isConnecting]);

  const chainInfo: NetworkManagerIndicatorProps['connectionMetaData'] | undefined = activeChain
    ? {
        hoverMessage: activeChain.url,
        chainIcon: (
          <Avatar
            style={{
              height: 35,
              width: 35,
              background: 'transparent',
            }}
          >
            <activeChain.logo />
          </Avatar>
        ),
        details: activeChain.url,
        chainName: activeChain.name,
      }
    : undefined;

  return (
    <>
      <NetworkManagerIndicator
        connectionMetaData={chainInfo}
        connectionStatus={connectionStatus}
        onClick={() => {
          setOpen(true);
        }}
      />

      <Modal
        open={open}
        onClose={() => {
          handleCancel();
        }}
      >
        <NetworkManagerWrapper>
          <Typography variant={'h3'}>Manage Connection </Typography>

          <SpaceBox height={16} />

          {filterSection}

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
            <Typography variant={'h5'}>
              <b>Step {stepNumber}:</b> {connectionStep}
            </Typography>
            <Flex flex={1} as={Padding}>
              <Divider />
            </Flex>
          </Flex>

          <SpaceBox height={8} />

          {content}

          <Padding v as={'footer'}>
            <Flex row ai={'center'} jc={'flex-end'}>
              <Flex>
                <Button onClick={handleCancel}>
                  <Padding>Cancel</Padding>
                </Button>
              </Flex>
            </Flex>
          </Padding>
        </NetworkManagerWrapper>
      </Modal>
    </>
  );
};

const NetworkIndicatorWrapper = styled.button`
  && {
    height: 45px;
    border-radius: 8px;
    margin: 0 1rem;
    padding: 0 0.3rem;
    background: ${({ theme }: { theme: Pallet }) => theme.lightSelectionBackground};
    position: relative;

    &:before {
      position: absolute;
      content: '';
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: 1;
      background: ${({ theme }: { theme: Pallet }) => theme.lightSelectionBackground};
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
      background: ${({ theme }: { theme: Pallet }) => theme.lightSelectionBackground};
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
  connectionMetaData,
  connectionStatus,
  onClick,
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
        return (
          <div>
            <Typography variant='body1'>Select a Network</Typography>
          </div>
        );

      case 'error':
        return <Icon fontSize={'large'}>podcasts</Icon>;

      case 'connected':
      default:
        return connectionMetaData?.chainIcon ? connectionMetaData?.chainIcon : <Icon fontSize={'large'}>podcasts</Icon>;
    }
  }, [connectionMetaData, connectionStatus]);
  return (
    <NetworkIndicatorWrapper as={ButtonBase} onClick={onClick}>
      <Flex row ai={'center'} jc='space-between' as={Padding}>
        <Flex>{icon}</Flex>
        {connectionMetaData ? (
          <>
            <Padding />

            <Flex col>
              <Typography variant='body1'>
                <b style={{ whiteSpace: 'nowrap' }}>{connectionMetaData.chainName}</b>
              </Typography>
            </Flex>
          </>
        ) : (
          ''
        )}
      </Flex>
    </NetworkIndicatorWrapper>
  );
};
