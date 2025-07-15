import React, { useState, useEffect } from 'react';
import { ComponentNode, Connection } from '../../types';
import { Canvas } from './Canvas';
import { ComponentPalette } from './ComponentPalette';
import { WorkflowList } from './WorkflowList';
import { Play, Pause, Save, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { serviceManager } from '../../services';

export const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<ComponentNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showWorkflowList, setShowWorkflowList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  // Initialize with start and end nodes
  useEffect(() => {
    if (nodes.length === 0) {
      const startNode: ComponentNode = {
        id: 'start-node',
        type: 'start',
        position: { x: 50, y: 200 },
        data: { name: 'Start', status: 'idle' },
        inputs: [],
        outputs: ['trigger'],
      };

      const endNode: ComponentNode = {
        id: 'end-node',
        type: 'end',
        position: { x: 800, y: 200 },
        data: { name: 'End', status: 'idle' },
        inputs: ['result'],
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
        type: getDefaultSubtype(type),
        status: 'idle',
      },
      inputs: getInputs(type),
      outputs: getOutputs(type),
    };
    setNodes([...nodes, newNode]);
  };

  const getDefaultSubtype = (type: string) => {
    switch (type) {
      case 'listener': return 'twitter';
      case 'evaluator': return 'default';
      case 'executor': return 'swap';
      case 'collector': return 'async';
      default: return 'default';
    }
  };

  const getInputs = (type: string) => {
    switch (type) {
      case 'start': return [];
      case 'end': return ['result'];
      case 'listener': return [];
      case 'evaluator': return ['trigger', 'data'];
      case 'executor': return ['strategy'];
      case 'collector': return ['tx_result'];
      default: return [];
    }
  };

  const getOutputs = (type: string) => {
    switch (type) {
      case 'start': return ['trigger'];
      case 'end': return [];
      case 'listener': return ['data'];
      case 'evaluator': return ['strategy'];
      case 'executor': return ['tx_result'];
      case 'collector': return ['result'];
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
            
              onClick={handleSaveWorkflow}
              disabled={saving}
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
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
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <Canvas
            nodes={nodes}
            connections={connections}
            onNodesChange={setNodes}
            onConnectionsChange={setConnections}
          />
        </div>
      </div>

      {/* Component Palette */}
      <ComponentPalette onAddNode={addNode} />

      {/* Workflow List Panel */}
      <div className={`absolute bottom-0 left-0 right-80 bg-gray-800 border-t border-gray-700 transition-transform duration-300 ${
        showWorkflowList ? 'translate-y-0' : 'translate-y-full'
      }`} style={{ height: '40%' }}>
        <div className="flex items-center justify-center py-2 border-b border-gray-700 cursor-pointer"
             onClick={() => setShowWorkflowList(!showWorkflowList)}>
          {showWorkflowList ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <WorkflowList onLoadWorkflow={handleLoadWorkflow} />
      </div>
    </div>
  );
};