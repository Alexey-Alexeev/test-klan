import { useRef, useCallback, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, addWidget, updateWidget, setPanOffset, setCanvasSize, toggleCanvasSizeLock, setSelectedPreset } from '../../features/widgetBuilder/widgetBuilderSlice';
import { useAppSelector as useAppSelectorApp } from '../../store/hooks';
import { zoomIn, zoomOut } from '../../features/app/appSlice';
import { createDefaultWidget } from '../../lib/widgetDefaults';
import { Ruler } from './Ruler';
import { Guides } from './Guides';
import { WidgetBuilderCanvasToolbar } from './WidgetBuilderCanvasToolbar';
import { DeviceFrame } from './DeviceFrame';
import { WidgetBuilderCanvasScreen } from './WidgetBuilderCanvasScreen';
import { ResizeHandles } from './ResizeHandles';
import { CANVAS_SIZE_PRESETS } from '@/components/ui/canvas-size-presets';

const HEADER_OFFSET = 160;
const FOOTER_OFFSET = 160;

export function BuilderCanvas({ viewportContainerRef }: { viewportContainerRef?: React.RefObject<HTMLDivElement> }) {
  const dispatch = useAppDispatch();
  const { 
    widgets, 
    selectedWidgetId, 
    canvasSize, 
    gridSnap, 
    snapSize,
    panOffset, 
    showRulers, 
    gridSize, 
    showGrid,
    isCanvasSizeLocked,
    selectedPreset,
  } = useAppSelector(state => state.widgetBuilder);
  
  const { zoomLevel } = useAppSelectorApp(state => state.app);
  const zoom = zoomLevel / 100; // Convert percentage to decimal
  
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
    
    // Auto-detect preset based on current canvas size
    const matchingPreset = CANVAS_SIZE_PRESETS.find(preset => 
      preset.width > 0 && preset.height > 0 &&
      Math.abs(preset.width - canvasSize.width) <= 2 &&
      Math.abs(preset.height - canvasSize.height) <= 2
    );
    
    if (matchingPreset) {
      dispatch(setSelectedPreset(matchingPreset.id));
      // Don't auto-lock on initial load - only when user manually selects a device
      // This allows the canvas to start unlocked even if it matches a device size
    } else {
      dispatch(setSelectedPreset('custom'));
    }
  }, [canvasSize.width, canvasSize.height, isCanvasSizeLocked, widgets, dispatch]);

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
    // Switch to custom when manually editing
    dispatch(setSelectedPreset('custom'));
  }, [dispatch, sizeDraft, isCanvasSizeLocked, canvasSize.width, canvasSize.height, gridSnap, snapSize]);

  const handleSizeDraftChange = useCallback((draft: { width: string; height: string }) => {
    setSizeDraft(draft);
  }, []);

  const handleCommitSize = useCallback(() => {
    commitSizeFromDraft();
  }, [commitSizeFromDraft]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(selectWidget(null));
    }
  }, [dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('widget-type');
    const widgetId = e.dataTransfer.getData('widget-id');
    
    if (widgetType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - (panOffset?.x || 0)) / zoom;
      const y = (e.clientY - rect.top - (panOffset?.y || 0)) / zoom;
      
      // Snap to grid if enabled
      const position = gridSnap 
        ? { x: Math.round(x / snapSize) * snapSize, y: Math.round(y / snapSize) * snapSize }
        : { x, y };

      // Check if drop is inside a container (supports nested containers)
      const containers = widgets.filter(w => w.type === 'container');
      let targetContainer = null as (typeof widgets)[number] | null;
      const getAbsoluteRect = (cont: typeof widgets[number]) => {
        let absX = cont.position.x;
        let absY = cont.position.y;
        let cursor: typeof widgets[number] | undefined = cont;
        while (cursor && cursor.parentId) {
          const parent = widgets.find(w => w.id === cursor!.parentId);
          if (!parent) break;
          absX += parent.position.x;
          absY += parent.position.y;
          cursor = parent;
        }
        return { left: absX, top: absY, right: absX + cont.size.width, bottom: absY + cont.size.height };
      };
      const sortedContainers = [...containers].sort((a, b) => b.zIndex - a.zIndex);
      for (const container of sortedContainers) {
        const rectAbs = getAbsoluteRect(container);
        if (x >= rectAbs.left && x <= rectAbs.right && y >= rectAbs.top && y <= rectAbs.bottom) {
          targetContainer = container;
          break;
        }
      }

      let widget;
      
      if (targetContainer) {
        // Create with position relative to absolute container origin
        const abs = getAbsoluteRect(targetContainer);
        const relativePosition = { x: position.x - abs.left, y: position.y - abs.top };
        widget = createDefaultWidget(widgetType, relativePosition);
        if (widget) {
          widget.parentId = targetContainer.id;
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
        if (targetContainer && widget.parentId === targetContainer.id) {
          const container = widgets.find(w => w.id === targetContainer.id);
          if (container) {
            const containerWidget = container as any;
            const children: string[] = containerWidget.props?.children || [];
            const updatedChildren = [...children, widget.id];
            dispatch(updateWidget({ id: targetContainer.id, updates: { props: { ...containerWidget.props, children: updatedChildren } } }));
          }
        }
      }
    } else if (widgetId && canvasRef.current) {
      // Handle moving existing widget to a container
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - (panOffset?.x || 0)) / zoom;
      const y = (e.clientY - rect.top - (panOffset?.y || 0)) / zoom;
      
      // Check if drop is inside a container (supports nested containers)
      const containers = widgets.filter(w => w.type === 'container');
      let targetContainer = null as (typeof widgets)[number] | null;
      const getAbsRectMove = (cont: typeof widgets[number]) => {
        let absX = cont.position.x;
        let absY = cont.position.y;
        let cursor: typeof widgets[number] | undefined = cont;
        while (cursor && cursor.parentId) {
          const parent = widgets.find(w => w.id === cursor!.parentId);
          if (!parent) break;
          absX += parent.position.x;
          absY += parent.position.y;
          cursor = parent;
        }
        return { left: absX, top: absY, right: absX + cont.size.width, bottom: absY + cont.size.height };
      };
      const sortedContainers = [...containers].sort((a, b) => b.zIndex - a.zIndex);
      for (const container of sortedContainers) {
        const rectAbs = getAbsRectMove(container);
        if (x >= rectAbs.left && x <= rectAbs.right && y >= rectAbs.top && y <= rectAbs.bottom) {
          targetContainer = container;
          break;
        }
      }

      if (targetContainer) {
        // Move widget to container: remove from old parent, update parentId, add to new children
        const moved = widgets.find(w => w.id === widgetId);
        if (moved && moved.id !== targetContainer.id) {
          if (moved.parentId) {
            const oldParent = widgets.find(w => w.id === moved.parentId);
            if (oldParent) {
              const oldProps: any = (oldParent as any).props || {};
              const oldChildren: string[] = oldProps.children || [];
              const pruned = oldChildren.filter(id => id !== widgetId);
              dispatch(updateWidget({ id: oldParent.id, updates: { props: { ...oldProps, children: pruned } } }));
            }
          }
          dispatch(updateWidget({ id: widgetId, updates: { parentId: targetContainer.id } }));
          const containerWidget = targetContainer as any;
          const currentChildren: string[] = containerWidget.props?.children || [];
          const updatedChildren = [...currentChildren, widgetId];
          dispatch(updateWidget({ id: targetContainer.id, updates: { props: { ...containerWidget.props, children: updatedChildren } } }));
        }
      } else {
        // Move widget to root level: remove from old parent, set parentId to null
        const moved = widgets.find(w => w.id === widgetId);
        if (moved && moved.parentId) {
          const oldParent = widgets.find(w => w.id === moved.parentId);
          if (oldParent) {
            const oldProps: any = (oldParent as any).props || {};
            const oldChildren: string[] = oldProps.children || [];
            const pruned = oldChildren.filter(id => id !== widgetId);
            dispatch(updateWidget({ id: oldParent.id, updates: { props: { ...oldProps, children: pruned } } }));
          }
          dispatch(updateWidget({ id: widgetId, updates: { parentId: null as any } }));
        }
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

  // Wheel zoom - теперь использует App zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10; // Fixed step of 10%
      const newZoomLevel = Math.max(25, Math.min(300, zoomLevel + delta));
      // App zoom управляется через Toolbar, поэтому здесь просто предотвращаем стандартное поведение
    }
  }, [zoomLevel]);

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
    // Switch to custom when manually resizing
    setSelectedPreset('custom');
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
          <Ruler orientation="horizontal" origin={rulerOrigin} />
          <Ruler orientation="vertical" origin={rulerOrigin} />
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
        <WidgetBuilderCanvasToolbar
          sizeDraft={sizeDraft}
          onSizeDraftChange={handleSizeDraftChange}
          onCommitSize={handleCommitSize}
        />
        {/* Smartphone frame */}
        <DeviceFrame
          canvasSize={canvasSize}
          zoom={zoom}
          panOffset={panOffset}
          hoveredZone={hoveredZone}
          isDraggingWidget={isDraggingWidget}
          onZoneHover={setHoveredZone}
        >
          <WidgetBuilderCanvasScreen
            ref={canvasRef}
            canvasSize={canvasSize}
            zoom={zoom}
            panOffset={panOffset}
            showGrid={showGrid}
            gridSize={gridSize}
            widgets={widgets}
            selectedWidgetId={selectedWidgetId}
            hoveredZone={hoveredZone}
            isDraggingWidget={isDraggingWidget}
            onCanvasClick={handleCanvasClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
          />
          
          <ResizeHandles
            isCanvasSizeLocked={isCanvasSizeLocked}
            selectedPreset={selectedPreset}
            widgets={widgets}
            onCanvasResizeMouseDown={onCanvasResizeMouseDown}
          />
        </DeviceFrame>
      </div>
    </div>
  );
}
