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
    // Get current network gas information
    const networkGasInfo = await this.getNetworkGasInfo();
    
    let gasPrice: number; // in Gwei
    
    switch (strategy.gasStrategy) {
      case 'slow':
        // Slow: Use 80% of base price, suitable for non-urgent transactions
        gasPrice = networkGasInfo.baseGasPrice * 0.8;
        break;
        
      case 'standard':
        // Standard: Use base price, choice for most situations
        gasPrice = networkGasInfo.baseGasPrice * 1.0;
        break;
        
      case 'fast':
        // Fast: Use 150% of base price, suitable for urgent transactions
        gasPrice = networkGasInfo.baseGasPrice * 1.5;
        break;
        
      case 'custom':
        // Custom: User-specified gas price
        gasPrice = strategy.customGasPrice || networkGasInfo.baseGasPrice;
        break;
        
      default:
        gasPrice = networkGasInfo.baseGasPrice;
    }

    // Convert to Wei
    const gasPriceWei = ethers.utils.parseUnits(gasPrice.toString(), 'gwei');
    
    // Check if EIP-1559 is supported (Type 2 transactions)
    const isEIP1559Supported = await this.checkEIP1559Support();
    
    if (isEIP1559Supported) {
      // Use EIP-1559 format (Ethereum Mainnet, Polygon, etc.)
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
      // Use legacy format (BSC, older networks)
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
    
    // 1. Calculate Gas Price
    const gasConfig = await this.calculateGasPrice(strategy);
    
    // 2. Estimate Gas Limit
    const gasLimit = await signer.estimateGas(transaction);
    
    // 3. Build final transaction
    const finalTransaction = {
      ...transaction,
              gasLimit: gasLimit.mul(110).div(100), // Add 10% gas limit buffer
              ...gasConfig // Apply gas price configuration
    };

    // 4. Send transaction
            console.log(`Sending transaction using ${strategy.gasStrategy} gas strategy:`, {
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
      // Get current gas price
      const gasPrice = await this.provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
      
      // Try to get EIP-1559 information
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
        // If EIP-1559 is not supported, return basic information
        return {
          baseGasPrice: gasPriceGwei,
          maxPriorityFeePerGas: gasPriceGwei * 0.1,
          maxFeePerGas: gasPriceGwei * 2
        };
      }
    } catch (error) {
              console.error('Failed to get network gas information:', error);
      // Return default values
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
 * // 1. Initialize Gas Strategy
 * const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');
 * const gasStrategy = new GasStrategy(provider);
 * 
 * // 2. Configure Gas Strategy
 * const strategyConfig: GasStrategyConfig = {
 *   gasStrategy: 'standard', // or 'slow', 'fast', 'custom'
 *   customGasPrice: 25 // Only used when 'custom'
 * };
 * 
 * // 3. Send Transaction
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
 * // 4. Wait for Confirmation
 * const receipt = await txResponse.wait();
 * console.log('Transaction confirmed:', receipt.transactionHash);
 */

export default GasStrategy; 