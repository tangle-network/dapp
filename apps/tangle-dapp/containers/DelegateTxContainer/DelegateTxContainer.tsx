import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback, useMemo, useState } from 'react';

import { bondAndNominate } from '../../constants/evm';
import useValidators from '../../data/DelegateFlow/useValidators';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import { PaymentDestination } from '../../types';
import AuthorizeTx from './AuthorizeTx';
import BondTokens from './BondTokens';
import SelectDelegates from './SelectDelegates';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const PAYMENT_DESTINATION_OPTIONS = [
  'Current account (increase the amount at stake)',
  'Current account (do not increase the amount at stake)',
];

const CONTRACT_LINK =
  'https://github.com/webb-tools/tangle/blob/main/precompiles/staking/StakingInterface.sol';

const CONTRACT_FUNC = 'StakingInterface.sol';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { activeAccount } = useWebContext();

  const { data: validators } = useValidators();

  const [delegateTxStep, setDelegateTxStep] = useState<DelegateTxSteps>(
    DelegateTxSteps.BOND_TOKENS
  );

  const currentStep = useMemo(() => {
    if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
      return '(1/3)';
    } else if (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES) {
      return '(2/3)';
    } else if (delegateTxStep === DelegateTxSteps.AUTHORIZE_TX) {
      return '(3/3)';
    }
  }, [delegateTxStep]);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const { data: walletBalance } = useTokenWalletBalance(walletAddress);

  const [amountToBond, setAmountToBond] = useState<number>(0);

  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.AUTO_COMPOUND
  );

  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);

  const amountToBondError = useMemo(() => {
    if (!walletBalance) return '';

    if (Number(walletBalance.value1) === 0) {
      return 'You have zero tTNT in your wallet!';
    } else if (Number(walletBalance.value1) < amountToBond) {
      return `You don't have enough tTNT in your wallet!`;
    }
  }, [walletBalance, amountToBond]);

  const continueToSelectDelegatesStep = useMemo(() => {
    return amountToBond > 0 &&
      !amountToBondError &&
      paymentDestination &&
      walletAddress !== '0x0'
      ? true
      : false;
  }, [amountToBond, amountToBondError, paymentDestination, walletAddress]);

  const continueToAuthorizeTxStep = useMemo(() => {
    return selectedValidators.length > 0 ? true : false;
  }, [selectedValidators]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return continueToSelectDelegatesStep && continueToAuthorizeTxStep;
  }, [continueToSelectDelegatesStep, continueToAuthorizeTxStep]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setAmountToBond(0);
    setPaymentDestination(PaymentDestination.AUTO_COMPOUND);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    await bondAndNominate(
      walletAddress,
      selectedValidators,
      amountToBond,
      paymentDestination
    );
  }, [walletAddress, amountToBond, selectedValidators, paymentDestination]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[838px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Setup Delegator {currentStep}
        </ModalHeader>

        <div className="px-8 py-6">
          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <BondTokens
              nominatorAddress={walletAddress}
              amountToBond={amountToBond}
              setAmountToBond={setAmountToBond}
              amountToBondError={amountToBondError}
              amountWalletBalance={
                walletBalance && walletBalance.value1 ? walletBalance.value1 : 0
              }
              paymentDestinationOptions={PAYMENT_DESTINATION_OPTIONS}
              paymentDestination={paymentDestination}
              setPaymentDestination={setPaymentDestination}
            />
          ) : delegateTxStep === DelegateTxSteps.SELECT_DELEGATES ? (
            <SelectDelegates
              validators={validators ? validators.validators : []}
              selectedValidators={selectedValidators}
              setSelectedValidators={setSelectedValidators}
            />
          ) : delegateTxStep === DelegateTxSteps.AUTHORIZE_TX ? (
            <AuthorizeTx
              nominatorAddress={walletAddress}
              contractFunc={CONTRACT_FUNC}
              contractLink={CONTRACT_LINK}
              amountToBond={amountToBond}
            />
          ) : null}
        </div>

        <ModalFooter className="px-8 py-6">
          {delegateTxStep !== DelegateTxSteps.AUTHORIZE_TX ? (
            <Button
              isFullWidth
              isDisabled={
                (delegateTxStep === DelegateTxSteps.BOND_TOKENS &&
                  !continueToSelectDelegatesStep) ||
                (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES &&
                  !continueToAuthorizeTxStep)
              }
              onClick={() => {
                if (delegateTxStep === DelegateTxSteps.BOND_TOKENS) {
                  setDelegateTxStep(DelegateTxSteps.SELECT_DELEGATES);
                } else if (
                  delegateTxStep === DelegateTxSteps.SELECT_DELEGATES
                ) {
                  setDelegateTxStep(DelegateTxSteps.AUTHORIZE_TX);
                }
              }}
            >
              {delegateTxStep === DelegateTxSteps.BOND_TOKENS
                ? 'Next'
                : 'Stake & Delegate'}
            </Button>
          ) : (
            <Button
              isFullWidth
              isDisabled={
                delegateTxStep === DelegateTxSteps.AUTHORIZE_TX &&
                !continueToSignAndSubmitTx
              }
              onClick={submitAndSignTx}
            >
              Sign & Submit
            </Button>
          )}

          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <Button isFullWidth variant="secondary">
              Learn More
            </Button>
          ) : (
            <Button
              isFullWidth
              variant="secondary"
              onClick={() => {
                if (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES) {
                  setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
                } else if (delegateTxStep === DelegateTxSteps.AUTHORIZE_TX) {
                  setDelegateTxStep(DelegateTxSteps.SELECT_DELEGATES);
                }
              }}
            >
              Go Back
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DelegateTxContainer;
