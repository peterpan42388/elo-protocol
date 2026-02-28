// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IOwnerRegistry {
    function isSameOwner(address a, address b) external view returns (bool);
}

interface IELOToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SettlementEngine {
    IOwnerRegistry public immutable ownerRegistry;
    IELOToken public immutable elo;

    event Settled(
        address indexed provider,
        address indexed consumer,
        uint256 amount,
        bool billable,
        bytes32 usageRef
    );

    constructor(address ownerRegistry_, address elo_) {
        require(ownerRegistry_ != address(0), "invalid ownerRegistry");
        require(elo_ != address(0), "invalid elo");
        ownerRegistry = IOwnerRegistry(ownerRegistry_);
        elo = IELOToken(elo_);
    }

    function settle(address provider, address consumer, uint256 amount, bytes32 usageRef) external {
        bool sameOwner = ownerRegistry.isSameOwner(provider, consumer);

        if (sameOwner) {
            emit Settled(provider, consumer, 0, false, usageRef);
            return;
        }

        require(amount > 0, "amount required");
        require(elo.transferFrom(consumer, provider, amount), "transfer failed");
        emit Settled(provider, consumer, amount, true, usageRef);
    }
}
