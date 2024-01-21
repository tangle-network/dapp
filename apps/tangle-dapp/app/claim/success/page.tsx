import { isHex } from '@polkadot/util';
import { redirect } from 'next/navigation';

import { getPolkadotApiPromise } from '../../../constants/polkadot';
import { InternalPath } from '../../../types';
import SuccessClient from './SuccessClient';

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const blockHash = searchParams['h'];

  const api = await getPolkadotApiPromise();

  const isValidBlockHash =
    typeof blockHash === 'string' &&
    isHex(blockHash) &&
    (await isBlockHashExistOnChain(api, blockHash));

  if (!isValidBlockHash) {
    return redirect(InternalPath.Claim);
  }

  return <SuccessClient blockHash={blockHash} />;
};

export default Page;

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
