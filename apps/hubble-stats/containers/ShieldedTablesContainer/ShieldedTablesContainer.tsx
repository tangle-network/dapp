import { TableAndChartTabs, TabContent } from '@webb-tools/webb-ui-components';

import { ShieldedAssetsTable, ShieldedPoolsTable } from '../../components';
import { getShieldedTablesData } from '../../data';

const pageSize = 5;
const assetsTableTab = 'Shielded Assets';
const poolsTableTab = 'Shielded Pools';

export default async function ShieldedTablesContainer() {
  const [assetsData, poolsData] = await getShieldedTablesData();

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
