import { FC } from 'react';
import { Address } from 'viem';
import type {
  ServiceRequestContractDetails,
  AssetSecurityRequirement,
} from '@tangle-network/tangle-shared-ui/data/services';
import PaymentTermsSection from './PaymentTermsSection';
import CommitmentSection from './CommitmentSection';
import OperatorStatusSection from './OperatorStatusSection';
import SecurityRequirementsSection from './SecurityRequirementsSection';

const Divider = () => <div className="h-px w-full bg-border" />;

type Props = {
  contractDetails: ServiceRequestContractDetails | null | undefined;
  tokenSymbol: string;
  tokenDecimals: number;
  operatorCandidates: Address[];
  approvedOperators: Address[];
  rejectedOperators: Address[];
  currentOperator: Address | undefined;
  isLoading: boolean;
  blueprintId?: bigint;
  blueprintName?: string;
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
  blueprintId,
  blueprintName,
}) => {
  const securityRequirements: AssetSecurityRequirement[] =
    contractDetails?.customSecurityRequirements ??
    contractDetails?.securityRequirements ??
    [];
  const hasSecurityRequirements = securityRequirements.length > 0;

  return (
    <div className="space-y-4 mt-4 p-4 rounded-lg bg-card border border-border">
      <CommitmentSection
        ttl={contractDetails?.ttl}
        createdAt={contractDetails?.createdAt}
        membership={contractDetails?.membership}
        minOperators={contractDetails?.minOperators}
        maxOperators={contractDetails?.maxOperators}
        totalOperators={operatorCandidates.length}
        requestVariant={contractDetails?.requestVariant ?? 'unknown'}
        requestedExposureBps={contractDetails?.requestedExposureBps ?? null}
        requestedOperators={contractDetails?.requestedOperators ?? null}
        operatorCandidates={operatorCandidates}
        isLoading={isLoading}
        blueprintId={blueprintId}
        blueprintName={blueprintName}
        currentOperator={currentOperator}
      />

      <Divider />

      <PaymentTermsSection
        paymentToken={contractDetails?.paymentToken}
        paymentAmount={contractDetails?.paymentAmount}
        tokenSymbol={tokenSymbol}
        tokenDecimals={tokenDecimals}
        isLoading={isLoading}
      />

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
