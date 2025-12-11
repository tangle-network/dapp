// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title TNT - Tangle Network Token
 * @notice ERC20 token for the Tangle Network migration
 * @dev Implements standard ERC20 with minting capability for the migration claim contract
 */
contract TNT is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    /// @notice The migration claim contract that can mint tokens
    address public migrationClaim;

    /// @notice Emitted when the migration claim contract is set
    event MigrationClaimSet(address indexed migrationClaim);

    error OnlyMigrationClaim();
    error MigrationClaimAlreadySet();
    error ZeroAddress();

    constructor(
        address initialOwner
    ) ERC20("Tangle Network Token", "TNT") Ownable(initialOwner) ERC20Permit("Tangle Network Token") {}

    /**
     * @notice Set the migration claim contract address (can only be set once)
     * @param _migrationClaim The address of the MigrationClaim contract
     */
    function setMigrationClaim(address _migrationClaim) external onlyOwner {
        if (_migrationClaim == address(0)) revert ZeroAddress();
        if (migrationClaim != address(0)) revert MigrationClaimAlreadySet();

        migrationClaim = _migrationClaim;
        emit MigrationClaimSet(_migrationClaim);
    }

    /**
     * @notice Mint tokens to a specified address
     * @dev Can only be called by the migration claim contract
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        if (msg.sender != migrationClaim) revert OnlyMigrationClaim();
        _mint(to, amount);
    }

    /**
     * @notice Mint initial supply to owner (for treasury allocation, etc.)
     * @dev Can only be called by the owner
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mintInitialSupply(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Batch mint to multiple addresses (for EVM airdrop claims)
     * @dev Can only be called by the owner. Used to mint unclaimed airdrop allocations.
     * @param recipients Array of addresses to mint to
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        if (recipients.length != amounts.length) revert("Length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0)) {
                _mint(recipients[i], amounts[i]);
            }
        }
    }
}
