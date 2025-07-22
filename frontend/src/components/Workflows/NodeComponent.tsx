import React, { useState } from 'react';
import { ComponentNode } from '../../types';
import { COMPONENT_TYPES } from '../../types/WorkflowTypes';
import { Radio, Twitter, TrendingUp, BarChart3, Trash2, Settings, Check, X, Clock, Pause, FileText } from 'lucide-react';
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

const getNodeIcon = (node: ComponentNode) => {
  // For new schema, use the icon from the node directly
  if (node.icon) {
    return node.icon;
  }

  // Fallback for legacy nodes or special cases
  switch (node.type) {
    case COMPONENT_TYPES.START:
      return () => <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">S</div>;
    case COMPONENT_TYPES.END:
      return () => <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-900">E</div>;
    default:
      return BarChart3;
  }
};

const getNodeColor = (node: ComponentNode): string => {
  // Use the color from the node's style if available
  if (node.style?.color) {
    return `${node.style.color} border-${node.style.color.split('-')[1]}-500`;
  }

  // Fallback colors for legacy nodes
  switch (node.type) {
    case COMPONENT_TYPES.START:
      return 'bg-green-600 border-green-500';
    case COMPONENT_TYPES.END:
      return 'bg-red-600 border-red-500';
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
  const config = node.config || {};

  switch (node.type) {
    case COMPONENT_TYPES.TWITTER_FEED:
      const twitterMode = config.enableWebSocket ? 'Stream' : 'Poll';
      const twitterData = config.keywords?.length ? `${config.keywords.length} keywords` : 
                         config.accounts?.length ? `${config.accounts.length} accounts` : 'Twitter';
      return `${twitterData} (${twitterMode})`;
    case COMPONENT_TYPES.BINANCE_FEED:
      const binanceMode = config.enableWebSocket ? 'Stream' : 'Poll';
      const binanceData = config.symbols?.length ? `${config.symbols.length} symbols` : 'Binance';
      return `${binanceData} (${binanceMode})`;
    case COMPONENT_TYPES.UNISWAP_FEED:
      const uniswapData = config.poolAddress ? 'Pool Data' : 'Uniswap';
      return `${uniswapData} (Poll)`;
    case COMPONENT_TYPES.COINMARKET_FEED:
      const coinmarketData = config.symbols?.length ? `${config.symbols.length} symbols` : 'CoinMarket';
      return `${coinmarketData} (Poll)`;
    case COMPONENT_TYPES.AI_EVALUATOR:
      return config.model || 'AI Model';
    case COMPONENT_TYPES.BINANCE_TRADE_EXECUTOR:
      return 'Binance Trading';
    case COMPONENT_TYPES.OKX_TRADE_EXECUTOR:
      return 'OKX Trading';
    case COMPONENT_TYPES.EVM_TRADE_EXECUTOR:
      return config.chain || 'EVM Trading';
    case COMPONENT_TYPES.BITCOIN_TRADE_EXECUTOR:
      return 'Bitcoin Trading';
    case COMPONENT_TYPES.SOLANA_TRADE_EXECUTOR:
      return 'Solana Trading';
    case COMPONENT_TYPES.BINANCE_RESULT_COLLECTOR:
    case COMPONENT_TYPES.OKX_RESULT_COLLECTOR:
    case COMPONENT_TYPES.EVM_RESULT_COLLECTOR:
    case COMPONENT_TYPES.SOLANA_RESULT_COLLECTOR:
    case COMPONENT_TYPES.BITCOIN_RESULT_COLLECTOR:
      return `${config.monitorDuration || 30}min`;
    default:
      return node.type;
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

  const isReadonly = node.readonly || false;
  const runStatus = node.runStatus;
  const runLogs = node.runLogs || [];

  const Icon = getNodeIcon(node);
  const SubIcon = getSubIcon(node.type, node.config?.type);
  const colorClass = getNodeColor(node);
  const displayType = getDisplayType(node);

  // Get run status color and icon
  const getRunStatusColor = () => {
    if (!runStatus) return colorClass;
    switch (runStatus) {
      case 'success':
        return 'border-green-500 bg-green-500';
      case 'failed':
        return 'border-red-500 bg-red-500';
      case 'running':
        return 'border-blue-500 bg-blue-500';
      case 'queued':
        return 'border-yellow-500 bg-yellow-500';
      default:
        return colorClass;
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
      case 'success':
        return <Check className="w-3 h-3 text-white" />; // Use consistent white
      case 'failed':
        return <X className="w-3 h-3 text-white" />;
      case 'running':
        return <Clock className="w-3 h-3 text-white animate-spin" />;
      case 'queued':
        return <Pause className="w-3 h-3 text-white" />; // Use consistent white
      default:
        return null;
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
  if (node.type === COMPONENT_TYPES.START || node.type === COMPONENT_TYPES.END) {
    return (
      <div
        className="absolute cursor-move select-none"
        style={{
          transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        }}
        onMouseDown={e => onDragStart(node.id, e)}
      >
        <div className={`w-24 h-24 ${colorClass} rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center`}>
          <Icon />
        </div>

        <div className="text-center mt-2">
          <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{node.name}</span>
        </div>

        {/* Output ports for start node - Multi-directional */}
        {node.type === COMPONENT_TYPES.START && (
          <>
            {/* 右侧输出端口 */}
            <div
              className={`absolute right-0 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ right: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 下侧输出端口 - 在圆形节点边缘 */}
            <div
              className={`absolute left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ top: '94px' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 左侧输出端口 */}
            <div
              className={`absolute left-0 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ left: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
            {/* 上侧输出端口 */}
            <div
              className={`absolute top-0 left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ top: '-6px' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionStart(node.id, 'output', e);
              }}
            />
          </>
        )}

        {/* Input ports for end node - Multi-directional */}
        {node.type === COMPONENT_TYPES.END && (
          <>
            {/* 左侧输入端口 */}
            <div
              className={`absolute left-0 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ left: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={e => {
                // When mouse enters input port, auto-connect if currently connecting
                const event = e as React.MouseEvent;
                if (event.buttons === 1) {
                  // Left mouse button pressed
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 上侧输入端口 - 在圆形节点边缘 */}
            <div
              className={`absolute left-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ top: '-6px' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={e => {
                const event = e as React.MouseEvent;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 右侧输入端口 */}
            <div
              className={`absolute right-0 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ right: '-6px', top: 'calc(50% - 8px)', transform: 'translateY(-50%)' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={e => {
                const event = e as React.MouseEvent;
                if (event.buttons === 1) {
                  onConnectionEnd(node.id, 'input');
                }
              }}
            />
            {/* 下侧输入端口 - 在圆形节点边缘 */}
            <div
              className={`absolute left-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10 border-2 ${
                isDark ? 'border-gray-800' : 'border-white'
              }`}
              style={{ top: '94px' }}
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseUp={e => {
                e.preventDefault();
                e.stopPropagation();
                onConnectionEnd(node.id, 'input');
              }}
              onMouseEnter={e => {
                const event = e as React.MouseEvent;
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
        onMouseDown={e => onDragStart(node.id, e)}
        onClick={handleNodeClick}
      >
        <div
          className={`w-48 ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} border-2 ${
            runStatus ? getRunStatusColor() : colorClass
          } rounded-lg shadow-lg hover:shadow-xl transition-all ${isReadonly && runLogs.length > 0 ? 'cursor-pointer' : ''}`}
        >
          {/* Header */}
          <div className={`p-3 ${runStatus ? getRunStatusColor() : colorClass} rounded-t-lg flex items-center space-x-2 relative`}>
            <Icon className={`w-5 h-5 ${runStatus ? getRunStatusTextColor() : 'text-white'}`} />
            {SubIcon && <SubIcon className={`w-4 h-4 ${runStatus ? getRunStatusTextColor() : 'text-white'} opacity-80`} />}
            <span className={`${runStatus ? getRunStatusTextColor() : 'text-white'} font-medium text-sm flex-1`}>
              {node.name || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`}
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
                  onClick={e => {
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
                  onClick={e => {
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
            {node.status && (
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    node.status === 'running' ? 'bg-green-400' : node.status === 'error' ? 'bg-red-400' : 'bg-gray-400'
                  }`}
                />
                <span className="capitalize">{node.status}</span>
              </div>
            )}

            {/* 只读模式下显示运行状态 */}
            {isReadonly && runStatus && (
              <div className="mt-2 text-xs">
                <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status: </span>
                <span className={`capitalize font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{runStatus}</span>
              </div>
            )}
          </div>

          {/* Input/Output Ports - Multi-directional ports */}
          {(node.inputMode === 'SINGLE' || node.inputMode === 'MULTI') && (
            <>
              {/* 左侧输入端口 */}
              <div
                className={`absolute left-0 top-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-y-1/2 z-10 border-2 ${
                  isDark ? 'border-gray-800' : 'border-white'
                }`}
                style={{ left: '-6px' }}
                onMouseDown={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseUp={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onConnectionEnd(node.id, 'input');
                }}
                onMouseEnter={e => {
                  const event = e as React.MouseEvent;
                  if (event.buttons === 1) {
                    onConnectionEnd(node.id, 'input');
                  }
                }}
              />
              {/* 上侧输入端口 */}
              <div
                className={`absolute top-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-pointer hover:bg-blue-300 transform -translate-x-1/2 z-10 border-2 ${
                  isDark ? 'border-gray-800' : 'border-white'
                }`}
                style={{ top: '-6px' }}
                onMouseDown={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseUp={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onConnectionEnd(node.id, 'input');
                }}
                onMouseEnter={e => {
                  const event = e as React.MouseEvent;
                  if (event.buttons === 1) {
                    onConnectionEnd(node.id, 'input');
                  }
                }}
              />
            </>
          )}

          {(node.outputMode === 'SINGLE' || node.outputMode === 'MULTI') && (
            <>
              {/* 右侧输出端口 */}
              <div
                className={`absolute right-0 top-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-y-1/2 z-10 border-2 ${
                  isDark ? 'border-gray-800' : 'border-white'
                }`}
                style={{ right: '-6px' }}
                onMouseDown={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onConnectionStart(node.id, 'output', e);
                }}
              />
              {/* 下侧输出端口 */}
              <div
                className={`absolute bottom-0 left-1/2 w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300 transform -translate-x-1/2 z-10 border-2 ${
                  isDark ? 'border-gray-800' : 'border-white'
                }`}
                style={{ bottom: '-6px' }}
                onMouseDown={e => {
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
      {showLogModal && !isReadonly && <NodeRunLogModal node={node} onClose={() => setShowLogModal(false)} />}
    </>
  );
};
