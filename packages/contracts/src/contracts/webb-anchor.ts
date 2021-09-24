import { Log } from '@ethersproject/abstract-provider';
import { WEBBAnchor2 as WebbAnchor } from '@webb-dapp/contracts/types/WEBBAnchor2';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { createAnchor2Deposit, Deposit } from '@webb-dapp/contracts/utils/make-deposit';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import { MerkleTree, PoseidonHasher } from '@webb-dapp/utils/merkle';
import { retryPromise } from '@webb-dapp/utils/retry-promise';
import { LoggerService } from '@webb-tools/app-util';
import { BigNumber, Contract, providers, Signer } from 'ethers';
import utils from 'web3-utils';
import { WEBBAnchor2__factory } from '../types/factories/WEBBAnchor2__factory';
import {
  BridgeWitnessInput,
  ZKPWebbInputWithMerkle,
  ZKPWebbInputWithoutMerkle,
} from '@webb-dapp/contracts/contracts/types';
import { bridgeCurrencyBridgeStorageFactory } from '@webb-dapp/react-environment/api-providers/web3/bridge-storage';
import { MixerStorage } from '@webb-dapp/apps/configs/storages/EvmChainStorage';
import { generateWitness, proofAndVerify } from '@webb-dapp/contracts/contracts/webb-utils';
import { createRootsBytes, generateWithdrawProofCallData } from '@webb-dapp/contracts/utils/bridge-utils';

const Scalar = require('ffjavascript').Scalar;

const F = require('circomlib').babyJub.F;

type DepositEvent = [string, number, BigNumber];
const logger = LoggerService.get('WebbAnchorContract');
type BridgeBlockStorage = Record<string, number>;
const anchorsStorage: BridgeBlockStorage = {
  '0x64E9727C4a835D518C34d3A50A8157120CAeb32F': 15183626,
};

export class WebbAnchorContract {
  private _contract: WebbAnchor;
  private readonly signer: Signer;

