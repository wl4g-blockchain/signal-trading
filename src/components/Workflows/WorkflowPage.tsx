import React, { useState, useEffect, useCallback } from 'react';
import { ComponentNode, ComponentType, Connection, Workflow } from '../../types';
import { COMPONENT_TYPES } from '../../types/WorkflowTypes';
import { getComponentSchema } from '../../types/ComponentRegistry';
import { Canvas } from './WorkflowCanvas';
import { WorkflowRunCanvas } from './WorkflowRunCanvas';
import { ComponentPalette, ComponentPaletteCollapsed } from './ComponentPalette';
import { WorkflowList } from './WorkflowList';
import { Play, Pause, Save, Settings, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiServiceFacade } from '../../services';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface WorkflowPageProps {
  readOnlyMode?: { workflowId: string; tradeId: string } | null;
  readOnlyWorkflow?: Workflow | null;
  initialWorkflowId?: string;
  onExitReadOnlyMode?: () => void;
}

export const WorkflowPage: React.FC<WorkflowPageProps> = ({ readOnlyMode, readOnlyWorkflow, initialWorkflowId, onExitReadOnlyMode }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [workflowName, setWorkflowName] = useState(t('workflow.untitledWorkflow') || 'Untitled Workflow');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showWorkflowList, setShowWorkflowList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [canvasScale, setCanvasScale] = useState(100);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);
  const [logPanelVisible, setLogPanelVisible] = useState(false);
  const [logPanelWidth, setLogPanelWidth] = useState(480);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Callback to handle log panel state changes
  const handleLogPanelStateChange = useCallback((visible: boolean, panelWidth: number) => {
    setLogPanelVisible(visible);
    setLogPanelWidth(panelWidth);
  }, []);

  // Load workflow data based on different modes
  useEffect(() => {
    console.log('📄 WorkflowPage useEffect triggered:', { readOnlyMode, readOnlyWorkflow, initialWorkflowId });

    // Handle read-only mode with provided workflow data
    if (readOnlyMode && readOnlyWorkflow) {
      console.log('🔧 Setting up read-only workflow:', readOnlyWorkflow);

      setWorkflowId(readOnlyWorkflow.id);
      setWorkflowName(readOnlyWorkflow.name);
      setNodes(readOnlyWorkflow.nodes || []);
      setConnections(readOnlyWorkflow.connections || []);
      setShowWorkflowList(false);
      setHasInitialized(true);

      console.log('✅ Read-only workflow setup complete');
    }
    // Handle initialWorkflowId for ReDesign from workflow runs
    else if (initialWorkflowId && !readOnlyMode) {
      console.log('🚀 Loading workflow for ReDesign, workflowId:', initialWorkflowId);
      loadWorkflowForEdit(initialWorkflowId);
    }
  }, [readOnlyMode, readOnlyWorkflow, initialWorkflowId]);

  // Function to load workflow for editing
  const loadWorkflowForEdit = async (workflowId: string) => {
    try {
      console.log('🔄 Fetching workflow data for edit:', workflowId);
      const workflow = await apiServiceFacade.getService().getWorkflow(workflowId);
      console.log('✅ Workflow data loaded:', workflow);

      setWorkflowId(workflow.id);
      setWorkflowName(workflow.name);
      setNodes(workflow.nodes || []);
      setConnections(workflow.connections || []);
      setShowWorkflowList(false);
      setHasInitialized(true);

      console.log('🎯 Workflow loaded for editing:', workflow.name);
    } catch (error) {
      console.error('❌ Failed to load workflow for editing:', error);
    }
  };

  // Special logic: Only collapse left sidebar when right panel is collapsed
  const handleRightPanelToggle = () => {
    const newRightPanelState = !rightPanelCollapsed;

    console.log('🔄 WorkflowPage: Toggling right panel from', rightPanelCollapsed, 'to', newRightPanelState);

    // Update right panel state immediately
    setRightPanelCollapsed(newRightPanelState);

    // Special logic: Only notify App component when collapsing right panel
    // This ensures left sidebar is also collapsed when right panel is collapsed
    if (newRightPanelState) {
      const event = new CustomEvent('collapse-sidebar', { detail: { collapsed: newRightPanelState } });
      window.dispatchEvent(event);
      console.log('📡 WorkflowPage: Dispatched collapse-sidebar event with collapsed:', newRightPanelState);
    }

    // Hide workflow list when collapsing panels
    if (newRightPanelState) {
      setShowWorkflowList(false);
    }
  };

  // Update workflow name when language changes
  useEffect(() => {
    const defaultNames = ['Untitled Workflow', '未命名工作流'];
    if (defaultNames.includes(workflowName)) {
      setWorkflowName(t('workflow.untitledWorkflow') || 'Untitled Workflow');
    }
  }, [t, workflowName]);

  // Update start/end node names when language changes
  useEffect(() => {
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.type === COMPONENT_TYPES.START && ['Start', '开始'].includes(node.name)) {
          return { ...node, name: t('node.start') || 'Start' };
        } else if (node.type === COMPONENT_TYPES.END && ['End', '结束'].includes(node.name)) {
          return { ...node, name: t('node.end') || 'End' };
        }
        return node;
      })
    );
  }, [t]);

  // Listen for canvas scale updates
  useEffect(() => {
    const handleScaleUpdate = (event: CustomEvent) => {
      setCanvasScale(event.detail.scale);
    };

    window.addEventListener('canvas-scale-update', handleScaleUpdate as EventListener);
    return () => {
      window.removeEventListener('canvas-scale-update', handleScaleUpdate as EventListener);
    };
  }, []);

  // Listen for sidebar collapse events to sync right panel state
  useEffect(() => {
    const handleSidebarCollapse = (event: CustomEvent) => {
      console.log('🔄 WorkflowPage: Received sidebar collapse event:', event.detail.collapsed);
      // Sync right panel with sidebar state
      setRightPanelCollapsed(event.detail.collapsed);
    };

    window.addEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
    return () => {
      window.removeEventListener('collapse-sidebar', handleSidebarCollapse as EventListener);
    };
  }, []);

  // Sync initial state with App component on mount
  useEffect(() => {
    // Get the current sidebar state from App component
    const layoutElement = document.querySelector('[data-sidebar-collapsed]');
    if (layoutElement) {
      const currentSidebarState = layoutElement.getAttribute('data-sidebar-collapsed') === 'true';
      console.log('🔄 WorkflowPage: Syncing initial state with sidebar:', currentSidebarState);
      setRightPanelCollapsed(currentSidebarState);
    }
  }, []);

  // Initialize with start and end nodes only for new workflows
  useEffect(() => {
    if (nodes.length === 0 && !readOnlyMode && !hasInitialized && workflowId === null) {
      console.log('🚀 Initializing default start/end nodes for new workflow');

      const startSchema = getComponentSchema(COMPONENT_TYPES.START);
      const endSchema = getComponentSchema(COMPONENT_TYPES.END);

      const startNode: ComponentNode = {
        id: 'start-node',
        name: t('node.start') || 'Start',
        type: COMPONENT_TYPES.START,
        inputMode: startSchema.inputMode,
        outputMode: startSchema.outputMode,
        icon: startSchema.icon,
        style: startSchema.style,
        position: { x: 50, y: 200 },
        config: { ...startSchema.defaultConfig },
        status: 'idle',
      };

      const endNode: ComponentNode = {
        id: 'end-node',
        name: t('node.end') || 'End',
        type: COMPONENT_TYPES.END,
        inputMode: endSchema.inputMode,
        outputMode: endSchema.outputMode,
        icon: endSchema.icon,
        style: endSchema.style,
        position: { x: 800, y: 200 },
        config: { ...endSchema.defaultConfig },
        status: 'idle',
      };

      setNodes([startNode, endNode]);
      setHasInitialized(true);
    }
  }, [readOnlyMode, hasInitialized, workflowId, nodes.length, t]);

  const addNode = (type: ComponentType) => {
    if (type === COMPONENT_TYPES.START || type === COMPONENT_TYPES.END) return;

    const schema = getComponentSchema(type);
    const newNode: ComponentNode = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      name: schema.name,
      type,
      inputMode: schema.inputMode,
      outputMode: schema.outputMode,
      icon: schema.icon,
      style: schema.style,
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      config: { ...schema.defaultConfig },
      status: 'idle',
    };
    setNodes([...nodes, newNode]);
  };

  // Function to validate workflow configuration
  const validateWorkflowConfig = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if workflow has required nodes
    const hasStart = nodes.some(n => n.type === COMPONENT_TYPES.START);
    const hasEnd = nodes.some(n => n.type === COMPONENT_TYPES.END);

    if (!hasStart) errors.push('Workflow must have a START node');
    if (!hasEnd) errors.push('Workflow must have an END node');

    // Check each node's configuration
    nodes.forEach(node => {
      const nodeErrors = validateNodeConfig(node);
      if (nodeErrors.length > 0) {
        errors.push(`Node "${node.name}": ${nodeErrors.join(', ')}`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  // Function to validate individual node configuration
  const validateNodeConfig = (node: ComponentNode): string[] => {
    const errors: string[] = [];
    const config = node.config || {};

    switch (node.type) {
      case COMPONENT_TYPES.TWITTER_EXTRACTOR:
      case COMPONENT_TYPES.TWITTER_STREAM:
        if (!config.apiKey) errors.push('API key is required');
        if (!config.accounts?.length && !config.keywords?.length) {
          errors.push('At least one account or keyword is required');
        }
        break;

      case COMPONENT_TYPES.BINANCE_EXTRACTOR:
      case COMPONENT_TYPES.BINANCE_STREAM:
        if (!config.apiKey) errors.push('API key is required');
        if (!config.apiSecret) errors.push('API secret is required');
        if (!config.symbols?.length) errors.push('At least one symbol is required');
        break;

      case COMPONENT_TYPES.AI_EVALUATOR:
        if (!config.model) errors.push('AI model is required');
        if (!config.apiKey) errors.push('API key is required');
        if (!config.prompt) errors.push('Analysis prompt is required');
        break;

      case COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR:
        if (!config.apiKey) errors.push('API key is required');
        if (!config.apiSecret) errors.push('API secret is required');
        if (!config.tradingPairs?.length) errors.push('Trading pairs are required');
        if (!config.maxAmount) errors.push('Maximum amount is required');
        break;

      case COMPONENT_TYPES.EVM_TRADE_EXECUTOR:
        if (!config.rpcEndpoint) errors.push('RPC endpoint is required');
        if (!config.privateKey) errors.push('Private key is required');
        if (!config.vaultAddress) errors.push('Vault address is required');
        if (!config.tradingPairs?.length) errors.push('Trading pairs are required');
        break;
    }

    return errors;
  };

  const handleSaveWorkflow = async () => {
    const validation = validateWorkflowConfig();
    if (!validation.isValid) {
      const errorMessage = `Configuration errors:\n${validation.errors.join('\n')}`;
      alert(errorMessage);
      console.error('❌ Workflow validation failed:', validation.errors);
      return;
    }

    setSaving(true);
    try {
      const workflow = {
        id: workflowId,
        name: workflowName,
        nodes,
        connections,
        status: 'draft' as const,
        createdAt: new Date(),
      };

      localStorage.setItem('current_workflow', JSON.stringify(workflow));

      const workflowToSave = {
        ...workflow,
        id: workflowId || '',
      };
      const savedWorkflow = await apiServiceFacade.getService().saveWorkflow(workflowToSave);
      setWorkflowId(savedWorkflow.id);

      console.log('✅ Workflow saved successfully');
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('❌ Failed to save workflow:', error);
      alert('Failed to save workflow. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRunWorkflow = async () => {
    const validation = validateWorkflowConfig();
    if (!validation.isValid) {
      const errorMessage = `Configuration errors:\n${validation.errors.join('\n')}`;
      alert(errorMessage);
      console.error('❌ Workflow validation failed:', validation.errors);
      return;
    }

    if (!workflowId) {
      await handleSaveWorkflow();
      return;
    }

    setRunning(true);
    try {
      await apiServiceFacade.getService().runWorkflow(workflowId);
      setIsRunning(true);
      console.log('✅ Workflow started successfully');
      alert('Workflow started successfully!');
    } catch (error) {
      console.error('❌ Failed to run workflow:', error);
      alert('Failed to start workflow. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    console.log('📄 Loading workflow:', workflow);

    setWorkflowId(workflow.id);
    setWorkflowName(workflow.name);
    setNodes(workflow.nodes || []);
    setConnections(workflow.connections || []);
    setShowWorkflowList(false);
    setHasInitialized(true);

    console.log('✅ Workflow loaded successfully:', workflow.name);
  };

  return (
    <div className="flex h-full relative">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-4 flex items-center justify-between`}>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={workflowName}
              onChange={e => setWorkflowName(e.target.value)}
              disabled={!!readOnlyMode}
              className={`${
                isDark ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'
              } px-3 py-2 rounded border focus:outline-none ${readOnlyMode ? 'cursor-not-allowed opacity-50' : ''}`}
            />
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('workflow.nodes') || 'Nodes'}: {nodes.length}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('workflow.connections') || 'Connections'}: {connections.length}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunWorkflow}
              disabled={running || !!readOnlyMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                running || readOnlyMode
                  ? `${isDark ? 'bg-gray-600' : 'bg-gray-400'} cursor-not-allowed`
                  : isRunning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {running ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{running ? t('workflow.starting') || 'Starting' : isRunning ? t('workflow.stop') || 'Stop' : t('workflow.run') || 'Run'}</span>
            </button>

            <button
              onClick={handleSaveWorkflow}
              disabled={saving || !!readOnlyMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                saving || readOnlyMode ? `${isDark ? 'bg-gray-600' : 'bg-gray-400'} cursor-not-allowed` : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? t('workflow.saving') || 'Saving' : t('common.save') || 'Save'}</span>
            </button>

            <button
              onClick={() => {
                console.log('🆕 Creating new workflow');
                setWorkflowId(null);
                setWorkflowName(t('workflow.untitledWorkflow') || 'Untitled Workflow');
                setNodes([]);
                setConnections([]);
                setHasInitialized(false);
                console.log('✅ New workflow state set');
              }}
              disabled={!!readOnlyMode}
              className={`p-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-500'} text-white rounded transition-colors ${
                readOnlyMode ? 'cursor-not-allowed opacity-50' : ''
              }`}
              title="New Workflow"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Zoom controls */}
            <div className={`flex items-center space-x-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-2`}>
              <button
                onClick={() => {
                  const event = new CustomEvent('canvas-zoom', { detail: { action: 'in' } });
                  window.dispatchEvent(event);
                }}
                className={`px-2 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} rounded text-xs`}
              >
                +
              </button>
              <span className={`text-xs min-w-[40px] text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>{canvasScale}%</span>
              <button
                onClick={() => {
                  const event = new CustomEvent('canvas-zoom', { detail: { action: 'out' } });
                  window.dispatchEvent(event);
                }}
                className={`px-2 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} rounded text-xs`}
              >
                -
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('canvas-zoom', { detail: { action: 'reset' } });
                  window.dispatchEvent(event);
                }}
                className={`px-2 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} rounded text-xs`}
              >
                {t('common.reset') || 'Reset'}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          {readOnlyMode ? (
            <WorkflowRunCanvas nodes={nodes} connections={connections} onLogPanelStateChange={handleLogPanelStateChange} />
          ) : (
            <Canvas
              nodes={nodes}
              connections={connections}
              onNodesChange={setNodes}
              onConnectionsChange={setConnections}
              onDeleteNode={nodeId => {
                setNodes(nodes.filter(n => n.id !== nodeId));
                setConnections(connections.filter(c => c.source !== nodeId && c.target !== nodeId));
              }}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Component Palette */}
      {!readOnlyMode && (
        <div
          className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-l ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } transition-all duration-300 relative flex flex-col`}
        >
          {/* Right Panel Toggle Button */}
          <button
            onClick={handleRightPanelToggle}
            className={`absolute -left-3 top-6 z-10 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full p-1 border ${
              isDark ? 'border-gray-600' : 'border-gray-300'
            } transition-colors`}
            title={rightPanelCollapsed ? t('common.expand') || 'Expand' : t('common.collapse') || 'Collapse'}
          >
            {rightPanelCollapsed ? (
              <ChevronLeft className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            )}
          </button>

          {rightPanelCollapsed ? (
            <div className="flex flex-col items-center h-full overflow-visible" style={{ zIndex: 1 }}>
              {/* Scrollable component container - Fixed overflow to allow tooltips */}
              <div className="flex-1 overflow-y-auto overflow-x-visible p-2 w-full relative mt-16" style={{ zIndex: 1 }}>
                <div className="space-y-2 flex flex-col items-center">
                  <ComponentPaletteCollapsed onAddNode={addNode} readOnlyMode={false} isDark={isDark} t={t} />
                </div>
              </div>
            </div>
          ) : (
            <ComponentPalette onAddNode={addNode} />
          )}
        </div>
      )}

      {/* Workflow List Panel */}
      <div
        className={`absolute bottom-0 left-0 z-0 transition-all duration-300`}
        style={{
          right: readOnlyMode ? (logPanelVisible ? `${logPanelWidth}px` : '0px') : rightPanelCollapsed ? '48px' : '320px',
        }}
      >
        <div
          className={`flex items-center justify-center py-2 ${
            isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'
          } border-t cursor-pointer transition-colors`}
          onClick={() => setShowWorkflowList(!showWorkflowList)}
        >
          {showWorkflowList ? (
            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`} />
          ) : (
            <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`} />
          )}
        </div>

        <div
          className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t transition-all duration-300 overflow-hidden ${
            showWorkflowList ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ height: showWorkflowList ? '40vh' : '0' }}
        >
          <WorkflowList onLoadWorkflow={handleLoadWorkflow} initialWorkflowId={readOnlyWorkflow?.id} readOnlyMode={!!readOnlyMode} />
        </div>
      </div>
    </div>
  );
};
