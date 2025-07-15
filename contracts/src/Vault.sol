// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Vault
 * @dev 交易金库合约，用于管理用户的保证金和交易资产
 * 支持 ERC20 代币（USDC、USDT）作为保证金
 * 支持存储交易获得的代币余额（BTC、ETH、SOL、BNB、PUMP 等）
 * 包含授权系统、紧急锁定功能
 * 注：当前版本为非可升级版本，如需升级功能请使用代理模式部署
 */
contract Vault is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // 合约版本
    uint256 public constant VERSION = 1;

    // 主网代币地址 - 请在部署时验证这些地址
    address public constant USDC = 0xa0b86a33E6441E6b421d8bb5fB9Ca9336b3AE695; // USDC 主网地址
    address public constant USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7; // USDT 主网地址
    
    // 支持的保证金代币
    mapping(address => bool) public supportedMarginTokens;
    
    // 支持的交易代币
    mapping(address => bool) public supportedTradingTokens;
    
    // 用户保证金余额 user => token => balance
    mapping(address => mapping(address => uint256)) public marginBalances;
    
    // 用户交易代币余额 user => token => balance
    mapping(address => mapping(address => uint256)) public tradingBalances;
    
    // 用户紧急锁定状态
    mapping(address => bool) public emergencyLocked;
    
    // 授权的交易执行者
    mapping(address => bool) public authorizedExecutors;
    
    // 用户授权的交易执行者
    mapping(address => mapping(address => bool)) public userAuthorizedExecutors;
    
    // 用户冻结余额（紧急锁定时使用）
    mapping(address => mapping(address => uint256)) public frozenBalances;

    // 事件定义
    event MarginDeposited(address indexed user, address indexed token, uint256 amount);
    event MarginWithdrawn(address indexed user, address indexed token, uint256 amount);
    event TradingTokenDeposited(address indexed user, address indexed token, uint256 amount);
    event TradingTokenWithdrawn(address indexed user, address indexed token, uint256 amount);
    event ExecutorAuthorized(address indexed executor, bool authorized);
    event UserExecutorAuthorized(address indexed user, address indexed executor, bool authorized);
    event EmergencyLocked(address indexed user, bool locked);
    event TokenSupported(address indexed token, bool isMarginToken, bool supported);
    event TradeExecuted(address indexed user, address indexed executor, address indexed token, uint256 amount);

    // 错误定义
    error TokenNotSupported();
    error InsufficientBalance();
    error UnauthorizedExecutor();
    error UserEmergencyLocked();
    error InvalidTokenAddress();
    error InvalidAmount();

    /**
     * @dev 构造函数
     * @param _owner 合约所有者
     */
    constructor(address _owner) Ownable(_owner) {
        // 设置支持的保证金代币
        supportedMarginTokens[USDC] = true;
        supportedMarginTokens[USDT] = true;

        emit TokenSupported(USDC, true, true);
        emit TokenSupported(USDT, true, true);
    }

    /**
     * @dev 仅授权的交易执行者可以调用
     */
    modifier onlyAuthorizedExecutor() {
        if (!authorizedExecutors[msg.sender]) {
            revert UnauthorizedExecutor();
        }
        _;
    }

    /**
     * @dev 检查用户是否被紧急锁定
     */
    modifier notEmergencyLocked(address user) {
        if (emergencyLocked[user]) {
            revert UserEmergencyLocked();
        }
        _;
    }

    /**
     * @dev 存入保证金
     * @param token 代币地址
     * @param amount 数量
     */
    function depositMargin(address token, uint256 amount) 
        external 
        whenNotPaused 
        nonReentrant 
        notEmergencyLocked(msg.sender)
    {
        if (!supportedMarginTokens[token]) {
            revert TokenNotSupported();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        marginBalances[msg.sender][token] += amount;

        emit MarginDeposited(msg.sender, token, amount);
    }

    /**
     * @dev 提取保证金
     * @param token 代币地址
     * @param amount 数量
     */
    function withdrawMargin(address token, uint256 amount) 
        external 
        whenNotPaused 
        nonReentrant 
        notEmergencyLocked(msg.sender)
    {
        if (!supportedMarginTokens[token]) {
            revert TokenNotSupported();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        uint256 availableBalance = marginBalances[msg.sender][token] - frozenBalances[msg.sender][token];
        if (availableBalance < amount) {
            revert InsufficientBalance();
        }

        marginBalances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit MarginWithdrawn(msg.sender, token, amount);
    }

    /**
     * @dev 存入交易代币
     * @param token 代币地址
     * @param amount 数量
     */
    function depositTradingToken(address token, uint256 amount) 
        external 
        whenNotPaused 
        nonReentrant 
        notEmergencyLocked(msg.sender)
    {
        if (!supportedTradingTokens[token]) {
            revert TokenNotSupported();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        tradingBalances[msg.sender][token] += amount;

        emit TradingTokenDeposited(msg.sender, token, amount);
    }

    /**
     * @dev 提取交易代币
     * @param token 代币地址
     * @param amount 数量
     */
    function withdrawTradingToken(address token, uint256 amount) 
        external 
        whenNotPaused 
        nonReentrant 
        notEmergencyLocked(msg.sender)
    {
        if (!supportedTradingTokens[token]) {
            revert TokenNotSupported();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        uint256 availableBalance = tradingBalances[msg.sender][token] - frozenBalances[msg.sender][token];
        if (availableBalance < amount) {
            revert InsufficientBalance();
        }

        tradingBalances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit TradingTokenWithdrawn(msg.sender, token, amount);
    }

    /**
     * @dev 交易执行者执行交易（用于扣除保证金或转移交易代币）
     * @param user 用户地址
     * @param token 代币地址
     * @param amount 数量
     * @param isMarginToken 是否为保证金代币
     */
    function executeTradeTransfer(
        address user,
        address token,
        uint256 amount,
        bool isMarginToken
    ) external onlyAuthorizedExecutor whenNotPaused notEmergencyLocked(user) {
        if (amount == 0) {
            revert InvalidAmount();
        }
        
        // 检查用户是否授权当前执行者
        if (!userAuthorizedExecutors[user][msg.sender]) {
            revert UnauthorizedExecutor();
        }

        if (isMarginToken) {
            if (!supportedMarginTokens[token]) {
                revert TokenNotSupported();
            }
            
            uint256 availableBalance = marginBalances[user][token] - frozenBalances[user][token];
            if (availableBalance < amount) {
                revert InsufficientBalance();
            }
            
            marginBalances[user][token] -= amount;
        } else {
            if (!supportedTradingTokens[token]) {
                revert TokenNotSupported();
            }
            
            uint256 availableBalance = tradingBalances[user][token] - frozenBalances[user][token];
            if (availableBalance < amount) {
                revert InsufficientBalance();
            }
            
            tradingBalances[user][token] -= amount;
        }

        emit TradeExecuted(user, msg.sender, token, amount);
    }

    /**
     * @dev 用户设置紧急锁定状态
     * @param locked 是否锁定
     */
    function setEmergencyLock(bool locked) external {
        emergencyLocked[msg.sender] = locked;
        
        if (locked) {
            // 锁定时冻结所有余额
            _freezeUserBalances(msg.sender);
        } else {
            // 解锁时解冻所有余额
            _unfreezeUserBalances(msg.sender);
        }
        
        emit EmergencyLocked(msg.sender, locked);
    }

    /**
     * @dev 用户授权交易执行者
     * @param executor 执行者地址
     * @param authorized 是否授权
     */
    function authorizeExecutor(address executor, bool authorized) external {
        userAuthorizedExecutors[msg.sender][executor] = authorized;
        emit UserExecutorAuthorized(msg.sender, executor, authorized);
    }

    /**
     * @dev 管理员设置全局授权的交易执行者
     * @param executor 执行者地址
     * @param authorized 是否授权
     */
    function setAuthorizedExecutor(address executor, bool authorized) external onlyOwner {
        authorizedExecutors[executor] = authorized;
        emit ExecutorAuthorized(executor, authorized);
    }

    /**
     * @dev 管理员设置支持的保证金代币
     * @param token 代币地址
     * @param supported 是否支持
     */
    function setSupportedMarginToken(address token, bool supported) external onlyOwner {
        if (token == address(0)) {
            revert InvalidTokenAddress();
        }
        supportedMarginTokens[token] = supported;
        emit TokenSupported(token, true, supported);
    }

    /**
     * @dev 管理员设置支持的交易代币
     * @param token 代币地址
     * @param supported 是否支持
     */
    function setSupportedTradingToken(address token, bool supported) external onlyOwner {
        if (token == address(0)) {
            revert InvalidTokenAddress();
        }
        supportedTradingTokens[token] = supported;
        emit TokenSupported(token, false, supported);
    }

    /**
     * @dev 管理员暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev 管理员恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev 获取用户保证金余额
     * @param user 用户地址
     * @param token 代币地址
     * @return 余额
     */
    function getMarginBalance(address user, address token) external view returns (uint256) {
        return marginBalances[user][token];
    }

    /**
     * @dev 获取用户交易代币余额
     * @param user 用户地址
     * @param token 代币地址
     * @return 余额
     */
    function getTradingBalance(address user, address token) external view returns (uint256) {
        return tradingBalances[user][token];
    }

    /**
     * @dev 获取用户可用余额（扣除冻结余额）
     * @param user 用户地址
     * @param token 代币地址
     * @param isMarginToken 是否为保证金代币
     * @return 可用余额
     */
    function getAvailableBalance(address user, address token, bool isMarginToken) external view returns (uint256) {
        uint256 totalBalance = isMarginToken ? marginBalances[user][token] : tradingBalances[user][token];
        uint256 frozen = frozenBalances[user][token];
        return totalBalance > frozen ? totalBalance - frozen : 0;
    }

    /**
     * @dev 获取合约中代币的总余额
     * @param token 代币地址
     * @return 总余额
     */
    function getTotalTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    /**
     * @dev 批量获取用户在多个代币中的余额
     * @param user 用户地址
     * @param tokens 代币地址数组
     * @param isMarginTokens 是否为保证金代币数组
     * @return balances 余额数组
     */
    function getUserBalances(
        address user, 
        address[] calldata tokens, 
        bool[] calldata isMarginTokens
    ) external view returns (uint256[] memory balances) {
        require(tokens.length == isMarginTokens.length, "Array lengths mismatch");
        
        balances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            balances[i] = isMarginTokens[i] 
                ? marginBalances[user][tokens[i]] 
                : tradingBalances[user][tokens[i]];
        }
    }

    /**
     * @dev 冻结用户所有余额
     * @param user 用户地址
     */
    function _freezeUserBalances(address user) internal {
        // 冻结保证金代币余额
        frozenBalances[user][USDC] = marginBalances[user][USDC];
        frozenBalances[user][USDT] = marginBalances[user][USDT];
        
        // 这里可以扩展为冻结用户的所有代币余额
        // 为了简化，目前只冻结主要的保证金代币
    }

    /**
     * @dev 解冻用户所有余额
     * @param user 用户地址
     */
    function _unfreezeUserBalances(address user) internal {
        // 清空冻结余额
        frozenBalances[user][USDC] = 0;
        frozenBalances[user][USDT] = 0;
    }

    /**
     * @dev 紧急提取函数（仅所有者，用于紧急情况）
     * @param token 代币地址
     * @param to 接收地址
     * @param amount 数量
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }

    /**
     * @dev 管理员强制解锁用户（紧急情况）
     * @param user 用户地址
     */
    function adminForceUnlock(address user) external onlyOwner {
        emergencyLocked[user] = false;
        _unfreezeUserBalances(user);
        emit EmergencyLocked(user, false);
    }
} 