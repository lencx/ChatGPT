import { useRef, useEffect, useState } from 'react';
import { Table, Modal, Popconfirm, Button, message } from 'antd';

import useJson from '@/hooks/useJson';
import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import FilePath from '@/components/FilePath';
import { CHAT_AWESOME_JSON } from '@/utils';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { awesomeColumns } from './config';
import AwesomeForm from './Form';

export default function Awesome() {
  const formRef = useRef<any>(null);
  const [isVisible, setVisible] = useState(false);
  const { opData, opInit, opAdd, opReplace, opReplaceItems, opRemove, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(awesomeColumns());
  const { rowSelection, selectedRowIDs } = useTableRowSelection();
  const { json, updateJson } = useJson<any[]>(CHAT_AWESOME_JSON);
  const selectedItems = rowSelection.selectedRowKeys || [];

  useEffect(() => {
    if (!json || json.length <= 0) return;
    opInit(json);
  }, [json?.length]);

  useEffect(() => {
    if (!opInfo.opType) return;
    if (['edit', 'new'].includes(opInfo.opType)) {
      setVisible(true);
    }
    if (['delete'].includes(opInfo.opType)) {
      const data = opRemove(opInfo?.opRecord?.[opSafeKey]);
      updateJson(data);
      opInfo.resetRecord();
    }
  }, [opInfo.opType,

    formRef]);

  const hide = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      updateJson(data);
    }
  }, [opInfo.opTime]);

  const handleDelete = () => {};

  const handleOk = () => {
    formRef.current?.form?.validateFields().then(async (vals: Record<string, any>) => {
      if (opInfo.opType === 'new') {
        const data = opAdd(vals);
        await updateJson(data);
        opInit(data);
        message.success('Data added successfully');
      }
      if (opInfo.opType === 'edit') {
        const data = opReplace(opInfo?.opRecord?.[opSafeKey], vals);
        await updateJson(data);
        message.success('Data updated successfully');
      }
      hide();
    });
  };

  const handleEnable = (isEnable: boolean) => {
    const data = opReplaceItems(selectedRowIDs, { enable: isEnable });
    updateJson(data);
  };

  const modalTitle = `${{ new: 'Create', edit: 'Edit' }[opInfo.opType]} URL`;

  return (
    <div>
      <div className="chat-table-btns">
        <Button className="chat-add-btn" type="primary" onClick={opInfo.opNew}>
          Add URL
        </Button>
        <div>
          {selectedItems.length > 0 && (
            <>
              <Button type="primary" onClick={() => handleEnable(true)}>
                Enable
              </Button>
              <Button onClick={() => handleEnable(false)}>Disable</Button>
              <Popconfirm
                overlayStyle={{ width: 250 }}
                title="URLs cannot be recovered after deletion, are you sure you want to delete them?"
                placement="topLeft"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button>Delete</Button>
              </Popconfirm>
              <span className="num">Selected {selectedItems.length} items</span>
            </>
          )}
        </div>
      </div>
      <FilePath paths={CHAT_AWESOME_JSON} />
      <Table
        rowKey="url"
        columns={columns}
        scroll={{ x: 800 }}
        dataSource={opData}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
      />
      <Modal
        open={isVisible}
        title={modalTitle}
        onCancel={hide}
        onOk={handleOk}
        destroyOnClose
        maskClosable={false}
      >
        <AwesomeForm ref={formRef} record={opInfo?.opRecord} />
      </Modal>
    </div>
  );
}
