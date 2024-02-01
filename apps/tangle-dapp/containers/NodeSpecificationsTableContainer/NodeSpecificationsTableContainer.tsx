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
import { FC } from 'react';

import { HeaderCell } from '../../components/tableCells';
import useNodeSpecifications from '../../data/useNodeSpecifications';
import { NodeSpecification } from '../../types';

interface NodeSpecificationsTableContainerProps {
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
    header: () => <HeaderCell title="Memory" className="justify-start" />,
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

const NodeSpecificationsTableContainer: FC<
  NodeSpecificationsTableContainerProps
> = ({ validatorAddress }) => {
  const { data } = useNodeSpecifications(validatorAddress);

  const table = useReactTable({
    data: data.nodeSpecifications,
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
    <div className="space-y-5">
      <Typography variant="h4" fw="bold">
        Node Specifications
      </Typography>
      <div
        className={cx(
          'bg-glass dark:bg-glass_dark py-3 px-4 rounded-2xl overflow-x-auto',
          'border border-mono-0 dark:border-mono-160'
        )}
      >
        <Table
          tableClassName="!bg-inherit block overflow-x-auto max-w-[-moz-fit-content] max-w-fit md:table md:max-w-none"
          thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
          trClassName="!bg-inherit cursor-pointer"
          tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
          tableProps={table}
          totalRecords={data.nodeSpecifications.length}
        />
      </div>
    </div>
  );
};

export default NodeSpecificationsTableContainer;
