import { ComponentProps } from '../../../../../node_modules/react';
import { UseCopyableReturnType } from '../../hooks/useCopyable';
import { ComponentBase } from '../../types';
import { LabelWithValueProps } from '../LabelWithValue/types';
export type KeyValueWithButtonSize = 'sm' | 'md';
type KeyValueWithButtonBasePickedKeys = 'isHiddenLabel' | 'labelVariant' | 'valueFontWeight' | 'valueVariant';
export type KeyValueWithButtonBaseProps = Pick<LabelWithValueProps, KeyValueWithButtonBasePickedKeys>;
/**
 * The `KeyValueWithButton` props
 */
export interface KeyValueWithButtonProps extends Omit<ComponentBase, keyof KeyValueWithButtonBaseProps>, KeyValueWithButtonBaseProps {
    /**
     * The label value
     * @default ''
     */
    label?: string;
    /**
     * The `key` hash value
     */
    keyValue: string;
    /**
     * The component size
     * @default "md"
     */
    size?: 'sm' | 'md';
    /**
     * Whether format the value in the short form.
     * @default true
     */
    hasShortenValue?: boolean;
    /**
     * If `true`, the tooltip value will be disabled.
     */
    isDisabledTooltip?: boolean;
    onCopyButtonClick?: ComponentProps<'button'>['onClick'];
    copyProps?: UseCopyableReturnType;
    /**
     * @default 5
     */
    displayCharCount?: number;
}
export {};
