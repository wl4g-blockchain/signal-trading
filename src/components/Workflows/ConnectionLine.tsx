import React from "react";
import { X } from "lucide-react";

interface ConnectionLineProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  sourceNodeType: string;
  targetNodeType: string;
  onDelete: () => void;
  scale?: number;
  panOffset?: { x: number; y: number };
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourcePosition,
  targetPosition,
  sourceNodeType,
  targetNodeType,
  onDelete,
  scale = 1,
  panOffset = { x: 0, y: 0 },
}) => {
  // Calculate node dimensions and center point
  const getNodeDimensions = (nodeType: string) => {
    if (nodeType === "start" || nodeType === "end") {
      return { width: 96, height: 96, centerX: 48, centerY: 48 - 8 }; // Circular node, adjust 8px
    } else {
      return { width: 192, height: 120, centerX: 96, centerY: 60 }; // Rectangular node
    }
  };

  const sourceDim = getNodeDimensions(sourceNodeType);
  const targetDim = getNodeDimensions(targetNodeType);

  // Calculate center points of source and target nodes
  const sourceCenterX = sourcePosition.x + sourceDim.centerX;
  const sourceCenterY = sourcePosition.y + sourceDim.centerY;
  const targetCenterX = targetPosition.x + targetDim.centerX;
  const targetCenterY = targetPosition.y + targetDim.centerY;

  // Calculate relative node positions to determine connection direction
  const deltaX = targetCenterX - sourceCenterX;
  const deltaY = targetCenterY - sourceCenterY;

  // Select optimal connection points
  let startX, startY, endX, endY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal distance is larger, use left-right connection
    if (deltaX > 0) {
      // Target is on the right, connect from source right to target left
      startX = sourcePosition.x + sourceDim.width + 6;
      startY = sourcePosition.y + sourceDim.centerY;
      endX = targetPosition.x - 6;
      endY = targetPosition.y + targetDim.centerY;
    } else {
      // Target is on the left, connect from source left to target right
      startX = sourcePosition.x - 6;
      startY = sourcePosition.y + sourceDim.centerY;
      endX = targetPosition.x + targetDim.width + 6;
      endY = targetPosition.y + targetDim.centerY;
    }
  } else {
    // Vertical distance is larger, use top-bottom connection
    if (deltaY > 0) {
      // Target is below, connect from source bottom to target top
      startX = sourcePosition.x + sourceDim.centerX;
      if (sourceNodeType === "start" || sourceNodeType === "end") {
        startY = sourcePosition.y + 96 + 6; // Actual bottom edge of circular node + port offset
      } else {
        startY = sourcePosition.y + sourceDim.height + 6;
      }
      endX = targetPosition.x + targetDim.centerX;
      if (targetNodeType === "start" || targetNodeType === "end") {
        endY = targetPosition.y - 6; // Actual top edge of circular node - port offset
      } else {
        endY = targetPosition.y - 6;
      }
    } else {
      // Target is above, connect from source top to target bottom
      startX = sourcePosition.x + sourceDim.centerX;
      if (sourceNodeType === "start" || sourceNodeType === "end") {
        startY = sourcePosition.y - 6; // Actual top edge of circular node - port offset
      } else {
        startY = sourcePosition.y - 6;
      }
      endX = targetPosition.x + targetDim.centerX;
      if (targetNodeType === "start" || targetNodeType === "end") {
        endY = targetPosition.y + 96 + 6; // Actual bottom edge of circular node + port offset
      } else {
        endY = targetPosition.y + targetDim.height + 6;
      }
    }
  }

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Select appropriate Bezier curve control points based on connection direction
  let path;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal connection
    const controlPointOffset = Math.abs(endX - startX) * 0.3;
    if (deltaX > 0) {
      // Connect to the right
      path = `M ${startX} ${startY} C ${
        startX + controlPointOffset
      } ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
    } else {
      // Connect to the left
      path = `M ${startX} ${startY} C ${
        startX - controlPointOffset
      } ${startY}, ${endX + controlPointOffset} ${endY}, ${endX} ${endY}`;
    }
  } else {
    // Vertical connection
    const controlPointOffset = Math.abs(endY - startY) * 0.3;
    if (deltaY > 0) {
      // Connect downward
      path = `M ${startX} ${startY} C ${startX} ${
        startY + controlPointOffset
      }, ${endX} ${endY - controlPointOffset}, ${endX} ${endY}`;
    } else {
      // Connect upward
      path = `M ${startX} ${startY} C ${startX} ${
        startY - controlPointOffset
      }, ${endX} ${endY + controlPointOffset}, ${endX} ${endY}`;
    }
  }

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: `${-panOffset.x / scale}px`,
        top: `${-panOffset.y / scale}px`,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        className="hover:stroke-blue-400 pointer-events-auto"
        markerEnd="url(#arrowhead)"
      />

      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
        </marker>
      </defs>

      {/* Delete button */}
      <foreignObject
        x={midX - 10}
        y={midY - 10}
        width="20"
        height="20"
        className="pointer-events-auto"
      >
        <button
          className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </foreignObject>
    </svg>
  );
};
