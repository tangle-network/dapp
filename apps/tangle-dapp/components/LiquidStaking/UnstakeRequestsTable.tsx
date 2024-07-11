import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CheckboxCircleFill, TimeLineIcon } from '@webb-tools/icons';
import {
  Button,
  CheckBox,
  fuzzyFilter,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import BN from 'bn.js';
import { FC } from 'react';

import { AnySubstrateAddress } from '../../types/utils';
import calculateTimeRemaining from '../../utils/calculateTimeRemaining';
import GlassCard from '../GlassCard';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import AddressLink from './AddressLink';

type UnstakeRequestItem = {
  address: AnySubstrateAddress;
  amount: BN;
  endTimestamp?: number;
};

const columnHelper = createColumnHelper<UnstakeRequestItem>();

const columns = [
  columnHelper.accessor('address', {
    header: () => (
      <HeaderCell title="Unstake Request" className="justify-start" />
    ),
    cell: (props) => {
      return (
        <div className="flex items-center justify-start gap-2">
          <CheckBox
            isChecked={false}
            onChange={() => void 0}
            wrapperClassName="pt-0.5"
          />

          <AddressLink address={props.getValue()} />
        </div>
      );
    },
  }),
  columnHelper.accessor('endTimestamp', {
    header: () => <HeaderCell title="Status" className="justify-center" />,
    cell: (props) => {
      const endTimestamp = props.getValue();

      const timeRemaining =
        endTimestamp === undefined
          ? undefined
          : calculateTimeRemaining(new Date(endTimestamp));

      const content =
        timeRemaining === undefined ? (
          <CheckboxCircleFill className="dark:fill-green-50" />
        ) : (
          <div className="flex gap-1 items-center justify-center">
            <TimeLineIcon className="dark:fill-blue-50" /> {timeRemaining}
          </div>
        );

      return <div className="flex items-center justify-center">{content}</div>;
    },
  }),
  columnHelper.accessor('amount', {
    header: () => <HeaderCell title="Amount" className="justify-center" />,
    cell: (props) => {
      return <TokenAmountCell amount={props.getValue()} tokenSymbol="tgDOT" />;
    },
  }),
];

const UnstakeRequestsTable: FC = () => {
  // TODO: Mock data.
  const data: UnstakeRequestItem[] = [
    {
      address: '0x3a7f9e8c14b7d2f5' as any,
      endTimestamp: undefined,
      amount: new BN(100),
    },
    {
      address: '0xd5c4a2b1f3e8c7d9' as any,
      endTimestamp: 1720659733,
      amount: new BN(123),
    },
    {
      address: '0x9b3e47d8a5c2f1e4' as any,
      endTimestamp: 1720859733,
      amount: new BN(321),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <GlassCard>
        {data.length === 0 ? (
          <NoUnstakeRequestsNotice />
        ) : (
          <Table
            thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
            trClassName="!bg-inherit"
            tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
            tableProps={table}
            totalRecords={data.length}
          />
        )}
      </GlassCard>

      <div className="flex items-center justify-center w-full gap-2">
        <Button isFullWidth variant="secondary">
          Cancel Unstake
        </Button>

        <Button isFullWidth isDisabled variant="primary">
          Withdraw
        </Button>
      </div>
    </div>
  );
};

const NoUnstakeRequestsNotice: FC = () => {
  return (
    <div className="flex flex-col items-start justify-center gap-4">
      <Typography className="dark:text-mono-0" variant="body1" fw="bold">
        No unstake requests
      </Typography>

      <Typography variant="body2" fw="normal">
        You will be able to claim your tokens after the unstake request has been
        processed. To unstake your tokens go to the unstake tab to schedule
        request.
      </Typography>
    </div>
  );
};

export default UnstakeRequestsTable;
