'use client';

import { useContext } from 'react';

import { RestakeContext } from '../../context/RestakeContext';

export default function RestakePage() {
  const { assetMap, delegatorInfo, operatorMap } = useContext(RestakeContext);

  console.log('Asset map:', assetMap);
  console.log('Delegator info:', delegatorInfo);
  console.log('Operator map:', operatorMap);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      Restaking page.
    </div>
  );
}
