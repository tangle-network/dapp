import {
  CollapsibleContentProps as RdxCollapsibleContentProps,
  CollapsibleTriggerProps,
} from '@radix-ui/react-collapsible';
import { PropsOf, WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

export interface CollapsibleProps extends WebbComponentBase, PropsOf<'div'>, CollapsibleContentProps {}

export interface CollapsibleButtonProps extends WebbComponentBase, PropsOf<'button'>, CollapsibleTriggerProps {}

export interface CollapsibleContentProps extends WebbComponentBase, PropsOf<'button'>, RdxCollapsibleContentProps {}
