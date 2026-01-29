import { useOperator } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { useRegisterOperatorTx } from '@tangle-network/tangle-shared-ui/data/graphql/useOperatorManagement';
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
import { useAccount, useWalletClient } from 'wagmi';
import { hashMessage, recoverPublicKey } from 'viem';
import { TangleDAppPagePath } from '../../../types';
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
import useRegistrationForm from './useRegistrationForm';

const RegistrationDrawer: FC<RegistrationDrawerProps> = ({
  isOpen,
  onOpenChange,
  blueprints,
  onRemoveBlueprint,
  onRegistrationComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address: activeAccount } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: operator, isLoading: isOperatorLoading } =
    useOperator(activeAccount);
  const { registerOperator, status: registerTxStatus } =
    useRegisterOperatorTx();

  const isActiveOperator = operator?.restakingStatus === 'ACTIVE';

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

    try {
      const rpcUrl = form.getValues('rpcUrl') || '';

      const message = `Tangle Operator Registration\nAddress: ${activeAccount}`;
      const signature = await walletClient.signMessage({ message });
      const messageHash = hashMessage(message);
      const ecdsaPublicKey = await recoverPublicKey({
        hash: messageHash,
        signature,
      });

      let successCount = 0;

      for (const blueprint of blueprints) {
        const blueprintId = BigInt(blueprint.id);

        // TODO: Encode registration args based on blueprint schema if needed
        // For now, pass empty bytes - works for blueprints without registration params
        const registrationArgs: `0x${string}` = '0x';

        const txHash = await registerOperator(
          blueprintId,
          { ecdsaPublicKey, rpcAddress: rpcUrl },
          registrationArgs,
        );

        if (txHash) {
          successCount++;
        }
      }

      if (successCount > 0) {
        reset();
        onRegistrationComplete?.();
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeAccount,
    walletClient,
    form,
    blueprints,
    registerOperator,
    reset,
    onRegistrationComplete,
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
            isSubmitting={isSubmitting || registerTxStatus === 'pending'}
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
            <Typography variant="body2" className="text-mono-120 dark:text-mono-100">
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
              href={TangleDAppPagePath.RESTAKE_DELEGATE}
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
                  isSubmitting={isSubmitting || registerTxStatus === 'pending'}
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
