import { CustomContentProps } from 'notistack';
interface Props extends CustomContentProps {
    Icon?: JSX.Element;
    secondaryMessage?: JSX.Element | string;
}
export declare const NotificationItem: import('../../../../../node_modules/react').ForwardRefExoticComponent<Props & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
export {};
