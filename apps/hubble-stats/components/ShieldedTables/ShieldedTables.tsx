import cx from 'classnames';
import {
  TabContent,
  TabsList,
  TabsRoot,
  TabTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';

import { ChainFilter, ShieldedAssetsTable, ShieldedPoolsTable } from '.';

type TableType = 'Assets' | 'Pools';

const tables = [
  {
    type: 'Assets' as TableType,
    component: <ShieldedAssetsTable />,
  },
  {
    type: 'Pools' as TableType,
    component: <ShieldedPoolsTable />,
  },
];

export const ShieldedTables = () => {
  return (
    <div>
      <TabsRoot defaultValue={tables[0].type} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="space-x-4">
            {tables.map((table, idx) => {
              return (
                <TabTrigger
                  key={idx}
                  value={table.type}
                  isDisableStyle
                  className={cx(
                    'text-mono-100 radix-state-active:text-mono-200',
                    'dark:radix-state-active:text-mono-0'
                  )}
                >
                  <Typography
                    variant="mkt-body2"
                    fw="black"
                    className="text-current"
                  >
                    Shielded {table.type}
                  </Typography>
                </TabTrigger>
              );
            })}
          </TabsList>
          <ChainFilter />
        </div>
        <div>
          {tables.map((table, idx) => {
            return (
              <TabContent key={idx} value={table.type}>
                {table.component}
              </TabContent>
            );
          })}
        </div>
      </TabsRoot>
    </div>
  );
};
