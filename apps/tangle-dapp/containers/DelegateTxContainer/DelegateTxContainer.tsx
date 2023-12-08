'use client';

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
import {
  STAKING_PRECOMPILE_LINK,
  WEBB_TANGLE_DOCS_STAKING_URL,
} from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  bondExtraTokens,
  bondTokens,
  evmPublicClient,
  isNominatorFirstTimeNominator,
  nominateValidators,
  PAYMENT_DESTINATION_OPTIONS,
  updatePaymentDestination,
} from '../../constants';
import useValidators from '../../data/DelegateFlow/useValidators';
import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
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

  const [isFirstTimeNominator, setIsFirstTimeNominator] = useState(true);
  const [delegateTxStep, setDelegateTxStep] = useState<DelegateTxSteps>(
    DelegateTxSteps.BOND_TOKENS
  );
  const [amountToBond, setAmountToBond] = useState<number>(0);
  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.Staked
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

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    return convertEthereumToSubstrateAddress(activeAccount.address);
  }, [activeAccount?.address]);

  useEffect(() => {
    const checkIfFirstTimeNominator = async () => {
      const isFirstTimeNominator = await isNominatorFirstTimeNominator(
        substrateAddress
      );

      setIsFirstTimeNominator(isFirstTimeNominator);
    };

    if (substrateAddress) {
      checkIfFirstTimeNominator();
    }
  }, [substrateAddress]);

  const { data: walletBalance } = useTokenWalletBalance(walletAddress);
  const { data: currentPaymentDestination } =
    usePaymentDestinationSubscription(substrateAddress);

  const amountToBondError = useMemo(() => {
    if (!walletBalance) return '';

    if (Number(walletBalance.value1) === 0) {
      return 'You have zero tTNT in your wallet!';
    } else if (Number(walletBalance.value1) < amountToBond) {
      return `You don't have enough tTNT in your wallet!`;
    }
  }, [walletBalance, amountToBond]);

  const continueToSelectDelegatesStep = useMemo(() => {
    return isFirstTimeNominator
      ? amountToBond > 0
      : true &&
        !amountToBondError &&
        paymentDestination &&
        walletAddress !== '0x0'
      ? true
      : false;
  }, [
    amountToBond,
    amountToBondError,
    isFirstTimeNominator,
    paymentDestination,
    walletAddress,
  ]);

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
    setPaymentDestination(PaymentDestination.Staked);
    setSelectedValidators([]);
    setDelegateTxStep(DelegateTxSteps.BOND_TOKENS);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsSubmitAndSignTxLoading(true);

    try {
      if (isFirstTimeNominator) {
        const bondTxHash = await bondTokens(
          walletAddress,
          amountToBond,
          PaymentDestination.Stash
        );

        if (bondTxHash) {
          const bondTx = await evmPublicClient.waitForTransactionReceipt({
            hash: bondTxHash,
          });

          if (bondTx.status === 'success') {
            notificationApi({
              variant: 'success',
              message: `Successfully bonded ${amountToBond} tTNT.`,
            });

            const updatePaymentDestinationTxHash =
              await updatePaymentDestination(walletAddress, paymentDestination);

            if (updatePaymentDestinationTxHash) {
              const updatePaymentDestinationTx =
                await evmPublicClient.waitForTransactionReceipt({
                  hash: updatePaymentDestinationTxHash,
                });

              if (updatePaymentDestinationTx.status === 'success') {
                notificationApi({
                  variant: 'success',
                  message: `Successfully updated payment destination to ${paymentDestination}.`,
                });

                const nominateTxHash = await nominateValidators(
                  walletAddress,
                  selectedValidators
                );

                if (nominateTxHash) {
                  const nominateTx =
                    await evmPublicClient.waitForTransactionReceipt({
                      hash: nominateTxHash,
                    });

                  if (nominateTx.status === 'success') {
                    notificationApi({
                      variant: 'success',
                      message: `Successfully nominated ${selectedValidators.length} validators.`,
                    });

                    closeModal();
                  }
                }
              } else {
                notificationApi({
                  variant: 'error',
                  message: 'Failed to update payment destination!',
                });

                closeModal();
              }
            }
          } else {
            notificationApi({
              variant: 'error',
              message: 'Failed to bond tokens!',
            });

            closeModal();
          }
        }
      } else {
        if (amountToBond > 0) {
          const bondTxHash = await bondExtraTokens(walletAddress, amountToBond);

          if (bondTxHash) {
            const bondTx = await evmPublicClient.waitForTransactionReceipt({
              hash: bondTxHash,
            });

            if (bondTx.status === 'success') {
              notificationApi({
                variant: 'success',
                message: `Successfully bonded ${amountToBond} tTNT.`,
              });

              const currPaymentDestination =
                currentPaymentDestination?.value1 === 'Staked'
                  ? PaymentDestination.Staked
                  : PaymentDestination.Stash;

              if (currPaymentDestination !== paymentDestination) {
                const updatePaymentDestinationTxHash =
                  await updatePaymentDestination(
                    walletAddress,
                    paymentDestination
                  );

                if (updatePaymentDestinationTxHash) {
                  const updatePaymentDestinationTx =
                    await evmPublicClient.waitForTransactionReceipt({
                      hash: updatePaymentDestinationTxHash,
                    });

                  if (updatePaymentDestinationTx.status === 'success') {
                    notificationApi({
                      variant: 'success',
                      message: `Successfully updated payment destination to ${paymentDestination}.`,
                    });

                    const nominateTxHash = await nominateValidators(
                      walletAddress,
                      selectedValidators
                    );

                    if (nominateTxHash) {
                      const nominateTx =
                        await evmPublicClient.waitForTransactionReceipt({
                          hash: nominateTxHash,
                        });

                      if (nominateTx.status === 'success') {
                        notificationApi({
                          variant: 'success',
                          message: `Successfully nominated ${selectedValidators.length} validators.`,
                        });

                        closeModal();
                      } else {
                        notificationApi({
                          variant: 'error',
                          message: 'Failed to nominate validators!',
                        });

                        closeModal();
                      }
                    }
                  } else {
                    notificationApi({
                      variant: 'error',
                      message: 'Failed to update payment destination!',
                    });

                    closeModal();
                  }
                }
              } else {
                const nominateTxHash = await nominateValidators(
                  walletAddress,
                  selectedValidators
                );

                if (nominateTxHash) {
                  const nominateTx =
                    await evmPublicClient.waitForTransactionReceipt({
                      hash: nominateTxHash,
                    });

                  if (nominateTx.status === 'success') {
                    notificationApi({
                      variant: 'success',
                      message: `Successfully nominated ${selectedValidators.length} validators.`,
                    });

                    closeModal();
                  } else {
                    notificationApi({
                      variant: 'error',
                      message: 'Failed to nominate validators!',
                    });

                    closeModal();
                  }
                }
              }
            } else {
              notificationApi({
                variant: 'error',
                message: 'Failed to bond tokens!',
              });

              closeModal();
            }
          }
        } else {
          const nominateTxHash = await nominateValidators(
            walletAddress,
            selectedValidators
          );

          if (nominateTxHash) {
            const nominateTx = await evmPublicClient.waitForTransactionReceipt({
              hash: nominateTxHash,
            });

            if (nominateTx.status === 'success') {
              notificationApi({
                variant: 'success',
                message: `Successfully nominated ${selectedValidators.length} validators.`,
              });

              closeModal();
            } else {
              notificationApi({
                variant: 'error',
                message: 'Failed to nominate validators!',
              });

              closeModal();
            }
          }
        }
      }
    } catch (e) {
      if (isViemError(e)) {
        notificationApi({
          variant: 'error',
          message: e.shortMessage,
        });
      } else {
        notificationApi({
          variant: 'error',
          message: 'Something went wrong.',
        });
      }

      closeModal();
    }
  }, [
    amountToBond,
    closeModal,
    currentPaymentDestination,
    isFirstTimeNominator,
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
        className="w-full max-w-[1000px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Setup Nominator {currentStep}
        </ModalHeader>

        <div className="px-8 py-6">
          {delegateTxStep === DelegateTxSteps.BOND_TOKENS ? (
            <BondTokens
              isFirstTimeNominator={isFirstTimeNominator}
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
            />
          ) : null}
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
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
  );
};

export default DelegateTxContainer;
