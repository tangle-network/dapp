import { ComponentProps } from 'react';
import { IWebbComponentBase, PropsOf, TokenType } from '../../types';
import { AvatarProps } from '../Avatar';
import { ScrollArea } from '../ScrollArea';

export type ChainType = {
  /**
   * The chain name
   */
  name: string;

  /**
   * The chain tag (use to categorize the chain)
   */
  tag: 'dev' | 'test' | 'live';

  /**
   * The token symbol of the chain
   */
  symbol: string;
};

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

  /**
   * Relayer theme (use for Identicon theme)
   * @default 'polkadot'
   */
  theme?: AvatarProps['theme'];
};

export type AssetType = {
  /**
   * The asset name
   */
  name: string;

  /**
   * The asset symbol (use to display the token logo)
   */
  symbol: string;

  /**
   * The asset balance of user
   */
  balance?: number;

  /**
   * Check if the token is added to metamask
   */
  isTokenAddedToMetamask?: boolean;

  /**
   * The token type
   * @default 'unshielded'
   */
  tokenType?: TokenType;
};

export interface ListCardWrapperProps
  extends IWebbComponentBase,
    PropsOf<'div'> {
  /**
   * The list card title
   */
  title: string;

  /**
   * The callback involke when pressing the close button
   */
  onClose?: () => void;
}

export interface ChainListCardProps extends Omit<PropsOf<'div'>, 'onChange'> {
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

  /**
   * Only enable the chain with specific category,
   * if not provided, all chain will be enabled
   */
  onlyCategory?: 'dev' | 'test' | 'live';

  /**
   * The default category to display
   * @default 'test'
   */
  defaultCategory?: 'dev' | 'test' | 'live';

  /**
   * The override ScrollArea component props
   */
  overrideScrollAreaProps?: ComponentProps<typeof ScrollArea>;

  /**
   * The current active/connected chain
   */
  currentActiveChain?: string;

  /**
   * If `true`, wallet is connecting to chain
   */
  isConnectingToChain?: boolean;
}

export interface RelayerListCardProps extends Omit<PropsOf<'div'>, 'onChange'> {
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

export interface TokenListCardProps
  extends Omit<ListCardWrapperProps, 'onChange'> {
  /**
   * Optional card title to change the title of the card
   */
  title: string;

  /**
   * The popular token list
   */
  popularTokens: AssetType[];

  /**
   * The selected token list
   */
  selectTokens: AssetType[];

  /**
   * The unavailable token list
   */
  unavailableTokens: AssetType[];

  /**
   * The current selected token, use to control the component
   */
  value?: AssetType;

  /**
   * The callback to control the value of the component
   */
  onChange?: (nextToken: AssetType) => void;

  /**
   * The callback when the user hit connect account or wallet
   */
  onConnect?: PropsOf<'button'>['onClick'];

  /**
   * The type of transaction this token list card is used for
   */
  txnType?: 'deposit' | 'transfer' | 'withdraw';
}
