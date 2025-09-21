import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { historyMiddleware } from '../middleware/historyMiddleware';

// Import slices
import canvasSlice from '../features/canvas/canvasSlice';
import templatesSlice from '../features/templates/templatesSlice';
import appSlice from '../features/app/appSlice';
import historySlice from '../features/history/historySlice';

const persistConfig = {
  key: 'main-builder',
  storage,
  whitelist: ['canvas', 'templates'], // Only persist canvas and templates
};

const rootReducer = combineReducers({
  canvas: canvasSlice,
  templates: templatesSlice,
  app: appSlice,
  history: historySlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(historyMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;