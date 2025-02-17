import { ElementType } from '../../../../../node_modules/react';
import { TransactionButtonProps, TransactionInputCardBodyProps, TransactionInputCardContextValue, TransactionInputCardFooterProps, TransactionInputCardHeaderProps, TransactionInputCardRootProps, TransactionMaxAmountButtonProps } from './types';
declare const TransactionInputCardRoot: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardRootProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TransactionChainSelector: import('../../../../../node_modules/react').ForwardRefExoticComponent<{
    as?: ElementType | undefined;
} & Omit<Omit<import('../../../../../node_modules/react').DetailedHTMLProps<import('../../../../../node_modules/react').ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref">, "as"> & Pick<TransactionInputCardContextValue, "typedChainId"> & {
    placeholder?: string;
    renderBody?: () => import('../../../../../node_modules/react').ReactNode;
} & import('../../../../../node_modules/react').RefAttributes<any>>;
declare const TransactionButton: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionButtonProps & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
declare const TransactionMaxAmountButton: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionMaxAmountButtonProps & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
declare const TransactionInputCardHeader: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardHeaderProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TransactionInputCardBody: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardBodyProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TransactionInputCardFooter: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardFooterProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
declare const TransactionInputCard: {
    Root: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardRootProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    Header: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardHeaderProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    Body: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardBodyProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    Footer: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionInputCardFooterProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
    ChainSelector: import('../../../../../node_modules/react').ForwardRefExoticComponent<{
        as?: ElementType | undefined;
    } & Omit<Omit<import('../../../../../node_modules/react').DetailedHTMLProps<import('../../../../../node_modules/react').ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref">, "as"> & Pick<TransactionInputCardContextValue, "typedChainId"> & {
        placeholder?: string;
        renderBody?: () => import('../../../../../node_modules/react').ReactNode;
    } & import('../../../../../node_modules/react').RefAttributes<any>>;
    Button: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionButtonProps & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
    MaxAmountButton: import('../../../../../node_modules/react').ForwardRefExoticComponent<TransactionMaxAmountButtonProps & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
};
export { TransactionButton, TransactionChainSelector, TransactionInputCard, TransactionInputCardBody, TransactionInputCardFooter, TransactionInputCardHeader, TransactionInputCardRoot, TransactionMaxAmountButton, };
