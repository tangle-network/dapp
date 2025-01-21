import { RestakeAssetId } from '@webb-tools/tangle-shared-ui/utils/createRestakeAssetId';
import {
  Abi as ViemAbi,
  Account,
  ContractFunctionArgs,
  ContractFunctionName,
  Hash,
  SimulateContractParameters,
} from 'viem';
import RestakeApiBase from './RestakeAbiBase';
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

class RestakeEvmApi extends RestakeApiBase {
  constructor(
    readonly activeAccount: EvmAddress,
    readonly signer: Account | EvmAddress,
    readonly provider: Config,
  ) {
    super();
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
}

export default RestakeEvmApi;
