import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CanvasState, IWidget, IPosition, ISize } from '../../types';

const initialState: CanvasState = {
  widgets: [],
  selectedWidgetId: null,
  selectedWidgetIds: [],
  canvasSize: { width: 1200, height: 800 },
  gridSnap: true,
  snapSize: 8,
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
      state.widgets.push(action.payload);
      state.selectedWidgetId = action.payload.id;
    },
    
    updateWidget: (state, action: PayloadAction<{ id: string; updates: Partial<IWidget> }>) => {
      const { id, updates } = action.payload;
      const widgetIndex = state.widgets.findIndex(w => w.id === id);
      if (widgetIndex !== -1) {
        Object.assign(state.widgets[widgetIndex], updates);
      }
    },

    updateWidgetPosition: (state, action: PayloadAction<{ id: string; position: IPosition }>) => {
      const { id, position } = action.payload;
      const widget = state.widgets.find(w => w.id === id);
      if (widget) {
        widget.position = position;
      }
    },

    updateWidgetSize: (state, action: PayloadAction<{ id: string; size: ISize }>) => {
      const { id, size } = action.payload;
      const widget = state.widgets.find(w => w.id === id);
      if (widget) {
        widget.size = size;
      }
    },

    selectWidget: (state, action: PayloadAction<string | null>) => {
      state.selectedWidgetId = action.payload;
    },

    deleteWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter(w => w.id !== action.payload);
      if (state.selectedWidgetId === action.payload) {
        state.selectedWidgetId = null;
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
      }
    },

    clearCanvas: (state) => {
      state.widgets = [];
      state.selectedWidgetId = null;
    },

    loadWidgets: (state, action: PayloadAction<IWidget[]>) => {
      state.widgets = action.payload;
      state.selectedWidgetId = null;
    },

    setCanvasSize: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.canvasSize = action.payload;
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
        },
      };
      
      // Update widget positions relative to container
      widgets.forEach(widget => {
        widget.position.x -= minX;
        widget.position.y -= minY;
        widget.zIndex = containerWidget.zIndex + 1;
      });
      
      // Add container and update selection
      state.widgets.push(containerWidget);
      state.selectedWidgetId = containerWidget.id;
      state.selectedWidgetIds = [containerWidget.id];
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
} = canvasSlice.actions;

export default canvasSlice.reducer;