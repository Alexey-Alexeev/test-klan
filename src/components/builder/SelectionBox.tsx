import React, { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateWidgetPosition, updateWidgetSize, selectWidget } from '../../features/canvas/canvasSlice';

interface SelectionBoxProps {
  widgetId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isSelected: boolean;
}

export function SelectionBox({ widgetId, position, size, isSelected }: SelectionBoxProps) {
  const dispatch = useAppDispatch();
  const { gridSnap, snapSize } = useAppSelector(state => state.canvas);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPosition({ x: e.clientX, y: e.clientY });
    setStartSize({ width: size.width, height: size.height });
  }, [size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeHandle) return;

    const deltaX = e.clientX - startPosition.x;
    const deltaY = e.clientY - startPosition.y;

    let newSize = { ...startSize };
    let newPosition = { ...position };

    switch (resizeHandle) {
      case 'se': // Southeast
        newSize.width = Math.max(20, startSize.width + deltaX);
        newSize.height = Math.max(20, startSize.height + deltaY);
        break;
      case 'sw': // Southwest
        newSize.width = Math.max(20, startSize.width - deltaX);
        newSize.height = Math.max(20, startSize.height + deltaY);
        newPosition.x = position.x + (startSize.width - newSize.width);
        break;
      case 'ne': // Northeast
        newSize.width = Math.max(20, startSize.width + deltaX);
        newSize.height = Math.max(20, startSize.height - deltaY);
        newPosition.y = position.y + (startSize.height - newSize.height);
        break;
      case 'nw': // Northwest
        newSize.width = Math.max(20, startSize.width - deltaX);
        newSize.height = Math.max(20, startSize.height - deltaY);
        newPosition.x = position.x + (startSize.width - newSize.width);
        newPosition.y = position.y + (startSize.height - newSize.height);
        break;
      case 'e': // East
        newSize.width = Math.max(20, startSize.width + deltaX);
        break;
      case 'w': // West
        newSize.width = Math.max(20, startSize.width - deltaX);
        newPosition.x = position.x + (startSize.width - newSize.width);
        break;
      case 's': // South
        newSize.height = Math.max(20, startSize.height + deltaY);
        break;
      case 'n': // North
        newSize.height = Math.max(20, startSize.height - deltaY);
        newPosition.y = position.y + (startSize.height - newSize.height);
        break;
    }

    // Snap to grid if enabled
    if (gridSnap) {
      newSize.width = Math.round(newSize.width / snapSize) * snapSize;
      newSize.height = Math.round(newSize.height / snapSize) * snapSize;
      newPosition.x = Math.round(newPosition.x / snapSize) * snapSize;
      newPosition.y = Math.round(newPosition.y / snapSize) * snapSize;
    }

    dispatch(updateWidgetSize({ id: widgetId, size: newSize }));
    if (newPosition.x !== position.x || newPosition.y !== position.y) {
      dispatch(updateWidgetPosition({ id: widgetId, position: newPosition }));
    }
  }, [isResizing, resizeHandle, startPosition, startSize, position, gridSnap, snapSize, dispatch, widgetId]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  if (!isSelected) return null;

  const handleStyle = {
    position: 'absolute' as const,
    width: '8px',
    height: '8px',
    backgroundColor: 'hsl(var(--primary))',
    border: '1px solid white',
    borderRadius: '1px',
    cursor: 'pointer',
    pointerEvents: 'auto' as const,
  };

  return (
    <div
      className="absolute"
      style={{
        left: -2,
        top: -2,
        width: size.width + 4,
        height: size.height + 4,
        border: '2px solid hsl(var(--primary))',
        borderRadius: '2px',
        pointerEvents: 'none',
      }}
    >
      {/* Corner handles */}
      <div
        style={{
          ...handleStyle,
          top: '-4px',
          left: '-4px',
          cursor: 'nw-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
      />
      <div
        style={{
          ...handleStyle,
          top: '-4px',
          right: '-4px',
          cursor: 'ne-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
      />
      <div
        style={{
          ...handleStyle,
          bottom: '-4px',
          left: '-4px',
          cursor: 'sw-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
      />
      <div
        style={{
          ...handleStyle,
          bottom: '-4px',
          right: '-4px',
          cursor: 'se-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'se')}
      />

      {/* Edge handles */}
      <div
        style={{
          ...handleStyle,
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 'n-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'n')}
      />
      <div
        style={{
          ...handleStyle,
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          cursor: 's-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 's')}
      />
      <div
        style={{
          ...handleStyle,
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'w-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'w')}
      />
      <div
        style={{
          ...handleStyle,
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'e-resize',
        }}
        onMouseDown={(e) => handleMouseDown(e, 'e')}
      />
    </div>
  );
}
