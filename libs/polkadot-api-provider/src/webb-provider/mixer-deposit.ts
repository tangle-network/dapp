// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/ban-ts-comment */

import '@webb-tools/protocol-substrate-types';

import { Currency, DepositPayload as TDepositPayload, MixerDeposit, MixerSize } from '@nepoche/abstract-api-provider';
import { CurrencyRole, CurrencyType, WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { LoggerService } from '@webb-tools/app-util';
import { Note, NoteGenInput } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import { PalletMixerMixerMetadata } from '@polkadot/types/lookup';
import { u8aToHex } from '@polkadot/util';

import { ORMLCurrency } from '../orml-currency';
import { WebbPolkadot } from '../webb-provider';

// The DepositPayload is the Note and [treeId, leafhex]
type DepositPayload = TDepositPayload<Note, [number, string]>;
const logger = LoggerService.get('tornado-deposit');

export class PolkadotMixerDeposit extends MixerDeposit<WebbPolkadot, DepositPayload> {
  constructor(protected inner: WebbPolkadot) {
    super(inner);
  }

  async getSizes(): Promise<MixerSize[]> {
    const ormlCurrency = new ORMLCurrency(this.inner);
    const ormlAssets = await ormlCurrency.list();
    const data = await this.inner.api.query.mixerBn254.mixers.entries();
    const groupItem = data
      .filter(([_, info]) => !info.isEmpty)
      // storageKey is treeId.  Info is {depositSize, asset}
      .map(([storageKey, info]) => {
        // @ts-ignore
        const mixerInfo: PalletMixerMixerMetadata = info.unwrap();
        const cId = Number(mixerInfo.asset);
        const amount = mixerInfo.depositSize;
        // @ts-ignore
        const treeId = storageKey.toHuman()[0];

        // parse number from amount string
        // TODO: Get and parse native / non-native token denomination
        // TODO replace `replaceAll` or target es2021
        const amountNumber = (Number(amount?.toString().replaceAll(',', '')) * 1.0) / Math.pow(10, 12);

        // const chainId = await this.inner.getProvider().api.consts.linkableTreeBn254.chainIdentifier;
        const asset = ormlAssets.find((asset) => Number(asset.id) === cId)!;
        const currency = new Currency({
          role: CurrencyRole.Wrappable,
          decimals: 18,
          type: CurrencyType.ORML,
          name: asset.name,
          symbol: asset.name.slice(0, 4).toLocaleUpperCase(),
          id: Object.entries(this.inner.state.getCurrencies()).length + 1,
          addresses: new Map(),
        });

        return {
          amount: amountNumber,
          currency: currency,
          id: treeId,
          treeId,
        };
      })
      .map(
        ({ amount, currency, treeId }) =>
          ({
            amount: amount,
            asset: currency.view.symbol,
            id: treeId,
            title: amount + ` ${currency.view.symbol}`,
            treeId,
            value: amount,
          } as MixerSize)
      )
      .sort((a, b) => (a.amount > b.amount ? 1 : a.amount < b.amount ? -1 : 0));

    return groupItem;
  }

  // MixerId is the treeId for deposit, chainIdType is the destination (and source because this is mixer)
  async generateNote(mixerId: number, chainIdType: number): Promise<DepositPayload> {
    logger.info(`Depositing to mixer id ${mixerId}`);
    let sizes: MixerSize[];
    sizes = await this.getSizes();
    const mixer = sizes.find((size) => Number(size.id) === mixerId);
    const properties = await this.inner.api.rpc.system.properties();
    const denomination = properties.tokenDecimals.toHuman() || 12;

    if (!mixer) {
      throw Error('amount not found! for mixer id ' + mixerId);
    }

    const treeId = mixer.id;

    logger.info(`Depositing to tree id ${treeId}`);
    const noteInput: NoteGenInput = {
      amount: ethers.utils.parseUnits(mixer.amount.toString(), Number(denomination)).toString(),
      backend: 'Arkworks',
      curve: 'Bn254',
      denomination: `${denomination}`,
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'mixer',
      sourceChain: chainIdType.toString(),
      sourceIdentifyingData: treeId.toString(),
      targetChain: chainIdType.toString(),
      targetIdentifyingData: treeId.toString(),
      tokenSymbol: mixer.asset,
      version: 'v1',
      width: '3',
    };

    logger.info('noteInput in generateNote: ', noteInput);
    const depositNote = await Note.generateNote(noteInput);

    logger.info('generated Note from input: ', depositNote.note);
    const leaf = depositNote.getLeaf();

    return {
      note: depositNote,
      params: [Number(treeId), u8aToHex(leaf)],
    };
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    // Add the note to the noteManager before transaction is sent.
    // This helps to safeguard the user.
    if (this.inner.noteManager) {
      await this.inner.noteManager.addNote(depositPayload.note);
    }

    const tx = this.inner.txBuilder.build(
      {
        method: 'deposit',
        section: 'mixerBn254',
      },
      depositPayload.params
    );

    const account = await this.inner.accounts.activeOrDefault;

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    tx.on('finalize', () => {
      console.log('deposit done');
    });
    tx.on('failed', (e: any) => {
      console.log('deposit failed', e);
      if (this.inner.noteManager) {
        this.inner.noteManager.removeNote(depositPayload.note);
      }
    });
    tx.on('extrinsicSuccess', () => {
      console.log('deposit done');
    });
    await tx.call(account.address);
  }
}
