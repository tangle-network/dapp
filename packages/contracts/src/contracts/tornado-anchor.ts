import { Anchor as TornadoAnchor } from '@webb-dapp/contracts/types/Anchor';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { createTornDeposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { MerkleTree, MimcSpongeHasher } from '@webb-dapp/utils/merkle';
import { BigNumber, Contract, providers, Signer } from 'ethers';
import { Log } from '@ethersproject/abstract-provider';
import { LeafIntervalInfo, EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import utils from 'web3-utils';
import { abi } from '../abis/NativeAnchor.json';
import { mixerLogger } from '@webb-dapp/mixer/utils';
import { retryPromise } from '@webb-dapp/utils/retry-promise';
import { LoggerService } from '@webb-tools/app-util';
import { ZKPTornPublicInputs, ZKPTornInputWithMerkle, ZKPTornInputsWithoutMerkle } from '@webb-dapp/contracts/contracts/types';

const webSnarkUtils = require('tornado-websnark/src/utils');
type DepositEvent = [string, number, BigNumber];
const logger = LoggerService.get('anchor');

export class TornadoAnchorContract {
  private _contract: TornadoAnchor;
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
    const deposit = createTornDeposit();
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

  private async getDepositLeaves(startingBlock: number): Promise<{ lastQueriedBlock: number, newLeaves: string[] }> {
    const filter = this._contract.filters.Deposit(null, null, null);
    const currentBlock = await this.web3Provider.getBlockNumber();

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

    return {
      lastQueriedBlock: currentBlock,
      newLeaves: newCommitments,
    };
  }

  /*
   * Generate Merkle Proof
   *  This will
   *  1- Create the merkle tree with the leaves in local storage
   *  2- Fetch the missing leaves
   *  3- Insert the missing leaves
   *  4- Compare against historical roots before adding to local storage
   *  5- return the path to the leaf.
   * */
  async generateMerkleProof(deposit: Deposit) {
    const storedContractInfo = await this.mixersInfo.getMixerStorage(this._contract.address);
    const treeHeight = await this._contract.levels();
    const tree = new MerkleTree('eth', treeHeight, storedContractInfo.leaves, new MimcSpongeHasher());

    // Query for missing blocks starting from the stored endingBlock
    const lastQueriedBlock = storedContractInfo.lastQueriedBlock;

    const fetchedLeaves = await this.getDepositLeaves(lastQueriedBlock + 1);
    logger.trace(`New Leaves ${fetchedLeaves.newLeaves.length}`, fetchedLeaves.newLeaves);

    tree.batch_insert(fetchedLeaves.newLeaves);

    const newRoot = tree.get_root();
    const formattedRoot = bufferToFixed(newRoot);
    const knownRoot = await this._contract.isKnownRoot(formattedRoot);
    logger.info(`knownRoot: ${knownRoot}`);

    // compare root against contract, and store if there is a match
    if (knownRoot) {
      this.mixersInfo.setMixerStorage(this._contract.address, fetchedLeaves.lastQueriedBlock, [
        ...storedContractInfo.leaves,
        ...fetchedLeaves.newLeaves,
      ]);
    }

    let leafIndex = [...storedContractInfo.leaves, ...fetchedLeaves.newLeaves].findIndex(
      (commitment) => commitment == bufferToFixed(deposit.commitment)
    );
    logger.info(`Leaf index ${leafIndex}`);
    return tree.path(leafIndex);
  }

  async generateZKP(deposit: Deposit, zkpPublicInputs: ZKPTornPublicInputs) {
    const merkleProof = await this.generateMerkleProof(deposit);
    const { pathElements, pathIndex: pathIndices, root } = merkleProof;
    let circuitData = require('../circuits/withdraw.json');
    let proving_key = require('../circuits/withdraw_proving_key.bin');
    proving_key = await fetch(proving_key);
    proving_key = await proving_key.arrayBuffer();
    const zkpInput: ZKPTornInputWithMerkle = {
      ...zkpPublicInputs,
      nullifier: deposit.nullifier,
      secret: deposit.secret,
      pathElements,
      pathIndices,
      root: root as string,
    };

    console.log(zkpInput);

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

  async withdraw(proof: any, zkp: ZKPTornInputWithMerkle) {
    // tx config
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('2', 'gwei'),
    };
    const tx = await this._contract.withdraw(
      proof,
      bufferToFixed(zkp.root),
      bufferToFixed(zkp.nullifierHash),
      zkp.recipient,
      zkp.relayer,
      bufferToFixed(zkp.fee),
      bufferToFixed(zkp.refund),
      overrides
    );
    return tx;
  }
}
