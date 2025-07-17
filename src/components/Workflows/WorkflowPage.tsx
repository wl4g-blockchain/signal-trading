import React, { useState, useEffect } from 'react';
import { ComponentNode, Connection } from '../../types';
import { Canvas } from './Canvas';
import { ComponentPalette } from './ComponentPalette';
import { WorkflowList } from './WorkflowList';
import { Play, Pause, Save, Settings, ChevronUp, ChevronDown } from 'lucide-react';
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

  // 监听画布缩放更新
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
          targetDex: 'uniswap',
          dexAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
          allowedTradingPairs: ['WETH/USDC', 'WETH/USDT'],
          maxAmount: 0.1,
          minAmount: 0.01,
          slippagePercent: 1.0,
          gasStrategy: 'standard'
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
      const savedWorkflow = await serviceManager.getService().saveWorkflow(workflow);
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

  const handleLoadWorkflow = (workflow: any) => {
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
            
            {/* 缩放控制器 - 移动到右上角 */}
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
              // 删除节点及其相关连接
              setNodes(nodes.filter(n => n.id !== nodeId));
              setConnections(connections.filter(c => c.source !== nodeId && c.target !== nodeId));
            }}
          />
        </div>
      </div>

      {/* Component Palette */}
      <ComponentPalette onAddNode={addNode} />

      {/* Workflow List Panel */}
      <div className="absolute bottom-0 left-0 right-80 z-10">
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