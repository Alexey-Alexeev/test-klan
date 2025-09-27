import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  Settings,
  Eye,
  Code,
  Save,
  Ruler,
  RotateCcw,
  Undo,
  Redo
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  toggleGridSnap, 
  clearCanvas, 
  toggleRulers, 
  toggleGrid, 
  resetView 
} from '../../features/widgetBuilder/widgetBuilderSlice';
import { undo, redo } from '../../features/history/historySlice';
import { setViewMode, togglePropertiesPanel, zoomIn, zoomOut, resetZoom } from '../../features/app/appSlice';
import { saveUserWidget } from '../../features/userWidgets/userWidgetsSlice';
import { SaveWidgetDialog } from '../ui/save-widget-dialog';

interface WidgetBuilderToolbarProps {
  onSaveWidget?: (name: string, description: string) => void;
}

export function WidgetBuilderToolbar({ onSaveWidget }: WidgetBuilderToolbarProps = {}) {
  const dispatch = useAppDispatch();
  const { gridSnap, widgets, showRulers, showGrid, canvasSize, selectedPreset } = useAppSelector(state => state.widgetBuilder);
  const { viewMode, zoomLevel } = useAppSelector(state => state.app);
  const { past, future } = useAppSelector(state => state.history);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleZoomIn = () => {
    dispatch(zoomIn());
  };

  const handleZoomOut = () => {
    dispatch(zoomOut());
  };

  const handleToggleGrid = () => {
    dispatch(toggleGridSnap());
  };

  const handleViewModeToggle = () => {
    dispatch(setViewMode(viewMode === 'design' ? 'json' : 'design'));
  };

  const handleClearCanvas = () => {
    if (confirm('Очистить холст? Все элементы будут удалены.')) {
      dispatch(clearCanvas());
    }
  };

  const handleSaveWidget = (name: string, description: string) => {
    if (onSaveWidget) {
      onSaveWidget(name, description);
    } else {
      dispatch(saveUserWidget({
        name,
        description,
        widgets,
        canvasSize,
        selectedPreset,
      }));
    }
  };

  const handleToggleSettings = () => {
    dispatch(togglePropertiesPanel());
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-white border-b border-border shadow-sm">
        {/* View mode toggle */}
        <div className="flex rounded-lg bg-muted p-1">
          <Button
            variant={viewMode === 'design' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch(setViewMode('design'))}
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4 mr-2" />
            Дизайн
          </Button>
          <Button
            variant={viewMode === 'json' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => dispatch(setViewMode('json'))}
            className="h-8 px-3"
          >
            <Code className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* History controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(undo())}
          disabled={past.length === 0}
          className="h-8"
          title="Отменить (Ctrl+Z)"
        >
          <Undo className="h-4 w-4 mr-2" />
          Отменить
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(redo())}
          disabled={future.length === 0}
          className="h-8"
          title="Повторить (Ctrl+Y)"
        >
          <Redo className="h-4 w-4 mr-2" />
          Повторить
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Canvas controls */}
        <Button
          variant={gridSnap ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleGrid}
          className="h-8"
        >
          <Grid className="h-4 w-4 mr-2" />
          Привязка
        </Button>

        <Button
          variant={showGrid ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch(toggleGrid())}
          className="h-8"
        >
          <Grid className="h-4 w-4 mr-2" />
          Сетка
        </Button>

        <Button
          variant={showRulers ? 'default' : 'outline'}
          size="sm"
          onClick={() => dispatch(toggleRulers())}
          className="h-8"
        >
          <Ruler className="h-4 w-4 mr-2" />
          Линейки
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 25}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium min-w-[50px] text-center">
            {zoomLevel}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 300}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(resetZoom())}
          className="h-8"
          title="Сбросить зум (Ctrl+0)"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Сброс
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Save widget */}
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => setSaveDialogOpen(true)}
          className="h-8"
          disabled={widgets.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Сохранить виджет
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearCanvas}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Grid className="h-4 w-4 mr-2" />
          Очистить
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={handleToggleSettings}
          >
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
        </div>
      </div>

      <SaveWidgetDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveWidget}
      />
    </>
  );
}
