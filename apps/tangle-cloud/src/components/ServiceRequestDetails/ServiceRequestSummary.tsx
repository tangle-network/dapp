import { FC } from 'react';
import { Address } from 'viem';
import { Typography } from '@tangle-network/ui-components';
import { Divider } from '@tangle-network/ui-components';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import type {
  ServiceRequestContractDetails,
  AssetSecurityRequirement,
  ServiceRequestVariant,
} from '@tangle-network/tangle-shared-ui/data/services';
import PaymentTermsSection from './PaymentTermsSection';
import CommitmentSection from './CommitmentSection';
import OperatorStatusSection from './OperatorStatusSection';
import SecurityRequirementsSection from './SecurityRequirementsSection';

type Props = {
  contractDetails: ServiceRequestContractDetails | null | undefined;
  tokenSymbol: string;
  tokenDecimals: number;
  operatorCandidates: Address[];
  approvedOperators: Address[];
  rejectedOperators: Address[];
  currentOperator: Address | undefined;
  isLoading: boolean;
};

const formatRequestVariantLabel = (variant: ServiceRequestVariant): string => {
  switch (variant) {
    case 'basic':
      return 'Basic';
    case 'exposure':
      return 'With Exposure';
    case 'security':
      return 'With Security';
    default:
      return 'Unknown';
  }
};

const formatBpsAsPercent = (bps: number): string => {
  return `${(bps / 100).toFixed(2)}%`;
};

type OperatorExposure = {
  operatorLabel: string;
  exposureBps: number;
};

const ServiceRequestSummary: FC<Props> = ({
  contractDetails,
  tokenSymbol,
  tokenDecimals,
  operatorCandidates,
  approvedOperators,
  rejectedOperators,
  currentOperator,
  isLoading,
}) => {
  const securityRequirements: AssetSecurityRequirement[] =
    contractDetails?.customSecurityRequirements ??
    contractDetails?.securityRequirements ??
    [];
  const hasSecurityRequirements = securityRequirements.length > 0;
  const requestVariant = contractDetails?.requestVariant ?? 'unknown';
  const requestedExposureBps = contractDetails?.requestedExposureBps ?? null;
  const requestedOperators = contractDetails?.requestedOperators ?? null;
  const defaultTntRequirement = contractDetails?.defaultTntRequirement ?? null;
  const hasExposureValues =
    requestVariant === 'exposure' &&
    Array.isArray(requestedExposureBps) &&
    requestedExposureBps.length > 0;
  const exposureRows: OperatorExposure[] = hasExposureValues
    ? requestedExposureBps.map((exposureBps, index) => ({
        operatorLabel: requestedOperators?.[index]
          ? shortenString(requestedOperators[index], 8)
          : operatorCandidates[index]
            ? shortenString(operatorCandidates[index], 8)
            : `Operator #${index + 1}`,
        exposureBps,
      }))
    : [];

  return (
    <div className="space-y-4 mt-4 p-4 rounded-lg bg-mono-0 dark:bg-mono-190 border border-mono-40 dark:border-mono-160">
      <PaymentTermsSection
        paymentToken={contractDetails?.paymentToken}
        paymentAmount={contractDetails?.paymentAmount}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
        isLoading={isLoading}
      />

      <Divider />

      <CommitmentSection
        ttl={contractDetails?.ttl}
        createdAt={contractDetails?.createdAt}
        membership={contractDetails?.membership}
        minOperators={contractDetails?.minOperators}
        maxOperators={contractDetails?.maxOperators}
        totalOperators={operatorCandidates.length}
        isLoading={isLoading}
      />

      <Divider />

      <div className="space-y-2">
        <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
          Request Variant
        </Typography>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-mono-140 dark:text-mono-80">
              Mode:
            </span>
            <span className="text-sm font-semibold">
              {formatRequestVariantLabel(requestVariant)}
            </span>
          </div>

          {hasExposureValues && (
            <div className="space-y-1">
              <span className="text-sm text-mono-140 dark:text-mono-80">
                Per-Operator Exposure (%):
              </span>
              <div className="space-y-1">
                {exposureRows.map((entry, index) => (
                  <div
                    key={`${index}-${entry.operatorLabel}-${entry.exposureBps}`}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-mono-140 dark:text-mono-80">
                      {entry.operatorLabel}
                    </span>
                    <span className="font-semibold">
                      {formatBpsAsPercent(entry.exposureBps)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {defaultTntRequirement && (
            <div className="flex items-start gap-2">
              <span className="text-sm text-mono-140 dark:text-mono-80">
                Default TNT Requirement:
              </span>
              <span className="text-sm font-semibold">
                {formatBpsAsPercent(defaultTntRequirement.minExposureBps)} -
                {' '}
                {formatBpsAsPercent(defaultTntRequirement.maxExposureBps)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className="text-sm text-mono-140 dark:text-mono-80">
              Meaning:
            </span>
            <span className="text-sm font-semibold">
              {requestVariant === 'basic' &&
                'Uses default 100% operator exposure.'}
              {requestVariant === 'exposure' &&
                'Each operator has its own exposure percent (bps) while default TNT security requirements still apply.'}
              {requestVariant === 'security' &&
                'Operators must satisfy per-asset exposure bounds before approval.'}
              {requestVariant === 'unknown' &&
                'Variant could not be resolved from on-chain calldata.'}
            </span>
          </div>
        </div>
      </div>

      <Divider />

      <OperatorStatusSection
        operatorCandidates={operatorCandidates}
        approvedOperators={approvedOperators}
        rejectedOperators={rejectedOperators}
        approvalCount={contractDetails?.approvalCount ?? 0}
        currentOperator={currentOperator}
        isLoading={isLoading}
      />

      {hasSecurityRequirements && (
        <>
          <Divider />

          <SecurityRequirementsSection
            securityRequirements={securityRequirements}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default ServiceRequestSummary;
