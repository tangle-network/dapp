/**
 * Component displaying on-chain service details including escrow info,
 * pricing model, and membership configuration.
 */

import { type ComponentProps, type FC, type ReactNode } from 'react';
import {
  Badge,
  Button as SandboxButton,
  Card,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { Text } from '../../../components/sandbox/SandboxUi';
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
import { formatTtl, formatCreatedAt } from '../../../types/serviceRequest';
import { useChainId } from 'wagmi';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import { formatUnits } from 'viem';

interface Props {
  serviceId: bigint;
  blueprintId: bigint | undefined;
  onFundClick: () => void;
}

const EMPTY_VALUE_PLACEHOLDER = '-';
const CARD_SURFACE = 'sandbox' as const;

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  />
);

const Chip: FC<{ color?: string; children: ReactNode }> = ({
  color,
  children,
}) => {
  const variant =
    color === 'green' ? 'success' : color === 'red' ? 'destructive' : 'outline';

  return <Badge variant={variant}>{children}</Badge>;
};

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
      <Card variant={CARD_SURFACE} className="p-6">
        <Text variant="h5" fw="bold" className="mb-4">
          Service Details
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
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
  const subscriptionInterval =
    blueprintConfig?.subscriptionInterval ?? BigInt(0);
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
    const formatted = Number(formatUnits(amount, tokenDecimals));
    return Number.isFinite(formatted)
      ? formatted.toLocaleString(undefined, { maximumFractionDigits: 4 })
      : formatUnits(amount, tokenDecimals);
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
    <Card variant={CARD_SURFACE} className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Text variant="h5" fw="bold">
          Service Details
        </Text>
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
        <div className="mt-4 p-4 rounded-lg bg-muted/40">
          <Text variant="body2" className="text-muted-foreground">
            Subscription rewards are generated when billing is triggered.
          </Text>

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
              <Text variant="body2" className="text-red-400">
                Billing failed: {billingError.message}
              </Text>
            </div>
          )}

          {isBillingSuccess && billingTxHash && (
            <div className="mt-3">
              <Text variant="body2" className="text-green-400">
                Subscription billed successfully.
              </Text>
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
                <Text variant="body2" className="font-mono">
                  Tx: {billingTxHash}
                </Text>
              )}
              <div className="mt-2">
                <Button variant="utility" size="sm" onClick={resetBillingState}>
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
  value: ReactNode;
  highlight?: boolean;
}

const BillingCondition: FC<{
  label: string;
  ok: boolean;
  detail: string | null;
}> = ({ label, ok, detail }) => (
  <div className="p-2 rounded border border-border">
    <Text variant="body2" fw="semibold">
      {label}
    </Text>
    <Text variant="body2" className={ok ? 'text-green-400' : 'text-yellow-400'}>
      {ok ? 'Yes' : 'No'}
    </Text>
    {detail && (
      <Text variant="body3" className="text-muted-foreground mt-1">
        {detail}
      </Text>
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
    <Text variant="body2" className="text-muted-foreground mb-1">
      {label}
    </Text>
    {typeof value === 'string' ? (
      <Text variant="body1" fw="semibold">
        {value}
      </Text>
    ) : (
      value
    )}
  </div>
);

export default ServiceOnChainDetails;
