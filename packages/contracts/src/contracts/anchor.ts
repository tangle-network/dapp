import { Contract, Wallet } from 'ethers';
import { abi } from '../abis/NativeAnchor.json';
import { Anchor } from '@webb-dapp/contracts/types/Anchor';

export class AnchorContract implements Partial<Anchor> {
  private _contract: Anchor;

  constructor(private wallet: Wallet, address: string) {
    this._contract = new Contract(address, abi, wallet) as any;
  }

  get getLastRoot() {
    return this._contract.getLastRoot();
  }

  get nextIndex() {
    return this._contract.nextIndex();
  }


}