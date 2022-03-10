import { useColorPallet } from '@webb-dapp/react-hooks/useColorPallet';
import React from 'react';

export const RightArrowIcon: React.FC = () => {
  const palette = useColorPallet();

  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M7.08337 17H26.9167'
        stroke={palette.type === 'dark' ? palette.iconColor : '#000000'}
        stroke-width='2'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
      <path
        d='M17 7.08334L26.9167 17L17 26.9167'
        stroke={palette.type === 'dark' ? palette.iconColor : '#000000'}
        stroke-width='2'
        stroke-linecap='round'
        stroke-linejoin='round'
      />
    </svg>
  );
};
