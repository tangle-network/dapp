import { Contract, Wallet } from 'ethers';
import { abi } from '../abis/NativeAnchor.json';
import { Anchor } from '@webb-dapp/contracts/types/Anchor';
import { MimcSpongeHasher } from '@webb-dapp/utils/merkle';
import { snark } from '@webb-dapp/utils/snarks/snark';

const hasher = new MimcSpongeHasher();
const rbigint = (nbytes) => {
  const values = crypto.getRandomValues(nbytes);
  let res = BigInt(0);
};

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


  async deposit() {
    // const nullifier = rbigint(31);
    // const secret = rbigint(31);
    // let deposit: any = { nullifier, secret };
    // console.log(deposit);
    // deposit.preimage = Buffer.concat([deposit.nullifier.leInt2Buff(31), deposit.secret.leInt2Buff(31)]);
    // deposit.commitment = pedersenHash(deposit.preimage);
    // deposit.nullifierHash = pedersenHash(deposit.nullifier.leInt2Buff(31));
    const chainId = this.wallet.getChainId();
    console.log(snark);
    console.log(deposit, chainId);

  }


}
