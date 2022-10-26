import { useColorPallet } from '@nepoche/styled-components-theme';
import React from 'react';

export const RightArrowIcon: React.FC = () => {
  const palette = useColorPallet();

  return (
    <svg width='34' height='34' viewBox='0 0 34 34' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M7.08337 17H26.9167'
        stroke={palette.type === 'dark' ? palette.iconColor : '#000000'}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M17 7.08334L26.9167 17L17 26.9167'
        stroke={palette.type === 'dark' ? palette.iconColor : '#000000'}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
