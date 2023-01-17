import { useEffect, useState } from 'react';
import { Table, Button, Popconfirm } from 'antd';
import { invoke, path } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import FilePath from '@/components/FilePath';
import useChatModel, { useCacheModel } from '@/hooks/useChatModel';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { fmtDate, chatRoot } from '@/utils';
import { syncColumns } from './config';
import './index.scss';

const promptsURL = 'https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv';

export default function SyncPrompts() {
  const { rowSelection, selectedRowIDs } = useTableRowSelection();
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
    const data = await invoke('sync_prompts', { time: Date.now() });
    if (data) {
      opInit(data as any[]);
      modelSet({
        id: 'chatgpt_prompts',
        last_updated: Date.now(),
      });
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
          <FilePath url={promptsURL} content="f/awesome-chatgpt-prompts/prompts.csv" />
          <FilePath label="CACHE" paths="cache_model/chatgpt_prompts.json" />
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
        expandable={{expandedRowRender: (record) => <div style={{ padding: 10 }}>{record.prompt}</div>}}
      />
    </div>
  )
}