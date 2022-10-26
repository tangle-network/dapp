import { Avatar, ClickAwayListener, Icon, IconButton, Tooltip, Typography } from '@mui/material';
import { Currency } from '@nepoche/abstract-api-provider';
import { currenciesConfig } from '@nepoche/dapp-config';
import { CurrencyId } from '@nepoche/dapp-types/Currency';
import { useWebContext } from '@nepoche/api-provider-environment';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import { above, useBreakpoint } from '@nepoche/responsive-utils';
import { Web3Provider } from '@nepoche/web3-api-provider';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import React, { CSSProperties, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import TokenSelection from '../TokenSelection/TokenSelection';

const TokenInputWrapper = styled.div<{ open: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.heavySelectionBorderColor};
  overflow: hidden;
  background: ${({ theme }) => theme.heavySelectionBackground};
  cursor: pointer;

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

export type TokenInputProps = {
  currencies: Currency[];
  value?: Currency | null;
  onChange(next: Currency): void;
  wrapperStyles?: CSSProperties;
};

export const TokenInput: React.FC<TokenInputProps> = ({ currencies, onChange, value, wrapperStyles }) => {
  const { activeApi } = useWebContext();
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorPallet();
  const { isXsOrAbove } = useBreakpoint();

  const selectedToken = useMemo(() => {
    if (!value) {
      return undefined;
    }
    return value.view;
  }, [value]);

  const addTokenToMetaMask = async (currencyId: CurrencyId) => {
    const provider: Web3Provider = activeApi?.getProvider();
    const activeEVM = await provider.network;
    const typedChainId = calculateTypedChainId(ChainType.EVM, activeEVM);

    const token = currenciesConfig[currencyId];
    const tokenAddress = token.addresses.get(typedChainId);
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

  return (
    <div style={wrapperStyles}>
      <ClickAwayListener
        onClickAway={() => {
          setIsOpen(false);
        }}
      >
        <TokenInputWrapper open={isOpen}>
          <div onClick={() => setIsOpen(true)} className='account-header'>
            {selectedToken ? (
              <Flex row ai='center' jc='flex-start' flex={1}>
                <Tooltip title={<h2>{`Add ${selectedToken.symbol} to MetaMask`}</h2>}>
                  <Avatar
                    style={{
                      cursor: 'copy',
                      background: 'transparent',
                    }}
                    children={selectedToken.icon}
                    className={'token-avatar'}
                    onClick={() => {
                      addTokenToMetaMask(selectedToken.id);
                    }}
                  />
                </Tooltip>
                {isXsOrAbove && <Padding x={0.5} />}
                <Flex jc={'center'} className='token-text'>
                  <Typography variant={'h6'} component={'span'}>
                    {selectedToken.symbol}
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
          <Modal isCenterModal open={isOpen} hasBlur onClose={() => setIsOpen(false)}>
            <TokenSelection
              currencies={currencies}
              onClose={() => setIsOpen(false)}
              selectedToken={value}
              onAddToMetaMask={addTokenToMetaMask}
              onChange={onChange}
            />
          </Modal>
        </TokenInputWrapper>
      </ClickAwayListener>
    </div>
  );
};
