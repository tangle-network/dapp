import { WebbColorsType } from '@webb-dapp/page-statistics/types';
import { IconByVariant } from '@webb-dapp/ui-components/AlertCard/icons';
import { AlertVariant } from '@webb-dapp/ui-components/AlertCard/types';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';
import { useThemeColorsConfig } from '@webb-dapp/webb-ui-components/hooks/useThemeColorsConfig';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';

type DisclaimerVariant = AlertVariant;
type DisclaimerWrapperProps = {
  bgColor: string;
  textColor: string;
  borderColor: string;
};

export const Disclaimer: FC<{
  message: string;
  variant: DisclaimerVariant;
}> = ({ message, variant }) => {
  const theme = useThemeColorsConfig();
  const colors = useMemo((): DisclaimerWrapperProps => {
    const infoColor = `#3D7BCE`;
    const infoBgColor = `rgba(236, 244, 255, 0.5);`;
    switch (variant) {
      case 'info':
        break;
      case 'error':
        break;
      case 'warning':
        break;
      case 'success':
        break;
      default:
    }
    return {
      bgColor: theme.blue['10'],
      textColor: theme.blue['70'],
      borderColor: theme.blue['20'],
    };
  }, [theme, variant]);
  return (
    <DisclaimerWrapper {...colors} className={'rounded-xl p-3 flex items-stretch'}>
      <div className={'w-12 h-12  '}>
        <IconWrapper variant={variant}>
          <IconByVariant variant={variant} />
        </IconWrapper>
      </div>
      <div className={'px-2'}>
        <Typography variant={'body3'} className='disclaimer-text'>
          {message}
        </Typography>
      </div>
    </DisclaimerWrapper>
  );
};
const getColorByVariant = (theme: 'dark' | 'light', variant: DisclaimerVariant = 'info'): string => {
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

export const IconWrapper = styled.div<{ variant?: DisclaimerVariant }>`
  svg {
    width: 22px;
    height: 22px;
    fill: ${({ theme, variant }) => getColorByVariant(theme, variant)};
  }
`;

const DisclaimerWrapper = styled.div<DisclaimerWrapperProps>`
  ${({ bgColor, borderColor, textColor }) => css`
    border: 1px solid ${borderColor};
    background: ${bgColor};
    .disclaimer-text {
      color: ${textColor};
    }
    svg {
      width: 22px;
      height: 22px;
      fill: ${textColor};
    }
  `}
`;
