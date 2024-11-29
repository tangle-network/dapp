import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { VaultToken } from '@webb-tools/tangle-shared-ui/types';
import {
  Dropdown,
  DropdownBasicButton,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils/getRoundedAmountString';
import cx from 'classnames';
import { FC } from 'react';

import LsTokenIcon from '../../LsTokenIcon';

const columnHelper = createColumnHelper<VaultToken>();

const columns = [
  columnHelper.accessor('name', {
    header: () => <Typography variant="body2">Token</Typography>,
    cell: (props) => (
      <div className="flex items-center gap-2">
        <LsTokenIcon name={props.row.original.symbol} />

        <Typography variant="body1">{props.getValue()}</Typography>
      </div>
    ),
  }),
  columnHelper.accessor('amount', {
    header: () => (
      <Typography variant="body2" ta="right">
        Amount
      </Typography>
    ),
    cell: (props) => {
      const value = props.getValue();

      return (
        <Typography variant="body1" ta="right">
          {typeof value === 'string' ? value : getRoundedAmountString(value)}
        </Typography>
      );
    },
  }),
];

const VaultsDropdown: FC<{ vaultTokens: VaultToken[] }> = ({ vaultTokens }) => {
  const table = useReactTable({
    columns,
    data: vaultTokens,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Dropdown>
      <DropdownBasicButton className="flex items-center -space-x-2">
        {vaultTokens.map(({ name, symbol }, idx) => (
          <LsTokenIcon key={`${name}-${symbol}-${idx}`} name={symbol} />
        ))}
      </DropdownBasicButton>

      <DropdownBody isPortal className="mt-2 bg-mono-0 dark:bg-mono-200">
        {/** TODO: Check styling after max depth issue is fixed.  */}
        <Table
          variant={TableVariant.DEFAULT}
          tableProps={table}
          thClassName={cx('px-0 py-3 first:pl-5 last:pr-5')}
          tdClassName={cx('border-t-0 px-0 py-3 first:pl-5 last:pr-5')}
        />
      </DropdownBody>
    </Dropdown>
  );
};

export default VaultsDropdown;
