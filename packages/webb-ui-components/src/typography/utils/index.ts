import {
  HeadingVariant,
  MonospaceVariant,
  TypographyAlignValues,
  TypographyFontWeightValues,
  WebbTypographyVariant,
} from '../types';

/**
 * Get the tailwindcss className to style `text-align` attribute base on the typography align values
 * @param textAlign Represent the text align value
 * @returns tailwindcss className to style the `text-align` attribute
 */
export function getTextAlignClassName(textAlign: TypographyAlignValues) {
  switch (textAlign) {
    case 'center': {
      return 'text-center';
    }

    case 'justify': {
      return 'text-justify';
    }

    case 'left': {
      return 'text-left';
    }

    case 'right': {
      return 'text-right';
    }

    default: {
      throw new Error('Unknown text align value');
    }
  }
}

/**
 * Get the tailwindcss className to style `font-weight` attribute base on the typography font weight values
 * @param fontWeight Represent the font weight value
 * @returns tailwindcss className to style the `font-weight` attribute
 */
export function getFontWeightClassName(variant: WebbTypographyVariant, fontWeight: TypographyFontWeightValues) {
  // Monospace variant do not have `semibold` for font weight, so cast it to `bold`
  if (isMonospaceVariant(variant) && fontWeight === 'semibold') {
    return `font-bold`;
  } else if (variant === 'label' || variant === 'utility') {
    return '';
  } else {
    return `font-${fontWeight}` as const;
  }
}

/**
 * Assert the typography variant to heading variant
 * @param variant Represent the value to check if it is the heading variant
 * @returns Whether the typography variant is heading variant
 */
export function isHeadingVariant(variant: WebbTypographyVariant): variant is HeadingVariant {
  const headingKeys = ['h1', 'h2', 'h3', 'h4', 'h5'];
  return headingKeys.indexOf(variant) !== -1;
}

/**
 * Assert the typography variant to monospace variant
 * @param variant Represent the value to check if it is the monospace variant
 * @returns Whether the typography variant is monospace variant
 */
export function isMonospaceVariant(variant: WebbTypographyVariant): variant is MonospaceVariant {
  const monoKeys = ['mono1', 'mono2'];
  return monoKeys.indexOf(variant) !== -1;
}
