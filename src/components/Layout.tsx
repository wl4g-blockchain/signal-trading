import React, { useState } from 'react';
import { BarChart3, Settings, Activity, FileText, LogOut, User, Globe } from 'lucide-react';
import { serviceManager, ServiceType } from '../services';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  user: UserType;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange, 
  user, 
  onLogout 
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>(serviceManager.getCurrentServiceType());
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'monitor', label: 'Dashboard', icon: Activity },
    { id: 'workflow', label: 'Workflows', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleServiceSwitch = (type: ServiceType) => {
    serviceManager.switchService(type);
    setServiceType(type);
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-400">Signal Trading</h1>
          <p className="text-sm text-gray-400 mt-1">AI Trading</p>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
        {/* 删除原底部 Service Mode 和 Vault Balance */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-end space-x-8">
          {/* 新增 Service Mode 和 Vault Balance 到顶部栏 */}
          <div className="flex items-center space-x-6">
            {/* Service Switcher */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1">
              <span className="text-sm text-gray-400 mr-2">Service Mode</span>
              <button
                onClick={() => handleServiceSwitch('mock')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  serviceType === 'mock'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Mock
              </button>
              <button
                onClick={() => handleServiceSwitch('http')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  serviceType === 'http'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                HTTP
              </button>
            </div>
            {/* Vault Balance */}
            <div className="flex items-center bg-gray-700 rounded-lg px-3 py-1 space-x-3">
              <span className="text-gray-400 text-sm">Vault Balance</span>
              <span className="text-green-400 font-medium">$12,450.00</span>
              <span className="text-gray-400 text-sm ml-4">Active Strategies</span>
              <span className="text-blue-400 font-medium">3</span>
            </div>
          </div>
          {/* 用户信息 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-hidden">
        {children}
        </div>
      </div>
    </div>
  );
};