import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowRightUp,
  CheckboxCircleFill,
  Close,
  TimeFillIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  CheckBox,
  fuzzyFilter,
  IconButton,
  Table,
  TANGLE_DOCS_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import BN from 'bn.js';
import { FC, ReactNode } from 'react';

import { AnySubstrateAddress } from '../../types/utils';
import calculateTimeRemaining from '../../utils/calculateTimeRemaining';
import GlassCard from '../GlassCard';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import AddressLink from './AddressLink';
import CancelUnstakeModal from './CancelUnstakeModal';
import ExternalLink from './ExternalLink';

export type UnstakeRequestItem = {
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
            <TimeFillIcon className="dark:fill-blue-50" /> {timeRemaining}
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
  columnHelper.display({
    id: 'actions',
    header: () => <HeaderCell title="Actions" className="justify-center" />,
    cell: (_props) => {
      return (
        <div className="flex items-center justify-center gap-1">
          {/* TODO: Implement onClick. */}
          <UtilityIconButton
            Icon={Close}
            tooltip="Cancel"
            onClick={() => void 0}
          />

          {/* TODO: Implement onClick. */}
          <UtilityIconButton
            Icon={WalletLineIcon}
            tooltip="Withdraw"
            onClick={() => void 0}
          />
        </div>
      );
    },
    enableSorting: false,
  }),
];

const UnstakeRequestsTable: FC = () => {
  // TODO: Mock data.
  const data: UnstakeRequestItem[] = [
    {
      address: '0x123456' as any,
      amount: new BN(100),
      endTimestamp: Date.now() + 1000 * 60 * 60 * 24,
    },
    {
      address: '0x123456' as any,
      amount: new BN(100),
      endTimestamp: Date.now() + 1000 * 60 * 60 * 24,
    },
    {
      address: '0x123456' as any,
      amount: new BN(100),
      endTimestamp: Date.now() + 1000 * 60 * 60 * 24,
    },
    {
      address: '0x123456' as any,
      amount: new BN(100),
      endTimestamp: Date.now() + 1000 * 60 * 60 * 24,
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
    <div className="space-y-4 flex-grow max-w-[700px]">
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

      {data.length === 0 && (
        <div className="flex items-center justify-end w-full">
          <ExternalLink Icon={ArrowRightUp} href={TANGLE_DOCS_URL}>
            View Docs
          </ExternalLink>
        </div>
      )}

      {/* TODO: Handle this modal properly. */}
      <CancelUnstakeModal
        isOpen={false}
        onClose={() => void 0}
        unstakeRequest={null as any}
      />
    </div>
  );
};

/** @internal */
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

export type UtilityIconButtonProps = {
  tooltip: string;
  Icon: (props: IconBase) => ReactNode;
  onClick: () => void;
};

/** @internal */
const UtilityIconButton: FC<UtilityIconButtonProps> = ({
  tooltip,
  Icon,
  onClick,
}) => {
  return (
    <IconButton
      className="dark:bg-blue-120 hover:bg-blue-10"
      onClick={onClick}
      tooltip={tooltip}
    >
      <Icon className="fill-blue-80 dark:fill-blue-40" size="md" />
    </IconButton>
  );
};

export default UnstakeRequestsTable;
