import { useState, useRef, useEffect } from 'react';
import { Table, Modal, Button, message } from 'antd';
import { invoke, http, path, fs } from '@tauri-apps/api';

import useData from '@/hooks/useData';
import useChatModel from '@/hooks/useChatModel';
import useColumns from '@/hooks/useColumns';
import { TABLE_PAGINATION } from '@/hooks/useTable';
import { CHAT_MODEL_SYNC_JSON, chatRoot, writeJSON, readJSON, genCmd } from '@/utils';
import { pathColumns, getPath } from './config';
import SyncForm from './Form';
import './index.scss';

const setTag = (data: Record<string, any>[]) => data.map((i) => ({ ...i, tags: ['user-sync'], enable: true }))

export default function SyncMore() {
  const [isVisible, setVisible] = useState(false);
  // const [modelPath, setChatModelPath] = useState('');
  const { modelData, modelSet } = useChatModel('sync_url', CHAT_MODEL_SYNC_JSON);
  const { opData, opInit, opAdd, opRemove, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(pathColumns());
  const formRef = useRef<any>(null);

  const hide = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  useEffect(() => {
    if (modelData.length <= 0) return;
    opInit(modelData);
  }, [modelData]);

  useEffect(() => {
    if (!opInfo.opType) return;
    if (opInfo.opType === 'sync') {
      const filename = `${opInfo?.opRecord?.id}.json`;
      handleSync(filename).then(() => {
        const data = opReplace(opInfo?.opRecord?.[opSafeKey], { ...opInfo?.opRecord, last_updated: Date.now() });
        console.log('«38» /model/SyncMore/index.tsx ~> ', data);

        modelSet(data);
        opInfo.resetRecord();
      });
    }
    if (['edit', 'new'].includes(opInfo.opType)) {
      setVisible(true);
    }
    if (['delete'].includes(opInfo.opType)) {
      const data = opRemove(opInfo?.opRecord?.[opSafeKey]);
      modelSet(data);
      opInfo.resetRecord();
    }
  }, [opInfo.opType, formRef]);

  const handleSync = async (filename: string) => {
    const record = opInfo?.opRecord;
    const isJson = /json$/.test(record?.ext);
    const file = await path.join(await chatRoot(), 'cache_sync', filename);
    const filePath = await getPath(record);

    // https or http
    if (/^http/.test(record?.protocol)) {
      const res = await http.fetch(filePath, {
        method: 'GET',
        responseType: isJson ? 1 : 2,
      });
      if (res.ok) {
        if (isJson) {
          // parse json
          writeJSON(file, setTag(Array.isArray(res?.data) ? res?.data : []), { isRoot: true, dir: 'cache_sync' });
        } else {
          // parse csv
          const list: Record<string, string>[] = await invoke('parse_prompt', { data: res?.data });
          const fmtList = list.map(i => ({ ...i, cmd: i.cmd ? i.cmd : genCmd(i.act), enable: true, tags: ['user-sync'] }));
          await writeJSON(file, fmtList, { isRoot: true, dir: 'cache_sync' });
        }
        message.success('ChatGPT Prompts data has been synchronized!');
      } else {
        message.error('ChatGPT Prompts data sync failed, please try again!');
      }
      return;
    }
    // local
    if (isJson) {
      // parse json
      const data = await readJSON(filePath, { isRoot: true });
      await writeJSON(file, setTag(Array.isArray(data) ? data : []), { isRoot: true, dir: 'cache_sync' });
    } else {
      // parse csv
      const data = await fs.readTextFile(filePath);
      const list: Record<string, string>[] = await invoke('parse_prompt', { data });
      const fmtList = list.map(i => ({ ...i, cmd: i.cmd ? i.cmd : genCmd(i.act), enable: true, tags: ['user-sync'] }));
      await writeJSON(file, fmtList, { isRoot: true, dir: 'cache_sync' });
    }
  };

  const handleOk = () => {
    formRef.current?.form?.validateFields()
      .then((vals: Record<string, any>) => {
        let data = [];
        switch (opInfo.opType) {
          case 'new': data = opAdd(vals); break;
          case 'edit': data = opReplace(opInfo?.opRecord?.[opSafeKey], vals); break;
          default: break;
        }
        console.log('«95» /model/SyncMore/index.tsx ~> ', data);

        modelSet(data);
        opInfo.setExtra(Date.now());
        hide();
      })
  };

  return (
    <div>
      <Button
        className="add-btn"
        type="primary"
        onClick={opInfo.opNew}
      >
        Add PATH
      </Button>
      <Table
        key="id"
        rowKey="name"
        columns={columns}
        scroll={{ x: 800 }}
        dataSource={opData}
        pagination={TABLE_PAGINATION}
      />
      <Modal
        open={isVisible}
        onCancel={hide}
        title="Model PATH"
        onOk={handleOk}
        destroyOnClose
        maskClosable={false}
      >
        <SyncForm ref={formRef} record={opInfo?.opRecord} />
      </Modal>
    </div>
  )
}