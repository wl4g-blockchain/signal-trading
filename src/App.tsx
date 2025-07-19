import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './components/Auth/LoginPage';
import { WorkflowPage } from './components/Workflows/WorkflowPage';
import { LiveDashboard } from './components/Dashboard/Dashboard';
import { Settings } from './components/Settings/Settings';
import { User, Workflow } from './types';
import { serviceManager } from './services';

function App() {
  const [currentView, setCurrentView] = useState('monitor');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [workflowReadOnlyMode, setWorkflowReadOnlyMode] = useState<{ workflowId: string; tradeId: string } | null>(null);
  const [readOnlyWorkflow, setReadOnlyWorkflow] = useState<Workflow | null>(null);
  const [loadingReadOnlyWorkflow, setLoadingReadOnlyWorkflow] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = await serviceManager.getService().getCurrentUser() as User;
        if (currentUser) {
          setUser(currentUser);
        }
      } catch {
        console.log('No user logged in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarCollapse = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
    return () => {
      window.removeEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
    };
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

  const handleNavigateToWorkflowRun = async (workflowId: string, runId: string) => {
    console.log('🔄 Loading workflow run:', { workflowId, runId });
    setLoadingReadOnlyWorkflow(true);
    try {
      // Load workflow run details
      const run = await serviceManager.getService().getWorkflowRun(runId);
      console.log('📊 Workflow run loaded:', run);
      
      const workflow = await serviceManager.getService().getWorkflow(run.workflowId);
      console.log('🏗️ Workflow loaded:', workflow);
      
      // Create a read-only version of the workflow with run states
      const workflowWithRunStates: Workflow = {
        ...workflow,
        nodes: workflow.nodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            runStatus: run.nodeStates[node.id]?.status || 'skipped',
            runLogs: run.nodeStates[node.id]?.logs || [],
            readonly: true
          }
        }))
      };

      console.log('✅ Workflow with run states created:', workflowWithRunStates);
      
      setReadOnlyWorkflow(workflowWithRunStates);
      setWorkflowReadOnlyMode({ workflowId, tradeId: runId });
      setCurrentView('workflow');
    } catch (error) {
      console.error('❌ Failed to load workflow run:', error);
    } finally {
      setLoadingReadOnlyWorkflow(false);
    }
  };

  const handleExitReadOnlyMode = () => {
    setWorkflowReadOnlyMode(null);
    setReadOnlyWorkflow(null);
    // 返回到Dashboard页面，因为通常是从Dashboard的trade详情进入只读模式
    setCurrentView('monitor');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'monitor':
        return (
          <LiveDashboard 
            showReports={true} 
            onNavigateToWorkflowRun={handleNavigateToWorkflowRun}
          />
        );
      case 'workflow':
        if (loadingReadOnlyWorkflow) {
          return (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          );
        }
        return (
          <WorkflowPage 
            readOnlyMode={workflowReadOnlyMode} 
            readOnlyWorkflow={readOnlyWorkflow}
            onExitReadOnlyMode={handleExitReadOnlyMode} 
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <LiveDashboard 
            showReports={true} 
            onNavigateToWorkflowRun={handleNavigateToWorkflowRun}
          />
        );
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
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={setSidebarCollapsed}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;