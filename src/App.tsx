import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginPage } from './components/Auth/LoginPage';
import { WorkflowPage } from './components/Workflows/WorkflowPage';
import { LiveDashboard } from './components/Dashboard/Dashboard';
import { Settings } from './components/Settings/Settings';
import { User, Workflow } from './types';
import { apiServiceFacade } from './services';

function App() {
  const [currentView, setCurrentView] = useState('monitor');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [workflowReadOnlyMode, setWorkflowReadOnlyMode] = useState<{ workflowId: string; tradeId: string } | null>(null);
  const [readOnlyWorkflow, setReadOnlyWorkflow] = useState<Workflow | null>(null);
  const [loadingReadOnlyWorkflow, setLoadingReadOnlyWorkflow] = useState(false);
  const [initialWorkflowId, setInitialWorkflowId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const currentUser = await apiServiceFacade.getService().getCurrentUser() as User;
        if (currentUser) {
          setUser(currentUser);
          
          // Auto-fetch notifications after successful authentication
          try {
            await apiServiceFacade.getService().getNotifications();
            console.debug('Initial notifications loaded successfully');
          } catch (notificationError) {
            console.error('Failed to load initial notifications:', notificationError);
          }
        }
      } catch {
        console.debug('No user logged in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for sidebar collapse events, workflow run navigation, and exit readonly mode
  useEffect(() => {
    const handleSidebarCollapse = (event: CustomEvent) => {
      console.debug('🔄 App: Received collapse-sidebar event:', event.detail.collapsed);
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

    const handleRedesignWorkflow = (event: CustomEvent) => {
      const { workflowId } = event.detail;
      console.debug('📨 App: Received redesign-workflow event:', workflowId);
      handleLoadWorkflowForEdit(workflowId);
    };

    window.addEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
    window.addEventListener('navigate-to-workflow-run', handleWorkflowRunNavigation as EventListener);
    window.addEventListener('exit-readonly-mode', handleExitReadOnlyMode as EventListener);
    window.addEventListener('navigate-to-workflows', handleNavigateToWorkflows as EventListener);
    window.addEventListener('redesign-workflow', handleRedesignWorkflow as EventListener);
    
    return () => {
      window.removeEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
      window.removeEventListener('navigate-to-workflow-run', handleWorkflowRunNavigation as EventListener);
      window.removeEventListener('exit-readonly-mode', handleExitReadOnlyMode as EventListener);
      window.removeEventListener('navigate-to-workflows', handleNavigateToWorkflows as EventListener);
      window.removeEventListener('redesign-workflow', handleRedesignWorkflow as EventListener);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle view changes and clear read-only mode when user actively navigates to workflows
  const handleViewChange = (view: string) => {
    // Always clear read-only mode when user clicks workflows menu to ensure design mode
    if (view === 'workflow') {
      setWorkflowReadOnlyMode(null);
      setReadOnlyWorkflow(null);
      // Clear initialWorkflowId when user manually navigates to workflows (new workflow)
      if (currentView !== 'workflow') {
        setInitialWorkflowId(null);
      }
    } else {
      // Clear initialWorkflowId when navigating away from workflow view
      setInitialWorkflowId(null);
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

  const handleLogin = async (userData: User) => {
    setUser(userData);
    
    // Auto-fetch notifications after successful login
    try {
      await apiServiceFacade.getService().getNotifications();
      console.debug('Initial notifications loaded after login');
    } catch (notificationError) {
      console.error('Failed to load initial notifications after login:', notificationError);
    }
  };

  const handleLogout = async () => {
    try {
      await apiServiceFacade.getService().logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigateToWorkflowRun = async (workflowId: string, runId: string) => {
    console.debug('🔄 Loading workflow run:', { workflowId, runId });
    setLoadingReadOnlyWorkflow(true);
    try {
      // Load workflow run details
      const run = await apiServiceFacade.getService().getWorkflowRun(runId);
      console.debug('📊 Workflow run loaded:', run);
      
      const workflow = await apiServiceFacade.getService().getWorkflow(run.workflowId);
      console.debug('🏗️ Workflow loaded:', workflow);
      
      // Create a read-only version of the workflow with run states
      const workflowWithRunStates: Workflow = {
        ...workflow,
        nodes: workflow.nodes.map(node => ({
          ...node,
          runStatus: (run.nodeStates[node.id]?.status as any) || 'skipped',
          runLogs: (run.nodeStates[node.id]?.logs || []).map((log: string) => ({
            timestamp: new Date().toISOString(),
            level: 'info' as const,
            message: log,
            data: null
          })),
          readonly: true
        }))
      };

      console.debug('✅ Workflow with run states created:', workflowWithRunStates);
      
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

  // Handle loading specific workflow for editing (ReDesign functionality)
  const handleLoadWorkflowForEdit = (workflowId: string) => {
    console.debug('🎯 App: Loading workflow for edit:', workflowId);
    setInitialWorkflowId(workflowId);
    setCurrentView('workflow'); // Switch to workflow view
    // Clear read-only mode
    setWorkflowReadOnlyMode(null);
    setReadOnlyWorkflow(null);
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
            key={`workflow-${Date.now()}-${initialWorkflowId || 'new'}`} // Force re-render when workflow changes
            readOnlyMode={null} 
            readOnlyWorkflow={null}
            onExitReadOnlyMode={undefined}
            initialWorkflowId={initialWorkflowId || undefined}
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