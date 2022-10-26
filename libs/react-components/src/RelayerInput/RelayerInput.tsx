import {
  Button,
  ClickAwayListener,
  Divider,
  Icon,
  IconButton,
  InputBase,
  List,
  ListItemText,
  Popper,
  Typography,
} from '@mui/material';
import { ActiveWebbRelayer, Capabilities, WebbRelayer } from '@nepoche/abstract-api-provider';
import { useWebContext } from '@nepoche/api-provider-environment';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import { Pallet } from '@nepoche/styled-components-theme';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { SpaceBox } from '@nepoche/ui-components/Box';
import { ContentWrapper } from '@nepoche/ui-components/ContentWrappers';

export interface RelayerApiAdapter {
  getInfo(endpoing: string): Promise<Capabilities>;
  add(endPoint: string): Promise<WebbRelayer>;
}

export type FeesInfo = {
  totalFees: number | string;
  withdrawFeePercentage: number;
};

const StyledList = styled.ul`
  li {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px;

    &.selected,
    :hover {
      background: ${({ theme }: { theme: Pallet }) => theme.heavySelectionBackground};
    }

    position: relative;
  }
`;

const RelayerInputWrapper = styled.div`
  display: flex;
  background: ${({ theme }: { theme: Pallet }) => theme.heavySelectionBackground};
  border-radius: 5px;
  width: 100%;
`;

const InputWrapper = styled.div<{ open: boolean }>`
  border-radius: 8px;

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.heavySelectionBackground};

  ${({ open }) => {
    return open
      ? css`
          max-height: 350px;
          border-radius: 8px 8px 0 0;
        `
      : css``;
  }}

  .account-header {
    display: flex;
    align-items: center;
    ${({ theme }: { theme: Pallet }) => css`
      border: 1px solid ${theme.heavySelectionBorderColor};
      color: ${theme.primaryText};
      background: ${theme.heavySelectionBackground};
    `}
    height: 50px;
    padding: 0 12px;
    border-radius: 10px;
  }

  .account-button-wrapper {
    margin: -20px 0;
  }
`;

const RelayerInputSection = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;

  ${({ theme }: { theme: Pallet }) => css`
    color: ${theme.primaryText};
    background: ${theme.heavySelectionBackground};
  `}
  border-radius: 10px;
  padding: 5px 0px;

  .information-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    .title {
      color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.69)' : 'rgba(0, 0, 0, 0.69)')};
    }
    .value {
      color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000000')};
    }
  }
`;

const PopperList = styled.div<{ open: boolean }>`
  ${StyledList} {
    overflow: hidden;
    border-radius: 0px 0px 8px 8px;
    border: 1px solid ${({ theme }) => (theme.type === 'dark' ? 'black' : theme.gray13)};
    background: ${({ theme }: { theme: Pallet }) => theme.componentBackground};
    overflow: hidden;

    ${({ open }) => {
      return open
        ? css`
            max-height: 200px;
            overflow-y: auto;
          `
        : css`
            padding: 0 !important;
            margin: 0 !important;
            max-height: 0px !important;
          `;
    }}

    li {
      padding: 10px 20px;
      background: ${({ theme }: { theme: Pallet }) => theme.heavySelectionBackground};
    }
  }
`;

const RelayerInfoModalWrapper = styled.div`
  background-color: ${({ theme }: { theme: Pallet }) => theme.componentBackground};
  padding: 2rem;
`;
const RelayerInfoModalActionsWrapper = styled.div`
  padding: 1rem;
