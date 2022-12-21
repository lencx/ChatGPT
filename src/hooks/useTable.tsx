import React, { useState } from 'react';
import { Table } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';

import { safeKey } from '@/hooks/useData';

export default function useTableRowSelection() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowIDs, setSelectedRowIDs] = useState<string[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: Record<string|symbol, any>) => {
    const keys = selectedRows.map((i: any) => i[safeKey]);
    setSelectedRowIDs(keys);
    setSelectedRowKeys(newSelectedRowKeys);
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

  return { rowSelection, selectedRowIDs };
}

export const TABLE_PAGINATION = {
  hideOnSinglePage: true,
  showSizeChanger: true,
  showQuickJumper: true,
  defaultPageSize: 5,
  pageSizeOptions: [5, 10, 15, 20],
  showTotal: (total: number) => <span>Total {total} items</span>,
};