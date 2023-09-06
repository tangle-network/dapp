export type PoolWrappingDataType = {
  /**
   * The token symbol and render on the TokenIcon
   */
  symbol: string;

  /**
   * The percentage of the token in the composition (0 - 100)
   */
  compositionPercentage?: number | undefined;

  /**
   * The aggregate value of all the tokens combine
   */
  aggregate?: number | undefined;

  /**
   * The detailed data of the tokens on each chain
   */
  chainsData: Record<number, number | undefined>;

  /**
   * The list all the tokens and their data
   */
  tokens?: Array<PoolWrappingDataType>;
};

export interface PoolWrappingTableProps {
  /**
   * The list of all available chains
   */
  typedChainIds?: number[];

  /**
   * The data for whole table (list of tokens and subTokens)
   */
  data?: Array<PoolWrappingDataType>;

  /**
   * The prefix unit of all the values on the table
   */
  prefixUnit?: string;
}
