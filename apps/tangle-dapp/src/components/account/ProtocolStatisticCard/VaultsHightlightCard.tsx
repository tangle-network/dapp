import { RestakeVault } from '@tangle-network/tangle-shared-ui/data/restake/useRestakeVaults';
import { useVaultAssets } from '@tangle-network/tangle-shared-ui/data/restake/useVaultAssets';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import createRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/createRestakeAssetId';
import {
  AmountFormatStyle,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  isSubstrateAddress,
  Typography,
} from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import { AnimatePresence, motion } from 'framer-motion';
import kebabCase from 'lodash/kebabCase';
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { map } from 'rxjs';
import { twMerge } from 'tailwind-merge';
import { StatsItem } from './StatsItem';

type Props = ComponentProps<typeof motion.div> & {
  vaults: RestakeVault[] | null;
  isLoading: boolean;
};

const VaultsHightlightCard = ({
  className,
  vaults,
  isLoading,
  ...props
}: Props) => {
  // Get first 5 vaults with the highest tvl, then ID
  const sortedVaults = useMemo(
    () =>
      vaults
        ?.slice()
        .sort((a, b) => {
          if (a.tvl === undefined && b.tvl === undefined) {
            return a.id - b.id;
          }

          if (a.tvl === undefined) {
            return 1;
          }

          if (b.tvl === undefined) {
            return -1;
          }

          const result = b.tvl.cmp(a.tvl);
          if (result !== 0) {
            return result;
          }

          return a.id - b.id;
        })
        .slice(0, 5) ?? null,
    [vaults],
  );

  const [currentSlide, setCurrentSlide] = useState(0);

  const {
    result: vaultParticipants,
    isLoading: isVaultParticipantsLoading,
    error: vaultParticipantsError,
  } = useVaultParticipants();

  useEffect(() => {
    if (!sortedVaults || sortedVaults.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sortedVaults.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [sortedVaults]);

  return (
    <AnimatePresence>
      {sortedVaults && sortedVaults.length > 0 && (
        <motion.div
          {...props}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.5 }}
          className={twMerge(
            'relative overflow-hidden origin-right',
            className,
          )}
        >
          <div className="w-full h-full overflow-hidden">
            <div
              className="flex w-full h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sortedVaults.map((vault) => (
                <div
                  key={vault.id}
                  className="w-full min-w-full flex-shrink-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(18, 20, 37, 0) 0%, rgba(67, 62, 217, 0.3) 27.5%), url('/static/assets/vaults/vault-${kebabCase(vault.name || '')}.png')`,
                  }}
                >
                  <VaultHighlight
                    className="h-full"
                    vaultName={vault.name}
                    vaultTvl={
                      vault.tvl
                        ? formatDisplayAmount(
                            vault.tvl,
                            vault.decimals,
                            AmountFormatStyle.SI,
                            {
                              fractionMaxLength: 2,
                            },
                          )
                        : null
                    }
                    isVaultTvlLoading={isLoading}
                    vaultParticipants={
                      vaultParticipants?.get(vault.id)?.size ?? null
                    }
                    isVaultParticipantsLoading={isVaultParticipantsLoading}
                    vaultParticipantsError={vaultParticipantsError}
                  />
                </div>
              ))}
            </div>
          </div>

          {sortedVaults.length > 1 && (
            <div className="absolute left-1/2 -translate-x-1/2 flex gap-3 bottom-5">
              {sortedVaults.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? 'bg-mono-0 w-6'
                      : 'bg-mono-0/70 hover:bg-mono-0/90 w-3'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VaultsHightlightCard;

type VaultHighlightProps = ComponentProps<'div'> & {
  vaultName: string;
  vaultTvl: string | null;
  isVaultTvlLoading: boolean;
  vaultParticipants: number | null;
  isVaultParticipantsLoading: boolean;
  vaultParticipantsError: Error | null;
};

const VaultHighlight = ({
  vaultName,
  vaultTvl,
  isVaultTvlLoading,
  vaultParticipants,
  isVaultParticipantsLoading,
  vaultParticipantsError,
  className,
  style,
  ...restProps
}: VaultHighlightProps) => {
  return (
    <div
      {...restProps}
      className={twMerge('px-6 pt-6 pb-12 flex flex-col gap-4', className)}
    >
      <Typography
        variant="body4"
        fw="bold"
        className="uppercase text-blue-60 dark:text-blue-40"
      >
        Featured Vault
      </Typography>

      <Typography
        variant="h4"
        fw="bold"
        className="text-mono-180 dark:text-mono-0"
      >
        {vaultName}
      </Typography>

      <div className="mt-auto flex items-center justify-between">
        <StatsItem
          label="TVL"
          result={vaultTvl || EMPTY_VALUE_PLACEHOLDER}
          isLoading={isVaultTvlLoading}
          error={null}
          labelClassName="text-mono-180 dark:text-mono-60"
          valueClassName="text-mono-200 dark:text-mono-0"
        />

        <StatsItem
          label="Participants"
          result={
            typeof vaultParticipants === 'number'
              ? addCommasToNumber(vaultParticipants)
              : EMPTY_VALUE_PLACEHOLDER
          }
          isLoading={isVaultParticipantsLoading}
          error={vaultParticipantsError}
          labelClassName="text-mono-180 dark:text-mono-60"
          valueClassName="text-mono-200 dark:text-mono-0"
        />
      </div>
    </div>
  );
};

const useVaultParticipants = () => {
  const {
    result: vaultAssets,
    isLoading: isVaultAssetsLoading,
    error: vaultAssetsError,
  } = useVaultAssets();

  const {
    result: assetDelegators,
    isLoading: isAssetDelegatorsLoading,
    error: assetDelegatorsError,
  } = useAssetDelegators();

  const {
    result: assetOperators,
    isLoading: isAssetOperatorsLoading,
    error: assetOperatorsError,
  } = useAssetOperators();

  const result = useMemo(() => {
    if (assetDelegators === null || assetOperators === null) {
      return null;
    }

    if (vaultAssets === null) {
      return null;
    }

    const vaultParticipantsMap = new Map<number, Set<SubstrateAddress>>();

    vaultAssets.forEach((assetSet, vaultId) => {
      const participantSet =
        vaultParticipantsMap.get(vaultId) ?? new Set<SubstrateAddress>();

      assetSet.forEach((assetId) => {
        const delegators =
          assetDelegators.get(assetId) ?? new Set<SubstrateAddress>();
        const operators =
          assetOperators.get(assetId) ?? new Set<SubstrateAddress>();

        delegators.forEach((delegator) => {
          participantSet.add(delegator);
        });

        operators.forEach((operator) => {
          participantSet.add(operator);
        });
      });

      vaultParticipantsMap.set(vaultId, participantSet);
    });

    return vaultParticipantsMap;
  }, [assetDelegators, assetOperators, vaultAssets]);

  return {
    result,
    isLoading:
      isVaultAssetsLoading ||
      isAssetDelegatorsLoading ||
      isAssetOperatorsLoading,
    error: vaultAssetsError || assetDelegatorsError || assetOperatorsError,
  };
};

const useAssetDelegators = () => {
  return useApiRx(
    useCallback((apiRx) => {
      return apiRx.query.multiAssetDelegation.delegators.entries().pipe(
        map((entries) => {
          return entries.reduce(
            (assetDelegatorMap, [delegatorIdStorage, delegatorMetadata]) => {
              if (delegatorMetadata.isNone) {
                return assetDelegatorMap;
              }

              const delegatorId = delegatorIdStorage.args[0].toString();
              if (!isSubstrateAddress(delegatorId)) {
                return assetDelegatorMap;
              }

              const { deposits, delegations } = delegatorMetadata.unwrap();

              deposits.keys().forEach((asset) => {
                const restakeAssetId = createRestakeAssetId(asset);

                const delegatorSet =
                  assetDelegatorMap.get(restakeAssetId) ??
                  new Set<SubstrateAddress>();

                delegatorSet.add(delegatorId);

                assetDelegatorMap.set(restakeAssetId, delegatorSet);
              });

              delegations.forEach(({ asset }) => {
                const restakeAssetId = createRestakeAssetId(asset);

                const delegatorSet =
                  assetDelegatorMap.get(restakeAssetId) ??
                  new Set<SubstrateAddress>();

                delegatorSet.add(delegatorId);

                assetDelegatorMap.set(restakeAssetId, delegatorSet);
              });

              return assetDelegatorMap;
            },
            new Map<RestakeAssetId, Set<SubstrateAddress>>(),
          );
        }),
      );
    }, []),
  );
};

const useAssetOperators = () => {
  return useApiRx(
    useCallback((apiRx) => {
      return apiRx.query.multiAssetDelegation.operators.entries().pipe(
        map((entries) => {
          return entries.reduce(
            (assetOperatorMap, [operatorIdStorage, operatorMetadata]) => {
              if (operatorMetadata.isNone) {
                return assetOperatorMap;
              }

              const operatorId = operatorIdStorage.args[0].toString();
              if (!isSubstrateAddress(operatorId)) {
                return assetOperatorMap;
              }

              const { delegations } = operatorMetadata.unwrap();

              delegations.forEach(({ asset }) => {
                const restakeAssetId = createRestakeAssetId(asset);

                const operatorSet =
                  assetOperatorMap.get(restakeAssetId) ??
                  new Set<SubstrateAddress>();

                operatorSet.add(operatorId);

                assetOperatorMap.set(restakeAssetId, operatorSet);
              });

              return assetOperatorMap;
            },
            new Map<RestakeAssetId, Set<SubstrateAddress>>(),
          );
        }),
      );
    }, []),
  );
};
