import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { pedersenHash } from '@webb-dapp/contracts/utils/pedersen-hash';

export class EvmNote {

  constructor(
    private _currency: string,
    private _amount: number,
    private _chainId: number,
    private _preImage: Uint8Array
  ) {
  }


  static deserialize(noteString: string) {
    const noteRegex = /anchor-(?<currency>\w+)-(?<amount>[\d.]+)-(?<chainId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
    try {
      const {
        currency,
        amount,
        note,
        chainId
      } = noteRegex.exec(noteString)?.groups as Record<string, any>;
      return new EvmNote(currency, amount, chainId, Buffer.from(note, 'hex'));
    } catch (e) {
      throw Error('failed to parse :INVALID NOTE');
    }
  }

  serialize() {
    return this.toString();
  }


  get currency() {
    return this._currency;
  }

  get amount() {
    return this._amount;
  }

  get chainId() {
    return this._chainId;
  }

  get preImage() {
    return this._preImage;
  }

  get preImageHex() {
    return bufferToFixed(this.preImage, 62);
  }

  toString() {
    return `anchor-${this.currency}-${this.amount}-${this.chainId}-${this.preImageHex}`;
  }

  intoDeposit(): Deposit {
    const commitment = bufferToFixed(pedersenHash(this.preImage));
    const nullifierHash = bufferToFixed(pedersenHash(this.preImage.slice(0, 31)));
    return {
      nullifierHash,
      commitment,
      preimage: this.preImage
    };

  }

}