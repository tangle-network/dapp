/**
 * Panel for managing operator membership in dynamic services.
 * Shows join/leave options depending on current membership status.
 */

import { FC, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardVariant,
  Typography,
  Button,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import { LoginBoxLineIcon } from '@tangle-network/icons';
import {
  useExitConfig,
  useServiceOperators,
  ServiceContractDetails,
  MembershipModel,
} from '@tangle-network/tangle-shared-ui/data/services';
import { useOperatorRegistrations } from '@tangle-network/tangle-shared-ui/data/graphql';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import JoinServiceModal from './JoinServiceModal';
import { useLeaveServiceTx } from '../../../data/services/useLeaveServiceTx';

interface Props {
  serviceId: bigint;
  isCurrentUserOperator: boolean;
  serviceDetails: ServiceContractDetails | null | undefined;
}

const OperatorMembershipPanel: FC<Props> = ({
  serviceId,
  isCurrentUserOperator,
  serviceDetails,
}) => {
  const { isOperator: isRegisteredOperator } = useEvmOperatorInfo();

  const { data: operatorRegistrations } = useOperatorRegistrations();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { data: exitConfig, isLoading: isLoadingExitConfig } =
    useExitConfig(serviceId);
  const { data: operators, isLoading: isLoadingOperators } =
    useServiceOperators(serviceId);

  const {
    execute: executeLeave,
    isPending: isLeaving,
    error: leaveError,
  } = useLeaveServiceTx();

  const isLoading = isLoadingExitConfig || isLoadingOperators;

  const isDynamicService =
    serviceDetails?.membership === MembershipModel.Dynamic;

  const isRegisteredForBlueprint = useMemo(() => {
    if (!operatorRegistrations || !serviceDetails) return false;

    return operatorRegistrations.some(
      (reg) =>
        reg.active &&
        reg.blueprintId.toString() === serviceDetails.blueprintId.toString(),
    );
  }, [operatorRegistrations, serviceDetails]);

  const canJoin = useMemo(() => {
    if (!isDynamicService) return false;
    if (!isRegisteredOperator) return false;
    if (!isRegisteredForBlueprint) return false;
    if (isCurrentUserOperator) return false;
    if (!serviceDetails) return false;

    const currentCount = operators?.length ?? 0;
    if (serviceDetails.maxOperators > 0 && currentCount >= serviceDetails.maxOperators) {
      return false;
    }

    return true;
  }, [
    isDynamicService,
    isRegisteredOperator,
    isRegisteredForBlueprint,
    isCurrentUserOperator,
    serviceDetails,
    operators,
  ]);

  const canDirectLeave = useMemo(() => {
    if (!isDynamicService) return false;
    if (!isCurrentUserOperator) return false;
    if (!exitConfig) return false;

    return exitConfig.exitQueueDuration === BigInt(0);
  }, [isDynamicService, isCurrentUserOperator, exitConfig]);

  const handleLeave = useCallback(async () => {
    if (!executeLeave || !canDirectLeave) return;
    await executeLeave({ serviceId });
  }, [executeLeave, canDirectLeave, serviceId]);

  if (!isDynamicService) {
    return null;
  }

  if (isLoading) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Operator Membership
        </Typography>
        <SkeletonLoader className="h-16" />
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Operator Membership
      </Typography>

      {!isRegisteredOperator ? (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Typography variant="body2" className="text-yellow-400">
            You must be a registered operator to join or leave this service.
            Please register as an operator first.
          </Typography>
        </div>
      ) : !isRegisteredForBlueprint && !isCurrentUserOperator ? (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Typography variant="body2" className="text-yellow-400">
            You must be registered for this service&apos;s blueprint before you
            can join. Please register for the blueprint first.
          </Typography>
        </div>
      ) : isCurrentUserOperator ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <Typography variant="body1" fw="semibold" className="text-green-400">
                Active Operator
              </Typography>
            </div>
            <Typography variant="body2" className="text-mono-100">
              You are currently an operator of this service.
            </Typography>
          </div>

          {canDirectLeave ? (
            <div>
              <Button
                variant="secondary"
                onClick={handleLeave}
                isLoading={isLeaving}
                isDisabled={isLeaving}
                leftIcon={<LoginBoxLineIcon className="w-4 h-4 rotate-180" />}
              >
                Leave Service
              </Button>
              {leaveError && (
                <Typography variant="body3" className="text-red-400 mt-2">
                  {leaveError.message}
                </Typography>
              )}
            </div>
          ) : (
            <Typography variant="body2" className="text-mono-100">
              This service has an exit queue. Use the Exit Queue panel below to
              manage your exit.
            </Typography>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Typography variant="body2" className="text-mono-100">
            This is a dynamic membership service. As a registered operator, you
            can join to provide services and earn rewards.
          </Typography>

          {!canJoin && operators && serviceDetails && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Typography variant="body2" className="text-yellow-400">
                {operators.length >= serviceDetails.maxOperators && serviceDetails.maxOperators > 0
                  ? 'This service has reached its maximum operator capacity.'
                  : 'You cannot join this service at this time.'}
              </Typography>
            </div>
          )}

          {canJoin && (
            <Button
              onClick={() => setIsJoinModalOpen(true)}
              leftIcon={<LoginBoxLineIcon className="w-4 h-4" />}
            >
              Join Service
            </Button>
          )}
        </div>
      )}

      {isJoinModalOpen && (
        <JoinServiceModal
          serviceId={serviceId}
          onClose={() => setIsJoinModalOpen(false)}
        />
      )}
    </Card>
  );
};

export default OperatorMembershipPanel;
