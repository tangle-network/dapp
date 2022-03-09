import { InternalChainId } from '@webb-dapp/apps/configs';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/proving-manager.worker';
import { RelayedWithdrawResult, WebbRelayer } from '@webb-dapp/react-environment';
import { getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/utils/misc';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { LoggerService } from '@webb-tools/app-util';
import { Note, ProvingManager } from '@webb-tools/sdk-core';
import { ProvingManagerSetupInput } from '@webb-tools/sdk-core/proving/proving-manager-thread';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';

import { MixerWithdraw, OptionalActiveRelayer, OptionalRelayer, WithdrawState } from '../../webb-context';
import { WebbPolkadot } from './webb-polkadot-provider';
import { PolkadotMixerDeposit } from '.';

const logger = LoggerService.get('PolkadotMixerWithdraw');
const transactionString = (hexString: string) => {
  return `${hexString.slice(0, 6)}...${hexString.slice(hexString.length - 4, hexString.length)}`;
};

async function fetchSubstrateProvingKey() {
  const IPFSUrl = `https://ipfs.io/ipfs/QmYDtGX7Wf5qUPEpGsgrX6oss2m2mm8vi7uzNdK4C9yJdZ`;
  const cachedURI = getCachedFixtureURI('proving_key_uncompressed.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();
  logger.info(`Done Fetching key from ${ipfsKeyRequest.url}`);
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

  get relayers() {
    return Promise.resolve(
      this.inner.relayingManager.getRelayer({
        baseOn: 'substrate',
      })
    );
  }

  async getRelayersByNote(evmNote: Note) {
    return Promise.resolve(
      this.inner.relayingManager.getRelayer({
        baseOn: 'substrate',
      })
    );
  }

  async getRelayersByChainAndAddress(chainId: InternalChainId, address: string) {
    return this.inner.relayingManager.getRelayer({});
  }

  async mapRelayerIntoActive(relayer: OptionalRelayer): Promise<OptionalActiveRelayer> {
    if (!relayer) {
      return null;
    }
    return WebbRelayer.intoActiveWebRelayer(
      relayer,
      {
        basedOn: 'substrate',
        chain: InternalChainId.WebbDevelopment,
      },
      async () => {
        return {
          totalFees: '0',
          withdrawFeePercentage: 0,
        };
      }
    );
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
    try {
      // Get the sender account
      const account = await this.inner.accounts.activeOrDefault;
      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }

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
      const activeRelayer = this.activeRelayer[0];

      const pm = new ProvingManager(new Worker());

      const recipientAccountHex = u8aToHex(decodeAddress(recipient));
      // ss58 format
      const relayerAccountId = activeRelayer ? activeRelayer.beneficiary! : recipient;
      const relayerAccountHex = u8aToHex(decodeAddress(relayerAccountId));
      // fetching the proving key
      const provingKey = await fetchSubstrateProvingKey();
      const isValidRelayer = Boolean(activeRelayer && activeRelayer.beneficiary);
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

      if (isValidRelayer) {
        this.inner.notificationHandler({
          level: 'loading',
          name: 'Transaction',
          description: `Withdraw through ${activeRelayer!.endpoint} in progress`,
          message: 'mixerBn254:withdraw',
          key: 'mixer-withdraw-sub',
        });
      }
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
      // withdraw throw relayer
      if (isValidRelayer) {
        logger.info(`withdrawing through relayer`, activeRelayer);
        this.emit('stateChange', WithdrawState.SendingTransaction);
        const relayerMixerTx = await activeRelayer!.initWithdraw('mixerRelayTx');
        const relayerWithdrawPayload = relayerMixerTx.generateWithdrawRequest(
          {
            baseOn: 'substrate',
            contractAddress: '',
            endpoint: '',
            // TODO change this from the config
            name: 'localnode',
          },
          Array.from(hexToU8a(withdrawProof.proofBytes)),
          {
            chain: 'localnode',
            fee: withdrawProof.fee,
            nullifierHash: Array.from(hexToU8a(withdrawProof.nullifierHash)),
            recipient: withdrawProof.recipient,
            refund: withdrawProof.refund,
            root: Array.from(hexToU8a(withdrawProof.root)),
            relayer: withdrawProof.relayer,
            id: Number(treeId),
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

              this.inner.notificationHandler({
                level: 'success',
                name: 'Transaction',
                description: `TX hash: ${transactionString(message || '')}`,
                message: 'mixerBn254:withdraw',
                key: 'mixer-withdraw-sub',
              });

              break;
            case RelayedWithdrawResult.Errored:
              this.emit('stateChange', WithdrawState.Failed);
              this.emit('stateChange', WithdrawState.Ideal);

              this.inner.notificationHandler({
                level: 'success',
                name: 'Transaction',
                description: message || 'Withdraw failed',
                message: 'mixerBn254:withdraw',
                key: 'mixer-withdraw-sub',
              });
              break;
          }
        });

        this.inner.notificationHandler({
          level: 'loading',
          message: 'mixerBn254:withdraw',
          description: 'Sending TX to relayer',
          name: 'Transaction',

          key: 'mixer-withdraw-sub',
        });

        relayerMixerTx.send(relayerWithdrawPayload);
        const results = await relayerMixerTx.await();
        if (results) {
          const [relayerResults, message] = results;
          return message ?? '';
        }
        return '';
      }
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
