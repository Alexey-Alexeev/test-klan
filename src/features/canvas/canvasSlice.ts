import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasState, IWidget, IPosition, ISize, IContainerWidget } from '../../types';

const sortContainerChildren = (container: IContainerWidget, children: IWidget[]) => {
  const order = container.props.children;
  if (order && order.length) {
    const orderMap = new Map(order.map((id, index) => [id, index]));
    return [...children].sort((a, b) => {
      const aIdx = orderMap.has(a.id) ? orderMap.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const bIdx = orderMap.has(b.id) ? orderMap.get(b.id)! : Number.MAX_SAFE_INTEGER;
      return aIdx - bIdx;
    });
  }
  return [...children];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const isFlexLayout = (container: IContainerWidget) => container.props.layout === 'flex';

const reflowContainerLayout = (state: CanvasState, containerId: string) => {
  const container = state.widgets.find(
    (w): w is IContainerWidget => w.id === containerId && w.type === 'container'
  );
  if (!container || !isFlexLayout(container)) return;

  const padding = container.props.padding ?? 0;
  const gap = container.props.gap ?? 0;
  const direction = container.props.direction ?? 'column';
  const justify = container.props.justifyContent ?? 'flex-start';
  const align = container.props.alignItems ?? 'flex-start';

  const rawChildren = state.widgets.filter(w => w.parentId === container.id);
  if (!rawChildren.length) return;

  const children = sortContainerChildren(container, rawChildren);
  const isColumn = direction === 'column';

  const containerMainSize = isColumn ? container.size.height : container.size.width;
  const containerCrossSize = isColumn ? container.size.width : container.size.height;
  const availableMain = containerMainSize - padding * 2;
  const availableCross = Math.max(0, containerCrossSize - padding * 2);

  const gapCount = Math.max(children.length - 1, 0);
  const baseGapTotal = gap * gapCount;
  const totalChildrenMain = children.reduce((sum, child) => {
    const size = isColumn ? child.size.height : child.size.width;
    return sum + size;
  }, 0);

  const usedMain = totalChildrenMain + baseGapTotal;
  const freeSpace = Math.max(0, availableMain - usedMain);

  let spacingBetween = gap;
  let startOffsetMain = padding;

  switch (justify) {
    case 'center':
      startOffsetMain = padding + freeSpace / 2;
      break;
    case 'flex-end':
      startOffsetMain = padding + freeSpace;
      break;
    case 'space-between':
      if (children.length > 1) {
        const extra = freeSpace / Math.max(children.length - 1, 1);
        spacingBetween = gap + extra;
      } else {
        startOffsetMain = padding + freeSpace / 2;
      }
      break;
    case 'space-around':
      if (children.length > 0) {
        const extra = freeSpace / Math.max(children.length, 1);
        startOffsetMain = padding + extra / 2;
        spacingBetween = gap + extra;
      }
      break;
    case 'flex-start':
    default:
      startOffsetMain = padding;
      break;
  }

  spacingBetween = Math.max(0, spacingBetween);
  startOffsetMain = Math.max(padding, startOffsetMain);

  let cursorMain = startOffsetMain;

  children.forEach((child, index) => {
    if (isColumn) {
      let x = padding;
      switch (align) {
        case 'center':
          x = padding + Math.max(0, (availableCross - child.size.width) / 2);
          break;
        case 'flex-end':
          x = containerCrossSize - padding - child.size.width;
          break;
        case 'stretch':
          child.size.width = Math.max(0, availableCross);
          x = padding;
          break;
        default:
          x = padding;
      }

      x = clamp(x, padding, Math.max(padding, containerCrossSize - padding - child.size.width));

      const maxY = Math.max(padding, containerMainSize - padding - child.size.height);
      child.position = {
        x: Math.round(x),
        y: Math.round(clamp(cursorMain, padding, maxY)),
      };

      cursorMain += child.size.height;
    } else {
      let y = padding;
      switch (align) {
        case 'center':
          y = padding + Math.max(0, (availableCross - child.size.height) / 2);
          break;
        case 'flex-end':
          y = containerCrossSize - padding - child.size.height;
          break;
        case 'stretch':
          child.size.height = Math.max(0, availableCross);
          y = padding;
          break;
        default:
          y = padding;
      }

      y = clamp(y, padding, Math.max(padding, containerCrossSize - padding - child.size.height));

      const maxX = Math.max(padding, containerMainSize - padding - child.size.width);
      child.position = {
        x: Math.round(clamp(cursorMain, padding, maxX)),
        y: Math.round(y),
      };

      cursorMain += child.size.width;
    }

    if (index < children.length - 1) {
      cursorMain += spacingBetween;
    }
  });
};

const initialState: CanvasState = {
  widgets: [],
  selectedWidgetId: null,
  selectedWidgetIds: [],
  canvasSize: { width: 1200, height: 800 },
  isCanvasSizeLocked: false,
  gridSnap: true,
  snapSize: 2,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  showRulers: true,
  gridSize: 20,
  showGrid: true,
  isMultiSelecting: false,
  selectionBox: null,
};

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<IWidget>) => {
      const widget = action.payload;
      state.widgets.push(widget);
      state.selectedWidgetId = widget.id;
      
      // If widget has a parent, update parent's children array
      if (widget.parentId) {
        const parent = state.widgets.find(w => w.id === widget.parentId);
        if (parent && parent.type === 'container') {
          const parentWidget = parent as any;
          if (!parentWidget.props.children) {
            parentWidget.props.children = [];
          }
          if (!parentWidget.props.children.includes(widget.id)) {
            parentWidget.props.children.push(widget.id);
          }
        }
      }

      if (widget.type === 'container') {
        reflowContainerLayout(state, widget.id);
      }

      if (widget.parentId) {
        reflowContainerLayout(state, widget.parentId);
      }
    },
    
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<IWidget> }>) => {
      const { id, updates } = action.payload;
      const widgetIndex = state.widgets.findIndex(w => w.id === id);
      if (widgetIndex !== -1) {
        const targetWidget = state.widgets[widgetIndex];
        Object.assign(targetWidget, updates);

        if (targetWidget.type === 'container') {
          reflowContainerLayout(state, targetWidget.id);
        }

        if (targetWidget.parentId) {
          reflowContainerLayout(state, targetWidget.parentId);
        }
      }
    },

    updateWidgetPosition: (state, action: PayloadAction<{ id: string; position: IPosition }>) => {
      const { id, position } = action.payload;
      const widget = state.widgets.find(w => w.id === id);
      if (widget) {
        let constrainedPosition = { ...position };
        
        // If widget has a parent container, constrain within container bounds
        if (widget.parentId) {
          const parentContainer = state.widgets.find(w => w.id === widget.parentId);
          if (parentContainer && parentContainer.type === 'container') {
            const containerPadding = (parentContainer as any).props.padding || 16;
            const maxX = parentContainer.size.width - widget.size.width - containerPadding;
            const maxY = parentContainer.size.height - widget.size.height - containerPadding;
            
            constrainedPosition = {
              x: Math.max(containerPadding, Math.min(position.x, maxX)),
              y: Math.max(containerPadding, Math.min(position.y, maxY)),
            };
          }
        } else {
          // Clamp within canvas bounds for root-level widgets
          const maxX = Math.max(0, state.canvasSize.width - widget.size.width);
          const maxY = Math.max(0, state.canvasSize.height - widget.size.height);
          constrainedPosition = {
            x: Math.min(Math.max(0, position.x), maxX),
            y: Math.min(Math.max(0, position.y), maxY),
          };
        }
        
        widget.position = constrainedPosition;

        if (widget.type === 'container') {
          reflowContainerLayout(state, widget.id);
        }

        if (widget.parentId) {
          reflowContainerLayout(state, widget.parentId);
        }
      }
    },

    updateWidgetSize: (state, action: PayloadAction<{ id: string; size: ISize }>) => {
      const { id, size } = action.payload;
      const widget = state.widgets.find(w => w.id === id);
      if (widget) {
        const newSize = { width: Math.max(1, size.width), height: Math.max(1, size.height) };
        // Ensure widget stays within canvas after resize
        const maxX = Math.max(0, state.canvasSize.width - newSize.width);
        const maxY = Math.max(0, state.canvasSize.height - newSize.height);
        widget.position.x = Math.min(widget.position.x, maxX);
        widget.position.y = Math.min(widget.position.y, maxY);
        widget.size = newSize;

        if (widget.type === 'container') {
          reflowContainerLayout(state, widget.id);
        }

        if (widget.parentId) {
          reflowContainerLayout(state, widget.parentId);
        }
      }
    },

    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidgetId = action.payload;
    },

    deleteWidget: (state, action: PayloadAction<string>) => {
      const widgetId = action.payload;
      const widget = state.widgets.find(w => w.id === widgetId);
      const parentId = widget?.parentId;
      // Delete widget and all its children recursively
      const deleteWidgetAndChildren = (id: string) => {
        const children = state.widgets.filter(w => w.parentId === id);
        children.forEach(child => deleteWidgetAndChildren(child.id));
        state.widgets = state.widgets.filter(w => w.id !== id);
      };
      
      deleteWidgetAndChildren(widgetId);
      
      if (state.selectedWidgetId === widgetId) {
        state.selectedWidgetId = null;
      }

      if (parentId) {
        reflowContainerLayout(state, parentId);
      }
    },

    duplicateWidget: (state, action: PayloadAction<string>) => {
      const widget = state.widgets.find(w => w.id === action.payload);
      if (widget) {
        const duplicate = {
          ...widget,
          id: `${widget.id}_copy_${Date.now()}`,
          position: {
            x: widget.position.x + 20,
            y: widget.position.y + 20,
          },
        };
        state.widgets.push(duplicate);
        state.selectedWidgetId = duplicate.id;

        if (duplicate.parentId) {
          reflowContainerLayout(state, duplicate.parentId);
        }
      }
    },

    clearCanvas: (state) => {
      state.widgets = [];
      state.selectedWidgetId = null;
    },

    loadWidgets: (state, action: PayloadAction<IWidget[]>) => {
      state.widgets = action.payload;
      state.selectedWidgetId = null;

      state.widgets
        .filter((widget): widget is IContainerWidget => widget.type === 'container')
        .forEach(container => {
          reflowContainerLayout(state, container.id);
        });
    },

    setCanvasSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      if (!state.isCanvasSizeLocked) {
        state.canvasSize = action.payload;
        // Clamp all widgets into the new canvas bounds
        state.widgets.forEach(widget => {
          const maxX = Math.max(0, state.canvasSize.width - widget.size.width);
          const maxY = Math.max(0, state.canvasSize.height - widget.size.height);
          widget.position.x = Math.min(Math.max(0, widget.position.x), maxX);
          widget.position.y = Math.min(Math.max(0, widget.position.y), maxY);
          // Optional: shrink oversize widgets to fit
          if (widget.size.width > state.canvasSize.width) widget.size.width = state.canvasSize.width;
          if (widget.size.height > state.canvasSize.height) widget.size.height = state.canvasSize.height;
        });

      state.widgets
        .filter((widget): widget is IContainerWidget => widget.type === 'container')
        .forEach(container => {
          reflowContainerLayout(state, container.id);
        });
      }
    },

    toggleCanvasSizeLock: (state) => {
      state.isCanvasSizeLocked = !state.isCanvasSizeLocked;
    },

    toggleGridSnap: (state) => {
      state.gridSnap = !state.gridSnap;
    },

    setSnapSize: (state, action: PayloadAction<number>) => {
      state.snapSize = action.payload;
    },

    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.25, Math.min(2, action.payload));
    },

    bringToFront: (state, action: PayloadAction<string>) => {
      const widget = state.widgets.find(w => w.id === action.payload);
      if (widget) {
        const maxZ = Math.max(...state.widgets.map(w => w.zIndex));
        widget.zIndex = maxZ + 1;
      }
    },

    sendToBack: (state, action: PayloadAction<string>) => {
      const widget = state.widgets.find(w => w.id === action.payload);
      if (widget) {
        const minZ = Math.min(...state.widgets.map(w => w.zIndex));
        widget.zIndex = minZ - 1;
      }
    },

    setPanOffset: (state, action: PayloadAction<IPosition>) => {
      state.panOffset = action.payload;
    },

    toggleRulers: (state) => {
      state.showRulers = !state.showRulers;
    },

    toggleGrid: (state) => {
      state.showGrid = !state.showGrid;
    },

    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = action.payload;
    },

    resetView: (state) => {
      state.zoom = 1;
      state.panOffset = { x: 0, y: 0 };
    },

    selectMultipleWidgets: (state, action: PayloadAction<string[]>) => {
      state.selectedWidgetIds = action.payload;
      state.selectedWidgetId = action.payload.length === 1 ? action.payload[0] : null;
    },

    addToSelection: (state, action: PayloadAction<string>) => {
      if (!state.selectedWidgetIds.includes(action.payload)) {
        state.selectedWidgetIds.push(action.payload);
      }
      state.selectedWidgetId = action.payload;
    },

    removeFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedWidgetIds = state.selectedWidgetIds.filter(id => id !== action.payload);
      if (state.selectedWidgetId === action.payload) {
        state.selectedWidgetId = state.selectedWidgetIds.length > 0 ? state.selectedWidgetIds[0] : null;
      }
    },

    clearSelection: (state) => {
      state.selectedWidgetId = null;
      state.selectedWidgetIds = [];
    },

    setMultiSelecting: (state, action: PayloadAction<boolean>) => {
      state.isMultiSelecting = action.payload;
    },

    setSelectionBox: (state, action: PayloadAction<{ x: number; y: number; width: number; height: number } | null>) => {
      state.selectionBox = action.payload;
    },

    groupWidgets: (state, action: PayloadAction<string[]>) => {
      // Group selected widgets into a container
      const widgetIds = action.payload;
      const widgets = state.widgets.filter(w => widgetIds.includes(w.id));
      
      if (widgets.length < 2) return;
      
      // Calculate group bounds
      const minX = Math.min(...widgets.map(w => w.position.x));
      const minY = Math.min(...widgets.map(w => w.position.y));
      const maxX = Math.max(...widgets.map(w => w.position.x + w.size.width));
      const maxY = Math.max(...widgets.map(w => w.position.y + w.size.height));
      
      // Create container widget
      const containerWidget = {
        id: `container_${Date.now()}`,
        type: 'container' as const,
        position: { x: minX, y: minY },
        size: { width: maxX - minX, height: maxY - minY },
        zIndex: Math.max(...widgets.map(w => w.zIndex)) + 1,
        style: {
          backgroundColor: 'transparent',
          border: '2px dashed hsl(0 0% 80%)',
          borderRadius: 8,
        },
        props: {
          layout: 'flex' as const,
          direction: 'column' as const,
          justifyContent: 'flex-start' as const,
          alignItems: 'stretch' as const,
          gap: 8,
          padding: 16,
          children: widgets.map(w => w.id),
        },
      };
      
      // Update widget positions relative to container and set parent
      widgets.forEach(widget => {
        widget.position.x -= minX;
        widget.position.y -= minY;
        widget.parentId = containerWidget.id;
        widget.zIndex = containerWidget.zIndex + 1;
      });
      
      // Add container and update selection
      state.widgets.push(containerWidget);
      state.selectedWidgetId = containerWidget.id;
      state.selectedWidgetIds = [containerWidget.id];
    },

    moveWidgetToContainer: (state, action: PayloadAction<{ widgetId: string; containerId: string | null }>) => {
      const { widgetId, containerId } = action.payload;
      const widget = state.widgets.find(w => w.id === widgetId);

      if (!widget || widget.parentId === containerId) {
        return;
      }

      const getAbsolutePosition = (target: IWidget): IPosition => {
        const position = { x: target.position.x, y: target.position.y };
        let currentParentId = target.parentId;

        while (currentParentId) {
          const parent = state.widgets.find(w => w.id === currentParentId);
          if (!parent) break;
          position.x += parent.position.x;
          position.y += parent.position.y;
          currentParentId = parent.parentId;
        }

        return position;
      };

      const absolutePosition = getAbsolutePosition(widget);
      const previousParentId = widget.parentId;

      if (previousParentId) {
        const previousParent = state.widgets.find(w => w.id === previousParentId);
        if (previousParent && previousParent.type === 'container') {
          const previousParentWidget = previousParent as IContainerWidget;
          if (previousParentWidget.props.children) {
            previousParentWidget.props.children = previousParentWidget.props.children.filter((id) => id !== widgetId);
          }
        }
      }

      if (containerId) {
        const container = state.widgets.find(
          (w): w is IContainerWidget => w.id === containerId && w.type === 'container'
        );
        if (!container) {
          widget.parentId = undefined;
          const maxX = Math.max(0, state.canvasSize.width - widget.size.width);
          const maxY = Math.max(0, state.canvasSize.height - widget.size.height);
          widget.position = {
            x: Math.min(Math.max(0, absolutePosition.x), maxX),
            y: Math.min(Math.max(0, absolutePosition.y), maxY),
          };
          if (previousParentId) {
            reflowContainerLayout(state, previousParentId);
          }
          return;
        }

        const containerAbsolutePosition = getAbsolutePosition(container);
        const containerPadding = container.props.padding ?? 16;
        const maxX = container.size.width - widget.size.width - containerPadding;
        const maxY = container.size.height - widget.size.height - containerPadding;

        const relativeX = absolutePosition.x - containerAbsolutePosition.x;
        const relativeY = absolutePosition.y - containerAbsolutePosition.y;

        widget.position = {
          x: Math.max(containerPadding, Math.min(relativeX, maxX)),
          y: Math.max(containerPadding, Math.min(relativeY, maxY)),
        };
        widget.parentId = containerId;
        widget.zone = undefined;

        if (!container.props.children) {
          container.props.children = [];
        }
        if (!container.props.children.includes(widgetId)) {
          container.props.children.push(widgetId);
        }
      } else {
        widget.parentId = undefined;
        const maxX = Math.max(0, state.canvasSize.width - widget.size.width);
        const maxY = Math.max(0, state.canvasSize.height - widget.size.height);
        widget.position = {
          x: Math.min(Math.max(0, absolutePosition.x), maxX),
          y: Math.min(Math.max(0, absolutePosition.y), maxY),
        };
      }

      if (previousParentId) {
        reflowContainerLayout(state, previousParentId);
      }

      if (containerId) {
        reflowContainerLayout(state, containerId);
      }
    },
  },
});

export const {
  addWidget,
  updateWidget,
  updateWidgetPosition,
  updateWidgetSize,
  selectWidget,
  deleteWidget,
  duplicateWidget,
  clearCanvas,
  loadWidgets,
  setCanvasSize,
  toggleCanvasSizeLock,
  toggleGridSnap,
  setSnapSize,
  setZoom,
  bringToFront,
  sendToBack,
  setPanOffset,
  toggleRulers,
  toggleGrid,
  setGridSize,
  resetView,
  selectMultipleWidgets,
  addToSelection,
  removeFromSelection,
  clearSelection,
  setMultiSelecting,
  setSelectionBox,
  groupWidgets,
  moveWidgetToContainer,
} = canvasSlice.actions;

export default canvasSlice.reducer;