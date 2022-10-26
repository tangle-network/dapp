// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import '@webb-tools/protocol-substrate-types';

import {
  MixerWithdraw,
  RelayedChainInput,
  RelayedWithdrawResult,
  TransactionState,
} from '@nepoche/abstract-api-provider';
import { typedChainIdToSubstrateRelayerName } from '@nepoche/dapp-config/relayer-config';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { fetchSubstrateMixerProvingKey } from '@nepoche/fixtures-deployments';
import { LoggerService } from '@webb-tools/app-util';
import { ArkworksProvingManager, Note, ProvingManagerSetupInput } from '@webb-tools/sdk-core';
import { ethers } from 'ethers';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';

import { getLeafCount, getLeaves } from '../mt-utils';
import { WebbPolkadot } from '../webb-provider';

const logger = LoggerService.get('PolkadotMixerWithdraw');

const transactionString = (hexString: string) => {
  return `${hexString.slice(0, 6)}...${hexString.slice(hexString.length - 4, hexString.length)}`;
};

type WithdrawProof = {
  id: string;
  proofBytes: string;
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: number;
  refund: number;
};

export class PolkadotMixerWithdraw extends MixerWithdraw<WebbPolkadot> {
  readonly loading = false;
  readonly initialised = true;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async fetchTreeLeaves(treeId: string | number): Promise<Uint8Array[]> {
    // Get all the tree leaves from chain
    const treeLeafCount = await getLeafCount(this.inner.api, Number(treeId));
    const treeLeaves: Uint8Array[] = await getLeaves(this.inner.api, Number(treeId), 0, treeLeafCount - 1);
    return treeLeaves;
  }

