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
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import {
  useServiceDetails,
  useServiceEscrow,
  useBlueprintConfig,
  useTokenMetadata,
  ServicePricingModel,
  getServicePricingModelLabel,
} from '@tangle-network/tangle-shared-ui/data/services';
import { MembershipModel } from '@tangle-network/tangle-shared-ui/data/services/useServiceRequestDetails';
import { formatUnits } from 'viem';
import { formatTtl, formatCreatedAt } from '../../../types/serviceRequest';

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
  const { data: serviceDetails, isLoading: isLoadingDetails } =
    useServiceDetails(serviceId);
  const { data: escrow, isLoading: isLoadingEscrow } =
    useServiceEscrow(serviceId);
  const { data: blueprintConfig, isLoading: isLoadingConfig } =
    useBlueprintConfig(blueprintId);
  const { data: tokenMetadata, isLoading: isLoadingToken } = useTokenMetadata(
    escrow?.token,
  );

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
  const tokenSymbol = tokenMetadata?.symbol ?? (isNativeToken ? 'ETH' : 'TOKEN');
  const tokenDecimals = tokenMetadata?.decimals ?? 18;

  const formatAmount = (amount: bigint | undefined): string => {
    if (amount === undefined) return EMPTY_VALUE_PLACEHOLDER;
    const formatted = parseFloat(formatUnits(amount, tokenDecimals));
    return addCommasToNumber(formatted.toFixed(4));
  };

  const getMembershipLabel = (membership: MembershipModel | undefined): string => {
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
        <Button variant="secondary" size="sm" onClick={onFundClick}>
          Fund Service
        </Button>
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

      {/* Row 2: Escrow Balance, Total Deposited, Total Released, Last Payment */}
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
            serviceDetails?.lastPaymentAt && serviceDetails.lastPaymentAt > BigInt(0)
              ? formatCreatedAt(serviceDetails.lastPaymentAt)
              : 'Never'
          }
        />
      </div>

      {/* Row 3: Conditional rate info based on pricing model */}
      {serviceDetails?.pricing === ServicePricingModel.Subscription && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem label="Subscription Rate" value={formatSubscriptionRate()} />
        </div>
      )}

      {serviceDetails?.pricing === ServicePricingModel.EventDriven && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem label="Per Job Rate" value={formatEventRate()} />
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
