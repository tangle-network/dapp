import { TxEventHandlers } from '@webb-tools/abstract-api-provider';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { TangleAssetId } from '@webb-tools/tangle-shared-ui/types';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
import isErc20Asset from '@webb-tools/tangle-shared-ui/utils/isErc20Asset';
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
import abi from './abi';
import RewardsTxBase from './base';
import { REWARDS_EVM_ADDRESS } from './constants';

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
    args: { assetId: TangleAssetId },
    eventHandlers?: Partial<TxEventHandlers<{ assetId: TangleAssetId }>>,
  ) => {
    const { assetId } = args;

    return this.sendTransaction(
      abi,
      REWARDS_EVM_ADDRESS,
      'claimRewards',
      isErc20Asset(assetId)
        ? [ZERO_BIG_INT, assetId.Erc20]
        : [assetId.Custom.toBigInt(), zeroAddress],
      { assetId },
      eventHandlers,
    );
  };
}
