/**
 * Service detail page - view service info and submit jobs.
 */

import { FC, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import { ArrowLeft } from '@tangle-network/icons';
import {
  useServicesByOwner,
  useServicesByOperator,
  useBlueprintDetails,
  useJobsByService,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import { twMerge } from 'tailwind-merge';
import { JobSubmissionForm } from './JobSubmissionForm';
import { JobHistoryTable } from './JobHistoryTable';

const ServiceDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const {
    isOperator,
    operatorAddress,
    isLoading: isLoadingOperatorInfo,
  } = useEvmOperatorInfo();

  const serviceId = useMemo(() => {
    if (!id) return undefined;
    try {
      return BigInt(id);
    } catch {
      return undefined;
    }
  }, [id]);

  // Fetch services owned by user
  const { data: ownedServices, isLoading: isLoadingOwned } =
    useServicesByOwner(address);

  // Fetch services where user is an operator
  const { data: operatorServices, isLoading: isLoadingOperator } =
    useServicesByOperator(
      isOperator ? (operatorAddress ?? undefined) : undefined,
    );

  const isLoadingServices =
    isLoadingOwned || isLoadingOperator || isLoadingOperatorInfo;

  const service = useMemo(() => {
    if (serviceId === undefined) return null;

    // Check owned services first
    const owned = ownedServices?.find((s) => s.serviceId === serviceId);
    if (owned) return owned;

    // Then check operator services
    const operated = operatorServices?.find((s) => s.serviceId === serviceId);
    if (operated) return operated;

    return null;
  }, [ownedServices, operatorServices, serviceId]);

  // Fetch blueprint details for job definitions
  const { result: blueprintResult, isLoading: isLoadingBlueprint } =
    useBlueprintDetails(service?.blueprintId);

  // Fetch job history
  const { data: jobs, isLoading: isLoadingJobs } = useJobsByService(serviceId);

  const isLoading = isLoadingServices || isLoadingBlueprint;

  if (serviceId === undefined) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Invalid Service ID</Typography>
        <Button onClick={() => navigate('/instances')} className="mt-4">
          Back to Instances
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-12 w-64" />
        <SkeletonLoader className="h-48" />
        <SkeletonLoader className="h-64" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Service Not Found</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          This service may not exist or you may not have access to it.
        </Typography>
        <Button onClick={() => navigate('/instances')} className="mt-4">
          Back to Instances
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="utility"
          isJustIcon
          onClick={() => navigate('/instances')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <Typography variant="h4" fw="bold">
            Service #{serviceId.toString()}
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            {blueprintResult?.details.name ?? 'Loading...'}
          </Typography>
        </div>
      </div>

      {/* Service Info Card */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Service Information
        </Typography>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem
            label="Status"
            value={
              <span
                className={twMerge(
                  'px-2 py-1 rounded text-sm',
                  service.status === 'ACTIVE'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-mono-100/20 text-mono-100',
                )}
              >
                {service.status}
              </span>
            }
          />
          <InfoItem
            label="Blueprint"
            value={blueprintResult?.details.name ?? EMPTY_VALUE_PLACEHOLDER}
          />
          <InfoItem
            label="Operators"
            value={
              service.operators?.length?.toString() ?? EMPTY_VALUE_PLACEHOLDER
            }
          />
          <InfoItem
            label="Created"
            value={
              service.createdAt
                ? new Date(
                    Number(service.createdAt) * 1000,
                  ).toLocaleDateString()
                : EMPTY_VALUE_PLACEHOLDER
            }
          />
        </div>
      </Card>

      {/* Job Submission */}
      {service.status === 'ACTIVE' && blueprintResult?.details && (
        <Card variant={CardVariant.GLASS} className="p-6">
          <Typography variant="h5" fw="bold" className="mb-4">
            Submit Job
          </Typography>
          <JobSubmissionForm
            serviceId={serviceId}
            blueprint={blueprintResult.details}
          />
        </Card>
      )}

      {/* Job History */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Job History
        </Typography>
        <JobHistoryTable jobs={jobs ?? []} isLoading={isLoadingJobs} />
      </Card>
    </div>
  );
};

const InfoItem: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
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

export default ServiceDetailPage;
