import { Cross1Icon } from '@radix-ui/react-icons';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import LockFillIcon from '@webb-tools/icons/LockFillIcon';
import { LockLineIcon } from '@webb-tools/icons/LockLineIcon';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import {
  Card,
  IconButton,
  useBreakpointValue,
} from '@webb-tools/webb-ui-components';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import ErrorMessage from '../../../components/ErrorMessage';
import RestakeDetailCard from '../../../components/RestakeDetailCard';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useIdentities from '../../../data/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { UnstakeFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import RestakeTabs from '../RestakeTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import SelectOperatorModal from '../../../containers/restaking/SelectOperatorModal';
import Details from './Details';
import UnstakeRequestTable from '../../../containers/restaking/UnstakeRequestTable';
import parseChainUnits from '../../../utils/parseChainUnits';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../../data/restake/useRestakeApi';

const RestakeUnstakeForm: FC = () => {
  const [isUnstakeRequestTableOpen, setIsUnstakeRequestTableOpen] =
    useState(false);

  const isMediumScreen = useBreakpointValue('md', true, false);

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UnstakeFormFields>({
    mode: 'onBlur',
  });

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();
  const { vaults } = useRestakeContext();

  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
    update: updateOperatorModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  // Register form fields on mount
  useEffect(() => {
    register('operatorAccountId', { required: true });
    register('assetId', { required: true });
  }, [register]);

  // Reset form when active chain changes
  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  const { delegatorInfo } = useRestakeDelegatorInfo();

  const { result: operatorIdentities } = useIdentities(
    useMemo(
      () =>
        delegatorInfo?.delegations?.map((item) => item.operatorAccountId) ?? [],
      [delegatorInfo?.delegations],
    ),
  );

  const selectedAssetId = watch('assetId');
  const selectedOperatorAccountId = watch('operatorAccountId');
  const amount = watch('amount');

  const unstakeRequests = useMemo(() => {
    if (!delegatorInfo?.unstakeRequests) {
      return [];
    }

    return delegatorInfo.unstakeRequests;
  }, [delegatorInfo?.unstakeRequests]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId || !vaults[selectedAssetId]) {
      return null;
    }

    return vaults[selectedAssetId];
  }, [vaults, selectedAssetId]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations)) {
      return {};
    }

    const selectedDelegation = delegatorInfo.delegations.find(
      (item) =>
        item.assetId === selectedAssetId &&
        item.operatorAccountId === selectedOperatorAccountId,
    );

    if (!selectedDelegation || !vaults[selectedDelegation.assetId]) {
      return {};
    }

    const maxAmount = selectedDelegation.amountBonded;

    const formattedMaxAmount = Number(
      formatUnits(maxAmount, vaults[selectedDelegation.assetId].decimals),
    );

    return {
      maxAmount,
      formattedMaxAmount,
    };
  }, [
    delegatorInfo?.delegations,
    vaults,
    selectedAssetId,
    selectedOperatorAccountId,
  ]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAsset?.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: getAmountValidation(
          step,
          '0',
          ZERO_BIG_INT,
          maxAmount,
          selectedAsset?.decimals,
          selectedAsset?.symbol,
        ),
      }),
    };
  }, [maxAmount, register, selectedAsset?.decimals, selectedAsset?.symbol]);

  const displayError = (() => {
    return errors.operatorAccountId !== undefined || !selectedOperatorAccountId
      ? 'Select an operator'
      : errors.assetId !== undefined || !selectedAssetId
        ? 'Select an asset'
        : !amount
          ? 'Enter an amount'
          : errors.amount !== undefined
            ? 'Invalid amount'
            : undefined;
  })();

  const restakeApi = useRestakeApi();

  const isReady = restakeApi !== null && !isSubmitting;

  const onSubmit = useCallback<SubmitHandler<UnstakeFormFields>>(
    async ({ amount, assetId, operatorAccountId }) => {
      if (!assetId || !isDefined(vaults[assetId]) || !isReady) {
        return;
      }

      const assetMetadata = vaults[assetId];
      const amountBn = parseChainUnits(amount, assetMetadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      await restakeApi.undelegate(operatorAccountId, assetId, amountBn);
    },
    [vaults, isReady, restakeApi],
  );

  return (
    <div className="flex flex-wrap items-start justify-center gap-4">
      <div>
        <RestakeTabs />

        <Card withShadow tightPadding className="relative min-w-[512px]">
          {!isUnstakeRequestTableOpen && isMediumScreen && (
            <ExpandTableButton
              className="absolute top-0 -right-10"
              tooltipContent="Open unstake requests table"
              onClick={() => setIsUnstakeRequestTableOpen(true)}
            />
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start justify-stretch">
              <TransactionInputCard.Root
                tokenSymbol={selectedAsset?.symbol}
                className="bg-mono-20 dark:bg-mono-180"
              >
                <TransactionInputCard.Header>
                  <TransactionInputCard.ChainSelector
                    placeholder="Select Operator"
                    onClick={openOperatorModal}
                    {...(selectedOperatorAccountId
                      ? {
                          renderBody: () => (
                            <AvatarWithText
                              accountAddress={selectedOperatorAccountId}
                              identityName={
                                operatorIdentities?.[selectedOperatorAccountId]
                                  ?.name
                              }
                              overrideTypographyProps={{ variant: 'h5' }}
                            />
                          ),
                        }
                      : {})}
                  />
                  <TransactionInputCard.MaxAmountButton
                    maxAmount={formattedMaxAmount}
                    tooltipBody="Delegated"
                    Icon={
                      useRef({
                        enabled: <LockLineIcon />,
                        disabled: <LockFillIcon />,
                      }).current
                    }
                  />
                </TransactionInputCard.Header>

                <TransactionInputCard.Body
                  customAmountProps={customAmountProps}
                  tokenSelectorProps={
                    useRef({
                      placeholder: <AssetPlaceholder />,
                      isDisabled: true,
                    }).current
                  }
                />
              </TransactionInputCard.Root>

              <ErrorMessage>{errors.amount?.message}</ErrorMessage>
            </div>

            <Details />

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
                    isDisabled={!isValid || isDefined(displayError) || !isReady}
                    type="submit"
                    isFullWidth
                    isLoading={isSubmitting || isLoading}
                    loadingText={loadingText}
                  >
                    {displayError ?? 'Schedule Unstake'}
                  </Button>
                );
              }}
            </ActionButtonBase>
          </form>
        </Card>
      </div>

      <AnimatedTable
        isTableOpen={isUnstakeRequestTableOpen}
        isMediumScreen={isMediumScreen}
      >
        <RestakeDetailCard.Root>
          <div className="flex items-center justify-between">
            <RestakeDetailCard.Header
              title={
                unstakeRequests.length > 0
                  ? 'Undelegate Requests'
                  : 'No Undelegate Requests'
              }
            />

            <IconButton onClick={() => setIsUnstakeRequestTableOpen(false)}>
              <Cross1Icon />
            </IconButton>
          </div>

          {unstakeRequests.length > 0 ? (
            <UnstakeRequestTable
              operatorIdentities={operatorIdentities}
              unstakeRequests={unstakeRequests}
            />
          ) : (
            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-100"
            >
              Once an undelegation request is submitted, it will appear on this
              table and can be executed after the unbonding period.
            </Typography>
          )}
        </RestakeDetailCard.Root>
      </AnimatedTable>

      <SelectOperatorModal
        delegatorInfo={delegatorInfo}
        isOpen={isOperatorModalOpen}
        setIsOpen={updateOperatorModal}
        operatorIdentities={operatorIdentities}
        onItemSelected={(item) => {
          closeOperatorModal();

          const { formattedAmount, assetId, operatorAccountId } = item;

          const commonOpts = {
            shouldDirty: true,
            shouldValidate: true,
          };

          setFormValue(
            'operatorAccountId',
            operatorAccountId as SubstrateAddress,
            commonOpts,
          );
          setFormValue('assetId', assetId, commonOpts);
          setFormValue('amount', formattedAmount, commonOpts);
        }}
      />

      <Modal open={isChainModalOpen} onOpenChange={updateChainModal}>
        <SupportedChainModal
          onClose={closeChainModal}
          onChainChange={async (chainConfig) => {
            const typedChainId = calculateTypedChainId(
              chainConfig.chainType,
              chainConfig.id,
            );
            await switchChain(typedChainId);
            closeChainModal();
          }}
        />
      </Modal>
    </div>
  );
};

export default RestakeUnstakeForm;
