// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract OwnerRegistry {
    address public owner;
    mapping(address => bytes32) private ownerOfAgent;
    mapping(address => bool) public registrars;

    event AgentRegistered(address indexed agent, bytes32 indexed ownerId);
    event RegistrarUpdated(address indexed registrar, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier onlyRegistrar() {
        require(registrars[msg.sender], "only registrar");
        _;
    }

    constructor() {
        owner = msg.sender;
        registrars[msg.sender] = true;
    }

    function setRegistrar(address registrar, bool allowed) external onlyOwner {
        require(registrar != address(0), "invalid registrar");
        registrars[registrar] = allowed;
        emit RegistrarUpdated(registrar, allowed);
    }

    function registerAgent(address agent, bytes32 ownerId) external onlyRegistrar {
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
