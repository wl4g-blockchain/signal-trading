import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ComponentNode, Connection } from '../../types';
import { NodeComponent } from './NodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Edit } from 'lucide-react';
import { apiServiceFacade } from '../../services';

interface WorkflowRunCanvasProps {
  nodes: ComponentNode[];
  connections: Connection[];
  onLogPanelStateChange?: (visible: boolean, panelWidth: number) => void; // Callback to notify parent
}

export const WorkflowRunCanvas: React.FC<WorkflowRunCanvasProps> = ({ nodes, connections, onLogPanelStateChange }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [touchStartPositions, setTouchStartPositions] = useState<React.TouchList | null>(null);
  const [isThreeFingerPanning, setIsThreeFingerPanning] = useState(false);

  // Log panel state - increased default width to 480px
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logPanelVisible, setLogPanelVisible] = useState(false);
  const [logPanelWidth, setLogPanelWidth] = useState(480); // Increased from 384px to 480px
  const [nodeLogs, setNodeLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fixed timestamp - generate once and reuse to prevent updates during drag
  const [logTimestamp] = useState(() => new Date().toISOString().substring(11, 23));

  // Drag resize state - Fixed initial values to prevent jumpy behavior
  const [isDragging, setIsDragging] = useState(false);

  // Notify parent component about log panel state changes
  useEffect(() => {
    onLogPanelStateChange?.(logPanelVisible, logPanelWidth);
  }, [logPanelVisible, logPanelWidth, onLogPanelStateChange]);

  // Handle navigation back to design editor
  const handleBackToDesign = useCallback(() => {
    // Clear read-only mode and navigate to workflows
    const exitEvent = new CustomEvent('exit-readonly-mode');
    window.dispatchEvent(exitEvent);

    // Navigate to workflows view
    const navEvent = new CustomEvent('navigate-to-workflows');
    window.dispatchEvent(navEvent);
  }, []);

  // Handle node click to show logs in side panel with real-time refresh
  const handleNodeClick = useCallback(
    async (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node || !node.readonly) return;

      console.debug('🔍 Node clicked for logs:', nodeId, 'Node:', node);

      setSelectedNodeId(nodeId);
      setLoadingLogs(true);
      setLogPanelVisible(true);

      try {
        // Extract run ID from URL params or use default
        const urlParams = new URLSearchParams(window.location.search);
        const runId = urlParams.get('runId') || 'run-1';

        console.debug('📋 Fetching logs for runId:', runId, 'nodeId:', nodeId);
        const logs = await apiServiceFacade.getService().getWorkflowRunLogs(runId, nodeId);
        console.debug('✅ Logs loaded:', logs);
        setNodeLogs(logs);
      } catch (error) {
        console.error('❌ Failed to load node logs:', error);
        setNodeLogs([`Error loading logs: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      } finally {
        setLoadingLogs(false);
      }
    },
    [nodes]
  );

  // Auto-open the last node with logs on initialization and refresh logs when selectedNodeId changes
  useEffect(() => {
    const findLastNodeWithLogs = () => {
      // Filter nodes that are in readonly mode and have run status
      const activeNodes = nodes.filter(node => node.readonly && node.runStatus);

      if (activeNodes.length === 0) return null;

      // First, try to find a failed node (highest priority)
      const failedNode = activeNodes.find(node => node.runStatus === 'failed');
      if (failedNode) return failedNode;

      // If no failed node, return the last executed node (by position or order)
      return activeNodes.reduce((lastNode, currentNode) => {
        // Compare by y position, then by x position as tiebreaker
        if (currentNode.position.y > lastNode.position.y) return currentNode;
        if (currentNode.position.y === lastNode.position.y && currentNode.position.x > lastNode.position.x) {
          return currentNode;
        }
        return lastNode;
      });
    };

    // Only auto-open once when component first renders and nodes are available
    if (nodes.length > 0 && !selectedNodeId && !logPanelVisible) {
      const targetNode = findLastNodeWithLogs();
      if (targetNode) {
        console.debug('🎯 Auto-opening logs for node:', targetNode.id);
        handleNodeClick(targetNode.id);
      }
    }
  }, [nodes, selectedNodeId, logPanelVisible, handleNodeClick]);

  // Auto-refresh logs for selected node when node data changes
  useEffect(() => {
    if (selectedNodeId && logPanelVisible) {
      console.debug('🔄 Auto-refreshing logs for selected node:', selectedNodeId);
      // Re-fetch logs for currently selected node
      handleNodeClick(selectedNodeId);
    }
  }, [nodes, selectedNodeId, logPanelVisible, handleNodeClick]);

  // Handle resize drag start - Fixed to prevent initial width jumping
  const handleResizeDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);

      // Capture initial values at the moment of drag start
      const initialX = e.clientX;
      const initialWidth = logPanelWidth;

      // Add global mouse event listeners
      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = initialX - e.clientX; // Inverted because we're dragging left border
        const newWidth = Math.max(320, Math.min(800, initialWidth + deltaX)); // Min 320px, max 800px
        setLogPanelWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [logPanelWidth]
  );

  // Handle mouse down for panning only
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button === 2) {
      // Right-click for panning
      setIsPanning(true);
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = event.movementX;
        const deltaY = event.movementY;
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
      }
    },
    [isPanning]
  );

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
      detail: { scale: Math.round(scale * 100) },
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
  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
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
    },
    [isThreeFingerPanning, touchStartPositions]
  );

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
      onContextMenu={e => e.preventDefault()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom and pan container */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            left: `${-panOffset.x / scale}px`,
            top: `${-panOffset.y / scale}px`,
          }}
        >
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Connections - read-only mode: display only, no deletion allowed */}
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

        {/* Nodes - read-only mode: only allow clicking to view logs */}
        {nodes.map(node => (
          <NodeComponent
            key={node.id}
            node={node}
            // Read-only mode: disable all interactions except node clicks for logs
            onDragStart={() => {}}
            onConnectionStart={() => {}}
            onConnectionEnd={() => {}}
            onDelete={() => {}}
            onConfig={() => {}}
            onNodeClick={handleNodeClick} // Enable clicking to open log panel
          />
        ))}
      </div>

      {/* Floating Action Button - Return to Design Editor (position adjusts when log panel opens) */}
      <div
        className={`absolute top-4 z-5 transition-all duration-300`}
        style={{
          right: logPanelVisible ? `${logPanelWidth + 20}px` : '16px',
        }}
      >
        <button
          onClick={handleBackToDesign}
          className={`flex items-center space-x-2 px-4 py-2 ${
            isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`}
          title={t('workflow.redesign')}
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm font-medium">{t('workflow.redesign')}</span>
        </button>
      </div>

      {/* Sliding Log Panel - Displays execution logs for selected node */}
      <div
        className={`absolute top-0 right-0 h-full ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-10 ${
          logPanelVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: `${logPanelWidth}px` }}
      >
        {/* Resize Handle - Drag left border to adjust panel width */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize ${
            isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
          } transition-colors ${isDragging ? 'bg-blue-500' : ''}`}
          onMouseDown={handleResizeDragStart}
          title="Drag to resize panel"
        >
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-current opacity-60 rounded-full"></div>
        </div>

        {/* Panel Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Node Execution Log</h3>
            {selectedNodeId && (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                {selectedNodeId}
              </span>
            )}
          </div>
        </div>

        {/* Log Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-black text-green-400 font-mono text-sm">
            {/* Terminal Header */}
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-4 text-gray-400 text-xs">Node Execution Log - {selectedNodeId}</div>
            </div>

            {/* Log Content */}
            <div className="h-full overflow-y-auto p-4 pb-20">
              {loadingLogs ? (
                <div className="text-yellow-400 animate-pulse">Loading logs...</div>
              ) : (
                selectedNodeId &&
                (() => {
                  const selectedNode = nodes.find(n => n.id === selectedNodeId);
                  const nodeRunLogs = selectedNode?.runLogs || [];
                  const apiLogs = nodeLogs; // Logs from API call

                  // Prefer node's existing logs, fallback to API logs
                  const displayLogs =
                    nodeRunLogs.length > 0
                      ? nodeRunLogs
                      : apiLogs.map((log: string) => ({
                          timestamp: new Date().toISOString(),
                          level: 'info' as const,
                          message: log,
                          data: null,
                        }));

                  return displayLogs.length > 0 ? (
                    displayLogs.map((log, index) => (
                      <div key={index} className="mb-1 flex">
                        <span className="text-gray-500 mr-2 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span
                          className={`${
                            log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'
                          }`}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No logs available for this node execution.</div>
                  );
                })()
              )}

              {/* Cursor Blink */}
              <div className="mt-2 flex items-center">
                <span className="text-gray-500 mr-2">[{logTimestamp}]</span>
                <span className="text-green-400">$</span>
                <span className="ml-1 bg-green-400 w-2 h-4 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
