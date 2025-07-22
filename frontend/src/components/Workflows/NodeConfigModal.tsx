import React, { useState } from 'react';
import { ComponentNode } from '../../types';
import { COMPONENT_TYPES } from '../../types/WorkflowTypes';
import { Save, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface NodeConfigModalProps {
  node: ComponentNode;
  onSave: (node: ComponentNode) => void;
  onClose: () => void;
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = ({ node, onSave, onClose }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  // Unified function to get vault address by chain
  const getVaultAddress = (chain: string, customVaultAddress?: string) => {
    switch (chain) {
      case 'mainnet':
        return '0x742d35Cc6634C0532925a3b8D401d2EdC8d4a5b1';
      case 'goerli':
        return '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e';
      case 'sepolia':
        return '0xb7f8BC63BbcaD18155201308C8f3540b07f84F5e';
      case 'polygon':
        return '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
      case 'bsc':
        return '0x55d398326f99059fF775485246999027B3197955';
      case 'custom':
        return customVaultAddress || '';
      default:
        return '0x742d35Cc6634C0532925a3b8D401d2EdC8d4a5b1';
    }
  };

  // Initialize configuration with correct vault address and DEX config for executor nodes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getInitialConfig = (): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseConfig = (node.config || {}) as Record<string, any>;

    if (node.type === COMPONENT_TYPES.EVM_TRADE_EXECUTOR) {
      const chain = baseConfig.rpcEndpoint || 'mainnet';
      const needsVaultAddress = !baseConfig.vaultAddress;
      const needsDexConfig = !baseConfig.targetDex || !baseConfig.dexAddress;

      if (needsVaultAddress || needsDexConfig) {
        // Get default DEX configuration - select enabled mainstream DEXs
        const getDefaultDex = (chain: string) => {
          switch (chain) {
            case 'mainnet':
            case 'goerli':
            case 'sepolia':
              return {
                targetDex: 'uniswap-v4',
                dexAddress: '0x0000000000000000000000000000000000000000',
              };
            case 'polygon':
              return {
                targetDex: 'quickswap',
                dexAddress: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
              };
            case 'bsc':
              return {
                targetDex: 'pancakeswap',
                dexAddress: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
              };
            default:
              return {
                targetDex: 'uniswap-v4',
                dexAddress: '0x0000000000000000000000000000000000000000',
              };
          }
        };

        const defaultDex = getDefaultDex(chain);
        return {
          ...baseConfig,
          vaultAddress: needsVaultAddress ? getVaultAddress(chain, baseConfig.customVaultAddress) : baseConfig.vaultAddress,
          targetDex: needsDexConfig ? defaultDex.targetDex : baseConfig.targetDex,
          dexAddress: needsDexConfig ? defaultDex.dexAddress : baseConfig.dexAddress,
          allowedTradingPairs: baseConfig.allowedTradingPairs || ['WETH/USDC', 'WETH/USDT'],
        };
      }
    }

    return baseConfig;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<Record<string, any>>(getInitialConfig());

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: { ...config },
    };
    onSave(updatedNode);
  };

  const renderTwitterFeedConfig = () => {
    return (
      <div className="space-y-4">
        {/* Data Collection Mode */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.dataCollectionMode')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!config.enableWebSocket}
                onChange={() => setConfig({ ...config, enableWebSocket: false })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('nodeConfig.pollingMode')} - {t('nodeConfig.pollingInterval')}: {config.pollingInterval || 5} min
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={config.enableWebSocket}
                onChange={() => setConfig({ ...config, enableWebSocket: true })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('nodeConfig.streamingMode')} - {t('nodeConfig.cacheRetention')}: {config.cacheRetention || 30} min
              </span>
            </label>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('nodeConfig.enableWebSocketDescription')}</p>
        </div>

        {/* API Configuration */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.apiKey')}</label>
          <input
            type="password"
            value={config.apiKey || ''}
            onChange={e => setConfig({ ...config, apiKey: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="Enter Twitter API Key"
          />
        </div>

        {/* Accounts */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.accounts')} (comma separated)
          </label>
          <input
            type="text"
            value={config.accounts?.join(', ') || ''}
            onChange={e =>
              setConfig({
                ...config,
                accounts: e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s),
              })
            }
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="elonmusk, VitalikButerin, trump"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.keywords')} (comma separated)
          </label>
          <input
            type="text"
            value={config.keywords?.join(', ') || ''}
            onChange={e =>
              setConfig({
                ...config,
                keywords: e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s),
              })
            }
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="ETH, Bitcoin, crypto"
          />
        </div>

        {/* Polling Interval (only show when not using WebSocket) */}
        {!config.enableWebSocket && (
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('nodeConfig.pollingInterval')}
            </label>
            <input
              type="number"
              value={config.pollingInterval || 5}
              onChange={e => setConfig({ ...config, pollingInterval: Number(e.target.value) })}
              className={`w-full ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
              } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
              min="1"
              max="60"
            />
          </div>
        )}

        {/* Cache Retention (only show when using WebSocket) */}
        {config.enableWebSocket && (
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.cacheRetention')}</label>
            <input
              type="number"
              value={config.cacheRetention || 30}
              onChange={e => setConfig({ ...config, cacheRetention: Number(e.target.value) })}
              className={`w-full ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
              } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
              min="5"
              max="1440"
            />
          </div>
        )}

        {/* API URLs (readonly) */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>API URLs (readonly)</label>
          <textarea
            value="https://api.twitter.com/2/tweets/search/recent\nhttps://api.twitter.com/2/users/by/username"
            readOnly
            className={`w-full ${
              isDark ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
            } px-3 py-2 rounded border resize-none`}
            rows={3}
          />
        </div>
      </div>
    );
  };

  const renderBinanceFeedConfig = () => {
    return (
      <div className="space-y-4">
        {/* Data Collection Mode */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.dataCollectionMode')}
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={!config.enableWebSocket}
                onChange={() => setConfig({ ...config, enableWebSocket: false })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('nodeConfig.pollingMode')} - {t('nodeConfig.pollingInterval')}: {config.pollingInterval || 5} min
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={config.enableWebSocket}
                onChange={() => setConfig({ ...config, enableWebSocket: true })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('nodeConfig.streamingMode')} - {t('nodeConfig.cacheRetention')}: {config.cacheRetention || 30} min
              </span>
            </label>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('nodeConfig.enableWebSocketDescription')}</p>
        </div>

        {/* API Configuration */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.apiKey')}</label>
          <input
            type="password"
            value={config.apiKey || ''}
            onChange={e => setConfig({ ...config, apiKey: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="Enter Binance API Key"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.apiSecret')}</label>
          <input
            type="password"
            value={config.apiSecret || ''}
            onChange={e => setConfig({ ...config, apiSecret: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="Enter Binance API Secret"
          />
        </div>

        {/* Trading Pairs */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.symbols')} (comma separated)
          </label>
          <input
            type="text"
            value={config.symbols?.join(', ') || ''}
            onChange={e =>
              setConfig({
                ...config,
                symbols: e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s),
              })
            }
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="BTCUSDT, ETHUSDT, BNBUSDT"
          />
        </div>

        {/* Timeframe */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.timeframe')}</label>
          <select
            value={config.timeframe || '1h'}
            onChange={e => setConfig({ ...config, timeframe: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
          >
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="6h">6 Hours</option>
            <option value="12h">12 Hours</option>
            <option value="24h">24 Hours</option>
            <option value="72h">72 Hours</option>
          </select>
        </div>

        {/* Polling Interval (only show when not using WebSocket) */}
        {!config.enableWebSocket && (
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              {t('nodeConfig.pollingInterval')}
            </label>
            <input
              type="number"
              value={config.pollingInterval || 5}
              onChange={e => setConfig({ ...config, pollingInterval: Number(e.target.value) })}
              className={`w-full ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
              } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
              min="1"
              max="60"
            />
          </div>
        )}

        {/* Cache Retention (only show when using WebSocket) */}
        {config.enableWebSocket && (
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.cacheRetention')}</label>
            <input
              type="number"
              value={config.cacheRetention || 30}
              onChange={e => setConfig({ ...config, cacheRetention: Number(e.target.value) })}
              className={`w-full ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
              } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
              min="5"
              max="1440"
            />
          </div>
        )}

        {/* API URLs (readonly) */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>API URLs (readonly)</label>
          <textarea
            value="https://api.binance.com/api/v3/ticker/24hr\nhttps://api.binance.com/api/v3/klines"
            readOnly
            className={`w-full ${
              isDark ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
            } px-3 py-2 rounded border resize-none`}
            rows={2}
          />
        </div>
      </div>
    );
  };

  const renderAIEvaluatorConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
          <select
            value={config.model || 'deepseek-v3'}
            onChange={e => setConfig({ ...config, model: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="deepseek-v3">DeepSeek V3</option>
            <option value="gpt-4">ChatGPT-4</option>
            <option value="gpt-4-turbo">ChatGPT-4 Turbo</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.systemPrompt', 'System Prompt')}
          </label>
          <textarea
            value={
              config.systemPrompt ||
              t(
                'nodeConfig.defaultSystemPrompt',
                'You are a professional trading analyst. Analyze the provided market data and provide trading recommendations.'
              )
            }
            onChange={e => setConfig({ ...config, systemPrompt: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            rows={4}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.assistantPrompt', 'Assistant Prompt')}
          </label>
          <textarea
            value={
              config.assistantPrompt ||
              t(
                'nodeConfig.defaultAssistantPrompt',
                'Based on the market data, I will provide a clear BUY, SELL, or HOLD recommendation with confidence score and reasoning.'
              )
            }
            onChange={e => setConfig({ ...config, assistantPrompt: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confidence Threshold</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={config.confidenceThreshold || 0.7}
            onChange={e => setConfig({ ...config, confidenceThreshold: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-400 mt-1">{((config.confidenceThreshold || 0.7) * 100).toFixed(0)}%</div>
        </div>
      </div>
    );
  };

  const renderDexExecutorConfig = () => {
    const currentVaultAddress = getVaultAddress(config.rpcEndpoint || 'mainnet', config.customVaultAddress);

    // Get available DEX options based on selected chain
    const getDexOptions = (chain: string) => {
      switch (chain) {
        case 'mainnet':
          return [
            { value: 'uniswap-v4', label: 'Uniswap V4', address: '0x0000000000000000000000000000000000000000', enabled: true }, // V4 latest version
            { value: 'uniswap-v3', label: 'Uniswap V3', address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', enabled: true },
            { value: 'uniswap-v2', label: 'Uniswap V2', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', enabled: true },
            { value: 'sushiswap', label: 'SushiSwap (Coming Soon)', address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F', enabled: false },
            { value: '1inch', label: '1inch (Coming Soon)', address: '0x111111125421cA6dc452d289314280a0f8842A65', enabled: false },
          ];
        case 'goerli':
        case 'sepolia':
          return [
            { value: 'uniswap-v4', label: 'Uniswap V4 (Testnet)', address: '0x0000000000000000000000000000000000000000', enabled: true }, // V4 testnet
            { value: 'uniswap-v3', label: 'Uniswap V3 (Testnet)', address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', enabled: true },
            { value: 'uniswap-v2', label: 'Uniswap V2 (Testnet)', address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', enabled: true },
          ];
        case 'polygon':
          return [
            { value: 'quickswap', label: 'QuickSwap', address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', enabled: true },
            { value: 'sushiswap', label: 'SushiSwap (Coming Soon)', address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', enabled: false },
            { value: '1inch', label: '1inch (Coming Soon)', address: '0x111111125421cA6dc452d289314280a0f8842A65', enabled: false },
          ];
        case 'bsc':
          return [
            { value: 'pancakeswap', label: 'PancakeSwap', address: '0x10ED43C718714eb63d5aA57B78B54704E256024E', enabled: true },
            { value: 'bakeryswap', label: 'BakerySwap (Coming Soon)', address: '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F', enabled: false },
            { value: '1inch', label: '1inch (Coming Soon)', address: '0x111111125421cA6dc452d289314280a0f8842A65', enabled: false },
          ];
        case 'custom':
          return [{ value: 'custom', label: 'Custom DEX', address: config.customDexAddress || '', enabled: true }];
        default:
          return [];
      }
    };

    const dexOptions = getDexOptions(config.rpcEndpoint || 'mainnet');
    const selectedDex = dexOptions.find(dex => dex.value === config.targetDex) || dexOptions.find(dex => dex.enabled !== false) || dexOptions[0];

    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Target Chain</label>
          <select
            value={config.rpcEndpoint || 'mainnet'}
            onChange={e => {
              const newEndpoint = e.target.value;
              const newDexOptions = getDexOptions(newEndpoint);
              setConfig({
                ...config,
                rpcEndpoint: newEndpoint,
                vaultAddress: getVaultAddress(newEndpoint, config.customVaultAddress),
                targetDex: newDexOptions[0]?.value || '',
                dexAddress: newDexOptions[0]?.address || '',
              });
            }}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
          >
            <option value="mainnet">Ethereum Mainnet</option>
            <option value="goerli">Goerli Testnet</option>
            <option value="sepolia">Sepolia Testnet</option>
            <option value="polygon">Polygon</option>
            <option value="bsc">BSC</option>
            <option value="custom">Custom RPC</option>
          </select>
        </div>
        {config.rpcEndpoint === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Custom RPC URL</label>
            <input
              type="url"
              value={config.customRpc || ''}
              onChange={e => setConfig({ ...config, customRpc: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target DEX</label>
          <select
            value={config.targetDex || dexOptions.find(dex => dex.enabled !== false)?.value || ''}
            onChange={e => {
              const selectedDexOption = dexOptions.find(dex => dex.value === e.target.value);
              if (selectedDexOption && selectedDexOption.enabled !== false) {
                setConfig({
                  ...config,
                  targetDex: e.target.value,
                  dexAddress: selectedDexOption?.address || '',
                });
              }
            }}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {dexOptions.map(dex => (
              <option
                key={dex.value}
                value={dex.value}
                disabled={dex.enabled === false}
                className={dex.enabled !== false ? 'text-white' : 'text-gray-500'}
              >
                {dex.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">DEX Router Address</label>
          <input
            type="text"
            value={selectedDex?.address || ''}
            readOnly
            className="w-full bg-gray-600 text-gray-300 px-3 py-2 rounded border border-gray-600 cursor-not-allowed"
          />
          <div className="text-xs text-gray-400 mt-1">Auto-configured for selected DEX</div>
        </div>

        {config.rpcEndpoint === 'custom' && config.targetDex === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Custom DEX Router Address</label>
            <input
              type="text"
              value={config.customDexAddress || ''}
              onChange={e =>
                setConfig({
                  ...config,
                  customDexAddress: e.target.value,
                  dexAddress: e.target.value,
                })
              }
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
            />
          </div>
        )}

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.vaultContractAddress', 'Vault Contract Address')}
          </label>
          <input
            type="text"
            value={currentVaultAddress}
            readOnly
            className={`w-full ${
              isDark ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
            } px-3 py-2 rounded border cursor-not-allowed`}
          />
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            {t('nodeConfig.autoConfigured', 'Auto-configured for selected chain')}
          </div>
        </div>

        {config.rpcEndpoint === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Custom Vault Address</label>
            <input
              type="text"
              value={config.customVaultAddress || ''}
              onChange={e =>
                setConfig({
                  ...config,
                  customVaultAddress: e.target.value,
                  vaultAddress: e.target.value,
                })
              }
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="0x742d35Cc6634C0532925a3b8D401d2EdC8d4a5b1"
            />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Allowed Trading Pairs</label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['WETH/USDC', 'WETH/USDT', 'WETH/DAI', 'USDC/USDT', 'WBTC/WETH', 'WBTC/USDC'],
                  })
                }
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                All Available
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['WETH/USDC', 'WETH/USDT', 'WETH/DAI'],
                  })
                }
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                ETH Pairs
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['USDC/USDT'],
                  })
                }
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
              >
                Stables
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['WBTC/WETH', 'WBTC/USDC'],
                  })
                }
                className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded"
              >
                BTC Pairs
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, allowedTradingPairs: [] })}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="bg-gray-700 rounded border border-gray-600 p-3 max-h-48 overflow-y-auto">
            {[
              { pair: 'WETH/USDC', enabled: true },
              { pair: 'WETH/USDT', enabled: true },
              { pair: 'WETH/DAI', enabled: true },
              { pair: 'USDC/USDT', enabled: true },
              { pair: 'WBTC/WETH', enabled: true },
              { pair: 'WBTC/USDC', enabled: true },
              { pair: 'DAI/USDC', enabled: false },
              { pair: 'LINK/WETH', enabled: false },
              { pair: 'UNI/WETH', enabled: false },
              { pair: 'AAVE/WETH', enabled: false },
              { pair: 'COMP/WETH', enabled: false },
              { pair: 'SUSHI/WETH', enabled: false },
              { pair: 'CRV/WETH', enabled: false },
              { pair: 'SNX/WETH', enabled: false },
              { pair: 'MKR/WETH', enabled: false },
            ].map(({ pair, enabled }) => (
              <label key={pair} className={`flex items-center space-x-2 py-1 hover:bg-gray-600 rounded px-2 ${!enabled ? 'opacity-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={config.allowedTradingPairs?.includes(pair) || false}
                  disabled={!enabled}
                  onChange={e => {
                    if (!enabled) return;
                    const currentPairs = config.allowedTradingPairs || [];
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        allowedTradingPairs: [...currentPairs, pair],
                      });
                    } else {
                      setConfig({
                        ...config,
                        allowedTradingPairs: currentPairs.filter((p: string) => p !== pair),
                      });
                    }
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className={`text-sm ${enabled ? 'text-gray-300' : 'text-gray-500'}`}>
                  {pair} {!enabled && '(Coming Soon)'}
                </span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            AI can autonomously choose from these pairs based on market analysis
            <br />
            Selected: {config.allowedTradingPairs?.length || 0} pairs
          </div>
        </div>

        <div className="bg-gray-600 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Authorization Status</span>
            <button
              type="button"
              onClick={() => {
                // TODO: Implement authorization quota query functionality
                console.debug('Query authorization allowance');
              }}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
              Refresh
            </button>
          </div>
          <div className="text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Authorized Amount:</span>
              <span className="text-green-400">1.50 ETH</span>
            </div>
            <div className="flex justify-between">
              <span>Used Amount:</span>
              <span className="text-yellow-400">0.30 ETH</span>
            </div>
            <div className="flex justify-between">
              <span>Available Amount:</span>
              <span className="text-blue-400">1.20 ETH</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount Per Transaction (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={config.maxAmount || 0.1}
            onChange={e => setConfig({ ...config, maxAmount: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          <div className="text-xs text-gray-400 mt-1">Must not exceed available authorized amount</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount Per Transaction (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={config.minAmount || 0.01}
            onChange={e => setConfig({ ...config, minAmount: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Slippage Tolerance (%)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="10"
            value={config.slippagePercent || 1.0}
            onChange={e => setConfig({ ...config, slippagePercent: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.gasPriceStrategy', 'Gas Price Strategy')}
          </label>
          <select
            value={config.gasStrategy || 'standard'}
            onChange={e => setConfig({ ...config, gasStrategy: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
          >
            <option value="slow">{t('nodeConfig.gasStrategySlow', 'Slow (Low Gas) - ~5-15 minutes')}</option>
            <option value="standard">{t('nodeConfig.gasStrategyStandard', 'Standard - ~1-3 minutes')}</option>
            <option value="fast">{t('nodeConfig.gasStrategyFast', 'Fast (High Gas) - ~30-60 seconds')}</option>
            <option value="custom">{t('nodeConfig.gasStrategyCustom', 'Custom Gas Price')}</option>
          </select>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            {t('nodeConfig.gasStrategyDescription', 'Gas strategy affects transaction confirmation time and cost')}
          </div>
        </div>

        {config.gasStrategy === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Custom Gas Price (Gwei)</label>
            <input
              type="number"
              step="0.1"
              value={config.customGasPrice || 20}
              onChange={e => setConfig({ ...config, customGasPrice: Number(e.target.value) })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div className={`${isDark ? 'bg-blue-600 bg-opacity-20' : 'bg-blue-50 border border-blue-200'} rounded-lg p-3 mb-4`}>
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              <div className="font-medium mb-2">{t('nodeConfig.gasPriceImplementation', 'Gas Price Strategy Implementation:')}</div>
              <div className="space-y-1 text-xs">
                <div>
                  <strong>{t('nodeConfig.slow', 'Slow')}:</strong> gasPrice = network.baseGasPrice * 0.8
                </div>
                <div>
                  <strong>{t('nodeConfig.standard', 'Standard')}:</strong> gasPrice = network.baseGasPrice * 1.0
                </div>
                <div>
                  <strong>{t('nodeConfig.fast', 'Fast')}:</strong> gasPrice = network.baseGasPrice * 1.5
                </div>
                <div>
                  <strong>{t('nodeConfig.custom', 'Custom')}:</strong> gasPrice = config.customGasPrice (in Gwei)
                </div>
              </div>
              <div className="mt-2 text-xs">
                <strong>{t('nodeConfig.usageInTx', 'Usage in tx.send()')}:</strong> transaction.gasPrice = calculateGasPrice(strategy)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-600 bg-opacity-20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-sm text-yellow-200">
              <div className="font-medium mb-1">Security Notice:</div>
              <div>This executor will only use authorized funds from the vault contract. No private keys are stored or transmitted.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCexExecutorConfig = () => {
    const exchangeOptions = [
      { value: 'binance', label: 'Binance', enabled: true },
      { value: 'okx', label: 'OKX', enabled: true },
      { value: 'coinbase', label: 'Coinbase Pro', enabled: true },
      { value: 'kraken', label: 'Kraken', enabled: false },
      { value: 'bybit', label: 'Bybit (Coming Soon)', enabled: false },
      { value: 'kucoin', label: 'KuCoin (Coming Soon)', enabled: false },
    ];

    const selectedExchange = exchangeOptions.find(ex => ex.value === config.exchange) || exchangeOptions[0];

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target Exchange</label>
          <select
            value={config.exchange || exchangeOptions.find(ex => ex.enabled)?.value || ''}
            onChange={e => setConfig({ ...config, exchange: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            {exchangeOptions.map(ex => (
              <option key={ex.value} value={ex.value} disabled={!ex.enabled} className={ex.enabled ? 'text-white' : 'text-gray-500'}>
                {ex.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-yellow-600 bg-opacity-20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-sm text-yellow-200">
              <div className="font-medium mb-1">API Configuration Required:</div>
              <div>Please configure your {selectedExchange.label} API keys in Settings → CEX Configuration before using this executor.</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Allowed Trading Pairs</label>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT', 'DOT/USDT'],
                  })
                }
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
              >
                All Available
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['BTC/USDT', 'ETH/USDT'],
                  })
                }
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                Major Pairs
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig({
                    ...config,
                    allowedTradingPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
                  })
                }
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded"
              >
                Top 4
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, allowedTradingPairs: [] })}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="bg-gray-700 rounded border border-gray-600 p-3 max-h-48 overflow-y-auto">
            {[
              { pair: 'BTC/USDT', enabled: true },
              { pair: 'ETH/USDT', enabled: true },
              { pair: 'BNB/USDT', enabled: true },
              { pair: 'SOL/USDT', enabled: true },
              { pair: 'ADA/USDT', enabled: true },
              { pair: 'DOT/USDT', enabled: true },
              { pair: 'LINK/USDT', enabled: false },
              { pair: 'AVAX/USDT', enabled: false },
              { pair: 'MATIC/USDT', enabled: false },
              { pair: 'UNI/USDT', enabled: false },
              { pair: 'ATOM/USDT', enabled: false },
              { pair: 'FIL/USDT', enabled: false },
            ].map(({ pair, enabled }) => (
              <label key={pair} className={`flex items-center space-x-2 py-1 hover:bg-gray-600 rounded px-2 ${!enabled ? 'opacity-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={config.allowedTradingPairs?.includes(pair) || false}
                  disabled={!enabled}
                  onChange={e => {
                    if (!enabled) return;
                    const currentPairs = config.allowedTradingPairs || [];
                    if (e.target.checked) {
                      setConfig({
                        ...config,
                        allowedTradingPairs: [...currentPairs, pair],
                      });
                    } else {
                      setConfig({
                        ...config,
                        allowedTradingPairs: currentPairs.filter((p: string) => p !== pair),
                      });
                    }
                  }}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className={`text-sm ${enabled ? 'text-gray-300' : 'text-gray-500'}`}>
                  {pair} {!enabled && '(Coming Soon)'}
                </span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            AI can autonomously choose from these pairs based on market analysis
            <br />
            Selected: {config.allowedTradingPairs?.length || 0} pairs
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
          <select
            value={config.orderType || 'market'}
            onChange={e => setConfig({ ...config, orderType: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="market">Market Order</option>
            <option value="limit">Limit Order</option>
            <option value="stop">Stop Order</option>
            <option value="stop-limit">Stop-Limit Order</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Position Size (USDT)</label>
          <input
            type="number"
            step="10"
            value={config.maxPositionSize || 1000}
            onChange={e => setConfig({ ...config, maxPositionSize: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Min Position Size (USDT)</label>
          <input
            type="number"
            step="1"
            value={config.minPositionSize || 10}
            onChange={e => setConfig({ ...config, minPositionSize: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Slippage Tolerance (%)</label>
          <input
            type="number"
            step="0.1"
            value={config.maxSlippage || 0.5}
            onChange={e => setConfig({ ...config, maxSlippage: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="bg-green-600 bg-opacity-20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-sm text-green-200">
              <div className="font-medium mb-1">CEX Advantages:</div>
              <div>• Higher liquidity and faster execution</div>
              <div>• No gas fees</div>
              <div>• More trading pairs available</div>
              <div>• Advanced order types (stop-loss, OCO, etc.)</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-600 bg-opacity-20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full flex-shrink-0 mt-0.5"></div>
            <div className="text-sm text-blue-200">
              <div className="font-medium mb-1">Security Notice:</div>
              <div>API keys are encrypted and stored locally. Never share your secret keys with anyone.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCollectorConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Monitor Duration (minutes)</label>
          <input
            type="number"
            value={config.monitorDuration || 30}
            onChange={e => setConfig({ ...config, monitorDuration: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            min="1"
            max="1440"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Check Interval (seconds)</label>
          <input
            type="number"
            value={config.checkInterval || 30}
            onChange={e => setConfig({ ...config, checkInterval: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            min="5"
            max="300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Success Criteria</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Min Profit Percentage</label>
              <input
                type="number"
                step="0.1"
                value={config.minProfitPercent || 0.5}
                onChange={e => setConfig({ ...config, minProfitPercent: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Max Slippage Percentage</label>
              <input
                type="number"
                step="0.1"
                value={config.maxSlippagePercent || 2.0}
                onChange={e => setConfig({ ...config, maxSlippagePercent: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Database Update Settings</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.updateDatabase !== false}
              onChange={e => setConfig({ ...config, updateDatabase: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Update workflow run record in PostgreSQL</span>
          </div>
        </div>
      </div>
    );
  };

  const renderUniswapFeedConfig = () => {
    return (
      <div className="space-y-4">
        {/* RPC Endpoint */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>RPC Endpoint</label>
          <input
            type="text"
            value={config.rpcEndpoint || ''}
            onChange={e => setConfig({ ...config, rpcEndpoint: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="https://eth-mainnet.alchemyapi.io/v2/your-api-key"
          />
        </div>

        {/* Pool Address */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Pool Address</label>
          <input
            type="text"
            value={config.poolAddress || ''}
            onChange={e => setConfig({ ...config, poolAddress: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
          />
        </div>

        {/* Polling Interval */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.pollingInterval')}</label>
          <input
            type="number"
            value={config.pollingInterval || 5}
            onChange={e => setConfig({ ...config, pollingInterval: Number(e.target.value) })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            min="1"
            max="60"
          />
        </div>

        {/* GraphQL Endpoint (readonly) */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>GraphQL Endpoint (readonly)</label>
          <input
            value="https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
            readOnly
            className={`w-full ${
              isDark ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
            } px-3 py-2 rounded border`}
          />
        </div>
      </div>
    );
  };

  const renderCoinMarketFeedConfig = () => {
    return (
      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.apiKey')}</label>
          <input
            type="password"
            value={config.apiKey || ''}
            onChange={e => setConfig({ ...config, apiKey: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="Enter CoinMarketCap API Key"
          />
        </div>

        {/* Symbols */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            {t('nodeConfig.symbols')} (comma separated)
          </label>
          <input
            type="text"
            value={config.symbols?.join(', ') || ''}
            onChange={e =>
              setConfig({
                ...config,
                symbols: e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s),
              })
            }
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder="BTC, ETH, BNB"
          />
        </div>

        {/* Polling Interval */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('nodeConfig.pollingInterval')}</label>
          <input
            type="number"
            value={config.pollingInterval || 5}
            onChange={e => setConfig({ ...config, pollingInterval: Number(e.target.value) })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            min="1"
            max="60"
          />
        </div>

        {/* API URL (readonly) */}
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>API URL (readonly)</label>
          <input
            value="https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
            readOnly
            className={`w-full ${
              isDark ? 'bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-300'
            } px-3 py-2 rounded border`}
          />
        </div>
      </div>
    );
  };

  const renderConfigContent = () => {
    switch (node.type) {
      case COMPONENT_TYPES.TWITTER_FEED:
        return renderTwitterFeedConfig();
      case COMPONENT_TYPES.BINANCE_FEED:
        return renderBinanceFeedConfig();
      case COMPONENT_TYPES.UNISWAP_FEED:
        return renderUniswapFeedConfig();
      case COMPONENT_TYPES.COINMARKET_FEED:
        return renderCoinMarketFeedConfig();
      case COMPONENT_TYPES.AI_EVALUATOR:
        return renderAIEvaluatorConfig();
      case COMPONENT_TYPES.EVM_TRADE_EXECUTOR:
      case COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR:
      case COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR:
        return renderDexExecutorConfig();
      case COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR:
      case COMPONENT_TYPES.OKX_TRADE_EXECUTOR:
        return renderCexExecutorConfig();
      case COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR:
      case COMPONENT_TYPES.OKX_RESULT_COLLECTOR:
      case COMPONENT_TYPES.EVM_RESULT_COLLECTOR:
      case COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR:
      case COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR:
        return renderCollectorConfig();
      default:
        return <div className="text-gray-400">No configuration available for this node type.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Configure: {node.name || 'Untitled'}</h2>
          <button onClick={onClose} className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}>
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Node Name</label>
          <input
            type="text"
            value={config.name || ''}
            onChange={e => setConfig({ ...config, name: e.target.value })}
            className={`w-full ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
            } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
            placeholder={`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Component`}
          />
        </div>

        {renderConfigContent()}

        <div className={`flex justify-end space-x-3 mt-6 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${
              isDark ? 'text-white' : 'text-gray-900'
            } rounded transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
