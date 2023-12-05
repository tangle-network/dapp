import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { STAKING_PRECOMPILE_LINK } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useMemo, useState } from 'react';

import {
  bondExtraTokens,
  bondTokens,
  isNominatorAlreadyBonded,
  nominateValidators,
  PAYMENT_DESTINATION_OPTIONS,
} from '../../constants';
import useValidators from '../../data/DelegateFlow/useValidators';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import { PaymentDestination } from '../../types';
import { convertEthereumToSubstrateAddress } from '../../utils';
import AuthorizeTx from './AuthorizeTx';
import BondTokens from './BondTokens';
import SelectDelegates from './SelectDelegates';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const CONTRACT_FUNC = 'StakingInterface.sol';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const { data: validators } = useValidators();

  const [delegateTxStep, setDelegateTxStep] = useState<DelegateTxSteps>(
    DelegateTxSteps.BOND_TOKENS
  );
  const [amountToBond, setAmountToBond] = useState<number>(0);
  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.AUTO_COMPOUND
  );
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState<boolean>(false);

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
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(0);
    setPaymentDestination(PaymentDestination.AUTO_COMPOUND);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    const substrateAddress = convertEthereumToSubstrateAddress(walletAddress);
    const isBonded = await isNominatorAlreadyBonded(substrateAddress);

    try {
      let bondtxHash = '';

      if (isBonded) {
        const bondExtraTokensTxHash = await bondExtraTokens(
          walletAddress,
          amountToBond
        );
        bondtxHash = bondExtraTokensTxHash;
      } else {
        const bondTokensTxHash = await bondTokens(
          walletAddress,
          amountToBond,
          paymentDestination
        );
        bondtxHash = bondTokensTxHash;
      }

      if (bondtxHash) {
        notificationApi({
          variant: 'success',
          message: `Successfully bonded ${amountToBond} tTNT.`,
        });
        const nominateTxHash = await nominateValidators(
          walletAddress,
          selectedValidators
        );

        if (nominateTxHash) {
          notificationApi({
            variant: 'success',
            message: `Successfully nominated ${selectedValidators.length} validators.`,
          });
        }

        closeModal();
      }
    } catch (e) {
      let message = 'Failed to bond tokens and nominate!';

      if (isViemError(e)) {
        message = e.shortMessage;
      }

      notificationApi({ variant: 'error', message });
      closeModal();
    }
  }, [
    amountToBond,
    closeModal,
    notificationApi,
    paymentDestination,
    selectedValidators,
    walletAddress,
  ]);

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
              contractLink={STAKING_PRECOMPILE_LINK}
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
              isLoading={isSubmitAndSignTxLoading}
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
