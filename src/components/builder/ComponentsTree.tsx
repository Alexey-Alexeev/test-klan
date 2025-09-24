import React, { useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectWidget, deleteWidget } from '../../features/canvas/canvasSlice';
import { IWidget } from '../../types';

interface TreeNodeProps {
  widget: IWidget;
  level: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  widget,
  level,
  isSelected,
  onSelect,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getWidgetIcon = (type: string) => {
    const icons: Record<string, string> = {
      'button': '🔘',
      'text': '📝',
      'input': '📄',
      'image': '🖼️',
      'card': '🃏',
      'divider': '➖',
      'spacer': '⬜',
      'icon': '🔸',
      'badge': '🏷️',
      'avatar': '👤',
      'progress': '📊',
      'checkbox': '☑️',
      'radio': '🔘',
      'select': '📋',
      'textarea': '📝',
      'slider': '🎚️',
      'switch': '🔀',
      'tabs': '📑',
      'accordion': '📋'
    };
    return icons[type] || '📄';
  };

  const getWidgetName = (widget: IWidget) => {
    switch (widget.type) {
      case 'button':
        return `Button: ${(widget as any).props.text || 'Button'}`;
      case 'text':
        return `Text: ${(widget as any).props.content || 'Text'}`;
      case 'image':
        return `Image: ${(widget as any).props.alt || 'Image'}`;
      case 'card':
        return `Card: ${(widget as any).props.title || 'Card'}`;
      default:
        return `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}`;
    }
  };



  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-primary text-primary-foreground' 
            : isHovered 
              ? 'bg-muted' 
              : 'hover:bg-muted/50'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(widget.id)}
      >
        {/* Spacer */}
        <div className="w-4" />
        
        {/* Widget icon */}
        <span className="text-sm">{getWidgetIcon(widget.type)}</span>

        {/* Widget name */}
        <span className="flex-1 text-sm truncate">{getWidgetName(widget)}</span>

        {/* Widget type badge */}
        <Badge variant="secondary" className="text-xs">
          {widget.type}
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onDelete(widget.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export const ComponentsTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const { widgets, selectedWidgetId } = useAppSelector(state => state.canvas);

  const handleSelect = (id: string) => {
    dispatch(selectWidget(id));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteWidget(id));
  };

  const renderTree = (widgetsToRender: IWidget[], level: number = 0): React.ReactNode => {
    return widgetsToRender.map(widget => {
      const isSelected = selectedWidgetId === widget.id;
      
      return (
        <div key={widget.id}>
          <TreeNode
            widget={widget}
            level={level}
            isSelected={isSelected}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </div>
      );
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Components Tree</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {/* Root component */}
          <div className="p-2 border-b">
            <div className="flex items-center gap-2">
              <span className="text-sm">📱</span>
              <span className="text-sm font-medium">Root Component</span>
              <Badge variant="outline" className="text-xs">
                Canvas
              </Badge>
            </div>
          </div>
          
          {/* Tree nodes */}
          {widgets.length > 0 ? (
            renderTree(widgets)
          ) : (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No components yet. Drag widgets from the sidebar to start building.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
