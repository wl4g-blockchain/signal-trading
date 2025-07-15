import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Wallet, Bell, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('trading');
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
    vault: {
      address: '0x742d35Cc6639C0532fEb5003f13A1234567890ab',
      autoRebalance: true,
      emergencyPause: false,
    },
  });

  const tabs = [
    { id: 'trading', label: 'Trading', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'vault', label: 'Vault', icon: Wallet },
  ];

  const updateSetting = (category: string, key: string, value: any) => {
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
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-gray-800 rounded-lg p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
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
        <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
          {activeTab === 'trading' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Trading Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Amount Per Transaction ($)
                  </label>
                  <input
                    type="number"
                    value={settings.trading.maxAmountPerTx}
                    onChange={(e) => updateSetting('trading', 'maxAmountPerTx', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Amount Per Transaction ($)
                  </label>
                  <input
                    type="number"
                    value={settings.trading.minAmountPerTx}
                    onChange={(e) => updateSetting('trading', 'minAmountPerTx', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Slippage Tolerance (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.trading.defaultSlippage}
                    onChange={(e) => updateSetting('trading', 'defaultSlippage', Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Risk Tolerance
                  </label>
                  <select
                    value={settings.trading.riskTolerance}
                    onChange={(e) => updateSetting('trading', 'riskTolerance', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
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
              <h3 className="text-lg font-semibold text-white">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
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
                      onChange={(e) => updateSetting('security', 'apiKeyRestrictions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', Number(e.target.value))}
                    className="w-full md:w-48 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Trade Executions</h4>
                    <p className="text-sm text-gray-400">Get notified when trades are executed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.tradeExecutions}
                      onChange={(e) => updateSetting('notifications', 'tradeExecutions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Profit Alerts</h4>
                    <p className="text-sm text-gray-400">Receive alerts for significant profits</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.profitAlerts}
                      onChange={(e) => updateSetting('notifications', 'profitAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Vault Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vault Contract Address
                  </label>
                  <input
                    type="text"
                    value={settings.vault.address}
                    onChange={(e) => updateSetting('vault', 'address', e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Auto Rebalance</h4>
                    <p className="text-sm text-gray-400">Automatically rebalance portfolio allocations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.vault.autoRebalance}
                      onChange={(e) => updateSetting('vault', 'autoRebalance', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-red-300 font-medium">Emergency Pause</h4>
                      <p className="text-sm text-red-400">Immediately halt all trading activities</p>
                    </div>
                    <button
                      onClick={() => updateSetting('vault', 'emergencyPause', !settings.vault.emergencyPause)}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        settings.vault.emergencyPause
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {settings.vault.emergencyPause ? 'Resume Trading' : 'Emergency Pause'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-6">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};