import { ChainConfig } from '@tangle-network/dapp-config';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import {
  Avatar,
  Card,
  Chip,
  isEvmAddress,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import useFormSetValue from '../../../hooks/useFormSetValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem';
import {
  useAccount,
  useChainId,
  useConnectorClient,
  usePublicClient,
} from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { readContract } from 'viem/actions';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import ActionButtonBase from '../../../components/staking/ActionButtonBase';
import BlueprintSelection from '../../../components/staking/BlueprintSelection';
import StyleContainer from '../../../components/staking/StyleContainer';
import { SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/staking';
import useBlueprintStore from '../../../context/useBlueprintStore';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import type { EvmDelegationFormFields } from '../../../types/staking';
import decimalsToStep from '../../../utils/decimalsToStep';
import AssetPlaceholder from '../AssetPlaceholder';
import StakingActionTabs from '../StakingActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import AssetListItem from '../../../components/Lists/AssetListItem';
import OperatorListItem from '../../../components/Lists/OperatorListItem';

import {
  useOperatorMap,
  useStakingAssets,
  type StakingAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useOptionalStakingContext } from '@tangle-network/tangle-shared-ui/context/StakingContext';
import { useDelegateTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '@tangle-network/tangle-shared-ui/abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import useCanDelegate, {
  DelegationMode,
} from '@tangle-network/tangle-shared-ui/data/staking/useCanDelegate';
import useCanDelegateToOperators from '@tangle-network/tangle-shared-ui/data/staking/useCanDelegateToOperators';

type AssetItem = {
  id: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  delegatedAmount: bigint;
  availableBalance: bigint;
};

type OperatorItem = {
  address: Address;
  stake: bigint;
  delegationCount: bigint;
  isActive: boolean;
  delegationMode?: DelegationMode;
  canDelegate?: boolean;
};

const NATIVE_TOKEN_ADDRESS = zeroAddress as Address;
const NATIVE_ASSET_METADATA = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

const safeParseUnits = (value: string, decimals: number): bigint | null => {
  try {
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
};

const StakingDelegateForm: FC = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const { data: connectorClient } = useConnectorClient();
  const effectiveChainId = connectorClient?.chain?.id ?? chainId;
  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EvmDelegationFormFields>({
    mode: 'onChange',
  });

  const selectedOperatorAddress = watch('operatorAddress');
  const selectedAssetId = watch('assetId');
  const amount = watch('amount');
  const lastResetTypedChainIdRef = useRef(activeTypedChainId);

  const [operatorParam, setOperatorParam] = useQueryState(
    QueryParamKey.STAKING_OPERATOR,
  );
  const operatorAddressFromParam = useMemo<Address | null>(() => {
    if (
      !operatorParam ||
      typeof operatorParam !== 'string' ||
      !isEvmAddress(operatorParam)
    ) {
      return null;
    }

    return operatorParam as Address;
  }, [operatorParam]);

  const setValue = useFormSetValue(setFormValue);

  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAddress', { required: 'Operator is required' });
  }, [register]);

  useEffect(() => {
    if (lastResetTypedChainIdRef.current === activeTypedChainId) {
      return;
    }

    lastResetTypedChainIdRef.current = activeTypedChainId;
    reset(
      operatorAddressFromParam
        ? { operatorAddress: operatorAddressFromParam }
        : undefined,
    );
  }, [activeTypedChainId, operatorAddressFromParam, reset]);

  const stakingContext = useOptionalStakingContext();
  const { assets: directStakingAssets } = useStakingAssets({
    enabled: Boolean(userAddress) && !stakingContext,
  });
  const stakingAssets = stakingContext
    ? stakingContext.assets
    : directStakingAssets;
  const { data: operatorMap } = useOperatorMap({ status: 'ACTIVE' });
  const blueprintSelection = useBlueprintStore((store) => store.selection);

  const tokenAddresses = useMemo<Address[]>(() => {
    const addresses = stakingAssets
      ? (Array.from(stakingAssets.keys()) as Address[])
      : [];
    const hasNativeToken = addresses.some(
      (token) => token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase(),
    );

    return hasNativeToken ? addresses : [...addresses, NATIVE_TOKEN_ADDRESS];
  }, [stakingAssets]);

  const contracts = useMemo(() => {
    try {
      return getContractsByChainId(effectiveChainId);
    } catch {
      return null;
    }
  }, [effectiveChainId]);

  const publicClient = usePublicClient({ chainId: effectiveChainId });

  // Fetch deposit data from getDeposit (includes both amount and delegatedAmount)
  const { data: depositMap, refetch: refetchDeposits } = useQuery({
    queryKey: [
      'staking',
      'delegate',
      'deposits',
      effectiveChainId,
      userAddress,
      tokenAddresses.map((t) => t.toLowerCase()).sort(),
    ],
    queryFn: async () => {
      const map = new Map<
        string,
        { amount: bigint; delegatedAmount: bigint }
      >();

      if (!publicClient || !contracts || !userAddress) {
        return map;
      }

      const readDeposit = async (token: Address) => {
        const request = {
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'getDeposit' as const,
          args: [userAddress, token] as const,
        };

        try {
          return (await publicClient.readContract(request)) as {
            amount: bigint;
            delegatedAmount: bigint;
          };
        } catch (primaryError) {
          if (!connectorClient) {
            throw primaryError;
          }

          return (await readContract(connectorClient, request)) as {
            amount: bigint;
            delegatedAmount: bigint;
          };
        }
      };

      const results = await Promise.allSettled(
        tokenAddresses.map(async (token) => {
          const deposit = await readDeposit(token);

          return {
            token,
            amount: deposit.amount,
            delegatedAmount: deposit.delegatedAmount,
          };
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { token, amount, delegatedAmount } = result.value;
          map.set(token.toLowerCase(), { amount, delegatedAmount });
        }
      }

      return map;
    },
    enabled:
      Boolean(publicClient) &&
      Boolean(contracts) &&
      Boolean(userAddress) &&
      tokenAddresses.length > 0,
    staleTime: 2_000,
    refetchInterval: 2_000,
    refetchIntervalInBackground: true,
    retry: 2,
  });

  const { status: delegateTxStatus, execute: executeDelegateTx } =
    useDelegateTx();

  // Get operator addresses for fetching delegation info
  const operatorAddresses = useMemo(() => {
    if (!operatorMap) return [];
    return Array.from(operatorMap.keys()) as Address[];
  }, [operatorMap]);

  // Fetch delegation info (canDelegate, mode, whitelist status) for all operators
  const { delegationInfo, isLoading: isLoadingDelegationInfo } =
    useCanDelegateToOperators({
      operators: operatorAddresses,
      delegator: userAddress,
      enabled: operatorAddresses.length > 0 && !!userAddress,
    });

  // Check if current user can delegate to the selected operator
  const {
    canDelegate,
    delegationMode: selectedOperatorDelegationMode,
    isLoading: isCheckingCanDelegate,
  } = useCanDelegate({
    operator: selectedOperatorAddress as Address | undefined,
    delegator: userAddress,
    enabled: !!selectedOperatorAddress && !!userAddress,
  });

  useEffect(() => {
    if (
      !operatorAddressFromParam ||
      selectedOperatorAddress === operatorAddressFromParam
    ) {
      return;
    }

    setValue('operatorAddress', operatorAddressFromParam);
  }, [operatorAddressFromParam, selectedOperatorAddress, setValue]);

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal(false);

  const {
    status: isAssetModalOpen,
    open: openAssetModal,
    close: closeAssetModal,
    update: updateAssetModal,
  } = useModal(false);

  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
    update: updateOperatorModal,
  } = useModal(false);

  const depositedAssets = useMemo<AssetItem[]>(() => {
    if (!depositMap) {
      return [];
    }

    return tokenAddresses
      .map((token) => {
        const asset = stakingAssets?.get(token) as StakingAsset | undefined;
        const metadata =
          asset?.metadata ??
          (token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
            ? NATIVE_ASSET_METADATA
            : null);
        const deposit = depositMap.get(token.toLowerCase());

        if (!metadata || !deposit) {
          return null;
        }

        const totalDeposited = deposit.amount;
        const delegatedAmount = deposit.delegatedAmount;
        const availableBalance = totalDeposited - delegatedAmount;

        if (availableBalance <= BigInt(0)) {
          return null;
        }

        return {
          id: token,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          balance: totalDeposited,
          delegatedAmount,
          availableBalance,
        };
      })
      .filter((item): item is AssetItem => item !== null);
  }, [depositMap, stakingAssets, tokenAddresses]);

  // Derive selectedAssetItem from depositedAssets to ensure it updates when metadata loads
  const selectedAssetItem = useMemo(() => {
    if (!selectedAssetId || depositedAssets.length === 0) {
      return null;
    }
    return (
      depositedAssets.find((asset) => asset.id === selectedAssetId) ?? null
    );
  }, [depositedAssets, selectedAssetId]);

  // Auto-select first asset when available and none selected
  useEffect(() => {
    if (depositedAssets.length > 0 && !selectedAssetId) {
      const firstAsset = depositedAssets[0];
      setValue('assetId', firstAsset.id);
    }
  }, [depositedAssets, setValue, selectedAssetId]);

  const handleAssetSelect = useCallback(
    (asset: AssetItem) => {
      setValue('assetId', asset.id);
      closeAssetModal();
    },
    [closeAssetModal, setValue],
  );

  const handleChainChange = useCallback(
    async (chain: ChainConfig) => {
      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);

      await switchChain(typedChainId);
      closeChainModal();
    },
    [closeChainModal, switchChain],
  );

  const operators = useMemo<OperatorItem[]>(() => {
    if (!operatorMap) return [];

    const operatorList = Array.from(operatorMap.entries())
      .filter(([, op]) => op.stakingStatus === 'ACTIVE')
      .map(([address, op]) => {
        const info = delegationInfo.get(address);
        return {
          address,
          stake: op.stakingStake ?? BigInt(0),
          delegationCount: op.stakingDelegationCount ?? BigInt(0),
          isActive: true,
          delegationMode: info?.delegationMode,
          canDelegate: info?.canDelegate,
        };
      });

    // Sort operators: Open first, then Whitelist (whitelisted), then Self-only/non-whitelisted
    return operatorList.sort((a, b) => {
      const aCanDelegate = a.canDelegate ?? false;
      const bCanDelegate = b.canDelegate ?? false;
      const aMode = a.delegationMode ?? DelegationMode.Disabled;
      const bMode = b.delegationMode ?? DelegationMode.Disabled;

      // First, prioritize operators user can delegate to
      if (aCanDelegate && !bCanDelegate) return -1;
      if (!aCanDelegate && bCanDelegate) return 1;

      // Among delegatable operators, sort by mode: Open > Whitelist
      if (aCanDelegate && bCanDelegate) {
        if (aMode === DelegationMode.Open && bMode !== DelegationMode.Open)
          return -1;
        if (aMode !== DelegationMode.Open && bMode === DelegationMode.Open)
          return 1;
      }

      // Among non-delegatable operators, sort by mode: Whitelist > Disabled
      if (!aCanDelegate && !bCanDelegate) {
        if (
          aMode === DelegationMode.Whitelist &&
          bMode === DelegationMode.Disabled
        )
          return -1;
        if (
          aMode === DelegationMode.Disabled &&
          bMode === DelegationMode.Whitelist
        )
          return 1;
      }

      return 0;
    });
  }, [delegationInfo, operatorMap]);

  const selectedOperator = useMemo(() => {
    if (!selectedOperatorAddress || !operatorMap) return null;
    return operatorMap.get(selectedOperatorAddress as Address) ?? null;
  }, [operatorMap, selectedOperatorAddress]);

  const handleOnSelectOperator = useCallback(
    (operator: OperatorItem) => {
      setValue('operatorAddress', operator.address);
      setOperatorParam(null);
      closeOperatorModal();
    },
    [closeOperatorModal, setOperatorParam, setValue],
  );

  const { maxAmount, maxAmountInputValue } = useMemo(() => {
    if (!selectedAssetItem) {
      return { maxAmount: undefined, maxAmountInputValue: undefined };
    }

    return {
      maxAmount: selectedAssetItem.availableBalance,
      maxAmountInputValue: formatUnits(
        selectedAssetItem.availableBalance,
        selectedAssetItem.decimals,
      ),
    };
  }, [selectedAssetItem]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAssetItem?.decimals);

    return {
      type: 'number',
      step,
      'data-testid': 'staking-delegate-amount-input',
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!selectedAssetItem) return 'Select an asset first';
          const parsed = safeParseUnits(value, selectedAssetItem.decimals);
          if (parsed === null) return 'Enter a valid amount';
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount) return 'Insufficient balance';
          return true;
        },
      }),
    };
  }, [maxAmount, register, selectedAssetItem]);

  const displayError = useMemo(() => {
    if (errors.operatorAddress !== undefined || !selectedOperatorAddress) {
      return 'Select Operator';
    }

    // Check delegation eligibility after operator is selected
    if (isCheckingCanDelegate) {
      return 'Checking eligibility...';
    }

    if (canDelegate === false) {
      if (selectedOperatorDelegationMode === DelegationMode.Disabled) {
        return 'Operator not accepting delegations';
      }
      if (selectedOperatorDelegationMode === DelegationMode.Whitelist) {
        return 'Not on operator whitelist';
      }
      return 'Cannot delegate to this operator';
    }

    if (errors.assetId !== undefined || !selectedAssetId) {
      return 'Select Asset';
    }

    if (!amount) {
      return 'Enter Amount';
    }

    if (errors.amount !== undefined) {
      return 'Invalid Amount';
    }

    return undefined;
  }, [
    errors.operatorAddress,
    errors.assetId,
    errors.amount,
    selectedOperatorAddress,
    selectedAssetId,
    amount,
    canDelegate,
    selectedOperatorDelegationMode,
    isCheckingCanDelegate,
  ]);

  const isTransacting =
    isSubmitting || delegateTxStatus === TxStatus.PROCESSING;

  const isReady =
    !isTransacting &&
    selectedAssetItem !== null &&
    executeDelegateTx !== null &&
    canDelegate !== false &&
    !isCheckingCanDelegate;

  const resetForm = useCallback(() => {
    setValue('amount', '', { shouldValidate: false });
    setValue('assetId', '' as Address, { shouldValidate: false });
    setValue('operatorAddress', '' as Address, { shouldValidate: false });
    setOperatorParam(null);
  }, [setOperatorParam, setValue]);

  const onSubmit = useCallback<SubmitHandler<EvmDelegationFormFields>>(
    async ({ amount, assetId, operatorAddress }) => {
      if (!isReady || !selectedAssetItem) {
        return;
      }

      const amountBigInt = safeParseUnits(amount, selectedAssetItem.decimals);
      if (amountBigInt === null) {
        return;
      }

      if (amountBigInt <= BigInt(0)) {
        return;
      }

      try {
        await executeDelegateTx({
          operator: operatorAddress,
          token: assetId,
          amount: amountBigInt,
          blueprintSelection: blueprintSelection.length > 0 ? 'FIXED' : 'ALL',
          blueprintIds: blueprintSelection.map((id) => BigInt(id)),
        });
        await refetchDeposits();
        resetForm();
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    },
    [
      blueprintSelection,
      executeDelegateTx,
      isReady,
      refetchDeposits,
      resetForm,
      selectedAssetItem,
    ],
  );

  return (
    <StyleContainer>
      <StakingActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start justify-stretch">
            <TransactionInputCard.Root
              tokenSymbol={selectedAssetItem?.symbol}
              className="bg-mono-20 dark:bg-mono-180"
            >
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select Operator"
                  onClick={openOperatorModal}
                  data-testid="staking-delegate-operator-selector"
                  {...(selectedOperatorAddress
                    ? {
                        renderBody: () => (
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="md"
                              theme="ethereum"
                              value={selectedOperatorAddress}
                            />
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Typography
                                  variant="h5"
                                  fw="bold"
                                  component="span"
                                  className="inline-block text-mono-200 dark:text-mono-40"
                                >
                                  {shortenHex(selectedOperatorAddress)}
                                </Typography>
                                {selectedOperatorDelegationMode !==
                                  undefined && (
                                  <Chip
                                    color={
                                      selectedOperatorDelegationMode ===
                                      DelegationMode.Open
                                        ? 'green'
                                        : selectedOperatorDelegationMode ===
                                            DelegationMode.Whitelist
                                          ? 'yellow'
                                          : 'dark-grey'
                                    }
                                  >
                                    {selectedOperatorDelegationMode ===
                                    DelegationMode.Open
                                      ? 'Open'
                                      : selectedOperatorDelegationMode ===
                                          DelegationMode.Whitelist
                                        ? 'Whitelist'
                                        : 'Self Only'}
                                  </Chip>
                                )}
                              </div>
                              <Typography
                                variant="body3"
                                component="span"
                                className={
                                  canDelegate === false
                                    ? 'text-red-500'
                                    : 'text-mono-120 dark:text-mono-100'
                                }
                              >
                                {canDelegate === false
                                  ? selectedOperatorDelegationMode ===
                                    DelegationMode.Disabled
                                    ? 'Not accepting delegations'
                                    : 'Not on whitelist'
                                  : typeof selectedOperator?.stakingDelegationCount ===
                                      'bigint'
                                    ? `${selectedOperator.stakingDelegationCount.toString()} total delegations`
                                    : 'Operator'}
                              </Typography>
                            </div>
                          </div>
                        ),
                      }
                    : {})}
                />
                <TransactionInputCard.MaxAmountButton
                  maxAmount={maxAmountInputValue}
                  tooltipBody="Available to Delegate"
                  Icon={
                    useRef({
                      enabled: <LockUnlockLineIcon />,
                      disabled: <LockUnlockLineIcon />,
                    }).current
                  }
                />
              </TransactionInputCard.Header>

              <TransactionInputCard.Body
                customAmountProps={customAmountProps}
                tokenSelectorProps={
                  useRef({
                    placeholder: <AssetPlaceholder />,
                    onClick: openAssetModal,
                    'data-testid': 'staking-delegate-asset-selector',
                    ...(selectedAssetItem && maxAmountInputValue !== undefined
                      ? {
                          renderBody: () => (
                            <div className="flex items-center gap-2">
                              <TokenIcon
                                name={selectedAssetItem.symbol}
                                size="lg"
                              />
                              <Typography variant="h5" fw="bold">
                                {selectedAssetItem.symbol}
                              </Typography>
                            </div>
                          ),
                        }
                      : {}),
                  }).current
                }
              />
            </TransactionInputCard.Root>

            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
          </div>

          <BlueprintSelection operatorAddress={selectedOperatorAddress} />

          <Details />

          <ActionButtonBase>
            {(isLoading, loadingText) => {
              const activeChainSupported =
                isDefined(activeTypedChainId) &&
                SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS.includes(
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
                  data-testid="staking-delegate-submit"
                  isDisabled={!isValid || isDefined(displayError) || !isReady}
                  type="submit"
                  isFullWidth
                  isLoading={isTransacting || isLoading}
                  loadingText={loadingText}
                >
                  {displayError ?? 'Delegate'}
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </Card>

      <ListModal
        title="Select Asset"
        isOpen={isAssetModalOpen}
        setIsOpen={updateAssetModal}
        titleWhenEmpty="No Assets Available"
        descriptionWhenEmpty="Have you made a deposit on this network yet?"
        items={depositedAssets}
        searchInputId="staking-delegate-asset-search"
        searchPlaceholder="Search assets..."
        getItemKey={(item) => item.id}
        onSelect={handleAssetSelect}
        filterItem={(item, query) =>
          filterBy(query, [item.name, item.symbol, item.id])
        }
        renderItem={(asset) => (
          <AssetListItem
            assetId={asset.id}
            name={asset.name}
            symbol={asset.symbol}
            balance={asset.availableBalance}
            decimals={asset.decimals}
            rightBottomText="Available"
          />
        )}
      />

      <ListModal
        title="Select Operator"
        isOpen={isOperatorModalOpen}
        setIsOpen={updateOperatorModal}
        titleWhenEmpty="No Operators Available"
        descriptionWhenEmpty="Looks like there aren't any registered operators in this network yet."
        items={operators}
        isLoading={isLoadingDelegationInfo}
        searchInputId="staking-delegate-operator-search"
        searchPlaceholder="Search operators..."
        getItemKey={(item) => item.address}
        onSelect={handleOnSelectOperator}
        filterItem={(item, query) => filterBy(query, [item.address])}
        isItemDisabled={(item) => item.canDelegate === false}
        renderItem={({
          address,
          delegationCount,
          delegationMode,
          canDelegate: itemCanDelegate,
        }) => (
          <OperatorListItem
            accountAddress={address}
            totalDelegations={delegationCount}
            delegationMode={delegationMode}
            isDisabled={itemCanDelegate === false}
          />
        )}
      />

      <Modal open={isChainModalOpen} onOpenChange={updateChainModal}>
        <SupportedChainModal
          onClose={closeChainModal}
          onChainChange={handleChainChange}
        />
      </Modal>
    </StyleContainer>
  );
};

export default StakingDelegateForm;
