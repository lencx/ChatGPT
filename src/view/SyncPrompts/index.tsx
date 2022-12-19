import { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { invoke } from '@tauri-apps/api';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

import useInit from '@/hooks/useInit';
import useColumns from '@/hooks/useColumns';
import useData from '@/hooks/useData';
import useChatModel from '@/hooks/useChatModel';
import { fmtDate, chatPromptsPath, GITHUB_PROMPTS_CSV_URL } from '@/utils';
import { modelColumns, genCmd } from './config';
import './index.scss';

const promptsURL = 'https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv';

export default function LanguageModel() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState();
  const { modelJson, modelSet } = useChatModel('sys_sync_prompts');
  const { opData, opInit, opReplace, opSafeKey } = useData([]);
  const { columns, ...opInfo } = useColumns(modelColumns());

  // useInit(async () => {
  //   // const filename = await chatPromptsPath();
  //   // const data = await readTextFile(filename);
  //   // const list: Record<string, string>[] = await invoke('parse_prompt', { data });
  //   // const fileData: Record<string, any> = await invoke('metadata', { path: filename });
  //   // setLastUpdated(fileData.accessedAtMs);
  //   // opInit(list);
  //   console.log('«31» /view/SyncPrompts/index.tsx ~> ', modelJson);

  //   opInit([]);
  // })

  useEffect(() => {
    if (!modelJson?.sys_sync_prompts) return;
    opInit(modelJson?.sys_sync_prompts)
  }, [modelJson?.sys_sync_prompts])

  const handleSync = async () => {
    setLoading(true);
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
      modelSet(list.map(i => ({ cmd: genCmd(i.act), enable: true, tags: ['chatgpt-prompts'], ...i })));
      setLastUpdated(fmtDate(Date.now()) as any);
      message.success('ChatGPT Prompts data has been synchronized!');
    } else {
      message.error('ChatGPT Prompts data sync failed, please try again!');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (opInfo.opType === 'enable') {
      const data = opReplace(opInfo?.opRecord?.[opSafeKey], opInfo?.opRecord);
      modelSet(data);
    }
  }, [opInfo.opTime]);

  return (
    <div>
      <Button type="primary" loading={loading} onClick={handleSync}>Sync</Button>
      {lastUpdated && <span style={{ marginLeft: 10, color: '#999' }}>Last updated on {fmtDate(lastUpdated)}</span>}
      <div className="chat-model-path">URL: <a href={promptsURL} target="_blank">{promptsURL}</a></div>
      <Table
        key={lastUpdated}
        rowKey="act"
        columns={columns}
        scroll={{ x: 'auto' }}
        dataSource={opData}
        pagination={{
          hideOnSinglePage: true,
          showSizeChanger: true,
          showQuickJumper: true,
          defaultPageSize: 5,
          pageSizeOptions: [5, 10, 15, 20],
          showTotal: (total) => <span>Total {total} items</span>,
        }}
      />
    </div>
  )
}