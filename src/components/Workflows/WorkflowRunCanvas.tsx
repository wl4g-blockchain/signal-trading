import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ComponentNode, Connection } from '../../types';
import { NodeComponent } from './NodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { useTheme } from '../../contexts/ThemeContext';

interface WorkflowRunCanvasProps {
  nodes: ComponentNode[];
  connections: Connection[];
}

export const WorkflowRunCanvas: React.FC<WorkflowRunCanvasProps> = ({
  nodes,
  connections,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [touchStartPositions, setTouchStartPositions] = useState<React.TouchList | null>(null);
  const [isThreeFingerPanning, setIsThreeFingerPanning] = useState(false);

  // Handle mouse down for panning only
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 2) { // Right-click for panning
      setIsPanning(true);
    }
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = event.movementX;
      const deltaY = event.movementY;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  // Listen for zoom events from toolbar
  useEffect(() => {
    const handleCanvasZoom = (event: CustomEvent) => {
      const { action } = event.detail;
      switch (action) {
        case 'in':
          setScale(prev => Math.min(3, prev * 1.2));
          break;
        case 'out':
          setScale(prev => Math.max(0.1, prev / 1.2));
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
    const event = new CustomEvent('canvas-scale-update', { 
      detail: { scale: Math.round(scale * 100) } 
    });
    window.dispatchEvent(event);
  }, [scale]);

  // Handle touch start for three-finger panning
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 3) {
      setIsThreeFingerPanning(true);
      setTouchStartPositions(event.touches);
      event.preventDefault();
      event.stopPropagation();
    } else if (event.touches.length < 3) {
      setIsThreeFingerPanning(false);
      setTouchStartPositions(null);
    }
  }, []);

  // Handle touch move for three-finger panning
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (isThreeFingerPanning && event.touches.length === 3 && touchStartPositions) {
      event.preventDefault();
      event.stopPropagation();
      
      let deltaX = 0;
      let deltaY = 0;
      
      for (let i = 0; i < 3; i++) {
        deltaX += event.touches[i].clientX - touchStartPositions[i].clientX;
        deltaY += event.touches[i].clientY - touchStartPositions[i].clientY;
      }
      
      deltaX /= 3;
      deltaY /= 3;
      
      setPanOffset(prev => {
        const newX = prev.x - deltaX * 1.2;
        const newY = prev.y - deltaY * 1.2;
        const maxOffset = 2000;
        const boundedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
        const boundedY = Math.max(-maxOffset, Math.min(maxOffset, newY));
        
        return { x: boundedX, y: boundedY };
      });
      
      setTouchStartPositions(event.touches);
    } else if (event.touches.length < 3) {
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

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full ${isDark ? 'bg-gray-800' : 'bg-gray-50'} overflow-hidden`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
              // Read-only mode: delete connections not allowed
              onDelete={() => {}}
            />
          );
        })}

        {/* Nodes - read-only mode */}
        {nodes.map(node => (
          <NodeComponent
            key={node.id}
            node={node}
            // Read-only mode: disable all interactions
            onDragStart={() => {}}
            onConnectionStart={() => {}}
            onConnectionEnd={() => {}}
            onDelete={() => {}}
            onConfig={() => {}}
          />
        ))}
      </div>
    </div>
  );
}; 