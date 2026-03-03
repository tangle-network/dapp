/**
 * GraphQL data hooks for the Envio indexer (v2 EVM).
 */

// Operators
export {
  useOperators,
  useOperatorMap,
  useOperator,
  type Operator,
  type StakingOperatorStatus,
} from './useOperators';

// Delegators
export {
  useDelegator,
  useDelegatorDeposits,
  useDelegatorDelegations,
  useDelegatorWithdrawRequests,
  useDelegatorUndelegateRequests,
  useDelegatorCount,
  type Delegator,
  type DelegatorAssetPosition,
  type DelegationPosition,
  type WithdrawRequest,
  type UndelegateRequest,
  type RequestStatus,
  type LockDuration,
  type BlueprintSelectionMode,
} from './useDelegator';

// Liquid delegation (ERC7540) redeem requests
export {
  useLiquidRedeemRequests,
  type LiquidRedeemRequest,
} from './useLiquidRedeemRequests';

// Protocol staking config assets
export {
  useProtocolStakingAssets,
  useProtocolStakingAssetMap,
  useProtocolStakingAssetIds,
  useStakingAssetConfigs,
  useStakingAssetConfigMap,
  useStakingAssetConfigIds,
  type ProtocolStakingAsset,
  type StakingConfigAsset,
  type StakingAssetConfig,
} from './useProtocolStakingAssets';

// Protocol staking rounds
export {
  useStakingRound,
  useCurrentRoundNumber,
  type StakingRound,
} from './useStakingRound';

// Staking assets with balances
export {
  useStakingAssets,
  useStakingAsset,
  useNativeStakingBalance,
  useSubstrateStakingAssets,
  useNativeBalance,
  type StakingAsset,
  type StakingAssetMap,
  type StakingTokenMetadata,
  type TokenMetadata,
} from './useStakingAssets';

// Protocol Config
export {
  useProtocolConfig,
  useWithdrawalDelay,
  useUndelegateDelay,
  type ProtocolConfig,
  type ProtocolConfigResult,
  type UnsupportedProtocolConfigReason,
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
  AssetKind,
  PERCENT_TO_BASIS_POINTS,
  type ServiceRequestParams,
  type ServiceRequestStatus,
  type ServiceRequestResult,
  type AssetSecurityRequirement,
} from './useServiceRequest';

// Services/Instances
export {
  useServicesByOwner,
  useServicesByOperator,
  useServiceById,
  useAllServices,
  usePendingServiceRequests,
  useServiceRequestsByRequester,
  useApprovedServiceRequests,
  useOperatorActedServiceRequests,
  useOperatorStats,
  useActiveServiceMemberships,
  type Service,
  type ServiceRequest,
  type ServiceStatus,
  type OperatorStatsResult,
} from './useServices';

// Jobs
export {
  useJobsByService,
  useJobResults,
  type JobCall,
  type JobResult,
  type JobStatus,
} from './useJobs';

// Job Submission
export {
  useSubmitJobTx,
  type SubmitJobParams,
  type SubmitJobStatus,
} from './useSubmitJobTx';

// Rewards
export {
  usePendingRewards,
  useRewardTokens,
  usePendingRewardsByToken,
  useRewardHistory,
  useClaimRewardsTx,
  formatRewardAmount,
  type RewardClaimEntry,
  type RewardEntry,
  type PendingRewardsByTokenEntry,
  type PendingRewardsByToken,
  type AggregatedRewards,
  type ClaimRewardsStatus,
  type UseClaimRewardsTxReturn,
} from './useRewards';

// Blueprint Management
export {
  useBlueprintsByOwner,
  useCreateBlueprintTx,
  useUpdateBlueprintTx,
  useTransferBlueprintTx,
  useDeactivateBlueprintTx,
  type OwnedBlueprint,
  type BlueprintDefinition,
  type BlueprintConfig,
  type BlueprintMetadata,
  type BlueprintSource,
  type SupportedMemberships,
  type JobDefinition,
  type PricingModel,
  type MembershipModel,
  type BlueprintSourceKind,
} from './useBlueprintManagement';

// Developer Payments
export {
  DeveloperPaymentsQueryError,
  useDeveloperPayments,
  type DeveloperPaymentsDiagnostics,
  type DeveloperPaymentsSchemaStatus,
  type DeveloperPaymentEvent,
  type DeveloperTokenTotal,
  type DeveloperBlueprintRollup,
  type DeveloperPaymentsData,
} from './useDeveloperPayments';

// Developer Earnings
export {
  useDeveloperEarnings,
  formatEarningsAmount,
  type BlueprintEarnings,
  type EarningEvent,
  type DeveloperEarningsSummary,
} from './useDeveloperEarnings';

// Operator Management
export {
  useOperatorRegistrations,
  useRegisterOperatorTx,
  useUnregisterOperatorTx,
  useUpdateOperatorPreferencesTx,
  type OperatorPreferences,
  type OperatorRegistration,
} from './useOperatorManagement';

// Slashing
export {
  useSlashProposals,
  useProposableServices,
  useDisputeSlashTx,
  useCancelSlashTx,
  useProposeSlashTx,
  useExecuteSlashTx,
  useExecuteSlashBatchTx,
  useExecutableSlashes,
  useSlashProposalDetails,
  formatSlashAmount,
  formatSlashBps,
  toSlashEvidenceBytes32,
  getSlashDeadlineTimeRemainingSeconds,
  getSlashDisputeEligibility,
  isSlashDisputeEligible,
  getSlashExecutionEligibility,
  getSlashActionPermissions,
  buildSlashTimeline,
  SLASH_EXECUTION_BUFFER_SECONDS,
  type ProposableService,
  type SlashProposal,
  type SlashProposerRole,
  type SlashStatus,
  type SlashFilterScope,
  type SlashDisputeEligibility,
  type SlashExecutionEligibility,
  type SlashActionPermissions,
  type SlashTimelineStage,
  type SlashTimelineState,
} from './useSlashing';
