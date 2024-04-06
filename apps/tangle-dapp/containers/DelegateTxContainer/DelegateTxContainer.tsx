'use client';

import { BN } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  Alert,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import {
  STAKING_PRECOMPILE_LINK,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useState } from 'react';

import { TxConfirmationModal } from '../../components/TxConfirmationModal';
import { PAYMENT_DESTINATION_OPTIONS as PAYEE_OPTIONS } from '../../constants';
import useNetworkStore from '../../context/useNetworkStore';
import usePaymentDestination from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useTokenWalletBalance from '../../data/NominatorStats/useTokenWalletBalance';
import useBondExtraTx from '../../data/staking/useBondExtraTx';
import useBondTx from '../../data/staking/useBondTx';
import useNominateTx from '../../data/staking/useNominateTx';
import useSetPayeeTx from '../../data/staking/useSetPayeeTx';
import useAllValidators from '../../data/ValidatorTables/useAllValidators';
import useErrorReporting from '../../hooks/useErrorReporting';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import useIsBondedOrNominating from '../../hooks/useIsBondedOrNominating';
import useMaxNominationQuota from '../../hooks/useMaxNominationQuota';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { StakingPayee } from '../../types';
import {
  bondExtraTokens as bondExtraTokensEvm,
  bondTokens as bondTokensEvm,
  nominateValidators as nominateValidatorsEvm,
  updatePaymentDestination as updatePaymentDestinationEvm,
} from '../../utils/evm';
import {
  bondExtraTokens as bondExtraTokensSubstrate,
  bondTokens as bondTokensSubstrate,
  nominateValidators as nominateValidatorsSubstrate,
  updatePaymentDestination as updatePaymentDestinationSubstrate,
} from '../../utils/polkadot';
import SelectValidators from '../UpdateNominationsTxContainer/SelectValidators';
import AuthorizeTx from './AuthorizeTx';
import BondTokens from './BondTokens';
import { DelegateTxContainerProps, DelegateTxSteps } from './types';

const CONTRACT_FUNC = 'StakingInterface.sol';

