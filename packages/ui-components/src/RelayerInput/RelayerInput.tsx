import { Button, Divider, Fade, InputBase, MenuItem, Select } from '@material-ui/core';
import { ActiveWebbRelayer, Capabilities, WebbRelayer } from '@webb-dapp/react-environment';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { chainIdToRelayerName } from '@webb-dapp/apps/configs/relayer-config';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { SpaceBox } from '@webb-dapp/ui-components';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import Typography from '@material-ui/core/Typography';
import { ethers } from 'ethers';

export interface RelayerApiAdapter {
  getInfo(endpoing: string): Promise<Capabilities>;

  add(endPoint: string, persistent: boolean): void;
}

export type FeesInfo = {
  totalFees: number | string;
  withdrawFeePercentage: number;
};
const RelayerInputWrapper = styled.div``;
type RelayerInputProps = {
  relayers: WebbRelayer[];
  activeRelayer: ActiveWebbRelayer | null;

  relayerApi: RelayerApiAdapter;
  tokenSymbol: string;
  setActiveRelayer(nextRelayer: WebbRelayer | null): void;
  feesGetter(activeRelayer: ActiveWebbRelayer): Promise<FeesInfo>;
};

enum RelayerInputStatus {
  SelectOfCurrent,
  AddURlkNewCustom,
  AddNewCustom,
}

const RelayerInfoModalWrapper = styled.div`
  background-color: ${({ theme }: { theme: Pallet }) => theme.mainBackground};
  padding: 2rem;
`;
const RelayerInfoModalActionsWrapper = styled.div`
  padding: 1rem;
  // background-color: ${({ theme }: { theme: Pallet }) => theme.layer2Background};
`;
const ContentWrapper = styled.div``;
const RelayerInput: React.FC<RelayerInputProps> = ({
  activeRelayer,
  feesGetter,
  relayerApi,
  relayers,
  setActiveRelayer,
  tokenSymbol,
}) => {
  const [view, setView] = useState<RelayerInputStatus>(RelayerInputStatus.SelectOfCurrent);
  const [customRelayURl, setCustomRelayURl] = useState('');
  const [persistentCustomRelay, setPersistentCustomRelay] = useState(false);
  const [nextRelayerURL, setNextRelayerURl] = useState('');

  const [relayingIncentives, setRelayingIncentives] = useState<FeesInfo>({
    totalFees: 0,
    withdrawFeePercentage: 0,
  });

  useEffect(() => {
    async function getFees() {
      try {
        if (!activeRelayer) {
          return;
        }
        feesGetter(activeRelayer).then((fees) => {
          if (!fees) {
            return;
          }
          setRelayingIncentives({
            totalFees: fees.totalFees,
            withdrawFeePercentage: fees.withdrawFeePercentage,
          });
        });
      } catch (e) {
        return;
      }
    }

    getFees();
  }, [activeRelayer, feesGetter]);

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
      setPersistentCustomRelay(false);
      setCheckRelayStatus({
        loading: false,
      });
    }
  }, [view]);

  const handleNewCustomRelayer = useCallback(async () => {
    setView(RelayerInputStatus.AddNewCustom);
    await relayerApi.add(customRelayURl, persistentCustomRelay);
    setNextRelayerURl(customRelayURl);
    setView(RelayerInputStatus.SelectOfCurrent);
  }, [relayerApi, relayers, customRelayURl, persistentCustomRelay, setActiveRelayer]);
  useEffect(() => {
    if (!nextRelayerURL) {
      return;
    }
    const nextRelayer = relayers.find((r) => r.endpoint === nextRelayerURL);
    if (nextRelayer) {
      setActiveRelayer(nextRelayer);
      setNextRelayerURl('');
    }
  }, [nextRelayerURL, relayers]);
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
            value={activeRelayer?.endpoint || 'none'}
            onChange={async ({ target: { value } }) => {
              switch (value) {
                case 'none':
                  setActiveRelayer(null);
                  break;
                case 'custom':
                  setView(RelayerInputStatus.AddURlkNewCustom);
                  break;
                default: {
                  const nextRelayer = relayers.find((r) => r.endpoint === value);
                  setActiveRelayer(nextRelayer || null);
                }
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
        <Fade in={Boolean(activeRelayer)} unmountOnExit mountOnEnter timeout={300}>
          <div
            style={{
              padding: 10,
            }}
          >
            <table
              style={{
                width: '100%',
              }}
            >
              <tbody>
                <tr>
                  <td>
                    <span style={{ whiteSpace: 'nowrap' }}>Withdraw fee percentage</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{relayingIncentives.withdrawFeePercentage * 100}%</td>
                </tr>

                {relayingIncentives.totalFees && (
                  <tr>
                    <td>Full fees</td>
                    <td style={{ textAlign: 'right' }}>
                      {ethers.utils.formatUnits(relayingIncentives.totalFees)} {tokenSymbol}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Fade>
      </InputSection>

      <Modal open={view > RelayerInputStatus.SelectOfCurrent}>
        <RelayerInfoModalWrapper>
          <Typography variant={'h2'}>Add Custom relayer</Typography>
          <br />
          <InputSection>
            <InputLabel label={'Custom Relayer URL'}></InputLabel>
            <Flex row>
              <InputBase
                fullWidth
                margin={'dense'}
                placeholder={'http://localhost:9955'}
                disabled={checkRelayStatus.loading}
                value={customRelayURl}
                onChange={({ target: { value } }) => {
                  setCustomRelayURl(value);
                }}
              />
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
            </Flex>
          </InputSection>

          <SpaceBox height={16} />

          {relayeInfo && (
            <>
              <Divider />

              <SpaceBox height={16} />
              <ContentWrapper
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
              </ContentWrapper>
            </>
          )}
        </RelayerInfoModalWrapper>
        <Divider />

        <Flex row ai={'center'} as={RelayerInfoModalActionsWrapper}>
          <Button
            disabled={!checkRelayStatus.capabilities || view === RelayerInputStatus.AddNewCustom}
            fullWidth
            variant={'contained'}
            color={'primary'}
            onClick={() => {
              handleNewCustomRelayer().catch();
            }}
          >
            Add relayer
          </Button>

          <Padding />

          <Button
            fullWidth
            variant={'outlined'}
            onClick={() => {
              setView(RelayerInputStatus.SelectOfCurrent);
            }}
          >
            Close
          </Button>
        </Flex>
      </Modal>
    </RelayerInputWrapper>
  );
};
export default RelayerInput;
