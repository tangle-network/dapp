import type { Currency } from '@webb-tools/abstract-api-provider';
import type { Chain } from '@webb-tools/dapp-config';
import type { Note } from '@webb-tools/sdk-core';

import type { NoteAccountTableContainerProps } from '../types';

/**
 * The shielded asset data type for table
 *
 * @param {string} chain - Asset chain
 * @param {string} token1Symbol - The first token symbol for displaying
 * @param {string} token2Symbol - The second token symbol for displaying
 * @param {string} assetsUrl - The external url of assets pair
 * @param {number} availableBalance - The total available balance of all notes
 * @param {number} numberOfNotesFound - The total number of notes
 */
export interface ShieldedAssetDataType {
  /**
   * Asset chain
   */
  chain: string;

  /**
   * The shielded asset symbol (fungible token)
   * @example "ETH"
   */
  fungibleTokenSymbol: string;

  /**
   * The external url of assets pair
   */
  assetsUrl: string;

  /**
   * The wrappable asset symbols for the shielded asset
   */
  composition: string[];

  /**
   * The total available balance of all notes
   */
  availableBalance: number;

  /**
   * The total number of notes
   */
  numberOfNotesFound: number;

  /**
   * The raw destination chain object
   */
  rawChain: Chain;

  /**
   * The raw fungible currency object
   */
  rawFungibleCurrency: Currency | undefined;

  /**
   * The raw notes array
   */
  rawNotes: Note[];
}

export interface ShieldedAssetsTableContainerProps
  extends NoteAccountTableContainerProps {
  /**
   * The shielded assets data
   * @default []
   */
  data?: ShieldedAssetDataType[];
}
