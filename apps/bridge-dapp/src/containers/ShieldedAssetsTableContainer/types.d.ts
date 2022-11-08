export interface ShieldedAssetsTableContainerProps {}

/**
 * The table shielded asset
 *
 * @param {string} symbol - Token symbol to display
 * @param {string} name - Optional token name for displaying. If not provided, component will use the symbol to display
 */
export type ShieldAssetType = {
  /**
   * Token symbol to display
   */
  symbol: string;

  /**
   * Optional token name for displaying.
   * If not provided, component will use the symbol to display
   */
  name?: string;
};

/**
 * The shielded asset data type for table
 *
 * @param {string} chain - Asset chain
 * @param {[ShieldAssetType, ShieldAssetType]} assets - The assets in the table
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
   * The assets pair in the table
   */
  assets: [ShieldAssetType, ShieldAssetType];

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
