import { Avatar, ClickAwayListener, Icon, IconButton, Typography } from '@mui/material';
import { chainsPopulated } from '@nepoche/dapp-config';
import { useColorPallet } from '@nepoche/styled-components-theme';
import { Flex } from '@nepoche/ui-components/Flex/Flex';
import { Modal } from '@nepoche/ui-components/Modal/Modal';
import { NetworkManager } from '../NetworkManager/NetworkManager';
import { Padding } from '@nepoche/ui-components/Padding/Padding';
import { Pallet } from '@nepoche/styled-components-theme';
import { above, useBreakpoint } from '@nepoche/responsive-utils';
import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import ChainSelection from '../ChainSelection/ChainSelection';

const InputWrapper = styled.div<{ open: boolean }>`
  border-radius: 8px;
  border: 1px solid ${({ theme }: { theme: Pallet }) => theme.heavySelectionBorderColor};

  overflow: hidden;
  transition: all 0.3s ease-in-out;
  background: ${({ theme }) => theme.heavySelectionBackground};

  ${({ open }) => {
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
  chains: number[];
  value?: number;
  onChange(next: number | undefined): void;
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

    if (!chainsPopulated[value]) {
      return undefined;
    }

    return {
      id: value,
      chain: chainsPopulated[value],
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
                chainTypeIds={chains
                  .filter((chain) => chainsPopulated[chain])
                  .map((chain) => {
                    return {
                      chainId: chainsPopulated[chain].chainId,
                      chainType: chainsPopulated[chain].chainType,
                    };
                  })}
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
  chains: number[];
  selectedChain: number | undefined;
  setSelectedChain?(chain: number | undefined): void;
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
