import { twMerge } from 'tailwind-merge';

import { TitleWithInfo } from '../TitleWithInfo';
import { CardTableProps } from './types';

export const CardTable: React.FC<CardTableProps> = ({ children, className, leftTitle, ...props }) => {
  return (
    <div {...props} className={twMerge('rounded-lg bg-mono-0 dark:bg-mono-160', className)}>
      {/** Title and filter */}
      <div className='flex items-center justify-between px-6 pt-4 pb-2'>
        <TitleWithInfo title='List of Keygens' info='List of Keygens' variant='h5' />

        {leftTitle}
      </div>

      {/** Table */}
      {children}
    </div>
  );
};
