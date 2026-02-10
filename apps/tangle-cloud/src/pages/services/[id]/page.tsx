/**
 * Service detail page - view service info and submit jobs.
 */

import { FC, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import {
  ArrowLeft,
  ExternalLinkLine,
  ShieldKeyholeLineIcon,
} from '@tangle-network/icons';
import {
  useServiceById,
  useBlueprintDetails,
  useJobsByService,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useServiceDetails,
  useIsPermittedCaller,
  useIsServiceOperator,
  MembershipModel,
} from '@tangle-network/tangle-shared-ui/data/services';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import { twMerge } from 'tailwind-merge';
import { JobSubmissionForm } from './JobSubmissionForm';
import { JobHistoryTable } from './JobHistoryTable';
import ServiceOnChainDetails from './ServiceOnChainDetails';
import FundServiceModal from './FundServiceModal';
import OperatorMembershipPanel from './OperatorMembershipPanel';
import OperatorExitPanel from './OperatorExitPanel';
import { PagePath } from '../../../types';

const ServiceDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const serviceId = useMemo(() => {
    if (!id) return undefined;
    try {
      return BigInt(id);
    } catch {
      return undefined;
    }
  }, [id]);

  // Fetch service by ID (visible to all users)
  const { data: service, isLoading: isLoadingServices } =
    useServiceById(serviceId);

  // Fetch on-chain service details to get owner
  const { data: onChainDetails, isLoading: isLoadingOnChainDetails } =
    useServiceDetails(serviceId);

  // Fetch blueprint details for job definitions
  const { result: blueprintResult, isLoading: isLoadingBlueprint } =
    useBlueprintDetails(service?.blueprintId);

  // Fetch job history
  const { data: jobs, isLoading: isLoadingJobs } = useJobsByService(serviceId);

  // Check if user is permitted to submit jobs
  const { data: isPermittedCaller, isLoading: isLoadingPermission } =
    useIsPermittedCaller(serviceId, address);

  // Check if current user is a service operator
  const { data: isServiceOperator } = useIsServiceOperator(
    serviceId,
    operatorAddress ?? undefined,
    { enabled: !!operatorAddress && isOperator },
  );

  // Determine if user is the owner
  const isOwner = useMemo(() => {
    if (!address || !onChainDetails?.owner) return false;
    return onChainDetails.owner.toLowerCase() === address.toLowerCase();
  }, [address, onChainDetails?.owner]);

  // User can submit jobs if they are the owner or a permitted caller
  const canSubmitJobs = isOwner || isPermittedCaller;

  // Check if this is a dynamic membership service
  const isDynamicService =
    onChainDetails?.membership === MembershipModel.Dynamic;

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
          This service does not exist or may have been removed.
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
            value={
              blueprintResult?.details.name ? (
                <Link
                  to={PagePath.BLUEPRINTS_DETAILS.replace(
                    ':id',
                    service.blueprintId.toString(),
                  )}
                  className="inline-flex items-center gap-1 text-blue-50 hover:text-blue-40 transition-colors"
                >
                  <Typography variant="body1" fw="semibold">
                    {blueprintResult.details.name}
                  </Typography>

                  <ExternalLinkLine className="w-4 h-4" />
                </Link>
              ) : (
                EMPTY_VALUE_PLACEHOLDER
              )
            }
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

      {/* On-Chain Service Details */}
      <ServiceOnChainDetails
        serviceId={serviceId}
        blueprintId={
          service.blueprintId !== undefined
            ? BigInt(service.blueprintId)
            : undefined
        }
        onFundClick={() => setIsFundModalOpen(true)}
      />

      {/* Operator Membership Panel - Show for Dynamic services */}
      {isDynamicService && service.status === 'ACTIVE' && (
        <OperatorMembershipPanel
          serviceId={serviceId}
          isCurrentUserOperator={isServiceOperator ?? false}
          serviceDetails={onChainDetails}
        />
      )}

      {/* Operator Exit Panel - Show for operators in Dynamic services */}
      {isDynamicService &&
        service.status === 'ACTIVE' &&
        isServiceOperator &&
        operatorAddress && (
          <OperatorExitPanel
            serviceId={serviceId}
            operatorAddress={operatorAddress}
            isOwner={isOwner}
          />
        )}

      {/* Job Submission */}
      {service.status === 'ACTIVE' && blueprintResult?.details && (
        <Card variant={CardVariant.GLASS} className="p-6">
          <Typography variant="h5" fw="bold" className="mb-4">
            Submit Job
          </Typography>

          {isLoadingPermission || isLoadingOnChainDetails ? (
            <SkeletonLoader className="h-32" />
          ) : canSubmitJobs ? (
            <JobSubmissionForm
              serviceId={serviceId}
              blueprint={blueprintResult.details}
            />
          ) : (
            <PermissionDeniedMessage />
          )}
        </Card>
      )}

      {/* Job History */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Job History
        </Typography>
        <JobHistoryTable jobs={jobs ?? []} isLoading={isLoadingJobs} />
      </Card>

      {/* Fund Service Modal */}
      {isFundModalOpen && (
        <FundServiceModal
          serviceId={serviceId}
          onClose={() => setIsFundModalOpen(false)}
        />
      )}
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

const PermissionDeniedMessage: FC = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="p-4 rounded-full bg-yellow-500/20 mb-4">
      <ShieldKeyholeLineIcon className="w-8 h-8 text-yellow-400" />
    </div>
    <Typography variant="h5" fw="semibold" className="mb-2">
      Permission Required
    </Typography>
    <Typography variant="body2" className="text-center text-mono-100 max-w-md">
      You are not authorized to submit jobs to this service. Only the service
      owner or addresses added as permitted callers can submit jobs.
    </Typography>
    <Typography variant="body3" className="text-mono-120 mt-4">
      Contact the service owner to request access.
    </Typography>
  </div>
);

export default ServiceDetailPage;