const DelegateTxContainer: FC<DelegateTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const allValidators = useAllValidators();
  const maxNominationQuota = useMaxNominationQuota();
  const [amountToBond, setAmountToBond] = useState(0);
  const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
  const executeTx = useExecuteTxWithNotification();
  const activeSubstrateAddress = useSubstrateAddress();
  const { rpcEndpoint, nativeTokenSymbol } = useNetworkStore();
  const [payee, setPayee] = useState(StakingPayee.STAKED);

  const [txConfirmationModalIsOpen, setTxnConfirmationModalIsOpen] =
    useState(false);

  const [delegateTxStep, setDelegateTxStep] = useState(
    DelegateTxSteps.BOND_TOKENS
  );

  const [isSubmitAndSignTxLoading, setIsSubmitAndSignTxLoading] =
    useState(false);

  const isExceedingMaxNominationQuota =
    selectedValidators.length > maxNominationQuota;

  const [txStatus, setTxnStatus] = useState<{
    status: 'success' | 'error';
    hash: string;
  }>({
    status: 'error',
    hash: '',
  });

  const currentStep = (() => {
    switch (delegateTxStep) {
      case DelegateTxSteps.BOND_TOKENS:
        return '(1/3)';
      case DelegateTxSteps.SELECT_DELEGATES:
        return '(2/3)';
      case DelegateTxSteps.AUTHORIZE_TX:
        return '(3/3)';
    }
  })();

  const walletAddress = (() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  })();

  const {
    isBondedOrNominating,
    isLoading: isBondedOrNominatingLoading,
    isError: isBondedOrNominatingError,
  } = useIsBondedOrNominating();

  const { data: walletBalance, error: walletBalanceError } =
    useTokenWalletBalance(walletAddress);

  // TODO: Need to change defaulting to empty/dummy strings to instead adhere to the type system. Ex. should be using `| null` instead.
  const {
    data: currentPaymentDestination,
    error: currentPaymentDestinationError,
  } = usePaymentDestination(activeSubstrateAddress ?? '0x0');

  useErrorReporting(null, walletBalanceError);

  const amountToBondError = (() => {
    if (!walletBalance) {
      return '';
    }

    if (Number(walletBalance.value1) === 0) {
      return `You have zero ${nativeTokenSymbol} in your wallet!`;
    } else if (Number(walletBalance.value1) < amountToBond) {
      return `You don't have enough ${nativeTokenSymbol} in your wallet!`;
    }
  })();

  const canContinueToSelectDelegatesStep = !isBondedOrNominating
    ? amountToBond > 0
    : true && !amountToBondError && payee && walletAddress !== '0x0'
    ? true
    : false;

  const canContinueToAuthorizeTxStep =
    selectedValidators.length > 0 && !isExceedingMaxNominationQuota
      ? true
      : false;

  const canContinueToSignAndSubmitTx =
    canContinueToSelectDelegatesStep && canContinueToAuthorizeTxStep;

  const closeModal = useCallback(() => {
    setIsSubmitAndSignTxLoading(false);
    setIsModalOpen(false);
    setAmountToBond(0);
    setPayee(StakingPayee.STAKED);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const executeDelegate: () => Promise<void> = useCallback(async () => {
    try {
      if (isBondedOrNominating) {
        await executeTx(
          () => bondTokensEvm(walletAddress, amountToBond, StakingPayee.STASH),
          () =>
            bondTokensSubstrate(
              rpcEndpoint,
              walletAddress,
              amountToBond,
              StakingPayee.STASH
            ),
          `Successfully bonded ${amountToBond} ${nativeTokenSymbol}.`,
          'Failed to bond tokens!'
        );
        await executeTx(
          () => updatePaymentDestinationEvm(walletAddress, payee),
          () =>
            updatePaymentDestinationSubstrate(
              rpcEndpoint,
              walletAddress,
              payee
            ),
          `Successfully updated payment destination to ${payee}.`,
          'Failed to update payment destination!'
        );
        const hash = await executeTx(
          () => nominateValidatorsEvm(walletAddress, selectedValidators),
          () =>
            nominateValidatorsSubstrate(
              rpcEndpoint,
              walletAddress,
              selectedValidators
            ),
          `Successfully nominated ${selectedValidators.length} validators.`,
          'Failed to nominate validators!'
        );
        setTxnStatus({ status: 'success', hash });
      } else {
        if (amountToBond > 0) {
          await executeTx(
            () => bondExtraTokensEvm(walletAddress, amountToBond),
            () =>
              bondExtraTokensSubstrate(
                rpcEndpoint,
                walletAddress,
                amountToBond
              ),
            `Successfully bonded ${amountToBond} ${nativeTokenSymbol}.`,
            'Failed to bond tokens!'
          );
        }
        if (currentPaymentDestinationError)
          notificationApi({
            variant: 'error',
            message: currentPaymentDestinationError.message,
          });
        const currPaymentDestination =
          currentPaymentDestination?.value1 === 'Staked'
            ? StakingPayee.STAKED
            : StakingPayee.STASH;
        if (currPaymentDestination !== payee) {
          await executeTx(
            () => updatePaymentDestinationEvm(walletAddress, payee),
            () =>
              updatePaymentDestinationSubstrate(
                rpcEndpoint,
                walletAddress,
                payee
              ),
            `Successfully updated payment destination to ${payee}.`,
            'Failed to update payment destination!'
          );
        }
        const hash = await executeTx(
          () => nominateValidatorsEvm(walletAddress, selectedValidators),
          () =>
            nominateValidatorsSubstrate(
              rpcEndpoint,
              walletAddress,
              selectedValidators
            ),
          `Successfully nominated ${selectedValidators.length} validator(s).`,
          'Failed to nominate validator(s)!'
        );
        setTxnStatus({ status: 'success', hash });
      }
      setTxnConfirmationModalIsOpen(true);
    } catch {
      setTxnStatus({ status: 'error', hash: '' });
      setTxnConfirmationModalIsOpen(true);
    }
  }, [
    amountToBond,
    currentPaymentDestination?.value1,
    currentPaymentDestinationError,
    executeTx,
    isBondedOrNominating,
    nativeTokenSymbol,
    notificationApi,
    payee,
    rpcEndpoint,
    selectedValidators,
    walletAddress,
  ]);

  const { execute: executeBondTx } = useBondTx();
  const { execute: executeSetPayeeTx } = useSetPayeeTx();
  const { execute: executeNominateTx } = useNominateTx();
  const { execute: executeBondExtraTx } = useBondExtraTx();

  const executeDelegate2 = useCallback(async () => {
    // Not yet ready.
    if (
      executeBondTx === null ||
      executeSetPayeeTx === null ||
      executeNominateTx === null ||
      executeBondExtraTx === null ||
      isBondedOrNominating === null
    ) {
      return;
    }

    const amount = new BN(amountToBond);

    if (!isBondedOrNominating) {
      (await executeBondTx({ amount, payee })) &&
        (await executeSetPayeeTx({ payee })) &&
        (await executeNominateTx({ validatorAddresses: selectedValidators }));
    } else {
      if (!amount.isZero()) {
        const bondingExtraSucceeded = await executeBondExtraTx({ amount });

        // Stop early; something went wrong.
        if (!bondingExtraSucceeded) {
          return;
        }
      }

      const currentPayee =
        currentPaymentDestination?.value1 === 'Staked'
          ? StakingPayee.STAKED
          : StakingPayee.STASH;

      // Update the payee if it has changed.
      if (payee !== currentPayee) {
        const setPayeeSucceeded = await executeSetPayeeTx({ payee });

        if (!setPayeeSucceeded) {
          return;
        }
      }

      await executeNominateTx({ validatorAddresses: selectedValidators });
    }
  }, [
    amountToBond,
    currentPaymentDestination?.value1,
    executeBondExtraTx,
    executeBondTx,
    executeNominateTx,
    executeSetPayeeTx,
    isBondedOrNominating,
    payee,
    selectedValidators,
  ]);

  const submitAndSignTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    try {
      await executeDelegate2();
    } catch {
      // notification is already handled in executeTx
    } finally {
      closeModal();
    }
  }, [closeModal, executeDelegate2]);

  if (
    isBondedOrNominating == null ||
    isBondedOrNominatingLoading ||
    isBondedOrNominatingError
  ) {
    return null;
  }

  return (
    <>
      <Modal open>
        <ModalContent
          isCenter
          isOpen={isModalOpen}
          className="w-full max-w-[1000px] rounded-2xl bg-mono-0 dark:bg-mono-180"
        >
          <ModalHeader titleVariant="h4" onClose={closeModal}>
            Setup Nominator {currentStep}
          </ModalHeader>

          <div className="px-8 py-6">
            {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
              <BondTokens
                isBondedOrNominating={isBondedOrNominating}
                nominatorAddress={walletAddress}
                amountToBond={amountToBond}
                setAmountToBond={setAmountToBond}
                amountToBondError={amountToBondError}
                amountWalletBalance={
                  walletBalance && walletBalance.value1
                    ? walletBalance.value1
                    : 0
                }
                payeeOptions={PAYEE_OPTIONS}
                payee={payee}
                setPayee={setPayee}
                tokenSymbol={nativeTokenSymbol}
              />
            ) : delegateTxStep === DelegateTxSteps.SELECT_DELEGATES ? (
              <SelectValidators
                validators={allValidators}
                selectedValidators={selectedValidators}
                setSelectedValidators={setSelectedValidators}
              />
            ) : delegateTxStep === DelegateTxSteps.AUTHORIZE_TX ? (
              <AuthorizeTx
                nominatorAddress={walletAddress}
                contractFunc={CONTRACT_FUNC}
                contractLink={STAKING_PRECOMPILE_LINK}
              />
            ) : null}

            {isExceedingMaxNominationQuota && (
              <Alert
                type="error"
                className="mt-4"
                description={`You can only nominate up to ${maxNominationQuota} validators.`}
              />
            )}
          </div>

          <ModalFooter className="px-8 py-6 flex flex-col gap-1">
            {delegateTxStep !== DelegateTxSteps.AUTHORIZE_TX ? (
              <Button
                isFullWidth
                isDisabled={
                  (delegateTxStep === DelegateTxSteps.BOND_TOKENS &&
                    !canContinueToSelectDelegatesStep) ||
                  (delegateTxStep === DelegateTxSteps.SELECT_DELEGATES &&
                    !canContinueToAuthorizeTxStep)
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
                  : amountToBond > 0
                  ? 'Stake & Nominate'
                  : 'Nominate'}
              </Button>
            ) : (
              <Button
                isFullWidth
                isDisabled={
                  delegateTxStep === DelegateTxSteps.AUTHORIZE_TX &&
                  !canContinueToSignAndSubmitTx
                }
                isLoading={isSubmitAndSignTxLoading}
                onClick={submitAndSignTx}
              >
                Confirm
              </Button>
            )}

            {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
              <Link href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
                <Button isFullWidth variant="secondary">
                  Learn More
                </Button>
              </Link>
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

      <TxConfirmationModal
        isModalOpen={txConfirmationModalIsOpen}
        setIsModalOpen={setTxnConfirmationModalIsOpen}
        txStatus={txStatus.status}
        txHash={txStatus.hash}
        txType={isSubstrateAddress(walletAddress) ? 'substrate' : 'evm'}
      />
    </>
  );
};

export default DelegateTxContainer;
