export default function getPolkadotJsDashboardUrl(wsRpcEndpoint: string) {
  return `https://polkadot.js.org/apps/?rpc=${wsRpcEndpoint}#/explorer`;
}
