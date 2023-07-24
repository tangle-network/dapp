export type NetworkTokenType = {
  /**
   * The token symbol and render on the TokenIcon
   */
  symbol: string;

  /**
   * The percentage of the token in the composition (0 - 100)
   */
  compositionPercentage?: number;

  /**
   * The aggregate value of all the tokens combine
   */
  aggregate: number;

  /**
   * The detailed data of the tokens on each chain
   */
  chainsData: Record<number, number | undefined>;

  /**
   * The list all the tokens and their data
   */
  tokens?: Array<NetworkTokenType>;
};

export interface NetworkTokenTableProps {
  /**
   * The list of all available chains
   */
  chains: number[];

  /**
   * The data for whole table (list of tokens and subTokens)
   */
  data: Array<NetworkTokenType>;

  /**
   * The prefix unit of all the values on the table
   */
  prefixUnit?: string;
}
