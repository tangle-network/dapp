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
}

export interface SpendNotesTableContainerProps {
  /**
   * The upload spend note callback
   */
  onUploadSpendNote?: () => void;

  /**
   * The spend notes data
   * @default []
   */
  data?: SpendNoteDataType[];
}
