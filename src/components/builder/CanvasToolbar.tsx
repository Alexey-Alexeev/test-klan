import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { CanvasSizePresetSelector, CANVAS_SIZE_PRESETS } from '@/components/ui/canvas-size-presets';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCanvasSize, toggleCanvasSizeLock, setSelectedPreset } from '../../features/canvas/canvasSlice';

interface CanvasToolbarProps {
  sizeDraft: { width: string; height: string };
  onSizeDraftChange: (draft: { width: string; height: string }) => void;
  onCommitSize: () => void;
}

export function CanvasToolbar({ sizeDraft, onSizeDraftChange, onCommitSize }: CanvasToolbarProps) {
  const dispatch = useAppDispatch();
  const { 
    isCanvasSizeLocked, 
    selectedPreset, 
    widgets 
  } = useAppSelector(state => state.canvas);

  const handlePresetChange = useCallback((presetId: string) => {
    console.log('handlePresetChange called with:', presetId);
    dispatch(setSelectedPreset(presetId));
    
    if (presetId === 'custom') {
      // Unlock canvas size for custom editing (only if not locked by containers)
      if (isCanvasSizeLocked && !widgets.some(w => w.type === 'container')) {
        dispatch(toggleCanvasSizeLock());
      }
      return; // Don't change size, just allow manual input
    }
    
    const preset = CANVAS_SIZE_PRESETS.find(p => p.id === presetId);
    console.log('Found preset:', preset);
    if (preset && preset.width > 0 && preset.height > 0) {
      // Always allow changing to device preset, even if currently locked
      console.log('Dispatching setCanvasSize:', { width: preset.width, height: preset.height });
      dispatch(setCanvasSize({ width: preset.width, height: preset.height }));
      onSizeDraftChange({ width: String(preset.width), height: String(preset.height) });
      
      // Auto-lock canvas size for device presets (iPhone, Samsung)
      // Only lock if not already locked by containers
      if (!isCanvasSizeLocked || !widgets.some(w => w.type === 'container')) {
        if (!isCanvasSizeLocked) {
          dispatch(toggleCanvasSizeLock());
        }
      }
    }
  }, [dispatch, isCanvasSizeLocked, widgets, onSizeDraftChange]);

  const handleLockToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); 
    // Only block if locked AND has containers (permanent lock)
    // Allow toggle if locked but no containers (manual lock)
    if (!(isCanvasSizeLocked && widgets.some(w => w.type === 'container'))) {
      dispatch(toggleCanvasSizeLock()); 
    }
  }, [dispatch, isCanvasSizeLocked, widgets]);

  return (
    <div className="sticky top-0 z-30 w-full flex items-center justify-center py-2">
      <div className="inline-flex items-center gap-3 rounded-md bg-white/80 backdrop-blur px-3 py-1 shadow border border-gray-200">
        <div className="flex items-center gap-2">
          <CanvasSizePresetSelector
            value={selectedPreset}
            onValueChange={handlePresetChange}
            disabled={false}
          />
          <span className="text-xs text-gray-400">|</span>
          <Input
            className="h-7 w-20 text-xs"
            type="number"
            value={sizeDraft.width}
            disabled={isCanvasSizeLocked}
            onChange={(e) => onSizeDraftChange({ ...sizeDraft, width: e.target.value })}
            onBlur={onCommitSize}
            onKeyDown={(e) => { if (e.key === 'Enter') { onCommitSize(); } }}
            aria-label="Ширина холста"
          />
          <span className="text-xs text-gray-700">×</span>
          <Input
            className="h-7 w-20 text-xs"
            type="number"
            value={sizeDraft.height}
            disabled={isCanvasSizeLocked}
            onChange={(e) => onSizeDraftChange({ ...sizeDraft, height: e.target.value })}
            onBlur={onCommitSize}
            onKeyDown={(e) => { if (e.key === 'Enter') { onCommitSize(); } }}
            aria-label="Высота холста"
          />
          <span className="text-[10px] text-gray-500">px</span>
        </div>
        <button
          type="button"
          className={`text-xs px-2 py-1 rounded transition ${
            isCanvasSizeLocked && widgets.some(w => w.type === 'container')
              ? 'bg-orange-600 text-white cursor-not-allowed opacity-75'
              : isCanvasSizeLocked
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
          onClick={handleLockToggle}
          disabled={isCanvasSizeLocked && widgets.some(w => w.type === 'container')}
          aria-label={isCanvasSizeLocked ? 'Разблокировать размер холста' : 'Зафиксировать размер холста'}
        >
          {isCanvasSizeLocked ? (
            widgets.some(w => w.type === 'container') 
              ? '🔒 Заблокировано (контейнер)' 
              : selectedPreset !== 'custom'
                ? '🔒 Заблокировано (устройство)'
                : '🔒 Разблокировать размер'
          ) : '🔓 Зафиксировать размер'}
        </button>
      </div>
    </div>
  );
}
