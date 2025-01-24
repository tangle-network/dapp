import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import { isEvmAddress } from '@webb-tools/webb-ui-components';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import {
  zeroAddress,
  type Abi,
  type Account,
  type Address,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type Hash,
} from 'viem';
import type { Config } from 'wagmi';
import {
  waitForTransactionReceipt,
  writeContract,
  WriteContractParameters,
} from 'wagmi/actions';
import BATCH_PRECOMPILE_ABI from '../../../abi/batch';
import { PrecompileAddress } from '../../../constants/evmPrecompiles';
import createEvmBatchCall from '../../../utils/staking/createEvmBatchCall';
import createEvmBatchCallArgs from '../../../utils/staking/createEvmBatchCallArgs';
import rewardsAbi from './abi';
import RewardsTxBase, { ClaimRewardsArgs } from './base';

export default class EVMRewardsTx extends RewardsTxBase {
  constructor(
    readonly activeAccount: Address,
    readonly signer: Account | Address,
    readonly provider: Config,
  ) {
    super();
  }

  // TODO: Refactor this function into a separate utility function for better reusability and maintainability
  sendTransaction = async <
    Context extends Record<string, unknown>,
    const TAbi extends Abi | readonly unknown[],
    TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
    TArgs extends ContractFunctionArgs<
      TAbi,
      'nonpayable' | 'payable',
      TFunctionName
    >,
  >(
    abi: TAbi,
    address: Address,
    functionName: TFunctionName,
    args: TArgs,
    context: Context,
    eventHandlers?: Partial<TxEventHandlers<Context>>,
  ): Promise<Hash | null> => {
    try {
      eventHandlers?.onTxSending?.(context);

      const hash = await writeContract(this.provider, {
        abi,
        address,
        functionName,
        args,
        account: this.activeAccount,
      } as WriteContractParameters);

      eventHandlers?.onTxInBlock?.(hash, zeroAddress, context);

      const receipt = await waitForTransactionReceipt(this.provider, {
        hash,
      });

      eventHandlers?.onTxFinalized?.(hash, receipt.blockHash, context);

      if (receipt.status === 'success') {
        eventHandlers?.onTxSuccess?.(hash, receipt.blockHash, context);
        return hash;
      } else {
        eventHandlers?.onTxFailed?.('EVM deposit failed', context);
        return null;
      }
    } catch (error) {
      const errorMessage = ensureError(error).message;
      eventHandlers?.onTxFailed?.(errorMessage, context);
      return null;
    }
  };

  claimRewards = async (
    args: ClaimRewardsArgs,
    eventHandlers?: Partial<TxEventHandlers<ClaimRewardsArgs>>,
  ) => {
    const { assetIds } = args;

    if (assetIds.length === 1) {
      const callArgs = isEvmAddress(assetIds[0])
        ? ([ZERO_BIG_INT, assetIds[0]] as const)
        : ([BigInt(assetIds[0]), zeroAddress] as const);

      return this.sendTransaction(
        rewardsAbi,
        PrecompileAddress.REWARDS,
        'claimRewards',
        callArgs,
        args,
        eventHandlers,
      );
    } else {
      // Batch claim rewards
      const batchCalls = assetIds.map((assetId) => {
        const callArgs = isEvmAddress(assetId)
          ? ([ZERO_BIG_INT, assetId] as const)
          : ([BigInt(assetId), zeroAddress as EvmAddress] as const);

        return createEvmBatchCall(
          [rewardsAbi[0]],
          PrecompileAddress.REWARDS,
          'claimRewards',
          callArgs,
        );
      });

      return this.sendTransaction(
        BATCH_PRECOMPILE_ABI,
        PrecompileAddress.BATCH,
        'batchAll',
        createEvmBatchCallArgs(batchCalls),
        args,
        eventHandlers,
      );
    }
  };
}
