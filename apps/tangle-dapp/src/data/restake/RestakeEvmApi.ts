import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import {
  Abi as ViemAbi,
  Account,
  ContractFunctionArgs,
  ContractFunctionName,
  Hash,
  SimulateContractParameters,
} from 'viem';
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
} from '@webb-tools/webb-ui-components/types/address';
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions';
import { Config } from 'wagmi';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import RESTAKING_PRECOMPILE_ABI from '../../abi/restaking';
import {
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import {
  convertAddressToBytes32,
  isEvmAddress,
} from '@webb-tools/webb-ui-components';
import createEvmBatchCallData from '../../utils/staking/createEvmBatchCallData';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';

class RestakeEvmApi extends RestakeApiBase {
  constructor(
    readonly activeAccount: EvmAddress,
    readonly signer: Account | EvmAddress,
    readonly provider: Config,
    onSuccess: TxSuccessCallback,
    onFailure: TxFailureCallback,
  ) {
    super(onSuccess, onFailure);
  }

  async callContract<
    const Abi extends ViemAbi | readonly unknown[],
    FunctionName extends ContractFunctionName<Abi, 'nonpayable' | 'payable'>,
    Args extends ContractFunctionArgs<
      Abi,
      'nonpayable' | 'payable',
      FunctionName
    >,
  >(
    abi: Abi,
    address: PrecompileAddress,
    functionName: FunctionName,
    args: Args,
  ): Promise<Hash | Error> {
    try {
      const connector = (() => {
        if (this.provider.state.current === null) return;

        return this.provider.state.connections.get(this.provider.state.current)
          ?.connector;
      })();

      const chainId = (() => {
        if (this.provider.state.current === null) return;

        return this.provider.state.connections.get(this.provider.state.current)
          ?.chainId;
      })();

      const { request } = await simulateContract(this.provider, {
        abi,
        address,
        functionName,
        args,
        account: this.activeAccount,
        connector,
        chainId,
      } satisfies SimulateContractParameters);

      const hash = await writeContract(this.provider, request);

      const receipt = await waitForTransactionReceipt(this.provider, {
        hash,
      });

      if (receipt.status === 'success') {
        // eventHandlers?.onTxSuccess?.(hash, receipt.blockHash, context);
        return hash;
      } else {
        // TODO: Provide more context on what went wrong.
        return new Error('EVM operation failed');
      }
    } catch (possibleError) {
      return ensureError(possibleError);
    }
  }

  deposit(assetId: RestakeAssetId, amount: BN) {
    const assetIdBigInt = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return this.callContract(
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'deposit',
      // TODO: Lock multiplier.
      [assetIdBigInt, tokenAddress, BigInt(amount.toString()), 0],
    );
  }

  delegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
    blueprintSelection?: BN[],
  ) {
    const customAssetId = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return this.callContract(
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

  undelegate(
    operatorAddress: SubstrateAddress,
    assetId: RestakeAssetId,
    amount: BN,
  ): Promise<Hash | Error> {
    const customAssetId = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return this.callContract(
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

  withdraw(assetId: RestakeAssetId, amount: BN): Promise<Hash | Error> {
    const customAssetId = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);
    const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

    return this.callContract(
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'scheduleWithdraw',
      [customAssetId, tokenAddress, BigInt(amount.toString())],
    );
  }

  executeUndelegate(): Promise<Hash | Error> {
    return this.callContract(
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'executeDelegatorUnstake',
      [],
    );
  }

  executeWithdraw(): Promise<Hash | Error> {
    return this.callContract(
      RESTAKING_PRECOMPILE_ABI,
      PrecompileAddress.RESTAKING,
      'executeWithdraw',
      [],
    );
  }

  cancelUndelegate(
    requests: RestakeUndelegateRequest[],
  ): Promise<Hash | Error> {
    const batchCalls = requests.map(({ operatorAddress, assetId, amount }) => {
      const assetIdBigInt = isEvmAddress(assetId) ? BigInt(0) : BigInt(assetId);

      const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

      // The precompile function expects a 32-byte address.
      const operatorAddressBytes32 = convertAddressToBytes32(operatorAddress);

      return createEvmBatchCallData(
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

    return this.callContract(
      BATCH_PRECOMPILE_ABI,
      PrecompileAddress.BATCH,
      'batchAll',
      createEvmBatchCallArgs(batchCalls),
    );
  }

  cancelWithdraw(requests: RestakeWithdrawRequest[]): Promise<Hash | Error> {
    const batchCalls = requests.map(({ assetId, amount }) => {
      const assetIdBigInt = isEvmAddress(assetId) ? 0 : BigInt(assetId);
      const tokenAddress = isEvmAddress(assetId) ? assetId : ZERO_ADDRESS;

      return createEvmBatchCallData(
        RESTAKING_PRECOMPILE_ABI,
        PrecompileAddress.RESTAKING,
        'cancelWithdraw',
        [assetIdBigInt, tokenAddress, BigInt(amount.toString())],
      );
    });

    return this.callContract(
      BATCH_PRECOMPILE_ABI,
      PrecompileAddress.BATCH,
      'batchAll',
      createEvmBatchCallArgs(batchCalls),
    );
  }
}

export default RestakeEvmApi;
