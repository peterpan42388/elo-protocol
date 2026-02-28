// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRiskPolicy} from "./IRiskPolicy.sol";

interface IOwnerRegistry {
    function isSameOwner(address a, address b) external view returns (bool);
}

interface IELOToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract SettlementEngine {
    error RiskPolicyDenied(bytes32 reasonCode);

    address public owner;
    IOwnerRegistry public immutable ownerRegistry;
    IELOToken public immutable elo;
    IRiskPolicy public riskPolicy;
    mapping(bytes32 => bool) public processedRequestIds;

    event Settled(
        address indexed provider,
        address indexed consumer,
        uint256 amount,
        bool billable,
        bytes32 indexed requestId,
        bytes32 usageRef
    );
    event RiskPolicyUpdated(address indexed riskPolicy);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(address ownerRegistry_, address elo_) {
        require(ownerRegistry_ != address(0), "invalid ownerRegistry");
        require(elo_ != address(0), "invalid elo");
        owner = msg.sender;
        ownerRegistry = IOwnerRegistry(ownerRegistry_);
        elo = IELOToken(elo_);
    }

    function setRiskPolicy(address riskPolicy_) external onlyOwner {
        riskPolicy = IRiskPolicy(riskPolicy_);
        emit RiskPolicyUpdated(riskPolicy_);
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

        if (address(riskPolicy) != address(0)) {
            (bool allowed, bytes32 reasonCode) = riskPolicy.validateSettlement(
                provider,
                consumer,
                msg.sender,
                amount,
                requestId,
                usageRef
            );
            if (!allowed) revert RiskPolicyDenied(reasonCode);
        }

        require(amount > 0, "amount required");
        require(elo.transferFrom(consumer, provider, amount), "transfer failed");
        emit Settled(provider, consumer, amount, true, requestId, usageRef);
    }
}
