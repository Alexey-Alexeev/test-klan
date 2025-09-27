import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { historyMiddleware } from '../middleware/historyMiddleware';

// Import slices
import canvasSlice from '../features/canvas/canvasSlice';
import templatesSlice from '../features/templates/templatesSlice';
import appSlice from '../features/app/appSlice';
import historySlice from '../features/history/historySlice';
import widgetBuilderSlice from '../features/widgetBuilder/widgetBuilderSlice';

const persistConfig = {
  key: 'main-builder',
  storage,
  whitelist: ['canvas', 'templates', 'widgetBuilder'], // Only persist canvas, templates and widgetBuilder
};

const rootReducer = combineReducers({
  canvas: canvasSlice,
  templates: templatesSlice,
  app: appSlice,
  history: historySlice,
  widgetBuilder: widgetBuilderSlice,
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