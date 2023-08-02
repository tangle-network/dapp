import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import { ShieldedAssetsTable, ShieldedPoolsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';
import { getShieldedTablesDD } from '../../utils';

interface ShieldedTablesContainerProps {
  assetsData?: ShieldedAssetType[];
  poolsData?: ShieldedPoolType[];
}

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

async function getShieldedTablesData(): Promise<ShieldedTablesContainerProps> {
  await new Promise((r) => setTimeout(r, 1000));
  return getShieldedTablesDD(pageSize * 2 - 2);
}

export default async function ShieldedTablesContainer() {
  const { assetsData, poolsData } = await getShieldedTablesData();

  return (
    <TableAndChartTabs
      tabs={[assetsTableTab, poolsTableTab]}
      headerClassName="w-full overflow-x-auto"
    >
      {/* Shielded Assets Table */}
      <TabContent value={assetsTableTab}>
        <ShieldedAssetsTable data={assetsData} pageSize={pageSize} />
      </TabContent>

      {/* Shielded Pools Table */}
      <TabContent value={poolsTableTab}>
        <ShieldedPoolsTable data={poolsData} pageSize={pageSize} />
      </TabContent>
    </TableAndChartTabs>
  );
}
