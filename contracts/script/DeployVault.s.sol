// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Vault.sol";

contract DeployVault is Script {
    function run() external {
        // 获取部署者的私钥
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // 开始广播交易
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署 Vault 合约
        // 这里传入部署者地址作为初始所有者
        address owner = vm.addr(deployerPrivateKey);
        Vault vault = new Vault(owner);
        
        console.log("Vault deployed to:", address(vault));
        console.log("Owner:", owner);
        
        vm.stopBroadcast();
    }
} 