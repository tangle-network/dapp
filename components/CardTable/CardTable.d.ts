import { CardTableProps } from './types';
/**
 * The style wrapper component for card with table. The component will display the title along with tooltip info
 * and displays `leftTitle` as an argument. Use to wrap around a table component
 *
 * @example
 *
 * ```jsx
 *    <CardTable
 *      leftTitle={
 *        <Filter>
 *          // ...
 *        </Filter>
 *      }
 *    >
 *      <Table
 *        {...props}
 *      />
 *    </CardTable>
 * ```
 */
export declare const CardTable: React.FC<CardTableProps>;
