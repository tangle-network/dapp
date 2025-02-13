import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import type { Noop } from '@tangle-network/dapp-types/utils/types';
import Button from '@tangle-network/webb-ui-components/components/buttons/Button';
import { useMemo } from 'react';
import type { FieldErrors, UseFormWatch } from 'react-hook-form';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { DelegationFormFields } from '../../../types/restake';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';

type Props = {
  openChainModal: Noop;
  isValid: boolean;
  isSubmitting: boolean;
  errors: FieldErrors<DelegationFormFields>;
  watch: UseFormWatch<DelegationFormFields>;
};

export default function ActionButton({
  openChainModal,
  isValid,
  isSubmitting,
  errors,
  watch,
}: Props) {
  const activeTypedChainId = useActiveTypedChainId();
  const operatorAccountId = watch('operatorAccountId');
  const assetId = watch('assetId');
  const amount = watch('amount');

  const displayError = useMemo(
    () => {
      return errors.operatorAccountId !== undefined || !operatorAccountId
        ? 'Select Operator'
        : errors.assetId !== undefined || !assetId
          ? 'Select Asset'
          : !amount
            ? 'Enter Amount'
            : errors.amount !== undefined
              ? 'Invalid Amount'
              : undefined;
    },
    // prettier-ignore
    [errors.operatorAccountId, errors.assetId, errors.amount, operatorAccountId, assetId, amount],
  );

  return (
    <ActionButtonBase>
      {(isLoading, loadingText) => {
        const activeChainSupported =
          isDefined(activeTypedChainId) &&
          SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(
            activeTypedChainId,
          );

        if (!activeChainSupported) {
          return (
            <Button
              isFullWidth
              type="button"
              isLoading={isLoading}
              loadingText={loadingText}
              onClick={openChainModal}
            >
              Switch to supported chain
            </Button>
          );
        }

        return (
          <Button
            isDisabled={!isValid || isDefined(displayError)}
            type="submit"
            isFullWidth
            isLoading={isSubmitting || isLoading}
            loadingText={loadingText}
          >
            {displayError ?? 'Delegate'}
          </Button>
        );
      }}
    </ActionButtonBase>
  );
}
