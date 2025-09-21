import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload,
  Calendar,
  Eye,
  Edit3,
  Layout
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addTemplate, deleteTemplate, duplicateTemplate } from '../features/templates/templatesSlice';
import { loadWidgets } from '../features/canvas/canvasSlice';
import { setActiveTab } from '../features/app/appSlice';
import { ITemplate } from '../types';

export function TemplatesTab() {
  const dispatch = useAppDispatch();
  const { templates } = useAppSelector(state => state.templates);
  const { widgets } = useAppSelector(state => state.canvas);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) return;

    const template: ITemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newTemplate.name.trim(),
      description: newTemplate.description.trim() || undefined,
      widgets: [...widgets],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addTemplate(template));
    setNewTemplate({ name: '', description: '' });
    setIsCreateDialogOpen(false);
  };

  const handleLoadTemplate = (template: ITemplate) => {
    dispatch(loadWidgets(template.widgets));
    dispatch(setActiveTab('builder'));
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Удалить этот макет? Это действие нельзя отменить.')) {
      dispatch(deleteTemplate(id));
    }
  };

  const handleDuplicateTemplate = (id: string) => {
    dispatch(duplicateTemplate(id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 p-6 bg-muted/20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Мои макеты</h1>
            <p className="text-muted-foreground">Сохраненные шаблоны и готовые макеты</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Сохранить текущий макет
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Сохранить макет</DialogTitle>
                <DialogDescription>
                  Сохраните текущее состояние холста как шаблон для повторного использования
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Название макета</Label>
                  <Input
                    id="templateName"
                    placeholder="Например: Главная страница интернет-магазина"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Описание (необязательно)</Label>
                  <Textarea
                    id="templateDescription"
                    placeholder="Краткое описание макета и его назначения"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!newTemplate.name.trim()}>
                  Сохранить макет
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and stats */}
        <div className="flex justify-between items-center">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по макетам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Всего макетов: {templates.length}
          </div>
        </div>

        {/* Templates grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(template.createdAt)}
                      </div>
                    </div>
                  </div>
                  {template.description && (
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Template preview placeholder */}
                  <div className="w-full h-32 bg-gradient-card rounded-lg border-2 border-dashed border-muted mb-4 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">{template.widgets.length} элементов</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleLoadTemplate(template)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Открыть
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {templates.length === 0 ? (
              <div className="text-muted-foreground">
                <Layout className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium mb-2">Пока нет сохраненных макетов</p>
                <p className="mb-6">Создайте свой первый макет в конструкторе</p>
                <Button onClick={() => dispatch(setActiveTab('builder'))}>
                  Перейти к конструктору
                </Button>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Макеты не найдены</p>
                <p>Попробуйте изменить поисковый запрос</p>
              </div>
            )}
          </div>
        )}

        {/* Import/Export section */}
        {templates.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex gap-4">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Импорт макетов
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Экспорт всех макетов
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}