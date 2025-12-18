// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TNT} from "../src/TNT.sol";
import {TangleMigration} from "../src/TangleMigration.sol";
import {MockZKVerifier} from "../src/MockZKVerifier.sol";

/**
 * @title DeployLocal
 * @notice Simple local deployment script for testing
 *
 * Usage:
 *   MERKLE_ROOT=0x... TOTAL_VALUE=... forge script script/DeployLocal.s.sol:DeployLocal \
 *     --rpc-url http://localhost:8545 --broadcast -vvv
 */
contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        bytes32 merkleRoot = vm.envBytes32("MERKLE_ROOT");
        uint256 totalValue = vm.envUint("TOTAL_VALUE");

        console.log("=== Local Deployment ===");
        console.log("Deployer:", deployer);
        console.log("Merkle Root:", vm.toString(merkleRoot));
        console.log("Total Value:", totalValue);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy TNT
        TNT tnt = new TNT(deployer);
        console.log("TNT deployed:", address(tnt));

        // Mint initial supply
        tnt.mintInitialSupply(deployer, totalValue);
        console.log("Minted:", totalValue);

        // Deploy MockZKVerifier
        MockZKVerifier verifier = new MockZKVerifier();
        console.log("MockZKVerifier deployed:", address(verifier));

        // Deploy TangleMigration
        TangleMigration migration = new TangleMigration(
            address(tnt),
            merkleRoot,
            address(verifier),
            deployer
        );
        console.log("TangleMigration deployed:", address(migration));

        // Fund migration contract
        tnt.transfer(address(migration), totalValue);
        console.log("Migration funded with:", totalValue);

        vm.stopBroadcast();

        // Output for script parsing
        console.log("");
        console.log("=== DEPLOYED ===");
        console.log("TNT_ADDRESS=%s", address(tnt));
        console.log("VERIFIER_ADDRESS=%s", address(verifier));
        console.log("MIGRATION_ADDRESS=%s", address(migration));
    }
}
