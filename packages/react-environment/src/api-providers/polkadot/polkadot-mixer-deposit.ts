import { MixerGroupEntry, NativeTokenProperties } from '@webb-dapp/mixer';
import { Currency } from '@webb-dapp/mixer/utils/currency';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/mixer.worker';
import { DepositPayload as IDepositPayload, MixerDeposit } from '@webb-dapp/react-environment/webb-context';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Token } from '@webb-tools/sdk-core';
import { Mixer, Note, NoteGenInput } from '@webb-tools/sdk-mixer';

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
        symbol: currency.symbol,
      }))
      .sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0));
    return groupItem;
  }

  private async getMixer(): Promise<Mixer> {
    if (this.mixer) {
      return this.mixer;
    }
    this.mixer = await Mixer.init(new Worker());
    return this.mixer;
  }

  async generateNote(mixerId: number): Promise<DepositPayload> {
    const sizes = await this.getSizes();
    const amount = sizes.find((size) => size.id === mixerId);
    if (!amount) {
      throw Error('amount not found! for mixer id ' + mixerId);
    }
    // todo store the chain id in the provider
    const chainId = 1; /* this.inner.chainId() */
    const noteInput: NoteGenInput = {
      prefix: 'web.mix',
      version: 'v1',

      backend: 'Arkworks',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      denomination: '18',

      amount: String(amount.value),
      chain: String(chainId),
      sourceChain: String(chainId),
      tokenSymbol: amount.symbol,
    };
    const depositNote = await Note.generateNote(noteInput);
    const leaf = depositNote.getLeaf();

    return {
      note: depositNote,
      params: [Number(depositNote.note.amount), [leaf]],
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

    const account = await this.inner.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    tx.on('finalize', () => {
      console.log('deposit done');
    });
    tx.on('finalize', (e: any) => {
      console.log('deposit failed', e);
    });
    tx.on('extrinsicSuccess', () => {
      console.log('deposit done');
    });
    await tx.call(account.address);
    return;
  }
}
