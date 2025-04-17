import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import { isSubstrateAddress } from '@tangle-network/ui-components';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { ComponentProps, FC, useMemo } from 'react';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl';
import { useParams } from 'react-router';
import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import OperatorInfoCard from './OperatorInfoCard';
import RegisteredBlueprintsCard from './RegisteredBlueprintsCard';
import TVLTable from './TVLTable';

const Page: FC = () => {
  const { address } = useParams();
  const { result: operatorMap } = useRestakeOperatorMap();
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorTvl: operatorTVL } = useRestakeTvl(delegatorInfo);

  const operatorAddressParam =
    address === undefined
      ? undefined
      : isSubstrateAddress(address)
        ? address
        : undefined;

  const { isLoading, blueprints, error } =
    useOperatorBlueprints(operatorAddressParam);

  const blueprintsUI = useMemo<
    ComponentProps<typeof RegisteredBlueprintsCard>['blueprints']
  >(
    () =>
      blueprints.map(
        ({
          blueprint: {
            metadata: { name, logo, codeRepository },
          },
          blueprintId,
        }) => ({
          id: blueprintId.toString(),
          avatarUrl: logo,
          name,
          githubUrl: codeRepository,
        }),
      ),
    [blueprints],
  );

  // TODO: Redirect to 404 page instead of returning null.
  if (address === undefined || !isSubstrateAddress(address)) {
    return null;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-stretch gap-5 max-h-none md:max-h-[290px]">
        <OperatorInfoCard
          className="flex-1"
          operatorData={operatorMap.get(address)}
          operatorAddress={address}
          operatorMap={operatorMap}
          delegatorInfo={delegatorInfo}
          operatorTVL={operatorTVL}
        />

        <RegisteredBlueprintsCard
          className="flex-1"
          blueprints={blueprintsUI}
          isLoading={isLoading}
          error={error && error.message}
        />
      </div>

      <div>
        <Typography variant="h4" fw="bold" className="py-4">
          Total Value Locked
        </Typography>

        <TVLTable
          operatorData={operatorMap.get(address)}
          delegatorInfo={delegatorInfo}
        />
      </div>
    </div>
  );
};

export default Page;
