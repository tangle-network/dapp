import React from 'react';

import { IconByVariant } from './icons';
import { AlertCardWrapper, IconWrapper, TextWrapper } from './styled';
import { AlertVariant } from './types';

export type AlertCardProps = {
  variant?: AlertVariant;
  hasIcon?: boolean;
  text: string;
  style?: React.CSSProperties;
};

export const AlertCard: React.FC<AlertCardProps> = ({ hasIcon, style, text, variant = 'info' }) => {
  return (
    <AlertCardWrapper variant={variant} style={style}>
      {hasIcon && (
        <IconWrapper variant={variant}>
          <IconByVariant variant={variant} />
        </IconWrapper>
      )}
      <TextWrapper>{text}</TextWrapper>
    </AlertCardWrapper>
  );
};
