/**
 * GraphQL data hooks for the Envio indexer (v2 EVM).
 * These replace the Substrate-based RxJS hooks.
 */

// Operators
export {
  useOperators,
  useOperatorMap,
  useOperator,
  type Operator,
  type RestakingOperatorStatus,
} from './useOperators';

// Delegators
export {
  useDelegator,
  useDelegatorDeposits,
  useDelegatorDelegations,
  useDelegatorWithdrawRequests,
  useDelegatorUnstakeRequests,
  type Delegator,
  type DelegatorAssetPosition,
  type DelegationPosition,
  type WithdrawRequest,
  type UnstakeRequest,
  type RequestStatus,
  type LockDuration,
  type BlueprintSelectionMode,
} from './useDelegator';

// Restaking Assets
export {
  useRestakingAssets,
  useRestakingAssetMap,
  useRestakingAssetIds,
  type RestakingAsset,
} from './useRestakingAssets';

// Restaking Rounds
export {
  useRestakingRound,
  useCurrentRoundNumber,
  type RestakingRound,
} from './useRestakingRound';

// Restake Assets with balances
export {
  useRestakeAssets,
  useRestakeAsset,
  useNativeBalance,
  type RestakeAsset,
  type RestakeAssetMap,
  type TokenMetadata,
} from './useRestakeAssets';

// Protocol Config
export {
  useProtocolConfig,
  useWithdrawalDelay,
  useUnstakeDelay,
  type ProtocolConfig,
} from './useProtocolConfig';

// Blueprints
export {
  useBlueprints,
  useBlueprintsWithMetadata,
  useBlueprintMap,
  useBlueprint,
  useAllBlueprints,
  useBlueprintDetails,
  type Blueprint,
  type BlueprintWithMetadata,
  type BlueprintOperator,
  type BlueprintDetailsResult,
  type UseAllBlueprintsReturn,
} from './useBlueprints';

// Service Requests
export {
  useServiceRequestTx,
  encodeServiceConfig,
  type ServiceRequestParams,
  type ServiceRequestStatus,
  type ServiceRequestResult,
} from './useServiceRequest';

// Services/Instances
export {
  useServicesByOwner,
  useServicesByOperator,
  usePendingServiceRequests,
  useOperatorStats,
  type Service,
  type ServiceRequest,
  type ServiceStatus,
} from './useServices';
