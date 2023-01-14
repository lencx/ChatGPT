import React, { useState } from 'react';
import { Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';

import { safeKey } from '@/hooks/useData';

type rowSelectionOptions = {
  key: 'id' | string;
  rowType: 'id' | 'row' | 'all';
}
export function useTableRowSelection(options: Partial<rowSelectionOptions> = {}) {
  const { key = 'id', rowType = 'id' } = options;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowIDs, setSelectedRowIDs] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string|symbol, any>[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: Record<string|symbol, any>[]) => {
    const keys = newSelectedRows.map((i: any) => i[safeKey] || i[key]);
    setSelectedRowKeys(newSelectedRowKeys);
    if (rowType === 'id') {
      setSelectedRowIDs(keys);
    }
    if (rowType === 'row') {
      setSelectedRows(newSelectedRows);
    }
    if (rowType === 'all') {
      setSelectedRowIDs(keys);
      setSelectedRows(newSelectedRows);
    }
  };

  const rowReset = () => {
    setSelectedRowKeys([]);
    setSelectedRowIDs([]);
    setSelectedRows([]);
  };

  const rowSelection: TableRowSelection<Record<string, any>> = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  return { rowSelection, selectedRowIDs, selectedRows, rowReset };
}

export const TABLE_PAGINATION = {
  hideOnSinglePage: true,
  showSizeChanger: true,
  showQuickJumper: true,
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 15, 20],
  showTotal: (total: number) => <span>Total {total} items</span>,
};