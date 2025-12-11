// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TNT} from "../src/TNT.sol";
import {TangleMigration} from "../src/TangleMigration.sol";
import {SP1ZKVerifier, MockZKVerifier} from "../src/SP1ZKVerifier.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployTangleMigration
 * @notice Full deployment script for the TNT migration system
 *
 * Environment Variables:
 *   PRIVATE_KEY          - Deployer private key
 *   MERKLE_ROOT          - Merkle root from migration snapshot (required)
 *   TOTAL_SUBSTRATE      - Total TNT for Substrate claims (default: 108.14M)
 *   TOTAL_EVM            - Total TNT for EVM airdrop (default: 1.13M)
 *   SP1_VERIFIER         - SP1 Verifier Gateway address (Base: 0x397A...)
 *   PROGRAM_VKEY         - SP1 program verification key
 *   USE_MOCK_VERIFIER    - Set to "true" for testing without real ZK proofs
 *
 * Usage:
 *   # Local testnet with mock verifier
 *   USE_MOCK_VERIFIER=true MERKLE_ROOT=0x844f... forge script script/DeployTangleMigration.s.sol:DeployTangleMigration --rpc-url http://localhost:8545 --broadcast
 *
 *   # Base Sepolia with real SP1 verifier
 *   MERKLE_ROOT=0x844f... SP1_VERIFIER=0x397A... PROGRAM_VKEY=0x... forge script script/DeployTangleMigration.s.sol:DeployTangleMigration --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify
 */
contract DeployTangleMigration is Script {
    // Default values
    uint256 constant DEFAULT_SUBSTRATE_ALLOCATION = 108_140_000 * 1e18; // 108.14M TNT
    uint256 constant DEFAULT_EVM_ALLOCATION = 1_130_000 * 1e18; // 1.13M TNT

    // SP1 Verifier Gateway on Base
    address constant SP1_VERIFIER_BASE = 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B;

    function run() external {
        // Load configuration
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        bytes32 merkleRoot = vm.envBytes32("MERKLE_ROOT");
        require(merkleRoot != bytes32(0), "MERKLE_ROOT required");

        uint256 substrateAllocation = vm.envOr("TOTAL_SUBSTRATE", DEFAULT_SUBSTRATE_ALLOCATION);
        uint256 evmAllocation = vm.envOr("TOTAL_EVM", DEFAULT_EVM_ALLOCATION);
        uint256 totalSupply = substrateAllocation + evmAllocation;

        bool useMockVerifier = vm.envOr("USE_MOCK_VERIFIER", false);
        address sp1VerifierAddr = vm.envOr("SP1_VERIFIER", SP1_VERIFIER_BASE);
        bytes32 programVKey = vm.envOr("PROGRAM_VKEY", bytes32(0));

        console.log("=== Tangle Migration Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Merkle Root:", vm.toString(merkleRoot));
        console.log("Substrate Allocation:", substrateAllocation / 1e18, "TNT");
        console.log("EVM Allocation:", evmAllocation / 1e18, "TNT");
        console.log("Use Mock Verifier:", useMockVerifier);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy TNT Token
        TNT tnt = new TNT(deployer);
        console.log("\n1. TNT Token deployed:", address(tnt));

        // 2. Mint total supply to deployer
        tnt.mintInitialSupply(deployer, totalSupply);
        console.log("   Minted:", totalSupply / 1e18, "TNT");

        // 3. Deploy ZK Verifier
        address zkVerifier;
        if (useMockVerifier) {
            MockZKVerifier mock = new MockZKVerifier();
            zkVerifier = address(mock);
            console.log("\n2. MockZKVerifier deployed:", zkVerifier);
            console.log("   WARNING: Using mock verifier - NOT FOR PRODUCTION");
        } else {
            require(programVKey != bytes32(0), "PROGRAM_VKEY required for SP1 verifier");
            SP1ZKVerifier sp1 = new SP1ZKVerifier(sp1VerifierAddr, programVKey, deployer);
            zkVerifier = address(sp1);
            console.log("\n2. SP1ZKVerifier deployed:", zkVerifier);
            console.log("   SP1 Gateway:", sp1VerifierAddr);
            console.log("   Program VKey:", vm.toString(programVKey));
        }

        // 4. Deploy TangleMigration
        TangleMigration migration = new TangleMigration(
            address(tnt),
            merkleRoot,
            zkVerifier,
            deployer
        );
        console.log("\n3. TangleMigration deployed:", address(migration));

        // 5. Fund the migration contract with Substrate allocation
        tnt.transfer(address(migration), substrateAllocation);
        console.log("   Funded with:", substrateAllocation / 1e18, "TNT for claims");

        // 6. Set claim deadline (1 year from now)
        uint256 deadline = block.timestamp + 365 days;
        migration.setClaimDeadline(deadline);
        console.log("   Claim deadline set:", deadline);

        // 7. Keep EVM allocation in deployer for airdrop
        console.log("\n4. EVM Airdrop allocation retained:", evmAllocation / 1e18, "TNT");

        vm.stopBroadcast();

        // Output summary
        console.log("\n=== Deployment Complete ===");
        console.log("TNT Token:", address(tnt));
        console.log("TangleMigration:", address(migration));
        console.log("ZK Verifier:", zkVerifier);
        console.log("");
        console.log("Environment Variables for Frontend:");
        console.log("  VITE_TNT_TOKEN_ADDRESS=", address(tnt));
        console.log("  VITE_TANGLE_MIGRATION_ADDRESS=", address(migration));
        console.log("  VITE_ZK_VERIFIER_ADDRESS=", zkVerifier);
    }
}

/**
 * @title ExecuteEVMAirdrop
 * @notice Executes the direct EVM airdrop from evm-airdrop.json
 *
 * Usage:
 *   TNT_ADDRESS=0x... forge script script/DeployTangleMigration.s.sol:ExecuteEVMAirdrop --rpc-url http://localhost:8545 --broadcast --sig "run(string)" "path/to/evm-airdrop.json"
 */
contract ExecuteEVMAirdrop is Script {
    function run(string calldata airdropFile) external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address tntAddress = vm.envAddress("TNT_ADDRESS");

        console.log("=== EVM Airdrop Execution ===");
        console.log("TNT Token:", tntAddress);
        console.log("Airdrop file:", airdropFile);

        // Read and parse the airdrop file
        string memory json = vm.readFile(airdropFile);

        // Note: For actual execution, you'd parse the JSON and loop through recipients
        // This is a placeholder - use a separate script or tool for batch transfers

        console.log("\nTo execute the airdrop, use a batch transfer tool or script");
        console.log("that reads evm-airdrop.json and calls TNT.transfer() for each recipient.");
    }
}
