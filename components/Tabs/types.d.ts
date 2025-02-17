import { PropsOf, IComponentBase } from '../../types';
export interface TabBaseProps {
    /**
     * If `true`, it will disable the styling of the tab component
     */
    isDisableStyle?: boolean;
}
/**
 * The `Tabs` props
 */
export interface TabsProps extends IComponentBase {
    /**
     * The displayed values of tabs
     */
    value: string[];
    /**
     * The callback to control the component
     */
    onChange?: (nextValue: string) => void;
}
/**
 * The `Tab` props
 */
export interface TabProps extends PropsOf<'button'>, IComponentBase {
    /**
     * If `true`, indicate the tab is being actived
     */
    isActive?: boolean;
}
