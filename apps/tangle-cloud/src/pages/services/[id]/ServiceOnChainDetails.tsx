/**
 * Component displaying on-chain service details including escrow info,
 * pricing model, and membership configuration.
 */

import { FC } from 'react';
import {
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  Button,
  EMPTY_VALUE_PLACEHOLDER,
  Chip,
} from '@tangle-network/ui-components';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components/utils/formatDisplayAmount';
import {
  useServiceDetails,
  useServiceEscrow,
  useBlueprintConfig,
  useTokenMetadata,
  useBillSubscriptionTx,
  ServicePricingModel,
  ServiceStatus,
  getServicePricingModelLabel,
} from '@tangle-network/tangle-shared-ui/data/services';
import { MembershipModel } from '@tangle-network/tangle-shared-ui/data/services/useServiceRequestDetails';
import BN from 'bn.js';
import { formatTtl, formatCreatedAt } from '../../../types/serviceRequest';
import { useChainId } from 'wagmi';
import { chainsConfig } from '@tangle-network/dapp-config/chains';

interface Props {
  serviceId: bigint;
  blueprintId: bigint | undefined;
  onFundClick: () => void;
}

const ServiceOnChainDetails: FC<Props> = ({
  serviceId,
  blueprintId,
  onFundClick,
}) => {
  const chainId = useChainId();
  const activeChain = chainsConfig[chainId];
  const { data: serviceDetails, isLoading: isLoadingDetails } =
    useServiceDetails(serviceId);
  const { data: escrow, isLoading: isLoadingEscrow } =
    useServiceEscrow(serviceId);
  const { data: blueprintConfig, isLoading: isLoadingConfig } =
    useBlueprintConfig(blueprintId);
  const { data: tokenMetadata, isLoading: isLoadingToken } = useTokenMetadata(
    escrow?.token,
  );
  const {
    execute: executeBillSubscription,
    isPending: isBillingPending,
    isSuccess: isBillingSuccess,
    error: billingError,
    txHash: billingTxHash,
    reset: resetBillingState,
  } = useBillSubscriptionTx();

  const isLoading =
    isLoadingDetails || isLoadingEscrow || isLoadingConfig || isLoadingToken;

  if (isLoading) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Service Details
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonLoader className="h-16" />
          <SkeletonLoader className="h-16" />
          <SkeletonLoader className="h-16" />
          <SkeletonLoader className="h-16" />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonLoader className="h-16" />
          <SkeletonLoader className="h-16" />
          <SkeletonLoader className="h-16" />
          <SkeletonLoader className="h-16" />
        </div>
      </Card>
    );
  }

  const isNativeToken = escrow?.isNativeToken ?? true;
  const tokenSymbol =
    tokenMetadata?.symbol ?? (isNativeToken ? 'ETH' : 'TOKEN');
  const tokenDecimals = tokenMetadata?.decimals ?? 18;
  const explorerBaseUrl = activeChain?.blockExplorers?.default?.url;

  const isSubscriptionService =
    serviceDetails?.pricing === ServicePricingModel.Subscription;
  const subscriptionRate = blueprintConfig?.subscriptionRate ?? BigInt(0);
  const subscriptionInterval = blueprintConfig?.subscriptionInterval ?? BigInt(0);
  const escrowBalance = escrow?.balance ?? BigInt(0);
  const hasSubscriptionConfig =
    subscriptionRate > BigInt(0) && subscriptionInterval > BigInt(0);
  const hasEscrowForNextBill =
    hasSubscriptionConfig && escrowBalance >= subscriptionRate;
  const isServiceActive = serviceDetails?.status === ServiceStatus.Active;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const lastPaymentAt = serviceDetails?.lastPaymentAt ?? BigInt(0);
  const nextBillingAt =
    hasSubscriptionConfig && serviceDetails
      ? lastPaymentAt > BigInt(0)
        ? lastPaymentAt + subscriptionInterval
        : serviceDetails.createdAt
      : null;
  const isBillingDue =
    hasSubscriptionConfig &&
    nextBillingAt !== null &&
    (lastPaymentAt === BigInt(0) || now >= nextBillingAt);
  const canBillSubscription =
    isSubscriptionService &&
    isServiceActive &&
    hasSubscriptionConfig &&
    hasEscrowForNextBill &&
    isBillingDue;

  const handleBillSubscription = async () => {
    if (!executeBillSubscription) {
      return;
    }
    await executeBillSubscription({ serviceId });
  };

  const formatAmount = (amount: bigint | undefined): string => {
    if (amount === undefined) return EMPTY_VALUE_PLACEHOLDER;
    return formatDisplayAmount(
      new BN(amount.toString()),
      tokenDecimals,
      AmountFormatStyle.SHORT,
    );
  };

  const getMembershipLabel = (
    membership: MembershipModel | undefined,
  ): string => {
    if (membership === undefined) return EMPTY_VALUE_PLACEHOLDER;
    return membership === MembershipModel.Fixed ? 'Fixed' : 'Dynamic';
  };

  const getMembershipChipColor = (membership: MembershipModel | undefined) => {
    if (membership === undefined) return 'dark-grey';
    return membership === MembershipModel.Fixed ? 'blue' : 'purple';
  };

  const getPricingChipColor = (pricing: ServicePricingModel | undefined) => {
    if (pricing === undefined) return 'dark-grey';
    switch (pricing) {
      case ServicePricingModel.PayOnce:
        return 'green';
      case ServicePricingModel.Subscription:
        return 'yellow';
      case ServicePricingModel.EventDriven:
        return 'blue';
      default:
        return 'dark-grey';
    }
  };

  const formatSubscriptionRate = (): string => {
    if (!blueprintConfig || blueprintConfig.subscriptionRate === BigInt(0)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    const rate = formatAmount(blueprintConfig.subscriptionRate);
    const intervalSeconds = Number(blueprintConfig.subscriptionInterval);
    const intervalLabel =
      intervalSeconds >= 86400
        ? `${Math.floor(intervalSeconds / 86400)} day(s)`
        : intervalSeconds >= 3600
          ? `${Math.floor(intervalSeconds / 3600)} hour(s)`
          : `${Math.floor(intervalSeconds / 60)} minute(s)`;
    return `${rate} ${tokenSymbol} / ${intervalLabel}`;
  };

  const formatEventRate = (): string => {
    if (!blueprintConfig || blueprintConfig.eventRate === BigInt(0)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    return `${formatAmount(blueprintConfig.eventRate)} ${tokenSymbol} / job`;
  };

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5" fw="bold">
          Service Details
        </Typography>
        <div className="flex items-center gap-2">
          {isSubscriptionService && (
            <>
              <Button variant="secondary" size="sm" onClick={onFundClick}>
                Fund Service
              </Button>
              <Button
                size="sm"
                onClick={handleBillSubscription}
                isLoading={isBillingPending}
                isDisabled={isBillingPending || !canBillSubscription}
              >
                Bill Subscription
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Row 1: TTL, Membership, Pricing, Payment Token */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <DetailItem
          label="TTL / Expiration"
          value={
            serviceDetails?.ttl !== undefined
              ? formatTtl(serviceDetails.ttl)
              : EMPTY_VALUE_PLACEHOLDER
          }
        />
        <DetailItem
          label="Membership"
          value={
            <Chip color={getMembershipChipColor(serviceDetails?.membership)}>
              {getMembershipLabel(serviceDetails?.membership)}
            </Chip>
          }
        />
        <DetailItem
          label="Pricing"
          value={
            <Chip color={getPricingChipColor(serviceDetails?.pricing)}>
              {serviceDetails?.pricing !== undefined
                ? getServicePricingModelLabel(serviceDetails.pricing)
                : EMPTY_VALUE_PLACEHOLDER}
            </Chip>
          }
        />
        <DetailItem
          label="Payment Token"
          value={
            isNativeToken ? (
              <span className="font-semibold">Native ({tokenSymbol})</span>
            ) : (
              <span className="font-semibold" title={escrow?.token}>
                {tokenSymbol}
              </span>
            )
          }
        />
      </div>

      {/* Row 2: Escrow info (only for Subscription pricing) */}
      {serviceDetails?.pricing === ServicePricingModel.Subscription && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <DetailItem
            label="Escrow Balance"
            value={
              <span className="text-green-400 font-semibold">
                {formatAmount(escrow?.balance)} {tokenSymbol}
              </span>
            }
            highlight
          />
          <DetailItem
            label="Total Deposited"
            value={`${formatAmount(escrow?.totalDeposited)} ${tokenSymbol}`}
          />
          <DetailItem
            label="Total Released"
            value={`${formatAmount(escrow?.totalReleased)} ${tokenSymbol}`}
          />
          <DetailItem
            label="Last Payment"
            value={
              serviceDetails?.lastPaymentAt &&
              serviceDetails.lastPaymentAt > BigInt(0)
                ? formatCreatedAt(serviceDetails.lastPaymentAt)
                : 'Never'
            }
          />
        </div>
      )}

      {/* Row 3: Conditional rate info based on pricing model */}
      {isSubscriptionService && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem
            label="Subscription Rate"
            value={formatSubscriptionRate()}
          />
          <DetailItem
            label="Billing Interval"
            value={
              hasSubscriptionConfig
                ? formatTtl(subscriptionInterval)
                : EMPTY_VALUE_PLACEHOLDER
            }
          />
          <DetailItem
            label="Next Bill Eligible At"
            value={
              nextBillingAt !== null
                ? formatCreatedAt(nextBillingAt)
                : EMPTY_VALUE_PLACEHOLDER
            }
          />
          <DetailItem
            label="Billability"
            value={
              <span
                className={
                  canBillSubscription
                    ? 'text-green-400 font-semibold'
                    : 'text-yellow-400 font-semibold'
                }
              >
                {canBillSubscription ? 'Billable now' : 'Not billable yet'}
              </span>
            }
          />
        </div>
      )}

      {serviceDetails?.pricing === ServicePricingModel.EventDriven && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem label="Per Job Rate" value={formatEventRate()} />
        </div>
      )}

      {isSubscriptionService && (
        <div className="mt-4 p-4 rounded-lg bg-mono-20 dark:bg-mono-170">
          <Typography variant="body2" className="text-mono-100">
            Subscription rewards are generated when billing is triggered.
          </Typography>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <BillingCondition
              label="Service is active"
              ok={isServiceActive}
              detail={
                serviceDetails?.status !== undefined
                  ? `Status: ${serviceDetails.status === ServiceStatus.Active ? 'Active' : 'Not Active'}`
                  : null
              }
            />
            <BillingCondition
              label="Subscription config is set"
              ok={hasSubscriptionConfig}
              detail={
                hasSubscriptionConfig
                  ? `${formatAmount(subscriptionRate)} ${tokenSymbol} every ${formatTtl(subscriptionInterval)}`
                  : 'Missing subscription rate or interval'
              }
            />
            <BillingCondition
              label="Escrow can cover next bill"
              ok={hasEscrowForNextBill}
              detail={`${formatAmount(escrowBalance)} / ${formatAmount(subscriptionRate)} ${tokenSymbol}`}
            />
            <BillingCondition
              label="Billing window is due"
              ok={isBillingDue}
              detail={
                nextBillingAt !== null
                  ? `Eligible at ${formatCreatedAt(nextBillingAt)}`
                  : null
              }
            />
          </div>

          {billingError && (
            <div className="mt-3">
              <Typography variant="body2" className="text-red-400">
                Billing failed: {billingError.message}
              </Typography>
            </div>
          )}

          {isBillingSuccess && billingTxHash && (
            <div className="mt-3">
              <Typography variant="body2" className="text-green-400">
                Subscription billed successfully.
              </Typography>
              {explorerBaseUrl ? (
                <a
                  href={`${explorerBaseUrl}/tx/${billingTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline body2 text-green-300"
                >
                  View transaction
                </a>
              ) : (
                <Typography variant="body2" className="font-mono">
                  Tx: {billingTxHash}
                </Typography>
              )}
              <div className="mt-2">
                <Button
                  variant="utility"
                  size="sm"
                  onClick={resetBillingState}
                >
                  Reset Billing State
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

const BillingCondition: FC<{
  label: string;
  ok: boolean;
  detail: string | null;
}> = ({ label, ok, detail }) => (
  <div className="p-2 rounded border border-mono-60 dark:border-mono-140">
    <Typography variant="body2" fw="semibold">
      {label}
    </Typography>
    <Typography
      variant="body2"
      className={ok ? 'text-green-400' : 'text-yellow-400'}
    >
      {ok ? 'Yes' : 'No'}
    </Typography>
    {detail && (
      <Typography variant="body3" className="text-mono-100 mt-1">
        {detail}
      </Typography>
    )}
  </div>
);

const DetailItem: FC<DetailItemProps> = ({ label, value, highlight }) => (
  <div
    className={
      highlight
        ? 'p-3 rounded-lg bg-green-500/10 border border-green-500/20'
        : undefined
    }
  >
    <Typography variant="body2" className="text-mono-100 mb-1">
      {label}
    </Typography>
    {typeof value === 'string' ? (
      <Typography variant="body1" fw="semibold">
        {value}
      </Typography>
    ) : (
      value
    )}
  </div>
);

export default ServiceOnChainDetails;
