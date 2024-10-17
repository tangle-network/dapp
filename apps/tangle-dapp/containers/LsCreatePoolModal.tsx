import { BN } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TANGLE_DOCS_LS_CREATE_POOL_URL,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import AddressInput, { AddressType } from '../components/AddressInput';
import AmountInput from '../components/AmountInput';
import LsProtocolDropdownInput from '../components/LiquidStaking/LsProtocolDropdownInput';
import TextInput from '../components/TextInput';
import { LsNetworkId, LsProtocolId } from '../constants/liquidStaking/types';
import useBalances from '../data/balances/useBalances';
import useLsCreatePoolTx from '../data/liquidStaking/tangle/useLsCreatePoolTx';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import useSubstrateAddress from '../hooks/useSubstrateAddress';
import { TxStatus } from '../hooks/useSubstrateTx';
import assertSubstrateAddress from '../utils/assertSubstrateAddress';
import getLsNetwork from '../utils/liquidStaking/getLsNetwork';
import { ERROR_NOT_ENOUGH_BALANCE } from './ManageProfileModalContainer/Independent/IndependentAllocationInput';

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
  const { free: freeBalance } = useBalances();
  const [rootAddress, setRootAddress] = useState('');
  const [nominatorAddress, setNominatorAddress] = useState('');
  const [bouncerAddress, setBouncerAddress] = useState('');

  const [initialBondAmount, setInitialBondAmount] = useState<BN | null>(null);
  const [protocolId, setProtocolId] = useState<LsProtocolId | null>(null);
  const { lsNetworkId } = useLsStore();

  const lsNetwork = getLsNetwork(lsNetworkId);

  // TODO: Also add Restaking Parachain when its non-testnet version is available.
  const isLiveNetwork = lsNetworkId === LsNetworkId.TANGLE_MAINNET;

  const { execute, status } = useLsCreatePoolTx();

  const isSubstrateAddresses =
    isAddress(rootAddress) &&
    isAddress(nominatorAddress) &&
    isAddress(bouncerAddress);

  const handleCreatePoolClick = useCallback(async () => {
    if (
      initialBondAmount === null ||
      !isSubstrateAddresses ||
      execute === null
    ) {
      return;
    }

    await execute({
      name,
      initialBondAmount,
      rootAddress: assertSubstrateAddress(rootAddress),
      nominatorAddress: assertSubstrateAddress(nominatorAddress),
      bouncerAddress: assertSubstrateAddress(bouncerAddress),
    });
  }, [
    bouncerAddress,
    execute,
    initialBondAmount,
    isSubstrateAddresses,
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
    <Modal open={isOpen}>
      <ModalContent isCenter isOpen={isOpen} className="w-full max-w-[740px]">
        <ModalHeader onClose={() => setIsOpen(false)}>
          Create a Liquid Staking Pool
        </ModalHeader>

        <div className="p-9 space-y-8">
          <div className="flex flex-col items-stretch justify-center gap-4">
            {/**
             * In case that a testnet is selected, it's helpful to let the users
             * know that the pool will be created on the testnet, and that
             * it won't be accessible on other networks.
             */}
            {!isLiveNetwork && (
              <Alert
                type="info"
                description={`This liquid staking pool will be created on ${lsNetwork.networkName} and will not be accessible on other networks.`}
              />
            )}

            <div className="flex items-center justify-stretch gap-2">
              <TextInput
                id="ls-create-pool-name"
                title="Pool Name"
                placeholder="Choose a name"
                value={name}
                setValue={setName}
                wrapperOverrides={{ isFullWidth: true }}
              />

              <LsProtocolDropdownInput
                id="ls-create-pool-protocol"
                networkId={lsNetworkId}
                protocolId={protocolId ?? lsNetwork.defaultProtocolId}
                setProtocolId={setProtocolId}
                isDerivativeVariant={false}
              />
            </div>

            {/** TODO: Protocol selection dropdown. */}

            <AmountInput
              id="ls-create-pool-initial-bond-amount"
              amount={initialBondAmount}
              setAmount={setInitialBondAmount}
              max={freeBalance}
              maxErrorMessage={ERROR_NOT_ENOUGH_BALANCE}
              title="Initial Bond Amount"
              wrapperClassName="w-full"
              wrapperOverrides={{ isFullWidth: true }}
            />

            <AddressInput
              id="ls-create-pool-root-address"
              title="Root Address"
              tooltip="The root is the administrator of the pool with full control over its operations, including updating roles, and commission setup"
              type={AddressType.Substrate}
              value={rootAddress}
              setValue={setRootAddress}
              wrapperOverrides={{ isFullWidth: true }}
            />

            <AddressInput
              id="ls-create-pool-nominator-address"
              title="Nominator Address"
              tooltip="The nominator is responsible for selecting validators on behalf of the pool. Their role is critical in optimizing rewards for the pool members by choosing high-performing and secure validators."
              type={AddressType.Substrate}
              value={nominatorAddress ?? ''}
              setValue={setNominatorAddress}
              wrapperOverrides={{ isFullWidth: true }}
            />

            <AddressInput
              id="ls-create-pool-bouncer-address"
              title="Bouncer Address"
              tooltip="The bouncer is responsible for managing the entry and exit of participants into the pool. They can block or allow participants, as well as manage pool access settings."
              type={AddressType.Substrate}
              value={bouncerAddress ?? ''}
              setValue={setBouncerAddress}
              wrapperOverrides={{ isFullWidth: true }}
            />
          </div>
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            variant="secondary"
            target="_blank"
            href={TANGLE_DOCS_LS_CREATE_POOL_URL}
          >
            Learn More
          </Button>

          <Button
            isDisabled={
              !isSubstrateAddresses ||
              activeSubstrateAddress === null ||
              initialBondAmount === null ||
              name === '' ||
              execute === null
            }
            onClick={handleCreatePoolClick}
            isLoading={execute === null || status === TxStatus.PROCESSING}
            loadingText="Processing"
            isFullWidth
          >
            Create Pool
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LsCreatePoolModal;
