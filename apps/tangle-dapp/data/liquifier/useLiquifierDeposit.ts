import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback } from 'react';
import { erc20Abi } from 'viem';

import { TxName } from '../../constants';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useTxNotification from '../../hooks/useTxNotification';
import { ERC20_TOKEN_MAP, Erc20TokenId } from './erc20Tokens';
import liquifierAbi from './liquifierAbi';
import useContract from './useContract';

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
  const { write: writeChainlinkErc20 } = useContract(erc20Abi);
  const { write: writeLiquifier } = useContract(liquifierAbi);

  const {
    notifyProcessing: notifyApproveProcessing,
    notifySuccess: notifyApproveSuccess,
    notifyError: notifyApproveError,
  } = useTxNotification(TxName.LST_LIQUIFIER_APPROVE);

  const {
    notifyProcessing: notifyDepositProcessing,
    notifySuccess: notifyDepositSuccess,
    notifyError: notifyDepositError,
  } = useTxNotification(TxName.LST_LIQUIFIER_DEPOSIT);

  const isReady =
    writeLiquifier !== null &&
    writeChainlinkErc20 !== null &&
    activeEvmAddress20 !== null;

  const deposit = useCallback(
    async (token: Erc20TokenId, amount: BN) => {
      // TODO: Should the user balance check be done here or assume that the consumer of the hook will handle that?

      assert(
        isReady,
        'Should not be able to call this function if the requirements are not ready yet',
      );

      const tokenDef = ERC20_TOKEN_MAP[token];

      notifyApproveProcessing();

      // Approve spending the token amount by the Liquifier contract.
      const approveTxReceipt = await writeChainlinkErc20({
        address: tokenDef.address,
        functionName: 'approve',
        args: [tokenDef.liquifierAdapterAddress, BigInt(amount.toString())],
      });

      if (approveTxReceipt.status === 'reverted') {
        notifyApproveError(
          'Failed to approve spending the token amount by the Liquifier contract',
        );

        return false;
      }

      // TODO: Ensure that the transaction hash takes to the proper explorer URL, since it is not a Substrate transaction.
      notifyApproveSuccess(approveTxReceipt.transactionHash);
      notifyDepositProcessing();

      const depositTxReceipt = await writeLiquifier({
        // TODO: Does the adapter contract have a deposit function? It doesn't seem like so. In that case, will need to update the way that Liquifier contract's address is handled.
        address: tokenDef.liquifierAdapterAddress,
        functionName: 'deposit',
        // TODO: Provide the first arg. (validator). Need to figure out how it works on Chainlink (vaults? single address?). See: https://github.com/webb-tools/tnt-core/blob/21c158d6cb11e2b5f50409d377431e7cd51ff72f/src/lst/adapters/ChainlinkAdapter.sol#L187
        args: [activeEvmAddress20, BigInt(amount.toString())],
      });

      if (depositTxReceipt.status === 'reverted') {
        notifyDepositError(
          'Failed to deposit the token amount to the Liquifier',
        );

        return false;
      }

      notifyDepositSuccess(depositTxReceipt.transactionHash);

      return true;
    },
    [
      activeEvmAddress20,
      isReady,
      notifyApproveError,
      notifyApproveProcessing,
      notifyApproveSuccess,
      notifyDepositError,
      notifyDepositProcessing,
      notifyDepositSuccess,
      writeChainlinkErc20,
      writeLiquifier,
    ],
  );

  // Wait for the requirements to be ready before
  // returning the deposit function.
  return !isReady ? null : deposit;
};

export default useLiquifierDeposit;
