import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { BridgeTabContainerProps } from '../types';
import { ActiveWebbRelayer, Currency } from '@webb-tools/abstract-api-provider';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Chain } from '@webb-tools/dapp-config';
import { Note } from '@webb-tools/sdk-core';
import { TransactionPayload } from '@webb-tools/webb-ui-components';

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
    PropsOf<'div'> {
  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
}

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
   * The recipient address
   */
  recipient: string;

  /**
   * The change note
   */
  note?: string | null;

  /**
   * The input notes to transfer
   */
  inputNotes: Note[];

  /**
   * Function to update the transaction payload
   */
  setTxPayload: React.Dispatch<
    React.SetStateAction<Partial<TransactionPayload>>
  >;
}
