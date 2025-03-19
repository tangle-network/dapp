import {
  DropdownField,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { TxStatus } from '../../hooks/useSubstrateTx';
import useLsPoolSetStateTx from '../../data/liquidStaking/tangle/useLsPoolSetStateTx';
import { PalletTangleLstPoolsPoolState } from '@polkadot/types/lookup';
import { z } from 'zod';

type Props = {
  poolId: number | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const LsSetPoolStateModal: FC<Props> = ({ poolId, isOpen, setIsOpen }) => {
  const [state, setState] =
    useState<PalletTangleLstPoolsPoolState['type']>('Open');

  const { execute, status } = useLsPoolSetStateTx();

  const isReady =
    poolId !== null &&
    execute !== null &&
    state !== null &&
    status !== TxStatus.PROCESSING;

  const handleSetStateClick = useCallback(() => {
    if (!isReady) {
      return;
    }

    return execute({
      poolId,
      state,
    });
  }, [isReady, execute, poolId, state]);

  // Automatically close the modal if the transaction was successful.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setIsOpen(false);
    }
  }, [setIsOpen, status]);

  const dropdownOptions = useMemo(() => {
    return [
      'Open',
      'Blocked',
      'Destroying',
    ] as const satisfies PalletTangleLstPoolsPoolState['type'][];
  }, []);

  const handleSetPayee = useCallback(
    (value: string) => {
      setState(z.enum(dropdownOptions).parse(value));
    },
    [dropdownOptions],
  );

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="sm">
        <ModalHeader>Set Pool State</ModalHeader>

        <ModalBody>
          <Typography variant="body1">
            Control whether new members can join or not. Additionally, you have
            the option to permanently destroy the pool (this action is
            irreversible).
          </Typography>

          <DropdownField
            title="State"
            items={dropdownOptions}
            // TODO: Better way to handle default/unavailable case.
            selectedItem={state || dropdownOptions[0]}
            setSelectedItemId={handleSetPayee}
            dropdownBodyClassName="max-w-[344px]"
            getId={(item) => item}
            getDisplayText={(item) => {
              switch (item) {
                case 'Open':
                  return 'Open to new members';
                case 'Blocked':
                  return 'Blocked to new members';
                case 'Destroying':
                  return 'Permanently closed';
              }
            }}
          />
        </ModalBody>

        <ModalFooterActions
          hasCloseButton
          isProcessing={status === TxStatus.PROCESSING}
          onConfirm={handleSetStateClick}
          isConfirmDisabled={!isReady}
        />
      </ModalContent>
    </Modal>
  );
};

export default LsSetPoolStateModal;
