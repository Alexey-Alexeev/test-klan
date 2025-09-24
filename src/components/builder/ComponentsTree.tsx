import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, MoreHorizontal, Plus, Trash2, GripVertical } from 'lucide-react';
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
import { selectWidget, deleteWidget, addWidget, moveWidgetToContainer, updateWidget } from '../../features/canvas/canvasSlice';
import { createDefaultWidget } from '../../lib/widgetDefaults';
import { IWidget, IContainerWidget } from '../../types';

interface TreeNodeProps {
  widget: IWidget;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onAddChild?: (parentId: string, widgetType: string) => void;
  onDelete: (id: string) => void;
  onMove?: (widgetId: string, targetContainerId: string | null) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  widget,
  level,
  isSelected,
  isExpanded,
  onToggle,
  onSelect,
  onAddChild,
  onDelete,
  onMove
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { widgets } = useAppSelector(state => state.canvas);
  
  const getWidgetIcon = (type: string) => {
    const icons: Record<string, string> = {
      'container': '📦',
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
      case 'container':
        return `Container`;
      case 'image':
        return `Image: ${(widget as any).props.alt || 'Image'}`;
      case 'card':
        return `Card: ${(widget as any).props.title || 'Card'}`;
      default:
        return `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}`;
    }
  };

  const childWidgets = widgets.filter(w => w.parentId === widget.id);
  const hasChildren = widget.type === 'container' && childWidgets.length > 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('widget-id', widget.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedWidgetId = e.dataTransfer.getData('widget-id');
    
    if (draggedWidgetId && draggedWidgetId !== widget.id && onMove) {
      if (widget.type === 'container') {
        onMove(draggedWidgetId, widget.id);
      } else {
        onMove(draggedWidgetId, null);
      }
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
        } ${isDragging ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(widget.id)}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(widget.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        {/* Drag handle */}
        <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
        
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
          {widget.type === 'container' && onAddChild && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onAddChild(widget.id, 'text')}>
                  Add Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild(widget.id, 'button')}>
                  Add Button
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild(widget.id, 'image')}>
                  Add Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild(widget.id, 'container')}>
                  Add Container
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (id: string) => {
    dispatch(selectWidget(id));
  };

  const handleAddChild = (parentId: string, widgetType: string) => {
    const parentWidget = widgets.find(w => w.id === parentId);
    if (parentWidget && parentWidget.type === 'container') {
      // Calculate position relative to container
      const containerPadding = (parentWidget as any).props.padding || 16;
      const childCount = widgets.filter(w => w.parentId === parentId).length;
      const offset = 20; // Offset between children
      
      // Create widget with relative position (inside container)
      const relativePosition = { 
        x: containerPadding + (childCount * offset), 
        y: containerPadding + (childCount * offset) 
      };
      
      const newWidget = createDefaultWidget(widgetType, relativePosition);
      
      if (newWidget) {
        // Set parent immediately BEFORE adding to state
        newWidget.parentId = parentId;
        
        // Update the parent's children array immediately
        const updatedParent = {
          ...parentWidget,
          props: {
            ...(parentWidget as any).props,
            children: [...((parentWidget as any).props.children || []), newWidget.id]
          }
        };
        
        // Add both widget and update parent in a single action
        dispatch(addWidget(newWidget));
        dispatch(updateWidget({ id: parentId, updates: updatedParent }));
        
        // Force expand the parent container to show the new child
        const newExpanded = new Set(expandedNodes);
        newExpanded.add(parentId);
        setExpandedNodes(newExpanded);
      }
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteWidget(id));
  };

  const handleMove = (widgetId: string, targetContainerId: string | null) => {
    dispatch(moveWidgetToContainer({ widgetId, containerId: targetContainerId }));
  };

  // Build tree structure
  const buildTree = (widgets: IWidget[]): IWidget[] => {
    const rootWidgets = widgets.filter(w => !(w as any).parentId);
    return rootWidgets;
  };

  const renderTree = (widgetsToRender: IWidget[], level: number = 0): React.ReactNode => {
    return widgetsToRender.map(widget => {
      const isSelected = selectedWidgetId === widget.id;
      const isExpanded = expandedNodes.has(widget.id);
      const childWidgets = widgets.filter(w => w.parentId === widget.id);
      const hasChildren = widget.type === 'container' && childWidgets.length > 0;
      
      return (
        <div key={widget.id}>
          <TreeNode
            widget={widget}
            level={level}
            isSelected={isSelected}
            isExpanded={isExpanded}
            onToggle={handleToggle}
            onSelect={handleSelect}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onMove={handleMove}
          />
          {isExpanded && hasChildren && (
            <div>
              {renderTree(
                widgets.filter(w => w.parentId === widget.id),
                level + 1
              )}
            </div>
          )}
        </div>
      );
    });
  };

  const treeWidgets = buildTree(widgets);

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
          {treeWidgets.length > 0 ? (
            renderTree(treeWidgets)
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
