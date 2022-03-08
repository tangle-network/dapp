import { Avatar, ClickAwayListener, IconButton, List, ListItemAvatar, ListItemText, Popper } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import {
  chainsPopulated,
  ChainTypeId,
  chainTypeIdToInternalId,
  evmIdIntoInternalChainId,
} from '@webb-dapp/apps/configs';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { InputLabel } from '@webb-dapp/ui-components/Inputs/InputLabel/InputLabel';
import { InputSection } from '@webb-dapp/ui-components/Inputs/InputSection/InputSection';
import { NetworkManager } from '@webb-dapp/ui-components/NetworkManger/NetworkManager';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const StyledList = styled.ul`
  li {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px;

    &.selected,
    :hover {
      background: ${({ theme }: { theme: Pallet }) => (theme.type === 'dark' ? theme.layer3Background : theme.gray1)};
    }

    position: relative;
  }
`;

const InputWrapper = styled.div<{ open: boolean }>`
  border-radius: 25px;
  border: 1px solid ${({ theme }: { theme: Pallet }) => theme.borderColor};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.layer3Background} 37%;

  ${({ open, theme }) => {
    return open
      ? css`
          background: ${theme.layer1Background} 9%;
          box-shadow: 1px 1px 14px ${theme.type === 'dark' ? 'black' : 'rgba(54, 86, 233, 0.1)'};
          max-height: 350px;
          border-radius: 25px 25px 0 0;
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
    background: ${({ theme }) => theme.layer1Background};
    overflow: hidden;

    ${({ open, theme }) => {
      return open
        ? css`
            box-shadow: 1px 1px 14px ${theme.type === 'dark' ? 'black' : 'rgba(54, 86, 233, 0.1)'};
          `
        : css``;
    }}

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
  console.log('Selected', selected);
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
                    <Typography variant={'body2'} color={'textSecondary'}>
                      <ChainName>
                        <b>{selected.chain.name}</b>
                      </ChainName>
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
                      Select bridge chain
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
                    console.log('chainTypeId: ', chainTypeId);
                    let chain = chainsPopulated[chainTypeIdToInternalId(chainTypeId)];
                    return (
                      <li
                        role={'button'}
                        onClick={() => {
                          setIsOpen(false);
                          console.log(chainTypeId);
                          onChange(chainTypeId);
                        }}
                        className={isSelected ? 'selected' : ''}
                        key={`${chainTypeId}-chain-input`}
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

const ChainInputWrapper = styled.div``;
type ChainInputProps = {
  chains: ChainTypeId[];
  label: string;
  selectedChain: ChainTypeId | undefined;
  setSelectedChain?(chain: ChainTypeId | undefined): void;
};

export const ChainInput: React.FC<ChainInputProps> = ({ chains, label, selectedChain, setSelectedChain }) => {
  return (
    <InputSection>
      <ChainInputWrapper>
        <InputLabel label={label}>
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
        </InputLabel>
      </ChainInputWrapper>
    </InputSection>
  );
};
