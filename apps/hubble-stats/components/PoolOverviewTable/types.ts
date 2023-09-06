export type PoolOverviewDataType = {
  /**
   * The pool symbol
   */
  symbol: string;

  /**
   * The aggregate of all the values from different chains
   */
  aggregate?: number;

  /**
   * The value on each chain indexed by typedChainId
   */
  chainsData: Record<number, number | undefined>;
};

export interface PoolOverviewTableProps {
  /**
   * The list of all available chains
   */
  typedChainIds?: number[];

  /**
   * The data for whole table
   */
  data?: Array<PoolOverviewDataType>;

  /**
   * The prefix unit of all the values on the table
   */
  prefixUnit?: string;
}
