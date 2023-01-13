import { useEffect, useState } from 'react';
import { Table, Modal } from 'antd';
import { path, shell, fs } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useJson from '@/hooks/useJson';
import useColumns from '@/hooks/useColumns';
import useTable, { TABLE_PAGINATION } from '@/hooks/useTable';
import { chatRoot, CHAT_DOWNLOAD_JSON } from '@/utils';
import { syncColumns } from './config';
import './index.scss';

function renderFile(buff: Uint8Array, type: string) {
  const renderType = {
    pdf: 'application/pdf',
    png: 'image/png',
  }[type];
  return URL.createObjectURL(new Blob([buff], { type: renderType }));
}

export default function SyncPrompts() {
  const { rowSelection, selectedRowIDs } = useTable();
  const { columns, ...opInfo } = useColumns(syncColumns());
  const [downloadPath, setDownloadPath] = useState('');
  const { json } = useJson<any[]>(CHAT_DOWNLOAD_JSON);
  const [source, setSource] = useState('');
  const [isVisible, setVisible] = useState(false);

  useInit(async () => {
    const file = await path.join(await chatRoot(), 'chat.download.json');
    setDownloadPath(file);
  });

  useEffect(() => {
    if (!opInfo.opType) return;
    (async () => {
      const record = opInfo?.opRecord;
      const isImg = ['png'].includes(record?.ext);
      const file = await path.join(await chatRoot(), 'download', isImg ? 'img' : record?.ext, `${record?.id}.${record?.ext}`);
      if (opInfo.opType === 'view') {
        const data = await fs.readBinaryFile(file);
        const sourceData = renderFile(data, record?.ext);
        setSource(sourceData);
        setVisible(true);
      }
      opInfo.resetRecord();
    })()
  }, [opInfo.opType])

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
        dataSource={json}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
      />
      <Modal
        open={isVisible}
        onCancel={() => setVisible(false)}
        footer={false}
        destroyOnClose
      >
        <img style={{ maxWidth: '100%' }} src={source} />
      </Modal>
    </div>
  )
}