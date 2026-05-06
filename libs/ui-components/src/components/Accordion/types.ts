import {
  AccordionContentProps as RdxAccordionContentProps,
  AccordionTriggerProps,
  AccordionSingleProps,
  AccordionMultipleProps,
  AccordionItemProps as RdxAccordionItemProps,
} from '@radix-ui/react-accordion';
import { PropsOf, IComponentBase } from '../../types';

export type AccordionProps = IComponentBase &
  (AccordionSingleProps | AccordionMultipleProps);

export interface AccordionButtonProps
  extends IComponentBase,
    PropsOf<'button'>,
    AccordionTriggerProps {
  Icon?: React.ReactNode;

  RightIcon?: React.ReactNode;
}

export interface AccordionButtonBaseProps extends AccordionTriggerProps {}

export interface AccordionContentProps
  extends IComponentBase,
    RdxAccordionContentProps {}

export interface AccordionItemProps
  extends IComponentBase,
    RdxAccordionItemProps {}
