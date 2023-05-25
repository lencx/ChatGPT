import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Table, Button } from 'antd';
import { path } from '@tauri-apps/api';

import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import FilePath from '@/components/FilePath';
import { useCachePrompt } from '@/hooks/useChatPrompt';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { getPath } from '@/view/prompts/SyncCustom/config';
import { fmtDate, chatRoot } from '@/utils';
import { syncColumns } from './config';
import useInit from '@/hooks/useInit';

export default function SyncRecord() {
  const location = useLocation();
  const [filePath, setFilePath] = useState('');
  const [jsonPath, setJsonPath] = useState('');
  const state = location?.state;

  const { rowSelection, selectedRowIDs } = useTableRowSelection();
  const { promptCacheJson, promptCacheSet } = useCachePrompt(jsonPath);
  const { opData, opInit, opReplace, opReplaceItems, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(syncColumns());

  const selectedItems = rowSelection.selectedRowKeys || [];

  useInit(async () => {
    if (state.protocol === 'local') {
      setFilePath('');
    } else {
      setFilePath(await getPath(state));
    }
    setJsonPath(await path.join(await chatRoot(), 'cache_prompts', `${state?.id}.json`));
  });

  useEffect(() => {
    if (promptCacheJson.length <= 0) return;
    opInit(promptCacheJson);
  }, [promptCacheJson.length]);

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      promptCacheSet(data);
    }
  }, [opInfo.opTime]);

  const handleEnable = (isEnable: boolean) => {
    const data = opReplaceItems(selectedRowIDs, { enable: isEnable });
    promptCacheSet(data);
  };

  return (
    <div>
      <div className="chat-table-btns">
        <div>
          <Button shape="round" icon={<ArrowLeftOutlined />} onClick={() => history.back()} />
        </div>
        <div>
          {selectedItems.length > 0 && (
            <>
              <Button type="primary" onClick={() => handleEnable(true)}>
                Enable
              </Button>
              <Button onClick={() => handleEnable(false)}>Disable</Button>
              <span className="num">Selected {selectedItems.length} items</span>
            </>
          )}
        </div>
      </div>
      <div className="chat-table-tip">
        <div className="chat-sync-path">
          {filePath && <FilePath label="URL" url={filePath} />}
          <FilePath label="CACHE" paths={`cache_prompts/${state?.id}.json`} />
        </div>
        {state?.last_updated && (
          <span style={{ marginLeft: 10, color: '#888', fontSize: 12 }}>
            Last updated on {fmtDate(state?.last_updated)}
          </span>
        )}
      </div>
      <Table
        key="prompt"
        rowKey="act"
        columns={columns}
        scroll={{ x: 'auto' }}
        dataSource={opData}
        rowSelection={rowSelection}
        pagination={TABLE_PAGINATION}
        expandable={{
          expandedRowRender: (record) => <div style={{ padding: 10 }}>{record.prompt}</div>,
        }}
      />
    </div>
  );
}
