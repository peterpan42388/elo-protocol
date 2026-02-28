// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {OwnerRegistry} from "../contracts/OwnerRegistry.sol";
import {ELOToken} from "../contracts/ELOToken.sol";
import {SettlementEngine} from "../contracts/SettlementEngine.sol";

contract DeployAndScenarioScript is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address consumer = vm.addr(deployerPk);
        address provider = vm.envOr("PROVIDER_ADDR", address(0x1000000000000000000000000000000000001001));

        uint256 initialMint = vm.envOr("INITIAL_MINT_WEI", uint256(1_000 ether));
        uint256 crossAmount = vm.envOr("CROSS_AMOUNT_WEI", uint256(10 ether));

        vm.startBroadcast(deployerPk);

        OwnerRegistry registry = new OwnerRegistry();
        ELOToken elo = new ELOToken();
        SettlementEngine settlement = new SettlementEngine(address(registry), address(elo));

        registry.registerAgent(provider, keccak256("owner-alpha"));
        registry.registerAgent(consumer, keccak256("owner-beta"));

        elo.mint(consumer, initialMint);
        elo.approve(address(settlement), type(uint256).max);

        settlement.settle(
            provider,
            consumer,
            crossAmount,
            keccak256("cross-owner-request-1"),
            keccak256("usage-cross")
        );

        uint256 providerAfterCross = elo.balanceOf(provider);
        uint256 consumerAfterCross = elo.balanceOf(consumer);

        require(providerAfterCross == crossAmount, "cross settlement transfer mismatch");
        require(consumerAfterCross == initialMint - crossAmount, "cross settlement debit mismatch");

        // Re-map consumer to same owner only for demonstration: same-owner settlement must be free.
        registry.registerAgent(consumer, keccak256("owner-alpha"));

        settlement.settle(
            provider,
            consumer,
            crossAmount,
            keccak256("same-owner-request-1"),
            keccak256("usage-same")
        );

        require(elo.balanceOf(provider) == providerAfterCross, "same-owner should not transfer");
        require(elo.balanceOf(consumer) == consumerAfterCross, "same-owner should not debit");

        vm.stopBroadcast();

        console2.log("OwnerRegistry:", address(registry));
        console2.log("ELOToken:", address(elo));
        console2.log("SettlementEngine:", address(settlement));
        console2.log("Provider:", provider);
        console2.log("Consumer (deployer):", consumer);
        console2.log("Provider balance after scenario:", providerAfterCross);
        console2.log("Consumer balance after scenario:", consumerAfterCross);
    }
}
