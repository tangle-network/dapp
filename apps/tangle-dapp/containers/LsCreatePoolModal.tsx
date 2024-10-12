import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import {
  Alert,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TANGLE_DOCS_LS_CREATE_POOL_URL,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useState } from 'react';

import AddressInput, {
  AddressType,
} from '../components/AddressInput/AddressInput';
import AmountInput from '../components/AmountInput/AmountInput';
import { LsNetworkId, LsProtocolId } from '../constants/liquidStaking/types';
import useBalances from '../data/balances/useBalances';
import useLsCreatePoolTx from '../data/liquidStaking/tangle/useLsCreatePoolTx';
import { useLsStore } from '../data/liquidStaking/useLsStore';
import useInputAmount from '../hooks/useInputAmount';
import useSubstrateAddress from '../hooks/useSubstrateAddress';
import { TxStatus } from '../hooks/useSubstrateTx';
import { SubstrateAddress } from '../types/utils';
import getLsNetwork from '../utils/liquidStaking/getLsNetwork';
import getLsProtocolDef from '../utils/liquidStaking/getLsProtocolDef';

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
  const [rootAddress, setRootAddress] = useState(activeSubstrateAddress);
  const { free: freeBalance } = useBalances();

  const [nominatorAddress, setNominatorAddress] =
    useState<SubstrateAddress | null>(activeSubstrateAddress);

  const [bouncerAddress, setBouncerAddress] = useState<SubstrateAddress | null>(
    activeSubstrateAddress,
  );

  const [initialBondAmount, setInitialBondAmount] = useState<BN | null>(null);
  const [lsProtocolId, setLsProtocolId] = useState<LsProtocolId | null>(null);
  const { lsNetworkId } = useLsStore();

  const lsProtocol =
    lsProtocolId === null ? null : getLsProtocolDef(lsProtocolId);

  const lsNetwork = getLsNetwork(lsNetworkId);

  const { displayAmount, errorMessage } = useInputAmount({
    amount: initialBondAmount,
    setAmount: setInitialBondAmount,
    // Default to TNT's decimals if the protocol hasn't been selected
    // yet.
    decimals: lsProtocol?.decimals ?? TANGLE_TOKEN_DECIMALS,
  });

  // TODO: Also add Restaking Parachain when its non-testnet version is available.
  const isLiveNetwork = lsNetworkId === LsNetworkId.TANGLE_MAINNET;

  const { execute, status } = useLsCreatePoolTx();

  const handleCreatePoolClick = useCallback(async () => {
    // TODO: Add form validation, then remove this check.
    if (
      initialBondAmount === null ||
      rootAddress === null ||
      nominatorAddress === null ||
      bouncerAddress === null
    ) {
      return;
    }

    assert(
      execute !== null,
      'Button should have been disabled if execute is null.',
    );

    await execute({
      name,
      initialBondAmount,
      rootAddress,
      nominatorAddress,
      bouncerAddress,
    });
  }, [
    bouncerAddress,
    execute,
    initialBondAmount,
    name,
    nominatorAddress,
    rootAddress,
  ]);

  return (
    <Modal open={isOpen}>
      <ModalContent isCenter isOpen={isOpen} className="w-full max-w-[700px]">
        <ModalHeader onClose={() => setIsOpen(false)}>
          Create a Liquid Staking Pool
        </ModalHeader>

        <div className="p-9 space-y-8">
          <div className="flex flex-col items-center gap-4">
            {/**
             * In case that a testnet is selected, it's helpful to let the users
             * know that the pool will be created on the testnet, and that
             * it won't be accessible on other networks.
             */}
            {!isLiveNetwork && (
              <Alert
                type="info"
                title="Note"
                description={`This liquid staking pool will be created on ${lsNetwork.networkName} and will not be accessible on other networks.`}
              />
            )}

            <Input
              id="ls-create-pool-name"
              placeholder="Name"
              value={name}
              onChange={setName}
            />

            {/** TODO: Protocol selection dropdown. */}

            <AmountInput
              id="ls-create-pool-initial-bond-amount"
              amount={initialBondAmount}
              setAmount={setInitialBondAmount}
              max={freeBalance}
              title="Initial Bond Amount"
              wrapperClassName="w-full"
            />

            <AddressInput
              id="ls-create-pool-root-address"
              title="Root Address"
              tooltip="The root is the administrator of the pool with full control over its operations, including updating roles, and commission setup"
              type={AddressType.Substrate}
              value={rootAddress ?? ''}
              setValue={setRootAddress}
              wrapperClassName="w-full"
            />

            <AddressInput
              id="ls-create-pool-nominator-address"
              title="Nominator Address"
              tooltip="The nominator is responsible for selecting validators on behalf of the pool. Their role is critical in optimizing rewards for the pool members by choosing high-performing and secure validators."
              type={AddressType.Substrate}
              value={nominatorAddress ?? ''}
              setValue={setNominatorAddress}
              wrapperClassName="w-full"
            />

            <AddressInput
              id="ls-create-pool-bouncer-address"
              title="Bouncer Address"
              tooltip="The bouncer is responsible for managing the entry and exit of participants into the pool. They can block or allow participants, as well as manage pool access settings."
              type={AddressType.Substrate}
              value={nominatorAddress ?? ''}
              setValue={setNominatorAddress}
              wrapperClassName="w-full"
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
