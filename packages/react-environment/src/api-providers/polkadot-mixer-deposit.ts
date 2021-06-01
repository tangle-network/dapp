import { MixerDeposit } from '@webb-dapp/react-environment/webb-context';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers/webb-polkadot-provider';
import { Asset, Mixer, Note } from '@webb-tools/sdk-mixer';
import { MixerGroupEntry, NativeTokenProperties } from '@webb-dapp/mixer';
import { Currency } from '@webb-dapp/mixer/utils/currency';
import { Token } from '@webb-tools/sdk-core';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/mixer.worker';

export class PolkadotMixerDeposit extends MixerDeposit<WebbPolkadot> {
  private cachedBulletProofsGens: Uint8Array | null = null;
  private mixer: Mixer | null = null;

  async getSizes(): Promise<string[]> {
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
      .map(({ amount, currency, token }) => Math.round(parseFloat(token.amount.toString())) + ` ${currency.symbol}`);
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

  async deposit([note, leaf]: [Note, Uint8Array]): Promise<void> {
    const id = note.id;
    const tx = this.inner.txBuiler.build(
      {
        section: 'mixer',
        method: 'deposit',
      },
      [id, [leaf]]
    );
    const account = await this.inner.accounts.accounts();
    return tx.call(account[0].address);
  }

  async generateNote(mixerId: number): Promise<[Note, Uint8Array]> {
    const mixer = await this.getMixer();
    const [note, leaf] = await mixer.generateNoteAndLeaf(new Asset(mixerId, 'EDG'));
    return [note, leaf];
  }
}
