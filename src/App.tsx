import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './components/Auth/LoginPage';
import { WorkflowBuilder } from './components/WorkflowBuilder/WorkflowBuilder';
import { LiveMonitor } from './components/Monitor/LiveMonitor';
import { Reports } from './components/Reports/Reports';
import { Settings } from './components/Settings/Settings';
import { User } from './types';
import { serviceManager } from './services';

function App() {
  const [currentView, setCurrentView] = useState('monitor');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = await serviceManager.getService().getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.log('No user logged in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await serviceManager.getService().logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'monitor':
        return <LiveMonitor />;
      case 'workflow':
        return <WorkflowBuilder />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <LiveMonitor />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onViewChange={setCurrentView}
      user={user}
      onLogout={handleLogout}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;