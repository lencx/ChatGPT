import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { path, fs, invoke } from '@tauri-apps/api';

import useInit from '@/hooks/useInit';
import useColumns from '@/hooks/useColumns';
import { TABLE_PAGINATION } from '@/hooks/useTable';
import { scriptRoot } from '@/utils';
import { scriptColumns } from './config';

const SCRIPTS = [
  'main.js',
  'core.js',
  'chat.js',
  'cmd.js',
  'dalle2.js',
  'export.js',
  'markdown.export.js',
  'popup.core.js',
];

export default function Scripts() {
  const [scriptsMap, setScriptsMap] = useState({});
  const { columns, ...opInfo } = useColumns(scriptColumns({ scriptsMap }));

  const handleInit = async () => {
    try {
      const manifestPath = await path.join(await scriptRoot(), 'manifest.json');
      const data = await fs.readTextFile(manifestPath);
      const { scripts } = JSON.parse(data);
      const infoMap: Record<string, any> = {};

      for (const script of scripts) {
        const scriptInfo: any = await invoke('get_script_info', { name: script.name });
        infoMap[script.name] = {
          curr_version: scriptInfo?.version,
          next_version: script.version,
        };
      }
      setScriptsMap(infoMap);
    } catch (error) {
      console.error(error);
    }
  };

  useInit(handleInit);

  useEffect(() => {
    if (!opInfo.opType) return;
    (async () => {
      if (opInfo.opType === 'sync') {
        const isOk = await invoke('sync_scripts', { name: opInfo?.opRecord?.name });
        if (isOk) {
          await handleInit();
          opInfo.resetRecord();
        }
      }
    })();
  }, [opInfo.opType]);

  return (
    <div className="chatgpt-script">
      <Table
        rowKey="name"
        scroll={{ x: 800 }}
        columns={columns}
        dataSource={SCRIPTS.map((i) => ({ name: i }))}
        {...TABLE_PAGINATION}
        pagination={false}
      />
    </div>
  );
}
