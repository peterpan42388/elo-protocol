// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {AdaptiveRiskPolicy} from "../src/AdaptiveRiskPolicy.sol";

contract DeployAdaptiveRiskPolicyScript is Script {
    function run() external returns (address) {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address settlementEngine = vm.envAddress("SETTLEMENT_ENGINE_ADDR");

        uint256 windowSize = vm.envOr("RISK_WINDOW_SIZE", uint256(3600));
        uint256 baseMaxAmount = vm.envOr("RISK_BASE_MAX_AMOUNT", uint256(100 ether));
        uint256 maxTxPerWindow = vm.envOr("RISK_MAX_TX_PER_WINDOW", uint256(50));
        uint256 highRiskUsageThreshold = vm.envOr("RISK_HIGH_USAGE_THRESHOLD", uint256(500 ether));
        uint256 highRiskMaxMultiplierBps = vm.envOr("RISK_HIGH_USAGE_MULTIPLIER_BPS", uint256(5000));

        vm.startBroadcast(deployerPk);

        AdaptiveRiskPolicy policy = new AdaptiveRiskPolicy(
            settlementEngine,
            windowSize,
            baseMaxAmount,
            maxTxPerWindow,
            highRiskUsageThreshold,
            highRiskMaxMultiplierBps
        );

        vm.stopBroadcast();

        console2.log("AdaptiveRiskPolicy:", address(policy));
        return address(policy);
    }
}
