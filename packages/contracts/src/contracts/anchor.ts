import { BigNumber, Contract, providers, Signer } from 'ethers';
import { abi } from '../abis/NativeAnchor.json';
import { Anchor } from '@webb-dapp/contracts/types/Anchor';
import { createDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
const webSnarkUtils = require('websnark/src/utils');
import utils from 'web3-utils';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { MerkleTree } from '@webb-dapp/utils/merkle';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
type DepositEvent = [string, number, BigNumber];
const snarkjs = require('snarkjs');
console.log(snarkjs);
export class AnchorContract {
  private _contract: Anchor;
  private readonly signer: Signer;

  constructor(private web3Provider: providers.Web3Provider, address: string) {
    this.signer = this.web3Provider.getSigner();
    this._contract = new Contract(address, abi, this.signer) as any;
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

  async createDeposit(): Promise<{ note: EvmNote; deposit: Deposit }> {
    const deposit = createDeposit();
    const chainId = await this.signer.getChainId();
    const note = new EvmNote('eth', 0.1, chainId, deposit.preimage);
    return {
      note,
      deposit,
    };
  }

  async deposit(commitment: string, onComplete?: (event: DepositEvent) => void) {
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      value: '0x16345785D8A0000',
    };
    const filters = await this._contract.filters.Deposit(commitment, null, null);
    this._contract.once(filters, (commitment, insertedIndex, timestamp) => {
      onComplete?.([commitment, insertedIndex, timestamp]);
    });
    return this._contract.deposit(commitment, overrides);
  }

  private async getDepositEvents(commitment: string | null = null) {
    const filter = this._contract.filters.Deposit(commitment, null, null);
    const logs = await this.web3Provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      ...filter,
    });
    console.log(logs);
    return logs.map((log) => this._contract.interface.parseLog(log));
  }

  private async generateSnarkProof(deposit: Deposit) {
    const { root, path_elements, path_index } = await this.generateMerkleProof(deposit);
  }

  async generateMerkleProof(deposit: Deposit) {
    const events = await this.getDepositEvents(null);
    const leaves = events
      .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
      .map((e) => e.args.commitment);
    console.log(leaves);
    const tree = new MerkleTree('eth', 32, leaves);
    let depositEvent = events.find((e) => e.args.commitment === bufferToFixed(deposit.commitment));
    console.log('bufferToFixed', bufferToFixed(deposit.commitment));
    console.log(deposit.commitment);

    let leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;
    return tree.path(leafIndex);
  }

  async withdraw(noteString: string, recipient: string) {
    const note = EvmNote.deserialize(noteString);
    const deposit = note.intoDeposit();
    const merkleProof = await this.generateMerkleProof(deposit);
    console.log(merkleProof);
    const { root, pathElements, pathIndex } = merkleProof;
    let circuitData = require('../circuits/withdraw.json');
    let proving_key = require('../circuits/withdraw_proving_key.bin');
    const bigInt = snarkjs.bigInt;

    const input = {
      // public
      root: root,
      nullifierHash: deposit.nullifierHash,
      relayer: 0,
      recipient: bigInt(recipient),
      fee: 0,
      refund: 0,

      // private
      nullifier: deposit.nullifier,
      secret: deposit.secret,
      pathElements: pathElements,
      pathIndices: pathIndex,
    };
    console.log(input);
    const circuit = new snarkjs.Circuit(snarkjs.unstringifyBigInts(circuitData));
    console.log(circuit);q
    const witness = circuit.calculateWitness(snarkjs.unstringifyBigInts(input));
    const publicSignals = witness.slice(1, circuit.nPubInputs + circuit.nOutputs + 1);
    console.log({ publicSignals });
  }
}
