import { Avatar, ClickAwayListener, IconButton, List, ListItemAvatar, ListItemText, Popper } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { ChainTypeId, chainTypeIdToInternalId } from '@webb-dapp/api-providers';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { NetworkManager } from '@webb-dapp/ui-components/NetworkManger/NetworkManager';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

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

const InputWrapper = styled.div<{ open: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ theme }: { theme: Pallet }) => theme.heavySelectionBorderColor};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.heavySelectionBackground};

  ${({ open, theme }) => {
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
    padding: 5px;
  }

  .account-button-wrapper {
    margin: -20px 0;
  }
`;

const PopperList = styled.div<{ open: boolean }>`
  ${StyledList} {
    overflow: hidden;
    border-radius: 0px 0px 25px 25px;
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
      padding-top: 10px;
      background: ${({ theme }: { theme: Pallet }) => theme.heavySelectionBackground};
    }
  }
`;

type DropdownInputProps = {
  chains: ChainTypeId[];
  value?: ChainTypeId;
  onChange(next: ChainTypeId | undefined): void;
};

const ChainName = styled.span`
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;
const DropdownInput: React.FC<DropdownInputProps> = ({ chains, onChange, value }) => {
  useEffect(() => {
    if (value && !chains.includes(value)) {
      onChange(undefined);
    }
  }, [value, chains, onChange]);

  const selected = useMemo(() => {
    if (!value && typeof value === 'undefined') {
      return undefined;
    }

    if (Number(value.chainType) === -1 || Number(value.chainId) === -1) {
      return undefined;
    }

    return {
      id: value,
      chain: chainsPopulated[chainTypeIdToInternalId(value)],
    };
  }, [value]);
  const $wrapper = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorPallet();
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
              {selected ? (
                <Flex row ai='center' jc='flex-start' flex={1}>
                  <Avatar
                    style={{ background: 'transparent' }}
                    children={<selected.chain.logo />}
                    className={'token-avatar'}
                  />
                  <Padding x={0.5} />
                  <div>
                    <Typography variant={'h6'} component={'span'} display={'block'}>
                      <b>{selected.chain.name}</b>
                    </Typography>
                  </div>
                </Flex>
              ) : (
                <Flex row ai='center' jc='flex-start' flex={1}>
                  <Avatar
                    style={{
                      background: theme.warning,
                    }}
                  >
                    <Icon
                      style={{
                        color: '#fff',
                      }}
                      fontSize={'large'}
                    >
                      generating_tokens
                    </Icon>
                  </Avatar>
                  <Padding x={0.5} />
                  <Flex jc={'center'}>
                    <Typography variant={'caption'} color={'textSecondary'} style={{ whiteSpace: 'nowrap' }}>
                      Select chain
                    </Typography>
                  </Flex>
                </Flex>
              )}

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
              }}
              placement={'bottom-end'}
              open={isOpen}
              anchorEl={$wrapper?.current}
            >
              <PopperList open={isOpen}>
                <StyledList as={List} dense disablePadding>
                  {chains.map((chainTypeId) => {
                    const isSelected = selected?.id === chainTypeId;
                    let chain = chainsPopulated[chainTypeIdToInternalId(chainTypeId)];
                    return (
                      <li
                        role={'button'}
                        onClick={() => {
                          setIsOpen(false);
                          onChange(chainTypeId);
                        }}
                        className={isSelected ? 'selected' : ''}
                        key={`${chainTypeId.chainId}-chain-input`}
                      >
                        <Flex ai='center' row flex={1}>
                          <ListItemAvatar>
                            <Avatar style={{ background: 'transparent' }} children={<chain.logo />} />
                          </ListItemAvatar>
                          <ListItemText>
                            <Typography variant={'h6'} component={'span'} display={'block'}>
                              <b>{chain.name}</b>
                            </Typography>
                            <Typography variant={'body2'} color={'textSecondary'}>
                              <ChainName>{chain.name}</ChainName>
                            </Typography>
                          </ListItemText>
                        </Flex>
                      </li>
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

type ChainInputProps = {
  chains: ChainTypeId[];
  selectedChain: ChainTypeId | undefined;
  setSelectedChain?(chain: ChainTypeId | undefined): void;
  wrapperStyles?: CSSProperties;
};

export const ChainInput: React.FC<ChainInputProps> = ({ chains, selectedChain, setSelectedChain, wrapperStyles }) => {
  return (
    <div style={wrapperStyles}>
      {setSelectedChain && (
        <DropdownInput
          chains={chains}
          value={selectedChain}
          onChange={(chain) => {
            setSelectedChain(chain);
          }}
        />
      )}
      {!setSelectedChain && <NetworkManager />}
    </div>
  );
};
