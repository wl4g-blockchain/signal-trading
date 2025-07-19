import React, { useState } from 'react';
import { Github, Loader, Sun, Moon, Globe, Server } from 'lucide-react';
import { serviceManager } from '../../services';
import { User } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { isDark, theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceMode, setServiceMode] = useState<'mock' | 'development' | 'staging' | 'production'>('mock');

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Store service mode for later use
      localStorage.setItem('serviceMode', serviceMode);
      const result = await serviceManager.getService().login('github');
      onLogin(result.user as User);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const serviceModeOptions = [
    {
      value: 'mock' as const,
      label: '演示模式',
      labelEn: 'Demo Mode',
      description: '纯前端演示，使用模拟数据，无需后端服务',
      descriptionEn: 'Frontend demo with mock data, no backend required',
      color: 'bg-purple-500',
      icon: '🎭',
      available: true
    },
    {
      value: 'development' as const,
      label: '开发环境', 
      labelEn: 'Development',
      description: '连接开发服务器，使用测试数据和真实API',
      descriptionEn: 'Connect to development server with test data and real APIs',
      color: 'bg-blue-500',
      icon: '🔧',
      available: true
    },
    {
      value: 'staging' as const,
      label: '测试环境',
      labelEn: 'Staging',
      description: '预发布环境（即将推出）',
      descriptionEn: 'Pre-production environment (Coming Soon)',
      color: 'bg-yellow-500',
      icon: '🧪',
      available: false
    },
    {
      value: 'production' as const,
      label: '生产环境',
      labelEn: 'Production',
      description: '正式生产环境（即将推出）',
      descriptionEn: 'Production environment (Coming Soon)',
      color: 'bg-green-500',
      icon: '🚀',
      available: false
    }
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center relative`}>
      {/* Theme and Language Controls */}
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        {/* Theme Toggle */}
        <div className="flex items-center space-x-1">
          {(['light', 'dark'] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`p-2 rounded-lg transition-colors ${
                theme === themeOption
                  ? 'bg-blue-600 text-white'
                  : `${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`
              }`}
              title={t(`theme.${themeOption}`)}
            >
              {themeOption === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* Language Toggle */}
        <div className="flex items-center space-x-1">
          {(['en', 'zh'] as const).map((langOption) => (
            <button
              key={langOption}
              onClick={() => setLanguage(langOption)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                language === langOption
                  ? 'bg-blue-600 text-white'
                  : `${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`
              }`}
            >
              {langOption === 'en' ? 'EN' : '中'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">SigTrading</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>Focus on AI Trading Platform</p>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-sm mt-4`}>
            {t('auth.loginDescription')}
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-8 shadow-xl`}>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Service Mode Selection */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Server className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {language === 'zh' ? '服务环境' : 'Service Environment'}
                </h3>
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-3`}>
                {language === 'zh' ? '选择要连接的服务环境' : 'Select service environment to connect'}
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {serviceModeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => option.available && setServiceMode(option.value)}
                    disabled={!option.available}
                    className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                      !option.available 
                        ? `${isDark ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'}`
                        : serviceMode === option.value
                        ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400'
                        : `${isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600' : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'}`
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg ${!option.available ? 'opacity-50' : ''}`}>{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm flex items-center space-x-2">
                          <span>{language === 'zh' ? option.label : option.labelEn}</span>
                          {!option.available && (
                            <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                              {language === 'zh' ? '即将推出' : 'Coming Soon'}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          {language === 'zh' ? option.description : option.descriptionEn}
                        </div>
                      </div>
                      {serviceMode === option.value && option.available && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-3 px-6 py-3 ${isDark ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 border-gray-600' : 'bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} rounded-lg transition-colors border`}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              <span>{loading ? t('auth.connecting') : t('auth.loginWithGithub')}</span>
            </button>

            <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              <p>{t('auth.termsAgreement')}</p>
            </div>
          </div>
        </div>

        <div className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          <p>{t('auth.secureAuth')}</p>
        </div>
      </div>
    </div>
  );
};