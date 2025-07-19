import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowRun } from '../../types';
import { serviceManager } from '../../services';
import { Play, History, ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface WorkflowListProps {
  onLoadWorkflow: (workflow: Workflow) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ onLoadWorkflow }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
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

  const handleViewRunDetails = async (runId: string) => {
    try {
      const run = await serviceManager.getService().getWorkflowRun(runId);
      const workflow = await serviceManager.getService().getWorkflow(run.workflowId);
      // Create a read-only version of the workflow with run states
      const workflowWithRunStates = {
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
      onLoadWorkflow(workflowWithRunStates);
    } catch (error) {
      console.error('Failed to load workflow run details:', error);
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
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className={`${isDark ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-50'} rounded-md px-3 py-2 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{workflow.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                            workflow.status === 'running' ? 'bg-green-500 text-white' :
                            workflow.status === 'paused' ? 'bg-yellow-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {workflow.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('workflow.created')}: {workflow.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* 运行状态统计 - 与按钮垂直对齐 */}
                      <div className="flex items-center space-x-3 mr-3">
                        <div className="flex items-center space-x-1" title="Success">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>12</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Failed">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>2</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Running">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>1</span>
                        </div>
                        <div className="flex items-center space-x-1" title="Queued">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>0</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleRedesign(workflow.id)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                          title={t('workflow.redesign', '重新设计')}
                        >
                          <Play className="w-3 h-3" />
                          <span>{t('workflow.design')}</span>
                        </button>
                        
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
                        
                        <button
                          onClick={() => loadWorkflowRuns(workflow.id)}
                          className={`flex items-center space-x-1 px-2 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded text-xs transition-colors`}
                          title={t('workflow.runHistory', '运行记录')}
                        >
                          <History className="w-3 h-3" />
                          <span>{t('workflow.runs')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {workflows.length === 0 && (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-sm">暂无工作流</p>
                    <p className="text-xs mt-1">创建您的第一个工作流开始使用</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center space-x-3`}>
            <button
              onClick={() => setView('workflows')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('workflow.title')}</span>
            </button>
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>/</span>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('workflow.runHistory')}</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="space-y-1">
                {workflowRuns.map((run) => (
                  <div key={run.id} className={`${isDark ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white border border-gray-200 hover:bg-gray-50'} rounded-md px-3 py-1.5 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>{run.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusBg(run.state)} text-white flex-shrink-0`}>
                            {run.state}
                          </span>
                        </div>
                        
                        <div className={`flex items-center space-x-3 mt-0.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span className="text-xs">{new Date(run.startDate).toLocaleString('zh-CN', { 
                              month: '2-digit', 
                              day: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-2.5 h-2.5" />
                            <span className={`text-xs ${run.profit.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${run.profit.amount.toFixed(2)} ({run.profit.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          
                          <span className="capitalize text-xs">{run.runType}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewRunDetails(run.id)}
                          className={`px-2 py-1 ${isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} rounded text-xs transition-colors`}
                          title={t('workflow.viewDetails', '查看详情')}
                        >
                          {t('workflow.details', '详情')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {workflowRuns.length === 0 && (
                  <div className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-xs">{t('workflow.noRunHistory')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};