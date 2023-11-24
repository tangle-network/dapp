import type { FC } from 'react';
import cx from 'classnames';
import { ArrowDropDownFill } from '@webb-tools/icons';

import {
  Accordion,
  AccordionButtonBase,
  AccordionContent,
  AccordionItem,
} from '../Accordion';
import { Button } from '../buttons';
import { Input } from '../Input';
import { Typography } from '../../typography/Typography';
import { FunctionInfoType } from './types';

const FunctionInputs: FC<{ fncInfo: FunctionInfoType }> = ({ fncInfo }) => {
  const { fncName, fncParams } = fncInfo;
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full bg-[#F7F8F7]/80 dark:bg-mono-180 rounded-lg"
    >
      <AccordionItem value={fncName}>
        <AccordionButtonBase className="w-full group flex items-center justify-between">
          <Typography variant="h5" fw="bold">
            {fncName}
          </Typography>

          <ArrowDropDownFill
            size="lg"
            className={cx(
              'ml-2 fill-mono-120 dark:fill-mono-100 duration-300',
              'group-radix-state-open:rotate-180',
              'group-radix-state-closed:rotate-0'
            )}
          />
        </AccordionButtonBase>

        <AccordionContent
          className={cx(
            'overflow-hidden',
            'radix-state-open:animate-accordion-slide-down',
            'radix-state-closed:animate-accordion-slide-up'
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
                  />
                </div>
              );
            })}

            <Button className="!rounded-lg">Submit</Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FunctionInputs;
