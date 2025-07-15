import React from 'react';
import { ComponentNode } from '../../types';
import {
  Radio,
  Brain,
  Zap,
  Database,
  Twitter,
  TrendingUp,
  DollarSign,
  BarChart3,
  Trash2,
  Settings,
} from 'lucide-react';

interface NodeComponentProps {
  node: ComponentNode;
  onDragStart: (nodeId: string, event: React.MouseEvent) => void;
  onConnectionStart: (nodeId: string, outputId: string, event: React.MouseEvent) => void;
  onConnectionEnd: (nodeId: string, inputId: string) => void;
  onDelete: (nodeId: string) => void;
  onConfig: (node: ComponentNode) => void;
  isConnecting: boolean;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'start':
      return () => <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">S</div>;
    case 'end':
      return () => <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">E</div>;
    case 'listener':
      return Radio;
    case 'evaluator':
      return Brain;
    case 'executor':
      return Zap;
    case 'collector':
      return Database;
    default:
      return BarChart3;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'start':
      return 'bg-green-600 border-green-500';
    case 'end':
      return 'bg-red-600 border-red-500';
    case 'listener':
      return 'bg-blue-600 border-blue-500';
    case 'evaluator':
      return 'bg-purple-600 border-purple-500';
    case 'executor':
      return 'bg-green-600 border-green-500';
    case 'collector':
      return 'bg-orange-600 border-orange-500';
    default:
      return 'bg-gray-600 border-gray-500';
  }
};

const getSubIcon = (nodeType: string, dataType: string) => {
  if (nodeType === 'listener') {
    switch (dataType) {
      case 'twitter':
      case 'trustsocial':
        return Twitter;
      case 'uniswapv4':
      case 'binance':
        return TrendingUp;
      default:
        return Radio;
    }
  }
  return null;
};

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  onDragStart,
  onConnectionStart,
  onConnectionEnd,
  onDelete,
  onConfig,
  isConnecting,
}) => {
  const Icon = getNodeIcon(node.type);
  const SubIcon = getSubIcon(node.type, node.data?.type);
  const colorClass = getNodeColor(node.type);

  // Special rendering for start/end nodes
  if (node.type === 'start' || node.type === 'end') {
    return (
      <div
        className="absolute cursor-move select-none"
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        }}
        onMouseDown={(e) => onDragStart(node.id, e)}
      >
        <div className={`w-24 h-24 ${colorClass} rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center`}>
          <Icon />
        </div>
        
        <div className="text-center mt-2">
          <span className="text-white font-medium text-sm">{node.data?.name}</span>
        </div>

        {/* Output port for start node */}
        {node.type === 'start' && (
          <div
            className="absolute right-0 top-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-700 cursor-pointer hover:bg-green-400 transform -translate-y-1/2 z-10"
            style={{ right: '-8px' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConnectionStart(node.id, 'output', e);
            }}
          />
        )}
        
        {/* Input port for end node */}
        {node.type === 'end' && (
          <div
            className="absolute left-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-700 cursor-pointer hover:bg-blue-400 transform -translate-y-1/2 z-10"
            style={{ left: '-8px' }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConnectionEnd(node.id, 'input');
            }}
          />
        )}
      </div>
    );
  }
  return (
    <div
      className={`absolute cursor-move select-none`}
      style={{
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      onMouseDown={(e) => onDragStart(node.id, e)}
    >
      <div className={`w-48 bg-gray-700 border-2 ${colorClass} rounded-lg shadow-lg hover:shadow-xl transition-shadow`}>
        {/* Header */}
        <div className={`p-3 ${colorClass} rounded-t-lg flex items-center space-x-2`}>
          <Icon className="w-5 h-5 text-white" />
          {SubIcon && <SubIcon className="w-4 h-4 text-white opacity-80" />}
          <span className="text-white font-medium text-sm flex-1">
            {node.data?.name || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`}
          </span>
          
          {/* 操作按钮 */}
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConfig(node);
              }}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="Configure"
            >
              <Settings className="w-3 h-3 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 hover:bg-red-500 hover:bg-opacity-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 text-sm text-gray-300">
          {node.data?.type && (
            <div className="mb-2">
              <span className="text-gray-400">Type: </span>
              <span className="text-blue-400">{node.data.type}</span>
            </div>
          )}
          {node.data?.status && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                node.data.status === 'active' ? 'bg-green-400' :
                node.data.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`} />
              <span className="capitalize">{node.data.status}</span>
            </div>
          )}
        </div>

        {/* Input/Output Ports */}
        {node.inputs.length > 0 && (
          <div
            className="absolute left-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-700 cursor-pointer hover:bg-blue-400 transform -translate-y-1/2 z-10"
            style={{ left: '-8px' }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConnectionEnd(node.id, 'input');
            }}
          />
        )}

        {node.outputs.length > 0 && (
          <div
            className="absolute right-0 top-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-700 cursor-pointer hover:bg-green-400 transform -translate-y-1/2 z-10"
            style={{ right: '-8px' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConnectionStart(node.id, 'output', e);
            }}
          />
        )}
      </div>
    </div>
  );
};