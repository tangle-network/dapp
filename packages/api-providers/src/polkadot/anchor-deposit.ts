// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { LoggerService } from '@webb-tools/app-util';
import { calculateTypedChainId, ChainType, Note, NoteGenInput } from '@webb-tools/sdk-core';

import { u8aToHex } from '@polkadot/util';

import { AnchorDeposit, AnchorSize, DepositPayload as IDepositPayload } from '../abstracts';
import { WebbError, WebbErrorCodes } from '../webb-error';
import { WebbPolkadot } from './webb-provider';

const logger = LoggerService.get('PolkadotBridgeDeposit');

// The Deposit Payload is the note and [treeId, leafHex]
type DepositPayload = IDepositPayload<Note, [number, string]>;
/**
 * Webb Anchor API implementation for Polkadot
 **/
export class PolkadotAnchorDeposit extends AnchorDeposit<WebbPolkadot, DepositPayload> {
  async deposit(depositPayload: DepositPayload): Promise<void> {
    const tx = this.inner.txBuilder.build(
      {
        method: 'deposit',
        section: 'anchorBn254',
      },
      depositPayload.params
    );
    const account = await this.inner.accounts.activeOrDefault;

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    const hash = await tx.call(account.address);

    console.log(hash);
  }

  // anchorId is formatted as 'Bridge=<amount>@<assetName>@<linkableTreeId>.
  async generateBridgeNote(
    anchorId: number | string,
    destination: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    wrappableAssetAddress: string | undefined
  ): Promise<DepositPayload> {
    // Get the currency bridge currency
    const currency = this.bridgeApi.currency;

    // No currency is selected on the API
    if (!currency) {
      logger.error('Not currency/active bridge available');
      throw new Error('api not ready');
    }

    const tokenSymbol = currency.view.symbol;
    const destChainId = destination;
    // TODO: add mappers similar to evm chain id
    // const chainId = this.inner.api.registry.chainSS58!;
    const chainId = await this.inner.api.consts.linkableTreeBn254.chainIdentifier;
    const chainType = await this.inner.api.consts.linkableTreeBn254.chainType;
    const sourceChainId = calculateTypedChainId(Number(chainType.toHex()), Number(chainId));
    console.log('anchorId:', anchorId);
    const anchorPath = String(anchorId).replace('Bridge=', '').split('@');
    const amount = anchorPath[0];
    const anchorTreeId = anchorPath[2];

    // Create the note gen input
    const noteInput: NoteGenInput = {
      amount: amount,
      backend: 'Arkworks',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'anchor',
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: anchorTreeId,
      targetChain: destChainId.toString(),
      targetIdentifyingData: anchorTreeId,
      tokenSymbol: tokenSymbol,
      width: '4',
    };

    logger.log('note input', noteInput);
    const note = await Note.generateNote(noteInput);

    logger.log('Generated note: ', note.note);
    const leaf = note.getLeaf();
    const leafHex = u8aToHex(leaf);

    logger.trace(`treeId ${anchorTreeId}, Leaf ${leafHex}`);

    return {
      note,
      params: [Number(anchorTreeId), leafHex],
    };
  }

  async getSizes(): Promise<AnchorSize[]> {
    const anchors = await this.bridgeApi.getAnchors();
    const currency = this.bridgeApi.currency;
    const substrateChainId = this.inner.api.consts.linkableTreeBn254.chainIdentifier;

    if (currency) {
      return anchors.map((anchor, anchorIndex) => ({
        amount: Number(anchor.amount),
        asset: currency.view.symbol,
        id: `Bridge=${anchor.amount}@${currency.view.name}@${
          anchor.neighbours[calculateTypedChainId(ChainType.Substrate, Number(substrateChainId))]
        }`,
        title: `${anchor.amount} ${currency.view.name}`,
      }));
    }

    return [];
  }
}
