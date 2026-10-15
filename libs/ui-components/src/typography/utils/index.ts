import type {
  TypographyAlignValues,
  TypographyFontWeightValues,
  TypographyVariant,
} from '../types';

export const getTextAlignClassName = (align: TypographyAlignValues) =>
  ({
    center: 'text-center',
    justify: 'text-justify',
    left: 'text-left',
    right: 'text-right',
  })[align];

export const getFontWeightClassName = (
  variant: TypographyVariant,
  weight: TypographyFontWeightValues,
) =>
  variant === 'label' || variant === 'utility'
    ? ''
    : {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        black: 'font-black',
      }[weight];

export const getDefaultTextColor = (variant: TypographyVariant) =>
  variant.startsWith('h') || variant.startsWith('mkt-h')
    ? 'text-foreground'
    : 'text-muted-foreground';
