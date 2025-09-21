import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../types';

const initialState: AppState = {
  activeTab: 'builder',
  viewMode: 'design',
  isPropertiesPanelOpen: true,
  sidebarCollapsed: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'builder' | 'widgets' | 'templates'>) => {
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
  },
});

export const {
  setActiveTab,
  setViewMode,
  togglePropertiesPanel,
  setPropertiesPanelOpen,
  setSidebarCollapsed,
} = appSlice.actions;

export default appSlice.reducer;