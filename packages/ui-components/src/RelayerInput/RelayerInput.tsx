import { Button, Divider, FormControl, Input, InputAdornment, MenuItem, Select } from '@material-ui/core';
import { ActiveWebbRelayer, Capabilities, WebbRelayer } from '@webb-dapp/react-environment';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { SpaceBox } from '@webb-dapp/ui-components';

export interface RelayerApiAdapter {
  getInfo(endpoing: string): Promise<Capabilities>;

  add(endPoint: string, persistent: boolean): void;
}

const RelayerInputWrapper = styled.div``;
type RelayerInputProps = {
  relayers: WebbRelayer[];
  activeRelayer: ActiveWebbRelayer | null;
  setActiveRelayer(nextRelayer: WebbRelayer | null): void;

  relayerApi: RelayerApiAdapter;
};

enum RelayerInputStatus {
  SelectOfCurrent,
  AddURlkNewCustom,
  AddNewCustom,
}

const RelayerInfoModalWrapper = styled.div`
  background-color: black;
  padding: 2rem;
`;
const RelayerInput: React.FC<RelayerInputProps> = ({ activeRelayer, relayerApi, relayers, setActiveRelayer }) => {
  const [view, setView] = useState<RelayerInputStatus>(RelayerInputStatus.SelectOfCurrent);
  const [customRelayURl, setCustomRelayURl] = useState('');
  const [persistentCustomRelay, setPersistentCustomRelay] = useState(false);
  const [checkRelayStatus, setCheckRelayStatus] = useState<{
    loading: boolean;
    capabilities?: Capabilities;
    url?: string;
    error?: string;
  }>({
    loading: false,
  });
  useEffect(() => {
    if (view === RelayerInputStatus.SelectOfCurrent) {
      setCustomRelayURl('');
      setPersistentCustomRelay('false');
    }
  }, [view]);

  const handleNewCustomRelayer = useCallback(async () => {
    setView(RelayerInputStatus.AddNewCustom);
    await relayerApi.add(customRelayURl, persistentCustomRelay);
    setActiveRelayer(relayers.find((r) => r.endpoint === customRelayURl) || null);
    setView(RelayerInputStatus.SelectOfCurrent);
  }, [relayerApi, relayers, customRelayURl, persistentCustomRelay, setActiveRelayer]);

  const fetchRelayInfo = useCallback(async () => {
    setCheckRelayStatus({
      loading: true,
    });
    try {
      const data = await relayerApi.getInfo(customRelayURl);
      setCheckRelayStatus({
        loading: false,
        url: customRelayURl,
        capabilities: data,
      });
    } catch (e) {
      setCheckRelayStatus({
        loading: false,
        error: 'failed to fetch info',
        url: customRelayURl,
      });
    }
  }, [relayerApi, customRelayURl]);

  const relayeInfo = useMemo(() => {
    const capabilities = checkRelayStatus.capabilities;
    if (capabilities) {
      const sub = Object.fromEntries(capabilities.supportedChains.substrate);
      const evm = Object.fromEntries(capabilities.supportedChains.evm);
      return {
        substrate: Object.keys(sub).map((key) => ({
          key,
          value: sub[key],
        })),
        evm: Object.keys(evm).map((key) => ({
          key,
          value: evm[key],
        })),
      };
    }
    return null;
  }, [checkRelayStatus]);
  console.log(relayeInfo);
  return (
    <RelayerInputWrapper>
      <InputSection>
        <InputLabel label={'Relayer'}>
          <Select
            fullWidth
            value={activeRelayer || 'none'}
            onChange={async ({ target: { value } }) => {
              switch (value) {
                case 'none':
                  setActiveRelayer(null);
                  break;
                case 'custom':
                  setView(RelayerInputStatus.AddURlkNewCustom);
                  break;
                default:
                  setActiveRelayer(relayers.find((r) => r.endpoint === value) || null);
              }
            }}
          >
            <MenuItem value={'none'} key={'none'}>
              <p style={{ fontSize: 14 }}>None</p>
            </MenuItem>
            <MenuItem value={'custom'} key={'Custom'}>
              <p style={{ fontSize: 14 }}>Custom</p>
            </MenuItem>
            {relayers.map(({ endpoint }) => {
              return (
                <MenuItem value={endpoint} key={endpoint}>
                  <p style={{ fontSize: 14 }}>{endpoint}</p>
                </MenuItem>
              );
            })}
          </Select>
        </InputLabel>
      </InputSection>

      <Modal open={view > RelayerInputStatus.SelectOfCurrent}>
        <RelayerInfoModalWrapper style={{ background: 'black' }}>
          <FormControl fullWidth>
            <InputLabel>Custom Relayer URL</InputLabel>

            <Input
              disabled={checkRelayStatus.loading}
              value={customRelayURl}
              onChange={({ target: { value } }) => {
                setCustomRelayURl(value);
              }}
              endAdornment={
                <InputAdornment position='end'>
                  <Button
                    style={{
                      fontSize: '.8rem',
                      whiteSpace: 'nowrap',
                    }}
                    disabled={checkRelayStatus.loading}
                    onClick={() => {
                      fetchRelayInfo();
                    }}
                    color={'primary'}
                    variant={'outlined'}
                  >
                    Check info
                  </Button>
                </InputAdornment>
              }
            />
          </FormControl>

          <SpaceBox height={16} />

          <Divider />

          <SpaceBox height={16} />

          {relayeInfo && (
            <div
              style={{
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              {relayeInfo.evm.length > 0 && (
                <>
                  <ul>
                    {relayeInfo.evm
                      .filter((i) => {
                        try {
                          chainIdToRelayerName(Number(i.key));
                          return true;
                        } catch (e) {
                          console.log(e, i, i.key);
                          return false;
                        }
                      })
                      .map((i) => {
                        return (
                          <li>
                            <b>{chainIdToRelayerName(Number(i.key))}</b>
                            <Padding v>
                              <b>Account</b>: {i.value.account.toString()} <br />
                              <b>Contracts</b>:
                              <Padding x={1.5}>
                                {i.value.contracts.map((i) => (
                                  <div>
                                    <Padding v>
                                      <b> Size </b>: {i.size?.toString()}
                                      <br />
                                      <b>Address</b>: {i.address}
                                    </Padding>
                                  </div>
                                ))}
                              </Padding>
                            </Padding>
                          </li>
                        );
                      })}
                  </ul>
                </>
              )}

              {relayeInfo.substrate.length > 0 && (
                <>
                  <ul>
                    {relayeInfo.substrate.map((i) => {
                      return <li>{i.value.account}</li>;
                    })}
                  </ul>
                </>
              )}
            </div>
          )}
          <Padding v>
            <Button
              fullWidth
              variant={'contained'}
              color={'primary'}
              onClick={() => {
                handleNewCustomRelayer().catch();
              }}
            >
              Add relayer
            </Button>
          </Padding>
        </RelayerInfoModalWrapper>
      </Modal>
    </RelayerInputWrapper>
  );
};
export default RelayerInput;
