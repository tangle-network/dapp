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
  assertEvmAddress,
  isEvmAddress,
  toEvmAddress,
  toSubstrateAddress,
} from '@tangle-network/ui-components';

import { decodeAddress } from '@polkadot/util-crypto';
import createMembershipModelEnum from '@tangle-network/tangle-shared-ui/utils/createMembershipModelEnum';
import { ApiPromise } from '@polkadot/api';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

export type Context = {
  blueprintId: bigint;
  permittedCallers: Array<SubstrateAddress | EvmAddress>;
  operators: SubstrateAddress[];
  requestArgs: PrimitiveField[];
  securityRequirements: Array<{
    minExposurePercent: number;
    maxExposurePercent: number;
  }>;
  assets: RestakeAssetId[];
  ttl: bigint;
  paymentAsset: RestakeAssetId;
  paymentValue: bigint;
  membershipModel: 'Fixed' | 'Dynamic';
  minOperator: number;
  maxOperator: number;
};

const useServicesRegisterTx = () => {
  const { network } = useNetworkStore();

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, context) => {
      // Ensure EVM addresses are converted to their corresponding SS58 representation
      // with the correct Tangle network SS58 prefix for consistency
      const formatAccount = (
        addr: SubstrateAddress | EvmAddress,
      ): SubstrateAddress => {
        return isEvmAddress(addr)
          ? toSubstrateAddress(addr, network.ss58Prefix)
          : toSubstrateAddress(addr, network.ss58Prefix);
      };

      const formattedPermittedCallers =
        context.permittedCallers.map(formatAccount);
      const formattedOperators = context.operators.map(formatAccount);

      const paymentAsset = createAssetIdEnum(context.paymentAsset);

      const membershipModel = createMembershipModelEnum({
        type: context.membershipModel,
        minOperators: context.minOperator,
        maxOperators: context.maxOperator,
      });

      const assetSecurityRequirements = context.assets.map((asset, index) => ({
        asset: createAssetIdEnum(asset),
        minExposurePercent:
          context.securityRequirements[index].minExposurePercent,
        maxExposurePercent:
          context.securityRequirements[index].maxExposurePercent,
      }));

      // Debug log to inspect arguments being sent to services.request
      console.log('services.request substrate args', {
        blueprintId: context.blueprintId.toString(),
        permittedCallers: formattedPermittedCallers,
        operators: formattedOperators,
        requestArgs: context.requestArgs,
        assetSecurityRequirements,
        ttl: context.ttl.toString(),
        paymentAsset,
        paymentValue: context.paymentValue.toString(),
        membershipModel,
      });

      return (api.tx.services.request as any)(
        null, // evm_origin (None)
        context.blueprintId,
        formattedPermittedCallers,
        formattedOperators,
        context.requestArgs,
        assetSecurityRequirements,
        context.ttl,
        paymentAsset,
        context.paymentValue,
        membershipModel,
      );
    },
    [network.ss58Prefix],
  );

  const evmTxFactory: EvmTxFactory<
    typeof SERVICES_PRECOMPILE_ABI,
    'requestService',
    Context & { apiPromise: ApiPromise }
  > = useCallback(
    async (context) => {
      const api = context.apiPromise;

      const decodedPermittedCallers = context.permittedCallers.map((caller) => {
        if (isEvmAddress(caller)) {
          return decodeAddress(toSubstrateAddress(caller, network.ss58Prefix));
        } else {
          return decodeAddress(toSubstrateAddress(caller, network.ss58Prefix));
        }
      });
      const encodedPermittedCallers: Hash = api
        .createType('Vec<AccountId>', decodedPermittedCallers)
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

      const decodedOperators = context.operators.map((operator) => {
        if (isEvmAddress(operator)) {
          return decodeAddress(
            toSubstrateAddress(operator, network.ss58Prefix),
          );
        } else {
          return decodeAddress(
            toSubstrateAddress(operator, network.ss58Prefix),
          );
        }
      });
      const encodedOperators = api
        .createType('Vec<AccountId>', decodedOperators)
        .toHex();

      const encodedRequestArgs: Hash = api
        .createType('Vec<TanglePrimitivesServicesField>', context.requestArgs)
        .toHex();

      const isEvmAssetPayment = isEvmAddress(context.paymentAsset);

      const [paymentAssetId, paymentTokenAddress] = isEvmAssetPayment
        ? [BigInt(0), toEvmAddress(context.paymentAsset as EvmAddress)]
        : [
            BigInt(context.paymentAsset),
            toEvmAddress(assertEvmAddress(zeroAddress)),
          ];

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
    [network.ss58Prefix],
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

export default useServicesRegisterTx;
