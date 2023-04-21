import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { BridgeTabContainerProps } from '../types';
import { ActiveWebbRelayer, Currency } from '@webb-tools/abstract-api-provider';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Chain } from '@webb-tools/dapp-config';
import { Note } from '@webb-tools/sdk-core';
import { TransactionPayload } from '@webb-tools/webb-ui-components';
import { BigNumber } from 'ethers';

export type CurrencyRecord = Record<Currency['id'], Currency>;

export type ChainRecord = Record<number, Chain>;

/**
 * The currencies record with key as currency id and value as currency
 * along with destination chains corresponding to the currency
 */
export type CurrencyRecordWithChainsType = Record<
  Currency['id'],
  {
    currency: Currency;
    destChainRecord: ChainRecord;
  }
>;

/**
 * The currency balance on different chains
 */
export type CurrencyBalanceRecordType = Record<
  Currency['id'],
  Record<number, number> // chainId -> balance
>;

export interface TransferContainerProps
  extends BridgeTabContainerProps,
    PropsOf<'div'> {}

export interface TransferConfirmContainerProps
  extends Omit<PropsOf<'div'>, 'onCopy'> {
  /**
   * The transfer bridging asset
   */
  currency: Currency;

  /**
   * The destination chain
   */
  destChain: Chain;

  /**
   * The amount to transfer
   */
  amount: number;

  /**
   * The change amount
   */
  changeAmount: number;

  /**
   * The active relayer
   */
  relayer: ActiveWebbRelayer | null;

  /**
   * The recipient public key
   */
  recipient: string;

  /**
   * The change note
   */
  note?: Note;

  /**
   * The input notes to transfer
   */
  inputNotes: Note[];

  /**
   * The generated change utxo,
   * this will be stored on-chain
   */
  changeUtxo: Utxo;

  /**
   * The generated transfer utxo,
   * this will be stored on-chain
   */
  transferUtxo: Utxo;

  /**
   * The callbacl to reset the parent state
   * @returns void
   */
  onResetState?: () => void;

  /**
   * The fee amount
   */
  feeInWei?: BigNumber | null;

  /**
   * The fee token
   */
  feeToken?: string;
}
