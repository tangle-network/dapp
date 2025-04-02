import { BN } from '@polkadot/util';
import { Cross1Icon } from '@radix-ui/react-icons';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { DelegatorUnstakeRequest } from '@tangle-network/tangle-shared-ui/types/restake';
import { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { Card, IconButton } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import ErrorMessage from '../../../components/ErrorMessage';
import RestakeDetailCard from '../../../components/RestakeDetailCard';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import SelectOperatorModal from '../../../containers/restaking/SelectOperatorModal';
import UnstakeRequestTable from '../../../containers/restaking/UnstakeRequestTable';
import useRestakeApi from '../../../data/restake/useRestakeApi';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { UnstakeFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import parseChainUnits from '../../../utils/parseChainUnits';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import RestakeTabs from '../RestakeTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useNativeRestakeUnstakeTx from '../../../data/restake/useNativeRestakeUnstakeTx';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';

const RestakeUnstakeForm: FC = () => {
  const [isUnstakeRequestTableOpen, setIsUnstakeRequestTableOpen] =
    useState(false);

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
  const { assets } = useRestakeAssets();

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
    if (!selectedAssetId || assets === null) {
      return null;
    }

    return assets.get(selectedAssetId) ?? null;
  }, [assets, selectedAssetId]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations) || assets === null) {
      return {};
    }

    const selectedDelegation = delegatorInfo.delegations.find(
      (item) =>
        item.assetId === selectedAssetId &&
        item.operatorAccountId === selectedOperatorAccountId,
    );

    if (selectedDelegation === undefined) {
      return {};
    }

    const selectedDelegationAsset = assets.get(selectedDelegation.assetId);

    if (selectedDelegationAsset === undefined) {
      return {};
    }

    const maxAmount = selectedDelegation.amountBonded;

    // TODO: This should not be a number.
    const formattedMaxAmount = Number(
      formatUnits(maxAmount, selectedDelegationAsset.metadata.decimals),
    );

    return {
      maxAmount,
      formattedMaxAmount,
    };
  }, [
    delegatorInfo?.delegations,
    assets,
    selectedAssetId,
    selectedOperatorAccountId,
  ]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAsset?.metadata.decimals);

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
          selectedAsset?.metadata.decimals,
          selectedAsset?.metadata.symbol,
        ),
      }),
    };
  }, [
    maxAmount,
    register,
    selectedAsset?.metadata.decimals,
    selectedAsset?.metadata.symbol,
  ]);

  const displayError = (() => {
    return errors.operatorAccountId !== undefined || !selectedOperatorAccountId
      ? 'Select Operator'
      : errors.assetId !== undefined || !selectedAssetId
        ? 'Select Asset'
        : !amount
          ? 'Enter Amount'
          : errors.amount !== undefined
            ? 'Invalid Amount'
            : undefined;
  })();

  const restakeApi = useRestakeApi();

  const { execute: executeNativeUnstakeTx, status: nativeUnstakeTxStatus } =
    useNativeRestakeUnstakeTx();

  const isTransacting =
    isSubmitting || nativeUnstakeTxStatus === TxStatus.PROCESSING;

  const isReady =
    restakeApi !== null &&
    !isTransacting &&
    assets !== null &&
    executeNativeUnstakeTx !== null;

  const onSubmit = useCallback<SubmitHandler<UnstakeFormFields>>(
    async ({ amount, assetId, operatorAccountId }) => {
      const asset = assets?.get(assetId);

      if (!assetId || !isReady || asset === undefined) {
        return;
      }

      const amountBn = parseChainUnits(amount, asset.metadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      // Native restaking's unstake operation is handled through a separate
      // extrinsic.
      if (assetId === NATIVE_ASSET_ID) {
        await executeNativeUnstakeTx({
          amount: amountBn,
          operatorAddress: operatorAccountId,
        });
      } else {
        await restakeApi.undelegate(operatorAccountId, assetId, amountBn);
      }

      setFormValue('amount', '', { shouldValidate: false });
      setFormValue('assetId', '0x0', { shouldValidate: false });

      setFormValue('operatorAccountId', '' as SubstrateAddress, {
        shouldValidate: false,
      });
    },
    [assets, executeNativeUnstakeTx, isReady, restakeApi, setFormValue],
  );

  return (
    <div className="grid items-start justify-center gap-4 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <div>
        <RestakeTabs />

        <Card withShadow tightPadding className="relative md:min-w-[512px]">
          {!isUnstakeRequestTableOpen && (
            <ExpandTableButton
              className="absolute top-0 -right-10 max-md:hidden"
              tooltipContent="Undelegate request"
              onClick={() => setIsUnstakeRequestTableOpen(true)}
            />
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start justify-stretch">
              <TransactionInputCard.Root
                tokenSymbol={selectedAsset?.metadata.symbol}
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
                                operatorIdentities.get(
                                  selectedOperatorAccountId,
                                )?.name
                              }
                              overrideTypographyProps={{ variant: 'h5' }}
                            />
                          ),
                        }
                      : {})}
                  />
                  <TransactionInputCard.MaxAmountButton
                    maxAmount={formattedMaxAmount}
                    tooltipBody="Available Balance"
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
                    isLoading={isTransacting || isLoading}
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
        className="hidden md:block"
      >
        <UndelegateRequestsView
          unstakeRequests={unstakeRequests}
          operatorIdentities={operatorIdentities}
          onClose={() => setIsUnstakeRequestTableOpen(false)}
        />
      </AnimatedTable>

      <UndelegateRequestsView
        unstakeRequests={unstakeRequests}
        operatorIdentities={operatorIdentities}
        onClose={() => setIsUnstakeRequestTableOpen(false)}
        className="md:hidden"
      />

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

type Props = {
  unstakeRequests: DelegatorUnstakeRequest[];
  operatorIdentities: Map<string, IdentityType | null>;
  onClose: () => void;
  className?: string;
};

function UndelegateRequestsView({
  unstakeRequests,
  operatorIdentities,
  onClose,
  className,
}: Props) {
  return (
    <RestakeDetailCard.Root className={twMerge('!min-w-0', className)}>
      <div className="flex items-center justify-between">
        <RestakeDetailCard.Header
          title={
            unstakeRequests.length > 0
              ? 'Undelegate Requests'
              : 'No Undelegate Requests'
          }
        />

        <IconButton onClick={onClose}>
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
          Your requests will appear here after scheduling an undelegation.
          Requests can be executed after the waiting period.
        </Typography>
      )}
    </RestakeDetailCard.Root>
  );
}
