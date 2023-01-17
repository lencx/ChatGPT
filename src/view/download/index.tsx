import { useEffect, useState } from 'react';
import { Table, Modal, Popconfirm, Button, message } from 'antd';
import { invoke, path, fs } from '@tauri-apps/api';

import useJson from '@/hooks/useJson';
import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import FilePath from '@/components/FilePath';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { chatRoot, CHAT_DOWNLOAD_JSON } from '@/utils';
import { downloadColumns } from './config';

function renderFile(buff: Uint8Array, type: string) {
  const renderType = {
    pdf: 'application/pdf',
    png: 'image/png',
  }[type];
  return URL.createObjectURL(new Blob([buff], { type: renderType }));
}

export default function Download() {
  const [source, setSource] = useState('');
  const [isVisible, setVisible] = useState(false);
  const { opData, opInit, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(downloadColumns());
  const { rowSelection, selectedRows, rowReset } = useTableRowSelection({ rowType: 'row' });
  const { json, refreshJson, updateJson } = useJson<any[]>(CHAT_DOWNLOAD_JSON);
  const selectedItems = rowSelection.selectedRowKeys || [];

  useEffect(() => {
    if (!json || json.length <= 0) return;
    opInit(json);
  }, [json?.length]);

  useEffect(() => {
    if (!opInfo.opType) return;
    (async () => {
      const record = opInfo?.opRecord;
      const isImg = ['png'].includes(record?.ext);
      const file = await path.join(await chatRoot(), 'download', isImg ? 'img' : record?.ext, `${record?.id}.${record?.ext}`);
      if (opInfo.opType === 'preview') {
        const data = await fs.readBinaryFile(file);
        const sourceData = renderFile(data, record?.ext);
        setSource(sourceData);
        setVisible(true);
        return;
      }
      if (opInfo.opType === 'delete') {
        await fs.removeFile(file);
        await handleRefresh();
      }
      if (opInfo.opType === 'rowedit') {
        const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
        await updateJson(data);
        message.success('Name has been changed!');
      }
      opInfo.resetRecord();
    })()
  }, [opInfo.opType])

  const handleDelete = async () => {
    if (opData?.length === selectedRows.length) {
      const downloadDir = await path.join(await chatRoot(), 'download');
      await fs.removeDir(downloadDir, { recursive: true });
      await handleRefresh();
      message.success('All files have been cleared!');
      return;
    }

    const rows = selectedRows.map(async (i) => {
      const isImg = ['png'].includes(i?.ext);
      const file = await path.join(await chatRoot(), 'download', isImg ? 'img' : i?.ext, `${i?.id}.${i?.ext}`);
      await fs.removeFile(file);
      return file;
    })
    Promise.all(rows).then(async () => {
      await handleRefresh();
      message.success('All files selected are cleared!');
    });
  };

  const handleRefresh = async () => {
    await invoke('download_list', { pathname: CHAT_DOWNLOAD_JSON, dir: 'download' });
    rowReset();
    const data = await refreshJson();
    opInit(data);
  };

  const handleCancel = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  return (
    <div>
      <div className="chat-table-btns">
        <div>
          {selectedItems.length > 0 && (
            <>
              <Popconfirm
                overlayStyle={{ width: 250 }}
                title="Files cannot be recovered after deletion, are you sure you want to delete them?"
                placement="topLeft"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button>Batch delete</Button>
              </Popconfirm>
              <span className="num">Selected {selectedItems.length} items</span>
            </>
          )}
        </div>
      </div>
      <FilePath paths={CHAT_DOWNLOAD_JSON} />
      <Table
        rowKey="id"
        columns={columns}
        scroll={{ x: 800 }}
        dataSource={opData}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
      />
      <Modal
        open={isVisible}
        title={<div>{opInfo?.opRecord?.name || ''}</div>}
        onCancel={handleCancel}
        footer={false}
        destroyOnClose
      >
        <img style={{ maxWidth: '100%' }} src={source} />
      </Modal>
    </div>
  )
}