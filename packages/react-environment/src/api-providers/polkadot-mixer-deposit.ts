import { MixerDeposit } from '@webb-dapp/react-environment/webb-context';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers/webb-polkadot-provider';
import { Note } from '@webb-tools/sdk-mixer';
import { MixerGroupEntry, NativeTokenProperties } from '@webb-dapp/mixer';
import { Currency } from '@webb-dapp/mixer/utils/currency';
import { Token } from '@webb-tools/sdk-core';

export class PolkadotMixerDeposit extends MixerDeposit<WebbPolkadot> {
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

  async deposit(note: Note): Promise<void> {
    const query = await this.inner.api.query.mixer.mixerTrees.entries;

    return Promise.resolve(undefined);
  }

  generateNote(mixerId: number): Note {
    return undefined as any;
  }
}
