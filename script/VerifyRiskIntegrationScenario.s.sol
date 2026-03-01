// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

interface ISettlementEngine {
    function settle(
        address provider,
        address consumer,
        uint256 amount,
        bytes32 requestId,
        bytes32 usageRef
    ) external;
}

interface IAdaptiveRiskPolicyAdmin {
    function setConsumerBlocked(address consumer, bool blocked) external;
}

interface IRiskPolicyRead {
    function validateSettlement(
        address provider,
        address consumer,
        address caller,
        uint256 amount,
        bytes32 requestId,
        bytes32 usageRef
    ) external view returns (bool allowed, bytes32 reasonCode);
}

contract VerifyRiskIntegrationScenarioScript is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address settlementEngine = vm.envAddress("SETTLEMENT_ENGINE_ADDR");
        address riskPolicy = vm.envAddress("RISK_POLICY_ADDR");
        address provider = vm.envAddress("PROVIDER_ADDR");
        address consumer = vm.envOr("CONSUMER_ADDR", vm.addr(deployerPk));

        uint256 amount = vm.envOr("VERIFY_SETTLE_AMOUNT_WEI", uint256(10 ether));

        require(consumer == vm.addr(deployerPk), "consumer must match deployer for this script");

        vm.startBroadcast(deployerPk);

        // 1) Allowed settlement
        ISettlementEngine(settlementEngine).settle(
            provider,
            consumer,
            amount,
            keccak256("risk-integration-allow-1"),
            keccak256("usage-allow")
        );

        // 2) Block consumer in policy
        IAdaptiveRiskPolicyAdmin(riskPolicy).setConsumerBlocked(consumer, true);

        // 3) Validate denied path through policy view check (no failing tx broadcast).
        (bool allowed, bytes32 reasonCode) = IRiskPolicyRead(riskPolicy).validateSettlement(
            provider,
            consumer,
            consumer,
            amount,
            keccak256("risk-integration-deny-1"),
            keccak256("usage-deny")
        );
        require(!allowed, "blocked settlement should be denied");
        require(reasonCode == bytes32("CONSUMER_BLOCKED"), "unexpected deny reason");

        // 4) Unblock then allow again
        IAdaptiveRiskPolicyAdmin(riskPolicy).setConsumerBlocked(consumer, false);
        ISettlementEngine(settlementEngine).settle(
            provider,
            consumer,
            amount,
            keccak256("risk-integration-allow-2"),
            keccak256("usage-allow-2")
        );

        vm.stopBroadcast();

        console2.log("Risk integration scenario passed for settlement", settlementEngine);
    }
}
