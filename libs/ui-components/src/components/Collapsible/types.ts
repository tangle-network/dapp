import {
  CollapsibleContentProps as RdxCollapsibleContentProps,
  CollapsibleTriggerProps,
} from '@radix-ui/react-collapsible';
import { PropsOf, IComponentBase } from '../../types';

export interface CollapsibleProps
  extends IComponentBase,
    PropsOf<'div'>,
    CollapsibleContentProps {}

export interface CollapsibleButtonProps
  extends IComponentBase,
    PropsOf<'button'>,
    CollapsibleTriggerProps {}

export interface CollapsibleContentProps
  extends IComponentBase,
    RdxCollapsibleContentProps {}
