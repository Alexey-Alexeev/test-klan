import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Trash2, ChevronRight } from 'lucide-react';
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
import { selectWidget, deleteWidget, updateWidget } from '../../features/canvas/canvasSlice';
import { IWidget } from '../../types';

interface TreeNodeProps {
  widget: IWidget;
  level: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToContainer?: (widgetId: string, containerId: string) => void;
  onMoveToRoot?: (widgetId: string) => void;
  isExpandable: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  widget,
  level,
  isSelected,
  onSelect,
  onDelete,
  onMoveToContainer,
  onMoveToRoot,
  isExpandable,
  isExpanded,
  onToggleExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const isRootNode = widget.id === 'root';
  
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
      'accordion': '📋',
      'container': '📦',
      'root': '🏠'
    };
    return icons[type] || '📄';
  };

  const getWidgetName = (widget: IWidget) => {
    switch ((widget as any).type) {
      case 'button':
        return `Button: ${(widget as any).props.text || 'Button'}`;
      case 'text':
        return `Text: ${(widget as any).props.content || 'Text'}`;
      case 'image':
        return `Image: ${(widget as any).props.alt || 'Image'}`;
      case 'card':
        return `Card: ${(widget as any).props.title || 'Card'}`;
      case 'container':
        const containerWidget = widget as any;
        const childCount = containerWidget.props.children?.length || 0;
        return `Container (${childCount} elements)`;
      case 'root':
        return `Root component`;
      default:
        return `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}`;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isRootNode) return;
    e.dataTransfer.setData('widget-id', widget.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (widget.type === 'container' || isRootNode) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (widget.type === 'container' || isRootNode) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedWidgetId = e.dataTransfer.getData('widget-id');
    if (!draggedWidgetId || draggedWidgetId === widget.id) {
      setIsDragOver(false);
      return;
    }

    if (isRootNode) {
      onMoveToRoot?.(draggedWidgetId);
      setIsDragOver(false);
      return;
    }

    if (widget.type === 'container') {
      onMoveToContainer?.(draggedWidgetId, widget.id);
      setIsDragOver(false);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-1 px-2 rounded transition-colors ${
          isRootNode
            ? isDragOver
              ? 'bg-blue-100 border border-blue-300'
              : 'bg-muted/50 border-b border-border'
            : isSelected
              ? 'bg-primary text-primary-foreground'
              : isHovered
                ? 'bg-muted'
                : isDragOver && widget.type === 'container'
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : 'hover:bg-muted/50'
        } ${isRootNode ? 'cursor-default font-medium' : 'cursor-pointer group'}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!isRootNode) {
            onSelect(widget.id);
          }
        }}
        draggable={!isRootNode}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse arrow */}
        {isExpandable ? (
          <ChevronRight 
            className={`h-4 w-4 text-gray-500 transition-transform cursor-pointer hover:text-gray-700 ${
              isExpanded ? 'rotate-90' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(widget.id);
            }}
          />
        ) : (
          <div className="w-4" />
        )}
        
        {/* Widget icon */}
        <span className="text-sm">{getWidgetIcon(widget.type)}</span>

        {/* Widget name */}
        <span className={`flex-1 text-sm truncate ${isRootNode ? 'font-medium' : ''}`}>
          {getWidgetName(widget)}
        </span>

        {/* Widget type badge */}
        {isRootNode ? (
          <Badge variant="outline" className="text-xs">Canvas</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {widget.type}
          </Badge>
        )}

        {/* Actions */}
        {!isRootNode && (
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
        )}
      </div>
    </div>
  );
};

export const ComponentsTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const { widgets, selectedWidgetId } = useAppSelector(state => state.canvas);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleSelect = (id: string) => {
    dispatch(selectWidget(id));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteWidget(id));
  };

  const handleToggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const detachFromParent = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || !widget.parentId) return;

    const parent = widgets.find(w => w.id === widget.parentId);
    if (!parent || parent.type !== 'container') return;

    const parentProps: any = (parent as any).props || {};
    const parentChildren: string[] = parentProps.children || [];
    const pruned = parentChildren.filter(id => id !== widgetId);
    dispatch(updateWidget({ id: parent.id, updates: { props: { ...parentProps, children: pruned } } }));
  };

  const moveWidgetToParent = (widgetId: string, containerId: string | null) => {
    if (containerId) {
      dispatch(updateWidget({ id: widgetId, updates: { parentId: containerId } }));
      const container = widgets.find(w => w.id === containerId);
      if (container && container.type === 'container') {
        const containerProps: any = (container as any).props || {};
        const children: string[] = containerProps.children || [];
        if (!children.includes(widgetId)) {
          dispatch(updateWidget({ id: containerId, updates: { props: { ...containerProps, children: [...children, widgetId] } } }));
        }
      }
    } else {
      dispatch(updateWidget({ id: widgetId, updates: { parentId: null as any } }));
    }
  };

  const handleMoveToContainer = (widgetId: string, containerId: string) => {
    if (widgetId === containerId) return;

    const widget = widgets.find(w => w.id === widgetId);
    const container = widgets.find(w => w.id === containerId);
    if (!widget || !container || container.type !== 'container') return;

    // Prevent cyclic nesting
    let ancestor: typeof widget | undefined = container;
    while (ancestor) {
      if (ancestor.id === widgetId) return;
      ancestor = ancestor.parentId ? widgets.find(w => w.id === ancestor!.parentId) : undefined;
    }

    // If moving to the same parent, just reorder (don't detach and reattach)
    if (widget.parentId === containerId) {
      // Just ensure the widget is at the end of the children array
      const containerProps: any = (container as any).props || {};
      const children: string[] = containerProps.children || [];
      const filteredChildren = children.filter(id => id !== widgetId);
      const reorderedChildren = [...filteredChildren, widgetId];
      dispatch(updateWidget({ id: containerId, updates: { props: { ...containerProps, children: reorderedChildren } } }));
      return;
    }

    detachFromParent(widgetId);
    moveWidgetToParent(widgetId, containerId);
  };

  const handleMoveToRoot = (widgetId: string) => {
    detachFromParent(widgetId);
    moveWidgetToParent(widgetId, null);
  };

  // Handle Delete key for any selected widget
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedWidgetId) {
        handleDelete(selectedWidgetId);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedWidgetId]);

  const renderTree = (parentId: string | null, level: number = 0): React.ReactNode => {
    // Get widgets for this level
    let widgetsToRender: IWidget[] = [];
    
    if (parentId === null) {
      // Show root component and root level widgets
      const rootWidgets = widgets.filter(w => !w.parentId);
      const rootComponent: IWidget = {
        id: 'root',
        type: 'root' as any,
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
        zIndex: 0,
        style: {},
        props: { children: rootWidgets.map(w => w.id) } as any,
        parentId: null,
      };
      widgetsToRender = [rootComponent];
    } else if (parentId === 'root') {
      // Show root level widgets
      widgetsToRender = widgets.filter(w => !w.parentId);
    } else {
      // Find children of containers
      const parentWidget = widgets.find(p => p.id === parentId);
      if (parentWidget && parentWidget.type === 'container') {
        const container = parentWidget as any;
        widgetsToRender = widgets.filter(w => container.props?.children?.includes(w.id) || false);
      }
    }

    return widgetsToRender.map(widget => {
      const isSelected = selectedWidgetId === widget.id;
      const isExpanded = expandedNodes.has(widget.id);
      
      // Check if widget can have children (containers and root)
      const canHaveChildren = widget.type === 'container' || (widget as any).type === 'root';
      const hasChildren = canHaveChildren && (() => {
        if (widget.type === 'container') {
          const container = widget as any;
          return container.props?.children?.length > 0;
        }
        if ((widget as any).type === 'root') {
          return widgets.filter(w => !w.parentId).length > 0;
        }
        return false;
      })();

      return (
        <div key={widget.id}>
          <TreeNode
            widget={widget}
            level={level}
            isSelected={isSelected}
            onSelect={handleSelect}
            onDelete={handleDelete}
            onMoveToContainer={handleMoveToContainer}
            onMoveToRoot={handleMoveToRoot}
            isExpandable={canHaveChildren}
            isExpanded={isExpanded}
            onToggleExpand={handleToggleExpand}
          />
          {/* Render children if expanded */}
          {isExpanded && hasChildren && (
            <div className="ml-4">
              {renderTree(widget.id === 'root' ? 'root' : widget.id, level + 1)}
            </div>
          )}
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
          {/* Tree nodes */}
          {renderTree(null)}
        </div>
      </CardContent>
    </Card>
  );
};
