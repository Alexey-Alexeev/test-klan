import { useCallback, useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, updateWidgetPosition, updateWidget, deleteWidget } from '../../features/canvas/canvasSlice';
import { WidgetComponentProps } from '../../types';
import { ButtonWidget } from '../widgets/ButtonWidget';
import { TextWidget } from '../widgets/TextWidget';
import { InputWidget } from '../widgets/InputWidget';
import { ImageWidget } from '../widgets/ImageWidget';
import { CardWidget } from '../widgets/CardWidget';
import { DividerWidget } from '../widgets/DividerWidget';
import { SpacerWidget } from '../widgets/SpacerWidget';
import { IconWidget } from '../widgets/IconWidget';
import { BadgeWidget } from '../widgets/BadgeWidget';
import { ContainerWidget } from '../widgets/ContainerWidget';
import { CheckboxWidget } from '../widgets/CheckboxWidget';
import { SelectionBox } from './SelectionBox';

export function WidgetRenderer({ widget, isSelected, isEditable }: WidgetComponentProps) {
  const dispatch = useAppDispatch();
  const { gridSnap, snapSize, widgets, canvasSize } = useAppSelector(state => state.canvas);
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

      // Left edge alignment
      if (Math.abs(currentBounds.left - otherBounds.left) < snapThreshold) {
        snappedX = otherBounds.left;
      }
      // Right edge alignment
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

      // Top edge alignment
      if (Math.abs(currentBounds.top - otherBounds.top) < snapThreshold) {
        snappedY = otherBounds.top;
      }
      // Bottom edge alignment
      else if (Math.abs(currentBounds.bottom - otherBounds.bottom) < snapThreshold) {
        snappedY = otherBounds.bottom - widget.size.height;
      }
      // Center alignment
      else if (Math.abs(currentBounds.centerY - otherBounds.centerY) < snapThreshold) {
        snappedY = otherBounds.centerY - widget.size.height / 2;
      }
    }

    // Check canvas edge alignments
    if (Math.abs(position.x) < snapThreshold) {
      snappedX = 0;
    } else if (Math.abs(position.x + widget.size.width - canvasSize.width) < snapThreshold) {
      snappedX = canvasSize.width - widget.size.width;
    } else if (Math.abs(position.x + widget.size.width / 2 - canvasSize.width / 2) < snapThreshold) {
      snappedX = canvasSize.width / 2 - widget.size.width / 2;
    }

    if (Math.abs(position.y) < snapThreshold) {
      snappedY = 0;
    } else if (Math.abs(position.y + widget.size.height - canvasSize.height) < snapThreshold) {
      snappedY = canvasSize.height - widget.size.height;
    } else if (Math.abs(position.y + widget.size.height / 2 - canvasSize.height / 2) < snapThreshold) {
      snappedY = canvasSize.height / 2 - widget.size.height / 2;
    }

    return { x: snappedX, y: snappedY };
  }, [widget.id, widget.size, widgets, canvasSize]);

  const handleDrag = useCallback((e: any, data: any) => {
    if (!isEditable) return;
    
    let position = { x: data.x, y: data.y };
    
    // Apply automatic alignment - DISABLED
    // position = snapToAlignment(position);
    
    // Snap to grid if enabled
    if (gridSnap) {
      position.x = Math.round(position.x / snapSize) * snapSize;
      position.y = Math.round(position.y / snapSize) * snapSize;
    }
    
    // For root-level widgets, determine zone
    if (!widget.parentId) {
      // Определяем зону для виджета при перетаскивании (только для корневых элементов)
      const headerOffset = 40;
      const footerOffset = 40;
      const barHeight = 4;
      const footerBarTop = canvasSize.height - footerOffset - barHeight;
      const headerBarBottom = headerOffset + barHeight;
      const zone = position.y <= headerBarBottom ? 'header' : (position.y >= footerBarTop ? 'footer' : 'main');
    }
    // For child widgets, constraints are handled in updateWidgetPosition
    
    dispatch(updateWidgetPosition({ id: widget.id, position }));
  }, [dispatch, widget.id, gridSnap, snapSize, isEditable, widget.parentId, widget.size, widgets]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (!isEditable || isDragging) return;
    
    // Определяем, какой текст редактировать в зависимости от типа виджета
    let textToEdit = '';
    switch (widget.type) {
      case 'button':
        textToEdit = (widget as any).props.text || '';
        break;
      case 'text':
        textToEdit = (widget as any).props.content || '';
        break;
      case 'badge':
        textToEdit = (widget as any).props.text || '';
        break;
      default:
        return; // Не редактируем другие типы
    }
    
    setEditValue(textToEdit);
    setIsEditing(true);
  }, [isEditable, isDragging, widget]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  }, []);

  const handleEditSave = useCallback(() => {
    if (!editValue.trim()) return;
    
    let updates: any = {};
    switch (widget.type) {
      case 'button':
        updates = { props: { ...(widget as any).props, text: editValue } };
        break;
      case 'text':
        updates = { props: { ...(widget as any).props, content: editValue } };
        break;
      case 'badge':
        updates = { props: { ...(widget as any).props, text: editValue } };
        break;
    }
    
    dispatch(updateWidget({ id: widget.id, updates }));
    setIsEditing(false);
  }, [editValue, widget, dispatch]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
  }, []);

  // Обработка клавиши Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && e.key === 'Delete' && isEditable) {
        e.preventDefault();
        dispatch(deleteWidget(widget.id));
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, isEditable, widget.id, dispatch]);

  const renderWidget = () => {
    const commonProps = {
      widget,
      isSelected,
      isEditable,
      onSelect: handleSelect,
    };

    // Если редактируем текст, показываем поле ввода
    if (isEditing && (widget.type === 'button' || widget.type === 'text' || widget.type === 'badge')) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSave}
            className="w-full h-full text-center bg-transparent border-none outline-none"
            autoFocus
            style={{
              fontSize: widget.style.fontSize ? `${widget.style.fontSize}px` : '16px',
              fontWeight: widget.style.fontWeight || '400',
              color: widget.style.color || 'inherit',
            }}
          />
        </div>
      );
    }

    switch (widget.type) {
      case 'button':
        return <ButtonWidget {...commonProps} />;
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
      case 'checkbox':
        return <CheckboxWidget {...commonProps} />;
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
      >
        {renderWidget()}
      </div>
    );
  }

  return (
    <Draggable
      position={{ x: widget.position.x, y: widget.position.y }}
      onDrag={handleDrag}
      onStart={handleDragStart}
      onStop={handleDragStop}
      handle=".widget-handle"
      bounds="parent"
    >
      <div
        className={`absolute cursor-move ${isSelected ? 'widget-selected' : ''}`}
        style={{
          width: widget.size.width,
          height: widget.size.height,
          zIndex: Math.min(widget.zIndex, 100), // Ensure widgets don't block canvas resize handles
        }}
        onClick={handleSelect}
        onDoubleClick={handleDoubleClick}
      >
        {/* Drag handle overlay - lower z-index to not block canvas resize handles */}
        <div className="widget-handle absolute inset-0 z-[1] hover:bg-primary/5 transition-colors" />
        
        {/* Widget content */}
        <div className="relative z-0">
          {renderWidget()}
        </div>

        {/* Selection box with resize handles */}
        <SelectionBox
          widgetId={widget.id}
          position={widget.position}
          size={widget.size}
          isSelected={isSelected}
        />
      </div>
    </Draggable>
  );
}