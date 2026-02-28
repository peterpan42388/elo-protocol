// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {OwnerRegistry} from "../contracts/OwnerRegistry.sol";
import {ELOToken} from "../contracts/ELOToken.sol";
import {SettlementEngine} from "../contracts/SettlementEngine.sol";

contract SettlementHandler is Test {
    OwnerRegistry internal registry;
    ELOToken internal elo;
    SettlementEngine internal settlement;

    address internal provider;
    address internal consumer;
    address internal sameOwnerConsumer;

    uint256 internal nonce;

    constructor(
        OwnerRegistry _registry,
        ELOToken _elo,
        SettlementEngine _settlement,
        address _provider,
        address _consumer,
        address _sameOwnerConsumer
    ) {
        registry = _registry;
        elo = _elo;
        settlement = _settlement;
        provider = _provider;
        consumer = _consumer;
        sameOwnerConsumer = _sameOwnerConsumer;
    }

    function crossOwnerSettle(uint96 rawAmount) external {
        uint256 bal = elo.balanceOf(consumer);
        if (bal == 0) return;

        uint256 amount = bound(uint256(rawAmount), 1, bal);
        bytes32 requestId = keccak256(abi.encodePacked("cross", nonce++));

        vm.prank(consumer);
        settlement.settle(provider, consumer, amount, requestId, keccak256("usage-cross"));
    }

    function sameOwnerSettle(uint96 rawAmount) external {
        uint256 amount = bound(uint256(rawAmount), 1, 100_000 ether);
        bytes32 requestId = keccak256(abi.encodePacked("same", nonce++));

        vm.prank(sameOwnerConsumer);
        settlement.settle(provider, sameOwnerConsumer, amount, requestId, keccak256("usage-same"));
    }
}

contract SettlementInvariantTest is StdInvariant, Test {
    OwnerRegistry internal registry;
    ELOToken internal elo;
    SettlementEngine internal settlement;
    SettlementHandler internal handler;

    address internal provider = address(0xA11CE);
    address internal consumer = address(0xB0B);
    address internal sameOwnerConsumer = address(0xCAFE);

    bytes32 internal providerOwner = keccak256("owner-provider");
    bytes32 internal consumerOwner = keccak256("owner-consumer");

    uint256 internal initialTotal;

    function setUp() public {
        registry = new OwnerRegistry();
        elo = new ELOToken();
        settlement = new SettlementEngine(address(registry), address(elo));

        registry.registerAgent(provider, providerOwner);
        registry.registerAgent(consumer, consumerOwner);
        registry.registerAgent(sameOwnerConsumer, providerOwner);

        elo.mint(consumer, 1_000_000 ether);
        initialTotal = elo.totalSupply();

        vm.prank(consumer);
        elo.approve(address(settlement), type(uint256).max);

        handler = new SettlementHandler(registry, elo, settlement, provider, consumer, sameOwnerConsumer);
        targetContract(address(handler));
    }

    function invariant_totalSupplyConserved() public {
        assertEq(elo.totalSupply(), initialTotal);
    }

    function invariant_sameOwnerConsumerBalanceNeverChanges() public {
        assertEq(elo.balanceOf(sameOwnerConsumer), 0);
    }

    function invariant_balanceConservationAcrossParticipants() public {
        uint256 sum = elo.balanceOf(provider) + elo.balanceOf(consumer) + elo.balanceOf(sameOwnerConsumer);
        assertEq(sum, initialTotal);
    }
}
