import React, { useState } from 'react';
import { ComponentNode } from '../../types';
import { X, Save } from 'lucide-react';

interface NodeConfigModalProps {
  node: ComponentNode;
  onSave: (node: ComponentNode) => void;
  onClose: () => void;
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = ({
  node,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState(node.data || {});

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: { ...config }
    };
    onSave(updatedNode);
  };

  const renderListenerConfig = () => {
    const listenerType = config.type || 'twitter';
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data Source Type
          </label>
          <select
            value={listenerType}
            onChange={(e) => setConfig({ ...config, type: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="twitter">Twitter</option>
            <option value="binance">Binance</option>
            <option value="uniswap">Uniswap</option>
            <option value="coinmarket">CoinMarket</option>
            <option value="custom">Custom RPC API</option>
          </select>
        </div>

        {listenerType === 'twitter' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter Twitter API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Twitter IDs (comma separated)
              </label>
              <input
                type="text"
                value={config.twitterIds || ''}
                onChange={(e) => setConfig({ ...config, twitterIds: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="elonmusk, VitalikButerin, trump"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interval (minutes)
              </label>
              <input
                type="number"
                value={config.interval || 5}
                onChange={(e) => setConfig({ ...config, interval: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API URLs (readonly)
              </label>
              <textarea
                value="https://api.twitter.com/2/tweets/search/recent\nhttps://api.twitter.com/2/users/by/username"
                readOnly
                className="w-full bg-gray-600 text-gray-300 px-3 py-2 rounded border border-gray-600 resize-none"
                rows={3}
              />
            </div>
          </>
        )}

        {listenerType === 'binance' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter Binance API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trading Pairs (comma separated)
              </label>
              <input
                type="text"
                value={config.pairs || ''}
                onChange={(e) => setConfig({ ...config, pairs: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="BTCUSDT, ETHUSDT, BNBUSDT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeframe
              </label>
              <select
                value={config.timeframe || '1h'}
                onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="6h">6 Hours</option>
                <option value="12h">12 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="72h">72 Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API URLs (readonly)
              </label>
              <textarea
                value="https://api.binance.com/api/v3/ticker/24hr\nhttps://api.binance.com/api/v3/klines"
                readOnly
                className="w-full bg-gray-600 text-gray-300 px-3 py-2 rounded border border-gray-600 resize-none"
                rows={2}
              />
            </div>
          </>
        )}

        {listenerType === 'uniswap' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pool Addresses (comma separated)
              </label>
              <input
                type="text"
                value={config.pools || ''}
                onChange={(e) => setConfig({ ...config, pools: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timeframe
              </label>
              <select
                value={config.timeframe || '1h'}
                onChange={(e) => setConfig({ ...config, timeframe: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="6h">6 Hours</option>
                <option value="12h">12 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="72h">72 Hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GraphQL Endpoint (readonly)
              </label>
              <input
                value="https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
                readOnly
                className="w-full bg-gray-600 text-gray-300 px-3 py-2 rounded border border-gray-600"
              />
            </div>
          </>
        )}

        {listenerType === 'coinmarket' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter CoinMarketCap API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbols (comma separated)
              </label>
              <input
                type="text"
                value={config.symbols || ''}
                onChange={(e) => setConfig({ ...config, symbols: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="BTC, ETH, BNB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API URL (readonly)
              </label>
              <input
                value="https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
                readOnly
                className="w-full bg-gray-600 text-gray-300 px-3 py-2 rounded border border-gray-600"
              />
            </div>
          </>
        )}

        {listenerType === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom API URL
              </label>
              <input
                type="url"
                value={config.customUrl || ''}
                onChange={(e) => setConfig({ ...config, customUrl: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="https://api.example.com/data"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Headers (JSON format)
              </label>
              <textarea
                value={config.headers || '{}'}
                onChange={(e) => setConfig({ ...config, headers: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows={3}
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Request Method
              </label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => setConfig({ ...config, method: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderEvaluatorConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            AI Model
          </label>
          <select
            value={config.model || 'deepseek-v3'}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="deepseek-v3">DeepSeek V3</option>
            <option value="gpt-4">ChatGPT-4</option>
            <option value="gpt-4-turbo">ChatGPT-4 Turbo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            System Prompt
          </label>
          <textarea
            value={config.systemPrompt || 'You are a professional trading analyst. Analyze the provided market data and provide trading recommendations.'}
            onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Assistant Prompt
          </label>
          <textarea
            value={config.assistantPrompt || 'Based on the market data, I will provide a clear BUY, SELL, or HOLD recommendation with confidence score and reasoning.'}
            onChange={(e) => setConfig({ ...config, assistantPrompt: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confidence Threshold
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={config.confidenceThreshold || 0.7}
            onChange={(e) => setConfig({ ...config, confidenceThreshold: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-400 mt-1">
            {((config.confidenceThreshold || 0.7) * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    );
  };

  const renderExecutorConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            RPC Endpoint
          </label>
          <select
            value={config.rpcEndpoint || 'mainnet'}
            onChange={(e) => setConfig({ ...config, rpcEndpoint: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="mainnet">Ethereum Mainnet</option>
            <option value="goerli">Goerli Testnet</option>
            <option value="sepolia">Sepolia Testnet</option>
            <option value="custom">Custom RPC</option>
          </select>
        </div>
        {config.rpcEndpoint === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom RPC URL
            </label>
            <input
              type="url"
              value={config.customRpc || ''}
              onChange={(e) => setConfig({ ...config, customRpc: e.target.value })}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Private Key
          </label>
          <input
            type="password"
            value={config.privateKey || ''}
            onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Enter private key for transaction signing"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Amount Per Transaction (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={config.maxAmount || 1}
            onChange={(e) => setConfig({ ...config, maxAmount: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gas Price Strategy
          </label>
          <select
            value={config.gasStrategy || 'standard'}
            onChange={(e) => setConfig({ ...config, gasStrategy: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="slow">Slow (Low Gas)</option>
            <option value="standard">Standard</option>
            <option value="fast">Fast (High Gas)</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
    );
  };

  const renderCollectorConfig = () => {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Monitor Duration (minutes)
          </label>
          <input
            type="number"
            value={config.monitorDuration || 30}
            onChange={(e) => setConfig({ ...config, monitorDuration: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            min="1"
            max="1440"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Check Interval (seconds)
          </label>
          <input
            type="number"
            value={config.checkInterval || 30}
            onChange={(e) => setConfig({ ...config, checkInterval: Number(e.target.value) })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            min="5"
            max="300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Success Criteria
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Min Profit Percentage
              </label>
              <input
                type="number"
                step="0.1"
                value={config.minProfitPercent || 0.5}
                onChange={(e) => setConfig({ ...config, minProfitPercent: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Max Slippage Percentage
              </label>
              <input
                type="number"
                step="0.1"
                value={config.maxSlippagePercent || 2.0}
                onChange={(e) => setConfig({ ...config, maxSlippagePercent: Number(e.target.value) })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Database Update Settings
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.updateDatabase !== false}
              onChange={(e) => setConfig({ ...config, updateDatabase: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Update workflow run record in PostgreSQL</span>
          </div>
        </div>
      </div>
    );
  };

  const renderConfigContent = () => {
    switch (node.type) {
      case 'listener':
        return renderListenerConfig();
      case 'evaluator':
        return renderEvaluatorConfig();
      case 'executor':
        return renderExecutorConfig();
      case 'collector':
        return renderCollectorConfig();
      default:
        return <div className="text-gray-400">No configuration available for this node type.</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Configure {node.data?.name || node.type}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Node Name
          </label>
          <input
            type="text"
            value={config.name || ''}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder={`${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Component`}
          />
        </div>

        {renderConfigContent()}

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
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