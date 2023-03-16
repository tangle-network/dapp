import { ChevronRight, ExternalLinkLine, Close } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { shortenString } from '../../utils';
import { forwardRef } from 'react';

import { Avatar } from '../Avatar';
import { Label } from '../Label';
import { TitleWithInfo } from '../TitleWithInfo';
import { InputWrapper } from './InputWrapper';
import { RelayerInputProps } from './types';

/**
 * The `RelayerInput` component
 *
 * Props:
 *
 * - `relayerAddress`: The relayer address to display
 * - `externalLink`: The external url of a relayer
 *
 * @example
 *
 * ```jsx
 * <RelayerInput />
 * <RelayerInput
 *   relayerAddress='5DJEpHVVxSpaWGfdAzep11MK458y5JkHA5YvYm3dp3eawuXi'
 *   externalLink='https://webb.tools'
 * />
 * ```
 */

export const RelayerInput = forwardRef<HTMLDivElement, RelayerInputProps>(
  ({ externalLink, id, info, relayerAddress, iconTheme, ...props }, ref) => {
    return (
      <InputWrapper {...props} ref={ref}>
        <div className="flex flex-col space-y-1">
          <Label htmlFor={id}>
            <TitleWithInfo
              title="Relayer"
              variant="utility"
              info={info}
              titleComponent="span"
              className="text-mono-100 dark:text-mono-80"
              titleClassName="capitalize !text-inherit"
            />
          </Label>

          {relayerAddress ? (
            <div className="flex items-center space-x-1">
              <Avatar theme={iconTheme} value={relayerAddress} />

              <Typography component="span" variant="h5" fw="bold">
                {shortenString(relayerAddress)}
              </Typography>

              {externalLink && (
                <a
                  target="_blank"
                  href={externalLink}
                  rel="noopener noreferrer"
                >
                  <ExternalLinkLine />
                </a>
              )}
            </div>
          ) : (
            <Typography variant="h5" fw="bold">
              Add a relayer
            </Typography>
          )}
        </div>

        {relayerAddress ? (
          <Close className="inline-block" />
        ) : (
          <ChevronRight className="inline-block" />
        )}
      </InputWrapper>
    );
  }
);
