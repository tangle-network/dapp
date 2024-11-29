import { isHex } from '@polkadot/util';
import { getApiPromise } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { FC, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PagePath } from '../../../types';
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

const SuccessPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const blockHash = searchParams.get('h');
  const rpcEndpoint = searchParams.get('rpcEndpoint');

  useEffect(() => {
    const validateAndRedirect = async () => {
      if (!rpcEndpoint) {
        navigate(PagePath.CLAIM_AIRDROP, { replace: true });
        return;
      }

      try {
        const api = await getApiPromise(rpcEndpoint);
        const isValidBlockHash =
          blockHash &&
          isHex(blockHash) &&
          (await isBlockHashExistOnChain(api, blockHash));

        if (!isValidBlockHash) {
          navigate(PagePath.CLAIM_AIRDROP, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error validating block hash:', error);
        navigate(PagePath.CLAIM_AIRDROP, { replace: true });
      }
    };

    validateAndRedirect();
  }, [blockHash, rpcEndpoint, navigate]);

  if (!blockHash || !rpcEndpoint) {
    return null;
  }

  return <SuccessClient blockHash={blockHash} />;
};

export default SuccessPage;
