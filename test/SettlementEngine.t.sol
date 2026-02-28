// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {OwnerRegistry} from "../contracts/OwnerRegistry.sol";
import {ELOToken} from "../contracts/ELOToken.sol";
import {SettlementEngine} from "../contracts/SettlementEngine.sol";
import {ThresholdRiskPolicy} from "../contracts/ThresholdRiskPolicy.sol";

contract SettlementEngineTest is Test {
    OwnerRegistry internal registry;
    ELOToken internal elo;
    SettlementEngine internal settlement;
    ThresholdRiskPolicy internal policy;

    address internal provider = address(0xA11CE);
    address internal consumer = address(0xB0B);
    address internal sameOwnerConsumer = address(0xCAFE);
    address internal attacker = address(0xBAD);

    bytes32 internal providerOwner = keccak256("owner-provider");
    bytes32 internal consumerOwner = keccak256("owner-consumer");

    function setUp() public {
        registry = new OwnerRegistry();
        elo = new ELOToken();
        settlement = new SettlementEngine(address(registry), address(elo));
        policy = new ThresholdRiskPolicy(100 ether);

        registry.registerAgent(provider, providerOwner);
        registry.registerAgent(consumer, consumerOwner);
        registry.registerAgent(sameOwnerConsumer, providerOwner);

        elo.mint(consumer, 1_000_000 ether);

        vm.prank(consumer);
        elo.approve(address(settlement), type(uint256).max);
    }

    function testSameOwnerSettlementIsFreeAndNoTransfer() public {
        uint256 providerBefore = elo.balanceOf(provider);
        uint256 consumerBefore = elo.balanceOf(sameOwnerConsumer);

        vm.prank(sameOwnerConsumer);
        settlement.settle(provider, sameOwnerConsumer, 10 ether, keccak256("same-1"), keccak256("usage"));

        assertEq(elo.balanceOf(provider), providerBefore);
        assertEq(elo.balanceOf(sameOwnerConsumer), consumerBefore);
    }

    function testCrossOwnerSettlementTransfers() public {
        uint256 amount = 25 ether;
        uint256 providerBefore = elo.balanceOf(provider);
        uint256 consumerBefore = elo.balanceOf(consumer);

        vm.prank(consumer);
        settlement.settle(provider, consumer, amount, keccak256("cross-1"), keccak256("usage"));

        assertEq(elo.balanceOf(provider), providerBefore + amount);
        assertEq(elo.balanceOf(consumer), consumerBefore - amount);
    }

    function testReplayRequestIdRejected() public {
        bytes32 requestId = keccak256("dup-id");

        vm.prank(consumer);
        settlement.settle(provider, consumer, 1 ether, requestId, keccak256("usage-1"));

        vm.prank(consumer);
        vm.expectRevert("duplicate requestId");
        settlement.settle(provider, consumer, 1 ether, requestId, keccak256("usage-2"));
    }

    function testUnauthorizedCallerCannotSpendConsumerAllowance() public {
        vm.prank(attacker);
        vm.expectRevert("only consumer");
        settlement.settle(provider, consumer, 5 ether, keccak256("steal"), keccak256("usage"));
    }

    function testOnlyRegistrarCanRegister() public {
        vm.prank(attacker);
        vm.expectRevert("only registrar");
        registry.registerAgent(address(0xDEAD), keccak256("owner-dead"));
    }

    function testOnlyMinterCanMint() public {
        vm.prank(attacker);
        vm.expectRevert("only minter");
        elo.mint(attacker, 1 ether);
    }

    function testFuzzCrossOwnerSettlement(uint96 rawAmount) public {
        uint256 amount = bound(uint256(rawAmount), 1, 100_000 ether);

        uint256 providerBefore = elo.balanceOf(provider);
        uint256 consumerBefore = elo.balanceOf(consumer);

        bytes32 requestId = keccak256(abi.encodePacked("fuzz-cross", amount));

        vm.prank(consumer);
        settlement.settle(provider, consumer, amount, requestId, keccak256("usage-fuzz"));

        assertEq(elo.balanceOf(provider), providerBefore + amount);
        assertEq(elo.balanceOf(consumer), consumerBefore - amount);
    }

    function testFuzzSameOwnerNeverTransfers(uint96 rawAmount) public {
        uint256 amount = bound(uint256(rawAmount), 1, 100_000 ether);

        uint256 providerBefore = elo.balanceOf(provider);
        uint256 consumerBefore = elo.balanceOf(sameOwnerConsumer);

        vm.prank(sameOwnerConsumer);
        settlement.settle(provider, sameOwnerConsumer, amount, keccak256(abi.encodePacked("same", amount)), keccak256("usage"));

        assertEq(elo.balanceOf(provider), providerBefore);
        assertEq(elo.balanceOf(sameOwnerConsumer), consumerBefore);
    }

    function testOnlyOwnerCanSetRiskPolicy() public {
        vm.prank(attacker);
        vm.expectRevert("only owner");
        settlement.setRiskPolicy(address(policy));
    }

    function testRiskPolicyCanBlockSettlement() public {
        settlement.setRiskPolicy(address(policy));
        policy.setBlocked(consumer, true);

        vm.prank(consumer);
        vm.expectRevert();
        settlement.settle(provider, consumer, 1 ether, keccak256("risk-blocked"), keccak256("usage"));
    }

    function testRiskPolicyCanLimitAmount() public {
        settlement.setRiskPolicy(address(policy));
        policy.setMaxAmount(2 ether);

        vm.prank(consumer);
        vm.expectRevert();
        settlement.settle(provider, consumer, 3 ether, keccak256("risk-limit"), keccak256("usage"));
    }

    function testRiskPolicyAllowsValidSettlement() public {
        settlement.setRiskPolicy(address(policy));
        policy.setMaxAmount(10 ether);

        vm.prank(consumer);
        settlement.settle(provider, consumer, 1 ether, keccak256("risk-ok"), keccak256("usage"));

        assertEq(elo.balanceOf(provider), 1 ether);
        assertEq(elo.balanceOf(consumer), 1_000_000 ether - 1 ether);
    }
}
