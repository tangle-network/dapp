import { retryPromise } from '@webb-tools/browser-utils/src/retry-promise';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
} from '@webb-tools/contracts';
import { ICurrency } from '@webb-tools/dapp-config/on-chain-config';
import { zeroAddress } from '@webb-tools/dapp-types';
import { providers } from 'ethers';

async function fetchWrappables(
  fungibleCurrency: ICurrency,
  nativeCurrency: ICurrency,
  provider: providers.Provider
) {
  const fungibleTokenWrapperContract = FungibleTokenWrapper__factory.connect(
    fungibleCurrency.address,
    provider
  );

  // Filter the zero addresses because they are not ERC20 tokens
  // and we use the isNativeAllowed flag to determine if native currency is allowed
  const addresses = (
    await retryPromise(fungibleTokenWrapperContract.getTokens)
  ).filter((address) => address !== zeroAddress);

  const wrappableERC20Contracts = addresses.map((address) =>
    ERC20__factory.connect(address, provider)
  );
}

export default fetchWrappables;
