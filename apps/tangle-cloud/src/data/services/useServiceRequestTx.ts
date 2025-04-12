import createAssetIdEnum from '@tangle-network/tangle-shared-ui/utils/createAssetIdEnum';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import SERVICES_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/services';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { PrimitiveField } from '@tangle-network/tangle-shared-ui/types/blueprint';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { Hash, zeroAddress } from 'viem';
import {
  convertAddressToBytes32,
  isEvmAddress,
  toEvmAddress,
} from '@tangle-network/ui-components';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

export type Context = {
  blueprintId: bigint;
  permittedCallers: Array<SubstrateAddress | EvmAddress>;
  operators: Array<SubstrateAddress>;
  requestArgs: PrimitiveField[];
  securityRequirements: Array<{
    minExposurePercent: number;
    maxExposurePercent: number;
  }>;
  assets: RestakeAssetId[];
  ttl: bigint;
  paymentAsset: string;
  paymentValue: bigint;
  membershipModel: 'Fixed' | 'Dynamic';
  minOperator: number;
  maxOperator: number;
};

const useServiceRegisterTx = () => {
  const wsRpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, activeSubstrateAddress, context) => {
      const membershipModel =
        context.membershipModel === 'Fixed'
          ? {
              Fixed: {
                minOperators: context.minOperator,
              },
            }
          : {
              Dynamic: {
                minOperators: context.minOperator,
                maxOperators: context.maxOperator,
              },
            };

      const paymentAsset = createAssetIdEnum(context.paymentAsset);

      const assetSecurityRequirements = context.assets.map((asset, index) => ({
        asset: createAssetIdEnum(asset),
        minExposurePercent:
          context.securityRequirements[index].minExposurePercent,
        maxExposurePercent:
          context.securityRequirements[index].maxExposurePercent,
      }));

      return api.tx.services.request(
        isEvmAddress(context.paymentAsset)
          ? toEvmAddress(activeSubstrateAddress)
          : null,
        context.blueprintId,
        context.permittedCallers,
        context.operators,
        context.requestArgs,
        assetSecurityRequirements,
        context.ttl,
        paymentAsset,
        context.paymentValue,
        membershipModel,
      );
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof SERVICES_PRECOMPILE_ABI,
    'requestService',
    Context
  > = useCallback(
    async (context) => {
      const api = await getApiPromise(wsRpcEndpoint);

      const encodedPermittedCallers: Hash = api
        .createType(
          'Vec<AccountId>',
          context.permittedCallers.map((caller) => {
            if (isEvmAddress(caller)) {
              return convertAddressToBytes32(caller);
            } else {
              return caller;
            }
          }),
        )
        .toHex();

      const encodedAssetSecurityRequirements: Hash[] = context.assets.map(
        (asset, index) =>
          api
            .createType('AssetSecurityRequirement', {
              asset: createAssetIdEnum(asset),
              minExposurePercent:
                context.securityRequirements[index].minExposurePercent,
              maxExposurePercent:
                context.securityRequirements[index].maxExposurePercent,
            })
            .toHex(),
      );

      const encodedOperators: Hash = api
        .createType(
          'Vec<AccountId>',
          context.operators.map((operator) => {
            if (isEvmAddress(operator)) {
              return convertAddressToBytes32(operator);
            } else {
              return operator;
            }
          }),
        )
        .toHex();

      const encodedRequestArgs: Hash = api
        .createType('Vec<TanglePrimitivesServicesField>', context.requestArgs)
        .toHex();

      const isEvmAssetPayment = isEvmAddress(context.paymentAsset);

      const [paymentAssetId, paymentTokenAddress] = isEvmAssetPayment
        ? [BigInt(0), toEvmAddress(context.paymentAsset)]
        : [BigInt(context.paymentAsset), toEvmAddress(zeroAddress)];

      return {
        functionName: 'requestService',
        arguments: [
          context.blueprintId,
          encodedAssetSecurityRequirements,
          encodedPermittedCallers,
          encodedOperators,
          encodedRequestArgs,
          context.ttl,
          paymentAssetId,
          paymentTokenAddress,
          context.paymentValue,
          context.minOperator,
          context.maxOperator,
        ],
      };
    },
    [wsRpcEndpoint],
  );

  return useAgnosticTx({
    name: TxName.DEPLOY_BLUEPRINT,
    abi: SERVICES_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.SERVICES,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useServiceRegisterTx;
