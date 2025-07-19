import React, { useState } from 'react';
import { BarChart3, Settings, Activity, FileText, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceManager, ApiType } from '../services';
import { User as UserType } from '../types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SigTradingIcon } from './SigTradingIcon';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  user: UserType;
  onLogout: () => void;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onViewChange, 
  user, 
  onLogout,
  sidebarCollapsed: externalSidebarCollapsed,
  onSidebarCollapsedChange
}) => {
  const { t } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [apiType, setApiType] = useState<ApiType>(serviceManager.getCurrentApiType());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState(false);
  
  // Use external state or internal state
  const sidebarCollapsed = externalSidebarCollapsed !== undefined ? externalSidebarCollapsed : internalSidebarCollapsed;
  const setSidebarCollapsed = (collapsed: boolean) => {
    if (onSidebarCollapsedChange) {
      onSidebarCollapsedChange(collapsed);
    } else {
      setInternalSidebarCollapsed(collapsed);
    }
  };

  const navItems = [
    { id: 'monitor', label: t('navigation.dashboard'), icon: Activity },
    { id: 'workflow', label: t('navigation.workflows'), icon: BarChart3 },
  ];

  const handleAPISwitch = (type: ApiType) => {
    serviceManager.switchService(type);
    setApiType(type);
  };

  // Close menus when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('.menu-container')) {
      setShowUserMenu(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} flex`}>
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 relative`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`absolute -right-3 top-6 z-10 ${isDark ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'} rounded-full p-1 border transition-colors`}
          title={sidebarCollapsed ? t('common.expand') : t('common.collapse')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          ) : (
            <ChevronLeft className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          )}
        </button>

        <div className="p-6">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <SigTradingIcon size="large" />
              <div>
                <h1 className="text-xl font-bold text-blue-400">SigTrading</h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Focus on AI Trading</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="SigTrading">
              <SigTradingIcon size="small" className="hover:scale-110 transition-transform" />
            </div>
          )}
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-6'} py-3 text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                    : `${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 mr-3" />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>
        {/* Footer API Mode & Vault Balance */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Bar */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
          {/* Left side - Balance Information */}
          <div className="flex items-center space-x-4">
            {/* DEX Balance */}
            <div className={`flex flex-col ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-2`}>
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>DEX Balance</div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 font-medium text-sm">$12,450.00</span>
              </div>
              <div className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-xs`}>
                ETH: $8,200 | BSC: $4,250
              </div>
            </div>
            
            {/* CEX Balance */}
            <div className={`flex flex-col ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-2`}>
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>CEX Balance</div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400 font-medium text-sm">$8,325.50</span>
              </div>
              <div className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-xs`}>
                Binance: $5,100 | OKX: $3,225.50
              </div>
            </div>
            
            {/* Active Strategies */}
            <div className={`flex flex-col ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-2`}>
              <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>Active</div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-400 font-medium text-sm">3 策略</span>
              </div>
              <div className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-xs`}>
                运行中
              </div>
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-4">

            {/* User Info */}
            <div className="relative menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
                <div className="text-left">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-64 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border py-2 z-50`}>
                  {/* User Info Section */}
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    {/* Settings Group */}
                    <button
                      onClick={() => {
                        onViewChange('settings');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-left ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                    >
                      <Settings className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">{t('navigation.settings')}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Trading & General Settings</div>
                      </div>
                    </button>

                    {/* Theme & Language & Service Mode */}
                    <div className={`px-4 py-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-2`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>PREFERENCES</div>
                      
                      {/* Service Mode Toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Service Mode</span>
                        <div className="flex items-center space-x-1">
                          {(['MOCK', 'API'] as const).map((serviceOption) => (
                            <button
                              key={serviceOption}
                              onClick={() => handleAPISwitch(serviceOption)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                apiType === serviceOption
                                  ? 'bg-blue-600 text-white'
                                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                              }`}
                            >
                              {serviceOption}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Quick Theme Toggle */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('settings.theme')}</span>
                        <div className="flex items-center space-x-1">
                          {(['light', 'dark'] as const).map((themeOption) => (
                            <button
                              key={themeOption}
                              onClick={() => setTheme(themeOption)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                theme === themeOption
                                  ? 'bg-blue-600 text-white'
                                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                              }`}
                            >
                              {themeOption === 'light' ? '☀️' : '🌙'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Language Toggle */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('settings.language')}</span>
                        <div className="flex items-center space-x-1">
                          {(['en', 'zh'] as const).map((langOption) => (
                            <button
                              key={langOption}
                              onClick={() => setLanguage(langOption)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                language === langOption
                                  ? 'bg-blue-600 text-white'
                                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                              }`}
                            >
                              {langOption === 'en' ? 'EN' : '中'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Logout */}
                    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-2 pt-2`}>
                      <button
                        onClick={onLogout}
                        className={`w-full flex items-center space-x-2 px-4 py-2 text-left ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('auth.logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
        {children}
        </div>
      </div>
    </div>
  );
};