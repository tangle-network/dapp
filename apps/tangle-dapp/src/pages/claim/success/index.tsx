import { isHex } from '@polkadot/util';
import { getApiPromise } from '@tangle-network/tangle-shared-ui/utils/polkadot/api';

import type { HexString } from '@polkadot/util/types';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PagePath } from '../../../types';
import Loading from '../Loading';
import SuccessClient from './SuccessClient';

const isBlockHashExistOnChain = async (
  api: NonNullable<Awaited<ReturnType<typeof getApiPromise>>>,
  blockHash: string,
) => {
  try {
    await api.rpc.chain.getBlock(blockHash);

    return true;
  } catch {
    return false;
  }
};

const Page = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [validBlockHash, setValidBlockHash] = useState<HexString | null>(null);

  useEffect(() => {
    const checkBlockHash = async () => {
      const blockHash = searchParams.get('h');
      const rpcEndpoint = searchParams.get('rpcEndpoint');

      if (!rpcEndpoint || typeof rpcEndpoint !== 'string') {
        navigate(PagePath.CLAIM_AIRDROP, { replace: true });
        return;
      }

      const api = await getApiPromise(rpcEndpoint);

      const isValid =
        typeof blockHash === 'string' &&
        isHex(blockHash) &&
        (await isBlockHashExistOnChain(api, blockHash));

      if (!isValid) {
        navigate(PagePath.CLAIM_AIRDROP, { replace: true });
      } else {
        setValidBlockHash(blockHash);
      }
    };

    checkBlockHash();
  }, [searchParams, navigate]);

  if (validBlockHash === null) {
    return <Loading />;
  }

  return <SuccessClient blockHash={validBlockHash} />;
};

export default Page;
