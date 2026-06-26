/**
 * Panel for managing operator membership in dynamic services.
 * Shows join/leave options depending on current membership status.
 */

import {
  type ComponentProps,
  type FC,
  type ReactNode,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  Button as SandboxButton,
  Card,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
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

const CARD_SURFACE = 'sandbox' as const;

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  isLoading,
  leftIcon,
  disabled,
  children,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    loading={isLoading}
    {...props}
  >
    {leftIcon}
    {children}
  </SandboxButton>
);

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
    if (
      serviceDetails.maxOperators > 0 &&
      currentCount >= serviceDetails.maxOperators
    ) {
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
      <Card variant={CARD_SURFACE} className="p-6">
        <Text variant="h5" fw="bold" className="mb-4">
          Operator Membership
        </Text>
        <Skeleton className="h-16" />
      </Card>
    );
  }

  return (
    <Card variant={CARD_SURFACE} className="p-6">
      <Text variant="h5" fw="bold" className="mb-4">
        Operator Membership
      </Text>

      {!isRegisteredOperator ? (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Text variant="body2" className="text-yellow-400">
            You must be a registered operator to join or leave this service.
            Please register as an operator first.
          </Text>
        </div>
      ) : !isRegisteredForBlueprint && !isCurrentUserOperator ? (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <Text variant="body2" className="text-yellow-400">
            You must be registered for this service&apos;s blueprint before you
            can join. Please register for the blueprint first.
          </Text>
        </div>
      ) : isCurrentUserOperator ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <Text variant="body1" fw="semibold" className="text-green-400">
                Active Operator
              </Text>
            </div>
            <Text variant="body2" className="text-mono-100 dark:text-mono-60">
              You are currently an operator of this service.
            </Text>
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
                <Text variant="body3" className="text-red-400 mt-2">
                  {leaveError.message}
                </Text>
              )}
            </div>
          ) : (
            <Text variant="body2" className="text-mono-100 dark:text-mono-60">
              This service has an exit queue. Use the Exit Queue panel below to
              manage your exit.
            </Text>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Text variant="body2" className="text-mono-100 dark:text-mono-60">
            This is a dynamic membership service. As a registered operator, you
            can join to provide services and earn rewards.
          </Text>

          {!canJoin && operators && serviceDetails && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Text variant="body2" className="text-yellow-400">
                {operators.length >= serviceDetails.maxOperators &&
                serviceDetails.maxOperators > 0
                  ? 'This service has reached its maximum operator capacity.'
                  : 'You cannot join this service at this time.'}
              </Text>
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
