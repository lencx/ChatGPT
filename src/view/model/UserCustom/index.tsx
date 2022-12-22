import { useState, useRef, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import { invoke } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useData from '@/hooks/useData';
import useChatModel from '@/hooks/useChatModel';
import useColumns from '@/hooks/useColumns';
import { TABLE_PAGINATION } from '@/hooks/useTable';
import { chatModelPath } from '@/utils';
import { modelColumns } from './config';
import UserCustomForm from './Form';
import './index.scss';

export default function LanguageModel() {
  const [isVisible, setVisible] = useState(false);
  const [modelPath, setChatModelPath] = useState('');
  const { modelData, modelSet } = useChatModel('user_custom');
  const { opData, opInit, opAdd, opRemove, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(modelColumns());
  const formRef = useRef<any>(null);

  useEffect(() => {
    if (modelData.length <= 0) return;
    opInit(modelData);
  }, [modelData]);

  useEffect(() => {
    if (!opInfo.opType) return;
    if (['edit', 'new'].includes(opInfo.opType)) {
      setVisible(true);
    }
    if (['delete'].includes(opInfo.opType)) {
      const data = opRemove(opInfo?.opRecord?.[opSafeKey]);
      modelSet(data);
      opInfo.resetRecord();
    }
  }, [opInfo.opType, formRef]);

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      modelSet(data);
    }
  }, [opInfo.opTime])

  useInit(async () => {
    const path = await chatModelPath();
    setChatModelPath(path);
  })

  const hide = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  const handleOk = () => {
    formRef.current?.form?.validateFields()
      .then((vals: Record<string, any>) => {
        if (modelData.map((i: any) => i.cmd).includes(vals.cmd) && opInfo?.opRecord?.cmd !== vals.cmd) {
          message.warning(`"cmd: /${vals.cmd}" already exists, please change the "${vals.cmd}" name and resubmit.`);
          return;
        }
        let data = [];
        switch (opInfo.opType) {
          case 'new': data = opAdd(vals); break;
          case 'edit': data = opReplace(opInfo?.opRecord?.[opSafeKey], vals); break;
          default: break;
        }
        modelSet(data);
        opInfo.setExtra(Date.now());
        hide();
      })
  };

  const handleOpenFile = () => {
    invoke('open_file', { path: modelPath });
  };

  const modalTitle = `${({ new: 'Create', edit: 'Edit' })[opInfo.opType]} Model`;

  return (
    <div>
      <Button className="add-btn" type="primary" onClick={opInfo.opNew}>Add Model</Button>
      <div className="chat-model-path">PATH: <span onClick={handleOpenFile}>{modelPath}</span></div>
      <Table
        key={opInfo.opExtra}
        rowKey="cmd"
        columns={columns}
        scroll={{ x: 'auto' }}
        dataSource={opData}
        pagination={TABLE_PAGINATION}
      />
      <Modal
        open={isVisible}
        onCancel={hide}
        title={modalTitle}
        onOk={handleOk}
        destroyOnClose
        maskClosable={false}
      >
        <UserCustomForm record={opInfo?.opRecord} ref={formRef} />
      </Modal>
    </div>
  )
}