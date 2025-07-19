import React, { useState } from 'react';
import { Github, Loader } from 'lucide-react';
import { serviceManager } from '../../services';
import { User } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await serviceManager.getService().login('github');
      onLogin(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">Signal Trading</h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-lg`}>AI Trading Platform</p>
          <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-sm mt-4`}>
            Connect your GitHub account to access the trading platform
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-8 shadow-xl`}>
          <div className="space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

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
              <span>{loading ? 'Connecting...' : 'Continue with GitHub'}</span>
            </button>

            <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              <p>By signing in, you agree to our Terms of Service</p>
            </div>
          </div>
        </div>

        <div className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
          <p>Secure authentication powered by GitHub OAuth</p>
        </div>
      </div>
    </div>
  );
};