import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TemplatesState, ITemplate } from '../../types';

const initialState: TemplatesState = {
  templates: [],
  currentTemplateId: null,
  loading: false,
  error: null,
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addTemplate: (state, action: PayloadAction<ITemplate>) => {
      state.templates.unshift(action.payload); // Add to beginning for recency
    },

    updateTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<ITemplate> }>) => {
      const { id, updates } = action.payload;
      const templateIndex = state.templates.findIndex(t => t.id === id);
      if (templateIndex !== -1) {
        state.templates[templateIndex] = {
          ...state.templates[templateIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
      if (state.currentTemplateId === action.payload) {
        state.currentTemplateId = null;
      }
    },

    duplicateTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find(t => t.id === action.payload);
      if (template) {
        const duplicate: ITemplate = {
          ...template,
          id: `${template.id}_copy_${Date.now()}`,
          name: `${template.name} (копия)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.templates.unshift(duplicate);
      }
    },

    setCurrentTemplate: (state, action: PayloadAction<string | null>) => {
      state.currentTemplateId = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearTemplates: (state) => {
      state.templates = [];
      state.currentTemplateId = null;
    },

    sortTemplates: (state, action: PayloadAction<'name' | 'date' | 'updated'>) => {
      const sortBy = action.payload;
      state.templates.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'date':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'updated':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default:
            return 0;
        }
      });
    },
  },
});

export const {
  addTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  setCurrentTemplate,
  setLoading,
  setError,
  clearTemplates,
  sortTemplates,
} = templatesSlice.actions;

export default templatesSlice.reducer;