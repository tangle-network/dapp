// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TNT} from "../src/TNT.sol";
import {MigrationClaim} from "../src/MigrationClaim.sol";

/**
 * @title DeployMigrationClaim
 * @notice Deployment script for TNT token and MigrationClaim contracts
 *
 * Usage:
 *   # Deploy to local testnet
 *   forge script script/Deploy.s.sol:DeployMigrationClaim --rpc-url http://localhost:8545 --broadcast
 *
 *   # Deploy to Base Sepolia
 *   forge script script/Deploy.s.sol:DeployMigrationClaim --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 */
contract DeployMigrationClaim is Script {
    // Default values for local testing
    // These should be overridden via environment variables for production

    // The verification key for the SR25519 SP1 program
    // This is a placeholder - replace with actual vkey after compiling the SP1 program
    bytes32 constant DEFAULT_SR25519_VKEY = bytes32(0);

    // Default Merkle root - should be set from generated tree
    bytes32 constant DEFAULT_MERKLE_ROOT = bytes32(0);

    // Default total allocation (1 billion TNT with 18 decimals)
    uint256 constant DEFAULT_TOTAL_ALLOCATED = 1_000_000_000 * 1e18;

    function run() external {
        // Load configuration from environment
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)); // Default Anvil key
        address treasury = vm.envOr("TREASURY_ADDRESS", address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8)); // Default Anvil account 1
        bytes32 sr25519Vkey = vm.envOr("SR25519_VKEY", DEFAULT_SR25519_VKEY);
        bytes32 merkleRoot = vm.envOr("MERKLE_ROOT", DEFAULT_MERKLE_ROOT);
        uint256 totalAllocated = vm.envOr("TOTAL_ALLOCATED", DEFAULT_TOTAL_ALLOCATED);

        console.log("Deploying Migration Claim contracts...");
        console.log("Treasury:", treasury);
        console.log("Total Allocated:", totalAllocated);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy TNT token
        address deployer = vm.addr(deployerPrivateKey);
        TNT tnt = new TNT(deployer);
        console.log("TNT Token deployed at:", address(tnt));

        // 2. Deploy MigrationClaim contract
        MigrationClaim migrationClaim = new MigrationClaim(
            sr25519Vkey,
            merkleRoot,
            address(tnt),
            treasury,
            totalAllocated,
            deployer
        );
        console.log("MigrationClaim deployed at:", address(migrationClaim));

        // 3. Set the migration claim contract on TNT token
        tnt.setMigrationClaim(address(migrationClaim));
        console.log("MigrationClaim set on TNT token");

        vm.stopBroadcast();

        // Output deployment info
        console.log("\n=== Deployment Complete ===");
        console.log("TNT Token:", address(tnt));
        console.log("MigrationClaim:", address(migrationClaim));
        console.log("Treasury:", treasury);
        console.log("Claim Deadline:", migrationClaim.claimDeadline());
    }
}

/**
 * @title SeedTestClaims
 * @notice Seeds the MigrationClaim with test data for local development
 *
 * Usage:
 *   forge script script/Deploy.s.sol:SeedTestClaims --rpc-url http://localhost:8545 --broadcast
 */
contract SeedTestClaims is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));

        // These should be set after deployment
        address tntAddress = vm.envAddress("TNT_ADDRESS");
        address migrationClaimAddress = vm.envAddress("MIGRATION_CLAIM_ADDRESS");

        console.log("Seeding test claims...");
        console.log("TNT:", tntAddress);
        console.log("MigrationClaim:", migrationClaimAddress);

        vm.startBroadcast(deployerPrivateKey);

        // The MigrationClaim contract mints tokens on claim, so no pre-seeding needed
        // This script is a placeholder for any additional setup

        vm.stopBroadcast();

        console.log("Seeding complete!");
    }
}
