import { isHex } from '@polkadot/util';
import { redirect } from 'next/navigation';

import { getPolkadotApiPromise } from '../../../utils/polkadot';
import SuccessClient from './SuccessClient';

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const blockHash = searchParams['h'];

  const api = await getPolkadotApiPromise();

  if (!api) {
    return redirect('/claim');
  }

  const isValidBlockHash =
    typeof blockHash === 'string' &&
    isHex(blockHash) &&
    (await isBlockHashExistOnChain(api, blockHash));

  if (!isValidBlockHash) {
    return redirect('/claim');
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
