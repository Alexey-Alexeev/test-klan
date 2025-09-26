import { useAppSelector } from '../../store/hooks';

interface ResizeHandlesProps {
  isCanvasSizeLocked: boolean;
  selectedPreset: string;
  widgets: any[];
  onCanvasResizeMouseDown: (e: React.MouseEvent, direction: 'e' | 's' | 'se') => void;
}

export function ResizeHandles({ 
  isCanvasSizeLocked, 
  selectedPreset, 
  widgets, 
  onCanvasResizeMouseDown 
}: ResizeHandlesProps) {
  const getLockMessage = () => {
    if (widgets.some(w => w.type === 'container')) {
      return 'Размер заблокирован из-за контейнера';
    }
    if (selectedPreset !== 'custom') {
      return 'Размер заблокирован из-за выбранного устройства';
    }
    return 'Размер зафиксирован';
  };

  return (
    <>
      {/* Canvas resize handles overlay */}
      <div className="absolute inset-0 pointer-events-none z-[9999]">
        <div
          className={`absolute right-0 top-0 bottom-0 w-[12px] ${isCanvasSizeLocked ? 'cursor-not-allowed' : 'cursor-e-resize'}`}
          data-canvas-resize="e"
          onMouseDown={(e) => onCanvasResizeMouseDown(e, 'e')}
          title={isCanvasSizeLocked ? getLockMessage() : 'Потяните за правый край (рамка)'}
          style={{ pointerEvents: 'auto' }}
        />
        <div
          className={`absolute left-0 right-0 bottom-0 h-[12px] ${isCanvasSizeLocked ? 'cursor-not-allowed' : 'cursor-s-resize'}`}
          data-canvas-resize="s"
          onMouseDown={(e) => onCanvasResizeMouseDown(e, 's')}
          title={isCanvasSizeLocked ? getLockMessage() : 'Потяните за нижний край (рамка)'}
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
          title={isCanvasSizeLocked ? getLockMessage() : 'Тянуть за угол'}
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
          title={isCanvasSizeLocked ? getLockMessage() : 'Тянуть за правый край'}
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
          title={isCanvasSizeLocked ? getLockMessage() : 'Тянуть за нижний край'}
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
          title={isCanvasSizeLocked ? getLockMessage() : 'Тянуть за угол'}
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
        title={isCanvasSizeLocked ? getLockMessage() : 'Потяните, чтобы изменить размер'}
      >
        ↘
      </button>
    </>
  );
}
