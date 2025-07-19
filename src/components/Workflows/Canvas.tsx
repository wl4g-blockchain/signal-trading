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
  const [scale, setScale] = useState(0.8);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [configNode, setConfigNode] = useState<ComponentNode | null>(null);
  const [touchStartPositions, setTouchStartPositions] = useState<React.TouchList | null>(null);
  const [isThreeFingerPanning, setIsThreeFingerPanning] = useState(false);

  // Connection rule validation
  const canConnect = (sourceNodeId: string, targetNodeId: string): boolean => {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    
    if (!sourceNode || !targetNode) return false;
    
    // Check connection rules
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
    // Check if it's a right-click (for panning)
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
      // Handle canvas panning
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

      // Handle zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
          // Check if it's trackpad two-finger zoom
    if (event.ctrlKey) {
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
    } else {
      // Regular wheel zoom
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
    }
  }, []);

      // Listen for zoom events from toolbar
  useEffect(() => {
    const handleCanvasZoom = (event: CustomEvent) => {
      const { action } = event.detail;
      switch (action) {
        case 'in':
          setScale(prev => {
            const newScale = Math.min(3, prev * 1.2);
            return newScale;
          });
          break;
        case 'out':
          setScale(prev => {
            const newScale = Math.max(0.1, prev / 1.2);
            return newScale;
          });
          break;
        case 'reset':
          setScale(1);
          setPanOffset({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('canvas-zoom', handleCanvasZoom as EventListener);
    return () => {
      window.removeEventListener('canvas-zoom', handleCanvasZoom as EventListener);
    };
  }, []);

          // Update displayed zoom percentage
  useEffect(() => {
          // Send zoom update event to toolbar
    const event = new CustomEvent('canvas-scale-update', { 
      detail: { scale: Math.round(scale * 100) } 
    });
    window.dispatchEvent(event);
  }, [scale]);

      // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 3) {
      setIsThreeFingerPanning(true);
      setTouchStartPositions(event.touches);
      event.preventDefault();
              // Prevent default touch behavior, ensure three-finger swipe doesn't trigger other gestures
      event.stopPropagation();
    } else if (event.touches.length < 3) {
              // If not three fingers, ensure stop three-finger panning
      setIsThreeFingerPanning(false);
      setTouchStartPositions(null);
    }
  }, []);

      // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (isThreeFingerPanning && event.touches.length === 3 && touchStartPositions) {
      event.preventDefault();
      event.stopPropagation();
      
              // Calculate average movement distance of three fingers
      let deltaX = 0;
      let deltaY = 0;
      
      for (let i = 0; i < 3; i++) {
        deltaX += event.touches[i].clientX - touchStartPositions[i].clientX;
        deltaY += event.touches[i].clientY - touchStartPositions[i].clientY;
      }
      
      deltaX /= 3;
      deltaY /= 3;
      
              // Move background instead of nodes (similar to drawio behavior)
              // Apply appropriate scaling factor to make dragging more natural
      setPanOffset(prev => {
                  // Use negative values so drag direction is opposite to component movement direction
                  // When dragging right, components move left, so you can see components on the right
                  const newX = prev.x - deltaX * 1.2; // Note: using minus sign here
                  const newY = prev.y - deltaY * 1.2; // Note: using minus sign here
        
                  // Optional: Add boundary limits (prevent moving too far)
                  const maxOffset = 2000; // Maximum offset
        const boundedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
        const boundedY = Math.max(-maxOffset, Math.min(maxOffset, newY));
        
        return {
          x: boundedX,
          y: boundedY
        };
      });
      
      setTouchStartPositions(event.touches);
    } else if (event.touches.length < 3) {
              // If finger count is less than 3, stop three-finger panning
      setIsThreeFingerPanning(false);
      setTouchStartPositions(null);
    }
  }, [isThreeFingerPanning, touchStartPositions]);

      // Handle touch end
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
    // 延迟清除连接状态，给节点的mouseup事件一些时间来处理
    setTimeout(() => {
      setIsConnecting(null);
      setMousePosition(null);
      window.removeEventListener('mousemove', handleMouseMoveWhileConnecting);
      window.removeEventListener('mouseup', handleMouseUpWhileConnecting);
    }, 10);
  }, [handleMouseMoveWhileConnecting]);

  const handleConnectionEnd = useCallback((targetNodeId: string, inputId: string) => {
    if (!isConnecting) return;
    
    // 防止连接到自己
    if (isConnecting.nodeId === targetNodeId) {
      setIsConnecting(null);
      setMousePosition(null);
      window.removeEventListener('mousemove', handleMouseMoveWhileConnecting);
      window.removeEventListener('mouseup', handleMouseUpWhileConnecting);
      return;
    }
    
    // 验证连接规则
    if (!canConnect(isConnecting.nodeId, targetNodeId)) {
      setIsConnecting(null);
      setMousePosition(null);
      window.removeEventListener('mousemove', handleMouseMoveWhileConnecting);
      window.removeEventListener('mouseup', handleMouseUpWhileConnecting);
      return;
    }
    
    // 检查是否已经存在连接
    const existingConnection = connections.find(
      conn => conn.source === isConnecting.nodeId && conn.target === targetNodeId
    );
    if (existingConnection) {
      setIsConnecting(null);
      setMousePosition(null);
      window.removeEventListener('mousemove', handleMouseMoveWhileConnecting);
      window.removeEventListener('mouseup', handleMouseUpWhileConnecting);
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
    
    // 清理连接状态
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
            
            // 智能计算源端口位置
            const getNodeDimensions = (nodeType: string) => {
              if (nodeType === 'start' || nodeType === 'end') {
                return { width: 96, height: 96, centerX: 48, centerY: 48 - 8 }; // 圆形节点，调整8px
              } else {
                return { width: 192, height: 120, centerX: 96, centerY: 60 }; // 矩形节点
              }
            };

            const sourceDim = getNodeDimensions(sourceNode.type);
            
            // 计算源节点中心点
            const sourceCenterX = sourceNode.position.x + sourceDim.centerX;
            const sourceCenterY = sourceNode.position.y + sourceDim.centerY;
            
            // 计算相对于鼠标位置的方向
            const deltaX = mousePosition.x - sourceCenterX;
            const deltaY = mousePosition.y - sourceCenterY;
            
            let sourceX, sourceY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              // 水平方向距离更大
              if (deltaX > 0) {
                // 鼠标在右侧，从右边连接
                sourceX = sourceNode.position.x + sourceDim.width + 6;
                sourceY = sourceNode.position.y + sourceDim.centerY;
              } else {
                // 鼠标在左侧，从左边连接
                sourceX = sourceNode.position.x - 6;
                sourceY = sourceNode.position.y + sourceDim.centerY;
              }
            } else {
              // 垂直方向距离更大
              if (deltaY > 0) {
                // 鼠标在下方，从下边连接
                sourceX = sourceNode.position.x + sourceDim.centerX;
                if (sourceNode.type === 'start' || sourceNode.type === 'end') {
                  sourceY = sourceNode.position.y + 96 + 6; // 圆形节点的实际下边缘 + 端口偏移
                } else {
                  sourceY = sourceNode.position.y + sourceDim.height + 6;
                }
              } else {
                // 鼠标在上方，从上边连接
                sourceX = sourceNode.position.x + sourceDim.centerX;
                if (sourceNode.type === 'start' || sourceNode.type === 'end') {
                  sourceY = sourceNode.position.y - 6; // 圆形节点的实际上边缘 - 端口偏移
                } else {
                  sourceY = sourceNode.position.y - 6;
                }
              }
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