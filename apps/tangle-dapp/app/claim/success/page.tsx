import { isHex } from '@polkadot/util';
import { redirect } from 'next/navigation';

import { PagePath } from '../../../types';
import { getPolkadotApiPromise } from '../../../utils/polkadot';
import SuccessClient from './SuccessClient';

const isBlockHashExistOnChain = async (
  api: NonNullable<Awaited<ReturnType<typeof getPolkadotApiPromise>>>,
  blockHash: string
) => {
  try {
    await api.rpc.chain.getBlock(blockHash);

    return true;
  } catch {
    return false;
  }
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const blockHash = searchParams['h'];
  const rpcEndpoint = searchParams['rpcEndpoint'];

  if (!rpcEndpoint || typeof rpcEndpoint !== 'string') {
    return redirect(PagePath.CLAIM_AIRDROP);
  }

  const api = await getPolkadotApiPromise(rpcEndpoint);

  const isValidBlockHash =
    typeof blockHash === 'string' &&
    isHex(blockHash) &&
    (await isBlockHashExistOnChain(api, blockHash));

  if (!isValidBlockHash) {
    return redirect(PagePath.CLAIM_AIRDROP);
  }

  return <SuccessClient blockHash={blockHash} />;
};

export default Page;
