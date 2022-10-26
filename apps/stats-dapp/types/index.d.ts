import { IconBase } from '@nepoche/webb-ui-components/icons/types';

/**
 * The internal link type
 */
export interface Link {
  /**
   * The name of the link
   */
  name: string;
  /**
   * Represents the react router path for internal path
   */
  path: string;
}

/**
 * The external link type
 */
export interface ExternalLink extends ExternalType {
  /**
   * The name of the link
   */
  name: string;
  /**
   * Represents the external url.
   */
  href: string;
  /**
   * The target attribute specifies where to open the linked document.
   * @default "_blank"
   */
  target: '_blank' | '_self';
  /**
   * The rel attribute specifies the relationship between the current document and the linked document.
   */
  rel?: string;
}

export interface FooterNavsType extends Record<string, Array<Link | ExternalLink>> {}

/**
 * The bottom social platforms config type
 */
export interface SocialConfigsType extends Omit<ExternalLink, 'name'> {
  /**
   * Platform name
   */
  name: string;
  /**
   * Platform icon
   */
  Icon: (props: IconBase) => JSX.Element;
}

/**
 * The Webb color type
 */
export interface WebbColorsType {
  mono: Record<string | number, string>;
  purple: Record<string | number, string>;
  blue: Record<string | number, string>;
  green: Record<string | number, string>;
  yellow: Record<string | number, string>;
  red: Record<string | number, string>;
}
