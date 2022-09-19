import { Slide } from '@mui/material';
import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import { MoonLine, SunLine } from '@webb-dapp/webb-ui-components/icons';
import React, { useCallback, useRef } from 'react';
import styled from 'styled-components';

const ThemeSwitcherWrapper = styled.label`
  display: block;
  width: 35px;
  height: 35px;
  overflow: hidden;
  position: relative;
  border-radius: 50%;

  &:before,
  &:after {
    transition: all 0.4s;
  }

  input {
    width: 0;
    height: 0;
    padding: 0;
  }

  .theme-entry {
    cursor: pointer;
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4;

    &:before,
    &:after {
      transition: all 0.4s;
    }

    &:after {
      z-index: -1;
      position: absolute;
      content: '';
      height: 100%;
      width: 100%;
      border-radius: 50%;
    }

    :hover::after {
      background: ${({ theme }) => (theme.type === 'dark' ? theme.darkGray : theme.lightSelectionBackground)};
    }
  }
`;

export const ThemeSwitcher: React.FC<{
  active: 'light' | 'dark';
  onChange(next: 'light' | 'dark'): void;
}> = ({ active, onChange }) => {
  const $ref = useRef<HTMLInputElement>();
  const trigger = useCallback(() => {
    $ref.current?.click();
  }, [$ref]);

  const pallet = useColorPallet();

  return (
    <ThemeSwitcherWrapper htmlFor='theme'>
      <input
        onClick={() => {
          onChange(active === 'dark' ? 'light' : 'dark');
        }}
        type='check'
        id='theme'
        name='active-theme'
        defaultValue='dark'
        defaultChecked={true}
      />
      <Slide direction={'left'} in={active === 'dark'}>
        <div className={'theme-entry dark-theme-entry'} onClick={trigger}>
          <MoonLine darkMode={active === 'dark'} size='lg' />
        </div>
      </Slide>
      <Slide direction={'right'} in={active === 'light'}>
        <div className={'theme-entry light-theme-entry'} onClick={trigger}>
          <SunLine darkMode={active === 'dark'} size='lg' />
        </div>
      </Slide>
    </ThemeSwitcherWrapper>
  );
};
