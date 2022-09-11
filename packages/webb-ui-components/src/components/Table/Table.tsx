import { flexRender, RowData } from '@tanstack/react-table';
import React, { forwardRef } from 'react';

import { Pagination } from '../Pagination';
import { TData } from './TData';
import { THeader } from './THeader';
import { TableProps } from './types';

const TableComp = <T extends RowData>(
  { isDisplayFooter, isPaginated, paginationProps, tableProps: table, ...props }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) => {
  return (
    <div {...props} ref={ref}>
      <table className='w-full border-collapse table-auto'>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <THeader key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </THeader>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className='group'>
              {row.getVisibleCells().map((cell) => (
                <TData key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TData>
              ))}
            </tr>
          ))}
        </tbody>
        {isDisplayFooter && (
          <tfoot>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <THeader key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())}
                  </THeader>
                ))}
              </tr>
            ))}
          </tfoot>
        )}
      </table>

      {/** Pagination */}
      {isPaginated && <Pagination {...paginationProps} />}
    </div>
  );
};

export const Table = forwardRef(TableComp);
