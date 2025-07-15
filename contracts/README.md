# Vault 合约 - 交易金库系统

## 概述

Vault 合约是一个专为交易系统设计的金库合约，用于管理用户的保证金和交易资产。该合约支持 ERC20 代币存储、授权系统、紧急锁定功能等。

## 主要功能

### 1. 保证金管理
- 支持 USDC、USDT 作为保证金代币
- 用户可以存入和提取保证金
- 支持冻结余额功能

### 2. 交易代币管理
- 支持存储交易获得的代币（如 BTC、ETH、SOL、BNB 等）
- 灵活的代币配置系统
- 独立的余额管理

### 3. 授权系统
- 双重授权机制：管理员授权 + 用户授权
- 交易执行者只有在获得两层授权后才能执行交易
- 支持动态授权管理

### 4. 紧急锁定功能
- 用户可以主动锁定自己的账户
- 锁定期间所有余额被冻结
- 管理员可以强制解锁（紧急情况）

### 5. 安全功能
- 基于 OpenZeppelin 的安全合约
- 重入保护
- 暂停/恢复功能
- 所有者权限管理

## 合约架构

```
Vault
├── Ownable2Step (所有者权限管理)
├── Pausable (暂停功能)
├── ReentrancyGuard (重入保护)
└── SafeERC20 (安全的 ERC20 操作)
```

## 主要接口

### 保证金操作
```solidity
function depositMargin(address token, uint256 amount) external;
function withdrawMargin(address token, uint256 amount) external;
function getMarginBalance(address user, address token) external view returns (uint256);
```

### 交易代币操作
```solidity
function depositTradingToken(address token, uint256 amount) external;
function withdrawTradingToken(address token, uint256 amount) external;
function getTradingBalance(address user, address token) external view returns (uint256);
```

### 授权管理
```solidity
function setAuthorizedExecutor(address executor, bool authorized) external; // 管理员调用
function authorizeExecutor(address executor, bool authorized) external; // 用户调用
```

### 紧急锁定
```solidity
function setEmergencyLock(bool locked) external;
function adminForceUnlock(address user) external; // 管理员调用
```

### 交易执行
```solidity
function executeTradeTransfer(
    address user,
    address token,
    uint256 amount,
    bool isMarginToken
) external;
```

## 部署说明

### 1. 环境准备
```bash
# 安装依赖
forge install

# 编译合约
forge build

# 运行测试
forge test
```

### 2. 部署合约
```bash
# 设置环境变量
export PRIVATE_KEY=your_private_key
export RPC_URL=your_rpc_url

# 部署到测试网
forge script script/DeployVault.s.sol --rpc-url $RPC_URL --broadcast
```

### 3. 验证合约
```bash
forge verify-contract <contract_address> src/Vault.sol:Vault --etherscan-api-key <api_key>
```

## 配置说明

### 支持的代币配置
部署后需要配置支持的代币：

```solidity
// 添加保证金代币
vault.setSupportedMarginToken(USDC_ADDRESS, true);
vault.setSupportedMarginToken(USDT_ADDRESS, true);

// 添加交易代币
vault.setSupportedTradingToken(BTC_ADDRESS, true);
vault.setSupportedTradingToken(ETH_ADDRESS, true);
```

### 交易执行者配置
```solidity
// 管理员授权交易执行者
vault.setAuthorizedExecutor(EXECUTOR_ADDRESS, true);

// 用户授权交易执行者
vault.authorizeExecutor(EXECUTOR_ADDRESS, true);
```

## 使用流程

### 1. 用户存入保证金
```solidity
// 用户批准代币转移
IERC20(USDC).approve(vault, amount);

// 存入保证金
vault.depositMargin(USDC, amount);
```

### 2. 交易执行
```solidity
// 交易执行者扣除保证金
vault.executeTradeTransfer(user, USDC, amount, true);
```

### 3. 紧急锁定
```solidity
// 用户主动锁定
vault.setEmergencyLock(true);

// 解除锁定
vault.setEmergencyLock(false);
```

## 安全考虑

### 1. 权限管理
- 仅合约所有者可以添加/移除支持的代币
- 仅合约所有者可以全局授权交易执行者
- 用户只能管理自己的授权

### 2. 资金安全
- 所有资金操作都有重入保护
- 紧急锁定功能保护用户资金
- 管理员紧急提取功能（仅紧急情况）

### 3. 升级考虑
- 当前版本为非可升级版本
- 如需升级功能，建议使用代理模式重新部署
- 所有关键状态都可以导出和迁移

## 测试

合约包含完整的测试套件，覆盖所有主要功能：

```bash
# 运行所有测试
forge test

# 运行详细测试
forge test -vvv

# 运行特定测试
forge test --match-test testDepositMargin
```

## 事件日志

合约发出以下事件用于监控：

```solidity
event MarginDeposited(address indexed user, address indexed token, uint256 amount);
event MarginWithdrawn(address indexed user, address indexed token, uint256 amount);
event TradingTokenDeposited(address indexed user, address indexed token, uint256 amount);
event TradingTokenWithdrawn(address indexed user, address indexed token, uint256 amount);
event ExecutorAuthorized(address indexed executor, bool authorized);
event UserExecutorAuthorized(address indexed user, address indexed executor, bool authorized);
event EmergencyLocked(address indexed user, bool locked);
event TokenSupported(address indexed token, bool isMarginToken, bool supported);
event TradeExecuted(address indexed user, address indexed executor, address indexed token, uint256 amount);
```

## 注意事项

1. **代币地址验证**: 部署前请验证 USDC、USDT 等代币地址的正确性
2. **授权管理**: 确保只授权信任的交易执行者
3. **资金监控**: 建议监控合约事件，跟踪所有资金流动
4. **紧急响应**: 准备紧急情况下的响应方案
5. **定期审计**: 建议定期进行安全审计

## 版本信息

- 当前版本: 1.0.0
- Solidity 版本: ^0.8.19
- OpenZeppelin 版本: ^4.9.0
- 许可证: MIT
