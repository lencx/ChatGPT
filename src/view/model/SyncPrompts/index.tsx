import { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import { invoke } from '@tauri-apps/api';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { writeTextFile } from '@tauri-apps/api/fs';

import useColumns from '@/hooks/useColumns';
import useData from '@/hooks/useData';
import useChatModel from '@/hooks/useChatModel';
import useTable, { TABLE_PAGINATION } from '@/hooks/useTable';
import { fmtDate, chatPromptsPath, GITHUB_PROMPTS_CSV_URL, genCmd } from '@/utils';
import { syncColumns } from './config';
import './index.scss';

const promptsURL = 'https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv';

export default function SyncPrompts() {
  const { rowSelection, selectedRowIDs } = useTable();
  const [lastUpdated, setLastUpdated] = useState();
  const { modelJson, modelSet } = useChatModel('sys_sync_prompts');
  const { opData, opInit, opReplace, opReplaceItems, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(syncColumns());

  const selectedItems = rowSelection.selectedRowKeys || [];

  useEffect(() => {
    if (!modelJson?.sys_sync_prompts) return;
    opInit(modelJson?.sys_sync_prompts);
    if (lastUpdated) return;
    (async () => {
      const fileData: Record<string, any> = await invoke('metadata', { path: await chatPromptsPath() });
      setLastUpdated(fileData.accessedAtMs);
    })();
  }, [modelJson?.sys_sync_prompts])

  const handleSync = async () => {
    const res = await fetch(GITHUB_PROMPTS_CSV_URL, {
      method: 'GET',
      responseType: ResponseType.Text,
    });
    const data = (res.data || '') as string;
    if (res.ok) {
      // const content = data.replace(/"(\s+)?,(\s+)?"/g, '","');
      await writeTextFile(await chatPromptsPath(), data);
      const list: Record<string, string>[] = await invoke('parse_prompt', { data });
      opInit(list);
      modelSet(list.map(i => ({ ...i, cmd: i.cmd ? i.cmd : genCmd(i.act), enable: true, tags: ['chatgpt-prompts'] })));
      setLastUpdated(fmtDate(Date.now()) as any);
      message.success('ChatGPT Prompts data has been synchronized!');
    } else {
      message.error('ChatGPT Prompts data sync failed, please try again!');
    }
  };

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      modelSet(data);
    }
  }, [opInfo.opTime]);

  const handleEnable = (isEnable: boolean) => {
    const data = opReplaceItems(selectedRowIDs, { enable: isEnable })
    modelSet(data);
  };

  return (
    <div>
      <div className="chat-table-btns">
        <div>
          {selectedItems.length > 0 && (
            <>
              <Button type="primary" onClick={() => handleEnable(true)}>Enable</Button>
              <Button onClick={() => handleEnable(false)}>Disable</Button>
              <span className="num">Selected {selectedItems.length} items</span>
            </>
          )}
        </div>
        <Popconfirm
          title={<span>Data sync will enable all prompts,<br/>are you sure you want to sync?</span>}
          placement="topLeft"
          onConfirm={handleSync}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary">Sync</Button>
        </Popconfirm>
      </div>
      <div className="chat-table-tip">
        <span className="chat-model-path">URL: <a href={promptsURL} target="_blank" title={promptsURL}>f/awesome-chatgpt-prompts/prompts.csv</a></span>
        {lastUpdated && <span style={{ marginLeft: 10, color: '#888', fontSize: 12 }}>Last updated on {fmtDate(lastUpdated)}</span>}
      </div>
      <Table
        key={lastUpdated}
        rowKey="act"
        columns={columns}
        scroll={{ x: 'auto' }}
        dataSource={opData}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
      />
    </div>
  )
}