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
  return `text-${textAlign}` as const;
}

/**
 * Get the tailwindcss className to style `font-weight` attribute base on the typography font weight values
 * @param fontWeight Represent the font weight value
 * @returns tailwindcss className to style the `font-weight` attribute
 */
export function getFontWeightClassName(variant: WebbTypographyVariant, fontWeight: TypographyFontWeightValues) {
  // Monospace varirant do not have `semibold` for font weight, so cast it to `bold`
  if (isMonospaceVariant(variant) && fontWeight === 'semibold') {
    return `text-bold`;
  } else {
    return `text-${fontWeight}` as const;
  }
}

/**
 * Assert the typography variant to heading variant
 * @param variant Represent the value to check if it is the heading varirant
 * @returns Whether the typography variant is heading variant
 */
export function isHeadingVariant(variant: WebbTypographyVariant): variant is HeadingVariant {
  const headingKeys = ['h1', 'h2', 'h3', 'h4', 'h5'];
  return headingKeys.indexOf(variant) !== -1;
}

/**
 * Assert the typography variant to monospace variant
 * @param variant Represent the value to check if it is the monospace varirant
 * @returns Whether the typography variant is monospace variant
 */
export function isMonospaceVariant(variant: WebbTypographyVariant): variant is MonospaceVariant {
  const monoKeys = ['mono1', 'mono2'];
  return monoKeys.indexOf(variant) !== -1;
}

/**
 * Get the tailwind className for text color based on `variant` and `darkMode` props
 * @param variant Represent the typography variant to get a tailwind className
 * @param darkMode Value to control dark mode, leave it's empty to control dark mode in `css`
 * @returns tailwind className for text color
 */
export function getTextColorClassName(variant: WebbTypographyVariant, darkMode?: boolean) {
  if (isHeadingVariant(variant)) {
    return typeof darkMode === 'boolean'
      ? darkMode
        ? ('text-mono-40' as const)
        : ('text-mono-200' as const)
      : 'text-mono-200 dark:text-mono-40';
  } else {
    return typeof darkMode === 'boolean'
      ? darkMode
        ? ('text-mono-100' as const)
        : ('text-mono-120' as const)
      : 'text-mono-120 dark:text-mono-100';
  }
}
