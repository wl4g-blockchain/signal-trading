import React from 'react';
import { ComponentNode } from '../../types';
import {
  Radio,
  Brain,
  Zap,
  Database,
  Twitter,
  TrendingUp,
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
    case 'cex-executor':
      return TrendingUp;
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
    case 'cex-executor':
      return 'bg-blue-600 border-blue-500';
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

const getDisplayType = (node: ComponentNode): string => {
  switch (node.type) {
    case 'listener':
      return node.data?.type || 'twitter';
    case 'evaluator':
      return node.data?.model || 'deepseek-v3';
    case 'executor':
      // 显示 DEX 名称，如果没有则显示链名称
      const dexName = node.data?.targetDex || '';
      switch (dexName) {
        case 'uniswap':
          return 'Uniswap';
        case 'uniswap-v2':
          return 'Uniswap V2';
        case 'uniswap-v3':
          return 'Uniswap V3';
        case 'uniswap-v4':
          return 'Uniswap V4';
        case 'sushiswap':
          return 'SushiSwap';
        case '1inch':
          return '1inch';
        case 'quickswap':
          return 'QuickSwap';
        case 'pancakeswap':
          return 'PancakeSwap';
        case 'bakeryswap':
          return 'BakerySwap';
        case 'custom':
          return 'Custom DEX';
        default:
          return node.data?.rpcEndpoint || 'mainnet';
      }
    case 'cex-executor':
      // 显示 CEX 名称
      const exchangeName = node.data?.exchange || '';
      switch (exchangeName) {
        case 'binance':
          return 'Binance';
        case 'okx':
          return 'OKX';
        case 'coinbase':
          return 'Coinbase';
        case 'kraken':
          return 'Kraken';
        case 'bybit':
          return 'Bybit';
        case 'kucoin':
          return 'KuCoin';
        default:
          return 'Binance';
      }
    case 'collector':
      return `${node.data?.monitorDuration || 30}min`;
    default:
      return node.data?.type || 'default';
  }
};

export const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  onDragStart,
  onConnectionStart,
  onConnectionEnd,
  onDelete,
  onConfig,
}) => {
  const Icon = getNodeIcon(node.type);
  const SubIcon = getSubIcon(node.type, node.data?.type);
  const colorClass = getNodeColor(node.type);
  const displayType = getDisplayType(node);

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

        {/* Output ports for start node - 四个方向 */}
        {node.type === 'start' && (
          <>
            {/* 右侧输出端口 */}
            <div
              className="absolute right-0 w-1 h-1 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 z-10"
              style={{ right: '-2px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 下侧输出端口 - 在圆形节点边缘 */}
            <div
              className="absolute left-1/2 w-1 h-1 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10"
              style={{ top: '94px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 左侧输出端口 */}
            <div
              className="absolute left-0 w-1 h-1 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 z-10"
              style={{ left: '-2px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 上侧输出端口 */}
            <div
              className="absolute top-0 left-1/2 w-1 h-1 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10"
              style={{ top: '-2px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
          </>
        )}
        
        {/* Input ports for end node - 四个方向 */}
        {node.type === 'end' && (
          <>
            {/* 左侧输入端口 */}
            <div
              className="absolute left-0 w-1 h-1 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 z-10"
              style={{ left: '-2px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
            />
            {/* 上侧输入端口 - 在圆形节点边缘 */}
            <div
              className="absolute left-1/2 w-1 h-1 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10"
              style={{ top: '-2px' }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
            />
            {/* 右侧输入端口 */}
            <div
              className="absolute right-0 w-1 h-1 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 z-10"
              style={{ right: '-2px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
            />
            {/* 下侧输入端口 - 在圆形节点边缘 */}
            <div
              className="absolute left-1/2 w-1 h-1 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10"
              style={{ top: '94px' }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
            />
          </>
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
          {displayType && (
            <div className="mb-2">
              <span className="text-gray-400">Type: </span>
              <span className="text-blue-400">{displayType}</span>
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

        {/* Input/Output Ports - 四个方向的端口 */}
        {node.inputs.length > 0 && (
          <>
            {/* 左侧输入端口 */}
            <div
              className="absolute left-0 top-1/2 w-1 h-1 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-y-1/2 z-10"
              style={{ left: '-2px' }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
            />
            {/* 上侧输入端口 */}
            <div
              className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10"
              style={{ top: '-2px' }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
            />
          </>
        )}

        {node.outputs.length > 0 && (
          <>
            {/* 右侧输出端口 */}
            <div
              className="absolute right-0 top-1/2 w-1 h-1 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-y-1/2 z-10"
              style={{ right: '-2px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 下侧输出端口 */}
            <div
              className="absolute bottom-0 left-1/2 w-1 h-1 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10"
              style={{ bottom: '-2px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};