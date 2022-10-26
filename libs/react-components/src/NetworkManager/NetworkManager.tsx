import {
  Avatar,
  Badge,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { Chain, Wallet } from '@nepoche/dapp-config';
import { AppEvent, useWebContext } from '@nepoche/api-provider-environment';
import { Chip, SpaceBox } from '@nepoche/ui-components';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import { Pallet } from '@nepoche/styled-components-theme';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { NetworkManagerIndicator, NetworkManagerIndicatorProps } from '@nepoche/ui-components/NetworkManager/NetworkManagerIndicator';

const NetworkManagerWrapper = styled.div`
  padding: 1rem;
  ${({ theme }: { theme: Pallet }) => css`
    color: ${theme.primaryText};
    background: ${theme.layer2Background};
  `}
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

type ConnectingState = 'connecting' | 'connected' | 'no-connection' | 'error';

enum ConnectionStep {
  SelectChain = 'Select a chain',
  SelectWallet = 'Select wallet',
  Connecting = 'Connecting',
}


const appEvent = new AppEvent();

export const NetworkManager: React.FC = () => {
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

  const modalContent = useMemo(() => {
    switch (connectionStep) {
      case ConnectionStep.SelectChain: {
        return (
          <List>
            {filteredNetworks.map((chain) => {
              const { chainId, logo, name, tag, url, wallets } = chain;
              const viaWallets = Object.values(wallets);
              const ChainIcon = logo;
              return (
                <React.Fragment key={`${chainId}${url}-group`}>
                  <ListItem
                    aria-label='gender'
                    selected={userSelectedChain?.chainId === chainId}
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
                        overlap='rectangular'
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
                      <Flex row ai='flex-end'>
                        <Typography variant={'h6'} component={'p'}>
                          <b>{name} </b>
                        </Typography>
                        {activeChain?.chainId === chainId && (
                          <Chip label='connected' size='small' color='success' style={{ marginLeft: '8px' }} />
                        )}
                      </Flex>
                      <Padding style={{ marginTop: '8px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {viaWallets.map((wallet) => {
                            const Logo = wallet.Logo;
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
                                  {wallet.name}{' '}
                                </Typography>
                              </div>
                            );
                          })}
                        </div>
                      </Padding>
                    </ListItemText>
                  </ListItem>
                  <Divider variant={'fullWidth'} />
                </React.Fragment>
              );
            })}
          </List>
        );
      }

      case ConnectionStep.SelectWallet: {
        if (!userSelectedChain) {
          return null;
        }
        const { chainId, logo, name, tag, url, wallets } = userSelectedChain;
        const viaWallets = Object.values(wallets);
        const ChainIcon = logo;
        return (
          <div>
            <ListItem
              key={`${chainId}${url}-group`}
              aria-label='gender'
              selected={activeChain?.chainId === chainId}
              component={'div'}
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
                  overlap='rectangular'
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
                <Flex row ai='flex-end'>
                  <Typography variant={'h6'} component={'p'}>
                    <b>{name} </b>
                  </Typography>
                  {activeChain?.chainId === chainId && (
                    <Chip label='connected' size='small' color='success' style={{ marginLeft: '8px' }} />
                  )}
                </Flex>
                <Padding style={{ marginTop: '8px' }}>
                  <Typography color={'textSecondary'} display={'inline'}>
                    <b>URL:</b> {url || 'n/a'}
                  </Typography>
                </Padding>
              </ListItemText>
            </ListItem>
            <List>
              {viaWallets.map((wallet) => {
                const connectedWallet = activeWallet?.id === wallet.id; /*&& activeChain?.id === id*/
                return (
                  <ListItem
                    button
                    disabled={connectedWallet && activeChain?.chainId === chainId}
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
                        <wallet.Logo />
                      </Avatar>
                    </ListItemAvatar>
                    <Flex row ai='center' style={{ flexGrow: '1' }}>
                      <ListItemText>
                        <span>{wallet.name}</span>
                      </ListItemText>
                      {connectedWallet && <Chip label='Active' color='success' style={{ marginLeft: '8px' }} />}
                    </Flex>
                  </ListItem>
                );
              })}
            </List>
          </div>
        );
      }

      case ConnectionStep.Connecting: {
        return <LinearProgress />;
      }
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
          <Avatar className='avatar'>
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

          {modalContent}

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
