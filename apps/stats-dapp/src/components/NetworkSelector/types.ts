export type NetworkType = {
  /**
   * The network name
   */
  name: string;

  /**
   * The network type (use to categorize the network)
   */
  type: 'live' | 'testnet' | 'dev';

  /**
   * The avatar of the network
   */
  symbol: string;
};
