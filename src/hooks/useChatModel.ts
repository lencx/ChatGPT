import { useState, useEffect } from 'react';
import { clone } from 'lodash';
import { invoke } from '@tauri-apps/api';

import { CHAT_MODEL_JSON, CHAT_MODEL_CMD_JSON, readJSON, writeJSON } from '@/utils';
import useInit from '@/hooks/useInit';

export default function useChatModel(key: string, file = CHAT_MODEL_JSON) {
  const [modelJson, setModelJson] = useState<Record<string, any>>({});

  useInit(async () => {
    const data = await readJSON(file, {
      defaultVal: { name: 'ChatGPT Model', [key]: null },
    });
    setModelJson(data);
  });

  const modelSet = async (data: Record<string, any>[] | Record<string, any>) => {
    const oData = clone(modelJson);
    oData[key] = data;
    await writeJSON(file, oData);
    setModelJson(oData);
  };

  return { modelJson, modelSet, modelData: modelJson?.[key] || [] };
}

export function useCacheModel(file = '') {
  const [modelCacheJson, setModelCacheJson] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    if (!file) return;
    (async () => {
      const data = await readJSON(file, { isRoot: true, isList: true });
      setModelCacheJson(data);
    })();
  }, [file]);

  const modelCacheSet = async (data: Record<string, any>[], newFile = '') => {
    await writeJSON(newFile ? newFile : file, data, { isRoot: true });
    setModelCacheJson(data);
    await modelCacheCmd();
  };

  const modelCacheCmd = async () => {
    // Generate the `chat.model.cmd.json` file and refresh the page for the slash command to take effect.
    const list = await invoke('cmd_list');
    await writeJSON(CHAT_MODEL_CMD_JSON, {
      name: 'ChatGPT CMD',
      last_updated: Date.now(),
      data: list,
    });
    await invoke('window_reload', { label: 'core' });
    await invoke('window_reload', { label: 'tray' });
  };

  return { modelCacheJson, modelCacheSet, modelCacheCmd };
}
