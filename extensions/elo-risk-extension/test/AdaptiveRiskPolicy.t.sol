// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AdaptiveRiskPolicy} from "../src/AdaptiveRiskPolicy.sol";

contract AdaptiveRiskPolicyTest is Test {
    AdaptiveRiskPolicy internal policy;

    address internal owner = address(this);
    address internal settlementEngine = address(0x1000);
    address internal provider = address(0x2000);
    address internal consumer = address(0x3000);
    address internal other = address(0x4000);

    function setUp() public {
        policy = new AdaptiveRiskPolicy(
            settlementEngine,
            1 hours,
            100 ether,
            3,
            200 ether,
            5000
        ); // if spent >= 200, max amount reduced to 50% of base (=50)
    }

    function testAllowsNormalSettlement() public {
        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            10 ether,
            keccak256("req1"),
            keccak256("usage")
        );
        assertTrue(allowed);
        assertEq(reason, bytes32("ALLOW"));
    }

    function testBlocksBlacklistedProvider() public {
        policy.setProviderBlocked(provider, true);
        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            10 ether,
            keccak256("req2"),
            keccak256("usage")
        );
        assertFalse(allowed);
        assertEq(reason, bytes32("PROVIDER_BLOCKED"));
    }

    function testBlocksBlacklistedConsumer() public {
        policy.setConsumerBlocked(consumer, true);
        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            10 ether,
            keccak256("req3"),
            keccak256("usage")
        );
        assertFalse(allowed);
        assertEq(reason, bytes32("CONSUMER_BLOCKED"));
    }

    function testOnlySettlementEngineCanRecord() public {
        vm.prank(other);
        vm.expectRevert("only settlementEngine");
        policy.recordSettlement(
            provider,
            consumer,
            other,
            10 ether,
            keccak256("req4"),
            keccak256("usage")
        );
    }

    function testRejectsDuplicateRequestId() public {
        bytes32 req = keccak256("dup");

        vm.prank(settlementEngine);
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, req, keccak256("usage"));

        vm.prank(settlementEngine);
        vm.expectRevert("duplicate requestId");
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, req, keccak256("usage2"));
    }

    function testFrequencyLimitBlocksAfterMaxTx() public {
        vm.startPrank(settlementEngine);
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("f1"), keccak256("usage"));
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("f2"), keccak256("usage"));
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("f3"), keccak256("usage"));
        vm.stopPrank();

        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            1 ether,
            keccak256("f4"),
            keccak256("usage")
        );
        assertFalse(allowed);
        assertEq(reason, bytes32("EXCEED_TX_RATE"));
    }

    function testWindowResetsAfterDuration() public {
        vm.startPrank(settlementEngine);
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("w1"), keccak256("usage"));
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("w2"), keccak256("usage"));
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("w3"), keccak256("usage"));
        vm.stopPrank();

        vm.warp(block.timestamp + 1 hours + 1);

        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            1 ether,
            keccak256("w4"),
            keccak256("usage")
        );
        assertTrue(allowed);
        assertEq(reason, bytes32("ALLOW"));
    }

    function testDynamicLimitTightensAfterHighUsage() public {
        vm.startPrank(settlementEngine);
        policy.recordSettlement(provider, consumer, settlementEngine, 120 ether, keccak256("d1"), keccak256("usage"));
        policy.recordSettlement(provider, consumer, settlementEngine, 100 ether, keccak256("d2"), keccak256("usage"));
        vm.stopPrank();

        uint256 dynamicMax = policy.previewDynamicMaxAmount(consumer);
        assertEq(dynamicMax, 50 ether);

        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            60 ether,
            keccak256("d3"),
            keccak256("usage")
        );
        assertFalse(allowed);
        assertEq(reason, bytes32("EXCEED_DYNAMIC_LIMIT"));
    }

    function testOwnerCanSetConsumerSpecificTxRate() public {
        policy.setMaxTxPerWindowOverride(consumer, 1);

        vm.prank(settlementEngine);
        policy.recordSettlement(provider, consumer, settlementEngine, 1 ether, keccak256("o1"), keccak256("usage"));

        (bool allowed, bytes32 reason) = policy.validateSettlement(
            provider,
            consumer,
            settlementEngine,
            1 ether,
            keccak256("o2"),
            keccak256("usage")
        );
        assertFalse(allowed);
        assertEq(reason, bytes32("EXCEED_TX_RATE"));
    }
}
