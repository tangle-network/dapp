import { Web3Provider } from './web3-provider';

describe('Initialize Web3', () => {
  test('Is constructable from HTTP', async () => {
    const web3Provider = Web3Provider.fromUri('https://rinkeby.infura.io/v3/e54b7176271840f9ba62e842ff5d6db4');
    const isListening = await web3Provider.eth.net.isListening();
    expect(isListening).toBe(true);
  });
});
