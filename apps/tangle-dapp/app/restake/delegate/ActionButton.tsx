import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import type { Noop } from '@webb-tools/dapp-types/utils/types';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useMemo } from 'react';
import type { FieldErrors, UseFormWatch } from 'react-hook-form';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { DelegationFormFields } from '../../../types/restake';
import ActionButtonBase from '../ActionButtonBase';

type Props = {
  openChainModal: Noop;
  isValid: boolean;
  errors: FieldErrors<DelegationFormFields>;
  watch: UseFormWatch<DelegationFormFields>;
};

export default function ActionButton({
  openChainModal,
  isValid,
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
        ? 'Select an operator'
        : errors.assetId !== undefined || !assetId
          ? 'Select an asset'
          : !amount
            ? 'Enter an amount'
            : errors.amount !== undefined
              ? 'Invalid amount'
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
            isLoading={isLoading}
            loadingText={loadingText}
          >
            {displayError ?? 'Delegate'}
          </Button>
        );
      }}
    </ActionButtonBase>
  );
}
