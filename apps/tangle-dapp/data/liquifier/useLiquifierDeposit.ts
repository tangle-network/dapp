import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback } from 'react';
import { erc20Abi } from 'viem';

import { TxName } from '../../constants';
import { LS_ERC20_TOKEN_MAP } from '../../constants/liquidStaking/constants';
import LIQUIFIER_ABI from '../../constants/liquidStaking/liquifierAbi';
import { LsErc20TokenId } from '../../constants/liquidStaking/types';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContractWrite from './useContractWrite';

/**
 * 0. Token.balanceOf(sender) // Obtain the user's token balance (eg. LINK).
 *
 * 0. Liquifier.balanceOf(sender) // Obtain the user's liquid staking balance (eg. tgLINK).
 *
 * 1. Token.approve(address(liquifier), depositAmount) // Approve the Liquifier to spend the deposit amount.
 *
 * 2. Liquifier.deposit(sender, depositAmount) // Deposit the amount to the Liquifier. This is equivalent to calling `stake` or `mint` in Liquid Staking.
 *
 * Note: The balance of the token is obtained through the token's ERC20 contract. Would need to acquire the contract addresses for each token.
 *
 * Note: Liquifier.deposit() is invoked through viem.writeContract(), with the address of the Liquifier contract and the deposit amount as arguments.
 *
 * Note: The liquifier contract's address depends on the selected token. For example, for LINK, the contract address used would be the Chainlink Liquifier Adapter contract.
 *
 * See more: https://github.com/webb-tools/tnt-core/blob/1f371959884352e7af68e6091c5bb330fcaa58b8/script/XYZ_Stake.s.sol
 */
const useLiquifierDeposit = () => {
  const activeEvmAddress20 = useEvmAddress20();
  const writeChainlinkErc20 = useContractWrite(erc20Abi);
  const writeLiquifier = useContractWrite(LIQUIFIER_ABI);

  const isReady =
    writeLiquifier !== null &&
    writeChainlinkErc20 !== null &&
    activeEvmAddress20 !== null;

  const deposit = useCallback(
    async (tokenId: LsErc20TokenId, amount: BN) => {
      // TODO: Should the user balance check be done here or assume that the consumer of the hook will handle that?

      assert(
        isReady,
        'Should not be able to call this function if the requirements are not ready yet',
      );

      const tokenDef = LS_ERC20_TOKEN_MAP[tokenId];

      // TODO: Check for approval first, in case that it has already been granted. This prevents another unnecessary approval transaction (ex. if the transaction fails after the approval but before the deposit).
      // Approve spending the token amount by the Liquifier contract.
      const approveTxSucceeded = await writeChainlinkErc20({
        txName: TxName.LS_LIQUIFIER_APPROVE,
        address: tokenDef.address,
        functionName: 'approve',
        args: [tokenDef.liquifierAdapterAddress, BigInt(amount.toString())],
        notificationStep: { current: 1, max: 2 },
      });

      if (!approveTxSucceeded) {
        return false;
      }

      const depositTxSucceeded = await writeLiquifier({
        txName: TxName.LS_LIQUIFIER_DEPOSIT,
        // TODO: Does the adapter contract have a deposit function? It doesn't seem like so. In that case, will need to update the way that Liquifier contract's address is handled.
        address: tokenDef.liquifierAdapterAddress,
        functionName: 'deposit',
        // TODO: Provide the first arg. (validator). Need to figure out how it works on Chainlink (vaults? single address?). See: https://github.com/webb-tools/tnt-core/blob/21c158d6cb11e2b5f50409d377431e7cd51ff72f/src/lst/adapters/ChainlinkAdapter.sol#L187
        args: [activeEvmAddress20, BigInt(amount.toString())],
        notificationStep: { current: 2, max: 2 },
      });

      return depositTxSucceeded;
    },
    [activeEvmAddress20, isReady, writeChainlinkErc20, writeLiquifier],
  );

  // Wait for the requirements to be ready before
  // returning the deposit function.
  return !isReady ? null : deposit;
};

export default useLiquifierDeposit;
