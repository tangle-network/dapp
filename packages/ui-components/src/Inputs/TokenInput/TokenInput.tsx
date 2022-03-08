import {
  ClickAwayListener,
  Icon,
  IconButton,
  List,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Popper from '@material-ui/core/Popper';
import { currenciesConfig, evmIdIntoInternalChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment';
import { CurrencyContent } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { Web3Provider } from '@webb-dapp/wallet/providers/web3/web3-provider';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const StyledList = styled.ul`
  background: ${({ theme }) => theme.background};

  li {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px;

    &.selected,
    :hover {
      background: ${({ theme }) => (theme.type === 'dark' ? theme.layer3Background : theme.gray1)};
    }

    position: relative;
  }
`;

const TokenInputWrapper = styled.div<{ open: boolean }>`
  border-radius: 25px;
  border: ${({ theme }) => theme.heavySelectionBorder};
  overflow: hidden;
  background: ${({ theme }) => theme.heavySelectionBackground};

  ${({ open, theme }) => {
    return open
      ? css`
          background: ${theme.layer1Background};
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
  .account-avatar {
    background: transparent;
  }
`;

const PopperList = styled.div<{ open: boolean }>`
  ${StyledList} {
    overflow: hidden;
    .account-avatar {
      background: transparent;
    }
    border-radius: 0px 0px 25px 25px;
    border: 1px solid ${({ theme }) => (theme.type === 'dark' ? 'black' : theme.gray13)};
    background: ${({ theme }) => theme.background};
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
  }
`;

export type TokenInputProps = {
  currencies: CurrencyContent[];
  value?: CurrencyContent | null;
  onChange(next: CurrencyContent | null): void;
  wrapperStyles?: CSSProperties;
};
const ChainName = styled.span`
  max-width: 100px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TokenInput: React.FC<TokenInputProps> = ({ currencies, onChange, value, wrapperStyles }) => {
  const { activeApi } = useWebContext();
  const selectItems = useMemo(() => {
    const selectableItems = currencies.map((currency) => {
      return {
        ...currency.view,
        self: currency,
      };
    });

    return selectableItems;
  }, [currencies]);

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

  const [$wrapper, setWrapper] = useState<{ current: HTMLDivElement | null }>({ current: null });
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorPallet();

  const addTokenToMetaMask = async (currencyId: WebbCurrencyId) => {
    const provider: Web3Provider = activeApi?.getProvider();
    const activeEVM = await provider.network;
    const entryChainId = evmIdIntoInternalChainId(activeEVM);

    const token = currenciesConfig[currencyId];
    const tokenAddress = token.addresses.get(entryChainId);
    if (!tokenAddress) {
      return;
    }
    await provider.addToken({
      address: tokenAddress,
      decimals: 18,
      image: token.imageUrl ?? '',
      symbol: token.symbol,
    });
  };

  const wrapperRef = useCallback(
    (current: HTMLDivElement | null) => {
      setWrapper({ current });
    },
    [setWrapper]
  );
  // Generate a random id for the <Popper/> component
  const nonce = useMemo(() => String(Math.random()) + performance.now(), []);
  return (
    <div>
      <ClickAwayListener
        onClickAway={() => {
          setIsOpen(false);
        }}
      >
        <TokenInputWrapper open={isOpen} ref={wrapperRef} style={wrapperStyles}>
          <div
            onClick={(event) => {
              setIsOpen((p) => !p);
            }}
            className='account-header'
          >
            {selected ? (
              <Flex row ai='center' jc='flex-start' flex={1}>
                <Tooltip title={<h2>{`Add ${selected.name} to MetaMask`}</h2>}>
                  <Avatar
                    style={{
                      cursor: 'copy',
                      background: 'transparent',
                    }}
                    children={selected.icon}
                    className={'token-avatar'}
                    onClick={() => {
                      addTokenToMetaMask(selected.id);
                    }}
                  />
                </Tooltip>
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
          <Popper
            placement={'bottom-end'}
            open={isOpen}
            anchorEl={$wrapper?.current}
            key={`currencies-${currencies.length}-${nonce}`}
          >
            <PopperList open={isOpen} style={{ width: $wrapper.current?.clientWidth }}>
              <StyledList as={List} dense disablePadding>
                {selectItems.map(({ icon: Icon, id, name, self: currency, symbol }) => {
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
                          <Avatar
                            onClick={() => {
                              addTokenToMetaMask(selected?.id!);
                            }}
                            style={{ background: 'transparent' }}
                            children={Icon}
                          />
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
            </PopperList>
          </Popper>
        </TokenInputWrapper>
      </ClickAwayListener>
    </div>
  );
};
