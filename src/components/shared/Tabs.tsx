/**
 * Tabs component - Switch between Map and Table views
 */

import React from 'react';
import type { ViewMode } from '../../types';
import { useWidgetStore } from '../../stores/widgetStore';

interface Tab {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'map',
    label: 'Map',
    icon: (
      <svg className="lmw-w-5 lmw-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    id: 'table',
    label: 'Table',
    icon: (
      <svg className="lmw-w-5 lmw-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

export const Tabs: React.FC = () => {
  const { currentView, setCurrentView } = useWidgetStore();

  return (
    <div
      className="lmw-select-none lmw-flex lmw-border-b lmw-border-gray-200 dark:lmw-border-gray-700 lmw-bg-white dark:lmw-bg-gray-900"
      role="tablist"
      aria-label="View options"
    >
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            id={`${tab.id}-tab`}
            onClick={() => setCurrentView(tab.id)}
            className={`
              lmw-flex-1 lmw-flex lmw-items-center lmw-justify-center lmw-gap-2
              lmw-px-4 lmw-py-3 lmw-text-sm lmw-font-medium lmw-transition-all lmw-duration-200
              lmw-border-b-2 lmw-relative lmw-cursor-pointer
              ${
                isActive
                  ? 'lmw-border-primary lmw-text-primary dark:lmw-text-blue-400 lmw-bg-blue-50/50 dark:lmw-bg-blue-900/10'
                  : 'lmw-border-transparent lmw-text-gray-600 dark:lmw-text-gray-400 hover:lmw-text-gray-900 dark:hover:lmw-text-gray-200 hover:lmw-border-gray-300 dark:hover:lmw-border-gray-600 hover:lmw-bg-gray-50 dark:hover:lmw-bg-gray-800'
              }
              focus-visible:lmw-outline-none focus-visible:lmw-ring-2 focus-visible:lmw-ring-primary focus-visible:lmw-ring-inset focus-visible:lmw-z-10
            `}
          >
            {/* Icon */}
            <span className="lmw-flex-shrink-0 lmw-flex lmw-items-center lmw-justify-center">{tab.icon}</span>

            {/* Label */}
            <span className="lmw-hidden sm:lmw-inline lmw-text-sm lmw-font-medium lmw-whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
