import { Slide } from '@mui/material';
import { useColorPallet } from '@nepoche/styled-components-theme';
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
          <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill={pallet.gray1}>
            <title>moon</title>
            <path d='M17.39 15.14A7.33 7.33 0 0 1 11.75 1.6c.23-.11.56-.23.79-.34a8.19 8.19 0 0 0-5.41.45 9 9 0 1 0 7 16.58 8.42 8.42 0 0 0 4.29-3.84 5.3 5.3 0 0 1-1.03.69z' />
          </svg>
        </div>
      </Slide>
      <Slide direction={'right'} in={active === 'light'}>
        <div className={'theme-entry light-theme-entry'} onClick={trigger}>
          <svg width='20' height='20' viewBox='0 0 22 21' fill={pallet.darkGray} xmlns='http://www.w3.org/2000/svg'>
            <path d='M17.3456 10.9201C17.3456 7.43412 14.511 4.62012 10.9995 4.62012C7.48794 4.62012 4.65332 7.43412 4.65332 10.9201C4.65332 14.4061 7.48794 17.2201 10.9995 17.2201C14.511 17.2201 17.3456 14.4061 17.3456 10.9201Z' />
            <path d='M17.5996 18.0602C17.6842 18.1442 17.7689 18.1862 17.8958 18.1862C18.0227 18.1862 18.1073 18.1442 18.1919 18.0602C18.3612 17.8922 18.3612 17.6402 18.1919 17.4722L17.0073 16.2962C16.8381 16.1282 16.5842 16.1282 16.415 16.2962C16.2458 16.4642 16.2458 16.7162 16.415 16.8842L17.5996 18.0602Z' />
            <path d='M2.96109 10.5H1.26878C1.01493 10.5 0.845703 10.668 0.845703 10.92C0.845703 11.172 1.01493 11.34 1.26878 11.34H2.96109C3.21493 11.34 3.38416 11.172 3.38416 10.92C3.38416 10.668 3.21493 10.5 2.96109 10.5Z' />
            <path d='M5.03451 5.58605C5.11913 5.67005 5.24605 5.71205 5.33066 5.71205C5.41528 5.71205 5.5422 5.67005 5.62682 5.58605C5.79605 5.41805 5.79605 5.16605 5.62682 4.99805L4.39989 3.78005C4.23066 3.61205 3.97682 3.61205 3.80759 3.78005C3.63836 3.94805 3.63836 4.20005 3.80759 4.36805L5.03451 5.58605Z' />
            <path d='M11.4223 2.94009V1.26009C11.4223 1.00809 11.2531 0.840088 10.9992 0.840088C10.7454 0.840088 10.5762 1.00809 10.5762 1.26009V2.94009C10.5762 3.19209 10.7454 3.36009 10.9992 3.36009C11.2531 3.36009 11.4223 3.19209 11.4223 2.94009Z' />
            <path d='M18.1919 3.78005C18.0227 3.61205 17.7689 3.61205 17.5996 3.78005L16.415 4.95605C16.2458 5.12405 16.2458 5.37605 16.415 5.54405C16.4996 5.62805 16.6265 5.67005 16.7112 5.67005C16.7958 5.67005 16.9227 5.62805 17.0073 5.54405L18.1919 4.36805C18.3612 4.24205 18.3612 3.94805 18.1919 3.78005Z' />
            <path d='M19.0383 11.34H20.7306C20.9845 11.34 21.1537 11.172 21.1537 10.92C21.1537 10.668 20.9845 10.5 20.7306 10.5H19.0383C18.7845 10.5 18.6152 10.668 18.6152 10.92C18.6152 11.172 18.7845 11.34 19.0383 11.34Z' />
            <path d='M10.5762 18.9V20.58C10.5762 20.832 10.7454 21 10.9992 21C11.2531 21 11.4223 20.832 11.4223 20.58V18.9C11.4223 18.648 11.2531 18.48 10.9992 18.48C10.7454 18.48 10.5762 18.648 10.5762 18.9Z' />
            <path d='M3.80759 18.0602C3.8922 18.1442 4.01913 18.1862 4.10374 18.1862C4.18836 18.1862 4.31528 18.1442 4.39989 18.0602L5.58451 16.8842C5.75374 16.7162 5.75374 16.4642 5.58451 16.2962C5.41528 16.1282 5.16143 16.1282 4.9922 16.2962L3.80759 17.4722C3.63836 17.5982 3.63836 17.8922 3.80759 18.0602Z' />
          </svg>
        </div>
      </Slide>
    </ThemeSwitcherWrapper>
  );
};
