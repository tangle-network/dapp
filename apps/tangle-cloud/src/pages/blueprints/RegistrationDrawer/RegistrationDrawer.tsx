import { useOperator } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { type OperatorRegistration } from '@tangle-network/tangle-shared-ui/data/graphql/useOperatorManagement';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Skeleton,
  Text,
} from '../../../components/sandbox/SandboxUi';
import { FC, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useWalletClient } from 'wagmi';
import { Address, hashMessage, recoverPublicKey } from 'viem';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import { TxName } from '../../../constants';
import useTxNotification from '../../../hooks/useTxNotification';
import {
  TxStatus as BatchRegisterTxStatus,
  useOperatorBatchPreRegisterTx,
  useOperatorBatchRegisterTx,
} from '../../../data/services/useOperatorRegisterTx';
import StepNavigation from './components/StepNavigation';
import ConfigureStep from './steps/ConfigureStep';
import ReviewStep from './steps/ReviewStep';
import SelectBlueprintsStep from './steps/SelectBlueprintsStep';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import {
  RegistrationDrawerProps,
  RegistrationStep,
  STEP_LABELS,
  TOTAL_STEPS,
} from './types';
import { encodeRegistrationInputs } from './registrationInputs';
import useRegistrationForm from './useRegistrationForm';

type RegistrationMode = 'intent' | 'full';

