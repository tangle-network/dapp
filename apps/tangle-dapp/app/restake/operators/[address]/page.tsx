import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import VaultsTable from '../../../../components/tables/Vaults';
import OperatorInfoCard from './OperatorInfoCard';
import RegisteredBlueprintsCard from './RegisteredBlueprintsCard';

export const dynamic = 'force-static';

const page = ({ params: { address } }: { params: { address: string } }) => {
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-stretch gap-5 max-h-none md:max-h-[290px]">
        <OperatorInfoCard className="flex-1" operatorAddress={address} />

        <RegisteredBlueprintsCard className="flex-1" />
      </div>

      <div>
        <Typography variant="h4" fw="bold" className="py-4">
          Total Value Locked
        </Typography>

        <VaultsTable
          emptyTableProps={{
            title: 'No TVL data available',
            description:
              'This operator currently has no Total Value Locked (TVL). You can delegate to this operator to contribute to their TVL and see it reflected here.',
          }}
          // TODO: Add `data`
          // data={Object.values(vaults)}
          // TODO: Add `tableProps`
          // tableProps={tableProps}
        />
      </div>
    </div>
  );
};

export default page;
