// TODO: This function checks only that a connection can be established. It does
// not verify the connected chain identity. If a different chain than expected
// is used (for example a custom endpoint with incompatible modules), the app can
// still fail when querying storage or extrinsics. This currently impacts custom
// RPC endpoints used for local/testing scenarios.
function testRpcEndpointConnection(rpcEndpoint: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(rpcEndpoint);

      const handleOpen = () => {
        ws.removeEventListener('open', handleOpen);
        ws.close();
        resolve(true);
      };

      const handleCloseEvent = () => {
        ws.removeEventListener('close', handleCloseEvent);
        resolve(false);
      };

      ws.addEventListener('open', handleOpen);
      ws.addEventListener('close', handleCloseEvent);
    } catch {
      resolve(false);
    }
  });
}

export default testRpcEndpointConnection;
