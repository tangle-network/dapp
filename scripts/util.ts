import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { KeyringPair } from '@polkadot/keyring/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';

// Wait for the crypto library to be ready globally for this module.
await cryptoWaitReady();

export const ALICE = new Keyring({ type: 'sr25519' }).addFromUri('//Alice');

export const BOB = new Keyring({ type: 'sr25519' }).addFromUri('//Bob');

export const CHARLIE = new Keyring({ type: 'sr25519' }).addFromUri('//Charlie');

export const TANGLE_LOCAL_RPC_URL = 'ws://127.0.0.1:9944';

export const TANGLE_LOCAL_DECIMALS = 18;

let isCreatingApi = false;
let apiCache: ApiPromise | null = null;

export const createApi = async () => {
  if (apiCache !== null) {
    return apiCache;
  } else if (isCreatingApi) {
    throw new Error('Api is being created; you have a race condition');
  }

  isCreatingApi = true;

  console.log(
    'note: these scripts are meant to be run against a local node, also ensure that the chain is re-started to a fresh state before running setup scripts\n',
  );

  return new Promise<ApiPromise>((resolve) => {
    const api = new ApiPromise({
      provider: new WsProvider(TANGLE_LOCAL_RPC_URL),
      noInitWarn: true,
    });

    api.once('ready', () => {
      console.log('api is ready');
      isCreatingApi = false;
      apiCache = api;
      resolve(api);
    });
  });
};

type SubmitTxOptions = {
  description: string;
  tx: SubmittableExtrinsic<'promise', ISubmittableResult>;
  origin?: KeyringPair;
  useSudo?: boolean;
};

export const submitTx = async ({
  description,
  tx,
  origin = ALICE,
  useSudo = false,
}: SubmitTxOptions) => {
  // Use a random ID to identify the transaction in the logs.
  const randomId = Math.random().toString(36).substring(2, 8);

  console.log(`${randomId} ${description}: submitting...`);

  const api = await createApi();
  const finalTx = useSudo ? api.tx.sudo.sudo(tx) : tx;

  return new Promise<void>((resolve, reject) => {
    finalTx.signAndSend(useSudo ? ALICE : origin, (status) => {
      const error = extractErrorFromTxStatus(status);

      if (error !== null) {
        console.error(`${randomId} ${description}: error: ${error}`);
        reject(error);
      } else if (status.isInBlock) {
        console.log(`${randomId} ${description}: in block`);
      } else if (status.isFinalized) {
        console.log(`${randomId} ${description}: finalized`);
        resolve();
      }
    });
  });
};

export const createAmount = (amount: number): bigint => {
  // Scale the amount by 10^decimals to match the precision in planks.
  return BigInt(amount) * BigInt(10 ** TANGLE_LOCAL_DECIMALS);
};

const ensureError = (possibleError: unknown): Error => {
  if (possibleError instanceof Error) {
    return possibleError;
  }

  return new Error(`Unknown error: ${possibleError}`);
};

const extractErrorFromTxStatus = (status: ISubmittableResult): Error | null => {
  if (
    !status.isError &&
    !status.isWarning &&
    status.dispatchError === undefined
  ) {
    return null;
  } else if (status.dispatchError === undefined) {
    return ensureError(status.internalError);
  }

  if (status.dispatchError.isModule) {
    const metaError = status.dispatchError.registry.findMetaError(
      status.dispatchError.asModule,
    );

    return new Error(`Dispatch error: ${metaError.section}.${metaError.name}`);
  }

  return new Error(
    `${status.dispatchError.type}.${status.dispatchError.value.toString()}`,
  );
};
