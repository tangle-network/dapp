import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export type ChainType = {
  /**
   * The chain name
   */
  name: string;
  /**
   * The token symbol of the chain
   */
  symbol: string;
};

export interface ListCardWrapperProps extends WebbComponentBase, PropsOf<'div'> {
  /**
   * The list card title
   */
  title: string;
  /**
   * The callback involke when pressing the close button
   */
  onClose?: () => void;
}

export interface ChainListCardProps extends PropsOf<'div'> {
  /**
   * The chain type to display, can be source chain or destination chain
   */
  chainType: 'source' | 'dest';
  /**
   * The callback involke when pressing the close button
   */
  onClose?: () => void;
  /**
   * The chain type to display
   */
  chains: ChainType[];
  /**
   * The current selected chain, use to control the component
   */
  value?: ChainType;
  /**
   * The callback to control the state of the component
   */
  onChange?: (nextChain: ChainType) => void;
}

export type RelayerType = {
  /**
   * The relayer address (also use as id to identify between multiple relayer)
   */
  address: string;

  /**
   * External url
   */
  externalUrl: string;

  /**
   * Relayer fee
   */
  fee?: string | number;

  /**
   * Relayer percentage
   */
  percentage?: number;
};

export interface RelayerListCardProps extends PropsOf<'div'> {
  /**
   * If `true`, the component will display in connected view
   */
  isDisconnected?: boolean;
  /**
   * The callback involke when pressing the close button
   */
  onClose?: () => void;

  /**
   * The relayer list to display
   */
  relayers: RelayerType[];

  /**
   * The current selected relayer, use to control the component
   */
  value?: RelayerType;

  /**
   * The callback to control the state of the component
   */
  onChange?: (nextRelayer: RelayerType) => void;

  /**
   * The event handler when the relayer is disabled and user hit connect wallet button on the card
   */
  onConnectWallet?: PropsOf<'button'>['onClick'];
}
