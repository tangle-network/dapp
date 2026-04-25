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
import { TangleDAppPagePath } from '../../../types';
import { TxName } from '../../../constants';
import useTxNotification from '../../../hooks/useTxNotification';
import {
  TxStatus as BatchRegisterTxStatus,
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

const RegistrationDrawer: FC<RegistrationDrawerProps> = ({
  isOpen,
  onOpenChange,
  blueprints,
  onRemoveBlueprint,
  onRegistrationComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      onRegistrationComplete?.();
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
            title="Operator Stake Required"
            description="You must be a staked operator before registering for blueprints. Please deposit and delegate assets in the Tangle dApp first."
          />

          <div className="space-y-4">
            <Text variant="body2" className="text-muted-foreground">
              To become an active operator:
            </Text>

            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>
                <span className="text-sm">Go to the Tangle dApp</span>
              </li>

              <li>
                <span className="text-sm">
                  Deposit and delegate your assets
                </span>
              </li>

              <li>
                <span className="text-sm">
                  Return here once your operator status is active
                </span>
              </li>
            </ol>

            <a
              href={TangleDAppPagePath.STAKING_DELEGATE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Tangle dApp
            </a>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="shrink-0 px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
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
                  index + 1 <= step ? 'bg-primary' : 'bg-muted',
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

            <div className="mt-auto pt-4 border-t border-border">
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
      <DialogContent className="fixed right-0 left-auto top-0 z-[80] h-screen max-h-screen w-full max-w-xl translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 p-0 sm:max-w-xl">
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-border">
          <DialogTitle className="text-lg font-bold">
            Register as Operator
          </DialogTitle>
          <DialogDescription className="sr-only">
            Register an active operator for one or more selected blueprints.
          </DialogDescription>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            x
          </Button>
        </div>

        {renderGatedContent()}
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationDrawer;
