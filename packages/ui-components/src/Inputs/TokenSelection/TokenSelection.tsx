import { Avatar, InputBase, ListItemAvatar, ListItemText, Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { CurrencyContent } from '@webb-dapp/api-providers/abstracts';
import { WebbCurrencyId } from '@webb-dapp/api-providers/enums';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import SearchIcon from '@webb-dapp/ui-components/assets/SearchIcon';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { CloseIcon } from '../..';

const TokenSelectionWrapper = styled.div`
  border-radius: 4px;
  padding: 12px 18px;
  margin: 0 auto;
  width: 80vw;

  ${above.sm`
    width: 40vw;
    border-radius: 8px;
    padding: 32px;
  `}
`;

const CloseIconWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12px;
  height: 12px;
  padding: 4px;
  border-radius: 50%;
  background-color: ${({ theme }) => (theme.type === 'dark' ? 'rgba(255, 255, 255, 0.26)' : 'rgba(52, 52, 52, 0.26)')};
  cursor: pointer;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  padding: 4px 8px;
  margin-top: 12px;
  transition: none;
  background-color: ${({ theme }) => theme.lightSelectionBackground};
  :hover {
    background-color: ${({ theme }) => theme.heavySelectionBackground};
  }

  ${above.sm`
    padding: 8px 16px;
  `}
`;

const SearchIconWrapper = styled.div`
  width: 12px;
  height: 12px;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TokensList = styled.ul`
  margin-top: 24px;
  height: 256px;
  overflow-y: scroll;
`;

const ListItem = styled.li<{ idx: number; selected: boolean }>`
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: none;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.lightSelectionBackground};
  cursor: ${({ selected }) => (selected ? 'no-drop' : 'pointer')};
  :hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.lightSelectionBackground : theme.heavySelectionBackground};
  }

  margin-top: ${({ idx }) => (idx ? '12px' : '0px')};
  border: ${({ selected, theme }) =>
    selected ? `1px solid ${theme.type === 'dark' ? theme.accentColor : '#000'}` : 'none'};

  .MuiListItemAvatar-root {
    min-width: 0px;
    margin-right: 6px;
  }

  .list-item-avatar {
    background: transparent;
    width: 28px;
    height: 28px;
  }

  .list-item-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const CircleStatus = styled.div`
  padding: 4px;
  background-color: ${({ theme }) => (theme.type === 'dark' ? theme.accentColor : '#000')};
  border-radius: 50%;
`;

export type TokenSelectionProps = {
  currencies: CurrencyContent[];
  onAddToMetaMask: (currencyId: WebbCurrencyId) => Promise<void>;
  onChange: (next: CurrencyContent) => void;
  onClose: () => void;
  selectedToken?: CurrencyContent | undefined | null;
};

const TokenSelection: React.FC<TokenSelectionProps> = ({
  currencies,
  onAddToMetaMask,
  onChange,
  onClose,
  selectedToken,
}) => {
  const { isXlOrAbove } = useBreakpoint();
  const pallet = useColorPallet();

  const [displayCurrencies, setDisplayCurrencies] = useState(currencies);

  const searchCurrencies = useMemo(
    () =>
      debounce((query: string) => {
        if (!query) {
          return setDisplayCurrencies(currencies);
        }

        setDisplayCurrencies(
          currencies.filter(
            ({ view: { name, symbol } }) =>
              name.toLowerCase().includes(query.toLowerCase()) || symbol.toLowerCase().includes(query.toLowerCase())
          )
        );
      }, 300),
    [currencies, setDisplayCurrencies]
  );

  /** Effect & Cleanup */
  useEffect(() => {
    setDisplayCurrencies(currencies);
  }, [currencies]);

  useEffect(() => {
    return () => {
      searchCurrencies.cancel();
    };
  }, [searchCurrencies]);

  /** Component */
  const TokenListValues = useCallback(
    () => (
      <>
        {displayCurrencies.map((currency, idx) => {
          const { icon: Icon, id, name, symbol } = currency.view;
          const selected = selectedToken?.view.id === id;

          return (
            <ListItem
              key={id}
              idx={idx}
              selected={selected}
              onClick={
                selected
                  ? undefined
                  : () => {
                      onClose?.();
                      onChange(currency);
                    }
              }
            >
              <ListItemAvatar>
                <Tooltip title={<h2>{`Add ${symbol} to MetaMask`}</h2>}>
                  <Avatar
                    className='list-item-avatar'
                    children={Icon}
                    onClick={() => onAddToMetaMask(id)}
                    style={{ cursor: 'copy' }}
                  />
                </Tooltip>
              </ListItemAvatar>
              <ListItemText className='list-item-text'>
                <Typography variant={'h6'} component={'span'} display={'block'}>
                  <b>{symbol}</b>
                </Typography>
                <Typography variant={'body2'} color={'textSecondary'} display={'block'}>
                  <b>{name}</b>
                </Typography>
              </ListItemText>
              {selected && <CircleStatus />}
            </ListItem>
          );
        })}
      </>
    ),
    [displayCurrencies, selectedToken, onChange, onClose, onAddToMetaMask]
  );

  return (
    <TokenSelectionWrapper>
      <Flex row jc='space-between' ai='center'>
        <header>
          <Typography variant={isXlOrAbove ? 'h5' : 'h6'} style={{ fontWeight: '600' }}>
            Select a token
          </Typography>
        </header>
        <CloseIconWrapper onClick={onClose}>
          <CloseIcon width='8px' height='8px' strokeWidth={5} stroke={pallet.primaryText} />
        </CloseIconWrapper>
      </Flex>
      <SearchWrapper>
        <SearchIconWrapper>
          <SearchIcon fill={pallet.primaryText} />
        </SearchIconWrapper>
        <InputBase
          fullWidth
          placeholder='Search tokens...'
          inputProps={{ 'aria-label': 'search' }}
          style={{ fontSize: '10px', marginLeft: '10px' }}
          onChange={(ev) => searchCurrencies(ev.target.value)}
        />
      </SearchWrapper>
      <TokensList>
        <TokenListValues />
      </TokensList>
    </TokenSelectionWrapper>
  );
};

export default TokenSelection;
