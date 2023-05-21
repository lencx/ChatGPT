import { useState, useRef, useEffect } from 'react';
import { Table, Modal, Button, message } from 'antd';
import { invoke, path, fs } from '@tauri-apps/api';

import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import { TABLE_PAGINATION } from '@/hooks/useTable';
import useChatPrompt, { useCachePrompt } from '@/hooks/useChatPrompt';
import { CHAT_PROMPT_JSON, chatRoot, readJSON, genCmd } from '@/utils';
import { syncColumns, getPath } from './config';
import SyncForm from './Form';

const fmtData = (data: Record<string, any>[] = []) =>
  (Array.isArray(data) ? data : []).map((i) => ({
    ...i,
    cmd: i.cmd ? i.cmd : genCmd(i.act),
    tags: ['user-sync'],
    enable: true,
  }));

export default function SyncCustom() {
  const [isVisible, setVisible] = useState(false);
  const { promptData, promptSet } = useChatPrompt('sync_custom', CHAT_PROMPT_JSON);
  const { promptCacheCmd, promptCacheSet } = useCachePrompt();
  const { opData, opInit, opAdd, opRemove, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(syncColumns());
  const formRef = useRef<any>(null);

  const hide = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  useEffect(() => {
    if (promptData.length <= 0) return;
    opInit(promptData);
  }, [promptData]);

  useEffect(() => {
    if (!opInfo.opType) return;
    if (opInfo.opType === 'sync') {
      const filename = `${opInfo?.opRecord?.id}.json`;
      handleSync(filename).then((isOk: boolean) => {
        opInfo.resetRecord();
        if (!isOk) return;
        const data = opReplace(opInfo?.opRecord?.[opSafeKey], {
          ...opInfo?.opRecord,
          last_updated: Date.now(),
        });
        promptSet(data);
        opInfo.resetRecord();
      });
    }
    if (['edit', 'new'].includes(opInfo.opType)) {
      setVisible(true);
    }
    if (['delete'].includes(opInfo.opType)) {
      (async () => {
        try {
          const file = await path.join(
            await chatRoot(),
            'cache_prompts',
            `${opInfo?.opRecord?.id}.json`,
          );
          await fs.removeFile(file);
        } catch (e) {}
        const data = opRemove(opInfo?.opRecord?.[opSafeKey]);
        promptSet(data);
        opInfo.resetRecord();
        promptCacheCmd();
      })();
    }
  }, [opInfo.opType, formRef]);

  const handleSync = async (filename: string) => {
    const record = opInfo?.opRecord;
    const isJson = /json$/.test(record?.ext);
    const file = await path.join(await chatRoot(), 'cache_prompts', filename);
    const filePath = await getPath(record);

    // https or http
    if (/^http/.test(record?.protocol)) {
      const data = await invoke('sync_user_prompts', { url: filePath, dataType: record?.ext });
      if (data) {
        await promptCacheSet(data as [], file);
        await promptCacheCmd();
        message.success('ChatGPT Prompts data has been synchronized!');
        return true;
      } else {
        message.error('ChatGPT Prompts data sync failed, please try again!');
        return false;
      }
    }
    // local
    if (isJson) {
      // parse json
      const data = await readJSON(filePath, { isRoot: true });
      await promptCacheSet(fmtData(data), file);
    } else {
      // parse csv
      const data = await fs.readTextFile(filePath);
      const list: Record<string, string>[] = await invoke('parse_prompt', { data });
      await promptCacheSet(fmtData(list), file);
    }
    await promptCacheCmd();
    return true;
  };

  const handleOk = () => {
    formRef.current?.form?.validateFields().then(async (vals: Record<string, any>) => {
      const file = await readFile(vals?.file?.file?.originFileObj);
      vals.file = file;

      if (opInfo.opType === 'new') {
        const data = opAdd(vals);
        promptSet(data);
        message.success('Data added successfully');
      }
      if (opInfo.opType === 'edit') {
        const data = opReplace(opInfo?.opRecord?.[opSafeKey], vals);
        promptSet(data);
        message.success('Data updated successfully');
      }
      hide();
    });
  };

  return (
    <div>
      <Button
        style={{ marginBottom: 10 }}
        className="chat-add-btn"
        type="primary"
        onClick={opInfo.opNew}
      >
        Add Prompt
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
        title="Add Prompt"
        onOk={handleOk}
        destroyOnClose
        maskClosable={false}
      >
        <SyncForm ref={formRef} record={opInfo?.opRecord} type={opInfo.opType} />
      </Modal>
    </div>
  );
}

function readFile(file: File) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e: any) => resolve(e.target.result);
    reader.onerror = (e: any) => reject(e.target.error);
    reader.readAsText(file);
  });
}
