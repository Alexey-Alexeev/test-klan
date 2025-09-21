import { useRef, useCallback, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, addWidget, setPanOffset, setZoom } from '../../features/canvas/canvasSlice';
import { createDefaultWidget } from '../../lib/widgetDefaults';
import { WidgetRenderer } from './WidgetRenderer';
import { Ruler } from './Ruler';
import { Guides } from './Guides';

export function Canvas() {
  const dispatch = useAppDispatch();
  const { 
    widgets, 
    selectedWidgetId, 
    canvasSize, 
    gridSnap, 
    snapSize,
    zoom, 
    panOffset, 
    showRulers, 
    gridSize, 
    showGrid 
  } = useAppSelector(state => state.canvas);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(selectWidget(null));
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widget-type');
    
    if (widgetType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - (panOffset?.x || 0)) / zoom;
      const y = (e.clientY - rect.top - (panOffset?.y || 0)) / zoom;
      
      // Snap to grid if enabled
      const position = gridSnap 
        ? { x: Math.round(x / snapSize) * snapSize, y: Math.round(y / snapSize) * snapSize }
        : { x, y };

      const widget = createDefaultWidget(widgetType, position);
      if (widget) {
        dispatch(addWidget(widget));
      }
    }
  }, [dispatch, zoom, gridSnap, snapSize, panOffset]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Pan functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Left
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      dispatch(setPanOffset({
        x: (panOffset?.x || 0) + deltaX,
        y: (panOffset?.y || 0) + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint, panOffset, dispatch]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(3, zoom + delta));
      dispatch(setZoom(newZoom));
    }
  }, [zoom, dispatch]);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      {/* Rulers */}
      {showRulers && (
        <>
          <Ruler orientation="horizontal" zoom={zoom} panOffset={panOffset} />
          <Ruler orientation="vertical" zoom={zoom} panOffset={panOffset} />
        </>
      )}
      
      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 overflow-auto"
        style={{ 
          top: showRulers ? '20px' : '0',
          left: showRulers ? '20px' : '0',
          right: '0',
          bottom: '0',
        }}
      >
        <div 
          ref={canvasRef}
          className={`relative bg-white shadow-lg border border-gray-300 ${showGrid ? 'canvas-grid' : ''}`}
          style={{ 
            width: canvasSize.width * zoom,
            height: canvasSize.height * zoom,
            transform: `translate(${panOffset?.x || 0}px, ${panOffset?.y || 0}px)`,
            backgroundImage: showGrid ? `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            ` : 'none',
            backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
            backgroundPosition: `${panOffset?.x || 0}px ${panOffset?.y || 0}px`,
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {widgets.map((widget) => (
            <WidgetRenderer
              key={widget.id}
              widget={widget}
              isSelected={selectedWidgetId === widget.id}
              isEditable={true}
            />
          ))}
          
          {/* Guides for alignment */}
          <Guides
            widgets={widgets}
            selectedWidgetId={selectedWidgetId}
            canvasSize={canvasSize}
            zoom={zoom}
            panOffset={panOffset}
          />
          
          {/* Drop zone indicator */}
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-transparent transition-colors duration-200 ease-in-out" />
        </div>
      </div>
    </div>
  );
}