import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { Account, ContractFunctionName, AbiFunction } from 'viem';
import RestakeApiBase, {
  RestakeUndelegateRequest,
  RestakeWithdrawRequest,
  TxFailureCallback,
  TxSuccessCallback,
} from './RestakeAbiBase';
import { BN } from '@polkadot/util';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/webb-ui-components/types/address';
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions';
import { Config } from 'wagmi';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import {
  ExtractAbiFunctionNames,
  FindAbiArgsOf,
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import {
  convertAddressToBytes32,
  isEvmAddress,
} from '@tangle-network/webb-ui-components';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import { TxName } from '../../constants';
import {
  EvmTxRelaySuccessResult,
  isEvmTxRelayerEligible,
} from '../../hooks/useEvmTxRelayer';

type RelayEvmTxFn =
  | (<
      Abi extends AbiFunction[],
      FunctionName extends ExtractAbiFunctionNames<Abi>,
    >(
      abi: Abi,
      precompileAddress: PrecompileAddress,
      functionName: FunctionName,
      args: FindAbiArgsOf<Abi, FunctionName>,
    ) => Promise<Error | EvmTxRelaySuccessResult>)
  | null;

class RestakeEvmApi extends RestakeApiBase {
  constructor(
    readonly relay: RelayEvmTxFn,
    readonly hasNoBalance: boolean,
    readonly activeAccount: EvmAddress,
    readonly signer: Account | EvmAddress,
    readonly provider: Config,
    readonly onSuccess: TxSuccessCallback,
    readonly onFailure: TxFailureCallback,
  ) {
    super();
  }

  async callContract<
    const Abi extends AbiFunction[],
    FunctionName extends ContractFunctionName<Abi, 'nonpayable' | 'payable'>,
    Args extends FindAbiArgsOf<Abi, FunctionName>,
  >(
    txName: TxName,
    abi: Abi,
    address: PrecompileAddress,
    functionName: FunctionName,
    args: Args,
  ) {
    const isEligibleForTxRelay =
      this.relay !== null &&
      this.hasNoBalance &&
      isEvmTxRelayerEligible(address, functionName);

    if (isEligibleForTxRelay) {
      const result = await this.relay(abi, address, functionName, args);

      if (result instanceof Error) {
        this.onFailure(txName, result);
      } else {
        // TODO: No block hash available in this case. Will it affect the 'View explorer' link?
        this.onSuccess(result.txHash, '0x0', txName);
      }

      return;
    }

    try {
      const connector = (() => {
        if (this.provider.state.current === null) {
          return;
        }

        return this.provider.state.connections.get(this.provider.state.current)
          ?.connector;
      })();

      const chainId = (() => {
        if (this.provider.state.current === null) {
          return;
        }

        return this.provider.state.connections.get(this.provider.state.current)
          ?.chainId;
      })();

      const { request } = await simulateContract(this.provider, {
        abi: abi satisfies AbiFunction[] as AbiFunction[],
        address,
        functionName,
        args: args as unknown as unknown[],
        account: this.activeAccount,
        connector,
        chainId,
      });

      const hash = await writeContract(this.provider, request);

      const receipt = await waitForTransactionReceipt(this.provider, {
        hash,
      });

      if (receipt.status === 'success') {
        this.onSuccess(hash, receipt.blockHash, txName);

        return hash;
      } else {
        // TODO: Provide more context on what went wrong.
        const error = new Error('EVM operation failed');

        this.onFailure(txName, error);
      }
    } catch (possibleError) {
      this.onFailure(txName, ensureError(possibleError));
    }
  }

  async deposit(assetId: RestakeAssetId, amount: BN) {
    const assetIdBigInt = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    await this.callContract(
      TxName.RESTAKE_DEPOSIT,
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'deposit',
      // TODO: Lock multiplier.
      [assetIdBigInt, tokenAddress, BigInt(amount.toString()), 0],
    );
  }

  async delegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
    blueprintSelection?: BN[],
  ) {
    const customAssetId = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    await this.callContract(
      TxName.RESTAKE_DELEGATE,
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'delegate',
      [
        convertAddressToBytes32(operatorAddress),
        customAssetId,
        tokenAddress,
        BigInt(amount.toString()),
        blueprintSelection?.map((id) => BigInt(id.toString())) ?? [],
      ],
    );
  }

  async undelegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
  ) {
    const customAssetId = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    await this.callContract(
      TxName.RESTAKE_UNSTAKE,
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'scheduleDelegatorUnstake',
      [
        convertAddressToBytes32(operatorAddress),
        customAssetId,
        tokenAddress,
        BigInt(amount.toString()),
      ],
    );
  }

  async withdraw(assetId: RestakeAssetId, amount: BN) {
    const customAssetId = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    await this.callContract(
      TxName.RESTAKE_WITHDRAW,
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'scheduleWithdraw',
      [customAssetId, tokenAddress, BigInt(amount.toString())],
    );
  }

  async executeUndelegate() {
    await this.callContract(
      TxName.RESTAKE_EXECUTE_UNSTAKE,
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'executeDelegatorUnstake',
      [],
    );
  }

  async executeWithdraw() {
    await this.callContract(
      TxName.RESTAKE_EXECUTE_WITHDRAW,
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'executeWithdraw',
      [],
    );
  }

  async cancelUndelegate(requests: RestakeUndelegateRequest[]) {
    const batchCalls = requests.map(({ operatorAddress, assetId, amount }) => {
      const assetIdBigInt = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);

      const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

      // The precompile function expects a 32-byte address.
      const operatorAddressBytes32 = convertAddressToBytes32(operatorAddress);

      return createEvmBatchCall(
        RESTAKING_PRECOMPILE_ABI,
        PrecompileAddress.RESTAKING,
        'cancelDelegatorUnstake',
        [
          operatorAddressBytes32,
          assetIdBigInt,
          tokenAddress,
          BigInt(amount.toString()),
        ],
      );
    });

    await this.callContract(
      TxName.RESTAKE_CANCEL_UNSTAKE,
      BATCH_PRECOMPILE_ABI,
      PrecompileAddress.BATCH,
      'batchAll',
      createEvmBatchCallArgs(batchCalls),
    );
  }

  async cancelWithdraw(requests: RestakeWithdrawRequest[]) {
    const batchCalls = requests.map(({ assetId, amount }) => {
      const assetIdBigInt = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
      const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

      return createEvmBatchCall(
        RESTAKING_PRECOMPILE_ABI,
        PrecompileAddress.RESTAKING,
        'cancelWithdraw',
        [assetIdBigInt, tokenAddress, BigInt(amount.toString())],
      );
    });

    await this.callContract(
      TxName.RESTAKE_CANCEL_WITHDRAW,
      BATCH_PRECOMPILE_ABI,
      PrecompileAddress.BATCH,
      'batchAll',
      createEvmBatchCallArgs(batchCalls),
    );
  }
}

export default RestakeEvmApi;
