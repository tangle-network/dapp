import { TokenInput } from '../types';

const getProvider = () => {
  if (
    typeof window !== 'undefined' &&
    typeof (window as any).web3 !== 'undefined'
  ) {
    const provider =
      (window as any).ethereum || (window as any).web3.currentProvider;

    if (provider) {
      return provider;
    }
  }
};

const addTokenToMetamask = async (tokenInput: TokenInput) => {
  const { address, decimals, image, symbol } = tokenInput;

  if (!address || !symbol) {
    alert('Missing token address or symbol');
    return;
  }

  const provider = getProvider();

  if (provider) {
    try {
      await provider.request({
        method: 'wallet_watchAsset',
        params: {
          options: {
            address,
            decimals,
            image,
            symbol,
          },
          type: 'ERC20',
        },
      });

      console.log('Token added to Metamask');
    } catch (error) {
      console.error(error);
    }
  } else {
    alert(`Please install Metamask to add ${symbol} to your wallet`);
  }
};

export default addTokenToMetamask;
