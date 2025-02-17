export interface PaginationItemsOptions {
    /**
     * The total number of pages.
     * @default 1
     */
    count?: number;
    /**
     * Number of always visible pages at the beginning and end.
     * @default 1
     */
    boundaryCount?: number;
    /**
     * Number of always visible pages before and after the current page.
     * @default 1
     */
    siblingCount?: number;
    /**
     * The current page.
     * @default 1
     */
    page?: number;
}
/**
 * Get the array of displayed items of pagination. E.g. [1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10,]
 * @param options {PaginationItemsOptions} The hook options
 */
export declare const getPaginationItems: (options: PaginationItemsOptions) => (number | string)[];
