import { useRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, addWidget, setPanOffset, setZoom, setCanvasSize, toggleCanvasSizeLock } from '../../features/canvas/canvasSlice';
import { createDefaultWidget } from '../../lib/widgetDefaults';
import { WidgetRenderer } from './WidgetRenderer';
import { Ruler } from './Ruler';
import { Guides } from './Guides';


const HEADER_OFFSET = 160;
const FOOTER_OFFSET = 160;

export function Canvas({ viewportContainerRef }: { viewportContainerRef?: React.RefObject<HTMLDivElement> }) {
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
  const [hoveredZone, setHoveredZone] = useState<'header' | 'main' | 'footer' | null>(null);
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);

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

      // Check if drop is inside a container
      const containers = widgets.filter(w => w.type === 'container' && !w.parentId);
      let targetContainer = null;
      
      for (const container of containers) {
        const containerRect = {
          left: container.position.x,
          top: container.position.y,
          right: container.position.x + container.size.width,
          bottom: container.position.y + container.size.height
        };
        
        if (x >= containerRect.left && x <= containerRect.right && 
            y >= containerRect.top && y <= containerRect.bottom) {
          targetContainer = container;
          break;
        }
      }

      let widget;
      
      if (targetContainer) {
        // If dropped inside a container, create widget with relative position
        const relativePosition = {
          x: position.x - targetContainer.position.x,
          y: position.y - targetContainer.position.y
        };
        widget = createDefaultWidget(widgetType, relativePosition);
        if (widget) {
          widget.parentId = targetContainer.id;
          // Add widget to container's children array
          const containerIndex = widgets.findIndex(w => w.id === targetContainer.id);
          if (containerIndex !== -1) {
            const container = widgets[containerIndex] as any;
            if (container.props && container.props.children) {
              container.props.children.push(widget.id);
            }
          }
        }
      } else {
        // Create widget with global position for root level
        widget = createDefaultWidget(widgetType, position);
        if (widget) {
          // определить зону по направляющим (увеличенные зоны)
          const headerOffset = HEADER_OFFSET; // увеличили зону header
          const footerOffset = FOOTER_OFFSET; // увеличили зону footer
          const barHeight = 4;
          const footerBarTop = canvasSize.height - footerOffset - barHeight;
          const headerBarBottom = headerOffset + barHeight;
          const zone = position.y <= headerBarBottom ? 'header' : (position.y >= footerBarTop ? 'footer' : 'main');
          (widget as any).zone = zone;
        }
      }
      
      if (widget) {
        dispatch(addWidget(widget));
      }
    }
    setIsDraggingWidget(false);
    setHoveredZone(null);
  }, [dispatch, zoom, gridSnap, snapSize, panOffset, widgets]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const yCanvas = (e.clientY - rect.top - (panOffset?.y || 0)) / zoom;
    const headerOffset = HEADER_OFFSET; // увеличенная зона header
    const footerOffset = FOOTER_OFFSET; // увеличенная зона footer
    const barHeight = 4;
    const footerBarTop = canvasSize.height - footerOffset - barHeight;
    const headerBarBottom = headerOffset + barHeight;
    const zone = yCanvas <= headerBarBottom ? 'header' : (yCanvas >= footerBarTop ? 'footer' : 'main');
    setIsDraggingWidget(true);
    setHoveredZone(zone);
  }, [panOffset, zoom, canvasSize.height]);

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

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    // не показываем зону при паннинге/ресайзе
    if (isPanning || isResizingCanvas) return;
  
    const rect = canvasRef.current.getBoundingClientRect();
    // приводим к "логическим" координатам холста (учитываем zoom)
    const yCanvas = (e.clientY - rect.top) / zoom;
  
    const headerOffset = 40; // увеличенная зона header
    const footerOffset = 40; // увеличенная зона footer
    const barHeight = 4;
    const headerBarBottom = headerOffset + barHeight;
    const footerBarTop = canvasSize.height - footerOffset - barHeight;
  
    const zone = yCanvas <= headerBarBottom ? 'header'
                : (yCanvas >= footerBarTop ? 'footer' : 'main');
  
    setHoveredZone(zone);
  }, [zoom, canvasSize.height, isPanning, isResizingCanvas]);
  
  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredZone(null);
    setIsDraggingWidget(false);
  }, []);

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
    console.log('Canvas resize mouse down:', direction, 'locked:', isCanvasSizeLocked);
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

  // Helper: clamp a widget within current canvas size
  const clampToCanvas = useCallback((x: number, y: number, width: number, height: number) => {
    const maxX = Math.max(0, canvasSize.width - width);
    const maxY = Math.max(0, canvasSize.height - height);
    const clampedX = Math.min(Math.max(0, x), maxX);
    const clampedY = Math.min(Math.max(0, y), maxY);
    return { x: clampedX, y: clampedY };
  }, [canvasSize.width, canvasSize.height]);

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
              className={`text-xs px-2 py-1 rounded transition ${
                isCanvasSizeLocked && widgets.some(w => w.type === 'container')
                  ? 'bg-orange-600 text-white cursor-not-allowed opacity-75'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!(isCanvasSizeLocked && widgets.some(w => w.type === 'container'))) {
                  dispatch(toggleCanvasSizeLock()); 
                }
              }}
              disabled={isCanvasSizeLocked && widgets.some(w => w.type === 'container')}
              aria-label={isCanvasSizeLocked ? 'Разблокировать размер холста' : 'Зафиксировать размер холста'}
            >
              {isCanvasSizeLocked ? (
                widgets.some(w => w.type === 'container') 
                  ? '🔒 Заблокировано (контейнер)' 
                  : '🔒 Разблокировать размер'
              ) : '🔓 Зафиксировать размер'}
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
            title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Потянуть из угла для изменения размера'}
          >
          {/* Layout zones */}
          {/* Зоны как на макете: тонкие направляющие и подписи справа */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {(() => {
              const headerOffsetPx = 40 * zoom; // увеличенная зона header
              const footerOffsetPx = 40 * zoom; // увеличенная зона footer
              const barHeightPx = Math.max(4, 4 * zoom);
              const sideInsetPx = Math.max(10, 12 * zoom);
              const rightShortenPx = Math.max(24, 28 * zoom);
              const headerBarTopPx = headerOffsetPx;
              const footerBarTopPx = (canvasSize.height * zoom) - footerOffsetPx - barHeightPx;
              return (
                <>
                  {/* Header bar */}
                  <div className="absolute" style={{ top: headerBarTopPx, height: barHeightPx, left: sideInsetPx, right: rightShortenPx }}>
                    <div className="w-full h-full rounded-full transition-colors duration-200" style={{ background: hoveredZone === 'header' ? '#f59e0b' : '#fde047' }} />
                  </div>
                  {/* Footer bar */}
                  <div className="absolute" style={{ top: footerBarTopPx, height: barHeightPx, left: sideInsetPx, right: rightShortenPx }}>
                    <div className="w-full h-full rounded-full transition-colors duration-200" style={{ background: hoveredZone === 'footer' ? '#ef4444' : '#f87171' }} />
                  </div>
                </>
              );
            })()}
          </div>
          {/* Labels moved outside the screen, aligned to device outer right edge */}
          {/* This block will be reinserted below, at the device container level */}
            ↘
          </button>

          {/* Labels outside: aligned to outer bezel right edge */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden={false}>
            <div className="absolute pointer-events-auto transition-all duration-200" style={{ top: (40 * zoom) - 10, right: -56 }} onMouseEnter={() => setHoveredZone('header')} onMouseLeave={() => setHoveredZone(null)}>
              <div className={`inline-flex items-center h-6 px-2 rounded bg-white shadow border text-[11px] transition-all duration-200 ${hoveredZone === 'header' ? 'border-amber-500 text-amber-600 bg-amber-50 scale-105' : 'text-gray-600'}`}>Header</div>
            </div>
            <div className="absolute pointer-events-auto" style={{ top: (canvasSize.height * zoom) / 2 - 10, right: -56 }} onMouseEnter={() => setHoveredZone('main')} onMouseLeave={() => setHoveredZone(null)}>
              <div className={`inline-flex items-center h-6 px-2 rounded bg-white shadow border text-[11px] transition-all duration-200 ${hoveredZone === 'main' ? 'border-blue-500 text-blue-600 bg-blue-50 scale-105' : 'text-gray-600'}`}>Main</div>
            </div>
            <div className="absolute pointer-events-auto transition-all duration-200" style={{ bottom: (40 * zoom) - 10, right: -56 }} onMouseEnter={() => setHoveredZone('footer')} onMouseLeave={() => setHoveredZone(null)}>
              <div className={`inline-flex items-center h-6 px-2 rounded bg-white shadow border text-[11px] transition-all duration-200 ${hoveredZone === 'footer' ? 'border-red-500 text-red-600 bg-red-50 scale-105' : 'text-gray-600'}`}>Footer</div>
            </div>
          </div>

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
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
          >
          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-7 px-4 flex items-center justify-between text-[11px] text-black/90 select-none pointer-events-none">
            <div className="font-semibold tracking-wide">9:41</div>
            <div className="flex items-center gap-2">
              {/* Cellular bars */}
              <div className="flex items-end gap-[2px]" aria-hidden>
                <span className="block w-[2px] h-[6px] bg-black/80 rounded-sm" />
                <span className="block w-[2px] h-[8px] bg-black/80 rounded-sm" />
                <span className="block w-[2px] h-[10px] bg-black/80 rounded-sm" />
                <span className="block w-[2px] h-[12px] bg-black/80 rounded-sm" />
              </div>
              {/* Wi‑Fi */}
              <div className="relative w-[16px] h-[12px]" aria-hidden>
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-black/80 rounded-sm" />
                <span className="absolute left-1 right-1 bottom-[3px] h-[2px] bg-black/70 rounded-sm" />
                <span className="absolute left-2 right-2 bottom-[6px] h-[2px] bg-black/50 rounded-sm" />
              </div>
              {/* Battery */}
              <div className="flex items-center gap-[2px]" aria-hidden>
                <div className="relative w-[22px] h-[12px] rounded-[3px] border border-black/80">
                  <div className="absolute inset-[2px] bg-black/80 rounded-[2px]" />
                </div>
                <div className="w-[2px] h-[6px] bg-black/80 rounded-sm" />
              </div>
            </div>
          </div>
          {/* Zone overlays for drag feedback */}
          {isDraggingWidget && (
            <>
              {/* Header zone overlay */}
              <div 
                className={`absolute left-0 right-0 top-0 transition-all duration-200 pointer-events-none ${
                  hoveredZone === 'header' 
                    ? 'bg-amber-200/40 border-2 border-amber-400 border-dashed' 
                    : 'bg-amber-100/20 border border-amber-300 border-dashed'
                }`}
                style={{ height: 40 * zoom }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-medium transition-all duration-200 ${
                    hoveredZone === 'header' ? 'text-amber-700 scale-110' : 'text-amber-600'
                  }`}>Header Zone</span>
                </div>
              </div>
              
              {/* Footer zone overlay */}
              <div 
                className={`absolute left-0 right-0 bottom-0 transition-all duration-200 pointer-events-none ${
                  hoveredZone === 'footer' 
                    ? 'bg-red-200/40 border-2 border-red-400 border-dashed' 
                    : 'bg-red-100/20 border border-red-300 border-dashed'
                }`}
                style={{ height: 40 * zoom }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-medium transition-all duration-200 ${
                    hoveredZone === 'footer' ? 'text-red-700 scale-110' : 'text-red-600'
                  }`}>Footer Zone</span>
                </div>
              </div>
            </>
          )}
          
          {widgets
            .filter(widget => !widget.parentId) // Only render root-level widgets
            .map((widget) => (
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


          {/* Canvas resize handles overlay */}
          <div className="absolute inset-0 pointer-events-none z-[9999]">
            <div
              className={`absolute right-0 top-0 bottom-0 w-[12px] ${isCanvasSizeLocked ? 'cursor-not-allowed' : 'cursor-e-resize'}`}
              data-canvas-resize="e"
              onMouseDown={(e) => onCanvasResizeMouseDown(e, 'e')}
              title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Потяните за правый край (рамка)'}
              style={{ pointerEvents: 'auto' }}
            />
            <div
              className={`absolute left-0 right-0 bottom-0 h-[12px] ${isCanvasSizeLocked ? 'cursor-not-allowed' : 'cursor-s-resize'}`}
              data-canvas-resize="s"
              onMouseDown={(e) => onCanvasResizeMouseDown(e, 's')}
              title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Потяните за нижний край (рамка)'}
              style={{ pointerEvents: 'auto' }}
            />
            <button
              type="button"
              className={`absolute -right-5 -bottom-5 h-5 w-5 bg-transparent shadow-none flex items-center justify-center ${
                isCanvasSizeLocked ? 'cursor-not-allowed opacity-60' : 'cursor-se-resize'
              }`}
              data-canvas-resize="se"
              onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
              onClick={(e) => e.preventDefault()}
              aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за угол'}
              title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Тянуть за угол'}
              style={{ pointerEvents: 'auto' }}
            >
              <span className="relative block h-4 w-4">
                <span className={`absolute right-0 bottom-0 h-0.5 w-3 rotate-45 ${isCanvasSizeLocked ? 'bg-gray-300' : 'bg-red-500'}`} />
                <span className={`absolute right-0 bottom-1 h-0.5 w-2.5 rotate-45 ${isCanvasSizeLocked ? 'bg-gray-300' : 'bg-red-500'}`} />
                <span className={`absolute right-0 bottom-2 h-0.5 w-2 rotate-45 ${isCanvasSizeLocked ? 'bg-gray-300' : 'bg-red-500'}`} />
              </span>
            </button>

            <button
              type="button"
              className={`absolute -right-4 top-1/2 -translate-y-1/2 h-4 w-4 rounded-sm border border-white shadow bg-primary/90 text-white ${
                isCanvasSizeLocked ? 'cursor-not-allowed opacity-50' : 'cursor-e-resize hover:ring-2 hover:ring-primary'
              }`}
              data-canvas-resize="e"
              onMouseDown={(e) => onCanvasResizeMouseDown(e, 'e')}
              onClick={(e) => e.preventDefault()}
              aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за правый край'}
              title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Тянуть за правый край'}
              style={{ pointerEvents: 'auto' }}
            />
            <button
              type="button"
              className={`absolute left-1/2 -translate-x-1/2 -bottom-4 h-4 w-4 rounded-sm border border-white shadow bg-primary/90 text-white ${
                isCanvasSizeLocked ? 'cursor-not-allowed opacity-50' : 'cursor-s-resize hover:ring-2 hover:ring-primary'
              }`}
              data-canvas-resize="s"
              onMouseDown={(e) => onCanvasResizeMouseDown(e, 's')}
              onClick={(e) => e.preventDefault()}
              aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за нижний край'}
              title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Тянуть за нижний край'}
              style={{ pointerEvents: 'auto' }}
            />
            <button
              type="button"
              className={`absolute -right-5 -bottom-5 h-5 w-5 rounded-sm border border-white shadow bg-primary/90 text-white flex items-center justify-center ${
                isCanvasSizeLocked ? 'cursor-not-allowed opacity-50' : 'cursor-se-resize hover:ring-2 hover:ring-primary'
              }`}
              data-canvas-resize="se"
              onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
              onClick={(e) => e.preventDefault()}
              aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Тянуть за угол'}
              title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Тянуть за угол'}
              style={{ pointerEvents: 'auto' }}
            >
              ↘
            </button>
          </div>

          {/* Visible resize hint button at the bottom-right corner */}
          <button
            type="button"
            className={`absolute -right-6 -bottom-6 z-40 h-8 w-8 rounded-full shadow-md flex items-center justify-center transition ${
              isCanvasSizeLocked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white cursor-se-resize hover:scale-105'
            }`}
            onMouseDown={(e) => onCanvasResizeMouseDown(e, 'se')}
            onClick={(e) => e.preventDefault()}
            aria-label={isCanvasSizeLocked ? 'Размер зафиксирован' : 'Потянуть для изменения размера'}
            title={isCanvasSizeLocked ? (widgets.some(w => w.type === 'container') ? 'Размер заблокирован из-за контейнера' : 'Размер зафиксирован') : 'Потяните, чтобы изменить размер'}
          >
            ↘
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}