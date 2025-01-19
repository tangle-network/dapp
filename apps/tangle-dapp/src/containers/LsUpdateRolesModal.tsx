import {
  isValidAddress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  TANGLE_DOCS_LS_UPDATE_ROLES_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import useSubstrateAddress from '@webb-tools/tangle-shared-ui/hooks/useSubstrateAddress';
import AddressInput from '../components/AddressInput';
import useLsUpdateRolesTx from '../data/liquidStaking/tangle/useLsUpdateRolesTx';
import { TxStatus } from '../hooks/useSubstrateTx';
import { AddressType } from '../constants';

export type LsUpdateRolesModalProps = {
  poolId: number | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const LsUpdateRolesModal: FC<LsUpdateRolesModalProps> = ({
  poolId,
  isOpen,
  setIsOpen,
}) => {
  const activeSubstrateAddress = useSubstrateAddress();
  const [rootAddress, setRootAddress] = useState('');
  const [nominatorAddress, setNominatorAddress] = useState('');
  const [bouncerAddress, setBouncerAddress] = useState('');

  const { execute, status } = useLsUpdateRolesTx();

  const areAddressesValid =
    isValidAddress(rootAddress) ||
    isValidAddress(nominatorAddress) ||
    isValidAddress(bouncerAddress);

  const atLeastOneGiven =
    rootAddress.trim() !== '' ||
    nominatorAddress.trim() !== '' ||
    bouncerAddress.trim() !== '';

  const isReady =
    atLeastOneGiven &&
    areAddressesValid &&
    activeSubstrateAddress !== null &&
    execute !== null &&
    poolId !== null;

  const handleConfirmClick = useCallback(async () => {
    if (!isReady) {
      return;
    }

    const rootAddress_ = isValidAddress(rootAddress) ? rootAddress : undefined;

    const nominatorAddress_ = isValidAddress(nominatorAddress)
      ? nominatorAddress
      : undefined;

    const bouncerAddress_ = isValidAddress(bouncerAddress)
      ? bouncerAddress
      : undefined;

    await execute({
      poolId,
      rootAddress: rootAddress_,
      nominatorAddress: nominatorAddress_,
      bouncerAddress: bouncerAddress_,
    });
  }, [bouncerAddress, execute, isReady, poolId, nominatorAddress, rootAddress]);

  // Automatically close the modal when the transaction
  // is successful.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setIsOpen(false);
    }
  }, [setIsOpen, status]);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="md">
        <ModalHeader>Update Pool Roles</ModalHeader>

        <ModalBody className="gap-4">
          <Typography variant="body1">
            Changing the root role is equivalent to ownership transfer. Please
            be cautious and double check the address(es) to avoid accidentally
            losing control over the pool.
          </Typography>

          <AddressInput
            id="ls-update-pool-roles-root-address"
            title="Root Address (Optional)"
            tooltip="The root is the administrator of the pool with full control over its operations, including updating roles, and commission setup."
            placeholder="Leave empty to keep current"
            type={AddressType.SUBSTRATE}
            value={rootAddress}
            setValue={setRootAddress}
            wrapperOverrides={{ isFullWidth: true }}
          />

          <AddressInput
            id="ls-update-pool-roles-nominator-address"
            title="Nominator Address (Optional)"
            tooltip="The nominator is responsible for selecting validators on behalf of the pool. Their role is critical in optimizing rewards for the pool members by choosing high-performing and secure validators."
            placeholder="Leave empty to keep current"
            type={AddressType.SUBSTRATE}
            value={nominatorAddress}
            setValue={setNominatorAddress}
            wrapperOverrides={{ isFullWidth: true }}
          />

          <AddressInput
            id="ls-update-pool-roles-bouncer-address"
            title="Bouncer Address (Optional)"
            tooltip="The bouncer is responsible for managing the entry and exit of participants into the pool. They can block or allow participants, as well as manage pool access settings."
            placeholder="Leave empty to keep current"
            type={AddressType.SUBSTRATE}
            value={bouncerAddress}
            setValue={setBouncerAddress}
            wrapperOverrides={{ isFullWidth: true }}
          />
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_LS_UPDATE_ROLES_URL}
          isProcessing={status === TxStatus.PROCESSING}
          onConfirm={handleConfirmClick}
          isConfirmDisabled={!isReady}
        />
      </ModalContent>
    </Modal>
  );
};

export default LsUpdateRolesModal;
