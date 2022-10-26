import { Pallet } from '@nepoche/styled-components-theme';
import styled, { css } from 'styled-components';

import { AlertVariant } from '../types';

const getColorsByVariant = (
  theme: Pallet,
  variant: AlertVariant = 'info'
): { color: string; backgroundColor: string } => {
  const infoColor = 'rgb(13, 31, 38)';
  const infoBgColor = 'rgb(184, 231, 251)';

  const errorColor = 'rgb(34, 17, 17)';
  const errorBgColor = 'rgb(244, 199, 199)';

  const warningColor = 'rgb(40, 29, 11)';
  const warningBgColor = 'rgb(255, 226, 183)';

  const successColor = 'rgb(20, 31, 21)';
  const successBgColor = 'rgb(204, 232, 205)';

  switch (variant) {
    case 'error': {
      return theme.type === 'light'
        ? {
            color: errorColor,
            backgroundColor: errorBgColor,
          }
        : {
            color: errorBgColor,
            backgroundColor: errorColor,
          };
    }

    case 'success': {
      return theme.type === 'light'
        ? {
            color: successColor,
            backgroundColor: successBgColor,
          }
        : {
            color: successBgColor,
            backgroundColor: successColor,
          };
    }

    case 'warning': {
      return theme.type === 'light'
        ? {
            color: warningColor,
            backgroundColor: warningBgColor,
          }
        : {
            color: warningBgColor,
            backgroundColor: warningColor,
          };
    }

    case 'info':
    default: {
      return theme.type === 'light'
        ? {
            color: infoColor,
            backgroundColor: infoBgColor,
          }
        : {
            color: infoBgColor,
            backgroundColor: infoColor,
          };
    }
  }
};

export const AlertCardWrapper = styled.div<{ variant?: AlertVariant }>`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 6px 16px;
  border-radius: 4px;

  ${({ theme, variant }) => {
    const { backgroundColor, color } = getColorsByVariant(theme, variant);

    return css`
      background-color: ${backgroundColor};
      color: ${color};
    `;
  }}
`;
