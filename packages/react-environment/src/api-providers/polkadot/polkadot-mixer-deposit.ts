import { MixerGroupEntry, NativeTokenProperties } from '@webb-dapp/mixer';
import { Currency } from '@webb-dapp/mixer/utils/currency';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/mixer.worker';
import { DepositPayload as IDepositPayload, MixerDeposit } from '@webb-dapp/react-environment/webb-context';
import { Token } from '@webb-tools/sdk-core';
import { Asset, Mixer, Note } from '@webb-tools/sdk-mixer';

import { WebbPolkadot } from './webb-polkadot-provider';

type DepositPayload = IDepositPayload<Note, [number, Uint8Array[]]>;

export class PolkadotMixerDeposit extends MixerDeposit<WebbPolkadot, DepositPayload> {
  private cachedBulletProofsGens: Uint8Array | null = null;
  private mixer: Mixer | null = null;

  async getSizes() {
    // @ts-ignore
    const data: Array<MixerGroupEntry> = await this.inner.api.query.mixer.mixerTrees.entries();
    console.log('polkadot-mixer-deposit', data);
    // @ts-ignore
    const tokenProperty: Array<NativeTokenProperties> = await this.inner.api.rpc.system.properties();
    const groupItem = data
      .map((entry) => {
        const cId: number = entry[1]['currency_id'].toNumber();
        const amount = entry[1]['fixed_deposit_size'];

        return {
          amount: amount,
          currency: Currency.fromCurrencyId(cId, this.inner.api, 0),
          id: Number((entry[0].toHuman() as any[])[0]),
          token: new Token({
            amount: amount.toString(),
            // TODO: Pull from active chain
            chain: 'edgeware',
            name: 'DEV',
            // @ts-ignore
            precision: Number(tokenProperty?.toHuman().tokenDecimals?.[0] ?? 12),
            symbol: 'EDG',
          }),
        };
      })
      .map(({ amount, currency, token }, index) => ({
        id: index,
        value: Math.round(Number(amount.toString()) / Math.pow(10, token.precision)),
        title: Math.round(Number(amount.toString()) / Math.pow(10, token.precision)) + ` ${currency.symbol}`,
      }))
      .sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0));
    return groupItem;
  }

  private async getBulletProofGens(): Promise<Uint8Array> {
    if (this.cachedBulletProofsGens) {
      return this.cachedBulletProofsGens;
    }
    const cachedBulletProof = localStorage.getItem('bulletproof_gens');
    if (!cachedBulletProof) {
      this.cachedBulletProofsGens = await this.generateBulletProofs();
      return this.cachedBulletProofsGens;
    }
    const encoder = new TextEncoder();
    const gens = encoder.encode(cachedBulletProof);
    this.cachedBulletProofsGens = gens;
    return gens;
  }

  private async getMixer(): Promise<Mixer> {
    if (this.mixer) {
      return this.mixer;
    }
    const bulletProofGens = await this.getBulletProofGens();
    this.mixer = await Mixer.init(new Worker(), bulletProofGens);
    return this.mixer;
  }

  private async generateBulletProofs() {
    const worker = new Worker();
    const bulletProofGens = await Mixer.preGenerateBulletproofGens(worker);
    worker.terminate();
    const decoder = new TextDecoder();
    const bulletProofGensString = decoder.decode(bulletProofGens); // from Uint8Array to String
    localStorage.setItem('bulletproof_gens', bulletProofGensString);
    return bulletProofGens;
  }

  async generateNote(mixerId: number): Promise<DepositPayload> {
    const mixer = await this.getMixer();

    const [note, leaf] = await mixer.generateNoteAndLeaf(new Asset(mixerId, 'EDG'));
    return {
      note,
      params: [note.id, [leaf]],
    };
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    const tx = this.inner.txBuilder.build(
      {
        section: 'mixer',
        method: 'deposit',
      },
      depositPayload.params
    );
    const account = await this.inner.accounts.accounts();
    tx.on('finalize', () => {
      console.log('deposit done');
    });
    tx.on('finalize', (e: any) => {
      console.log('deposit failed', e);
    });
    tx.on('extrinsicSuccess', () => {
      console.log('deposit done');
    });
    await tx.call(account[0].address);
    return;
  }
}
