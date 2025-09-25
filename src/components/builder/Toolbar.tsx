import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Grid, 
  ZoomIn, 
  ZoomOut, 
  Settings,
  Eye,
  Code,
  Download,
  Upload,
  Trash2,
  Save,
  Ruler,
  RotateCcw,
  Maximize2,
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
} from '../../features/canvas/canvasSlice';
import { undo, redo } from '../../features/history/historySlice';
import { setViewMode, togglePropertiesPanel, zoomIn, zoomOut, resetZoom } from '../../features/app/appSlice';
import { addTemplate } from '../../features/templates/templatesSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';

export function Toolbar() {
  const dispatch = useAppDispatch();
  const { gridSnap, widgets, showRulers, showGrid } = useAppSelector(state => state.canvas);
  const { viewMode, zoomLevel } = useAppSelector(state => state.app);
  const { past, future } = useAppSelector(state => state.history);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

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

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    
    const template = {
      id: `template_${Date.now()}`,
      name: templateName,
      description: templateDescription,
      widgets: widgets,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(addTemplate(template));
    setSaveDialogOpen(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  const handleToggleSettings = () => {
    dispatch(togglePropertiesPanel());
  };

  const handleExport = () => {
    const projectData = {
      widgets,
      canvasSize,
      metadata: {
        name: 'Мой проект',
        createdAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const projectData = JSON.parse(e.target?.result as string);
            if (projectData.widgets && Array.isArray(projectData.widgets)) {
              dispatch(loadWidgets(projectData.widgets));
              if (projectData.canvasSize) {
                dispatch(setCanvasSize(projectData.canvasSize));
              }
              alert('Проект успешно загружен!');
            } else {
              alert('Неверный формат файла проекта');
            }
          } catch (error) {
            alert('Ошибка при загрузке проекта');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            dispatch(resetZoom());
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case 's':
            e.preventDefault();
            handleSaveTemplate();
            break;
          case 'e':
            e.preventDefault();
            handleExport();
            break;
          case 'o':
            e.preventDefault();
            handleImport();
            break;
          case 'z':
            e.preventDefault();
            dispatch(undo());
            break;
          case 'y':
            e.preventDefault();
            dispatch(redo());
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel]);

  return (
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

      {/* Canvas actions */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить макет</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название макета</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Введите название макета"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание (необязательно)</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Краткое описание макета"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" className="h-8" onClick={handleImport}>
        <Upload className="h-4 w-4 mr-2" />
        Импорт
      </Button>

      <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Экспорт
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClearCanvas}
        className="h-8 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
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
  );
}