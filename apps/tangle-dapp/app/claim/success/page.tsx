import { isHex } from '@polkadot/util';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { Alert } from '@webb-tools/webb-ui-components/components/Alert';

import { getPolkadotApiPromise } from '../../../constants/polkadot';
import SuccessClient from './SuccessClient';

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const blockHash = searchParams['h'];

  const api = await getPolkadotApiPromise();

  if (!api) {
    const error = WebbError.from(WebbErrorCodes.PolkadotApiNotReady);
    return (
      <Alert
        title={`Error code: ${error.code}`}
        description={error.message}
        type="error"
        className="w-full"
      />
    );
  }

  const isValidBlockHash =
    typeof blockHash === 'string' &&
    isHex(blockHash) &&
    (await isBlockHashExistOnChain(api, blockHash));

  if (!isValidBlockHash) {
    const error = WebbError.from(WebbErrorCodes.InvalidBlockHash);
    return (
      <Alert
        title={`Error code: ${error.code}`}
        description={error.message}
        type="error"
        className="w-full"
      />
    );
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
