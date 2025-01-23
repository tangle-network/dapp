import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/types';
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
  FindAbiArgsOf,
  PrecompileAddress,
  ZERO_ADDRESS,
} from '../../constants/evmPrecompiles';
import {
  convertAddressToBytes32,
  isEvmAddress,
} from '@webb-tools/webb-ui-components';
import createEvmBatchCall from '../../utils/staking/createEvmBatchCall';
import BATCH_PRECOMPILE_ABI from '../../abi/batch';
import createEvmBatchCallArgs from '../../utils/staking/createEvmBatchCallArgs';
import { TxName } from '../../constants';

class RestakeEvmApi extends RestakeApiBase {
  constructor(
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
    try {
      const connector = (() => {
        if (this.provider.state.current === null) return;

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
        return new Error('EVM operation failed');
      }
    } catch (possibleError) {
      return ensureError(possibleError);
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
