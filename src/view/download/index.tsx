import { useState } from 'react';
import { Table } from 'antd';
import { path, shell } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useColumns from '@/hooks/useColumns';
import useTable, { TABLE_PAGINATION } from '@/hooks/useTable';
import { chatRoot, readJSON } from '@/utils';
import { syncColumns } from './config';
import './index.scss';

export default function SyncPrompts() {
  const { rowSelection, selectedRowIDs } = useTable();
  const [downloadPath, setDownloadPath] = useState('');
  const [downloadData, setDownloadData] = useState([]);
  const { columns, ...opInfo } = useColumns(syncColumns());

  useInit(async () => {
    const file = await path.join(await chatRoot(), 'chat.download.json');
    setDownloadPath(file);
    const data = await readJSON(file, { isRoot: true, isList: true });
    setDownloadData(data);
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
        dataSource={downloadData}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
      />
    </div>
  )
}