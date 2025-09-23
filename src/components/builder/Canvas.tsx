import { useRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, addWidget, setPanOffset, setZoom, setCanvasSize, toggleCanvasSizeLock } from '../../features/canvas/canvasSlice';
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
    showGrid,
    isCanvasSizeLocked,
  } = useAppSelector(state => state.canvas);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isResizingCanvas, setIsResizingCanvas] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<'e' | 's' | 'se' | null>(null);
  const [rulerOrigin, setRulerOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sizeDraft, setSizeDraft] = useState<{ width: string; height: string }>({ width: '', height: '' });

  useEffect(() => {
    setSizeDraft({ width: String(Math.round(canvasSize.width)), height: String(Math.round(canvasSize.height)) });
  }, [canvasSize.width, canvasSize.height]);

  const commitSizeFromDraft = useCallback(() => {
    if (isCanvasSizeLocked) return;
    let w = parseInt(sizeDraft.width, 10);
    let h = parseInt(sizeDraft.height, 10);
    if (!Number.isFinite(w)) w = canvasSize.width;
    if (!Number.isFinite(h)) h = canvasSize.height;
    w = Math.max(200, w);
    h = Math.max(300, h);
    if (gridSnap) {
      w = Math.round(w / snapSize) * snapSize;
      h = Math.round(h / snapSize) * snapSize;
    }
    dispatch(setCanvasSize({ width: w, height: h }));
  }, [dispatch, sizeDraft, isCanvasSizeLocked, canvasSize.width, canvasSize.height, gridSnap, snapSize]);

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
    setIsResizingCanvas(false);
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
    if (isPanning || isResizingCanvas) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, isResizingCanvas, handleMouseMove, handleMouseUp]);

  // Keep rulers' origin aligned with the canvas screen position
  useEffect(() => {
    const updateOrigin = () => {
      if (!canvasRef.current || !rootRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      setRulerOrigin({ x: canvasRect.left - rootRect.left, y: canvasRect.top - rootRect.top });
    };
    updateOrigin();
    const handleResize = () => updateOrigin();
    window.addEventListener('resize', handleResize);
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateOrigin, { passive: true });
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) container.removeEventListener('scroll', updateOrigin as any);
    };
  }, [zoom, panOffset, canvasSize, showRulers]);

  // Resize canvas handlers
  const onCanvasResizeMouseDown = useCallback((e: React.MouseEvent, direction: 'e' | 's' | 'se' = 'se') => {
    e.stopPropagation();
    if (isCanvasSizeLocked) return;
    setIsResizingCanvas(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width: canvasSize.width, height: canvasSize.height });
    setResizeDirection(direction);
  }, [canvasSize, isCanvasSizeLocked]);

  const handleMouseMoveCanvasResize = useCallback((e: MouseEvent) => {
    if (!isResizingCanvas) return;
    const deltaX = (e.clientX - resizeStart.x) / zoom;
    const deltaY = (e.clientY - resizeStart.y) / zoom;
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    if (resizeDirection === 'e' || resizeDirection === 'se') {
      newWidth = Math.max(200, resizeStart.width + deltaX);
    }
    if (resizeDirection === 's' || resizeDirection === 'se') {
      newHeight = Math.max(300, resizeStart.height + deltaY);
    }
    if (gridSnap) {
      newWidth = Math.round(newWidth / snapSize) * snapSize;
      newHeight = Math.round(newHeight / snapSize) * snapSize;
    }
    dispatch(setCanvasSize({ width: Math.round(newWidth), height: Math.round(newHeight) }));
  }, [isResizingCanvas, resizeStart, zoom, gridSnap, snapSize, resizeDirection, dispatch]);

  useEffect(() => {
    if (!isResizingCanvas) return;
    const onMove = (e: MouseEvent) => handleMouseMoveCanvasResize(e);
    const onUp = () => { setIsResizingCanvas(false); setResizeDirection(null); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizingCanvas, handleMouseMoveCanvasResize]);

  return (
    <div ref={rootRef} className="flex-1 relative overflow-hidden bg-gray-50">
      {/* Rulers */}
      {showRulers && (
        <>
          <Ruler orientation="horizontal" zoom={zoom} origin={rulerOrigin} />
          <Ruler orientation="vertical" zoom={zoom} origin={rulerOrigin} />
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
        {/* Toolbar above smartphone (outside canvas) */}
        <div className="sticky top-0 z-30 w-full flex items-center justify-center py-2">
          <div className="inline-flex items-center gap-3 rounded-md bg-white/80 backdrop-blur px-3 py-1 shadow border border-gray-200">
            <div className="flex items-center gap-2">
              <Input
                className="h-7 w-20 text-xs"
                type="number"
                value={sizeDraft.width}
                disabled={isCanvasSizeLocked}
                onChange={(e) => setSizeDraft((p) => ({ ...p, width: e.target.value }))}
                onBlur={commitSizeFromDraft}
                onKeyDown={(e) => { if (e.key === 'Enter') { commitSizeFromDraft(); } }}
                aria-label="Ширина холста"
              />
              <span className="text-xs text-gray-700">×</span>
              <Input
                className="h-7 w-20 text-xs"
                type="number"
                value={sizeDraft.height}
                disabled={isCanvasSizeLocked}
                onChange={(e) => setSizeDraft((p) => ({ ...p, height: e.target.value }))}
                onBlur={commitSizeFromDraft}
                onKeyDown={(e) => { if (e.key === 'Enter') { commitSizeFromDraft(); } }}
                aria-label="Высота холста"
              />
              <span className="text-[10px] text-gray-500">px</span>
            </div>
            <button
              type="button"
              className="text-xs px-2 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 transition"
              onClick={(e) => { e.stopPropagation(); dispatch(toggleCanvasSizeLock()); }}
              aria-label={isCanvasSizeLocked ? 'Разблокировать размер холста' : 'Зафиксировать размер холста'}
            >
              {isCanvasSizeLocked ? '🔒 Разблокировать размер' : '🔓 Зафиксировать размер'}
            </button>
          </div>
        </div>
        {/* Smartphone frame */}
        <div
          className="relative mx-auto"
          style={{
            width: (canvasSize.width * zoom) + 40,
            height: (canvasSize.height * zoom) + 80,
            transform: `translate(${panOffset?.x || 0}px, ${panOffset?.y || 0}px)`,
          }}
        >
          {/* Device body (black bezel is the outer layer, we attach grips to it) */}
          <div className="absolute inset-0 rounded-[36px] bg-neutral-900 shadow-xl" />
          <div className="absolute inset-[10px] rounded-[28px] bg-neutral-800" />
          {/* Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 h-6 w-40 rounded-full bg-black/80" />

          {/* Persistent corner arrow handle (outside body, barely touching) */}
          <button
            type="button"
            className={`absolute -right-3 -bottom-3 h-6 w-6 rounded-full flex items-center justify-center shadow-md z-50 ${
              isCanvasSizeLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white cursor-se-resize hover:scale-[1.03]'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потянуть из угла для изменения размера'}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потянуть из угла для изменения размера'}
          >
            ↘
          </button>

          {/* Canvas screen (slightly thicker bottom bezel like DevTools) */}
          <div 
            ref={canvasRef}
            className={`absolute left-[20px] right-[20px] top-[20px] bottom-[28px] rounded-[24px] overflow-hidden bg-white ${showGrid ? 'canvas-grid' : ''}`}
            style={{ 
              width: canvasSize.width * zoom,
              height: canvasSize.height * zoom,
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

          {/* (size/lock moved above smartphone) */}
          {/* Resize by dragging the smartphone bezel edges */}
          {/* Bezel resize zones (exactly on the black outer frame) */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-[10px] z-30 select-none ${isCanvasSizeLocked ? 'cursor-not-allowed' : 'cursor-e-resize'}`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'e')}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потяните за правый край (рамка)'}
          />
          <div
            className={`absolute left-0 right-0 bottom-0 h-[10px] z-30 select-none ${isCanvasSizeLocked ? 'cursor-not-allowed' : 'cursor-s-resize'}`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 's')}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потяните за нижний край (рамка)'}
          />
          {/* Corner visual handle like DevTools */}
          {/* DevTools-like visible corner handle (outside black bezel) */}
          <button
            type="button"
            className={`absolute -right-5 -bottom-5 h-5 w-5 bg-transparent shadow-none flex items-center justify-center ${
              isCanvasSizeLocked ? 'cursor-not-allowed opacity-60' : 'cursor-se-resize'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за угол'}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за угол'}
          >
            <span className="relative block h-4 w-4">
              <span className={`absolute right-0 bottom-0 h-0.5 w-3 rotate-45 ${isCanvasSizeLocked ? 'bg-gray-300' : 'bg-red-500'}`} />
              <span className={`absolute right-0 bottom-1 h-0.5 w-2.5 rotate-45 ${isCanvasSizeLocked ? 'bg-gray-300' : 'bg-red-500'}`} />
              <span className={`absolute right-0 bottom-2 h-0.5 w-2 rotate-45 ${isCanvasSizeLocked ? 'bg-gray-300' : 'bg-red-500'}`} />
            </span>
          </button>

          {/* Visible DevTools-like grab handles outside the frame */}
          <button
            type="button"
            className={`absolute -right-4 top-1/2 -translate-y-1/2 h-4 w-4 rounded-sm border border-white shadow bg-primary/90 text-white z-40 ${
              isCanvasSizeLocked ? 'cursor-not-allowed opacity-50' : 'cursor-e-resize hover:ring-2 hover:ring-primary'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'e')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за правый край'}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за правый край'}
          />
          <button
            type="button"
            className={`absolute left-1/2 -translate-x-1/2 -bottom-4 h-4 w-4 rounded-sm border border-white shadow bg-primary/90 text-white z-40 ${
              isCanvasSizeLocked ? 'cursor-not-allowed opacity-50' : 'cursor-s-resize hover:ring-2 hover:ring-primary'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 's')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за нижний край'}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за нижний край'}
          />
          <button
            type="button"
            className={`absolute -right-5 -bottom-5 h-5 w-5 rounded-sm border border-white shadow bg-primary/90 text-white flex items-center justify-center z-40 ${
              isCanvasSizeLocked ? 'cursor-not-allowed opacity-50' : 'cursor-se-resize hover:ring-2 hover:ring-primary'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за угол'}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за угол'}
          >
            ↘
          </button>

          {/* Visible resize hint button at the bottom-right corner */}
          <button
            type="button"
            className={`absolute -right-6 -bottom-6 z-40 h-8 w-8 rounded-full shadow-md flex items-center justify-center transition ${
              isCanvasSizeLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white cursor-se-resize hover:scale-105'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потянуть для изменения размера'}
            title={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потяните, чтобы изменить размер'}
          >
            ↘
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}