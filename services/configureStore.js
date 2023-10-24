import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { cryptoapi } from './cryptoapi';
import { cryptoNewsApi } from './cryptonewsapi';

export default configureStore({
  reducer: {
    [cryptoapi.reducerPath]: cryptoapi.reducer,
    [cryptoNewsApi.reducerPath]: cryptoNewsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cryptoapi.middleware).concat(cryptoNewsApi.middleware),
});