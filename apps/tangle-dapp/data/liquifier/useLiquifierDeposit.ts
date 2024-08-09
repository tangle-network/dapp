import { useMemo } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

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
  // TODO: Generate ABI using Remix, based on Solidity contracts. Then, attach the ABI to the client.
  const client = useMemo(() => {
    return createPublicClient({
      chain: mainnet,
      transport: http(),
    });
  }, []);

  // TODO: Implement.
};

export default useLiquifierDeposit;
