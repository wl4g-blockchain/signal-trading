import React from 'react';
import { ComponentNode } from '../../types';
import { Radio, Brain, Zap, Database, Plus } from 'lucide-react';

interface ComponentPaletteProps {
  onAddNode: (type: ComponentNode['type']) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddNode }) => {
  const components = [
    {
      type: 'listener' as const,
      title: 'Data Listeners',
      icon: Radio,
      description: 'Monitor social media, price feeds, and market data',
      color: 'bg-blue-600 hover:bg-blue-700',
      subtypes: ['twitter', 'trustsocial', 'coinmarketing', 'uniswapv4', 'binance'],
    },
    {
      type: 'evaluator' as const,
      title: 'AI Evaluators',
      icon: Brain,
      description: 'Analyze data and generate trading strategies',
      color: 'bg-purple-600 hover:bg-purple-700',
      subtypes: ['default', 'custom'],
    },
    {
      type: 'executor' as const,
      title: 'Trade Executors',
      icon: Zap,
      description: 'Execute trades on various exchanges',
      color: 'bg-green-600 hover:bg-green-700',
      subtypes: ['swap', 'arbitrage', 'limit'],
    },
    {
      type: 'collector' as const,
      title: 'Result Collectors',
      icon: Database,
      description: 'Monitor and collect trade execution results',
      color: 'bg-orange-600 hover:bg-orange-700',
      subtypes: ['async', 'sync'],
    },
  ];

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-white mb-4">Component Palette</h3>
      
      <div className="space-y-4">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div key={component.type} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-300" />
                  <h4 className="font-medium text-white">{component.title}</h4>
                </div>
                <button
                  onClick={() => onAddNode(component.type)}
                  className={`p-1 rounded ${component.color} text-white transition-colors`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-3">{component.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {component.subtypes.map((subtype) => (
                  <span
                    key={subtype}
                    className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded"
                  >
                    {subtype}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h4 className="font-medium text-white mb-2">Connection Rules</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Start → Listener</p>
          <p>• Listener → Evaluator</p>
          <p>• Evaluator → Executor</p>
          <p>• Executor → Collector</p>
          <p>• Collector → End</p>
        </div>
      </div>
    </div>
  );
};