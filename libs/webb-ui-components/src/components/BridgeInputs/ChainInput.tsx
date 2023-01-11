import { ChainIcon, ChevronRight, TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { forwardRef } from 'react';

import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { ChainInputComponentProps } from './types';

/**
 * The `ChainInput` component
 *
 * Props:
 *
 * - `chain`: Will display `select chain` when the chain not provided
 * - `chainType`:  Input "source" | "dest"
 *
 * @example
 *
 * ```jsx
 * <ChainInput />
 * <ChainInput chainType='dest' chain={{ name: 'Optimism', symbol: 'op' }} />
 * ```
 */

export const ChainInput = forwardRef<HTMLDivElement, ChainInputComponentProps>(
  ({ chain, chainType, id, info, ...props }, ref) => {
    return (
      <InputWrapper {...props} ref={ref}>
        <div className="flex flex-col space-y-1">
          <Label htmlFor={id}>
            <TitleWithInfo
              title={
                (chainType === 'source' ? 'Source' : 'Destination') + ' chain'
              }
              info={info}
              variant="utility"
              className="text-mono-100 dark:text-mono-80"
              titleClassName="uppercase !text-inherit"
            />
          </Label>
          {chain ? (
            <p className="flex items-center space-x-1">
              <ChainIcon name={chain.name} size="lg" />

              <Typography component="span" variant="body1" fw="bold">
                {chain.name}
              </Typography>
            </p>
          ) : (
            <Typography variant="body1" fw="bold">
              Select chain
            </Typography>
          )}
        </div>
        <ChevronRight className="inline-block" />
      </InputWrapper>
    );
  }
);
