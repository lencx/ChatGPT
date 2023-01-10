import { useState } from 'react';
import { Table } from 'antd';
import { path, shell } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useColumns from '@/hooks/useColumns';
import useTable, { TABLE_PAGINATION } from '@/hooks/useTable';
import { chatRoot } from '@/utils';
import { syncColumns } from './config';
import './index.scss';

export default function SyncPrompts() {
  const { rowSelection, selectedRowIDs } = useTable();
  const [downloadPath, setDownloadPath] = useState('');
  const { columns, ...opInfo } = useColumns(syncColumns());

  useInit(async () => {
    setDownloadPath(await path.join(await chatRoot(), 'download'));
  });

  return (
    <div>
      <div className="chat-table-tip">
        <div className="chat-file-path">
          <div>PATH: <a onClick={() => shell.open(downloadPath)} title={downloadPath}>{downloadPath}</a></div>
        </div>
      </div>
      <Table
        rowKey="name"
        columns={columns}
        scroll={{ x: 'auto' }}
        dataSource={[]}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
      />
    </div>
  )
}