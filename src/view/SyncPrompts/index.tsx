import { useState } from 'react';
import { Table, Button, message } from 'antd';
import { invoke } from '@tauri-apps/api';
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

import useColumns from '@/hooks/useColumns';
import useChatModel from '@/hooks/useChatModel';
import { fmtDate, chatPromptsPath, GITHUB_PROMPTS_CSV_URL } from '@/utils';
import { modelColumns, genCmd } from './config';
import './index.scss';
import useInit from '@/hooks/useInit';

const promptsURL = 'https://github.com/f/awesome-chatgpt-prompts/blob/main/prompts.csv';

export default function LanguageModel() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState();
  const { modelSet } = useChatModel('sys_sync_prompts');
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const { columns, ...opInfo } = useColumns(modelColumns());

  useInit(async () => {
    const filename = await chatPromptsPath();
    const data = await readTextFile(filename);
    const list: Record<string, string>[] = await invoke('parse_prompt', { data });
    const fileData: Record<string, any> = await invoke('metadata', { path: filename });
    setLastUpdated(fileData.accessedAtMs);
    setTableData(list);
  })

  const handleSync = async () => {
    setLoading(true);
    const res = await fetch(GITHUB_PROMPTS_CSV_URL, {
      method: 'GET',
      responseType: ResponseType.Text,
    });
    const data = (res.data || '') as string;
    // const content = data.replace(/"(\s+)?,(\s+)?"/g, '","');
    await writeTextFile(await chatPromptsPath(), data);
    const list: Record<string, string>[] = await invoke('parse_prompt', { data });
    setTableData(list);
    modelSet(list.map(i => ({ cmd: genCmd(i.act), enable: true, tags: ['chatgpt-prompts'], ...i })));
    setLoading(false);
    setLastUpdated(fmtDate(Date.now()) as any);
    message.success('ChatGPT Prompts data synchronization completed!');
  };

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
        dataSource={tableData}
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