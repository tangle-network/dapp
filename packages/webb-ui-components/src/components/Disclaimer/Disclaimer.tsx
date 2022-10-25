import { IconByVariant } from '@webb-dapp/ui-components/AlertCard/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import React, { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { AlertVariant } from '@webb-dapp/ui-components/AlertCard/types';
import { IconWrapper } from '@webb-dapp/ui-components/AlertCard/styled';
import Color from 'tinycolor2';
import { Pallet } from '@webb-dapp/ui-components/styling/colors';

type DisclaimerVariant = AlertVariant;

function getColors(theme: Pallet, variant: DisclaimerVariant): { color: string; backgroundColor: string } {
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
    color: infoColor,
    backgroundColor: infoBgColor,
  };
}

export const Disclaimer: FC<{
  message: string;
  variant: DisclaimerVariant;
}> = ({ variant, message }) => {
  const typographyClasses = useMemo(() => {
    switch (variant) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-sky-500';
      case 'success':
        return 'text-green-500';
    }
  }, [variant]);
  return (
    <DisclaimerWrapper variant={variant} className={'rounded-xl p-3 flex items-stretch'}>
      <div className={'w-12 h-12  '}>
        <IconWrapper variant={variant}>
          <IconByVariant variant={variant} />
        </IconWrapper>
      </div>
      <div className={'px-2'}>
        <Typography variant={'body3'} fw={'bold'} className='disclaimer-text'>
          {message}
        </Typography>
      </div>
    </DisclaimerWrapper>
  );
};

const DisclaimerWrapper = styled.div<{
  variant: DisclaimerVariant;
}>`
  ${({ theme, variant }) => {
    console.log({ theme });
    const { backgroundColor, color } = getColors(theme, variant);
    return css`
      border: 1px solid ${color};
      background: ${backgroundColor};
      .disclaimer-text {
        color: ${color};
      }
    `;
  }}
`;
