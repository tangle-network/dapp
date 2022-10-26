import styled from 'styled-components';

import { AlertVariant } from '../types';

const getColorByVariant = (theme: 'dark' | 'light', variant: AlertVariant = 'info'): string => {
  switch (variant) {
    case 'error': {
      return theme === 'light' ? 'rgb(239, 83, 80)' : 'rgb(244, 67, 54)';
    }
    case 'success': {
      return theme === 'light' ? 'rgb(76, 175, 80)' : 'rgb(102, 187, 106)';
    }
    case 'warning': {
      return theme === 'light' ? 'rgb(255, 152, 0)' : 'rgb(255, 167, 38)';
    }
    case 'info':
    default: {
      return theme === 'light' ? 'rgb(3, 169, 244)' : 'rgb(41, 182, 246)';
    }
  }
};

export const IconWrapper = styled.div<{ variant?: AlertVariant }>`
  margin-right: 16px;

  svg {
    width: 22px;
    height: 22px;
    fill: ${({ theme, variant }) => getColorByVariant(theme, variant)};
  }
`;
