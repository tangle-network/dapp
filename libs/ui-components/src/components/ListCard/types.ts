import type { ComponentProps } from 'react';
import type { IComponentBase, PropsOf, TokenType } from '../../types';
import type { AvatarProps } from '../Avatar';
import type { ScrollArea } from '../ScrollArea';
import type { InputProps } from '../Input';
import type { Typography } from '../../typography/Typography';

export type ChainType = {
  typedChainId: number;
  name: string;
  isDisabled?: boolean;

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
   * Name of the relayer, if not provided
   * the relayer address will be used to display
   */
  name?: string;

  /**
   * Relayer theme (use for Identicon theme)
   * @default 'polkadot'
   */
  theme?: AvatarProps['theme'];

  percentage?: number;
  isDisabled?: boolean;
  externalUrl: string;
};

export type AssetBalanceType = {
  /**
   * The asset balance of user
   */
  balance: number;

  /**
   * The asset balance in USD
   */
  balanceInUsd?: number;
} & {
  /**
   * The asset balance of user
   */
  balance: number;

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
   * The asset id
   */
  id: string;

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
   * Boolean to indicate if the token metadata (balance, price) is loading
   */
  isLoadingMetadata?: boolean;

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

export type ContractType = {
  /**
   * The contract name
   */
  name: string;
  /**
   * The contract address
   */
  address: string;
  /**
   * The contract block explorer url (optional)
   */
  blockExplorerUrl?: string;

  /**
   * Callback when user hit a contract item
   */
  onSelectContract?: () => void;
};

export interface ListCardWrapperProps extends IComponentBase, PropsOf<'div'> {
  /**
   * The list card title
   */
  title: string;

  /**
   * Override the title props
   */
  overrideTitleProps?: ComponentProps<typeof Typography>;

  onClose?: () => void;
  hideCloseButton?: boolean;
}

export interface ChainListCardProps extends Omit<PropsOf<'div'>, 'onChange'> {
  /**
   * The chain type to display, can be source chain or destination chain
   */
  chainType: 'source' | 'dest';

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
   * Override the title props
   */
  overrideTitleProps?: ComponentProps<typeof Typography>;

  /**
   * The current active/connected chain
   */
  activeTypedChainId?: number;

  /**
   * If `true`, wallet is connecting to chain
   */
  isConnectingToChain?: boolean;

  disclaimer?: string;
}

export interface ContractListCardProps
  extends Omit<PropsOf<'div'>, 'onChange'> {
  selectContractItems: ContractType[];
  isLoading?: boolean;
}

export interface RelayerListCardProps
  extends Partial<Omit<ListCardWrapperProps, 'onChange'>> {
  /**
   * If `true`, the component will display in connected view
   */
  isDisconnected?: boolean;

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

  /**
   * The Footer of the relayer list card
   * will be displayed at the bottom of the card
   */
  Footer?: React.ReactNode;

  overrideInputProps?: Partial<InputProps>;
}

export interface TokenListCardProps
  extends Omit<ListCardWrapperProps, 'onChange'> {
  /**
   * Optional card title to change the title of the card
   */
  title: string;

  /**
   * The type of token list card
   * @default "token"
   */
  type?: 'token' | 'pool' | 'asset';

  /**
   * The current selected token, use to control the component
   */
  value?: AssetType;

  /**
   * The callback to control the value of the component
   */
  onChange?: (nextToken: AssetType) => void;

  /**
   * The text for the alert component at the bottom
   */
  alertTitle?: string;

  /**
   * Function to render body when the list is empty
   */
  renderEmpty?: () => React.ReactNode;

  /**
   * The description to show when the list is empty.
   */
  descriptionWhenEmpty?: string;

  selectTokens: AssetType[];
  overrideInputProps?: Partial<InputProps>;
}
