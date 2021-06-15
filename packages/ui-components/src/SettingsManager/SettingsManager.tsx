import {
  Badge,
  Button,
  Divider,
  Icon,
  IconButton,
  List,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { EndpointType } from '@webb-dapp/react-environment/configs/endpoints';
import { useSetting } from '@webb-dapp/react-hooks';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Chain, useWebContext } from '@webb-dapp/react-environment';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';

const SettingsManagerWrapper = styled.div`
  padding: 1rem;
`;
type SettingsManagerProps = {};

const TypeNameMap: Record<EndpointType, string> = {
  development: 'Development',
  production: 'Production',
  testnet: 'Test Networks',
};

const ChangelistItem = styled.li`
  display: flex;
`;

enum ConnectionStatus {
  SelectChain = 'Select a chain',
  SelectWallet = 'Select wallet',
  Connecting = 'Connecting',
}

export const SettingsManager: React.FC<SettingsManagerProps> = () => {
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<string>('');

  const { changeEndpoint, endpoint, selectableEndpoints } = useSetting();

  const handleSelect = useCallback(() => {
    changeEndpoint(selected);
    // reload page to ensure that network change success
    window.location.reload();
  }, [changeEndpoint, selected]);

  useEffect(() => {
    if (endpoint) setSelected(endpoint);
  }, [endpoint, setSelected]);
  const { chains, activeChain, switchChain } = useWebContext();

  const networks = useMemo(() => Object.values(chains), []);
  const endpoints = useMemo(() => {
    return Object.keys(selectableEndpoints).map((key) => {
      return {
        endpoints: selectableEndpoints[key as EndpointType],
        endpointsGroup: key as EndpointType,
      };
    });
  }, [selectableEndpoints]);
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.SelectChain);
  const stepNumber = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionStatus.SelectChain:
        return 1;
      case ConnectionStatus.SelectWallet:
        return 2;
      case ConnectionStatus.Connecting:
        return 3;
    }
  }, [connectionStatus]);

  const [userSelectedChain, setUserSelectedChain] = useState<Chain | null>(null);
  const handleChange = (chain: Chain) => {
    setUserSelectedChain(chain);
    setConnectionStatus(ConnectionStatus.SelectWallet);
  };
  const handleCancel = useCallback(() => {
    setOpen(false);
    if (connectionStatus !== ConnectionStatus.Connecting) {
      setSelected(endpoint || '');
      setUserSelectedChain(null);
      setConnectionStatus(ConnectionStatus.SelectChain);
    }
  }, [endpoint, connectionStatus]);
  const content = useMemo(() => {
    switch (connectionStatus) {
      case ConnectionStatus.SelectChain:
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
                  selected={selected === String(id)}
                  button
                  onClick={() => {
                    handleChange(chain);
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      title={'dev'}
                      badgeContent={tag}
                      anchorOrigin={{
                        horizontal: 'left',
                        vertical: 'top',
                      }}
                      invisible={!tag}
                      color={'secondary'}
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
                    <Typography variant={'button'}>{name}</Typography>
                    <Padding>
                      <div>URL: {url}</div>
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
                              <span>{wallet.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Padding>
                  </ListItemText>
                </ListItem>
              );
            })}
          </List>
        );
      case ConnectionStatus.SelectWallet: {
        if (!userSelectedChain) {
          return null;
        }
        const { id, logo, name, tag, url, wallets } = userSelectedChain;
        const viaWallets = Object.values(wallets);
        const ChainIcon = logo;
        return (
          <div>
            <ListItem
              key={`${id}${url}-group`}
              aria-label='gender'
              selected={selected === String(id)}
              button
              onClick={() => {}}
              component={'div'}
            >
              <ListItemAvatar>
                <Badge
                  title={'dev'}
                  badgeContent={tag}
                  anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'top',
                  }}
                  invisible={!tag}
                  color={'secondary'}
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
                <Typography variant={'button'}>{name}</Typography>
                <Padding>
                  <div>URL: {url}</div>
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
                          <span>{wallet.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </Padding>
              </ListItemText>
            </ListItem>
            <List>
              {viaWallets.map((wallet) => {
                return (
                  <ListItem
                    button
                    onClick={async () => {
                      setConnectionStatus(ConnectionStatus.Connecting);
                      await switchChain(userSelectedChain, wallet);
                      handleCancel();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    id={url + wallet.name}
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
                  </ListItem>
                );
              })}
            </List>
          </div>
        );
      }

      case ConnectionStatus.Connecting:
        break;
    }
  }, [networks, handleChange, userSelectedChain, connectionStatus]);
  return (
    <>
      <Tooltip title={'Settings'}>
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
        >
          <Icon>settings</Icon>
        </IconButton>
      </Tooltip>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <SettingsManagerWrapper>
          <Typography variant={'h5'}>Mange Connection </Typography>

          <SpaceBox height={16} />

          <Flex row ai='center'>
            {connectionStatus === ConnectionStatus.SelectWallet && (
              <IconButton
                onClick={() => {
                  setConnectionStatus(ConnectionStatus.SelectChain);
                }}
              >
                <Icon>chevron_left</Icon>
              </IconButton>
            )}
            <Typography variant={'h6'}>
              <b>Step {stepNumber}:</b> {connectionStatus}
            </Typography>
            <Flex flex={1} as={Padding}>
              <Divider />
            </Flex>
          </Flex>

          <SpaceBox height={8} />

          {content}
        </SettingsManagerWrapper>

        <Divider variant={'fullWidth'} />

        <Padding v as={'footer'}>
          <Flex row ai={'center'} jc={'flex-end'}>
            <Flex>
              <Button onClick={handleCancel}>
                <Padding>Cancel</Padding>
              </Button>
            </Flex>
            <Flex>
              <Button color='primary' onClick={handleSelect}>
                <Padding>Save</Padding>
              </Button>
            </Flex>
          </Flex>
        </Padding>
      </Modal>
    </>
  );
};
