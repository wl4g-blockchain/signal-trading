import React, { useState } from 'react';
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
  Check,
  X,
  Clock,
  Pause,
  FileText
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { NodeRunLogModal } from './NodeRunLogModal';

interface NodeComponentProps {
  node: ComponentNode;
  onDragStart: (nodeId: string, event: React.MouseEvent) => void;
  onConnectionStart: (nodeId: string, outputId: string, event: React.MouseEvent) => void;
  onConnectionEnd: (nodeId: string, inputId: string) => void;
  onDelete: (nodeId: string) => void;
  onConfig: (node: ComponentNode) => void;
  onNodeClick?: (nodeId: string) => void; // Add callback for node clicks in readonly mode
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
      // Show DEX name, if not available show chain name
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
      // Show CEX name
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
  onNodeClick,
}) => {
  const { isDark } = useTheme();
  const [showLogModal, setShowLogModal] = useState(false);
  
  const isReadonly = node.data?.readonly || false;
  const runStatus = node.data?.runStatus;
  const runLogs = node.data?.runLogs || [];
  
  const Icon = getNodeIcon(node.type);
  const SubIcon = getSubIcon(node.type, node.data?.type);
  const colorClass = getNodeColor(node.type);
  const displayType = getDisplayType(node);
  
  // Get run status color and icon
  const getRunStatusColor = () => {
    if (!runStatus) return colorClass;
    switch (runStatus) {
      case 'success': return 'border-green-500 bg-green-500';
      case 'failed': return 'border-red-500 bg-red-500';
      case 'running': return 'border-blue-500 bg-blue-500';
      case 'queued': return 'border-yellow-500 bg-yellow-500';
      default: return colorClass;
    }
  };

  // Get text color based on run status for better readability
  const getRunStatusTextColor = () => {
    // Use consistent white text to ensure color-blind friendly
    return 'text-white';
  };
  
  const getRunStatusIcon = () => {
    if (!runStatus) return null;
    switch (runStatus) {
      case 'success': return <Check className="w-3 h-3 text-white" />; // Use consistent white
      case 'failed': return <X className="w-3 h-3 text-white" />;
      case 'running': return <Clock className="w-3 h-3 text-white animate-spin" />;
      case 'queued': return <Pause className="w-3 h-3 text-white" />; // Use consistent white
      default: return null;
    }
  };
  
  const handleNodeClick = (e: React.MouseEvent) => {
    if (isReadonly && runLogs.length > 0) {
      e.stopPropagation();
      // Use the new callback instead of showing modal
      onNodeClick?.(node.id);
    }
  };

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
          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{node.data?.name}</span>
        </div>

        {/* Output ports for start node - 四个方向 */}
        {node.type === 'start' && (
          <>
            {/* 右侧输出端口 */}
            <div
              className={`absolute right-0 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ right: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 下侧输出端口 - 在圆形节点边缘 */}
            <div
              className={`absolute left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ top: '94px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 左侧输出端口 */}
            <div
              className={`absolute left-0 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ left: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 上侧输出端口 */}
            <div
              className={`absolute top-0 left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ top: '-6px' }}
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
              className={`absolute left-0 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ left: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={(e) => {
                // When mouse enters input port, auto-connect if currently connecting
                const event = e as any;
                                  if (event.buttons === 1) { // Left mouse button pressed
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 上侧输入端口 - 在圆形节点边缘 */}
            <div
              className={`absolute left-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ top: '-6px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={(e) => {
                const event = e as any;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 右侧输入端口 */}
            <div
              className={`absolute right-0 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ right: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={(e) => {
                const event = e as any;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 下侧输入端口 - 在圆形节点边缘 */}
            <div
              className={`absolute left-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ top: '94px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={(e) => {
                const event = e as any;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
          </>
        )}
      </div>
    );
  }
  return (
    <>
      <div
        className={`absolute cursor-move select-none`}
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        }}
        onMouseDown={(e) => onDragStart(node.id, e)}
        onClick={handleNodeClick}
      >
        <div className={`w-48 ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} border-2 ${runStatus ? getRunStatusColor() : colorClass} rounded-lg shadow-lg hover:shadow-xl transition-all ${isReadonly && runLogs.length > 0 ? 'cursor-pointer' : ''}`}>
          {/* Header */}
          <div className={`p-3 ${runStatus ? getRunStatusColor() : colorClass} rounded-t-lg flex items-center space-x-2 relative`}>
            <Icon className={`w-5 h-5 ${runStatus ? getRunStatusTextColor() : 'text-white'}`} />
            {SubIcon && <SubIcon className={`w-4 h-4 ${runStatus ? getRunStatusTextColor() : 'text-white'} opacity-80`} />}
            <span className={`${runStatus ? getRunStatusTextColor() : 'text-white'} font-medium text-sm flex-1`}>
              {node.data?.name || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`}
            </span>
            
            {/* 运行状态指示器 */}
            {runStatus && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                {getRunStatusIcon()}
              </div>
            )}
            
            {/* 操作按钮 */}
            {!isReadonly && (
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
                  <Settings className={`w-3 h-3 ${runStatus ? getRunStatusTextColor() : 'text-white'}`} />
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
                  <Trash2 className={`w-3 h-3 ${runStatus ? getRunStatusTextColor() : 'text-white'}`} />
                </button>
              </div>
            )}
            
            {/* 只读模式下的日志查看提示 */}
            {isReadonly && runLogs.length > 0 && (
              <div className="flex items-center space-x-1">
                <FileText className={`w-3 h-3 ${runStatus ? getRunStatusTextColor() : 'text-white'} opacity-80`} />
              </div>
            )}
          </div>

        {/* Content */}
        <div className={`p-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {displayType && (
            <div className="mb-2">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Type: </span>
              <span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>{displayType}</span>
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
          
          {/* 只读模式下显示运行状态 */}
          {isReadonly && runStatus && (
            <div className="mt-2 text-xs">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status: </span>
              <span className={`capitalize font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {runStatus}
              </span>
            </div>
          )}
        </div>

        {/* Input/Output Ports - 四个方向的端口 */}
        {node.inputs.length > 0 && (
          <>
            {/* 左侧输入端口 */}
            <div
              className={`absolute left-0 top-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-y-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ left: '-6px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={(e) => {
                const event = e as any;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 上侧输入端口 */}
            <div
              className={`absolute top-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ top: '-6px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={(e) => {
                const event = e as any;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
          </>
        )}

        {node.outputs.length > 0 && (
          <>
            {/* 右侧输出端口 */}
            <div
              className={`absolute right-0 top-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-y-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ right: '-6px' }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 下侧输出端口 */}
            <div
              className={`absolute bottom-0 left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10 border-2 ${isDark ? 'border-gray-800' : 'border-white'}`}
              style={{ bottom: '-6px' }}
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

    {/* Run Log Modal - Only show if not readonly mode (backward compatibility) */}
    {showLogModal && !isReadonly && (
      <NodeRunLogModal
        node={node}
        onClose={() => setShowLogModal(false)}
      />
    )}
  </>
  );
};