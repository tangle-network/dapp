import type { RankingInfo } from '@tanstack/match-sorter-utils';
import type { IconBase } from '@webb-tools/icons/types';
import type { FilterFn } from '@tanstack/react-table';
import type { Nullable, Maybe } from '@webb-tools/dapp-types/utils/types';
import type React from 'react';
import { WEBB_AVAILABLE_SOCIALS } from '../constants';

/******************
 * DECLARE GLOBAL *
 ******************/
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

/****************
 * SYSTEM TYPES *
 ****************/

export interface IWebbComponentBase {
  /**
   * The tailwindcss className to override the style
   */
  className?: string;
  /**
   * Control dark mode using `js`, if it's empty, the component will control dark mode in `css`
   */
  darkMode?: boolean;

  children?: React.ReactNode | string;
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

export type ISubQlTime = {
  current: Date;
};

/**
 * The base interface required all component to extends in their props
 */

export interface WebbComponentBase
  extends React.HTMLAttributes<HTMLElement>,
    IWebbComponentBase {}

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
export interface ExternalLink {
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

export interface FooterNavsType
  extends Record<string, Array<Link | ExternalLink>> {}

/**
 * The bottom social platforms config type
 */
export interface SocialConfigsType extends Omit<ExternalLink, 'name'> {
  /**
   * Platform name
   */
  name: (typeof WEBB_AVAILABLE_SOCIALS)[number];
  /**
   * Platform icon
   */
  Icon: (props: IconBase) => JSX.Element;
}

/**
 * The `Keygen` type
 */
export interface KeygenType {
  /**
   * Block height
   */
  height: number;
  /**
   * The session number
   */
  session: number;
  /**
   * The actual key, a hex string
   */
  key: string;
  /**
   * The keygen threshold
   */
  keygenThreshold: number | null;
  /**
   * The signatures threshold
   */
  signatureThreshold: number | null;
  /**
   * The authorities attend to the process
   */
  authorities: Set<string>;
  /**
   * Size of the authorities set
   */
  totalAuthorities: number;
  /**
   * The key id (uncompressed key) to get detail info
   */
  keyId: string;
  /**
   * The previous key id for nagivation
   */
  previousKeyId?: string;
  /**
   * The next key id for navigation
   */
  nextKeyId?: string;
}

/**
 * The supported token type
 */
export type TokenType = 'shielded' | 'unshielded';

/*****************
 * UTILITY TYPES *
 *****************/

/**
 * Extract the props of a React element or component
 */
export type PropsOf<T extends React.ElementType<any>> =
  React.ComponentPropsWithoutRef<T>;

export type NullableUnknownType = Nullable<Maybe<unknown>>;

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type NonNullableArrayItem<T extends Array<NullableUnknownType>> =
  NonNullable<ArrayElement<T>>;

type GetEventHandlers<T extends keyof JSX.IntrinsicElements> = Extract<
  keyof JSX.IntrinsicElements[T],
  `on${string}`
>;

/**
 * Provides the event type for a given element and handler.
 *
 * @example
 *
 * type MyEvent = EventFor<"input", "onChange">;
 */
export type EventFor<
  TElement extends keyof JSX.IntrinsicElements,
  THandler extends GetEventHandlers<TElement>,
> = JSX.IntrinsicElements[TElement][THandler] extends
  | ((e: infer TEvent) => any)
  | undefined
  ? TEvent
  : never;
