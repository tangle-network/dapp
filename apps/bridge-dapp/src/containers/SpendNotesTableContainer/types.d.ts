import { Currency } from '@webb-tools/abstract-api-provider';
import { Chain } from '@webb-tools/dapp-config';
import { NoteAccountTableContainerProps } from '../types';

export interface SpendNotesTableContainerProps {}

export interface SpendNoteDataType {
  /**
   * Asset chain
   */
  chain: string;

  /**
   * Symbol of the governed (webb<xxx>) asset
   */
  governedTokenSymbol: string;

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
   * The raw governed currency object
   */
  rawGovernedCurrency: Currency | undefined;
}

export interface SpendNotesTableContainerProps
  extends NoteAccountTableContainerProps {
  /**
   * The spend notes data
   * @default []
   */
  data?: SpendNoteDataType[];
}
