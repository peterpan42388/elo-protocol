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
    mapping(bytes32 => bool) public processedRequestIds;

    event Settled(
        address indexed provider,
        address indexed consumer,
        uint256 amount,
        bool billable,
        bytes32 indexed requestId,
        bytes32 usageRef
    );

    constructor(address ownerRegistry_, address elo_) {
        require(ownerRegistry_ != address(0), "invalid ownerRegistry");
        require(elo_ != address(0), "invalid elo");
        ownerRegistry = IOwnerRegistry(ownerRegistry_);
        elo = IELOToken(elo_);
    }

    function settle(
        address provider,
        address consumer,
        uint256 amount,
        bytes32 requestId,
        bytes32 usageRef
    ) external {
        require(provider != address(0) && consumer != address(0), "invalid participants");
        require(msg.sender == consumer, "only consumer");
        require(requestId != bytes32(0), "invalid requestId");
        require(!processedRequestIds[requestId], "duplicate requestId");
        processedRequestIds[requestId] = true;

        bool sameOwner = ownerRegistry.isSameOwner(provider, consumer);

        if (sameOwner) {
            emit Settled(provider, consumer, 0, false, requestId, usageRef);
            return;
        }

        require(amount > 0, "amount required");
        require(elo.transferFrom(consumer, provider, amount), "transfer failed");
        emit Settled(provider, consumer, amount, true, requestId, usageRef);
    }
}
