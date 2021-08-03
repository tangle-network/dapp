import { Anchor } from '@webb-dapp/contracts/types/Anchor';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { createDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { MerkleTree } from '@webb-dapp/utils/merkle';
import { BigNumber, Contract, providers, Signer } from 'ethers';
import { Log } from '@ethersproject/abstract-provider';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import utils from 'web3-utils';
import { abi } from '../abis/NativeAnchor.json';
import { mixerLogger } from '@webb-dapp/mixer/utils';

const webSnarkUtils = require('websnark/src/utils');
type DepositEvent = [string, number, BigNumber];

export class AnchorContract {
  private _contract: Anchor;
  private readonly signer: Signer;

  constructor(private mixersInfo: EvmChainMixersInfo, private web3Provider: providers.Web3Provider, address: string) {
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
    const depositSize = Number.parseFloat(utils.fromWei(depositSizeBN.toString(), 'ether'));
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
    const filters = await this._contract.filters.Deposit(commitment, null, null);
    this._contract.once(filters, (commitment, insertedIndex, timestamp) => {
      onComplete?.([commitment, insertedIndex, timestamp]);
    });
    const recipient = await this._contract.deposit(commitment, overrides);
    await recipient.wait();
  }

  private async getDepositLeaves(): Promise<string[]> {
    const filter = this._contract.filters.Deposit(null, null, null);

    const currentBlock = await this.web3Provider.getBlockNumber();
    const storedContractInfo = await this.mixersInfo.getMixerStorage(this._contract.address);

    const startingBlock = storedContractInfo.lastQueriedBlock; // Read starting block from cached storage
    let logs: Array<Log> = []; // Read the stored logs into this variable

    try {
      logs = await this.web3Provider.getLogs({
        fromBlock: startingBlock,
        toBlock: currentBlock,
        ...filter,
      });
    } catch (e) {
      mixerLogger.log(e);

      // If there is a timeout, query the logs in block increments.
      if (e.code == -32603) {
        for (let i = startingBlock; i < currentBlock; i += 50) {
          logs = [
            ...logs,
            ...(await this.web3Provider.getLogs({
              fromBlock: i,
              toBlock: currentBlock - i > 50 ? i + 50 : currentBlock,
              ...filter,
            })),
          ];

          mixerLogger.log(`Getting logs for block range: ${i} through ${i + 50}`);
        }
      } else {
        throw e;
      }
    }
    const events = logs.map((log) => this._contract.interface.parseLog(log));

    const newCommitments = events
      .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
      .map((e) => e.args.commitment);

    const commitments = [...storedContractInfo.leaves, ...newCommitments];

    // extract the commitments from the events, and update the storage
    await this.mixersInfo.setMixerStorage(this._contract.address, currentBlock, commitments);

    return commitments;
  }

  async generateMerkleProof(deposit: Deposit) {
    const leaves = await this.getDepositLeaves();
    const tree = new MerkleTree('eth', 20, leaves);
    let leafIndex = leaves.findIndex((commitment) => commitment == bufferToFixed(deposit.commitment));
    return tree.path(leafIndex);
  }

  async generateZKP(note: EvmNote, recipient: string) {
    const deposit = note.intoDeposit();
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
      // @ts-ignore
      window.groth16,
      input,
      circuitData,
      proving_key
    );
    const { proof } = await webSnarkUtils.toSolidityInput(proofsData);
    return { proof, input };
  }

  async withdraw(noteString: string, recipient: string) {
    // tx config
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
    };
    const { input, proof } = await this.generateZKP(EvmNote.deserialize(noteString), recipient);
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
