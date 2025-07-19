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

  // Listen for sidebar collapse events, workflow run navigation, and exit readonly mode
  useEffect(() => {
    const handleSidebarCollapse = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    const handleWorkflowRunNavigation = (event: CustomEvent) => {
      const { workflowId, runId } = event.detail;
      handleNavigateToWorkflowRun(workflowId, runId);
    };

    const handleExitReadOnlyMode = () => {
      setWorkflowReadOnlyMode(null);
      setReadOnlyWorkflow(null);
    };

    const handleNavigateToWorkflows = () => {
      // Force clear read-only mode and navigate to workflows
      setWorkflowReadOnlyMode(null);
      setReadOnlyWorkflow(null);
      setCurrentView('workflow');
    };

    window.addEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
    window.addEventListener('navigate-to-workflow-run', handleWorkflowRunNavigation as EventListener);
    window.addEventListener('exit-readonly-mode', handleExitReadOnlyMode as EventListener);
    window.addEventListener('navigate-to-workflows', handleNavigateToWorkflows as EventListener);
    
    return () => {
      window.removeEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
      window.removeEventListener('navigate-to-workflow-run', handleWorkflowRunNavigation as EventListener);
      window.removeEventListener('exit-readonly-mode', handleExitReadOnlyMode as EventListener);
      window.removeEventListener('navigate-to-workflows', handleNavigateToWorkflows as EventListener);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle view changes and clear read-only mode when user actively navigates to workflows
  const handleViewChange = (view: string) => {
    // Always clear read-only mode when user clicks workflows menu to ensure design mode
    if (view === 'workflow') {
      setWorkflowReadOnlyMode(null);
      setReadOnlyWorkflow(null);
    }
    setCurrentView(view);
    
    // Force re-render by updating state
    if (view === 'workflow' && workflowReadOnlyMode) {
      // Add a small delay to ensure state updates are applied
      setTimeout(() => {
        setCurrentView('workflow');
      }, 10);
    }
  };

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
      // Don't change currentView, keep user's current menu selection state
    } catch (error) {
      console.error('❌ Failed to load workflow run:', error);
    } finally {
      setLoadingReadOnlyWorkflow(false);
    }
  };

  const handleExitReadOnlyMode = () => {
    setWorkflowReadOnlyMode(null);
    setReadOnlyWorkflow(null);
    // Don't change currentView, let user return to previous page
  };

  const renderCurrentView = () => {
    // Show loading state when navigating to workflow run
    if (loadingReadOnlyWorkflow) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    // If there's a read-only workflow, show WorkflowPage in read-only mode
    if (workflowReadOnlyMode && readOnlyWorkflow) {
      return (
        <WorkflowPage 
          readOnlyMode={workflowReadOnlyMode} 
          readOnlyWorkflow={readOnlyWorkflow}
          onExitReadOnlyMode={handleExitReadOnlyMode} 
        />
      );
    }

    // Normal view rendering logic - ensure clean state for workflow design
    switch (currentView) {
      case 'monitor':
        return (
          <LiveDashboard 
            showReports={true} 
            onNavigateToWorkflowRun={handleNavigateToWorkflowRun}
          />
        );
      case 'workflow':
        return (
          <WorkflowPage 
            key={`workflow-${Date.now()}`} // Force re-render when returning from read-only mode
            readOnlyMode={null} 
            readOnlyWorkflow={null}
            onExitReadOnlyMode={undefined} 
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
      onViewChange={handleViewChange}
      user={user}
      onLogout={handleLogout}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={setSidebarCollapsed}
      onNavigateToWorkflowRun={handleNavigateToWorkflowRun}
    >
      {renderCurrentView()}
    </Layout>
  );
}

export default App;