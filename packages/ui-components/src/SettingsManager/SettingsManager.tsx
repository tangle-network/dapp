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
import { useWebContext } from '@webb-dapp/react-environment';
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

export const SettingsManager: React.FC<SettingsManagerProps> = () => {
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<string>('');

  const { changeEndpoint, endpoint, selectableEndpoints } = useSetting();

  const handleSelect = useCallback(() => {
    changeEndpoint(selected);
    // reload page to ensure that network change success
    window.location.reload();
  }, [changeEndpoint, selected]);

  const handleCancel = useCallback(() => {
    setSelected(endpoint || '');
    setOpen(false);
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) setSelected(endpoint);
  }, [endpoint, setSelected]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelected((event.target as HTMLInputElement).value);
  };
  const { chains, activeChain } = useWebContext();
  const networks = useMemo(() => Object.values(chains), []);
  const endpoints = useMemo(() => {
    return Object.keys(selectableEndpoints).map((key) => {
      return {
        endpoints: selectableEndpoints[key as EndpointType],
        endpointsGroup: key as EndpointType,
      };
    });
  }, [selectableEndpoints]);
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
          <Typography variant={'h5'}>Settings </Typography>

          <SpaceBox height={16} />

          <Flex row ai='center'>
            <Typography variant={'h6'}>Chains</Typography>
            <Flex flex={1} as={Padding}>
              <Divider />
            </Flex>
          </Flex>

          <SpaceBox height={8} />

          <List>
            {networks.map(({ url, tag, name, id, wallets, logo }) => {
              const viaWallets = Object.values(wallets);
              const ChainIcon = logo;
              return (
                <ListItem
                  key={`${id}${url}-group`}
                  aria-label='gender'
                  selected={selected === String(id)}
                  button
                  onChange={handleChange}
                >
                  <ListItemAvatar>
                    <Badge
                      title={'dev'}
                      badgeContent={tag}
                      anchorOrigin={{
                        horizontal: 'left',
                        vertical: 'top',
                      }}
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
                        Connectable with:
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
