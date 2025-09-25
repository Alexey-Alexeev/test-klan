import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './alert-dialog';
import { Plus, Search, Edit, Trash2, Download, Upload, Copy, Eye } from 'lucide-react';
import { BDUIWidgetDefinition } from '../../types';

interface WidgetRegistryProps {
  widgets: Record<string, BDUIWidgetDefinition>;
  onCreateWidget: () => void;
  onEditWidget: (widgetId: string) => void;
  onDeleteWidget: (widgetId: string) => void;
  onDuplicateWidget: (widgetId: string) => void;
  onImportWidget: (widget: BDUIWidgetDefinition) => void;
  onExportWidget: (widgetId: string) => void;
  onPreviewWidget: (widgetId: string) => void;
}

export function WidgetRegistry({
  widgets,
  onCreateWidget,
  onEditWidget,
  onDeleteWidget,
  onDuplicateWidget,
  onImportWidget,
  onExportWidget,
  onPreviewWidget,
}: WidgetRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState('');

  const filteredWidgets = Object.values(widgets).filter(widget =>
    widget.meta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.meta.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.meta.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImport = () => {
    try {
      const widget = JSON.parse(importJson) as BDUIWidgetDefinition;
      
      // Basic validation
      if (!widget.widgetId || !widget.meta?.name) {
        throw new Error('Invalid widget definition');
      }
      
      onImportWidget(widget);
      setImportJson('');
      setShowImportDialog(false);
    } catch (error) {
      alert('Invalid widget JSON: ' + (error as Error).message);
    }
  };

  const getVersionColor = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number);
    if (major >= 2) return 'bg-green-100 text-green-800';
    if (major === 1 && minor >= 5) return 'bg-blue-100 text-blue-800';
    if (major === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Реестр Виджетов</h2>
          <div className="flex gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload size={14} className="mr-1" />
                  Импорт
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Импорт Виджета</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>JSON Виджета</Label>
                    <textarea
                      className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                      placeholder="Вставьте JSON виджета сюда..."
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleImport}>
                      Импорт Виджета
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button onClick={onCreateWidget}>
              <Plus size={14} className="mr-1" />
              Создать Виджет
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск виджетов по имени, описанию или тегам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredWidgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {Object.keys(widgets).length === 0 ? (
                <div>
                  <Plus size={48} className="mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Пока нет виджетов</h3>
                  <p className="text-sm">Создайте первый виджет для начала работы</p>
                </div>
              ) : (
                <div>
                  <Search size={48} className="mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Виджеты не найдены</h3>
                  <p className="text-sm">Попробуйте изменить поисковые запросы</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWidgets.map((widget) => (
              <Card key={widget.widgetId} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{widget.meta.name}</CardTitle>
                        <Badge variant="outline" className={getVersionColor(widget.version)}>
                          v{widget.version}
                        </Badge>
                      </div>
                      {widget.meta.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {widget.meta.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>ID: {widget.widgetId}</span>
                        {widget.meta.author && (
                          <>
                            <span>•</span>
                            <span>by {widget.meta.author}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {widget.meta.tags && widget.meta.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {widget.meta.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Widget Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-600">Параметры</div>
                      <div className="text-lg font-semibold">
                        {Object.keys(widget.params || {}).length}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">Локальное Состояние</div>
                      <div className="text-lg font-semibold">
                        {Object.keys(widget.localState || {}).length}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-600">События</div>
                      <div className="text-lg font-semibold">
                        {widget.events?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Public API */}
                  {widget.publicApi && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-md">
                      <div className="text-xs font-medium text-blue-800 mb-1">Публичный API</div>
                      <div className="text-xs text-blue-600">
                        {widget.publicApi.events && widget.publicApi.events.length > 0 && (
                          <div>События: {widget.publicApi.events.join(', ')}</div>
                        )}
                        {widget.publicApi.methods && Object.keys(widget.publicApi.methods).length > 0 && (
                          <div>Методы: {Object.keys(widget.publicApi.methods).join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onPreviewWidget(widget.widgetId)}
                      variant="outline"
                    >
                      <Eye size={12} className="mr-1" />
                      Предпросмотр
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => onEditWidget(widget.widgetId)}
                      variant="outline"
                    >
                      <Edit size={12} className="mr-1" />
                      Редактировать
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => onDuplicateWidget(widget.widgetId)}
                      variant="outline"
                    >
                      <Copy size={12} className="mr-1" />
                      Дублировать
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => onExportWidget(widget.widgetId)}
                      variant="outline"
                    >
                      <Download size={12} className="mr-1" />
                      Экспорт
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 size={12} className="mr-1" />
                          Удалить
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить Виджет</AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить виджет "{widget.meta.name}"? 
                            Это действие нельзя отменить и оно повлияет на все экраны, использующие этот виджет.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => onDeleteWidget(widget.widgetId)}
                          >
                            Удалить Виджет
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
