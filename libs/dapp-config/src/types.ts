// File contains shared types for dapp-config

/**
 * The currency interface for the on-chain currencies
 */
export interface ICurrency {
  decimals: number;
  symbol: string;
  name: string;
  address: string;
}

/**
 * The type of the environment the dapp is running in
 */
export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';

export const isAppEnvironmentType = (env: string): env is AppEnvironment => {
  return (
    env === 'development' ||
    env === 'test' ||
    env === 'staging' ||
    env === 'production'
  );
};

export interface AnchorMetadata {
  /**
   * The address of the anchor
   */
  address: string;

  /**
   * The fungible currency of the anchor
   */
  fungibleCurrency: ICurrency;

  /**
   * The wrappable currencies of the anchor (excluding native currency)
   */
  wrappableCurrencies: ICurrency[];

  /**
   * Boolean indicating whether native currency is allowed
   */
  isNativeAllowed?: boolean;

  /**
   * Record of linkable typed chain -> anchor address
   */
  linkableAnchor: Record<string, string>;

  /**
   * The address of the Signature Bridge to the Anchor
   */
  signatureBridge?: string;

  /**
   * The address of the contract that handles fees for the anchor
   */
  treasuryAddress?: string;

  /**
   * The timestamp when the anchor was created
   */
  creationTimestamp?: number;
}

export type ConfigType = Record<
  number,
  { nativeCurrency: ICurrency; anchorMetadatas: AnchorMetadata[] }
>;
