import { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm } from 'antd';
import { invoke, http, path, shell } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import useChatModel, { useCacheModel } from '@/hooks/useChatModel';
import useTable, { TABLE_PAGINATION } from '@/hooks/useTable';
import { fmtDate, chatRoot, GITHUB_PROMPTS_CSV_URL, genCmd } from '@/utils';
import { syncColumns } from './config';
import './index.scss';

const promptsURL = 'https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv';

export default function SyncPrompts() {
  const { rowSelection, selectedRowIDs } = useTable();
  const [jsonPath, setJsonPath] = useState('');
  const { modelJson, modelSet } = useChatModel('sync_prompts');
  const { modelCacheJson, modelCacheSet } = useCacheModel(jsonPath);
  const { opData, opInit, opReplace, opReplaceItems, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(syncColumns());
  const lastUpdated = modelJson?.sync_prompts?.last_updated;
  const selectedItems = rowSelection.selectedRowKeys || [];

  useInit(async () => {
    setJsonPath(await path.join(await chatRoot(), 'cache_model', 'chatgpt_prompts.json'));
  });

  useEffect(() => {
    if (modelCacheJson.length <= 0) return;
    opInit(modelCacheJson);
  }, [modelCacheJson.length]);

  const handleSync = async () => {
    const res = await http.fetch(GITHUB_PROMPTS_CSV_URL, {
      method: 'GET',
      responseType: http.ResponseType.Text,
    });
    const data = (res.data || '') as string;
    if (res.ok) {
      // const content = data.replace(/"(\s+)?,(\s+)?"/g, '","');
      const list: Record<string, string>[] = await invoke('parse_prompt', { data });
      const fmtList = list.map(i => ({ ...i, cmd: i.cmd ? i.cmd : genCmd(i.act), enable: true, tags: ['chatgpt-prompts'] }));
      await modelCacheSet(fmtList);
      opInit(fmtList);
      modelSet({
        id: 'chatgpt_prompts',
        last_updated: Date.now(),
      });
      message.success('ChatGPT Prompts data has been synchronized!');
    } else {
      message.error('ChatGPT Prompts data sync failed, please try again!');
    }
  };

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      modelCacheSet(data);
    }
  }, [opInfo.opTime]);

  const handleEnable = (isEnable: boolean) => {
    const data = opReplaceItems(selectedRowIDs, { enable: isEnable })
    modelCacheSet(data);
  };

  return (
    <div>
      <div className="chat-table-btns">
        <Popconfirm
          overlayStyle={{ width: 250 }}
          title="Sync will overwrite the previous data, confirm to sync?"
          placement="topLeft"
          onConfirm={handleSync}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary">Sync</Button>
        </Popconfirm>
        <div>
          {selectedItems.length > 0 && (
            <>
              <Button type="primary" onClick={() => handleEnable(true)}>Enable</Button>
              <Button onClick={() => handleEnable(false)}>Disable</Button>
              <span className="num">Selected {selectedItems.length} items</span>
            </>
          )}
        </div>
      </div>
      <div className="chat-table-tip">
        <div className="chat-sync-path">
          <div>PATH: <a onClick={() => shell.open(promptsURL)} target="_blank" title={promptsURL}>f/awesome-chatgpt-prompts/prompts.csv</a></div>
          <div>CACHE: <a onClick={() => shell.open(jsonPath)} target="_blank" title={jsonPath}>{jsonPath}</a></div>
        </div>
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