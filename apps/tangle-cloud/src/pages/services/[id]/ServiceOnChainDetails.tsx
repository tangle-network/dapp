/**
 * Component displaying on-chain service details including escrow info,
 * pricing model, and membership configuration.
 */

import { type ComponentProps, type FC, type ReactNode, useState } from 'react';
import {
  Button as SandboxButton,
  Card,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  Money,
  StatusPill,
  formatMoney,
  statusToneFor,
} from '../../../components/chrome';
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
  const [now] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

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
  const moneyOptions = {
    decimals: tokenDecimals,
    symbol: tokenSymbol,
  };
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

  const renderMoney = (
    amount: bigint | null | undefined,
    suffix?: ReactNode,
  ): ReactNode => {
    if (amount === null || amount === undefined) {
      return EMPTY_VALUE_PLACEHOLDER;
    }

    return (
      <span className="inline-flex flex-wrap items-baseline gap-1.5">
        <Money value={amount} options={moneyOptions} align="left" />
        {suffix !== undefined && (
          <span className="text-mono-120 dark:text-mono-100 text-xs">
            {suffix}
          </span>
        )}
      </span>
    );
  };

  const formatAmountForDetail = (amount: bigint | undefined): string => {
    if (amount === undefined) return EMPTY_VALUE_PLACEHOLDER;
    const view = formatMoney(amount, moneyOptions);
    return `${view.full} ${view.symbol}`.trim();
  };

  const getMembershipLabel = (
    membership: MembershipModel | undefined,
  ): string => {
    if (membership === undefined) return EMPTY_VALUE_PLACEHOLDER;
    return membership === MembershipModel.Fixed ? 'Fixed' : 'Dynamic';
  };

  const getPricingLabel = (
    pricing: ServicePricingModel | undefined,
  ): string => {
    if (pricing === undefined) return EMPTY_VALUE_PLACEHOLDER;
    return getServicePricingModelLabel(pricing);
  };

  const formatSubscriptionRate = (): ReactNode => {
    if (!blueprintConfig || blueprintConfig.subscriptionRate === BigInt(0)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    const intervalSeconds = Number(blueprintConfig.subscriptionInterval);
    const intervalLabel =
      intervalSeconds >= 86400
        ? `${Math.floor(intervalSeconds / 86400)} day(s)`
        : intervalSeconds >= 3600
          ? `${Math.floor(intervalSeconds / 3600)} hour(s)`
          : `${Math.floor(intervalSeconds / 60)} minute(s)`;
    return renderMoney(blueprintConfig.subscriptionRate, `/ ${intervalLabel}`);
  };

  const formatEventRate = (): ReactNode => {
    if (!blueprintConfig || blueprintConfig.eventRate === BigInt(0)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    return renderMoney(blueprintConfig.eventRate, '/ job');
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
            <StatusPill
              tone={statusToneFor(
                'membership',
                getMembershipLabel(serviceDetails?.membership),
              )}
            >
              {getMembershipLabel(serviceDetails?.membership)}
            </StatusPill>
          }
        />
        <DetailItem
          label="Pricing"
          value={
            <StatusPill
              tone={statusToneFor(
                'payment',
                getPricingLabel(serviceDetails?.pricing),
              )}
            >
              {getPricingLabel(serviceDetails?.pricing)}
            </StatusPill>
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
            value={renderMoney(escrow?.balance)}
            highlight
          />
          <DetailItem
            label="Total Deposited"
            value={renderMoney(escrow?.totalDeposited)}
          />
          <DetailItem
            label="Total Released"
            value={renderMoney(escrow?.totalReleased)}
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
              <StatusPill tone={canBillSubscription ? 'success' : 'warning'}>
                {canBillSubscription ? 'Billable now' : 'Not billable yet'}
              </StatusPill>
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
        <div className="mt-4 p-4 rounded-lg bg-mono-20/50 dark:bg-mono-190/50">
          <Text variant="body2" className="text-mono-120 dark:text-mono-100">
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
                  ? renderMoney(
                      subscriptionRate,
                      `every ${formatTtl(subscriptionInterval)}`,
                    )
                  : 'Missing subscription rate or interval'
              }
            />
            <BillingCondition
              label="Escrow can cover next bill"
              ok={hasEscrowForNextBill}
              detail={`${formatAmountForDetail(
                escrowBalance,
              )} / ${formatAmountForDetail(subscriptionRate)}`}
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
              <StatusPill tone="success">Subscription billed</StatusPill>
              {explorerBaseUrl ? (
                <a
                  href={`${explorerBaseUrl}/tx/${billingTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="body2 mt-2 inline-flex underline text-mono-120 dark:text-mono-100 hover:text-mono-200 dark:text-mono-0"
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
  detail: ReactNode | null;
}> = ({ label, ok, detail }) => (
  <div className="p-2 rounded border border-mono-60 dark:border-mono-170">
    <Text variant="body2" fw="semibold">
      {label}
    </Text>
    <StatusPill tone={ok ? 'success' : 'warning'}>
      {ok ? 'Yes' : 'No'}
    </StatusPill>
    {detail && (
      <Text variant="body3" className="mt-1 text-mono-120 dark:text-mono-100">
        {detail}
      </Text>
    )}
  </div>
);

const DetailItem: FC<DetailItemProps> = ({ label, value, highlight }) => (
  <div
    className={
      highlight
        ? 'rounded-lg border border-[color:var(--border-accent)] bg-[var(--accent-surface-soft)] p-3'
        : undefined
    }
  >
    <Text variant="body2" className="text-mono-120 dark:text-mono-100 mb-1">
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
