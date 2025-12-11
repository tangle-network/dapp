// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IZKVerifier} from "./IZKVerifier.sol";

/// @title ISP1Verifier
/// @notice Interface for SP1 proof verification (Groth16)
interface ISP1Verifier {
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view;
}

/// @title SP1ZKVerifier
/// @notice Adapter that implements IZKVerifier using SP1 Groth16 proofs
/// @dev Wraps the SP1 verifier gateway for Substrate key ownership proofs
contract SP1ZKVerifier is IZKVerifier {
    /// @notice SP1 Verifier Gateway (Groth16)
    /// Base Sepolia & Mainnet: 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
    ISP1Verifier public immutable sp1Verifier;

    /// @notice Verification key for the SR25519 claim program
    bytes32 public immutable programVKey;

    /// @notice Owner for admin functions
    address public owner;

    error InvalidProof();
    error OnlyOwner();

    event ProgramVKeyUpdated(bytes32 oldVKey, bytes32 newVKey);

    constructor(address _sp1Verifier, bytes32 _programVKey, address _owner) {
        sp1Verifier = ISP1Verifier(_sp1Verifier);
        programVKey = _programVKey;
        owner = _owner;
    }

    /// @notice Verifies a ZK proof of Substrate key ownership
    /// @param proof The SP1 Groth16 proof bytes
    /// @param publicInputs The ABI-encoded public inputs:
    ///        - pubkey (bytes32): The SR25519 public key
    ///        - evmAddress (address): The recipient EVM address
    ///        - amount (uint256): The claim amount
    /// @return valid True if the proof is valid
    function verifyProof(
        bytes calldata proof,
        bytes calldata publicInputs
    ) external view override returns (bool valid) {
        // Decode the public inputs
        (
            bytes32 pubkey,
            address evmAddress,
            uint256 amount
        ) = abi.decode(publicInputs, (bytes32, address, uint256));

        // Reconstruct the public values for SP1
        // The SP1 program commits: (pubkey, evmAddress, amount)
        bytes memory sp1PublicValues = abi.encode(
            pubkey,
            evmAddress,
            amount
        );

        // Verify with SP1
        // The verifyProof function reverts on failure
        try sp1Verifier.verifyProof(programVKey, sp1PublicValues, proof) {
            return true;
        } catch {
            return false;
        }
    }
}

/// @title MockZKVerifier
/// @notice Mock verifier for testing - always returns true
/// @dev DO NOT USE IN PRODUCTION
contract MockZKVerifier is IZKVerifier {
    bool public shouldPass = true;

    function setResult(bool _shouldPass) external {
        shouldPass = _shouldPass;
    }

    function verifyProof(
        bytes calldata,
        bytes calldata
    ) external view override returns (bool) {
        return shouldPass;
    }
}