  async withdraw(note: string, recipient: string): Promise<string> {
    try {
      // Get the sender account
      const account = await this.inner.accounts.activeOrDefault;

      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }

      this.emit('stateChange', TransactionState.GeneratingZk);

      // parse the note
      const noteParsed = await Note.deserialize(note);
      const bnAmount = noteParsed.note.amount;
      const amount = ethers.utils.formatUnits(bnAmount, noteParsed.note.denomination);
      const sizes = await this.inner.methods.mixer.deposit.inner.getSizes();
      const treeId = sizes.find((s) => s.amount === Number(amount))?.treeId!;

      const leaves = await this.fetchTreeLeaves(treeId);
      const leaf = u8aToHex(noteParsed.getLeaf());
      const leafIndex = leaves.findIndex((l) => u8aToHex(l) === leaf);

      const activeRelayer = this.inner.relayerManager.activeRelayer;
      const worker = this.inner.wasmFactory('wasm-utils');
      const pm = new ArkworksProvingManager(worker);

      const recipientAccountHex = u8aToHex(decodeAddress(recipient));
      // ss58 format
      const relayerAccountId = activeRelayer ? activeRelayer.beneficiary! : recipient;
      const relayerAccountHex = u8aToHex(decodeAddress(relayerAccountId));
      // fetching the proving key
      const provingKey = await fetchSubstrateMixerProvingKey();
      const isValidRelayer = Boolean(activeRelayer && activeRelayer.beneficiary);
      const proofInput: ProvingManagerSetupInput<'mixer'> = {
        fee: 0,
        leafIndex,
        leaves,
        note,
        provingKey,
        recipient: recipientAccountHex.replace('0x', ''),
        refund: 0,
        relayer: relayerAccountHex.replace('0x', ''),
      };

      if (isValidRelayer) {
        this.inner.notificationHandler({
          description: `Withdraw through ${activeRelayer!.endpoint} in progress`,
          key: 'mixer-withdraw-sub',
          level: 'loading',
          message: 'mixerBn254:withdraw',
          name: 'Transaction',
        });
      }

      const zkProofMetadata = await pm.prove('mixer', proofInput);

      const withdrawProof: WithdrawProof = {
        fee: 0,
        id: String(treeId),
        nullifierHash: `0x${zkProofMetadata.nullifierHash}`,
        proofBytes: `0x${zkProofMetadata.proof}` as any,
        recipient: recipient,
        refund: 0,
        relayer: relayerAccountId,
        root: `0x${zkProofMetadata.root}`,
      };

      // withdraw through relayer
      if (isValidRelayer) {
        logger.info('withdrawing through relayer', activeRelayer);
        this.emit('stateChange', TransactionState.SendingTransaction);
        const relayerMixerTx = await activeRelayer!.initWithdraw('mixer');
        const chainName = typedChainIdToSubstrateRelayerName(Number(noteParsed.note.targetChainId));

        const chainInput: RelayedChainInput = {
          baseOn: 'substrate',
          contractAddress: '',
          endpoint: '',
          name: chainName,
        };
        const relayerWithdrawPayload = relayerMixerTx.generateWithdrawRequest<typeof chainInput, 'mixer'>(chainInput, {
          proof: Array.from(hexToU8a(withdrawProof.proofBytes)),
          chain: chainName,
          fee: withdrawProof.fee,
          id: Number(treeId),
          nullifierHash: Array.from(hexToU8a(withdrawProof.nullifierHash)),
          recipient: withdrawProof.recipient,
          refund: withdrawProof.refund,
          relayer: withdrawProof.relayer,
          root: Array.from(hexToU8a(withdrawProof.root)),
        });

        relayerMixerTx.watcher.subscribe(([results, message]) => {
          switch (results) {
            case RelayedWithdrawResult.PreFlight:
              this.emit('stateChange', TransactionState.SendingTransaction);
              break;
            case RelayedWithdrawResult.OnFlight:
              break;
            case RelayedWithdrawResult.Continue:
              break;
            case RelayedWithdrawResult.CleanExit:
              this.emit('stateChange', TransactionState.Done);
              this.emit('stateChange', TransactionState.Ideal);

              this.inner.notificationHandler({
                description: `TX hash: ${transactionString(message || '')}`,
                key: 'mixer-withdraw-sub',
                level: 'success',
                message: 'mixerBn254:withdraw',
                name: 'Transaction',
              });

              break;
            case RelayedWithdrawResult.Errored:
              this.emit('stateChange', TransactionState.Failed);
              this.emit('stateChange', TransactionState.Ideal);

              this.inner.notificationHandler({
                description: message || 'Withdraw failed',
                key: 'mixer-withdraw-sub',
                level: 'success',
                message: 'mixerBn254:withdraw',
                name: 'Transaction',
              });
              break;
          }
        });

        this.inner.notificationHandler({
          description: 'Sending TX to relayer',
          key: 'mixer-withdraw-sub',
          level: 'loading',
          message: 'mixerBn254:withdraw',

          name: 'Transaction',
        });

        console.log('relayerWithdrawPayload: ', relayerWithdrawPayload);

        relayerMixerTx.send(relayerWithdrawPayload);
        const results = await relayerMixerTx.await();

        if (results) {
          const [, message] = results;

          return message ?? '';
        }

        return '';
      }

      console.log('submitting the transaction of withdraw with params', withdrawProof);
      this.emit('stateChange', TransactionState.SendingTransaction);

      const tx = this.inner.txBuilder.build(
        {
          method: 'withdraw',
          section: 'mixerBn254',
        },
        [
          withdrawProof.id,
          withdrawProof.proofBytes,
          withdrawProof.root,
          withdrawProof.nullifierHash,
          withdrawProof.recipient,
          withdrawProof.relayer,
          withdrawProof.fee,
          withdrawProof.refund,
        ]
      );
      const hash = await tx.call(account.address);

      this.emit('stateChange', TransactionState.Done);

      return hash || '';
    } catch (e) {
      this.emit('error', 'Failed to generate zero knowledge proof');
      this.emit('stateChange', TransactionState.Failed);
      throw e;
    }
  }
}
