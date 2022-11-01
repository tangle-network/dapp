import {
  CollapsibleContentProps as RdxCollapsibleContentProps,
  CollapsibleTriggerProps,
} from '@radix-ui/react-collapsible';
import { PropsOf, IWebbComponentBase } from '../../types';

export interface CollapsibleProps extends IWebbComponentBase, PropsOf<'div'>, CollapsibleContentProps {}

export interface CollapsibleButtonProps extends IWebbComponentBase, PropsOf<'button'>, CollapsibleTriggerProps {}

export interface CollapsibleContentProps extends IWebbComponentBase, RdxCollapsibleContentProps {}
