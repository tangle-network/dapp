import {
  Button,
  Divider,
  FormControlLabel,
  Icon,
  IconButton,
  Radio,
  RadioGroup,
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

const SettingsManagerWrapper = styled.div`
  padding: 1rem;
`;
type SettingsManagerProps = {};

const TypeNameMap: Record<EndpointType, string> = {
  development: 'Development',
  production: 'Production',
  testnet: 'Test Networks',
};

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
            <Typography variant={'h6'}>Default chain</Typography>
            <Flex flex={1} as={Padding}>
              <Divider />
            </Flex>
          </Flex>

          <SpaceBox height={8} />

          <Padding>
            {endpoints.map(({ endpoints, endpointsGroup }) => {
              return (
                <RadioGroup
                  key={`${endpointsGroup}-group`}
                  aria-label='gender'
                  name={endpointsGroup}
                  value={selected}
                  onChange={handleChange}
                >
                  <Typography variant={'button'}>{TypeNameMap[endpointsGroup]}</Typography>
                  <Padding>
                    {endpoints.map((config) => {
                      return (
                        <FormControlLabel
                          key={`select-endpoint-${config.url}`}
                          value={config.url}
                          control={<Radio />}
                          label={config.name}
                        />
                      );
                    })}
                  </Padding>
                </RadioGroup>
              );
            })}
          </Padding>
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
