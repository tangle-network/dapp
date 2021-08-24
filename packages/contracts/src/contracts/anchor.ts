import { Log } from '@ethersproject/abstract-provider';
import { ZKPInput, ZKPInputWithoutMerkleProof } from '@webb-dapp/contracts/contracts/types';
import { Anchor } from '@webb-dapp/contracts/types/Anchor';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { createDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { mixerLogger } from '@webb-dapp/mixer/utils';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { MerkleTree } from '@webb-dapp/utils/merkle';
import { retryPromise } from '@webb-dapp/utils/retry-promise';
import { LoggerService } from '@webb-tools/app-util';
import { BigNumber, Contract, providers, Signer } from 'ethers';
import utils from 'web3-utils';

import { abi } from '../abis/NativeAnchor.json';

const webSnarkUtils = require('websnark/src/utils');
type DepositEvent = [string, number, BigNumber];
const logger = LoggerService.get('anchor');

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
    const step = 20;
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
        for (let i = startingBlock; i < currentBlock; i += step) {
          const nextLogs = await retryPromise(() => {
            return this.web3Provider.getLogs({
              fromBlock: i,
              toBlock: currentBlock - i > step ? i + step : currentBlock,
              ...filter,
            });
          });
          logs = [...logs, ...nextLogs];

          mixerLogger.log(`Getting logs for block range: ${i} through ${i + step}`);
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

  /*
   * Generate Merkle Proof
   *  This will
   *  1- Fetch leaves
   *  2- build the merkle tree & get the commitment leaf index
   * 	3- Get the Merkle Path
   * */
  async generateMerkleProof(deposit: Deposit) {
    const leaves = await this.getDepositLeaves();
    logger.trace(`Leaves ${leaves.length}`, leaves);
    const tree = new MerkleTree('eth', 20, leaves);
    let leafIndex = leaves.findIndex((commitment) => commitment == bufferToFixed(deposit.commitment));
    logger.info(`Leaf index ${leafIndex}`);
    return tree.path(leafIndex);
  }

  async generateZKP(deposit: Deposit, zkpInputWithoutMerkleProof: ZKPInputWithoutMerkleProof) {
    const merkleProof = await this.generateMerkleProof(deposit);
    const { pathElements, pathIndex: pathIndices, root } = merkleProof;
    let circuitData = require('../circuits/withdraw.json');
    let proving_key = require('../circuits/withdraw_proving_key.bin');
    proving_key = await fetch(proving_key);
    proving_key = await proving_key.arrayBuffer();
    const zkpInput: ZKPInput = {
      ...zkpInputWithoutMerkleProof,
      pathElements,
      pathIndices,
      root: root as string,
    };

    const proofsData = await webSnarkUtils.genWitnessAndProve(
      // @ts-ignore
      window.groth16,
      zkpInput,
      circuitData,
      proving_key
    );
    const { proof } = await webSnarkUtils.toSolidityInput(proofsData);
    return { proof, input: zkpInput };
  }

  async withdraw(deposit: Deposit, zkpInputWithoutMerkleProof: ZKPInputWithoutMerkleProof) {
    // tx config
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('1', 'gwei'),
    };
    const { input, proof } = await this.generateZKP(deposit, zkpInputWithoutMerkleProof);
    const tx = await this._contract.withdraw(
      proof,
      bufferToFixed(input.root),
      bufferToFixed(input.nullifierHash),
      input.recipient,
      input.relayer,
      bufferToFixed(input.fee),
      bufferToFixed(input.refund),
      overrides
    );
    return tx;
  }
}
