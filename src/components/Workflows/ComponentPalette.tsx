import React, { useState } from 'react';
import { ComponentType } from '../../types';
import { Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { COMPONENT_CATEGORIES } from '../../types/WorkflowTypes';
import { getComponentsByCategory } from '../../types/ComponentRegistry';

// Get component categories configuration for UI
const getComponentCategories = () => {
  return Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => ({
    categoryKey: key,
    title: category.name,
    components: getComponentsByCategory(key)
  }));
};

interface ComponentPaletteProps {
  onAddNode: (type: ComponentType) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddNode }) => {
  const { isDark } = useTheme();
  const categories = getComponentCategories();

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        Component Palette
      </h3>
      
      {/* Connection Rules - Updated for new workflow */}
      <div className={`mb-6 p-3 ${isDark ? 'bg-gray-700' : 'bg-white border border-gray-200'} rounded-lg`}>
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2 text-sm`}>Connection Rules</h4>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
          <p>• Start → Data Sources</p>
          <p>• Data Sources → AI Analysis</p>
          <p>• AI Analysis → Trade Executors</p>
          <p>• Trade Executors → Result Collectors</p>
          <p>• Result Collectors → End</p>
        </div>
        <div className={`mt-2 text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          <p>💡 Hover over components to see details</p>
          <p>🖱️ Right-click and drag to connect components</p>
          <p>🔍 Mouse wheel to zoom canvas</p>
        </div>
      </div>
      
      {/* Component Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.categoryKey} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
            <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
              {category.title}
              <span className={`ml-2 px-2 py-0.5 text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} rounded`}>
                {category.components.length}
              </span>
            </h4>
            
            <div className="space-y-2">
              {category.components.map((schema) => {
                const Icon = schema.icon;
                return (
                  <div 
                    key={schema.type} 
                    className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white border border-gray-200 hover:border-gray-300'} rounded-lg p-2 transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                        <h5 className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{schema.name}</h5>
                      </div>
                      <button
                        onClick={() => onAddNode(schema.type)}
                        className={`p-1 rounded ${schema.style.color} ${schema.style.hoverColor} text-white transition-all duration-200 hover:scale-105 active:scale-95`}
                        title={`Create ${schema.name}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                      {schema.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Collapsed state component palette - Ensures consistency when expanded/collapsed
interface ComponentPaletteCollapsedProps {
  onAddNode: (type: ComponentType) => void;
  readOnlyMode?: boolean;
  isDark: boolean;
  t: (key: string) => string;
}

export const ComponentPaletteCollapsed: React.FC<ComponentPaletteCollapsedProps> = ({ 
  onAddNode, 
  readOnlyMode, 
  isDark, 
  t 
}) => {
  const categories = getComponentCategories();
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Flatten all components from all categories
  const allComponents = categories.reduce((acc, category) => {
    return acc.concat(category.components);
  }, [] as Array<{ type: string; name: string; description: string; icon: React.ComponentType; style: { color: string; hoverColor: string } }>);

  const handleMouseEnter = (schema: { type: string; name: string; description: string; icon: React.ComponentType; style: { color: string; hoverColor: string } }, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left - 10,
      y: rect.top + rect.height / 2
    });
    setHoveredComponent(schema.type);
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
    // Delay hiding the component to allow for fade out animation
    setTimeout(() => {
      if (!tooltipVisible) {
        setHoveredComponent(null);
      }
    }, 300);
  };



  return (
    <>
      {allComponents.map((schema) => {
        const Icon = schema.icon;
        // const isHovered = hoveredComponent === schema.type;
        
        return (
          <div key={schema.type} className="relative mb-2">
            <button
              onClick={() => !readOnlyMode && onAddNode(schema.type)}
              onMouseEnter={(e) => handleMouseEnter(schema, e)}
              onMouseLeave={handleMouseLeave}
              disabled={!!readOnlyMode}
              className={`w-8 h-8 ${readOnlyMode ? 'bg-gray-500 cursor-not-allowed' : `${schema.style.color} ${schema.style.hoverColor}`} rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-110 active:scale-95 ${readOnlyMode ? 'opacity-50' : ''}`}
              aria-label={`Add ${schema.name} node`}
            >
              <Icon className="w-4 h-4 text-white transition-transform group-hover:scale-105" />
            </button>
            

          </div>
        );
      })}
      
      {/* Global tooltip */}
      {hoveredComponent && (
        <div 
          className={`fixed px-3 py-2 rounded-lg text-xs whitespace-normal ${isDark ? 'bg-gray-900 text-white border border-gray-600' : 'bg-white text-gray-800 border border-gray-300'} shadow-2xl min-w-[200px] max-w-[250px] transition-all duration-300 ease-in-out ${tooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ 
            zIndex: 999,
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translate(-100%, -50%)',
            pointerEvents: 'none'
          }}
        >
          {(() => {
            const schema = allComponents.find(c => c.type === hoveredComponent);
            if (!schema) return null;
            const Icon = schema.icon;
            
            return (
              <>
                <div className="font-semibold text-xs mb-1 flex items-center gap-2">
                  <Icon className="w-3 h-3" />
                  {schema.name}
                </div>
                <div className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {schema.description}
                </div>
                {/* Arrow pointer pointing right */}
                <div className={`absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] ${isDark ? 'border-l-gray-900' : 'border-l-white'} border-t-transparent border-b-transparent`}></div>
              </>
            );
          })()}
        </div>
      )}
    </>
  );
};