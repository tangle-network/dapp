import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { CurrencyId } from '@webb-tools/types/interfaces';
import { getTokenImage } from '@webb-dapp/react-components';
import Avatar from '@material-ui/core/Avatar';
import { ClickAwayListener, Icon, IconButton, List, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import Popper from '@material-ui/core/Popper';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';

const TokenInputWrapper = styled.div<{ open: boolean }>`
  border-radius: 25px;
  border: 1px solid ${lightPallet.gray13};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: #c8cedd 37%;
  ${({ open }) => {
    return open
      ? css`
          box-shadow: 1px 1px 14px rgba(54, 86, 233, 0.2);
          max-height: 350px;
        `
      : css`
          max-height: 50px;
        `;
  }}
  .account-header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${lightPallet.gray13};
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
      background: ${lightPallet.gray1};
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
  currencies: CurrencyId[];
  value?: CurrencyId;
  onChange(next: CurrencyId | undefined): void;
};

export const TokenInput: React.FC<TokenInputProps> = ({ currencies, value, onChange }) => {
  const selectItems = useMemo(() => {
    return currencies.map((currency) => {
      return {
        label: currency.value.toString(),
        self: currency,
        value: currency.value.toString(),
      };
    });
  }, [currencies]);

  useEffect(() => {
    if (!value) {
      onChange(currencies[0]);
    }
  }, [value, currencies]);

  const selected = useMemo(() => {
    if (!value) {
      return undefined;
    }
    return {
      label: value.asToken.toString(),
      tokenImage: getTokenImage(value.asToken.toString()),
      value: value.value.toString(),
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
              <div className='account-header'>
                {selected ? (
                  <Flex row ai='center' jc='flex-start' flex={1}>
                    <Avatar
                      style={{ background: 'transparent' }}
                      src={selected.tokenImage}
                      className={'token-avatar'}
                    />
                    <Padding x={0.5} />
                    <Flex jc={'center'}>
                      <Typography variant={'body2'}>{selected.label}</Typography>
                      <Typography variant={'caption'} color={'textSecondary'}>
                        Edgeware
                      </Typography>
                    </Flex>
                  </Flex>
                ) : (
                  'Select Token'
                )}

                <div className={'account-button-wrapper'}>
                  <IconButton
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'all ease .3s',
                    }}
                    onClick={() => {
                      setIsOpen((p) => !p);
                    }}
                  >
                    <Icon>expand_more</Icon>
                  </IconButton>
                </div>
              </div>

              <StyledList as={List} dense disablePadding>
                {selectItems.map(({ self: currency, label }) => {
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
                          <Avatar
                            style={{ background: 'transparent' }}
                            src={getTokenImage(currency.asToken.toString())}
                          />
                        </ListItemAvatar>
                        <ListItemText>
                          <Typography>{currency.asToken.toString()}</Typography>
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
