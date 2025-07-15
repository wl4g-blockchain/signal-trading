// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// 模拟的 ERC20 代币合约，用于测试
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18); // 铸造 100 万个代币
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract VaultTest is Test {
    Vault public vault;
    MockERC20 public usdc;
    MockERC20 public usdt;
    MockERC20 public btc;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public executor = address(4);
    
    function setUp() public {
        // 部署模拟代币
        usdc = new MockERC20("USD Coin", "USDC");
        usdt = new MockERC20("Tether USD", "USDT");
        btc = new MockERC20("Bitcoin", "BTC");
        
        // 部署 Vault 合约
        vm.prank(owner);
        vault = new Vault(owner);
        
        // 设置支持的代币
        vm.startPrank(owner);
        vault.setSupportedTradingToken(address(btc), true);
        vm.stopPrank();
        
        // 给测试用户一些代币
        usdc.mint(user1, 10000 * 10**18);
        usdt.mint(user1, 10000 * 10**18);
        btc.mint(user1, 10 * 10**18);
        
        usdc.mint(user2, 10000 * 10**18);
        usdt.mint(user2, 10000 * 10**18);
    }
    
    function testDepositMargin() public {
        uint256 depositAmount = 1000 * 10**18;
        
        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.depositMargin(address(usdc), depositAmount);
        vm.stopPrank();
        
        assertEq(vault.getMarginBalance(user1, address(usdc)), depositAmount);
        assertEq(usdc.balanceOf(address(vault)), depositAmount);
    }
    
    function testWithdrawMargin() public {
        uint256 depositAmount = 1000 * 10**18;
        uint256 withdrawAmount = 500 * 10**18;
        
        // 先存入保证金
        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.depositMargin(address(usdc), depositAmount);
        
        // 提取保证金
        vault.withdrawMargin(address(usdc), withdrawAmount);
        vm.stopPrank();
        
        assertEq(vault.getMarginBalance(user1, address(usdc)), depositAmount - withdrawAmount);
        assertEq(usdc.balanceOf(address(vault)), depositAmount - withdrawAmount);
    }
    
    function testDepositTradingToken() public {
        uint256 depositAmount = 1 * 10**18;
        
        vm.startPrank(user1);
        btc.approve(address(vault), depositAmount);
        vault.depositTradingToken(address(btc), depositAmount);
        vm.stopPrank();
        
        assertEq(vault.getTradingBalance(user1, address(btc)), depositAmount);
        assertEq(btc.balanceOf(address(vault)), depositAmount);
    }
    
    function testEmergencyLock() public {
        uint256 depositAmount = 1000 * 10**18;
        
        // 先存入保证金
        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.depositMargin(address(usdc), depositAmount);
        
        // 设置紧急锁定
        vault.setEmergencyLock(true);
        
        // 尝试提取应该失败
        vm.expectRevert(Vault.UserEmergencyLocked.selector);
        vault.withdrawMargin(address(usdc), 100 * 10**18);
        
        // 解除锁定
        vault.setEmergencyLock(false);
        
        // 现在应该可以提取
        vault.withdrawMargin(address(usdc), 100 * 10**18);
        vm.stopPrank();
        
        assertEq(vault.getMarginBalance(user1, address(usdc)), depositAmount - 100 * 10**18);
    }
    
    function testAuthorizeExecutor() public {
        // 授权执行者
        vm.prank(owner);
        vault.setAuthorizedExecutor(executor, true);
        
        // 用户授权执行者
        vm.prank(user1);
        vault.authorizeExecutor(executor, true);
        
        // 存入一些保证金
        uint256 depositAmount = 1000 * 10**18;
        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.depositMargin(address(usdc), depositAmount);
        vm.stopPrank();
        
        // 执行者应该能够执行交易
        vm.prank(executor);
        vault.executeTradeTransfer(user1, address(usdc), 100 * 10**18, true);
        
        assertEq(vault.getMarginBalance(user1, address(usdc)), depositAmount - 100 * 10**18);
    }
    
    function testUnauthorizedExecutor() public {
        // 存入一些保证金
        uint256 depositAmount = 1000 * 10**18;
        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.depositMargin(address(usdc), depositAmount);
        vm.stopPrank();
        
        // 未授权的执行者应该不能执行交易
        vm.prank(executor);
        vm.expectRevert(Vault.UnauthorizedExecutor.selector);
        vault.executeTradeTransfer(user1, address(usdc), 100 * 10**18, true);
    }
    
    function testPauseUnpause() public {
        // 暂停合约
        vm.prank(owner);
        vault.pause();
        
        // 暂停状态下不能存入
        vm.startPrank(user1);
        usdc.approve(address(vault), 1000 * 10**18);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        vault.depositMargin(address(usdc), 1000 * 10**18);
        vm.stopPrank();
        
        // 恢复合约
        vm.prank(owner);
        vault.unpause();
        
        // 现在应该可以存入
        vm.startPrank(user1);
        vault.depositMargin(address(usdc), 1000 * 10**18);
        vm.stopPrank();
        
        assertEq(vault.getMarginBalance(user1, address(usdc)), 1000 * 10**18);
    }
    
    function testGetUserBalances() public {
        uint256 usdcAmount = 1000 * 10**18;
        uint256 usdtAmount = 2000 * 10**18;
        uint256 btcAmount = 1 * 10**18;
        
        vm.startPrank(user1);
        // 存入保证金
        usdc.approve(address(vault), usdcAmount);
        vault.depositMargin(address(usdc), usdcAmount);
        
        usdt.approve(address(vault), usdtAmount);
        vault.depositMargin(address(usdt), usdtAmount);
        
        // 存入交易代币
        btc.approve(address(vault), btcAmount);
        vault.depositTradingToken(address(btc), btcAmount);
        vm.stopPrank();
        
        // 批量获取余额
        address[] memory tokens = new address[](3);
        tokens[0] = address(usdc);
        tokens[1] = address(usdt);
        tokens[2] = address(btc);
        
        bool[] memory isMarginTokens = new bool[](3);
        isMarginTokens[0] = true;
        isMarginTokens[1] = true;
        isMarginTokens[2] = false;
        
        uint256[] memory balances = vault.getUserBalances(user1, tokens, isMarginTokens);
        
        assertEq(balances[0], usdcAmount);
        assertEq(balances[1], usdtAmount);
        assertEq(balances[2], btcAmount);
    }
    
    function testEmergencyWithdraw() public {
        uint256 depositAmount = 1000 * 10**18;
        
        // 用户存入代币
        vm.startPrank(user1);
        usdc.approve(address(vault), depositAmount);
        vault.depositMargin(address(usdc), depositAmount);
        vm.stopPrank();
        
        // 所有者进行紧急提取
        vm.prank(owner);
        vault.emergencyWithdraw(address(usdc), owner, depositAmount);
        
        assertEq(usdc.balanceOf(owner), depositAmount);
        assertEq(usdc.balanceOf(address(vault)), 0);
    }
    
    function testAdminForceUnlock() public {
        // 用户设置紧急锁定
        vm.prank(user1);
        vault.setEmergencyLock(true);
        
        assertTrue(vault.emergencyLocked(user1));
        
        // 管理员强制解锁
        vm.prank(owner);
        vault.adminForceUnlock(user1);
        
        assertFalse(vault.emergencyLocked(user1));
    }
} 