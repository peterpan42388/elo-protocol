// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

interface ISettlementEngineAdmin {
    function setRiskPolicy(address riskPolicy) external;
}

contract SetRiskPolicyScript is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address settlementEngine = vm.envAddress("SETTLEMENT_ENGINE_ADDR");
        address riskPolicy = vm.envAddress("RISK_POLICY_ADDR");

        vm.startBroadcast(deployerPk);
        ISettlementEngineAdmin(settlementEngine).setRiskPolicy(riskPolicy);
        vm.stopBroadcast();

        console2.log("Attached risk policy", riskPolicy, "to settlement", settlementEngine);
    }
}
