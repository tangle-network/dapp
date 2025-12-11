// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {TangleMigration} from "../src/TangleMigration.sol";
import {TNT} from "../src/TNT.sol";
import {MockZKVerifier} from "../src/MockZKVerifier.sol";
import {IZKVerifier} from "../src/IZKVerifier.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract TangleMigrationTest is Test {
    TangleMigration public migration;
    TNT public tnt;
    MockZKVerifier public mockVerifier;

    address public owner;
    address public claimer;

    // Test data - using raw 32-byte pubkey instead of SS58 string
    bytes32 constant TEST_PUBKEY = bytes32(0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d);
    uint256 constant TEST_AMOUNT = 1000 ether;

    // Merkle tree for testing (single leaf)
    bytes32 public merkleRoot;
    bytes32[] public merkleProof;

    function setUp() public {
        owner = address(this);
        claimer = makeAddr("claimer");

        // Deploy TNT token
        tnt = new TNT(owner);

        // Mint initial supply to owner (TNT doesn't mint in constructor)
        tnt.mintInitialSupply(owner, 100000 ether);

        // Deploy mock ZK verifier
        mockVerifier = new MockZKVerifier();

        // Calculate merkle root for single leaf
        // Leaf format: keccak256(bytes.concat(keccak256(abi.encode(pubkey, amount))))
        bytes32 leaf = keccak256(
            bytes.concat(
                keccak256(abi.encode(TEST_PUBKEY, TEST_AMOUNT))
            )
        );
        merkleRoot = leaf; // Single leaf = root
        merkleProof = new bytes32[](0); // Empty proof for single leaf

        // Deploy migration contract
        migration = new TangleMigration(
            address(tnt),
            merkleRoot,
            address(mockVerifier),
            owner
        );

        // Fund migration contract
        tnt.transfer(address(migration), 10000 ether);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DEPLOYMENT TESTS
    // ═══════════════════════════════════════════════════════════════════════

    function test_Deployment() public view {
        assertEq(address(migration.token()), address(tnt));
        assertEq(migration.merkleRoot(), merkleRoot);
        assertEq(migration.owner(), owner);
        assertFalse(migration.paused());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MERKLE PROOF TESTS
    // ═══════════════════════════════════════════════════════════════════════

    function test_VerifyMerkleProof() public view {
        bool valid = migration.verifyMerkleProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof
        );
        assertTrue(valid);
    }

    function test_VerifyMerkleProof_InvalidAmount() public view {
        bool valid = migration.verifyMerkleProof(
            TEST_PUBKEY,
            TEST_AMOUNT + 1, // Wrong amount
            merkleProof
        );
        assertFalse(valid);
    }

    function test_VerifyMerkleProof_InvalidPubkey() public view {
        bool valid = migration.verifyMerkleProof(
            bytes32(0x1234567890123456789012345678901234567890123456789012345678901234),
            TEST_AMOUNT,
            merkleProof
        );
        assertFalse(valid);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLAIM WITH ZK PROOF TESTS
    // ═══════════════════════════════════════════════════════════════════════

    function test_ClaimWithZKProof() public {
        bytes memory zkProof = ""; // Mock verifier accepts any proof

        uint256 claimerBalanceBefore = tnt.balanceOf(claimer);

        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );

        // Check balance increased
        assertEq(tnt.balanceOf(claimer), claimerBalanceBefore + TEST_AMOUNT);

        // Check claimed amount recorded
        assertEq(migration.getClaimedAmount(TEST_PUBKEY), TEST_AMOUNT);

        // Check total claimed updated
        assertEq(migration.totalClaimed(), TEST_AMOUNT);
    }

    function test_ClaimWithZKProof_EmitsEvent() public {
        bytes memory zkProof = "";

        vm.expectEmit(true, true, false, true);
        emit TangleMigration.Claimed(
            TEST_PUBKEY,
            claimer,
            TEST_AMOUNT
        );

        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );
    }

    function test_ClaimWithZKProof_RevertIfAlreadyClaimed() public {
        bytes memory zkProof = "";

        // First claim succeeds
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );

        // Second claim fails
        vm.expectRevert(TangleMigration.AlreadyClaimed.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );
    }

    function test_ClaimWithZKProof_RevertIfPaused() public {
        migration.setPaused(true);

        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.ClaimsPaused.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );
    }

    function test_ClaimWithZKProof_RevertIfDeadlinePassed() public {
        // Set a deadline
        uint256 deadline = block.timestamp + 1 days;
        migration.setClaimDeadline(deadline);

        // Fast forward past deadline
        vm.warp(deadline + 1);

        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.ClaimDeadlinePassed.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );
    }

    function test_ClaimWithZKProof_RevertIfZeroRecipient() public {
        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.ZeroAddress.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            address(0)
        );
    }

    function test_ClaimWithZKProof_RevertIfZeroAmount() public {
        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.ZeroAmount.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            0,
            merkleProof,
            zkProof,
            claimer
        );
    }

    function test_ClaimWithZKProof_RevertIfInvalidMerkleProof() public {
        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.InvalidMerkleProof.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT + 1, // Wrong amount = invalid proof
            merkleProof,
            zkProof,
            claimer
        );
    }

    function test_ClaimWithZKProof_RevertIfNoZKVerifier() public {
        // Deploy new migration without ZK verifier
        TangleMigration migrationNoVerifier = new TangleMigration(
            address(tnt),
            merkleRoot,
            address(0), // No verifier
            owner
        );

        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.NoZKVerifier.selector);
        vm.prank(claimer);
        migrationNoVerifier.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ZK VERIFIER MOCK TEST
    // ═══════════════════════════════════════════════════════════════════════

    function test_ClaimWithZKProof_VerifiesPublicInputs() public {
        // Deploy a strict mock that checks public inputs
        StrictMockVerifier strictVerifier = new StrictMockVerifier(
            TEST_PUBKEY,
            claimer,
            TEST_AMOUNT
        );
        migration.setZKVerifier(address(strictVerifier));

        bytes memory zkProof = "";

        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer
        );

        // If we got here without reverting, the public inputs matched
        assertEq(migration.getClaimedAmount(TEST_PUBKEY), TEST_AMOUNT);
    }

    function test_ClaimWithZKProof_RejectsWrongPublicInputs() public {
        // Deploy a strict mock expecting different recipient
        StrictMockVerifier strictVerifier = new StrictMockVerifier(
            TEST_PUBKEY,
            makeAddr("wrongRecipient"),  // Expects different recipient
            TEST_AMOUNT
        );
        migration.setZKVerifier(address(strictVerifier));

        bytes memory zkProof = "";

        vm.expectRevert(TangleMigration.InvalidZKProof.selector);
        vm.prank(claimer);
        migration.claimWithZKProof(
            TEST_PUBKEY,
            TEST_AMOUNT,
            merkleProof,
            zkProof,
            claimer  // This doesn't match expected
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN TESTS
    // ═══════════════════════════════════════════════════════════════════════

    function test_Pause() public {
        assertFalse(migration.paused());
        migration.setPaused(true);
        assertTrue(migration.paused());
    }

    function test_Unpause() public {
        migration.setPaused(true);
        assertTrue(migration.paused());
        migration.setPaused(false);
        assertFalse(migration.paused());
    }

    function test_SetMerkleRoot() public {
        bytes32 newRoot = keccak256("newRoot");

        vm.expectEmit(true, true, false, false);
        emit TangleMigration.MerkleRootUpdated(merkleRoot, newRoot);

        migration.setMerkleRoot(newRoot);
        assertEq(migration.merkleRoot(), newRoot);
    }

    function test_SetZKVerifier() public {
        address newVerifier = makeAddr("newVerifier");

        vm.expectEmit(true, true, false, false);
        emit TangleMigration.ZKVerifierUpdated(address(mockVerifier), newVerifier);

        migration.setZKVerifier(newVerifier);
        assertEq(address(migration.zkVerifier()), newVerifier);
    }

    function test_SetClaimDeadline() public {
        uint256 newDeadline = block.timestamp + 365 days;

        vm.expectEmit(true, true, false, false);
        emit TangleMigration.ClaimDeadlineUpdated(0, newDeadline);

        migration.setClaimDeadline(newDeadline);
        assertEq(migration.claimDeadline(), newDeadline);
    }

    function test_OnlyOwner() public {
        address notOwner = makeAddr("notOwner");

        vm.startPrank(notOwner);

        vm.expectRevert();
        migration.setPaused(true);

        vm.expectRevert();
        migration.setMerkleRoot(bytes32(0));

        vm.expectRevert();
        migration.setZKVerifier(address(0));

        vm.expectRevert();
        migration.setClaimDeadline(0);

        vm.stopPrank();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MULTI-LEAF MERKLE TREE TEST
    // ═══════════════════════════════════════════════════════════════════════

    function test_MultiLeafMerkleTree() public {
        // Create a tree with 4 leaves using bytes32 pubkeys
        bytes32[4] memory pubkeys = [
            bytes32(0x1111111111111111111111111111111111111111111111111111111111111111),
            bytes32(0x2222222222222222222222222222222222222222222222222222222222222222),
            bytes32(0x3333333333333333333333333333333333333333333333333333333333333333),
            bytes32(0x4444444444444444444444444444444444444444444444444444444444444444)
        ];
        uint256[4] memory amounts = [
            uint256(100 ether),
            200 ether,
            300 ether,
            400 ether
        ];

        // Calculate leaves
        bytes32[4] memory leaves;
        for (uint i = 0; i < 4; i++) {
            leaves[i] = keccak256(
                bytes.concat(
                    keccak256(abi.encode(pubkeys[i], amounts[i]))
                )
            );
        }

        // Build tree (simplified 4-leaf tree)
        bytes32 hash01 = _hashPair(leaves[0], leaves[1]);
        bytes32 hash23 = _hashPair(leaves[2], leaves[3]);
        bytes32 root = _hashPair(hash01, hash23);

        // Deploy new migration with this root
        TangleMigration multiMigration = new TangleMigration(
            address(tnt),
            root,
            address(mockVerifier),
            owner
        );
        tnt.transfer(address(multiMigration), 1000 ether);

        // Build proof for leaf 0
        bytes32[] memory proof0 = new bytes32[](2);
        proof0[0] = leaves[1]; // Sibling
        proof0[1] = hash23;    // Uncle

        // Verify proof works
        assertTrue(multiMigration.verifyMerkleProof(
            pubkeys[0],
            amounts[0],
            proof0
        ));

        // Claim should work
        vm.prank(claimer);
        multiMigration.claimWithZKProof(
            pubkeys[0],
            amounts[0],
            proof0,
            "",
            claimer
        );

        assertEq(multiMigration.getClaimedAmount(pubkeys[0]), amounts[0]);
    }

    function _hashPair(bytes32 a, bytes32 b) internal pure returns (bytes32) {
        return a < b
            ? keccak256(abi.encodePacked(a, b))
            : keccak256(abi.encodePacked(b, a));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EMERGENCY WITHDRAW TEST
    // ═══════════════════════════════════════════════════════════════════════

    function test_EmergencyWithdraw() public {
        uint256 balance = tnt.balanceOf(address(migration));
        uint256 ownerBalanceBefore = tnt.balanceOf(owner);

        migration.emergencyWithdraw(address(tnt), balance);

        assertEq(tnt.balanceOf(address(migration)), 0);
        assertEq(tnt.balanceOf(owner), ownerBalanceBefore + balance);
    }

    function test_EmergencyWithdraw_OnlyOwner() public {
        address notOwner = makeAddr("notOwner");

        vm.prank(notOwner);
        vm.expectRevert();
        migration.emergencyWithdraw(address(tnt), 100 ether);
    }
}

/// @notice Strict mock verifier that validates public inputs
contract StrictMockVerifier is IZKVerifier {
    bytes32 public expectedPubkey;
    address public expectedRecipient;
    uint256 public expectedAmount;

    constructor(bytes32 _pubkey, address _recipient, uint256 _amount) {
        expectedPubkey = _pubkey;
        expectedRecipient = _recipient;
        expectedAmount = _amount;
    }

    function verifyProof(
        bytes calldata,
        bytes calldata publicInputs
    ) external view override returns (bool) {
        (bytes32 pubkey, address recipient, uint256 amount) =
            abi.decode(publicInputs, (bytes32, address, uint256));

        // Return false if inputs don't match expected values
        if (pubkey != expectedPubkey) {
            return false;
        }
        if (recipient != expectedRecipient) {
            return false;
        }
        if (amount != expectedAmount) {
            return false;
        }

        return true;
    }
}
