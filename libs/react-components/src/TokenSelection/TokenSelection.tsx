import { Avatar, InputBase, ListItemAvatar, ListItemText, Tooltip, Typography } from '@mui/material';
import { Currency } from '@nepoche/abstract-api-provider';
import { CurrencyId } from '@nepoche/dapp-types';
import { useColorPallet } from '@nepoche/styled-components-theme';
import SearchIcon from '@nepoche/ui-components/assets/SearchIcon';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { useBreakpoint } from '@nepoche/responsive-utils';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { CloseIcon } from '@nepoche/ui-components';
import { ListEmpty } from '@nepoche/ui-components/Inputs/shared';
import {
  CircleStatus,
  CloseHeaderButtonWrapper,
  ItemWrapper,
  ListWrapper,
  SearchIconWrapper,
  SearchWrapper,
  SelectionWrapper,
} from '@nepoche/ui-components/Inputs/shared/styled';

const TokenSelectionWrapper = styled(SelectionWrapper)``;

const CloseIconWrapper = styled(CloseHeaderButtonWrapper)``;

const TokensList = styled(ListWrapper)``;

const ListItem = styled(ItemWrapper)``;

export type TokenSelectionProps = {
  currencies: Currency[];
  onAddToMetaMask: (currencyId: CurrencyId) => Promise<void>;
  onChange: (next: Currency) => void;
  onClose: () => void;
  selectedToken?: Currency | undefined | null;
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
        {displayCurrencies.length ? (
          displayCurrencies.map((currency, idx) => {
            const { icon: Icon, id, name, symbol } = currency.view;
            const selected = selectedToken?.view.id === id;
            const onClick = selected
              ? undefined
              : () => {
                  onClose?.();
                  onChange(currency);
                };

            return (
              <ListItem key={id} idx={idx} selected={selected} onClick={onClick}>
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
          })
        ) : (
          <ListEmpty text='No tokens available.' />
        )}
      </TokensList>
    </TokenSelectionWrapper>
  );
};

export default TokenSelection;
