// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/proving-manager.worker';
import { getCachedFixtureURI, isProduction } from '@webb-dapp/utils/misc';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { LoggerService } from '@webb-tools/app-util';
import { Note, ProvingManager } from '@webb-tools/sdk-core';
import { ProvingManagerSetupInput } from '@webb-tools/sdk-core/proving/proving-manager-thread';

import { decodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import { MixerWithdraw, WithdrawState } from '../../webb-context';
import { WebbPolkadot } from './webb-polkadot-provider';
import { PolkadotMixerDeposit } from '.';
import { RelayedWithdrawResult } from '@webb-dapp/react-environment';
import { transactionNotificationConfig } from '@webb-dapp/wallet/providers/polkadot/transaction-notification-config';

const logger = LoggerService.get('PolkadotMixerWithdraw');

async function fetchSubstrateProvingKey() {
  const IPFSUrl = `https://ipfs.io/ipfs/QmQWnELR1oRUpoAo6URNK2XbGCfEk6sPdJioeSYqZW6cqi`;
  const cachedURI = getCachedFixtureURI('QmQWnELR1oRUpoAo6URNK2XbGCfEk6sPdJioeSYqZW6cqi');
  const ipfsKeyRequest = await fetch(isProduction() ? IPFSUrl : cachedURI);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();
  logger.info(`Done Fetching key`);
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);
  return circuitKey;
}

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
  private loading = false;
  private initialised = true;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async fetchTreeLeaves(treeId: string | number): Promise<Uint8Array[]> {
    let done = false;
    let from = 0;
    let to = 511;
    const leaves: Uint8Array[] = [];

    while (done === false) {
      const treeLeaves: any[] = await (this.inner.api.rpc as any).mt.getLeaves(treeId, from, to);
      if (treeLeaves.length === 0) {
        done = true;
        break;
      }
      leaves.push(...treeLeaves.map((i) => i.toU8a()));
      from = to;
      to = to + 511;
    }
    return leaves;
  }

  async submitViaRelayer() {}

  async withdraw(note: string, recipient: string): Promise<string> {
    this.emit('stateChange', WithdrawState.GeneratingZk);

    // parse the note
    const noteParsed = await Note.deserialize(note);
    const depositAmount = noteParsed.note.amount;
    const amount = depositAmount;
    const sizes = await PolkadotMixerDeposit.getSizes(this.inner);
    const treeId = sizes.find((s) => s.value === Number(amount))?.treeId!;
    logger.trace(`Tree Id `, treeId);
    const leaves = await this.fetchTreeLeaves(treeId);
    const leaf = u8aToHex(noteParsed.getLeaf());
    const leafIndex = leaves.findIndex((l) => u8aToHex(l) === leaf);
    logger.trace(`leaf ${leaf} has index `, leafIndex);

    logger.trace(leaves.map((i) => u8aToHex(i)));
    try {
      const pm = new ProvingManager(new Worker());
      const account = await this.inner.accounts.activeOrDefault;
      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }
      const recipientAccountHex = u8aToHex(decodeAddress(recipient));
      // ss58 format
      const relayerAccountId = recipient;
      const relayerAccountHex = recipientAccountHex;

      const provingKey = await fetchSubstrateProvingKey();
      const activeRelayer = this.activeRelayer[0];
      if (activeRelayer && activeRelayer.account && activeRelayer.beneficiary) {
        const relayerAccountHex = u8aToHex(decodeAddress(activeRelayer.account));

        logger.info(`withdrawing through relayer`, activeRelayer);
        const proofInput: ProvingManagerSetupInput = {
          leaves,
          note,
          leafIndex,
          refund: 0,
          fee: 0,
          recipient: recipientAccountHex.replace('0x', ''),
          relayer: relayerAccountHex.replace('0x', ''),
          provingKey,
        };
        const zkProofMetadata = await pm.proof(proofInput);
        const withdrawProof: WithdrawProof = {
          id: String(treeId),
          proofBytes: `0x${zkProofMetadata.proof}` as any,
          root: `0x${zkProofMetadata.root}`,
          nullifierHash: `0x${zkProofMetadata.nullifierHash}`,
          recipient: recipient,
          relayer: relayerAccountId,
          fee: 0,
          refund: 0,
        };
        this.emit('stateChange', WithdrawState.SendingTransaction);
        const relayerMixerTx = await activeRelayer.initWithdraw('mixerRelayTx');
        const relayerWithdrawPayload = relayerMixerTx.generateWithdrawRequest(
          {
            baseOn: 'substrate',
            contractAddress: '',
            endpoint: '',
            // TODO change this from the config
            name: 'localnode',
          },
          withdrawProof.proofBytes,
          {
            chain: 'localnode',
            fee: withdrawProof.fee,
            nullifierHash: withdrawProof.nullifierHash,
            recipient: withdrawProof.recipient,
            refund: withdrawProof.refund,
            root: withdrawProof.root,
            relayer: withdrawProof.relayer,
            id: treeId,
          }
        );
        relayerMixerTx.watcher.subscribe(([results, message]) => {
          switch (results) {
            case RelayedWithdrawResult.PreFlight:
              this.emit('stateChange', WithdrawState.SendingTransaction);
              break;
            case RelayedWithdrawResult.OnFlight:
              break;
            case RelayedWithdrawResult.Continue:
              break;
            case RelayedWithdrawResult.CleanExit:
              this.emit('stateChange', WithdrawState.Done);
              this.emit('stateChange', WithdrawState.Ideal);
              transactionNotificationConfig.finalize?.({
                address: recipient,
                data: undefined,
                key: 'mixer-withdraw-sub',
                path: {
                  method: 'mixerBn254',
                  section: 'withdraw',
                },
              });
              break;
            case RelayedWithdrawResult.Errored:
              this.emit('stateChange', WithdrawState.Failed);
              this.emit('stateChange', WithdrawState.Ideal);
              transactionNotificationConfig.failed?.({
                address: recipient,
                data: message || 'Withdraw failed',
                key: 'mixer-withdraw-sub',
                path: {
                  method: 'mixerBn254',
                  section: 'withdraw',
                },
              });
              break;
          }
        });
        relayerMixerTx.send(relayerWithdrawPayload);
        await relayerMixerTx.await();
        return '';
      }
      const proofInput: ProvingManagerSetupInput = {
        leaves,
        note,
        leafIndex,
        refund: 0,
        fee: 0,
        recipient: recipientAccountHex.replace('0x', ''),
        relayer: relayerAccountHex.replace('0x', ''),
        provingKey,
      };
      logger.trace(`Generating zkp proof with proof inputs `, proofInput);

      const zkProofMetadata = await pm.proof(proofInput);

      const withdrawProof: WithdrawProof = {
        id: String(treeId),
        proofBytes: `0x${zkProofMetadata.proof}` as any,
        root: `0x${zkProofMetadata.root}`,
        nullifierHash: `0x${zkProofMetadata.nullifierHash}`,
        recipient: recipient,
        relayer: relayerAccountId,
        fee: 0,
        refund: 0,
      };
      logger.trace(`submitting the transaction of withdraw with params`, withdrawProof);
      this.emit('stateChange', WithdrawState.SendingTransaction);

      const tx = this.inner.txBuilder.build(
        {
          section: 'mixerBn254',
          method: 'withdraw',
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
      this.emit('stateChange', WithdrawState.Done);
      return hash || '';
    } catch (e) {
      this.emit('error', 'Failed to generate zero knowledge proof');
      this.emit('stateChange', WithdrawState.Failed);
      throw e;
    }
  }
}
