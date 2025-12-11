// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IZKVerifier} from "./IZKVerifier.sol";

/// @title MockZKVerifier
/// @notice A mock ZK verifier for testing that always returns true
/// @dev DO NOT use in production - this accepts any proof!
contract MockZKVerifier is IZKVerifier {
    /// @notice Always returns true (for testing only)
    function verifyProof(
        bytes calldata,
        bytes calldata
    ) external pure override returns (bool) {
        return true;
    }
}
