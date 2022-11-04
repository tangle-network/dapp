import {
  AccordionContentProps as RdxAccordionContentProps,
  AccordionTriggerProps,
  AccordionSingleProps,
  AccordionMultipleProps,
  AccordionItemProps as RdxAccordionItemProps,
} from '@radix-ui/react-accordion';
import { PropsOf, IWebbComponentBase } from '../../types';

export type AccordionProps = IWebbComponentBase &
  (AccordionSingleProps | AccordionMultipleProps);

export interface AccordionButtonProps
  extends IWebbComponentBase,
    PropsOf<'button'>,
    AccordionTriggerProps {}

export interface AccordionContentProps
  extends IWebbComponentBase,
    RdxAccordionContentProps {}

export interface AccordionItemProps
  extends IWebbComponentBase,
    RdxAccordionItemProps {}
