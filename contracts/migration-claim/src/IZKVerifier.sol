// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IZKVerifier
/// @notice Interface for ZK proof verification of Substrate key ownership
/// @dev Implement this interface with your ZKVM of choice (SP1, Risc0, etc.)
interface IZKVerifier {
    /// @notice Verifies a ZK proof of Substrate key ownership
    /// @param proof The ZK proof bytes
    /// @param publicInputs The ABI-encoded public inputs containing:
    ///        - pubkey (bytes32): The SR25519 public key
    ///        - evmAddress (address): The EVM address to receive tokens
    ///        - amount (uint256): The amount being claimed
    /// @return valid True if the proof is valid
    function verifyProof(
        bytes calldata proof,
        bytes calldata publicInputs
    ) external view returns (bool valid);
}
