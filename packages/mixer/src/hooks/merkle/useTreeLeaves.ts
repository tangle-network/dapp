import { useCall } from '@webb-dapp/react-hooks';
import { useEffect, useMemo, useState } from 'react';

export const useTreeLeaves = (treeId?: number) => {
  const [pagination, setPagination] = useState({
    done: false,
    from: 0,
    to: 511,
  });

  const params = useMemo(() => {
    return [treeId, pagination.from, pagination.to];
  }, [pagination.from, pagination.to, treeId]);

  const [treeLeaves, setTreeLeaves] = useState<Array<Uint8Array>>([]);
  const treeLeavesChunk = useCall<Array<Uint8Array>>(
    'rpc.merkle.treeLeaves',
    params,
    undefined,
    undefined,
    () => treeId !== undefined
  );

  useEffect(() => {
    if (pagination.done) {
      return;
    }
    if (treeLeavesChunk?.length === 0) {
      setPagination((p) => ({
        ...p,
        done: true,
      }));
    } else if (typeof treeLeavesChunk !== 'undefined') {
      setPagination((p) => ({
        ...p,
        from: p.to,
        to: p.to + 511,
      }));
      setTreeLeaves((p) => [...p, ...treeLeavesChunk]);
    }
  }, [treeLeavesChunk, pagination]);
  return {
    data: treeLeaves,
    done: pagination.done,
  };
};
