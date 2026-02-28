// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRiskPolicy {
    function validateSettlement(
        address provider,
        address consumer,
        address initiator,
        uint256 amount,
        bytes32 requestId,
        bytes32 usageRef
    ) external view returns (bool allowed, bytes32 reasonCode);
}
