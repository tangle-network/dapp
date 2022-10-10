import { ChevronRight, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { ComponentProps, forwardRef, useMemo } from 'react';

import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { ChainInputProps } from './types';

export const ChainInput = forwardRef<HTMLDivElement, ChainInputProps>(({ chain, chainType, ...props }, ref) => {
  const titleProps = useMemo<ComponentProps<typeof TitleWithInfo>>(
    () => ({ title: (chainType === 'source' ? 'Source' : 'Destination') + ' chain', variant: 'utility' }),
    [chainType]
  );

  return (
    <InputWrapper {...props} ref={ref}>
      <div className='flex flex-col space-y-1'>
        <TitleWithInfo {...titleProps} className='text-mono-100 dark:text-mono-80' />

        {chain ? (
          <p className='flex items-center space-x-1'>
            <TokenIcon name={chain.symbol.trim().toLowerCase()} size='lg' />

            <Typography component='span' variant='body1' fw='bold'>
              {chain.name}
            </Typography>
          </p>
        ) : (
          <Typography variant='body1' fw='bold'>
            Select chain
          </Typography>
        )}
      </div>

      <ChevronRight className='inline-block' />
    </InputWrapper>
  );
});