const RegistrationDrawer: FC<RegistrationDrawerProps> = ({
  isOpen,
  onOpenChange,
  blueprints,
  onRemoveBlueprint,
  onRegistrationComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreRegisterSubmitting, setIsPreRegisterSubmitting] = useState(false);
  const [registrationMode, setRegistrationMode] =
    useState<RegistrationMode>('intent');
  const queryClient = useQueryClient();
  const { address: activeAccount } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: operator, isLoading: isOperatorLoading } =
    useOperator(activeAccount);
  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();
  const { execute: batchRegisterOperator, status: batchRegisterStatus } =
    useOperatorBatchRegisterTx({
      onProgress: (progress) => {
        notifyProcessing(
          TxName.REGISTER_BLUEPRINT,
          progress.total > 1
            ? { current: progress.current, total: progress.total }
            : undefined,
        );
      },
    });
  const { execute: batchPreRegisterOperator, status: batchPreRegisterStatus } =
    useOperatorBatchPreRegisterTx({
      onProgress: (progress) => {
        notifyProcessing(
          TxName.PRE_REGISTER_BLUEPRINT,
          progress.total > 1
            ? { current: progress.current, total: progress.total }
            : undefined,
        );
      },
    });

  const isActiveOperator = operator?.stakingStatus === 'ACTIVE';

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const { form, step, goNext, goBack, reset, isFirstStep, isLastStep } =
    useRegistrationForm({
      blueprints,
      onClose: handleClose,
    });

  const handleSubmit = useCallback(async () => {
    if (!activeAccount || !walletClient) {
      return;
    }

    setIsSubmitting(true);
    const totalBlueprints = blueprints.length;

    try {
      const rpcUrl = form.getValues('rpcUrl') || '';

      const message = `Tangle Operator Registration\nAddress: ${activeAccount}`;
      const signature = await walletClient.signMessage({ message });
      const messageHash = hashMessage(message);
      const ecdsaPublicKey = await recoverPublicKey({
        hash: messageHash,
        signature,
      });

      const registrations = blueprints.map((blueprint) => {
        const blueprintConfig = form.getValues(
          `blueprintConfigs.${blueprint.id.toString()}`,
        );
        const registrationArgs = encodeRegistrationInputs(
          blueprint.registrationParams,
          blueprintConfig?.params ?? {},
        );

        return {
          blueprintId: BigInt(blueprint.id),
          registrationArgs,
        };
      });

      const batchResult = await batchRegisterOperator({
        ecdsaPublicKey,
        rpcAddress: rpcUrl,
        registrations,
      });

      if (batchResult === null) {
        throw new Error('Failed to register for selected blueprints');
      }

      const { successfulBlueprintIds } = batchResult;
      const successfulIds = new Set(
        successfulBlueprintIds.map((blueprintId) => blueprintId.toString()),
      );
      const successfulBlueprints = blueprints.filter((blueprint) =>
        successfulIds.has(blueprint.id.toString()),
      );
      const successCount = successfulBlueprints.length;

      if (successCount === 0) {
        throw new Error('Failed to register for selected blueprints');
      }

      const registeredAt = BigInt(Math.floor(Date.now() / 1000));
      queryClient.setQueriesData<OperatorRegistration[]>(
        { queryKey: ['operator', 'registrations'] },
        (existingRegistrations) => {
          const optimisticRegistrations = successfulBlueprints.map(
            (blueprint) =>
              ({
                blueprintId: BigInt(blueprint.id),
                blueprintName: blueprint.name ?? `Blueprint #${blueprint.id}`,
                operator: activeAccount as Address,
                registeredAt,
                preferences: {
                  ecdsaPublicKey: ecdsaPublicKey as `0x${string}`,
                  rpcAddress: rpcUrl,
                },
                active: true,
              }) satisfies OperatorRegistration,
          );

          if (!existingRegistrations) {
            return optimisticRegistrations;
          }

          const registrationByBlueprintId = new Map<
            string,
            OperatorRegistration
          >(
            optimisticRegistrations.map((registration) => [
              registration.blueprintId.toString(),
              registration,
            ]),
          );

          const mergedRegistrations = existingRegistrations.map(
            (registration) => {
              const optimisticRegistration = registrationByBlueprintId.get(
                registration.blueprintId.toString(),
              );
              if (!optimisticRegistration) {
                return registration;
              }

              registrationByBlueprintId.delete(
                registration.blueprintId.toString(),
              );
              return {
                ...registration,
                active: true,
                preferences: optimisticRegistration.preferences,
                registeredAt,
              };
            },
          );

          return [
            ...registrationByBlueprintId.values(),
            ...mergedRegistrations,
          ];
        },
      );

      const successMessage =
        successCount === totalBlueprints
          ? `Successfully registered for ${successCount} blueprint${successCount > 1 ? 's' : ''}`
          : `Registered for ${successCount} of ${totalBlueprints} blueprints`;

      notifySuccess(TxName.REGISTER_BLUEPRINT, null, successMessage);
      reset();
      await onRegistrationComplete?.({ expectOperatorCountChange: true });
    } catch (error) {
      console.error('Registration failed:', error);
      notifyError(
        TxName.REGISTER_BLUEPRINT,
        error instanceof Error ? error : new Error('Registration failed'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeAccount,
    walletClient,
    form,
    blueprints,
    batchRegisterOperator,
    reset,
    onRegistrationComplete,
    queryClient,
    notifySuccess,
    notifyError,
  ]);

  const handlePreRegister = useCallback(async () => {
    if (!activeAccount || blueprints.length === 0) {
      return;
    }

    setIsPreRegisterSubmitting(true);
    const totalBlueprints = blueprints.length;

    try {
      const batchResult = await batchPreRegisterOperator({
        blueprintIds: blueprints.map((blueprint) => BigInt(blueprint.id)),
      });

      if (batchResult === null) {
        throw new Error('Failed to signal operator intent');
      }

      const successCount = batchResult.successfulBlueprintIds.length;

      if (successCount === 0) {
        throw new Error('Failed to signal operator intent');
      }

      const successMessage =
        successCount === totalBlueprints
          ? `Intent signaled for ${successCount} blueprint${successCount > 1 ? 's' : ''}`
          : `Intent signaled for ${successCount} of ${totalBlueprints} blueprints`;

      notifySuccess(TxName.PRE_REGISTER_BLUEPRINT, null, successMessage);
      reset();
      await onRegistrationComplete?.({ expectOperatorCountChange: false });
    } catch (error) {
      console.error('Pre-registration failed:', error);
      notifyError(
        TxName.PRE_REGISTER_BLUEPRINT,
        error instanceof Error ? error : new Error('Pre-registration failed'),
      );
    } finally {
      setIsPreRegisterSubmitting(false);
    }
  }, [
    activeAccount,
    blueprints,
    batchPreRegisterOperator,
    reset,
    onRegistrationComplete,
    notifySuccess,
    notifyError,
  ]);

  const handleNext = useCallback(async () => {
    await goNext();
  }, [goNext]);

  const renderStepContent = () => {
    switch (step) {
      case RegistrationStep.SELECT_BLUEPRINTS:
        return (
          <SelectBlueprintsStep
            blueprints={blueprints}
            onRemoveBlueprint={onRemoveBlueprint}
          />
        );
      case RegistrationStep.CONFIGURE:
        return <ConfigureStep blueprints={blueprints} form={form} />;
      case RegistrationStep.REVIEW:
        return (
          <ReviewStep
            blueprints={blueprints}
            form={form}
            isSubmitting={
              isSubmitting ||
              batchRegisterStatus === BatchRegisterTxStatus.PROCESSING
            }
          />
        );
      default:
        return null;
    }
  };

  const renderGatedContent = () => {
    if (!activeAccount) {
      return (
        <div className="flex-1 space-y-5 p-4">
          <Alert
            type="info"
            title="Connect wallet"
            description="Connect the operator wallet that will sign blueprint registrations."
          />

          <ConnectWalletButton />
        </div>
      );
    }

    if (isOperatorLoading) {
      return (
        <div className="flex-1 p-4">
          <Skeleton className="h-32" />
        </div>
      );
    }

    if (!isActiveOperator) {
      return (
        <div className="flex-1 p-4 space-y-6">
          <Alert
            type="warning"
            title="Active operator required"
            description="This wallet is not active as an operator yet. Blueprint registration and preregistration both require an active operator account on the current network."
          />

          <div className="space-y-4">
            <Text variant="body2" className="text-mono-100 dark:text-mono-80">
              Stay in Cloud and verify the operator state before trying again:
            </Text>

            <ol className="list-decimal list-inside space-y-2 text-mono-100 dark:text-mono-80">
              <li>
                <span className="text-sm">Confirm the connected wallet.</span>
              </li>

              <li>
                <span className="text-sm">
                  Check whether the wallet is listed as an operator.
                </span>
              </li>

              <li>
                <span className="text-sm">
                  Return here after the wallet is active on this network.
                </span>
              </li>
            </ol>

            <Button variant="sandbox" isFullWidth asChild>
              <Link to={PagePath.OPERATORS}>View operators</Link>
            </Button>
          </div>
        </div>
      );
    }

    if (registrationMode === 'intent') {
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <RegistrationModePicker
            mode={registrationMode}
            onModeChange={setRegistrationMode}
          />

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-5">
              <Alert
                type="info"
                title="Signal operator intent"
                description="Preregistration emits an onchain intent event for Blueprint Managers and indexers. It does not publish your RPC endpoint or final registration inputs."
              />

              <div className="space-y-3">
                <Text variant="body2" fw="bold">
                  Selected blueprints ({blueprints.length})
                </Text>

                <div className="max-h-[360px] space-y-3 overflow-y-auto">
                  {blueprints.map((blueprint) => (
                    <div
                      key={blueprint.id.toString()}
                      className="rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/70 p-4"
                    >
                      <div className="flex items-start gap-3">
                        {blueprint.imgUrl && (
                          <img
                            src={blueprint.imgUrl}
                            width={40}
                            height={40}
                            alt={blueprint.name}
                            className="shrink-0 rounded-full border border-mono-60 dark:border-mono-170 object-cover"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <Text variant="body2" fw="bold" className="truncate">
                            {blueprint.name}
                          </Text>
                          <Text
                            variant="body3"
                            className="mt-1 text-mono-100 dark:text-mono-80"
                          >
                            Blueprint #{blueprint.id.toString()}
                            {blueprint.author ? ` - ${blueprint.author}` : ''}
                          </Text>
                        </div>

                        {onRemoveBlueprint && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onRemoveBlueprint(blueprint.id.toString())
                            }
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-20/50 dark:bg-mono-190/50 p-4">
                <Text variant="body2" fw="bold">
                  What happens next
                </Text>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-mono-100 dark:text-mono-80 text-sm">
                  <li>Your wallet sends `preRegister(blueprintId)`.</li>
                  <li>The protocol emits `OperatorPreRegistered`.</li>
                  <li>
                    Blueprint Managers can listen for the event and start their
                    offchain onboarding flow.
                  </li>
                  <li>
                    Use full registration when you are ready to publish endpoint
                    preferences and blueprint-specific inputs.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-mono-60 dark:border-mono-170 p-4">
            <Button
              variant="sandbox"
              isFullWidth
              isLoading={
                isPreRegisterSubmitting ||
                batchPreRegisterStatus === BatchRegisterTxStatus.PROCESSING
              }
              isDisabled={
                blueprints.length === 0 ||
                isPreRegisterSubmitting ||
                batchPreRegisterStatus === BatchRegisterTxStatus.PROCESSING
              }
              onClick={handlePreRegister}
            >
              Signal intent
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <RegistrationModePicker
          mode={registrationMode}
          onModeChange={setRegistrationMode}
        />

        <div className="shrink-0 px-4 py-3 border-b border-mono-60 dark:border-mono-170">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-mono-100 dark:text-mono-80">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium">{STEP_LABELS[step]}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <div
                key={index}
                className={[
                  'h-1.5 rounded-full',
                  index + 1 <= step
                    ? 'bg-purple-40'
                    : 'bg-mono-20 dark:bg-mono-190',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <form
            className="flex flex-col min-h-full p-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>{renderStepContent()}</div>

            <div className="mt-auto pt-4 border-t border-mono-60 dark:border-mono-170">
              <StepNavigation
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                isSubmitting={
                  isSubmitting ||
                  batchRegisterStatus === BatchRegisterTxStatus.PROCESSING
                }
                onBack={goBack}
                onNext={handleNext}
                onSubmit={handleSubmit}
              />
            </div>
          </form>
        </div>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed !left-auto !right-0 !top-0 z-[80] flex h-screen max-h-screen w-full max-w-xl !translate-x-0 !translate-y-0 flex-col overflow-hidden rounded-none border-y-0 border-r-0 p-0 sm:max-w-xl">
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-mono-60 dark:border-mono-170">
          <DialogTitle className="text-lg font-bold">
            Register as Operator
          </DialogTitle>
          <DialogDescription className="sr-only">
            Register an active operator for one or more selected blueprints.
          </DialogDescription>
        </div>

        {renderGatedContent()}
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDrawer;

const RegistrationModePicker = ({
  mode,
  onModeChange,
}: {
  mode: RegistrationMode;
  onModeChange: (mode: RegistrationMode) => void;
}) => (
  <div className="grid shrink-0 gap-2 border-b border-mono-60 dark:border-mono-170 p-4 sm:grid-cols-2">
    <button
      type="button"
      className={[
        'rounded-lg border p-4 text-left transition-colors',
        mode === 'intent'
          ? 'border-purple-40 bg-purple-40/10 text-mono-200 dark:text-mono-0'
          : 'border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/70 text-mono-100 dark:text-mono-80 hover:bg-mono-20/50 dark:bg-mono-190/50',
      ].join(' ')}
      onClick={() => onModeChange('intent')}
    >
      <span className="block text-sm font-semibold">Preregistration</span>
      <span className="mt-1 block text-xs">
        Signal intent first. Fast path for Blueprint Manager onboarding.
      </span>
    </button>

    <button
      type="button"
      className={[
        'rounded-lg border p-4 text-left transition-colors',
        mode === 'full'
          ? 'border-purple-40 bg-purple-40/10 text-mono-200 dark:text-mono-0'
          : 'border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/70 text-mono-100 dark:text-mono-80 hover:bg-mono-20/50 dark:bg-mono-190/50',
      ].join(' ')}
      onClick={() => onModeChange('full')}
    >
      <span className="block text-sm font-semibold">Full registration</span>
      <span className="mt-1 block text-xs">
        Publish endpoint preferences and blueprint registration inputs.
      </span>
    </button>
  </div>
);
