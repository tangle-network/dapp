import { TimeLineProps } from './types';
/**
 * The `TimeLine` style wrapper
 *
 * @example
 *
 * ```jsx
 *    <TimeLine>
 *      <TimeLineItem
 *        title='Proposed'
 *        time={randRecentDate()}
 *        txHash={randEthereumAddress()}
 *        externalUrl='https://tangle.tools'
 *      />
 *    </TimeLine>
 * ```
 */
export declare const TimeLine: import('../../../../../node_modules/react').ForwardRefExoticComponent<TimeLineProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
