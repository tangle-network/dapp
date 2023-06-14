import { FC, useCallback, useMemo } from 'react';
import cx from 'classnames';
import { Typography } from '@webb-tools/webb-ui-components';
import { ChevronLeft, ChevronRight } from '@webb-tools/icons';

interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  itemsLength: number;
  pageSize: number;
  previousPageFn: () => void;
  nextPageFn: () => void;
  setPageIndex: (index: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  pageIndex,
  pageCount,
  itemsLength,
  pageSize,
  previousPageFn,
  nextPageFn,
  setPageIndex,
}) => {
  const getPaginationItem = useCallback(
    (idx: number) => {
      const isActive = idx === pageIndex;
      return (
        <div
          onClick={() => {
            setPageIndex(idx);
          }}
          className={cx('bg-mono-0 p-2 rounded-[5px] cursor-pointer', {
            'bg-[#F6F4FF]': isActive,
          })}
        >
          <Typography
            variant="mkt-body2"
            fw="bold"
            className={cx({ 'text-[#624FBE]': isActive })}
          >
            {idx + 1}
          </Typography>
        </div>
      );
    },
    [pageIndex, setPageIndex]
  );

  const fewItems = useMemo(
    () => (
      <>
        {Array.from({ length: pageCount }, (_, idx) => {
          return getPaginationItem(idx);
        })}
      </>
    ),
    [pageCount, getPaginationItem]
  );

  const topIndexItemsMobile = useMemo(
    () => (
      <>
        {getPaginationItem(1)}
        {getPaginationItem(2)}
        {pageIndex === 2 && getPaginationItem(3)}
        ...
      </>
    ),
    [pageIndex, getPaginationItem]
  );

  const topIndexItemsDesktop = useMemo(
    () => (
      <>
        {getPaginationItem(1)}
        {getPaginationItem(2)}
        {getPaginationItem(3)}
        {getPaginationItem(4)}
        {pageIndex === 4 && getPaginationItem(5)}
        ...
      </>
    ),
    [pageIndex, getPaginationItem]
  );

  const lastIndexItemsMobile = useMemo(
    () => (
      <>
        ...
        {pageIndex === pageCount - 3 && getPaginationItem(pageCount - 4)}
        {getPaginationItem(pageCount - 3)}
        {getPaginationItem(pageCount - 2)}
      </>
    ),
    [getPaginationItem, pageIndex, pageCount]
  );

  const lastIndexItemsDesktop = useMemo(
    () => (
      <>
        ...
        {pageIndex === pageCount - 5 && getPaginationItem(pageCount - 6)}
        {getPaginationItem(pageCount - 5)}
        {getPaginationItem(pageCount - 4)}
        {getPaginationItem(pageCount - 3)}
        {getPaginationItem(pageCount - 2)}
      </>
    ),
    [getPaginationItem, pageIndex, pageCount]
  );

  const middleIndexItemsMobile = useMemo(
    () => (
      <>
        ...
        {getPaginationItem(pageIndex - 1)}
        {getPaginationItem(pageIndex)}
        {getPaginationItem(pageIndex + 1)}
        ...
      </>
    ),
    [getPaginationItem, pageIndex]
  );

  const middleIndexItemsDesktop = useMemo(
    () => (
      <>
        ...
        {getPaginationItem(pageIndex - 2)}
        {getPaginationItem(pageIndex - 1)}
        {getPaginationItem(pageIndex)}
        {getPaginationItem(pageIndex + 1)}
        {getPaginationItem(pageIndex + 2)}
        ...
      </>
    ),
    [getPaginationItem, pageIndex]
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <Typography variant="mkt-body2" fw="black" className="flex-[1]">
        Showing {itemsLength <= pageSize ? itemsLength : pageSize} participants
        out of {itemsLength}
      </Typography>
      <div className="flex-[2] md:flex-[1] flex justify-end items-center gap-1">
        <ChevronLeft onClick={previousPageFn} />
        <div className="hidden md:flex gap-1">
          {pageCount <= 6 ? (
            fewItems
          ) : (
            <>
              {getPaginationItem(0)}
              {pageIndex <= 3
                ? topIndexItemsDesktop
                : pageIndex >= pageCount - 4
                ? lastIndexItemsDesktop
                : middleIndexItemsDesktop}
              {getPaginationItem(pageCount - 1)}
            </>
          )}
        </div>
        <div className="flex md:hidden gap-1">
          {pageCount <= 5 ? (
            fewItems
          ) : (
            <>
              {getPaginationItem(0)}
              {pageIndex <= 2
                ? topIndexItemsMobile
                : pageIndex >= pageCount - 3
                ? lastIndexItemsMobile
                : middleIndexItemsMobile}
              {getPaginationItem(pageCount - 1)}
            </>
          )}
        </div>
        <ChevronRight onClick={nextPageFn} />
      </div>
    </div>
  );
};
