import { Avatar, ClickAwayListener, IconButton } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { ChainTypeId, chainTypeIdToInternalId } from '@webb-dapp/api-providers';
import { chainsPopulated } from '@webb-dapp/apps/configs';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { Flex } from '@webb-dapp/ui-components/Flex/Flex';
import { Modal } from '@webb-dapp/ui-components/Modal/Modal';
import { NetworkManager } from '@webb-dapp/ui-components/NetworkManger/NetworkManager';
import { Padding } from '@webb-dapp/ui-components/Padding/Padding';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { above, useBreakpoint } from '@webb-dapp/ui-components/utils/responsive-utils';
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import ChainSelection from '../ChainSelection/ChainSelection';

const InputWrapper = styled.div<{ open: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ theme }: { theme: Pallet }) => theme.heavySelectionBorderColor};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.heavySelectionBackground};

  ${({ open, theme }) => {
    return open
      ? css`
          max-height: 350px;
          border-radius: 8px 8px 0 0;
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

  .account-button-wrapper {
    margin: -20px 0;
  }

  .token-avatar {
    width: 26px;
    height: 26px;

    ${above.xs`
      width: 32px;
      height: 32px;
    `}
  }

  .chain-text {
    max-width: 54px;
    margin-left: 4px;

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
`;

type DropdownInputProps = {
  chains: ChainTypeId[];
  value?: ChainTypeId;
  onChange(next: ChainTypeId | undefined): void;
};

const DropdownInput: React.FC<DropdownInputProps> = ({ chains, onChange, value }) => {
  useEffect(() => {
    if (value && !chains.includes(value)) {
      onChange(undefined);
    }
  }, [value, chains, onChange]);

  const selected = useMemo(() => {
    if (!value && typeof value === 'undefined') {
      return undefined;
    }

    if (Number(value.chainType) === -1 || Number(value.chainId) === -1) {
      return undefined;
    }

    return {
      id: value,
      chain: chainsPopulated[chainTypeIdToInternalId(value)],
    };
  }, [value]);

  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorPallet();
  const { isXsOrAbove } = useBreakpoint();

  return (
    <>
      <div>
        <ClickAwayListener
          onClickAway={() => {
            setIsOpen(false);
          }}
        >
          <InputWrapper open={isOpen}>
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
                    children={<selected.chain.logo />}
                    className={'token-avatar'}
                  />
                  {isXsOrAbove && <Padding x={0.5} />}
                  <div className='chain-text'>
                    <Typography
                      variant={isXsOrAbove ? 'subtitle1' : 'caption'}
                      component={'span'}
                      display={'block'}
                      style={{ fontWeight: '700' }}
                    >
                      {selected.chain.name}
                    </Typography>
                  </div>
                </Flex>
              ) : (
                <Flex row ai='center' jc='flex-start' flex={1}>
                  <Avatar
                    style={{
                      background: theme.warning,
                    }}
                    className={'token-avatar'}
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
                  <div className='chain-text'>
                    <Typography display='block' variant={isXsOrAbove ? 'subtitle1' : 'caption'} color={'textSecondary'}>
                      Select chain
                    </Typography>
                  </div>
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
              <ChainSelection
                chainTypeIds={chains}
                onClose={() => setIsOpen(false)}
                selectedChain={selected?.chain}
                onChange={onChange}
              />
            </Modal>
          </InputWrapper>
        </ClickAwayListener>
      </div>
    </>
  );
};

type ChainInputProps = {
  chains: ChainTypeId[];
  selectedChain: ChainTypeId | undefined;
  setSelectedChain?(chain: ChainTypeId | undefined): void;
  wrapperStyles?: CSSProperties;
};

export const ChainInput: React.FC<ChainInputProps> = ({ chains, selectedChain, setSelectedChain, wrapperStyles }) => {
  return (
    <div style={wrapperStyles}>
      {setSelectedChain && (
        <DropdownInput
          chains={chains}
          value={selectedChain}
          onChange={(chain) => {
            setSelectedChain(chain);
          }}
        />
      )}
      {!setSelectedChain && <NetworkManager />}
    </div>
  );
};
