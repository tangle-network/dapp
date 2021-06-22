import { ClickAwayListener, Icon, IconButton, List, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Popper from '@material-ui/core/Popper';
import { Currency } from '@webb-dapp/mixer/utils/currency';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const TokenInputWrapper = styled.div<{ open: boolean }>`
  border-radius: 25px;
  border: 1px solid ${({ theme }: { theme: Pallet }) => theme.borderColor};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.background} 37%;

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
      background: ${({ theme }) => theme.gray1};
    }

    position: relative;
  }
`;

const AccountManagerWrapper = styled.div<any>`
  min-width: 160px;
  height: 0px;
  background: #ffffff;
  position: relative;
  top: -32.5px;
`;

type TokenInputProps = {
  currencies: Currency[];
  value?: Currency;
  onChange(next: Currency | undefined): void;
};

export const TokenInput: React.FC<TokenInputProps> = ({ currencies, onChange, value }) => {
  const selectItems = useMemo(() => {
    return currencies.map((currency) => {
      return {
        label: currency.currencyId.toString(),
        self: currency,
        value: currency.toString(),
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
    return {
      label: value.currencyId.toString(),
      name: value.fullName,
      symbol: value.symbol,
      tokenImage: value.image,
      value: value.currencyId.toString(),
    };
  }, [value]);
  const $wrapper = useRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AccountManagerWrapper ref={$wrapper}>
        <ClickAwayListener
          onClickAway={() => {
            setIsOpen(false);
          }}
        >
          <Popper placement={'bottom-end'} open={Boolean($wrapper?.current)} anchorEl={$wrapper?.current}>
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
                      src={selected.tokenImage}
                      className={'token-avatar'}
                    />
                    <Padding x={0.5} />
                    <Flex jc={'center'}>
                      <Typography variant={'body2'}>{selected.symbol}</Typography>
                      <Typography variant={'caption'} color={'textSecondary'}>
                        {selected.name}
                      </Typography>
                    </Flex>
                  </Flex>
                ) : (
                  <Flex row ai='center' jc='flex-start' flex={1}>
                    <Avatar>
                      <Icon fontSize={'large'}>generating_tokens</Icon>
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
                {selectItems.map(({ label, self: currency }) => {
                  const isSelected = selected?.label === label;
                  return (
                    <li
                      role={'button'}
                      onClick={() => {
                        setIsOpen(false);
                        onChange(currency);
                      }}
                      className={isSelected ? 'selected' : ''}
                      key={label + 'currency'}
                    >
                      <Flex ai='center' row>
                        <ListItemAvatar>
                          <Avatar style={{ background: 'transparent' }} src={currency.image} />
                        </ListItemAvatar>
                        <ListItemText>
                          <Typography>{currency.symbol}</Typography>
                          <Typography variant={'caption'} color={'textSecondary'}>
                            {currency.fullName}
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
