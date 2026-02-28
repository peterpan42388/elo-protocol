// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRiskPolicy} from "./IRiskPolicy.sol";

contract ThresholdRiskPolicy is IRiskPolicy {
    address public owner;
    uint256 public maxAmount;
    mapping(address => bool) public blocked;

    event MaxAmountUpdated(uint256 maxAmount);
    event BlockedUpdated(address indexed account, bool blocked);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(uint256 maxAmount_) {
        owner = msg.sender;
        maxAmount = maxAmount_;
    }

    function setMaxAmount(uint256 maxAmount_) external onlyOwner {
        maxAmount = maxAmount_;
        emit MaxAmountUpdated(maxAmount_);
    }

    function setBlocked(address account, bool isBlocked) external onlyOwner {
        blocked[account] = isBlocked;
        emit BlockedUpdated(account, isBlocked);
    }

    function validateSettlement(
        address provider,
        address consumer,
        address,
        uint256 amount,
        bytes32,
        bytes32
    ) external view override returns (bool allowed, bytes32 reasonCode) {
        if (blocked[provider]) return (false, bytes32("PROVIDER_BLOCKED"));
        if (blocked[consumer]) return (false, bytes32("CONSUMER_BLOCKED"));
        if (amount > maxAmount) return (false, bytes32("AMOUNT_EXCEEDS_MAX"));
        return (true, bytes32("ALLOW"));
    }
}
