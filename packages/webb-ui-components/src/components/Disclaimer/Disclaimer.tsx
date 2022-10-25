import { IconByVariant } from '@webb-dapp/ui-components/AlertCard/icons';
import { AlertVariant } from '@webb-dapp/ui-components/AlertCard/types';
import { useThemeColorsConfig } from '@webb-dapp/webb-ui-components/hooks/useThemeColorsConfig';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import Color from 'tinycolor2';

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
      bgColor: new Color(theme.blue['10']).setAlpha(0.5).toRgbString(),
      textColor: theme.blue['70'],
      borderColor: theme.blue['20'],
    };
  }, [theme, variant]);
  return (
    <DisclaimerWrapper {...colors} className={'rounded-xl px-3 py-2  flex items-stretch'}>
      <div>
        <IconByVariant variant={variant} />
      </div>
      <div className={'px-2'}>
        <Typography variant={'body4'} fw={'semibold'} className='disclaimer-text'>
          {message}
        </Typography>
      </div>
    </DisclaimerWrapper>
  );
};

const DisclaimerWrapper = styled.div<DisclaimerWrapperProps>`
  ${({ bgColor, borderColor, textColor }) => css`
    border: 1px solid ${borderColor};
    background: ${bgColor};
    .disclaimer-text {
      color: ${textColor};
      line-height: 15px;
      vertical-align: top;
      letter-spacing: 4%;
    }
    svg {
      width: 13.33px;
      height: 13.33px;
      fill: ${textColor};
    }
  `}
`;
