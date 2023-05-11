import { ApiPromise, WsProvider } from '@polkadot/api';

function getLocalApi(port: number): Promise<ApiPromise> {
  const endpoint = `ws://127.0.0.1:${port}`;
  const wsProvider = new WsProvider(endpoint);
  return ApiPromise.create({
    provider: wsProvider,
    noInitWarn: true,
  });
}

export default getLocalApi;
