// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OwnerRegistry {
    mapping(address => bytes32) private ownerOfAgent;

    event AgentRegistered(address indexed agent, bytes32 indexed ownerId);

    function registerAgent(address agent, bytes32 ownerId) external {
        require(agent != address(0), "invalid agent");
        require(ownerId != bytes32(0), "invalid owner");
        ownerOfAgent[agent] = ownerId;
        emit AgentRegistered(agent, ownerId);
    }

    function ownerOf(address agent) external view returns (bytes32) {
        bytes32 ownerId = ownerOfAgent[agent];
        require(ownerId != bytes32(0), "agent not registered");
        return ownerId;
    }

    function isSameOwner(address a, address b) external view returns (bool) {
        bytes32 ownerA = ownerOfAgent[a];
        bytes32 ownerB = ownerOfAgent[b];
        require(ownerA != bytes32(0) && ownerB != bytes32(0), "agent not registered");
        return ownerA == ownerB;
    }
}
