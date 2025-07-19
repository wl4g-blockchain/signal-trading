import React from 'react';
import { ComponentNode } from '../../types';
import { Radio, Brain, Zap, Database, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

// Component configuration data - extracted for reuse
export const getComponentsConfig = (t: (key: string) => string) => [
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

interface ComponentPaletteProps {
  onAddNode: (type: ComponentNode['type']) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddNode }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const components = getComponentsConfig(t);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        {t('workflow.componentPalette')}
      </h3>
      
      {/* Connection Rules - Moved to top */}
      <div className={`mb-6 p-3 ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg`}>
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-sm`}>{t('workflow.connectionRules')}</h4>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
          <p>• {t('node.start')} → {t('node.listener')}</p>
          <p>• {t('node.listener')} → {t('node.evaluator')}</p>
          <p>• {t('node.evaluator')} → {t('node.evaluator')} ({t('workflow.multiLevel')})</p>
          <p>• {t('node.evaluator')} → {t('node.executor')}</p>
          <p>• {t('node.executor')} → {t('node.collector')}</p>
          <p>• {t('node.collector')} → {t('node.end')}</p>
        </div>
        <div className={`mt-2 text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <p>💡 {t('workflow.hoverNodeTip')}</p>
          <p>🖱️ {t('workflow.rightClickDragTip')}</p>
          <p>🔍 {t('workflow.mouseWheelZoomTip')}</p>
        </div>
      </div>
      
      {/* Components - Compressed height for better visibility */}
      <div className="space-y-2">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div 
              key={component.type} 
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-white border border-gray-200 hover:border-gray-300'} rounded-lg p-3 group transition-all duration-200`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{component.title}</h4>
                </div>
                <button
                  onClick={() => onAddNode(component.type)}
                  className={`p-1.5 rounded ${component.color} text-white transition-all duration-200 hover:scale-105 active:scale-95`}
                  title={`${t('common.create')} ${component.title}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 leading-relaxed`}>{component.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {component.subtypes.map((subtype) => (
                  <span
                    key={subtype}
                    className={`px-2 py-0.5 ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs rounded`}
                  >
                    {subtype}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Collapsed state component palette - Ensures consistency when expanded/collapsed
interface ComponentPaletteCollapsedProps {
  onAddNode: (type: ComponentNode['type']) => void;
  readOnlyMode?: boolean;
  isDark: boolean;
  t: (key: string) => string;
}

export const ComponentPaletteCollapsed: React.FC<ComponentPaletteCollapsedProps> = ({ 
  onAddNode, 
  readOnlyMode, 
  isDark, 
  t 
}) => {
  const components = getComponentsConfig(t);

  return (
    <>
      {components.map((component) => {
        const Icon = component.icon;
        return (
          <div key={component.type} className="group relative">
            <button
              onClick={() => !readOnlyMode && onAddNode(component.type)}
              disabled={!!readOnlyMode}
              className={`w-8 h-8 ${readOnlyMode ? 'bg-gray-500 cursor-not-allowed' : component.color} rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-110 active:scale-95 ${readOnlyMode ? 'opacity-50' : ''} group-hover:brightness-110`}
              aria-label={`Add ${component.title} node`}
            >
              <Icon className="w-4 h-4 text-white transition-transform group-hover:scale-105" />
            </button>
            {/* Enhanced Tooltip - Display to left and higher z-index */}
            <div className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${isDark ? 'bg-gray-900 text-white border border-gray-600' : 'bg-white text-gray-800 border border-gray-300'} shadow-2xl min-w-[200px] whitespace-nowrap`} 
                 style={{ zIndex: 50000 }}>
              <div className="font-semibold text-xs mb-1">{component.title}</div>
              <div className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'} whitespace-normal`}>
                {component.description}
              </div>
              {/* Arrow pointer pointing right */}
              <div className={`absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] ${isDark ? 'border-l-gray-900' : 'border-l-white'} border-t-transparent border-b-transparent`}></div>
            </div>
          </div>
        );
      })}
    </>
  );
};