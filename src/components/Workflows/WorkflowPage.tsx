import React, { useState, useEffect } from 'react';
import { ComponentNode, Connection, Workflow } from '../../types';
import { Canvas } from './WorkflowCanvas';
import { WorkflowRunCanvas } from './WorkflowRunCanvas';
import { ComponentPalette, ComponentPaletteCollapsed } from './ComponentPalette';
import { WorkflowList } from './WorkflowList';
import { Play, Pause, Save, Settings, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { serviceManager } from '../../services';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface WorkflowPageProps {
  readOnlyMode?: { workflowId: string; tradeId: string } | null;
  readOnlyWorkflow?: Workflow | null;
  onExitReadOnlyMode?: () => void;
}

export const WorkflowPage: React.FC<WorkflowPageProps> = ({ 
  readOnlyMode, 
  readOnlyWorkflow,
  onExitReadOnlyMode 
}) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [workflowName, setWorkflowName] = useState(t('workflow.untitledWorkflow'));
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showWorkflowList, setShowWorkflowList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [canvasScale, setCanvasScale] = useState(100);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Load read-only workflow data if provided
  useEffect(() => {
    console.log('📄 WorkflowPage useEffect triggered:', { readOnlyMode, readOnlyWorkflow });
    
    if (readOnlyMode && readOnlyWorkflow) {
      console.log('🔧 Setting up read-only workflow:', readOnlyWorkflow);
      
      setWorkflowId(readOnlyWorkflow.id);
      setWorkflowName(readOnlyWorkflow.name);
      setNodes(readOnlyWorkflow.nodes || []);
      setConnections(readOnlyWorkflow.connections || []);
      setShowWorkflowList(false); // Hide workflow list in read-only mode
      
      console.log('✅ Read-only workflow setup complete');
      console.log('🔍 Nodes with run status:', readOnlyWorkflow.nodes?.map(n => ({
        id: n.id,
        type: n.type,
        runStatus: n.data?.runStatus,
        readonly: n.data?.readonly
      })));
    }
  }, [readOnlyMode, readOnlyWorkflow]);

  // Smart prediction: Auto-collapse left menu when right panel is collapsed
  const handleRightPanelToggle = () => {
    const newRightPanelState = !rightPanelCollapsed;
    setRightPanelCollapsed(newRightPanelState);
    
    // If right panel is collapsed, auto-collapse left menu and workflow list
    if (newRightPanelState) {
      // Notify App component to collapse left menu via custom event
      const event = new CustomEvent('collapse-sidebar', { detail: { collapsed: true } });
      window.dispatchEvent(event);
      
      // Also collapse workflow list
      setShowWorkflowList(false);
    }
  };

  // Update workflow name when language changes (if it's still the default name)
  useEffect(() => {
    const defaultNames = ['Untitled Workflow', '未命名工作流'];
    if (defaultNames.includes(workflowName)) {
      setWorkflowName(t('workflow.untitledWorkflow'));
    }
  }, [t, workflowName]);

  // Update start/end node names when language changes
  useEffect(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => {
        if (node.type === 'start' && ['Start', '开始'].includes(node.data?.name || '')) {
          return { ...node, data: { ...node.data, name: t('node.start') } };
        } else if (node.type === 'end' && ['End', '结束'].includes(node.data?.name || '')) {
          return { ...node, data: { ...node.data, name: t('node.end') } };
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

  // Initialize with start and end nodes
  useEffect(() => {
    // Only initialize default nodes when not in read-only mode and no existing nodes
    if (nodes.length === 0 && !readOnlyMode) {
      console.log('🚀 Initializing default start/end nodes');
      
      const startNode: ComponentNode = {
        id: 'start-node',
        type: 'start',
        position: { x: 50, y: 200 },
        data: { name: t('node.start'), status: 'idle' },
        inputs: [],
        outputs: ['output'],
      };

      const endNode: ComponentNode = {
        id: 'end-node',
        type: 'end',
        position: { x: 800, y: 200 },
        data: { name: t('node.end'), status: 'idle' },
        inputs: ['input'],
        outputs: [],
      };

      setNodes([startNode, endNode]);
    }
  }, [readOnlyMode]); // Add readOnlyMode as dependency
  
  const addNode = (type: ComponentNode['type']) => {
    if (type === 'start' || type === 'end') return; // Prevent adding multiple start/end nodes

    const newNode: ComponentNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: {
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
        status: 'idle',
        ...getDefaultNodeData(type),
      },
      inputs: getInputs(type),
      outputs: getOutputs(type),
    };
    setNodes([...nodes, newNode]);
  };

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'listener': 
        return { type: 'twitter' };
      case 'evaluator': 
        return { model: 'deepseek-v3' };
      case 'executor': 
        return { 
          rpcEndpoint: 'mainnet',
          vaultAddress: '0x742d35Cc6634C0532925a3b8D401d2EdC8d4a5b1',
                      targetDex: 'uniswap-v4',
            dexAddress: '0x0000000000000000000000000000000000000000',
          allowedTradingPairs: ['WETH/USDC', 'WETH/USDT'],
          maxAmount: 0.1,
          minAmount: 0.01,
          slippagePercent: 1.0,
          gasStrategy: 'standard'
        };
      case 'cex-executor':
        return {
          exchange: 'binance',
          allowedTradingPairs: ['BTC/USDT', 'ETH/USDT'],
          orderType: 'market',
          maxPositionSize: 1000,
          minPositionSize: 10,
          maxSlippage: 0.5
        };
      case 'collector': 
        return { monitorDuration: 30 };
      default: 
        return { type: 'default' };
    }
  };

  const getInputs = (type: string) => {
    switch (type) {
      case 'start': return [];
      case 'end': return ['input'];
      case 'listener': return ['input'];
      case 'evaluator': return ['input'];
      case 'executor': return ['input'];
      case 'cex-executor': return ['input'];
      case 'collector': return ['input'];
      default: return [];
    }
  };

  const getOutputs = (type: string) => {
    switch (type) {
      case 'start': return ['output'];
      case 'end': return [];
      case 'listener': return ['output'];
      case 'evaluator': return ['output'];
      case 'executor': return ['output'];
      case 'cex-executor': return ['output'];
      case 'collector': return ['output'];
      default: return [];
    }
  };

  const handleSaveWorkflow = async () => {
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

      // Save to localStorage first
      localStorage.setItem('current_workflow', JSON.stringify(workflow));

      // Then save via service
      const workflowToSave = {
        ...workflow,
        id: workflowId || '' // Use empty string for new workflows
      };
      const savedWorkflow = await serviceManager.getService().saveWorkflow(workflowToSave);
      setWorkflowId(savedWorkflow.id);
      
      console.log('Workflow saved successfully');
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRunWorkflow = async () => {
    if (!workflowId) {
      await handleSaveWorkflow();
      return;
    }

    setRunning(true);
    try {
      await serviceManager.getService().runWorkflow(workflowId);
      setIsRunning(true);
      console.log('Workflow started successfully');
    } catch (error) {
      console.error('Failed to run workflow:', error);
    } finally {
      setRunning(false);
    }
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    setWorkflowId(workflow.id);
    setWorkflowName(workflow.name);
    setNodes(workflow.nodes || []);
    setConnections(workflow.connections || []);
    setShowWorkflowList(false);
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
              onChange={(e) => setWorkflowName(e.target.value)}
              disabled={!!readOnlyMode}
              className={`${isDark ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500'} px-3 py-2 rounded border focus:outline-none ${readOnlyMode ? 'cursor-not-allowed opacity-50' : ''}`}
            />
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('workflow.nodes')}: {nodes.length}</span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('workflow.connections')}: {connections.length}</span>
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
              <span>{running ? t('workflow.starting') : isRunning ? t('workflow.stop') : t('workflow.run')}</span>
            </button>
            <button
              onClick={handleSaveWorkflow}
              disabled={saving || !!readOnlyMode}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                saving || readOnlyMode 
                  ? `${isDark ? 'bg-gray-600' : 'bg-gray-400'} cursor-not-allowed`
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? t('workflow.saving') : t('common.save')}</span>
            </button>
            <button className={`p-2 ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-500'} text-white rounded transition-colors`}>
              <Settings className="w-4 h-4" />
            </button>
            
            {/* Zoom controls - moved to top right */}
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
                {t('common.reset')}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          {readOnlyMode ? (
            <WorkflowRunCanvas
              nodes={nodes}
              connections={connections}
            />
          ) : (
            <Canvas
              nodes={nodes}
              connections={connections}
              onNodesChange={setNodes}
              onConnectionsChange={setConnections}
              onDeleteNode={(nodeId) => {
                // Delete node and its related connections
                setNodes(nodes.filter(n => n.id !== nodeId));
                setConnections(connections.filter(c => c.source !== nodeId && c.target !== nodeId));
              }}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Component Palette (仅在非只读模式下显示) */}
      {!readOnlyMode && (
        <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border-l ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 relative flex flex-col`}>
          {/* Right Panel Toggle Button */}
          <button
            onClick={handleRightPanelToggle}
            className={`absolute -left-3 top-6 z-10 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full p-1 border ${isDark ? 'border-gray-600' : 'border-gray-300'} transition-colors`}
            title={rightPanelCollapsed ? t('common.expand') : t('common.collapse')}
          >
            {rightPanelCollapsed ? (
              <ChevronLeft className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            ) : (
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
            )}
          </button>

          {rightPanelCollapsed ? (
            /* Collapsed Right Panel - Component Icons - 与 ComponentPalette 保持一致 */
            <div className="p-2 flex flex-col items-center mt-16">
              {/* Title */}
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3 writing-mode-vertical text-center`}>
                COMs
              </div>
              <div className={`w-8 h-px ${isDark ? 'bg-gray-600' : 'bg-gray-300'} mb-3`}></div>
              
              {/* Component icons - 使用与 ComponentPalette 相同的组件列表 */}
              <div className="space-y-2">
                <ComponentPaletteCollapsed 
                  onAddNode={readOnlyMode ? () => {} : addNode} 
                  readOnlyMode={!!readOnlyMode}
                  isDark={isDark}
                  t={t}
                />
              </div>
            </div>
          ) : (
            /* Expanded Right Panel - Component Palette */
            <ComponentPalette onAddNode={readOnlyMode ? () => {} : addNode} />
          )}
        </div>
      )}

      {/* Workflow List Panel - Absolute positioned at bottom */}
      <div className={`absolute bottom-0 left-0 ${readOnlyMode ? 'right-0' : (rightPanelCollapsed ? 'right-12' : 'right-80')} z-10 transition-all duration-300`}>
        {/* Toggle Button - Always Visible */}
        <div className={`flex items-center justify-center py-2 ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} border-t cursor-pointer transition-colors`}
             onClick={() => setShowWorkflowList(!showWorkflowList)}>
          {showWorkflowList ? (
            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`} />
          ) : (
            <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`} />
          )}
        </div>
        
        {/* Panel Content - Conditionally Visible */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t transition-all duration-300 overflow-hidden ${
          showWorkflowList ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`} style={{ height: showWorkflowList ? '40vh' : '0' }}>
          <WorkflowList onLoadWorkflow={handleLoadWorkflow} />
        </div>
      </div>
    </div>
  );
};