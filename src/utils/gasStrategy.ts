import { ethers } from 'ethers';

export interface GasStrategyConfig {
  gasStrategy: 'slow' | 'standard' | 'fast' | 'custom';
  customGasPrice?: number; // in Gwei
}

export interface NetworkGasInfo {
  baseGasPrice: number; // in Gwei
  maxPriorityFeePerGas: number; // in Gwei (for EIP-1559)
  maxFeePerGas: number; // in Gwei (for EIP-1559)
}

/**
 * Gas Price Strategy Implementation
 * 
 * 这个文件演示了如何在实际的交易发送中使用 Gas Price Strategy
 */
export class GasStrategy {
  private provider: ethers.providers.Provider;

  constructor(provider: ethers.providers.Provider) {
    this.provider = provider;
  }

  /**
   * 根据策略计算 Gas Price
   * @param strategy Gas 策略配置
   * @returns Gas 价格信息
   */
  async calculateGasPrice(strategy: GasStrategyConfig): Promise<{
    gasPrice?: ethers.BigNumber;
    maxFeePerGas?: ethers.BigNumber;
    maxPriorityFeePerGas?: ethers.BigNumber;
  }> {
    // 获取网络当前的 Gas 信息
    const networkGasInfo = await this.getNetworkGasInfo();
    
    let gasPrice: number; // in Gwei
    
    switch (strategy.gasStrategy) {
      case 'slow':
        // 慢速：使用基础价格的 80%，适合不着急的交易
        gasPrice = networkGasInfo.baseGasPrice * 0.8;
        break;
        
      case 'standard':
        // 标准：使用基础价格，大多数情况下的选择
        gasPrice = networkGasInfo.baseGasPrice * 1.0;
        break;
        
      case 'fast':
        // 快速：使用基础价格的 150%，适合急需确认的交易
        gasPrice = networkGasInfo.baseGasPrice * 1.5;
        break;
        
      case 'custom':
        // 自定义：用户指定的 Gas 价格
        gasPrice = strategy.customGasPrice || networkGasInfo.baseGasPrice;
        break;
        
      default:
        gasPrice = networkGasInfo.baseGasPrice;
    }

    // 转换为 Wei
    const gasPriceWei = ethers.utils.parseUnits(gasPrice.toString(), 'gwei');
    
    // 检查是否支持 EIP-1559 (Type 2 transactions)
    const isEIP1559Supported = await this.checkEIP1559Support();
    
    if (isEIP1559Supported) {
      // 使用 EIP-1559 格式 (Ethereum Mainnet, Polygon 等)
      const maxPriorityFeePerGas = ethers.utils.parseUnits(
        (networkGasInfo.maxPriorityFeePerGas * this.getMultiplier(strategy.gasStrategy)).toString(),
        'gwei'
      );
      const maxFeePerGas = ethers.utils.parseUnits(
        (networkGasInfo.maxFeePerGas * this.getMultiplier(strategy.gasStrategy)).toString(),
        'gwei'
      );
      
      return {
        maxFeePerGas,
        maxPriorityFeePerGas
      };
    } else {
      // 使用传统格式 (BSC, older networks)
      return {
        gasPrice: gasPriceWei
      };
    }
  }

  /**
   * 在交易发送时使用 Gas Strategy
   * @param transaction 交易对象
   * @param strategy Gas 策略
   * @param signer 签名者
   * @returns 交易回执
   */
  async sendTransactionWithGasStrategy(
    transaction: ethers.providers.TransactionRequest,
    strategy: GasStrategyConfig,
    signer: ethers.Signer
  ): Promise<ethers.providers.TransactionResponse> {
    
    // 1. 计算 Gas Price
    const gasConfig = await this.calculateGasPrice(strategy);
    
    // 2. 估算 Gas Limit
    const gasLimit = await signer.estimateGas(transaction);
    
    // 3. 构建最终交易
    const finalTransaction = {
      ...transaction,
      gasLimit: gasLimit.mul(110).div(100), // 增加 10% 的 Gas Limit 缓冲
      ...gasConfig // 应用 Gas 价格配置
    };

    // 4. 发送交易
    console.log(`发送交易使用 ${strategy.gasStrategy} Gas 策略:`, {
      gasLimit: finalTransaction.gasLimit?.toString(),
      gasPrice: gasConfig.gasPrice?.toString(),
      maxFeePerGas: gasConfig.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: gasConfig.maxPriorityFeePerGas?.toString()
    });

    return await signer.sendTransaction(finalTransaction);
  }

  /**
   * 获取网络当前的 Gas 信息
   */
  private async getNetworkGasInfo(): Promise<NetworkGasInfo> {
    try {
      // 获取当前 Gas 价格
      const gasPrice = await this.provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
      
      // 尝试获取 EIP-1559 信息
      try {
        const feeData = await this.provider.getFeeData();
        
        return {
          baseGasPrice: gasPriceGwei,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas 
            ? parseFloat(ethers.utils.formatUnits(feeData.maxPriorityFeePerGas, 'gwei'))
            : gasPriceGwei * 0.1,
          maxFeePerGas: feeData.maxFeePerGas
            ? parseFloat(ethers.utils.formatUnits(feeData.maxFeePerGas, 'gwei'))
            : gasPriceGwei * 2
        };
      } catch {
        // 如果不支持 EIP-1559，返回基础信息
        return {
          baseGasPrice: gasPriceGwei,
          maxPriorityFeePerGas: gasPriceGwei * 0.1,
          maxFeePerGas: gasPriceGwei * 2
        };
      }
    } catch (error) {
      console.error('获取网络 Gas 信息失败:', error);
      // 返回默认值
      return {
        baseGasPrice: 20, // 20 Gwei
        maxPriorityFeePerGas: 2, // 2 Gwei
        maxFeePerGas: 40 // 40 Gwei
      };
    }
  }

  /**
   * 检查网络是否支持 EIP-1559
   */
  private async checkEIP1559Support(): Promise<boolean> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.maxFeePerGas !== null && feeData.maxPriorityFeePerGas !== null;
    } catch {
      return false;
    }
  }

  /**
   * 根据策略获取价格倍数
   */
  private getMultiplier(strategy: string): number {
    switch (strategy) {
      case 'slow': return 0.8;
      case 'standard': return 1.0;
      case 'fast': return 1.5;
      default: return 1.0;
    }
  }
}

/**
 * 使用示例：
 * 
 * // 1. 初始化 Gas Strategy
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');
 * const gasStrategy = new GasStrategy(provider);
 * 
 * // 2. 配置 Gas 策略
 * const strategyConfig: GasStrategyConfig = {
 *   gasStrategy: 'standard', // 或 'slow', 'fast', 'custom'
 *   customGasPrice: 25 // 仅在 'custom' 时使用
 * };
 * 
 * // 3. 发送交易
 * const transaction = {
 *   to: '0x...',
 *   value: ethers.utils.parseEther('0.1'),
 *   data: '0x...'
 * };
 * 
 * const txResponse = await gasStrategy.sendTransactionWithGasStrategy(
 *   transaction,
 *   strategyConfig,
 *   signer
 * );
 * 
 * // 4. 等待确认
 * const receipt = await txResponse.wait();
 * console.log('交易确认:', receipt.transactionHash);
 */

export default GasStrategy; 