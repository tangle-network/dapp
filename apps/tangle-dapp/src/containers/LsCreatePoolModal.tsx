import { BN } from '@polkadot/util';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import {
  Alert,
  isValidAddress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  TANGLE_DOCS_LS_CREATE_POOL_URL,
} from '@tangle-network/ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import AddressInput from '../components/AddressInput';
import AmountInput from '../components/AmountInput';
import LsProtocolDropdownInput from '../components/LiquidStaking/LsProtocolDropdownInput';
import TextInput from '../components/TextInput';
import useBalances from '../data/balances/useBalances';
import useLsCreatePoolTx from '../data/liquidStaking/tangle/useLsCreatePoolTx';
import { TxStatus } from '../hooks/useSubstrateTx';
import { AddressType, ERROR_NOT_ENOUGH_BALANCE } from '../constants';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { NetworkId } from '@tangle-network/ui-components/constants/networks';

export type LsCreatePoolModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const LsCreatePoolModal: FC<LsCreatePoolModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const activeSubstrateAddress = useSubstrateAddress();
  // TODO: Use form validation for the properties/inputs.
  const [name, setName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const { free: freeBalance } = useBalances();
  const [rootAddress, setRootAddress] = useState('');
  const [nominatorAddress, setNominatorAddress] = useState('');
  const [bouncerAddress, setBouncerAddress] = useState('');

  const [initialBondAmount, setInitialBondAmount] = useState<BN | null>(null);

  const network = useNetworkStore((store) => store.network2);

  const { result: createPoolMinBond } = useApiRx(
    useCallback((api) => {
      return api.query.lst.minCreateBond();
    }, []),
  );

  const { execute, status } = useLsCreatePoolTx();

  const areAddressesValid =
    isValidAddress(rootAddress) &&
    isValidAddress(nominatorAddress) &&
    isValidAddress(bouncerAddress);

  // Name and icon aren't required.
  const isReady =
    areAddressesValid &&
    activeSubstrateAddress !== null &&
    initialBondAmount !== null &&
    execute !== null;

  const handleCreatePoolClick = useCallback(async () => {
    if (!isReady) {
      return;
    }

    const finalName = name.trim() === '' ? undefined : name.trim();
    const finalIconUrl = iconUrl.trim() === '' ? undefined : iconUrl.trim();

    await execute({
      name: finalName,
      iconUrl: finalIconUrl,
      initialBondAmount,
      rootAddress,
      nominatorAddress,
      bouncerAddress,
    });
  }, [
    bouncerAddress,
    execute,
    iconUrl,
    initialBondAmount,
    isReady,
    name,
    nominatorAddress,
    rootAddress,
  ]);

  // When the active address changes and it is set,
  // update the address inputs with the user's address
  // as the default value.
  useEffect(() => {
    if (activeSubstrateAddress !== null) {
      setRootAddress(activeSubstrateAddress);
      setNominatorAddress(activeSubstrateAddress);
      setBouncerAddress(activeSubstrateAddress);
    }
  }, [activeSubstrateAddress]);

  // Automatically close the modal when the transaction
  // is successful.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setIsOpen(false);
    }
  }, [setIsOpen, status]);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader>Create a Liquid Staking Pool</ModalHeader>

        <ModalBody className="gap-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row justify-stretch">
            <TextInput
              id="ls-create-pool-name"
              title="Pool Name (Optional)"
              placeholder="Choose a name"
              value={name}
              setValue={setName}
              wrapperOverrides={{ isFullWidth: true }}
            />

            <TextInput
              id="ls-create-pool-icon-url"
              title="Icon URL (Optional)"
              placeholder="https://example.com/icon.png"
              value={iconUrl}
              setValue={setIconUrl}
              wrapperOverrides={{ isFullWidth: true }}
            />
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row justify-stretch">
            <AmountInput
              id="ls-create-pool-initial-bond-amount"
              amount={initialBondAmount}
              setAmount={setInitialBondAmount}
              min={createPoolMinBond?.toBn() ?? null}
              max={freeBalance}
              maxErrorMessage={ERROR_NOT_ENOUGH_BALANCE}
              title="Initial Bond Amount"
              wrapperClassName="w-full"
              wrapperOverrides={{ isFullWidth: true }}
            />

            <LsProtocolDropdownInput
              id="ls-create-pool-protocol"
              isDerivativeVariant={false}
            />
          </div>

          <AddressInput
            id="ls-create-pool-root-address"
            title="Root Address"
            tooltip="The root is the administrator of the pool with full control over its operations, including updating roles, and commission setup."
            type={AddressType.SUBSTRATE_OR_EVM}
            value={rootAddress}
            setValue={setRootAddress}
            wrapperOverrides={{ isFullWidth: true }}
          />

          <AddressInput
            id="ls-create-pool-nominator-address"
            title="Nominator Address"
            tooltip="The nominator is responsible for selecting validators on behalf of the pool. Their role is critical in optimizing rewards for the pool members by choosing high-performing and secure validators."
            type={AddressType.SUBSTRATE_OR_EVM}
            value={nominatorAddress ?? ''}
            setValue={setNominatorAddress}
            wrapperOverrides={{ isFullWidth: true }}
          />

          <AddressInput
            id="ls-create-pool-bouncer-address"
            title="Bouncer Address"
            tooltip="The bouncer is responsible for managing the entry and exit of participants into the pool. They can block or allow participants, as well as manage pool access settings."
            type={AddressType.SUBSTRATE_OR_EVM}
            value={bouncerAddress ?? ''}
            setValue={setBouncerAddress}
            wrapperOverrides={{ isFullWidth: true }}
          />

          {/**
           * In case that a testnet is selected, it's helpful to let the users
           * know that the pool will be created on the testnet, and that
           * it won't be accessible on other networks.
           */}
          {network !== undefined && network.id !== NetworkId.TANGLE_MAINNET && (
            <Alert
              type="info"
              description={`This liquid staking pool will be created on ${network.name} and will not be accessible on other networks.`}
            />
          )}
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_LS_CREATE_POOL_URL}
          isProcessing={status === TxStatus.PROCESSING}
          onConfirm={handleCreatePoolClick}
          isConfirmDisabled={!isReady}
        />
      </ModalContent>
    </Modal>
  );
};

export default LsCreatePoolModal;
