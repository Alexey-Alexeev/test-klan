import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../types';

const initialState: AppState = {
  activeTab: 'builder',
  viewMode: 'design',
  isPropertiesPanelOpen: true,
  sidebarCollapsed: false,
  zoomLevel: 100,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'builder' | 'widgetBuilder' | 'widgets' | 'templates'>) => {
      state.activeTab = action.payload;
    },

    setViewMode: (state, action: PayloadAction<'design' | 'json'>) => {
      state.viewMode = action.payload;
    },

    togglePropertiesPanel: (state) => {
      state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen;
    },
    
    setPropertiesPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isPropertiesPanelOpen = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Zoom actions
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = Math.max(25, Math.min(300, action.payload)); // Ограничиваем зум от 25% до 300%
    },

    zoomIn: (state) => {
      const newZoom = Math.min(300, state.zoomLevel + 10);
      state.zoomLevel = newZoom;
    },

    zoomOut: (state) => {
      const newZoom = Math.max(25, state.zoomLevel - 10);
      state.zoomLevel = newZoom;
    },

    resetZoom: (state) => {
      state.zoomLevel = 100;
    },
  },
});

export const {
  setActiveTab,
  setViewMode,
  togglePropertiesPanel,
  setPropertiesPanelOpen,
  setSidebarCollapsed,
  setZoomLevel,
  zoomIn,
  zoomOut,
  resetZoom,
} = appSlice.actions;

export default appSlice.reducer;