import { useOperator } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { type OperatorRegistration } from '@tangle-network/tangle-shared-ui/data/graphql/useOperatorManagement';
import { Alert } from '@tangle-network/ui-components/components/Alert';
import { Button } from '@tangle-network/ui-components/components/buttons';
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerTitle,
} from '@tangle-network/ui-components/components/Drawer';
import { Form } from '@tangle-network/ui-components/components/form';
import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import SteppedProgress from '@tangle-network/ui-components/components/Progress/SteppedProgress';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
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
    if (isOperatorLoading) {
      return (
        <div className="flex-1 p-4">
          <SkeletonLoader className="h-32" />
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
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              To become an active operator:
            </Typography>

            <ol className="list-decimal list-inside space-y-2 text-mono-120 dark:text-mono-100">
              <li>
                <Typography variant="body2" component="span">
                  Go to the Tangle dApp
                </Typography>
              </li>

              <li>
                <Typography variant="body2" component="span">
                  Deposit and delegate your assets
                </Typography>
              </li>

              <li>
                <Typography variant="body2" component="span">
                  Return here once your operator status is active
                </Typography>
              </li>
            </ol>

            <Button
              as="a"
              href={TangleDAppPagePath.STAKING_DELEGATE}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              Go to Tangle dApp
            </Button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="shrink-0 px-4 py-3 border-b border-mono-80 dark:border-mono-160">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-mono-120 dark:text-mono-100">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium">{STEP_LABELS[step]}</span>
          </div>
          <SteppedProgress steps={TOTAL_STEPS} activeStep={step} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <Form {...form}>
            <form
              className="flex flex-col min-h-full p-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>{renderStepContent()}</div>

              <div className="mt-auto pt-4 border-t border-mono-80 dark:border-mono-160">
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
          </Form>
        </div>
      </>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="!flex !flex-col">
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-mono-80 dark:border-mono-160">
          <DrawerTitle className="text-lg font-bold">
            Register as Operator
          </DrawerTitle>
          <DrawerCloseButton />
        </div>

        {renderGatedContent()}
      </DrawerContent>
    </Drawer>
  );
};

export default RegistrationDrawer;
