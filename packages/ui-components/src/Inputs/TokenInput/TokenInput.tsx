import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { CurrencyId } from '@webb-tools/types/interfaces';
import HeadlessDropdown from '../HeadlessDropDown/HeadlessDropDown';
import { getTokenImage } from '@webb-dapp/react-components';
import Avatar from '@material-ui/core/Avatar';
import { ListItem, ListItemAvatar, ListItemText, Typography } from '@material-ui/core';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';

const TokenInputWrapper = styled.div`
  height: 38px;
  width: 122px;
  padding: 5px;
  background: #c8cedd 37%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 31px;

  .token-avatar {
    width: 33.6px;
    height: 33.6px;
    border: 2px solid #fff;
  }
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

  return (
    <>
      <HeadlessDropdown
        items={selectItems}
        Anchor={({ ...props }) => {
          // @ts-ignore
          return (
            <TokenInputWrapper {...props}>
              {selected ? (
                <Flex row ai='center' jc='flex-start' flex={1}>
                  <Avatar style={{ background: 'transparent' }} src={selected.tokenImage} className={'token-avatar'} />
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
            </TokenInputWrapper>
          );
        }}
        selected={selected}
        renderItem={(item) => {
          const currency = item.self;
          return (
            <Flex ai='center' row>
              <ListItemAvatar>
                <Avatar style={{ background: 'transparent' }} src={getTokenImage(currency.asToken.toString())} />
              </ListItemAvatar>
              <ListItemText>
                <Typography>{currency.asToken.toString()}</Typography>
              </ListItemText>
            </Flex>
          );
        }}
      />
    </>
  );
};
