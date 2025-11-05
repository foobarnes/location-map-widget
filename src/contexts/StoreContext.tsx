import React, { createContext, useContext } from 'react';
import type { WidgetStore } from '../stores/widgetStore';
import type { WidgetState } from '../types';

/**
 * Context for providing widget store instance to components
 * Enables multiple independent widget instances with isolated state
 */
const StoreContext = createContext<WidgetStore | null>(null);

/**
 * Provider component for widget store
 */
export function StoreProvider({
  store,
  children,
}: {
  store: WidgetStore;
  children: React.ReactNode;
}) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

/**
 * Hook to access the widget store from context
 * @throws Error if used outside of StoreProvider
 */
export function useStore(): WidgetStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}

/**
 * Hook to access widget state with selector
 * @param selector - Function to select specific state slice
 * @returns Selected state
 *
 * @example
 * const locations = useWidgetState(state => state.locations);
 * const { loading, error } = useWidgetState(state => ({ loading: state.loading, error: state.error }));
 */
export function useWidgetState<T>(selector: (state: WidgetState) => T): T {
  const store = useStore();
  return store(selector);
}

/**
 * Hook to access the entire widget state
 * Use sparingly as it will cause re-renders on any state change
 */
export function useWidgetStore(): WidgetState {
  const store = useStore();
  return store();
}
