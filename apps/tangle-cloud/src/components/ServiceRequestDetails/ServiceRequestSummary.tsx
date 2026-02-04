import { FC } from 'react';
import { Address } from 'viem';
import { Divider } from '@tangle-network/ui-components';
import type {
  ServiceRequestContractDetails,
  AssetSecurityRequirement,
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
    contractDetails?.securityRequirements ?? [];
  const hasSecurityRequirements = securityRequirements.length > 0;

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
