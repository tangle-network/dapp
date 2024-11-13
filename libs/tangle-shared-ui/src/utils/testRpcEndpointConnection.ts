// TODO: This function checks if the connection can be established, but it doesn't check what kind of network the endpoint is connected to! This means that if a different network than expected (ie. Tangle Restaking Parachain vs. expected Tangle Local Testnet), the app will crash due to attempting to access storage queries or extrinsics that are not available on that network. However, this isn't a huge concern as of now since it only applies to custom RPC endpoints, usually used for testing purposes.
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
