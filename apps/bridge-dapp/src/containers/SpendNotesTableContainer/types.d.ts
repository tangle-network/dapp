export interface SpendNotesTableContainerProps {}

export interface SpendNoteDataType {
  /**
   * Asset chain
   */
  chain: string;

  /**
   * The first token symbol for displaying
   */
  token1Symbol: string;

  /**
   * The second token symbol for displaying
   */
  token2Symbol: string;

  /**
   * The external url of assets pair
   */
  assetsUrl: string;

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
  subsequentDeposits: number;

  /**
   * The actual note
   */
  note: string;
}
