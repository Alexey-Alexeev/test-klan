import { forwardRef } from 'react';
import { WidgetBuilderRenderer } from './WidgetBuilderRenderer';

interface WidgetBuilderCanvasScreenProps {
  canvasSize: { width: number; height: number };
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
  widgets: any[];
  selectedWidgetId: string | null;
  hoveredZone: 'header' | 'main' | 'footer' | null;
  isDraggingWidget: boolean;
  onCanvasClick: (e: React.MouseEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
}

export const WidgetBuilderCanvasScreen = forwardRef<HTMLDivElement, WidgetBuilderCanvasScreenProps>(({
  canvasSize,
  zoom,
  panOffset,
  showGrid,
  gridSize,
  widgets,
  selectedWidgetId,
  hoveredZone,
  isDraggingWidget,
  onCanvasClick,
  onDrop,
  onDragOver,
  onMouseDown,
  onWheel,
  onMouseMove,
  onMouseLeave
}, ref) => {
  return (
    <div 
      ref={ref}
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
      onClick={onCanvasClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
          <WidgetBuilderRenderer
            key={widget.id}
            widget={widget}
            isSelected={selectedWidgetId === widget.id}
            isEditable={true}
          />
        ))}
      
      {/* Drop zone indicator */}
      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-transparent transition-colors duration-200 ease-in-out" />
    </div>
  );
});

WidgetBuilderCanvasScreen.displayName = 'WidgetBuilderCanvasScreen';
