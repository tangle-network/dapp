import Button from '@tangle-network/ui-components/components/buttons/Button';
import { type RefObject } from 'react';
import type { FieldErrors, UseFormWatch } from 'react-hook-form';

import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { DepositFormFields } from '../../../types/restake';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import useSwitchChain from '../useSwitchChain';

type Props = {
  errors: FieldErrors<DepositFormFields>;
  formRef: RefObject<HTMLFormElement>;
  isSubmitting: boolean;
  isValid: boolean;
  watch: UseFormWatch<DepositFormFields>;
};

export default function ActionButton({
  errors,
  formRef,
  isSubmitting,
  isValid,
  watch,
}: Props) {
  const sourceTypedChainId = watch('sourceTypedChainId');

  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  return (
    <ActionButtonBase targetTypedChainId={sourceTypedChainId}>
      {(isLoading, loadingText) => {
        const displayError =
          errors.sourceTypedChainId !== undefined
            ? `Select Source Chain`
            : errors.depositAssetId !== undefined
              ? `Select Asset`
              : errors.amount !== undefined
                ? `Enter Amount`
                : undefined;

        if (activeTypedChainId !== sourceTypedChainId) {
          const handleClick = async () => {
            const result = await switchChain(sourceTypedChainId);
            const isSuccessful = result !== null && result !== undefined;

            // Dispatch submit event to trigger form submission
            // when the chain switch is successful and the form is valid
            if (isSuccessful && isValid && displayError === undefined) {
              formRef.current?.dispatchEvent(
                new Event('submit', { cancelable: true }),
              );
            }
          };

          return (
            <Button
              isLoading={isSubmitting || isLoading}
              loadingText={loadingText}
              type="button"
              isFullWidth
              onClick={handleClick}
            >
              Switch Chain
            </Button>
          );
        }

        return (
          <Button
            isLoading={isSubmitting || isLoading}
            loadingText={loadingText}
            type="submit"
            isDisabled={!isValid || displayError !== undefined}
            isFullWidth
          >
            Deposit
          </Button>
        );
      }}
    </ActionButtonBase>
  );
}
