import React from 'react';
import { WidgetComponentProps, IContainerWidget } from '../../types';
import { useAppSelector } from '../../store/hooks';
import { WidgetRenderer } from '../builder/WidgetRenderer';

export function ContainerWidget({ widget, isSelected, onSelect }: WidgetComponentProps) {
  const containerWidget = widget as IContainerWidget;
  const { widgets } = useAppSelector(state => state.canvas);
  
  // Get child widgets
  const childWidgets = widgets.filter(w => containerWidget.props.children.includes(w.id));
  
  
  // Map alignment props to CSS values
  const alignItemsMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch'
  };
  
  const justifyContentMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly'
  };

  const containerStyle: React.CSSProperties = {
    ...containerWidget.style,
    display: 'flex',
    flexDirection: containerWidget.props.direction === 'column' ? 'column' : 'row',
    flexWrap: 'wrap', // Always enable wrapping to prevent overflow
    gap: `${containerWidget.props.gap}px`,
    alignItems: alignItemsMap[containerWidget.props.alignment],
    justifyContent: justifyContentMap[containerWidget.props.contentAlignment],
    backgroundColor: containerWidget.style.backgroundColor || 'rgba(240, 240, 240, 0.8)',
    border: containerWidget.style.border || '2px dashed #d1d5db',
    borderRadius: containerWidget.style.borderRadius ? `${containerWidget.style.borderRadius}px` : '8px',
    padding: containerWidget.style.padding || '16px',
    minHeight: '200px', // Ensure minimum height
    minWidth: '200px', // Ensure minimum width
    width: Math.min(containerWidget.size.width, 300), // Limit width to 300px
    height: Math.min(containerWidget.size.height, 200), // Limit height to 200px
    maxWidth: '300px', // Fixed max width
    maxHeight: '200px', // Fixed max height
    position: 'relative',
    overflow: 'hidden', // Hide overflow to prevent elements from going outside
    boxSizing: 'border-box',
    zIndex: 1, // Keep container below canvas resize handles
    pointerEvents: 'auto', // Allow interaction with container content
    transition: 'all 0.2s ease-in-out',
    // Apply alpha if specified
    opacity: containerWidget.props.alpha !== undefined ? containerWidget.props.alpha / 100 : 1,
    // Apply rotation if specified
    transform: containerWidget.props.rotation !== undefined ? `rotate(${containerWidget.props.rotation}deg)` : 'none',
  };

  return (
    <div
      style={containerStyle}
      className="container-widget"
    >
      {/* Placeholder content when empty */}
      {childWidgets.length === 0 && (
        <div className="flex items-center justify-center text-gray-400 text-sm flex-1 min-h-[100px]">
          <div className="text-center">
            <div>Пустой контейнер</div>
            <div className="text-xs mt-1">Добавьте элементы через дерево компонентов</div>
          </div>
        </div>
      )}
      
      
      {/* Render child widgets using flexbox */}
      {childWidgets.map(childWidget => {
        return (
          <div
            key={childWidget.id}
            style={{
              position: 'relative',
              width: `${childWidget.size.width}px`,
              height: `${childWidget.size.height}px`,
              zIndex: childWidget.zIndex,
              pointerEvents: 'auto', // Allow interaction with child widgets
              flexShrink: 0,
              flexBasis: 'auto', // Allow natural sizing
              maxWidth: '100%', // Prevent overflow
            }}
          >
            <WidgetRenderer
              widget={childWidget}
              isSelected={false}
              isEditable={false}
            />
          </div>
        );
      })}
    </div>
  );
}
