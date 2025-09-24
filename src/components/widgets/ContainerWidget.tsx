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

  // Calculate positioning and layout based on content alignment
  const getContainerLayout = () => {
    if (childWidgets.length === 0) return {};
    
    const { contentAlignment, alignment, direction } = containerWidget.props;
    
    // For space-between, space-around, space-evenly - use flexbox
    if (['space-between', 'space-around', 'space-evenly'].includes(contentAlignment)) {
      return {
        justifyContent: justifyContentMap[contentAlignment],
        alignItems: alignItemsMap[alignment],
        flexDirection: direction === 'column' ? 'column' : 'row',
      };
    }
    
    // For stretch alignment - use flexbox with stretch
    if (alignment === 'stretch') {
      return {
        justifyContent: justifyContentMap[contentAlignment],
        alignItems: 'stretch',
        flexDirection: direction === 'column' ? 'column' : 'row',
      };
    }
    
    // For other cases - position first element absolutely
    const getFirstElementPosition = () => {
      // Calculate horizontal position
      let left: string | number = 0;
      if (contentAlignment === 'center') {
        left = '50%';
      } else if (contentAlignment === 'end') {
        left = '100%';
      }
      
      // Calculate vertical position  
      let top: string | number = 0;
      if (alignment === 'center') {
        top = '50%';
      } else if (alignment === 'end') {
        top = '100%';
      }
      
      return {
        position: 'absolute' as const,
        left: typeof left === 'string' ? left : `${left}px`,
        top: typeof top === 'string' ? top : `${top}px`,
        transform: (() => {
          const isContentCenter = contentAlignment === 'center';
          const isAlignmentCenter = alignment === 'center';
          
          if (isContentCenter && isAlignmentCenter) {
            return 'translate(-50%, -50%)';
          } else if (isContentCenter) {
            return 'translateX(-50%)';
          } else if (isAlignmentCenter) {
            return 'translateY(-50%)';
          } else {
            return 'none';
          }
        })()
      };
    };
    
    return {
      firstElementPosition: getFirstElementPosition(),
      useFlexbox: false
    };
  };

  const containerLayout = getContainerLayout();
  
  const containerStyle: React.CSSProperties = {
    ...containerWidget.style,
    display: childWidgets.length === 0 ? 'flex' : 'flex',
    placeItems: 'unset',
    flexDirection: (containerLayout.flexDirection as React.CSSProperties['flexDirection']) || (containerWidget.props.direction === 'column' ? 'column' : 'row'),
    flexWrap: 'wrap', // Always enable wrapping to prevent overflow
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
      
      
      {/* Render child widgets */}
      {childWidgets.map((childWidget, index) => {
        const isFirstElement = index === 0;
        const useFlexbox = containerLayout.useFlexbox !== false;
        
        // For flexbox layouts (space-between, space-around, space-evenly, stretch)
        if (useFlexbox) {
          return (
            <div
              key={childWidget.id}
              style={{
                position: 'relative',
                flex: containerWidget.props.alignment === 'stretch' ? 1 : 'none',
                minWidth: 0, // Allow shrinking below content size
                minHeight: 0, // Allow shrinking below content size
                zIndex: childWidget.zIndex,
                pointerEvents: 'auto', // Allow interaction with child widgets
                display: 'flex',
                alignItems: 'stretch', // Make child widgets fill the container height
                justifyContent: 'stretch', // Make child widgets fill the container width
                margin: 0, // Remove any default margins
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
        }
        
        // For absolute positioning layouts
        const firstElementPosition = containerLayout.firstElementPosition || {};
        
        // Calculate position for subsequent elements
        const getSubsequentElementPosition = () => {
          if (isFirstElement) return {};
          
          const { direction } = containerWidget.props;
          const gap = containerWidget.props.gap;
          
          const firstLeft = (firstElementPosition as any).left || '0';
          const firstTop = (firstElementPosition as any).top || '0';
          const firstTransform = (firstElementPosition as any).transform || 'none';
          
          if (direction === 'column') {
            // For vertical layout, stack elements below the first one
            return {
              position: 'absolute' as const,
              left: firstLeft,
              top: `calc(${firstTop} + ${index * (childWidget.size.height + gap)}px)`,
              transform: firstTransform
            };
          } else {
            // For horizontal layout, place elements to the right of the first one
            return {
              position: 'absolute' as const,
              left: `calc(${firstLeft} + ${index * (childWidget.size.width + gap)}px)`,
              top: firstTop,
              transform: firstTransform
            };
          }
        };
        
        return (
          <div
            key={childWidget.id}
            style={{
              position: 'absolute',
              ...(isFirstElement ? firstElementPosition : getSubsequentElementPosition()),
              flex: 'none', // No flex for absolute positioned elements
              minWidth: 0, // Allow shrinking below content size
              minHeight: 0, // Allow shrinking below content size
              zIndex: childWidget.zIndex,
              pointerEvents: 'auto', // Allow interaction with child widgets
              display: 'flex',
              alignItems: 'stretch', // Make child widgets fill the container height
              justifyContent: 'stretch', // Make child widgets fill the container width
              margin: 0, // Remove any default margins
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