  constructor(
    private mixersInfo: EvmChainMixersInfo,
    private web3Provider: providers.Web3Provider,
    address: string,
    useProvider = false
  ) {
    this.signer = this.web3Provider.getSigner();
    logger.info(`Init with address ${address} `);
    this._contract = new Contract(
      address,
      WEBBAnchor2__factory.abi,
      useProvider ? this.web3Provider : this.signer
    ) as any;
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

  async createDeposit(assetSymbol: string, chainId: number): Promise<{ note: EvmNote; deposit: Deposit }> {
    const deposit = createAnchor2Deposit(chainId);
    const depositSizeBN = await this.denomination;
    const depositSize = Number.parseFloat(utils.fromWei(depositSizeBN.toString(), 'ether'));
    const note = new EvmNote(assetSymbol, depositSize, chainId, deposit.preimage);
    return {
      note,
      deposit,
    };
  }

  async deposit(commitment: string, onComplete?: (event: DepositEvent) => void) {
    const overrides = {};
    const recipient = await this._contract.deposit(commitment, overrides);
    await recipient.wait();
  }

  private async getDepositLeaves(startingBlock: number): Promise<{ lastQueriedBlock: number; newLeaves: string[] }> {
    const filter = this._contract.filters.Deposit(null, null, null);
    logger.trace(`Getting leaves with filter`, filter);
    const currentBlock = await this.web3Provider.getBlockNumber();

    let logs: Array<Log> = []; // Read the stored logs into this variable
    const step = 200;
    logger.info(`Fetching leaves with steps of ${step} logs/request`);
    try {
      logs = await this.web3Provider.getLogs({
        fromBlock: startingBlock,
        toBlock: currentBlock,
        ...filter,
      });
    } catch (e) {
      logger.error(e);

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

          logger.log(`Getting logs for block range: ${i} through ${i + step}`);
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
    const bridgeStorageStorage = await bridgeCurrencyBridgeStorageFactory();
    const storedContractInfo: MixerStorage[0] = (await bridgeStorageStorage.get(this._contract.address)) || {
      lastQueriedBlock: anchorsStorage[this._contract.address.toString()] || 0,
      leaves: [] as string[],
    };
    const treeHeight = await this._contract.levels();
    logger.trace(`Generating merkle proof treeHeight ${treeHeight} of deposit`, deposit);
    const tree = new MerkleTree('eth', treeHeight, storedContractInfo.leaves, new PoseidonHasher());

    // Query for missing blocks starting from the stored endingBlock
    const lastQueriedBlock = storedContractInfo.lastQueriedBlock;
    logger.trace(`Getting leaves from lastQueriedBlock `, lastQueriedBlock);
    const fetchedLeaves = await this.getDepositLeaves(lastQueriedBlock + 1);
    logger.trace(`New Leaves ${fetchedLeaves.newLeaves.length}`, fetchedLeaves.newLeaves);

    tree.batch_insert(fetchedLeaves.newLeaves);

    const newRoot = tree.get_root();
    const formattedRoot = bufferToFixed(newRoot);
    const lastRoot = await this._contract.getLastRoot();
    const knownRoot = await this._contract.isKnownRoot(formattedRoot);
    logger.info(`fromBlock ${formattedRoot} -x- last root ${lastRoot} ---> knownRoot: ${knownRoot}`);
    // compare root against contract, and store if there is a match
    const leaves = [...storedContractInfo.leaves, ...fetchedLeaves.newLeaves];
    if (knownRoot) {
      logger.info(`Root is known committing to storage ${this._contract.address}`);
      await bridgeStorageStorage.set(this._contract.address, {
        lastQueriedBlock: fetchedLeaves.lastQueriedBlock,
        leaves,
      });
    }
    logger.trace(`Getting leaf index  of ${deposit.commitment}`, leaves);
    let leafIndex = leaves.findIndex((commitment) => commitment == deposit.commitment);
    logger.info(`Leaf index ${leafIndex}`);
    return tree.path(leafIndex);
  }

  async generateMerkleProofFroRoot(deposit: Deposit, targetRoot: string) {
    logger.trace('generate merkle proof with deposit', deposit, ` for the target roof ${targetRoot}`);
    let lastQueriedBlock = 0;
    const treeHeight = await this._contract.levels();
    logger.trace(`Generating merkle proof treeHeight ${treeHeight} of deposit`, deposit);
    const tree = new MerkleTree('eth', treeHeight, [], new PoseidonHasher());
    const fetchedLeaves = await this.getDepositLeaves(lastQueriedBlock + 1);
    logger.trace(`fetched leaves`, fetchedLeaves.newLeaves);
    const insertedLeaves = [];
    for (const leaf of fetchedLeaves.newLeaves) {
      tree.insert(leaf);
      insertedLeaves.push(leaf);
      const nextRoot = tree.get_root();
      logger.trace(`Adding leaf ${leaf} ->  the root is ${nextRoot}`);
      if (bufferToFixed(nextRoot) === targetRoot) {
        const index = insertedLeaves.findIndex((l) => l == deposit.commitment);
        logger.trace(`leaf index if ${index}`);
        return tree.path(index);
      }
    }
    return undefined;
  }

  async merkleProofToZKp(merkleProof: any, deposit: Deposit, zkpInputWithoutMerkleProof: ZKPWebbInputWithoutMerkle) {
    const { pathElements, pathIndex: pathIndices, root: merkleRoot } = merkleProof;
    const localRoot = await this._contract.getLastRoot();
    const root = bufferToFixed(merkleRoot);
    const input: BridgeWitnessInput = {
      chainID: BigInt(deposit.chainId),
      nullifier: deposit.nullifier,
      secret: deposit.secret,
      nullifierHash: deposit.nullifierHash,
      diffs: [localRoot, root].map((r) => {
        return F.sub(Scalar.fromString(`${r}`), Scalar.fromString(`${root}`)).toString();
      }),
      fee: String(zkpInputWithoutMerkleProof.fee),
      pathElements,
      pathIndices,
      recipient: zkpInputWithoutMerkleProof.recipient,
      refund: String(zkpInputWithoutMerkleProof.refund),
      relayer: zkpInputWithoutMerkleProof.relayer,
      roots: [localRoot, root],
    };
    logger.trace(`Generate witness`, input);
    const witness = await generateWitness(input);
    logger.trace(`Generated witness`, witness);
    const proof = await proofAndVerify(witness);
    logger.trace(`Zero knowlage proof`, proof);
    return { proof: proof.proof, input: input, root };
  }

  async generateZKP(deposit: Deposit, zkpInputWithoutMerkleProof: ZKPWebbInputWithoutMerkle) {
    logger.trace(`Generate zkp with args`, { deposit, zkpInputWithoutMerkleProof });
    /// which merkle root is the neighbor
    const merkleProof = await this.generateMerkleProof(deposit);
    logger.trace(`Merkle proof `, merkleProof);
    const { pathElements, pathIndex: pathIndices, root } = merkleProof;
    const nr = await this._contract.getLatestNeighborRoots();
    logger.trace(`Latest Neighbor Roots`, nr);
    const input: BridgeWitnessInput = {
      chainID: BigInt(deposit.chainId),
      nullifier: deposit.nullifier,
      secret: deposit.secret,
      nullifierHash: deposit.nullifierHash,
      diffs: [root, ...nr].map((r) => {
        return F.sub(Scalar.fromString(`${r}`), Scalar.fromString(`${root}`)).toString();
      }),
      fee: String(zkpInputWithoutMerkleProof.fee),
      pathElements,
      pathIndices,
      recipient: zkpInputWithoutMerkleProof.recipient,
      refund: String(zkpInputWithoutMerkleProof.refund),
      relayer: zkpInputWithoutMerkleProof.relayer,
      roots: [root, ...nr],
    };
    logger.trace(`Generate witness`, input);
    const witness = await generateWitness(input);
    logger.trace(`Generated witness`, witness);
    const proof = await proofAndVerify(witness);
    logger.trace(`Zero knowlage proof`, proof);
    return { proof: proof.proof, input: input, root };
  }

  async withdraw(proof: any, zkp: ZKPWebbInputWithMerkle, pub: any) {
    const overrides = {
      gasLimit: 6000000,
      gasPrice: utils.toWei('2', 'gwei'),
    };
    const proofBytes = await generateWithdrawProofCallData(proof, pub);
    logger.trace(`Withdraw proof`, proofBytes);
    const tx = await this._contract.withdraw(
      `0x${proofBytes}`,
      createRootsBytes(pub.roots),
      bufferToFixed(zkp.nullifierHash),
      zkp.recipient,
      zkp.relayer,
      bufferToFixed(zkp.fee),
      bufferToFixed(zkp.refund),
      overrides
    );
    await tx.wait();
  }
}
