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
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  };
  
  const justifyContentMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
    'space-around': 'space-around',
    'space-evenly': 'space-evenly'
  };

  // Use flexbox for all layouts (following flexbox principles)
  const getContainerLayout = () => {
    const { contentAlignment, alignment, direction, wrap } = containerWidget.props;
    
    // Always use flexbox for proper alignment
    return {
      justifyContent: justifyContentMap[contentAlignment],
      alignItems: alignItemsMap[alignment],
      flexDirection: direction === 'column' ? 'column' : 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
    };
  };

  const containerLayout = getContainerLayout();
  
  const containerStyle: React.CSSProperties = {
    ...containerWidget.style,
    display: childWidgets.length === 0 ? 'flex' : 'flex',
    placeItems: 'unset',
    flexDirection: (containerLayout.flexDirection as React.CSSProperties['flexDirection']) || (containerWidget.props.direction === 'column' ? 'column' : 'row'),
    flexWrap: (containerLayout.flexWrap as React.CSSProperties['flexWrap']) || 'wrap',
    gap: `${containerWidget.props.gap}px`,
    alignItems: childWidgets.length === 0 ? 'center' : (containerLayout.alignItems || 'flex-start'),
    justifyContent: childWidgets.length === 0 ? 'center' : (containerLayout.justifyContent || 'flex-start'),
    backgroundColor: childWidgets.length === 0 ? 'transparent' : (containerWidget.style.backgroundColor || 'rgba(240, 240, 240, 0.8)'),
    border: childWidgets.length === 0 ? 'none' : (containerWidget.style.border || '2px dashed #d1d5db'),
    borderRadius: containerWidget.style.borderRadius ? `${containerWidget.style.borderRadius}px` : '8px',
    padding: '0', // Remove default padding to eliminate spacing
    margin: '0', // Remove any default margins
    minHeight: '200px', // Ensure minimum height
    minWidth: '200px', // Ensure minimum width
    width: `${containerWidget.size.width}px`, // Use actual container width
    height: `${containerWidget.size.height}px`, // Use actual container height
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
        <div 
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div>Пустой контейнер</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Добавьте элементы через дерево компонентов</div>
        </div>
      )}
      
      
      {/* Render child widgets using flexbox */}
      {childWidgets.map((childWidget) => {
        return (
          <div
            key={childWidget.id}
            style={{
              position: 'relative',
              flex: 'none',
              minWidth: 0, // Allow shrinking below content size
              minHeight: 0, // Allow shrinking below content size
              zIndex: childWidget.zIndex,
              pointerEvents: 'auto', // Allow interaction with child widgets
              display: 'flex',
              alignItems: 'stretch', // Make child widgets fill the container height
              justifyContent: 'stretch', // Make child widgets fill the container width
              margin: childWidget.style.margin || 0, // Respect child widget margins
              padding: 0, // Remove any default padding
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
