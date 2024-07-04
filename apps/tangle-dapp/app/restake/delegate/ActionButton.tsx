import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import type { Noop } from '@webb-tools/dapp-types/utils/types';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import ActionButtonBase from '../ActionButtonBase';

type Props = {
  openChainModal: Noop;
};

export default function ActionButton({ openChainModal }: Props) {
  const activeTypedChainId = useActiveTypedChainId();

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
            type="submit"
            isFullWidth
            isLoading={isLoading}
            loadingText={loadingText}
          >
            Delegate
          </Button>
        );
      }}
    </ActionButtonBase>
  );
}
