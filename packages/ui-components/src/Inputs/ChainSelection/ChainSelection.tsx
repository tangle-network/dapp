import { Avatar, InputBase, ListItemAvatar, ListItemText } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { Chain } from '@webb-dapp/api-providers/abstracts';
import { TypedChainId, typedChainIdToInternalId } from '@webb-dapp/api-providers/chains';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import SearchIcon from '@webb-dapp/ui-components/assets/SearchIcon';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { CloseIcon } from '../..';
import { ListEmpty } from '../shared';
import {
  CircleStatus,
  CloseHeaderButtonWrapper,
  ItemWrapper,
  ListWrapper,
  SearchIconWrapper,
  SearchWrapper,
  SelectionWrapper,
} from '../shared/styled';

const ChainSelectionWrapper = styled(SelectionWrapper)``;

const CloseIconWrapper = styled(CloseHeaderButtonWrapper)``;

const ChainsList = styled(ListWrapper)``;

const ListItem = styled(ItemWrapper)``;

export type ChainSelectionProps = {
  chainTypeIds: TypedChainId[];
  onChange(next: TypedChainId | undefined): void;
  onClose?: () => void;
  selectedChain?: Chain;
};

const ChainSelection: React.FC<ChainSelectionProps> = ({ chainTypeIds, onChange, onClose, selectedChain }) => {
  const { isXlOrAbove } = useBreakpoint();
  const pallet = useColorPallet();

  const [displayChainTypeIds, setDisplayChainTypeIds] = useState(chainTypeIds);

  const getChainFromChainTypeId = useCallback(
    (chainTypeId: TypedChainId) => chainsPopulated[typedChainIdToInternalId(chainTypeId)],
    []
  );

  const searchChains = useMemo(
    () =>
      debounce((query: string) => {
        if (!query) {
          return setDisplayChainTypeIds(chainTypeIds);
        }

        setDisplayChainTypeIds(
          chainTypeIds.filter((chainTypeId) => {
            const chain = getChainFromChainTypeId(chainTypeId);
            return chain.name.toLowerCase().includes(query.toLowerCase());
          })
        );
      }, 300),
    [chainTypeIds, setDisplayChainTypeIds, getChainFromChainTypeId]
  );

  /** Cleanup */
  useEffect(() => {
    return () => {
      searchChains.cancel();
    };
  }, [searchChains]);

  return (
    <ChainSelectionWrapper>
      <Flex row jc='space-between' ai='center'>
        <header>
          <Typography variant={isXlOrAbove ? 'h5' : 'h6'} style={{ fontWeight: '600' }}>
            Select a chain
          </Typography>
          <Typography variant='subtitle1'>Select your source chain</Typography>
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
          placeholder='Search by chain name...'
          inputProps={{ 'aria-label': 'search' }}
          style={{ fontSize: '10px', marginLeft: '10px' }}
          onChange={(ev) => searchChains(ev.target.value)}
        />
      </SearchWrapper>
      <ChainsList>
        {displayChainTypeIds.length ? (
          displayChainTypeIds.map((chainTypeId, idx) => {
            const chain = getChainFromChainTypeId(chainTypeId);
            const selected = selectedChain?.id === chain.id;
            const onClick = selected
              ? undefined
              : () => {
                  onClose?.();
                  onChange(chainTypeId);
                };

            return (
              <ListItem key={chain.id} idx={idx} selected={selected} onClick={onClick}>
                <ListItemAvatar>
                  <Avatar className='list-item-avatar' children={<chain.logo />} />
                </ListItemAvatar>
                <ListItemText className='list-item-text'>
                  <Typography variant={'h6'} component={'span'} display={'block'}>
                    <b>{chain.name}</b>
                  </Typography>
                </ListItemText>
                {selected && <CircleStatus />}
              </ListItem>
            );
          })
        ) : (
          <ListEmpty text='No available chains.' />
        )}
      </ChainsList>
    </ChainSelectionWrapper>
  );
};

export default ChainSelection;
