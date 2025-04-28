import OperatorsTableUI from '@tangle-network/tangle-shared-ui/components/tables/Operators';
import type { OperatorConcentration } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorConcentration';
import type { OperatorTvlGroup } from '@tangle-network/tangle-shared-ui/data/restake/useOperatorTvl';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import type { RestakeOperator } from '@tangle-network/tangle-shared-ui/types';
import type {
  OperatorMap,
  OperatorDelegatorBond,
} from '@tangle-network/tangle-shared-ui/types/restake';
import delegationsToVaultTokens from '@tangle-network/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import {
  type ComponentProps,
  type FC,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { LinkProps } from 'react-router';
import { useWebContext } from '@tangle-network/api-provider-environment';
import { WebbPolkadot } from '@tangle-network/polkadot-api-provider';
import { catchError, forkJoin, map, of } from 'rxjs';
import type { SubstrateAddress } from '@tangle-network/ui-components/types/address';

type OperatorUI = NonNullable<
  ComponentProps<typeof OperatorsTableUI>['data']
>[number];

type Props = {
  operatorConcentration?: OperatorConcentration;
  operatorMap: OperatorMap;
  operatorTvl?: OperatorTvlGroup['operatorTvl'];
  onRestakeClicked?: LinkProps['onClick'];
  isLoading?: boolean;
};

const OperatorsTable: FC<Props> = ({
  operatorConcentration,
  operatorMap,
  operatorTvl,
  // onRestakeClicked,
  isLoading: isLoadingOperatorMap,
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [blueprintCountsMap, setBlueprintCountsMap] = useState<
    Map<SubstrateAddress, number>
  >(new Map());
  const [isLoadingBlueprintCounts, setIsLoadingBlueprintCounts] =
    useState(false);
  const { activeApi } = useWebContext();

  const activeSubstrateAddress = useSubstrateAddress(false);
  const { assets } = useRestakeAssets();

  const operatorAddresses = useMemo(
    () => Array.from(operatorMap.keys()).map(assertSubstrateAddress),
    [operatorMap],
  );

  const { result: identities } = useIdentities(operatorAddresses);

  // Effect to fetch blueprint counts for all operators
  useEffect(() => {
    if (
      !activeApi ||
      !(activeApi instanceof WebbPolkadot) ||
      operatorAddresses.length === 0
    ) {
      setBlueprintCountsMap(new Map());
      return;
    }

    if (
      !activeApi.api.rx.rpc?.services?.queryServicesWithBlueprintsByOperator
    ) {
      console.error(
        'RPC method queryServicesWithBlueprintsByOperator not found on api.rx',
      );
      setBlueprintCountsMap(new Map()); // Reset if method not found
      return;
    }

    const apiRx = activeApi.api.rx;

    setIsLoadingBlueprintCounts(true);
    const operatorAddrList = Array.from(operatorAddresses.values());

    const sub = forkJoin(
      operatorAddrList.map((address) =>
        apiRx.rpc.services.queryServicesWithBlueprintsByOperator(address).pipe(
          map((result) => ({ address, count: result.length })), // Map to address and count
          catchError((error) => {
            console.error(
              `Error fetching blueprints for operator ${address}:`,
              error,
            );
            return of({ address, count: 0 }); // Return 0 on error for this operator
          }),
        ),
      ),
    ).subscribe((results) => {
      const newMap = new Map<SubstrateAddress, number>();
      results.forEach(({ address, count }) => {
        newMap.set(address, count);
      });
      setBlueprintCountsMap(newMap);
      setIsLoadingBlueprintCounts(false);
    });

    return () => sub.unsubscribe();
  }, [activeApi, operatorAddresses]);

  const operators = useMemo(
    () =>
      Array.from(operatorMap.entries()).map<OperatorUI>(
        ([addressString, { delegations, restakersCount, stake }]) => {
          const address = assertSubstrateAddress(addressString);
          const tvlInUsd = operatorTvl?.get(address) ?? null;

          const concentrationPercentage =
            operatorConcentration?.get(address) ?? null;

          const isDelegated =
            activeSubstrateAddress !== null &&
            delegations.some(
              (delegation: OperatorDelegatorBond) =>
                delegation.delegatorAccountId === activeSubstrateAddress,
            );

          const blueprintCount = blueprintCountsMap.get(address);

          return {
            address,
            concentrationPercentage,
            identityName: identities.get(address)?.name ?? undefined,
            restakersCount,
            tvlInUsd,
            vaultTokens:
              assets === null
                ? []
                : delegationsToVaultTokens(delegations, assets),
            selfBondedAmount: stake,
            isDelegated,
            blueprintCount,
          } satisfies RestakeOperator;
        },
      ),
    [
      operatorMap,
      operatorTvl,
      operatorConcentration,
      activeSubstrateAddress,
      identities,
      assets,
      blueprintCountsMap,
    ],
  );

  // const RestakeAction = useCallback(
  //   ({ address, children }: PropsWithChildren<{ address: string }>) => {
  //     return (
  //       <RestakeOperatorWrapper address={address} onClick={onRestakeClicked}>
  //         {children}
  //       </RestakeOperatorWrapper>
  //     );
  //   },
  //   [onRestakeClicked],
  // );

  return (
    <div className="w-full [&>button]:block [&>button]:ml-auto">
      <OperatorsTableUI
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        data={operators}
        RestakeOperatorAction={() => null}
        isLoading={isLoadingOperatorMap || isLoadingBlueprintCounts}
      />
    </div>
  );
};

export default OperatorsTable;
