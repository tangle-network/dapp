// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ISP1Verifier
 * @notice Interface for SP1 proof verification
 */
interface ISP1Verifier {
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view;
}

/**
 * @title ITNT
 * @notice Interface for the TNT token
 */
interface ITNT {
    function mint(address to, uint256 amount) external;
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title MigrationClaim
 * @notice Allows users to claim TNT tokens by proving ownership of their Substrate SR25519 keys
 * @dev Uses SP1 ZK proofs for SR25519 signature verification and Merkle proofs for balance eligibility
 */
contract MigrationClaim is Ownable, ReentrancyGuard {
    // ============ Constants ============

    /// @notice SP1 Verifier Gateway on Base Sepolia (Groth16)
    ISP1Verifier public constant SP1_VERIFIER =
        ISP1Verifier(0x397A5f7f3dBd538f23DE225B51f532c34448dA9B);

    /// @notice Claim period duration (1 year)
    uint256 public constant CLAIM_PERIOD = 365 days;

    // ============ Immutables ============

    /// @notice Verification key for SR25519 proof program
    bytes32 public immutable sr25519Vkey;

    /// @notice Merkle root of eligible (substratePublicKey, balance) pairs
    bytes32 public immutable merkleRoot;

    /// @notice TNT token contract
    ITNT public immutable tntToken;

    /// @notice Treasury address for unclaimed funds
    address public immutable treasury;

    /// @notice Claim deadline timestamp
    uint256 public immutable claimDeadline;

    /// @notice Total tokens allocated for claims
    uint256 public immutable totalAllocated;

    // ============ State ============

    /// @notice Substrate public key (32 bytes) => claimed status
    mapping(bytes32 => bool) public claimed;

    /// @notice Total tokens claimed so far
    uint256 public totalClaimed;

    /// @notice Whether unclaimed tokens have been recovered
    bool public unclaimedRecovered;

    // ============ Events ============

    /// @notice Emitted when a user successfully claims tokens
    event Claimed(
        bytes32 indexed substratePublicKey,
        address indexed evmAddress,
        uint256 amount
    );

    /// @notice Emitted when unclaimed tokens are recovered to treasury
    event UnclaimedRecovered(uint256 amount);

    // ============ Errors ============

    error ClaimPeriodEnded();
    error ClaimPeriodNotEnded();
    error AlreadyClaimed();
    error InvalidMerkleProof();
    error PublicKeyMismatch();
    error EvmAddressMismatch();
    error InvalidChallenge();
    error NothingToRecover();
    error AlreadyRecovered();
    error ZeroAddress();
    error ZeroAmount();

    // ============ Constructor ============

    /**
     * @notice Initialize the MigrationClaim contract
     * @param _sr25519Vkey The verification key for the SR25519 SP1 program
     * @param _merkleRoot The Merkle root of eligible balances
     * @param _tntToken The TNT token contract address
     * @param _treasury The treasury address for unclaimed funds
     * @param _totalAllocated The total tokens allocated for claims
     * @param _owner The owner of the contract
     */
    constructor(
        bytes32 _sr25519Vkey,
        bytes32 _merkleRoot,
        address _tntToken,
        address _treasury,
        uint256 _totalAllocated,
        address _owner
    ) Ownable(_owner) {
        if (_tntToken == address(0)) revert ZeroAddress();
        if (_treasury == address(0)) revert ZeroAddress();
        if (_totalAllocated == 0) revert ZeroAmount();

        sr25519Vkey = _sr25519Vkey;
        merkleRoot = _merkleRoot;
        tntToken = ITNT(_tntToken);
        treasury = _treasury;
        totalAllocated = _totalAllocated;
        claimDeadline = block.timestamp + CLAIM_PERIOD;
    }

    // ============ External Functions ============

    /**
     * @notice Claim TNT tokens by proving SR25519 key ownership
     * @param substratePublicKey The 32-byte SR25519 public key
     * @param amount The claimable amount from the snapshot
     * @param merkleProof Proof that (publicKey, amount) is in the Merkle tree
     * @param sp1Proof The SP1 proof of SR25519 signature verification
     * @param publicValues The public values from the SP1 proof
     */
    function claim(
        bytes32 substratePublicKey,
        uint256 amount,
        bytes32[] calldata merkleProof,
        bytes calldata sp1Proof,
        bytes calldata publicValues
    ) external nonReentrant {
        // Check claim period hasn't ended
        if (block.timestamp >= claimDeadline) revert ClaimPeriodEnded();

        // Check not already claimed
        if (claimed[substratePublicKey]) revert AlreadyClaimed();

        // Verify Merkle proof for balance eligibility
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(substratePublicKey, amount)))
        );
        if (!MerkleProof.verify(merkleProof, merkleRoot, leaf)) {
            revert InvalidMerkleProof();
        }

        // Decode and validate public values from ZK proof
        (
            bytes32 provenPublicKey,
            address provenEvmAddress,
            bytes32 provenChallenge
        ) = abi.decode(publicValues, (bytes32, address, bytes32));

        // Ensure proof is for the correct public key
        if (provenPublicKey != substratePublicKey) revert PublicKeyMismatch();

        // Ensure proof is for the correct recipient (caller)
        if (provenEvmAddress != msg.sender) revert EvmAddressMismatch();

        // Verify challenge includes commitment to this contract and chain
        bytes32 expectedChallenge = keccak256(
            abi.encodePacked(address(this), block.chainid, msg.sender)
        );
        if (provenChallenge != expectedChallenge) revert InvalidChallenge();

        // Verify ZK proof of SR25519 signature
        SP1_VERIFIER.verifyProof(sr25519Vkey, publicValues, sp1Proof);

        // Mark as claimed
        claimed[substratePublicKey] = true;
        totalClaimed += amount;

        // Mint tokens to claimant
        tntToken.mint(msg.sender, amount);

        emit Claimed(substratePublicKey, msg.sender, amount);
    }

    /**
     * @notice Recover unclaimed tokens to treasury after claim period ends
     * @dev Anyone can call this after the claim period ends
     */
    function recoverUnclaimed() external nonReentrant {
        // Check claim period has ended
        if (block.timestamp < claimDeadline) revert ClaimPeriodNotEnded();

        // Check not already recovered
        if (unclaimedRecovered) revert AlreadyRecovered();

        // Calculate unclaimed amount
        uint256 unclaimed = totalAllocated - totalClaimed;
        if (unclaimed == 0) revert NothingToRecover();

        // Mark as recovered
        unclaimedRecovered = true;

        // Mint unclaimed tokens to treasury
        tntToken.mint(treasury, unclaimed);

        emit UnclaimedRecovered(unclaimed);
    }

    // ============ View Functions ============

    /**
     * @notice Check if a Substrate public key has already claimed
     * @param substratePublicKey The public key to check
     * @return True if already claimed
     */
    function hasClaimed(bytes32 substratePublicKey) external view returns (bool) {
        return claimed[substratePublicKey];
    }

    /**
     * @notice Get the remaining time for claims
     * @return Seconds remaining, 0 if claim period has ended
     */
    function timeRemaining() external view returns (uint256) {
        if (block.timestamp >= claimDeadline) return 0;
        return claimDeadline - block.timestamp;
    }

    /**
     * @notice Get the unclaimed token amount
     * @return Amount of tokens not yet claimed
     */
    function unclaimedAmount() external view returns (uint256) {
        return totalAllocated - totalClaimed;
    }

    /**
     * @notice Generate the challenge hash for signing
     * @param evmAddress The EVM address that will receive the tokens
     * @return The challenge hash to sign with the SR25519 key
     */
    function getChallenge(address evmAddress) external view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), block.chainid, evmAddress));
    }
}
