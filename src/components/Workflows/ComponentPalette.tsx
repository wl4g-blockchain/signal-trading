import React from 'react';
import { ComponentNode } from '../../types';
import { Radio, Brain, Zap, Database, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface ComponentPaletteProps {
  onAddNode: (type: ComponentNode['type']) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddNode }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  
  const components = [
    {
      type: 'listener' as const,
      title: t('node.listener'),
      icon: Radio,
      description: t('workflow.listenerDescription'),
      color: 'bg-blue-600 hover:bg-blue-700',
      subtypes: ['twitter', 'trustsocial', 'coinmarketing', 'uniswapv4', 'binance'],
    },
    {
      type: 'evaluator' as const,
      title: t('node.evaluator'),
      icon: Brain,
      description: t('workflow.evaluatorDescription'),
      color: 'bg-purple-600 hover:bg-purple-700',
      subtypes: ['default', 'custom'],
    },
    {
      type: 'executor' as const,
      title: t('node.executor'),
      icon: Zap,
      description: t('workflow.executorDescription'),
      color: 'bg-green-600 hover:bg-green-700',
      subtypes: ['Uniswap V4', 'Uniswap V3', 'QuickSwap', 'PancakeSwap'],
    },
    {
      type: 'cex-executor' as const,
      title: t('node.cexExecutor'),
      icon: Zap,
      description: t('workflow.cexExecutorDescription'),
      color: 'bg-blue-600 hover:bg-blue-700',
      subtypes: ['Binance', 'OKX', 'Coinbase', 'Kraken'],
    },
    {
      type: 'collector' as const,
      title: t('node.collector'),
      icon: Database,
      description: t('workflow.collectorDescription'),
      color: 'bg-orange-600 hover:bg-orange-700',
      subtypes: ['async', 'sync'],
    },
  ];

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('workflow.componentPalette')}</h3>
      
      <div className="space-y-4">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div key={component.type} className={`${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{component.title}</h4>
                </div>
                <button
                  onClick={() => onAddNode(component.type)}
                  className={`p-1 rounded ${component.color} text-white transition-colors`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{component.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {component.subtypes.map((subtype) => (
                  <span
                    key={subtype}
                    className={`px-2 py-1 ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs rounded`}
                  >
                    {subtype}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg`}>
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{t('workflow.connectionRules')}</h4>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
          <p>• Start → Data Listener</p>
          <p>• Data Listener → AI Evaluator</p>
          <p>• AI Evaluator → AI Evaluator (multi-level)</p>
          <p>• AI Evaluator → TX Executor</p>
          <p>• TX Executor → Async Collector</p>
          <p>• Async Collector → End</p>
        </div>
        <div className="mt-3 text-xs text-blue-400">
          <p>💡 Hover over nodes to see delete/config buttons</p>
          <p>🖱️ Right-click + drag to pan canvas</p>
          <p>🔍 Mouse wheel to zoom in/out</p>
        </div>
      </div>
    </div>
  );
};