import { Anchor } from '@webb-dapp/contracts/types/Anchor';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { createDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { MerkleTree } from '@webb-dapp/utils/merkle';
import { BigNumber, Contract, providers, Signer } from 'ethers';
import utils from 'web3-utils';

import { abi } from '../abis/NativeAnchor.json';

const webSnarkUtils = require('websnark/src/utils');

type DepositEvent = [string, number, BigNumber];
const snarkjs = require('snarkjs');

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

  get denomination() {
    return this._contract.denomination();
  }

  get inner() {
    return this._contract;
  }

  async createDeposit(assetSymbol: string): Promise<{ note: EvmNote; deposit: Deposit }> {
    const deposit = createDeposit();
    const chainId = await this.signer.getChainId();
    const depositSizeBN = await this.denomination;
    const depositSize = Number.parseFloat(utils.fromWei(depositSizeBN.toString(), "ether"));
    const note = new EvmNote(assetSymbol, depositSize, chainId, deposit.preimage);
    return {
      note,
      deposit,
    };
  }

  async deposit(commitment: string, onComplete?: (event: DepositEvent) => void) {
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
      value: await this.denomination,
    };
    console.log(commitment);
    const filters = await this._contract.filters.Deposit(commitment, null, null);
    this._contract.once(filters, (commitment, insertedIndex, timestamp) => {
      onComplete?.([commitment, insertedIndex, timestamp]);
    });
    const recipient = await this._contract.deposit(commitment, overrides);
    await recipient.wait();
  }

  private async getDepositEvents(commitment: string | null = null) {
    const filter = this._contract.filters.Deposit(commitment, null, null);

    const currentBlock = await this.web3Provider.getBlockNumber();
    const startingBlock = 1; // Read starting block from cached storage
    var logs = []; // Read the stored logs into this variable

    try {
      logs = await this.web3Provider.getLogs({
        fromBlock: startingBlock,
        toBlock: 'latest',
        ...filter,
      });
    } catch (e) {
      console.log(e);

      // If there is a timeout, query the logs in block increments.
      if (e.code == -32603) {
        for (var i=startingBlock; i < currentBlock; i+= 1000)
        {
          logs = [...logs, ...(await this.web3Provider.getLogs({
            fromBlock: i,
            toBlock: (currentBlock - i > 1000) ? i + 1000 : currentBlock,
            ...filter,
          }))];
        }
      } else {
        throw e;
      }
    }
    console.log(logs);

    // TODO: store the currentBlock as the new syncedBlock in storage

    // TODO: append the newly retrieved logs to the storage for this mixer
    
    return logs.map((log) => this._contract.interface.parseLog(log));
  }

  async generateMerkleProof(deposit: Deposit) {
    const events = await this.getDepositEvents(null);
    const leaves = events
      .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
      .map((e) => e.args.commitment);
    const tree = new MerkleTree('eth', 20, leaves);
    let depositEvent = events.find((e) => e.args.commitment === bufferToFixed(deposit.commitment));
    console.log('bufferToFixed', bufferToFixed(deposit.commitment));
    console.log(deposit.commitment);

    let leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;
    return tree.path(leafIndex);
  }

  async withdraw(noteString: string, recipient: string) {
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
    };

    const note = EvmNote.deserialize(noteString);
    const deposit = note.intoDeposit();
    console.log({
      deposit,
      preimage: bufferToFixed(deposit.preimage),
    });
    const merkleProof = await this.generateMerkleProof(deposit);
    const { pathElements, pathIndex, root } = merkleProof;
    let circuitData = require('../circuits/withdraw.json');
    let proving_key = require('../circuits/withdraw_proving_key.bin');
    proving_key = await fetch(proving_key);
    proving_key = await proving_key.arrayBuffer();

    const input = {
      // public
      root: root,
      nullifierHash: deposit.nullifierHash,
      relayer: 0,
      recipient: recipient,
      fee: 0,
      refund: 0,

      // private
      nullifier: deposit.nullifier,
      secret: deposit.secret,
      pathElements: pathElements,
      pathIndices: pathIndex,
    };
    const proofsData = await webSnarkUtils.genWitnessAndProve(
      {
        proof: (witness: any, pk: any) => {
          // @ts-ignore
          return window.groth16GenProof(witness, pk);
        },
      },
      input,
      circuitData,
      proving_key
    );
    const { proof } = await webSnarkUtils.toSolidityInput(proofsData);
    const tx = await this._contract.withdraw(
      proof,
      bufferToFixed(input.root),
      bufferToFixed(input.nullifierHash),
      input.recipient,
      bufferToFixed(input.relayer, 20),
      bufferToFixed(input.fee),
      bufferToFixed(input.refund),
      overrides
    );
    return tx;
  }
}
