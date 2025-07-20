import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Zap, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('trading');
  const [exchangeSubTab, setExchangeSubTab] = useState('dex');
  const [settings, setSettings] = useState({
    trading: {
      maxAmountPerTx: 1000,
      minAmountPerTx: 10,
      defaultSlippage: 1.0,
      gasPrice: 'standard',
      riskTolerance: 'medium',
    },
    security: {
      twoFactorAuth: true,
      apiKeyRestrictions: true,
      withdrawalLimits: true,
      sessionTimeout: 30,
    },
    notifications: {
      tradeExecutions: true,
      profitAlerts: true,
      errorNotifications: true,
      emailReports: false,
    },

    exchanges: {
      dex: {
        vault: {
          chain: 'mainnet',
          address: '0x742d35Cc6639C0532fEb5003f13A1234567890ab',
          connected: false,
          walletAddress: '',
          balance: '0.0000',
          allowedPercentage: 50,
          autoRebalance: true,
          emergencyPause: false,
        },
      },
      cex: {
        binance: {
          apiKey: '',
          apiSecret: '',
          testnet: false,
          enabled: false,
        },
        okx: {
          apiKey: '',
          apiSecret: '',
          passphrase: '',
          testnet: false,
          enabled: false,
        },
        coinbase: {
          apiKey: '',
          apiSecret: '',
          testnet: false,
          enabled: false,
        },
      },
    },
  });

  const tabs = [
    { id: 'trading', label: t('settings.trading'), icon: SettingsIcon },
    { id: 'exchanges', label: t('settings.exchanges'), icon: Zap },
    { id: 'security', label: t('settings.security'), icon: Shield },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
  ];

  const updateSetting = (category: string, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="p-6">
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>{t('settings.title')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div
          className={`lg:col-span-3 ${
            isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'
          } rounded-lg p-6 min-h-[600px] max-h-[80vh] overflow-y-auto`}
        >
          {activeTab === 'trading' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('settings.trading')} Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Max Amount Per Transaction ($)
                  </label>
                  <input
                    type="number"
                    value={settings.trading.maxAmountPerTx}
                    onChange={e => updateSetting('trading', 'maxAmountPerTx', Number(e.target.value))}
                    className={`w-full ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
                    } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Min Amount Per Transaction ($)
                  </label>
                  <input
                    type="number"
                    value={settings.trading.minAmountPerTx}
                    onChange={e => updateSetting('trading', 'minAmountPerTx', Number(e.target.value))}
                    className={`w-full ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
                    } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Default Slippage Tolerance (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.trading.defaultSlippage}
                    onChange={e => updateSetting('trading', 'defaultSlippage', Number(e.target.value))}
                    className={`w-full ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
                    } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Risk Tolerance</label>
                  <select
                    value={settings.trading.riskTolerance}
                    onChange={e => updateSetting('trading', 'riskTolerance', e.target.value)}
                    className={`w-full ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
                    } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('settings.security')} Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>Two-Factor Authentication</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={e => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">API Key Restrictions</h4>
                    <p className="text-sm text-gray-400">Restrict API access to specific IP addresses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.apiKeyRestrictions}
                      onChange={e => updateSetting('security', 'apiKeyRestrictions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={e => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                    className={`w-full md:w-48 ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300'
                    } px-3 py-2 rounded border focus:border-blue-500 focus:outline-none`}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('settings.notifications')} Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>Trade Executions</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Get notified when trades are executed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.tradeExecutions}
                      onChange={e => updateSetting('notifications', 'tradeExecutions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>Profit Alerts</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Receive alerts for significant profits</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.profitAlerts}
                      onChange={e => updateSetting('notifications', 'profitAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exchanges' && (
            <div className="space-y-6 pb-6">
              <h3 className="text-lg font-semibold text-white">Exchange Configuration</h3>

              {/* DEX/CEX 子标签 */}
              <div className="flex space-x-4 border-b border-gray-600">
                <button
                  onClick={() => setExchangeSubTab('dex')}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    exchangeSubTab === 'dex' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  DEX Configuration
                </button>
                <button
                  onClick={() => setExchangeSubTab('cex')}
                  className={`px-4 py-2 border-b-2 transition-colors ${
                    exchangeSubTab === 'cex' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  CEX Configuration
                </button>
              </div>

              {/* DEX 配置 */}
              {exchangeSubTab === 'dex' && (
                <div className="space-y-6 min-h-[500px]">
                  {/* Vault Configuration - 置于最前面 */}
                  <div className="bg-gray-700 rounded-lg p-4 min-h-[400px]">
                    <h4 className="text-white font-medium mb-4">Vault Configuration</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vault Chain</label>
                        <select
                          value={settings.exchanges.dex.vault.chain}
                          onChange={e =>
                            updateSetting('exchanges', 'dex', {
                              ...settings.exchanges.dex,
                              vault: { ...settings.exchanges.dex.vault, chain: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="mainnet">Ethereum Mainnet</option>
                          <option value="polygon">Polygon</option>
                          <option value="bsc">BNB Smart Chain</option>
                          <option value="goerli">Goerli Testnet</option>
                          <option value="sepolia">Sepolia Testnet</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Connection</label>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => {
                              if (settings.exchanges.dex.vault.connected) {
                                // Disconnect
                                updateSetting('exchanges', 'dex', {
                                  ...settings.exchanges.dex,
                                  vault: {
                                    ...settings.exchanges.dex.vault,
                                    connected: false,
                                    walletAddress: '',
                                    balance: '0.0000',
                                  },
                                });
                              } else {
                                // Simulate wallet connection
                                updateSetting('exchanges', 'dex', {
                                  ...settings.exchanges.dex,
                                  vault: {
                                    ...settings.exchanges.dex.vault,
                                    connected: true,
                                    walletAddress: '0x742d35Cc6634C0532925a3b8D401d2EdC8d4a5b1',
                                    balance: '2.5734',
                                  },
                                });
                              }
                            }}
                            className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                              settings.exchanges.dex.vault.connected
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {settings.exchanges.dex.vault.connected ? 'Disconnect' : 'Connect Wallet'}
                          </button>
                          {settings.exchanges.dex.vault.connected && (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-sm text-gray-400 font-mono">
                                {settings.exchanges.dex.vault.walletAddress.slice(0, 6)}...{settings.exchanges.dex.vault.walletAddress.slice(-4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {settings.exchanges.dex.vault.connected ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Balance</label>
                            <div className="bg-gray-600 rounded p-3">
                              <div className="text-white font-mono text-lg">{settings.exchanges.dex.vault.balance} ETH</div>
                              <div className="text-sm text-gray-400">Available for trading</div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Allowed Usage Percentage</label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-4">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={settings.exchanges.dex.vault.allowedPercentage}
                                  onChange={e =>
                                    updateSetting('exchanges', 'dex', {
                                      ...settings.exchanges.dex,
                                      vault: { ...settings.exchanges.dex.vault, allowedPercentage: Number(e.target.value) },
                                    })
                                  }
                                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-white font-medium w-16 text-center">{settings.exchanges.dex.vault.allowedPercentage}%</div>
                              </div>
                              <div className="text-sm text-gray-400">
                                Available for automated trading:{' '}
                                <span className="text-blue-400 font-mono">
                                  {(
                                    (parseFloat(settings.exchanges.dex.vault.balance) * settings.exchanges.dex.vault.allowedPercentage) /
                                    100
                                  ).toFixed(4)}{' '}
                                  ETH
                                </span>{' '}
                                (≈ $
                                {(
                                  ((parseFloat(settings.exchanges.dex.vault.balance) * settings.exchanges.dex.vault.allowedPercentage) / 100) *
                                  3500
                                ).toFixed(2)}
                                )
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-600 bg-opacity-20 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <div className="w-4 h-4 bg-green-400 rounded-full flex-shrink-0 mt-0.5"></div>
                              <div className="text-sm text-green-200">
                                <div className="font-medium mb-1">Vault Security:</div>
                                <div>• Funds are secured in smart contracts</div>
                                <div>• Only authorized amounts can be used for trading</div>
                                <div>• You can withdraw at any time</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-red-300 font-medium">Emergency Pause</h5>
                                <p className="text-sm text-red-400">Immediately halt all DEX trading activities</p>
                              </div>
                              <button
                                onClick={() =>
                                  updateSetting('exchanges', 'dex', {
                                    ...settings.exchanges.dex,
                                    vault: { ...settings.exchanges.dex.vault, emergencyPause: !settings.exchanges.dex.vault.emergencyPause },
                                  })
                                }
                                className={`px-4 py-2 rounded font-medium transition-colors ${
                                  settings.exchanges.dex.vault.emergencyPause
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-gray-600 hover:bg-gray-500 text-white'
                                }`}
                              >
                                {settings.exchanges.dex.vault.emergencyPause ? 'Resume Trading' : 'Emergency Pause'}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-600 bg-opacity-50 rounded-lg p-4 text-center">
                          <div className="text-gray-400 text-sm">Connect your wallet to access vault configuration</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CEX 配置 */}
              {exchangeSubTab === 'cex' && (
                <div className="space-y-6">
                  {/* Binance */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Binance</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.exchanges.cex.binance.enabled}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              binance: { ...settings.exchanges.cex.binance, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.binance.apiKey}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              binance: { ...settings.exchanges.cex.binance, apiKey: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your Binance API key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.binance.apiSecret}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              binance: { ...settings.exchanges.cex.binance, apiSecret: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your Binance API secret"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-medium">Testnet Mode</h5>
                          <p className="text-sm text-gray-400">Use Binance testnet for development</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.exchanges.cex.binance.testnet}
                            onChange={e =>
                              updateSetting('exchanges', 'cex', {
                                ...settings.exchanges.cex,
                                binance: { ...settings.exchanges.cex.binance, testnet: e.target.checked },
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* OKX */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">OKX</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.exchanges.cex.okx.enabled}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              okx: { ...settings.exchanges.cex.okx, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.okx.apiKey}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              okx: { ...settings.exchanges.cex.okx, apiKey: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your OKX API key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.okx.apiSecret}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              okx: { ...settings.exchanges.cex.okx, apiSecret: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your OKX API secret"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Passphrase</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.okx.passphrase}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              okx: { ...settings.exchanges.cex.okx, passphrase: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your OKX passphrase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coinbase */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Coinbase Pro</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.exchanges.cex.coinbase.enabled}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              coinbase: { ...settings.exchanges.cex.coinbase, enabled: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.coinbase.apiKey}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              coinbase: { ...settings.exchanges.cex.coinbase, apiKey: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your Coinbase Pro API key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">API Secret</label>
                        <input
                          type="password"
                          value={settings.exchanges.cex.coinbase.apiSecret}
                          onChange={e =>
                            updateSetting('exchanges', 'cex', {
                              ...settings.exchanges.cex,
                              coinbase: { ...settings.exchanges.cex.coinbase, apiSecret: e.target.value },
                            })
                          }
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:border-blue-500 focus:outline-none font-mono"
                          placeholder="Enter your Coinbase Pro API secret"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-600 bg-opacity-20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
                      <div className="text-sm text-yellow-200">
                        <div className="font-medium mb-1">Security Notice:</div>
                        <div>• API keys are encrypted and stored locally</div>
                        <div>• Never share your API keys with anyone</div>
                        <div>• Use API keys with restricted permissions (trading only)</div>
                        <div>• Enable IP restrictions on your exchange account</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('settings.appearance')}</h3>

              <div className="space-y-6">
                {/* Theme Settings */}
                <div>
                  <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium mb-4`}>{t('settings.theme')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['system', 'light', 'dark'] as const).map(themeOption => (
                      <button
                        key={themeOption}
                        onClick={() => setTheme(themeOption)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === themeOption
                            ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400'
                            : `${
                                isDark
                                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600'
                                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                              }`
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-medium mb-2">{t(`theme.${themeOption}`)}</div>
                          <div className="text-sm opacity-75">
                            {themeOption === 'system' && t('theme.system')}
                            {themeOption === 'light' && t('theme.light')}
                            {themeOption === 'dark' && t('theme.dark')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Settings */}
                <div>
                  <h4 className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium mb-4`}>{t('settings.language')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(['en', 'zh'] as const).map(langOption => (
                      <button
                        key={langOption}
                        onClick={() => setLanguage(langOption)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          language === langOption
                            ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400'
                            : `${
                                isDark
                                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600'
                                  : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                              }`
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-medium">{t(`language.${langOption === 'en' ? 'english' : 'chinese'}`)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6">
            <button className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors ${isDark ? '' : 'shadow-sm'}`}>
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
