import React from 'react';
import { X } from 'lucide-react';

interface ConnectionLineProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  sourceNodeType: string;
  targetNodeType: string;
  onDelete: () => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourcePosition,
  targetPosition,
  sourceNodeType,
  targetNodeType,
  onDelete,
}) => {
  // 计算源节点输出端口位置（右侧中间）
  let startX, startY;
  if (sourceNodeType === 'start' || sourceNodeType === 'end') {
    // 圆形节点：右侧边缘中心
    startX = sourcePosition.x + 48; // 圆形半径 48px
    startY = sourcePosition.y + 48; // 圆形中心 + 半径
  } else {
    // 矩形节点：右侧边缘中心
    startX = sourcePosition.x + 192; // 节点宽度 192px
    startY = sourcePosition.y + 40; // 节点高度的一半
  }
  
  // 计算目标节点输入端口位置（左侧中间）
  let endX, endY;
  if (targetNodeType === 'start' || targetNodeType === 'end') {
    // 圆形节点：左侧边缘中心
    endX = targetPosition.x; // 圆形左边缘
    endY = targetPosition.y + 48; // 圆形中心
  } else {
    // 矩形节点：左侧边缘中心
    endX = targetPosition.x; // 节点左边缘
    endY = targetPosition.y + 40; // 节点高度的一半
  }

  const midX = (startX + endX) / 2;
  const controlPointOffset = Math.abs(endX - startX) * 0.3;

  const path = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;

  return (
    <svg className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
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
        y={(startY + endY) / 2 - 10}
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