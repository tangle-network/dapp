'use client';

import { useContext, useEffect } from 'react';

import { RestakeContext } from '../../context/RestakeContext';

export default function RestakePage() {
  const { operatorMap, assetMap, delegatorInfo } = useContext(RestakeContext);

  useEffect(() => {
    console.log('operatorMap', operatorMap);
  }, [operatorMap]);

  useEffect(() => {
    console.log('assetMap', assetMap);
  }, [assetMap]);

  useEffect(() => {
    console.log('delegatorInfo', delegatorInfo);
  }, [delegatorInfo]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      Restaking page.
    </div>
  );
}
