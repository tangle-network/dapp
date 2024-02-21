'use client';

import { CodeFile, Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { getSigningRules } from '../../../data/ServiceDetails';

interface SigningRulesProps {
  serviceId: string;
  className?: string;
}

const SigningRules: FC<SigningRulesProps> = ({ className }) => {
  const [signingRulesContractAddr, setSigningRulesContractAddr] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: get permitted caller
    // TODO: check if permitted caller is a contract or not
    setSigningRulesContractAddr('');
    setIsLoading(false);
    setError(null);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error !== null) {
    return (
      <Typography variant="body1" color="error">
        Error
      </Typography>
    );
  }

  if (signingRulesContractAddr === null) {
    return (
      <Typography variant="body1">
        No Signing Rules associated with this service
      </Typography>
    );
  }

  return (
    <div
      className={twMerge(
        'bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.50)_100%)]',
        'dark:bg-[linear-gradient(180deg,#2B2F40_0%,rgba(43,47,64,0.00)_100%)]',
        'h-full p-6 rounded-2xl flex flex-col',
        'border border-mono-0 dark:border-mono-160',
        className
      )}
    >
      <CodeFile
        getCodeFileFnc={() => getSigningRules(signingRulesContractAddr)}
        isInNextProject
        className="bg-mono-20 dark:bg-mono-200 overflow-auto max-h-[740px]"
        // smart contract language: Solidity
        language="sol"
      />
    </div>
  );
};

export default SigningRules;
