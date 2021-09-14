/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Signer } from 'ethers';
import { Provider, TransactionRequest } from '@ethersproject/providers';
import { Contract, ContractFactory, Overrides } from '@ethersproject/contracts';

import { BadRecipient } from './BadRecipient';

export class BadRecipientFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<BadRecipient> {
    return super.deploy(overrides || {}) as Promise<BadRecipient>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): BadRecipient {
    return super.attach(address) as BadRecipient;
  }
  connect(signer: Signer): BadRecipientFactory {
    return super.connect(signer) as BadRecipientFactory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): BadRecipient {
    return new Contract(address, _abi, signerOrProvider) as BadRecipient;
  }
}

const _abi = [
  {
    stateMutability: 'nonpayable',
    type: 'fallback',
  },
];

const _bytecode =
  '0x6080604052348015600f57600080fd5b50609d80601d6000396000f3fe6080604052348015600f57600080fd5b5060405162461bcd60e51b815260040180806020018281038252602181526020018060476021913960400191505060405180910390fdfe7468697320636f6e747261637420646f6573206e6f742061636365707420455448a26469706673582212202a6c843a4961e61d69b4f27291728497a938ecb6082dc18b27ea8e942d3bb41764736f6c63430007060033';
