import { RankingInfo } from '@tanstack/match-sorter-utils';
import { FilterFn } from '@tanstack/react-table';

import { AuthoritiesType } from '../components/KeyStatusCard/types';

/******************
 * DECLARE GLOBAL *
 ******************/

declare module '*.svg' {
  const content: any;
  export default content;
}

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

/**
 * The base interface required all component to extends in their props
 */

export interface WebbComponentBase extends React.HTMLAttributes<HTMLElement> {
  /**
   * The tailwindcss className to override the style
   */
  className?: string;
  /**
   * Control dark mode using `js`, if it's empty, the component will control dark mode in `css`
   */
  darkMode?: boolean;
  /**
   * Children node
   */
  children?: React.ReactNode;
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
  keygenThreshold: number;
  /**
   * The signatures threshold
   */
  signatureThreshold: number;
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

/*****************
 * UTILITY TYPES *
 *****************/

/**
 * Extract the props of a React element or component
 */
export type PropsOf<T extends React.ElementType<any>> = React.ComponentPropsWithoutRef<T>;
