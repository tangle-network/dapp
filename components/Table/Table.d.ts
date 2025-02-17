import { RowData } from '@tanstack/react-table';
import { TableProps } from './types';
export declare const Table: <T extends RowData>({ isDisabledRowHoverStyle, isDisplayFooter, isPaginated, onRowClick, paginationClassName, tableClassName, tableProps: table, tableWrapperClassName, tbodyClassName, tdClassName, thClassName, title, totalRecords, trClassName, ref, getExpandedRowContent, className, variant, paginationLabelOverride, ...props }: TableProps<T, HTMLDivElement>) => import("react/jsx-runtime").JSX.Element;
