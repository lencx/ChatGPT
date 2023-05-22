import { useState, useRef, useEffect } from 'react';
import { Table, Modal, Button, message } from 'antd';
import { invoke, path, fs, shell } from '@tauri-apps/api';

import useData from '@/hooks/useData';
import useInit from '@/hooks/useInit';
import useColumns from '@/hooks/useColumns';
import { TABLE_PAGINATION } from '@/hooks/useTable';
import useChatPrompt, { useCachePrompt } from '@/hooks/useChatPrompt';
import { CHAT_PROMPT_JSON, chatRoot, genCmd } from '@/utils';
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
  const [logPath, setLogPath] = useState('');
  const [isVisible, setVisible] = useState(false);
  const { promptData, promptSet, promptUpdate } = useChatPrompt('sync_custom', CHAT_PROMPT_JSON);
  const { promptCacheCmd, promptCacheSet } = useCachePrompt();
  const { opData, opInit, opAdd, opRemove, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(syncColumns());
  const formRef = useRef<any>(null);

  const hide = () => {
    setVisible(false);
    opInfo.resetRecord();
  };

  useInit(async () => {
    const filePath = await path.join(await chatRoot(), 'chatgpt.log');
    setLogPath(filePath);
  });

  useEffect(() => {
    if (promptData.length <= 0) return;
    opInit(promptData);
  }, [promptData]);

  useEffect(() => {
    if (!opInfo.opType) return;
    (async () => {
      if (opInfo.opType === 'sync') {
        handleSync();
      }
      if (opInfo.opType === 'rowedit') {
        await promptUpdate(opInfo?.opRecord?.id, 'name', opInfo?.opRecord?.name);
        message.success('Name has been changed');
        opInfo.resetRecord();
      }
      if (['edit', 'new'].includes(opInfo.opType)) {
        setVisible(true);
      }
      if (['delete'].includes(opInfo.opType)) {
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
      }
    })();
  }, [opInfo.opType, formRef]);

  const handleSync = async () => {
    const filename = `${opInfo?.opRecord?.id}.json`;
    const record = opInfo?.opRecord;

    // https or http
    if (/^http/.test(record?.protocol)) {
      const isJson = /json$/.test(record?.url);
      const file = await path.join(await chatRoot(), 'cache_prompts', filename);
      const filePath = await getPath(record);

      const data = await invoke('sync_user_prompts', {
        url: filePath,
        dataType: isJson ? 'json' : 'csv',
      });
      if (data) {
        await promptCacheSet(data as [], file);
        await promptCacheCmd();
        message.success('Prompts successfully synchronized');
        const data2 = opReplace(opInfo?.opRecord?.[opSafeKey], {
          ...opInfo?.opRecord,
          last_updated: Date.now(),
        });
        promptSet(data2);
        opInfo.resetRecord();
      } else {
        message.error(
          'Prompts synchronization failed, please try again (click to "View Log" for more details)',
        );
      }
    }
    opInfo.resetRecord();
  };

  const parseLocal = async (file: File): Promise<[boolean, any[] | null]> => {
    if (file) {
      const fileData = await readFile(file);
      const isJSON = /json$/.test(file.name);

      if (isJSON) {
        // parse json
        try {
          const jsonData = JSON.parse(fileData);
          return [true, jsonData];
        } catch (e) {
          message.error('JSON parse error, please check your file');
          return [false, null];
        }
      } else {
        // parse csv
        const list: Record<string, string>[] | null = await invoke('parse_prompt', {
          data: fileData,
        });
        if (!list) {
          message.error('CSV parse error, please check your file');
          return [false, null];
        } else {
          return [true, list];
        }
      }
    }

    message.error('File parsing exception');
    return [false, null];
  };

  const handleOk = () => {
    formRef.current?.form?.validateFields().then(async (vals: Record<string, any>) => {
      if (opInfo.opType === 'new') {
        if (vals.protocol !== 'local') {
          // http or https
          delete vals.file;
          const data = opAdd(vals);
          await promptSet(data);
          hide();
          opInfo.setRecord(data[0], 'sync');
          message.success('Data added successfully');
        } else {
          const file = vals?.file?.file?.originFileObj;
          const data = opAdd(vals);
          const parseData = await parseLocal(file);

          if (parseData[0]) {
            const id = data[0].id;
            const filePath = await path.join(await chatRoot(), 'cache_prompts', `${id}.json`);
            data[0].last_updated = Date.now();
            await promptSet(data);
            await promptCacheSet(fmtData(parseData[1] as []), filePath);
            await promptCacheCmd();
            hide();
            message.success('Data added successfully');
          }
        }
      }
      if (opInfo.opType === 'edit') {
        delete vals.file;
        const data = opReplace(opInfo?.opRecord?.[opSafeKey], vals);
        promptSet(data);
        hide();
        message.success('Data updated successfully');
      }
    });
  };

  const handleLog = () => {
    shell.open(logPath);
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
      <Button style={{ marginBottom: 10 }} onClick={handleLog}>
        View Log
      </Button>
      <Table
        key="id"
        rowKey="id"
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
        <SyncForm ref={formRef} record={opInfo?.opRecord} />
      </Modal>
    </div>
  );
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e: any) => resolve(e.target.result);
    reader.onerror = (e: any) => reject(e.target.error);
    reader.readAsText(file);
  });
}
