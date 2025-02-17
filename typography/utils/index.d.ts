import { HeadingVariant, MonospaceVariant, TypographyAlignValues, TypographyFontWeightValues, TypographyVariant } from '../types';
/**
 * Get the tailwindcss className to style `text-align` attribute base on the typography align values
 * @param textAlign Represent the text align value
 * @returns tailwindcss className to style the `text-align` attribute
 */
export declare function getTextAlignClassName(textAlign: TypographyAlignValues): "text-center" | "text-justify" | "text-left" | "text-right";
/**
 * Get the tailwindcss className to style `font-weight` attribute base on the typography font weight values
 * @param fontWeight Represent the font weight value
 * @returns tailwindcss className to style the `font-weight` attribute
 */
export declare function getFontWeightClassName(variant: TypographyVariant, fontWeight: TypographyFontWeightValues): "" | "font-bold" | "font-normal" | "font-medium" | "font-semibold" | "font-black";
/**
 * Assert the typography variant to heading variant
 * @param variant Represent the value to check if it is the heading variant
 * @returns Whether the typography variant is heading variant
 */
export declare function isHeadingVariant(variant: TypographyVariant): variant is HeadingVariant;
/**
 * Assert the typography variant to monospace variant
 * @param variant Represent the value to check if it is the monospace variant
 * @returns Whether the typography variant is monospace variant
 */
export declare function isMonospaceVariant(variant: TypographyVariant): variant is MonospaceVariant;
export declare function getDefaultTextColor(variant: TypographyVariant): "text-mono-200 dark:text-mono-00" | "text-mono-160 dark:text-mono-80";
