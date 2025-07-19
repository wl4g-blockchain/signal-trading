import React, { useState, useEffect } from 'react';
import { ComponentNode, Connection, Workflow } from '../../types';
import { Canvas } from './Canvas';
import { ComponentPalette } from './ComponentPalette';
import { WorkflowList } from './WorkflowList';
import { Play, Pause, Save, Settings, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Radio, Brain, Zap, Database } from 'lucide-react';
import { serviceManager } from '../../services';

export const WorkflowPage: React.FC = () => {
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showWorkflowList, setShowWorkflowList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [canvasScale, setCanvasScale] = useState(100);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Smart prediction: Auto-collapse left menu when right panel is collapsed
  const handleRightPanelToggle = () => {
    const newRightPanelState = !rightPanelCollapsed;
    setRightPanelCollapsed(newRightPanelState);
    
    // If right panel is collapsed, auto-collapse left menu
    if (newRightPanelState) {
      // Notify App component to collapse left menu via custom event
      const event = new CustomEvent('collapse-sidebar', { detail: { collapsed: true } });
      window.dispatchEvent(event);
    }
  };

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
    if (nodes.length === 0) {
      const startNode: ComponentNode = {
        id: 'start-node',
        type: 'start',
        position: { x: 50, y: 200 },
        data: { name: 'Start', status: 'idle' },
        inputs: [],
        outputs: ['output'],
      };

      const endNode: ComponentNode = {
        id: 'end-node',
        type: 'end',
        position: { x: 800, y: 200 },
        data: { name: 'End', status: 'idle' },
        inputs: ['input'],
        outputs: [],
      };

      setNodes([startNode, endNode]);
    }
  }, []);
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
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Nodes: {nodes.length}</span>
              <span className="text-sm text-gray-400">Connections: {connections.length}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunWorkflow}
              disabled={running}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                running
                  ? 'bg-gray-600 cursor-not-allowed'
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
              <span>{running ? 'Starting...' : isRunning ? 'Stop' : 'Run'}</span>
            </button>
            <button
              onClick={handleSaveWorkflow}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            
            {/* Zoom controls - moved to top right */}
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
              <button
                onClick={() => {
                  const event = new CustomEvent('canvas-zoom', { detail: { action: 'in' } });
                  window.dispatchEvent(event);
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
              >
                +
              </button>
              <span className="text-white text-xs min-w-[40px] text-center">{canvasScale}%</span>
              <button
                onClick={() => {
                  const event = new CustomEvent('canvas-zoom', { detail: { action: 'out' } });
                  window.dispatchEvent(event);
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
              >
                -
              </button>
              <button
                onClick={() => {
                  const event = new CustomEvent('canvas-zoom', { detail: { action: 'reset' } });
                  window.dispatchEvent(event);
                }}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
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
        </div>
      </div>

      {/* Right Panel - Component Palette */}
      <div className={`${rightPanelCollapsed ? 'w-12' : 'w-80'} bg-gray-800 border-l border-gray-700 transition-all duration-300 relative flex flex-col`}>
        {/* Right Panel Toggle Button */}
        <button
          onClick={handleRightPanelToggle}
          className="absolute -left-3 top-6 z-10 bg-gray-700 hover:bg-gray-600 rounded-full p-1 border border-gray-600 transition-colors"
          title={rightPanelCollapsed ? "Expand component panel" : "Collapse component panel"}
        >
          {rightPanelCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-300" />
          )}
        </button>

        {rightPanelCollapsed ? (
          /* Collapsed Right Panel - Component Icons */
          <div className="p-2 flex flex-col items-center mt-16">
            {/* Title */}
            <div className="text-xs text-gray-400 mb-3 writing-mode-vertical text-center">
              Coms
            </div>
            <div className="w-8 h-px bg-gray-600 mb-3"></div>
            
            {/* Component icons */}
            <div className="space-y-2">
              {[
                { type: 'listener', icon: 'Radio', color: 'bg-blue-600 hover:bg-blue-700', title: 'Data Listeners\n监听社交媒体、价格数据' },
                { type: 'evaluator', icon: 'Brain', color: 'bg-purple-600 hover:bg-purple-700', title: 'AI Evaluators\n分析数据生成交易策略' },
                { type: 'executor', icon: 'Zap', color: 'bg-green-600 hover:bg-green-700', title: 'DEX Executor\n去中心化交易所执行' },
                { type: 'cex-executor', icon: 'Zap', color: 'bg-blue-600 hover:bg-blue-700', title: 'CEX Executor\n中心化交易所执行' },
                { type: 'collector', icon: 'Database', color: 'bg-orange-600 hover:bg-orange-700', title: 'Result Collectors\n收集交易执行结果' },
              ].map((component) => {
                const IconComponent = component.icon === 'Radio' ? Radio : 
                                    component.icon === 'Brain' ? Brain :
                                    component.icon === 'Zap' ? Zap : Database;
                return (
                  <button
                    key={component.type}
                    onClick={() => addNode(component.type as ComponentNode['type'])}
                    className={`quick-tooltip w-8 h-8 ${component.color} rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105`}
                    data-tooltip={component.title}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Expanded Right Panel - Component Palette */
          <ComponentPalette onAddNode={addNode} />
        )}
      </div>

      {/* Workflow List Panel */}
      <div className={`absolute bottom-0 left-0 ${rightPanelCollapsed ? 'right-12' : 'right-80'} z-10 transition-all duration-300`}>
        {/* Toggle Button - Always Visible */}
        <div className="flex items-center justify-center py-2 bg-gray-800 border-t border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors"
             onClick={() => setShowWorkflowList(!showWorkflowList)}>
          {showWorkflowList ? (
            <ChevronDown className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          )}
        </div>
        
        {/* Panel Content - Conditionally Visible */}
        <div className={`bg-gray-800 border-t border-gray-700 transition-all duration-300 overflow-hidden ${
          showWorkflowList ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`} style={{ height: showWorkflowList ? '40vh' : '0' }}>
          <WorkflowList onLoadWorkflow={handleLoadWorkflow} />
        </div>
      </div>
    </div>
  );
};