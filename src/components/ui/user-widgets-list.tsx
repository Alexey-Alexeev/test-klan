import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { IUserWidget } from '../../features/userWidgets/userWidgetsSlice';
import { UnsavedChangesDialog } from './unsaved-changes-dialog';
import { useUnsavedChanges } from '../../hooks/use-unsaved-changes';

interface UserWidgetsListProps {
  widgets: IUserWidget[];
  onEdit: (widget: IUserWidget) => void;
  onDelete: (id: string) => void;
}

export function UserWidgetsList({ widgets, onEdit, onDelete }: UserWidgetsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<string | null>(null);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false);
  const [pendingEditWidget, setPendingEditWidget] = useState<IUserWidget | null>(null);
  
  const { hasUnsavedChanges } = useUnsavedChanges();

  const handleDeleteClick = (id: string) => {
    setWidgetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (widgetToDelete) {
      onDelete(widgetToDelete);
      setDeleteDialogOpen(false);
      setWidgetToDelete(null);
    }
  };

  const handleEditClick = (widget: IUserWidget) => {
    if (hasUnsavedChanges) {
      setPendingEditWidget(widget);
      setUnsavedChangesDialogOpen(true);
    } else {
      onEdit(widget);
    }
  };

  const handleUnsavedChangesConfirm = () => {
    if (pendingEditWidget) {
      onEdit(pendingEditWidget);
      setPendingEditWidget(null);
    }
    setUnsavedChangesDialogOpen(false);
  };

  const handleUnsavedChangesCancel = () => {
    setPendingEditWidget(null);
    setUnsavedChangesDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (widgets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
          <Edit className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">Нет сохраненных виджетов</h3>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Создайте и сохраните виджет в Конструкторе виджетов, чтобы он появился здесь
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{widget.name}</CardTitle>
                  {widget.description && (
                    <CardDescription className="mt-1">
                      {widget.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(widget)}
                    className="h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105"
                    title="Редактировать виджет"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(widget.id)}
                    className="h-9 w-9 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-105"
                    title="Удалить виджет"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(widget.createdAt)}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {widget.widgets.length} компонент{widget.widgets.length !== 1 ? 'ов' : ''}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md font-mono">
                  {widget.canvasSize.width}×{widget.canvasSize.height}px
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить виджет?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Виджет будет удален навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnsavedChangesDialog
        open={unsavedChangesDialogOpen}
        onOpenChange={setUnsavedChangesDialogOpen}
        onConfirm={handleUnsavedChangesConfirm}
        onCancel={handleUnsavedChangesCancel}
      />
    </>
  );
}
