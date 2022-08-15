## Overview

Implement the wrap unwrap feature for Polkadot/substrate API

## Spec

- Integration with pallets TokenWrapper, Tokens, and AssetRegister is required
    - `TokenWrapper`
        - `wrap` and `unwrap` calls for dApp integrations,  (dApp)
            - `setWrappingPerscentage` for setting the wrapping percentage (Scripts)
            - Query `WrappingFeePercent` for the current wrapping fee percentage of a PoolShare (dApp)
    - `AssetRegistery`
        - `register` to register an asset/PoolShare (Scripts)
        - `addAssetToPool` to add an asset to a PoolShare (Scripts)
    - `Tokens` pallet is used to get the balance of the PoolShare or token. (dApp)
- For `WebbState` the state can be mutated while initializing the `WebbProvider`

```ts

export class PolkadotWrapUnwrap extends WrapUnwrap<WebbPolkadot> {


  canWrap() {
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    //... Get the asset id
    const asset = this.inner.query.assetRegistery.assets(assetId).unwrap();
    return asset.lcoked === false;
  }

  canUnwrap() {
    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    //... Get the asset id
    const asset = this.inner.query.assetRegistery.assets(assetId).unwrap();
    return asset.lcoked === true;
  }

  async wrap(wrapPayload: PolkadotWrapPayload): Promise<string> {
    const { amount: amountNumber, toPoolAssetId } = wrapPayload;
    const account = await this.inner.accounts.activeOrDefault;

    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    ;

    const governedToken = this.inner.methods.bridgeApi.getBridge()?.currency;
    const wrappableToken = this.inner.state.wrappableCurrency;
    const wrappableAssetId = "..";

    const asset = this.inner.query.assetRegistery.assets(assetId).unwrap();
    const userBalance = this.inner.query.tokens.balance(account, assetId);
    const wrappingFeepct = this.inner.query.tokenWrapper.wrappingFeePercent(toPoolAssetId);
    if (
      asset.existentialDeposit < amountNumber &&
      userBalance < amountNumber + amountNumber * wrappingFeepct / 100
    ) {
      const tx = this.txBuilder.build(
        {
          method: 'wrap',
          section: "tokenWrapper",
        },
        [
          wrappableAssetId,
          toPoolAssetId,
          amountNumber
        ]
      );
      const txHash = await tx.call(account.address);
      return txHash;
    } else {
      throw new Error('Not enough funds');
    }
  }


}

```

### Checklist

- [ ] Implement `polkadot/wrap-unwrap.ts` methods with the pallets methods and WebbState
- [ ] Implement `polkadot/vanchor-deposit.ts` wrap and deposit
- [ ] Hydrate the `WebbState` currencies with the dynamic values of PoolShare/Assets from `assetRegistery` Storage
    - Query `assets(None)` for the list of all assets and PoolShares
- [ ] Testing Wrapping/unwrapping the tokens
- [ ] Testing VAnchor with the wrapped tokens
