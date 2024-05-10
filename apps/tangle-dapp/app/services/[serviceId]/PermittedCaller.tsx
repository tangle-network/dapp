'use client';

import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import {
  CodeFile,
  CopyWithTooltip,
  ExternalLinkIcon,
  shortenHex,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import SkeletonRow from '../../../components/skeleton/SkeletonRow';
import useNetworkStore from '../../../context/useNetworkStore';
import { usePermittedCaller } from '../../../data/serviceDetails';

interface PermittedCallerProps {
  className?: string;
}

const PermittedCaller: FC<PermittedCallerProps> = ({ className }) => {
  const { network } = useNetworkStore();
  const { permittedCaller, codeData, isLoading, error } = usePermittedCaller();

  return (
    <div className={twMerge('space-y-5', className)}>
      <div className="flex items-center justify-between">
        <Typography variant="h4" fw="bold">
          Permitted Caller
        </Typography>
        {permittedCaller && (
          <div className="flex items-center gap-1.5">
            <Typography variant="body1">
              {shortenHex(permittedCaller)}
            </Typography>
            <CopyWithTooltip
              textToCopy={permittedCaller}
              isButton={false}
              iconClassName="!fill-mono-160 dark:!fill-mono-80"
            />
            {network.evmExplorerUrl && (
              <ExternalLinkIcon
                href={getExplorerURI(
                  network.evmExplorerUrl,
                  permittedCaller,
                  'address',
                  'web3'
                ).toString()}
                className="!fill-mono-160 dark:!fill-mono-80"
              />
            )}
          </div>
        )}
      </div>
      <div
        className={twMerge(
          'bg-glass dark:bg-glass_dark',
          'h-full p-6 rounded-2xl flex flex-col',
          'border border-mono-0 dark:border-mono-160',
          className
        )}
      >
        {/* Loading */}
        {isLoading && <SkeletonRow />}

        {/* Error */}
        {!isLoading && error !== null && (
          <Typography variant="body1" color="error">
            Error
          </Typography>
        )}

        {/* No Permitted Caller */}
        {!isLoading &&
          error === null &&
          permittedCaller === null &&
          codeData === null && (
            <Typography variant="body1">
              No Permitted Caller was provided
            </Typography>
          )}

        {/* Permitted Caller available but not a contract */}
        {!isLoading &&
          error === null &&
          permittedCaller !== null &&
          codeData === null && (
            <Typography variant="body1">
              The code for Permitted Caller is not available since it is not a
              smart contract.
            </Typography>
          )}

        {/* Permitted Caller is a contract */}
        {!isLoading &&
          error === null &&
          permittedCaller !== null &&
          codeData !== null && (
            <CodeFile
              code={codeData.sourceCode}
              isInNextProject
              className="bg-mono-20 dark:bg-mono-200 overflow-auto max-h-[740px]"
              language={codeData.language}
            />
          )}
      </div>
    </div>
  );
};

export default PermittedCaller;
