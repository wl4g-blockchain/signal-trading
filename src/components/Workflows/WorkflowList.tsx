import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowRun } from '../../types';
import { serviceManager } from '../../services';
import { Play, History, ArrowLeft, Calendar, DollarSign } from 'lucide-react';

interface WorkflowListProps {
  onLoadWorkflow: (workflow: Workflow) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onLoadWorkflow }) => {
  const [workflows, setWorkflowPage] = useState<Workflow[]>([]);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [view, setView] = useState<'workflows' | 'runs'>('workflows');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkflowPage();
  }, []);

  const loadWorkflowPage = async () => {
    setLoading(true);
    try {
      const data = await serviceManager.getService().getWorkflows();
      setWorkflowPage(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowRuns = async (workflowId: string) => {
    setLoading(true);
    try {
      const runs = await serviceManager.getService().getWorkflowRuns(workflowId);
      setWorkflowRuns(runs);
      setSelectedWorkflowId(workflowId);
      setView('runs');
    } catch (error) {
      console.error('Failed to load workflow runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedesign = async (workflowId: string) => {
    try {
      const workflow = await serviceManager.getService().getWorkflow(workflowId);
      onLoadWorkflow(workflow);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'running': return 'text-blue-400';
      case 'queued': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (state: string) => {
    switch (state) {
      case 'success': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'running': return 'bg-blue-600';
      case 'queued': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {view === 'workflows' ? (
        <>
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Workflows</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{workflow.name}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span>Created: {workflow.createdAt.toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            workflow.status === 'running' ? 'bg-green-600 text-green-200' :
                            workflow.status === 'paused' ? 'bg-yellow-600 text-yellow-200' :
                            'bg-gray-600 text-gray-200'
                          }`}>
                            {workflow.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRedesign(workflow.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Design</span>
                        </button>
                        
                        <button
                          onClick={() => loadWorkflowRuns(workflow.id)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
                        >
                          <History className="w-4 h-4" />
                          <span>Runs</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
            <button
              onClick={() => setView('workflows')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>workflows</span>
            </button>
            <span className="text-gray-400">/</span>
            <h3 className="text-lg font-semibold text-white">运行记录</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-3">
                {workflowRuns.map((run) => (
                  <div key={run.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-white">{run.id}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusBg(run.state)} text-white`}>
                            {run.state}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{run.startDate.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span className={run.profit.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                              ${run.profit.amount.toFixed(2)} ({run.profit.percentage.toFixed(2)}%)
                            </span>
                          </div>
                          
                          <span className="capitalize">{run.runType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};