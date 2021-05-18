import { BigNumber, Contract } from 'ethers';
import { abi } from '../abis/NativeAnchor.json';
import { Anchor } from '@webb-dapp/contracts/types/Anchor';
import { createDeposit } from '@webb-dapp/contracts/utils/make-deposit';

import utils from 'web3-utils';
import { Signer } from '@ethersproject/abstract-signer';

type DepositEvent = [string, number, BigNumber]

export class AnchorContract {
  private _contract: Anchor;

  constructor(private signer: Signer, address: string) {
    this._contract = new Contract(address, abi, signer) as any;
  }

  get getLastRoot() {
    return this._contract.getLastRoot();
  }

  get nextIndex() {
    return this._contract.nextIndex();
  }

  get inner() {
    return this._contract;
  }


  createDeposit() {
    return createDeposit();

  }

  async deposit(commitment: string, onComplete?: (event: DepositEvent) => void) {
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      value: '0x16345785D8A0000'
    };
    const filters = await this._contract.filters.Deposit(commitment, null, null);
    this._contract.once(filters, (commitment, insertedIndex, timestamp) => {
      onComplete?.([commitment, insertedIndex, timestamp]);
    });
    return this._contract.deposit(commitment, overrides);
  }


}
