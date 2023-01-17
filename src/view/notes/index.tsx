import { useEffect, useState } from 'react';
import { Table, Modal, Popconfirm, Button, message } from 'antd';
import { invoke, path, fs } from '@tauri-apps/api';

import useJson from '@/hooks/useJson';
import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import Markdown from '@/components/Markdown';
import FilePath from '@/components/FilePath';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { chatRoot, CHAT_NOTES_JSON } from '@/utils';
import { notesColumns } from './config';

export default function Notes() {
  const [source, setSource] = useState('');
  const [isVisible, setVisible] = useState(false);
  const { opData, opInit, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(notesColumns());
  const { rowSelection, selectedRows, rowReset } = useTableRowSelection({ rowType: 'row' });
  const { json, refreshJson, updateJson } = useJson<any[]>(CHAT_NOTES_JSON);
  const selectedItems = rowSelection.selectedRowKeys || [];

  useEffect(() => {
    if (!json || json.length <= 0) return;
    opInit(json);
  }, [json?.length]);

  useEffect(() => {
    if (!opInfo.opType) return;
    (async () => {
      const record = opInfo?.opRecord;
      const file = await path.join(await chatRoot(), 'notes', `${record?.id}.${record?.ext}`);
      if (opInfo.opType === 'preview') {
        const data = await fs.readTextFile(file);
        setSource(data);
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
      const notesDir = await path.join(await chatRoot(), 'notes');
      await fs.removeDir(notesDir, { recursive: true });
      await handleRefresh();
      message.success('All files have been cleared!');
      return;
    }

    const rows = selectedRows.map(async (i) => {
      const file = await path.join(await chatRoot(), 'notes', `${i?.id}.${i?.ext}`);
      await fs.removeFile(file);
      return file;
    })
    Promise.all(rows).then(async () => {
      await handleRefresh();
      message.success('All files selected are cleared!');
    });
  };

  const handleRefresh = async () => {
    await invoke('download_list', { pathname: CHAT_NOTES_JSON, dir: 'notes' });
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
      <FilePath paths={CHAT_NOTES_JSON} />
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
        width={600}
      >
        <Markdown children={source} />
      </Modal>
    </div>
  )
}