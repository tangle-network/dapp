import { Currency } from '@webb-tools/abstract-api-provider';
import { Chain } from '@webb-tools/dapp-config';

import { NoteAccountTableContainerProps } from '../types';
import { Note } from '@webb-tools/sdk-core';

export interface SpendNotesTableContainerProps {}

export interface SpendNoteDataType {
  /**
   * Asset chain
   */
  chain: string;

  /**
   * Symbol of the fungible (webb<xxx>) asset
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
   * The note balance
   */
  balance: number;

  /**
   * Created time
   */
  createdTime: Date;

  /**
   * Subsepent deposits
   */
  subsequentDeposits: string;

  /**
   * The actual note
   */
  note: string;

  /**
   * The raw destination chain object
   */
  rawChain: Chain;

  /**
   * The raw note object
   */
  rawNote: Note;

  /**
   * The raw fungible currency object
   */
  rawFungibleCurrency: Currency | undefined;
}

export interface SpendNotesTableContainerProps
  extends NoteAccountTableContainerProps {
  /**
   * The spend notes data
   * @default []
   */
  data?: SpendNoteDataType[];
}
