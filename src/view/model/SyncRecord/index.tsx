import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Table, Button } from 'antd';
import { path } from '@tauri-apps/api';

import useData from '@/hooks/useData';
import useColumns from '@/hooks/useColumns';
import FilePath from '@/components/FilePath';
import { useCacheModel } from '@/hooks/useChatModel';
import { useTableRowSelection, TABLE_PAGINATION } from '@/hooks/useTable';
import { getPath } from '@/view/model/SyncCustom/config';
import { fmtDate, chatRoot } from '@/utils';
import { syncColumns } from './config';
import useInit from '@/hooks/useInit';

export default function SyncRecord() {
  const location = useLocation();
  const [filePath, setFilePath] = useState('');
  const [jsonPath, setJsonPath] = useState('');
  const state = location?.state;

  const { rowSelection, selectedRowIDs } = useTableRowSelection();
  const { modelCacheJson, modelCacheSet } = useCacheModel(jsonPath);
  const { opData, opInit, opReplace, opReplaceItems, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(syncColumns());

  const selectedItems = rowSelection.selectedRowKeys || [];

  useInit(async () => {
    setFilePath(await getPath(state));
    setJsonPath(await path.join(await chatRoot(), 'cache_model', `${state?.id}.json`));
  })

  useEffect(() => {
    if (modelCacheJson.length <= 0) return;
    opInit(modelCacheJson);
  }, [modelCacheJson.length]);

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
        <div>
          <Button shape="round" icon={<ArrowLeftOutlined />} onClick={() => history.back()} />
        </div>
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
          <FilePath url={filePath} />
          <FilePath label="CACHE" paths={`cache_model/${state?.id}.json`} />
        </div>
        {state?.last_updated && <span style={{ marginLeft: 10, color: '#888', fontSize: 12 }}>Last updated on {fmtDate(state?.last_updated)}</span>}
      </div>
      <Table
        key="prompt"
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