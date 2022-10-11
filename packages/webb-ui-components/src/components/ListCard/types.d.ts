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
   * The selected index of the current selected chain
   */
  value?: ChainType;
  /**
   * The callback to control the state of the component
   */
  onChange?: (nextChain: ChainType) => void;
}
