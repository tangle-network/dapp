import {
  CancellationToken,
  FixturesStatus,
  NewNotesTxResult,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import { VAnchor } from '@webb-tools/anchors';
import { registrationStorageFactory } from '@webb-tools/browser-utils/storage';
import { ERC20__factory } from '@webb-tools/contracts';
import { checkNativeAddress } from '@webb-tools/dapp-types';
import { VAnchorContract } from '@webb-tools/evm-contracts';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
import {
  buildVariableWitnessCalculator,
  calculateTypedChainId,
  ChainType,
  CircomUtxo,
  Keypair,
  Note,
  NoteGenInput,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { FungibleTokenWrapper } from '@webb-tools/tokens';
import { hexToU8a, ZERO_ADDRESS, ZkComponents } from '@webb-tools/utils';
import {
  BigNumberish,
  ContractReceipt,
  ContractTransaction,
  ethers,
} from 'ethers';

import { WebbWeb3Provider } from '../webb-provider';

export const isVAnchorDepositPayload = (
  payload: TransactionPayloadType
): boolean => {
  return payload instanceof Note;
};

export const isVAnchorWithdrawPayload = (
  payload: TransactionPayloadType
): boolean => {
  return false;
};

export const isVAnchorTransferPayload = (
  payload: TransactionPayloadType
): boolean => {
  return false;
};

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
  async getVAnchor(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType
  ): Promise<VAnchorContract> {
    const { note } = payload;
    const { sourceChainId } = note;
    const vanchors = await this.inner.methods.bridgeApi.getVAnchors();

    if (vanchors.length === 0) {
      tx.fail('No variable anchor configured for selected token');
    }

    const vanchor = vanchors[0];

    // Get the contract address for the src chain
    const srcAddress = vanchor.neighbours[sourceChainId] as string;
    if (!srcAddress) {
      tx.fail(`No Anchor for the chain ${note.targetChainId}`);
    }
    const srcVAnchor = this.inner.getVariableAnchorByAddress(srcAddress);
    return srcVAnchor;
  }

  async getTokenWrapper(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType
  ): Promise<FungibleTokenWrapper> {
    const srcVAnchor = await this.getVAnchor(tx, payload);
    const currentWebbToken = await srcVAnchor.getWebbToken();
    return FungibleTokenWrapper.connect(
      currentWebbToken.address,
      this.inner.getEthersProvider().getSigner()
    );
  }

  async checkHasBalance(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<void> | never {
    const provider = this.inner.getEthersProvider();
    const signer = await provider.getSigner().getAddress();
    // Checking for balance of the wrapUnwrapToken
    let hasBalance: boolean;
    // If the `wrapUnwrapToken` is the `ZERO_ADDRESS`, we are wrapping
    // the native token. Therefore, we must check the native balance.
    if (wrapUnwrapToken === ZERO_ADDRESS) {
      const nativeBalance = await provider.getBalance(signer);
      hasBalance = nativeBalance.gte(payload.note.amount);
    } else {
      // If the `wrapUnwrapToken` is not the `ZERO_ADDRESS`, we assume that
      // the `wrapUnwrapToken` has been set to either the wrappedToken address
      // of the address of a wrappable ERC20 token. In either case, we can check the
      // balance using the `ERC20` contract.
      const erc20 = ERC20__factory.connect(wrapUnwrapToken, provider);
      const balance = await erc20.balanceOf(signer);
      hasBalance = balance.gte(payload.note.amount);
    }
    // Notification failed transaction if not enough balance
    if (!hasBalance) {
      this.emit('stateChange', TransactionState.Failed);
      await this.inner.noteManager?.removeNote(payload);
      tx.fail('Not enough balance');
    }
  }

  async checkApproval(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string,
    tokenWrapper: FungibleTokenWrapper
  ): Promise<void> {
    const { note } = payload;
    const { amount, sourceChainId } = note;
    const srcVAnchor = await this.getVAnchor(tx, payload);
    const currentWebbToken = await srcVAnchor.getWebbToken();
    const approvalValue = await tokenWrapper.contract.getAmountToWrap(amount);
    let approvalTransaction: ContractTransaction;
    if (checkNativeAddress(wrapUnwrapToken)) {
      /// native token no approval needed
    } else if (
      wrapUnwrapToken === currentWebbToken.address &&
      (await srcVAnchor.isWebbTokenApprovalRequired(amount))
    ) {
      // approve the token
      approvalTransaction = await currentWebbToken.approve(
        srcVAnchor._contract.address,
        amount,
        {
          gasLimit: '0x5B8D80',
        }
      );
    } else if (
      await srcVAnchor.isWrappableTokenApprovalRequired(
        wrapUnwrapToken,
        approvalValue
      )
    ) {
      // approve the wrappable asset
      const token = ERC20__factory.connect(
        wrapUnwrapToken,
        this.inner.getEthersProvider().getSigner()
      );
      approvalTransaction = await token.approve(
        currentWebbToken.address,
        approvalValue,
        { gasLimit: '0x5B8D80' }
      );
    }
    if (approvalTransaction) {
      // Notification Waiting for approval notification
      tx.next(TransactionState.Intermediate, {
        name: 'Approval is required for depositing',
        data: {
          tokenAddress: wrapUnwrapToken,
        },
      });

      await approvalTransaction.wait();
      tx.next(TransactionState.Intermediate, {
        name: 'Approved',
        data: {
          txHash: approvalTransaction.hash,
        },
      });
    }
  }

  async prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string
  ): Promise<
    [
      tx: Transaction<NewNotesTxResult>,
      contractAddress: string,
      inputs: Utxo[],
      outputs: Utxo[],
      fee: BigNumberish,
      refund: BigNumberish,
      recipient: string,
      relayer: string,
      wrapUnwrapToken: string,
      leavesMap: Record<string, Uint8Array[]>
    ]
  > {
    if (isVAnchorDepositPayload(payload)) {
      // Get the wrapped token and check the balance and approvals
      const tokenWrapper = await this.getTokenWrapper(tx, payload);
      console.log(
        'Token wrapper contract address: ',
        tokenWrapper.contract.address
      );
      if (wrapUnwrapToken === '')
        wrapUnwrapToken = tokenWrapper.contract.address;

      await this.checkHasBalance(tx, payload, wrapUnwrapToken);

      await this.checkApproval(tx, payload, wrapUnwrapToken, tokenWrapper);

      const secrets = payload.note.secrets.split(':');
      const depositUtxo = await CircomUtxo.generateUtxo({
        curve: payload.note.curve,
        backend: payload.note.backend,
        amount: payload.note.amount,
        originChainId: payload.note.sourceChainId.toString(),
        chainId: payload.note.targetChainId.toString(),
        keypair: new Keypair(`0x${secrets[2]}`),
        blinding: hexToU8a(`0x${secrets[3]}`),
      });
      console.log('depositUtxo', depositUtxo);
      return Promise.resolve([
        tx, // tx
        payload.note.sourceIdentifyingData, // contractAddress
        [], // inputs
        [depositUtxo], // outputs
        0, // fee
        0, // refund
        ZERO_ADDRESS, // recipient
        ZERO_ADDRESS, // relayer
        wrapUnwrapToken, // wrapUnwrapToken
        {}, // leavesMap
      ]);
    } else if (isVAnchorWithdrawPayload(payload)) {
      throw new Error('Invalid payload');
    } else if (isVAnchorTransferPayload(payload)) {
      throw new Error('Invalid payload');
    } else {
      throw new Error('Invalid payload');
    }
  }

  async transact(
    tx: Transaction<NewNotesTxResult>,
    contractAddress: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BigNumberish,
    refund: BigNumberish,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>
  ): Promise<ContractReceipt> {
    const signer = await this.inner.getProvider().getSigner();

    const smallFixtures: ZkComponents = await this.fetchSmallFixtures(tx, 1);
    const dummyFixtures: ZkComponents = {
      zkey: new Uint8Array(),
      wasm: Buffer.from(''),
      witnessCalculator: undefined,
    };

    const vanchor = await VAnchor.connect(
      contractAddress,
      smallFixtures,
      dummyFixtures,
      signer
    );

    tx.txHash = '0x';
    tx.next(TransactionState.SendingTransaction, '0x');

    return vanchor.transact(
      inputs,
      outputs,
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapToken,
      leavesMap
    );
  }

  async fetchSmallFixtures(
    tx: Transaction<NewNotesTxResult>,
    maxEdges: number
  ): Promise<ZkComponents> {
    return this.fetchFixtures(tx, maxEdges, true);
  }

  async fetchLargeFixtures(
    tx: Transaction<NewNotesTxResult>,
    maxEdges: number
  ): Promise<ZkComponents> {
    return this.fetchFixtures(tx, maxEdges, false);
  }

  async fetchFixtures(
    tx: Transaction<NewNotesTxResult>,
    maxEdges: number,
    isSmall: boolean
  ): Promise<ZkComponents> {
    this.emit('stateChange', TransactionState.FetchingFixtures);
    const fixturesList = new Map<string, FixturesStatus>();
    fixturesList.set('VAnchorKey', 'Waiting');
    fixturesList.set('VAnchorWasm', 'Waiting');
    tx.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });
    fixturesList.set('VAnchorKey', 0);
    const smallKey = await fetchVAnchorKeyFromAws(
      maxEdges,
      isSmall,
      tx.cancelToken.abortSignal
    );
    fixturesList.set('VAnchorKey', 'Done');
    fixturesList.set('VAnchorWasm', 0);
    const smallWasm = await fetchVAnchorWasmFromAws(
      maxEdges,
      isSmall,
      tx.cancelToken.abortSignal
    );
    fixturesList.set('VAnchorWasm', 'Done');

    return {
      zkey: smallKey,
      wasm: Buffer.from(smallWasm),
      witnessCalculator: buildVariableWitnessCalculator,
    };
  }

  // Check if the evm address and keyData pairing has already registered.
  async isPairRegistered(
    anchorAddress: string,
    account: string,
    keyData: string
  ): Promise<boolean> {
    // Check the localStorage for now.
    // TODO: Implement a query on relayers?
    const registration = await registrationStorageFactory(account);
    const registeredKeydatas = await registration.get(anchorAddress);
    if (
      registeredKeydatas &&
      registeredKeydatas.find((entry) => entry === keyData) != undefined
    ) {
      return true;
    }
    return false;
  }

  async register(
    anchorAddress: string,
    account: string,
    keyData: string
  ): Promise<boolean> {
    const vanchor = await this.inner.getVariableAnchorByAddress(anchorAddress);
    this.inner.notificationHandler({
      description: 'Registering Account',
      key: 'register',
      level: 'loading',
      message: 'Registering Account',
      name: 'Transaction',
    });

    try {
      // The user may reject on-chain registration
      await vanchor.register(account, keyData);
    } catch (ex) {
      this.inner.notificationHandler({
        description: 'Account Registration Failed',
        key: 'register',
        level: 'error',
        message: 'Account Registration Failed',
        name: 'Transaction',
      });
      return false;
    }

    this.inner.notificationHandler({
      description: 'Account Registered',
      key: 'register',
      level: 'success',
      message: 'Account Registered',
      name: 'Transaction',
    });

    const registration = await registrationStorageFactory(account);
    let registeredPubkeys = await registration.get(anchorAddress);

    // If there is already a registration localstorage, append.
    if (registeredPubkeys) {
      registeredPubkeys.push(keyData);
    } else {
      registeredPubkeys = [keyData];
    }
    await registration.set(anchorAddress, registeredPubkeys);

    return true;
  }

  async syncNotesForKeypair(
    anchorAddress: string,
    owner: Keypair
  ): Promise<Note[]> {
    const cancelToken = new CancellationToken();
    const vanchor = this.inner.getVariableAnchorByAddress(anchorAddress);
    const notes = await this.inner.getVAnchorNotesFromChain(
      vanchor,
      owner,
      cancelToken.abortSignal
    );
    return notes;
  }
}
