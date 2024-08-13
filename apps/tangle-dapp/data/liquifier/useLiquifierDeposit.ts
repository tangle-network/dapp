import { BN } from '@polkadot/util';
import assert from 'assert';
import { erc20Abi } from 'viem';

import { TxName } from '../../constants';
import useTxNotification from '../../hooks/useTxNotification';
import { ERC20_TOKEN_MAP, Erc20TokenId } from './erc20';
import liquifierChainlinkAdapterAbi from './liquifierChainlinkAdapterAbi';
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
  const { write: writeChainlinkErc20 } = useContract(erc20Abi);
  const { write } = useContract(liquifierChainlinkAdapterAbi);

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

  // TODO: Return proxy read & write functions, each accepting an Erc20TokenId, and using `ERC20_TOKEN_MAP` to get the token definition, and from there get the actual address of the Liquifier's adapter contract for the given token.

  const isReady = write !== null && writeChainlinkErc20 !== null;

  const deposit = async (token: Erc20TokenId, amount: BN) => {
    // TODO: Need to call `Token.approve` before calling `Liquifier.stake`. This is not implemented yet. Also, should the user balance check be done here or assume that the consumer of the hook will handle that?

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

    const depositTxReceipt = await write({
      address: tokenDef.liquifierAdapterAddress,
      // TODO: This should be calling `deposit`, not `stake`. See: https://github.com/webb-tools/tnt-core/blob/1f371959884352e7af68e6091c5bb330fcaa58b8/script/XYZ_Stake.s.sol#L41
      functionName: 'stake',
      // TODO: Provide the first arg. (validator). Need to figure out how it works on Chainlink (vaults? single address?). See: https://github.com/webb-tools/tnt-core/blob/21c158d6cb11e2b5f50409d377431e7cd51ff72f/src/lst/adapters/ChainlinkAdapter.sol#L187
      args: ['0x0', BigInt(amount.toString())],
    });

    if (depositTxReceipt.status === 'reverted') {
      notifyDepositError('Failed to deposit the token amount to the Liquifier');

      return false;
    }

    notifyDepositSuccess(depositTxReceipt.transactionHash);

    return true;
  };

  // Wait for the requirements to be ready before
  // returning the deposit function.
  return isReady ? null : deposit;
};

export default useLiquifierDeposit;
