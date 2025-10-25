/**
 * TableView component - Table/list view of locations
 */

import React from 'react';
import { DataTable } from './DataTable';

export const TableView: React.FC = () => {
  return (
    <div className="lmw-w-full lmw-h-full lmw-overflow-hidden lmw-bg-white dark:lmw-bg-gray-900">
      <DataTable />
    </div>
  );
};
