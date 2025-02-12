'use client';

import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ArrowRight } from '@webb-tools/icons';

interface SelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  onRegister: () => void;
}

const SelectionBar: FC<SelectionBarProps> = ({
  selectedCount,
  onClear,
  onRegister,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className={twMerge(
          'w-[1001px] h-[91px] p-6 rounded-xl justify-between items-center inline-flex',
          'bg-mono-0 dark:bg-mono-180',
          'bg-[linear-gradient(180deg,rgba(184,196,255,0.20)0%,rgba(236,239,255,0.20)100%),linear-gradient(180deg,rgba(255,255,255,0.50)0%,rgba(255,255,255,0.30)100%)]',
          'dark:bg-[linear-gradient(180deg,rgba(17,22,50,0.20)0%,rgba(21,37,117,0.20)100%),linear-gradient(180deg,rgba(43,47,64,0.50)0%,rgba(43,47,64,0.30)100%)]',
          'before:absolute before:inset-0 before:bg-cover before:bg-no-repeat before:opacity-30 before:pointer-events-none before:rounded-xl',
          "before:bg-[url('/static/assets/blueprints/grid-bg.png')] dark:before:bg-[url('/static/assets/blueprints/grid-bg-dark.png')]",
          'relative overflow-hidden',
          'shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] dark:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.20)]'
        )}
      >
        <div className="justify-end items-center gap-6 flex">
          <div className="text-center text-mono-200 dark:text-white text-lg font-bold font-['Satoshi'] leading-[27px] tracking-tight">
            {selectedCount} Blueprint(s) selected
          </div>
          <div className="justify-start items-start gap-2.5 flex">
            <button
              onClick={onClear}
              className="text-center text-[#8195f6] text-lg font-bold font-['Satoshi'] leading-[27px] tracking-tight"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="justify-end items-center gap-2 flex">
          <Button 
            onClick={onRegister}
            rightIcon={<ArrowRight className="!fill-current" />}
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectionBar; 