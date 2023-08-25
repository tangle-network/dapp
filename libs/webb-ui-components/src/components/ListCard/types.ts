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
   * Whether the current chain needs to switch wallet
   */
  needSwitchWallet?: boolean;
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
   * Relayer percentage
   */
  percentage?: number;

  /**
   * Relayer theme (use for Identicon theme)
   * @default 'polkadot'
   */
  theme?: AvatarProps['theme'];

  /**
   * Whether the relayer is disabled
   */
  isDisabled?: boolean;
};

export type AssetBalanceType = {
  /**
   * The asset balance of user
   */
  balance?: number;

  /**
   * The asset balance in USD
   */
  balanceInUsd?: number;

  /**
   * The sub content below the balance
   */
  subContent?: string;
};

export type AssetBadgeInfoType = {
  /**
   * The badge variant
   */
  variant: 'info' | 'warning';

  /**
   * The badge content
   */
  children: React.ReactNode;
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
   * Callback when user hit the add token button
   */
  onAddToken?: PropsOf<'button'>['onClick'];

  /**
   * The token type
   * @default 'unshielded'
   */
  tokenType?: TokenType;

  /**
   * The asset balance props
   * @type {AssetBalanceType}
   */
  assetBalanceProps?: AssetBalanceType;

  /**
   * The asset badge props
   * @type {AssetBadgeInfoType}
   */
  assetBadgeProps?: AssetBadgeInfoType;

  /**
   * The chain name of the asset (use to display the chain logo)
   */
  chainName?: string;

  /**
   * The asset explorer url
   */
  explorerUrl?: string;
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
   * The type of transaction this token list card is used for
   */
  txnType?: 'deposit' | 'transfer' | 'withdraw';
}
