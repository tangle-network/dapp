'use client';

import { CodeFile } from '@webb-tools/webb-ui-components';
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

  useEffect(() => {
    // TODO: get permitted caller
    // TODO: check if permitted caller is a contract or not
    setSigningRulesContractAddr('');
  }, []);

  return (
    <div
      className={twMerge(
        'bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.50)_100%)]',
        'dark:bg-[linear-gradient(180deg,#2B2F40_0%,rgba(43,47,64,0.00)_100%)]',
        'h-full p-6 rounded-2xl',
        'border border-mono-0 dark:border-mono-160',
        className
      )}
    >
      {/* No Signing Rules */}

      {/* Signing Rules Available  */}
      {typeof signingRulesContractAddr === 'string' && (
        <div className="h-full bg-mono-20 dark:bg-mono-200">
          <CodeFile
            getCodeFileFnc={() => getSigningRules(signingRulesContractAddr)}
            isInNextProject
            language="sol"
          />
        </div>
      )}
    </div>
  );
};

export default SigningRules;
