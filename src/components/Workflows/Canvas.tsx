import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ComponentNode, Connection } from '../../types';
import { NodeComponent } from './NodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { NodeConfigModal } from './NodeConfigModal';

interface CanvasProps {
  nodes: ComponentNode[];
  connections: Connection[];
  onNodesChange: (nodes: ComponentNode[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  onDeleteNode,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState<{
    nodeId: string;
    outputId: string;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [configNode, setConfigNode] = useState<ComponentNode | null>(null);
  const [touchStartPositions, setTouchStartPositions] = useState<TouchList | null>(null);
  const [isThreeFingerPanning, setIsThreeFingerPanning] = useState(false);
  const [displayScale, setDisplayScale] = useState(100);

  // 连接规则验证
  const canConnect = (sourceNodeId: string, targetNodeId: string): boolean => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    
    if (!sourceNode || !targetNode) return false;
    
    // 检查连接规则
    switch (targetNode.type) {
      case 'listener':
        return sourceNode.type === 'start';
      case 'evaluator':
        return sourceNode.type === 'listener' || sourceNode.type === 'evaluator';
      case 'executor':
        return sourceNode.type === 'evaluator';
      case 'collector':
        return sourceNode.type === 'executor';
      case 'end':
        return sourceNode.type === 'collector';
      default:
        return false;
    }
  };
  const handleDragStart = useCallback((nodeId: string, event: React.MouseEvent) => {
    // 检查是否是右键点击（用于平移）
    if (event.button === 2) {
      setIsPanning(true);
      return;
    }
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setDraggedNode(nodeId);
  }, [nodes]);

  const handleDragMove = useCallback((event: React.MouseEvent) => {
    if (isPanning) {
      // 处理画布平移
      const deltaX = event.movementX;
      const deltaY = event.movementY;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      return;
    }
    
    if (!draggedNode || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = (event.clientX - canvasRect.left - panOffset.x) / scale - dragOffset.x;
    const newY = (event.clientY - canvasRect.top - panOffset.y) / scale - dragOffset.y;

    const updatedNodes = nodes.map(node =>
      node.id === draggedNode
        ? { ...node, position: { x: newX, y: newY } }
        : node
    );
    onNodesChange(updatedNodes);
  }, [draggedNode, dragOffset, nodes, onNodesChange, scale, panOffset, isPanning]);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
    setIsPanning(false);
  }, []);

  // 处理缩放
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    // 检查是否是触控板的双指缩放
    if (event.ctrlKey) {
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
    } else {
      // 普通滚轮缩放
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
    }
  }, []);

  // 监听来自工具栏的缩放事件
  useEffect(() => {
    const handleCanvasZoom = (event: CustomEvent) => {
      const { action } = event.detail;
      switch (action) {
        case 'in':
          setScale(prev => {
            const newScale = Math.min(3, prev * 1.2);
            setDisplayScale(Math.round(newScale * 100));
            return newScale;
          });
          break;
        case 'out':
          setScale(prev => {
            const newScale = Math.max(0.1, prev / 1.2);
            setDisplayScale(Math.round(newScale * 100));
            return newScale;
          });
          break;
        case 'reset':
          setScale(1);
          setPanOffset({ x: 0, y: 0 });
          setDisplayScale(100);
          break;
      }
    };

    window.addEventListener('canvas-zoom', handleCanvasZoom as EventListener);
    return () => {
      window.removeEventListener('canvas-zoom', handleCanvasZoom as EventListener);
    };
  }, []);

  // 更新显示的缩放百分比
  useEffect(() => {
    setDisplayScale(Math.round(scale * 100));
    
    // 发送缩放更新事件给工具栏
    const event = new CustomEvent('canvas-scale-update', { 
      detail: { scale: Math.round(scale * 100) } 
    });
    window.dispatchEvent(event);
  }, [scale]);

  // 处理触摸开始
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 3) {
      setIsThreeFingerPanning(true);
      setTouchStartPositions(event.touches as any);
      event.preventDefault();
    }
  }, []);

  // 处理触摸移动
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (isThreeFingerPanning && event.touches.length === 3 && touchStartPositions) {
      event.preventDefault();
      
      // 计算三指的平均移动距离
      let deltaX = 0;
      let deltaY = 0;
      
      for (let i = 0; i < 3; i++) {
        deltaX += event.touches[i].clientX - touchStartPositions[i].clientX;
        deltaY += event.touches[i].clientY - touchStartPositions[i].clientY;
      }
      
      deltaX /= 3;
      deltaY /= 3;
      
      // 移动所有节点
      const updatedNodes = nodes.map(node => ({
        ...node,
        position: {
          x: node.position.x + deltaX / scale,
          y: node.position.y + deltaY / scale
        }
      }));
      
      onNodesChange(updatedNodes);
      setTouchStartPositions(event.touches as any);
    }
  }, [isThreeFingerPanning, touchStartPositions, nodes, onNodesChange, scale]);

  // 处理触摸结束
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (event.touches.length < 3) {
      setIsThreeFingerPanning(false);
      setTouchStartPositions(null);
    }
  }, []);

  const handleConnectionStart = useCallback((nodeId: string, outputId: string, event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    setIsConnecting({ nodeId, outputId });
    if (event && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: (event.clientX - canvasRect.left - panOffset.x) / scale,
        y: (event.clientY - canvasRect.top - panOffset.y) / scale,
      });
    }
    window.addEventListener('mousemove', handleMouseMoveWhileConnecting);
    window.addEventListener('mouseup', handleMouseUpWhileConnecting);
  }, [scale, panOffset]);

  const handleMouseMoveWhileConnecting = useCallback((event: MouseEvent) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setMousePosition({
      x: (event.clientX - canvasRect.left - panOffset.x) / scale,
      y: (event.clientY - canvasRect.top - panOffset.y) / scale,
    });
  }, [scale, panOffset]);

  const handleMouseUpWhileConnecting = useCallback(() => {
    setIsConnecting(null);
    setMousePosition(null);
    window.removeEventListener('mousemove', handleMouseMoveWhileConnecting);
    window.removeEventListener('mouseup', handleMouseUpWhileConnecting);
  }, [handleMouseMoveWhileConnecting]);

  const handleConnectionEnd = useCallback((targetNodeId: string, inputId: string) => {
    if (!isConnecting) return;
    
    // 防止连接到自己
    if (isConnecting.nodeId === targetNodeId) {
      setIsConnecting(null);
      setMousePosition(null);
      return;
    }
    
    // 验证连接规则
    if (!canConnect(isConnecting.nodeId, targetNodeId)) {
      setIsConnecting(null);
      setMousePosition(null);
      return;
    }
    
    // 检查是否已经存在连接
    const existingConnection = connections.find(
      conn => conn.source === isConnecting.nodeId && conn.target === targetNodeId
    );
    if (existingConnection) {
      setIsConnecting(null);
      setMousePosition(null);
      return;
    }
    
    const newConnection: Connection = {
      id: `${isConnecting.nodeId}-${targetNodeId}-${Date.now()}`,
      source: isConnecting.nodeId,
      target: targetNodeId,
      sourceOutput: isConnecting.outputId,
      targetInput: inputId,
    };
    onConnectionsChange([...connections, newConnection]);
    setIsConnecting(null);
    setMousePosition(null);
    window.removeEventListener('mousemove', handleMouseMoveWhileConnecting);
    window.removeEventListener('mouseup', handleMouseUpWhileConnecting);
  }, [isConnecting, connections, onConnectionsChange, handleMouseMoveWhileConnecting, handleMouseUpWhileConnecting, canConnect]);

  const handleNodeConfig = (node: ComponentNode) => {
    setConfigNode(node);
  };

  const handleNodeUpdate = (updatedNode: ComponentNode) => {
    const updatedNodes = nodes.map(node =>
      node.id === updatedNode.id ? updatedNode : node
    );
    onNodesChange(updatedNodes);
    setConfigNode(null);
  };
  return (
    <>
      <div
        ref={canvasRef}
        className="relative w-full h-full bg-gray-800 overflow-hidden"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 缩放和平移容器 */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10" style={{ 
            width: `${100 / scale}%`, 
            height: `${100 / scale}%`,
            left: `${-panOffset.x / scale}px`,
            top: `${-panOffset.y / scale}px`
          }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Connections */}
          {connections.map(connection => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            if (!sourceNode || !targetNode) return null;
            return (
              <ConnectionLine
                key={connection.id}
                sourcePosition={sourceNode.position}
                targetPosition={targetNode.position}
                sourceNodeType={sourceNode.type}
                targetNodeType={targetNode.type}
                scale={scale}
                panOffset={panOffset}
                onDelete={() => {
                  onConnectionsChange(connections.filter(c => c.id !== connection.id));
                }}
              />
            );
          })}

          {/* 临时连接线（拖拽中） */}
          {isConnecting && mousePosition && (() => {
            const sourceNode = nodes.find(n => n.id === isConnecting.nodeId);
            if (!sourceNode) return null;
            
            // 根据节点类型计算源端口位置
            let sourceX, sourceY;
            if (sourceNode.type === 'start') {
              sourceX = sourceNode.position.x + 48;
              sourceY = sourceNode.position.y + 48;
            } else {
              sourceX = sourceNode.position.x + 192;
              sourceY = sourceNode.position.y + 40;
            }
            
            return (
              <svg className="absolute pointer-events-none" style={{ 
                left: `${-panOffset.x / scale}px`, 
                top: `${-panOffset.y / scale}px`, 
                width: `${100 / scale}%`, 
                height: `${100 / scale}%` 
              }}>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={mousePosition.x}
                  y2={mousePosition.y}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="5,5"
                  markerEnd="url(#arrowhead)"
                />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                  </marker>
                </defs>
              </svg>
            );
          })()}

          {/* Nodes */}
          {nodes.map(node => (
            <NodeComponent
              key={node.id}
              node={node}
              onDragStart={handleDragStart}
              onConnectionStart={(nodeId, outputId, event) => handleConnectionStart(nodeId, outputId, event)}
              onConnectionEnd={handleConnectionEnd}
              onDelete={onDeleteNode}
              onConfig={handleNodeConfig}
              isConnecting={isConnecting?.nodeId === node.id}
            />
          ))}
        </div>

      </div>

      {/* 节点配置弹窗 */}
      {configNode && (
        <NodeConfigModal
          node={configNode}
          onSave={handleNodeUpdate}
          onClose={() => setConfigNode(null)}
        />
      )}
    </>
  );
};