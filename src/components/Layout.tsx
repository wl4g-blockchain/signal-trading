import React, { useState } from 'react';
import { BarChart3, Settings, Activity, FileText, LogOut, User, Globe, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { serviceManager, ApiType } from '../services';
import { User as UserType } from '../types';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [apiType, setApiType] = useState<ApiType>(serviceManager.getCurrentApiType());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
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
    { id: 'settings', label: t('navigation.settings'), icon: Settings },
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
      setShowThemeMenu(false);
      setShowLanguageMenu(false);
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
    <div className="h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-800 border-r border-gray-700 transition-all duration-300 relative`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 z-10 bg-gray-700 hover:bg-gray-600 rounded-full p-1 border border-gray-600 transition-colors"
          title={sidebarCollapsed ? t('common.expand') : t('common.collapse')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          )}
        </button>

        <div className="p-6">
          {!sidebarCollapsed ? (
            <>
              <h1 className="text-xl font-bold text-blue-400">Signal Trading</h1>
              <p className="text-sm text-gray-400 mt-1">AI Trading</p>
            </>
          ) : (
            <div className="flex justify-center">
              <div className="w-14 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg" title="Signal Trading">
                <span className="text-white font-bold text-base tracking-tight">ST</span>
              </div>
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
                    : 'text-gray-300 hover:bg-gray-700'
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
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          {/* Left side - API Mode & Vault Balance */}
          <div className="flex items-center space-x-6">
            {/* API Switcher */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-1">
              <span className="text-sm text-gray-400 mr-2">Service Mode</span>
              <button
                onClick={() => handleAPISwitch('MOCK')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  apiType === 'MOCK'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Mock
              </button>
              <button
                onClick={() => handleAPISwitch('API')}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  apiType === 'API'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                API
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

          {/* Right side - Theme, Language & User */}
          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
            <div className="relative menu-container">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                title={t('settings.theme')}
              >
                <Palette className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">{t(`theme.${theme}`)}</span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                  {(['system', 'light', 'dark'] as const).map((themeOption) => (
                    <button
                      key={themeOption}
                      onClick={() => {
                        setTheme(themeOption);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-left transition-colors ${
                        theme === themeOption
                          ? 'text-blue-400 bg-blue-600 bg-opacity-20'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{t(`theme.${themeOption}`)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative menu-container">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                title={t('settings.language')}
              >
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-300">{t(`language.${language === 'en' ? 'english' : 'chinese'}`)}</span>
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                  {(['en', 'zh'] as const).map((langOption) => (
                    <button
                      key={langOption}
                      onClick={() => {
                        setLanguage(langOption);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-left transition-colors ${
                        language === langOption
                          ? 'text-blue-400 bg-blue-600 bg-opacity-20'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-sm">{t(`language.${langOption === 'en' ? 'english' : 'chinese'}`)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="relative menu-container">
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
                    <span>{t('auth.logout')}</span>
                  </button>
                </div>
              )}
            </div>
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