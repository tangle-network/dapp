import { IComponentBase, PropsOf } from '../../types';
export interface TimeLineProps extends PropsOf<'div'>, IComponentBase {
}
export interface TimeLineItemProps extends PropsOf<'div'>, IComponentBase {
    /**
     * The timeline title
     */
    title: string;
    /**
     * The actual time the event happens
     */
    time: Date;
    /**
     * The block hash
     */
    blockHash: string;
    /**
     * External url to the transaction
     */
    externalUrl: string;
    /**
     * The extra content to display under the tx hash section
     */
    extraContent?: React.ReactElement;
    /**
     * If `true`, the spinner icon will be displayed
     */
    isLoading?: boolean;
}
