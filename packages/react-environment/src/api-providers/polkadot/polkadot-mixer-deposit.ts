import { StorageKey } from '@polkadot/types';
import { PalletMixerMixerMetadata } from '@webb-tools/types/interfaces/pallets';
import { MixerGroupEntry, NativeTokenProperties } from '@webb-dapp/mixer';
import { Currency } from '@webb-dapp/mixer/utils/currency';
import { DepositPayload as IDepositPayload, MixerDeposit } from '@webb-dapp/react-environment/webb-context';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Note, NoteGenInput } from '@webb-tools/sdk-mixer';

import { WebbPolkadot } from './webb-polkadot-provider';
import { ApiPromise } from '@polkadot/api';
import { ORMLCurrency } from '@webb-dapp/react-environment/types/orml-currency';
import { LoggerService } from '@webb-tools/app-util';
import { u8aToHex } from '@polkadot/util';

type DepositPayload = IDepositPayload<Note, [number, string]>;
const logger = LoggerService.get('tornado-deposit');

export class PolkadotMixerDeposit extends MixerDeposit<WebbPolkadot, DepositPayload> {
  private readonly tokens: ORMLCurrency;

  constructor(t: WebbPolkadot) {
    super(t);
    this.tokens = new ORMLCurrency(t);
  }

  static async getSizes(webbPolkadot: WebbPolkadot) {
    const api = webbPolkadot.api;
    const ormlCurrency = new ORMLCurrency(webbPolkadot);
    const ormlAssets = await ormlCurrency.list();
    const data: Array<MixerGroupEntry> = await api.query.mixerBn254.mixers.entries();
    // @ts-ignore
    const tokenProperty: Array<NativeTokenProperties> = await api.rpc.system.properties();
    const groupItem = data
      .map(([storageKey, info]: [StorageKey, PalletMixerMixerMetadata]) => {
        const cId: number = Number(info.toHuman().asset);
        const amount = info.toHuman().depositSize;
        const treeId = storageKey.toHuman()[0];

        const asset = ormlAssets.find((asset) => asset.id == cId) || {
          locked: false,
          existentialDeposit: 30000,
          id: '0',
          name: 'WEBB',
        };

        const id = storageKey.toString() + treeId;
        // parse number from amount string
        // TODO: Get and parse native / non-native token denomination
        const amountNumber = Number(amount?.toString().replaceAll(',', '')) * 1.0 / Math.pow(10, 12);
        const currency = (cId)
          ? Currency.fromORMLAsset(ormlAssets.find((asset) => asset.id == cId)!, api, amountNumber)
          : Currency.fromCurrencyId(cId, api, amountNumber);
        return {
          id,
          amount: amountNumber,
          currency: currency,
          treeId,
          token: currency.token,
        };
      })
      .map(({ treeId, amount, currency, token, id }) => ({
        id,
        treeId,
        value: amount,
        title: amount + ` ${currency.symbol}`,
        symbol: currency.symbol,
      }))
      .sort((a, b) => (a.value > b.value ? 1 : a.value < b.value ? -1 : 0));
    return groupItem;
  }

  async getSizes() {
    return PolkadotMixerDeposit.getSizes(this.inner);
  }

  async generateNote(mixerId: number, chainId: number): Promise<DepositPayload> {
    logger.info(`Depositing to mixer id ${mixerId}`);
    const sizes = await this.getSizes();
    const amount = sizes.find((size) => size.id === mixerId);
    const properties = await this.inner.api.rpc.system.properties();
    const denomination = properties.tokenDecimals.toHuman() || 12;
    if (!amount) {
      throw Error('amount not found! for mixer id ' + mixerId);
    }
    const treeId = amount?.treeId;
    logger.info(`Depositing to tree id ${treeId}`);
    const noteInput: NoteGenInput = {
      prefix: 'webb.mix',
      version: 'v1',
      exponentiation: '5',
      width: '3',
      backend: 'Arkworks',
      hashFunction: 'Poseidon',
      curve: 'Bn254',
      denomination: `${denomination}`,

      amount: String(amount.value),
      chain: String(chainId),
      sourceChain: String(chainId),
      tokenSymbol: amount.symbol,
    };
    const depositNote = await Note.generateNote(noteInput);
    const leaf = depositNote.getLeaf();

    return {
      note: depositNote,
      params: [Number(treeId), u8aToHex(leaf)],
    };
  }

  async deposit(depositPayload: DepositPayload): Promise<void> {
    const tx = this.inner.txBuilder.build(
      {
        section: 'mixerBn254',
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
    tx.on('failed', (e: any) => {
      console.log('deposit failed', e);
    });
    tx.on('extrinsicSuccess', () => {
      console.log('deposit done');
    });
    await tx.call(account.address);
    return;
  }
}
