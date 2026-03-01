// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {OwnerRegistry} from "../contracts/OwnerRegistry.sol";
import {ELOToken} from "../contracts/ELOToken.sol";
import {SettlementEngine} from "../contracts/SettlementEngine.sol";

contract DeployCoreOnlyScript is Script {
    function run()
        external
        returns (address ownerRegistryAddr, address eloAddr, address settlementAddr, address provider, address consumer)
    {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        consumer = vm.envOr("CONSUMER_ADDR", vm.addr(deployerPk));
        provider = vm.envOr("PROVIDER_ADDR", address(0x1000000000000000000000000000000000001001));

        uint256 initialMint = vm.envOr("INITIAL_MINT_WEI", uint256(1_000 ether));

        vm.startBroadcast(deployerPk);

        OwnerRegistry registry = new OwnerRegistry();
        ELOToken elo = new ELOToken();
        SettlementEngine settlement = new SettlementEngine(address(registry), address(elo));

        registry.registerAgent(provider, keccak256("owner-alpha"));
        registry.registerAgent(consumer, keccak256("owner-beta"));

        elo.mint(consumer, initialMint);
        if (consumer == vm.addr(deployerPk)) {
            elo.approve(address(settlement), type(uint256).max);
        }

        vm.stopBroadcast();

        console2.log("OwnerRegistry:", address(registry));
        console2.log("ELOToken:", address(elo));
        console2.log("SettlementEngine:", address(settlement));
        console2.log("Provider:", provider);
        console2.log("Consumer:", consumer);

        return (address(registry), address(elo), address(settlement), provider, consumer);
    }
}
