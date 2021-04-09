import { TypographyProps } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { lightPallet } from '@webb-dapp/ui-components/styling/colors';
import { AppColor } from '@webb-dapp/ui-components/styling/colors/app-colors.type';
import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

const defaultTypographyColor = ['initial', 'inherit', 'secondary', 'textPrimary', 'textSecondary', 'error'];
type DefaultTypographyColor = 'initial' | 'inherit' | 'secondary' | 'textPrimary' | 'textSecondary' | 'error';
export type FontWeight = 'bold' | 'light' | 'bolder' | 'normal' | 'initial';
type PureTextProps = {
  color?: AppColor | DefaultTypographyColor;
  weight?: FontWeight;
};
type RootTextProps = {
  textColor?: AppColor;
  weight: FontWeight;
};

export interface TextProps extends Omit<TypographyProps, keyof PureTextProps>, PureTextProps {}

const TextRoot = styled(({ textColor, ...props }) => <Typography {...props} />)`
  ${({ textColor, weight }: RootTextProps) => {
    const key = textColor ? textColor.toUpperCase() : lightPallet.primaryText;
    //@ts-ignore
    const colorVal = lightPallet[key as keyof lightPallet] as string;
    return css`
      && {
        color: ${colorVal};
        font-weight: ${weight};
      }
    `;
  }};
`;
export const Text: React.FC<TextProps> = ({ color, weight = 'initial', ...props }) => {
  const defaultColor = useMemo(() => {
    if (!color) {
      return undefined;
    }
    if (defaultTypographyColor.includes(color)) {
      return color as DefaultTypographyColor;
    }
    return undefined;
  }, [color]);
  if (defaultColor) {
    return <TextRoot {...props} />;
  }
  return <TextRoot weight={weight} textColor={color} {...props} />;
};
