import { Avatar, InputBase, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import { Chain, chainsPopulated } from '@nepoche/dapp-config';
import { TypedChainId } from '@nepoche/dapp-types';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { CloseIcon } from '@nepoche/ui-components';
import SearchIcon from '@nepoche/ui-components/assets/SearchIcon';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import {
  CircleStatus,
  CloseHeaderButtonWrapper,
  ItemWrapper,
  ListWrapper,
  ListEmpty,
  SearchIconWrapper,
  SearchWrapper,
  SelectionWrapper,
} from '@nepoche/ui-components';
import { useBreakpoint } from '@nepoche/responsive-utils';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const ChainSelectionWrapper = styled(SelectionWrapper)``;

const CloseIconWrapper = styled(CloseHeaderButtonWrapper)``;

const ChainsList = styled(ListWrapper)``;

const ListItem = styled(ItemWrapper)``;

export type ChainSelectionProps = {
  chainTypeIds: TypedChainId[];
  onChange(next: number | undefined): void;
  onClose?: () => void;
  selectedChain?: Chain;
};

const ChainSelection: React.FC<ChainSelectionProps> = ({ chainTypeIds, onChange, onClose, selectedChain }) => {
  const { isXlOrAbove } = useBreakpoint();
  const pallet = useColorPallet();

  const [displayChainTypeIds, setDisplayChainTypeIds] = useState(chainTypeIds);

  const getChainFromChainTypeId = useCallback(
    (chainTypeId: TypedChainId) => chainsPopulated[calculateTypedChainId(chainTypeId.chainType, chainTypeId.chainId)],
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
            const selected = selectedChain?.chainId === chain.chainId;
            const onClick = selected
              ? undefined
              : () => {
                  onClose?.();
                  onChange(calculateTypedChainId(chain.chainType, chain.chainId));
                };

            return (
              <ListItem key={chain.chainId} idx={idx} selected={selected} onClick={onClick}>
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
