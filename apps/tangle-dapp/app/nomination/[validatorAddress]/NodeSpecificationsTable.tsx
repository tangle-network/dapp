'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Chip,
  fuzzyFilter,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC, useMemo } from 'react';

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
    header: () => (
      <HeaderCell title="Operating System" className="justify-start" />
    ),
    cell: (props) => {
      return <Chip color="dark-grey">{props.getValue()}</Chip>;
    },
  }),
  columnHelper.accessor('version', {
    header: () => <HeaderCell title="Version" className="justify-start" />,
    cell: (props) => {
      return (
        <Chip color="dark-grey" className="">
          {props.getValue()}
        </Chip>
      );
    },
  }),
  columnHelper.accessor('cpuCores', {
    header: () => <HeaderCell title="CPU Cores" className="justify-start" />,
    cell: (props) => {
      return <Chip color="dark-grey">{props.getValue()}</Chip>;
    },
  }),
  columnHelper.accessor('memory', {
    header: () => <HeaderCell title="Memory" className="justify-start" />,
    cell: (props) => {
      return <Chip color="dark-grey">{props.getValue()}GB</Chip>;
    },
  }),
  columnHelper.accessor('isVirtualMachine', {
    header: () => (
      <HeaderCell title="Is Virtual Machine?" className="justify-start" />
    ),
    cell: (props) => {
      return (
        <Chip
          color="dark-grey"
          className={cx({
            '!bg-mono-120 dark:!bg-mono-100': !props.getValue(),
          })}
        >
          {props.getValue() ? 'Yes' : 'No'}
        </Chip>
      );
    },
  }),
  columnHelper.accessor('linuxDistribution', {
    header: () => (
      <HeaderCell title="Linux Distribution" className="justify-start" />
    ),
    cell: (props) => {
      return <Chip color="dark-grey">{props.getValue()}</Chip>;
    },
  }),
  columnHelper.accessor('linuxKernel', {
    header: () => <HeaderCell title="Linux Kernel" className="justify-start" />,
    cell: (props) => {
      return <Chip color="dark-grey">{props.getValue()}</Chip>;
    },
  }),
];

const NodeSpecificationsTable: FC<NodeSpecificationsTableProps> = ({
  validatorAddress,
}) => {
  const { data, isLoading, error } = useNodeSpecifications(validatorAddress);
  const nodeSpecifications = useMemo(() => data.nodeSpecifications, [data]);

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

      <div
        className={cx(
          'min-h-[120px] bg-glass dark:bg-glass_dark py-3 px-4 rounded-2xl overflow-x-auto',
          'flex flex-col',
          'border border-mono-0 dark:border-mono-160',
        )}
      >
        {/* Loading */}
        {isLoading && <ContainerSkeleton numOfRows={2} />}

        {/* Error */}
        {!isLoading && error && (
          <div className="flex-1 flex items-center justify-center">
            <Typography variant="body1">
              Oops! There was an error when retrieving the data
            </Typography>
          </div>
        )}

        {/* No data */}
        {!isLoading && !error && nodeSpecifications.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <Typography variant="body1">
              No node specifications from this validator was found!
            </Typography>
          </div>
        )}

        {/* Successfully get the data */}
        {!isLoading && !error && nodeSpecifications.length > 0 && (
          <Table
            thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
            trClassName="!bg-inherit cursor-pointer"
            tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
            tableProps={table}
            totalRecords={nodeSpecifications.length}
          />
        )}
      </div>
    </div>
  );
};

export default NodeSpecificationsTable;
