import React from 'react';
import { X } from 'lucide-react';

interface ConnectionLineProps {
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  onDelete: () => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  sourcePosition,
  targetPosition,
  onDelete,
}) => {
  const startX = sourcePosition.x + 192; // node width + port offset
  const startY = sourcePosition.y + 50;
  const endX = targetPosition.x;
  const endY = targetPosition.y + 50;

  const midX = (startX + endX) / 2;
  const controlPointOffset = Math.abs(endX - startX) * 0.3;

  const path = `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        className="hover:stroke-blue-400"
      />
      
      {/* Delete button */}
      <foreignObject
        x={midX - 10}
        y={(startY + endY) / 2 - 10}
        width="20"
        height="20"
      >
        <button
          className="w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </foreignObject>
    </g>
  );
};