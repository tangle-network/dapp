import { AccordionProps } from './types';
/**
 * The wrapper around Radix Accordion Root, use for displaying collapsible content
 *
 * @example
 *
 * ```jsx
 *    <Accordion>
 *      <AccordionItem value='item1'>
 *        <AccordionButton>Click to expand</AccordionButton>
 *        <AccordionContent>Expanded section</AccordionContent>
 *      </AccordionItem>
 *    </Accordion>
 * ```
 */
export declare const Accordion: import('../../../../../node_modules/react').ForwardRefExoticComponent<AccordionProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
