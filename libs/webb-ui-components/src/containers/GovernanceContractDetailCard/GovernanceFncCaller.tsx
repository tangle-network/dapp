import type { FC } from 'react';
import cx from 'classnames';
import { ArrowDropDownFill, InformationLine } from '@webb-tools/icons';

import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
} from '../../components/Accordion';
import { Button } from '../../components/buttons';
import { Input } from '../../components/Input';
import { Typography } from '../../typography/Typography';
import type { GovernanceFncCallerProps } from './types';

const GovernanceFncCaller: FC<GovernanceFncCallerProps> = ({
  fncName,
  fncParams,
  isDisabled,
  warningText,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-[#F7F8F7]/80 dark:bg-mono-180 rounded-lg"
    >
      <AccordionItem value={fncName}>
        <AccordionButtonBase className="w-full group flex items-center justify-between">
          <Typography variant="body1" fw="bold">
            {fncName}
          </Typography>

          <ArrowDropDownFill
            size="lg"
            className={cx(
              'ml-2 fill-mono-120 dark:fill-mono-100 duration-300',
              'group-radix-state-open:rotate-180',
              'group-radix-state-closed:rotate-0',
            )}
          />
        </AccordionButtonBase>

        <AccordionContent
          className={cx(
            'overflow-hidden',
            'radix-state-open:animate-accordion-slide-down',
            'radix-state-closed:animate-accordion-slide-up',
          )}
        >
          <div className="flex flex-col items-end gap-2">
            {fncParams.map((param) => {
              const { name, type } = param;
              return (
                <div className="w-full flex items-center justify-end gap-2">
                  <Typography variant="body1">{name}: </Typography>
                  <Input
                    id={`${fncName}-${name}`}
                    className="w-[75%]"
                    placeholder={type}
                    isDisabled={isDisabled}
                  />
                </div>
              );
            })}

            <Button className="!rounded-lg" isDisabled={isDisabled}>
              Submit
            </Button>

            {warningText && (
              <div className="flex justify-end items-center gap-1">
                <InformationLine className="!fill-red-50" />
                <Typography variant="body3" className="!text-red-50">
                  {warningText}
                </Typography>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default GovernanceFncCaller;
