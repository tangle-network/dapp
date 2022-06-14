import {
  Avatar,
  ClickAwayListener,
  Icon,
  IconButton,
  List,
  ListItemAvatar,
  ListItemText,
  Popper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { CurrencyContent, evmIdIntoInternalChainId, Web3Provider, WebbCurrencyId } from '@webb-dapp/api-providers';
import { currenciesConfig } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
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
  width: 100%;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.heavySelectionBorderColor};
  overflow: hidden;
  background: ${({ theme }) => theme.heavySelectionBackground};

  ${({ open, theme }) => {
    return open
      ? css`
          background: ${theme.layer1Background};
          max-height: 350px;
        `
      : css``;
  }}

  .account-header {
    display: flex;
    align-items: center;
    padding: 5px;

    ${above.xs`
      padding: 8px 12px;
    `}
  }

  .token-avatar {
    width: 26px;
    height: 26px;

    ${above.xs`
      width: 32px;
      height: 32px;
    `}
  }

  .token-text {
    max-width: 54px;
    margin-left: 4px;
    font-weight: 600;

    ${above.xs`
      max-width: none;
      margin-left: 0px;
    `}

    * {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      ${above.xs`
        overflow: auto;
        white-space: normal;
        text-overflow: clip;
      `}
    }
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
    border-radius: 0px 0px 8px 8px;
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
  onChange(next: CurrencyContent): void;
  wrapperStyles?: CSSProperties;
};

const TokenName = styled.span`
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
  const { isXsOrAbove } = useBreakpoint();

  return (
    <div style={wrapperStyles}>
      <ClickAwayListener
        onClickAway={() => {
          setIsOpen(false);
        }}
      >
        <TokenInputWrapper open={isOpen} ref={wrapperRef}>
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
                {isXsOrAbove && <Padding x={0.5} />}
                <Flex jc={'center'} className='token-text'>
                  <Typography variant={'h6'} component={'span'}>
                    {selected.symbol}
                  </Typography>
                </Flex>
              </Flex>
            ) : (
              <Flex row ai='center' jc='flex-start' flex={1}>
                <Avatar
                  style={{
                    background: theme.warning,
                  }}
                  className='token-avatar'
                >
                  <Icon
                    style={{
                      color: '#fff',
                    }}
                    fontSize={isXsOrAbove ? 'large' : 'medium'}
                  >
                    generating_tokens
                  </Icon>
                </Avatar>
                {isXsOrAbove && <Padding x={0.5} />}
                <Flex jc={'center'} className='chain-text'>
                  <Typography
                    display='block'
                    variant={isXsOrAbove ? 'subtitle1' : 'caption'}
                    color={'textSecondary'}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Select Token
                  </Typography>
                </Flex>
              </Flex>
            )}

            <div className={'account-button-wrapper'}>
              <IconButton
                size='small'
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
                            <TokenName>{name}</TokenName>
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
