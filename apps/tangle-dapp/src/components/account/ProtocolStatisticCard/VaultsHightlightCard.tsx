import { BN, BN_ZERO } from '@polkadot/util';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import { useVaultAssets } from '@tangle-network/tangle-shared-ui/data/restake/useVaultAssets';
import { isSubstrateAddress, Typography } from '@tangle-network/ui-components';
import { AnimatePresence, motion } from 'framer-motion';
import { ComponentProps, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { StatsItem } from './StatsItem';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { map } from 'rxjs';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import createRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/createRestakeAssetId';

type Props = ComponentProps<typeof motion.div>;

const VaultsHightlightCard = ({ className, ...props }: Props) => {
  const network = useNetworkStore((store) => store.network2);

  const vaultName = 'btc';

  return (
    <AnimatePresence>
      {network?.id === undefined && (
        <motion.div
          {...props}
          className={twMerge(
            'p-6 flex flex-col gap-4',
            'bg-cover bg-center bg-no-repeat object-fill',
            '[background-image:linear-gradient(180deg,rgba(18,20,37,0)0%,rgba(67,62,217,0.3)27.5%)]',
            className,
          )}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(18, 20, 37, 0) 0%, rgba(67, 62, 217, 0.3) 27.5%), url('/static/assets/vaults/vault-${vaultName.toLowerCase()}.png')`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            className="text-mono-0 dark:text-mono-0"
          >
            {vaultName}
          </Typography>

          <div className="mt-auto flex items-center justify-between">
            <StatsItem
              label="TVL"
              result={41_100}
              isLoading={false}
              error={null}
              labelClassName="text-mono-60 dark:text-mono-60"
              valueClassName="text-mono-0 dark:text-mono-0"
            />

            <StatsItem
              label="Participants"
              result={563}
              isLoading={false}
              error={null}
              labelClassName="text-mono-60 dark:text-mono-60"
              valueClassName="text-mono-0 dark:text-mono-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VaultsHightlightCard;

const useVaultHighlightInfo = () => {
  const assetTvlMap = useRestakeAssetsTvl();

  const {
    result: vaultAssets,
    isLoading: isVaultAssetsLoading,
    error: vaultAssetsError,
  } = useVaultAssets();

  const vaultTvl = useMemo(() => {
    if (vaultAssets === null || assetTvlMap === null) {
      return null;
    }

    const vaultTvlMap = new Map<number, BN>();

    vaultAssets.forEach((assetSet, vaultId) => {
      assetSet.forEach((assetId) => {
        const assetTvl = assetTvlMap.get(assetId) ?? BN_ZERO;
        const vaultTvl = vaultTvlMap.get(vaultId) ?? BN_ZERO;

        vaultTvlMap.set(vaultId, vaultTvl.add(assetTvl));
      });
    });

    return vaultTvlMap;
  }, [assetTvlMap, vaultAssets]);

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

  const vaultParticipants = useMemo(() => {
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
    vaultTvl,
    isVaultTvlLoading: isVaultAssetsLoading,
    vaultTvlError: vaultAssetsError,
    vaultParticipants,
    isVaultParticipantsLoading:
      isAssetDelegatorsLoading || isAssetOperatorsLoading,
    vaultParticipantsError: assetDelegatorsError || assetOperatorsError,
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