`;

type DropdownInputProps = {
  options: WebbRelayer[];
  value?: string;
  onChange(next: WebbRelayer | undefined): void;
  onCustomRelayerSelect(): void;
};

const DropdownInput: React.FC<DropdownInputProps> = ({ onChange, onCustomRelayerSelect, options, value }) => {
  const $wrapper = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div>
        <ClickAwayListener
          onClickAway={() => {
            setIsOpen(false);
          }}
        >
          <InputWrapper open={isOpen} ref={$wrapper}>
            <div
              onClick={() => {
                setIsOpen((p) => !p);
              }}
              className='account-header'
            >
              <Flex row ai='center' jc='flex-start' flex={1}>
                <div>
                  <Typography variant={'h6'} component={'span'} display={'block'}>
                    <b>{value}</b>
                  </Typography>
                </div>
              </Flex>

              <div className={'account-button-wrapper'}>
                <IconButton
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'all ease .3s',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((p) => !p);
                  }}
                >
                  <Icon>expand_more</Icon>
                </IconButton>
              </div>
            </div>
            <Popper
              style={{
                width: $wrapper.current?.offsetWidth,
                zIndex: '1500',
              }}
              placement={'bottom-end'}
              open={isOpen}
              anchorEl={$wrapper?.current}
            >
              <PopperList open={isOpen}>
                <StyledList as={List} dense disablePadding>
                  <div>
                    <li
                      role={'button'}
                      onClick={() => {
                        setIsOpen(false);
                        onChange(undefined);
                      }}
                      className={value === 'None' ? 'selected' : ''}
                      key={`none-relayer-option`}
                    >
                      <Flex ai='center' row flex={1}>
                        <ListItemText>
                          <Typography variant={'h6'} component={'span'} display={'block'}>
                            <b>None</b>
                          </Typography>
                        </ListItemText>
                      </Flex>
                    </li>
                  </div>
                  <div>
                    <li
                      role={'button'}
                      onClick={() => {
                        setIsOpen(false);
                        onCustomRelayerSelect();
                      }}
                      key={`custom-relayer-option`}
                    >
                      <Flex ai='center' row flex={1}>
                        <ListItemText>
                          <Typography variant={'h6'} component={'span'} display={'block'}>
                            <b>Custom</b>
                          </Typography>
                        </ListItemText>
                      </Flex>
                    </li>
                  </div>
                  {options.map((option) => {
                    return (
                      <div key={`${option.endpoint}-relayer-input-container`}>
                        <li
                          role={'button'}
                          onClick={() => {
                            setIsOpen(false);
                            onChange(option);
                          }}
                          className={value === option.endpoint ? 'selected' : ''}
                          key={`${option.endpoint}-relayer-option`}
                        >
                          <Flex ai='center' row flex={1}>
                            <ListItemText>
                              <Typography variant={'h6'} component={'span'} display={'block'}>
                                <b>{option.endpoint}</b>
                              </Typography>
                            </ListItemText>
                          </Flex>
                        </li>
                      </div>
                    );
                  })}
                </StyledList>
              </PopperList>
            </Popper>
          </InputWrapper>
        </ClickAwayListener>
      </div>
    </>
  );
};

type RelayerInputProps = {
  relayers: WebbRelayer[];
  activeRelayer: ActiveWebbRelayer | null;

  relayerApi: RelayerApiAdapter;
  tokenSymbol: string;
  setActiveRelayer(nextRelayer: WebbRelayer | null): void;
  feesGetter?(activeRelayer: ActiveWebbRelayer): Promise<FeesInfo>;
  wrapperStyles?: CSSProperties;
  showSummary?: boolean;
};

enum RelayerInputStatus {
  Select,
  AddNewCustom,
}

export const RelayerInput: React.FC<RelayerInputProps> = ({
  activeRelayer,
  feesGetter,
  relayerApi,
  relayers,
  setActiveRelayer,
  showSummary = true,
  tokenSymbol,
  wrapperStyles,
}) => {
  const [view, setView] = useState<RelayerInputStatus>(RelayerInputStatus.Select);
  const [customRelayURl, setCustomRelayURl] = useState('');
  const [relayingIncentives, setRelayingIncentives] = useState<FeesInfo>({
    totalFees: 0,
    withdrawFeePercentage: 0,
  });
  const palette = useColorPallet();
  const { activeChain } = useWebContext();

  useEffect(() => {
    async function getFees() {
      try {
        if (!activeRelayer) {
          return;
        }

        if (showSummary && !feesGetter) {
          throw Error('Relayer input require feesGetter function to show summary');
        }

        feesGetter?.(activeRelayer).then((fees) => {
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
  }, [activeRelayer, feesGetter, showSummary]);

  const [checkRelayStatus, setCheckRelayStatus] = useState<{
    loading: boolean;
    capabilities?: Capabilities;
    url?: string;
    error?: string;
  }>({
    loading: false,
  });
  useEffect(() => {
    if (view === RelayerInputStatus.Select) {
      setCustomRelayURl('');
      setCheckRelayStatus({
        loading: false,
      });
    }
  }, [view]);

  const handleNewCustomRelayer = useCallback(async () => {
    if (!activeChain) {
      return;
    }
    setView(RelayerInputStatus.AddNewCustom);
    const relayer = await relayerApi.add(customRelayURl);
    const activeTypedChainId = calculateTypedChainId(activeChain?.chainType, activeChain?.chainId);
    if (
      relayer.capabilities.supportedChains.evm.has(activeTypedChainId) ||
      relayer.capabilities.supportedChains.substrate.has(activeTypedChainId)
    ) {
      setActiveRelayer(relayer);
    }
    setView(RelayerInputStatus.Select);
  }, [relayerApi, customRelayURl, activeChain, setActiveRelayer]);

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

  const relayerInfo = useMemo(() => {
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

  return (
    <div style={wrapperStyles}>
      <DropdownInput
        options={relayers}
        value={activeRelayer?.endpoint || 'None'}
        onChange={async (relayer: WebbRelayer) => {
          await setActiveRelayer(relayer);
        }}
        onCustomRelayerSelect={() => {
          setView(RelayerInputStatus.AddNewCustom);
        }}
      />
      {showSummary && (
        <>
          <SpaceBox height={16} />
          <RelayerInputSection>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div className='information-item'>
                <p className='title'>Withdraw fee percentage</p>
                <p className='value'>{relayingIncentives.withdrawFeePercentage * 100}%</p>
              </div>
              <div className='information-item'>
                <p className='title'>Full fees</p>
                <p className='value'>
                  {ethers.utils.formatUnits(relayingIncentives.totalFees)} {tokenSymbol}
                </p>
              </div>
            </div>
          </RelayerInputSection>
        </>
      )}
      <Modal open={view > RelayerInputStatus.Select}>
        <RelayerInfoModalWrapper>
          <Typography variant={'h2'}>Add Custom relayer</Typography>
          <br />
          <RelayerInputWrapper>
            <InputBase
              fullWidth
              margin={'dense'}
              placeholder={'http://localhost:9955'}
              disabled={checkRelayStatus.loading}
              value={customRelayURl}
              onChange={({ target: { value } }) => {
                setCustomRelayURl(value);
              }}
              style={{ padding: '10px 10px' }}
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
          </RelayerInputWrapper>

          <SpaceBox height={16} />

          {relayerInfo && (
            <>
              <Divider />

              <SpaceBox height={16} />
              <ContentWrapper
                style={{
                  maxHeight: '400px',
                  overflow: 'auto',
                }}
              >
                {relayerInfo.evm.length > 0 && (
                  <>
                    <ul>
                      {relayerInfo.evm.map((i) => {
                        return (
                          <li style={{ color: palette.primaryText }}>
                            <Typography variant={'h5'}>{Number(i.key)}</Typography>
                            <Padding v>
                              <Typography variant={'h6'}>Account: {i.value.beneficiary?.toString()} </Typography>
                              <Typography variant={'h6'}>Contracts:</Typography>
                              <Padding x={1.5}>
                                {i.value.contracts.map((i) => (
                                  <div>
                                    <Typography variant={'h6'}>Size: {i.size?.toString()}</Typography>
                                    <Typography variant={'h6'}>Address: {i.address}</Typography>
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

                {relayerInfo.substrate.length > 0 && (
                  <>
                    <ul>
                      {relayerInfo.substrate.map((i) => {
                        return (
                          <li>
                            <Typography variant={'h5'}>{i.value.beneficiary}</Typography>
                          </li>
                        );
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
            disabled={!checkRelayStatus.capabilities || view != RelayerInputStatus.AddNewCustom}
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
              setView(RelayerInputStatus.Select);
            }}
          >
            Close
          </Button>
        </Flex>
      </Modal>
    </div>
  );
};
