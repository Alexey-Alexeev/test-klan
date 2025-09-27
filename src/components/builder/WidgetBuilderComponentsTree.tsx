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
import { addWidget, selectWidget, deleteWidget, updateWidget } from '../../features/widgetBuilder/widgetBuilderSlice';
import { IWidget } from '../../types';
import { createDefaultWidget } from '../../lib/widgetDefaults';

interface TreeNodeProps {
  widget: IWidget;
  level: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveToContainer?: (widgetId: string, containerId: string) => void;
  onMoveToRoot?: (widgetId: string) => void;
  onRename?: (widgetId: string, newName: string) => void;
  onAddWidget?: (widgetType: string, dropX: number, dropY: number, targetContainerId: string | null) => void;
  isExpandable: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const TreeNode: React.FC<TreeNodeProps & { allWidgets: IWidget[] }> = ({
  widget,
  level,
  isSelected,
  onSelect,
  onDelete,
  onMoveToContainer,
  onMoveToRoot,
  onRename,
  onAddWidget,
  isExpandable,
  isExpanded,
  onToggleExpand,
  allWidgets,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
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

  const getWidgetName = (widget: IWidget, allWidgets: IWidget[] = []) => {
    switch ((widget as any).type) {
      case 'button':
        return `${(widget as any).props.text || 'Button'}`;
      case 'text':
        return `${(widget as any).props.content || 'Text'}`;
      case 'image':
        return `${(widget as any).props.alt || 'Image'}`;
      case 'card':
        return `${(widget as any).props.title || 'Card'}`;
      case 'container':
        const containerWidget = widget as any;
        const childCount = containerWidget.props.children?.length || 0;
        // Count containers with same type to add numbering
        const containerCount = allWidgets.filter(w => w.type === 'container').length;
        const containerIndex = allWidgets.filter(w => w.type === 'container').findIndex(w => w.id === widget.id) + 1;
        return containerCount > 1 ? `Container ${containerIndex}` : 'Container';
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
    const draggedWidgetType = e.dataTransfer.getData('widget-type');

    if (draggedWidgetId && draggedWidgetId === widget.id) {
      setIsDragOver(false);
      return;
    }

    if (draggedWidgetType) {
      setIsDragOver(false);

      const dropX = e.clientX;
      const dropY = e.clientY;

      if (isRootNode) {
        onAddWidget?.(draggedWidgetType, dropX, dropY, null);
        return;
      }

      if (widget.type === 'container') {
        onAddWidget?.(draggedWidgetType, dropX, dropY, widget.id);
        return;
      }

      return;
    }

    if (draggedWidgetId) {
      if (isRootNode) {
        onMoveToRoot?.(draggedWidgetId);
        setIsDragOver(false);
        return;
      }

      if (widget.type === 'container') {
        onMoveToContainer?.(draggedWidgetId, widget.id);
        setIsDragOver(false);
      }
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded transition-colors ${
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
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!isRootNode) {
            onSelect(widget.id);
          }
        }}
        onDoubleClick={() => {
          if (!isRootNode && onRename) {
            setIsEditing(true);
            setEditValue(getWidgetName(widget, allWidgets));
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
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              if (onRename && editValue.trim()) {
                onRename(widget.id, editValue.trim());
              }
              setIsEditing(false);
              setEditValue('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (onRename && editValue.trim()) {
                  onRename(widget.id, editValue.trim());
                }
                setIsEditing(false);
                setEditValue('');
              } else if (e.key === 'Escape') {
                setIsEditing(false);
                setEditValue('');
              }
            }}
            className="flex-1 text-sm bg-transparent border-none outline-none px-1 py-0 min-w-0"
            autoFocus
          />
        ) : (
          <span className={`flex-1 text-sm ${isRootNode ? 'font-medium' : ''} truncate min-w-0`}>
            {getWidgetName(widget, allWidgets)}
          </span>
        )}

        {/* Actions */}
        {!isRootNode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
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

export const WidgetBuilderComponentsTree: React.FC = () => {
  const dispatch = useAppDispatch();
  const { widgets, selectedWidgetId } = useAppSelector(state => state.widgetBuilder);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

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
        // Don't allow collapsing root
        if (id !== 'root') {
          newSet.delete(id);
        }
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Auto-expand new containers when they are added
  useEffect(() => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      // Always keep root expanded
      newSet.add('root');
      // Only auto-expand new containers that weren't previously expanded
      widgets.forEach(widget => {
        if (widget.type === 'container' && !prev.has(widget.id)) {
          newSet.add(widget.id);
        }
      });
      return newSet;
    });
  }, [widgets]);

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

  const handleAddWidget = (widgetType: string, clientX: number, clientY: number, targetContainerId: string | null) => {
    const position = { x: clientX || 0, y: clientY || 0 };
    const newWidget = createDefaultWidget(widgetType, position);
    if (!newWidget) return;

    if (targetContainerId) {
      newWidget.parentId = targetContainerId;
    } else {
      newWidget.parentId = null;
    }

    // Persist widget before updating parent structure so reducers see it
    dispatch(addWidget(newWidget));

    if (newWidget.parentId) {
      const container = widgets.find(w => w.id === newWidget.parentId);
      if (container && container.type === 'container') {
        const containerProps: any = (container as any).props || {};
        const children: string[] = containerProps.children || [];
        if (!children.includes(newWidget.id)) {
          dispatch(updateWidget({ id: newWidget.parentId, updates: { props: { ...containerProps, children: [...children, newWidget.id] } } }));
        }
      }
    }

    // Align widget selection
    dispatch(selectWidget(newWidget.id));
  };

  const handleRename = (widgetId: string, newName: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Update widget properties based on type
    const updates: any = {};
    
    switch (widget.type) {
      case 'button':
        updates.props = { ...(widget as any).props, text: newName };
        break;
      case 'text':
        updates.props = { ...(widget as any).props, content: newName };
        break;
      case 'image':
        updates.props = { ...(widget as any).props, alt: newName };
        break;
      case 'card':
        updates.props = { ...(widget as any).props, title: newName };
        break;
      default:
        // For other types, we could add a custom name property
        return;
    }

    dispatch(updateWidget({ id: widgetId, updates }));
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
            onRename={handleRename}
            onAddWidget={handleAddWidget}
            isExpandable={canHaveChildren}
            isExpanded={isExpanded}
            onToggleExpand={handleToggleExpand}
            allWidgets={widgets}
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
    <Card className="h-full w-full min-h-[350px] max-h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg">Дерево компонентов</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-1 min-w-0 p-2 max-h-full">
          {/* Tree nodes */}
          {renderTree(null)}
        </div>
      </CardContent>
    </Card>
  );
};
