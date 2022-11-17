export interface ShieldedAssetsTableContainerProps {}

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
   * The total available balance of all notes
   */
  availableBalance: number;

  /**
   * The total number of notes
   */
  numberOfNotesFound: number;
}

export interface ShieldedAssetsTableContainerProps {
  /**
   * The upload spend note callback
   */
  onUploadSpendNote?: () => void;
}
