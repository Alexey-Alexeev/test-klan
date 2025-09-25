import { useCallback, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, updateWidgetPosition, updateWidget, deleteWidget } from '../../features/canvas/canvasSlice';
import { WidgetComponentProps } from '../../types';
import { EnhancedButtonWidget } from '../widgets/EnhancedButtonWidget';
import { TextWidget } from '../widgets/TextWidget';
import { InputWidget } from '../widgets/InputWidget';
import { ImageWidget } from '../widgets/ImageWidget';
import { CardWidget } from '../widgets/CardWidget';
import { DividerWidget } from '../widgets/DividerWidget';
import { SpacerWidget } from '../widgets/SpacerWidget';
import { IconWidget } from '../widgets/IconWidget';
import { BadgeWidget } from '../widgets/BadgeWidget';
import { ContainerWidget } from '../widgets/ContainerWidget';
import { SelectionBox } from './SelectionBox';

export function EnhancedWidgetRenderer({ widget, isSelected, isEditable }: WidgetComponentProps) {
  const dispatch = useAppDispatch();
  const { gridSnap, snapSize, widgets, canvasSize } = useAppSelector(state => state.canvas);
  const { runtime } = useAppSelector(state => state.state);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleSelect = useCallback(() => {
    if (isEditable) {
      dispatch(selectWidget(widget.id));
    }
  }, [dispatch, widget.id, isEditable]);

  const snapToAlignment = useCallback((position: { x: number; y: number }) => {
    const snapThreshold = 10; // pixels
    let snappedX = position.x;
    let snappedY = position.y;

    const currentBounds = {
      left: position.x,
      right: position.x + widget.size.width,
      top: position.y,
      bottom: position.y + widget.size.height,
      centerX: position.x + widget.size.width / 2,
      centerY: position.y + widget.size.height / 2,
    };

    // Get other widgets (excluding current)
    const otherWidgets = widgets.filter(w => w.id !== widget.id);

    // Check horizontal alignments
    for (const otherWidget of otherWidgets) {
      const otherBounds = {
        left: otherWidget.position.x,
        right: otherWidget.position.x + otherWidget.size.width,
        centerX: otherWidget.position.x + otherWidget.size.width / 2,
      };

      // Left alignment
      if (Math.abs(currentBounds.left - otherBounds.left) < snapThreshold) {
        snappedX = otherBounds.left;
      }
      // Right alignment
      else if (Math.abs(currentBounds.right - otherBounds.right) < snapThreshold) {
        snappedX = otherBounds.right - widget.size.width;
      }
      // Center alignment
      else if (Math.abs(currentBounds.centerX - otherBounds.centerX) < snapThreshold) {
        snappedX = otherBounds.centerX - widget.size.width / 2;
      }
    }

    // Check vertical alignments
    for (const otherWidget of otherWidgets) {
      const otherBounds = {
        top: otherWidget.position.y,
        bottom: otherWidget.position.y + otherWidget.size.height,
        centerY: otherWidget.position.y + otherWidget.size.height / 2,
      };

      // Top alignment
      if (Math.abs(currentBounds.top - otherBounds.top) < snapThreshold) {
        snappedY = otherBounds.top;
      }
      // Bottom alignment
      else if (Math.abs(currentBounds.bottom - otherBounds.bottom) < snapThreshold) {
        snappedY = otherBounds.bottom - widget.size.height;
      }
      // Center alignment
      else if (Math.abs(currentBounds.centerY - otherBounds.centerY) < snapThreshold) {
        snappedY = otherBounds.centerY - widget.size.height / 2;
      }
    }

    return { x: snappedX, y: snappedY };
  }, [widgets, widget.size]);

  const snapToGrid = useCallback((position: { x: number; y: number }) => {
    if (!gridSnap) return position;
    
    return {
      x: Math.round(position.x / snapSize) * snapSize,
      y: Math.round(position.y / snapSize) * snapSize,
    };
  }, [gridSnap, snapSize]);

  const handleDrag = useCallback((e: any, data: any) => {
    if (!isEditable) return;
    
    let newPosition = { x: data.x, y: data.y };
    
    // Apply alignment snapping first
    newPosition = snapToAlignment(newPosition);
    
    // Then apply grid snapping
    newPosition = snapToGrid(newPosition);
    
    dispatch(updateWidgetPosition({ id: widget.id, position: newPosition }));
  }, [dispatch, widget.id, snapToAlignment, snapToGrid, isEditable]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditable) return;
    
    if (widget.type === 'text' || widget.type === 'button') {
      setIsEditing(true);
      const textWidget = widget as any;
      setEditValue(
        widget.type === 'text' 
          ? textWidget.props.content 
          : textWidget.props.text
      );
    }
  }, [widget, isEditable]);

  const handleEditConfirm = useCallback(() => {
    if (widget.type === 'text') {
      dispatch(updateWidget({
        id: widget.id,
        updates: {
          props: { ...widget.props, content: editValue }
        } as any
      }));
    } else if (widget.type === 'button') {
      dispatch(updateWidget({
        id: widget.id,
        updates: {
          props: { ...widget.props, text: editValue }
        } as any
      }));
    }
    setIsEditing(false);
    setEditValue('');
  }, [dispatch, widget, editValue]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditConfirm();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  }, [handleEditConfirm, handleEditCancel]);

  const renderWidget = () => {
    const commonProps = {
      widget,
      isSelected,
      isEditable,
      onSelect: handleSelect,
      onUpdate: (updates: any) => dispatch(updateWidget({ id: widget.id, updates })),
    };

    // Container widgets need special handling for children
    if (widget.type === 'container') {
      const containerWidget = widget as any;
      const childWidgets = widgets.filter(w => 
        containerWidget.props.children?.includes(w.id)
      );

      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            ...widget.style,
          }}
          onDoubleClick={handleDoubleClick}
        >
          <ContainerWidget {...commonProps} />
          {childWidgets.map(childWidget => (
            <EnhancedWidgetRenderer
              key={childWidget.id}
              widget={childWidget}
              isSelected={false}
              isEditable={isEditable}
            />
          ))}
        </div>
      );
    }

    switch (widget.type) {
      case 'button':
        return <EnhancedButtonWidget {...commonProps} />;
      case 'text':
        return <TextWidget {...commonProps} />;
      case 'input':
        return <InputWidget {...commonProps} />;
      case 'image':
        return <ImageWidget {...commonProps} />;
      case 'card':
        return <CardWidget {...commonProps} />;
      case 'divider':
        return <DividerWidget {...commonProps} />;
      case 'spacer':
        return <SpacerWidget {...commonProps} />;
      case 'icon':
        return <IconWidget {...commonProps} />;
      case 'badge':
        return <BadgeWidget {...commonProps} />;
      case 'container':
        return <ContainerWidget {...commonProps} />;
      default:
        return null;
    }
  };

  if (!isEditable) {
    // If widget has a parent, use relative positioning
    const positioning = widget.parentId ? 'relative' : 'absolute';
    
    return (
      <div
        style={{
          position: positioning,
          left: widget.parentId ? 0 : widget.position.x,
          top: widget.parentId ? 0 : widget.position.y,
          width: widget.size.width,
          height: widget.size.height,
          zIndex: Math.min(widget.zIndex, 100), // Ensure widgets don't block canvas resize handles
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing && (widget.type === 'text' || widget.type === 'button') && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditConfirm}
              autoFocus
              style={{
                width: '100%',
                height: '100%',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            />
          </div>
        )}
        {renderWidget()}
      </div>
    );
  }

  return (
    <Draggable
      position={{ x: widget.position.x, y: widget.position.y }}
      onDrag={handleDrag}
      onStart={() => setIsDragging(true)}
      onStop={() => setIsDragging(false)}
      handle=".widget-handle"
      bounds={{
        left: 0,
        top: 0,
        right: canvasSize.width - widget.size.width,
        bottom: canvasSize.height - widget.size.height,
      }}
    >
      <div
        className="widget-handle cursor-move"
        style={{
          position: 'absolute',
          width: widget.size.width,
          height: widget.size.height,
          zIndex: widget.zIndex,
        }}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing && (widget.type === 'text' || widget.type === 'button') && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditConfirm}
              autoFocus
              style={{
                width: '100%',
                height: '100%',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            />
          </div>
        )}
        
        {renderWidget()}
        
        {isSelected && <SelectionBox widget={widget} />}
      </div>
    </Draggable>
  );
}
