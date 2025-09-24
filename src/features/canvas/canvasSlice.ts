import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasState, IWidget, IPosition, ISize } from '../../types';


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
      
      // Auto-lock canvas size when adding a container
      if (widget.type === 'container') {
        state.isCanvasSizeLocked = true;
      }
    },
    
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<IWidget> }>) => {
      const { id, updates } = action.payload;
      const widgetIndex = state.widgets.findIndex(w => w.id === id);
      if (widgetIndex !== -1) {
        const targetWidget = state.widgets[widgetIndex];
        Object.assign(targetWidget, updates);

      }
    },

    updateWidgetPosition: (state, action: PayloadAction<{ id: string; position: IPosition }>) => {
      const { id, position } = action.payload;
      const widget = state.widgets.find(w => w.id === id);
      if (widget) {
        let constrainedPosition = { ...position };
        
        // Clamp within canvas bounds
        const maxX = Math.max(0, state.canvasSize.width - widget.size.width);
        const maxY = Math.max(0, state.canvasSize.height - widget.size.height);
        
        constrainedPosition = {
          x: Math.min(Math.max(0, position.x), maxX),
          y: Math.min(Math.max(0, position.y), maxY),
        };
        
        widget.position = constrainedPosition;

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

      }
    },

    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidgetId = action.payload;
    },

    deleteWidget: (state, action: PayloadAction<string>) => {
      const rootId = action.payload;
      const toDeleteIds = new Set<string>();

      // Depth-first collect all descendants if container
      const collect = (id: string) => {
        const node = state.widgets.find(w => w.id === id);
        if (!node) return;
        toDeleteIds.add(id);
        if (node.type === 'container') {
          const container = node as any;
          const children: string[] = container.props?.children || [];
          children.forEach(childId => collect(childId));
        }
      };

      collect(rootId);

      // Remove references from any parent containers
      state.widgets.forEach(w => {
        if (w.type === 'container') {
          const container = w as any;
          const children: string[] = container.props?.children || [];
          if (children.length) {
            container.props.children = children.filter((id: string) => !toDeleteIds.has(id));
          }
        }
      });

      // Remove nodes
      state.widgets = state.widgets.filter(w => !toDeleteIds.has(w.id));

      // Clear selection if needed
      if (state.selectedWidgetId && toDeleteIds.has(state.selectedWidgetId)) {
        state.selectedWidgetId = null;
      }

      // Auto-unlock canvas size when all containers are deleted
      const hasContainers = state.widgets.some(w => w.type === 'container');
      if (!hasContainers) {
        state.isCanvasSizeLocked = false;
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
          let maxX = Math.max(0, state.canvasSize.width - widget.size.width);
          let maxY = Math.max(0, state.canvasSize.height - widget.size.height);
          
          // For containers, account for margin in bounds calculation
          if (widget.type === 'container') {
            const margin = typeof (widget as any).props.margin === 'object' 
              ? (widget as any).props.margin 
              : { top: 0, right: 0, bottom: 0, left: 0 };
            maxX = Math.max(0, state.canvasSize.width - widget.size.width - margin.left - margin.right);
            maxY = Math.max(0, state.canvasSize.height - widget.size.height - margin.top - margin.bottom);
          }
          
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
} = canvasSlice.actions;

export default canvasSlice.reducer;