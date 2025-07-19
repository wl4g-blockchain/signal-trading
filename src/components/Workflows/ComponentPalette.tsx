import React, { useState, useRef, useEffect } from 'react';
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
  const [isCompactMode, setIsCompactMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Detect container width
  useEffect(() => {
    const updateCompactMode = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setIsCompactMode(width < 300);
      }
    };

    updateCompactMode();
    window.addEventListener('resize', updateCompactMode);
    return () => window.removeEventListener('resize', updateCompactMode);
  }, []);
  
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
    <div ref={containerRef} className="flex-1 p-4 overflow-y-auto">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        {isCompactMode ? t('workflow.components') : t('workflow.componentPalette')}
      </h3>
      
      <div className="space-y-4">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div 
              key={component.type} 
              className={`${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg ${isCompactMode ? 'p-2' : 'p-4'} group relative`}
              title={isCompactMode ? `${component.title}: ${component.description}` : ''}
            >
              {isCompactMode ? (
                // Compact mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                      {component.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onAddNode(component.type)}
                    className={`p-1 rounded ${component.color} text-white transition-colors flex-shrink-0`}
                    title={`${t('common.create')} ${component.title}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                // Full mode
                <>
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
                </>
              )}
              
              {/* Hover tooltip (only in compact mode)*/}
              {isCompactMode && (
                <div className={`absolute left-full top-0 ml-2 w-64 ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} border rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-75 z-10`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{component.title}</h4>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{component.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {component.subtypes.map((subtype) => (
                      <span
                        key={subtype}
                        className={`px-1.5 py-0.5 ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-xs rounded`}
                      >
                        {subtype}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={`mt-6 p-4 ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg`}>
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{t('workflow.connectionRules')}</h4>
        {!isCompactMode && (
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
            <p>• {t('node.start')} → {t('node.listener')}</p>
            <p>• {t('node.listener')} → {t('node.evaluator')}</p>
            <p>• {t('node.evaluator')} → {t('node.evaluator')} (多级)</p>
            <p>• {t('node.evaluator')} → {t('node.executor')}</p>
            <p>• {t('node.executor')} → {t('node.collector')}</p>
            <p>• {t('node.collector')} → {t('node.end')}</p>
          </div>
        )}
        <div className={`mt-3 text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <p>💡 {t('workflow.hoverNodeTip')}</p>
          <p>🖱️ {t('workflow.rightClickDragTip')}</p>
          <p>🔍 {t('workflow.mouseWheelZoomTip')}</p>
        </div>
      </div>
    </div>
  );
};