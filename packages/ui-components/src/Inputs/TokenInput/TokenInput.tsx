import { ClickAwayListener, Icon, IconButton, List, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Popper from '@material-ui/core/Popper';
import { Currency, CurrencyContent } from '@webb-dapp/react-environment/types/currency';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
const StyledList = styled.ul`
  &&& {
    padding: 10px 0 !important;
    list-style: none;
  }

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

const TokenInputWrapper = styled.div<{ open: boolean }>`
  border-radius: 25px;
  border: 1px solid ${({ theme }: { theme: Pallet }) => theme.borderColor};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.layer3Background} 37%;

  ${({ open, theme }: { open: boolean; theme: Pallet }) => {
    return open
      ? css`
          background: ${theme.layer1Background} 9%;
          box-shadow: 1px 1px 14px ${theme.type === 'dark' ? 'black' : 'rgba(54, 86, 233, 0.1)'};

          max-height: 350px;
        `
      : css`
          max-height: 50px;
        `;
  }}
  ${StyledList} {
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

  .account-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.gray13};
    padding: 5px;
  }

  .account-avatar {
    background: transparent;
  }

  .account-button-wrapper {
    margin: -20px 0;
  }
`;

const AccountManagerWrapper = styled.div<any>`
  min-width: 200px;
  height: 0;
  background: #ffffff;
  position: relative;
  top: -52px;
`;

type TokenInputProps = {
  currencies: CurrencyContent[];
  value?: CurrencyContent;
  onChange(next: CurrencyContent | undefined): void;
};
const ChainName = styled.span`
  max-width: 100px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const TokenInput: React.FC<TokenInputProps> = ({ currencies, onChange, value }) => {
  const selectItems = useMemo(() => {
    return currencies.map((currency) => {
      const view = currency.view;
      return {
        ...view,
        self: currency,
      };
    });
  }, [currencies]);

  useEffect(() => {
    if (!value) {
      onChange(currencies[0]);
    }
  }, [value, currencies, onChange]);

  const selected = useMemo(() => {
    if (!value) {
      return undefined;
    }
    const view = value.view;
    return {
      ...view,
      self: value,
    };
  }, [value]);
  const $wrapper = useRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorPallet();
  return (
    <>
      <AccountManagerWrapper ref={$wrapper}>
        <ClickAwayListener
          onClickAway={() => {
            setIsOpen(false);
          }}
        >
          <Popper
						style={{
							zIndex: isOpen ? 10 : null,
						}}
						placement={'bottom-end'} open={Boolean($wrapper?.current)} anchorEl={$wrapper?.current}>
            <TokenInputWrapper
              open={isOpen}
              style={{
                width: $wrapper.current?.offsetWidth,
              }}
            >
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
                      children={selected?.icon}
                      className={'token-avatar'}
                    />
                    <Padding x={0.5} />
                    <Flex jc={'center'}>
                      <Typography variant={'h6'} component={'span'}>
                        <b>{selected.symbol}</b>
                      </Typography>
                      <Typography variant={'body2'} color={'textSecondary'}>
                        <ChainName>
                          <b>{selected.name}</b>
                        </ChainName>
                      </Typography>
                    </Flex>
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
                        Select Token
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

              <StyledList as={List} dense disablePadding>
                {selectItems.map(({ name, icon: Icon, id, self: currency, symbol }) => {
                  const isSelected = selected?.id === id;
                  return (
                    <li
                      role={'button'}
                      onClick={() => {
                        setIsOpen(false);
                        onChange(currency);
                      }}
                      className={isSelected ? 'selected' : ''}
                      key={id + symbol + 'currency'}
                    >
                      <Flex ai='center' row>
                        <ListItemAvatar>
                          <Avatar style={{ background: 'transparent' }} children={Icon} />
                        </ListItemAvatar>
                        <ListItemText>
                          <Typography variant={'h6'} component={'span'}>
                            <b>{symbol}</b>
                          </Typography>
                          <Typography variant={'body2'} color={'textSecondary'}>
                            <ChainName>{name}</ChainName>
                          </Typography>
                        </ListItemText>
                      </Flex>
                    </li>
                  );
                })}
              </StyledList>
            </TokenInputWrapper>
          </Popper>
        </ClickAwayListener>
      </AccountManagerWrapper>
    </>
  );
};
