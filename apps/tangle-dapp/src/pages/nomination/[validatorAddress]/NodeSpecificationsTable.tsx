import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  fuzzyFilter,
  Table,
  Typography,
} from '@tangle-network/webb-ui-components';
import cx from 'classnames';
import { FC } from 'react';

import ContainerSkeleton from '../../../components/skeleton/ContainerSkeleton';
import { HeaderCell } from '../../../components/tableCells';
import useNodeSpecifications from '../../../data/validatorDetails/useNodeSpecifications';
import { NodeSpecification } from '../../../types';

interface NodeSpecificationsTableProps {
  validatorAddress: string;
}

const columnHelper = createColumnHelper<NodeSpecification>();

const columns = [
  columnHelper.accessor('os', {
    header: () => <HeaderCell title="OS" className="justify-start" />,
    cell: (props) => (
      <Typography variant="body1">
        {props.getValue()} {props.row.original.isVirtualMachine && 'VM'}
      </Typography>
    ),
  }),
  columnHelper.accessor('linuxDistribution', {
    header: () => <HeaderCell title="Distribution" className="justify-start" />,
    cell: (props) => (
      <Typography variant="body1">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor('version', {
    header: () => <HeaderCell title="Version" className="justify-start" />,
    cell: (props) => (
      <Typography variant="body1">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor('linuxKernel', {
    header: () => <HeaderCell title="Kernel" className="justify-start" />,
    cell: (props) => (
      <Typography variant="body1">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor('cpuCores', {
    header: () => <HeaderCell title="CPU Cores" className="justify-start" />,
    cell: (props) => (
      <Typography variant="body1">{props.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor('memory', {
    header: () => <HeaderCell title="Memory" className="justify-start" />,
    cell: (props) => (
      <Typography variant="body1">{props.getValue()}GB</Typography>
    ),
  }),
];

const NodeSpecificationsTable: FC<NodeSpecificationsTableProps> = ({
  validatorAddress,
}) => {
  const { data, isLoading, error } = useNodeSpecifications(validatorAddress);

  const nodeSpecifications = data.nodeSpecifications;

  const table = useReactTable({
    data: nodeSpecifications,
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
      <Typography variant="h5" fw="bold">
        Node Specifications
      </Typography>

      <div className={cx('min-h-[120px] overflow-x-auto', 'flex flex-col')}>
        {/* Loading */}
        {isLoading && <ContainerSkeleton numOfRows={2} />}

        {/* Error */}
        {!isLoading && error !== null && (
          <TableStatus
            icon="⚠️"
            title="Failed to Load Data"
            description={`Sorry, there was an error while retrieving the data: ${error.message}`}
          />
        )}

        {/* No data */}
        {!isLoading && error === null && nodeSpecifications.length === 0 && (
          <TableStatus
            title="No Specifications"
            description="There is no node specifications associated with this specific validator."
          />
        )}

        {/* Success; show the table */}
        {!isLoading && error === null && nodeSpecifications.length > 0 && (
          <Table tableProps={table} totalRecords={nodeSpecifications.length} />
        )}
      </div>
    </div>
  );
};

export default NodeSpecificationsTable;
