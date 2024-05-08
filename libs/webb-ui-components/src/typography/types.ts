import { ReactHTML } from 'react';

import type { WebbComponentBase } from '../types';

export type TypographyBaseProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

export type TypographyAlignValues = 'center' | 'justify' | 'right' | 'left';

export type TypographyFontWeightValues =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'black';

export type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export type BodyVariant = 'body1' | 'body2' | 'body3' | 'body4';

export type ParagraphVariant = 'para1' | 'para2';

export type LabelVariant = 'label' | 'utility';

export type MonospaceVariant = 'mono1' | 'mono2' | 'mkt-monospace';

export type MarketingVariant =
  | 'mkt-h1'
  | 'mkt-h2'
  | 'mkt-h3'
  | 'mkt-h4'
  | 'mkt-subheading'
  | 'mkt-body1'
  | 'mkt-body2'
  | 'mkt-small-caps'
  | 'mkt-caption'
  | 'mkt-monospace';

export type WebbTypographyVariant =
  | HeadingVariant
  | BodyVariant
  | MonospaceVariant
  | ParagraphVariant
  | LabelVariant
  | MarketingVariant;

/**
 * Properties of typography component
 * - `variant`: Represent different variants of the component
 * - `component`: The html tag (default: same as `variant` prop)
 * - `fw`: Represent the **font weight** of the component (default: `normal`)
 * - `ta`: Text align (default: `inherit`)
 * - `darkMode`: Control component dark mode display in `js`, leave it's empty if you want to control dark mode in `css`
 */
export interface WebbTypographyProps<TypoVariant = WebbTypographyVariant>
  extends TypographyBaseProps,
    WebbComponentBase {
  /**
   * Represent different variants of the component
   */
  variant: TypoVariant;
  /**
   * The html tag
   */
  component?: keyof ReactHTML;
  /**
   * Font weight
   */
  fw?: TypographyFontWeightValues;
  /**
   * Text align
   */
  ta?: TypographyAlignValues;
}
