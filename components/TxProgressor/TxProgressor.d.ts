import { TxProgressorBodyProps, TxProgressorFooterProps, TxProgressorHeaderProps, TxProgressorRootProps } from './types';
declare const TxProgressorRoot: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorRootProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TxProgressorHeader: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorHeaderProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TxProgressorBody: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorBodyProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TxProgressorFooter: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorFooterProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
/**
 * The Transaction Progressor component is a component
 * that displays the progress of a transaction.
 *
 * It is composed of 4 components:
 * - `TxProgressor.Root`
 * - `TxProgressor.Header`
 * - `TxProgressor.Body`
 * - `TxProgressor.Footer`
 *
 * @example
 * ```tsx
 * <TxProgressor.Root>
 *  <TxProgressor.Header name="Deposit" createdAt={Date.now()} />
 *    <TxProgressor.Body
 *      txSourceInfo={{
 *        typedChainId: PresetTypedChainId.Goerli,
 *        amount: -1.45,
 *        tokenSymbol: 'WETH',
 *        walletAddress: randEthereumAddress(),
 *      }}
 *      txDestinationInfo={{
 *        typedChainId: PresetTypedChainId.PolygonTestnet,
 *        amount: 1.45,
 *        tokenSymbol: 'ETH',
 *        tokenType: 'shielded',
 *        accountType: 'note',
 *        walletAddress: randEthereumAddress(),
 *      }}
 *    />
 *    <TxProgressor.Footer
 *      status="info"
 *      statusMessage="Fetching Leaves (15%)"
 *      steppedProgressProps={{
 *        steps: 8,
 *        activeStep: 3,
 *      }}
 *      externalUrl={new URL('https://tangle.tools')}
 *      actionCmp='Open explorer'
 *    />
 *  </TxProgressor.Root>
 * ```
 */
declare const TxProgressor: {
    Root: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorRootProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    Header: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorHeaderProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    Body: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorBodyProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    Footer: import('../../../../../node_modules/react').ForwardRefExoticComponent<TxProgressorFooterProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
};
export { TxProgressor, TxProgressorBody, TxProgressorFooter, TxProgressorHeader, TxProgressorRoot, };
