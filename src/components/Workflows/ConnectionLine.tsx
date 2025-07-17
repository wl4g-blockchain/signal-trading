import React from 'react';
import { X } from 'lucide-react';

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
  // 计算节点的尺寸和中心点
  const getNodeDimensions = (nodeType: string) => {
    if (nodeType === 'start' || nodeType === 'end') {
      return { width: 96, height: 96, centerX: 48, centerY: 48 - 8 }; // 圆形节点，调整8px
    } else {
      return { width: 192, height: 120, centerX: 96, centerY: 60 }; // 矩形节点
    }
  };

  const sourceDim = getNodeDimensions(sourceNodeType);
  const targetDim = getNodeDimensions(targetNodeType);
  
  // 计算源节点和目标节点的中心点
  const sourceCenterX = sourcePosition.x + sourceDim.centerX;
  const sourceCenterY = sourcePosition.y + sourceDim.centerY;
  const targetCenterX = targetPosition.x + targetDim.centerX;
  const targetCenterY = targetPosition.y + targetDim.centerY;
  
  // 计算节点相对位置，决定连接方向
  const deltaX = targetCenterX - sourceCenterX;
  const deltaY = targetCenterY - sourceCenterY;
  
  // 选择最佳连接点
  let startX, startY, endX, endY;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 水平方向距离更大，使用左右连接
    if (deltaX > 0) {
      // 目标在右侧，从源节点右边连接到目标节点左边
      startX = sourcePosition.x + sourceDim.width + 2;
      startY = sourcePosition.y + sourceDim.centerY;
      endX = targetPosition.x - 2;
      endY = targetPosition.y + targetDim.centerY;
    } else {
      // 目标在左侧，从源节点左边连接到目标节点右边
      startX = sourcePosition.x - 2;
      startY = sourcePosition.y + sourceDim.centerY;
      endX = targetPosition.x + targetDim.width + 2;
      endY = targetPosition.y + targetDim.centerY;
    }
  } else {
    // 垂直方向距离更大，使用上下连接
    if (deltaY > 0) {
      // 目标在下方，从源节点下边连接到目标节点上边
      startX = sourcePosition.x + sourceDim.centerX;
      if (sourceNodeType === 'start' || sourceNodeType === 'end') {
        startY = sourcePosition.y + 96; // 圆形节点的实际下边缘
      } else {
        startY = sourcePosition.y + sourceDim.height + 2;
      }
      endX = targetPosition.x + targetDim.centerX;
      if (targetNodeType === 'start' || targetNodeType === 'end') {
        endY = targetPosition.y - 2; // 圆形节点的实际上边缘
      } else {
        endY = targetPosition.y - 2;
      }
    } else {
      // 目标在上方，从源节点上边连接到目标节点下边
      startX = sourcePosition.x + sourceDim.centerX;
      if (sourceNodeType === 'start' || sourceNodeType === 'end') {
        startY = sourcePosition.y - 2; // 圆形节点的实际上边缘
      } else {
        startY = sourcePosition.y - 2;
      }
      endX = targetPosition.x + targetDim.centerX;
      if (targetNodeType === 'start' || targetNodeType === 'end') {
        endY = targetPosition.y + 96; // 圆形节点的实际下边缘
      } else {
        endY = targetPosition.y + targetDim.height + 2;
      }
    }
  }

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // 根据连接方向选择合适的贝塞尔曲线控制点
  let path;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 水平连接
    const controlPointOffset = Math.abs(endX - startX) * 0.3;
    if (deltaX > 0) {
      // 向右连接
      path = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
    } else {
      // 向左连接
      path = `M ${startX} ${startY} C ${startX - controlPointOffset} ${startY}, ${endX + controlPointOffset} ${endY}, ${endX} ${endY}`;
    }
  } else {
    // 垂直连接
    const controlPointOffset = Math.abs(endY - startY) * 0.3;
    if (deltaY > 0) {
      // 向下连接
      path = `M ${startX} ${startY} C ${startX} ${startY + controlPointOffset}, ${endX} ${endY - controlPointOffset}, ${endX} ${endY}`;
    } else {
      // 向上连接
      path = `M ${startX} ${startY} C ${startX} ${startY - controlPointOffset}, ${endX} ${endY + controlPointOffset}, ${endX} ${endY}`;
    }
  }

  return (
    <svg className="absolute pointer-events-none" style={{ 
      left: `${-panOffset.x / scale}px`, 
      top: `${-panOffset.y / scale}px`, 
      width: `${100 / scale}%`, 
      height: `${100 / scale}%` 
    }}>
      <path
        d={path}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        className="hover:stroke-blue-400 pointer-events-auto"
        markerEnd="url(#arrowhead)"
      />
      
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
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