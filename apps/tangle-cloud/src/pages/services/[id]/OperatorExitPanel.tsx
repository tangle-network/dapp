/**
 * Panel for managing operator exit queue for dynamic services.
 */

import {
  type ComponentProps,
  type FC,
  type ReactNode,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  Button as SandboxButton,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import {
  TimeLineIcon,
  PlayFillIcon,
  CloseCircleLineIcon,
  AlertFill,
} from '@tangle-network/icons';
import {
  useExitConfig,
  useExitStatus,
  useExitRequest,
  useCanScheduleExit,
  useServiceOperators,
  ExitStatus,
  getExitStatusLabel,
} from '@tangle-network/tangle-shared-ui/data/services';
import { addressesEqual } from '@tangle-network/tangle-shared-ui/utils/safeParseAddress';
import { Address } from 'viem';
import { useBlock } from 'wagmi';
import { useScheduleExitTx } from '../../../data/services/useScheduleExitTx';
import { useExecuteExitTx } from '../../../data/services/useExecuteExitTx';
import { useCancelExitTx } from '../../../data/services/useCancelExitTx';
import { useForceExitTx } from '../../../data/services/useForceExitTx';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';

interface Props {
  serviceId: bigint;
  operatorAddress: Address;
  isOwner: boolean;
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

const formatDuration = (seconds: bigint): string => {
  const totalSeconds = Number(seconds);
  if (totalSeconds === 0) return 'Immediate';

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '<1m';
};

const OperatorExitPanel: FC<Props> = ({
  serviceId,
  operatorAddress,
  isOwner,
}) => {
  const [selectedOperatorForForceExit, setSelectedOperatorForForceExit] =
    useState<Address | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  const { data: exitConfig, isLoading: isLoadingConfig } =
    useExitConfig(serviceId);
  const {
    data: exitStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useExitStatus(serviceId, operatorAddress);
  const {
    data: exitRequest,
    isLoading: isLoadingRequest,
    refetch: refetchRequest,
  } = useExitRequest(serviceId, operatorAddress);
  const { data: canScheduleExit, isLoading: isLoadingCanSchedule } =
    useCanScheduleExit(serviceId, operatorAddress);
  const { data: operators, isLoading: isLoadingOperators } =
    useServiceOperators(serviceId);
  const { data: latestBlock } = useBlock({ watch: true });

  // Compute offset between chain time and wall clock to handle
  // environments where block.timestamp drifts from real time
  // (e.g., local dev with evm_increaseTime).
  const chainTimeOffset = useMemo(() => {
    if (!latestBlock) return 0;
    return Number(latestBlock.timestamp) - Math.floor(Date.now() / 1000);
  }, [latestBlock]);

  const isLoading =
    isLoadingConfig ||
    isLoadingStatus ||
    isLoadingRequest ||
    isLoadingCanSchedule ||
    isLoadingOperators;

  const {
    execute: executeSchedule,
    isPending: isScheduling,
    error: scheduleError,
  } = useScheduleExitTx({
    onSuccess: () => {
      refetchStatus();
      refetchRequest();
    },
  });

  const {
    execute: executeExecuteExit,
    isPending: isExecuting,
    error: executeError,
  } = useExecuteExitTx();

  const {
    execute: executeCancel,
    isPending: isCanceling,
    error: cancelError,
  } = useCancelExitTx({
    onSuccess: () => {
      refetchStatus();
      refetchRequest();
    },
  });

  const {
    execute: executeForceExit,
    isPending: isForceExiting,
    error: forceExitError,
  } = useForceExitTx();

  const hasExitQueue = useMemo(() => {
    if (!exitConfig) return false;
    return exitConfig.exitQueueDuration > BigInt(0);
  }, [exitConfig]);

  const canExecuteNow =
    exitRequest && exitStatus === ExitStatus.Scheduled
      ? BigInt(Math.floor(Date.now() / 1000) + chainTimeOffset) >=
        exitRequest.executeAfter
      : false;

  useEffect(() => {
    if (exitStatus !== ExitStatus.Scheduled || !exitRequest || canExecuteNow) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const executeAfter = Number(exitRequest.executeAfter);
      const remaining = executeAfter - now;

      if (remaining <= 0) {
        setCountdown('Ready to execute');
        refetchStatus();
        return;
      }

      setCountdown(formatDuration(BigInt(remaining)));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [exitStatus, exitRequest, canExecuteNow, refetchStatus]);

  const handleScheduleExit = useCallback(async () => {
    if (!executeSchedule) return;
    await executeSchedule({ serviceId });
  }, [executeSchedule, serviceId]);

  const handleExecuteExit = useCallback(async () => {
    if (!executeExecuteExit) return;
    await executeExecuteExit({ serviceId });
  }, [executeExecuteExit, serviceId]);

  const handleCancelExit = useCallback(async () => {
    if (!executeCancel) return;
    await executeCancel({ serviceId });
  }, [executeCancel, serviceId]);

  const handleForceExit = useCallback(async () => {
    if (!executeForceExit || !selectedOperatorForForceExit) return;
    await executeForceExit({
      serviceId,
      operator: selectedOperatorForForceExit,
    });
    setSelectedOperatorForForceExit(null);
  }, [executeForceExit, serviceId, selectedOperatorForForceExit]);

  if (!hasExitQueue) {
    return null;
  }

  if (isLoading) {
    return (
      <Card variant={CARD_SURFACE} className="p-6">
        <Text variant="h5" fw="bold" className="mb-4">
          Exit Queue
        </Text>
        <Skeleton className="h-24" />
      </Card>
    );
  }

  const error = scheduleError || executeError || cancelError || forceExitError;

  return (
    <Card variant={CARD_SURFACE} className="p-6">
      <Text variant="h5" fw="bold" className="mb-4">
        Exit Queue
      </Text>

      <div className="space-y-4">
        {/* Exit Config Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/40">
            <Text variant="body3" className="text-muted-foreground mb-1">
              Exit Queue Duration
            </Text>
            <Text variant="body1" fw="semibold">
              {formatDuration(exitConfig?.exitQueueDuration ?? BigInt(0))}
            </Text>
          </div>
          <div className="p-3 rounded-lg bg-muted/40">
            <Text variant="body3" className="text-muted-foreground mb-1">
              Min Commitment
            </Text>
            <Text variant="body1" fw="semibold">
              {formatDuration(exitConfig?.minCommitmentDuration ?? BigInt(0))}
            </Text>
          </div>
          <div className="p-3 rounded-lg bg-muted/40">
            <Text variant="body3" className="text-muted-foreground mb-1">
              Force Exit Allowed
            </Text>
            <Text variant="body1" fw="semibold">
              {exitConfig?.forceExitAllowed ? 'Yes' : 'No'}
            </Text>
          </div>
        </div>

        {/* Current Exit Status */}
        {exitStatus === ExitStatus.None && (
          <div className="space-y-3">
            {canScheduleExit?.canExit ? (
              <div>
                <Text variant="body2" className="text-muted-foreground mb-3">
                  You can schedule an exit from this service. After scheduling,
                  you will need to wait for the exit queue duration before
                  executing your exit.
                </Text>
                <Button
                  onClick={handleScheduleExit}
                  isLoading={isScheduling}
                  isDisabled={isScheduling}
                  leftIcon={<TimeLineIcon size="lg" />}
                >
                  Schedule Exit
                </Button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Text variant="body2" className="text-yellow-400">
                  {canScheduleExit?.reason ||
                    'You cannot schedule an exit at this time.'}
                </Text>
              </div>
            )}
          </div>
        )}

        {exitStatus !== ExitStatus.None && exitStatus !== undefined && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <Text variant="body2" fw="semibold">
                Your Exit Status
              </Text>
              <ExitStatusBadge status={exitStatus} />
            </div>

            {exitStatus === ExitStatus.Scheduled && exitRequest && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Scheduled At:</span>
                    <span className="block font-semibold">
                      {new Date(
                        Number(exitRequest.scheduledAt) * 1000,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Execute After:
                    </span>
                    <span className="block font-semibold">
                      {new Date(
                        Number(exitRequest.executeAfter) * 1000,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!canExecuteNow && countdown && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2">
                      <TimeLineIcon className="w-4 h-4 text-primary" />
                      <Text variant="body2" className="text-primary">
                        Time remaining:{' '}
                        <span className="font-semibold">{countdown}</span>
                      </Text>
                    </div>
                  </div>
                )}

                {canExecuteNow && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Text variant="body2" className="text-green-400">
                      Your exit is ready to execute!
                    </Text>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {canExecuteNow && (
                    <Button
                      onClick={handleExecuteExit}
                      isLoading={isExecuting}
                      isDisabled={isExecuting}
                      leftIcon={<PlayFillIcon size="lg" />}
                    >
                      Execute Exit
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    onClick={handleCancelExit}
                    isLoading={isCanceling}
                    isDisabled={isCanceling}
                    leftIcon={<CloseCircleLineIcon size="lg" />}
                  >
                    Cancel Exit
                  </Button>
                </div>
              </div>
            )}

            {exitStatus === ExitStatus.Executable && (
              <div className="flex items-center gap-3 mt-2">
                <Button
                  onClick={handleExecuteExit}
                  isLoading={isExecuting}
                  isDisabled={isExecuting}
                  leftIcon={<PlayFillIcon size="lg" />}
                >
                  Execute Exit
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleCancelExit}
                  isLoading={isCanceling}
                  isDisabled={isCanceling}
                  leftIcon={<CloseCircleLineIcon size="lg" />}
                >
                  Cancel Exit
                </Button>
              </div>
            )}

            {exitStatus === ExitStatus.Completed && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Text variant="body2" className="text-green-400">
                  You have successfully exited this service.
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Owner Force Exit Section */}
        {isOwner &&
          exitConfig?.forceExitAllowed &&
          operators &&
          operators.length > 0 && (
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertFill className="w-4 h-4 text-red-400" />
                <Text variant="body2" fw="semibold" className="text-red-400">
                  Force Exit Operator (Owner Only)
                </Text>
              </div>
              <Text variant="body3" className="text-muted-foreground mb-3">
                As the service owner, you can force-exit an operator from this
                service. Use this carefully as it will immediately remove the
                operator.
              </Text>
              <div className="flex gap-2 items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      {selectedOperatorForForceExit
                        ? `${selectedOperatorForForceExit.slice(0, 6)}...${selectedOperatorForForceExit.slice(-4)}`
                        : 'Select Operator'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {operators
                      .filter((op) => !addressesEqual(op, operatorAddress))
                      .map((op) => (
                        <DropdownMenuItem
                          key={op}
                          onClick={() => setSelectedOperatorForForceExit(op)}
                        >
                          {`${op.slice(0, 10)}...${op.slice(-8)}`}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleForceExit}
                  isLoading={isForceExiting}
                  isDisabled={!selectedOperatorForForceExit || isForceExiting}
                  className="!bg-red-500/20 hover:!bg-red-500/30 !text-red-400"
                >
                  Force Exit
                </Button>
              </div>
            </div>
          )}

        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </div>
    </Card>
  );
};

const ExitStatusBadge: FC<{ status: ExitStatus }> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case ExitStatus.Scheduled:
        return 'bg-yellow-500/20 text-yellow-400';
      case ExitStatus.Executable:
        return 'bg-green-500/20 text-green-400';
      case ExitStatus.Completed:
        return 'bg-primary/20 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-sm font-semibold ${getStatusStyle()}`}
    >
      {getExitStatusLabel(status)}
    </span>
  );
};

export default OperatorExitPanel;
