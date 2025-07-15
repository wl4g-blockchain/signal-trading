import React, { useState, useRef, useCallback } from 'react';
import { ComponentNode, Connection } from '../../types';
import { NodeComponent } from './NodeComponent';
import { ConnectionLine } from './ConnectionLine';

interface CanvasProps {
  nodes: ComponentNode[];
  connections: Connection[];
  onNodesChange: (nodes: ComponentNode[]) => void;
  onConnectionsChange: (connections: Connection[]) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState<{
    nodeId: string;
    outputId: string;
  } | null>(null);

  const handleDragStart = useCallback((nodeId: string, event: React.MouseEvent) => {
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
    if (!draggedNode || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = event.clientX - canvasRect.left - dragOffset.x;
    const newY = event.clientY - canvasRect.top - dragOffset.y;

    const updatedNodes = nodes.map(node =>
      node.id === draggedNode
        ? { ...node, position: { x: newX, y: newY } }
        : node
    );
    onNodesChange(updatedNodes);
  }, [draggedNode, dragOffset, nodes, onNodesChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleConnectionStart = useCallback((nodeId: string, outputId: string) => {
    setIsConnecting({ nodeId, outputId });
  }, []);

  const handleConnectionEnd = useCallback((targetNodeId: string, inputId: string) => {
    if (!isConnecting) return;

    const newConnection: Connection = {
      id: `${isConnecting.nodeId}-${targetNodeId}-${Date.now()}`,
      source: isConnecting.nodeId,
      target: targetNodeId,
      sourceOutput: isConnecting.outputId,
      targetInput: inputId,
    };

    onConnectionsChange([...connections, newConnection]);
    setIsConnecting(null);
  }, [isConnecting, connections, onConnectionsChange]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gray-800 overflow-hidden"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10">
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
            onDelete={() => {
              onConnectionsChange(connections.filter(c => c.id !== connection.id));
            }}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => (
        <NodeComponent
          key={node.id}
          node={node}
          onDragStart={handleDragStart}
          onConnectionStart={handleConnectionStart}
          onConnectionEnd={handleConnectionEnd}
          isConnecting={isConnecting?.nodeId === node.id}
        />
      ))}
    </div>
  );
};